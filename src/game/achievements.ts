import { GameStats } from './types.ts';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Identifier for 2D/3D vector icon rendering
  unlocked: boolean;
  category: 'slap' | 'survival' | 'speed' | 'secret' | 'milestone';
  rewardCoins: number;
}

const STORAGE_KEY = 'slap_run_achievements';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_slap',
    title: 'First Dino Slap!',
    description: 'Land your first goofy critter tail-slap',
    icon: 'dino',
    unlocked: false,
    category: 'slap',
    rewardCoins: 50,
  },
  {
    id: 'combo_5',
    title: 'Tail Whirlwind',
    description: 'Reach a x5 Slap Combo streak',
    icon: 'wind',
    unlocked: false,
    category: 'slap',
    rewardCoins: 75,
  },
  {
    id: 'combo_15',
    title: 'Unstoppable Dino',
    description: 'Reach a blistering x15 Slap Combo streak',
    icon: 'flame',
    unlocked: false,
    category: 'slap',
    rewardCoins: 150,
  },
  {
    id: 'combo_25',
    title: 'Primal Berserker',
    description: 'Reach an insane x25 Slap Combo streak',
    icon: 'zap',
    unlocked: false,
    category: 'slap',
    rewardCoins: 300,
  },
  {
    id: 'run_100m',
    title: 'Warm-up Lap',
    description: 'Sprint 100 meters down the beach track',
    icon: 'beach',
    unlocked: false,
    category: 'survival',
    rewardCoins: 50,
  },
  {
    id: 'run_500m',
    title: 'Long-Distance Saurian',
    description: 'Sprint 500 meters without getting caught',
    icon: 'runner',
    unlocked: false,
    category: 'survival',
    rewardCoins: 120,
  },
  {
    id: 'run_1000m',
    title: 'Prehistoric Marathon',
    description: 'Survive a 1,000 meter wild sprint',
    icon: 'medal',
    unlocked: false,
    category: 'survival',
    rewardCoins: 250,
  },
  {
    id: 'coins_100',
    title: 'Pocket Change',
    description: 'Collect 100 total shiny gold coins',
    icon: 'coin',
    unlocked: false,
    category: 'milestone',
    rewardCoins: 60,
  },
  {
    id: 'coins_500',
    title: 'Dino Gold Hoarder',
    description: 'Collect 500 total shiny gold coins',
    icon: 'chest',
    unlocked: false,
    category: 'milestone',
    rewardCoins: 180,
  },
  {
    id: 'chaos_max',
    title: 'Primal Roar Frenzy!',
    description: 'Max out the Chaos Meter and unleash Fever Mode',
    icon: 'blast',
    unlocked: false,
    category: 'slap',
    rewardCoins: 100,
  },
  {
    id: 'slaps_50',
    title: 'Party Crasher',
    description: 'Tail-slap 50 prehistoric bystanders in total',
    icon: 'party',
    unlocked: false,
    category: 'slap',
    rewardCoins: 120,
  },
  {
    id: 'slaps_150',
    title: 'Master Tail Whipper',
    description: 'Tail-slap 150 prehistoric bystanders in total',
    icon: 'crown',
    unlocked: false,
    category: 'slap',
    rewardCoins: 250,
  },
  {
    id: 'escape_close',
    title: 'Narrow Escape',
    description: 'Flee with the angry mob less than 50m behind you',
    icon: 'dash',
    unlocked: false,
    category: 'survival',
    rewardCoins: 90,
  },
  {
    id: 'boost_jump_5',
    title: 'Airborne Raptor',
    description: 'Perform 5 jump ramp boosts in a single sprint',
    icon: 'rocket',
    unlocked: false,
    category: 'speed',
    rewardCoins: 100,
  },
  {
    id: 'level_5_clear',
    title: 'Island Hopper',
    description: 'Unlock Level 5 and reach the Lagoon Surf Boardwalk',
    icon: 'palm',
    unlocked: false,
    category: 'milestone',
    rewardCoins: 100,
  },
  {
    id: 'level_10_clear',
    title: 'Volcano Survivor',
    description: 'Unlock Level 10 and cross Rumble Volcano Canyon',
    icon: 'volcano',
    unlocked: false,
    category: 'milestone',
    rewardCoins: 200,
  },
  {
    id: 'stars_15',
    title: 'Star Collector',
    description: 'Earn 15 total golden stage stars',
    icon: 'star',
    unlocked: false,
    category: 'milestone',
    rewardCoins: 150,
  },
  {
    id: 'skins_3',
    title: 'Fashion Wardrobe',
    description: 'Unlock 3 distinct Dino character skins',
    icon: 'palette',
    unlocked: false,
    category: 'milestone',
    rewardCoins: 150,
  },
  {
    id: 'near_miss_10',
    title: 'Close Shave',
    description: 'Graze past 10 obstacles with near-miss reflexes',
    icon: 'target',
    unlocked: false,
    category: 'speed',
    rewardCoins: 120,
  },
  {
    id: 'score_10000',
    title: 'Arcade Legend',
    description: 'Score over 10,000 points in a single run',
    icon: 'trophy',
    unlocked: false,
    category: 'milestone',
    rewardCoins: 200,
  },
  {
    id: 'score_25000',
    title: 'Prehistoric God',
    description: 'Score over 25,000 points in a single run',
    icon: 'crown',
    unlocked: false,
    category: 'milestone',
    rewardCoins: 400,
  },
];

