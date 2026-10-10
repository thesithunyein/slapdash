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
} from './types.ts';
import {
  CHARACTER_SKINS,
  BYSTANDER_TEMPLATES,
  COMIC_WORDS,
  ROAD_WIDTH,
  SLAP_REACH,
  MOB_SAFE_DISTANCE,
} from './constants.ts';
import { sounds } from './SoundEngine.ts';
import { IsometricRenderer } from './IsometricRenderer.ts';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: IsometricRenderer;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Game States
  public state: GameState = 'MENU';
  public selectedSkin: CharacterSkin = CHARACTER_SKINS[0];

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
  };

  // Callback to sync stats with React UI
  private onStatsUpdate?: (stats: GameStats, state: GameState) => void;

  constructor(canvas: HTMLCanvasElement, onStatsUpdate?: (stats: GameStats, state: GameState) => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.renderer = new IsometricRenderer(this.ctx);
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
  }

  public resize(width: number, height: number, dpr: number = 1): void {
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.renderer.resize(width, height, dpr);
  }

  public startGame(): void {
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

    this.stats.score = 0;
    this.stats.slapsCount = 0;
    this.stats.coins = 0;
    this.stats.chaosLevel = 0;
    this.stats.chaosMultiplier = 1;
    this.stats.feverActive = false;
    this.stats.distanceRun = 0;
    this.stats.comboStreak = 0;
    this.stats.maxCombo = 0;

    // Pre-populate initial street with bystanders
    for (let i = 0; i < 6; i++) {
      this.spawnMarketSegment(300 + i * 160);
    }

    this.state = 'PLAYING';
    sounds.startArcadeBeat();
    sounds.updateBeatChaos(1);

    if (this.onStatsUpdate) this.onStatsUpdate(this.stats, this.state);
    this.lastTime = performance.now();
  }

  public restartGame(): void {
    this.startGame();
  }

  private initPlayer(): void {
    this.player = {
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vz: 0,
      speed: 4.8 + this.selectedSkin.speedBonus,
      baseSpeed: 4.8 + this.selectedSkin.speedBonus,
      slapCooldown: 0,
      isSlapping: false,
      slapHand: 'right',
      slapProgress: 0,
      slipTimer: 0,
      feverTime: 0,
      skin: this.selectedSkin,
      runCycle: 0,
    };
  }

  public requestSlap(): void {
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

    if (this.state === 'PLAYING') {
      this.update(dt / 16.666); // Normalized to ~60fps
    } else if (this.state === 'MENU') {
      this.updateMenu(dt / 16.666);
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private updateMenu(dtFactor: number): void {
    // Gentle idle stance and slow forward camera float
    this.player.runCycle += 0.025 * dtFactor;
    this.player.y += 0.4 * dtFactor;
    if (this.player.y + 700 > this.nextSpawnY) {
      this.spawnMarketSegment(this.nextSpawnY);
      this.nextSpawnY += 160;
    }
  };

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

    // 2. Slip on banana peel timer
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

    // 3. Forward Speed calculation
    const speedProgressBonus = Math.min(2.0, p.y / 8000);
    let currentSpeed = (p.baseSpeed + speedProgressBonus);
    if (this.stats.feverActive) {
      currentSpeed *= 1.45; // Super turbo in Fever
    } else if (p.slipTimer > 0) {
      currentSpeed *= 0.55; // Slow down during banana slip
    }
    p.speed = currentSpeed;
    p.y += p.speed * dtFactor;
    this.stats.distanceRun = Math.floor(p.y / 10);

    // Run cycle animation
    p.runCycle += 0.05 * p.speed * dtFactor;

    // 4. Lateral Steering (Keyboard or Touch Joystick)
    let moveInputX = 0;
    if (this.input.joystick.active) {
      moveInputX = this.input.joystick.x;
    } else {
      if (this.input.keys.left) moveInputX -= 1;
      if (this.input.keys.right) moveInputX += 1;
    }

    // Smooth, responsive lateral steering across 3 wide lanes
    const lateralSpeed = 8.5;
    p.vx = moveInputX * lateralSpeed;
    p.x += p.vx * dtFactor;

    // Clamp inside market road limits (-180 to 180)
    const maxBound = ROAD_WIDTH / 2 - 20;
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
      if (b.slapped && b.wobble > 0) {
        b.wobble -= 0.05 * dtFactor;
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

    // 7. Update Angry Mob Chasers
    let closestMobDist = 999;
    const baseChaserSpeed = p.baseSpeed * (0.92 + (this.stats.chaosMultiplier * 0.025));

    for (const c of this.chasers) {
      c.runCycle += 0.06 * dtFactor;
      c.angrySteamTimer += 0.08 * dtFactor;

      // Chaser rubber-band AI
      const distToPlayer = p.y - c.y;
      if (distToPlayer < closestMobDist) {
        closestMobDist = distToPlayer;
      }

      // If chaser is far behind, sprint faster to keep excitement high
      const rubberBand = distToPlayer > 180 ? 1.3 : 1.0;
      c.speed = baseChaserSpeed * rubberBand;
      c.y += c.speed * dtFactor;

      // Steer laterally towards player's lane
      const lateralDelta = p.x - c.x;
      c.x += Math.sign(lateralDelta) * Math.min(Math.abs(lateralDelta), 2.2 * dtFactor);

      // Check if caught by chaser!
      if (!this.stats.feverActive && distToPlayer <= MOB_SAFE_DISTANCE) {
        const lateralDist = Math.abs(p.x - c.x);
        if (lateralDist < 30) {
          this.triggerGameOver();
          return;
        }
      }
    }

    // 8. Obstacle Collisions & Traps
    for (const obs of this.obstacles) {
      if (obs.type === 'barrel') {
        obs.y -= (obs.rollSpeed ?? 1.6) * dtFactor;
        obs.rotation = (obs.rotation ?? 0) + 0.12 * dtFactor;
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
      if (p.z > 14 && obs.type !== 'barrier') {
        if (dy < 18 && dx < 22) {
          obs.hit = true;
          this.stats.score += 80 * this.stats.chaosMultiplier;
          this.addFloatingText(p.x, p.y + 25, 'LEAP OVER! +80', '#10B981', 18);
        }
        continue;
      }

      if (dy < 22 && dx < (obs.width / 2 + 12)) {
        obs.hit = true;
        if (this.stats.feverActive) {
          // Ram through obstacle with explosive stars!
          sounds.playWhack();
          this.renderer.triggerShake(5);
          this.spawnParticleExplosion(obs.x, obs.y, '#FDE047', 12);
          this.addFloatingText(obs.x, obs.y, 'SMASH!', '#FDE047', 22);
          this.stats.score += 200 * this.stats.chaosMultiplier;
        } else {
          if (obs.type === 'banana') {
            sounds.playSlip();
            p.slipTimer = 28; // Spin slip!
            this.renderer.triggerShake(4);
            this.addFloatingText(p.x, p.y + 20, 'SLIP!', '#FACC15', 20);
            this.stats.comboStreak = 0; // Combo reset
          } else if (obs.type === 'barrel') {
            sounds.playWhack();
            this.renderer.triggerShake(6);
            this.spawnParticleExplosion(obs.x, obs.y, '#78350F', 10);
            this.addFloatingText(p.x, p.y + 20, 'BARREL CRUNCH!', '#EF4444', 20);
            p.slipTimer = 30;
            this.stats.comboStreak = 0;
          } else {
            // Collision with crate / cart / watermelon / barrier
            sounds.playWhack();
            this.renderer.triggerShake(7);
            this.spawnParticleExplosion(obs.x, obs.y, '#EA580C', 10);
            this.addFloatingText(p.x, p.y + 20, 'OOF!', '#EF4444', 22);
            // Heavy stumble allows mob to catch up
            p.slipTimer = 35;
            this.stats.comboStreak = 0;
          }
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

    // 13. Infinite Market Street Spawning
    if (p.y + 700 > this.nextSpawnY) {
      this.spawnMarketSegment(this.nextSpawnY);
      this.nextSpawnY += 160 + Math.random() * 40;
    }

    // 14. Cleanup off-screen entities behind player
    const cleanupY = p.y - 350;
    this.bystanders = this.bystanders.filter((b) => b.y > cleanupY);
    this.obstacles = this.obstacles.filter((o) => o.y > cleanupY);
    this.coins = this.coins.filter((c) => c.y > cleanupY);
    this.powerups = this.powerups.filter((pu) => pu.y > cleanupY);

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

      // Knock off accessories into the air!
      const side = b.x > p.x ? 1 : -1;
      b.flyingAccessory = {
        x: b.x,
        y: b.y + 10,
        vx: side * (3 + Math.random() * 4),
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

      this.addChaos(18); // Fills chaos meter
      const slapPoints = b.points * this.stats.chaosMultiplier;
      this.stats.score += slapPoints;

      // Add points floating popup
      this.addFloatingText(b.x, b.y + 55, `+${slapPoints}`, '#10B981', 18);

      // Enraged bystander joins the angry mob!
      setTimeout(() => {
        if (this.state === 'PLAYING') {
          this.chasers.push({
            id: this.entityIdCounter++,
            x: b.x,
            y: b.y,
            speed: p.baseSpeed * 0.95,
            bodyColor: b.bodyColor,
            shirtColor: b.shirtColor,
            angrySteamTimer: 0,
            runCycle: Math.random() * 10,
            animOffset: Math.random() * 5,
          });
        }
      }, 350);
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
   * Procedural Market Segment Generator
   */
  private spawnMarketSegment(targetY: number): void {
    // 3 distinct lanes for spacious, clean boulevard gameplay
    const lanes = [-115, 0, 115];

    // 1. Spawn 1-2 Bystanders along the sidewalks (just off the road edge)
    const numBystanders = Math.random() > 0.25 ? 2 : 1;
    for (let i = 0; i < numBystanders; i++) {
      const template = BYSTANDER_TEMPLATES[Math.floor(Math.random() * BYSTANDER_TEMPLATES.length)];
      // Sidewalk positions on left (-175 to -215) or right (175 to 215)
      const side = (i === 0 ? (Math.random() > 0.5 ? 1 : -1) : -1);
      const bx = side * (175 + Math.random() * 35);
      const by = targetY + (Math.random() * 60 - 30);

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

    // 2. Spawn Obstacles (Pick 1 of the 3 lanes, ensuring at least 1-2 lanes remain clear)
    if (Math.random() > 0.2) {
      const obstacleTypes: ('barrier' | 'banana' | 'watermelon' | 'crate' | 'cart' | 'barrel' | 'ramp')[] = [
        'barrier',
        'banana',
        'watermelon',
        'crate',
        'barrel',
        'ramp',
        'barrel',
      ];
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];
      const ox = chosenLane + (Math.random() * 20 - 10);
      const oy = targetY + 40 + Math.random() * 40;

      this.obstacles.push({
        id: this.entityIdCounter++,
        x: ox,
        y: oy,
        type,
        width: type === 'barrier' ? 44 : type === 'ramp' ? 44 : type === 'cart' ? 48 : 32,
        height: 26,
        hit: false,
        rotation: type === 'banana' ? Math.random() * Math.PI : 0,
        rollSpeed: type === 'barrel' ? 1.4 + Math.random() * 0.8 : 0,
      });
    }

    // 3. Spawn Gold Coins (in trails of 3 along one open lane)
    if (Math.random() > 0.35) {
      const coinLane = lanes[Math.floor(Math.random() * lanes.length)];
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

    // 4. Occasional Powerup (Soda / Soap)
    if (Math.random() > 0.82) {
      const puType = Math.random() > 0.5 ? 'soda' : 'soap';
      const puLane = lanes[Math.floor(Math.random() * lanes.length)];
      this.powerups.push({
        id: this.entityIdCounter++,
        x: puLane,
        y: targetY + 80,
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

  private triggerGameOver(): void {
    this.state = 'GAMEOVER';
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
      mobDistance
    );
  }

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    sounds.stopArcadeBeat();
  }
}
