import { GameStats } from './types.ts';

export type AchievementCategory = 'slaps' | 'combos' | 'distance' | 'wealth' | 'levels' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  reward: number; // Coins
  icon: string; // Emoji / Icon identifier
  targetValue: number;
  currentValue?: number;
  isUnlocked?: boolean;
  isClaimed?: boolean;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  // --- SLAPS ---
  {
    id: 'first_slap',
    title: 'First Strike',
    description: 'Slap your very first pedestrian in the street',
    category: 'slaps',
    reward: 50,
    icon: '👋',
    targetValue: 1,
  },
  {
    id: 'slaps_50',
    title: 'Street Brawler',
    description: 'Slap 50 pedestrians total across your career',
    category: 'slaps',
    reward: 150,
    icon: '🥊',
    targetValue: 50,
  },
  {
    id: 'slaps_200',
    title: 'Slap Machine',
    description: 'Land 200 slaps across runs',
    category: 'slaps',
    reward: 400,
    icon: '💥',
    targetValue: 200,
  },
  {
    id: 'slaps_500',
    title: 'Hand of Justice',
    description: 'Deliver 500 slaps to market bystanders',
    category: 'slaps',
    reward: 800,
    icon: '⚡',
    targetValue: 500,
  },
  {
    id: 'slaps_1500',
    title: 'Supreme Slap God',
    description: 'Achieve legendary status with 1,500 total slaps',
    category: 'slaps',
    reward: 2000,
    icon: '👑',
    targetValue: 1500,
  },

  // --- COMBOS & CHAOS ---
  {
    id: 'combo_5',
    title: 'Combo Cadet',
    description: 'Reach a 5x slap combo in a single run',
    category: 'combos',
    reward: 100,
    icon: '🔥',
    targetValue: 5,
  },
  {
    id: 'combo_15',
    title: 'Combo King',
    description: 'Reach a blistering 15x slap combo streak',
    category: 'combos',
    reward: 300,
    icon: '🚀',
    targetValue: 15,
  },
  {
    id: 'combo_25',
    title: 'Untouchable Rhythm',
    description: 'Achieve an astonishing 25x slap combo streak',
    category: 'combos',
    reward: 600,
    icon: '🌪️',
    targetValue: 25,
  },
  {
    id: 'fever_trigger',
    title: 'Fever Spark',
    description: 'Charge the Chaos Gauge to 100% and enter Fever Run',
    category: 'combos',
    reward: 150,
    icon: '🌟',
    targetValue: 1,
  },
  {
    id: 'chaos_16x',
    title: 'Chaos Overlord',
    description: 'Reach the maximum 16x score multiplier',
    category: 'combos',
    reward: 500,
    icon: '🌀',
    targetValue: 16,
  },

  // --- DISTANCE & EVASION ---
  {
    id: 'distance_100',
    title: 'Brisk 100m',
    description: 'Run 100 meters in a single sprint',
    category: 'distance',
    reward: 50,
    icon: '👟',
    targetValue: 100,
  },
  {
    id: 'distance_500',
    title: 'Halfway to Kilo',
    description: 'Reach 500 meters in a single run',
    category: 'distance',
    reward: 200,
    icon: '🏃',
    targetValue: 500,
  },
  {
    id: 'distance_1500',
    title: 'Marathon Runner',
    description: 'Survive and sprint 1,500 meters down the boulevard',
    category: 'distance',
    reward: 600,
    icon: '🏅',
    targetValue: 1500,
  },
  {
    id: 'chaser_escaped_3',
    title: 'Ghost Runner',
    description: 'Successfully shake off chasing police/mob 3 times',
    category: 'distance',
    reward: 250,
    icon: '🚨',
    targetValue: 3,
  },
  {
    id: 'near_miss_10',
    title: 'Close Call Master',
    description: 'Perform 10 razor-thin near-miss obstacle dodges',
    category: 'distance',
    reward: 300,
    icon: '🎯',
    targetValue: 10,
  },
  {
    id: 'boost_ramps_10',
    title: 'Acrobat',
    description: 'Launch off 10 boost ramps into the air',
    category: 'distance',
    reward: 250,
    icon: '🛫',
    targetValue: 10,
  },

  // --- WEALTH & COLLECTING ---
  {
    id: 'coins_50',
    title: 'Pocket Change',
    description: 'Gather 50 gold coins total',
    category: 'wealth',
    reward: 100,
    icon: '🪙',
    targetValue: 50,
  },
  {
    id: 'coins_500',
    title: 'Treasure Hunter',
    description: 'Collect 500 lifetime gold coins',
    category: 'wealth',
    reward: 350,
    icon: '💰',
    targetValue: 500,
  },
  {
    id: 'coins_2500',
    title: 'Market Mogul',
    description: 'Amass 2,500 lifetime gold coins',
    category: 'wealth',
    reward: 1000,
    icon: '🏦',
    targetValue: 2500,
  },
  {
    id: 'unlock_skin_1',
    title: 'Fresh Threads',
    description: 'Unlock any character outfit from the shop',
    category: 'wealth',
    reward: 200,
    icon: '👕',
    targetValue: 2,
  },
  {
    id: 'unlock_all_skins',
    title: 'Fashion Icon',
    description: 'Unlock all 4 character skins in the wardrobe',
    category: 'wealth',
    reward: 1200,
    icon: '✨',
    targetValue: 4,
  },

  // --- LEVELS & WORLDS ---
  {
    id: 'level_5',
    title: 'Level 5 Apprentice',
    description: 'Conquer Level 5 in Stage Mode',
    category: 'levels',
    reward: 150,
    icon: '⭐',
    targetValue: 5,
  },
  {
    id: 'level_10',
    title: 'Decade Dasher',
    description: 'Complete Level 10 and reach the Adept tier',
    category: 'levels',
    reward: 300,
    icon: '🌟',
    targetValue: 10,
  },
  {
    id: 'level_25',
    title: 'Quarter Century',
    description: 'Survive and complete Level 25',
    category: 'levels',
    reward: 500,
    icon: '🏆',
    targetValue: 25,
  },
  {
    id: 'level_50',
    title: 'Halfway Hero',
    description: 'Reach and clear Level 50!',
    category: 'levels',
    reward: 1000,
    icon: '🎖️',
    targetValue: 50,
  },
  {
    id: 'level_100',
    title: 'Centurion Legend',
    description: 'Conquer Level 100 and achieve immortality!',
    category: 'levels',
    reward: 3000,
    icon: '👑',
    targetValue: 100,
  },
  {
    id: 'stars_30',
    title: 'Triple-Star Prodigy',
    description: 'Earn 30 total stars across levels',
    category: 'levels',
    reward: 500,
    icon: '✨',
    targetValue: 30,
  },
  {
    id: 'maps_all_6',
    title: 'Globe Trotter',
    description: 'Sprint through all 6 unique 3D biomes',
    category: 'special',
    reward: 600,
    icon: '🗺️',
    targetValue: 6,
  },
];

