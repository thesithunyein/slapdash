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

export const ROAD_WIDTH = 400; // Spacious 3-lane boulevard (-200 to 200)
export const SLAP_REACH = 110; // Extended reach distance for comfortable slap hitbox
export const MOB_SAFE_DISTANCE = 45; // Minimum distance before mob catches player
