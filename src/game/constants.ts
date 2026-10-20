import { CharacterSkin, BystanderType, LeaderboardEntry } from './types.ts';

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: 'speedy_dash',
    name: 'Emerald Dash',
    tagline: 'Athletic runner in crisp mint & white streetwear',
    bodyColor: '#F4C29E',
    shirtColor: '#10B981',
    pantsColor: '#1E293B',
    hat: 'cap',
    speedBonus: 0,
    cost: 0,
  },
  {
    id: 'market_ninja',
    name: 'White Phantom',
    tagline: 'Crisp white techwear parkour athlete with emerald band',
    bodyColor: '#E6A885',
    shirtColor: '#FFFFFF',
    pantsColor: '#0F172A',
    hat: 'headband',
    speedBonus: 0.1,
    cost: 150,
  },
  {
    id: 'golden_champ',
    name: 'Golden Champ',
    tagline: 'Championship gold & crisp white tracksuit with crown',
    bodyColor: '#BA8063',
    shirtColor: '#F59E0B',
    pantsColor: '#FFFFFF',
    hat: 'crown',
    speedBonus: 0.15,
    cost: 350,
  },
  {
    id: 'cyber_boxer',
    name: 'Cyber Brawler',
    tagline: 'High-voltage electric violet & neon cyan street boxer',
    bodyColor: '#A3684B',
    shirtColor: '#8B5CF6',
    pantsColor: '#06B6D4',
    hat: 'headband',
    speedBonus: 0.2,
    cost: 500,
  },
  {
    id: 'retro_runner',
    name: 'Pixel Hero',
    tagline: 'Radical 80s arcade legend in radiant synthwave colors',
    bodyColor: '#F8C8B8',
    shirtColor: '#EC4899',
    pantsColor: '#3B82F6',
    hat: 'cap',
    speedBonus: 0.22,
    cost: 750,
  },
  {
    id: 'shadow_phantom',
    name: 'Midnight Shinobi',
    tagline: 'Stealth shadow acrobat with obsidian hood and crimson sash',
    bodyColor: '#DE9C78',
    shirtColor: '#0F172A',
    pantsColor: '#181A24',
    hat: 'headband',
    speedBonus: 0.25,
    cost: 1000,
  },
];

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'KAYIN_SLAPPER', score: 38400, maxCombo: 14, date: 'Today', skinId: 'golden_champ' },
  { id: '2', name: 'YANGON_RUNNER', score: 29500, maxCombo: 11, date: 'Today', skinId: 'market_ninja' },
  { id: '3', name: 'BAZAAR_CHAMP', score: 22800, maxCombo: 9, date: 'Yesterday', skinId: 'speedy_dash' },
  { id: '4', name: 'TURBO_DASH', score: 17200, maxCombo: 8, date: '2d ago', skinId: 'speedy_dash' },
  { id: '5', name: 'STREET_VIPER', score: 12400, maxCombo: 6, date: '3d ago', skinId: 'market_ninja' },
];

export interface BystanderTemplate {
  type: BystanderType;
  name: string;
  points: number;
  bodyColor: string;
  shirtColor: string;
  accessory: 'hat' | 'glasses' | 'phone' | 'fish' | 'fruit';
  shouts: string[];
}

export const BYSTANDER_TEMPLATES: BystanderTemplate[] = [
  {
    type: 'fishmonger',
    name: 'Grumpy Chef',
    points: 150,
    bodyColor: '#F2BE9B',
    shirtColor: '#2D4E68',
    accessory: 'fish',
    shouts: ['MY CATCH!', 'WATCH IT!', 'HEY RUNNER!'],
  },
  {
    type: 'influencer',
    name: 'Selfie Star',
    points: 120,
    bodyColor: '#F8C8B8',
    shirtColor: '#7C3AED',
    accessory: 'phone',
    shouts: ['MY PHONE!', 'SO UNCOOL!', 'UNFOLLOWED!'],
  },
  {
    type: 'bouncer',
    name: 'Big Tony',
    points: 200,
    bodyColor: '#DE9C78',
    shirtColor: '#27272A',
    accessory: 'glasses',
    shouts: ['GET BACK HERE!', 'YOU ARE TOAST!', 'MY SHADES!'],
  },
  {
    type: 'fruitseller',
    name: 'Artisan Baker',
    points: 130,
    bodyColor: '#F3C5A8',
    shirtColor: '#A16207',
    accessory: 'fruit',
    shouts: ['MY CROISSANT!', 'STOP RIGHT THERE!', 'COME BACK!'],
  },
  {
    type: 'salaryman',
    name: 'Office Exec',
    points: 100,
    bodyColor: '#E2A98A',
    shirtColor: '#334155',
    accessory: 'hat',
    shouts: ['MY BRIEFCASE!', 'I AM LATE!', 'STOP!'],
  },
];

export const COMIC_WORDS = ['SLAP!', 'POW!', 'WHACK!', 'BONK!', 'SMACK!', 'BAM!', 'KAPOW!'];

export const ROAD_WIDTH = 280; // Fast 3-lane market road (-140 to 140)
export const ROAD_LANES = [-90, 0, 90]; // 3 cleanly aligned lanes: Left (-90), Center (0), Right (90)
export const SIDEWALK_EDGES = [-140, 140]; // Curb edge hazards
export const SLAP_REACH = 110; // Comfortable reach to slap pedestrians from outer lanes
export const MOB_SAFE_DISTANCE = 45; // Minimum distance before mob catches player
