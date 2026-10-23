import { GameStats, ObstacleType } from './types.ts';
import { GAME_MAPS } from './maps.ts';

export interface LevelDefinition {
  level: number;
  title: string;
  mapId: string;
  targetDistance: number;
  targetSlaps: number;
  targetCoins: number;
  coinReward: number;
  description: string;
  featuredObstacles: ObstacleType[];
  obstacleThemeName: string;
}

export interface LevelProgress {
  unlockedLevel: number;
  levelStars: Record<number, number>;
  levelScores: Record<number, number>;
}

const STORAGE_KEY = 'slap_run_level_progress';

export function loadLevelProgress(): LevelProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        unlockedLevel: Math.max(1, parsed.unlockedLevel || 1),
        levelStars: parsed.levelStars || {},
        levelScores: parsed.levelScores || {},
      };
    }
  } catch {}
  return {
    unlockedLevel: 1,
    levelStars: {},
    levelScores: {},
  };
}

export function saveLevelResult(level: number, stars: number, score: number): void {
  const current = loadLevelProgress();
  const prevStars = current.levelStars[level] || 0;
  const prevScore = current.levelScores[level] || 0;

  current.levelStars[level] = Math.max(prevStars, stars);
  current.levelScores[level] = Math.max(prevScore, score);

  if (stars > 0 && level >= current.unlockedLevel) {
    current.unlockedLevel = level + 1;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

export function getMapForLevel(level: number): string {
  if (level >= 35) return 'golden_temple';
  if (level >= 25) return 'winter_peak';
  if (level >= 18) return 'neon_night';
  if (level >= 10) return 'sunset_desert';
  if (level >= 5) return 'tropical_coast';
  return 'market';
}

export function getObstaclesForLevel(levelNumber: number, mapIdOverride?: string): {
  obstacles: ObstacleType[];
  themeName: string;
} {
  const lvl = Math.max(1, levelNumber);
  const mapId = mapIdOverride || getMapForLevel(lvl);

  if (mapId === 'market') {
    if (lvl === 1) {
      return {
        obstacles: ['crate', 'barrier', 'ramp'],
        themeName: 'Market Fruit Crates & Barriers',
      };
    } else if (lvl === 2) {
      return {
        obstacles: ['crate', 'watermelon', 'barrier', 'ramp'],
        themeName: 'Melon Displays & Fruit Stacks',
      };
    } else if (lvl === 3) {
      return {
        obstacles: ['cart', 'cafe_table', 'watermelon', 'ramp', 'terminal_ramp'],
        themeName: 'Street Pushcarts & Café Tables',
      };
    } else {
      return {
        obstacles: ['cart', 'cafe_table', 'crate', 'watermelon', 'shifting_block', 'terminal_ramp'],
        themeName: 'Bazaar Grand Prix & Moving Stalls',
      };
    }
  }

  if (mapId === 'tropical_coast') {
    if (lvl <= 6) {
      return {
        obstacles: ['coconut_crate', 'beach_lounger', 'ramp'],
        themeName: 'Tiki Coconut Crates & Sun Loungers',
      };
    } else if (lvl <= 7) {
      return {
        obstacles: ['surf_rack', 'coconut_crate', 'beach_lounger', 'ramp'],
        themeName: 'Upright Surfboard Racks & Beach Stands',
      };
    } else if (lvl <= 8) {
      return {
        obstacles: ['tiki_totem', 'surf_rack', 'beach_lounger', 'terminal_ramp'],
        themeName: 'Carved Tiki Totems & Super Launchers',
      };
    } else {
      return {
        obstacles: ['tiki_totem', 'surf_rack', 'coconut_crate', 'shifting_block', 'terminal_ramp'],
        themeName: 'Totem Sanctuaries & Shifting Cabanas',
      };
    }
  }

  if (mapId === 'sunset_desert') {
    if (lvl <= 11) {
      return {
        obstacles: ['cactus_cluster', 'canyon_mesa', 'ramp'],
        themeName: 'Saguaro Cacti & Sandstone Mesas',
      };
    } else if (lvl <= 13) {
      return {
        obstacles: ['dino_skull', 'cactus_cluster', 'canyon_mesa', 'ramp'],
        themeName: 'Prehistoric Triceratops Skulls',
      };
    } else if (lvl <= 15) {
      return {
        obstacles: ['firewall', 'dino_skull', 'canyon_mesa', 'terminal_ramp'],
        themeName: 'Desert Fire Braziers & Flaming Altars',
      };
    } else {
      return {
        obstacles: ['dino_skull', 'firewall', 'canyon_mesa', 'shifting_block', 'terminal_ramp'],
        themeName: 'Canyon Inferno & Shifting Monoliths',
      };
    }
  }

  if (mapId === 'neon_night') {
    if (lvl <= 20) {
      return {
        obstacles: ['holo_barrier', 'cyber_server', 'ramp'],
        themeName: 'Cyan Laser Forcefields & Server Towers',
      };
    } else if (lvl <= 22) {
      return {
        obstacles: ['drone_hazard', 'holo_barrier', 'cyber_server', 'terminal_ramp'],
        themeName: 'Hovering Surveillance Drones & Cyber Lasers',
      };
    } else {
      return {
        obstacles: ['drone_hazard', 'holo_barrier', 'cyber_server', 'shifting_block', 'terminal_ramp'],
        themeName: 'Maglev Laser Grids & Mainframes',
      };
    }
  }

  if (mapId === 'winter_peak') {
    if (lvl <= 27) {
      return {
        obstacles: ['ice_spikes', 'snow_bale', 'ramp'],
        themeName: 'Crystalline Ice Spikes & Snow Forts',
      };
    } else if (lvl <= 30) {
      return {
        obstacles: ['timber_sled', 'ice_spikes', 'snow_bale', 'terminal_ramp'],
        themeName: 'Alpine Timber Sleds & Glacier Spikes',
      };
    } else {
      return {
        obstacles: ['ice_spikes', 'timber_sled', 'snow_bale', 'shifting_block', 'terminal_ramp'],
        themeName: 'Sub-Zero Glacial Boulders & Husky Sleds',
      };
    }
  }

  // Golden Temple (Levels 35+)
  if (lvl <= 37) {
    return {
      obstacles: ['stone_lantern', 'zen_barrier', 'ramp'],
      themeName: 'Sacred Stone Pagodas & Bamboo Lattices',
    };
  } else if (lvl <= 39) {
    return {
      obstacles: ['torii_gate', 'stone_lantern', 'zen_barrier', 'terminal_ramp'],
      themeName: 'Vermilion Torii Arches & Temple Lanterns',
    };
  } else {
    return {
      obstacles: ['cherry_wagon', 'torii_gate', 'stone_lantern', 'zen_barrier', 'shifting_block', 'terminal_ramp'],
      themeName: 'Imperial Blossom Floats & Sacred Torii Arches',
    };
  }
}

export function getLevel(levelNumber: number): LevelDefinition {
  const lvl = Math.max(1, levelNumber);
  const mapId = getMapForLevel(lvl);

  const baseDist = 180 + (lvl - 1) * 65;
  const baseSlaps = 4 + Math.floor((lvl - 1) * 2.2);
  const baseCoins = 8 + Math.floor((lvl - 1) * 3);
  const baseReward = 50 + lvl * 25;

  const titles = [
    'Sandy Shores Debut',
    'Boardwalk Breeze',
    'Tiki Cabana Hustle',
    'Coconut Sprint',
    'Lagoon Splashdown',
    'Coral Reef Run',
    'Surfboard Skim',
    'Riptide Rumble',
    'Seashell Stash',
    'Magma Valley Entrance',
    'Volcanic Steamway',
    'Sulfur Springs Blitz',
    'Amber Canyon Rush',
    'Basalt Boulder Slalom',
    'Molten Peak Escape',
    'Crater Edge Leap',
    'Obsidian Trailway',
    'Neon Metropolis Gateway',
    'Cyber Fern Highway',
    'Holo-Dino Square',
    'Synthwave Speedway',
    'Matrix Canopy Glide',
    'Arcade Rooftop Rampage',
    'Electric Jungle Dash',
    'Glacier Pass Arrival',
    'Frostbite Tundra Sprint',
    'Mammoth Ridge Slide',
    'Frozen Waterfall Jump',
    'Blizzard Boulevard',
    'Ancient Ice Sanctum',
    'Crystal Caverns Drift',
    'Sub-Zero Speedrun',
    'Permafrost Pinnacle',
    'Glacial Summit Sprint',
    'Blossom Sanctum Entrance',
    'Zen Garden Pathway',
    'Floating Lantern Trail',
    'Pagoda Peak Dash',
    'Master Dino Grand Prix',
  ];

  const titleIndex = (lvl - 1) % titles.length;
  const loopCycle = Math.floor((lvl - 1) / titles.length);
  const title = loopCycle > 0 ? `${titles[titleIndex]} (Rank ${loopCycle + 1})` : titles[titleIndex];
  const { obstacles, themeName } = getObstaclesForLevel(lvl, mapId);

  return {
    level: lvl,
    title,
    mapId,
    targetDistance: baseDist,
    targetSlaps: baseSlaps,
    targetCoins: baseCoins,
    coinReward: baseReward,
    description: `Run ${baseDist}m, dodge ${themeName}, deliver ${baseSlaps} tail slaps, and snag ${baseCoins} coins!`,
    featuredObstacles: obstacles,
    obstacleThemeName: themeName,
  };
}

export function calculateLevelStars(
  def: LevelDefinition,
  stats: GameStats,
  _extra?: { boostJumps?: number }
): { cleared: boolean; stars: number } {
  const distOk = stats.distanceRun >= def.targetDistance;
  const slapsOk = stats.slapsCount >= def.targetSlaps;
  const coinsOk = stats.coins >= def.targetCoins;

  if (!distOk) {
    return { cleared: false, stars: 0 };
  }

  let stars = 1; // 1 star for clearing distance
  if (slapsOk) stars++;
  if (coinsOk) stars++;

  return { cleared: true, stars: Math.min(3, stars) };
}
