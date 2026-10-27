import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Volume2,
  BookOpen,
} from 'lucide-react';
import {
  EducationalQuestion,
  DifficultyLevel,
  SubjectFilter,
  HOOR_PHOTO_URL,
  QuizOption,
} from '../types/game';
import { generateQuestion } from '../utils/questionGenerator';
import { soundFX } from '../utils/soundEffects';
import { getVerseBetweenLevels } from '../data/quranVerses';

interface BetweenLevelsModalProps {
  completedLevelId: number;
  nextLevelId: number;
  score: number;
  lives: number;
  targetChickens: number;
  difficulty: DifficultyLevel;
  subject: SubjectFilter;
  visualHelpers: boolean;
  onContinueToNextLevel: () => void;
  onReplayLevel: () => void;
  onExitToMap: () => void;
}

export const BetweenLevelsModal: React.FC<BetweenLevelsModalProps> = ({
  completedLevelId,
  nextLevelId,
  score,
  difficulty,
  subject,
  visualHelpers,
  onContinueToNextLevel,
  onReplayLevel,
  onExitToMap,
}) => {
  const [question, setQuestion] = useState<EducationalQuestion>(() =>
    generateQuestion(difficulty, subject)
  );
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeStep, setActiveStep] = useState<'quran_and_quiz' | 'unlocked'>('quran_and_quiz');

  const verse = getVerseBetweenLevels(completedLevelId, nextLevelId);

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
    setQuestion(generateQuestion(difficulty, subject));
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setShowExplanation(false);
  };

  const handleReciteVerse = () => {
    soundFX.playWoodTap();
    const cleanText = verse.verseText.replace(/[﴿﴾]/g, '').trim();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
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
              <div className="text-xs font-extrabold text-emerald-700">
                مبروك يا بطلة حور! اكتملت المرحلة {completedLevelId} بنجاح
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

        {/* 1. Inspiring Quranic Ayah Card with Full Diacritics */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-300 p-4 space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-xs font-black text-emerald-900">
            <span className="flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-lg border border-emerald-300">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>آية قرآنية مباركة بين المرحلتين</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-800">
              {verse.surahName} · الآية {verse.ayahNumber}
            </span>
          </div>

          {/* Ayah Calligraphy Box */}
          <div className="text-center py-2 px-3 bg-white/90 rounded-xl border border-emerald-200">
            <p className="text-lg sm:text-2xl font-bold leading-loose text-emerald-950">
              {verse.verseText}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <p className="text-slate-700 font-bold leading-relaxed flex-1">
              🌟 {verse.reflectionAr}
            </p>
            <button
              type="button"
              onClick={handleReciteVerse}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shrink-0 cursor-pointer"
              title="الاستماع للآية"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>استماع</span>
            </button>
          </div>
        </div>

        {/* 2. Educational Quiz Section to Unlock the Next Stage */}
        {activeStep === 'quran_and_quiz' ? (
          <div className="rounded-2xl bg-amber-50/80 border-2 border-amber-300 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>حلّي هذا السؤال البسيط جداً لفتح المرحلة {nextLevelId}:</span>
              </div>
              <span className="text-[11px] font-extrabold text-amber-800 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">
                عمر ٦ سنوات
              </span>
            </div>

            {/* Question Text & Equation */}
            <div className="text-center py-2 bg-white rounded-xl border border-amber-200">
              <div className="text-base sm:text-lg font-black text-slate-900">
                {question.promptAr}
              </div>

              {question.equationDisplay && (
                <div
                  dir="ltr"
                  className="mt-2 inline-block px-5 py-1.5 rounded-xl bg-amber-100/60 border border-amber-200 text-2xl sm:text-3xl font-black text-slate-900 tracking-wider tabular-nums"
                >
                  {question.equationDisplay}
                </div>
              )}

              {/* Visual Helpers (Apples/Birds/Counting) */}
              {visualHelpers && question.countA !== undefined && question.countB !== undefined && (
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
