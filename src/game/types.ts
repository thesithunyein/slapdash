export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface CharacterSkin {
  id: string;
  name: string;
  tagline: string;
  bodyColor: string;
  shirtColor: string;
  pantsColor: string;
  hat: 'cap' | 'headband' | 'crown' | 'none';
  speedBonus: number;
  cost: number;
}

export interface Player {
  x: number; // Lateral position (-140 to 140)
  y: number; // Forward progress (increases continually)
  z: number; // Vertical jump elevation
  vx: number;
  vz: number;
  speed: number;
  baseSpeed: number;
  slapCooldown: number; // frames or ms remaining
  isSlapping: boolean;
  slapHand: 'left' | 'right';
  slapProgress: number; // 0 to 1
  slipTimer: number; // When slipped on banana
  feverTime: number; // Remaining time in Fever mode (ms)
  skin: CharacterSkin;
  runCycle: number;
}

export type BystanderType = 'fishmonger' | 'influencer' | 'bouncer' | 'fruitseller' | 'salaryman';

export interface Bystander {
  id: number;
  x: number;
  y: number;
  type: BystanderType;
  name: string;
  points: number;
  bodyColor: string;
  shirtColor: string;
  accessory: 'hat' | 'glasses' | 'phone' | 'fish' | 'fruit';
  slapped: boolean;
  wobble: number;
  inStrikeRange?: boolean;
  flyingAccessory?: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
  };
}

export interface Chaser {
  id: number;
  x: number;
  y: number;
  speed: number;
  bodyColor: string;
  shirtColor: string;
  angrySteamTimer: number;
  runCycle: number;
  animOffset: number;
}

export type ObstacleType = 'banana' | 'watermelon' | 'crate' | 'cart' | 'barrier' | 'barrel' | 'ramp';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: ObstacleType;
  width: number;
  height: number;
  hit: boolean;
  rotation?: number;
  rollSpeed?: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  maxCombo: number;
  date: string;
  skinId: string;
  isPlayer?: boolean;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  bobPhase: number;
}

export type PowerupType = 'soda' | 'soap';

export interface Powerup {
  id: number;
  x: number;
  y: number;
  type: PowerupType;
  collected: boolean;
  bobPhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape?: 'star' | 'circle' | 'cloud' | 'sparkle' | 'confetti' | 'fruit' | 'splinter';
  rotation?: number;
  vRot?: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  lineWidth: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  scale: number;
  vy?: number;
}

export interface InputState {
  joystick: {
    active: boolean;
    x: number; // -1 to 1
    y: number; // -1 to 1
  };
  keys: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    slap: boolean;
  };
  slapRequested: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  coins: number;
  totalCoinsCollected: number;
  slapsCount: number;
  chaosLevel: number; // 0 to 100
  chaosMultiplier: number; // 1, 2, 4, 8, 16
  feverActive: boolean;
  distanceRun: number;
  comboStreak: number;
  maxCombo: number;
  longestChaseEscape: number;
  mobDistance?: number;
}
