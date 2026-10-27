import React from 'react';
import { Sliders, Volume2, VolumeX, Eye, RotateCcw, Unlock, X, Check, Users } from 'lucide-react';
import { AGE_GROUPS, AgeGroupId, DifficultyLevel, GameSettings, GameSpeed, SubjectFilter } from '../types/game';
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
  const [parentChallenge, setParentChallenge] = React.useState<{
    action: 'unlock' | 'reset';
    first: number;
    second: number;
  } | null>(null);
  const [parentAnswer, setParentAnswer] = React.useState('');
  const [parentError, setParentError] = React.useState(false);
  const parentActionHandled = React.useRef(false);
  const parentAnswerInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (parentChallenge) parentAnswerInput.current?.focus();
  }, [parentChallenge]);

  const requestParentCheck = (action: 'unlock' | 'reset') => {
    parentActionHandled.current = false;
    setParentAnswer('');
    setParentError(false);
    setParentChallenge({
      action,
      first: 20 + Math.floor(Math.random() * 30),
      second: 20 + Math.floor(Math.random() * 30),
    });
  };

  const cancelParentCheck = () => {
    if (parentChallenge?.action === 'reset') setConfirmReset(false);
    parentActionHandled.current = true;
    setParentAnswer('');
    setParentError(false);
    setParentChallenge(null);
  };

  const submitParentCheck = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!parentChallenge || parentActionHandled.current) return;

    const answer = Number(parentAnswer);
    if (
      parentAnswer.trim() === '' ||
      !Number.isInteger(answer) ||
      answer !== parentChallenge.first + parentChallenge.second
    ) {
      setParentAnswer('');
      setParentError(true);
      parentAnswerInput.current?.focus();
      return;
    }

    parentActionHandled.current = true;
    const action = parentChallenge.action;
    setParentAnswer('');
    setParentError(false);
    setParentChallenge(null);

    if (action === 'unlock') {
      soundFX.playSuccessBirdChirp();
      onUnlockAllLevels();
      setUnlockedToast(true);
      setTimeout(() => setUnlockedToast(false), 2500);
    } else {
      onResetProgress();
      setConfirmReset(false);
    }
  };

  const setAgeGroup = (ageGroup: AgeGroupId) => {
    soundFX.playWoodTap();
    onUpdateSettings({ ...settings, ageGroup });
  };

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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-xl border border-slate-200 my-auto text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-xl font-extrabold text-slate-900">
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
          {/* 0. Age Category Selection */}
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200">
            <div className="flex items-center gap-2 mb-2.5">
              <Users className="w-4 h-4 text-sky-700" />
              <label className="text-sm font-black text-slate-900">
                الفئة العمرية للطفل (تكييف فوري للمسائل وسرعة اللعبة):
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(['under_5', '6_to_9', '10_plus'] as AgeGroupId[]).map((id) => {
                const info = AGE_GROUPS[id];
                const active = settings.ageGroup === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAgeGroup(id)}
                    className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'bg-white border-sky-600 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-900">
                        <span>{info.icon}</span>
                        <span>{info.titleAr}</span>
                      </div>
                      {active && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 mt-1 leading-snug">
                      {info.badgeAr}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

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
                { id: 'all' as SubjectFilter, label: 'شامل الفئة العمرية' },
                { id: 'general_knowledge' as SubjectFilter, label: 'عواصم ومعلومات عامة 🌍' },
                { id: 'addition' as SubjectFilter, label: 'الجمع فقط (➕)' },
                { id: 'subtraction' as SubjectFilter, label: 'الطرح فقط (➖)' },
                { id: 'multiplication' as SubjectFilter, label: 'الضرب فقط (✖️)' },
                { id: 'advanced_math' as SubjectFilter, label: 'رياضيات وجبر متقدم (⚡)' },
                { id: 'english' as SubjectFilter, label: 'كلمات إنجليزية (🔤)' },
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
                onClick={() => requestParentCheck('unlock')}
                disabled={Boolean(parentChallenge)}
                className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                <Unlock className="w-4 h-4 shrink-0" />
                <span>فتح جميع الـ ٢٠ مرحلة (خيار للوالدين)</span>
              </button>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  disabled={Boolean(parentChallenge)}
                  className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>إعادة ضبط التقدم</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => requestParentCheck('reset')}
                  disabled={Boolean(parentChallenge)}
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
      {parentChallenge && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-check-title"
            aria-describedby="parent-check-question"
            onSubmit={submitParentCheck}
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-right shadow-2xl"
          >
            <h2 id="parent-check-title" className="text-lg font-extrabold text-slate-900">
              تحقق وليّ الأمر
            </h2>
            <p id="parent-check-question" className="mt-2 text-sm font-bold text-slate-600">
              أدخل ناتج الجمع للمتابعة: {parentChallenge.first} + {parentChallenge.second} = ؟
            </p>
            <label htmlFor="parent-check-answer" className="mt-4 block text-sm font-bold text-slate-700">
              الإجابة
            </label>
            <input
              ref={parentAnswerInput}
              autoFocus
              id="parent-check-answer"
              type="number"
              inputMode="numeric"
              step="1"
              value={parentAnswer}
              onChange={(event) => {
                setParentAnswer(event.target.value);
                if (parentError) setParentError(false);
              }}
              aria-label="أدخل ناتج الجمع"
              aria-invalid={parentError}
              aria-describedby={parentError ? 'parent-check-error' : 'parent-check-question'}
              className="mt-1 min-h-[48px] w-full rounded-xl border border-slate-300 px-3 text-lg text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            {parentError && (
              <p id="parent-check-error" role="alert" className="mt-2 text-sm font-bold text-rose-700">
                تعذر التحقق. حاول مرة أخرى.
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                disabled={parentAnswer.trim() === ''}
                className="min-h-[44px] flex-1 rounded-xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white enabled:hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                متابعة
              </button>
              <button
                type="button"
                onClick={cancelParentCheck}
                className="min-h-[44px] rounded-xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-200"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
