/**
 * 7-Day Consecutive Daily Login Bonus System
 * Classic App Store mobile retention loop
 */

export interface DailyRewardTier {
  day: number;
  title: string;
  coins: number;
  badge?: string;
  description: string;
  iconName: 'coins' | 'gem' | 'flame' | 'crown' | 'trophy';
}

export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  { day: 1, title: 'Day 1 Starter', coins: 250, description: '+250 Coins to kick off the market run!', iconName: 'coins' },
  { day: 2, title: 'Day 2 Sprinter', coins: 500, description: '+500 Coins for speedy upgrades!', iconName: 'coins' },
  { day: 3, title: 'Day 3 Chaos Charge', coins: 750, description: '+750 Coins + Instant Chaos surge!', iconName: 'flame' },
  { day: 4, title: 'Day 4 Street Brawler', coins: 1000, description: '+1,000 Coins wallet expansion!', iconName: 'gem' },
  { day: 5, title: 'Day 5 Slap Master', coins: 1500, description: '+1,500 Coins high-roller bonus!', iconName: 'trophy' },
  { day: 6, title: 'Day 6 Market Tycoon', coins: 2500, description: '+2,500 Coins ultimate boost!', iconName: 'coins' },
  { day: 7, title: 'Day 7 Golden Legend', coins: 5000, badge: '👑 GOLDEN RUNNER', description: '+5,000 Coins & Golden Crown Prestige!', iconName: 'crown' },
];

const STORAGE_KEY = 'slap_run_daily_rewards_v2';

export interface DailyRewardState {
  currentDay: number; // 1 to 7
  lastClaimDateString: string | null; // e.g. "2026-10-19"
  totalClaimedCount: number;
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadDailyRewardState(): DailyRewardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { currentDay: 1, lastClaimDateString: null, totalClaimedCount: 0 };
    }
    const state: DailyRewardState = JSON.parse(raw);
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    // If streak was broken (missed more than 1 day), reset streak back to Day 1
    if (state.lastClaimDateString && state.lastClaimDateString !== today && state.lastClaimDateString !== yesterday) {
      return {
        currentDay: 1,
        lastClaimDateString: state.lastClaimDateString,
        totalClaimedCount: state.totalClaimedCount,
      };
    }
    return state;
  } catch {
    return { currentDay: 1, lastClaimDateString: null, totalClaimedCount: 0 };
  }
}

export function isDailyRewardAvailable(): boolean {
  const state = loadDailyRewardState();
  const today = getTodayDateString();
  return state.lastClaimDateString !== today;
}

export function claimDailyReward(): { reward: DailyRewardTier; updatedState: DailyRewardState; bonusCoins: number } {
  const state = loadDailyRewardState();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  let nextDay = state.currentDay;
  if (state.lastClaimDateString === yesterday) {
    // Continued streak from yesterday
    nextDay = (state.currentDay % 7) + 1;
  } else if (state.lastClaimDateString === today) {
    // Already claimed today
    const currentTier = DAILY_REWARD_TIERS[Math.max(0, state.currentDay - 1)] || DAILY_REWARD_TIERS[0];
    return { reward: currentTier, updatedState: state, bonusCoins: 0 };
  } else {
    // First time ever or broke streak
    nextDay = 1;
  }

  const reward = DAILY_REWARD_TIERS[nextDay - 1] || DAILY_REWARD_TIERS[0];
  const updatedState: DailyRewardState = {
    currentDay: nextDay,
    lastClaimDateString: today,
    totalClaimedCount: state.totalClaimedCount + 1,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    // Add to total coins
    let coins = 0;
    const c = localStorage.getItem('slap_run_total_coins');
    if (c) coins = parseInt(c, 10) || 0;
    coins += reward.coins;
    localStorage.setItem('slap_run_total_coins', String(coins));
  } catch {}

  return { reward, updatedState, bonusCoins: reward.coins };
}
