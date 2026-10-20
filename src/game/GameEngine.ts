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
  IntroSlapState,
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

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: ThreeGameRenderer;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Game States
  public state: GameState = 'MENU';
  public selectedSkin: CharacterSkin = CHARACTER_SKINS[0];

  // Discrete 5-Lane System (0: -200, 1: -100, 2: 0, 3: 100, 4: 200)
  public currentLane: number = 2; // Center lane
  public targetLane: number = 2;
  private keyLeftCooldown: number = 0;
  private keyRightCooldown: number = 0;

  // Cinematic Introductory Slap State
  public introState: IntroSlapState | null = null;

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

  public resize(width: number, height: number, dpr: number = 1): void {
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.renderer.resize(width, height, dpr);
  }

  public shiftLane(direction: -1 | 1): void {
    if (this.state !== 'PLAYING') return;
    const nextLane = Math.max(0, Math.min(4, this.targetLane + direction));
    if (nextLane !== this.targetLane) {
      this.targetLane = nextLane;
      sounds.playLaneShift();
    }
  }

  public startGame(): void {
    this.startIntroSlapSequence();
  }

  public startIntroSlapSequence(): void {
    this.initPlayer();
    this.bystanders = [];
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.chasers = [];

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

    // Start road spawning ahead past y = 350 so intro scene has a clear open boulevard
    this.nextSpawnY = 360;
    for (let i = 0; i < 4; i++) {
      this.spawnMarketSegment(360 + i * 240);
    }

    this.state = 'INTRO_SLAP';
    this.introState = {
      phase: 'WAITING_FOR_SLAP',
      victimX: 0, // Positioned squarely in the middle of the road!
      victimY: 38, // In front of player
      victimZ: 0,
      victimRotationY: 0,
      victimRotationZ: 0,
      victimKnockbackVx: 0,
      victimKnockbackVy: 0,
      sunglassesY: 2.1,
      sunglassesVy: 0,
      sunglassesRot: 0,
      sunglassesActive: false,
      timer: 0,
      cameraT: 0,
    };

    if (this.renderer) {
      this.renderer.resetTrack(0);
      this.renderer.resetCamera(0);
    }

    if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
    this.lastTime = performance.now();
  }

  public triggerIntroSlap(): void {
    if (this.state === 'INTRO_SLAP' && this.introState && this.introState.phase === 'WAITING_FOR_SLAP') {
      this.introState.phase = 'WINDUP';
      this.introState.timer = 0;
      sounds.playWindup();
    }
  }

  public restartGame(): void {
    this.startIntroSlapSequence();
  }

  public resetToMenu(): void {
    this.state = 'MENU';
    this.introState = null;
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

  private initPlayer(): void {
    // 5-Lane Centering: Always squarely aligned in center lane (Lane 2 = 0)
    this.currentLane = 2;
    this.targetLane = 2;
    const calculatedBase = (5.2 + this.selectedSkin.speedBonus) * (this.paceMultiplier || 1.0);
    this.player = {
      x: ROAD_LANES[2], // 0 - Center of road
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
    if (this.state === 'INTRO_SLAP') {
      this.triggerIntroSlap();
      return;
    }
    this.input.slapRequested = true;
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
    } else if (this.state === 'INTRO_SLAP') {
      this.updateIntroSlap(dt / 16.666, dt);
    } else if (this.state === 'MENU') {
      this.updateMenu(dt / 16.666);
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private updateIntroSlap(dtFactor: number, dt: number): void {
    const s = this.introState;
    if (!s) return;
    s.timer += dt;

    // Keep particles and floating texts alive during intro
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dtFactor;
      pt.y += pt.vy * dtFactor;
      pt.life -= dtFactor;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += (ft.vy ?? 1.5) * dtFactor;
      ft.life -= dtFactor;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    if (s.phase === 'WAITING_FOR_SLAP') {
      // Automatic slap trigger if player takes more than 2.4s
      if (s.timer > 2400) {
        this.triggerIntroSlap();
      }
      if (this.input.slapRequested || this.input.keys.slap) {
        this.input.slapRequested = false;
        this.triggerIntroSlap();
      }
    } else if (s.phase === 'WINDUP') {
      if (s.timer >= 380) {
        // Wind-up finishes -> Impact moment!
        s.phase = 'IMPACT';
        s.timer = 0;
        sounds.playMegaSlap();
        this.renderer.triggerShake(18);
        this.hitFreezeMs = 70; // 70ms visceral hit-stop!
        this.addFloatingText(0, 38, '💥 KA-POW! MEGA SLAP!', '#EF4444', 32);
        this.spawnParticleExplosion(0, 38, '#F59E0B', 20, 'star');
        this.spawnParticleExplosion(0, 38, '#EF4444', 16, 'sparkle');
      }
    } else if (s.phase === 'IMPACT') {
      if (s.timer >= 180) {
        // Knockout flight begins
        s.phase = 'KNOCKOUT';
        s.timer = 0;
        s.sunglassesActive = true;
        s.sunglassesVy = 0.35;
        s.victimKnockbackVy = 8.5; // Hurtles backward down boulevard!
        s.victimZ = 0.5;
        sounds.playPoliceWhistle();
        this.addFloatingText(0, 52, '😱 MY FACE! POLICE!!', '#38BDF8', 22);
      }
    } else if (s.phase === 'KNOCKOUT') {
      // Victim spins backward down the road
      s.victimY += s.victimKnockbackVy * dtFactor;
      s.victimKnockbackVy *= 0.94;
      s.victimRotationY += 0.3 * dtFactor;
      s.victimRotationZ += 0.16 * dtFactor;
      s.sunglassesY += s.sunglassesVy * dtFactor;
      s.sunglassesVy -= 0.018 * dtFactor;
      s.sunglassesRot += 0.28 * dtFactor;

      if (s.timer >= 750) {
        s.phase = 'TRANSITION';
        s.timer = 0;
        this.player.speed = this.player.baseSpeed;
      }
    } else if (s.phase === 'TRANSITION') {
      s.cameraT = Math.min(1.0, s.timer / 400);
      // Player accelerates smoothly into running sprint
      this.player.y += this.player.speed * dtFactor;
      this.player.runCycle += 0.05 * this.player.speed * dtFactor;

      if (s.timer >= 400) {
        // Gameplay running phase begins!
        this.state = 'PLAYING';
        this.introState = null;
        sounds.startArcadeBeat();
        sounds.updateBeatChaos(1);

        // Spawn pursuing lead officer
        this.chasers = [
          {
            id: 9001,
            x: 0,
            y: this.player.y - 75,
            speed: this.player.baseSpeed * 0.96,
            bodyColor: '#F4C29E',
            shirtColor: '#1E3A8A',
            angrySteamTimer: 100,
            runCycle: 0,
            animOffset: 0,
          },
        ];
        this.addFloatingText(this.player.x, this.player.y + 30, '🏃 SPRINT! ESCAPE THE MOB!', '#10B981', 24);
        if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
      }
    }
  }

  private updateMenu(dtFactor: number): void {
    // Active runner jog in Menu mode (matches live gameplay!)
    this.player.speed = this.player.baseSpeed || 4.8;
    this.player.runCycle += 0.12 * dtFactor;
    this.player.y += this.player.speed * dtFactor;
    if (this.player.y + 750 > this.nextSpawnY) {
      this.spawnMarketSegment(this.nextSpawnY);
      this.nextSpawnY += 160;
    }
  }

  private update(dtFactor: number): void {
    const p = this.player;

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
    } else if (Math.abs(p.x) > 218) {
      // Rough sidewalk curb friction only on very outer edges
      currentSpeed *= 0.82;
      if (Math.random() < 0.25) {
        this.particles.push({
          x: p.x + (Math.random() - 0.5) * 8,
          y: p.y - 12,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.0 - Math.random() * 2,
          color: '#94A3B8',
          size: 2.5 + Math.random() * 2,
          life: 10,
          maxLife: 10,
          shape: 'cloud',
        });
      }
    }
    p.speed = currentSpeed;
    p.y += p.speed * dtFactor;
    this.stats.distanceRun = Math.floor(p.y / 10);

    // Run cycle animation
    p.runCycle += 0.05 * p.speed * dtFactor;

    // 4. Five-Lane Steering & Snap-To-Center Alignment (Always squarely in center of lane)
    if (this.input.joystick.active) {
      if (this.input.joystick.x < -0.45) {
        if (this.keyLeftCooldown <= 0) {
          this.shiftLane(-1);
          this.keyLeftCooldown = 14;
        } else {
          this.keyLeftCooldown -= dtFactor;
        }
      } else if (this.input.joystick.x > 0.45) {
        if (this.keyRightCooldown <= 0) {
          this.shiftLane(1);
          this.keyRightCooldown = 14;
        } else {
          this.keyRightCooldown -= dtFactor;
        }
      } else {
        this.keyLeftCooldown = 0;
        this.keyRightCooldown = 0;
      }
    } else {
      if (this.input.keys.left) {
        if (this.keyLeftCooldown <= 0) {
          this.shiftLane(-1);
          this.keyLeftCooldown = 14;
        } else {
          this.keyLeftCooldown -= dtFactor;
        }
      } else {
        this.keyLeftCooldown = 0;
      }

      if (this.input.keys.right) {
        if (this.keyRightCooldown <= 0) {
          this.shiftLane(1);
          this.keyRightCooldown = 14;
        } else {
          this.keyRightCooldown -= dtFactor;
        }
      } else {
        this.keyRightCooldown = 0;
      }
    }

    // Snappy, silky interpolation towards targetLane center (Always lands squarely in center!)
    const targetX = ROAD_LANES[this.targetLane];
    const diff = targetX - p.x;
    const snapSpeed = 0.32;
    p.x += diff * Math.min(1.0, snapSpeed * dtFactor);
    if (Math.abs(p.x - targetX) < 1.0) {
      p.x = targetX;
      this.currentLane = this.targetLane;
    }
    p.vx = diff * 0.18; // Dynamic banking lean in 3D

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
          sounds.playEscaped();
          this.addFloatingText(p.x, p.y + 25, 'ESCAPED CHASER! +150', '#10B981', 22);
          this.stats.score += 150 * this.stats.chaosMultiplier;
        }
      }

      // Desired distance:
      // When on-screen: 40 units (clearly visible right behind player's heels)
      // When off-screen: 180 units (behind camera, completely off-screen)
      const targetDist = this.stats.chaserOnScreen ? 40 : 180;
      const currentDist = p.y - leadChaser.y;
      const distDiff = currentDist - targetDist;

      leadChaser.speed = p.speed + (distDiff * 0.14);
      leadChaser.y += leadChaser.speed * dtFactor;
      leadChaser.x += (p.x - leadChaser.x) * 0.16 * dtFactor;
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
        this.stats.score += 150 * this.stats.chaosMultiplier;
        this.addFloatingText(p.x, p.y + 20, 'BOOST JUMP!', '#10B981', 24);
        this.spawnParticleExplosion(obs.x, obs.y, '#34D399', 10, 'sparkle');
        continue;
      }

      // If player is in the air jumping over ground obstacles
      if (p.z > 14 && obs.type !== 'barrier' && obs.type !== 'cafe_table' && obs.type !== 'planter' && obs.type !== 'hydrant') {
        if (dy < 18 && dx < 22) {
          obs.hit = true;
          this.stats.score += 80 * this.stats.chaosMultiplier;
          this.addFloatingText(p.x, p.y + 25, 'LEAP OVER! +80', '#10B981', 18);
        }
        continue;
      }

      if (dy < 24 && dx < (obs.width / 2 + 14)) {
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
          this.stats.score += 50 * this.stats.chaosMultiplier;
          this.addFloatingText(p.x, p.y + 35, 'CLOSE CALL! +50', '#38BDF8', 16);
          sounds.playNearMiss();
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

    // 11. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dtFactor;
      pt.y += pt.vy * dtFactor;
      pt.life -= dtFactor;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 12. Update Floating Text Popups
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += (ft.vy ?? 1.5) * dtFactor;
      ft.life -= dtFactor;
      ft.scale = Math.min(1.2, ft.scale + 0.02 * dtFactor);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 12b. Update Expanding Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.22 * dtFactor;
      sw.life -= dtFactor;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 13. Infinite Market Street Spawning (spaced generously so obstacles aren't too close)
    if (p.y + 700 > this.nextSpawnY) {
      this.spawnMarketSegment(this.nextSpawnY);
      this.nextSpawnY += 240 + Math.random() * 40;
    }

    // 14. Cleanup off-screen entities behind player (lead chaser is always preserved)
    const cleanupY = p.y - 350;
    this.bystanders = this.bystanders.filter((b) => b.y > cleanupY);
    this.obstacles = this.obstacles.filter((o) => o.y > cleanupY);
    this.coins = this.coins.filter((c) => c.y > cleanupY);
    this.powerups = this.powerups.filter((pu) => pu.y > cleanupY);
    this.chasers = this.chasers.filter((c) => c.id === 9001 || c.y > cleanupY);

    // Sync stats with UI
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.stats, this.state);
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
   * Balanced 5-Lane Procedural Market Segment Generator
   * - 5 lanes: [-200, -100, 0, 100, 200]
   * - Obstacles in 2 to 3 lanes, always leaving 2 to 3 open escape routes
   * - Left & right paths have more obstacles to balance proximity to slap targets
   * - Coins spawn in open escape lanes
   * - Zero yellow obstacles (banana peel completely removed)
   */
  private spawnMarketSegment(targetY: number): void {
    const lanes = ROAD_LANES; // [-200, -100, 0, 100, 200]
    const dist = this.stats.distanceRun;

    // 1. Spawn Bystanders along left and right sidewalk platforms
    // (Bystanders stand at -260 or +260, readily reachable for slaps when in lane -200 or +200)
    const numBystanders = Math.random() > 0.35 ? 2 : 1;
    for (let i = 0; i < numBystanders; i++) {
      const template = BYSTANDER_TEMPLATES[Math.floor(Math.random() * BYSTANDER_TEMPLATES.length)];
      const side = (i === 0 ? (Math.random() > 0.5 ? 1 : -1) : (Math.random() > 0.5 ? -1 : 1));
      const bx = side * (260 + Math.random() * 12);
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

    // 2. Select 2 or 3 lanes for obstacles (strictly max 3 out of 5 lanes!)
    let obstacleLaneCount: number;
    if (dist < 80) {
      obstacleLaneCount = 1;
    } else if (dist < 260) {
      obstacleLaneCount = 2;
    } else {
      obstacleLaneCount = Math.random() < 0.55 ? 2 : 3;
    }

    // Left and right paths have higher weight so the side routes aren't too easy!
    // Lanes: -200 (left platform), -100 (mid-left), 0 (center), 100 (mid-right), 200 (right platform)
    const laneWeights = [2.6, 2.0, 1.0, 2.0, 2.6];
    const availableLaneIndices = [0, 1, 2, 3, 4];
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

    // Obstacle types: crates, barriers, barrels, carts, and jump ramps (NO yellow banana!)
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
      const oy = targetY + 30 + i * 25; // staggered slightly for dynamic view

      this.obstacles.push({
        id: this.entityIdCounter++,
        x: ox,
        y: oy,
        type,
        width: type === 'barrier' ? 44 : type === 'ramp' ? 44 : type === 'cart' ? 46 : 34,
        height: 26,
        hit: false,
        rollSpeed: type === 'barrel' ? 1.5 + Math.random() * 0.4 : 0,
        vx: 0, // Barrels roll straight down their own lane — fair & telegraphed
      });
    }

    // 3. Gold Coins mark the open escape routes!
    const openLanes = lanes.filter((l) => !occupiedLanes.has(l));
    if (openLanes.length > 0) {
      const numCoinLanes = Math.min(openLanes.length, Math.random() > 0.4 ? 2 : 1);
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
      const puLane = openLanes.length > 0 ? openLanes[0] : lanes[2];
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
      this.introState
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