export function loadAchievementStorage(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveAchievementUnlocked(id: string): void {
  const current = loadAchievementStorage();
  current[id] = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

export function evaluateAchievements(
  stats: GameStats,
  extra: {
    unlockedLevel?: number;
    totalStars?: number;
    unlockedSkinsCount?: number;
    currentMapId?: string;
    boostJumps?: number;
    nearMisses?: number;
    escapedCount?: number;
  } = {}
): Achievement[] {
  const stored = loadAchievementStorage();
  const freshlyUnlocked: Achievement[] = [];

  const check = (id: string, condition: boolean) => {
    if (!stored[id] && condition) {
      stored[id] = true;
      saveAchievementUnlocked(id);
      const item = ACHIEVEMENTS_LIST.find((a) => a.id === id);
      if (item) freshlyUnlocked.push({ ...item, unlocked: true });
    }
  };

  check('first_slap', stats.slapsCount >= 1);
  check('combo_5', stats.maxCombo >= 5);
  check('combo_15', stats.maxCombo >= 15);
  check('combo_25', stats.maxCombo >= 25);
  check('run_100m', stats.distanceRun >= 100);
  check('run_500m', stats.distanceRun >= 500);
  check('run_1000m', stats.distanceRun >= 1000);
  check('coins_100', stats.totalCoinsCollected >= 100);
  check('coins_500', stats.totalCoinsCollected >= 500);
  check('chaos_max', stats.feverActive || stats.chaosLevel >= 99);
  check('slaps_50', stats.slapsCount >= 50);
  check('slaps_150', stats.slapsCount >= 150);
  check('escape_close', stats.mobDistance < 50 && stats.distanceRun > 60);
  check('boost_jump_5', (extra.boostJumps || stats.boostJumpsCount || 0) >= 5);
  check('level_5_clear', (extra.unlockedLevel || 1) >= 5);
  check('level_10_clear', (extra.unlockedLevel || 1) >= 10);
  check('stars_15', (extra.totalStars || 0) >= 15);
  check('skins_3', (extra.unlockedSkinsCount || 1) >= 3);
  check('near_miss_10', (extra.nearMisses || stats.nearMissesCount || 0) >= 10);
  check('score_10000', stats.score >= 10000);
  check('score_25000', stats.score >= 25000);

  return freshlyUnlocked;
}
