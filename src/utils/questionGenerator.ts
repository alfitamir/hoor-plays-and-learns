import {
  AgeGroupId,
  DifficultyLevel,
  EducationalQuestion,
  QuizOption,
  SubjectFilter,
} from '../types/game';

interface EnglishWordEntry {
  word: string;
  arabic: string;
  emoji: string;
  ageCategory: AgeGroupId;
}

const ENGLISH_WORDS: EnglishWordEntry[] = [
  // --- Under 5 Years (Toddler / Preschool: 3-4 letters, ultra-simple) ---
  { word: 'Cat', arabic: 'قطة', emoji: '🐱', ageCategory: 'under_5' },
  { word: 'Dog', arabic: 'كلب', emoji: '🐶', ageCategory: 'under_5' },
  { word: 'Sun', arabic: 'شمس', emoji: '☀️', ageCategory: 'under_5' },
  { word: 'Car', arabic: 'سيارة', emoji: '🚗', ageCategory: 'under_5' },
  { word: 'Egg', arabic: 'بيضة', emoji: '🥚', ageCategory: 'under_5' },
  { word: 'Cow', arabic: 'بقرة', emoji: '🐮', ageCategory: 'under_5' },
  { word: 'Bee', arabic: 'نحلة', emoji: '🐝', ageCategory: 'under_5' },
  { word: 'Hat', arabic: 'قبعة', emoji: '👒', ageCategory: 'under_5' },
  { word: 'Bed', arabic: 'سرير', emoji: '🛏️', ageCategory: 'under_5' },
  { word: 'Bus', arabic: 'حافلة', emoji: '🚌', ageCategory: 'under_5' },
  { word: 'Red', arabic: 'أحمر', emoji: '🔴', ageCategory: 'under_5' },
  { word: 'Blue', arabic: 'أزرق', emoji: '🔵', ageCategory: 'under_5' },
  { word: 'One', arabic: 'واحد (١)', emoji: '1️⃣', ageCategory: 'under_5' },
  { word: 'Two', arabic: 'اثنان (٢)', emoji: '2️⃣', ageCategory: 'under_5' },

  // --- 6 to 9 Years (Primary school: everyday foundational words) ---
  { word: 'Apple', arabic: 'تفاحة', emoji: '🍎', ageCategory: '6_to_9' },
  { word: 'Bird', arabic: 'عصفور', emoji: '🐦', ageCategory: '6_to_9' },
  { word: 'Fish', arabic: 'سمكة', emoji: '🐟', ageCategory: '6_to_9' },
  { word: 'Tree', arabic: 'شجرة', emoji: '🌳', ageCategory: '6_to_9' },
  { word: 'Book', arabic: 'كتاب', emoji: '📖', ageCategory: '6_to_9' },
  { word: 'Star', arabic: 'نجمة', emoji: '⭐', ageCategory: '6_to_9' },
  { word: 'Milk', arabic: 'حليب', emoji: '🥛', ageCategory: '6_to_9' },
  { word: 'Duck', arabic: 'بطة', emoji: '🦆', ageCategory: '6_to_9' },
  { word: 'Ball', arabic: 'كرة', emoji: '⚽', ageCategory: '6_to_9' },
  { word: 'Cake', arabic: 'كعكة', emoji: '🎂', ageCategory: '6_to_9' },
  { word: 'Water', arabic: 'ماء', emoji: '💧', ageCategory: '6_to_9' },
  { word: 'House', arabic: 'منزل', emoji: '🏠', ageCategory: '6_to_9' },
  { word: 'School', arabic: 'مدرسة', emoji: '🏫', ageCategory: '6_to_9' },
  { word: 'Friend', arabic: 'صديق', emoji: '🤝', ageCategory: '6_to_9' },
  { word: 'Flower', arabic: 'وردة', emoji: '🌸', ageCategory: '6_to_9' },
  { word: 'Lion', arabic: 'أسد', emoji: '🦁', ageCategory: '6_to_9' },
  { word: 'Moon', arabic: 'قمر', emoji: '🌙', ageCategory: '6_to_9' },
  { word: 'Rain', arabic: 'مطر', emoji: '🌧️', ageCategory: '6_to_9' },

  // --- 10 Years and Older (Advanced vocabulary, science, high-level English) ---
  { word: 'Galaxy', arabic: 'مجرة كونية', emoji: '🌌', ageCategory: '10_plus' },
  { word: 'Discovery', arabic: 'اكتشاف علمي', emoji: '🔬', ageCategory: '10_plus' },
  { word: 'Knowledge', arabic: 'معرفة وعلم', emoji: '📚', ageCategory: '10_plus' },
  { word: 'Universe', arabic: 'الكون الفسيح', emoji: '🪐', ageCategory: '10_plus' },
  { word: 'Journey', arabic: 'رحلة استكشاف', emoji: '🚀', ageCategory: '10_plus' },
  { word: 'Champion', arabic: 'بطل متوج', emoji: '🏆', ageCategory: '10_plus' },
  { word: 'Science', arabic: 'علوم وتجارب', emoji: '🧪', ageCategory: '10_plus' },
  { word: 'Wisdom', arabic: 'حكمة وبصيرة', emoji: '🦉', ageCategory: '10_plus' },
  { word: 'Inspiration', arabic: 'إلهام وإبداع', emoji: '✨', ageCategory: '10_plus' },
  { word: 'Perseverance', arabic: 'إصرار ومثابرة', emoji: '🧗', ageCategory: '10_plus' },
  { word: 'Civilization', arabic: 'حضارة عريقة', emoji: '🏛️', ageCategory: '10_plus' },
  { word: 'Atmosphere', arabic: 'الغلاف الجوي', emoji: '🌍', ageCategory: '10_plus' },
  { word: 'Astronomy', arabic: 'علم الفلك', emoji: '🔭', ageCategory: '10_plus' },
  { word: 'Innovation', arabic: 'ابتكار واختراع', emoji: '💡', ageCategory: '10_plus' },
];

