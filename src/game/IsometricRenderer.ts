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
    // Generates a clean, elevated 3D third-person perspective over the runner's shoulders
    const centerX = this.width / 2;
    const horizonY = this.height * 0.32;
    const cameraZ = 230; // Camera elevation above street
    const fov = 460; // Focal length
    const cameraY = player.y - 180; // Distance behind player

    // 3D World to 2D Screen projection
    const project = (wx: number, wy: number, wz: number = 0) => {
      const depth = Math.max(12, wy - cameraY);
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
    const nearY = player.y - 60;
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
    ctx.beginPath();
    ctx.moveTo(0, nearY);
    ctx.lineTo(0, horizonY);
    ctx.lineTo(this.width, horizonY);
    ctx.lineTo(this.width, nearY);
    ctx.fill();

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

    // 1. Contact Drop Shadow (Scales with jump height wz)
    const shadowScale = Math.max(0.4, 1 - (player.z / 120));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 4 * s + (player.z * 0.3 * s), 24 * s * shadowScale, 9 * s * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Fever Run Golden Plasma Aura
    if (fever) {
      const aura = ctx.createRadialGradient(0, -36 * s, 8 * s, 0, -36 * s, 48 * s);
      aura.addColorStop(0, 'rgba(253, 224, 71, 0.7)');
      aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -36 * s, 48 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Running stride cycle
    const runPhase = player.runCycle * 8;
    const legSwing = Math.sin(runPhase);
    const armSwing = Math.cos(runPhase);
    const verticalBob = Math.abs(Math.sin(runPhase)) * 4 * s;

    // 3. 3D CYCLING LEGS WITH SNEAKERS
    ctx.strokeStyle = player.skin.pantsColor;
    ctx.lineWidth = 6 * s;
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

    // 3D Sneakers (Crisp white with emerald heel counter)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(leftFootX, leftFootY, 5 * s, 3.2 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(rightFootX, rightFootY, 5 * s, 3.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.ellipse(leftFootX - 1.5 * s, leftFootY - 1 * s, 2.5 * s, 1.8 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(rightFootX - 1.5 * s, rightFootY - 1 * s, 2.5 * s, 1.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. VOLUMETRIC TORSO & ATHLETIC JACKET
    const torsoY = -34 * s - verticalBob;
    const torsoW = 24 * s;
    const torsoH = 26 * s;

    // Main jacket body
    ctx.fillStyle = player.skin.shirtColor;
    ctx.beginPath();
    ctx.roundRect(-torsoW / 2, torsoY, torsoW, torsoH, 6 * s);
    ctx.fill();

    // Athletic racing stripe down back
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2 * s, torsoY, 4 * s, torsoH);

    // Runner Backpack / Hydro pack strapped on back
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(-7 * s, torsoY + 4 * s, 14 * s, 16 * s, 4 * s);
    ctx.fill();

    ctx.fillStyle = '#F59E0B'; // Gold buckle
    ctx.fillRect(-2.5 * s, torsoY + 8 * s, 5 * s, 3 * s);

    // 5. 3D ARMS & DYNAMIC SLAP ACTION
    if (player.isSlapping) {
      const side = player.slapHand === 'left' ? -1 : 1;
      const progress = player.slapProgress;
      const armExtension = 68 * s * Math.sin(progress * Math.PI);
      const armEndY = torsoY + 6 * s - Math.sin(progress * Math.PI) * 16 * s;
      const armEndX = side * (14 * s + armExtension);

      // Elastic 3D Cartoon Slap Arm with Wind Arc
      ctx.strokeStyle = player.skin.bodyColor;
      ctx.lineWidth = 8 * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(side * 10 * s, torsoY + 6 * s);
      ctx.quadraticCurveTo(side * (30 * s + armExtension * 0.5), torsoY - 18 * s, armEndX, armEndY);
      ctx.stroke();

      // Slap Wind Trail Arc (Speed swoosh)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3.2 * s;
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 16 * s, side > 0 ? -Math.PI / 2 : 0, side > 0 ? Math.PI / 2 : Math.PI);
      ctx.stroke();

      // Giant Padded 3D Slap Glove in Vivid Crimson with White Rim
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 13 * s, 0, Math.PI * 2);
      ctx.fill();

      // White glove target bullseye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Opposite idle arm pumping
      ctx.strokeStyle = player.skin.bodyColor;
      ctx.lineWidth = 5 * s;
      ctx.beginPath();
      ctx.moveTo(-side * 10 * s, torsoY + 6 * s);
      ctx.lineTo(-side * 16 * s, torsoY + 18 * s);
      ctx.stroke();
    } else {
      // Natural running arm swing with elbow bends
      ctx.strokeStyle = player.skin.bodyColor;
      ctx.lineWidth = 5 * s;
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

    // 6. VOLUMETRIC 3D HEAD & CAP
    const headY = torsoY - 14 * s;
    const headRadius = 13 * s;

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

    ctx.restore();
  }

  /**
   * 3D BYSTANDER PEDESTRIANS (Expressive stylized character roles)
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
    ctx.fillStyle = b.bodyColor;
    ctx.beginPath();
    ctx.arc(0, headY, 11 * s, 0, Math.PI * 2);
    ctx.fill();

    // Expression: Surprised dizzy eyes on slap hit
    if (b.slapped) {
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2 * s;
      // Spiral dizzy eyes
      ctx.beginPath();
      ctx.arc(-4 * s, headY - 1 * s, 3 * s, 0, Math.PI * 1.5);
      ctx.arc(4 * s, headY - 1 * s, 3 * s, 0, Math.PI * 1.5);
      ctx.stroke();

      // Open O mouth
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(0, headY + 5 * s, 3 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal peaceful sunglasses / eyes
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(-6 * s, headY - 3 * s, 12 * s, 4 * s, 2 * s);
      ctx.fill();
    }

    // Role-specific accessories (Chef toque, Influencer phone, Baker apron)
    if (!b.slapped) {
      if (b.accessory === 'fish') {
        // Chef Toque
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.rect(-7 * s, headY - 18 * s, 14 * s, 8 * s);
        ctx.arc(0, headY - 18 * s, 9 * s, Math.PI, Math.PI * 2);
        ctx.fill();
      } else if (b.accessory === 'phone') {
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

    ctx.restore();
  }

  /**
   * 3D ENRAGED MOB CHASERS
   * Sprints furiously behind the player with flushed cheeks and steam puffs
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

    // Furrowed angry eyebrows (V shape)
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-6 * s, headY - 4 * s);
    ctx.lineTo(-1 * s, headY - 1 * s);
    ctx.moveTo(6 * s, headY - 4 * s);
    ctx.lineTo(1 * s, headY - 1 * s);
    ctx.stroke();

    // Gritted teeth
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-4 * s, headY + 3 * s, 8 * s, 3.5 * s);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(-4 * s, headY + 3 * s, 8 * s, 3.5 * s);

    // Cartoon Ear Steam Puffs
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const steamOffset = (Math.sin(c.angrySteamTimer * 8) * 3 + 4) * s;
    ctx.beginPath();
    ctx.arc(-13 * s - steamOffset, headY - 3 * s, 4 * s, 0, Math.PI * 2);
    ctx.arc(13 * s + steamOffset, headY - 3 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 3D Gold Bullion Coin (Beveled edges with rotating sheen)
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
    const r = 12 * s;

    // Contact shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 14 * s, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coin outer ring
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner bevel ring
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Raised $ emblem
    ctx.fillStyle = '#92400E';
    ctx.font = `900 ${Math.round(11 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);

    // Rotating specular glint
    const glintAngle = (bobPhase * 4) % (Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(Math.cos(glintAngle) * r * 0.5, Math.sin(glintAngle) * r * 0.5, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 3D Powerups (Turbo Soda Can & Slick Soap)
   */
  private drawPowerup(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    type: 'soda' | 'soap',
    _bobPhase: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const s = scale;

    // Ground shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 16 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'soda') {
      // 3D Red Turbo Soda Can
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(-7 * s, -14 * s, 14 * s, 26 * s);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-7 * s, -6 * s, 14 * s, 8 * s);
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.ellipse(0, -14 * s, 7 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 3D Translucent Blue Slick Soap Bar
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(-11 * s, -8 * s, 22 * s, 14 * s, 5 * s);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(-7 * s, -6 * s, 14 * s, 3 * s);
    }
    ctx.restore();
  }

  /**
   * 3D Obstacles (Sawhorse, Banana, Watermelon, Boost Ramp, Rolling Barrel, Fruit Crate)
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

    // Contact drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4 * s, 20 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'barrier') {
      // Construction Sawhorse with diagonal warning stripes
      const bW = 44 * s;
      const bH = 26 * s;

      // Legs
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3.5 * s;
      ctx.beginPath();
      ctx.moveTo(-bW / 2 + 5 * s, 0);
      ctx.lineTo(-bW / 2 + 8 * s, -bH);
      ctx.moveTo(bW / 2 - 5 * s, 0);
      ctx.lineTo(bW / 2 - 8 * s, -bH);
      ctx.stroke();

      // Top crossbar
      ctx.fillStyle = '#059669';
      ctx.fillRect(-bW / 2, -bH + 6 * s, bW, 8 * s);

      // White hazard stripes
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(-bW / 2 + 6 * s + i * 10 * s, -bH + 6 * s, 4 * s, 8 * s);
      }
    } else if (type === 'banana') {
      // 3D Banana Peel
      ctx.rotate(rotation);
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(0, 0, 9 * s, 0, Math.PI);
      ctx.lineTo(-14 * s, 4 * s);
      ctx.lineTo(-4 * s, 0);
      ctx.lineTo(0, -8 * s);
      ctx.lineTo(4 * s, 0);
      ctx.lineTo(14 * s, 4 * s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, -8 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'watermelon') {
      // 3D Striped Watermelon
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.arc(0, -5 * s, 15 * s, 0, Math.PI * 2);
      ctx.fill();

      // Light stripes
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(0, -5 * s, 12 * s, 0.4, 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -5 * s, 12 * s, 3.4, 4.4);
      ctx.stroke();
    } else if (type === 'ramp') {
      // 3D Turbo Booster Launch Ramp
      const rW = 44 * s;
      const rH = 16 * s;

      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(-rW / 2, 0);
      ctx.lineTo(rW / 2, 0);
      ctx.lineTo(rW / 2, -rH);
      ctx.lineTo(-rW / 2, -rH);
      ctx.closePath();
      ctx.fill();

      // Glowing Golden Chevron Arrows (>>>)
      ctx.fillStyle = '#FDE047';
      for (let i = -1; i <= 1; i++) {
        const cx = i * 12 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 3 * s, -rH + 3 * s);
        ctx.lineTo(cx + 3 * s, -rH / 2);
        ctx.lineTo(cx - 3 * s, -3 * s);
        ctx.lineTo(cx, -rH / 2);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === 'barrel') {
      // 3D Rolling Wood Barrel
      const bR = 14 * s;
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, -bR, bR, 0, Math.PI * 2);
      ctx.fill();

      // Iron hoops
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.arc(0, -bR, bR * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // 3D Timber Fruit Crate with Oranges
      const w = 36 * s;
      const h = 26 * s;
      ctx.fillStyle = '#78350F';
      ctx.fillRect(-w / 2, -h, w, h);

      ctx.fillStyle = '#92400E';
      ctx.fillRect(-w / 2 + 2 * s, -h + 3 * s, w - 4 * s, 5 * s);
      ctx.fillRect(-w / 2 + 2 * s, -h + 11 * s, w - 4 * s, 5 * s);
      ctx.fillRect(-w / 2 + 2 * s, -h + 19 * s, w - 4 * s, 5 * s);

      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.arc(-7 * s, -h, 4.5 * s, 0, Math.PI * 2);
      ctx.arc(7 * s, -h, 4.5 * s, 0, Math.PI * 2);
      ctx.arc(0, -h - 2 * s, 5 * s, 0, Math.PI * 2);
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
