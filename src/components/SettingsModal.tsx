import React from 'react';
import { Sliders, Volume2, VolumeX, Eye, RotateCcw, Unlock, X, Check } from 'lucide-react';
import { DifficultyLevel, GameSettings, GameSpeed, SubjectFilter } from '../types/game';
import { soundFX } from '../utils/soundEffects';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onUnlockAllLevels: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onUnlockAllLevels,
  onResetProgress,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [unlockedToast, setUnlockedToast] = React.useState(false);

  const setDifficulty = (difficulty: DifficultyLevel) => {
    soundFX.playWoodTap();
    onUpdateSettings({ ...settings, difficulty });
  };

  const setSubject = (subject: SubjectFilter) => {
    soundFX.playWoodTap();
    onUpdateSettings({ ...settings, subject });
  };

  const setGameSpeed = (gameSpeed: GameSpeed) => {
    soundFX.playWoodTap();
    onUpdateSettings({ ...settings, gameSpeed });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-xl border border-slate-200 my-auto text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                تخصيص صعوبة المسائل واللعبة
              </h2>
              <p className="text-xs font-bold text-slate-500">
                إعدادات مخصّصة للوالدين لتناسب مستوى الطفلة حور (عمر ٦ سنوات)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 1. Difficulty Level */}
          <div>
            <label className="block text-sm font-extrabold text-slate-900 mb-2.5">
              ١. مستوى صعوبة المسائل التعليمية:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'easy' as DifficultyLevel,
                  title: 'بسيط جداً (مبتدئ)',
                  desc: 'أرقام حتى ٥ · خياران فقط · كلمات من ٣ حروف',
                },
                {
                  id: 'medium' as DifficultyLevel,
                  title: 'مناسب لعمر ٦ سنوات',
                  desc: 'أرقام حتى ١٠ · ٣ خيارات · كلمات أساسية مصورة',
                },
                {
                  id: 'hard' as DifficultyLevel,
                  title: 'متقدم (تحدي الأذكياء)',
                  desc: 'أرقام حتى ٢٠ · ٤ خيارات · حصيلة كلمات أوسع',
                },
              ].map((item) => {
                const active = settings.difficulty === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id)}
                    className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'bg-sky-50 border-sky-600 text-slate-900 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-sm">{item.title}</span>
                      {active && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Question Subjects */}
          <div>
            <label className="block text-sm font-extrabold text-slate-900 mb-2.5">
              ٢. نوع المسائل المطلوبة لفتح المراحل وشراء الحياة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all' as SubjectFilter, label: 'شامل (جمع + طرح + إنجليزي)' },
                { id: 'addition' as SubjectFilter, label: 'الجمع فقط (➕)' },
                { id: 'subtraction' as SubjectFilter, label: 'الطرح فقط (➖)' },
                { id: 'math' as SubjectFilter, label: 'حساب فقط (جمع وطرح)' },
                { id: 'english' as SubjectFilter, label: 'كلمات إنجليزية فقط (🔤)' },
              ].map((sub) => {
                const active = settings.subject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubject(sub.id)}
                    className={`px-3.5 py-2.5 min-h-[44px] rounded-xl border text-xs font-extrabold transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Arcade Chicken Speed */}
          <div>
            <label className="block text-sm font-extrabold text-slate-900 mb-2.5">
              ٣. سرعة حركة الدجاج في المراحل:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'slow' as GameSpeed, label: 'هادئة للطفل 🐣' },
                { id: 'normal' as GameSpeed, label: 'عادية متوازنة 🐔' },
                { id: 'fast' as GameSpeed, label: 'سريعة وحماسية 🚀' },
              ].map((spd) => {
                const active = settings.gameSpeed === spd.id;
                return (
                  <button
                    key={spd.id}
                    type="button"
                    onClick={() => setGameSpeed(spd.id)}
                    className={`px-3 py-2.5 min-h-[44px] rounded-xl border text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-amber-500 border-amber-600 text-slate-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {spd.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Sound & Visual Counting Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                const next = !settings.soundEnabled;
                onUpdateSettings({ ...settings, soundEnabled: next });
              }}
              className={`p-3 min-h-[48px] rounded-2xl border flex items-center justify-between gap-2 text-xs font-extrabold cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>أصوات الطبيعة والدجاج</span>
              </span>
              <span>{settings.soundEnabled ? 'مفعّل' : 'صامت'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !settings.voiceEnabled;
                onUpdateSettings({ ...settings, voiceEnabled: next });
              }}
              className={`p-3 min-h-[48px] rounded-2xl border flex items-center justify-between gap-2 text-xs font-extrabold cursor-pointer ${
                settings.voiceEnabled
                  ? 'bg-sky-50 border-sky-300 text-sky-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>نطق الكلمات الإنجليزية</span>
              </span>
              <span>{settings.voiceEnabled ? 'مفعّل' : 'مغلق'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playWoodTap();
                onUpdateSettings({ ...settings, visualHelpers: !settings.visualHelpers });
              }}
              className={`p-3 min-h-[48px] rounded-2xl border flex items-center justify-between gap-2 text-xs font-extrabold cursor-pointer ${
                settings.visualHelpers
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600 shrink-0" />
                <span>العدّ البصري بالفواكه</span>
              </span>
              <span>{settings.visualHelpers ? 'ظاهر' : 'مخفي'}</span>
            </button>
          </div>

          {/* Parent Utilities */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playSuccessBirdChirp();
                  onUnlockAllLevels();
                  setUnlockedToast(true);
                  setTimeout(() => setUnlockedToast(false), 2500);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                <Unlock className="w-4 h-4 shrink-0" />
                <span>فتح جميع الـ ٢٠ مرحلة (خيار للوالدين)</span>
              </button>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>إعادة ضبط التقدم</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  <span>تأكيد مسح التقدم؟</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playWoodTap();
                onClose();
              }}
              className="px-6 py-2.5 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm cursor-pointer whitespace-nowrap"
            >
              حفظ وإغلاق
            </button>
          </div>

          {unlockedToast && (
            <p className="text-xs font-extrabold text-emerald-700 text-center">
              تم فتح جميع المراحل الـ ٢٠ بنجاح!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
