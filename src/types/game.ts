export const HOOR_PHOTO_URL = '/assets/aistudio/10160185010238213_11fa6234.jpg';
declare const __APP_VERSION__: string;
export const APP_VERSION = __APP_VERSION__;

export type AgeGroupId = 'under_5' | '6_to_9' | '10_plus';

export interface AgeGroupInfo {
  id: AgeGroupId;
  titleAr: string;
  badgeAr: string;
  ageRangeAr: string;
  descriptionAr: string;
  icon: string;
  colorTheme: string;
  defaultSpeedMultiplier: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type SubjectFilter =
  | 'all'
  | 'addition'
  | 'subtraction'
  | 'math'
  | 'english'
  | 'multiplication'
  | 'advanced_math'
  | 'general_knowledge';

export type GameSpeed = 'slow' | 'normal' | 'fast';

export interface GameSettings {
  ageGroup: AgeGroupId;
  difficulty: DifficultyLevel;
  subject: SubjectFilter;
  gameSpeed: GameSpeed;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  visualHelpers: boolean;
}

export type BiomeId = 'farm' | 'meadow' | 'sky' | 'castle';

export type FormationPattern = 'rows' | 'wave' | 'circle' | 'v_flock' | 'boss';

export interface LevelConfig {
  id: number;
  titleAr: string;
  subtitleAr: string;
  biome: BiomeId;
  biomeNameAr: string;
  targetChickens: number;
  waveSize: number;
  speedMultiplier: number;
  eggDropRate: number;
  pattern: FormationPattern;
  isBoss?: boolean;
  mapX: number; // Percentage 15..85 for winding path
}

export interface QuizOption {
  id: string;
  label: string;
  subLabel?: string;
  emoji?: string;
  value: string | number;
}

export interface EducationalQuestion {
  id: string;
  type:
    | 'addition'
    | 'subtraction'
    | 'english'
    | 'counting'
    | 'shapes'
    | 'multiplication'
    | 'division'
    | 'equation'
    | 'general_knowledge'
    | 'powers'
    | 'percentages';
  ageGroup?: AgeGroupId;
  titleAr: string;
  promptAr: string;
  equationDisplay?: string;
  englishWord?: string;
  arabicMeaning?: string;
  visualEmoji: string;
  countA?: number;
  countB?: number;
  options: QuizOption[];
  correctValue: string | number;
  hintAr: string;
}

export interface WeaponConfig {
  level: number;
  nameAr: string;
  subtitleAr: string;
  icon: string;
  damage: number;
  projectileCount: number;
  projectileColor: string;
  speed: number;
}

export const WEAPON_TIERS: Record<number, WeaponConfig> = {
  1: {
    level: 1,
    nameAr: 'ذرة المزرعة الفردية',
    subtitleAr: 'السلاح الكلاسيكي البسيط',
    icon: '🌽',
    damage: 1,
    projectileCount: 1,
    projectileColor: '#facc15',
    speed: 10,
  },
  2: {
    level: 2,
    nameAr: 'سلاح النور الذهبي المزدوج',
    subtitleAr: 'قذيفتان متوازيتان بسرعة عالية وضربة مضاعفة',
    icon: '⚡',
    damage: 2,
    projectileCount: 2,
    projectileColor: '#f59e0b',
    speed: 12,
  },
  3: {
    level: 3,
    nameAr: 'سلاح بركة القرآن الخارق (إطلاق ثلاثي)',
    subtitleAr: '٣ قذائف متفرعة بزاوية واسعة تكتسح الأسراب!',
    icon: '🌟',
    damage: 2,
    projectileCount: 3,
    projectileColor: '#10b981',
    speed: 13,
  },
  4: {
    level: 4,
    nameAr: 'صاعقة النجوم والشهب الأسطورية (إطلاق خماسي)',
    subtitleAr: '٥ قذائف برّاقة خارقة تطير بسرعة خارقة!',
    icon: '👑',
    damage: 3,
    projectileCount: 5,
    projectileColor: '#a855f7',
    speed: 15,
  },
};

export const AGE_GROUPS: Record<AgeGroupId, AgeGroupInfo> = {
  under_5: {
    id: 'under_5',
    titleAr: 'براعم الصغار 🐣',
    badgeAr: 'تحت ٥ سنوات',
    ageRangeAr: '٣ - ٥ سنوات',
    descriptionAr: 'عدّ الفواكه والألعاب، الأشكال والألوان، جمع مبسط جداً، كلمات إنجليزية سهلة مصورة، ومراحل هادئة وسلسة.',
    icon: '🐣',
    colorTheme: 'from-amber-400 to-orange-400 text-amber-950',
    defaultSpeedMultiplier: 0.55,
  },
  '6_to_9': {
    id: '6_to_9',
    titleAr: 'أبطال حور الأذكياء 👧⭐',
    badgeAr: '٦ إلى ٩ سنوات',
    ageRangeAr: '٦ - ٩ سنوات',
    descriptionAr: 'الفئة الأصلية للبطلة حور: الجمع والطرح حتى ٢٠، كلمات إنجليزية حيوية، سرعة لعب متوازنة ومغامرة الـ ٢٠ مرحلة.',
    icon: '👧',
    colorTheme: 'from-sky-500 to-indigo-600 text-white',
    defaultSpeedMultiplier: 1.0,
  },
  '10_plus': {
    id: '10_plus',
    titleAr: 'رواد التحدي والعباقرة 🚀🧠',
    badgeAr: '١٠ سنوات وأكثر',
    ageRangeAr: '١٠ سنوات فأكثر',
    descriptionAr: 'جداول الضرب والقسمة، معادلات المجهول (X)، ترتيب العمليات الحسابية، مفردات إنجليزية متقدمة، ومراحل سريعة وحماسية.',
    icon: '🚀',
    colorTheme: 'from-purple-600 to-pink-600 text-white',
    defaultSpeedMultiplier: 1.45,
  },
};

export type QuizPurpose =
  | { kind: 'unlock_level'; levelId: number }
  | { kind: 'buy_life' }
  | { kind: 'practice' };

export interface PlayerProgress {
  unlockedLevels: number[];
  levelStars: Record<number, number>; // 1..3 stars
  levelHighScores: Record<number, number>;
  lives: number;
  totalSolvedQuestions: number;
  goldenEggs: number;
  weaponLevel: number; // 1: standard, 2: double, 3: blessed triple, 4: royal star
  quranVersesCompleted: number;
}
