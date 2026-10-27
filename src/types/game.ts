export const HOOR_PHOTO_URL = '/assets/aistudio/10160185010238213_11fa6234.jpg';
export const APP_VERSION = '2.1.0-OTA';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type SubjectFilter = 'all' | 'addition' | 'subtraction' | 'math' | 'english';

export type GameSpeed = 'slow' | 'normal' | 'fast';

export interface GameSettings {
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
  type: 'addition' | 'subtraction' | 'english';
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
}
