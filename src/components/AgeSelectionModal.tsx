import React from 'react';
import { Sparkles, Check, X, Shield, ArrowRight } from 'lucide-react';
import { AGE_GROUPS, AgeGroupId, HOOR_PHOTO_URL } from '../types/game';
import { soundFX } from '../utils/soundEffects';

interface AgeSelectionModalProps {
  currentAgeGroup: AgeGroupId;
  canDismiss?: boolean;
  onSelectAgeGroup: (ageGroup: AgeGroupId) => void;
  onClose?: () => void;
}

export const AgeSelectionModal: React.FC<AgeSelectionModalProps> = ({
  currentAgeGroup,
  canDismiss = true,
  onSelectAgeGroup,
  onClose,
}) => {
  const handleSelect = (id: AgeGroupId) => {
    soundFX.playWoodTap();
    onSelectAgeGroup(id);
  };

  const ageTiers: Array<{
    id: AgeGroupId;
    nameAr: string;
    rangeAr: string;
    recommended?: boolean;
    emoji: string;
    bgGradient: string;
    borderActive: string;
    features: string[];
    actionLabel: string;
  }> = [
    {
      id: 'under_5',
      nameAr: 'براعم الصغار',
      rangeAr: 'تحت ٥ سنوات (٣ - ٥)',
      emoji: '🐣',
      bgGradient: 'from-amber-50 to-orange-50/70',
      borderActive: 'border-amber-400 ring-2 ring-amber-300',
      features: [
        'عدّ الفواكه والألعاب اللطيفة بالصور (١ إلى ٥)',
        'تعلّم الأشكال والألوان (دائرة، مربع، مثلث)',
        'جمع مبسط جداً بصرياً (١ + ١)',
        'كلمات إنجليزية سهلة (Cat, Sun, Car)',
        'سرعة دجاج هادئة جداً ومراحل ميسّرة للطفل',
      ],
      actionLabel: 'اختيار فئة براعم الصغار 🐣',
    },
    {
      id: '6_to_9',
      nameAr: 'أبطال حور الأذكياء',
      rangeAr: '٦ إلى ٩ سنوات',
      recommended: true,
      emoji: '👧',
      bgGradient: 'from-sky-50 to-blue-50/70',
      borderActive: 'border-sky-500 ring-2 ring-sky-300',
      features: [
        'المستوى الأصلي المصمم للبطلة حور (٦ سنوات)',
        'الجمع والطرح السلس حتى الرقم ٢٠',
        'كلمات إنجليزية مصورة مع نطق صوتي فوري',
        'خريطة المغامرة الـ ٢٠ مرحلة متدرجة الصعوبة',
        'تحدي الزعماء وجوائز النجوم الذهبية',
      ],
      actionLabel: 'اختيار فئة أبطال حور 👧',
    },
    {
      id: '10_plus',
      nameAr: 'رواد التحدي والعباقرة',
      rangeAr: '١٠ سنوات وأكثر',
      emoji: '🚀',
      bgGradient: 'from-purple-50 to-pink-50/70',
      borderActive: 'border-purple-500 ring-2 ring-purple-300',
      features: [
        'عواصم دول العالم ومعلومات عامة وثقافية وجغرافية وعلمية 🌍',
        'جداول الضرب المتقدمة، الأسس والمربعات، والنسب المئوية ٪',
        'معادلات المجهول الجبرية (2X + 8 = 26) وأولويات العمليات 🧩',
        'مفردات إنجليزية عليا (Civilization, Perseverance, Astronomy)',
        'ترقية الأسلحة الخارقة (ثلاثي وخماسي) بالاستماع للقرآن الكريم ⚡',
      ],
      actionLabel: 'اختيار فئة رواد التحدي 🚀',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-5 sm:p-8 shadow-2xl border-2 border-sky-300 my-auto text-right space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={HOOR_PHOTO_URL}
                alt="حور"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xs"
              />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black shadow-xs">
                ★
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-lg border border-sky-200">
                  تخصيص تجربة التعلّم
                </span>
                <span className="text-xs font-bold text-slate-400">
                  يمكن التبديل في أي وقت من زر الإعدادات
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                اختاري فئتكِ العمرية يا بطلة لبدء المغامرة!
              </h2>
            </div>
          </div>

          {canDismiss && onClose && (
            <button
              type="button"
              onClick={() => {
                soundFX.playWoodTap();
                onClose();
              }}
              className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Informative Subtitle */}
        <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed max-w-3xl">
          تم تصميم اللعبة بمستويات تعليمية ومراحل متكاملة تناسب كل عمر: عدّ الأشكال للصغار، الجمع والطرح للأبطال، والضرب والمعادلات المتقدمة للعباقرة، مع تكييف سرعة الدجاج تلقائياً!
        </p>

        {/* 3 Age Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ageTiers.map((tier) => {
            const isSelected = currentAgeGroup === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => handleSelect(tier.id)}
                className={`rounded-3xl border-2 p-5 bg-gradient-to-b ${
                  tier.bgGradient
                } transition-all cursor-pointer flex flex-col justify-between relative shadow-xs hover:shadow-md hover:-translate-y-1 ${
                  isSelected
                    ? `${tier.borderActive} shadow-md`
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Recommended Badge for Hoor */}
                {tier.recommended && (
                  <div className="absolute -top-3 left-4 bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full border border-amber-500 shadow-2xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>فئة البطلة حور (موصى بها)</span>
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                        {tier.emoji}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                          {tier.nameAr}
                        </h3>
                        <span className="text-xs font-extrabold text-slate-600">
                          {tier.rangeAr}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Feature Bullets */}
                  <ul className="mt-4 space-y-2 text-xs font-bold text-slate-700">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-black shrink-0">✓</span>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Button */}
                <div className="mt-5 pt-3 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(tier.id);
                    }}
                    className={`w-full py-3 px-4 min-h-[46px] rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-slate-950 text-white hover:bg-slate-800'
                        : 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  >
                    <span>{tier.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Footer Advice */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              جميع المسائل والمستويات تعمل بدون إنترنت وبدون أي إعلانات وبدون موسيقى (آمنة تماماً للأطفال).
            </span>
          </div>

          {canDismiss && onClose && (
            <button
              type="button"
              onClick={() => {
                soundFX.playWoodTap();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black cursor-pointer whitespace-nowrap"
            >
              متابعة بالخيار الحالي ({AGE_GROUPS[currentAgeGroup].titleAr})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
