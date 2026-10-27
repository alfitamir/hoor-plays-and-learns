import React, { useRef, useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import type { GameSettings, PlayerProgress } from '../types/game';

export interface ProgressBackupDocument {
  version: 1;
  createdAt: string;
  progress: PlayerProgress;
  settings: GameSettings;
  ageSelected: boolean;
}

interface ProgressBackupProps {
  progress: PlayerProgress;
  settings: GameSettings;
  ageSelected: boolean;
  onImport: (backup: ProgressBackupDocument) => void | Promise<void>;
}

const SETTINGS_KEYS = [
  'ageGroup',
  'difficulty',
  'subject',
  'gameSpeed',
  'soundEnabled',
  'voiceEnabled',
  'visualHelpers',
] as const;
const PROGRESS_KEYS = [
  'unlockedLevels',
  'levelStars',
  'levelHighScores',
  'lives',
  'totalSolvedQuestions',
  'goldenEggs',
  'weaponLevel',
  'quranVersesCompleted',
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]) => {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
};

const isIntegerInRange = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;

const validateLevelMap = (
  value: unknown,
  minValue: number,
  maxValue: number,
  fieldName: string,
): value is Record<number, number> => {
  if (!isRecord(value)) throw new Error(`حقل ${fieldName} يجب أن يكون كائناً.`);
  for (const [key, item] of Object.entries(value)) {
    const levelId = Number(key);
    if (!/^([1-9]|1\d|20)$/.test(key) || !isIntegerInRange(levelId, 1, 20)) {
      throw new Error(`معرّفات المراحل في ${fieldName} يجب أن تكون من ١ إلى ٢٠.`);
    }
    if (!isIntegerInRange(item, minValue, maxValue)) {
      throw new Error(`قيم ${fieldName} خارج النطاق المسموح.`);
    }
  }
  return true;
};

const validateBackup = (value: unknown): ProgressBackupDocument => {
  if (!isRecord(value) || !hasExactKeys(value, ['version', 'createdAt', 'progress', 'settings', 'ageSelected'])) {
    throw new Error('بنية الملف غير صحيحة أو تحتوي حقولاً غير معروفة.');
  }
  if (value.version !== 1) throw new Error('إصدار ملف النسخة الاحتياطية غير مدعوم.');
  if (
    typeof value.createdAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value.createdAt) ||
    Number.isNaN(Date.parse(value.createdAt))
  ) {
    throw new Error('تاريخ إنشاء النسخة غير صالح.');
  }
  if (typeof value.ageSelected !== 'boolean') throw new Error('حقل اختيار العمر يجب أن يكون true أو false.');

  const settings = value.settings;
  if (!isRecord(settings) || !hasExactKeys(settings, SETTINGS_KEYS)) {
    throw new Error('بنية الإعدادات غير مكتملة أو تحتوي حقولاً غير معروفة.');
  }
  if (!['under_5', '6_to_9', '10_plus'].includes(String(settings.ageGroup))) {
    throw new Error('قيمة الفئة العمرية غير صالحة.');
  }
  if (!['easy', 'medium', 'hard'].includes(String(settings.difficulty))) {
    throw new Error('قيمة الصعوبة غير صالحة.');
  }
  if (
    !['all', 'addition', 'subtraction', 'math', 'english', 'multiplication', 'advanced_math', 'general_knowledge'].includes(
      String(settings.subject),
    )
  ) {
    throw new Error('قيمة الموضوع غير صالحة.');
  }
  if (!['slow', 'normal', 'fast'].includes(String(settings.gameSpeed))) {
    throw new Error('قيمة سرعة اللعبة غير صالحة.');
  }
  for (const key of ['soundEnabled', 'voiceEnabled', 'visualHelpers'] as const) {
    if (typeof settings[key] !== 'boolean') throw new Error(`قيمة ${key} يجب أن تكون true أو false.`);
  }

  const progress = value.progress;
  if (!isRecord(progress) || !hasExactKeys(progress, PROGRESS_KEYS)) {
    throw new Error('بنية التقدم غير مكتملة أو تحتوي حقولاً غير معروفة.');
  }
  if (
    !Array.isArray(progress.unlockedLevels) ||
    progress.unlockedLevels.length < 1 ||
    !progress.unlockedLevels.every((id) => isIntegerInRange(id, 1, 20)) ||
    new Set(progress.unlockedLevels).size !== progress.unlockedLevels.length ||
    !progress.unlockedLevels.includes(1)
  ) {
    throw new Error('المراحل المفتوحة يجب أن تكون معرّفات فريدة من ١ إلى ٢٠، وتشمل المرحلة الأولى.');
  }
  validateLevelMap(progress.levelStars, 0, 3, 'نجوم المراحل');
  validateLevelMap(progress.levelHighScores, 0, Number.MAX_SAFE_INTEGER, 'أفضل النتائج');
  if (!isIntegerInRange(progress.lives, 0, 6)) throw new Error('عدد الحيوات يجب أن يكون بين ٠ و٦.');
  if (!isIntegerInRange(progress.weaponLevel, 1, 4)) throw new Error('مستوى السلاح يجب أن يكون بين ١ و٤.');
  for (const key of ['totalSolvedQuestions', 'goldenEggs', 'quranVersesCompleted'] as const) {
    if (!isIntegerInRange(progress[key], 0, Number.MAX_SAFE_INTEGER)) {
      throw new Error(`قيمة ${key} يجب أن تكون عدداً صحيحاً موجباً أو صفراً.`);
    }
  }

  return value as unknown as ProgressBackupDocument;
};