const COUNTING_ITEMS = [
  { emoji: '🍎', nameAr: 'تفاحة' },
  { emoji: '🍓', nameAr: 'فراولة' },
  { emoji: '⭐', nameAr: 'نجمة' },
  { emoji: '🐥', nameAr: 'كتكوت' },
  { emoji: '🎈', nameAr: 'بالون' },
  { emoji: '🍊', nameAr: 'برتقالة' },
  { emoji: '🌸', nameAr: 'وردة' },
  { emoji: '🐟', nameAr: 'سمكة' },
  { emoji: '🚗', nameAr: 'سيارة' },
];

const SHAPES_DATA = [
  { shape: 'دائرة', emoji: '🔴', prompt: 'ما هو هذا الشكل الدائري؟' },
  { shape: 'مربع', emoji: '🟦', prompt: 'ما هو هذا الشكل ذو الأضلاع الأربعة المتساوية؟' },
  { shape: 'مثلث', emoji: '🔺', prompt: 'ما هو هذا الشكل ذو الرؤوس الثلاثة؟' },
  { shape: 'نجمة', emoji: '⭐', prompt: 'ما هو هذا الشكل اللامع في السماء؟' },
  { shape: 'قلب', emoji: '❤️', prompt: 'ما هو هذا الشكل الجميل؟' },
];

// ========================================================
// GENERAL KNOWLEDGE DATABASE (عواصم، جغرافيا، تاريخ وعلوم)
// ========================================================
interface GeneralKnowledgeItem {
  prompt: string;
  correct: string;
  distractors: string[];
  emoji: string;
  hint: string;
}

