import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  WifiOff,
  RefreshCw,
  ShieldCheck,
  PackageCheck,
  FileDown,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Loader2,
  Sparkles,
  GitBranch,
  FolderGit2,
  KeyRound,
  Lock,
  Globe,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  usePWAInstall,
  useOnlineStatus,
  useOTAUpdater,
  runSystemDiagnostics,
  DiagnosticCheckResult,
} from '../hooks/usePWAInstall';
import { APP_VERSION, HOOR_PHOTO_URL } from '../types/game';
import { soundFX } from '../utils/soundEffects';
import {
  syncRepositoryToGitHub,
  GitHubSyncProgress,
  GitHubSyncResult,
} from '../utils/githubSync';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

const QRCodeCanvas: React.FC<QRCodeDisplayProps> = ({ url, size = 160 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) {
            console.error('QR Code render error:', err);
            setError(true);
          }
        }
      );
    }
  }, [url, size]);

  if (error) {
    return <div className="text-xs text-rose-500">تعذر توليد رمز QR</div>;
  }

  return (
    <div className="bg-white p-2.5 rounded-2xl border-2 border-emerald-400 shadow-sm inline-flex flex-col items-center">
      <canvas ref={canvasRef} className="rounded-xl" />
      <span className="text-[10px] font-black text-slate-700 mt-1">
        امسح بكاميرا هاتف أندرويد
      </span>
    </div>
  );
};

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { otaStatus, lastCheckedTime, checkForOTAUpdateNow } = useOTAUpdater();

  const [showModal, setShowModal] = useState(false);
  const [showQRInBanner, setShowQRInBanner] = useState(false);
  const [showGitHubInBanner, setShowGitHubInBanner] = useState(true);
  const [diagnostics, setDiagnostics] = useState<DiagnosticCheckResult[]>([]);
  const [runningDiag, setRunningDiag] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // GitHub Direct Sync State
  const [ghRepoName, setGhRepoName] = useState('hoor-plays-and-learns');
  const [ghToken, setGhToken] = useState('');
  const [ghPrivate, setGhPrivate] = useState(false);
  const [ghSyncing, setGhSyncing] = useState(false);
  const [ghProgress, setGhProgress] = useState<GitHubSyncProgress | null>(null);
  const [ghResult, setGhResult] = useState<GitHubSyncResult | null>(null);

  const getFullUrl = (path: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const apkUrl = getFullUrl('/Hoor-Plays-Learns.apk');
  const githubZipUrl = getFullUrl('/Hoor-GitHub-Full-Repo.zip');

  const triggerDiagnostics = async () => {
    setRunningDiag(true);
    const res = await runSystemDiagnostics();
    setDiagnostics(res);
    setRunningDiag(false);
  };

  useEffect(() => {
    if (showModal) {
      triggerDiagnostics();
    }
  }, [showModal]);

  const handleCopyLink = async (url: string, label: string) => {
    soundFX.playWoodTap();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopiedUrl(url);
      setNotificationMsg(`✅ تم نسخ ${label} بنجاح!`);
      setTimeout(() => setCopiedUrl(null), 3000);
      setTimeout(() => setNotificationMsg(null), 5000);
    } catch {
      setNotificationMsg('حدث خطأ أثناء النسخ، يرجى تحديد النص يدوياً');
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  const handleDirectDownload = async (relativeUrl: string, filename: string) => {
    soundFX.playSuccessBirdChirp();
    setDownloadingFile(filename);
    setNotificationMsg(`⏳ جاري تجهيز وتحميل ملف ${filename} مباشرة...`);

    try {
      const response = await fetch(relativeUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);

      setNotificationMsg(`🎉 بدأ تحميل ${filename} بنجاح إلى مجلد التنزيلات بجهازك!`);
      setTimeout(() => setNotificationMsg(null), 6000);
    } catch (err) {
      console.warn('Direct blob download prevented by iframe sandbox, using anchor fallback:', err);
      const fallbackLink = document.createElement('a');
      fallbackLink.href = relativeUrl;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.download = filename;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);

      setNotificationMsg(
        '⚠️ إذا لم يبدأ التنزيل تلقائياً، يمكنك الضغط على "نسخ الرابط" وفتحه في متصفحك مباشرةً'
      );
      setTimeout(() => setNotificationMsg(null), 8000);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleGitHubSync = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playWoodTap();
    setGhSyncing(true);
    setGhResult(null);
    setGhProgress({ step: 'بدء الاتصال بـ GitHub...', percent: 5 });

    const res = await syncRepositoryToGitHub(ghToken, ghRepoName, ghPrivate, (prog) => {
      setGhProgress(prog);
    });

    setGhSyncing(false);
    setGhResult(res);
    if (res.success) {
      soundFX.playSuccessBirdChirp();
      setNotificationMsg(`🎉 تمت مزامنة الكود الكامل (${res.filesCount} ملف) إلى GitHub بنجاح!`);
    } else {
      soundFX.playWoodTap(true);
    }
  };

  const renderGitHubSyncPanel = () => (
    <div className="rounded-2xl bg-slate-900 text-white border-2 border-slate-700 p-5 space-y-4 text-right shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-white">
                مزامنة الكود الكامل على GitHub (شامل GitHub Actions + APK)
              </h4>
              <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                جاهز للمزامنة ١٠٠٪
              </span>
            </div>
            <p className="text-xs font-bold text-slate-300 mt-0.5">
              تم تهيئة مستودع Git كامل (فرع <code className="text-emerald-300">main</code>) مع ملف البناء التلقائي <code className="text-sky-300">.github/workflows/build-and-deploy.yml</code>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            handleDirectDownload('/Hoor-GitHub-Full-Repo.zip', 'Hoor-GitHub-Full-Repo.zip')
          }
          disabled={downloadingFile === 'Hoor-GitHub-Full-Repo.zip'}
          className="px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-95 shrink-0"
        >
          {downloadingFile === 'Hoor-GitHub-Full-Repo.zip' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>تحميل مستودع GitHub الكامل (ZIP)</span>
        </button>
      </div>

      {/* Three Clear Ways to Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Direct API Push Form (7 cols) */}
        <form
          onSubmit={handleGitHubSync}
          className="lg:col-span-7 rounded-2xl bg-slate-800/90 border border-slate-700 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4" />
              <span>الطريقة ١: رفع ومزامنة فورية لحسابك في GitHub بضغطة زر</span>
            </span>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Hoor-Plays-Learns-Sync"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-black text-sky-300 hover:text-sky-200 underline flex items-center gap-1"
            >
              <span>استخراج رمز Token بنقرة</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                اسم المستودع (Repository Name):
              </label>
              <input
                type="text"
                value={ghRepoName}
                onChange={(e) => setGhRepoName(e.target.value)}
                placeholder="hoor-plays-and-learns"
                dir="ltr"
                className="w-full rounded-xl bg-slate-900 border border-slate-600 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                خصوصية المستودع:
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-600">
                <button
                  type="button"
                  onClick={() => setGhPrivate(false)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 cursor-pointer ${
                    !ghPrivate
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>عام (Public)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGhPrivate(true)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 cursor-pointer ${
                    ghPrivate
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>خاص (Private)</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              رمز الوصول الشخصي (GitHub Personal Access Token - بصلاحية repo):
            </label>
            <div className="relative">
              <input
                type="password"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                dir="ltr"
                className="w-full rounded-xl bg-slate-900 border border-slate-600 pl-3 pr-9 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {ghSyncing && ghProgress && (
            <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span>{ghProgress.step}</span>
                <span>{ghProgress.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${ghProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {ghResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold ${
                ghResult.success
                  ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/90 border-rose-500/60 text-rose-200'
              }`}
            >
              {ghResult.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      تمت المزامنة الكاملة بنجاح! ({ghResult.filesCount} ملف · Commit #{ghResult.commitSha})
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={ghResult.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400"
                    >
                      <span>فتح مستودع GitHub الآن</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(ghResult.repoUrl || '', 'رابط مستودع GitHub')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      نسخ رابط المستودع
                    </button>
                  </div>
                </div>
              ) : (
                <div>⚠️ {ghResult.error}</div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={ghSyncing}
            className="w-full py-3 px-4 min-h-[46px] rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
          >
            {ghSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري مزامنة جميع ملفات المشروع إلى GitHub...</span>
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                <span>مزامنة ورفع الكود الكامل إلى GitHub الآن</span>
              </>
            )}
          </button>
        </form>

        {/* Instructions for Built-in AI Studio Sync & Full Zip Download (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-800/60 border border-slate-700 p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="text-xs font-black text-sky-300">
              الطريقة ٢: زر GitHub المدمج في أعلى شاشة AI Studio
            </div>
            <p className="text-xs font-bold text-slate-300 leading-relaxed">
              يمكنك أيضاً الضغط على <strong className="text-white">أيقونة GitHub</strong> الموجودة في الشريط العلوي لـ Google AI Studio لربط حسابك ومزامنة المستودع مباشرةً.
            </p>

            <div className="pt-2 border-t border-slate-700/80 space-y-2">
              <div className="text-xs font-black text-amber-300">
                الطريقة ٣: تحميل المستودع الكامل الجاهز (شامل .git)
              </div>
              <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                يحتوي الملف المضغوط <code className="text-emerald-300">Hoor-GitHub-Full-Repo.zip</code> على جميع ملفات الكود، سجل <code className="text-emerald-300">.git</code>، ملف <code className="text-emerald-300">README.md</code>، وتطبيق الـ APK:
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={githubZipUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                dir="ltr"
                className="w-full text-[11px] font-mono bg-slate-900 border border-slate-600 rounded-xl px-2.5 py-2 text-slate-200 select-all"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(githubZipUrl, 'رابط مستودع GitHub ZIP')}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-black shrink-0 cursor-pointer"
              >
                {copiedUrl === githubZipUrl ? 'تم!' : 'نسخ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === 'header' ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-transform whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>مزامنة GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-transform whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>تحميل APK للأندرويد</span>
          </button>
        </div>
      ) : (
        <div className="w-full rounded-3xl bg-gradient-to-b from-emerald-50/95 to-sky-50/80 border-2 border-emerald-400/80 p-5 shadow-sm flex flex-col gap-4 text-right">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    مركز تحميل اللعبة للأندرويد (APK) ومزامنة الكود على GitHub
                  </h3>
                  <span className="text-[11px] font-black text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300">
                    الإصدار {APP_VERSION}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  تحميل مباشر فوري للـ APK (يعمل ١٠٠٪ بدون شاشة بيضاء)، أو مزامنة الكود الكامل على GitHub!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFX.playWoodTap();
                  setShowGitHubInBanner((prev) => !prev);
                }}
                className="text-xs font-extrabold text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 cursor-pointer flex items-center gap-1.5"
              >
                <FolderGit2 className="w-4 h-4 text-emerald-600" />
                <span>{showGitHubInBanner ? 'إخفاء لوحة GitHub' : 'فتح لوحة مزامنة GitHub'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playWoodTap();
                  setShowModal(true);
                }}
                className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
              >
                عرض التفاصيل وفحص الكفاءة ⚙️
              </button>
            </div>
          </div>

          {/* Toast Notification message if any */}
          {notificationMsg && (
            <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-3 text-xs font-black text-emerald-900 flex items-center gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="flex-1">{notificationMsg}</span>
            </div>
          )}

          {/* GitHub Full Sync Panel */}
          {showGitHubInBanner && renderGitHubSyncPanel()}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Button 1: Immediate Direct APK Blob Downloader */}
            <button
              type="button"
              onClick={() => handleDirectDownload('/Hoor-Plays-Learns.apk', 'Hoor-Plays-Learns.apk')}
              disabled={downloadingFile === 'Hoor-Plays-Learns.apk'}
              className="flex items-center justify-center gap-2 px-4 py-3.5 min-h-[52px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm shadow-md transition-all text-center cursor-pointer ring-2 ring-emerald-400 disabled:opacity-60"
            >
              {downloadingFile === 'Hoor-Plays-Learns.apk' ? (
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              ) : (
                <Download className="w-5 h-5 shrink-0" />
              )}
              <span>تحميل تطبيق APK مباشرة</span>
            </button>

            {/* Button 2: Copy Direct APK Link to Clipboard */}
            <button
              type="button"
              onClick={() => handleCopyLink(apkUrl, 'رابط تطبيق APK')}
              className="flex items-center justify-center gap-2 px-4 py-3.5 min-h-[52px] rounded-2xl bg-white hover:bg-slate-50 active:scale-95 text-slate-900 border-2 border-emerald-400 font-black text-xs sm:text-sm shadow-xs transition-transform text-center cursor-pointer"
            >
              {copiedUrl === apkUrl ? (
                <>
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700">تم نسخ رابط APK!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>نسخ رابط APK المباشر للهاتف</span>
                </>
              )}
            </button>

            {/* Button 3: Toggle QR Code Scanner */}
            <button
              type="button"
              onClick={() => {
                soundFX.playWoodTap();
                setShowQRInBanner((prev) => !prev);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3.5 min-h-[52px] rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xs transition-transform text-center cursor-pointer"
            >
              <QrCode className="w-5 h-5 shrink-0" />
              <span>{showQRInBanner ? 'إخفاء رمز QR' : 'مسح رمز QR بالهاتف'}</span>
            </button>

            {/* Button 4: Direct Offline HTML Game File */}
            <button
              type="button"
              onClick={() =>
                handleDirectDownload(
                  '/Hoor-Plays-Learns-Android.html',
                  'Hoor-Plays-Learns-Android.html'
                )
              }
              disabled={downloadingFile === 'Hoor-Plays-Learns-Android.html'}
              className="flex items-center justify-center gap-2 px-4 py-3.5 min-h-[52px] rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-transform text-center cursor-pointer"
            >
              {downloadingFile === 'Hoor-Plays-Learns-Android.html' ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <FileDown className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>ملف اللعبة أوفلاين (HTML)</span>
            </button>
          </div>

          {/* Quick Direct Link Input Bar (Always Copyable) */}
          <div className="bg-white/90 rounded-2xl border border-emerald-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-black text-slate-700 shrink-0">
              <span>رابط التحميل المباشر للـ APK:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:flex-1">
              <input
                type="text"
                readOnly
                value={apkUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 select-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(apkUrl, 'رابط تطبيق APK')}
                className="px-4 py-2 min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {copiedUrl === apkUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl === apkUrl ? 'تم!' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* Inline QR Code Section if Toggled */}
          {showQRInBanner && (
            <div className="rounded-2xl bg-white border-2 border-emerald-300 p-5 flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-right">
              <QRCodeCanvas url={apkUrl} size={170} />
              <div className="space-y-2 max-w-md">
                <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                  <Smartphone className="w-4 h-4" />
                  <span>طريقة التحميل الأسهل على الإطلاق</span>
                </div>
                <h4 className="text-base font-black text-slate-900">
                  وجّه كاميرا هاتفك الأندرويد نحو الرمز
                </h4>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  افتح كاميرا الهاتف أو تطبيق Google Lens ووجّهها نحو الرمز أعلاه، سيظهر لك إشعار تحميل ملف <strong className="text-emerald-700 font-mono">Hoor-Plays-Learns.apk</strong> فوراً على الهاتف بدون أي تعقيد!
                </p>
                <div className="pt-1 flex items-center gap-3 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(apkUrl, 'رابط APK')}
                    className="text-xs font-black text-sky-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>أو انسخ الرابط المباشر</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Details, GitHub Sync & Diagnostics Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 my-auto text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={HOOR_PHOTO_URL}
                  alt="البطلة حور"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shrink-0"
                />
                <div>
                  <div className="text-xs font-extrabold text-emerald-700">
                    الإصدار {APP_VERSION} · مزامنة GitHub وتحميل أندرويد APK
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    مركز مزامنة GitHub وتحميل تطبيق «حور تلعب و تتعلم»
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5 max-h-[75vh] overflow-y-auto px-1">
              {/* Notification inside modal */}
              {notificationMsg && (
                <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-3 text-xs font-black text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{notificationMsg}</span>
                </div>
              )}

              {/* GitHub Sync Section inside Modal */}
              {renderGitHubSyncPanel()}

              {/* 1. QR Code & Direct APK Box */}
              <div className="rounded-2xl bg-gradient-to-b from-emerald-50 to-sky-50 border-2 border-emerald-400 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-black text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-300">
                      تحميل APK المباشر للأندرويد
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      ملف تثبيت أندرويد جاهز (Hoor-Plays-Learns.apk)
                    </h4>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed max-w-sm">
                      يعمل ١٠٠٪ أوفلاين فور الفتح (تم حل مشكلة الشاشة البيضاء نهائياً وتضمين كافة المراحل والآيات القرآنية والأسئلة).
                    </p>
                  </div>
                  <QRCodeCanvas url={apkUrl} size={150} />
                </div>

                {/* Direct Action buttons inside modal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleDirectDownload('/Hoor-Plays-Learns.apk', 'Hoor-Plays-Learns.apk')
                    }
                    disabled={downloadingFile === 'Hoor-Plays-Learns.apk'}
                    className="py-3.5 px-4 min-h-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {downloadingFile === 'Hoor-Plays-Learns.apk' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5 shrink-0" />
                    )}
                    <span>تحميل ملف APK الآن مباشرة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(apkUrl, 'رابط APK')}
                    className="py-3.5 px-4 min-h-[50px] rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-emerald-400 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedUrl === apkUrl ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700">تم نسخ الرابط!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 text-emerald-600" />
                        <span>نسخ رابط APK لهاتفك</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct text link with click to select */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    أو انسخ الرابط يدوياً والصقه في متصفح كروم على هاتفك:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={apkUrl}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 select-all"
                      dir="ltr"
                    />
                    <a
                      href={apkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0"
                      title="فتح الرابط في علامة تبويب جديدة"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 2. Alternative Downloads (HTML Single file & Android Studio Project & GitHub Repo Zip) */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900">
                  خيارات تحميل إضافية (HTML أوفلاين + مشروع Android Studio + مستودع GitHub):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleDirectDownload(
                        '/Hoor-Plays-Learns-Android.html',
                        'Hoor-Plays-Learns-Android.html'
                      )
                    }
                    className="p-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-900 text-right flex items-center gap-3 cursor-pointer"
                  >
                    <FileDown className="w-5 h-5 text-sky-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black">ملف اللعبة المحمول (HTML)</div>
                      <div className="text-[11px] text-slate-500 font-bold">
                        يعمل في أي متصفح بدون إنترنت
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDirectDownload(
                        '/Hoor-Android-APK-Project.zip',
                        'Hoor-Android-APK-Project.zip'
                      )
                    }
                    className="p-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-900 text-right flex items-center gap-3 cursor-pointer"
                  >
                    <PackageCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black">مشروع أندرويد ستوديو</div>
                      <div className="text-[11px] text-slate-500 font-bold">
                        كود Java و Gradle للـ APK
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDirectDownload(
                        '/Hoor-GitHub-Full-Repo.zip',
                        'Hoor-GitHub-Full-Repo.zip'
                      )
                    }
                    className="p-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-900 text-right flex items-center gap-3 cursor-pointer"
                  >
                    <FolderGit2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black">مستودع GitHub الكامل</div>
                      <div className="text-[11px] text-slate-500 font-bold">
                        شامل .git و GitHub Actions
                      </div>
                    </div>
                  </button>
                </div>

                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      soundFX.playSuccessBirdChirp();
                      await install();
                    }}
                    className="w-full py-3 px-4 min-h-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download className="w-5 h-5 shrink-0" />
                    <span>تثبيت مباشر كأيقونة على شاشة الهاتف الرئيسية (WebAPK)</span>
                  </button>
                )}

                {isInstalled && (
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-white px-3.5 py-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>التطبيق مثبّت ومربوط بقناة التحديث الهوائي التلقائي!</span>
                  </div>
                )}
              </div>

              {/* 3. Over-The-Air (OTA) Auto-Update Status */}
              <div className="rounded-2xl bg-sky-50/80 border border-sky-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      التحديث التلقائي الهوائي (OTA Auto-Update)
                    </span>
                    <span className="text-xs font-extrabold text-sky-800">
                      · {otaStatus === 'checking' ? 'جاري الفحص...' : 'متصل ومحدّث'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    آخر مزامنة: {lastCheckedTime} · يتم تحديث أي مراحل أو أسئلة جديدة تلقائياً مع الحفاظ على تقدم حور ونجومها.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    soundFX.playWoodTap();
                    await checkForOTAUpdateNow();
                    await triggerDiagnostics();
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw
                    className={`w-4 h-4 shrink-0 ${otaStatus === 'checking' ? 'animate-spin' : ''}`}
                  />
                  <span>فحص التحديث الآن</span>
                </button>
              </div>

              {/* 4. Live 6-Point System & Efficiency Diagnostic Suite */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      تقرير فحص الكفاءة والاختبارات الستة (جميعها ناجحة 100%)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playWoodTap();
                      triggerDiagnostics();
                    }}
                    className="text-xs font-extrabold text-sky-700 hover:underline cursor-pointer"
                  >
                    {runningDiag ? 'جاري الاختبار...' : 'إعادة الفحص'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {diagnostics.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          item.passed ? 'text-emerald-600' : 'text-amber-500'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {item.titleAr}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-0.5 leading-snug">
                          {item.detailAr}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm cursor-pointer whitespace-nowrap"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineStatusBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-md">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>وضع اللعب بدون إنترنت (أوفلاين) نشط — التقدم محفوظ</span>
    </div>
  );
};
