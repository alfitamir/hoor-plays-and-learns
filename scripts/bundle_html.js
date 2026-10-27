import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

// 1. Read latest CSS and JS from dist/assets
const assetFiles = fs.readdirSync(path.join(distDir, 'assets'));
const cssFile = assetFiles.find((f) => f.endsWith('.css'));
const jsFile = assetFiles.find((f) => f.startsWith('index-') && f.endsWith('.js'));

if (!cssFile || !jsFile) {
  console.error('Could not find css or js bundle in dist/assets');
  process.exit(1);
}

const cssContent = fs.readFileSync(path.join(distDir, 'assets', cssFile), 'utf8');
let jsContent = fs.readFileSync(path.join(distDir, 'assets', jsFile), 'utf8');

// 2. Read Hoor's photo and convert to base64 data URI
const photoPath = path.join(publicDir, 'assets/aistudio/10160185010238213_11fa6234.jpg');
let photoBase64 = '';
if (fs.existsSync(photoPath)) {
  const photoBuf = fs.readFileSync(photoPath);
  photoBase64 = `data:image/jpeg;base64,${photoBuf.toString('base64')}`;
  console.log('Successfully loaded Hoor photo base64:', photoBase64.length, 'bytes');
}

// 3. Clean up JS for non-module standalone execution in WebView & offline
// Replace import.meta
jsContent = jsContent.replace(/import\.meta\.resolve/g, '((u)=>u)');
jsContent = jsContent.replace(/import\.meta\.url/g, '"https://hoor-plays-learns.app/"');
jsContent = jsContent.replace(/import\.meta/g, '({url:"https://hoor-plays-learns.app/"})');

// Strip top-level export statements if any
jsContent = jsContent.replace(/^\s*export\s*\{[^}]*\};?/gm, '');

// If photoBase64 is available, replace relative path in bundle with inline base64
if (photoBase64) {
  jsContent = jsContent.replace(
    /\/assets\/aistudio\/10160185010238213_11fa6234\.jpg/g,
    photoBase64
  );
}

// 4. Validate JS syntax with Node vm
try {
  new vm.Script(jsContent);
  console.log('✅ JS bundle syntax validation PASSED with 0 errors');
} catch (err) {
  console.error('❌ JS bundle syntax validation failed:', err);
  process.exit(1);
}

// 5. Build self-contained HTML
const htmlTemplate = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>حور تلعب و تتعلم — لعبة صيد الدجاج التعليمية</title>
    <meta name="description" content="لعبة صيد الدجاج التعليمية للأطفال بدون إنترنت (أوفلاين) لتعليم الجمع والطرح والكلمات الإنجليزية البسيطة عبر ٢٠ مرحلة ممتعة." />
    <meta name="theme-color" content="#0284c7" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="حور تتعلم" />
    <style>
      /* Embedded App CSS */
      ${cssContent}
    </style>
  </head>
  <body class="bg-sky-50 text-slate-900 antialiased selection:bg-amber-300 selection:text-slate-900">
    <div id="root"></div>
    <script>
      /* Standalone Offline Game Bundle */
      window.__HOOR_OFFLINE_STANDALONE__ = true;
      ${jsContent}
    </script>
  </body>
</html>`;

const outHtmlPath = path.join(publicDir, 'Hoor-Plays-Learns-Android.html');
fs.writeFileSync(outHtmlPath, htmlTemplate, 'utf8');
console.log('✅ Generated standalone HTML at:', outHtmlPath, 'Size:', fs.statSync(outHtmlPath).size, 'bytes');

// Also copy to dist for serving
const distOutHtmlPath = path.join(distDir, 'Hoor-Plays-Learns-Android.html');
fs.writeFileSync(distOutHtmlPath, htmlTemplate, 'utf8');
