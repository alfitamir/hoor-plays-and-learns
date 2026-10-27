import { DifficultyLevel, EducationalQuestion, QuizOption, SubjectFilter } from '../types/game';

interface EnglishWordEntry {
  word: string;
  arabic: string;
  emoji: string;
  level: DifficultyLevel;
}

const ENGLISH_WORDS: EnglishWordEntry[] = [
  // Easy (3-letter / super familiar words for ages 4-5)
  { word: 'Cat', arabic: 'قطة', emoji: '🐱', level: 'easy' },
  { word: 'Dog', arabic: 'كلب', emoji: '🐶', level: 'easy' },
  { word: 'Sun', arabic: 'شمس', emoji: '☀️', level: 'easy' },
  { word: 'Car', arabic: 'سيارة', emoji: '🚗', level: 'easy' },
  { word: 'Egg', arabic: 'بيضة', emoji: '🥚', level: 'easy' },
  { word: 'Cow', arabic: 'بقرة', emoji: '🐮', level: 'easy' },
  { word: 'Bee', arabic: 'نحلة', emoji: '🐝', level: 'easy' },
  { word: 'Hat', arabic: 'قبعة', emoji: '👒', level: 'easy' },
  { word: 'Bed', arabic: 'سرير', emoji: '🛏️', level: 'easy' },
  { word: 'Bus', arabic: 'حافلة', emoji: '🚌', level: 'easy' },

  // Medium (Age 6 default - familiar everyday words)
  { word: 'Apple', arabic: 'تفاحة', emoji: '🍎', level: 'medium' },
  { word: 'Bird', arabic: 'عصفور', emoji: '🐦', level: 'medium' },
  { word: 'Fish', arabic: 'سمكة', emoji: '🐟', level: 'medium' },
  { word: 'Tree', arabic: 'شجرة', emoji: '🌳', level: 'medium' },
  { word: 'Book', arabic: 'كتاب', emoji: '📖', level: 'medium' },
  { word: 'Star', arabic: 'نجمة', emoji: '⭐', level: 'medium' },
  { word: 'Milk', arabic: 'حليب', emoji: '🥛', level: 'medium' },
  { word: 'Duck', arabic: 'بطة', emoji: '🦆', level: 'medium' },
  { word: 'Ball', arabic: 'كرة', emoji: '⚽', level: 'medium' },
  { word: 'Cake', arabic: 'كعكة', emoji: '🎂', level: 'medium' },

  // Hard (Ages 7-8 - slightly broader vocabulary)
  { word: 'Lion', arabic: 'أسد', emoji: '🦁', level: 'hard' },
  { word: 'Moon', arabic: 'قمر', emoji: '🌙', level: 'hard' },
  { word: 'Frog', arabic: 'ضفدع', emoji: '🐸', level: 'hard' },
  { word: 'Bear', arabic: 'دب', emoji: '🐻', level: 'hard' },
  { word: 'Ship', arabic: 'سفينة', emoji: '🚢', level: 'hard' },
  { word: 'Shoe', arabic: 'حذاء', emoji: '👟', level: 'hard' },
  { word: 'Door', arabic: 'باب', emoji: '🚪', level: 'hard' },
  { word: 'Hand', arabic: 'يد', emoji: '✋', level: 'hard' },
  { word: 'Rain', arabic: 'مطر', emoji: '🌧️', level: 'hard' },
  { word: 'Flower', arabic: 'وردة', emoji: '🌸', level: 'hard' },
];

const COUNTING_EMOJIS = ['🍎', '🍓', '⭐', '🐥', '🎈', '🍊', '🌸', '🐟'];

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

function generateNumericOptions(correct: number, count: number, minVal: number, maxVal: number): QuizOption[] {
  const set = new Set<number>([correct]);
  const offsets = shuffleArray([-2, -1, 1, 2, 3, -3]);
  for (const offset of offsets) {
    if (set.size >= count) break;
    const candidate = correct + offset;
    if (candidate >= minVal && candidate <= maxVal + 2 && candidate !== correct) {
      set.add(candidate);
    }
  }
  while (set.size < count) {
    const fallback = randomInt(minVal, Math.max(maxVal, correct + 3));
    if (fallback !== correct) set.add(fallback);
  }
  return shuffleArray(Array.from(set)).map((num) => ({
    id: `opt-${num}`,
    label: String(num),
    value: num,
  }));
}

