import { GameStats } from './types.ts';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  iconType: 'slap' | 'run' | 'fever' | 'coin' | 'escape' | 'generic';
}

const STORAGE_KEY = 'slap_run_daily_missions';
const DATE_KEY = 'slap_run_daily_missions_date';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

const INITIAL_MISSIONS: DailyMission[] = [
  {
    id: 'mission_slap_15',
    title: 'Beachside Tail Whip',
    description: 'Land 15 tail slaps on silly resort critters',
    target: 15,
    current: 0,
    rewardCoins: 120,
    completed: false,
    claimed: false,
    iconType: 'slap',
  },
  {
    id: 'mission_run_300',
    title: 'Sunny Shoreline Dash',
    description: 'Sprint 300 meters across the boardwalk',
    target: 300,
    current: 0,
    rewardCoins: 100,
    completed: false,
    claimed: false,
    iconType: 'run',
  },
  {
    id: 'mission_coins_50',
    title: 'Golden Shell Harvest',
    description: 'Collect 50 gold coins along the track',
    target: 50,
    current: 0,
    rewardCoins: 150,
    completed: false,
    claimed: false,
    iconType: 'coin',
  },
  {
    id: 'mission_fever_1',
    title: 'Primal Roar Chaos',
    description: 'Activate Fever Mode with full Chaos Roar meter',
    target: 1,
    current: 0,
    rewardCoins: 200,
    completed: false,
    claimed: false,
    iconType: 'fever',
  },
  {
    id: 'mission_combo_10',
    title: 'Mob Evasion Master',
    description: 'Build a x10 tail-slap combo streak',
    target: 10,
    current: 0,
    rewardCoins: 180,
    completed: false,
    claimed: false,
    iconType: 'escape',
  },
];

export function loadDailyMissions(): DailyMission[] {
  const today = getTodayKey();
  try {
    const savedDate = localStorage.getItem(DATE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (savedDate === today && raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // New day reset
  try {
    localStorage.setItem(DATE_KEY, today);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MISSIONS));
  } catch {}

  return INITIAL_MISSIONS;
}

export function saveDailyMissions(missions: DailyMission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
  } catch {}
}

export function getUnclaimedMissionsCount(): number {
  const missions = loadDailyMissions();
  return missions.filter((m) => m.completed && !m.claimed).length;
}

export function claimDailyMission(missionId: string): {
  success: boolean;
  missions: DailyMission[];
  rewardCoins: number;
} {
  const missions = loadDailyMissions();
  const mission = missions.find((m) => m.id === missionId);

  if (mission && mission.completed && !mission.claimed) {
    mission.claimed = true;
    saveDailyMissions(missions);
    return {
      success: true,
      missions,
      rewardCoins: mission.rewardCoins,
    };
  }

  return {
    success: false,
    missions,
    rewardCoins: 0,
  };
}

export function updateMissionsOnRun(stats: GameStats): DailyMission[] {
  const missions = loadDailyMissions();
  const freshlyCompleted: DailyMission[] = [];

  missions.forEach((m) => {
    if (m.completed) return;

    if (m.id === 'mission_slap_15') {
      m.current = Math.min(m.target, m.current + stats.slapsCount);
    } else if (m.id === 'mission_run_300') {
      m.current = Math.min(m.target, Math.max(m.current, stats.distanceRun));
    } else if (m.id === 'mission_coins_50') {
      m.current = Math.min(m.target, m.current + stats.coins);
    } else if (m.id === 'mission_fever_1') {
      if (stats.feverActive || stats.chaosLevel >= 99) {
        m.current = 1;
      }
    } else if (m.id === 'mission_combo_10') {
      m.current = Math.min(m.target, Math.max(m.current, stats.maxCombo));
    }

    if (m.current >= m.target && !m.completed) {
      m.completed = true;
      freshlyCompleted.push(m);
    }
  });

  saveDailyMissions(missions);
  return freshlyCompleted;
}
