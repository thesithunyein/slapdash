import type { LeaderboardEntry } from './types.ts';

/**
 * Shared, platform-free rules for the leaderboard. Imported by the React client,
 * the Express dev server and the serverless endpoint so all three agree on what
 * a valid run is. No DOM, storage or network access belongs in this file.
 */

/** Hard ceiling for a single run, well above any legitimate score. */
export const MAX_LEADERBOARD_SCORE = 5_000_000;
/** A combo is one whip chain; 250 is far beyond a realistic run. */
export const MAX_LEADERBOARD_COMBO = 250;
export const MAX_PLAYER_NAME_LENGTH = 16;
export const MAX_BOARD_ENTRIES = 20;
/** The on-device board keeps one record: this player's highest score. */
export const MAX_LOCAL_RUNS = 1;
export const DEFAULT_PLAYER_NAME = 'YOU';

/**
 * Skin ids accepted for a submission. Must stay in sync with CHARACTER_SKINS;
 * a test asserts they match so adding a skin cannot silently reject its scores.
 */
export const ALLOWED_SKIN_IDS = [
  'rex_red',
  'spino_blue',
  'raptor_gold',
  'dino_green',
  'cyber_dino',
  'shadow_rex',
  'speedy_dash',
  'market_ninja',
  'golden_champ',
] as const;

export interface ValidRun {
  runId: string;
  name: string;
  score: number;
  maxCombo: number;
  skinId: string;
}

export type RunValidation = { ok: true; run: ValidRun } | { ok: false; error: string };

const RUN_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

/** Strips control characters, collapses whitespace and enforces a length cap. */
export function sanitizePlayerName(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_PLAYER_NAME;
  const cleaned = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_PLAYER_NAME_LENGTH);
  return cleaned || DEFAULT_PLAYER_NAME;
}

export function isAllowedSkinId(skinId: unknown): skinId is string {
  return typeof skinId === 'string' && (ALLOWED_SKIN_IDS as readonly string[]).includes(skinId);
}

/**
 * Validates a leaderboard submission. Scores must be whole, positive and below
 * MAX_LEADERBOARD_SCORE; combos whole and within range; names sanitized; skin
 * ids checked against the shipped roster; and every run needs a unique id so
 * retries are idempotent.
 */
export function validateRunPayload(raw: unknown): RunValidation {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Run payload is required' };
  const body = raw as Record<string, unknown>;

  if (typeof body.runId !== 'string' || !RUN_ID_PATTERN.test(body.runId)) {
    return { ok: false, error: 'runId must be 8-64 URL-safe characters' };
  }

  const score = body.score;
  if (
    typeof score !== 'number' ||
    !Number.isFinite(score) ||
    !Number.isInteger(score) ||
    score <= 0 ||
    score > MAX_LEADERBOARD_SCORE
  ) {
    return {
      ok: false,
      error: `score must be a whole number between 1 and ${MAX_LEADERBOARD_SCORE.toLocaleString('en-US')}`,
    };
  }

  const maxCombo = body.maxCombo;
  if (
    typeof maxCombo !== 'number' ||
    !Number.isFinite(maxCombo) ||
    !Number.isInteger(maxCombo) ||
    maxCombo < 0 ||
    maxCombo > MAX_LEADERBOARD_COMBO
  ) {
    return { ok: false, error: `maxCombo must be a whole number between 0 and ${MAX_LEADERBOARD_COMBO}` };
  }

  if (!isAllowedSkinId(body.skinId)) {
    return { ok: false, error: 'skinId is not a known dinosaur' };
  }

  return {
    ok: true,
    run: {
      runId: body.runId,
      name: sanitizePlayerName(body.name),
      score,
      maxCombo,
      skinId: body.skinId,
    },
  };
}

/** 1-indexed position of `runId` in a descending-score board, 0 when absent. */
export function rankOfRun(entries: readonly { id: string }[], runId: string): number {
  const index = entries.findIndex((entry) => entry.id === runId);
  return index === -1 ? 0 : index + 1;
}

/** Sorts descending by score, then by combo, then keeps insertion order. */
export function sortLeaderboard<T extends { score: number; maxCombo: number }>(entries: T[]): T[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => b.entry.score - a.entry.score || b.entry.maxCombo - a.entry.maxCombo || a.index - b.index)
    .map(({ entry }) => entry);
}

/** Keeps only rows that could plausibly render, used when reading old storage. */
export function isRenderableEntry(entry: unknown): entry is LeaderboardEntry {
  if (!entry || typeof entry !== 'object') return false;
  const row = entry as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    row.id.length > 0 &&
    typeof row.name === 'string' &&
    typeof row.score === 'number' &&
    Number.isFinite(row.score) &&
    row.score > 0 &&
    row.score <= MAX_LEADERBOARD_SCORE &&
    typeof row.maxCombo === 'number' &&
    Number.isFinite(row.maxCombo)
  );
}

/** Date label used on boards without a real per-run timestamp. */
export function formatRunDate(addedAt: number, now: number = Date.now()): string {
  const minutes = Math.floor(Math.max(0, now - addedAt) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
