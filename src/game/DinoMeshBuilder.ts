import * as THREE from 'three';
import { CharacterSkin } from './types.ts';

export interface DinoMeshComponents {
  rootGroup: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  underbelly: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  tail: THREE.Group;
  hatGroup: THREE.Group;
  megaSlapGlove: THREE.Mesh;
  shadow: THREE.Mesh;
  materials: {
    bodyMat: THREE.MeshStandardMaterial;
    bellyMat: THREE.MeshStandardMaterial;
    accentMat: THREE.MeshStandardMaterial;
    teethMat: THREE.MeshStandardMaterial;
    clawMat: THREE.MeshStandardMaterial;
    eyeBlackMat: THREE.MeshBasicMaterial;
    eyeWhiteMat: THREE.MeshBasicMaterial;
    glowMat?: THREE.MeshStandardMaterial;
  };
}

/**
 * Builds an authentic, high-clarity 3D Voxel Dinosaur Character Mesh
 * Tailored for each species (Red T-Rex, Blue Spinosaurus, Golden Raptor, Emerald Swiposaur, Cyber Rex, Midnight Rex)
 */
export function buildDinoCharacterMesh(skin: CharacterSkin): DinoMeshComponents {
  const rootGroup = new THREE.Group();
  rootGroup.scale.set(1.22, 1.22, 1.22);

  const isSpino = skin.id.includes('spino');
  const isRaptor = skin.id.includes('raptor');
  const isCyber = skin.id.includes('cyber');
  const isShadow = skin.id.includes('shadow');

  // Materials
  const bodyColor = new THREE.Color(skin.bodyColor);
  const bellyColor = new THREE.Color(skin.shirtColor);
  const accentColor = new THREE.Color(skin.pantsColor);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: isCyber ? 0.35 : 0.65,
    metalness: isCyber ? 0.5 : 0.05,
    flatShading: true,
  });

  const bellyMat = new THREE.MeshStandardMaterial({
    color: bellyColor,
    roughness: 0.6,
    flatShading: true,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.55,
    flatShading: true,
  });

  const teethMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    flatShading: true,
  });

  const clawMat = new THREE.MeshStandardMaterial({
    color: isCyber ? 0x06b6d4 : 0xffffff,
    roughness: 0.3,
    flatShading: true,
  });

  const eyeBlackMat = new THREE.MeshBasicMaterial({ color: isCyber ? 0x06b6d4 : 0x0a0a0a });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  let glowMat: THREE.MeshStandardMaterial | undefined;
  if (isCyber) {
    glowMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      flatShading: true,
    });
  } else if (isShadow) {
    glowMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      flatShading: true,
    });
  }

  // 1. Soft Ground Contact Shadow
  const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.01;
  rootGroup.add(shadow);

  // 2. Voxel Dinosaur Torso
  const torsoGeo = new THREE.BoxGeometry(0.88, 1.1, 0.76);
  const torso = new THREE.Mesh(torsoGeo, bodyMat);
  torso.position.y = 1.38;
  torso.castShadow = true;
  rootGroup.add(torso);

  // Pale Dinosaur Underbelly Plates (facing -Z forward where chest faces)
  const bellyGeo = new THREE.BoxGeometry(0.72, 0.95, 0.12);
  const underbelly = new THREE.Mesh(bellyGeo, bellyMat);
  underbelly.position.set(0, -0.06, -0.36);
  underbelly.castShadow = true;
  torso.add(underbelly);

  // Dorsal Spines along back of torso (+Z)
  for (let s = 0; s < 3; s++) {
    const spineGeo = new THREE.BoxGeometry(0.12, 0.22, 0.24);
    const spineMesh = new THREE.Mesh(spineGeo, accentMat);
    spineMesh.position.set(0, 0.38 - s * 0.32, 0.44);
    spineMesh.castShadow = true;
    torso.add(spineMesh);
  }

  // Spinosaurus Sail (Special dorsal fin for Blue Spino)
  if (isSpino) {
    const sailGroup = new THREE.Group();
    sailGroup.position.set(0, 0.55, 0.48);
    const sailHeights = [0.45, 0.85, 1.05, 0.95, 0.55];
    sailHeights.forEach((h, i) => {
      const sailFin = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.16), bellyMat);
      sailFin.position.set(0, h / 2, -0.32 + i * 0.16);
      sailFin.castShadow = true;
      sailGroup.add(sailFin);

      const spineTip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.16), accentMat);
      spineTip.position.set(0, h + 0.06, -0.32 + i * 0.16);
      sailGroup.add(spineTip);
    });
    torso.add(sailGroup);
  }

  // Cyber / Neon Power Ribs
  if (isCyber && glowMat) {
    for (let r = 0; r < 2; r++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 0.72), glowMat);
      rib.position.set(0, 0.2 - r * 0.36, 0);
      torso.add(rib);
    }
  }

  // 3. Voxel Dinosaur Head (Complete with snout, jaw, teeth, nostrils & fierce eyes)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.18, 0);

  // Cranium Block
  const craniumGeo = new THREE.BoxGeometry(0.82, 0.78, 0.76);
  const cranium = new THREE.Mesh(craniumGeo, bodyMat);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Dinosaur Snout / Muzzle (Projects boldly forward in -Z)
  const snoutDepth = isSpino ? 0.95 : isRaptor ? 0.82 : 0.75;
  const snoutWidth = isSpino ? 0.6 : 0.72;
  const snoutHeight = 0.52;
  const snoutGeo = new THREE.BoxGeometry(snoutWidth, snoutHeight, snoutDepth);
  const snout = new THREE.Mesh(snoutGeo, bodyMat);
  snout.position.set(0, -0.06, -0.38 - snoutDepth / 2);
  snout.castShadow = true;
  headGroup.add(snout);

  // Lower Jaw (Underneath snout, slightly open showing teeth)
  const jawDepth = snoutDepth - 0.05;
  const jawGeo = new THREE.BoxGeometry(snoutWidth - 0.06, 0.2, jawDepth);
  const jaw = new THREE.Mesh(jawGeo, accentMat);
  jaw.position.set(0, -0.34, -0.38 - jawDepth / 2);
  jaw.castShadow = true;
  headGroup.add(jaw);

  // Sharp White Dinosaur Teeth (Upper and lower rows)
  const toothGeo = new THREE.BoxGeometry(0.06, 0.12, 0.06);
  [-0.24, -0.08, 0.08, 0.24].forEach((tx) => {
    // Upper teeth
    const tUpper = new THREE.Mesh(toothGeo, teethMat);
    tUpper.position.set(tx, -0.32, -0.42 - snoutDepth + 0.12);
    headGroup.add(tUpper);

    // Side teeth
    const tSideL = new THREE.Mesh(toothGeo, teethMat);
    tSideL.position.set(-snoutWidth / 2 + 0.04, -0.32, -0.42 - snoutDepth / 2);
    headGroup.add(tSideL);

    const tSideR = new THREE.Mesh(toothGeo, teethMat);
    tSideR.position.set(snoutWidth / 2 - 0.04, -0.32, -0.42 - snoutDepth / 2);
    headGroup.add(tSideR);
  });

  // Snout Nostrils
  const nostrilGeo = new THREE.BoxGeometry(0.08, 0.08, 0.04);
  const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  const nostrilL = new THREE.Mesh(nostrilGeo, nostrilMat);
  nostrilL.position.set(-0.16, 0.12, -0.38 - snoutDepth - 0.01);
  headGroup.add(nostrilL);
  const nostrilR = new THREE.Mesh(nostrilGeo, nostrilMat);
  nostrilR.position.set(0.16, 0.12, -0.38 - snoutDepth - 0.01);
  headGroup.add(nostrilR);

  // Expressive Dinosaur Eyes (Placed on the front/sides of the cranium)
  const eyeCubeGeo = new THREE.BoxGeometry(0.16, 0.16, 0.08);
  const glintCubeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.09);

  // Left Eye
  const eyeL = new THREE.Mesh(eyeCubeGeo, eyeBlackMat);
  eyeL.position.set(-0.43, 0.12, -0.22);
  eyeL.rotation.y = -0.3;
  headGroup.add(eyeL);
  const glintL = new THREE.Mesh(glintCubeGeo, eyeWhiteMat);
  glintL.position.set(-0.44, 0.15, -0.2);
  headGroup.add(glintL);

  // Right Eye
  const eyeR = new THREE.Mesh(eyeCubeGeo, eyeBlackMat);
  eyeR.position.set(0.43, 0.12, -0.22);
  eyeR.rotation.y = 0.3;
  headGroup.add(eyeR);
  const glintR = new THREE.Mesh(glintCubeGeo, eyeWhiteMat);
  glintR.position.set(0.44, 0.15, -0.2);
  headGroup.add(glintR);

  // Fierce Dinosaur Brow Ridges
  const browGeo = new THREE.BoxGeometry(0.24, 0.12, 0.32);
  const browL = new THREE.Mesh(browGeo, accentMat);
  browL.position.set(-0.36, 0.26, -0.22);
  browL.rotation.z = -0.15;
  headGroup.add(browL);

  const browR = new THREE.Mesh(browGeo, accentMat);
  browR.position.set(0.36, 0.26, -0.22);
  browR.rotation.z = 0.15;
  headGroup.add(browR);

  // Back of Dinosaur Head Spines (+Z)
  for (let s = 0; s < 2; s++) {
    const headSpine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.22), accentMat);
    headSpine.position.set(0, 0.28 - s * 0.28, 0.44);
    headGroup.add(headSpine);
  }

  rootGroup.add(headGroup);

  // 4. Voxel Hat / Accessories
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 2.18, 0);
  rootGroup.add(hatGroup);
  buildDinoHeadwear(hatGroup, skin.hat || 'none', isRaptor);

  // 5. Dinosaur Forelimbs (Arms with Sharp Talons)
  const armGeo = new THREE.BoxGeometry(0.22, 0.52, 0.22);
  armGeo.translate(0, -0.2, -0.06);

  const clawGeo = new THREE.BoxGeometry(0.06, 0.16, 0.1);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.56, 1.62, -0.14);
  const leftArmMesh = new THREE.Mesh(armGeo, bodyMat);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  // 3 Claws
  [-0.06, 0, 0.06].forEach((cx) => {
    const claw = new THREE.Mesh(clawGeo, clawMat);
    claw.position.set(cx, -0.46, -0.14);
    claw.rotation.x = -0.4;
    leftArm.add(claw);
  });
  rootGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.56, 1.62, -0.14);
  const rightArmMesh = new THREE.Mesh(armGeo, bodyMat);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  [-0.06, 0, 0.06].forEach((cx) => {
    const claw = new THREE.Mesh(clawGeo, clawMat);
    claw.position.set(cx, -0.46, -0.14);
    claw.rotation.x = -0.4;
    rightArm.add(claw);
  });
  rootGroup.add(rightArm);

  // 6. Powerful Dinosaur Hind Legs & 3-Toed Claw Feet
  const thighGeo = new THREE.BoxGeometry(0.36, 0.62, 0.46);
  thighGeo.translate(0, -0.24, 0);

  const shinGeo = new THREE.BoxGeometry(0.28, 0.54, 0.32);
  shinGeo.translate(0, -0.22, 0.06);

  const footGeo = new THREE.BoxGeometry(0.38, 0.18, 0.54);
  footGeo.translate(0, -0.09, -0.1);

  const toeClawGeo = new THREE.BoxGeometry(0.08, 0.12, 0.18);

  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.32, 0.92, 0.06);
  const leftThigh = new THREE.Mesh(thighGeo, bodyMat);
  leftThigh.castShadow = true;
  leftLeg.add(leftThigh);

  const leftShin = new THREE.Mesh(shinGeo, accentMat);
  leftShin.position.set(0, -0.45, 0);
  leftShin.castShadow = true;
  leftLeg.add(leftShin);

  const leftFoot = new THREE.Mesh(footGeo, accentMat);
  leftFoot.position.set(0, -0.76, 0.06);
  leftFoot.castShadow = true;
  leftLeg.add(leftFoot);

  // 3 Toe Claws on Foot
  [-0.1, 0, 0.1].forEach((tx) => {
    const toe = new THREE.Mesh(toeClawGeo, clawMat);
    toe.position.set(tx, -0.84, -0.28);
    leftLeg.add(toe);
  });
  rootGroup.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.32, 0.92, 0.06);
  const rightThigh = new THREE.Mesh(thighGeo, bodyMat);
  rightThigh.castShadow = true;
  rightLeg.add(rightThigh);

  const rightShin = new THREE.Mesh(shinGeo, accentMat);
  rightShin.position.set(0, -0.45, 0);
  rightShin.castShadow = true;
  rightLeg.add(rightShin);

  const rightFoot = new THREE.Mesh(footGeo, accentMat);
  rightFoot.position.set(0, -0.76, 0.06);
  rightFoot.castShadow = true;
  rightLeg.add(rightFoot);

  [-0.1, 0, 0.1].forEach((tx) => {
    const toe = new THREE.Mesh(toeClawGeo, clawMat);
    toe.position.set(tx, -0.84, -0.28);
    rightLeg.add(toe);
  });
  rootGroup.add(rightLeg);

  // 7. Dynamic Articulated Dinosaur Tail (5 Segments + Spiked Club)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.98, 0.32);

  // Segment 1 (Base)
  const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.6), bodyMat);
  t1.position.set(0, 0, 0.28);
  t1.castShadow = true;
  tailGroup.add(t1);

  // Segment 2
  const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.65), bodyMat);
  t2.position.set(0, 0.06, 0.82);
  t2.castShadow = true;
  tailGroup.add(t2);

  // Segment 3
  const t3 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.72), bodyMat);
  t3.position.set(0, 0.14, 1.42);
  t3.castShadow = true;
  tailGroup.add(t3);

  // Segment 4
  const t4 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.78), accentMat);
  t4.position.set(0, 0.22, 2.08);
  t4.castShadow = true;
  tailGroup.add(t4);

  // Segment 5 (Tail Tip / Spiked Club)
  const t5 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.84), accentMat);
  t5.position.set(0, 0.3, 2.78);
  t5.castShadow = true;
  tailGroup.add(t5);

  // Spiked Tail Club / Fin
  const club = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), accentMat);
  club.position.set(0, 0.34, 3.16);
  club.rotation.set(0.78, 0.78, 0);
  club.castShadow = true;
  tailGroup.add(club);

  // Tail Spine Ridge Plates
  for (let s = 0; s < 4; s++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.26), accentMat);
    sp.position.set(0, 0.18 + s * 0.08, 0.45 + s * 0.68);
    tailGroup.add(sp);
  }

  rootGroup.add(tailGroup);

  // 8. Slap Glove for Mega Slap Windup
  const gloveGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0xff0044,
    emissive: 0xaa0022,
    emissiveIntensity: 0.8,
    roughness: 0.3,
    flatShading: true,
  });
  const megaSlapGlove = new THREE.Mesh(gloveGeo, gloveMat);
  megaSlapGlove.visible = false;
  rootGroup.add(megaSlapGlove);

  return {
    rootGroup,
    head: headGroup,
    torso,
    underbelly,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    tail: tailGroup,
    hatGroup,
    megaSlapGlove,
    shadow,
    materials: {
      bodyMat,
      bellyMat,
      accentMat,
      teethMat,
      clawMat,
      eyeBlackMat,
      eyeWhiteMat,
      glowMat,
    },
  };
}

