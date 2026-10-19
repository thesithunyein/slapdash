import * as THREE from 'three';
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
  CharacterSkin,
} from './types.ts';
import { ROAD_WIDTH } from './constants.ts';

// World coordinate scale mapping
const SCALE_X = 0.05;
const SCALE_Y = 0.05; // Game Y (forward) -> Three -Z
const SCALE_Z = 0.05; // Game Z (height) -> Three +Y

export class ThreeGameRenderer {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private width: number = 800;
  private height: number = 600;
  private dpr: number = 1;
  private screenShake: number = 0;
  private hitFreeze: number = 0;
  private startTime: number = performance.now();

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private playerPointLight: THREE.PointLight;

  // Road & Environment Chunks
  private roadGroup: THREE.Group;
  private roadSegments: THREE.Group[] = [];
  private readonly segmentLength: number = 64; // in Three.js world units
  private readonly numSegments: number = 7;

  // Dynamic Voxel Player Character Group
  private playerGroup: THREE.Group;
  private playerHead: THREE.Mesh;
  private playerTorso: THREE.Mesh;
  private playerLeftArm: THREE.Group;
  private playerRightArm: THREE.Group;
  private playerLeftLeg: THREE.Group;
  private playerRightLeg: THREE.Group;
  private playerHatGroup: THREE.Group;
  private playerShadow: THREE.Mesh;
  private megaSlapGlove: THREE.Mesh;
  private currentSkin?: CharacterSkin;

  // Entity Meshes Maps
  private bystanderMeshes: Map<number, THREE.Group> = new Map();
  private chaserMeshes: Map<number, THREE.Group> = new Map();
  private obstacleMeshes: Map<number, THREE.Group> = new Map();
  private coinMeshes: Map<number, THREE.Group> = new Map();
  private powerupMeshes: Map<number, THREE.Group> = new Map();
  private particleGroup: THREE.Group;
  private floatingTextSprites: Map<number, THREE.Sprite> = new Map();

  // Materials & Geometries Cache (Flat-shaded retro pixel art materials)
  private materials: { [key: string]: THREE.Material } = {};
  private sharedGeometries: { [key: string]: THREE.BufferGeometry } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.startTime = performance.now();

    // 1. Initialize High-Performance WebGL Renderer with Crisp Pixel Art Filtering
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false, // Crisp pixel edges for retro arcade aesthetic
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Hard pixel shadows

