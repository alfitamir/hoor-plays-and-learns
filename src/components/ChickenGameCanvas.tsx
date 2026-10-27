import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, Pause, Play, ArrowRight, Sparkles, Trophy, RotateCcw, Unlock, Zap } from 'lucide-react';
import { GameSettings, HOOR_PHOTO_URL, LevelConfig, WEAPON_TIERS } from '../types/game';
import { soundFX } from '../utils/soundEffects';
import { BetweenLevelsModal } from './BetweenLevelsModal';

interface ChickenGameCanvasProps {
  level: LevelConfig;
  lives: number;
  settings: GameSettings;
  isNextLevelUnlocked: boolean;
  weaponLevel?: number;
  onUpgradeWeapon?: (level: number) => void;
  onChangeLives: (delta: number) => void;
  onRequestBuyLife: () => void;
  onLevelComplete: (levelId: number, score: number, stars: number) => void;
  onRequestUnlockNextLevel: (nextLevelId: number) => void;
  onPlayNextLevel: (nextLevelId: number) => void;
  onExitToMap: () => void;
}

interface ChickenEntity {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: 'white' | 'gold' | 'brown' | 'boss';
  wingPhase: number;
  hitFlash: number;
  angleOffset: number;
}

interface CornShot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  size: number;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  kind: 'egg' | 'golden_feather';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

