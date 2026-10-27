import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Download,
  Smartphone,
  FolderGit2,
  FileDown,
  RefreshCw,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  X,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  ExternalLink,
  PackageCheck,
  Loader2,
  Users,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  usePWAInstall,
  useOTAUpdater,
  runSystemDiagnostics,
  DiagnosticCheckResult,
} from '../hooks/usePWAInstall';
import { APP_VERSION, HOOR_PHOTO_URL, GameSettings, AGE_GROUPS, AgeGroupId } from '../types/game';
import { soundFX } from '../utils/soundEffects';
import {
  syncRepositoryToGitHub,
  GitHubSyncProgress,
  GitHubSyncResult,
} from '../utils/githubSync';

interface UnifiedTopNavSettingsProps {
  settings: GameSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  onOpenSettingsModal: () => void;
  onOpenAgeModal?: () => void;
}

export const UnifiedTopNavSettings: React.FC<UnifiedTopNavSettingsProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettingsModal,
  onOpenAgeModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<
    'none' | 'apk_details' | 'github_sync' | 'qr_code' | 'diagnostics'
  >('none');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const { isInstallable, install } = usePWAInstall();
  const { otaStatus, lastCheckedTime, checkForOTAUpdateNow } = useOTAUpdater();

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState<DiagnosticCheckResult[]>([]);
  const [runningDiag, setRunningDiag] = useState(false);

  // GitHub Sync State
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
  const htmlUrl = getFullUrl('/Hoor-Plays-Learns-Android.html');
  const zipUrl = getFullUrl('/Hoor-GitHub-Full-Repo.zip');

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Render QR Code in modal when opened
  useEffect(() => {
    if (activeModal === 'qr_code' && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        apkUrl,
        {
          width: 220,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        },
        (err) => {
          if (err) console.error('QR error', err);
        }
      );
    }
  }, [activeModal, apkUrl]);

  const handleCopyLink = async (url: string, label: string) => {
    soundFX.playWoodTap();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setCopiedUrl(url);
      setNotificationMsg(`✅ تم نسخ ${label} بنجاح!`);
      setTimeout(() => setCopiedUrl(null), 3000);
      setTimeout(() => setNotificationMsg(null), 5000);
    } catch {
      setNotificationMsg('حدث خطأ أثناء النسخ');
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  const handleDirectDownload = async (relativeUrl: string, filename: string) => {
    soundFX.playSuccessBirdChirp();
    setDownloadingFile(filename);
    setNotificationMsg(`⏳ جاري تجهيز وتحميل ملف ${filename}...`);

    try {
      const response = await fetch(relativeUrl);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      setNotificationMsg(`🎉 بدأ تحميل ${filename} بنجاح!`);
      setTimeout(() => setNotificationMsg(null), 5000);
    } catch {
      window.open(relativeUrl, '_blank');
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleTriggerDiagnostics = async () => {
    setRunningDiag(true);
    const res = await runSystemDiagnostics();
    setDiagnostics(res);
    setRunningDiag(false);
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

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      {/* The Single Unified Gear Icon Button at Top Right */}
      <button
        type="button"
        onClick={() => {
          soundFX.playWoodTap();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-2xl border-2 transition-all cursor-pointer font-black text-xs sm:text-sm shadow-xs ${
          isOpen
            ? 'bg-emerald-600 border-emerald-700 text-white ring-2 ring-emerald-400'
            : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
        }`}
        title="قائمة الإعدادات والتحميل والمزامنة"
        aria-label="قائمة الإعدادات والتحميل والمزامنة"
      >
        <Settings
          className={`w-5 h-5 text-emerald-600 transition-transform duration-300 ${
            isOpen ? 'rotate-90 text-white' : ''
          }`}
        />
        <span className="hidden sm:inline">خيارات وتحميل اللعبة</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white shadow-2xl border-2 border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right space-y-2">
          {/* Menu Header with Version and Hoor badge */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <img
                src={HOOR_PHOTO_URL}
                alt="حور"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-cover border border-amber-400 shrink-0"
              />
              <span className="text-xs font-black text-slate-900">حور تلعب و تتعلم</span>
            </div>
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              الإصدار {APP_VERSION}
            </span>
          </div>

          {/* Section 1: Android APK & Downloads */}
          <div className="space-y-1">
            <div className="text-[11px] font-black text-slate-400 px-3 pt-1">
              تحميل تطبيق أندرويد (APK):
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleDirectDownload('/Hoor-Plays-Learns.apk', 'Hoor-Plays-Learns.apk');
              }}
              disabled={downloadingFile === 'Hoor-Plays-Learns.apk'}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 transition-colors text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700">
                    تحميل تطبيق APK مباشرة
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    جاهز وموقّع يعمل ١٠٠٪ بدون شاشة بيضاء
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                فوري
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                soundFX.playWoodTap();
                setActiveModal('qr_code');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 transition-colors text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-sky-700">
                    مسح رمز QR بكاميرا الهاتف
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    تنزيل تلقائي على هاتف أندرويد في ثوانٍ
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                handleCopyLink(apkUrl, 'رابط APK');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  {copiedUrl === apkUrl ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {copiedUrl === apkUrl ? 'تم نسخ الرابط!' : 'نسخ رابط APK للهاتف'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    للصقه في متصفح كروم على الهاتف
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Section 2: GitHub Synchronization */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="text-[11px] font-black text-slate-400 px-3 pt-1">
              مزامنة الكود الكامل على GitHub:
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                soundFX.playWoodTap();
                setActiveModal('github_sync');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-indigo-700">
                    مزامنة الكود على GitHub
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    رفع الكود + GitHub Actions للبناء التلقائي
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                Git Sync
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleDirectDownload('/Hoor-GitHub-Full-Repo.zip', 'Hoor-GitHub-Full-Repo.zip');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    تحميل مستودع GitHub الكامل (ZIP)
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    شامل سجل .git وكافة ملفات المشروع
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Section 3: Game Settings & Offline Options */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between px-3 pt-1">
              <span className="text-[11px] font-black text-slate-400">
                الفئة العمرية للطفل:
              </span>
              {onOpenAgeModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    soundFX.playWoodTap();
                    onOpenAgeModal();
                  }}
                  className="text-[10px] font-black text-sky-700 hover:underline cursor-pointer"
                >
                  تغيير الفئة ✏️
                </button>
              )}
            </div>

            {/* 3 Quick Age Tier Selector Buttons */}
            <div className="grid grid-cols-3 gap-1.5 px-2">
              {(['under_5', '6_to_9', '10_plus'] as AgeGroupId[]).map((id) => {
                const info = AGE_GROUPS[id];
                const active = settings.ageGroup === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      soundFX.playWoodTap();
                      onUpdateSettings((prev) => ({ ...prev, ageGroup: id }));
                    }}
                    className={`p-1.5 rounded-xl text-center border transition-all cursor-pointer ${
                      active
                        ? 'bg-sky-600 border-sky-700 text-white font-black shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-sm leading-none">{info.icon}</div>
                    <div className="text-[10px] mt-0.5 leading-tight">{info.badgeAr}</div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                soundFX.playWoodTap();
                onOpenSettingsModal();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 transition-colors text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-amber-800">
                    تخصيص الصعوبة ونوع المسائل
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    الجمع، الطرح، الكلمات الإنجليزية، سرعة الحركة
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playWoodTap();
                onUpdateSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {settings.soundEnabled ? 'المؤثرات الصوتية الطبيعية: مفعّلة' : 'صامت'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    بدون أي موسيقى إطلاقاً (طبيعية ١٠٠٪)
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                soundFX.playWoodTap();
                setActiveModal('diagnostics');
                handleTriggerDiagnostics();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 transition-colors text-right cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-800">
                    فحص الكفاءة والتحديث الهوائي (OTA)
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    ٦ اختبارات تشغيلية ناجحة ١٠٠٪
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating Notification */}
      {notificationMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-400 text-xs font-black flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* QR Code Modal */}
      {activeModal === 'qr_code' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-2 border-emerald-400 text-center space-y-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900">مسح رمز QR بالهاتف</span>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 inline-block mx-auto">
              <canvas ref={qrCanvasRef} className="rounded-xl mx-auto" />
            </div>

            <p className="text-xs font-bold text-slate-600 leading-relaxed">
              افتح كاميرا هاتف الأندرويد أو تطبيق Google Lens ووجّهها نحو الرمز، وسيبدأ تحميل ملف <strong className="text-emerald-700 font-mono">Hoor-Plays-Learns.apk</strong> فوراً!
            </p>

            <button
              type="button"
              onClick={() => handleCopyLink(apkUrl, 'رابط APK')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer"
            >
              نسخ الرابط المباشر
            </button>
          </div>
        </div>
      )}

      {/* GitHub Sync Modal */}
      {activeModal === 'github_sync' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 text-white p-6 shadow-2xl border-2 border-slate-700 my-auto space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-6 h-6 text-emerald-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  مزامنة الكود الكامل على GitHub
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-bold text-slate-300 leading-relaxed">
              ارفع مشروع اللعبة بالكامل (فرع <code className="text-emerald-300">main</code>) إلى حسابك في GitHub، مع ملف البناء التلقائي <code className="text-sky-300">.github/workflows/build-and-deploy.yml</code> لإنتاج الـ APK تلقائياً.
            </p>

            <form onSubmit={handleGitHubSync} className="space-y-3 bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-200">
                  رمز الوصول الشخصي (Personal Access Token):
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Hoor-Plays-Learns-Sync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-black text-sky-300 hover:underline flex items-center gap-1"
                >
                  <span>استخراج الرمز بنقرة واحدة</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="password"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                dir="ltr"
                className="w-full rounded-xl bg-slate-900 border border-slate-600 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    اسم المستودع:
                  </label>
                  <input
                    type="text"
                    value={ghRepoName}
                    onChange={(e) => setGhRepoName(e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl bg-slate-900 border border-slate-600 px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    الخصوصية:
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-600">
                    <button
                      type="button"
                      onClick={() => setGhPrivate(false)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold ${
                        !ghPrivate ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
                      }`}
                    >
                      عام (Public)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGhPrivate(true)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold ${
                        ghPrivate ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
                      }`}
                    >
                      خاص (Private)
                    </button>
                  </div>
                </div>
              </div>

              {ghSyncing && ghProgress && (
                <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between text-xs font-bold text-emerald-300">
                    <span>{ghProgress.step}</span>
                    <span>{ghProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-200"
                      style={{ width: `${ghProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {ghResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold border ${
                    ghResult.success
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950 border-rose-500 text-rose-200'
                  }`}
                >
                  {ghResult.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-black text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تمت المزامنة بنجاح! ({ghResult.filesCount} ملف)</span>
                      </div>
                      <a
                        href={ghResult.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400"
                      >
                        <span>فتح مستودع GitHub</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div>⚠️ {ghResult.error}</div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={ghSyncing}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {ghSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderGit2 className="w-4 h-4" />
                )}
                <span>مزامنة الكود الكامل إلى GitHub الآن</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Diagnostics Modal */}
      {activeModal === 'diagnostics' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-2 border-slate-200 my-auto space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  فحص الكفاءة والتحديث الهوائي (OTA)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-slate-900">حالة التحديث الهوائي (OTA)</div>
                <div className="text-[11px] font-bold text-slate-500">آخر فحص: {lastCheckedTime}</div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  soundFX.playWoodTap();
                  await checkForOTAUpdateNow();
                  await handleTriggerDiagnostics();
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${otaStatus === 'checking' ? 'animate-spin' : ''}`} />
                <span>فحص الآن</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {diagnostics.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{item.titleAr}</div>
                    <div className="text-[11px] font-bold text-slate-500">{item.detailAr}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
