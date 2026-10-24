import type { LeaderboardEntry } from './types.ts';
import {
  MAX_BOARD_ENTRIES,
  MAX_LOCAL_RUNS,
  formatRunDate,
  isRenderableEntry,
  sortLeaderboard,
  type ValidRun,
} from './leaderboardCore.ts';

/**
 * Client side of the Hall of Fame.
 *
 * The on-device board is always the source of truth for a saved run. The online
 * board is only used when the build opts in AND the endpoint reports durable
 * storage; otherwise the UI stays local and says so.
 */

export type LeaderboardMode = 'local' | 'online';

export const LOCAL_BOARD_KEY = 'slap_run_hall_of_fame';
export const LEGACY_BOARD_KEY = 'slap_run_leaderboard';
export const LAST_SUBMITTED_RUN_KEY = 'slap_run_last_submitted_run';
export const PLAYER_NAME_KEY = 'slap_run_share_name';
const REQUEST_TIMEOUT_MS = 6000;

export function isLeaderboardApiConfigured(): boolean {
  try {
    return import.meta.env.VITE_LEADERBOARD_API === 'true';
  } catch {
    return false;
  }
}

/** Unique per run, generated once when the run ends and reused on retries. */
export function createRunId(): string {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadPlayerName(): string {
  try {
    const stored = localStorage.getItem(PLAYER_NAME_KEY);
    if (stored) return stored;
  } catch {}
  return 'YOU';
}

interface StoredRun extends LeaderboardEntry {
  addedAt: number;
}

function readStoredRuns(): StoredRun[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LOCAL_BOARD_KEY) ?? localStorage.getItem(LEGACY_BOARD_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    const seen = new Set<string>();
    const runs: StoredRun[] = [];
    for (const entry of parsed) {
      // Entries from the old seeded demo board are dropped: only rows this
      // device actually scored belong on a local Hall of Fame.
      if (!isRenderableEntry(entry) || !entry.isPlayer) continue;
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      runs.push({
        ...entry,
        isPlayer: true,
        addedAt: typeof (entry as StoredRun).addedAt === 'number' ? (entry as StoredRun).addedAt : now,
      });
    }
    return runs;
  } catch {
    return [];
  }
}

/**
 * Persists a run on this device. Re-submitting the same runId (a retry) returns
 * the existing row instead of adding a duplicate.
 */
export function saveLocalRun(run: ValidRun): { entries: LeaderboardEntry[]; rank: number } {
  const stored = readStoredRuns();
  const existingIndex = stored.findIndex((entry) => entry.id === run.runId);

  if (existingIndex === -1) {
    stored.push({
      id: run.runId,
      name: run.name,
      score: run.score,
      maxCombo: run.maxCombo,
      skinId: run.skinId,
      date: 'Just now',
      isPlayer: true,
      addedAt: Date.now(),
    });
  }

  const kept = toBoardRows(stored);

  try {
    localStorage.setItem(LOCAL_BOARD_KEY, JSON.stringify(kept));
    localStorage.removeItem(LEGACY_BOARD_KEY);
  } catch {}

  return { entries: kept, rank: kept.findIndex((entry) => entry.id === run.runId) + 1 };
}

export function loadLocalBoard(): LeaderboardEntry[] {
  return toBoardRows(readStoredRuns());
}

function toBoardRows(runs: StoredRun[]): LeaderboardEntry[] {
  const now = Date.now();
  return sortLeaderboard(runs)
    .slice(0, MAX_LOCAL_RUNS)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      score: entry.score,
      maxCombo: entry.maxCombo,
      skinId: entry.skinId,
      date: formatRunDate(entry.addedAt, now),
      isPlayer: true,
    }));
}

export function markLocalBoardEntry(entries: LeaderboardEntry[], runId?: string | null): LeaderboardEntry[] {
  return entries.map((entry) => ({ ...entry, isPlayer: entry.id === runId }));
}

export function loadLastSubmittedRunId(): string | null {
  try {
    return localStorage.getItem(LAST_SUBMITTED_RUN_KEY);
  } catch {
    return null;
  }
}

export function rememberSubmittedRunId(runId: string): void {
  try {
    localStorage.setItem(LAST_SUBMITTED_RUN_KEY, runId);
  } catch {}
}

export function clearLocalLeaderboard(): void {
  try {
    localStorage.removeItem(LOCAL_BOARD_KEY);
    localStorage.removeItem(LEGACY_BOARD_KEY);
    localStorage.removeItem(LAST_SUBMITTED_RUN_KEY);
  } catch {}
}

interface OnlineBoardResponse {
  entries?: unknown;
  storage?: unknown;
}

export interface OnlineBoardResult {
  online: boolean;
  entries: LeaderboardEntry[];
  error?: string;
}

function sanitizeOnlineEntries(rawEntries: unknown): LeaderboardEntry[] {
  if (!Array.isArray(rawEntries)) return [];
  return rawEntries
    .filter(isRenderableEntry)
    .slice(0, MAX_BOARD_ENTRIES)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      score: entry.score,
      maxCombo: entry.maxCombo,
      skinId: entry.skinId,
      date: typeof entry.date === 'string' ? entry.date : 'Earlier',
      isPlayer: false,
    }));
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Probes the endpoint before the board is labelled online. A server that reports
 * anything other than durable storage keeps the game in local-only mode.
 */
export async function fetchOnlineBoard(): Promise<OnlineBoardResult> {
  try {
    const res = await fetchWithTimeout('/api/leaderboard', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { online: false, entries: [], error: `HTTP ${res.status}` };
    const data = (await res.json()) as OnlineBoardResponse;
    if (data?.storage !== 'durable') {
      return { online: false, entries: [], error: 'Online storage is not durable' };
    }
    return { online: true, entries: sanitizeOnlineEntries(data.entries) };
  } catch (error) {
    return { online: false, entries: [], error: error instanceof Error ? error.message : 'Network error' };
  }
}

export type OnlineSubmitResult =
  | { ok: true; rank: number; entries: LeaderboardEntry[]; duplicate: boolean }
  | { ok: false; error: string };

/** Sends one run. The server is idempotent on runId, so a retry is safe. */
export async function submitOnlineRun(run: ValidRun): Promise<OnlineSubmitResult> {
  try {
    const res = await fetchWithTimeout('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(run),
    });
    const data = (await res.json().catch(() => null)) as
      | { rank?: unknown; entries?: unknown; duplicate?: unknown; error?: unknown; storage?: unknown }
      | null;

    if (!res.ok || !data) {
      const message = typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`;
      return { ok: false, error: message };
    }
    if (data.storage !== 'durable' || typeof data.rank !== 'number' || !Number.isInteger(data.rank)) {
      return { ok: false, error: 'Server did not return a persisted rank' };
    }
    return {
      ok: true,
      rank: data.rank,
      entries: sanitizeOnlineEntries(data.entries),
      duplicate: data.duplicate === true,
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}