export const ChickenGameCanvas: React.FC<ChickenGameCanvasProps> = ({
  level,
  lives,
  settings,
  isNextLevelUnlocked,
  weaponLevel = 1,
  onUpgradeWeapon,
  onChangeLives,
  onRequestBuyLife,
  onLevelComplete,
  onRequestUnlockNextLevel,
  onPlayNextLevel,
  onExitToMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoorImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = HOOR_PHOTO_URL;
    hoorImgRef.current = img;
  }, []);

  const [caughtCount, setCaughtCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stageState, setStageState] = useState<'playing' | 'victory' | 'out_of_lives'>('playing');

  // Mutable game world state inside ref for 60fps animation loop
  const worldRef = useRef({
    playerX: 300,
    targetPlayerX: 300,
    invincibleTimer: 0,
    caught: 0,
    spawnedTotal: 0,
    score: 0,
    frameCount: 0,
    lastShotFrame: 0,
    chickens: [] as ChickenEntity[],
    shots: [] as CornShot[],
    falling: [] as FallingItem[],
    particles: [] as Particle[],
    nextId: 1,
  });

  const livesRef = useRef(lives);
  useEffect(() => {
    livesRef.current = lives;
    if (lives > 0 && stageState === 'out_of_lives') {
      setStageState('playing');
    } else if (lives <= 0 && stageState === 'playing') {
      setStageState('out_of_lives');
    }
  }, [lives, stageState]);

  const userSpeedFactor =
    settings.gameSpeed === 'slow' ? 0.68 : settings.gameSpeed === 'fast' ? 1.28 : 1.0;

  const spawnWave = useCallback(
    (canvasWidth: number) => {
      const w = worldRef.current;
      const remainingToSpawn = level.targetChickens - w.caught - w.chickens.length;
      if (remainingToSpawn <= 0) return;

      const count = Math.min(level.waveSize, remainingToSpawn);
      const isBossWave =
        level.isBoss &&
        w.caught + w.chickens.length + count >= level.targetChickens &&
        !w.chickens.some((c) => c.color === 'boss');

      if (isBossWave) {
        w.chickens.push({
          id: w.nextId++,
          x: canvasWidth / 2,
          y: 115,
          baseX: canvasWidth / 2,
          baseY: 115,
          vx: 1.5 * level.speedMultiplier * userSpeedFactor,
          vy: 0.4,
          radius: 48,
          hp: 6,
          maxHp: 6,
          color: 'boss',
          wingPhase: 0,
          hitFlash: 0,
          angleOffset: 0,
        });
        soundFX.playCluck(0.75);
        return;
      }

      const margin = 65;
      const usableWidth = Math.max(180, canvasWidth - margin * 2);

      for (let i = 0; i < count; i++) {
        const ratio = count === 1 ? 0.5 : i / (count - 1);
        const bx = margin + ratio * usableWidth;
        const by =
          level.pattern === 'v_flock'
            ? 85 + Math.abs(ratio - 0.5) * 110
            : 85 + (i % 2) * 44;

        const isGold = i === Math.floor(count / 2) && Math.random() < 0.35;
        const color = isGold ? 'gold' : i % 3 === 0 ? 'brown' : 'white';

        w.chickens.push({
          id: w.nextId++,
          x: bx,
          y: -40 - i * 18,
          baseX: bx,
          baseY: by,
          vx: (i % 2 === 0 ? 1 : -1) * 1.25 * level.speedMultiplier * userSpeedFactor,
          vy: 1.2,
          radius: 28,
          hp: isGold ? 2 : 1,
          maxHp: isGold ? 2 : 1,
          color,
          wingPhase: Math.random() * Math.PI * 2,
          hitFlash: 0,
          angleOffset: (i / count) * Math.PI * 2,
        });
      }
      soundFX.playWingFlap();
    },
    [level, userSpeedFactor]
  );

  const resetStage = useCallback(() => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 600;
    worldRef.current = {
      playerX: width / 2,
      targetPlayerX: width / 2,
      invincibleTimer: 0,
      caught: 0,
      spawnedTotal: 0,
      score: 0,
      frameCount: 0,
      lastShotFrame: 0,
      chickens: [],
      shots: [],
      falling: [],
      particles: [],
      nextId: 1,
    };
    setCaughtCount(0);
    setScore(0);
    setIsPaused(false);
    setStageState(livesRef.current > 0 ? 'playing' : 'out_of_lives');
    spawnWave(width);
  }, [spawnWave]);

  useEffect(() => {
    resetStage();
  }, [level.id, resetStage]);

  // Shoot corn projectile toward target point or straight up with upgraded weapon tiers
  const fireCorn = useCallback(
    (aimX?: number, aimY?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = worldRef.current;
      const startX = w.playerX;
      const startY = canvas.height - 62;

      const activeWeapon = WEAPON_TIERS[weaponLevel] || WEAPON_TIERS[1];
      const baseSpeed = activeWeapon.speed || 10.5;

      let targetAngle = -Math.PI / 2; // straight up
      if (aimX !== undefined && aimY !== undefined && aimY < startY - 20) {
        targetAngle = Math.atan2(aimY - startY, aimX - startX);
      }

      const count = activeWeapon.projectileCount;
      const damage = activeWeapon.damage;
      const color = activeWeapon.projectileColor;

      if (count === 1) {
        w.shots.push({
          id: w.nextId++,
          x: startX,
          y: startY,
          vx: Math.cos(targetAngle) * baseSpeed,
          vy: Math.sin(targetAngle) * baseSpeed,
          damage,
          color,
          size: 7,
        });
      } else if (count === 2) {
        // Parallel dual shots
        const normalAngle = targetAngle + Math.PI / 2;
        const offsetX = Math.cos(normalAngle) * 12;
        const offsetY = Math.sin(normalAngle) * 12;
        [-1, 1].forEach((dir) => {
          w.shots.push({
            id: w.nextId++,
            x: startX + offsetX * dir,
            y: startY + offsetY * dir,
            vx: Math.cos(targetAngle) * baseSpeed,
            vy: Math.sin(targetAngle) * baseSpeed,
            damage,
            color,
            size: 8,
          });
        });
      } else if (count === 3) {
        // Triple fan spread (-12 deg, 0, +12 deg)
        const spreadAngles = [-0.21, 0, 0.21];
        spreadAngles.forEach((offset) => {
          const angle = targetAngle + offset;
          w.shots.push({
            id: w.nextId++,
            x: startX,
            y: startY,
            vx: Math.cos(angle) * baseSpeed,
            vy: Math.sin(angle) * baseSpeed,
            damage,
            color,
            size: 8.5,
          });
        });
      } else {
        // 5-way royal spread
        const spreadAngles = [-0.34, -0.17, 0, 0.17, 0.34];
        spreadAngles.forEach((offset) => {
          const angle = targetAngle + offset;
          w.shots.push({
            id: w.nextId++,
            x: startX,
            y: startY,
            vx: Math.cos(angle) * baseSpeed,
            vy: Math.sin(angle) * baseSpeed,
            damage,
            color,
            size: 9,
          });
        });
      }

      soundFX.playPop();
    },
    [weaponLevel]
  );

  // Handle pointer tap / drag on canvas
  const handlePointerDownOrMove = (
    e: React.PointerEvent<HTMLCanvasElement>,
    isTap: boolean
  ) => {
    if (stageState !== 'playing' || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    const w = worldRef.current;
    // Move Hoor's launcher horizontally toward finger/cursor
    w.targetPlayerX = Math.max(40, Math.min(canvas.width - 40, cx));

    if (isTap) {
      // Check if child tapped directly on or near a chicken!
      let tappedChicken: ChickenEntity | null = null;
      for (const ch of w.chickens) {
        const dist = Math.hypot(ch.x - cx, ch.y - cy);
        if (dist <= ch.radius + 26) {
          tappedChicken = ch;
          break;
        }
      }
      if (tappedChicken) {
        fireCorn(tappedChicken.x, tappedChicken.y);
      } else {
        fireCorn(cx, Math.min(cy, canvas.height - 140));
      }
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const createBurst = (x: number, y: number, color: string, count = 10) => {
      const w = worldRef.current;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const spd = 1.5 + Math.random() * 3.5;
        w.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color,
          size: 4 + Math.random() * 4,
          alpha: 1,
        });
      }
    };

    const renderLoop = () => {
      const w = worldRef.current;
      const width = canvas.width;
      const height = canvas.height;

      if (stageState === 'playing' && !isPaused) {
        w.frameCount++;
        if (w.invincibleTimer > 0) w.invincibleTimer--;

        // Smoothly interpolate Hoor's basket position
        w.playerX += (w.targetPlayerX - w.playerX) * 0.22;

        // Auto-shoot every ~38 frames so 6-year-old doesn't get tired tapping
        if (w.frameCount - w.lastShotFrame >= 38 && w.chickens.length > 0) {
          w.lastShotFrame = w.frameCount;
          fireCorn();
        }

        // Spawn next wave if current chickens are cleared
        if (w.chickens.length === 0 && w.caught < level.targetChickens) {
          spawnWave(width);
        }

        // Update Chickens
        for (const ch of w.chickens) {
          ch.wingPhase += 0.18 * userSpeedFactor;
          if (ch.hitFlash > 0) ch.hitFlash--;

          // Smooth entry to baseY
          if (ch.y < ch.baseY) {
            ch.y += 2.2;
          } else {
            if (level.pattern === 'wave') {
              ch.x += ch.vx;
              ch.y = ch.baseY + Math.sin(w.frameCount * 0.04 + ch.angleOffset) * 24;
            } else if (level.pattern === 'circle') {
              ch.angleOffset += 0.02 * userSpeedFactor;
              ch.x += ch.vx * 0.75;
              ch.y = ch.baseY + Math.cos(ch.angleOffset) * 28;
            } else {
              ch.x += ch.vx;
              ch.y = ch.baseY + Math.sin(w.frameCount * 0.03 + ch.id) * 10;
            }
          }

          if (ch.x < ch.radius + 16) {
            ch.x = ch.radius + 16;
            ch.vx = Math.abs(ch.vx);
          } else if (ch.x > width - ch.radius - 16) {
            ch.x = width - ch.radius - 16;
            ch.vx = -Math.abs(ch.vx);
          }

          // Occasional egg drop (speed scales dynamically with level progression)
          if (
            Math.random() < level.eggDropRate * userSpeedFactor &&
            w.falling.length < 4
          ) {
            w.falling.push({
              id: w.nextId++,
              x: ch.x,
              y: ch.y + ch.radius * 0.6,
              vy: (2.2 + level.speedMultiplier * 1.35 + Math.random() * 0.8) * userSpeedFactor,
              kind: Math.random() < 0.25 ? 'golden_feather' : 'egg',
            });
          }
        }

        // Update Shots & Check Collisions with Chickens
        for (let i = w.shots.length - 1; i >= 0; i--) {
          const s = w.shots[i];
          s.x += s.vx;
          s.y += s.vy;

          if (s.y < -20 || s.x < -20 || s.x > width + 20) {
            w.shots.splice(i, 1);
            continue;
          }

          let hit = false;
          for (let j = w.chickens.length - 1; j >= 0; j--) {
            const ch = w.chickens[j];
            const dist = Math.hypot(s.x - ch.x, s.y - ch.y);
            if (dist <= ch.radius + 10) {
              hit = true;
              ch.hp -= (s.damage || 1);
              ch.hitFlash = 6;

              if (ch.hp <= 0) {
                const pts = ch.color === 'boss' ? 50 : ch.color === 'gold' ? 25 : 10;
                w.score += pts;
                w.caught += 1;
                setCaughtCount(w.caught);
                setScore(w.score);

                createBurst(
                  ch.x,
                  ch.y,
                  ch.color === 'gold' || ch.color === 'boss' ? '#facc15' : '#ffffff',
                  14
                );
                soundFX.playCluck(ch.color === 'boss' ? 0.8 : 1.05);

                // Drop a bonus golden feather from golden/boss chickens
                if (ch.color === 'gold' || ch.color === 'boss') {
                  w.falling.push({
                    id: w.nextId++,
                    x: ch.x,
                    y: ch.y,
                    vy: 2.2,
                    kind: 'golden_feather',
                  });
                }

                w.chickens.splice(j, 1);

                // Check Stage Victory!
                if (w.caught >= level.targetChickens) {
                  soundFX.playSuccessBirdChirp();
                  setStageState('victory');
                  const earnedStars = livesRef.current >= 3 ? 3 : livesRef.current === 2 ? 2 : 1;
                  onLevelComplete(level.id, w.score, earnedStars);
                }
              } else {
                soundFX.playWingFlap();
              }
              break;
            }
          }

          if (hit) {
            w.shots.splice(i, 1);
          }
        }

        // Update Falling Eggs & Golden Feathers
        const playerY = height - 48;
        for (let i = w.falling.length - 1; i >= 0; i--) {
          const item = w.falling[i];
          item.y += item.vy;

          const distToPlayer = Math.hypot(item.x - w.playerX, item.y - playerY);
          if (distToPlayer < 36) {
            if (item.kind === 'golden_feather') {
              w.score += 15;
              setScore(w.score);
              soundFX.playEggDrop(true);
              createBurst(item.x, item.y, '#fde047', 10);
            } else if (w.invincibleTimer <= 0) {
              // Egg hit player basket
              w.invincibleTimer = 70;
              soundFX.playEggDrop(false);
              createBurst(item.x, item.y, '#fbbf24', 12);
              onChangeLives(-1);
            }
            w.falling.splice(i, 1);
            continue;
          }

          // Allow shooting eggs in midair too!
          let shotEgg = false;
          if (item.kind === 'egg') {
            for (let sIdx = w.shots.length - 1; sIdx >= 0; sIdx--) {
              const s = w.shots[sIdx];
              if (Math.hypot(s.x - item.x, s.y - item.y) < 20) {
                w.shots.splice(sIdx, 1);
                shotEgg = true;
                w.score += 5;
                setScore(w.score);
                createBurst(item.x, item.y, '#fef08a', 6);
                break;
              }
            }
          }
          if (shotEgg || item.y > height + 20) {
            w.falling.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = w.particles.length - 1; i >= 0; i--) {
          const p = w.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.03;
          if (p.alpha <= 0) {
            w.particles.splice(i, 1);
          }
        }
      }

      // === RENDER SCENE ===
      ctx.clearRect(0, 0, width, height);

      // Biome Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (level.biome === 'farm') {
        skyGrad.addColorStop(0, '#bae6fd');
        skyGrad.addColorStop(1, '#f0f9ff');
      } else if (level.biome === 'meadow') {
        skyGrad.addColorStop(0, '#a7f3d0');
        skyGrad.addColorStop(1, '#ecfdf5');
      } else if (level.biome === 'sky') {
        skyGrad.addColorStop(0, '#c7d2fe');
        skyGrad.addColorStop(1, '#eff6ff');
      } else {
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(1, '#312e81');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Soft Clouds / Stars in Background
      if (level.biome === 'castle') {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
        for (let s = 0; s < 14; s++) {
          const sx = ((s * 97) % (width - 40)) + 20;
          const sy = ((s * 61) % 240) + 30;
          ctx.beginPath();
          ctx.arc(sx, sy, s % 2 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        [
          { cx: width * 0.2, cy: 70, r: 26 },
          { cx: width * 0.75, cy: 95, r: 30 },
        ].forEach((c) => {
          ctx.beginPath();
          ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
          ctx.arc(c.cx + 22, c.cy + 4, c.r * 0.8, 0, Math.PI * 2);
          ctx.arc(c.cx - 22, c.cy + 6, c.r * 0.75, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Rolling Green Hills at Bottom
      ctx.fillStyle = level.biome === 'castle' ? '#3730a3' : '#4ade80';
      ctx.beginPath();
      ctx.moveTo(0, height - 42);
      ctx.quadraticCurveTo(width * 0.5, height - 78, width, height - 42);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Draw Corn Shots with weapon tier colors and glowing energy
      for (const s of w.shots) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.fillStyle = s.color || '#facc15';
        ctx.strokeStyle = s.damage >= 3 ? '#ffffff' : s.damage >= 2 ? '#fef08a' : '#ca8a04';
        ctx.lineWidth = s.damage >= 2 ? 2.5 : 2;
        ctx.beginPath();
        ctx.arc(0, 0, s.size || 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (s.damage >= 2) {
          ctx.shadowColor = s.color || '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw Falling Eggs & Golden Feathers
      for (const item of w.falling) {
        ctx.save();
        ctx.translate(item.x, item.y);
        if (item.kind === 'golden_feather') {
          // Golden Star / Feather bonus
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#854d0e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#854d0e';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 1);
        } else {
          // Egg shape
          ctx.fillStyle = '#fffbeb';
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Chickens (Enhanced Cartoon Style with Bouncing Comb, Blinking Eyes, Wattle & Feet)
      for (const ch of w.chickens) {
        ctx.save();
        ctx.translate(ch.x, ch.y);

        const r = ch.radius;
        const wingFlap = Math.sin(ch.wingPhase);
        const wingFlapY = wingFlap * (r * 0.42);
        const combSway = Math.sin(ch.wingPhase * 0.8) * (r * 0.08);

        // Blinking calculation (brief blink every ~180 frames)
        const isBlinking = (w.frameCount + ch.id * 37) % 190 < 6;

        // 1. Cute Little Feet (wiggle gently with flight)
        const footWiggle = Math.sin(ch.wingPhase * 1.2) * 2;
        ctx.fillStyle = '#f97316';
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 1.8;
        [-r * 0.28, r * 0.28].forEach((fx, idx) => {
          ctx.beginPath();
          ctx.ellipse(fx, r * 0.82 + (idx === 0 ? footWiggle : -footWiggle), 4, 7, (idx === 0 ? -0.2 : 0.2), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        // 2. Flapping Wings with Scalloped Feather Detail
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = '#1e293b';

        // Left Wing
        ctx.save();
        ctx.fillStyle =
          ch.color === 'boss'
            ? '#a855f7' // Majestic royal purple for Boss Rooster
            : ch.color === 'gold'
            ? '#fef08a'
            : ch.color === 'brown'
            ? '#fdba74'
            : '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(-r * 0.96, wingFlapY * 0.6, r * 0.46, r * 0.28, -0.32 + wingFlap * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Right Wing
        ctx.save();
        ctx.fillStyle =
          ch.color === 'boss'
            ? '#a855f7'
            : ch.color === 'gold'
            ? '#fef08a'
            : ch.color === 'brown'
            ? '#fdba74'
            : '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(r * 0.96, wingFlapY * 0.6, r * 0.46, r * 0.28, 0.32 - wingFlap * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // 3. Plump Chicken Body with Soft Shading & Radial Gradient
        ctx.save();
        const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
        if (ch.hitFlash > 0) {
          bodyGrad.addColorStop(0, '#ffffff');
          bodyGrad.addColorStop(1, '#f43f5e');
        } else if (ch.color === 'boss') {
          bodyGrad.addColorStop(0, '#fef08a');
          bodyGrad.addColorStop(0.7, '#facc15');
          bodyGrad.addColorStop(1, '#ca8a04');
        } else if (ch.color === 'gold') {
          bodyGrad.addColorStop(0, '#fffbeb');
          bodyGrad.addColorStop(0.6, '#fde047');
          bodyGrad.addColorStop(1, '#eab308');
        } else if (ch.color === 'brown') {
          bodyGrad.addColorStop(0, '#ffedd5');
          bodyGrad.addColorStop(0.7, '#fed7aa');
          bodyGrad.addColorStop(1, '#ea580c');
        } else {
          // Classic White Silky Hen
          bodyGrad.addColorStop(0, '#ffffff');
          bodyGrad.addColorStop(0.75, '#f8fafc');
          bodyGrad.addColorStop(1, '#cbd5e1');
        }

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.90, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Soft Belly Feather Texture
        ctx.strokeStyle = ch.color === 'boss' ? '#ca8a04' : ch.color === 'gold' ? '#eab308' : '#e2e8f0';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, r * 0.28, r * 0.48, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.restore();

        // 4. Bouncy Red Comb / Boss Royal Crown
        if (ch.color === 'boss') {
          // Majestic Royal Golden Crown with Rubies
          ctx.save();
          ctx.translate(combSway, 0);
          ctx.fillStyle = '#f59e0b';
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(-r * 0.65, -r * 0.72);
          ctx.lineTo(-r * 0.52, -r * 1.35);
          ctx.lineTo(-r * 0.20, -r * 0.95);
          ctx.lineTo(0, -r * 1.45); // Tall center point
          ctx.lineTo(r * 0.20, -r * 0.95);
          ctx.lineTo(r * 0.52, -r * 1.35);
          ctx.lineTo(r * 0.65, -r * 0.72);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Crown Ruby Jewels
          ctx.fillStyle = '#ef4444';
          [-r * 0.38, 0, r * 0.38].forEach((cx) => {
            ctx.beginPath();
            ctx.arc(cx, -r * 0.92, 3.2, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        } else {
          // Sweet 3-Lobed Bouncy Red Comb
          ctx.save();
          ctx.translate(combSway, 0);
          ctx.fillStyle = '#ef4444';
          ctx.strokeStyle = '#991b1b';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(-r * 0.28, -r * 0.85, r * 0.22, 0, Math.PI * 2);
          ctx.arc(0, -r * 0.98, r * 0.26, 0, Math.PI * 2);
          ctx.arc(r * 0.28, -r * 0.85, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // 5. Adorable Expressive Eyes with Highlights (or Cute Blink Line)
        if (isBlinking) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          [-r * 0.32, r * 0.32].forEach((ex) => {
            ctx.beginPath();
            ctx.arc(ex, -r * 0.12, r * 0.12, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
          });
        } else {
          [-r * 0.32, r * 0.32].forEach((ex) => {
            // Dark eye base
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(ex, -r * 0.14, r * 0.15, 0, Math.PI * 2);
            ctx.fill();

            // Large anime sparkle reflection
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - r * 0.04, -r * 0.18, r * 0.055, 0, Math.PI * 2);
            ctx.fill();

            // Secondary small twinkle
            ctx.beginPath();
            ctx.arc(ex + r * 0.05, -r * 0.11, r * 0.03, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // 6. Cute Rosy Cheeks
        ctx.fillStyle = 'rgba(251, 113, 133, 0.65)';
        ctx.beginPath();
        ctx.arc(-r * 0.52, r * 0.08, r * 0.15, 0, Math.PI * 2);
        ctx.arc(r * 0.52, r * 0.08, r * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // 7. Sweet Red Wattle (دلاية الدجاجة الحمراء تحت المنقار)
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(-r * 0.07, r * 0.34, r * 0.11, 0, Math.PI * 2);
        ctx.arc(r * 0.07, r * 0.34, r * 0.11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 8. 3D Golden Beak with Nostril Details
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.19, -r * 0.02);
        ctx.lineTo(r * 0.19, -r * 0.02);
        ctx.lineTo(0, r * 0.34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Beak center line
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.02);
        ctx.lineTo(0, r * 0.28);
        ctx.stroke();

        // 9. Boss HP Bar
        if (ch.maxHp > 1) {
          const bw = r * 1.5;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
          ctx.fillRect(-bw / 2, r + 8, bw, 7);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-bw / 2, r + 8, bw * (ch.hp / ch.maxHp), 7);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(-bw / 2, r + 8, bw, 7);
        }

        ctx.restore();
      }

      // Draw Hoor's Launcher Basket at Bottom
      ctx.save();
      ctx.translate(w.playerX, height - 38);
      if (w.invincibleTimer > 0 && Math.floor(w.invincibleTimer / 5) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      // Launcher Base / Basket
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-42, -18, 84, 32, 16);
      ctx.fill();
      ctx.stroke();

      // Cannon nozzle pointing up
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.roundRect(-10, -30, 20, 15, 6);
      ctx.fill();
      ctx.stroke();

      // Circular Hoor Avatar on the Basket
      if (hoorImgRef.current && hoorImgRef.current.complete && hoorImgRef.current.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(-22, -2, 12, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(hoorImgRef.current, -34, -14, 24, 24);
        ctx.restore();

        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-22, -2, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('حور', 10, -2);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('حور', 0, -2);
      }
      ctx.restore();

      // Draw Particles
      for (const p of w.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    stageState,
    isPaused,
    level,
    userSpeedFactor,
    fireCorn,
    spawnWave,
    onChangeLives,
    onLevelComplete,
  ]);

  const progressPercent = Math.min(100, Math.round((caughtCount / level.targetChickens) * 100));
  const nextLevelId = level.id < 20 ? level.id + 1 : null;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
      {/* Top Game HUD */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Stage Info & Back Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              onExitToMap();
            }}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowRight className="w-4 h-4 shrink-0" />
            <span>خريطة المراحل</span>
          </button>

          <div>
            <div className="text-xs font-bold text-slate-500">
              المرحلة {level.id} من ٢٠ · {level.biomeNameAr}
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              {level.titleAr}
            </h2>
          </div>
        </div>

        {/* Progress Counter & Equipped Weapon Badge */}
        <div className="flex items-center gap-2.5">
          {/* Equipped Weapon Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-black text-amber-950 shadow-2xs"
            title={WEAPON_TIERS[weaponLevel]?.subtitleAr || ''}
          >
            <span>{WEAPON_TIERS[weaponLevel]?.icon || '🌽'}</span>
            <span className="hidden md:inline">{WEAPON_TIERS[weaponLevel]?.nameAr || 'ذرة المزرعة'}</span>
            <span className="md:hidden">سلاح م{weaponLevel}</span>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-500">
              الدجاج المصيد: <span className="text-slate-900 font-extrabold tabular-nums">{caughtCount} / {level.targetChickens}</span>
            </div>
            <div className="w-28 sm:w-36 h-2.5 bg-slate-100 rounded-full overflow-hidden mt-1 border border-slate-200">
              <div
                className="h-full bg-emerald-500 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lives & "+ New Life" Educational Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200">
            {Array.from({ length: Math.max(3, lives) }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-5 h-5 transition-transform ${
                  idx < lives
                    ? 'text-rose-600 fill-rose-500 scale-100'
                    : 'text-slate-300 fill-slate-200 scale-90'
                }`}
              />
            ))}
            <span className="mr-1 text-xs font-extrabold text-rose-900 tabular-nums">
              {lives}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              onRequestBuyLife();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold shadow-2xs transition-transform cursor-pointer whitespace-nowrap"
          >
            <Heart className="w-4 h-4 fill-white shrink-0" />
            <span>+ حياة جديدة (سؤال بسيط)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playWoodTap();
              setIsPaused((p) => !p);
            }}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
            aria-label={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Interactive Canvas Stage */}
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-slate-200 bg-sky-100 shadow-sm">
        <canvas
          ref={canvasRef}
          width={760}
          height={480}
          onPointerDown={(e) => handlePointerDownOrMove(e, true)}
          onPointerMove={(e) => {
            if (e.buttons > 0 || e.pointerType === 'touch' || e.pointerType === 'mouse') {
              handlePointerDownOrMove(e, false);
            }
          }}
          className="w-full h-[62vh] min-h-[360px] max-h-[540px] block touch-none cursor-crosshair"
        />

        {/* Instruction Strip at Bottom of Canvas */}
        <div className="bg-white/95 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
          <span>
            💡 المسِي الدجاجة مباشرةً أو حرّكي سلة «حور» يميناً ويساراً وتفادي البيض المتساقط!
          </span>
          <span className="font-extrabold text-sky-800 tabular-nums">
            النقاط: {score}
          </span>
        </div>

        {/* Pause Overlay */}
        {isPaused && stageState === 'playing' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl space-y-4">
              <h3 className="text-xl font-extrabold text-slate-900">اللعبة متوقفة مؤقتاً</h3>
              <p className="text-sm font-bold text-slate-600">
                خذي استراحة قصيرة يا بطلة أو أضيفي حياة جديدة!
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="w-full py-3 min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base cursor-pointer"
                >
                  متابعة اللعب
                </button>
                <button
                  type="button"
                  onClick={onRequestBuyLife}
                  className="w-full py-3 min-h-[48px] rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-sm cursor-pointer"
                >
                  ❤️ الحصول على حياة إضافية (حل سؤال بسيط)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Out of Lives Overlay */}
        {stageState === 'out_of_lives' && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full text-center shadow-xl border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Heart className="w-9 h-9 fill-rose-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                انتهت القلوب يا بطلة حور!
              </h3>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                لا تقلقي أبداً! يمكنكِ الحصول على حياة جديدة فوراً ومتابعة المرحلة من نفس المكان عند حل مسألة بسيطة جداً.
              </p>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playWoodTap();
                    onRequestBuyLife();
                  }}
                  className="w-full py-3.5 px-5 min-h-[52px] rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <span>حل سؤال بسيط للحصول على حياة جديدة ❤️</span>
                </button>

                <button
                  type="button"
                  onClick={onExitToMap}
                  className="w-full py-2.5 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  العودة لخريطة المراحل
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage Victory Overlay with Quranic Ayah & Educational Quiz Between Levels */}
        {stageState === 'victory' && nextLevelId && (
          <BetweenLevelsModal
            completedLevelId={level.id}
            nextLevelId={nextLevelId}
            score={score}
            lives={lives}
            targetChickens={level.targetChickens}
            ageGroup={settings.ageGroup}
            difficulty={settings.difficulty}
            subject={settings.subject}
            visualHelpers={settings.visualHelpers}
            weaponLevel={weaponLevel}
            onUpgradeWeapon={onUpgradeWeapon}
            onContinueToNextLevel={() => {
              onRequestUnlockNextLevel(nextLevelId);
              onPlayNextLevel(nextLevelId);
            }}
            onReplayLevel={resetStage}
            onExitToMap={onExitToMap}
          />
        )}

        {/* Ultimate Level 20 Final Game Victory */}
        {stageState === 'victory' && !nextLevelId && (
          <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full text-center shadow-xl border-2 border-amber-400 space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={HOOR_PHOTO_URL}
                  alt="البطلة حور"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-3xl object-cover border-3 border-amber-400 shadow-md"
                />
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>

              <div className="text-xs font-black text-amber-700">
                🎉 ختمتِ جميع المراحل الـ ٢٠ بنجاح باهر!
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                ألف مبروك يا بطلة الأبطال حور! 👑
              </h3>

              {/* Quranic Ending Verse */}
              <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3 text-emerald-950 font-arabic text-lg font-bold">
                ﴿ وَآخِرُ دَعْوَاهُمْ أَنِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-600">
                جمعتِ أعلى الدرجات وحللتِ جميع المسائل التعليمية بنجاح وتألّق كبير!
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetStage}
                  className="w-full py-3 px-4 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm cursor-pointer"
                >
                  إعادة المرحلة الأخيرة
                </button>
                <button
                  type="button"
                  onClick={onExitToMap}
                  className="w-full py-3 px-4 min-h-[48px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm cursor-pointer"
                >
                  العودة لخريطة المراحل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
