export interface DailyRewardTier {
  day: number;
  coins: number;
  label: string;
  isSpecial?: boolean;
}

export interface DailyRewardState {
  currentDay: number;
  currentStreak: number;
  lastClaimDate: string | null;
  claimedDays: number[];
}

export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  { day: 1, coins: 50, label: 'Beach Pebble Egg' },
  { day: 2, coins: 100, label: 'Amber Shell Egg' },
  { day: 3, coins: 150, label: 'Coral Nest Egg' },
  { day: 4, coins: 200, label: 'Primal Claw Egg' },
  { day: 5, coins: 300, label: 'Volcano Core Egg', isSpecial: true },
  { day: 6, coins: 450, label: 'Electric Raptor Egg', isSpecial: true },
  { day: 7, coins: 800, label: 'GOLDEN T-REX NEST', isSpecial: true },
];

const STORAGE_KEY = 'slap_run_daily_rewards';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function loadDailyRewardState(): DailyRewardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const streak = parsed.currentStreak || parsed.currentDay || 1;
      return {
        currentDay: streak,
        currentStreak: streak,
        lastClaimDate: parsed.lastClaimDate || null,
        claimedDays: parsed.claimedDays || [],
      };
    }
  } catch {}
  return {
    currentDay: 1,
    currentStreak: 1,
    lastClaimDate: null,
    claimedDays: [],
  };
}

export function isDailyRewardAvailable(): boolean {
  const state = loadDailyRewardState();
  const today = getTodayKey();
  return state.lastClaimDate !== today;
}

export function claimDailyReward(): {
  updatedState: DailyRewardState;
  reward: DailyRewardTier;
  bonusCoins: number;
} {
  const state = loadDailyRewardState();
  const today = getTodayKey();

  let streak = state.currentStreak || 1;
  if (state.lastClaimDate) {
    const lastDate = new Date(state.lastClaimDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      streak = (streak % 7) + 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }

  const tierIndex = (streak - 1) % DAILY_REWARD_TIERS.length;
  const reward = DAILY_REWARD_TIERS[tierIndex];

  const updatedState: DailyRewardState = {
    currentDay: streak,
    currentStreak: streak,
    lastClaimDate: today,
    claimedDays: [...(streak === 1 ? [] : state.claimedDays), streak],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
  } catch {}

  return {
    updatedState,
    reward,
    bonusCoins: reward.coins,
  };
}
