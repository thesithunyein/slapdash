import {
  Player,
  Bystander,
  Chaser,
  Obstacle,
  Coin,
  Powerup,
  Particle,
  FloatingText,
  Shockwave,
} from './types.ts';
import { ROAD_WIDTH } from './constants.ts';

export class IsometricRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 800;
  private height: number = 600;
  private dpr: number = 1;
  private screenShake: number = 0;
  private hitFreeze: number = 0;
  private time: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public resize(width: number, height: number, dpr: number = 1): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
  }

  public triggerShake(intensity: number = 6): void {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  public triggerHitFreeze(frames: number = 2): void {
    this.hitFreeze = frames;
  }

  public render(
    player: Player,
    bystanders: Bystander[],
    chasers: Chaser[],
    obstacles: Obstacle[],
    coins: Coin[],
    powerups: Powerup[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    shockwaves: Shockwave[],
    _chaosMultiplier: number,
    feverActive: boolean,
    mobDistance: number
  ): void {
    const ctx = this.ctx;
    this.time += 0.016;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Screen Shake effect
    if (this.screenShake > 0.1) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
      this.screenShake *= 0.86;
    } else {
      this.screenShake = 0;
    }

    // 3D Perspective Camera Configuration
    // Dynamically calibrated so the runner is ALWAYS prominently framed at ~70% of screen height on Mobile & PC
    const centerX = this.width / 2;
    const isMobile = this.width < 768;
    const horizonY = this.height * (isMobile ? 0.24 : 0.27);
    const targetPlayerY = this.height * (isMobile ? 0.69 : 0.71);

    const playerDistance = 220; // World distance behind player
    const cameraY = player.y - playerDistance;
    const playerScale = Math.min(2.0, Math.max(1.3, this.height / 480));
    const fov = playerDistance * playerScale;
    const cameraZ = (targetPlayerY - horizonY) / playerScale;

    // 3D World to 2D Screen projection
    const project = (wx: number, wy: number, wz: number = 0) => {
      const depth = Math.max(10, wy - cameraY);
      const scale = fov / depth;
      const sx = centerX + wx * scale;
      const sy = horizonY + (cameraZ - wz) * scale;
      return { x: sx, y: sy, scale, depth };
    };

    // 1. SKYBOX (Dynamic sunny Mediterranean sky or emerald twilight in Fever)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    if (feverActive) {
      skyGrad.addColorStop(0, '#064E3B');
      skyGrad.addColorStop(0.5, '#059669');
      skyGrad.addColorStop(1, '#34D399');
    } else {
      skyGrad.addColorStop(0, '#38BDF8'); // Crisp daylight sky
      skyGrad.addColorStop(0.5, '#7DD3FC');
      skyGrad.addColorStop(0.9, '#E0F2FE');
      skyGrad.addColorStop(1, '#FFFFFF'); // Soft golden horizon haze
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, horizonY + 2);

    // 3D Fluffy Floating Clouds
    this.drawStylizedClouds(ctx, horizonY);

    // Distant City Skyline & Mountains
    this.drawDistantCityscape(ctx, horizonY, feverActive);

    // 2. BOULEVARD ROADBED & SIDEWALKS
    // Broad 3-lane boulevard (ROAD_WIDTH = 400: halfRoad = 200)
    const halfRoad = ROAD_WIDTH / 2; // 200
    const sidewalkWidth = 90;
    const nearY = player.y - 140; // Extended behind player for seamless bottom coverage
    const farY = player.y + 1100;

    this.drawBroadBoulevard(ctx, project, halfRoad, sidewalkWidth, nearY, farY, horizonY, feverActive);

    // 3. TRUE 3D BUILDINGS & ARCHITECTURAL FACADES (Volumetric depth, side walls, roof slabs, awnings)
    this.drawVolumetricBuildings(ctx, project, halfRoad + sidewalkWidth, player.y, horizonY, feverActive);

    // 4. AVENUE PROPS (Sculpted 3D Trees, Classic Lampposts, Flower Benches)
    this.drawBoulevardProps(ctx, project, halfRoad, player.y, horizonY);

    // 5. 3D GOLD COINS (Beveled edges, rotating specular sheen)
    for (const c of coins) {
      if (c.collected) continue;
      const p = project(c.x, c.y, 16 + Math.sin(c.bobPhase * 4) * 4);
      if (p.depth > 18 && p.y > horizonY && p.y < this.height + 60) {
        this.drawVolumetricCoin(ctx, p.x, p.y, p.scale, c.bobPhase);
      }
    }

    // 6. 3D POWERUPS (Turbo Soda Can & Slick Soap)
    for (const pu of powerups) {
      if (pu.collected) continue;
      const p = project(pu.x, pu.y, 18 + Math.sin(pu.bobPhase * 3) * 5);
      if (p.depth > 18 && p.y > horizonY && p.y < this.height + 60) {
        this.drawPowerup(ctx, p.x, p.y, p.scale, pu.type, pu.bobPhase);
      }
    }

    // 7. 3D OBSTACLES (Rolling Barrels, Fruit Crates, Sawhorses, Boost Ramps, Bananas)
    for (const obs of obstacles) {
      const p = project(obs.x, obs.y, 0);
      if (p.depth > 18 && p.y > horizonY && p.y < this.height + 80) {
        this.drawObstacle(ctx, p.x, p.y, p.scale, obs.type, obs.rotation || 0, obs.hit);
      }
    }

    // 8. DEPTH-SORT ALL ACTORS (Bystanders, Chasers, Player)
    type Actor =
      | { kind: 'bystander'; entity: Bystander; y: number }
      | { kind: 'chaser'; entity: Chaser; y: number }
      | { kind: 'player'; entity: Player; y: number };

    const actors: Actor[] = [
      ...bystanders.map((b) => ({ kind: 'bystander' as const, entity: b, y: b.y })),
      ...chasers.map((c) => ({ kind: 'chaser' as const, entity: c, y: c.y })),
      { kind: 'player' as const, entity: player, y: player.y },
    ];

    // Sort far to near (largest Y first)
    actors.sort((a, b) => b.y - a.y);

    for (const actor of actors) {
      if (actor.kind === 'bystander') {
        const b = actor.entity;
        const p = project(b.x, b.y, 0);
        if (p.depth > 18 && p.y > horizonY && p.y < this.height + 120) {
          this.draw3DBystander(ctx, p.x, p.y, p.scale, b);
        }
      } else if (actor.kind === 'chaser') {
        const c = actor.entity;
        const p = project(c.x, c.y, 0);
        if (p.depth > 18 && p.y > horizonY && p.y < this.height + 120) {
          this.draw3DChaser(ctx, p.x, p.y, p.scale, c);
        }
      } else {
        const p = project(player.x, player.y, player.z);
        this.draw3DPlayer(ctx, p.x, p.y, p.scale, player, feverActive);
      }
    }

    // 9. EXPANDING SHOCKWAVES & PARTICLES
    for (const sw of shockwaves) {
      const p = project(sw.x, sw.y, 10);
      if (p.depth > 15 && p.y > horizonY) {
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = sw.lineWidth * p.scale;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, sw.radius * p.scale * 1.8, sw.radius * p.scale * 0.9, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    for (const pt of particles) {
      const p = project(pt.x, pt.y, pt.size * 2);
      if (p.depth > 15 && p.y > horizonY) {
        this.drawParticle(ctx, p.x, p.y, p.scale, pt);
      }
    }

    // 10. FLOATING COMIC POPUP TEXTS
    for (const ft of floatingTexts) {
      const p = project(ft.x, ft.y, 45);
      this.drawFloatingText(ctx, p.x, p.y, p.scale, ft);
    }

    // 11. MOB CLOSING IN VIGNETTE
    if (mobDistance < 85 && chasers.length > 0) {
      const danger = Math.min(0.4, ((85 - mobDistance) / 85) * 0.45);
      const grad = ctx.createRadialGradient(
        this.width / 2,
        this.height / 2,
        this.width * 0.25,
        this.width / 2,
        this.height / 2,
        this.width * 0.8
      );
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(1, `rgba(239, 68, 68, ${danger})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 12. FEVER RUN SPEED TRAILS
    if (feverActive) {
      this.drawFeverSpeedLines(ctx);
    }

    ctx.restore();
  }

  /**
   * Stylized Puffy White Clouds
   */
  private drawStylizedClouds(ctx: CanvasRenderingContext2D, horizonY: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const speed = this.time * 6;

    const clouds = [
      { x: (speed + 80) % (this.width + 240) - 120, y: horizonY * 0.22, r: 32 },
      { x: (speed * 0.6 + 360) % (this.width + 240) - 120, y: horizonY * 0.42, r: 24 },
      { x: (speed * 0.85 + 720) % (this.width + 240) - 120, y: horizonY * 0.28, r: 38 },
    ];

    for (const c of clouds) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.arc(c.x + c.r * 0.7, c.y - c.r * 0.2, c.r * 0.8, 0, Math.PI * 2);
      ctx.arc(c.x - c.r * 0.7, c.y - c.r * 0.15, c.r * 0.7, 0, Math.PI * 2);
      ctx.arc(c.x + c.r * 1.35, c.y + c.r * 0.1, c.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Distant Cityscape and Mountain Ridges on the Horizon
   */
  private drawDistantCityscape(ctx: CanvasRenderingContext2D, horizonY: number, fever: boolean): void {
    ctx.save();
    const mountainColor = fever ? '#064E3B' : '#BAE6FD';
    const cityColor = fever ? '#047857' : '#93C5FD';

    // Soft Mountain Ridge
    ctx.fillStyle = mountainColor;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(0, horizonY - 24);
    ctx.quadraticCurveTo(this.width * 0.25, horizonY - 55, this.width * 0.5, horizonY - 26);
    ctx.quadraticCurveTo(this.width * 0.75, horizonY - 50, this.width, horizonY - 20);
    ctx.lineTo(this.width, horizonY);
    ctx.closePath();
    ctx.fill();

    // Distant Modern Skyline Buildings
    ctx.fillStyle = cityColor;
    const numTowers = 22;
    const step = this.width / numTowers;
    for (let i = 0; i < numTowers; i++) {
      const h = 18 + Math.sin(i * 1.8) * 16 + (i % 4) * 8;
      ctx.fillRect(i * step, horizonY - h, step + 1, h + 2);
    }
    ctx.restore();
  }

  /**
   * Broad 3-Lane Boulevard (Spacious, Clean, High Playability)
   */
  private drawBroadBoulevard(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    halfRoad: number,
    sidewalkWidth: number,
    nearY: number,
    farY: number,
    horizonY: number,
    fever: boolean
  ): void {
    const rNL = project(-halfRoad, nearY, 0);
    const rNR = project(halfRoad, nearY, 0);
    const rFL = project(-halfRoad, farY, 0);
    const rFR = project(halfRoad, farY, 0);

    const swNL = project(-halfRoad - sidewalkWidth, nearY, 0);
    const swFL = project(-halfRoad - sidewalkWidth, farY, 0);
    const swNR = project(halfRoad + sidewalkWidth, nearY, 0);
    const swFR = project(halfRoad + sidewalkWidth, farY, 0);

    // 1. Lush Green Grass Borders on outer perimeter
    ctx.fillStyle = fever ? '#064E3B' : '#10B981';
    ctx.fillRect(0, horizonY, this.width, this.height - horizonY);

    // 2. Left Sidewalk (Warm travertine pavers with bevel)
    ctx.fillStyle = fever ? '#0F172A' : '#F1F5F9';
    ctx.beginPath();
    ctx.moveTo(swNL.x, swNL.y);
    ctx.lineTo(swFL.x, swFL.y);
    ctx.lineTo(rFL.x, rFL.y);
    ctx.lineTo(rNL.x, rNL.y);
    ctx.closePath();
    ctx.fill();

    // 3. Right Sidewalk
    ctx.fillStyle = fever ? '#0F172A' : '#F1F5F9';
    ctx.beginPath();
    ctx.moveTo(rNR.x, rNR.y);
    ctx.lineTo(rFR.x, rFR.y);
    ctx.lineTo(swFR.x, swFR.y);
    ctx.lineTo(swNR.x, swNR.y);
    ctx.closePath();
    ctx.fill();

    // Sidewalk Stone Paver Seams
    ctx.strokeStyle = fever ? '#1E293B' : '#E2E8F0';
    ctx.lineWidth = 1.2;
    const jointStep = 60;
    const startJointY = Math.floor(nearY / jointStep) * jointStep;
    for (let y = startJointY; y < farY; y += jointStep) {
      const jl1 = project(-halfRoad, y, 0);
      const jl2 = project(-halfRoad - sidewalkWidth, y, 0);
      if (jl1.y > horizonY && jl1.y < this.height + 40) {
        ctx.beginPath();
        ctx.moveTo(jl1.x, jl1.y);
        ctx.lineTo(jl2.x, jl2.y);
        ctx.stroke();
      }

      const jr1 = project(halfRoad, y, 0);
      const jr2 = project(halfRoad + sidewalkWidth, y, 0);
      if (jr1.y > horizonY && jr1.y < this.height + 40) {
        ctx.beginPath();
        ctx.moveTo(jr1.x, jr1.y);
        ctx.lineTo(jr2.x, jr2.y);
        ctx.stroke();
      }
    }

    // 4. Main Asphalt Roadbed (Clean architectural matte slate)
    ctx.fillStyle = fever ? '#022C22' : '#334155';
    ctx.beginPath();
    ctx.moveTo(rNL.x, rNL.y);
    ctx.lineTo(rFL.x, rFL.y);
    ctx.lineTo(rFR.x, rFR.y);
    ctx.lineTo(rNR.x, rNR.y);
    ctx.closePath();
    ctx.fill();

    // 5. Directional Sunlight Road Shading
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    const shNear = project(-halfRoad * 0.15, nearY, 0);
    const shFar = project(-halfRoad * 0.45, farY, 0);
    ctx.beginPath();
    ctx.moveTo(rNL.x, rNL.y);
    ctx.lineTo(rFL.x, rFL.y);
    ctx.lineTo(shFar.x, shFar.y);
    ctx.lineTo(shNear.x, shNear.y);
    ctx.closePath();
    ctx.fill();

    // 6. 3-Lane White Dashed Dividers (Lane 1 / Lane 2 / Lane 3)
    // Separators at -halfRoad * 0.33 and +halfRoad * 0.33
    const divLeftX = -halfRoad * 0.34; // approx -68
    const divRightX = halfRoad * 0.34; // approx +68
    ctx.fillStyle = '#FFFFFF';

    const dashLength = 36;
    const dashGap = 44;
    const cycle = dashLength + dashGap;
    const startDashY = Math.floor(nearY / cycle) * cycle;

    for (let y = startDashY; y < farY; y += cycle) {
      // Left lane divider
      const dL1 = project(divLeftX, y, 0);
      const dL2 = project(divLeftX, y + dashLength, 0);
      const wL = 2.8 * dL1.scale;

      if (dL1.y > horizonY && dL1.y < this.height + 40) {
        ctx.beginPath();
        ctx.moveTo(dL1.x - wL, dL1.y);
        ctx.lineTo(dL1.x + wL, dL1.y);
        ctx.lineTo(dL2.x + wL, dL2.y);
        ctx.lineTo(dL2.x - wL, dL2.y);
        ctx.closePath();
        ctx.fill();
      }

      // Right lane divider
      const dR1 = project(divRightX, y, 0);
      const dR2 = project(divRightX, y + dashLength, 0);
      const wR = 2.8 * dR1.scale;

      if (dR1.y > horizonY && dR1.y < this.height + 40) {
        ctx.beginPath();
        ctx.moveTo(dR1.x - wR, dR1.y);
        ctx.lineTo(dR1.x + wR, dR1.y);
        ctx.lineTo(dR2.x + wR, dR2.y);
        ctx.lineTo(dR2.x - wR, dR2.y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 7. Crisp Granite 3D Curbs (Raised stone lip separating road & sidewalk)
    // Left curb
    const curbH = 5;
    const cNL = project(-halfRoad, nearY, curbH);
    const cFL = project(-halfRoad, farY, curbH);
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(rNL.x, rNL.y);
    ctx.lineTo(rFL.x, rFL.y);
    ctx.lineTo(cFL.x, cFL.y);
    ctx.lineTo(cNL.x, cNL.y);
    ctx.closePath();
    ctx.fill();

    // Left curb top bevel
    ctx.fillStyle = '#FFFFFF';
    const cNLtop = project(-halfRoad - 4, nearY, curbH);
    const cFLtop = project(-halfRoad - 4, farY, curbH);
    ctx.beginPath();
    ctx.moveTo(cNL.x, cNL.y);
    ctx.lineTo(cFL.x, cFL.y);
    ctx.lineTo(cFLtop.x, cFLtop.y);
    ctx.lineTo(cNLtop.x, cNLtop.y);
    ctx.closePath();
    ctx.fill();

    // Right curb
    const cNR = project(halfRoad, nearY, curbH);
    const cFR = project(halfRoad, farY, curbH);
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(rNR.x, rNR.y);
    ctx.lineTo(rFR.x, rFR.y);
    ctx.lineTo(cFR.x, cFR.y);
    ctx.lineTo(cNR.x, cNR.y);
    ctx.closePath();
    ctx.fill();

    // Right curb top bevel
    ctx.fillStyle = '#FFFFFF';
    const cNRtop = project(halfRoad + 4, nearY, curbH);
    const cFRtop = project(halfRoad + 4, farY, curbH);
    ctx.beginPath();
    ctx.moveTo(cNR.x, cNR.y);
    ctx.lineTo(cFR.x, cFR.y);
    ctx.lineTo(cFRtop.x, cFRtop.y);
    ctx.lineTo(cNRtop.x, cNRtop.y);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * TRUE 3D VOLUMETRIC BUILDINGS
   * Each building is an extruded 3D architectural block with:
   * - Front Facade (along street)
   * - Side Wall / Perpendicular return (showing true 3D depth and shadows)
   * - Roof Slab with Cornice molding & parapets
   * - Recessed 3D shopfronts, awnings, and Juliet balconies
   */
  private drawVolumetricBuildings(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    wallX: number,
    playerY: number,
    horizonY: number,
    fever: boolean
  ): void {
    const segmentLength = 260;
    const startIdx = Math.floor((playerY - 100) / segmentLength);
    const endIdx = startIdx + 5;

    // Architectural color presets for a cohesive, sunlit Parisian/Mediterranean avenue
    const buildingStyles = [
      {
        frontColor: '#FAF8F5', // Cream limestone
        sideColor: '#E2DBD5', // Shaded side
        roofColor: '#475569', // Slate mansard roof
        trimColor: '#C4B5A5',
        awningColors: ['#059669', '#FFFFFF'],
        shopName: 'BOULANGERIE',
        height: 220,
        type: 'balcony',
      },
      {
        frontColor: '#FFFFFF', // Pure crisp white stucco
        sideColor: '#E2E8F0',
        roofColor: '#B45309', // Terracotta roof
        trimColor: '#CBD5E1',
        awningColors: ['#10B981', '#ECFDF5'],
        shopName: 'CAFE DE PARIS',
        height: 195,
        type: 'terrace',
      },
      {
        frontColor: '#F8FAFC',
        sideColor: '#CBD5E1',
        roofColor: '#334155',
        trimColor: '#94A3B8',
        awningColors: ['#047857', '#FFFFFF'],
        shopName: 'LIBRAIRIE',
        height: 240,
        type: 'classic',
      },
      {
        frontColor: '#FFFDF9',
        sideColor: '#E6DFD5',
        roofColor: '#92400E',
        trimColor: '#D4C3B3',
        awningColors: ['#059669', '#F0FDF4'],
        shopName: 'FLEURISTE',
        height: 210,
        type: 'balcony',
      },
    ];

    // Render from far to near for correct occlusion
    for (let i = endIdx; i >= startIdx; i--) {
      const y1 = i * segmentLength;
      const y2 = (i + 1) * segmentLength - 10; // small architectural alley gap between buildings!

      const styleLeft = buildingStyles[Math.abs(i * 3) % buildingStyles.length];
      const styleRight = buildingStyles[Math.abs(i * 3 + 1) % buildingStyles.length];

      this.renderExtrudedBuilding(ctx, project, -wallX, y1, y2, styleLeft, 'left', horizonY, fever);
      this.renderExtrudedBuilding(ctx, project, wallX, y1, y2, styleRight, 'right', horizonY, fever);
    }
  }

  /**
   * Renders a fully extruded 3D building block with front facade, side return wall, roof slab, and architectural details.
   */
  private renderExtrudedBuilding(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    frontX: number,
    y1: number,
    y2: number,
    style: {
      frontColor: string;
      sideColor: string;
      roofColor: string;
      trimColor: string;
      awningColors: string[];
      shopName: string;
      height: number;
      type: string;
    },
    side: 'left' | 'right',
    horizonY: number,
    _fever: boolean
  ): void {
    const isLeft = side === 'left';
    const buildingDepth = 150; // Depth extending outward away from street
    const backX = isLeft ? frontX - buildingDepth : frontX + buildingDepth;

    // 3D Vertices
    // Front face (street side)
    const fBL = project(frontX, y1, 0); // Front near bottom
    const fBR = project(frontX, y2, 0); // Front far bottom
    const fTR = project(frontX, y2, style.height); // Front far top
    const fTL = project(frontX, y1, style.height); // Front near top

    if (fBL.depth < 14 || fBL.y < horizonY) return;

    // Back face (recessed depth)
    const bTL = project(backX, y1, style.height);
    const bTR = project(backX, y2, style.height);
    const bBL = project(backX, y1, 0);

    ctx.save();

    // 1. FRONT STREET FACADE (Warm stone stucco)
    ctx.fillStyle = style.frontColor;
    ctx.beginPath();
    ctx.moveTo(fBL.x, fBL.y);
    ctx.lineTo(fBR.x, fBR.y);
    ctx.lineTo(fTR.x, fTR.y);
    ctx.lineTo(fTL.x, fTL.y);
    ctx.closePath();
    ctx.fill();

    // Subtle facade drop shadow along base
    ctx.strokeStyle = style.trimColor;
    ctx.lineWidth = 1.2 * fBL.scale;
    ctx.beginPath();
    ctx.moveTo(fBL.x, fBL.y);
    ctx.lineTo(fBR.x, fBR.y);
    ctx.stroke();

    // 2. NEAR SIDE WALL (Visible 3D Depth return facing player!)
    // This gives the building genuine physical thickness!
    ctx.fillStyle = style.sideColor;
    ctx.beginPath();
    ctx.moveTo(fBL.x, fBL.y);
    ctx.lineTo(fTL.x, fTL.y);
    ctx.lineTo(bTL.x, bTL.y);
    ctx.lineTo(bBL.x, bBL.y);
    ctx.closePath();
    ctx.fill();

    // 3. HORIZONTAL ROOF SLAB / PARAPET TOP
    ctx.fillStyle = style.roofColor;
    ctx.beginPath();
    ctx.moveTo(fTL.x, fTL.y);
    ctx.lineTo(fTR.x, fTR.y);
    ctx.lineTo(bTR.x, bTR.y);
    ctx.lineTo(bTL.x, bTL.y);
    ctx.closePath();
    ctx.fill();

    // 4. ARCHITECTURAL CORNICE MOLDING (Classical roof ledge)
    ctx.fillStyle = '#FFFFFF';
    const cTL = project(frontX, y1, style.height + 8);
    const cTR = project(frontX, y2, style.height + 8);
    ctx.beginPath();
    ctx.moveTo(fTL.x, fTL.y);
    ctx.lineTo(fTR.x, fTR.y);
    ctx.lineTo(cTR.x, cTR.y);
    ctx.lineTo(cTL.x, cTL.y);
    ctx.closePath();
    ctx.fill();

    // 5. WINDOWS & BALCONIES
    const numFloors = 3;
    const floorH = style.height / (numFloors + 0.6);
    const numBays = 3;
    const bayStep = (y2 - y1) / numBays;

    for (let floor = 1; floor <= numFloors; floor++) {
      const winBaseZ = floor * floorH - 10;
      for (let bay = 0; bay < numBays; bay++) {
        const winY = y1 + bay * bayStep + 25;
        this.draw3DWindow(ctx, project, frontX, winY, winBaseZ, 32, 42, isLeft);

        // Juliet Balcony Railing on 2nd floor
        if (floor === 2 && style.type === 'balcony') {
          this.drawJulietBalcony(ctx, project, frontX, winY, winBaseZ, 36, isLeft);
        }
      }
    }

    // 6. GROUND FLOOR SHOP ENTRANCE & AWNING
    const shopAwningY = y1 + (y2 - y1) * 0.25;
    const shopAwningW = (y2 - y1) * 0.55;
    this.draw3DShopAwning(ctx, project, frontX, shopAwningY, shopAwningW, 60, style.awningColors, isLeft);

    // 7. 3D SHOP SIGNBOARD WITH GOLD LETTERING
    const signP = project(frontX, shopAwningY + shopAwningW * 0.5, 76);
    if (signP.depth > 18) {
      ctx.save();
      ctx.translate(signP.x, signP.y);
      const s = signP.scale;

      // Dark emerald sign with white/gold border
      ctx.fillStyle = '#064E3B';
      ctx.fillRect(-32 * s, -10 * s, 64 * s, 20 * s);
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1.6 * s;
      ctx.strokeRect(-32 * s, -10 * s, 64 * s, 20 * s);

      ctx.font = `900 ${Math.round(8.5 * s)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(style.shopName, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Recessed 3D Window with Timber Arch Frame and Glass Reflection
   */
  private draw3DWindow(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    wallX: number,
    winY: number,
    winZ: number,
    wY: number,
    hZ: number,
    _isLeft: boolean
  ): void {
    const pBL = project(wallX, winY, winZ);
    const pBR = project(wallX, winY + wY, winZ);
    const pTR = project(wallX, winY + wY, winZ + hZ);
    const pTL = project(wallX, winY, winZ + hZ);

    if (pBL.depth < 16) return;

    // Recessed Stone Lintel Frame
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(pBL.x, pBL.y);
    ctx.lineTo(pBR.x, pBR.y);
    ctx.lineTo(pTR.x, pTR.y);
    ctx.lineTo(pTL.x, pTL.y);
    ctx.closePath();
    ctx.fill();

    // Sparkling Sky-Blue Reflective Window Glass
    ctx.fillStyle = '#BAE6FD';
    const inset = 3;
    const gBL = project(wallX, winY + inset, winZ + inset);
    const gBR = project(wallX, winY + wY - inset, winZ + inset);
    const gTR = project(wallX, winY + wY - inset, winZ + hZ - inset);
    const gTL = project(wallX, winY + inset, winZ + hZ - inset);

    ctx.beginPath();
    ctx.moveTo(gBL.x, gBL.y);
    ctx.lineTo(gBR.x, gBR.y);
    ctx.lineTo(gTR.x, gTR.y);
    ctx.lineTo(gTL.x, gTL.y);
    ctx.closePath();
    ctx.fill();

    // Window Mullion & Transom (cross bar)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2 * pBL.scale;
    const gMidY = project(wallX, winY + wY * 0.5, winZ + inset);
    const gTopMidY = project(wallX, winY + wY * 0.5, winZ + hZ - inset);
    ctx.beginPath();
    ctx.moveTo(gMidY.x, gMidY.y);
    ctx.lineTo(gTopMidY.x, gTopMidY.y);
    ctx.stroke();

    // Specular Sun Glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(gTL.x, gTL.y);
    ctx.lineTo(gTL.x + 8 * pBL.scale, gTL.y);
    ctx.lineTo(gBL.x, gBL.y + 6 * pBL.scale);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Wrought Iron Juliet Balcony with delicate railing
   */
  private drawJulietBalcony(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    wallX: number,
    winY: number,
    winZ: number,
    wY: number,
    isLeft: boolean
  ): void {
    const overhang = isLeft ? 8 : -8;
    const bL = project(wallX + overhang, winY - 3, winZ);
    const bR = project(wallX + overhang, winY + wY + 3, winZ);
    const tR = project(wallX + overhang, winY + wY + 3, winZ + 14);
    const tL = project(wallX + overhang, winY - 3, winZ + 14);

    if (bL.depth < 16) return;

    // Stone Balcony Corbel Base
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(bL.x, bL.y);
    ctx.lineTo(bR.x, bR.y);
    ctx.lineTo(bR.x, bR.y + 3 * bL.scale);
    ctx.lineTo(bL.x, bL.y + 3 * bL.scale);
    ctx.closePath();
    ctx.fill();

    // Black Cast Iron Railing
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.4 * bL.scale;
    ctx.beginPath();
    ctx.moveTo(bL.x, bL.y);
    ctx.lineTo(tL.x, tL.y);
    ctx.lineTo(tR.x, tR.y);
    ctx.lineTo(bR.x, bR.y);
    ctx.stroke();

    // Vertical railing pickets
    for (let p = 1; p <= 4; p++) {
      const frac = p / 5;
      const pB = project(wallX + overhang, winY + wY * frac, winZ);
      const pT = project(wallX + overhang, winY + wY * frac, winZ + 14);
      ctx.beginPath();
      ctx.moveTo(pB.x, pB.y);
      ctx.lineTo(pT.x, pT.y);
      ctx.stroke();
    }
  }

  /**
   * 3D Extruded Shop Awning with canopy depth and support brackets
   */
  private draw3DShopAwning(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    wallX: number,
    awnY: number,
    widthY: number,
    baseZ: number,
    colors: string[],
    isLeft: boolean
  ): void {
    const overhang = isLeft ? 32 : -32;
    const slopeZ = 18;

    const w1 = project(wallX, awnY, baseZ + slopeZ);
    if (w1.depth < 15) return;

    const stripes = 5;
    const step = widthY / stripes;

    for (let s = 0; s < stripes; s++) {
      const sw1 = project(wallX, awnY + s * step, baseZ + slopeZ);
      const sw2 = project(wallX, awnY + (s + 1) * step, baseZ + slopeZ);
      const so1 = project(wallX + overhang, awnY + s * step, baseZ);
      const so2 = project(wallX + overhang, awnY + (s + 1) * step, baseZ);

      // Alternating colorful awning stripes
      ctx.fillStyle = s % 2 === 0 ? colors[0] : colors[1];
      ctx.beginPath();
      ctx.moveTo(sw1.x, sw1.y);
      ctx.lineTo(sw2.x, sw2.y);
      ctx.lineTo(so2.x, so2.y);
      ctx.lineTo(so1.x, so1.y);
      ctx.closePath();
      ctx.fill();

      // Front scalloped valance fringe
      ctx.fillStyle = s % 2 === 0 ? colors[0] : colors[1];
      ctx.beginPath();
      ctx.moveTo(so1.x, so1.y);
      ctx.lineTo(so2.x, so2.y);
      ctx.lineTo(so2.x, so2.y + 6 * so2.scale);
      ctx.lineTo(so1.x, so1.y + 6 * so1.scale);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Sculpted 3D Trees, Classic Lampposts, and Flower Planters
   */
  private drawBoulevardProps(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    halfRoad: number,
    playerY: number,
    horizonY: number
  ): void {
    const interval = 220;
    const startIdx = Math.floor((playerY - 80) / interval);
    const endIdx = startIdx + 5;

    for (let i = startIdx; i <= endIdx; i++) {
      const pY = i * interval;

      // Cast-Iron Lampposts on the sidewalk curb edge
      this.draw3DLamppost(ctx, project, -halfRoad - 12, pY + 25, horizonY);
      this.draw3DLamppost(ctx, project, halfRoad + 12, pY + 25, horizonY);

      // Alternating Sculpted 3D Trees & Sidewalk Flower Planters
      if (i % 2 === 0) {
        this.draw3DLushTree(ctx, project, -halfRoad - 45, pY + 110, horizonY);
        this.draw3DLushTree(ctx, project, halfRoad + 45, pY + 110, horizonY);
      } else {
        this.draw3DFlowerPlanter(ctx, project, -halfRoad - 35, pY + 110, horizonY);
        this.draw3DFlowerPlanter(ctx, project, halfRoad + 35, pY + 110, horizonY);
      }
    }
  }

  /**
   * Sculpted 3D Tree with Multi-Sphere Foliage and Natural Ambient Shadows
   */
  private draw3DLushTree(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    wx: number,
    wy: number,
    horizonY: number
  ): void {
    const p = project(wx, wy, 0);
    if (p.depth < 16 || p.y < horizonY) return;

    const s = p.scale;
    const x = p.x;
    const y = p.y;

    ctx.save();
    // 1. Soft Ground Contact Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, 22 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Sculpted Wood Trunk with Bark Tone
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(x - 4 * s, y);
    ctx.lineTo(x - 2.5 * s, y - 28 * s);
    ctx.lineTo(x + 2.5 * s, y - 28 * s);
    ctx.lineTo(x + 4 * s, y);
    ctx.closePath();
    ctx.fill();

    // 3. Volumetric Foliage: 3 Spheres with Ambient Occlusion & Sunlit Rim
    const clusters = [
      { dx: 0, dy: -42 * s, r: 22 * s, color: '#10B981' },
      { dx: -10 * s, dy: -36 * s, r: 17 * s, color: '#059669' },
      { dx: 11 * s, dy: -38 * s, r: 18 * s, color: '#34D399' },
      { dx: 0, dy: -52 * s, r: 16 * s, color: '#6EE7B7' },
    ];

    for (const c of clusters) {
      const grad = ctx.createRadialGradient(
        x + c.dx - c.r * 0.35,
        y + c.dy - c.r * 0.35,
        c.r * 0.2,
        x + c.dx,
        y + c.dy,
        c.r
      );
      grad.addColorStop(0, '#A7F3D0'); // Bright sunlit leaves
      grad.addColorStop(0.4, c.color); // Rich foliage green
      grad.addColorStop(1, '#064E3B'); // Deep shade under canopy
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + c.dx, y + c.dy, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Classic Cast-Iron Lamppost with Glowing Lantern Head
   */
  private draw3DLamppost(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    wx: number,
    wy: number,
    horizonY: number
  ): void {
    const p = project(wx, wy, 0);
    if (p.depth < 16 || p.y < horizonY) return;

    const s = p.scale;
    const x = p.x;
    const y = p.y;

    ctx.save();
    // Base shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x, y, 6 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark slate cast-iron pedestal
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(x - 3.5 * s, y - 8 * s, 7 * s, 8 * s);

    // Slim tapered pole
    ctx.fillRect(x - 1.8 * s, y - 56 * s, 3.6 * s, 48 * s);

    // Lantern Head with Warm Glowing Filament
    const lanternY = y - 62 * s;
    const glow = ctx.createRadialGradient(x, lanternY, 2 * s, x, lanternY, 14 * s);
    glow.addColorStop(0, '#FEF9C3');
    glow.addColorStop(0.4, 'rgba(253, 224, 71, 0.5)');
    glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, lanternY, 14 * s, 0, Math.PI * 2);
    ctx.fill();

    // Lantern Housing
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, lanternY, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 3D Sidewalk Flower Planter Box with Blooming Flowers
   */
  private draw3DFlowerPlanter(
    ctx: CanvasRenderingContext2D,
    project: (wx: number, wy: number, wz?: number) => { x: number; y: number; scale: number; depth: number },
    wx: number,
    wy: number,
    horizonY: number
  ): void {
    const p = project(wx, wy, 0);
    if (p.depth < 16 || p.y < horizonY) return;

    const s = p.scale;
    const x = p.x;
    const y = p.y;
    const bW = 26 * s;
    const bH = 12 * s;

    ctx.save();
    // Stone Planter Box with 3D Depth
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(x - bW / 2, y - bH, bW, bH);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - bW / 2, y - bH, bW, 2.5 * s); // top rim

    // Soil & Greenery
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(x - 6 * s, y - bH, 5 * s, Math.PI, Math.PI * 2);
    ctx.arc(x, y - bH - 1 * s, 6 * s, Math.PI, Math.PI * 2);
    ctx.arc(x + 6 * s, y - bH, 5 * s, Math.PI, Math.PI * 2);
    ctx.fill();

    // Colorful Flower Petals
    const flowers = [
      { x: x - 6 * s, y: y - bH - 4 * s, color: '#F43F5E' },
      { x: x, y: y - bH - 6 * s, color: '#FBBF24' },
      { x: x + 6 * s, y: y - bH - 4 * s, color: '#A855F7' },
    ];
    for (const fl of flowers) {
      ctx.fillStyle = fl.color;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 2.6 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * 3D PLAYER RUNNER (True 3D Volumetric Streetwear Runner)
   * - Rounded 3D head with directional shading & runner cap
   * - Volumetric torso with athletic sports hoodie & utility backpack
   * - Articulated cycling running legs with 3D sneakers
   * - Dynamic 3D elastic slap attack with comic glove and motion trails
   */
  /**
   * 3D PLAYER RUNNER (High-Fidelity Expressive Streetwear Runner)
   * - Underfoot glowing Neon Emerald Ground Ring & Lane Chevron
   * - Floating "YOU" Hero Beacon for instant visual focus on all screens
   * - Dynamic steering lean with expressive 3D face profile (eyes, eyebrows, smirk, blushing cheeks)
   * - Articulated cycling running legs with 3D chunky sneakers and dust puffs
   * - Dynamic 3D elastic slap attack with crimson target glove and impact sparks
   * - Volumetric torso with athletic hoodie & utility backpack
   */
  private draw3DPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    player: Player,
    fever: boolean
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;

    // Banana Peel 360-degree spin slip
    if (player.slipTimer > 0) {
      const angle = (player.slipTimer / 30) * Math.PI * 6;
      ctx.rotate(angle);
    }

    // Dynamic steering lean when swerving left or right
    const steerAngle = Math.max(-0.24, Math.min(0.24, player.vx * 0.026));
    ctx.rotate(steerAngle);

    // 1. UNDERFOOT HERO NEON HALO & GROUND LANE CHEVRON
    const shadowScale = Math.max(0.4, 1 - (player.z / 120));
    // Soft contact drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4 * s + (player.z * 0.3 * s), 25 * s * shadowScale, 10 * s * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing Neon Emerald Ground Halo (guarantees player is always instantly spotted)
    const haloPulse = (24 + Math.sin(this.time * 6) * 3) * s;
    ctx.strokeStyle = fever ? 'rgba(253, 224, 71, 0.85)' : 'rgba(16, 185, 129, 0.85)';
    ctx.lineWidth = 2.6 * s;
    ctx.beginPath();
    ctx.ellipse(0, 4 * s + (player.z * 0.3 * s), haloPulse, haloPulse * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Crisp inner white ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.ellipse(0, 4 * s + (player.z * 0.3 * s), haloPulse * 0.75, haloPulse * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Forward Direction Neon Chevron (shows exact lane alignment)
    ctx.fillStyle = fever ? '#F59E0B' : '#10B981';
    ctx.beginPath();
    ctx.moveTo(0, -6 * s);
    ctx.lineTo(-6 * s, 1 * s);
    ctx.lineTo(-3 * s, 1 * s);
    ctx.lineTo(0, -3 * s);
    ctx.lineTo(3 * s, 1 * s);
    ctx.lineTo(6 * s, 1 * s);
    ctx.closePath();
    ctx.fill();

    // 2. Fever Run Golden Plasma Aura
    if (fever) {
      const aura = ctx.createRadialGradient(0, -36 * s, 8 * s, 0, -36 * s, 54 * s);
      aura.addColorStop(0, 'rgba(253, 224, 71, 0.75)');
      aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
      aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -36 * s, 54 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Running stride cycle
    const runPhase = player.runCycle * 8;
    const legSwing = Math.sin(runPhase);
    const armSwing = Math.cos(runPhase);
    const verticalBob = Math.abs(Math.sin(runPhase)) * 4 * s;


    // 3. 3D CYCLING LEGS WITH PRO RUNNER SNEAKERS & SPRINT DUST
    ctx.strokeStyle = player.skin.pantsColor;
    ctx.lineWidth = 6.5 * s;
    ctx.lineCap = 'round';

    // Left leg
    const leftHipX = -6 * s;
    const leftFootX = -8 * s + legSwing * 9 * s;
    const leftFootY = 7 * s - Math.max(0, -legSwing) * 6 * s;
    ctx.beginPath();
    ctx.moveTo(leftHipX, -10 * s - verticalBob);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();

    // Right leg
    const rightHipX = 6 * s;
    const rightFootX = 8 * s - legSwing * 9 * s;
    const rightFootY = 7 * s - Math.max(0, legSwing) * 6 * s;
    ctx.beginPath();
    ctx.moveTo(rightHipX, -10 * s - verticalBob);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    // 3D Sculpted Runner Sneakers (Thick beveled sole, tread, colored heel & laces)
    // Left shoe sole
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(leftFootX, leftFootY + 1.2 * s, 6 * s, 3.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Left shoe upper (Crisp athletic white with gradient)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(leftFootX, leftFootY - 0.5 * s, 5.5 * s, 3.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Left shoe heel counter & emerald accent
    ctx.fillStyle = fever ? '#F59E0B' : '#10B981';
    ctx.beginPath();
    ctx.ellipse(leftFootX - 1.8 * s, leftFootY - 1.2 * s, 2.8 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right shoe sole
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(rightFootX, rightFootY + 1.2 * s, 6 * s, 3.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right shoe upper
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(rightFootX, rightFootY - 0.5 * s, 5.5 * s, 3.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right shoe heel counter
    ctx.fillStyle = fever ? '#F59E0B' : '#10B981';
    ctx.beginPath();
    ctx.ellipse(rightFootX - 1.8 * s, rightFootY - 1.2 * s, 2.8 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sprint Dust Puffs behind sneakers
    if (Math.abs(legSwing) > 0.6) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      const dustX = legSwing > 0 ? leftFootX - 4 * s : rightFootX + 4 * s;
      ctx.beginPath();
      ctx.arc(dustX, 6 * s, 3.5 * s, 0, Math.PI * 2);
      ctx.arc(dustX - 2.5 * s, 3.5 * s, 2.4 * s, 0, Math.PI * 2);
      ctx.arc(dustX + 1.5 * s, 5 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. VOLUMETRIC TORSO & ATHLETIC HOODIE WITH 3D SHADING
    const torsoY = -34 * s - verticalBob;
    const torsoW = 25 * s;
    const torsoH = 27 * s;

    // Volumetric 3D torso gradient (Sunlight highlight on top-left, deep contour shadow on right)
    const torsoGrad = ctx.createLinearGradient(-torsoW / 2, torsoY, torsoW / 2, torsoY + torsoH);
    torsoGrad.addColorStop(0, '#FFFFFF');
    torsoGrad.addColorStop(0.18, player.skin.shirtColor);
    torsoGrad.addColorStop(0.85, player.skin.shirtColor);
    torsoGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.roundRect(-torsoW / 2, torsoY, torsoW, torsoH, 7 * s);
    ctx.fill();

    // Athletic central white racing stripe with clean bevel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2.5 * s, torsoY, 5 * s, torsoH);

    // 3D Hydro Pack on runner's back (Extruded volumetric shape with gold clip)
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(-7.5 * s, torsoY + 4 * s, 15 * s, 17 * s, 4.5 * s);
    ctx.fill();
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-6 * s, torsoY + 6 * s, 12 * s, 4 * s);

    // Gold buckle & hydro tube
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-3 * s, torsoY + 9 * s, 6 * s, 3 * s);

    // 5. 3D ARMS & HIGH-IMPACT ELASTIC SLAP GLOVE
    if (player.isSlapping) {
      const side = player.slapHand === 'left' ? -1 : 1;
      const progress = player.slapProgress;
      const armExtension = 72 * s * Math.sin(progress * Math.PI);
      const armEndY = torsoY + 6 * s - Math.sin(progress * Math.PI) * 18 * s;
      const armEndX = side * (14 * s + armExtension);

      // Elastic 3D Cartoon Arm with Wind Swoosh Arcs
      ctx.strokeStyle = player.skin.bodyColor;
      ctx.lineWidth = 8.5 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(side * 10 * s, torsoY + 6 * s);
      ctx.quadraticCurveTo(side * (30 * s + armExtension * 0.5), torsoY - 20 * s, armEndX, armEndY);
      ctx.stroke();

      // Dual Wind Trail Speed Swooshes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 18 * s, side > 0 ? -Math.PI / 2 : 0, side > 0 ? Math.PI / 2 : Math.PI);
      ctx.stroke();

      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 23 * s, side > 0 ? -Math.PI * 0.4 : 0.1, side > 0 ? Math.PI * 0.4 : Math.PI * 0.9);
      ctx.stroke();

      // Giant Sculpted 3D Slap Glove in Vivid Crimson with Volumetric Shading
      const gloveR = 14 * s;
      const gloveGrad = ctx.createRadialGradient(
        armEndX - gloveR * 0.35,
        armEndY - gloveR * 0.35,
        1 * s,
        armEndX,
        armEndY,
        gloveR
      );
      gloveGrad.addColorStop(0, '#FF8595');
      gloveGrad.addColorStop(0.4, '#FF3B56');
      gloveGrad.addColorStop(0.85, '#BE123C');
      gloveGrad.addColorStop(1, '#881337');
      ctx.fillStyle = gloveGrad;
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, gloveR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#17181C';
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();

      // White Glove Target Bullseye with Red Center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 5.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF3B56';
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Padded Glove Wrist Cuff in Pure Athletic White
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(armEndX - side * 6 * s, armEndY + 5 * s, 6 * s, 3.5 * s, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#17181C';
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();

      // Opposite idle arm pumping naturally
      ctx.strokeStyle = player.skin.bodyColor;
      ctx.lineWidth = 5.5 * s;
      ctx.beginPath();
      ctx.moveTo(-side * 10 * s, torsoY + 6 * s);
      ctx.lineTo(-side * 17 * s, torsoY + 18 * s);
      ctx.stroke();
    } else {
      // Natural running arm swing with elbow bends and shirt shoulder sleeves
      ctx.strokeStyle = player.skin.bodyColor;
      ctx.lineWidth = 5.5 * s;
      ctx.lineCap = 'round';

      // Left arm
      ctx.beginPath();
      ctx.moveTo(-11 * s, torsoY + 6 * s);
      ctx.lineTo(-17 * s, torsoY + 16 * s + armSwing * 8 * s);
      ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(11 * s, torsoY + 6 * s);
      ctx.lineTo(17 * s, torsoY + 16 * s - armSwing * 8 * s);
      ctx.stroke();
    }

    // 6. VOLUMETRIC 3D HEAD & COMPLETE EXPRESSIVE FACE
    const headY = torsoY - 14 * s;
    const headRadius = 13.5 * s;

    // Directional spherical lighting on head
    const headGrad = ctx.createRadialGradient(
      -3 * s,
      headY - 4 * s,
      2 * s,
      0,
      headY,
      headRadius
    );
    headGrad.addColorStop(0, '#FED7AA'); // Warm sunlight highlight
    headGrad.addColorStop(0.6, player.skin.bodyColor);
    headGrad.addColorStop(1, '#C2410C'); // Soft contour shadow
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Cute ears on left & right
    ctx.fillStyle = player.skin.bodyColor;
    ctx.beginPath();
    ctx.arc(-headRadius + 1 * s, headY, 3 * s, 0, Math.PI * 2);
    ctx.arc(headRadius - 1 * s, headY, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    // EXPRESSIVE FACIAL FEATURES (Responsive to Slap, Slip, Steering, and Fever)
    if (player.slipTimer > 0) {
      // Hilarious Panicked Slip Face: wide circular anime eyes & screaming open mouth!
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-4 * s, headY - 1 * s, 4 * s, 0, Math.PI * 2);
      ctx.arc(4 * s, headY - 1 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();

      // Tiny shocked pupils
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(-4 * s, headY - 1 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.arc(4 * s, headY - 1 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Screaming O-mouth with pink tongue
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(0, headY + 5.5 * s, 3.5 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.ellipse(0, headY + 7.5 * s, 2.5 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (player.isSlapping) {
      // Energetic Champion Slap Grin & Winking Action Eye
      const slapSide = player.slapHand === 'left' ? -1 : 1;
      const eyeX = slapSide * 4.5 * s;

      // Big bright focused action eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(eyeX, headY - 1 * s, 3.8 * s, 4.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Emerald iris & black pupil
      ctx.fillStyle = fever ? '#F59E0B' : '#059669';
      ctx.beginPath();
      ctx.arc(eyeX, headY - 1 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(eyeX, headY - 1 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
      // Catchlight glint
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeX - 1 * s, headY - 2 * s, 0.9 * s, 0, Math.PI * 2);
      ctx.fill();

      // Opposite winking eye (> or < shape)
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(-eyeX - 3 * s, headY - 3 * s);
      ctx.lineTo(-eyeX, headY - 1 * s);
      ctx.lineTo(-eyeX - 3 * s, headY + 1 * s);
      ctx.stroke();

      // Wide open toothy victory grin!
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(0, headY + 4 * s, 4 * s, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      // Pearly white upper teeth
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-2.5 * s, headY + 4 * s, 5 * s, 1.8 * s);
      // Rosy champion cheek
      ctx.fillStyle = 'rgba(251, 113, 133, 0.8)';
      ctx.beginPath();
      ctx.arc(eyeX + slapSide * 2 * s, headY + 2.5 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (Math.abs(player.vx) > 0.8) {
      // Dynamic steering 3/4 face profile: big expressive anime eye, eyebrow, smirk, flushed cheek
      const steerDir = player.vx > 0 ? 1 : -1;
      const eyeX = steerDir * 4 * s;

      // Big bright cartoon eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(eyeX, headY - 1 * s, 3.5 * s, 4.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Emerald / Gold iris & dark pupil
      ctx.fillStyle = fever ? '#F59E0B' : '#059669';
      ctx.beginPath();
      ctx.arc(eyeX, headY - 1 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(eyeX, headY - 1 * s, 1.1 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeX - 0.8 * s, headY - 2 * s, 0.9 * s, 0, Math.PI * 2);
      ctx.fill();

      // Confident angled sporty eyebrow
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(eyeX - 3 * s, headY - 5.5 * s);
      ctx.lineTo(eyeX + 3 * s, headY - 4 * s);
      ctx.stroke();

      // Determined cheeky smirk with tooth gleam
      ctx.beginPath();
      ctx.arc(eyeX * 0.4, headY + 4 * s, 3 * s, 0.1 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      // Peach flushed cheek
      ctx.fillStyle = 'rgba(251, 113, 133, 0.7)';
      ctx.beginPath();
      ctx.arc(eyeX + steerDir * 2 * s, headY + 2.5 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Forward sprint stance: CRYSTAL CLEAR, EXPRESSIVE CARTOON EYES & LIVELY MOUTH
      // Left Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-4.5 * s, headY - 1.5 * s, 3.4 * s, 4.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.1 * s;
      ctx.stroke();

      // Left Iris (Emerald or Gold in Fever)
      ctx.fillStyle = fever ? '#F59E0B' : '#059669';
      ctx.beginPath();
      ctx.arc(-4.5 * s, headY - 1.5 * s, 2.1 * s, 0, Math.PI * 2);
      ctx.fill();

      // Left Pupil
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(-4.5 * s, headY - 1.5 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();

      // Left Specular Catchlight Glint
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-5.2 * s, headY - 2.5 * s, 0.9 * s, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(4.5 * s, headY - 1.5 * s, 3.4 * s, 4.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.1 * s;
      ctx.stroke();

      // Right Iris
      ctx.fillStyle = fever ? '#F59E0B' : '#059669';
      ctx.beginPath();
      ctx.arc(4.5 * s, headY - 1.5 * s, 2.1 * s, 0, Math.PI * 2);
      ctx.fill();

      // Right Pupil
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(4.5 * s, headY - 1.5 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();

      // Right Specular Catchlight Glint
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(3.8 * s, headY - 2.5 * s, 0.9 * s, 0, Math.PI * 2);
      ctx.fill();

      // Determined athletic eyebrows
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(-7 * s, headY - 5 * s);
      ctx.lineTo(-2 * s, headY - 4.2 * s);
      ctx.moveTo(7 * s, headY - 5 * s);
      ctx.lineTo(2 * s, headY - 4.2 * s);
      ctx.stroke();

      // Energetic Runner Open Smile with White Teeth
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(0, headY + 3.5 * s, 3.6 * s, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      // Pearly white upper teeth
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-2.4 * s, headY + 3.5 * s, 4.8 * s, 1.6 * s);

      // Pink tongue
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.ellipse(0, headY + 5.8 * s, 2.2 * s, 1.4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft blushing cheeks
      ctx.fillStyle = 'rgba(251, 113, 133, 0.6)';
      ctx.beginPath();
      ctx.arc(-7 * s, headY + 2.5 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.arc(7 * s, headY + 2.5 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Headwear details
    if (player.skin.hat === 'cap') {
      // 3D Emerald Baseball Cap
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(0, headY - 4 * s, 12 * s, Math.PI, Math.PI * 2);
      ctx.fill();

      // Cap backwards brim visor
      ctx.fillRect(-8 * s, headY - 4 * s, 16 * s, 4 * s);

      // Top button
      ctx.fillStyle = '#34D399';
      ctx.beginPath();
      ctx.arc(0, headY - 16 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (player.skin.hat === 'headband') {
      // Techwear Emerald Headband with Fluttering Tails
      ctx.fillStyle = '#10B981';
      ctx.fillRect(-13 * s, headY - 6 * s, 26 * s, 5 * s);

      // Trailing ribbon tails in the wind
      ctx.beginPath();
      ctx.moveTo(-12 * s, headY - 4 * s);
      ctx.quadraticCurveTo(-20 * s + armSwing * 4 * s, headY + 2 * s, -24 * s, headY + 8 * s);
      ctx.stroke();
    } else if (player.skin.hat === 'crown') {
      // 3D Golden Champ Crown
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(-11 * s, headY - 7 * s);
      ctx.lineTo(-11 * s, headY - 16 * s);
      ctx.lineTo(-5 * s, headY - 11 * s);
      ctx.lineTo(0, headY - 18 * s);
      ctx.lineTo(5 * s, headY - 11 * s);
      ctx.lineTo(11 * s, headY - 16 * s);
      ctx.lineTo(11 * s, headY - 7 * s);
      ctx.closePath();
      ctx.fill();

      // Crown Ruby Gem
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, headY - 11 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. FLOATING "YOU" HERO BEACON (Gives 100% instant visual recognition on all devices)
    const beaconY = headY - (player.skin.hat === 'crown' ? 26 : 21) * s + Math.sin(this.time * 6) * 2.5 * s;
    const badgeW = 44 * s;
    const badgeH = 17 * s;

    // Glowing drop shadow under badge
    ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.beginPath();
    ctx.roundRect(-badgeW / 2 - 1 * s, beaconY - 1 * s, badgeW + 2 * s, badgeH + 2 * s, 9 * s);
    ctx.fill();

    // Crisp white badge card
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-badgeW / 2, beaconY, badgeW, badgeH, 8.5 * s);
    ctx.fill();

    // Emerald border
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.8 * s;
    ctx.stroke();

    // Emerald pulsing indicator dot
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(-badgeW / 2 + 7.5 * s, beaconY + badgeH / 2, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    // Bold YOU text
    ctx.fillStyle = '#065F46';
    ctx.font = `900 ${9.5 * s}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YOU', 5 * s, beaconY + badgeH / 2 + 0.5 * s);

    // Downward pointing arrow tip toward player head
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(-3 * s, beaconY + badgeH);
    ctx.lineTo(3 * s, beaconY + badgeH);
    ctx.lineTo(0, beaconY + badgeH + 3.5 * s);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * 3D BYSTANDER PEDESTRIANS (Expressive cartoon human faces with eyes, eyebrows, mouths, and cheeks)
   */
  private draw3DBystander(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    b: Bystander
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;

    // Contact shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Comical wobble on slap hit
    if (b.wobble > 0) {
      const wobbleAngle = Math.sin(b.wobble * Math.PI * 8) * 0.35 * b.wobble;
      ctx.rotate(wobbleAngle);
    }

    // Legs
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-7 * s, -12 * s, 5 * s, 15 * s);
    ctx.fillRect(2 * s, -12 * s, 5 * s, 15 * s);

    // Torso Shirt
    ctx.fillStyle = b.slapped ? '#EF4444' : b.shirtColor; // Flushes bright red on slap!
    ctx.beginPath();
    ctx.roundRect(-11 * s, -34 * s, 22 * s, 24 * s, 5 * s);
    ctx.fill();

    // Head
    const headY = -45 * s;
    const headRadius = 11.5 * s;

    // Directional head lighting
    const headGrad = ctx.createRadialGradient(-2 * s, headY - 3 * s, 2 * s, 0, headY, headRadius);
    headGrad.addColorStop(0, '#FED7AA');
    headGrad.addColorStop(0.7, b.bodyColor);
    headGrad.addColorStop(1, '#9A3412');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Ears on sides
    ctx.fillStyle = b.bodyColor;
    ctx.beginPath();
    ctx.arc(-headRadius + 0.5 * s, headY, 2.6 * s, 0, Math.PI * 2);
    ctx.arc(headRadius - 0.5 * s, headY, 2.6 * s, 0, Math.PI * 2);
    ctx.fill();

    // REAL EXPRESSIVE CARTOON FACIAL FEATURES
    if (b.slapped) {
      // HILARIOUS DIZZY SLAP FACE: spinning anime spiral eyes & screaming open mouth!
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8 * s;

      // Left spiral eye (@_@)
      ctx.beginPath();
      ctx.arc(-4 * s, headY - 1 * s, 3.2 * s, 0, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-4 * s, headY - 1 * s, 1.6 * s, Math.PI * 0.5, Math.PI * 2);
      ctx.stroke();

      // Right spiral eye
      ctx.beginPath();
      ctx.arc(4 * s, headY - 1 * s, 3.2 * s, 0, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4 * s, headY - 1 * s, 1.6 * s, Math.PI * 0.5, Math.PI * 2);
      ctx.stroke();

      // Surprised high curved eyebrows
      ctx.beginPath();
      ctx.arc(-4 * s, headY - 6 * s, 2.5 * s, Math.PI, Math.PI * 2);
      ctx.arc(4 * s, headY - 6 * s, 2.5 * s, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Screaming O-mouth with white teeth and tongue
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(0, headY + 5.5 * s, 3.8 * s, 5.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pearly white upper teeth
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-2.5 * s, headY + 2.5 * s, 5 * s, 2 * s);

      // Pink tongue
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.ellipse(0, headY + 8 * s, 2.8 * s, 2.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright red shocked blushing cheeks
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(-7 * s, headY + 3 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.arc(7 * s, headY + 3 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Comic dizzy stars orbiting head
      ctx.fillStyle = '#F59E0B';
      const starPhase = this.time * 12;
      const star1X = Math.cos(starPhase) * 14 * s;
      const star1Y = headY - 10 * s + Math.sin(starPhase) * 5 * s;
      ctx.beginPath();
      ctx.arc(star1X, star1Y, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // VIBRANT, EXPRESSIVE, FRIENDLY WALKING HUMAN FACE
      // 1. Left Eye: white eyeball, colored iris, pupil, and white catchlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-4.5 * s, headY - 1.5 * s, 3.2 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1 * s;
      ctx.stroke();

      // Left Iris (Role-colored)
      const irisColor = b.type === 'fishmonger' ? '#0369A1' : b.type === 'influencer' ? '#7C3AED' : '#059669';
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.arc(-4.5 * s, headY - 1.5 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();

      // Left Pupil
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(-4.5 * s, headY - 1.5 * s, 1.1 * s, 0, Math.PI * 2);
      ctx.fill();

      // Left Specular Catchlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-5.2 * s, headY - 2.5 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();

      // 2. Right Eye: matching expressive eyeball
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(4.5 * s, headY - 1.5 * s, 3.2 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1 * s;
      ctx.stroke();

      // Right Iris
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.arc(4.5 * s, headY - 1.5 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();

      // Right Pupil
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(4.5 * s, headY - 1.5 * s, 1.1 * s, 0, Math.PI * 2);
      ctx.fill();

      // Right Specular Catchlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(3.8 * s, headY - 2.5 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();

      // 3. Expressive Eyebrows
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.arc(-4.5 * s, headY - 5 * s, 3 * s, 1.1 * Math.PI, 1.8 * Math.PI);
      ctx.arc(4.5 * s, headY - 5 * s, 3 * s, 1.2 * Math.PI, 1.9 * Math.PI);
      ctx.stroke();

      // 4. Cheerful Friendly Smile with dimples
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.arc(0, headY + 3.8 * s, 3.8 * s, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // 5. Cute Blushing Rosy Cheeks
      ctx.fillStyle = 'rgba(251, 113, 133, 0.65)';
      ctx.beginPath();
      ctx.arc(-7 * s, headY + 2.5 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.arc(7 * s, headY + 2.5 * s, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Role-specific accessories (Chef toque, Influencer phone, Baker apron)
    if (!b.slapped) {
      if (b.accessory === 'fish') {
        // Chef Toque & curled mustache
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.rect(-7 * s, headY - 18 * s, 14 * s, 8 * s);
        ctx.arc(0, headY - 18 * s, 9 * s, Math.PI, Math.PI * 2);
        ctx.fill();

        // Chef curled mustache
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.moveTo(-4 * s, headY + 2.5 * s);
        ctx.quadraticCurveTo(-1 * s, headY + 1 * s, 0, headY + 2.5 * s);
        ctx.quadraticCurveTo(1 * s, headY + 1 * s, 4 * s, headY + 2.5 * s);
        ctx.stroke();
      } else if (b.accessory === 'phone') {
        // Cute hair bangs for Selfie Star
        ctx.fillStyle = '#7C3AED';
        ctx.beginPath();
        ctx.moveTo(-8 * s, headY - 7 * s);
        ctx.quadraticCurveTo(-2 * s, headY - 3 * s, 0, headY - 7 * s);
        ctx.quadraticCurveTo(4 * s, headY - 3 * s, 8 * s, headY - 7 * s);
        ctx.lineTo(8 * s, headY - 12 * s);
        ctx.lineTo(-8 * s, headY - 12 * s);
        ctx.closePath();
        ctx.fill();

        // Glowing Smartphone on selfie stick
        ctx.fillStyle = '#A855F7';
        ctx.fillRect(8 * s, -28 * s, 4 * s, 8 * s);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(9 * s, -27 * s, 2 * s, 6 * s);
      } else if (b.accessory === 'fruit') {
        // Baker Hat
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, headY - 11 * s, 10 * s, Math.PI, Math.PI * 2);
        ctx.fill();
        // Flour smudge on cheek
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(5 * s, headY + 2 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Flying accessory knocked into the air
    if (b.flyingAccessory) {
      const fa = b.flyingAccessory;
      ctx.save();
      ctx.translate(fa.x - b.x, -(fa.y - b.y));
      ctx.rotate(fa.rotation);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-6 * s, -4 * s, 12 * s, 8 * s);
      ctx.restore();
    }

    // Strike Zone Visual Targeting Cue: Signals player when bystander is in prime slap reach!
    if (b.inStrikeRange && !b.slapped) {
      const pulse = 1 + Math.sin(this.time * 18) * 0.12;
      const targetY = headY - 18 * s;

      // Glowing targeting halo around feet
      ctx.strokeStyle = '#FF4757';
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.ellipse(0, 4 * s, 22 * s * pulse, 9 * s * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Overhead Neo-Brutalist "SLAP!" Target Badge
      ctx.save();
      ctx.translate(0, targetY);
      ctx.scale(pulse, pulse);

      // Shadow
      ctx.fillStyle = '#17181C';
      ctx.beginPath();
      ctx.roundRect(-15 * s + 1.5 * s, -8 * s + 1.5 * s, 30 * s, 16 * s, 5 * s);
      ctx.fill();

      // Pill body
      ctx.fillStyle = '#FF4757';
      ctx.beginPath();
      ctx.roundRect(-15 * s, -8 * s, 30 * s, 16 * s, 5 * s);
      ctx.fill();
      ctx.strokeStyle = '#17181C';
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();

      // Crisp typography
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${9.5 * s}px 'Righteous', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SLAP!', 0, 0.5 * s);

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * 3D ENRAGED MOB CHASERS
   * Furious sprinters with cartoon fiery eyes, screaming gritted mouths, and ear steam puffs
   */
  private draw3DChaser(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    c: Chaser
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;

    // Contact drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Aggressive forward sprint lean
    ctx.rotate(-0.15);

    const runPhase = c.runCycle * 10;
    const legSwing = Math.sin(runPhase);

    // Running legs
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 5.5 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5 * s, -10 * s);
    ctx.lineTo(-7 * s + legSwing * 8 * s, 6 * s);
    ctx.moveTo(5 * s, -10 * s);
    ctx.lineTo(7 * s - legSwing * 8 * s, 6 * s);
    ctx.stroke();

    // Enraged crimson flushed shirt
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.roundRect(-10 * s, -32 * s, 20 * s, 24 * s, 5 * s);
    ctx.fill();

    // Clenched pumping fists
    ctx.strokeStyle = c.bodyColor;
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(-10 * s, -24 * s);
    ctx.lineTo(-15 * s, -12 * s + legSwing * 6 * s);
    ctx.moveTo(10 * s, -24 * s);
    ctx.lineTo(15 * s, -12 * s - legSwing * 6 * s);
    ctx.stroke();

    // Head
    const headY = -42 * s;
    ctx.fillStyle = c.bodyColor;
    ctx.beginPath();
    ctx.arc(0, headY, 11 * s, 0, Math.PI * 2);
    ctx.fill();

    // FIERCE CARTOON ANGRY EYES
    // Left eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-4.5 * s, headY - 1 * s, 3.2 * s, 3.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DC2626'; // Fiery red pupil
    ctx.beginPath();
    ctx.arc(-4.5 * s, headY - 1 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-4.5 * s, headY - 1 * s, 1.1 * s, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(4.5 * s, headY - 1 * s, 3.2 * s, 3.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(4.5 * s, headY - 1 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(4.5 * s, headY - 1 * s, 1.1 * s, 0, Math.PI * 2);
    ctx.fill();

    // Furrowed angry eyebrows (V shape \ /)
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(-7 * s, headY - 5 * s);
    ctx.lineTo(-1 * s, headY - 2 * s);
    ctx.moveTo(7 * s, headY - 5 * s);
    ctx.lineTo(1 * s, headY - 2 * s);
    ctx.stroke();

    // Gritted Shouting Mouth with teeth
    ctx.fillStyle = '#7F1D1D';
    ctx.fillRect(-5 * s, headY + 3 * s, 10 * s, 5 * s);

    // Sharp white teeth
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-4.5 * s, headY + 3 * s, 9 * s, 2 * s);
    ctx.fillRect(-4.5 * s, headY + 6 * s, 9 * s, 1.8 * s);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(-5 * s, headY + 3 * s, 10 * s, 5 * s);

    // Red flushed furious cheeks
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.beginPath();
    ctx.arc(-7 * s, headY + 2 * s, 2 * s, 0, Math.PI * 2);
    ctx.arc(7 * s, headY + 2 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();

    // Cartoon Ear Steam Puffs (billowing animated smoke)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    const steamOffset = (Math.sin(c.angrySteamTimer * 8) * 3 + 5) * s;
    ctx.beginPath();
    ctx.arc(-13 * s - steamOffset, headY - 3 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.arc(-17 * s - steamOffset, headY - 6 * s, 3.2 * s, 0, Math.PI * 2);
    ctx.arc(13 * s + steamOffset, headY - 3 * s, 4.5 * s, 0, Math.PI * 2);
    ctx.arc(17 * s + steamOffset, headY - 6 * s, 3.2 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 3D Gold Bullion Coin (Volumetric beveled edges, embossed star/dash emblem, rotating specular sweep)
   */
  private drawVolumetricCoin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    bobPhase: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;
    const r = 13 * s;

    // 1. Soft penumbra ground drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 16 * s, r * 1.1, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle golden ambient ground halo
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 16 * s, r * 1.6, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 3D Cylindrical Coin Thickness / Extruded Side Wall
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.arc(0, 2.5 * s, r, 0, Math.PI);
    ctx.lineTo(r, 0);
    ctx.arc(0, 0, r, 0, Math.PI, true);
    ctx.lineTo(-r, 2.5 * s);
    ctx.closePath();
    ctx.fill();

    // 3. Beveled Outer Rim with Metallic Gold Gradient
    const rimGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 1 * s, 0, 0, r);
    rimGrad.addColorStop(0, '#FFFBEB');
    rimGrad.addColorStop(0.3, '#FDE047');
    rimGrad.addColorStop(0.7, '#F59E0B');
    rimGrad.addColorStop(1, '#92400E');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1 * s;
    ctx.stroke();

    // 4. Inner Recessed Bevel Coin Basin
    const innerR = r * 0.78;
    const basinGrad = ctx.createRadialGradient(r * 0.3, r * 0.3, 1 * s, 0, 0, innerR);
    basinGrad.addColorStop(0, '#FEF08A');
    basinGrad.addColorStop(0.5, '#F59E0B');
    basinGrad.addColorStop(1, '#B45309');
    ctx.fillStyle = basinGrad;
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.fill();

    // 5. Embossed 3D Star & Lightning Dash Insignia
    ctx.fillStyle = '#FFFDF0';
    ctx.beginPath();
    // Centered 5-point arcade star
    const starR = innerR * 0.55;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x1 = Math.cos(a) * starR;
      const y1 = Math.sin(a) * starR;
      const aMid = a + Math.PI / 5;
      const x2 = Math.cos(aMid) * (starR * 0.45);
      const y2 = Math.sin(aMid) * (starR * 0.45);
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 0.8 * s;
    ctx.stroke();

    // 6. Rotating Specular Sheen (Sweep glint across coin surface)
    const glintProgress = (bobPhase * 3.5) % (Math.PI * 2);
    const glintX = Math.cos(glintProgress) * innerR * 0.6;
    const glintY = Math.sin(glintProgress) * innerR * 0.6;
    const sheenGrad = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, 4.5 * s);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    sheenGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.beginPath();
    ctx.arc(glintX, glintY, 4.5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 3D Powerups (Volumetric Turbo Soda Can & Translucent Slick Soap)
   */
  private drawPowerup(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    type: 'soda' | 'soap',
    bobPhase: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;

    // Contact soft shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 18 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'soda') {
      // 1. Glowing Turbo Red Energy Halo
      const pulse = 1 + Math.sin(bobPhase * 6) * 0.12;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(0, -3 * s, 22 * s * pulse, 0, Math.PI * 2);
      ctx.fill();

      const canW = 16 * s;
      const canH = 28 * s;
      const topY = -canH / 2 - 4 * s;

      // 2. Extruded Cylinder Can Body with Metallic Shading
      const canGrad = ctx.createLinearGradient(-canW / 2, 0, canW / 2, 0);
      canGrad.addColorStop(0, '#7F1D1D');
      canGrad.addColorStop(0.2, '#EF4444');
      canGrad.addColorStop(0.45, '#F87171');
      canGrad.addColorStop(0.6, '#EF4444');
      canGrad.addColorStop(1, '#991B1B');
      ctx.fillStyle = canGrad;
      ctx.beginPath();
      ctx.roundRect(-canW / 2, topY + 2 * s, canW, canH, 3 * s);
      ctx.fill();

      // Bold Racing Stripe & "TURBO" Typography
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-canW / 2, topY + 10 * s, canW, 7 * s);
      ctx.fillStyle = '#F59E0B';
      ctx.font = `900 ${Math.round(6 * s)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TURBO', 0, topY + 13.5 * s);

      // 3. Aluminum Chiseled Top Rim & Pull-Tab
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.ellipse(0, topY + 2 * s, canW / 2, 3.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1 * s;
      ctx.stroke();

      // Metallic Pull-Tab
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.ellipse(0, topY + 2 * s, 3 * s, 1.8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(0, topY + 2 * s, 1 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Translucent Blue Slick Soap Bar with Iridescent Bubbles
      const barW = 24 * s;
      const barH = 15 * s;

      // 3D Soap Body with Rounded Glossy Cushion Shading
      const soapGrad = ctx.createLinearGradient(-barW / 2, -barH, barW / 2, barH);
      soapGrad.addColorStop(0, '#E0F2FE');
      soapGrad.addColorStop(0.3, '#38BDF8');
      soapGrad.addColorStop(0.7, '#0284C7');
      soapGrad.addColorStop(1, '#0369A1');
      ctx.fillStyle = soapGrad;
      ctx.beginPath();
      ctx.roundRect(-barW / 2, -barH / 2, barW, barH, 7 * s);
      ctx.fill();
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();

      // Top Specular Curved Sheen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-barW / 2 + 3 * s, -barH / 2 + 2 * s, barW - 6 * s, 3.5 * s, 2 * s);
      ctx.fill();

      // Floating 3D Iridescent Soap Bubbles
      const bubblePhases = [
        { dx: -10 * s, dy: -14 * s, r: 4 * s },
        { dx: 8 * s, dy: -16 * s, r: 5 * s },
        { dx: 14 * s, dy: -8 * s, r: 3.5 * s },
      ];
      for (const b of bubblePhases) {
        const by = b.dy + Math.sin(bobPhase * 4 + b.dx) * 3 * s;
        ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.beginPath();
        ctx.arc(b.dx, by, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // Bubble Glint
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(b.dx - b.r * 0.35, by - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * High-Fidelity 3D Obstacles (Sawhorse, Banana, Watermelon, Boost Ramp, Rolling Barrel, Fruit Crate)
   */
  private drawObstacle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    type: Obstacle['type'],
    rotation: number,
    hit: boolean
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;

    if (hit) {
      ctx.globalAlpha = 0.45;
      ctx.rotate(0.35);
    }

    // Volumetric Ground Contact Drop Shadow with Penumbra
    ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
    ctx.beginPath();
    ctx.ellipse(0, 4 * s, 22 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'barrier') {
      // 3D Construction Barricade / Sawhorse with Realistic Structural Depth
      const bW = 46 * s;
      const bH = 28 * s;

      // Heavy A-Frame Timber/Steel Legs
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Left leg
      ctx.moveTo(-bW / 2 + 5 * s, 2 * s);
      ctx.lineTo(-bW / 2 + 9 * s, -bH);
      // Right leg
      ctx.moveTo(bW / 2 - 5 * s, 2 * s);
      ctx.lineTo(bW / 2 - 9 * s, -bH);
      ctx.stroke();

      // Cross Spreader Brace
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(-bW / 2 + 6 * s, -bH * 0.35);
      ctx.lineTo(bW / 2 - 6 * s, -bH * 0.35);
      ctx.stroke();

      // Top Heavy Warning Crossbar (Vivid Safety Orange & Reflective White Stripes)
      ctx.fillStyle = '#EA580C';
      ctx.fillRect(-bW / 2, -bH + 4 * s, bW, 9 * s);
      ctx.strokeStyle = '#17181C';
      ctx.lineWidth = 1.2 * s;
      ctx.strokeRect(-bW / 2, -bH + 4 * s, bW, 9 * s);

      // Diagonal 45-degree reflective white stripes
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 4; i++) {
        const sx = -bW / 2 + 6 * s + i * 10 * s;
        ctx.beginPath();
        ctx.moveTo(sx, -bH + 4 * s);
        ctx.lineTo(sx + 5 * s, -bH + 4 * s);
        ctx.lineTo(sx + 2 * s, -bH + 13 * s);
        ctx.lineTo(sx - 3 * s, -bH + 13 * s);
        ctx.closePath();
        ctx.fill();
      }

      // Flashing Yellow Hazard Lantern on top corner
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(bW / 2 - 6 * s, -bH + 2 * s, 3.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFDF0';
      ctx.beginPath();
      ctx.arc(bW / 2 - 6 * s, -bH + 2 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'banana') {
      // Realistic Glossy Curved 3D Banana Peel
      ctx.rotate(rotation);

      // Peel Base Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Peel Petals (3 curled banana skin peels radiating outwards)
      const peelGrad = ctx.createRadialGradient(0, 0, 1 * s, 0, 0, 16 * s);
      peelGrad.addColorStop(0, '#FEF08A');
      peelGrad.addColorStop(0.6, '#FACC15');
      peelGrad.addColorStop(0.9, '#CA8A04');
      peelGrad.addColorStop(1, '#854D0E');

      ctx.fillStyle = peelGrad;
      // Center & 3 curved peels
      ctx.beginPath();
      ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Top peel
      ctx.beginPath();
      ctx.moveTo(-3 * s, 0);
      ctx.quadraticCurveTo(-6 * s, -14 * s, 0, -16 * s);
      ctx.quadraticCurveTo(6 * s, -14 * s, 3 * s, 0);
      ctx.closePath();
      ctx.fill();

      // Bottom-left peel
      ctx.beginPath();
      ctx.moveTo(0, 2 * s);
      ctx.quadraticCurveTo(-15 * s, 2 * s, -16 * s, 10 * s);
      ctx.quadraticCurveTo(-8 * s, 12 * s, 0, 4 * s);
      ctx.closePath();
      ctx.fill();

      // Bottom-right peel
      ctx.beginPath();
      ctx.moveTo(0, 2 * s);
      ctx.quadraticCurveTo(15 * s, 2 * s, 16 * s, 10 * s);
      ctx.quadraticCurveTo(8 * s, 12 * s, 0, 4 * s);
      ctx.closePath();
      ctx.fill();

      // Dark brown bruised tip
      ctx.fillStyle = '#451A03';
      ctx.beginPath();
      ctx.arc(0, -15 * s, 2 * s, 0, Math.PI * 2);
      ctx.arc(-15 * s, 9 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.arc(15 * s, 9 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();

      // Glossy peel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(-1 * s, -8 * s, 1.5 * s, 5 * s, -0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'watermelon') {
      // Volumetric 3D Striped Watermelon with Sunlight Specular Sphere
      const wR = 15 * s;
      const melonGrad = ctx.createRadialGradient(-wR * 0.35, -wR * 0.35, 1 * s, 0, -5 * s, wR);
      melonGrad.addColorStop(0, '#6EE7B7');
      melonGrad.addColorStop(0.3, '#059669');
      melonGrad.addColorStop(0.7, '#047857');
      melonGrad.addColorStop(1, '#064E3B');
      ctx.fillStyle = melonGrad;
      ctx.beginPath();
      ctx.arc(0, -5 * s, wR, 0, Math.PI * 2);
      ctx.fill();

      // Dark Wavy Jagged Longitudinal Stripes
      ctx.strokeStyle = '#022C22';
      ctx.lineWidth = 2.8 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -5 * s, wR * 0.9, 0.4, 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -5 * s, wR * 0.9, 3.4, 4.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -5 * s, wR * 0.9, 1.9, 2.7);
      ctx.stroke();

      // Specular highlight spot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(-wR * 0.35, -5 * s - wR * 0.35, 3.2 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'ramp') {
      // 3D Turbo Booster Launch Ramp with Diamond Plate & Neon Golden Chevrons
      const rW = 46 * s;
      const rH = 18 * s;

      // 3D Angled Side Walls
      ctx.fillStyle = '#065F46';
      ctx.beginPath();
      ctx.moveTo(-rW / 2, 0);
      ctx.lineTo(-rW / 2, -rH);
      ctx.lineTo(-rW / 2 + 5 * s, -rH);
      ctx.lineTo(-rW / 2 + 5 * s, 0);
      ctx.closePath();
      ctx.fill();

      // Main Sloped Runway Incline
      const rampGrad = ctx.createLinearGradient(0, 0, 0, -rH);
      rampGrad.addColorStop(0, '#047857');
      rampGrad.addColorStop(0.6, '#059669');
      rampGrad.addColorStop(1, '#10B981');
      ctx.fillStyle = rampGrad;
      ctx.beginPath();
      ctx.moveTo(-rW / 2, 0);
      ctx.lineTo(rW / 2, 0);
      ctx.lineTo(rW / 2, -rH);
      ctx.lineTo(-rW / 2, -rH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#17181C';
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();

      // Glowing Golden/Emerald Runway Chevrons (>>>)
      ctx.fillStyle = '#FDE047';
      for (let i = -1; i <= 1; i++) {
        const cx = i * 13 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 3.5 * s, -rH + 4 * s);
        ctx.lineTo(cx + 3.5 * s, -rH / 2);
        ctx.lineTo(cx - 3.5 * s, -4 * s);
        ctx.lineTo(cx, -rH / 2);
        ctx.closePath();
        ctx.fill();
      }

      // Yellow/Black Warning Edges along bottom
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-rW / 2, -2.5 * s, rW, 2.5 * s);
    } else if (type === 'barrel') {
      // Volumetric 3D Rolling Wood Barrel with Steel Hoops
      const bR = 15 * s;

      // Outer Wood Cylinder Body
      const woodGrad = ctx.createRadialGradient(0, -bR, bR * 0.2, 0, -bR, bR);
      woodGrad.addColorStop(0, '#92400E');
      woodGrad.addColorStop(0.5, '#78350F');
      woodGrad.addColorStop(1, '#451A03');
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.arc(0, -bR, bR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#291004';
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();

      // Circular Steel Reinforcement Bands with Rivets
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 3.2 * s;
      ctx.beginPath();
      ctx.arc(0, -bR, bR * 0.72, 0, Math.PI * 2);
      ctx.stroke();

      // Steel Rivets
      ctx.fillStyle = '#CBD5E1';
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const rx = Math.cos(ang) * bR * 0.72;
        const ry = -bR + Math.sin(ang) * bR * 0.72;
        ctx.beginPath();
        ctx.arc(rx, ry, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Barrel Bung Plug
      ctx.fillStyle = '#451A03';
      ctx.beginPath();
      ctx.arc(0, -bR, 2.8 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 3D Timber Fruit Crate Filled with Volumetric 3D Oranges
      const w = 38 * s;
      const h = 26 * s;

      // Dark Crate Interior
      ctx.fillStyle = '#451A03';
      ctx.fillRect(-w / 2, -h, w, h);

      // Piled 3D Spherical Oranges inside with Shading & Leaves
      const fruitCoords = [
        { x: -9 * s, y: -h + 2 * s, r: 5 * s },
        { x: 0, y: -h + 3 * s, r: 5.2 * s },
        { x: 9 * s, y: -h + 2 * s, r: 5 * s },
        { x: -5 * s, y: -h - 3 * s, r: 5.5 * s },
        { x: 5 * s, y: -h - 3 * s, r: 5.5 * s },
        { x: 0, y: -h - 7 * s, r: 5.8 * s },
      ];

      for (const f of fruitCoords) {
        const fGrad = ctx.createRadialGradient(f.x - f.r * 0.35, f.y - f.r * 0.35, 1 * s, f.x, f.y, f.r);
        fGrad.addColorStop(0, '#FED7AA');
        fGrad.addColorStop(0.3, '#FB923C');
        fGrad.addColorStop(0.8, '#EA580C');
        fGrad.addColorStop(1, '#9A3412');
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();

        // Fresh green leaf on top orange
        if (f.y < -h - 5 * s) {
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.ellipse(f.x + 3 * s, f.y - 4 * s, 2.5 * s, 1.4 * s, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3D Front Slats of Timber Crate
      ctx.fillStyle = '#78350F';
      ctx.fillRect(-w / 2, -h + 4 * s, w, 5.5 * s);
      ctx.fillRect(-w / 2, -h + 12 * s, w, 5.5 * s);
      ctx.fillRect(-w / 2, -h + 20 * s, w, 5.5 * s);

      // Vertical Corner Support Posts
      ctx.fillStyle = '#92400E';
      ctx.fillRect(-w / 2, -h, 4 * s, h);
      ctx.fillRect(w / 2 - 4 * s, -h, 4 * s, h);

      // Corner Metal Brackets with Silver Nails
      ctx.fillStyle = '#475569';
      ctx.fillRect(-w / 2, -h, 5 * s, 5 * s);
      ctx.fillRect(w / 2 - 5 * s, -h, 5 * s, 5 * s);
      ctx.fillRect(-w / 2, -5 * s, 5 * s, 5 * s);
      ctx.fillRect(w / 2 - 5 * s, -5 * s, 5 * s, 5 * s);

      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(-w / 2 + 2.5 * s, -h + 2.5 * s, 0.9 * s, 0, Math.PI * 2);
      ctx.arc(w / 2 - 2.5 * s, -h + 2.5 * s, 0.9 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Particles (Stars, Sparkles, Clouds)
   */
  private drawParticle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    p: Particle
  ): void {
    ctx.save();
    const s = scale;
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    if (p.shape === 'star') {
      const r = p.size * s;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        const x1 = x + Math.cos(a1) * r;
        const y1 = y + Math.sin(a1) * r;
        const x2 = x + Math.cos(a2) * (r * 0.45);
        const y2 = y + Math.sin(a2) * (r * 0.45);
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, p.size * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Floating Comic Text (SLAP!, POW!, FEVER RUN!)
   */
  private drawFloatingText(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    ft: FloatingText
  ): void {
    ctx.save();
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    const s = scale * (ft.scale || 1);
    const fontSize = Math.round(ft.size * s);

    ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black shadow stroke
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = Math.max(3, 4.5 * s);
    ctx.lineJoin = 'round';
    ctx.strokeText(ft.text, 0, 0);

    // Vibrant comic text fill
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, 0, 0);

    ctx.restore();
  }

  /**
   * Fever Run Speed Lines (Hyperspace warp lines)
   */
  private drawFeverSpeedLines(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.lineWidth = 2.5;

    for (let i = 0; i < 8; i++) {
      const rx = (Math.sin(this.time * 20 + i) * 0.5 + 0.5) * this.width;
      const ry1 = (Math.cos(this.time * 15 + i) * 0.5 + 0.5) * this.height;
      const ry2 = ry1 + 60 + Math.random() * 80;
      ctx.beginPath();
      ctx.moveTo(rx, ry1);
      ctx.lineTo(rx + (rx > this.width / 2 ? 20 : -20), ry2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