export interface AchievementStorage {
  unlocked: { [id: string]: number }; // timestamp
  claimed: { [id: string]: boolean };
  cumulative: {
    totalSlaps: number;
    totalRamps: number;
    totalNearMisses: number;
    totalEscaped: number;
    mapsPlayed: string[];
  };
}

export function loadAchievementStorage(): AchievementStorage {
  try {
    const raw = localStorage.getItem('slap_run_achievements');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        unlocked: parsed.unlocked || {},
        claimed: parsed.claimed || {},
        cumulative: {
          totalSlaps: parsed.cumulative?.totalSlaps || 0,
          totalRamps: parsed.cumulative?.totalRamps || 0,
          totalNearMisses: parsed.cumulative?.totalNearMisses || 0,
          totalEscaped: parsed.cumulative?.totalEscaped || 0,
          mapsPlayed: parsed.cumulative?.mapsPlayed || ['market'],
        },
      };
    }
  } catch {}
  return {
    unlocked: {},
    claimed: {},
    cumulative: {
      totalSlaps: 0,
      totalRamps: 0,
      totalNearMisses: 0,
      totalEscaped: 0,
      mapsPlayed: ['market'],
    },
  };
}

export function saveAchievementStorage(data: AchievementStorage): void {
  try {
    localStorage.setItem('slap_run_achievements', JSON.stringify(data));
  } catch {}
}

/**
 * Checks all achievements against current stats and cumulative counters.
 * Returns an array of newly unlocked achievements to trigger celebratory UI toasts!
 */
export function evaluateAchievements(
  currentStats: GameStats,
  extra: {
    unlockedLevel: number;
    totalStars: number;
    unlockedSkinsCount: number;
    currentMapId: string;
    rampHit?: boolean;
    nearMissHit?: boolean;
    escapedHit?: boolean;
  }
): Achievement[] {
  const store = loadAchievementStorage();
  const newlyUnlocked: Achievement[] = [];

  // Update cumulative counters
  if (extra.currentMapId && !store.cumulative.mapsPlayed.includes(extra.currentMapId)) {
    store.cumulative.mapsPlayed.push(extra.currentMapId);
  }
  if (extra.rampHit) store.cumulative.totalRamps++;
  if (extra.nearMissHit) store.cumulative.totalNearMisses++;
  if (extra.escapedHit) store.cumulative.totalEscaped++;
  store.cumulative.totalSlaps = Math.max(store.cumulative.totalSlaps, currentStats.slapsCount);

  for (const ach of ACHIEVEMENTS_LIST) {
    if (store.unlocked[ach.id]) continue; // already unlocked

    let val = 0;
    switch (ach.id) {
      case 'first_slap':
        val = currentStats.slapsCount;
        break;
      case 'slaps_50':
      case 'slaps_200':
      case 'slaps_500':
      case 'slaps_1500':
        val = store.cumulative.totalSlaps;
        break;
      case 'combo_5':
      case 'combo_15':
      case 'combo_25':
        val = currentStats.maxCombo;
        break;
      case 'fever_trigger':
        val = currentStats.feverActive ? 1 : 0;
        break;
      case 'chaos_16x':
        val = currentStats.chaosMultiplier;
        break;
      case 'distance_100':
      case 'distance_500':
      case 'distance_1500':
        val = currentStats.distanceRun;
        break;
      case 'chaser_escaped_3':
        val = store.cumulative.totalEscaped;
        break;
      case 'near_miss_10':
        val = store.cumulative.totalNearMisses;
        break;
      case 'boost_ramps_10':
        val = store.cumulative.totalRamps;
        break;
      case 'coins_50':
      case 'coins_500':
      case 'coins_2500':
        val = currentStats.totalCoinsCollected;
        break;
      case 'unlock_skin_1':
      case 'unlock_all_skins':
        val = extra.unlockedSkinsCount;
        break;
      case 'level_5':
      case 'level_10':
      case 'level_25':
      case 'level_50':
      case 'level_100':
        val = extra.unlockedLevel;
        break;
      case 'stars_30':
        val = extra.totalStars;
        break;
      case 'maps_all_6':
        val = store.cumulative.mapsPlayed.length;
        break;
    }

    if (val >= ach.targetValue) {
      store.unlocked[ach.id] = Date.now();
      newlyUnlocked.push(ach);
    }
  }

  saveAchievementStorage(store);
  return newlyUnlocked;
}
