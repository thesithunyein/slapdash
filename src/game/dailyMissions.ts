/**
 * Daily Bounties / Missions System
 * Premium mobile arcade progression loop
 */

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
  iconType: 'slap' | 'run' | 'fever' | 'coin' | 'escape';
}

const STORAGE_KEY = 'slap_run_daily_missions_v2';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function fetchServerDailySchedule(): Promise<{ todayKey: string; resetTimeFormatted: string } | null> {
  try {
    const res = await fetch('/api/daily-schedule');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

export function generateDailyMissions(): DailyMission[] {
  const today = getTodayKey();
  // Deterministic seed based on day
  const seed = today.split('-').reduce((acc, part) => acc * 31 + parseInt(part, 10), 7);

  const missionTemplates = [
    {
      id: `m-slap-${today}`,
      title: 'Market Menace',
      description: 'Slap 30 quirky market bystanders',
      target: 30,
      rewardCoins: 350,
      iconType: 'slap' as const,
    },
    {
      id: `m-dist-${today}`,
      title: 'Supersonic Sprint',
      description: 'Run 500 meters in a single run',
      target: 500,
      rewardCoins: 450,
      iconType: 'run' as const,
    },
    {
      id: `m-fever-${today}`,
      title: 'Fever Overdrive',
      description: 'Activate 16x Fever Run 2 times',
      target: 2,
      rewardCoins: 500,
      iconType: 'fever' as const,
    },
    {
      id: `m-coin-${today}`,
      title: 'Gold Collector',
      description: 'Collect 40 shiny coins in the market',
      target: 40,
      rewardCoins: 300,
      iconType: 'coin' as const,
    },
    {
      id: `m-escape-${today}`,
      title: 'Clean Getaway',
      description: 'Escape the chasing mob 2 times',
      target: 2,
      rewardCoins: 400,
      iconType: 'escape' as const,
    },
  ];

  // Pick 3 pseudo-randomized missions for today
  const shuffled = [...missionTemplates].sort((a, b) => {
    const valA = ((seed * (a.target + 13)) % 100);
    const valB = ((seed * (b.target + 17)) % 100);
    return valA - valB;
  });

  return shuffled.slice(0, 3).map((m) => ({
    ...m,
    current: 0,
    completed: false,
    claimed: false,
  }));
}

export interface StoredDailyMissions {
  date: string;
  missions: DailyMission[];
}

export function loadDailyMissions(): DailyMission[] {
  const today = getTodayKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredDailyMissions = JSON.parse(raw);
      if (parsed.date === today && Array.isArray(parsed.missions) && parsed.missions.length === 3) {
        return parsed.missions;
      }
    }
  } catch {}

  const initial = generateDailyMissions();
  saveDailyMissions(initial);
  return initial;
}

export function saveDailyMissions(missions: DailyMission[]): void {
  try {
    const data: StoredDailyMissions = {
      date: getTodayKey(),
      missions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Updates daily missions based on end-of-run stats.
 * Returns newly completed missions to trigger congratulatory arcade alerts!
 */
export function updateMissionsOnRun(stats: GameStats): DailyMission[] {
  const missions = loadDailyMissions();
  const newlyCompleted: DailyMission[] = [];

  missions.forEach((mission) => {
    if (mission.completed) return;

    if (mission.iconType === 'slap') {
      mission.current = Math.min(mission.target, mission.current + stats.slapsCount);
    } else if (mission.iconType === 'run') {
      // Best single run distance
      mission.current = Math.max(mission.current, Math.min(mission.target, Math.round(stats.distanceRun)));
    } else if (mission.iconType === 'fever') {
      if (stats.feverActive || stats.chaosLevel >= 100) {
        mission.current = Math.min(mission.target, mission.current + 1);
      }
    } else if (mission.iconType === 'coin') {
      mission.current = Math.min(mission.target, mission.current + stats.coins);
    } else if (mission.iconType === 'escape') {
      mission.current = Math.min(mission.target, mission.current + (stats.escapedCount || 0));
    }

    if (mission.current >= mission.target && !mission.completed) {
      mission.completed = true;
      newlyCompleted.push(mission);
    }
  });

  saveDailyMissions(missions);
  return newlyCompleted;
}

export function claimDailyMission(missionId: string): { success: boolean; rewardCoins: number; missions: DailyMission[] } {
  const missions = loadDailyMissions();
  const target = missions.find((m) => m.id === missionId);

  if (!target || !target.completed || target.claimed) {
    return { success: false, rewardCoins: 0, missions };
  }

  target.claimed = true;
  saveDailyMissions(missions);

  // Add coins
  let currentCoins = 0;
  try {
    const raw = localStorage.getItem('slap_run_total_coins');
    if (raw) currentCoins = parseInt(raw, 10) || 0;
    currentCoins += target.rewardCoins;
    localStorage.setItem('slap_run_total_coins', String(currentCoins));
  } catch {}

  return { success: true, rewardCoins: target.rewardCoins, missions };
}

export function getUnclaimedMissionsCount(): number {
  const missions = loadDailyMissions();
  return missions.filter((m) => m.completed && !m.claimed).length;
}
