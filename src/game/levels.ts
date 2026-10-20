import { MapDefinition, GAME_MAPS, getMapById } from './maps.ts';
import { GameStats } from './types.ts';

export type LevelTier = 'Beginner' | 'Adept' | 'Veteran' | 'Master' | 'Grandmaster' | 'Infinity';

export interface LevelDefinition {
  level: number;
  title: string;
  subtitle: string;
  mapId: string;
  targetDistance: number;
  targetSlaps: number;
  targetCoins: number;
  specialObjective?: 'fever' | 'ramps' | 'escaped' | 'combo';
  specialTarget?: number;
  specialDescription?: string;
  coinReward: number;
  tier: LevelTier;
}

// Curated milestone level titles for flavorful thematic progression across 100+ stages
const LEVEL_TITLES: { [lvl: number]: { title: string; subtitle: string } } = {
  1: { title: 'Fresh Sprint', subtitle: 'Warm up your slap hand on the open boulevard' },
  2: { title: 'Sidewalk Swerve', subtitle: 'Target pedestrians on the outer lanes' },
  3: { title: 'Palm Bay Breeze', subtitle: 'Sprint along the sunny tropical coast' },
  4: { title: 'Fruit Crate Hurdles', subtitle: 'Dodge the marketplace produce crates' },
  5: { title: 'Bazaar Brawler', subtitle: 'Build your first 5x slap combo streak' },
  6: { title: 'Coastline Dash', subtitle: 'Navigate the coconut palms and beachside curbs' },
  7: { title: 'Rolling Danger', subtitle: 'Watch out for rolling barrels down the center lane' },
  8: { title: 'Mirage Canyon Entrance', subtitle: 'Enter the dusty terracotta sunset canyon' },
  9: { title: 'Canyon Swerver', subtitle: 'Weave between saguaro cacti and red rock hazards' },
  10: { title: 'Ramp Specialist', subtitle: 'Hit the launch ramps for airborne flight bonus' },
  11: { title: 'Stamina Sprint', subtitle: 'Keep slapping bystanders to replenish your energy' },
  12: { title: 'Desert Sunset Sprint', subtitle: 'Collect gold coins along the canyon curves' },
  13: { title: 'Chaser Alert', subtitle: 'Survive a stumble and outrun the chasing officer' },
  14: { title: 'Double Ramp Launch', subtitle: 'Soar over two market barriers via boost ramps' },
  15: { title: 'Cyber Shibuya Entrance', subtitle: 'Step onto rain-slicked glowing neon tarmac' },
  16: { title: 'Synthwave Rush', subtitle: 'High-speed navigation through neon billboards' },
  17: { title: 'Hologram Boulevard', subtitle: 'Dodge construction barricades in the cyber rain' },
  18: { title: 'Mega Slap Momentum', subtitle: 'Unleash devastating slaps in quick succession' },
  19: { title: 'Turbo Soda Dash', subtitle: 'Grab powerups to supercharge your chaos gauge' },
  20: { title: 'Fever Awakening', subtitle: 'Trigger the legendary 16x Fever Run sprint' },
  21: { title: 'Adept Ascendant', subtitle: 'Enter the Adept tier of high-velocity runners' },
  22: { title: 'Neon Highway Drift', subtitle: 'Glide between lanes with zero lane penalties' },
  23: { title: 'Canyon Ramp Flight', subtitle: 'Soar across sunset chasms on boosted ramps' },
  24: { title: 'Tropical High Tide', subtitle: 'High-density bystander gauntlet on the coast' },
  25: { title: 'Frosty Alps Gate', subtitle: 'Enter the sub-zero snowbound alpine pass' },
  26: { title: 'Sub-Zero Drift', subtitle: 'Maintain traction along the frosted white curbs' },
  27: { title: 'Pine Needle Slalom', subtitle: 'Weave past snow-draped evergreens and crates' },
  28: { title: 'Snowdrift Sprint', subtitle: 'Collect frozen coins in rapid succession' },
  29: { title: 'Blizzard Breaker', subtitle: 'Keep stamina topped off amidst cold headwinds' },
  30: { title: 'Glacial Ramp Launch', subtitle: 'Catapult high into the crisp alpine sky' },
  31: { title: 'Alpine Chaser Evasion', subtitle: 'Leave the enraged patrol in your snowy wake' },
  32: { title: 'Cybernetic Precision', subtitle: 'Clean 3-lane maneuvers on the neon bridge' },
  33: { title: 'Sunset Dust Storm', subtitle: 'Navigate low visibility in the red canyon' },
  34: { title: 'Bazaar Blitz', subtitle: 'Triple slap combo across the market fruit stalls' },
  35: { title: 'Sacred Lantern Way', subtitle: 'Enter the peaceful moonlit cherry blossom temple' },
  36: { title: 'Sakura Petal Sprint', subtitle: 'Dash under falling pink petals and torii arches' },
  37: { title: 'Crimson Lantern Run', subtitle: 'Follow the lantern glow down narrow sidewalks' },
  38: { title: 'Bouncing Barrel Barrage', subtitle: 'Dodge multiple rolling kegs in quick rhythm' },
  39: { title: 'Temple Guardian Chase', subtitle: 'Clean escape from the temple bouncers' },
  40: { title: 'Veteran Awakening', subtitle: 'Prove your mastery across all six game worlds' },
  50: { title: 'Golden Half-Century', subtitle: '50 stages conquered! You are a true bazaar legend' },
  60: { title: 'Chaos Master', subtitle: 'Maintain uninterrupted 16x fever velocity' },
  70: { title: 'Speed of Sound', subtitle: 'Run at top velocity through dense obstacles' },
  80: { title: 'Grandmaster Trial', subtitle: 'Only the top 1% of runners survive this gauntlet' },
  90: { title: 'Apex Predator', subtitle: 'The chasers are terrified of your slap prowess' },
  99: { title: 'The Century Threshold', subtitle: 'One final trial before absolute perfection' },
  100: { title: 'Centurion Slap God', subtitle: 'The supreme milestone: 100 stages of perfection!' },
};

