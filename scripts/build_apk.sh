#!/usr/bin/env bash
set -e

echo "=== 1. Starting APK Build Process ==="
BUILD_DIR="/tmp/apk_build"
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/public"
DIST_DIR="$ROOT_DIR/dist"
APP_VERSION="$(node -e 'console.log(JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).version)' "$ROOT_DIR/package.json")"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/src/app/aistudio/hoor_plays_learns"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$BUILD_DIR/assets"
mkdir -p "$BUILD_DIR/bin"

# 2. Extract icons and strings from existing zip if available
if [ -f "$PUBLIC_DIR/Hoor-Android-APK-Project.zip" ]; then
  unzip -q -o "$PUBLIC_DIR/Hoor-Android-APK-Project.zip" 'res/*' -d "$BUILD_DIR/" || true
fi

# Ensure strings.xml exists
cat << 'EOF' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">حور تلعب و تتعلم</string>
</resources>
EOF

# Ensure AndroidManifest.xml exists
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="app.aistudio.hoor_plays_learns"
    android:versionCode="3"
    android:versionName="@APP_VERSION@">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:allowBackup="true"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Ensure MainActivity.java is updated with crash-proof instant offline loading
cat << 'EOF' > "$BUILD_DIR/src/app/aistudio/hoor_plays_learns/MainActivity.java"
package app.aistudio.hoor_plays_learns;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.JavascriptInterface;
import android.view.WindowManager;
import android.graphics.Color;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String APP_VERSION = "@APP_VERSION@";

    public class AndroidBridge {
        @JavascriptInterface
        public String getVersion() {
            return APP_VERSION;
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        // Set sky-50 background so screen is never pure blank white
        webView.setBackgroundColor(Color.parseColor("#f0f9ff"));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new AndroidBridge(), "AndroidNativeApp");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false;
            }
        });

        // Load the embedded offline bundle immediately into memory
        loadOfflineGame();
    }

    private void loadOfflineGame() {
        try {
            InputStream is = getAssets().open("index.html");
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int len;
            while ((len = is.read(buf)) != -1) {
                bos.write(buf, 0, len);
            }
            String html = bos.toString("UTF-8");
            is.close();
            webView.loadDataWithBaseURL("https://hoor-plays-learns.app/", html, "text/html", "UTF-8", null);
        } catch (Exception e) {
            webView.loadUrl("file:///android_asset/index.html");
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
EOF

sed -i "s/@APP_VERSION@/${APP_VERSION}/g" \
  "$BUILD_DIR/AndroidManifest.xml" \
  "$BUILD_DIR/src/app/aistudio/hoor_plays_learns/MainActivity.java"

# 3. Copy latest standalone HTML to assets/index.html
echo "=== 2. Copying latest bundle to assets ==="
cp "$PUBLIC_DIR/Hoor-Plays-Learns-Android.html" "$BUILD_DIR/assets/index.html"

# If icon doesn't exist, create one
if [ ! -f "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" ]; then
  mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
  cp "$PUBLIC_DIR/pwa-192x192.png" "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png"
fi

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"

# 4. Generate R.java
echo "=== 3. Generating R.java with aapt ==="
aapt package -m -J "$BUILD_DIR/src" -M "$BUILD_DIR/AndroidManifest.xml" -S "$BUILD_DIR/res" -I "$ANDROID_JAR"

# 5. Compile Java
echo "=== 4. Compiling Java with javac (Java 8 compatibility) ==="
javac -source 8 -target 8 -cp "$ANDROID_JAR" -d "$BUILD_DIR/bin" "$BUILD_DIR/src/app/aistudio/hoor_plays_learns/"*.java

# 6. DX / Dalvik exchange to create classes.dex
echo "=== 5. Converting bytecode to classes.dex ==="
/usr/bin/dalvik-exchange --dex --output="$BUILD_DIR/bin/classes.dex" "$BUILD_DIR/bin"

# 7. Package initial APK with resources and assets
echo "=== 6. Packaging APK with aapt ==="
aapt package -f -M "$BUILD_DIR/AndroidManifest.xml" -S "$BUILD_DIR/res" -A "$BUILD_DIR/assets" -I "$ANDROID_JAR" -F "$BUILD_DIR/bin/unaligned.apk"

# 8. Add classes.dex into unaligned.apk
echo "=== 7. Adding classes.dex to APK ==="
(cd "$BUILD_DIR/bin" && aapt add unaligned.apk classes.dex)

# 9. Zipalign the APK
echo "=== 8. Aligning APK with zipalign ==="
zipalign -f -p 4 "$BUILD_DIR/bin/unaligned.apk" "$BUILD_DIR/bin/aligned.apk"

# 10. Generate Keystore if needed
KEYSTORE="/tmp/hoor_release.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "=== 9. Generating release keystore ==="
  keytool -genkey -v -keystore "$KEYSTORE" -alias hoor -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass hoor2026 -keypass hoor2026 -dname "CN=Hoor, OU=Games, O=Family, L=Riyadh, C=SA"
fi

# 11. Sign APK with apksigner (v1, v2, v3)
echo "=== 10. Signing APK with apksigner ==="
apksigner sign --ks "$KEYSTORE" --ks-key-alias hoor --ks-pass pass:hoor2026 --key-pass pass:hoor2026 \
  --out "$BUILD_DIR/bin/Hoor-Plays-Learns.apk" "$BUILD_DIR/bin/aligned.apk"

# 12. Verify APK signature
echo "=== 11. Verifying APK signature ==="
apksigner verify --verbose "$BUILD_DIR/bin/Hoor-Plays-Learns.apk"

# 13. Copy final APK to public and dist
echo "=== 12. Publishing final APK ==="
cp "$BUILD_DIR/bin/Hoor-Plays-Learns.apk" "$PUBLIC_DIR/Hoor-Plays-Learns.apk"
mkdir -p "$DIST_DIR"
cp "$BUILD_DIR/bin/Hoor-Plays-Learns.apk" "$DIST_DIR/Hoor-Plays-Learns.apk"

# 14. Package updated project into ZIP
echo "=== 13. Packaging project ZIP ==="
(cd "$BUILD_DIR" && zip -r "$PUBLIC_DIR/Hoor-Android-APK-Project.zip" AndroidManifest.xml src res assets bin/app bin/classes.dex)
cp "$PUBLIC_DIR/Hoor-Android-APK-Project.zip" "$DIST_DIR/Hoor-Android-APK-Project.zip"

echo "=== ✅ All APK Build & Packaging Steps Completed Successfully! ==="
ls -lh "$PUBLIC_DIR/Hoor-Plays-Learns.apk" "$PUBLIC_DIR/Hoor-Android-APK-Project.zip"