/**
 * Builds stylish dinosaur headwear tailored for the dinosaur skull anatomy
 */
export function buildDinoHeadwear(hatGroup: THREE.Group, hatType: string, isRaptor: boolean = false): void {
  while (hatGroup.children.length > 0) {
    hatGroup.remove(hatGroup.children[0]);
  }

  if (hatType === 'cap') {
    // Backward or Forward Dinosaur Party Cap
    const capMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, flatShading: true });
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.32, 0.82), capMat);
    crown.position.set(0, 0.42, 0.04);
    hatGroup.add(crown);

    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.08, 0.48), capMat);
    brim.position.set(0, 0.34, -0.48);
    hatGroup.add(brim);
  } else if (hatType === 'crown') {
    // Stepped Golden King Crown with Red Rubies
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.85,
      flatShading: true,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.2, 0.84), crownMat);
    base.position.set(0, 0.48, 0);
    hatGroup.add(base);

    const rubyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, flatShading: true });
    const ptGeo = new THREE.BoxGeometry(0.18, 0.3, 0.18);
    const rubyGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);

    const coords = [
      [-0.34, -0.34],
      [0.34, -0.34],
      [-0.34, 0.34],
      [0.34, 0.34],
    ];
    coords.forEach(([x, z]) => {
      const pt = new THREE.Mesh(ptGeo, crownMat);
      pt.position.set(x, 0.68, z);
      hatGroup.add(pt);

      const ruby = new THREE.Mesh(rubyGeo, rubyMat);
      ruby.position.set(x, 0.68, z + (z > 0 ? 0.09 : -0.09));
      hatGroup.add(ruby);
    });
  } else if (hatType === 'headband') {
    // Voxel Ninja Headband with Trailing Tails in Wind
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, flatShading: true });
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.18, 0.84), bandMat);
    band.position.set(0, 0.28, 0);
    hatGroup.add(band);

    const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.6), bandMat);
    tail1.position.set(-0.14, 0.22, 0.65);
    tail1.rotation.x = -0.22;
    hatGroup.add(tail1);

    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.6), bandMat);
    tail2.position.set(0.14, 0.22, 0.65);
    tail2.rotation.y = -0.28;
    hatGroup.add(tail2);
  } else if (isRaptor) {
    // Raptor Crest
    const crestMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, flatShading: true });
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.36, 0.64), crestMat);
    crest.position.set(0, 0.52, 0.12);
    crest.rotation.x = -0.3;
    hatGroup.add(crest);
  }
}