/**
 * Returns the tier name for a given level number
 */
export function getLevelTier(level: number): LevelTier {
  if (level <= 20) return 'Beginner';
  if (level <= 40) return 'Adept';
  if (level <= 60) return 'Veteran';
  if (level <= 80) return 'Master';
  if (level <= 100) return 'Grandmaster';
  return 'Infinity';
}

/**
 * Returns which map is assigned to a specific level
 */
export function getMapForLevel(level: number): MapDefinition {
  const mapIds = ['market', 'tropical_coast', 'sunset_desert', 'neon_night', 'winter_peak', 'golden_temple'];
  const mapIndex = (level - 1) % mapIds.length;
  return getMapById(mapIds[mapIndex]);
}

/**
 * Generates or retrieves the complete LevelDefinition for any level 1..100+
 */
export function getLevel(levelNumber: number): LevelDefinition {
  const level = Math.max(1, Math.floor(levelNumber));
  const tier = getLevelTier(level);
  const map = getMapForLevel(level);

  // Scaled Targets
  // Level 1: 120m, Level 10: 450m, Level 50: 1600m, Level 100: 3200m
  const baseDist = 100 + (level - 1) * 32 + Math.floor(Math.pow(level, 1.25) * 4);
  // Target Slaps: Level 1 = 3, Level 10 = 10, Level 50 = 35, Level 100 = 70
  const baseSlaps = Math.max(3, Math.min(85, Math.floor(2 + level * 0.72)));
  // Target Coins: Level 1 = 5, Level 10 = 15, Level 50 = 45, Level 100 = 90
  const baseCoins = Math.max(5, Math.min(100, Math.floor(4 + level * 0.85)));

  // Milestone or Procedural Title
  let title = `Level ${level}`;
  let subtitle = `Stage ${level} challenge in ${map.name}`;
  if (LEVEL_TITLES[level]) {
    title = `${level}. ${LEVEL_TITLES[level].title}`;
    subtitle = LEVEL_TITLES[level].subtitle;
  } else if (level > 100) {
    title = `Ascension Lv. ${level}`;
    subtitle = `Infinite prestige trial in ${map.name}`;
  } else {
    const prefixes = ['Brisk', 'Turbo', 'Shadow', 'Swerve', 'Blazing', 'Hyper', 'Sonic', 'Zenith'];
    const prefix = prefixes[(level * 3) % prefixes.length];
    title = `${level}. ${prefix} Run`;
    subtitle = `Reach ${baseDist}m & land ${baseSlaps} slaps in ${map.name}`;
  }

  // Special objectives on every 5th level
  let specialObjective: LevelDefinition['specialObjective'] = undefined;
  let specialTarget: number | undefined = undefined;
  let specialDescription: string | undefined = undefined;

  if (level % 10 === 0) {
    specialObjective = 'fever';
    specialTarget = 1;
    specialDescription = 'Trigger Fever Run Mode';
  } else if (level % 5 === 0) {
    specialObjective = 'combo';
    specialTarget = Math.min(25, 4 + Math.floor(level / 8));
    specialDescription = `Reach ${specialTarget}x Slap Combo`;
  } else if (level % 7 === 0) {
    specialObjective = 'ramps';
    specialTarget = Math.min(6, 2 + Math.floor(level / 20));
    specialDescription = `Hit ${specialTarget} Boost Ramps`;
  }

  // Coin rewards: 100 base + 15 per level + bonus for milestones
  let coinReward = 100 + level * 15;
  if (level % 10 === 0) coinReward += 300;
  if (level === 50) coinReward += 1000;
  if (level === 100) coinReward += 2500;

  return {
    level,
    title,
    subtitle,
    mapId: map.id,
    targetDistance: baseDist,
    targetSlaps: baseSlaps,
    targetCoins: baseCoins,
    specialObjective,
    specialTarget,
    specialDescription,
    coinReward,
    tier,
  };
}