export const ProgressBackup: React.FC<ProgressBackupProps> = ({
  progress,
  settings,
  ageSelected,
  onImport,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadBackup = () => {
    const document: ProgressBackupDocument = {
      version: 1,
      createdAt: new Date().toISOString(),
      progress,
      settings,
      ageSelected,
    };
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `hoor-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ text: 'تم تنزيل النسخة الاحتياطية بنجاح.', isError: false });
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setMessage(null);
    if (file.size > 1024 * 1024) {
      setMessage({ text: 'حجم الملف كبير جداً (الحد الأقصى ١ ميغابايت).', isError: true });
      return;
    }
    setIsImporting(true);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const backup = validateBackup(parsed);
      await onImport(backup);
      setMessage({ text: 'تم التحقق من النسخة واستيرادها بنجاح.', isError: false });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'تعذّر قراءة ملف النسخة الاحتياطية.',
        isError: true,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[60] text-right" dir="rtl">
      {isOpen ? (
        <section
          className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-sky-200 bg-white p-4 shadow-xl"
          aria-label="النسخ الاحتياطي المحلي"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-black text-slate-900">نسخ احتياطي محلي</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                احفظي التقدم والإعدادات في ملف JSON أو استوردي نسخة سابقة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="إغلاق النسخ الاحتياطي"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadBackup}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 text-xs font-extrabold text-white hover:bg-sky-700"
            >
              <Download className="h-4 w-4" /> تنزيل النسخة
            </button>
            <button
              type="button"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" /> {isImporting ? 'جارٍ الاستيراد…' : 'استيراد JSON'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label="اختيار ملف نسخة احتياطية JSON"
              onChange={handleFile}
            />
          </div>
          {message && (
            <p
              role="status"
              className={`mt-3 rounded-lg px-3 py-2 text-xs font-bold leading-relaxed ${
                message.isError ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {message.text}
            </p>
          )}
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex min-h-11 items-center gap-2 rounded-full border border-sky-300 bg-white px-4 text-xs font-extrabold text-sky-900 shadow-lg hover:bg-sky-50"
        >
          <Download className="h-4 w-4" /> النسخ الاحتياطي
        </button>
      )}
    </div>
  );
};