function generateAdditionQuestion(difficulty: DifficultyLevel): EducationalQuestion {
  const emoji = COUNTING_EMOJIS[randomInt(0, COUNTING_EMOJIS.length - 1)];
  let a = 1;
  let b = 1;
  let optionCount = 3;
  let maxSum = 10;

  if (difficulty === 'easy') {
    // Sum between 2 and 5
    a = randomInt(1, 3);
    b = randomInt(1, 5 - a);
    optionCount = 2;
    maxSum = 5;
  } else if (difficulty === 'medium') {
    // Sum between 2 and 10 (ideal for 6-year-old)
    a = randomInt(1, 5);
    b = randomInt(1, 5);
    optionCount = 3;
    maxSum = 10;
  } else {
    // Sum up to 18
    a = randomInt(3, 9);
    b = randomInt(2, 9);
    optionCount = 4;
    maxSum = 18;
  }

  const answer = a + b;
  return {
    id: `add-${Date.now()}-${Math.random()}`,
    type: 'addition',
    titleAr: 'سؤال جمع بسيط ➕',
    promptAr: `كم مجموع ${a} زائد ${b} يا حور؟`,
    equationDisplay: `${a} + ${b} = ؟`,
    visualEmoji: emoji,
    countA: a,
    countB: b,
    options: generateNumericOptions(answer, optionCount, 1, maxSum),
    correctValue: answer,
    hintAr: `عدّي الأشكال معاً واحدة تلو الأخرى: ${a} ثم أضيفي إليها ${b}!`,
  };
}

function generateSubtractionQuestion(difficulty: DifficultyLevel): EducationalQuestion {
  const emoji = COUNTING_EMOJIS[randomInt(0, COUNTING_EMOJIS.length - 1)];
  let total = 3;
  let take = 1;
  let optionCount = 3;
  let maxVal = 10;

  if (difficulty === 'easy') {
    // Up to 5
    total = randomInt(2, 5);
    take = randomInt(1, total - 1);
    optionCount = 2;
    maxVal = 5;
  } else if (difficulty === 'medium') {
    // Up to 9 (ideal for 6-year-old)
    total = randomInt(3, 9);
    take = randomInt(1, total - 1);
    optionCount = 3;
    maxVal = 9;
  } else {
    // Up to 15
    total = randomInt(6, 15);
    take = randomInt(2, total - 1);
    optionCount = 4;
    maxVal = 15;
  }

  const answer = total - take;
  return {
    id: `sub-${Date.now()}-${Math.random()}`,
    type: 'subtraction',
    titleAr: 'سؤال طرح بسيط ➖',
    promptAr: `معنا ${total}، أخذنا منها ${take}، كم يتبقى؟`,
    equationDisplay: `${total} - ${take} = ؟`,
    visualEmoji: emoji,
    countA: total,
    countB: take,
    options: generateNumericOptions(answer, optionCount, 0, maxVal),
    correctValue: answer,
    hintAr: `لدينا ${total} أشكال، شطبنا منها ${take}، عدّي الأشكال السليمة المتبقية!`,
  };
}

function generateEnglishQuestion(difficulty: DifficultyLevel): EducationalQuestion {
  const pool =
    difficulty === 'easy'
      ? ENGLISH_WORDS.filter((w) => w.level === 'easy')
      : difficulty === 'medium'
      ? ENGLISH_WORDS.filter((w) => w.level === 'easy' || w.level === 'medium')
      : ENGLISH_WORDS;

  const target = pool[randomInt(0, pool.length - 1)];
  const optionCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

  const distractors = shuffleArray(pool.filter((w) => w.word !== target.word)).slice(0, optionCount - 1);
  const allChoices = shuffleArray([target, ...distractors]);

  // Alternate between matching English Word -> Arabic Picture OR Picture -> English Word
  const askForEnglishWord = Math.random() > 0.45;

  if (askForEnglishWord) {
    return {
      id: `eng-${Date.now()}-${Math.random()}`,
      type: 'english',
      titleAr: 'كلمة إنجليزية بسيطة 🔤',
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
      hintAr: `استمعي لنطق الكلمة بالضغط على زر السماعة 🔊: ${target.word} تعني ${target.arabic}!`,
    };
  }

  return {
    id: `eng-${Date.now()}-${Math.random()}`,
    type: 'english',
    titleAr: 'تعرّفي على الكلمة الإنجليزية 🌟',
    promptAr: `ماذا تعني كلمة (${target.word}) باللغة العربية؟`,
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
    hintAr: `كلمة ${target.word} في الإنجليزية هي ${target.arabic} ${target.emoji}!`,
  };
}

export function generateQuestion(difficulty: DifficultyLevel, subject: SubjectFilter): EducationalQuestion {
  let allowedTypes: ('addition' | 'subtraction' | 'english')[] = ['addition', 'subtraction', 'english'];

  if (subject === 'addition') {
    allowedTypes = ['addition'];
  } else if (subject === 'subtraction') {
    allowedTypes = ['subtraction'];
  } else if (subject === 'math') {
    allowedTypes = ['addition', 'subtraction'];
  } else if (subject === 'english') {
    allowedTypes = ['english'];
  }

  const chosenType = allowedTypes[randomInt(0, allowedTypes.length - 1)];

  if (chosenType === 'addition') {
    return generateAdditionQuestion(difficulty);
  }
  if (chosenType === 'subtraction') {
    return generateSubtractionQuestion(difficulty);
  }
  return generateEnglishQuestion(difficulty);
}
