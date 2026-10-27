import React, { useState, useEffect } from 'react';
import { Volume2, Heart, Unlock, Sparkles, RefreshCw, X, CheckCircle2, HelpCircle } from 'lucide-react';
import { AgeGroupId, DifficultyLevel, EducationalQuestion, HOOR_PHOTO_URL, QuizOption, QuizPurpose, SubjectFilter } from '../types/game';
import { generateQuestion } from '../utils/questionGenerator';
import { soundFX } from '../utils/soundEffects';

interface QuizModalProps {
  purpose: QuizPurpose;
  ageGroup?: AgeGroupId;
  difficulty: DifficultyLevel;
  subject: SubjectFilter;
  visualHelpers: boolean;
  onSuccess: (purpose: QuizPurpose) => void;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  purpose,
  ageGroup = '6_to_9',
  difficulty,
  subject,
  visualHelpers,
  onSuccess,
  onClose,
}) => {
  const [question, setQuestion] = useState<EducationalQuestion>(() =>
    generateQuestion(difficulty, subject, ageGroup)
  );
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Automatically pronounce the English word when an English question appears
    if (question.type === 'english' && question.englishWord) {
      const timer = setTimeout(() => {
        soundFX.speakEnglishWord(question.englishWord!);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [question]);

  const handleSelectOption = (opt: QuizOption) => {
    if (status === 'correct') return;
    setSelectedOption(opt.value);

    const isMatch =
      String(opt.value).trim().toLowerCase() === String(question.correctValue).trim().toLowerCase();

    if (isMatch) {
      setStatus('correct');
      soundFX.playSuccessBirdChirp();
      if (question.type === 'english' && question.englishWord) {
        setTimeout(() => soundFX.speakEnglishWord(question.englishWord!), 350);
      }
      setTimeout(() => {
        onSuccess(purpose);
      }, 1150);
    } else {
      setStatus('wrong');
      setShowHint(true);
      soundFX.playWoodTap(true);
    }
  };

  const handleNewQuestion = () => {
    soundFX.playWoodTap();
    setQuestion(generateQuestion(difficulty, subject, ageGroup));
    setSelectedOption(null);
    setStatus('idle');
    setShowHint(false);
  };

  const headerInfo = () => {
    if (purpose.kind === 'unlock_level') {
      return {
        badge: `فتح المرحلة ${purpose.levelId}`,
        title: `حلّي هذا السؤال لفتح المرحلة ${purpose.levelId} يا بطلة!`,
        icon: <Unlock className="w-4 h-4 text-amber-600 shrink-0" />,
      };
    }
    if (purpose.kind === 'buy_life') {
      return {
        badge: 'هدية حياة جديدة',
        title: 'أجيبي عن هذا السؤال للحصول على قلب إضافي مجاناً!',
        icon: <Heart className="w-4 h-4 text-rose-600 fill-rose-500 shrink-0" />,
      };
    }
    return {
      badge: 'تدريب البطلة',
      title: 'هيّا نلعب ونتعلم معاً!',
      icon: <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />,
    };
  };

  const info = headerInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-xl border border-slate-200 my-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={HOOR_PHOTO_URL}
                alt="البطلة حور"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-2xs"
              />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-lg bg-white border border-amber-200 flex items-center justify-center shadow-2xs">
                {info.icon}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">
                {info.badge} · {question.titleAr}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                {info.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playWoodTap();
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Stage */}
        <div className="mt-5 rounded-2xl bg-sky-50/70 border border-sky-100 p-5 text-center">
          <p className="text-base sm:text-lg font-extrabold text-slate-800">
            {question.promptAr}
          </p>

          {/* Type: Counting (Under 5) */}
          {question.type === 'counting' && question.countA !== undefined && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-2.5 bg-white p-4 rounded-3xl border border-sky-200 shadow-2xs max-w-xs mx-auto">
                {Array.from({ length: question.countA }).map((_, idx) => (
                  <span key={idx} className="text-4xl sm:text-5xl animate-bounce-short">
                    {question.visualEmoji}
                  </span>
                ))}
              </div>
              <p className="text-xs font-extrabold text-slate-500">
                عُدّي الأشكال بإصبعكِ ثم اختاري الرقم الصحيح!
              </p>
            </div>
          )}

          {/* Type: Shapes & Colors (Under 5) */}
          {question.type === 'shapes' && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-3xl bg-white border border-sky-200 flex items-center justify-center text-6xl shadow-2xs">
                {question.visualEmoji}
              </div>
              <p className="text-xs font-extrabold text-slate-500">
                ما هو اسم هذا الشكل اللطيف؟
              </p>
            </div>
          )}

          {/* Type: Addition & Subtraction (6-9 & Under 5) */}
          {(question.type === 'addition' || question.type === 'subtraction') && (
            <div className="mt-4 space-y-4">
              <div
                dir="ltr"
                className="inline-block px-6 py-2.5 rounded-2xl bg-white border border-sky-200 text-3xl sm:text-4xl font-black text-sky-900 tracking-wider font-english tabular-nums shadow-2xs"
              >
                {question.equationDisplay}
              </div>

              {visualHelpers && question.countA !== undefined && question.countB !== undefined && (
                <div className="pt-2">
                  {question.type === 'addition' ? (
                    <div className="flex flex-wrap items-center justify-center gap-3" dir="ltr">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-slate-200">
                        {Array.from({ length: question.countA }).map((_, i) => (
                          <span key={`a-${i}`} className="text-2xl sm:text-3xl leading-none">
                            {question.visualEmoji}
                          </span>
                        ))}
                      </div>
                      <span className="text-2xl font-black text-sky-700">+</span>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-slate-200">
                        {Array.from({ length: question.countB }).map((_, i) => (
                          <span key={`b-${i}`} className="text-2xl sm:text-3xl leading-none">
                            {question.visualEmoji}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200" dir="ltr">
                      {Array.from({ length: question.countA }).map((_, i) => {
                        const isCrossedOut = i >= question.countA! - question.countB!;
                        return (
                          <span
                            key={`sub-${i}`}
                            className={`relative text-2xl sm:text-3xl leading-none transition-opacity ${
                              isCrossedOut ? 'opacity-35 grayscale' : ''
                            }`}
                          >
                            {question.visualEmoji}
                            {isCrossedOut && (
                              <span className="absolute inset-0 flex items-center justify-center text-rose-600 font-black text-2xl">
                                ✕
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs font-bold text-slate-500 mt-2">
                    {question.type === 'addition'
                      ? 'عدّي الفواكه والأشكال بإصبعكِ لمعرفة المجموع!'
                      : 'عدّي الأشكال السليمة غير المشطوبة فقط!'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Type: Multiplication, Division, Equation, Powers & Percentages (10+) */}
          {(question.type === 'multiplication' ||
            question.type === 'division' ||
            question.type === 'equation' ||
            question.type === 'powers' ||
            question.type === 'percentages') && (
            <div className="mt-4 space-y-3">
              <div
                dir="ltr"
                className="inline-block px-7 py-3 rounded-2xl bg-white border-2 border-purple-200 text-3xl sm:text-4xl font-black text-purple-950 tracking-wider font-english tabular-nums shadow-sm"
              >
                {question.equationDisplay}
              </div>
              <p className="text-xs font-bold text-slate-500">
                فكّري بتركيز واحسبي القيمة بدقة يا بطلة!
              </p>
            </div>
          )}

          {/* Type: General Knowledge & Capitals (10+) */}
          {question.type === 'general_knowledge' && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-4xl shadow-2xs">
                {question.visualEmoji}
              </div>
              <p className="text-xs font-black text-indigo-800 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                اختبري معلوماتكِ وثقافتكِ العامة يا بطلة 🌍
              </p>
            </div>
          )}

          {/* Type: English Word Visual & Audio Aid */}
          {question.type === 'english' && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-white border border-sky-200 flex items-center justify-center text-5xl shadow-2xs">
                  {question.visualEmoji}
                </div>
                {question.englishWord && (
                  <button
                    type="button"
                    onClick={() => soundFX.speakEnglishWord(question.englishWord!)}
                    className="flex items-center gap-2.5 px-5 py-3 min-h-[52px] rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold shadow-sm transition-transform cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 shrink-0" />
                    <span className="font-english text-2xl tracking-wide">{question.englishWord}</span>
                  </button>
                )}
              </div>
              <p className="text-xs font-bold text-slate-500">
                اضغطي على زر السماعة 🔊 لسماع نطق الكلمة الإنجليزية
              </p>
            </div>
          )}
        </div>

        {/* Answer Options Grid */}
        <div
          className={`mt-5 grid gap-3 ${
            question.options.length === 2
              ? 'grid-cols-2'
              : question.options.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt.value;
            const isCorrectChoice = status === 'correct' && opt.value === question.correctValue;
            const isWrongChoice = status === 'wrong' && isSelected && opt.value !== question.correctValue;

            let btnStyle =
              'bg-slate-50 hover:bg-sky-50 border-slate-200 hover:border-sky-400 text-slate-900';
            if (isCorrectChoice) {
              btnStyle = 'bg-emerald-600 border-emerald-700 text-white scale-105';
            } else if (isWrongChoice) {
              btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
            }

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`min-h-[76px] p-3 rounded-2xl border-2 font-extrabold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${btnStyle}`}
              >
                {opt.emoji && <span className="text-2xl leading-none">{opt.emoji}</span>}
                <span className="text-2xl sm:text-3xl font-english tabular-nums leading-tight">
                  {opt.label}
                </span>
                {opt.subLabel && (
                  <span
                    className={`text-xs font-bold ${
                      isCorrectChoice ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {opt.subLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Banner */}
        {status === 'correct' && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2.5 text-emerald-900 font-extrabold text-base">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>أحسنتِ يا بطلة حور! إجابة صحيحة وممتازة 🌟</span>
          </div>
        )}

        {status === 'wrong' && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-right space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>قريبة جداً يا بطلة! جرّبي اختيار إجابة أخرى:</span>
            </div>
            {showHint && (
              <p className="text-xs font-bold text-amber-800 pr-7">{question.hintAr}</p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleNewQuestion}
            className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>سؤال آخر</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              onClose();
            }}
            className="px-4 py-2 min-h-[44px] rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            العودة
          </button>
        </div>
      </div>
    </div>
  );
};