    // 2. Initialize Voxel Scene, Retro Cyan Sky & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Vibrant 8-bit sky
    this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.007);

    // 3. 3D Camera with dynamic tracking (retro arcade follow angle)
    this.camera = new THREE.PerspectiveCamera(52, 800 / 600, 0.5, 360);
    this.camera.position.set(0, 7.8, 14.5);

    // 4. Retro Arcade 3-Point Studio Lighting Rig
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    this.dirLight.position.set(16, 32, 22);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 130;
    this.dirLight.shadow.camera.left = -28;
    this.dirLight.shadow.camera.right = 28;
    this.dirLight.shadow.camera.top = 28;
    this.dirLight.shadow.camera.bottom = -28;
    this.dirLight.shadow.bias = -0.0004;
    this.scene.add(this.dirLight);

    // Cool Sky & Warm Tarmac Hemisphere Fill
    this.hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x181824, 1.3);
    this.scene.add(this.hemiLight);

    // Dynamic Player Point Light
    this.playerPointLight = new THREE.PointLight(0x10b981, 0.7, 16);
    this.scene.add(this.playerPointLight);

    // 5. Hierarchy Groups
    this.roadGroup = new THREE.Group();
    this.scene.add(this.roadGroup);

    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    // 6. Build Flat-Shaded Retro Materials
    this.initMaterials();

    // 7. Build Procedural 3D Voxel Boulevard Track
    this.buildRoadSegments();

    // 8. Build 3D Voxel Player Character
    const charBuild = this.createCharacterMesh();
    this.playerGroup = charBuild.playerGroup;
    this.playerHead = charBuild.head;
    this.playerTorso = charBuild.torso;
    this.playerLeftArm = charBuild.leftArm;
    this.playerRightArm = charBuild.rightArm;
    this.playerLeftLeg = charBuild.leftLeg;
    this.playerRightLeg = charBuild.rightLeg;
    this.playerHatGroup = charBuild.hatGroup;
    this.playerShadow = charBuild.shadow;
    this.megaSlapGlove = charBuild.megaSlapGlove;
    this.scene.add(this.playerGroup);
  }

  private initMaterials(): void {
    // Crisp Flat-Shaded Voxel Materials
    this.materials['road'] = new THREE.MeshStandardMaterial({
      color: 0x181a24,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });

    this.materials['sidewalk'] = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.7,
      metalness: 0.05,
      flatShading: true,
    });

    this.materials['curb'] = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.5,
      flatShading: true,
    });

    this.materials['curbBevel'] = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      flatShading: true,
    });

    this.materials['roadLine'] = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    this.materials['chevron'] = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
    });

    this.materials['grass'] = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.95,
      flatShading: true,
    });

    this.materials['gold'] = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.85,
      flatShading: true,
    });

    this.materials['wood'] = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.75,
      flatShading: true,
    });

    this.materials['copperBand'] = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.8,
      flatShading: true,
    });

    this.materials['orangeStripe'] = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4,
      flatShading: true,
    });

    this.materials['whiteStripe'] = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      flatShading: true,
    });

    this.materials['ramp'] = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.25,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
      flatShading: true,
    });

    this.materials['crateWood'] = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.75,
      flatShading: true,
    });

    this.materials['apple'] = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      flatShading: true,
    });

    this.materials['orange'] = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.3,
      flatShading: true,
    });

    this.materials['banana'] = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.3,
      flatShading: true,
    });

    this.materials['shadow'] = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });

    this.materials['slapGlove'] = new THREE.MeshStandardMaterial({
      color: 0xff4757,
      roughness: 0.25,
      flatShading: true,
    });

    this.materials['foliageA'] = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.9,
      flatShading: true,
    });

    this.materials['foliageB'] = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.85,
      flatShading: true,
    });

    this.materials['woodTrunk'] = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.85,
      flatShading: true,
    });

    this.materials['lampIron'] = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      flatShading: true,
    });

    this.materials['lampLight'] = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfde047,
      emissiveIntensity: 1.2,
      flatShading: true,
    });

    this.materials['windowLit'] = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfde047,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      flatShading: true,
    });
  }

  /**
   * Procedural Voxel Track Segment (Crossy Road Style)
   */
  private createSegment(index: number): THREE.Group {
    const group = new THREE.Group();
    const halfRoad = (ROAD_WIDTH / 2) * SCALE_X; // 250 * 0.05 = 12.5
    const sidewalkWidth = 95 * SCALE_X; // 4.75
    const length = this.segmentLength;

    // 1. Asphalt Roadbed (Blocky Voxel Slab)
    const roadGeo = new THREE.BoxGeometry(halfRoad * 2, 0.4, length);
    const roadMesh = new THREE.Mesh(roadGeo, this.materials['road']);
    roadMesh.position.y = -0.2;
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // 2. Sidewalks (Raised Voxel Slabs)
    const swGeo = new THREE.BoxGeometry(sidewalkWidth, 0.46, length);
    const swLeft = new THREE.Mesh(swGeo, this.materials['sidewalk']);
    swLeft.position.set(-halfRoad - sidewalkWidth / 2, 0.23, 0);
    swLeft.receiveShadow = true;
    group.add(swLeft);

    const swRight = new THREE.Mesh(swGeo, this.materials['sidewalk']);
    swRight.position.set(halfRoad + sidewalkWidth / 2, 0.23, 0);
    swRight.receiveShadow = true;
    group.add(swRight);

    // 3. Voxel Curbs with White Top Lip Block
    const curbGeo = new THREE.BoxGeometry(0.38, 0.52, length);
    const curbLeft = new THREE.Mesh(curbGeo, this.materials['curbBevel']);
    curbLeft.position.set(-halfRoad - 0.19, 0.26, 0);
    curbLeft.receiveShadow = true;
    group.add(curbLeft);

    const curbRight = new THREE.Mesh(curbGeo, this.materials['curbBevel']);
    curbRight.position.set(halfRoad + 0.19, 0.26, 0);
    curbRight.receiveShadow = true;
    group.add(curbRight);

    // 4. Solid Voxel Outer Road Boundary Line Blocks
    const lineGeo = new THREE.BoxGeometry(0.22, 0.04, length);
    const lineL = new THREE.Mesh(lineGeo, this.materials['roadLine']);
    lineL.position.set(-halfRoad + 0.55, 0.02, 0);
    group.add(lineL);

    const lineR = new THREE.Mesh(lineGeo, this.materials['roadLine']);
    lineR.position.set(halfRoad - 0.55, 0.02, 0);
    group.add(lineR);

    // 5. 4 Dashed Voxel Lane Blocks (-150, -50, 50, 150)
    const dividers = [-150, -50, 50, 150].map((d) => d * SCALE_X);
    const dashLen = 2.2;
    const dashGap = 2.4;
    const numDashes = Math.floor(length / (dashLen + dashGap));

    dividers.forEach((divX) => {
      for (let i = 0; i < numDashes; i++) {
        const dashGeo = new THREE.BoxGeometry(0.18, 0.04, dashLen);
        const dashMesh = new THREE.Mesh(dashGeo, this.materials['roadLine']);
        const zPos = -length / 2 + i * (dashLen + dashGap) + dashLen / 2;
        dashMesh.position.set(divX, 0.02, zPos);
        group.add(dashMesh);
      }
    });

    // 6. Center Voxel Speed Chevrons (Cube Pixel Arrows)
    for (const zOffset of [-length * 0.25, length * 0.25]) {
      const chevGroup = new THREE.Group();
      chevGroup.position.set(0, 0.02, zOffset);
      const pixelCubeGeo = new THREE.BoxGeometry(0.24, 0.04, 0.24);

      // 5 cubes forming a pixel arrow `^`
      const pTip = new THREE.Mesh(pixelCubeGeo, this.materials['chevron']);
      pTip.position.set(0, 0, -0.4);
      chevGroup.add(pTip);

      const pL1 = new THREE.Mesh(pixelCubeGeo, this.materials['chevron']);
      pL1.position.set(-0.35, 0, -0.15);
      chevGroup.add(pL1);

      const pR1 = new THREE.Mesh(pixelCubeGeo, this.materials['chevron']);
      pR1.position.set(0.35, 0, -0.15);
      chevGroup.add(pR1);

      const pL2 = new THREE.Mesh(pixelCubeGeo, this.materials['chevron']);
      pL2.position.set(-0.7, 0, 0.15);
      chevGroup.add(pL2);

      const pR2 = new THREE.Mesh(pixelCubeGeo, this.materials['chevron']);
      pR2.position.set(0.7, 0, 0.15);
      chevGroup.add(pR2);

      group.add(chevGroup);
    }

    // 7. Voxel Grass Parkways with Tiny Pixel Flowers
    const grassGeo = new THREE.BoxGeometry(40, 0.4, length);
    const grassL = new THREE.Mesh(grassGeo, this.materials['grass']);
    grassL.position.set(-halfRoad - sidewalkWidth - 20, 0.04, 0);
    grassL.receiveShadow = true;
    group.add(grassL);

    const grassR = new THREE.Mesh(grassGeo, this.materials['grass']);
    grassR.position.set(halfRoad + sidewalkWidth + 20, 0.04, 0);
    grassR.receiveShadow = true;
    group.add(grassR);

    // Pixel Flowers on Grass (Charming little red & yellow cube flowers)
    const flowerRed = new THREE.MeshBasicMaterial({ color: 0xff4757 });
    const flowerYel = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const flGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    for (let f = -2; f <= 2; f++) {
      const flL = new THREE.Mesh(flGeo, f % 2 === 0 ? flowerRed : flowerYel);
      flL.position.set(-halfRoad - sidewalkWidth - 2.5 - Math.abs(f) * 1.5, 0.35, f * 10);
      group.add(flL);

      const flR = new THREE.Mesh(flGeo, f % 2 === 0 ? flowerYel : flowerRed);
      flR.position.set(halfRoad + sidewalkWidth + 2.5 + Math.abs(f) * 1.5, 0.35, f * 10);
      group.add(flR);
    }

    // 8. Crossy Road Style Voxel Trees (Stacked Cubic Foliage)
    const trunkGeo = new THREE.BoxGeometry(0.42, 3.4, 0.42);
    const folGeoLower = new THREE.BoxGeometry(2.2, 1.8, 2.2);
    const folGeoUpper = new THREE.BoxGeometry(1.5, 1.4, 1.5);

    [-1, 1].forEach((side) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, this.materials['woodTrunk']);
      trunk.position.y = 1.7;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const folL = new THREE.Mesh(folGeoLower, this.materials['foliageA']);
      folL.position.y = 3.6;
      folL.castShadow = true;
      treeGroup.add(folL);

      const folU = new THREE.Mesh(folGeoUpper, this.materials['foliageB']);
      folU.position.y = 5.0;
      folU.castShadow = true;
      treeGroup.add(folU);

      treeGroup.position.set(side * (halfRoad + sidewalkWidth * 0.74), 0.23, (length * 0.28) * side);
      group.add(treeGroup);

      // Voxel Streetlamp (Blocky Cast-Iron Column with Cube Lantern)
      const lampGroup = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 4.4, 0.18),
        this.materials['lampIron']
      );
      pole.position.y = 2.2;
      pole.castShadow = true;
      lampGroup.add(pole);

      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.18, 0.18),
        this.materials['lampIron']
      );
      arm.position.set(-side * 0.25, 4.3, 0);
      lampGroup.add(arm);

      const globe = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        this.materials['lampLight']
      );
      globe.position.set(-side * 0.55, 4.0, 0);
      lampGroup.add(globe);

      lampGroup.position.set(side * (halfRoad + 0.65), 0.23, (length * -0.26) * side);
      group.add(lampGroup);
    });

    // 9. Voxel City Buildings (Stepped Block Towers with Glowing Pixel Windows & Awnings)
    const buildingColors = [0xfaf8f5, 0xffffff, 0xfef3c7, 0xe0f2fe, 0xfce7f3];
    const bldWidth = 15;
    const bldHeight = 14 + (index % 3) * 4;
    const bldDepth = length * 0.94;

    const bldGeo = new THREE.BoxGeometry(bldWidth, bldHeight, bldDepth);
    const bldMatL = new THREE.MeshStandardMaterial({
      color: buildingColors[index % buildingColors.length],
      roughness: 0.85,
      flatShading: true,
    });
    const bldL = new THREE.Mesh(bldGeo, bldMatL);
    bldL.position.set(-halfRoad - sidewalkWidth - bldWidth / 2 - 2, bldHeight / 2, 0);
    bldL.castShadow = true;
    bldL.receiveShadow = true;
    group.add(bldL);

    const bldMatR = new THREE.MeshStandardMaterial({
      color: buildingColors[(index + 2) % buildingColors.length],
      roughness: 0.85,
      flatShading: true,
    });
    const bldR = new THREE.Mesh(bldGeo, bldMatR);
    bldR.position.set(halfRoad + sidewalkWidth + bldWidth / 2 + 2, bldHeight / 2, 0);
    bldR.castShadow = true;
    bldR.receiveShadow = true;
    group.add(bldR);

    // Stepped Voxel Shop Awnings
    const awningGeo = new THREE.BoxGeometry(2.6, 0.2, length * 0.45);
    awningGeo.rotateZ(0.24);
    const awningMatL = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5, flatShading: true });
    const awningL = new THREE.Mesh(awningGeo, awningMatL);
    awningL.position.set(-halfRoad - sidewalkWidth - 0.9, 3.4, -length * 0.1);
    awningL.castShadow = true;
    group.add(awningL);

    const awningMatR = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, flatShading: true });
    const awningR = new THREE.Mesh(awningGeo, awningMatR);
    awningR.position.set(halfRoad + sidewalkWidth + 0.9, 3.4, length * 0.1);
    awningR.rotation.z = -0.45;
    awningR.castShadow = true;
    group.add(awningR);

    // Grid of Voxel Windows
    const winGeo = new THREE.BoxGeometry(0.12, 1.4, 1.2);
    for (let f = 1; f <= 3; f++) {
      for (let w = -2; w <= 2; w++) {
        const winL = new THREE.Mesh(winGeo, this.materials['windowLit']);
        winL.position.set(-halfRoad - sidewalkWidth - 1.9, 4.5 + f * 2.8, w * 4.5);
        group.add(winL);

        const winR = new THREE.Mesh(winGeo, this.materials['windowLit']);
        winR.position.set(halfRoad + sidewalkWidth + 1.9, 4.5 + f * 2.8, w * 4.5);
        group.add(winR);
      }
    }

    return group;
  }

  public resetTrack(pz: number = 0): void {
    // Keep segments continuously anchored around player position
    for (let i = 0; i < this.numSegments; i++) {
      const seg = this.roadSegments[i];
      if (seg) {
        seg.position.z = (pz + this.segmentLength) - i * this.segmentLength;
      }
    }
  }

  public resetCamera(pz: number = 0): void {
    this.camera.position.set(0, 6.4, pz + 12.0);
    this.camera.lookAt(0, 2.2, pz - 14);
  }

  private buildRoadSegments(): void {
    for (let i = 0; i < this.numSegments; i++) {
      const seg = this.createSegment(i);
      seg.position.z = this.segmentLength - i * this.segmentLength;
      this.roadSegments.push(seg);
      this.roadGroup.add(seg);
    }
  }

  /**
   * Procedural 3D Voxel Player Character (Minecraft / Crossy Road Pixel Aesthetic)
   */
  private createCharacterMesh(skin?: CharacterSkin): {
    playerGroup: THREE.Group;
    head: THREE.Mesh;
    torso: THREE.Mesh;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    hatGroup: THREE.Group;
    shadow: THREE.Mesh;
    megaSlapGlove: THREE.Mesh;
  } {
    const playerGroup = new THREE.Group();

    // 1. Octagonal Pixel Contact Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadow = new THREE.Mesh(shadowGeo, this.materials['shadow']);
    shadow.position.y = 0.02;
    playerGroup.add(shadow);

    // Skin Colors
    const skinColor = skin ? new THREE.Color(skin.bodyColor) : new THREE.Color(0xf4c29e);
    const shirtColor = skin ? new THREE.Color(skin.shirtColor) : new THREE.Color(0x10b981);
    const pantsColor = skin ? new THREE.Color(skin.pantsColor) : new THREE.Color(0x1e293b);

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6, flatShading: true });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.45, flatShading: true });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.5, flatShading: true });
    const shoeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, flatShading: true });
    const shoeAccentMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.3, flatShading: true });

    // 2. Voxel Torso (Blocky athletic body with belt block)
    const torsoGeo = new THREE.BoxGeometry(0.84, 1.05, 0.54);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.38;
    torso.castShadow = true;
    playerGroup.add(torso);

    // 3. Voxel Head (Cube with 8-bit Pixel Eyes & Smile)
    const headGeo = new THREE.BoxGeometry(0.74, 0.74, 0.74);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.24;
    head.castShadow = true;

    // 8-bit Pixel Eyes on FRONT of face (-0.37 Z facing forward)
    const eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeCubeGeo = new THREE.BoxGeometry(0.14, 0.14, 0.06);
    const glintCubeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.07);

    // Left Eye (front)
    const eyeL = new THREE.Mesh(eyeCubeGeo, eyeBlackMat);
    eyeL.position.set(-0.2, 0.06, -0.37);
    head.add(eyeL);
    const glintL = new THREE.Mesh(glintCubeGeo, eyeWhiteMat);
    glintL.position.set(-0.22, 0.08, -0.38);
    head.add(glintL);

    // Right Eye (front)
    const eyeR = new THREE.Mesh(eyeCubeGeo, eyeBlackMat);
    eyeR.position.set(0.2, 0.06, -0.37);
    head.add(eyeR);
    const glintR = new THREE.Mesh(glintCubeGeo, eyeWhiteMat);
    glintR.position.set(0.18, 0.08, -0.38);
    head.add(glintR);

    // 8-bit Pixel Smile (front)
    const mouthGeo = new THREE.BoxGeometry(0.22, 0.06, 0.05);
    const mouth = new THREE.Mesh(mouthGeo, eyeBlackMat);
    mouth.position.set(0, -0.16, -0.37);
    head.add(mouth);

    // Back of Head Hair (+0.36 Z facing the rear follow camera, no eyes visible!)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8, flatShading: true });
    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.44, 0.1), hairMat);
    hairBack.position.set(0, 0.12, 0.36);
    head.add(hairBack);

    playerGroup.add(head);

    // 4. Voxel Hat / Headwear Group
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 2.24, 0);
    playerGroup.add(hatGroup);
    this.buildHeadwear(hatGroup, skin?.hat || 'cap');

    // 5. Voxel Sprinter Arms (Articulated upper & forearm blocks with pixel fists)
    const upperArmGeo = new THREE.BoxGeometry(0.24, 0.46, 0.24);
    upperArmGeo.translate(0, -0.22, 0);

    const forearmGeo = new THREE.BoxGeometry(0.22, 0.4, 0.22);
    forearmGeo.translate(0, -0.16, 0.14);
    forearmGeo.rotateX(-0.85);

    const fistGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    fistGeo.translate(0, -0.32, 0.28);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.58, 1.78, 0);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, shirtMat);
    leftUpperArm.castShadow = true;
    leftArm.add(leftUpperArm);
    const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
    leftForearm.castShadow = true;
    leftArm.add(leftForearm);
    const leftFist = new THREE.Mesh(fistGeo, skinMat);
    leftArm.add(leftFist);
    playerGroup.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.58, 1.78, 0);
    const rightUpperArm = new THREE.Mesh(upperArmGeo, shirtMat);
    rightUpperArm.castShadow = true;
    rightArm.add(rightUpperArm);
    const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
    rightForearm.castShadow = true;
    rightArm.add(rightForearm);
    const rightFist = new THREE.Mesh(fistGeo, skinMat);
    rightArm.add(rightFist);
    playerGroup.add(rightArm);

    // 6. Dual-Tone Voxel Sneakers & Blocky Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.85, 0.28);
    legGeo.translate(0, -0.4, 0);

    // Left Leg
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.25, 0.85, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.castShadow = true;
    leftLeg.add(leftLegMesh);

    // White Rubber Sole Block
    const shoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.56), shoeWhiteMat);
    shoeSole.position.set(0, -0.88, 0.1);
    leftLeg.add(shoeSole);
    // Colored Sneaker Upper Block
    const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.52), shoeAccentMat);
    shoeUpper.position.set(0, -0.76, 0.1);
    leftLeg.add(shoeUpper);
    playerGroup.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.25, 0.85, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.castShadow = true;
    rightLeg.add(rightLegMesh);

    const rShoeSole = shoeSole.clone();
    rightLeg.add(rShoeSole);
    const rShoeUpper = shoeUpper.clone();
    rightLeg.add(rShoeUpper);
    playerGroup.add(rightLeg);

    // 7. Giant Voxel SLAP! Glove (Comedic Oversized Pixel Glove!)
    const gloveGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const megaSlapGlove = new THREE.Mesh(gloveGeo, this.materials['slapGlove']);
    megaSlapGlove.visible = false;
    playerGroup.add(megaSlapGlove);

    return {
      playerGroup,
      head,
      torso,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      hatGroup,
      shadow,
      megaSlapGlove,
    };
  }

  private buildHeadwear(hatGroup: THREE.Group, hatType: string): void {
    while (hatGroup.children.length > 0) {
      hatGroup.remove(hatGroup.children[0]);
    }

    if (hatType === 'cap') {
      // Voxel Athletic Cap with Blocky Visor Brim facing forward (-Z)
      const capMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, flatShading: true });
      const crown = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.3, 0.78), capMat);
      crown.position.y = 0.28;
      hatGroup.add(crown);

      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.45), capMat);
      brim.position.set(0, 0.22, -0.52);
      hatGroup.add(brim);
    } else if (hatType === 'crown') {
      // Stepped Voxel Champion Crown with Pixel Rubies
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.85, flatShading: true });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.8), crownMat);
      base.position.y = 0.42;
      hatGroup.add(base);

      const rubyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, flatShading: true });
      const ptGeo = new THREE.BoxGeometry(0.18, 0.26, 0.18);
      const rubyGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);

      // 4 corner battlements
      const coords = [
        [-0.32, -0.32],
        [0.32, -0.32],
        [-0.32, 0.32],
        [0.32, 0.32],
      ];
      coords.forEach(([x, z]) => {
        const pt = new THREE.Mesh(ptGeo, crownMat);
        pt.position.set(x, 0.6, z);
        hatGroup.add(pt);

        const ruby = new THREE.Mesh(rubyGeo, rubyMat);
        ruby.position.set(x, 0.6, z + (z > 0 ? 0.08 : -0.08));
        hatGroup.add(ruby);
      });
    } else if (hatType === 'headband') {
      // Voxel Ninja Headband with Stepped Trailing Tails behind (+Z)
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, flatShading: true });
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 0.78), bandMat);
      band.position.y = 0.2;
      hatGroup.add(band);

      // Trailing blocky pixel tails behind head in wind (+Z)
      const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.5), bandMat);
      tail1.position.set(-0.12, 0.15, 0.58);
      tail1.rotation.x = -0.2;
      hatGroup.add(tail1);

      const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.5), bandMat);
      tail2.position.set(0.12, 0.15, 0.58);
      tail2.rotation.y = -0.25;
      hatGroup.add(tail2);
    }
  }

  public setSkin(skin: CharacterSkin): void {
    this.currentSkin = skin;
    const skinColor = new THREE.Color(skin.bodyColor);
    const shirtColor = new THREE.Color(skin.shirtColor);
    const pantsColor = new THREE.Color(skin.pantsColor);

    if (this.playerHead && this.playerHead.material) {
      (this.playerHead.material as THREE.MeshStandardMaterial).color = skinColor;
    }
    if (this.playerTorso && this.playerTorso.material) {
      (this.playerTorso.material as THREE.MeshStandardMaterial).color = shirtColor;
    }
    if (this.playerLeftArm) {
      if (this.playerLeftArm.children[0]) {
        ((this.playerLeftArm.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = shirtColor;
      }
      if (this.playerLeftArm.children[1]) {
        ((this.playerLeftArm.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = skinColor;
      }
      if (this.playerLeftArm.children[2]) {
        ((this.playerLeftArm.children[2] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = skinColor;
      }
    }
    if (this.playerRightArm) {
      if (this.playerRightArm.children[0]) {
        ((this.playerRightArm.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = shirtColor;
      }
      if (this.playerRightArm.children[1]) {
        ((this.playerRightArm.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = skinColor;
      }
      if (this.playerRightArm.children[2]) {
        ((this.playerRightArm.children[2] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = skinColor;
      }
    }
    if (this.playerLeftLeg && this.playerLeftLeg.children[0]) {
      ((this.playerLeftLeg.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = pantsColor;
    }
    if (this.playerRightLeg && this.playerRightLeg.children[0]) {
      ((this.playerRightLeg.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial).color = pantsColor;
    }

    if (this.playerHatGroup) {
      this.buildHeadwear(this.playerHatGroup, skin.hat || 'cap');
    }
  }

  public resize(width: number, height: number, _dpr: number = 1): void {
    this.width = width;
    this.height = height;
    const aspect = width / height;
    this.camera.aspect = aspect;

    // Dynamically scale vertical FOV for narrow portrait mobile screens so all 5 tracks & sidewalks remain in view
    if (aspect < 1.0) {
      this.camera.fov = Math.min(75, 52 + (1.0 - aspect) * 34);
    } else {
      this.camera.fov = 52;
    }
    this.camera.updateProjectionMatrix();

    // Responsive Pixel Scale: keeps 3D voxel art chunky, sharp, and buttery smooth at 60 FPS
    const isMobile = width < 640;
    const pixelScale = isMobile ? 1.6 : 2.0;
    const renderW = Math.max(320, Math.round(width / pixelScale));
    const renderH = Math.max(240, Math.round(height / pixelScale));
    this.renderer.setSize(renderW, renderH, false);
    this.renderer.setPixelRatio(1);
  }

  public triggerShake(intensity: number = 6): void {
    this.screenShake = Math.max(this.screenShake, intensity * 0.18);
  }

  public triggerHitFreeze(frames: number = 2): void {
    this.hitFreeze = frames;
  }

  /**
   * Main 3D Render Loop
   */
  public render(
    player: Player,
    bystanders: Bystander[],
    chasers: Chaser[],
    obstacles: Obstacle[],
    coins: Coin[],
    powerups: Powerup[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    _shockwaves: Shockwave[],
    _chaosMultiplier: number,
    feverActive: boolean,
    _mobDistance: number
  ): void {
    if (this.hitFreeze > 0) {
      this.hitFreeze--;
      return;
    }

    const elapsedTime = (performance.now() - this.startTime) / 1000;

    // 1. Atmosphere Transitions
    if (feverActive) {
      this.scene.background = new THREE.Color(0x064e3b);
      (this.scene.fog as THREE.FogExp2).color.setHex(0x059669);
      this.playerPointLight.intensity = 4.0;
      this.playerPointLight.color.setHex(0x34d399);
    } else {
      this.scene.background = new THREE.Color(0x38bdf8);
      (this.scene.fog as THREE.FogExp2).color.setHex(0x7dd3fc);
      this.playerPointLight.intensity = 0.8;
      this.playerPointLight.color.setHex(0xfffaed);
    }

    // 2. Map Player World Coordinates
    const px = player.x * SCALE_X;
    const pz = -player.y * SCALE_Y;
    const py = (player.z || 0) * SCALE_Z;

    this.playerGroup.position.set(px, py, pz);
    this.playerPointLight.position.set(px, py + 1.6, pz);

    // Scale shadow with jump height
    const shadowScale = Math.max(0.4, 1.0 - py * 0.2);
    this.playerShadow.scale.set(shadowScale, shadowScale, shadowScale);

    // 3. Dynamic Athletic Running & Slap Animations
    // 3. Dynamic Athletic Running Animations (Natural running stride, not walking)
    const spd = player.speed && player.speed > 0.1 ? player.speed : 4.8;
    const runFreq = 8.6 + Math.min(2.0, Math.max(0, spd - 4.5) * 0.35);
    const isMoving = spd > 0.5;

    if (isMoving && !player.isSlapping) {
      const runCycle = elapsedTime * runFreq;
      const legSwing = Math.sin(runCycle);
      const armSwing = Math.sin(runCycle);

      // Athletic running stride with high back kick
      this.playerLeftLeg.rotation.x = legSwing * 1.05;
      this.playerRightLeg.rotation.x = -legSwing * 1.05;

      // Sprinter arms pumping with bent elbows opposite to legs
      this.playerLeftArm.rotation.x = -armSwing * 0.95;
      this.playerRightArm.rotation.x = armSwing * 0.95;
      this.playerLeftArm.rotation.z = -0.16 - armSwing * 0.05;
      this.playerRightArm.rotation.z = 0.16 - armSwing * 0.05;

      // Forward athletic sprinter lean (leaning forward into the run towards -Z)
      this.playerGroup.rotation.x = -0.20;

      // Footfall vertical spring bounce (peaks with every step)
      const bounce = Math.abs(Math.sin(runCycle)) * 0.12;
      this.playerTorso.position.y = 1.38 + bounce;
      this.playerHead.position.y = 2.24 + bounce;
      if (this.playerHatGroup) {
        this.playerHatGroup.position.y = 2.24 + bounce;
      }

      // Dynamic shoulder roll and banking into turn
      this.playerTorso.rotation.y = -Math.sin(runCycle) * 0.08;
      this.playerGroup.rotation.y = -(player.vx || 0) * 0.05;
      this.playerGroup.rotation.z = -(player.vx || 0) * 0.08;
    }

    // Dynamic 3D Voxel SLAP! Glove
    if (player.isSlapping) {
      const slapProgress = player.slapProgress;
      const isLeft = player.slapHand === 'left';
      const slapArm = isLeft ? this.playerLeftArm : this.playerRightArm;
      const otherArm = isLeft ? this.playerRightArm : this.playerLeftArm;

      // Whip swing motion
      const swingAngle = Math.sin(slapProgress * Math.PI) * 2.2;
      slapArm.rotation.x = -0.6 - swingAngle;
      slapArm.rotation.y = (isLeft ? -1 : 1) * swingAngle * 1.1;
      slapArm.rotation.z = (isLeft ? -1 : 1) * 0.7;
      otherArm.rotation.x = 0.6;

      // Display oversized Giant Voxel Slap Glove!
      this.megaSlapGlove.visible = true;
      this.megaSlapGlove.position.set(isLeft ? -0.85 : 0.85, 1.45, -0.6);
      this.megaSlapGlove.rotation.y = isLeft ? -0.4 : 0.4;
      const sc = 1 + Math.sin(slapProgress * Math.PI) * 0.6;
      this.megaSlapGlove.scale.set(sc, sc, sc);
    } else {
      this.megaSlapGlove.visible = false;
    }

    // 4. Infinite Looping Boulevard Track Segments with Auto-Recovery
    let maxZ = -Infinity;
    let minZ = Infinity;
    this.roadSegments.forEach((s) => {
      if (s.position.z > maxZ) maxZ = s.position.z;
      if (s.position.z < minZ) minZ = s.position.z;
    });

    // If segments ever become desynced from current player position (e.g. game restart or fast menu transition)
    if (maxZ < pz - this.segmentLength * 0.5 || minZ > pz + this.segmentLength * 2) {
      this.resetTrack(pz);
    } else {
      this.roadSegments.forEach((seg) => {
        if (seg.position.z > pz + this.segmentLength * 1.2) {
          let currentMinZ = pz;
          this.roadSegments.forEach((s) => {
            if (s.position.z < currentMinZ) currentMinZ = s.position.z;
          });
          seg.position.z = currentMinZ - this.segmentLength;
        }
      });
    }

    // 5. Follow Camera (Adaptive framing for mobile portrait vs desktop landscape)
    const isPortrait = this.camera.aspect < 0.88;
    let targetCamX = px * (isPortrait ? 0.28 : 0.42);
    let targetCamY = (isPortrait ? 7.6 : 6.4) + py * 0.35;
    let targetCamZ = pz + (isPortrait ? 13.8 : 12.0);

    // Apply Screen Shake
    if (this.screenShake > 0.01) {
      targetCamX += (Math.random() - 0.5) * this.screenShake;
      targetCamY += (Math.random() - 0.5) * this.screenShake;
      this.screenShake *= 0.88;
    }

    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.14;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.14;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.16;
    this.camera.lookAt(px * 0.2, 2.2 + py * 0.5, pz - 14);

    // Track sunlight along road
    this.dirLight.position.set(px + 16, 32, pz + 22);
    this.dirLight.target.position.set(px, 0, pz - 12);
    this.dirLight.target.updateMatrixWorld();

    // 6. Update Entities
    this.renderObstacles(obstacles);
    this.renderBystanders(bystanders, player, elapsedTime);
    this.renderChasers(chasers, elapsedTime);
    this.renderCollectibles(coins, powerups, elapsedTime);
    this.renderParticlesAndTexts(particles, floatingTexts);

    // Render WebGL frame
    this.renderer.render(this.scene, this.camera);
  }

  private renderObstacles(obstacles: Obstacle[]): void {
    const activeIds = new Set<number>();

    for (const obs of obstacles) {
      activeIds.add(obs.id);
      let mesh = this.obstacleMeshes.get(obs.id);

      if (!mesh) {
        mesh = this.createObstacleMesh(obs);
        this.obstacleMeshes.set(obs.id, mesh);
        this.scene.add(mesh);
      }

      mesh.position.set(obs.x * SCALE_X, 0, -obs.y * SCALE_Y);

      if (obs.type === 'barrel') {
        mesh.rotation.x = obs.rotation || 0;
      }
    }

    for (const [id, mesh] of this.obstacleMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.obstacleMeshes.delete(id);
      }
    }
  }

  private createObstacleMesh(obs: Obstacle): THREE.Group {
    const group = new THREE.Group();

    if (obs.type === 'barrel') {
      // Octagonal Voxel Wooden Rolling Barrel with Copper Metal Bands
      const barrelGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.45, 8);
      barrelGeo.rotateZ(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeo, this.materials['wood']);
      barrel.position.y = 0.72;
      barrel.castShadow = true;
      group.add(barrel);

      const hoopGeo = new THREE.CylinderGeometry(0.76, 0.76, 0.14, 8);
      hoopGeo.rotateZ(Math.PI / 2);
      const hoop1 = new THREE.Mesh(hoopGeo, this.materials['copperBand']);
      hoop1.position.set(-0.45, 0.72, 0);
      group.add(hoop1);
      const hoop2 = new THREE.Mesh(hoopGeo, this.materials['copperBand']);
      hoop2.position.set(0.45, 0.72, 0);
      group.add(hoop2);
    } else if (obs.type === 'ramp') {
      // Stepped Voxel Jump Ramp with Glowing Neon Arrows
      const rampGeo = new THREE.BoxGeometry(2.3, 0.85, 2.6);
      rampGeo.rotateX(-0.28);
      const ramp = new THREE.Mesh(rampGeo, this.materials['ramp']);
      ramp.position.y = 0.38;
      ramp.castShadow = true;
      group.add(ramp);

      // Pixel Arrow Cubes
      const arrowGeo = new THREE.BoxGeometry(0.24, 0.08, 0.24);
      arrowGeo.rotateX(-0.28);
      for (let a = -2; a <= 2; a++) {
        const arrowCube = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        arrowCube.position.set(a * 0.3, 0.7 - Math.abs(a) * 0.15, 0.2);
        group.add(arrowCube);
      }
    } else if (obs.type === 'crate') {
      // Chunky Voxel Fruit Crate with Red/Orange Pixel Fruit Cubes
      const crateGeo = new THREE.BoxGeometry(1.6, 1.1, 1.4);
      const crate = new THREE.Mesh(crateGeo, this.materials['crateWood']);
      crate.position.y = 0.55;
      crate.castShadow = true;
      group.add(crate);

      // Pixel Fruit Cubes
      const fruitGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
      const fruit1 = new THREE.Mesh(fruitGeo, this.materials['apple']);
      fruit1.position.set(-0.35, 1.2, -0.2);
      group.add(fruit1);
      const fruit2 = new THREE.Mesh(fruitGeo, this.materials['orange']);
      fruit2.position.set(0.35, 1.2, 0.15);
      group.add(fruit2);
      const fruit3 = new THREE.Mesh(fruitGeo, this.materials['apple']);
      fruit3.position.set(0, 1.3, 0);
      group.add(fruit3);
    } else if (obs.type === 'cart') {
      // Voxel Market Pushcart with wooden wheels and striped awning
      const cartBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.75, 1.3), this.materials['crateWood']);
      cartBody.position.y = 0.8;
      cartBody.castShadow = true;
      group.add(cartBody);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.15, 8);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelL = new THREE.Mesh(wheelGeo, this.materials['wood']);
      wheelL.position.set(-1.05, 0.38, 0);
      group.add(wheelL);
      const wheelR = new THREE.Mesh(wheelGeo, this.materials['wood']);
      wheelR.position.set(1.05, 0.38, 0);
      group.add(wheelR);

      // Striped Awning Cover
      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 1.4), this.materials['orangeStripe']);
      roof.position.y = 1.6;
      group.add(roof);
    } else {
      // Voxel Construction Sawhorse Barricade
      const barGeo = new THREE.BoxGeometry(2.2, 0.48, 0.24);
      const bar = new THREE.Mesh(barGeo, this.materials['orangeStripe']);
      bar.position.y = 1.15;
      bar.castShadow = true;
      group.add(bar);

      const legGeo = new THREE.BoxGeometry(0.14, 1.3, 0.14);
      const legL = new THREE.Mesh(legGeo, this.materials['whiteStripe']);
      legL.position.set(-0.85, 0.65, 0);
      group.add(legL);
      const legR = new THREE.Mesh(legGeo, this.materials['whiteStripe']);
      legR.position.set(0.85, 0.65, 0);
      group.add(legR);
    }

    return group;
  }

  private renderBystanders(bystanders: Bystander[], player: Player, time: number): void {
    const activeIds = new Set<number>();

    for (const b of bystanders) {
      activeIds.add(b.id);
      let mesh = this.bystanderMeshes.get(b.id);

      if (!mesh) {
        mesh = this.createBystanderMesh(b);
        this.bystanderMeshes.set(b.id, mesh);
        this.scene.add(mesh);
      }

      const bx = b.x * SCALE_X;
      const bz = -b.y * SCALE_Y;
      mesh.position.set(bx, 0.23, bz);

      // Facing towards street
      mesh.rotation.y = b.x < 0 ? Math.PI / 2 : -Math.PI / 2;

      // Strike range indicator (Floating Voxel Exclamation/Diamond)
      const reticle = mesh.getObjectByName('reticle');
      if (reticle) {
        reticle.visible = !b.slapped && (b.inStrikeRange || false);
        if (reticle.visible) {
          reticle.position.y = 2.9 + Math.sin(time * 8) * 0.18;
          reticle.rotation.y = time * 4.5;
        }
      }

      // Hilarious 3D voxel ragdoll launch & spin when slapped!
      if (b.slapped) {
        mesh.rotation.x += 0.32;
        mesh.rotation.z += 0.42;
        mesh.position.y += 0.22;
      }
    }

    for (const [id, mesh] of this.bystanderMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.bystanderMeshes.delete(id);
      }
    }
  }

  private createBystanderMesh(b: Bystander): THREE.Group {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: b.bodyColor, roughness: 0.6, flatShading: true });
    const shirtMat = new THREE.MeshStandardMaterial({ color: b.shirtColor, roughness: 0.5, flatShading: true });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, flatShading: true });

    // Voxel Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.96, 0.48), shirtMat);
    torso.position.y = 1.32;
    torso.castShadow = true;
    group.add(torso);

    // Voxel Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), skinMat);
    head.position.y = 2.06;
    head.castShadow = true;

    // Voxel Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), eyeMat);
    eyeL.position.set(-0.18, 0.06, 0.36);
    head.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), eyeMat);
    eyeR.position.set(0.18, 0.06, 0.36);
    head.add(eyeR);
    group.add(head);

    // Voxel Accessories
    if (b.accessory === 'fish') {
      // Voxel Chef Toque Hat
      const toque = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.45, 0.74), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true }));
      toque.position.set(0, 2.55, 0);
      group.add(toque);

      // 3D Voxel Blue Fish
      const fishGroup = new THREE.Group();
      const fishBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.8), new THREE.MeshStandardMaterial({ color: 0x38bdf8, flatShading: true }));
      fishGroup.add(fishBody);
      const fishTail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.3), new THREE.MeshStandardMaterial({ color: 0x0284c7, flatShading: true }));
      fishTail.position.set(0, 0, -0.45);
      fishGroup.add(fishTail);
      fishGroup.position.set(0.5, 1.25, 0.3);
      group.add(fishGroup);
    } else if (b.accessory === 'phone') {
      // Voxel Smartphone
      const phone = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.38, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x9333ea, emissive: 0x06b6d4, emissiveIntensity: 0.6, flatShading: true })
      );
      phone.position.set(0.48, 1.6, 0.32);
      group.add(phone);
    } else if (b.accessory === 'fruit') {
      // Voxel Baker Cap & Croissant
      const bakerCap = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.75), new THREE.MeshStandardMaterial({ color: 0xffedd5, flatShading: true }));
      bakerCap.position.y = 2.45;
      group.add(bakerCap);

      const croissant = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.36), new THREE.MeshStandardMaterial({ color: 0xd97706, flatShading: true }));
      croissant.position.set(0.44, 1.25, 0.28);
      group.add(croissant);
    } else if (b.accessory === 'hat') {
      // Voxel Executive Briefcase
      const briefcase = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.4, 0.18), new THREE.MeshStandardMaterial({ color: 0x451a03, flatShading: true }));
      briefcase.position.set(0.55, 0.75, 0);
      group.add(briefcase);
    }

    // Voxel Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.82, 0.28);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.22, 0.42, 0);
    legL.castShadow = true;
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.22, 0.42, 0);
    legR.castShadow = true;
    group.add(legR);

    // Floating Voxel Target Exclamation Indicator
    const reticleGroup = new THREE.Group();
    reticleGroup.name = 'reticle';
    reticleGroup.position.set(0, 2.9, 0);
    reticleGroup.visible = false;

    const exclTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.45, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xff4757 })
    );
    exclTop.position.y = 0.15;
    reticleGroup.add(exclTop);

    const exclDot = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.18, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xff4757 })
    );
    exclDot.position.y = -0.22;
    reticleGroup.add(exclDot);

    group.add(reticleGroup);

    return group;
  }

  private renderChasers(chasers: Chaser[], time: number): void {
    const activeIds = new Set<number>();

    for (const c of chasers) {
      activeIds.add(c.id);
      let mesh = this.chaserMeshes.get(c.id);

      if (!mesh) {
        mesh = this.createChaserMesh(c);
        this.chaserMeshes.set(c.id, mesh);
        this.scene.add(mesh);
      }

      mesh.position.set(c.x * SCALE_X, 0, -c.y * SCALE_Y);

      // Forward athletic lean towards runner (-Z)
      mesh.rotation.x = -0.18;

      // Athletic running stride and arm swing
      const stride = Math.sin(time * 12 + c.animOffset);
      const leftLeg = mesh.getObjectByName('leftLeg');
      const rightLeg = mesh.getObjectByName('rightLeg');
      const leftArm = mesh.getObjectByName('leftArm');
      const rightArm = mesh.getObjectByName('rightArm');

      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = stride * 0.95;
        rightLeg.rotation.x = -stride * 0.95;
      }
      if (leftArm && rightArm) {
        leftArm.rotation.x = -stride * 0.85;
        rightArm.rotation.x = stride * 0.85;
      }

      // Pulsing fury steam voxel cube
      const steam = mesh.getObjectByName('steam');
      if (steam) {
        const sc = 1 + Math.sin(time * 10) * 0.35;
        steam.scale.set(sc, sc, sc);
      }
    }

    for (const [id, mesh] of this.chaserMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.chaserMeshes.delete(id);
      }
    }
  }

  private createChaserMesh(c: Chaser): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: c.shirtColor || 0xef4444, roughness: 0.5, flatShading: true });
    const skinMat = new THREE.MeshStandardMaterial({ color: c.bodyColor || 0xf4c29e, roughness: 0.6, flatShading: true });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, flatShading: true });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.54), mat);
    torso.position.y = 1.34;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.72), skinMat);
    head.position.y = 2.12;
    head.castShadow = true;

    // Furious Eyes facing forward (-Z)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), eyeMat);
    eyeL.position.set(-0.18, 0.06, -0.36);
    head.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), eyeMat);
    eyeR.position.set(0.18, 0.06, -0.36);
    head.add(eyeR);

    group.add(head);

    // Officer / Inspector Visor Cap & Golden Badge (Subway Surfers tribute)
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, flatShading: true });
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.22, 0.78), capMat);
    cap.position.set(0, 2.52, 0);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.26), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    visor.position.set(0, 2.45, -0.42);
    group.add(cap);
    group.add(visor);

    // Golden Officer / Star Badge on chest
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.06), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    badge.position.set(0.2, 1.45, -0.28);
    group.add(badge);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.24, 0.72, 0.24);
    armGeo.translate(0, -0.32, 0);

    const leftArm = new THREE.Group();
    leftArm.name = 'leftArm';
    leftArm.position.set(-0.52, 1.7, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, mat);
    leftArm.add(leftArmMesh);
    group.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.name = 'rightArm';
    rightArm.position.set(0.52, 1.7, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, mat);
    rightArm.add(rightArmMesh);
    group.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.85, 0.28);
    legGeo.translate(0, -0.4, 0);

    const leftLeg = new THREE.Group();
    leftLeg.name = 'leftLeg';
    leftLeg.position.set(-0.25, 0.85, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.add(leftLegMesh);
    group.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.name = 'rightLeg';
    rightLeg.position.set(0.25, 0.85, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.add(rightLegMesh);
    group.add(rightLeg);

    // Red Enraged Steam Voxel Cube
    const steamMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
    const steam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), steamMat);
    steam.name = 'steam';
    steam.position.set(0.25, 2.7, 0);
    group.add(steam);

    return group;
  }

  private renderCollectibles(coins: Coin[], powerups: Powerup[], time: number): void {
    const activeCoinIds = new Set<number>();

    for (const c of coins) {
      if (c.collected) continue;
      activeCoinIds.add(c.id);

      let mesh = this.coinMeshes.get(c.id);
      if (!mesh) {
        // Octagonal Voxel Gold Coin
        const coinGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.16, 8);
        coinGeo.rotateX(Math.PI / 2);
        mesh = new THREE.Group();
        const coinBody = new THREE.Mesh(coinGeo, this.materials['gold']);
        coinBody.castShadow = true;
        mesh.add(coinBody);

        // Center Pixel Hole / Star
        const centerHole = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.22, 0.18),
          new THREE.MeshBasicMaterial({ color: 0x92400e })
        );
        mesh.add(centerHole);

        this.coinMeshes.set(c.id, mesh);
        this.scene.add(mesh);
      }

      mesh.position.set(c.x * SCALE_X, 0.95 + Math.sin(time * 4 + c.bobPhase) * 0.2, -c.y * SCALE_Y);
      mesh.rotation.y = time * 3.8;
    }

    for (const [id, mesh] of this.coinMeshes.entries()) {
      if (!activeCoinIds.has(id)) {
        this.scene.remove(mesh);
        this.coinMeshes.delete(id);
      }
    }

    // Powerup Voxel Cans & Soap
    const activePuIds = new Set<number>();
    for (const pu of powerups) {
      if (pu.collected) continue;
      activePuIds.add(pu.id);

      let mesh = this.powerupMeshes.get(pu.id);
      if (!mesh) {
        mesh = new THREE.Group();
        const canGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.88, 8);
        const canMat = new THREE.MeshStandardMaterial({
          color: pu.type === 'soda' ? 0xef4444 : 0x06b6d4,
          roughness: 0.25,
          metalness: 0.75,
          flatShading: true,
        });
        const can = new THREE.Mesh(canGeo, canMat);
        can.castShadow = true;
        mesh.add(can);

        this.powerupMeshes.set(pu.id, mesh);
        this.scene.add(mesh);
      }

      mesh.position.set(pu.x * SCALE_X, 1.15 + Math.sin(time * 3 + pu.bobPhase) * 0.25, -pu.y * SCALE_Y);
      mesh.rotation.y = time * 2.2;
    }

    for (const [id, mesh] of this.powerupMeshes.entries()) {
      if (!activePuIds.has(id)) {
        this.scene.remove(mesh);
        this.powerupMeshes.delete(id);
      }
    }
  }

  private renderParticlesAndTexts(particles: Particle[], floatingTexts: FloatingText[]): void {
    // 1. Render Voxel Spark Cubes & Pixel Confetti
    while (this.particleGroup.children.length > 0) {
      this.particleGroup.remove(this.particleGroup.children[0]);
    }

    const cubeGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    particles.slice(0, 35).forEach((p) => {
      const partMesh = new THREE.Mesh(cubeGeo, starMat);
      partMesh.position.set(p.x * SCALE_X, 1.3 + (p.vy || 0) * 0.02, -p.y * SCALE_Y);
      partMesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      this.particleGroup.add(partMesh);
    });

    // 2. Render 3D Floating Comic Popups in Retro Pixel Font ('Press Start 2P')
    const activeTextIds = new Set<number>();

    for (const ft of floatingTexts) {
      activeTextIds.add(ft.id);
      let sprite = this.floatingTextSprites.get(ft.id);

      if (!sprite) {
        sprite = this.createComicTextSprite(ft.text, ft.color || '#F59E0B');
        this.floatingTextSprites.set(ft.id, sprite);
        this.scene.add(sprite);
      }

      const opacity = ft.maxLife > 0 ? Math.max(0, Math.min(1, ft.life / ft.maxLife)) : 1;
      sprite.position.set(ft.x * SCALE_X, 2.6 + (1 - opacity) * 1.6, -ft.y * SCALE_Y);
      const sc = 2.4 * (ft.scale || 1);
      sprite.scale.set(sc, sc * 0.5, 1);
      (sprite.material as THREE.SpriteMaterial).opacity = opacity;
    }

    for (const [id, sprite] of this.floatingTextSprites.entries()) {
      if (!activeTextIds.has(id)) {
        this.scene.remove(sprite);
        sprite.material.dispose();
        this.floatingTextSprites.delete(id);
      }
    }
  }

  private createComicTextSprite(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 256, 128);
      // Retro 8-bit Pixel Font
      ctx.font = '700 24px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Thick pixelated black shadow
      ctx.fillStyle = '#000000';
      ctx.fillText(text, 131, 67);
      ctx.fillText(text, 125, 67);
      ctx.fillText(text, 131, 61);
      ctx.fillText(text, 125, 61);

      // Bright pixel text fill
      ctx.fillStyle = color;
      ctx.fillText(text, 128, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    return new THREE.Sprite(material);
  }

  public destroy(): void {
    this.renderer.dispose();
    Object.values(this.materials).forEach((mat) => mat.dispose());
    Object.values(this.sharedGeometries).forEach((geo) => geo.dispose());
    for (const sprite of this.floatingTextSprites.values()) {
      sprite.material.dispose();
    }
    this.floatingTextSprites.clear();
  }
}
