import { CharacterSkin, BystanderType, LeaderboardEntry } from './types.ts';

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: 'rex_red',
    name: 'Red Rex',
    tagline: 'Fiery crimson T-Rex with a furious party tail-whip',
    bodyColor: '#EF4444',
    shirtColor: '#FEF3C7',
    pantsColor: '#B91C1C',
    hat: 'none',
    speedBonus: 0,
    cost: 0,
  },
  {
    id: 'spino_blue',
    name: 'Blue Spino',
    tagline: 'Ocean azure Spinosaurus with super hydro agility',
    bodyColor: '#0284C7',
    shirtColor: '#E0F2FE',
    pantsColor: '#0369A1',
    hat: 'headband',
    speedBonus: 0.1,
    cost: 150,
  },
  {
    id: 'raptor_gold',
    name: 'Sunny Raptor',
    tagline: 'Speedy golden velociraptor with lightning reflexes',
    bodyColor: '#F59E0B',
    shirtColor: '#FFFBEB',
    pantsColor: '#D97706',
    hat: 'crown',
    speedBonus: 0.15,
    cost: 350,
  },
  {
    id: 'dino_green',
    name: 'Emerald Dino',
    tagline: 'Jungle-trotting Partysaur with powerful tail smash',
    bodyColor: '#10B981',
    shirtColor: '#D1FAE5',
    pantsColor: '#047857',
    hat: 'cap',
    speedBonus: 0.2,
    cost: 500,
  },
  {
    id: 'cyber_dino',
    name: 'Cyber Rex',
    tagline: 'High-voltage synthwave brawler with neon purple scales',
    bodyColor: '#8B5CF6',
    shirtColor: '#06B6D4',
    pantsColor: '#4C1D95',
    hat: 'headband',
    speedBonus: 0.22,
    cost: 750,
  },
  {
    id: 'shadow_rex',
    name: 'Midnight Rex',
    tagline: 'Obsidian stealth predator that strikes like a phantom',
    bodyColor: '#1E293B',
    shirtColor: '#F43F5E',
    pantsColor: '#0F172A',
    hat: 'headband',
    speedBonus: 0.25,
    cost: 1000,
  },
  // Backward compatibility aliases
  {
    id: 'speedy_dash',
    name: 'Red Rex Classic',
    tagline: 'Classic crimson runner',
    bodyColor: '#EF4444',
    shirtColor: '#FEF3C7',
    pantsColor: '#B91C1C',
    hat: 'cap',
    speedBonus: 0,
    cost: 0,
  },
  {
    id: 'market_ninja',
    name: 'White Phantom Dino',
    tagline: 'Crisp white techwear dino with emerald band',
    bodyColor: '#E6A885',
    shirtColor: '#FFFFFF',
    pantsColor: '#0F172A',
    hat: 'headband',
    speedBonus: 0.1,
    cost: 150,
  },
  {
    id: 'golden_champ',
    name: 'Golden Rex King',
    tagline: 'Championship gold with crown',
    bodyColor: '#BA8063',
    shirtColor: '#F59E0B',
    pantsColor: '#FFFFFF',
    hat: 'crown',
    speedBonus: 0.15,
    cost: 350,
  },
];

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'REX_CHAMPION', score: 38400, maxCombo: 14, date: 'Today', skinId: 'raptor_gold' },
  { id: '2', name: 'ISLAND_RUNNER', score: 29500, maxCombo: 11, date: 'Today', skinId: 'spino_blue' },
  { id: '3', name: 'DINO_DASH', score: 22800, maxCombo: 9, date: 'Yesterday', skinId: 'rex_red' },
  { id: '4', name: 'TURBO_SAUR', score: 17200, maxCombo: 8, date: '2d ago', skinId: 'rex_red' },
  { id: '5', name: 'BEACH_VIPER', score: 12400, maxCombo: 6, date: '3d ago', skinId: 'dino_green' },
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
    type: 'fruitseller',
    name: 'Melon Stand',
    points: 150,
    bodyColor: '#EF4444',
    shirtColor: '#10B981',
    accessory: 'fruit',
    shouts: ['JUICY!', 'SWEET SPLAT!', 'BONUS!'],
  },
  {
    type: 'fishmonger',
    name: 'Coconut Pinata',
    points: 200,
    bodyColor: '#78350F',
    shirtColor: '#FDE047',
    accessory: 'fish',
    shouts: ['CRUNCH!', 'BONK!', 'POW!'],
  },
  {
    type: 'bouncer',
    name: 'Tiki Totem',
    points: 250,
    bodyColor: '#854D0E',
    shirtColor: '#F97316',
    accessory: 'glasses',
    shouts: ['CRACK!', 'SMASH!', 'BOOM!'],
  },
  {
    type: 'influencer',
    name: 'Party Balloons',
    points: 120,
    bodyColor: '#EC4899',
    shirtColor: '#38BDF8',
    accessory: 'phone',
    shouts: ['POP!', 'CONFETTI!', 'PARTY!'],
  },
  {
    type: 'salaryman',
    name: 'Golden Dino Nest',
    points: 180,
    bodyColor: '#F59E0B',
    shirtColor: '#FEF08A',
    accessory: 'hat',
    shouts: ['SHINY!', 'EGG BONUS!', 'JACKPOT!'],
  },
];

export const COMIC_WORDS = ['TAIL-WHIP!', 'JUICY!', 'CRUNCH!', 'WHACK!', 'BONK!', 'SMASH!', 'ROAR!'];

export const ROAD_WIDTH = 280; // Fast 3-lane market road (-140 to 140)
export const ROAD_LANES = [-90, 0, 90]; // 3 cleanly aligned lanes: Left (-90), Center (0), Right (90)
export const SIDEWALK_EDGES = [-140, 140]; // Curb edge hazards
export const SLAP_REACH = 110; // Comfortable reach to slap pedestrians from outer lanes
export const MOB_SAFE_DISTANCE = 45; // Minimum distance before mob catches player
