/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Lock,
  Unlock,
  Play,
  Sliders,
  Volume2,
  VolumeX,
  Sparkles,
  Crown,
  Star,
  BookOpen,
} from 'lucide-react';
import {
  BiomeId,
  GameSettings,
  HOOR_PHOTO_URL,
  LevelConfig,
  PlayerProgress,
  QuizPurpose,
} from './types/game';
import { LEVELS } from './data/levels';
import { soundFX } from './utils/soundEffects';
import { QuizModal } from './components/QuizModal';
import { SettingsModal } from './components/SettingsModal';
import { ChickenGameCanvas } from './components/ChickenGameCanvas';
import { PWAInstallButton, OfflineStatusBanner } from './components/PWAInstallButton';

const STORAGE_SETTINGS_KEY = 'hoor_game_settings_v1';
const STORAGE_PROGRESS_KEY = 'hoor_game_progress_v1';

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'medium', // Default tailored for a 6-year-old
  subject: 'all',
  gameSpeed: 'normal',
  soundEnabled: true,
  voiceEnabled: true,
  visualHelpers: true,
};

const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevels: [1],
  levelStars: {},
  levelHighScores: {},
  lives: 3,
  totalSolvedQuestions: 0,
  goldenEggs: 0,
};

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROGRESS_KEY);
      return saved ? { ...DEFAULT_PROGRESS, ...JSON.parse(saved) } : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  const [activeLevel, setActiveLevel] = useState<LevelConfig | null>(null);
  const [quizPurpose, setQuizPurpose] = useState<QuizPurpose | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedBiomeFilter, setSelectedBiomeFilter] = useState<BiomeId | 'all'>('all');

  useEffect(() => {
    soundFX.setSettings(settings.soundEnabled, settings.voiceEnabled);
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors in private mode
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const handleSelectStage = (lvl: LevelConfig) => {
    soundFX.playWoodTap();
    const isUnlocked = progress.unlockedLevels.includes(lvl.id);

    if (isUnlocked) {
      if (progress.lives <= 0) {
        // Prompt to solve a simple question to get a free heart first
        setQuizPurpose({ kind: 'buy_life' });
      } else {
        setActiveLevel(lvl);
      }
    } else {
      // Locked stage: solve a simple educational question to unlock!
      setQuizPurpose({ kind: 'unlock_level', levelId: lvl.id });
    }
  };

  const handleQuizSuccess = (purpose: QuizPurpose) => {
    if (purpose.kind === 'unlock_level') {
      const targetId = purpose.levelId;
      setProgress((prev) => ({
        ...prev,
        unlockedLevels: prev.unlockedLevels.includes(targetId)
          ? prev.unlockedLevels
          : [...prev.unlockedLevels, targetId],
        totalSolvedQuestions: prev.totalSolvedQuestions + 1,
        lives: Math.max(prev.lives, 3),
      }));
      setQuizPurpose(null);
      const targetLevel = LEVELS.find((l) => l.id === targetId);
      if (targetLevel) {
        setActiveLevel(targetLevel);
      }
    } else if (purpose.kind === 'buy_life') {
      setProgress((prev) => ({
        ...prev,
        lives: Math.min(6, prev.lives + 1),
        totalSolvedQuestions: prev.totalSolvedQuestions + 1,
      }));
      setQuizPurpose(null);
    } else {
      setProgress((prev) => ({
        ...prev,
        lives: Math.min(6, prev.lives + 1),
        totalSolvedQuestions: prev.totalSolvedQuestions + 1,
      }));
      setQuizPurpose(null);
    }
  };

  const handleLevelComplete = (levelId: number, score: number, stars: number) => {
    setProgress((prev) => ({
      ...prev,
      levelStars: {
        ...prev.levelStars,
        [levelId]: Math.max(prev.levelStars[levelId] || 0, stars),
      },
      levelHighScores: {
        ...prev.levelHighScores,
        [levelId]: Math.max(prev.levelHighScores[levelId] || 0, score),
      },
    }));
  };

  const totalStarsEarned = Object.values(progress.levelStars).reduce((acc, s) => acc + s, 0);

  const difficultyLabelAr =
    settings.difficulty === 'easy'
      ? 'مبتدئ (أرقام حتى ٥)'
      : settings.difficulty === 'medium'
      ? 'مناسب لعمر ٦ سنوات (حتى ١٠)'
      : 'متقدم (أرقام حتى ٢٠)';

  const subjectLabelAr =
    settings.subject === 'all'
      ? 'جمع + طرح + كلمات إنجليزية'
      : settings.subject === 'addition'
      ? 'الجمع فقط'
      : settings.subject === 'subtraction'
      ? 'الطرح فقط'
      : settings.subject === 'math'
      ? 'الجمع والطرح'
      : 'كلمات إنجليزية فقط';

  const visibleLevels =
    selectedBiomeFilter === 'all'
      ? LEVELS
      : LEVELS.filter((l) => l.biome === selectedBiomeFilter);

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-900">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            soundFX.playWoodTap();
            setActiveLevel(null);
          }}
          className="text-lg sm:text-xl font-black tracking-tight text-sky-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          حور تلعب و تتعلم
        </button>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              setActiveLevel(null);
            }}
            className="hover:text-sky-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            خريطة الـ ٢٠ مرحلة
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              setQuizPurpose({ kind: 'practice' });
            }}
            className="hover:text-sky-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            سؤال تعليمي سريع
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              setQuizPurpose({ kind: 'buy_life' });
            }}
            className="hover:text-rose-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            شراء حياة جديدة ({progress.lives} ❤️)
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              setShowSettings(true);
            }}
            className="hover:text-sky-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            تخصيص الصعوبة
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton variant="header" />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Always-Visible Direct Android Download & OTA Bar */}
        <PWAInstallButton variant="banner" />

        {activeLevel ? (
          <ChickenGameCanvas
            level={activeLevel}
            lives={progress.lives}
            settings={settings}
            isNextLevelUnlocked={
              activeLevel.id < 20 && progress.unlockedLevels.includes(activeLevel.id + 1)
            }
            onChangeLives={(delta) =>
              setProgress((prev) => ({
                ...prev,
                lives: Math.max(0, prev.lives + delta),
              }))
            }
            onRequestBuyLife={() => setQuizPurpose({ kind: 'buy_life' })}
            onLevelComplete={handleLevelComplete}
            onRequestUnlockNextLevel={(nextId) =>
              setQuizPurpose({ kind: 'unlock_level', levelId: nextId })
            }
            onPlayNextLevel={(nextId) => {
              const found = LEVELS.find((l) => l.id === nextId);
              if (found) setActiveLevel(found);
            }}
            onExitToMap={() => setActiveLevel(null)}
          />
        ) : (
          <div className="space-y-8">
            {/* Hero Welcome & Quick Status Card */}
            <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4 text-right">
                <div className="text-xs font-extrabold text-sky-700">
                  لعبة تعليمية أوفلاين بدون موسيقى · مؤثرات صوتية طبيعية فقط · مصممة لعمر ٦ سنوات
                </div>

                <h1
                  className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight"
                  style={{ textWrap: 'balance' }}
                >
                  أهلاً بالبطلة حور في مغامرة صيد الدجاج والتعلّم المرح!
                </h1>

                <p className="text-sm sm:text-base font-bold text-slate-600 leading-relaxed max-w-2xl">
                  اصطادي الدجاجات اللطيفة عبر ٢٠ مرحلة متباعدة وممتعة! لفتح أي مرحلة جديدة أو الحصول على حياة إضافية، حلّي مسألة بسيطة جداً في الجمع أو الطرح أو الكلمات الإنجليزية المصوّرة.
                </p>

                {/* Unboxed Clean Metadata Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-500 pt-1">
                  <span>المستوى الحالي: {difficultyLabelAr}</span>
                  <span aria-hidden="true">·</span>
                  <span>الموضوعات: {subjectLabelAr}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    المسائل المحلولة: {progress.totalSolvedQuestions}
                  </span>
                </div>

                {/* Primary Hero CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const highestUnlocked = Math.max(...progress.unlockedLevels);
                      const lvl = LEVELS.find((l) => l.id === highestUnlocked) || LEVELS[0];
                      handleSelectStage(lvl);
                    }}
                    className="flex items-center gap-2.5 px-6 py-3.5 min-h-[52px] rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-base shadow-sm transition-transform cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-5 h-5 fill-white shrink-0" />
                    <span>
                      ابدئي اللعب الآن (المرحلة {Math.max(...progress.unlockedLevels)})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playWoodTap();
                      setQuizPurpose({ kind: 'buy_life' });
                    }}
                    className="flex items-center gap-2 px-5 py-3.5 min-h-[52px] rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-extrabold text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Heart className="w-5 h-5 text-rose-600 fill-rose-500 shrink-0" />
                    <span>+ شراء حياة جديدة (سؤال بسيط)</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Hoor's Real Photo & Interactive Stats Showcase */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="rounded-3xl bg-gradient-to-b from-sky-100 to-emerald-50 border border-sky-200 p-5 flex flex-col items-center text-center relative overflow-hidden">
                  {/* Framed Portrait of Hoor & Her Cat */}
                  <div className="relative w-full max-w-[260px] rounded-3xl bg-white p-2 border-2 border-amber-400 shadow-sm">
                    <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-sky-100">
                      <img
                        src={HOOR_PHOTO_URL}
                        alt="البطلة حور مع قطتها اللطيفة"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-3 text-white text-right">
                        <div className="text-xs font-extrabold text-amber-300">
                          بطلة اللعبة والتعلّم ⭐
                        </div>
                        <div className="text-sm font-black">
                          حور وصديقتها القطة اللطيفة (Cat 🐱 · Milk 🥛)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Natural Sound Buttons for Hoor */}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playCatMeow();
                        setTimeout(() => soundFX.speakEnglishWord('Cat'), 450);
                      }}
                      className="px-3.5 py-2 min-h-[42px] rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-xs font-extrabold text-slate-900 shadow-2xs cursor-pointer whitespace-nowrap"
                    >
                      🐱 صوت قطة حور (Cat)
                    </button>

                    <button
                      type="button"
                      onClick={() => soundFX.playCluck()}
                      className="px-3.5 py-2 min-h-[42px] rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-xs font-extrabold text-sky-900 shadow-2xs cursor-pointer whitespace-nowrap"
                    >
                      🐔 صوت الدجاجة الطبيعي
                    </button>
                  </div>

                  {/* 3 Stat Counters */}
                  <div className="mt-3.5 w-full grid grid-cols-3 gap-2.5">
                    <div className="bg-white/95 rounded-2xl p-2.5 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500">القلوب الحالية</div>
                      <div className="text-lg font-black text-rose-600 tabular-nums mt-0.5 flex items-center justify-center gap-1">
                        <span>{progress.lives}</span>
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-600" />
                      </div>
                    </div>

                    <div className="bg-white/95 rounded-2xl p-2.5 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500">المراحل المفتوحة</div>
                      <div className="text-lg font-black text-sky-700 tabular-nums mt-0.5">
                        {progress.unlockedLevels.length} / ٢٠
                      </div>
                    </div>

                    <div className="bg-white/95 rounded-2xl p-2.5 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500">مجموع النجوم</div>
                      <div className="text-lg font-black text-amber-600 tabular-nums mt-0.5 flex items-center justify-center gap-1">
                        <span>{totalStarsEarned}</span>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Control Toolbar for Mobile & Parents */}
            <section className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              {/* Interactive Biome Filter Controls */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'all' as const, label: 'كل المراحل (٢٠)' },
                  { id: 'farm' as const, label: '١. المزرعة (١-٥)' },
                  { id: 'meadow' as const, label: '٢. تلال الزهور (٦-١٠)' },
                  { id: 'sky' as const, label: '٣. وادي الغيوم (١١-١٥)' },
                  { id: 'castle' as const, label: '٤. قلعة النجوم (١٦-٢٠)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundFX.playWoodTap();
                      setSelectedBiomeFilter(tab.id);
                    }}
                    className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedBiomeFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sound, Settings & Practice Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playWoodTap();
                    setShowSettings(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>مستوى المسائل</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playWoodTap();
                    setQuizPurpose({ kind: 'practice' });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>ركن التعلّم السريع (+قلب)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {settings.soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>المؤثرات الطبيعية: مفعّلة</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>صامت</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* 20 Spaced-Out Adventure Trail Map */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    خريطة المراحل الـ ٢٠ المتباعدة
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-slate-500">
                    اضغطي على أي مرحلة مفتوحة للعب، أو اضغطي على أي مرحلة مغلقة لحل مسألة بسيطة جداً وفتحها فوراً!
                  </p>
                </div>
              </div>

              {/* Spaced-Out Winding Trail Container */}
              <div className="relative rounded-3xl bg-gradient-to-b from-emerald-50/70 via-sky-50 to-indigo-50/60 border border-slate-200 p-6 sm:p-10">
                {/* Center dashed adventure path line on desktop/mobile */}
                <div
                  aria-hidden="true"
                  className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-1 border-r-4 border-dashed border-sky-300/80 pointer-events-none"
                />

                <div className="relative z-10 flex flex-col gap-10 sm:gap-12">
                  {visibleLevels.map((lvl, idx) => {
                    const isUnlocked = progress.unlockedLevels.includes(lvl.id);
                    const stars = progress.levelStars[lvl.id] || 0;
                    const highScore = progress.levelHighScores[lvl.id] || 0;

                    // Alternate horizontal offset so the 20 stages are visually spaced out along a winding trail
                    const alignmentClass =
                      idx % 3 === 0
                        ? 'sm:self-center'
                        : idx % 3 === 1
                        ? 'sm:self-start sm:mr-12'
                        : 'sm:self-end sm:ml-12';

                    return (
                      <div
                        key={lvl.id}
                        className={`w-full sm:w-[440px] ${alignmentClass} transition-transform`}
                      >
                        <div
                          className={`rounded-3xl p-5 border-2 transition-all bg-white shadow-xs ${
                            isUnlocked
                              ? 'border-sky-400 hover:border-sky-600'
                              : 'border-slate-200 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              {/* Stage Number Medallion */}
                              <div
                                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 border ${
                                  isUnlocked
                                    ? lvl.isBoss
                                      ? 'bg-amber-400 border-amber-500 text-slate-950'
                                      : 'bg-sky-600 border-sky-700 text-white'
                                    : 'bg-slate-100 border-slate-200 text-slate-500'
                                }`}
                              >
                                <span className="text-[10px] font-extrabold leading-none">
                                  مرحلة
                                </span>
                                <span className="text-xl font-english tabular-nums leading-tight">
                                  {lvl.id}
                                </span>
                              </div>

                              <div>
                                <div className="text-xs font-bold text-slate-500">
                                  {lvl.biomeNameAr} · صيد {lvl.targetChickens} دجاجة
                                  {lvl.isBoss ? ' · مرحلة الزعيمة 👑' : ''}
                                </div>
                                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                                  <span>{lvl.titleAr}</span>
                                  {lvl.isBoss && (
                                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                                  )}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">
                                  {lvl.subtitleAr}
                                </p>
                              </div>
                            </div>

                            {/* Stars Earned */}
                            <div className="flex flex-col items-end shrink-0">
                              <div className="flex items-center gap-0.5 text-base">
                                <span>{stars >= 1 ? '⭐' : '☆'}</span>
                                <span>{stars >= 2 ? '⭐' : '☆'}</span>
                                <span>{stars >= 3 ? '⭐' : '☆'}</span>
                              </div>
                              {highScore > 0 && (
                                <span className="text-[11px] font-bold text-slate-400 tabular-nums mt-1">
                                  أعلى نقاط: {highScore}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stage Action Button */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                            {isUnlocked ? (
                              <>
                                <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                                  <Unlock className="w-3.5 h-3.5 shrink-0" />
                                  <span>المرحلة مفتوحة وجاهزة</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSelectStage(lvl)}
                                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-transform cursor-pointer whitespace-nowrap"
                                >
                                  <Play className="w-4 h-4 fill-white shrink-0" />
                                  <span>ابدئي المرحلة {lvl.id}</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                  <Lock className="w-3.5 h-3.5 shrink-0" />
                                  <span>تحتاج لسؤال بسيط لفتحها</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSelectStage(lvl)}
                                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-transform cursor-pointer whitespace-nowrap"
                                >
                                  <Sparkles className="w-4 h-4 shrink-0" />
                                  <span>حل سؤال لفتح المرحلة {lvl.id}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-5 px-4 sm:px-8 text-center text-xs font-bold text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>حور تلعب و تتعلم — لعبة تعليمية للأطفال (عمر ٦ سنوات) تعمل بدون إنترنت</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              تخصيص صعوبة المسائل
            </button>
            <button
              type="button"
              onClick={() => setQuizPurpose({ kind: 'buy_life' })}
              className="hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              الحصول على حياة إضافية
            </button>
          </div>
        </div>
      </footer>

      {/* Educational Question Modal (Unlock Level / Buy New Life / Practice) */}
      {quizPurpose && (
        <QuizModal
          purpose={quizPurpose}
          difficulty={settings.difficulty}
          subject={settings.subject}
          visualHelpers={settings.visualHelpers}
          onSuccess={handleQuizSuccess}
          onClose={() => setQuizPurpose(null)}
        />
      )}

      {/* Parent & Child Difficulty Customization Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onUnlockAllLevels={() =>
            setProgress((prev) => ({
              ...prev,
              unlockedLevels: LEVELS.map((l) => l.id),
            }))
          }
          onResetProgress={() => {
            setProgress(DEFAULT_PROGRESS);
            setActiveLevel(null);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Non-intrusive Offline Mode Indicator */}
      <OfflineStatusBanner />
    </div>
  );
}