const GENERAL_KNOWLEDGE_DATA: GeneralKnowledgeItem[] = [
  // --- العواصم العربية والعالمية ---
  {
    prompt: 'ما هي عاصمة جمهورية مصر العربية؟',
    correct: 'القاهرة',
    distractors: ['الإسكندرية', 'الجيزة', 'أسوان'],
    emoji: '🇪🇬',
    hint: 'تُلقّب بمدينة الألف مئذنة وتقع على ضفاف نهر النيل!',
  },
  {
    prompt: 'ما هي عاصمة المملكة العربية السعودية؟',
    correct: 'الرياض',
    distractors: ['جدة', 'الدمام', 'مكة المكرمة'],
    emoji: '🇸🇦',
    hint: 'أكبر مدن المملكة ومركزها التجاري والسياسي في نجد!',
  },
  {
    prompt: 'ما هي عاصمة دولة فلسطين الحبيبة؟',
    correct: 'القدس الشريف',
    distractors: ['غزة', 'رام الله', 'نابلس'],
    emoji: '🇵🇸',
    hint: 'مدينة السلام والمسجد الأقصى المبارك وقبة الصخرة!',
  },
  {
    prompt: 'ما هي عاصمة دولة الإمارات العربية المتحدة؟',
    correct: 'أبوظبي',
    distractors: ['دبي', 'الشارقة', 'عجمان'],
    emoji: '🇦🇪',
    hint: 'عاصمة الاتحاد وتضم جامع الشيخ زايد الكبير!',
  },
  {
    prompt: 'ما هي عاصمة المملكة المغربية؟',
    correct: 'الرباط',
    distractors: ['الدار البيضاء', 'مراكش', 'فاس'],
    emoji: '🇲🇦',
    hint: 'مدينة ساحلية تاريخية تقع على المحيط الأطلسي وتضم صومعة حسان!',
  },
  {
    prompt: 'ما هي عاصمة دولة اليابان؟',
    correct: 'طوكيو',
    distractors: ['كيوتو', 'أوساكا', 'هيروشيما'],
    emoji: '🇯🇵',
    hint: 'تعتبر من أكبر وأحدث المدن التكنولوجية في قارة آسيا!',
  },
  {
    prompt: 'ما هي عاصمة دولة فرنسا؟',
    correct: 'باريس',
    distractors: ['ليون', 'مارسيليا', 'نيس'],
    emoji: '🇫🇷',
    hint: 'تُلقّب بعاصمة النور وتشتهر ببرج إيفل الشهير ومتحف اللوفر!',
  },
  {
    prompt: 'ما هي عاصمة المملكة المتحدة (بريطانيا)؟',
    correct: 'لندن',
    distractors: ['مانشستر', 'ليفربول', 'إدنبرة'],
    emoji: '🇬🇧',
    hint: 'تقع على نهر التايمز وتشتهر ببرج ساعة بيغ بن العريق!',
  },
  {
    prompt: 'ما هي عاصمة الجمهورية التركية؟',
    correct: 'أنقرة',
    distractors: ['إسطنبول', 'إزمير', 'أنطاليا'],
    emoji: '🇹🇷',
    hint: 'المدينة العاصمة في وسط الأناضول وليست إسطنبول الساحلية!',
  },
  {
    prompt: 'ما هي عاصمة جمهورية ألمانيا الاتحادية؟',
    correct: 'برلين',
    distractors: ['ميونخ', 'فرانكفورت', 'هامبورغ'],
    emoji: '🇩🇪',
    hint: 'المدينة العاصمة التي تشتهر ببوابة براندنبورغ التاريخية!',
  },
  {
    prompt: 'ما هي عاصمة دولة إيطاليا؟',
    correct: 'روما',
    distractors: ['ميلانو', 'البندقية', 'فلورنسا'],
    emoji: '🇮🇹',
    hint: 'المدينة الخالدة التي تضم مدرج الكولوسيوم الشهير!',
  },
  {
    prompt: 'ما هي عاصمة جمهورية الصين الشعبية؟',
    correct: 'بكين',
    distractors: ['شنغهاي', 'قوانغتشو', 'شينزين'],
    emoji: '🇨🇳',
    hint: 'تضم المدينة المحرمة وتقع بالقرب من سور الصين العظيم!',
  },
  {
    prompt: 'ما هي عاصمة المملكة الأردنية الهاشمية؟',
    correct: 'عمّان',
    distractors: ['إربد', 'العقبة', 'الزرقاء'],
    emoji: '🇯🇴',
    hint: 'المدينة المبنية على الجبال وتضم جبل القلعة والمدرج الروماني!',
  },
  {
    prompt: 'ما هي عاصمة دولة الكويت؟',
    correct: 'مدينة الكويت',
    distractors: ['الأحمدي', 'الجهراء', 'حولي'],
    emoji: '🇰🇼',
    hint: 'تطل على الخليج العربي وتشتهر بأبراج الكويت المعمارية!',
  },
  {
    prompt: 'ما هي عاصمة دولة قطر؟',
    correct: 'الدوحة',
    distractors: ['الريان', 'الوكرة', 'الخور'],
    emoji: '🇶🇦',
    hint: 'المدينة الساحلية الأنيقة التي استضافت كأس العالم ٢٠٢٢!',
  },
  {
    prompt: 'ما هي عاصمة سلطنة عُمان؟',
    correct: 'مسقط',
    distractors: ['صلالة', 'نزوى', 'صحار'],
    emoji: '🇴🇲',
    hint: 'تطل على بحر عُمان وتضم دار الأوبرا السلطانية وجامع السلطان قابوس!',
  },
  {
    prompt: 'ما هي عاصمة جمهورية العراق؟',
    correct: 'بغداد',
    distractors: ['البصرة', 'الموصل', 'أربيل'],
    emoji: '🇮🇶',
    hint: 'عاصمة الرشيد ومدينة السلام التاريخية على ضفاف نهر دجلة!',
  },
  {
    prompt: 'ما هي عاصمة دولة كندا؟',
    correct: 'أوتاوا',
    distractors: ['تورونتو', 'فانكوفر', 'مونتريال'],
    emoji: '🇨🇦',
    hint: 'العاصمة الفيدرالية في مقاطعة أونتاريو وليست تورونتو!',
  },
  {
    prompt: 'ما هي عاصمة دولة أستراليا؟',
    correct: 'كانبرا',
    distractors: ['سيدني', 'ملبورن', 'بيرث'],
    emoji: '🇦🇺',
    hint: 'العاصمة الرسمية المخططة بدقة وليست مدينة دار الأوبرا سيدني!',
  },
  {
    prompt: 'ما هي عاصمة المملكة الإسبانية؟',
    correct: 'مدريد',
    distractors: ['برشلونة', 'إشبيلية', 'فالنسيا'],
    emoji: '🇪🇸',
    hint: 'المدينة الواقعة في قلب إسبانيا وتضم القصر الملكي الفخم!',
  },

  // --- جغرافيا الأرض وعجائب الطبيعة ---
  {
    prompt: 'ما هو أطول نهر في العالم؟',
    correct: 'نهر النيل',
    distractors: ['نهر الأمازون', 'نهر الدانوب', 'نهر الفرات'],
    emoji: '🌊',
    hint: 'شريان الحياة الذي يمتد عبر قارة إفريقيا ويمر بمصر والسودان!',
  },
  {
    prompt: 'ما هو أكبر محيط في كوكب الأرض من حيث المساحة؟',
    correct: 'المحيط الهادئ',
    distractors: ['المحيط الأطلسي', 'المحيط الهندي', 'المحيط المتجمد'],
    emoji: '🌊',
    hint: 'يغطي أكثر من ثلث مساحة الكرة الأرضية بالكامل!',
  },
  {
    prompt: 'ما هي أعلى قمة جبلية على وجه الأرض؟',
    correct: 'قمة إيفرست',
    distractors: ['جبل كليمنجارو', 'جبل فوجي', 'جبل الألب'],
    emoji: '🏔️',
    hint: 'تقع في سلسلة جبال الهيمالايا ويبلغ ارتفاعها ٨٨٤٨ متراً!',
  },
  {
    prompt: 'ما هي أكبر قارات العالم مساحةً وأكثرها سكاناً؟',
    correct: 'قارة آسيا',
    distractors: ['قارة إفريقيا', 'قارة أوروبا', 'قارة أمريكا الشمالية'],
    emoji: '🌏',
    hint: 'تضم الصين والهند واليابان وأغلب دول الشرق الأوسط!',
  },
  {
    prompt: 'كم عدد قارات الكرة الأرضية المعترف بها عالمياً؟',
    correct: '٧ قارات',
    distractors: ['٥ قارات', '٦ قارات', '٨ قارات'],
    emoji: '🗺️',
    hint: 'آسيا، إفريقيا، أوروبا، أمريكا الشمالية، أمريكا الجنوبية، أستراليا، القارة القطبية!',
  },

  // --- الفلك والعلوم والعلماء المسلمون ---
  {
    prompt: 'ما هو أكبر كواكب مجموعتنا الشمسية حجماً؟',
    correct: 'كوكب المشتري',
    distractors: ['كوكب زحل', 'كوكب المريخ', 'كوكب الأرض'],
    emoji: '🪐',
    hint: 'العملاق الغازي الضخم ذو البقعة الحمراء الكبرى!',
  },
  {
    prompt: 'ما هو الكوكب الملقب بـ (الكوكب الأحمر) بسبب وفرة أكسيد الحديد في تربته؟',
    correct: 'كوكب المريخ',
    distractors: ['كوكب الزهرة', 'كوكب عطارد', 'كوكب نبتون'],
    emoji: '🔴',
    hint: 'الكوكب الرابع بعداً عن الشمس والذي يرسل العلماء إليه مركبات استكشاف!',
  },
  {
    prompt: 'ما هو أقرب كوكب إلى الشمس في المجموعة الشمسية؟',
    correct: 'كوكب عطارد',
    distractors: ['كوكب الزهرة', 'كوكب الأرض', 'كوكب المريخ'],
    emoji: '☀️',
    hint: 'أصغر الكواكب وأسرعها دوراناً حول الشمس!',
  },
  {
    prompt: 'ما هو أسرع حيوان بري على اليابسة في الجري؟',
    correct: 'الفهد الصياد (الشيتا)',
    distractors: ['الأسد', 'الغزال السريع', 'الحصان العربي'],
    emoji: '🐆',
    hint: 'يستطيع الانطلاق بسرعة تتجاوز ١٠٠ كم في الساعة خلال ثوانٍ!',
  },
  {
    prompt: 'ما هو أكبر عضو في جسم الإنسان من حيث المساحة؟',
    correct: 'الجلد',
    distractors: ['الكبد', 'الرئتان', 'القلب'],
    emoji: '🩺',
    hint: 'يغطي كامل الجسم ويحميه من الجراثيم وينظم درجة الحرارة!',
  },
  {
    prompt: 'من هو العالم العربي المسلم العبقري الذي أسس علم الجبر؟',
    correct: 'محمد بن موسى الخوارزمي',
    distractors: ['ابن سينا', 'ابن الهيثم', 'جابر بن حيان'],
    emoji: '📜',
    hint: 'اشتُقت من اسمه كلمة Algorithm (الخوارزميات) المستخدمة في كل برامج الكمبيوتر!',
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNumericOptions(
  correct: number,
  count: number,
  minVal: number,
  maxVal: number
): QuizOption[] {
  const set = new Set<number>([correct]);
  const offsets = shuffleArray([-1, 1, -2, 2, -3, 3, 5, -5, 10, -10]);
  for (const offset of offsets) {
    if (set.size >= count) break;
    const candidate = correct + offset;
    if (candidate >= minVal && candidate <= maxVal + 4 && candidate !== correct) {
      set.add(candidate);
    }
  }
  while (set.size < count) {
    const fallback = randomInt(minVal, Math.max(maxVal, correct + 5));
    if (fallback !== correct) set.add(fallback);
  }
  return shuffleArray(Array.from(set)).map((num) => ({
    id: `opt-${num}`,
    label: String(num),
    value: num,
  }));
}

// ========================================================
// 1. UNDER 5 YEARS GENERATORS (براعم الصغار 🐣)
// ========================================================

function generateUnder5CountingQuestion(): EducationalQuestion {
  const item = COUNTING_ITEMS[randomInt(0, COUNTING_ITEMS.length - 1)];
  const count = randomInt(1, 5); // Counting between 1 and 5
  const options = generateNumericOptions(count, 3, 1, 5);

  return {
    id: `count-${Date.now()}-${Math.random()}`,
    type: 'counting',
    ageGroup: 'under_5',
    titleAr: 'عدّ الأشكال اللطيفة 🐣',
    promptAr: `كم ${item.nameAr} ترينا في الصورة يا بطل؟`,
    visualEmoji: item.emoji,
    countA: count,
    options,
    correctValue: count,
    hintAr: `ضعي إصبعكِ الصغير على كل ${item.nameAr} وعُدّي بهدوء: واحد، اثنان...`,
  };
}

function generateUnder5ShapeQuestion(): EducationalQuestion {
  const target = SHAPES_DATA[randomInt(0, SHAPES_DATA.length - 1)];
  const distractors = shuffleArray(SHAPES_DATA.filter((s) => s.shape !== target.shape)).slice(0, 2);
  const choices = shuffleArray([target, ...distractors]);

  return {
    id: `shape-${Date.now()}-${Math.random()}`,
    type: 'shapes',
    ageGroup: 'under_5',
    titleAr: 'تعلّمي الأشكال الجميلة 🎨',
    promptAr: target.prompt,
    visualEmoji: target.emoji,
    options: choices.map((c) => ({
      id: `shape-${c.shape}`,
      label: c.shape,
      emoji: c.emoji,
      value: c.shape,
    })),
    correctValue: target.shape,
    hintAr: `انظري إلى الشكل ${target.emoji}، هل هو دائرة أم مثلث أم مربع؟`,
  };
}

function generateUnder5AdditionQuestion(): EducationalQuestion {
  const item = COUNTING_ITEMS[randomInt(0, COUNTING_ITEMS.length - 1)];
  const a = randomInt(1, 2);
  const b = randomInt(1, 2);
  const answer = a + b;
  const options = generateNumericOptions(answer, 2, 1, 5);

  return {
    id: `u5-add-${Date.now()}-${Math.random()}`,
    type: 'addition',
    ageGroup: 'under_5',
    titleAr: 'جمع بسيط بالصور ➕',
    promptAr: `معنا ${a} ${item.nameAr}، وأضفنا إليها ${b}، كم يصبح العدد؟`,
    equationDisplay: `${a} + ${b} = ؟`,
    visualEmoji: item.emoji,
    countA: a,
    countB: b,
    options,
    correctValue: answer,
    hintAr: `عدّي كل ${item.emoji} معاً لمعرفة الناتج!`,
  };
}

// ========================================================
// 2. 6 TO 9 YEARS GENERATORS (أبطال حور 👧⭐)
// ========================================================

function generate6to9AdditionQuestion(difficulty: DifficultyLevel): EducationalQuestion {
  const item = COUNTING_ITEMS[randomInt(0, COUNTING_ITEMS.length - 1)];
  let a = 3;
  let b = 2;
  let maxVal = 10;
  let optCount = 3;

  if (difficulty === 'easy') {
    a = randomInt(1, 5);
    b = randomInt(1, 5);
    maxVal = 10;
    optCount = 3;
  } else if (difficulty === 'medium') {
    a = randomInt(3, 9);
    b = randomInt(3, 9);
    maxVal = 18;
    optCount = 4;
  } else {
    a = randomInt(6, 12);
    b = randomInt(5, 12);
    maxVal = 24;
    optCount = 4;
  }

  const answer = a + b;
  return {
    id: `add-${Date.now()}-${Math.random()}`,
    type: 'addition',
    ageGroup: '6_to_9',
    titleAr: 'مسألة جمع للأذكياء ➕',
    promptAr: `كم مجموع ${a} زائد ${b} يا حور؟`,
    equationDisplay: `${a} + ${b} = ؟`,
    visualEmoji: item.emoji,
    countA: a,
    countB: b,
    options: generateNumericOptions(answer, optCount, 1, maxVal),
    correctValue: answer,
    hintAr: `أضيفي ${b} إلى ${a} للوصول إلى الناتج الصحيح!`,
  };
}

function generate6to9SubtractionQuestion(difficulty: DifficultyLevel): EducationalQuestion {
  const item = COUNTING_ITEMS[randomInt(0, COUNTING_ITEMS.length - 1)];
  let total = 8;
  let take = 3;
  let maxVal = 10;
  let optCount = 3;

  if (difficulty === 'easy') {
    total = randomInt(3, 8);
    take = randomInt(1, total - 1);
    maxVal = 8;
    optCount = 3;
  } else if (difficulty === 'medium') {
    total = randomInt(6, 14);
    take = randomInt(2, total - 1);
    maxVal = 14;
    optCount = 4;
  } else {
    total = randomInt(10, 20);
    take = randomInt(3, total - 2);
    maxVal = 20;
    optCount = 4;
  }

  const answer = total - take;
  return {
    id: `sub-${Date.now()}-${Math.random()}`,
    type: 'subtraction',
    ageGroup: '6_to_9',
    titleAr: 'مسألة طرح للأذكياء ➖',
    promptAr: `لدينا ${total}، أخذنا منها ${take}، كم المتبقي؟`,
    equationDisplay: `${total} - ${take} = ؟`,
    visualEmoji: item.emoji,
    countA: total,
    countB: take,
    options: generateNumericOptions(answer, optCount, 0, maxVal),
    correctValue: answer,
    hintAr: `اطرحي ${take} من ${total}!`,
  };
}

// ========================================================
// 3. 10 YEARS AND OLDER GENERATORS (رواد التحدي والعباقرة 🚀🧠 - مستويات صعبة)
// ========================================================

// HARD MULTIPLICATION (Double-digit and high tables: 14x6, 15x5, 12x9, 25x4, 13x7)
function generate10PlusMultiplicationQuestion(difficulty: DifficultyLevel): EducationalQuestion {
  let a: number;
  let b: number;

  if (difficulty === 'hard') {
    // Challenging multi-digit products
    const pairs = [
      [14, 6],
      [15, 5],
      [12, 9],
      [16, 4],
      [25, 4],
      [13, 7],
      [18, 3],
      [15, 8],
      [16, 6],
      [20, 5],
      [12, 12],
      [14, 7],
    ];
    const chosen = pairs[randomInt(0, pairs.length - 1)];
    a = chosen[0];
    b = chosen[1];
  } else {
    // Tables 7 through 12
    a = randomInt(6, 12);
    b = randomInt(6, 12);
  }

  const answer = a * b;
  return {
    id: `mult-${Date.now()}-${Math.random()}`,
    type: 'multiplication',
    ageGroup: '10_plus',
    titleAr: 'جدول الضرب والتحدي الحسابي ✖️',
    promptAr: `احسبي ناتج ضرب: ${a} × ${b}`,
    equationDisplay: `${a} × ${b} = ؟`,
    visualEmoji: '⚡',
    options: generateNumericOptions(answer, 4, 20, a * b + 25),
    correctValue: answer,
    hintAr: `تذكري: يمكنكِ تبسيط الضرب؛ مثلاً (${a} × ${b}) = (${Math.floor(a / 2)} × ${b * 2})!`,
  };
}

// HARD DIVISION (Large numbers: 96 / 8, 108 / 9, 144 / 12, 84 / 7)
function generate10PlusDivisionQuestion(): EducationalQuestion {
  const pairs = [
    [96, 8, 12],
    [108, 9, 12],
    [144, 12, 12],
    [84, 7, 12],
    [75, 5, 15],
    [90, 6, 15],
    [72, 6, 12],
    [112, 8, 14],
    [120, 8, 15],
    [81, 9, 9],
    [64, 4, 16],
    [98, 7, 14],
  ];
  const chosen = pairs[randomInt(0, pairs.length - 1)];
  const dividend = chosen[0];
  const divisor = chosen[1];
  const quotient = chosen[2];

  return {
    id: `div-${Date.now()}-${Math.random()}`,
    type: 'division',
    ageGroup: '10_plus',
    titleAr: 'قسمة الأذكياء المتقدمة ➗',
    promptAr: `ما هو ناتج قسمة ${dividend} على ${divisor}؟`,
    equationDisplay: `${dividend} ÷ ${divisor} = ؟`,
    visualEmoji: '💡',
    options: generateNumericOptions(quotient, 4, 5, 25),
    correctValue: quotient,
    hintAr: `فكّري: ما هو العدد الذي إذا ضُرب في ${divisor} كان الناتج ${dividend}؟`,
  };
}

// SQUARES & POWERS (الأسس ومربعات الأعداد: 7^2, 8^2, 11^2, 12^2, 5^3)
function generate10PlusPowersQuestion(): EducationalQuestion {
  const powers = [
    { base: 7, exp: 2, ans: 49 },
    { base: 8, exp: 2, ans: 64 },
    { base: 9, exp: 2, ans: 81 },
    { base: 11, exp: 2, ans: 121 },
    { base: 12, exp: 2, ans: 144 },
    { base: 13, exp: 2, ans: 169 },
    { base: 15, exp: 2, ans: 225 },
    { base: 5, exp: 3, ans: 125 },
    { base: 2, exp: 5, ans: 32 },
    { base: 3, exp: 3, ans: 27 },
    { base: 4, exp: 3, ans: 64 },
    { base: 10, exp: 3, ans: 1000 },
  ];
  const item = powers[randomInt(0, powers.length - 1)];

  return {
    id: `pow-${Date.now()}-${Math.random()}`,
    type: 'powers',
    ageGroup: '10_plus',
    titleAr: 'تحدي الأسس والمربعات ⚡',
    promptAr: `ما هي قيمة ${item.base} أس ${item.exp} (${item.base}^${item.exp})؟`,
    equationDisplay: `${item.base}^${item.exp} = ؟`,
    visualEmoji: '🔥',
    options: generateNumericOptions(item.ans, 4, 20, item.ans + 35),
    correctValue: item.ans,
    hintAr: `الأس يعني ضرب العدد في نفسه: ${item.base} مكررة بالضرب ${item.exp} مرات!`,
  };
}

// PERCENTAGES (النسب المئوية الذكية: 50%, 25%, 20%, 10%, 75%)
function generate10PlusPercentagesQuestion(): EducationalQuestion {
  const items = [
    { pct: 50, num: 160, ans: 80 },
    { pct: 25, num: 120, ans: 30 },
    { pct: 10, num: 450, ans: 45 },
    { pct: 20, num: 200, ans: 40 },
    { pct: 75, num: 40, ans: 30 },
    { pct: 50, num: 240, ans: 120 },
    { pct: 25, num: 80, ans: 20 },
    { pct: 10, num: 320, ans: 32 },
    { pct: 20, num: 150, ans: 30 },
  ];
  const item = items[randomInt(0, items.length - 1)];

  return {
    id: `pct-${Date.now()}-${Math.random()}`,
    type: 'percentages',
    ageGroup: '10_plus',
    titleAr: 'حساب النسب المئوية ٪',
    promptAr: `احسبي نسبة (${item.pct}٪) من العدد ${item.num}:`,
    equationDisplay: `${item.pct}% × ${item.num} = ؟`,
    visualEmoji: '📊',
    options: generateNumericOptions(item.ans, 4, 10, item.ans + 30),
    correctValue: item.ans,
    hintAr:
      item.pct === 50
        ? '٥٠٪ تعني نصف العدد تماماً!'
        : item.pct === 25
        ? '٢٥٪ تعني ربع العدد (اقسمي على ٤)!'
        : item.pct === 10
        ? '١٠٪ تعني قسمة العدد على ١٠!'
        : `احسبي (${item.pct} ÷ ١٠٠) × ${item.num}!`,
  };
}

// 2-STEP ALGEBRAIC EQUATIONS & ORDER OF OPERATIONS (2X + 8 = 26, 3X - 5 = 25, 4X + 12 = 44)
function generate10PlusEquationQuestion(): EducationalQuestion {
  const kind = randomInt(1, 4);

  if (kind === 1) {
    // 2X + a = b => 2X = b - a => X = (b - a)/2
    const x = randomInt(4, 15);
    const a = randomInt(6, 20);
    const b = 2 * x + a;
    return {
      id: `eq-${Date.now()}-${Math.random()}`,
      type: 'equation',
      ageGroup: '10_plus',
      titleAr: 'معادلة جبرية من خطوتين (X) 🧩',
      promptAr: `أوجدي قيمة المجهول (X) في المعادلة:`,
      equationDisplay: `2X + ${a} = ${b}`,
      visualEmoji: '🔍',
      options: generateNumericOptions(x, 4, 1, 20),
      correctValue: x,
      hintAr: `أولاً: اطرحي ${a} من ${b} فيصبح (2X = ${b - a})، ثم اقسمي على ٢ للحصول على X!`,
    };
  }

  if (kind === 2) {
    // 3X - a = b => 3X = b + a => X = (b + a)/3
    const x = randomInt(4, 12);
    const a = randomInt(3, 15);
    const b = 3 * x - a;
    return {
      id: `eq-${Date.now()}-${Math.random()}`,
      type: 'equation',
      ageGroup: '10_plus',
      titleAr: 'معادلة المجهول الذكية (X) 🧩',
      promptAr: `ما هي قيمة X التي تحقق المعادلة:`,
      equationDisplay: `3X - ${a} = ${b}`,
      visualEmoji: '🎯',
      options: generateNumericOptions(x, 4, 1, 18),
      correctValue: x,
      hintAr: `انقلي -${a} للطرف الآخر بالزائد: (3X = ${b + a})، ثم اقسمي الناتج على ٣!`,
    };
  }

  if (kind === 3) {
    // 4X + a = b
    const x = randomInt(3, 10);
    const a = randomInt(4, 16);
    const b = 4 * x + a;
    return {
      id: `eq-${Date.now()}-${Math.random()}`,
      type: 'equation',
      ageGroup: '10_plus',
      titleAr: 'معادلة الضرب والجمع (X) 🧩',
      promptAr: `أوجدي قيمة X:`,
      equationDisplay: `4X + ${a} = ${b}`,
      visualEmoji: '🧠',
      options: generateNumericOptions(x, 4, 1, 15),
      correctValue: x,
      hintAr: `4X = (${b} - ${a} = ${b - a})، إذن X = (${b - a} ÷ ٤)!`,
    };
  }

  // Multi-term Order of Operations: a + b * c - d
  const a = randomInt(4, 12);
  const b = randomInt(3, 8);
  const c = randomInt(3, 6);
  const d = randomInt(2, 10);
  const answer = a + b * c - d;
  return {
    id: `eq-${Date.now()}-${Math.random()}`,
    type: 'equation',
    ageGroup: '10_plus',
    titleAr: 'أولويات العمليات الحسابية المتعددة ⚡',
    promptAr: `تذكري: الضرب يتم أولاً! ما ناتج التعبير التالي:`,
    equationDisplay: `${a} + (${b} × ${c}) - ${d} = ؟`,
    visualEmoji: '🚀',
    options: generateNumericOptions(answer, 4, 10, answer + 20),
    correctValue: answer,
    hintAr: `احسبي الضرب أولاً (${b} × ${c} = ${b * c})، ثم اجمعي ${a} واطرحي ${d}!`,
  };
}

// ========================================================
// 4. GENERAL KNOWLEDGE QUESTIONS (عواصم، جغرافيا، تاريخ وعلوم)
// ========================================================
function generateGeneralKnowledgeQuestion(): EducationalQuestion {
  const item = GENERAL_KNOWLEDGE_DATA[randomInt(0, GENERAL_KNOWLEDGE_DATA.length - 1)];
  const allChoices = shuffleArray([item.correct, ...item.distractors.slice(0, 3)]);

  return {
    id: `gk-${Date.now()}-${Math.random()}`,
    type: 'general_knowledge',
    ageGroup: '10_plus',
    titleAr: 'ثقافة ومعلومات عامة وعواصم 🌍',
    promptAr: item.prompt,
    visualEmoji: item.emoji,
    options: allChoices.map((choice) => ({
      id: `gk-opt-${choice}`,
      label: choice,
      value: choice,
    })),
    correctValue: item.correct,
    hintAr: item.hint,
  };
}

// ========================================================
// 5. ENGLISH QUESTION GENERATOR (Tailored per Age Group)
// ========================================================

function generateEnglishQuestion(ageGroup: AgeGroupId): EducationalQuestion {
  const pool = ENGLISH_WORDS.filter((w) => w.ageCategory === ageGroup);
  const target = pool[randomInt(0, pool.length - 1)] || ENGLISH_WORDS[0];
  const optionCount = ageGroup === 'under_5' ? 2 : ageGroup === '6_to_9' ? 3 : 4;

  const distractors = shuffleArray(pool.filter((w) => w.word !== target.word)).slice(
    0,
    optionCount - 1
  );
  const allChoices = shuffleArray([target, ...distractors]);

  const askForEnglishWord = Math.random() > 0.45;

  if (askForEnglishWord) {
    return {
      id: `eng-${Date.now()}-${Math.random()}`,
      type: 'english',
      ageGroup,
      titleAr:
        ageGroup === 'under_5'
          ? 'كلمة إنجليزية للأطفال 🔤'
          : ageGroup === '10_plus'
          ? 'مفردات إنجليزية عليا 🌐'
          : 'كلمة إنجليزية ممتعة 🔤',
      promptAr: `ما هي الكلمة الإنجليزية لـ (${target.arabic})؟`,
      englishWord: target.word,
      arabicMeaning: target.arabic,
      visualEmoji: target.emoji,
      options: allChoices.map((item) => ({
        id: `opt-${item.word}`,
        label: item.word,
        subLabel: item.arabic,
        emoji: item.emoji,
        value: item.word,
      })),
      correctValue: target.word,
      hintAr: `استمعي لنطق الكلمة بالضغط على زر السماعة 🔊: (${target.word}) تعني ${target.arabic}!`,
    };
  }

  return {
    id: `eng-${Date.now()}-${Math.random()}`,
    type: 'english',
    ageGroup,
    titleAr:
      ageGroup === 'under_5'
        ? 'تعرّفي على الكلمة 🌟'
        : ageGroup === '10_plus'
        ? 'الترجمة والمعنى المتقدم 🌟'
        : 'تعرّفي على الكلمة الإنجليزية 🌟',
    promptAr: `ماذا تعني كلمة (${target.word}) في اللغة العربية؟`,
    englishWord: target.word,
    arabicMeaning: target.arabic,
    visualEmoji: target.emoji,
    options: allChoices.map((item) => ({
      id: `opt-${item.word}`,
      label: item.arabic,
      emoji: item.emoji,
      value: item.word,
    })),
    correctValue: target.word,
    hintAr: `كلمة (${target.word}) تعني ${target.arabic} ${target.emoji}!`,
  };
}

// ========================================================
// 6. MASTER QUESTION GENERATOR ROUTER
// ========================================================

export function generateQuestion(
  difficulty: DifficultyLevel,
  subject: SubjectFilter,
  ageGroup: AgeGroupId = '6_to_9'
): EducationalQuestion {
  // ROUTE 1: UNDER 5 YEARS OLD
  if (ageGroup === 'under_5') {
    if (subject === 'english') {
      return generateEnglishQuestion('under_5');
    }
    if (subject === 'addition' || subject === 'math') {
      return Math.random() > 0.4 ? generateUnder5AdditionQuestion() : generateUnder5CountingQuestion();
    }
    // Default mix for toddlers: Counting, Shapes, Simple addition, Early English
    const roll = Math.random();
    if (roll < 0.35) return generateUnder5CountingQuestion();
    if (roll < 0.60) return generateUnder5ShapeQuestion();
    if (roll < 0.80) return generateUnder5AdditionQuestion();
    return generateEnglishQuestion('under_5');
  }

  // ROUTE 2: 10 YEARS AND OLDER (Harder, General Knowledge, Powers, Percentages, Algebra)
  if (ageGroup === '10_plus') {
    if (subject === 'general_knowledge') {
      return generateGeneralKnowledgeQuestion();
    }
    if (subject === 'english') {
      return generateEnglishQuestion('10_plus');
    }
    if (subject === 'multiplication') {
      return generate10PlusMultiplicationQuestion(difficulty);
    }
    if (subject === 'advanced_math') {
      const roll = Math.random();
      if (roll < 0.25) return generate10PlusMultiplicationQuestion(difficulty);
      if (roll < 0.50) return generate10PlusDivisionQuestion();
      if (roll < 0.75) return generate10PlusPowersQuestion();
      return generate10PlusEquationQuestion();
    }

    // Default 'all' subject mix for 10+:
    // General Knowledge (30%), Multiplication/Division/Powers (35%), Equations (20%), Advanced English (15%)
    const roll = Math.random();
    if (roll < 0.30) {
      return generateGeneralKnowledgeQuestion();
    }
    if (roll < 0.52) {
      return Math.random() > 0.5
        ? generate10PlusMultiplicationQuestion(difficulty)
        : generate10PlusDivisionQuestion();
    }
    if (roll < 0.72) {
      return Math.random() > 0.5
        ? generate10PlusPowersQuestion()
        : generate10PlusPercentagesQuestion();
    }
    if (roll < 0.86) {
      return generate10PlusEquationQuestion();
    }
    return generateEnglishQuestion('10_plus');
  }

  // ROUTE 3: 6 TO 9 YEARS OLD (Default Hoor Tier)
  if (subject === 'english') {
    return generateEnglishQuestion('6_to_9');
  }
  if (subject === 'addition') {
    return generate6to9AdditionQuestion(difficulty);
  }
  if (subject === 'subtraction') {
    return generate6to9SubtractionQuestion(difficulty);
  }
  if (subject === 'math') {
    return Math.random() > 0.5
      ? generate6to9AdditionQuestion(difficulty)
      : generate6to9SubtractionQuestion(difficulty);
  }

  // Subject is 'all'
  const roll = Math.random();
  if (roll < 0.40) return generate6to9AdditionQuestion(difficulty);
  if (roll < 0.75) return generate6to9SubtractionQuestion(difficulty);
  return generateEnglishQuestion('6_to_9');
}