/**
 * Calculates 1, 2, or 3 stars based on level completion and performance
 */
export function calculateLevelStars(
  levelDef: LevelDefinition,
  stats: GameStats,
  extra?: { boostJumps?: number }
): { stars: number; cleared: boolean; distanceMet: boolean; slapsMet: boolean; coinsMet: boolean; specialMet: boolean } {
  const distanceMet = stats.distanceRun >= levelDef.targetDistance;
  const slapsMet = stats.slapsCount >= levelDef.targetSlaps;
  const coinsMet = stats.coins >= levelDef.targetCoins;

  let specialMet = true;
  if (levelDef.specialObjective === 'fever') {
    specialMet = stats.feverActive || (stats.chaosLevel >= 100);
  } else if (levelDef.specialObjective === 'combo') {
    specialMet = stats.maxCombo >= (levelDef.specialTarget || 5);
  } else if (levelDef.specialObjective === 'ramps') {
    specialMet = (extra?.boostJumps || 0) >= (levelDef.specialTarget || 2);
  }

  // 1 Star: Meet Distance & Slaps
  // 2 Stars: Also meet Coins
  // 3 Stars: Meet all objectives including Special or high combo
  const cleared = distanceMet && slapsMet;
  let stars = 0;
  if (cleared) {
    stars = 1;
    if (coinsMet) stars++;
    if (specialMet && (stats.maxCombo >= 8 || !levelDef.specialObjective)) {
      if (stars === 2) stars = 3;
    }
  }

  return { stars, cleared, distanceMet, slapsMet, coinsMet, specialMet };
}

export interface LevelProgress {
  unlockedLevel: number;
  levelStars: { [level: number]: number };
  levelScores: { [level: number]: number };
}

export function loadLevelProgress(): LevelProgress {
  try {
    const raw = localStorage.getItem('slap_run_level_progress');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        unlockedLevel: parsed.unlockedLevel || 1,
        levelStars: parsed.levelStars || {},
        levelScores: parsed.levelScores || {},
      };
    }
  } catch {}
  return { unlockedLevel: 1, levelStars: {}, levelScores: {} };
}

export function saveLevelResult(level: number, stars: number, score: number): LevelProgress {
  const current = loadLevelProgress();
  const prevStars = current.levelStars[level] || 0;
  const prevScore = current.levelScores[level] || 0;

  current.levelStars[level] = Math.max(prevStars, stars);
  current.levelScores[level] = Math.max(prevScore, score);

  if (stars > 0 && level >= current.unlockedLevel) {
    current.unlockedLevel = level + 1;
  }

  try {
    localStorage.setItem('slap_run_level_progress', JSON.stringify(current));
  } catch {}

  return current;
}
