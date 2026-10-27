import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  User,
} from 'lucide-react';
import {
  EducationalQuestion,
  DifficultyLevel,
  SubjectFilter,
  HOOR_PHOTO_URL,
  QuizOption,
  AgeGroupId,
  AGE_GROUPS,
  WEAPON_TIERS,
  WeaponConfig,
} from '../types/game';
import { generateQuestion } from '../utils/questionGenerator';
import { soundFX } from '../utils/soundEffects';
import {
  getVerseBetweenLevels,
  getAyahAudioUrl,
  RECITERS,
  ReciterId,
} from '../data/quranVerses';

interface BetweenLevelsModalProps {
  completedLevelId: number;
  nextLevelId: number;
  score: number;
  lives: number;
  targetChickens: number;
  ageGroup?: AgeGroupId;
  difficulty: DifficultyLevel;
  subject: SubjectFilter;
  visualHelpers: boolean;
  weaponLevel?: number;
  onUpgradeWeapon?: (newLevel: number) => void;
  onContinueToNextLevel: () => void;
  onReplayLevel: () => void;
  onExitToMap: () => void;
}

export const BetweenLevelsModal: React.FC<BetweenLevelsModalProps> = ({
  completedLevelId,
  nextLevelId,
  score,
  ageGroup = '6_to_9',
  difficulty,
  subject,
  visualHelpers,
  weaponLevel = 1,
  onUpgradeWeapon,
  onContinueToNextLevel,
  onReplayLevel,
  onExitToMap,
}) => {
  const [question, setQuestion] = useState<EducationalQuestion>(() =>
    generateQuestion(difficulty, subject, ageGroup)
  );
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeStep, setActiveStep] = useState<'quran_and_quiz' | 'unlocked'>('quran_and_quiz');

  // Famous Reciter State
  const [reciter, setReciter] = useState<ReciterId>('alafasy');
  const [isPlayingAyah, setIsPlayingAyah] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isAyahCompleted, setIsAyahCompleted] = useState(false);
  const [newWeaponAwarded, setNewWeaponAwarded] = useState<WeaponConfig | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const verse = getVerseBetweenLevels(completedLevelId, nextLevelId);

  // Play celebratory cheer + automatically start Quran recitation upon entering
  useEffect(() => {
    // 1. Celebratory cheer sound and voice for Hoor
    soundFX.playCelebrationCheer(`أحسنتِ يا حور يا بطلة! مبروك إتمام المرحلة ${completedLevelId}!`);

    // 2. Auto-play Quran recitation after short delay so cheer finishes
    const timer = setTimeout(() => {
      startRecitation(reciter);
    }, 1400);

    return () => {
      clearTimeout(timer);
      stopCurrentAudio();
    };
  }, [completedLevelId]);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAyah(false);
  };

  // Trigger weapon upgrade upon fully finishing Quranic recitation
  const handleAyahFullyListened = () => {
    setIsPlayingAyah(false);
    setIsAyahCompleted(true);

    const nextLvl = Math.min(4, weaponLevel + 1);
    const awarded = WEAPON_TIERS[nextLvl];
    setNewWeaponAwarded(awarded);

    if (onUpgradeWeapon) {
      onUpgradeWeapon(nextLvl);
    }

    soundFX.playSuccessBirdChirp();
    setTimeout(() => {
      soundFX.playCelebrationCheer(
        `ما شاء الله يا حور! ببركة الاستماع للقرآن الكريم، حصلتِ على ${awarded.nameAr}!`
      );
    }, 500);
  };

  const startRecitation = (reciterChoice: ReciterId) => {
    stopCurrentAudio();
    setIsPlayingAyah(true);
    setAudioError(false);

    const urls = getAyahAudioUrl(verse.surahNumber, verse.ayahNumber, reciterChoice);
    let urlIndex = 0;

    const playNextUrl = () => {
      if (urlIndex >= urls.length) {
        // Fallback to offline speech synthesis
        fallbackSpeechRecitation();
        return;
      }

      const audio = new Audio(urls[urlIndex]);
      audioRef.current = audio;

      audio.onended = () => {
        handleAyahFullyListened();
      };

      audio.onerror = () => {
        urlIndex++;
        playNextUrl();
      };

      audio
        .play()
        .then(() => {
          setIsPlayingAyah(true);
        })
        .catch(() => {
          urlIndex++;
          playNextUrl();
        });
    };

    playNextUrl();
  };

  const fallbackSpeechRecitation = () => {
    const cleanText = verse.verseText.replace(/[﴿﴾]/g, '').trim();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.onend = () => {
        handleAyahFullyListened();
      };
      utterance.onerror = () => {
        setIsPlayingAyah(false);
        setAudioError(true);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAyah(false);
      setAudioError(true);
    }
  };

  const handleTogglePlayRecitation = () => {
    soundFX.playWoodTap();
    if (isPlayingAyah) {
      stopCurrentAudio();
    } else {
      startRecitation(reciter);
    }
  };

  const handleChangeReciter = (newReciter: ReciterId) => {
    soundFX.playWoodTap();
    setReciter(newReciter);
    startRecitation(newReciter);
  };

  const handleSelectOption = (opt: QuizOption) => {
    if (selectedOption !== null && isAnswerCorrect) return;

    soundFX.playWoodTap();
    setSelectedOption(opt);
    setShowExplanation(true);

    const isCorrect =
      String(opt.value).trim().toLowerCase() === String(question.correctValue).trim().toLowerCase();

    if (isCorrect) {
      soundFX.playSuccessBirdChirp();
      setIsAnswerCorrect(true);
      setTimeout(() => {
        setActiveStep('unlocked');
      }, 1200);
    } else {
      soundFX.playWoodTap();
      setIsAnswerCorrect(false);
    }
  };

  const handleTryAnotherQuestion = () => {
    soundFX.playWoodTap();
    setQuestion(generateQuestion(difficulty, subject, ageGroup));
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setShowExplanation(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border-2 border-emerald-400 my-auto text-right space-y-4">
        {/* Top Header with Hoor Photo & Score */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={HOOR_PHOTO_URL}
                alt="البطلة حور"
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-2xl object-cover border-2 border-amber-400 shadow-xs"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black">
                ★
              </div>
            </div>
            <div>
              <div className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>أحسنتِ يا بطلة حور! اكتملت المرحلة {completedLevelId} بنجاح</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                بين المرحلتين ({completedLevelId} ⬅️ {nextLevelId})
              </h3>
            </div>
          </div>

          <div className="text-left shrink-0">
            <div className="text-xs font-bold text-slate-400">النقاط المحققة</div>
            <div className="text-base font-black text-sky-700 tabular-nums">{score} نقطة</div>
          </div>
        </div>

        {/* 1. Inspiring Quranic Ayah Card with Famous Reciter Voice & Auto-Play */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-300 p-4 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black text-emerald-900">
            <span className="flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs">
              <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>تلاوة قرآنية مباركة (تشتغل تلقائياً)</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {verse.surahName} · الآية {verse.ayahNumber}
            </span>
          </div>

          {/* Ayah Calligraphy Box */}
          <div className="text-center py-3 px-4 bg-white/95 rounded-2xl border border-emerald-200 shadow-inner">
            <p className="text-xl sm:text-2xl font-bold leading-loose text-emerald-950 font-serif" dir="rtl">
              {verse.verseText}
            </p>
          </div>

          {/* Reciter Selector & Audio Playback Wave */}
          <div className="bg-white/90 p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] font-black text-slate-700">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>القارئ:</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleChangeReciter('alafasy')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reciter === 'alafasy'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  الشيخ مشاري العفاسي
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeReciter('husary')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reciter === 'husary'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  الشيخ الحصري (المعلم)
                </button>
              </div>
            </div>

            {/* Audio Wave and Play/Pause Button */}
            <div className="flex items-center gap-3">
              {isPlayingAyah && (
                <div className="flex items-end gap-1 h-5 px-1">
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-4" />
                  <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-5 delay-75" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3 delay-150" />
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-5 delay-100" />
                </div>
              )}

              <button
                type="button"
                onClick={handleTogglePlayRecitation}
                className={`px-3.5 py-1.5 min-h-[38px] rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all shadow-xs ${
                  isPlayingAyah
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title={isPlayingAyah ? 'إيقاف مؤقت' : 'استماع للتلاوة'}
              >
                {isPlayingAyah ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>إيقاف التلاوة</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>تشغيل بصوت {RECITERS[reciter].nameAr.split(' ')[1]}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-700 font-bold leading-relaxed px-1">
            🌟 {verse.reflectionAr}
          </div>

          {/* Weapon Upgrade Reward Banner based on listening to the Ayah */}
          {newWeaponAwarded ? (
            <div className="rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 p-3.5 text-slate-950 font-black shadow-md border-2 border-amber-600 animate-in zoom-in-95 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-white text-3xl flex items-center justify-center shadow-xs shrink-0">
                  {newWeaponAwarded.icon}
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-amber-950/80">
                    🌟 هدية بركة الاستماع للقرآن الكريم:
                  </div>
                  <div className="text-sm font-black text-slate-950">
                    تم فتح سلاح جديد أقوى: {newWeaponAwarded.nameAr} ⚡
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">
                    {newWeaponAwarded.subtitleAr} (متاح للمرحلة {nextLevelId})
                  </div>
                </div>
              </div>
              <span className="text-xs bg-slate-950 text-white px-3 py-1.5 rounded-xl shrink-0 font-black shadow-2xs">
                مفعّل الآن ✅
              </span>
            </div>
          ) : (
            <div className="rounded-xl bg-white/80 p-2.5 border border-emerald-300 flex items-center justify-between gap-2 text-xs font-black text-emerald-900">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎧</span>
                <span>
                  {isPlayingAyah
                    ? 'جاري الاستماع للآية... عند انتهائها ستحصلين على سلاح أقوى للمرحلة القادمة!'
                    : 'استمعي للآية الكريمة كاملة للحصول على ترقية سلاح خارق للمرحلة القادمة!'}
                </span>
              </div>
              {!isPlayingAyah && (
                <button
                  type="button"
                  onClick={() => startRecitation(reciter)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-black cursor-pointer shrink-0 hover:bg-emerald-700"
                >
                  استماع الآن 🔊
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Educational Quiz Section to Unlock the Next Stage */}
        {activeStep === 'quran_and_quiz' ? (
          <div className="rounded-2xl bg-amber-50/80 border-2 border-amber-300 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>حلّي هذا السؤال لفتح المرحلة {nextLevelId}:</span>
              </div>
              <span className="text-[11px] font-extrabold text-amber-800 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">
                {AGE_GROUPS[ageGroup].badgeAr}
              </span>
            </div>

            {/* Question Text & Visual Display */}
            <div className="text-center py-2.5 px-3 bg-white rounded-xl border border-amber-200">
              <div className="text-base sm:text-lg font-black text-slate-900">
                {question.promptAr}
              </div>

              {/* Counting Objects (Under 5) */}
              {question.type === 'counting' && question.countA !== undefined && (
                <div className="mt-3 flex items-center justify-center gap-2 bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                  {Array.from({ length: question.countA }).map((_, i) => (
                    <span key={i} className="text-3xl">
                      {question.visualEmoji}
                    </span>
                  ))}
                </div>
              )}

              {/* Shape / Color Question (Under 5) */}
              {question.type === 'shapes' && (
                <div className="mt-2 text-5xl">
                  {question.visualEmoji}
                </div>
              )}

              {/* Equation Display (Math, Multiplication, Division, Algebra) */}
              {question.equationDisplay && (
                <div
                  dir="ltr"
                  className="mt-2 inline-block px-5 py-1.5 rounded-xl bg-amber-100/60 border border-amber-200 text-2xl sm:text-3xl font-black text-slate-900 tracking-wider tabular-nums"
                >
                  {question.equationDisplay}
                </div>
              )}

              {/* Visual Helpers (Apples/Birds/Counting for Addition & Subtraction) */}
              {visualHelpers && (question.type === 'addition' || question.type === 'subtraction') && question.countA !== undefined && question.countB !== undefined && (
                <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {Array.from({ length: question.countA }).map((_, i) => (
                      <span key={i} className="text-lg">
                        {question.visualEmoji}
                      </span>
                    ))}
                  </div>

                  <span className="text-base font-black text-slate-700">
                    {question.type === 'addition' ? '+' : '-'}
                  </span>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {Array.from({ length: question.countB }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          question.type === 'subtraction' ? 'opacity-30 line-through' : ''
                        }`}
                      >
                        {question.visualEmoji}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* English Word audio aid */}
              {question.type === 'english' && question.englishWord && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => soundFX.speakEnglishWord(question.englishWord!)}
                    className="px-3 py-1 bg-sky-100 text-sky-800 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="font-english">{question.englishWord}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Options Choices */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {question.options.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                const isCorrect =
                  String(opt.value).trim().toLowerCase() ===
                  String(question.correctValue).trim().toLowerCase();

                let btnStyle = 'bg-white hover:bg-amber-100/60 border-amber-300 text-slate-900';
                if (showExplanation && isSelected) {
                  btnStyle = isCorrect
                    ? 'bg-emerald-500 border-emerald-600 text-white ring-2 ring-emerald-300'
                    : 'bg-rose-500 border-rose-600 text-white';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`py-3 px-2 min-h-[48px] rounded-xl border-2 font-black text-base transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1 ${btnStyle}`}
                  >
                    {opt.emoji && <span className="text-lg">{opt.emoji}</span>}
                    <span>{opt.label}</span>
                    {showExplanation && isSelected && (
                      isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 ml-1" />
                      ) : (
                        <XCircle className="w-4 h-4 ml-1" />
                      )
                    )}
                  </button>
                );
              })}
            </div>

            {/* Wrong Answer Retry Notice */}
            {isAnswerCorrect === false && (
              <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 font-bold">
                <span>حاولي مرة أخرى يا بطلة، أنتِ قريبة جداً من الإجابة الصحيحة!</span>
                <button
                  type="button"
                  onClick={handleTryAnotherQuestion}
                  className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-900 font-black cursor-pointer"
                >
                  سؤال بديل
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 3. Success Unlocked Screen */
          <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-400 p-5 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-black text-slate-900">
              إجابة صحيحة متميزة! تم فتح المرحلة {nextLevelId} بنجاح 🎉
            </h4>

            <p className="text-xs font-bold text-slate-600">
              أنتِ ذكية ورائعة يا حور! يمكنكِ الآن الدخول مباشرة للمرحلة {nextLevelId} وخوض مغامرة صيد جديدة.
            </p>

            <button
              type="button"
              onClick={onContinueToNextLevel}
              className="w-full py-4 px-6 min-h-[56px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform"
            >
              <Play className="w-6 h-6 fill-white shrink-0" />
              <span>ابدئي المرحلة {nextLevelId} الآن</span>
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onReplayLevel}
            className="px-4 py-2 min-h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المرحلة {completedLevelId}</span>
          </button>

          <button
            type="button"
            onClick={onExitToMap}
            className="px-5 py-2 min-h-[42px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold cursor-pointer"
          >
            العودة لخريطة المراحل
          </button>
        </div>
      </div>
    </div>
  );
};
