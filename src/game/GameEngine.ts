import {
  GameState,
  Player,
  Bystander,
  Chaser,
  Obstacle,
  Coin,
  Powerup,
  Particle,
  FloatingText,
  InputState,
  GameStats,
  CharacterSkin,
  Shockwave,
  IntroState,
  IntroVictim,
} from './types.ts';
import {
  CHARACTER_SKINS,
  BYSTANDER_TEMPLATES,
  COMIC_WORDS,
  ROAD_WIDTH,
  ROAD_LANES,
  SIDEWALK_EDGES,
  SLAP_REACH,
  MOB_SAFE_DISTANCE,
} from './constants.ts';
import { sounds } from './SoundEngine.ts';
import { ThreeGameRenderer } from './ThreeGameRenderer.ts';
import { LevelDefinition, getLevel, calculateLevelStars, saveLevelResult, loadLevelProgress } from './levels.ts';
import { MapDefinition, GAME_MAPS, getMapById } from './maps.ts';
import { Achievement, evaluateAchievements, loadAchievementStorage } from './achievements.ts';
import { loadSettings } from './settings.ts';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: ThreeGameRenderer;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Game States
  public state: GameState = 'MENU';
  public selectedSkin: CharacterSkin = CHARACTER_SKINS[0];

  // Level & Map System
  public currentLevel: number = 1;
  public isLevelMode: boolean = false;
  public currentMap: MapDefinition = GAME_MAPS[0];
  public currentLevelDef?: LevelDefinition;
  public boostJumpsCount: number = 0;
  public nearMissesCount: number = 0;
  public escapedCount: number = 0;
  public onAchievementUnlocked?: (achievement: Achievement) => void;
  public onLevelCompleted?: (level: number, stars: number, score: number, coinsEarned: number) => void;

  // Entities
  public player!: Player;
  public bystanders: Bystander[] = [];
  public chasers: Chaser[] = [];
  public obstacles: Obstacle[] = [];
  public coins: Coin[] = [];
  public powerups: Powerup[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public shockwaves: Shockwave[] = [];

  // Procedural Spawning
  private nextSpawnY: number = 300;
  private entityIdCounter: number = 1;

  // 3-Lane Alignment (Left: index 0 = -90, Center: index 1 = 0, Right: index 2 = 90)
  public currentLaneIndex: number = 1; // Always lands squarely in center of lane!
  private joystickLaneChanged: boolean = false;

  // Opening Cinematic Mega Slap Sequence
  public introState: IntroState = {
    active: false,
    phase: 'DONE',
    timer: 0,
    victim: null,
  };

  // Input
  public input: InputState = {
    joystick: { active: false, x: 0, y: 0 },
    keys: { left: false, right: false, up: false, down: false, slap: false },
    slapRequested: false,
  };

  // Stats
  public stats: GameStats = {
    score: 0,
    highScore: 0,
    coins: 0,
    totalCoinsCollected: 0,
    slapsCount: 0,
    chaosLevel: 0,
    chaosMultiplier: 1,
    feverActive: false,
    distanceRun: 0,
    comboStreak: 0,
    maxCombo: 0,
    longestChaseEscape: 0,
    stamina: 100,
    maxStamina: 100,
    chaserOnScreen: false,
    chaserAlertTimer: 0,
    mobDistance: 180,
    currentLevel: 1,
    isLevelMode: false,
    currentMapId: 'market',
    boostJumpsCount: 0,
    nearMissesCount: 0,
    escapedCount: 0,
  };

  // Callback to sync stats with React UI
  private onStatsUpdate?: (stats: GameStats, state: GameState) => void;
  public onHurtFlash?: () => void;
  public paceMultiplier: number = 1.0;
  private hitFreezeMs: number = 0;
  private passiveRunTimer: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    onStatsUpdate?: (stats: GameStats, state: GameState) => void,
    onHurtFlash?: () => void
  ) {
    this.canvas = canvas;
    this.onHurtFlash = onHurtFlash;
    this.renderer = new ThreeGameRenderer(this.canvas);
    this.onStatsUpdate = onStatsUpdate;

    const currentSettings = loadSettings();
    this.renderer.setCharacterFocus(currentSettings.characterFocus !== 'classic');

    this.loadHighScore();
    this.initPlayer();

    // Populate initial market boulevard for Menu attract showcase
    for (let i = 0; i < 6; i++) {
      this.spawnMarketSegment(250 + i * 160);
    }

    // Start render loop immediately so Menu shows living 3D world
    this.lastTime = performance.now();
    this.loop();
  }

  private loadHighScore(): void {
    try {
      const savedHigh = localStorage.getItem('slap_run_highscore');
      if (savedHigh) this.stats.highScore = parseInt(savedHigh, 10) || 0;
      const savedCoins = localStorage.getItem('slap_run_total_coins');
      if (savedCoins) this.stats.totalCoinsCollected = parseInt(savedCoins, 10) || 0;
    } catch {
      // ignore
    }
  }

  private saveHighScore(): void {
    try {
      if (this.stats.score > this.stats.highScore) {
        this.stats.highScore = this.stats.score;
        localStorage.setItem('slap_run_highscore', String(this.stats.highScore));
      }
      localStorage.setItem('slap_run_total_coins', String(this.stats.totalCoinsCollected));
    } catch {
      // ignore
    }
  }

  public setSkin(skin: CharacterSkin): void {
    this.selectedSkin = skin;
    if (this.player) {
      this.player.skin = skin;
    }
    this.renderer.setSkin(skin);
  }

  public setLevel(levelNumber: number, isLevelMode: boolean = true): void {
    this.currentLevel = Math.max(1, levelNumber);
    this.isLevelMode = isLevelMode;
    this.currentLevelDef = getLevel(this.currentLevel);
    const targetMap = getMapById(this.currentLevelDef.mapId);
    this.setMap(targetMap);
    this.stats.currentLevel = this.currentLevel;
    this.stats.isLevelMode = isLevelMode;
    this.stats.levelTargetDistance = this.currentLevelDef.targetDistance;
    this.stats.levelTargetSlaps = this.currentLevelDef.targetSlaps;
    this.stats.levelTargetCoins = this.currentLevelDef.targetCoins;
    this.stats.levelTitle = this.currentLevelDef.title;
    this.stats.levelComplete = false;
    this.stats.levelStars = 0;
  }

  public setMap(map: MapDefinition): void {
    this.currentMap = map;
    this.stats.currentMapId = map.id;
    this.renderer.setMap(map);
  }

  public triggerAchievementCheck(extra: { rampHit?: boolean; nearMissHit?: boolean; escapedHit?: boolean } = {}): void {
    const progress = loadLevelProgress();
    let totalStars = 0;
    Object.values(progress.levelStars).forEach((s) => {
      totalStars += s;
    });
    let skinsCount = 1;
    try {
      const s = localStorage.getItem('slap_run_unlocked_skins');
      if (s) skinsCount = JSON.parse(s).length;
    } catch {}

    const unlocked = evaluateAchievements(this.stats, {
      unlockedLevel: progress.unlockedLevel,
      totalStars,
      unlockedSkinsCount: skinsCount,
      currentMapId: this.currentMap.id,
      ...extra,
    });

    for (const ach of unlocked) {
      sounds.playAchievement();
      this.addFloatingText(this.player.x, this.player.y + 55, `🏆 ${ach.title}!`, '#FDE047', 24);
      this.onAchievementUnlocked?.(ach);
    }
  }

  public resize(width: number, height: number, dpr: number = 1): void {
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.renderer.resize(width, height, dpr);
  }

  public setCharacterFocus(enabled: boolean): void {
    if (this.renderer) {
      this.renderer.setCharacterFocus(enabled);
    }
  }

  public startGame(): void {
    this.initPlayer();
    this.currentLaneIndex = 1; // Squarely in center lane (0)
    this.stats.currentLane = 1;
    this.player.x = 0;
    this.player.y = 0;
    this.player.z = 0;

    this.bystanders = [];
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.nextSpawnY = 280;

    // Lead Officer / Inspector Chaser following behind
    this.chasers = [
      {
        id: 9001,
        x: 0,
        y: this.player.y - 180, // far behind off-screen initially
        speed: this.player.baseSpeed,
        bodyColor: '#F4C29E',
        shirtColor: '#1E3A8A', // Police Navy
        angrySteamTimer: 100,
        runCycle: 0,
        animOffset: 0,
      },
    ];

    this.stats.score = 0;
    this.stats.slapsCount = 0;
    this.stats.coins = 0;
    this.stats.chaosLevel = 0;
    this.stats.chaosMultiplier = 1;
    this.stats.feverActive = false;
    this.stats.distanceRun = 0;
    this.stats.comboStreak = 0;
    this.stats.maxCombo = 0;
    this.stats.stamina = 100;
    this.stats.maxStamina = 100;
    this.stats.chaserOnScreen = false;
    this.stats.chaserAlertTimer = 0;
    this.stats.mobDistance = 180;
    this.stats.gameOverReason = undefined;
    this.passiveRunTimer = 0;
    this.boostJumpsCount = 0;
    this.nearMissesCount = 0;
    this.escapedCount = 0;
    this.stats.boostJumpsCount = 0;
    this.stats.nearMissesCount = 0;
    this.stats.escapedCount = 0;
    this.stats.levelComplete = false;
    this.stats.levelStars = 0;
    this.stats.currentLevel = this.currentLevel;
    this.stats.isLevelMode = this.isLevelMode;
    this.stats.currentMapId = this.currentMap.id;

    if (this.isLevelMode) {
      this.currentLevelDef = getLevel(this.currentLevel);
      this.stats.levelTargetDistance = this.currentLevelDef.targetDistance;
      this.stats.levelTargetSlaps = this.currentLevelDef.targetSlaps;
      this.stats.levelTargetCoins = this.currentLevelDef.targetCoins;
      this.stats.levelTitle = this.currentLevelDef.title;
      const targetMap = getMapById(this.currentLevelDef.mapId);
      this.setMap(targetMap);
    }

    // Pre-populate initial street with bystanders and balanced 3-lane obstacles
    for (let i = 0; i < 4; i++) {
      this.spawnMarketSegment(320 + i * 240);
    }

    // Initialize Intro Cinematic Slap Sequence: target positioned squarely in the middle of the road!
    this.introState = {
      active: true,
      phase: 'WINDUP',
      timer: 0,
      victim: {
        x: 0, // Middle of the road
        y: 30, // Right in front of the player
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        slapped: false,
        glassesFlew: false,
        hatFlew: false,
        name: 'THE MARKET BOSS',
        title: 'Bazaar Boss',
      },
    };

    this.stats.introActive = true;
    this.stats.introPhase = 'WINDUP';
    sounds.playIntroWindup();

    this.state = 'PLAYING';

    if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
    this.lastTime = performance.now();
  }

  public restartGame(): void {
    this.startGame();
  }

  public resetToMenu(): void {
    this.state = 'MENU';
    this.introState = {
      active: false,
      phase: 'DONE',
      timer: 0,
      victim: null,
    };
    this.stats.introActive = false;
    this.stats.introPhase = 'DONE';
    sounds.stopArcadeBeat();
    this.initPlayer();
    this.bystanders = [];
    this.chasers = [];
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.nextSpawnY = 250;
    for (let i = 0; i < 6; i++) {
      this.spawnMarketSegment(250 + i * 160);
    }
    if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
  }

  /**
   * Snappy 3-Lane Switcher: character always lands squarely in the center of a lane!
   * Regardless of which of the three lanes you move into, character aligns squarely with the lane center.
   */
  public changeLane(direction: -1 | 1): void {
    if (this.introState.active) return;
    const newIndex = Math.max(0, Math.min(ROAD_LANES.length - 1, this.currentLaneIndex + direction));
    if (newIndex !== this.currentLaneIndex) {
      this.currentLaneIndex = newIndex;
      this.stats.currentLane = this.currentLaneIndex;
      sounds.playWhoosh();
    }
  }

  /**
   * Triggers the opening mega slap immediately if user taps or presses Space during windup
   */
  public triggerIntroSlapNow(): void {
    if (this.introState.active && this.introState.phase === 'WINDUP') {
      this.executeIntroSlap();
    }
  }

  /**
   * Execute the colossal introductory slap on the boss positioned in the middle of the road
   */
  public executeIntroSlap(): void {
    if (!this.introState.active || this.introState.phase !== 'WINDUP' || !this.introState.victim) return;

    this.introState.phase = 'SLAP_IMPACT';
    const v = this.introState.victim;
    v.slapped = true;
    this.player.isSlapping = true;
    this.player.slapProgress = 0.5;
    this.player.slapHand = 'right';

    // Massive impact physics: victim flies backwards and launches into the sky
    v.vx = (Math.random() - 0.5) * 6;
    v.vy = 26; // flies forward down the road
    v.vz = 22; // launches high up
    v.rotationX = 8.5;
    v.rotationY = 4.2;
    v.rotationZ = 12.0;
    v.glassesFlew = true;
    v.hatFlew = true;

    // Tactical hit-stop frame freeze & massive screen shake!
    this.hitFreezeMs = 90;
    this.renderer.triggerShake(24);
    this.renderer.triggerHitFreeze(3);

    // Audio impact
    sounds.playMegaSlap();

    // Mobile haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 40, 80]);
      } catch {}
    }

    // Colossal comic popups & particles
    this.addFloatingText(0, 45, 'MEGA SLAP!!', '#FFFDF0', 36);
    this.addFloatingText(0, 75, '+500 OPENING BONUS!', '#10B981', 22);
    this.spawnParticleExplosion(0, 32, '#F59E0B', 24, 'star');
    this.spawnParticleExplosion(0, 32, '#EC4899', 16, 'sparkle');
    this.spawnConfettiShower(0, 35);

    this.shockwaves.push({
      x: 0,
      y: 32,
      radius: 12,
      maxRadius: 75,
      color: '#EC4899',
      lineWidth: 4.5,
      life: 20,
      maxLife: 20,
    });

    this.stats.score += 500;
    this.stats.slapsCount += 1;
    this.stats.comboStreak = 1;
    this.stats.stamina = 100;
    this.stats.introPhase = 'SLAP_IMPACT';
    if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
  }

  private initPlayer(): void {
    // Faster running speed as requested (base 5.2 + skin bonus)
    const calculatedBase = (5.2 + this.selectedSkin.speedBonus) * (this.paceMultiplier || 1.0);
    this.player = {
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vz: 0,
      speed: calculatedBase,
      baseSpeed: calculatedBase,
      slapCooldown: 0,
      isSlapping: false,
      slapHand: 'right',
      slapProgress: 0,
      slipTimer: 0,
      feverTime: 0,
      skin: this.selectedSkin,
      runCycle: 0,
      stamina: 100,
    };
    if (this.renderer) {
      this.renderer.resetTrack(0);
      this.renderer.resetCamera(0);
    }
  }

  public requestSlap(): void {
    this.input.slapRequested = true;
  }

  public requestJump(): void {
    if (this.introState.active || this.state !== 'PLAYING') return;
    const p = this.player;
    if (!p) return;
    if (p.z <= 0.6 && p.vz <= 0.2) {
      p.vz = 7.2;
      sounds.playJump();
      this.spawnParticleExplosion(p.x, p.y, '#E2E8F0', 6, 'cloud');
    }
  }

  public applySettings(settings: any): void {
    if (!this.renderer) return;
    this.renderer.setShakeEnabled(settings.cameraShake);
    this.renderer.setReducedMotion(Boolean(settings.reducedMotion));
    this.renderer.setCharacterFocus(settings.characterFocus !== 'classic');
  }

  public pauseGame(): void {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      sounds.stopArcadeBeat();
      if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
    }
  }

  public resumeGame(): void {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      sounds.startArcadeBeat();
      this.lastTime = performance.now();
      if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
    }
  }

  private loop = (): void => {
    const now = performance.now();
    const dt = Math.min(32, now - this.lastTime); // Cap delta time
    this.lastTime = now;

    // Tactical arcade hit-stop freeze (50-70ms) to give slap impacts maximum weight!
    if (this.hitFreezeMs > 0) {
      this.hitFreezeMs -= dt;
      this.render();
      this.animFrameId = requestAnimationFrame(this.loop);
      return;
    }

    if (this.state === 'PLAYING') {
      this.update(dt / 16.666); // Normalized to ~60fps
    } else if (this.state === 'MENU') {
      this.updateMenu(dt / 16.666);
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private updateMenu(dtFactor: number): void {
    // Active runner jog in Menu mode (matches live gameplay!)
    this.player.speed = this.player.baseSpeed || 4.8;
    this.player.runCycle += 0.12 * dtFactor;
    this.player.y += this.player.speed * dtFactor;
    if (this.player.y + 750 > this.nextSpawnY) {
      this.spawnMarketSegment(this.nextSpawnY);
      this.nextSpawnY += 160;
    }
  };

  private update(dtFactor: number): void {
    const p = this.player;

    // 0. Introductory Cinematic Slap Sequence (Opening mega slap in middle of road)
    if (this.introState.active) {
      this.updateIntroSequence(dtFactor);
      this.updateParticlesAndTexts(dtFactor);
      if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
      return;
    }

    // 1. Fever Run Timer
    if (p.feverTime > 0) {
      p.feverTime -= 16.66 * dtFactor;
      this.stats.feverActive = true;
      if (p.feverTime <= 0) {
        p.feverTime = 0;
        this.stats.feverActive = false;
        this.stats.chaosLevel = 25; // Drop chaos back to a manageable level
        this.updateChaosMultiplier();
      }
    } else {
      this.stats.feverActive = false;
      // Gentle decay of chaos meter if not in Fever mode
      if (this.stats.chaosLevel > 0) {
        this.stats.chaosLevel = Math.max(0, this.stats.chaosLevel - 0.04 * dtFactor);
        this.updateChaosMultiplier();
      }
    }

    // 2. Health / Stamina Depletion
    // "Each time the player lands a slap, their health/stamina is replenished.
    // If they stop slapping, their health will gradually deplete, eventually leading to a game over."
    if (!this.stats.feverActive) {
      // Depletes ~3.3% per second at ~60fps
      p.stamina = Math.max(0, p.stamina - 0.055 * dtFactor);
      this.stats.stamina = Math.round(p.stamina);
      if (p.stamina <= 0) {
        this.triggerGameOver('EXHAUSTED');
        return;
      }
    } else {
      this.stats.stamina = Math.round(p.stamina);
    }

    // 2a. Stumble / Slip timer
    if (p.slipTimer > 0) {
      p.slipTimer -= dtFactor;
    }

    // 2b. Vertical Jump Elevation Physics
    if (p.z > 0 || p.vz !== 0) {
      p.z += p.vz * dtFactor;
      p.vz -= 0.42 * dtFactor;
      if (p.z <= 0) {
        p.z = 0;
        p.vz = 0;
      }
    }

    // 3. Forward Speed calculation (faster base speed, gradually increases with distance)
    const speedProgressBonus = Math.min(3.8, (p.y / 5000) * 1.5);
    let currentSpeed = (p.baseSpeed + speedProgressBonus);
    if (this.stats.feverActive) {
      currentSpeed *= 1.45; // Super turbo in Fever
    } else if (p.slipTimer > 0) {
      currentSpeed *= 0.65; // Stumble slowdown
    } else if (Math.abs(p.x) > 125) {
      // Rough sidewalk curb friction on outer edges
      currentSpeed *= 0.88;
    }
    p.speed = currentSpeed;
    p.y += p.speed * dtFactor;
    this.stats.distanceRun = Math.floor(p.y / 10);

    // Run cycle animation
    p.runCycle += 0.05 * p.speed * dtFactor;

    // 4. Snappy 3-Lane Alignment (Left: -90, Center: 0, Right: +90)
    // "when you move your character left or right, they should always land squarely in the center of a lane."
    if (this.input.joystick.active) {
      if (Math.abs(this.input.joystick.x) > 0.35) {
        if (!this.joystickLaneChanged) {
          this.changeLane(this.input.joystick.x > 0 ? 1 : -1);
          this.joystickLaneChanged = true;
        }
      } else if (Math.abs(this.input.joystick.x) < 0.15) {
        this.joystickLaneChanged = false;
      }
    } else {
      this.joystickLaneChanged = false;
    }

    // Smooth snappy glide ensuring character always lands squarely in the center of the lane
    const targetX = ROAD_LANES[this.currentLaneIndex];
    const diff = targetX - p.x;
    if (Math.abs(diff) > 0.4) {
      p.vx = diff * 12.0;
      p.x += diff * Math.min(1.0, 0.28 * dtFactor);
    } else {
      p.x = targetX;
      p.vx = 0;
    }

    // Clamp inside 3-lane road limits (-125 to 125)
    const maxBound = ROAD_WIDTH / 2 - 15;
    if (p.x < -maxBound) p.x = -maxBound;
    if (p.x > maxBound) p.x = maxBound;

    // 5. Slap Action Logic
    if (p.slapCooldown > 0) {
      p.slapCooldown -= dtFactor;
    }

    if (this.input.slapRequested || this.input.keys.slap) {
      this.input.slapRequested = false;
      this.executeSlap();
    }

    // Progress active slap animation
    if (p.isSlapping) {
      p.slapProgress += 0.14 * dtFactor;
      if (p.slapProgress >= 1) {
        p.isSlapping = false;
        p.slapProgress = 0;
      }
    }

    // 6. Update Bystanders & Check for missed Slap window
    for (const b of this.bystanders) {
      // Directional Slap Knockback
      if (b.knockbackVx) {
        b.x += b.knockbackVx * 0.016 * dtFactor;
        b.knockbackVx *= 0.85;
        if (Math.abs(b.knockbackVx) < 0.8) b.knockbackVx = 0;
      }

      if (!b.slapped) {
        const dy = b.y - p.y;
        const dx = Math.abs(b.x - p.x);
        b.inStrikeRange = dy >= -25 && dy <= 65 && dx <= SLAP_REACH;

      } else {
        b.inStrikeRange = false;
        if (b.wobble > 0) {
          b.wobble -= 0.05 * dtFactor;
        }
      }
      // Update flying accessory knocked into the air
      if (b.flyingAccessory) {
        const fa = b.flyingAccessory;
        fa.x += fa.vx * dtFactor;
        fa.y += fa.vy * dtFactor;
        fa.rotation += 0.15 * dtFactor;
        fa.vy -= 0.25 * dtFactor; // gravity
      }
    }

    // 7. Update Subway Surfers Style Chaser Pursuit
    // Rules from prompt:
    // - Chaser/mob is always following behind the player.
    // - If player successfully navigates past obstacles, they are NOT visible on screen (staying back ~180 units).
    // - Hitting a single obstacle causes them to appear on-screen (~40 units behind, breathing down your neck!).
    // - If they are visible on-screen and player hits a second obstacle -> BUSTED (caught)!
    // - If player runs cleanly for 6 seconds without hitting an obstacle, chaser falls back off-screen again.
    if (this.chasers.length > 0) {
      const leadChaser = this.chasers[0];

      // If chaser is currently visible on-screen:
      if (this.stats.chaserOnScreen) {
        this.stats.chaserAlertTimer -= dtFactor / 60;
        if (this.stats.chaserAlertTimer <= 0) {
          // Navigated past obstacles cleanly!
          this.stats.chaserOnScreen = false;
          this.stats.chaserAlertTimer = 0;
          this.escapedCount++;
          this.stats.escapedCount = this.escapedCount;
          sounds.playEscaped();
          this.addFloatingText(p.x, p.y + 25, 'ESCAPED CHASER! +150', '#10B981', 22);
          this.stats.score += 150 * this.stats.chaosMultiplier;
          this.triggerAchievementCheck({ escapedHit: true });
        }
      }

      // Desired distance:
      // When on-screen: 72 units (visible behind player without blocking screen or player view!)
      // When off-screen: 220 units (completely behind camera)
      const targetDist = this.stats.chaserOnScreen ? 72 : 220;
      const currentDist = p.y - leadChaser.y;
      const distDiff = currentDist - targetDist;

      leadChaser.speed = p.speed + (distDiff * 0.12);
      leadChaser.y += leadChaser.speed * dtFactor;
      // Flank to the side so chaser doesn't run directly in the camera line of sight to player:
      const flankTargetX = p.x + (p.x >= 0 ? -38 : 38);
      leadChaser.x += (flankTargetX - leadChaser.x) * 0.12 * dtFactor;
      leadChaser.runCycle += 0.08 * dtFactor;
      leadChaser.angrySteamTimer += 0.08 * dtFactor;

      // Other mob members follow tightly in a cluster
      for (let i = 1; i < this.chasers.length; i++) {
        const c = this.chasers[i];
        c.runCycle += 0.07 * dtFactor;
        const targetY = leadChaser.y - (i * 16);
        c.y += (targetY - c.y) * 0.2 * dtFactor;
        const flankOffset = i % 2 === 1 ? -22 : 22;
        c.x += (leadChaser.x + flankOffset - c.x) * 0.14 * dtFactor;
      }

      this.stats.mobDistance = Math.round(p.y - leadChaser.y);
    }

    // 8. Obstacle Collisions & Traps
    for (const obs of this.obstacles) {
      if (obs.type === 'barrel') {
        obs.y -= (obs.rollSpeed ?? 1.8) * dtFactor;
        obs.rotation = (obs.rotation ?? 0) + 0.12 * dtFactor;
        if (obs.vx) {
          obs.x += obs.vx * dtFactor;
          // Bounce off sidewalk curb barriers (-215 to 215)
          if (obs.x < -215) {
            obs.x = -215;
            obs.vx = Math.abs(obs.vx);
          } else if (obs.x > 215) {
            obs.x = 215;
            obs.vx = -Math.abs(obs.vx);
          }
        }
      }

      if (obs.hit) continue;
      const dy = Math.abs(p.y - obs.y);
      const dx = Math.abs(p.x - obs.x);

      // Launch Ramp Trigger
      if (obs.type === 'ramp' && dy < 24 && dx < 24) {
        obs.hit = true;
        sounds.playJump();
        p.vz = 8.5; // High launch jump!
        this.renderer.triggerShake(3);
        this.boostJumpsCount++;
        this.stats.boostJumpsCount = this.boostJumpsCount;
        this.stats.score += 150 * this.stats.chaosMultiplier;
        this.addFloatingText(p.x, p.y + 20, 'BOOST JUMP!', '#10B981', 24);
        this.spawnParticleExplosion(obs.x, obs.y, '#34D399', 10, 'sparkle');
        this.triggerAchievementCheck({ rampHit: true });
        continue;
      }

      // If player is in the air jumping over ground obstacles (crates, barrels, carts)
      if (p.z > 7.5 && obs.type !== 'barrier') {
        if (dy < 22 && dx < (obs.width / 2 + 10)) {
          obs.hit = true;
          this.stats.score += 80 * this.stats.chaosMultiplier;
          sounds.playJump();
          this.addFloatingText(p.x, p.y + 25, 'LEAP OVER! +80', '#10B981', 18);
          this.spawnParticleExplosion(p.x, p.y, '#34D399', 6, 'sparkle');
        }
        continue;
      }

      if (dy < 20 && dx < (obs.width / 2 + 8)) {
        obs.hit = true;
        if (this.stats.feverActive) {
          // Ram through obstacle with explosive stars in fever mode!
          sounds.playWhack();
          this.renderer.triggerShake(5);
          this.spawnParticleExplosion(obs.x, obs.y, '#FDE047', 12);
          this.addFloatingText(obs.x, obs.y, 'SMASH!', '#FDE047', 22);
          this.stats.score += 200 * this.stats.chaosMultiplier;
        } else {
          // SUBWAY SURFERS TWO-HIT RULE:
          if (this.stats.chaserOnScreen) {
            // Hit a second obstacle in a row while chaser is on-screen!
            sounds.playWhack();
            this.renderer.triggerShake(14);
            this.addFloatingText(p.x, p.y + 20, 'BUSTED! CAUGHT!', '#EF4444', 26);
            this.triggerGameOver('BUSTED');
            return;
          } else {
            // First obstacle hit: Stumble & summon chaser onto screen!
            this.stats.chaserOnScreen = true;
            this.stats.chaserAlertTimer = 6.0; // 6 seconds to run cleanly to escape

            // Instantly surge lead chaser close enough to appear right on screen behind player
            if (this.chasers.length > 0) {
              this.chasers[0].y = p.y - 42;
              this.chasers[0].x = p.x;
            }

            sounds.playWhack();
            sounds.playPoliceWhistle();
            this.onHurtFlash?.();
            this.renderer.triggerShake(9);
            p.slipTimer = 25; // stumble slowdown
            this.stats.comboStreak = 0;
            this.addFloatingText(p.x, p.y + 20, '⚠️ CHASER ALERT! 1 MORE HIT = BUSTED!', '#EF4444', 20);
            this.spawnParticleExplosion(obs.x, obs.y, '#EF4444', 12, 'star');
          }
        }
      } else if (!obs.hit && !obs.nearMissChecked && obs.type !== 'ramp') {
        // High-Skill Near-Miss Dodge Bonus (+50 pts & crisp whoosh sound)
        const obsHalfW = obs.width / 2;
        if (dy < 24 && dx >= (obsHalfW + 12) && dx <= (obsHalfW + 36)) {
          obs.nearMissChecked = true;
          this.nearMissesCount++;
          this.stats.nearMissesCount = this.nearMissesCount;
          this.stats.score += 50 * this.stats.chaosMultiplier;
          this.addFloatingText(p.x, p.y + 35, 'CLOSE CALL! +50', '#38BDF8', 16);
          sounds.playNearMiss();
          this.triggerAchievementCheck({ nearMissHit: true });
        }
      }
    }

    // 9. Coin Pickups
    for (const c of this.coins) {
      if (c.collected) continue;
      c.bobPhase += 0.05 * dtFactor;
      const dy = Math.abs(p.y - c.y);
      const dx = Math.abs(p.x - c.x);
      if (dy < 24 && dx < 24) {
        c.collected = true;
        this.stats.coins++;
        this.stats.totalCoinsCollected++;
        this.stats.score += 50 * this.stats.chaosMultiplier;
        sounds.playCoin();
        this.spawnParticleExplosion(c.x, c.y, '#F59E0B', 8, 'sparkle');
        this.triggerAchievementCheck();
      }
    }

    // 10. Powerup Pickups
    for (const pu of this.powerups) {
      if (pu.collected) continue;
      pu.bobPhase += 0.05 * dtFactor;
      const dy = Math.abs(p.y - pu.y);
      const dx = Math.abs(p.x - pu.x);
      if (dy < 26 && dx < 26) {
        pu.collected = true;
        sounds.playPowerup();
        if (pu.type === 'soda') {
          // Instant turbo + refill chaos
          this.addChaos(35);
          this.addFloatingText(p.x, p.y + 20, 'TURBO SODA!', '#EF4444', 22);
          this.spawnParticleExplosion(pu.x, pu.y, '#EF4444', 12, 'star');
        } else {
          // Soap Bar gives brief slippery invulnerability
          p.feverTime = Math.max(p.feverTime, 3000);
          this.addFloatingText(p.x, p.y + 20, 'SLICK SOAP!', '#38BDF8', 22);
          this.spawnParticleExplosion(pu.x, pu.y, '#38BDF8', 12, 'cloud');
        }
      }
    }

    // 11-12. Update Particles, Popups, and Shockwaves
    this.updateParticlesAndTexts(dtFactor);

    // 13. Infinite Market Street Spawning (spaced generously so obstacles aren't too close)
    if (p.y + 700 > this.nextSpawnY) {
      this.spawnMarketSegment(this.nextSpawnY);
      this.nextSpawnY += 260 + Math.random() * 40;
    }

    // 14. Cleanup off-screen entities behind player (lead chaser is always preserved)
    const cleanupY = p.y - 350;
    this.bystanders = this.bystanders.filter((b) => b.y > cleanupY);
    this.obstacles = this.obstacles.filter((o) => o.y > cleanupY);
    this.coins = this.coins.filter((c) => c.y > cleanupY);
    this.powerups = this.powerups.filter((pu) => pu.y > cleanupY);
    this.chasers = this.chasers.filter((c) => c.id === 9001 || c.y > cleanupY);

    // 15. Level Progression & Milestone Goals
    if (this.isLevelMode && !this.stats.levelComplete && this.currentLevelDef) {
      const evaluation = calculateLevelStars(this.currentLevelDef, this.stats, { boostJumps: this.boostJumpsCount });
      if (evaluation.cleared) {
        this.stats.levelComplete = true;
        this.stats.levelStars = evaluation.stars;
        this.stats.coins += this.currentLevelDef.coinReward;
        this.stats.totalCoinsCollected += this.currentLevelDef.coinReward;
        sounds.playStageClear();
        this.addFloatingText(p.x, p.y + 40, 'STAGE CLEARED! ' + '⭐'.repeat(evaluation.stars), '#F59E0B', 30);
        this.addFloatingText(p.x, p.y + 65, `+${this.currentLevelDef.coinReward} LEVEL BONUS!`, '#10B981', 22);
        this.spawnConfettiShower(p.x, p.y + 35);
        saveLevelResult(this.currentLevel, evaluation.stars, this.stats.score);
        this.onLevelCompleted?.(this.currentLevel, evaluation.stars, this.stats.score, this.currentLevelDef.coinReward);
        this.triggerAchievementCheck();
      }
    } else if (!this.isLevelMode) {
      // Endless Mode Dynamic Level Scaling
      const endlessLevel = Math.max(1, Math.floor(1 + this.stats.distanceRun / 120 + this.stats.slapsCount / 5));
      if (endlessLevel > this.currentLevel) {
        this.currentLevel = endlessLevel;
        this.stats.currentLevel = endlessLevel;
        sounds.playLevelUp();
        this.addFloatingText(p.x, p.y + 40, `LEVEL UP! LV. ${endlessLevel}`, '#F59E0B', 28);
        this.spawnConfettiShower(p.x, p.y + 30);
        this.triggerAchievementCheck();
      }
    }

    // Sync stats with UI
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.stats, this.state);
    }
  }

  /**
   * Automatic animation of opening cinematic slap sequence
   */
  private updateIntroSequence(dtFactor: number): void {
    this.introState.timer += 16.66 * dtFactor;
    const v = this.introState.victim;

    if (this.introState.phase === 'WINDUP') {
      // Automatic animation: After 950ms, unleash the massive blow!
      // Or if the player hits Space or taps, execute immediately!
      if (this.introState.timer >= 950 || this.input.slapRequested || this.input.keys.slap) {
        this.input.slapRequested = false;
        this.input.keys.slap = false;
        this.executeIntroSlap();
      }
    } else if (this.introState.phase === 'SLAP_IMPACT' || this.introState.phase === 'BLAST_OFF') {
      if (v) {
        v.x += v.vx * dtFactor;
        v.y += v.vy * dtFactor;
        v.z += v.vz * dtFactor;
        v.vz -= 0.65 * dtFactor; // gravity pulls him down
        v.rotationX += 0.12 * dtFactor;
        v.rotationY += 0.08 * dtFactor;
        v.rotationZ += 0.15 * dtFactor;
      }

      // Progress player slap swing
      if (this.player.isSlapping) {
        this.player.slapProgress += 0.10 * dtFactor;
        if (this.player.slapProgress >= 1) {
          this.player.isSlapping = false;
          this.player.slapProgress = 0;
        }
      }

      // After 1700ms, the victim is blasted away, alarm sounds, and running begins!
      if (this.introState.timer >= 1700) {
        this.introState.active = false;
        this.introState.phase = 'DONE';
        this.stats.introActive = false;
        this.stats.introPhase = 'DONE';

        sounds.startArcadeBeat();
        sounds.updateBeatChaos(1);

        this.addFloatingText(0, 50, 'RUN FOR YOUR LIFE!', '#EF4444', 28);
        this.stats.chaserOnScreen = true;
        this.stats.chaserAlertTimer = 5;

        if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
      }
    }
  }

  /**
   * Shared particle, shockwave, and floating text physics update
   */
  private updateParticlesAndTexts(dtFactor: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dtFactor;
      pt.y += pt.vy * dtFactor;
      pt.life -= dtFactor;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += (ft.vy ?? 1.5) * dtFactor;
      ft.life -= dtFactor;
      ft.scale = Math.min(1.2, ft.scale + 0.02 * dtFactor);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.22 * dtFactor;
      sw.life -= dtFactor;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  /**
   * Execute the signature SLAP mechanic
   */
  private executeSlap(): void {
    const p = this.player;
    if (p.slapCooldown > 0) return;

    p.slapCooldown = 10; // Rapid slap cooldown
    p.isSlapping = true;
    p.slapProgress = 0;
    this.passiveRunTimer = 0;

    // Detect closest bystander in slap reach
    let hitBystander: Bystander | null = null;
    let minDistance = SLAP_REACH;

    for (const b of this.bystanders) {
      if (b.slapped) continue;

      const dy = b.y - p.y;
      // Valid slap window is alongside or slightly ahead of player
      if (dy >= -25 && dy <= 65) {
        const dx = b.x - p.x;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          hitBystander = b;
          p.slapHand = dx < 0 ? 'left' : 'right';
        }
      }
    }

    if (hitBystander) {
      const b = hitBystander;
      b.slapped = true;
      b.wobble = 1.0;
      this.hitFreezeMs = 65; // ~65ms tactical hit-stop frame freeze!

      // Directional Slap Knockback!
      const side = b.x >= p.x ? 1 : -1;
      b.knockbackVx = side * (160 + Math.random() * 80);

      // Knock off accessories into the air!
      b.flyingAccessory = {
        x: b.x,
        y: b.y + 10,
        vx: side * (3.5 + Math.random() * 4),
        vy: 5 + Math.random() * 3,
        rotation: 0,
      };

      // Play Sound
      sounds.playSlap(this.stats.comboStreak);
      this.renderer.triggerShake(5 + Math.min(8, this.stats.comboStreak));
      this.renderer.triggerHitFreeze(2);

      // Mobile Haptic Feedback
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(this.stats.comboStreak >= 4 ? [25, 20, 25] : 18);
        } catch {
          // ignore
        }
      }

      // Add Expanding Cartoon Shockwave
      this.shockwaves.push({
        x: b.x,
        y: b.y,
        radius: 10,
        maxRadius: 55,
        color: this.stats.feverActive ? '#EC4899' : '#F59E0B',
        lineWidth: 3.5,
        life: 14,
        maxLife: 14,
      });

      // Comic popup word in crisp arcade bone-white with amber core
      const comicWord = COMIC_WORDS[Math.floor(Math.random() * COMIC_WORDS.length)];
      this.addFloatingText(b.x, b.y + 30, comicWord, '#FFFDF0', 28);

      // Warm star particles explosion
      this.spawnParticleExplosion(b.x, b.y + 20, '#F59E0B', 12, 'star');

      // Confetti burst on high combo
      if (this.stats.comboStreak >= 5) {
        this.spawnConfettiShower(b.x, b.y + 20);
      }

      // Update Slap Stats & Chaos
      this.stats.slapsCount++;
      this.stats.comboStreak++;
      if (this.stats.comboStreak > this.stats.maxCombo) {
        this.stats.maxCombo = this.stats.comboStreak;
      }

      // REPLENISH STAMINA / HEALTH:
      p.stamina = Math.min(100, p.stamina + 35);
      this.stats.stamina = Math.round(p.stamina);
      sounds.playStaminaRefill();
      this.addFloatingText(b.x, b.y + 70, '+35 STAMINA!', '#10B981', 20);

      // Slapping also helps you pull away from chasing officer
      if (this.stats.chaserOnScreen) {
        this.stats.chaserAlertTimer = Math.max(0, this.stats.chaserAlertTimer - 1.2);
      }

      this.addChaos(18); // Fills chaos meter
      const slapPoints = b.points * this.stats.chaosMultiplier;
      this.stats.score += slapPoints;
      this.triggerAchievementCheck();

      // Add points floating popup
      this.addFloatingText(b.x, b.y + 52, `+${slapPoints}`, '#F59E0B', 18);

      // Angry shout popup from slapped person!
      const shouts = ['GET BACK HERE!', 'YOU SLAPPED ME!', 'HEY!', 'MY SHIRT!'];
      const shout = shouts[Math.floor(Math.random() * shouts.length)];
      this.addFloatingText(b.x, b.y + 40, shout, '#EF4444', 20);

      // That EXACT slapped bystander turns furious and steps onto the road directly BEHIND the runner!
      const slappedId = b.id;
      const slappedBodyColor = b.bodyColor;
      const slappedShirtColor = b.shirtColor;

      setTimeout(() => {
        if (this.state === 'PLAYING' && this.chasers.length < 6) {
          // Remove the bystander from sidewalk so they don't remain standing there as a duplicate!
          this.bystanders = this.bystanders.filter((item) => item.id !== slappedId);

          // Spawn directly BEHIND the player on the road (not flanking on the side!)
          const chaserSpawnY = this.player.y - (95 + this.chasers.length * 15);
          const chaserSpawnX = this.player.x + (Math.random() * 20 - 10);

          // Add the same person with their exact shirt & skin color as a chaser!
          this.chasers.push({
            id: slappedId,
            x: chaserSpawnX,
            y: chaserSpawnY,
            speed: p.baseSpeed * 0.94,
            bodyColor: slappedBodyColor,
            shirtColor: slappedShirtColor,
            angrySteamTimer: 100,
            runCycle: 0,
            animOffset: Math.random() * 5,
          });
        }
      }, 240);
    } else {
      // Slapped thin air
      sounds.playWhoosh();
    }
  }

  /**
   * Increase Chaos Meter and update multiplier
   */
  private addChaos(amount: number): void {
    const prevMult = this.stats.chaosMultiplier;
    this.stats.chaosLevel = Math.min(100, this.stats.chaosLevel + amount);

    if (this.stats.chaosLevel >= 100 && !this.stats.feverActive) {
      // TRIGGER FEVER RUN!
      this.player.feverTime = 5500; // 5.5 seconds of pure invincibility and double points
      sounds.playFeverStart();
      this.renderer.triggerShake(8);
      this.addFloatingText(this.player.x, this.player.y + 35, 'FEVER RUN!', '#EC4899', 32);
      this.spawnParticleExplosion(this.player.x, this.player.y, '#F43F5E', 20, 'star');
    }

    this.updateChaosMultiplier();

    if (this.stats.chaosMultiplier > prevMult) {
      sounds.playChaosAlarm();
      sounds.updateBeatChaos(this.stats.chaosMultiplier);
      this.addFloatingText(
        this.player.x,
        this.player.y + 25,
        `${this.stats.chaosMultiplier}x MULTIPLIER!`,
        '#F59E0B',
        24
      );
    }
  }

  private updateChaosMultiplier(): void {
    const level = this.stats.chaosLevel;
    if (this.stats.feverActive) {
      this.stats.chaosMultiplier = 16;
    } else if (level >= 75) {
      this.stats.chaosMultiplier = 8;
    } else if (level >= 50) {
      this.stats.chaosMultiplier = 4;
    } else if (level >= 25) {
      this.stats.chaosMultiplier = 2;
    } else {
      this.stats.chaosMultiplier = 1;
    }
  }

  /**
   * Balanced 3-Lane Procedural Market Segment Generator
   * - 3 lanes: [-90, 0, 90] (Left: -90, Center: 0, Right: 90)
   * - Obstacles in 1 or 2 lanes, ALWAYS leaving at least 1 open escape route
   * - Left & right paths have more obstacles to balance proximity to slap targets
   * - Coins spawn squarely in open escape lanes
   * - Zero yellow obstacles (banana peel completely removed)
   */
  private spawnMarketSegment(targetY: number): void {
    const lanes = ROAD_LANES; // [-90, 0, 90]
    const dist = this.stats.distanceRun;

    // 1. Spawn Bystanders along left and right sidewalk platforms
    // (Bystanders stand at -155 or +155, easily slappable when player is in lane -90 or +90)
    const numBystanders = Math.random() > 0.35 ? 2 : 1;
    for (let i = 0; i < numBystanders; i++) {
      const template = BYSTANDER_TEMPLATES[Math.floor(Math.random() * BYSTANDER_TEMPLATES.length)];
      const side = (i === 0 ? (Math.random() > 0.5 ? 1 : -1) : (Math.random() > 0.5 ? -1 : 1));
      const bx = side * (155 + Math.random() * 8);
      const by = targetY + (Math.random() * 50 - 25);

      this.bystanders.push({
        id: this.entityIdCounter++,
        x: bx,
        y: by,
        type: template.type,
        name: template.name,
        points: template.points,
        bodyColor: template.bodyColor,
        shirtColor: template.shirtColor,
        accessory: template.accessory,
        slapped: false,
        wobble: 0,
      });
    }

    // 2. Dynamic Fair Difficulty Progression based on distance run
    // - Phase 1 (0-180m): Gentle learning curve - strictly 1 obstacle per segment, 2 open lanes
    // - Phase 2 (180-500m): 1 or 2 obstacles, varied patterns
    // - Phase 3 (500m+): Dynamic challenging obstacle combinations (never impassable!)
    let obstacleLaneCount = 1;
    if (dist < 180) {
      obstacleLaneCount = 1;
    } else if (dist < 500) {
      obstacleLaneCount = Math.random() < 0.65 ? 1 : 2;
    } else {
      obstacleLaneCount = Math.random() < 0.35 ? 1 : 2;
    }

    // Balanced lane weights so all 3 lanes feel exciting and open
    const laneWeights = [1.5, 1.0, 1.5];
    const availableLaneIndices = [0, 1, 2];
    const chosenLanes: number[] = [];

    for (let o = 0; o < obstacleLaneCount; o++) {
      let totalW = 0;
      for (const idx of availableLaneIndices) totalW += laneWeights[idx];
      let roll = Math.random() * totalW;
      let selectedIdx = availableLaneIndices[0];
      for (const idx of availableLaneIndices) {
        roll -= laneWeights[idx];
        if (roll <= 0) {
          selectedIdx = idx;
          break;
        }
      }
      chosenLanes.push(lanes[selectedIdx]);
      const removePos = availableLaneIndices.indexOf(selectedIdx);
      if (removePos !== -1) availableLaneIndices.splice(removePos, 1);
    }

    const occupiedLanes = new Set<number>(chosenLanes);

    // Obstacle types: crates, barriers, barrels, carts, and jump ramps
    const obstacleTypes: ('crate' | 'barrier' | 'barrel' | 'cart' | 'ramp')[] = [
      'crate',
      'barrier',
      'barrel',
      'cart',
      'ramp',
    ];

    for (let i = 0; i < chosenLanes.length; i++) {
      const ox = chosenLanes[i];
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const oy = targetY + 45 + i * 20;

      let width = 30;
      let height = 22;
      if (type === 'barrier') {
        width = 38;
      } else if (type === 'ramp') {
        width = 42;
        height = 26;
      } else if (type === 'cart') {
        width = 38;
        height = 24;
      } else if (type === 'barrel') {
        width = 28;
      }

      this.obstacles.push({
        id: this.entityIdCounter++,
        x: ox,
        y: oy,
        type,
        width,
        height,
        hit: false,
        rollSpeed: type === 'barrel' ? 1.4 + Math.random() * 0.3 : 0,
        vx: 0, // Barrels roll straight down their own lane squarely
      });
    }

    // 3. Gold Coins mark the open escape routes squarely!
    const openLanes = lanes.filter((l) => !occupiedLanes.has(l));
    if (openLanes.length > 0) {
      const numCoinLanes = Math.min(openLanes.length, Math.random() > 0.45 ? 2 : 1);
      const shuffledOpen = [...openLanes].sort(() => Math.random() - 0.5);

      for (let cl = 0; cl < numCoinLanes; cl++) {
        const coinLane = shuffledOpen[cl];
        for (let c = 0; c < 3; c++) {
          this.coins.push({
            id: this.entityIdCounter++,
            x: coinLane,
            y: targetY + c * 32,
            collected: false,
            bobPhase: c * 0.4,
          });
        }
      }
    }

    // 4. Occasional Powerup (Soda / Soap)
    if (Math.random() > 0.82) {
      const puType = Math.random() > 0.5 ? 'soda' : 'soap';
      const puLane = openLanes.length > 0 ? openLanes[0] : lanes[1];
      this.powerups.push({
        id: this.entityIdCounter++,
        x: puLane,
        y: targetY + 110,
        type: puType,
        collected: false,
        bobPhase: 0,
      });
    }
  }

  private spawnParticleExplosion(
    x: number,
    y: number,
    color: string,
    count: number = 8,
    shape: 'star' | 'circle' | 'cloud' | 'sparkle' = 'star'
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 5,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        shape,
      });
    }
  }

  private addFloatingText(
    x: number,
    y: number,
    text: string,
    color: string,
    size: number
  ): void {
    this.floatingTexts.push({
      id: this.entityIdCounter++,
      x,
      y,
      text,
      color,
      size,
      life: 30,
      maxLife: 30,
      scale: 0.6,
      vy: 1.5,
    });
  }

  private triggerGameOver(reason: 'BUSTED' | 'EXHAUSTED' | 'COLLISION' = 'BUSTED'): void {
    this.state = 'GAMEOVER';
    this.stats.gameOverReason = reason;
    sounds.stopArcadeBeat();
    sounds.playBusted();
    this.renderer.triggerShake(12);

    // Spawn massive dust cloud dogpile!
    this.spawnParticleExplosion(this.player.x, this.player.y, '#E2E8F0', 25, 'cloud');
    this.saveHighScore();

    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.stats, this.state);
    }
  }

  private spawnConfettiShower(x: number, y: number): void {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#A855F7'];
    for (let i = 0; i < 20; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        shape: 'confetti',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  private render(): void {
    // Calculate distance to closest chaser
    let mobDistance = 999;
    if (this.chasers.length > 0) {
      for (const c of this.chasers) {
        const d = this.player.y - c.y;
        if (d < mobDistance) mobDistance = d;
      }
    }

    this.renderer.render(
      this.player,
      this.bystanders,
      this.chasers,
      this.obstacles,
      this.coins,
      this.powerups,
      this.particles,
      this.floatingTexts,
      this.shockwaves,
      this.stats.chaosMultiplier,
      this.stats.feverActive,
      mobDistance,
      this.introState.victim,
      this.introState.active,
      this.introState.phase
    );
  }

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    sounds.stopArcadeBeat();
    this.renderer.destroy();
  }
}
