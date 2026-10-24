import { describe, expect, it } from 'vitest';
import {
  ALLOWED_SKIN_IDS,
  MAX_LEADERBOARD_SCORE,
  MAX_PLAYER_NAME_LENGTH,
  formatRunDate,
  rankOfRun,
  sanitizePlayerName,
  sortLeaderboard,
  validateRunPayload,
} from '../src/game/leaderboardCore.ts';
import { CHARACTER_SKINS } from '../src/game/constants.ts';

const validPayload = {
  runId: 'run-1a2b3c4d',
  name: 'SITHU',
  score: 12_345,
  maxCombo: 17,
  skinId: 'rex_red',
};

describe('validateRunPayload', () => {
  it('accepts a well-formed run', () => {
    const result = validateRunPayload(validPayload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.run).toEqual({
        runId: 'run-1a2b3c4d',
        name: 'SITHU',
        score: 12_345,
        maxCombo: 17,
        skinId: 'rex_red',
      });
    }
  });

  it('rejects scores that are not finite positive integers', () => {
    for (const score of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, MAX_LEADERBOARD_SCORE + 1, '100']) {
      expect(validateRunPayload({ ...validPayload, score }).ok).toBe(false);
    }
    expect(validateRunPayload({ ...validPayload, score: MAX_LEADERBOARD_SCORE }).ok).toBe(true);
  });

  it('rejects out-of-range or fractional combos', () => {
    for (const maxCombo of [-1, 2.5, 251, Number.NaN, '5']) {
      expect(validateRunPayload({ ...validPayload, maxCombo }).ok).toBe(false);
    }
  });

  it('rejects unknown skins and malformed run ids', () => {
    expect(validateRunPayload({ ...validPayload, skinId: 'not_a_dino' }).ok).toBe(false);
    expect(validateRunPayload({ ...validPayload, skinId: 42 }).ok).toBe(false);
    expect(validateRunPayload({ ...validPayload, runId: 'short' }).ok).toBe(false);
    expect(validateRunPayload({ ...validPayload, runId: 'has spaces in it' }).ok).toBe(false);
    expect(validateRunPayload({ ...validPayload, runId: 12345678 }).ok).toBe(false);
  });

  it('rejects missing payloads', () => {
    expect(validateRunPayload(null).ok).toBe(false);
    expect(validateRunPayload(undefined).ok).toBe(false);
    expect(validateRunPayload('run').ok).toBe(false);
  });

  it('sanitizes names instead of trusting them', () => {
    expect(sanitizePlayerName('  Sithu\u0000   Nyein  ')).toBe('Sithu Nyein');
    expect(sanitizePlayerName('')).toBe('YOU');
    expect(sanitizePlayerName(undefined)).toBe('YOU');
    expect(sanitizePlayerName('X'.repeat(50))).toHaveLength(MAX_PLAYER_NAME_LENGTH);

    const result = validateRunPayload({ ...validPayload, name: '  REX\u001b[31m  ' });
    expect(result.ok && result.run.name).toBe('REX [31m');
  });

  it('uses the same skin roster as the game', () => {
    const gameSkins = CHARACTER_SKINS.map((skin) => skin.id).sort();
    expect([...ALLOWED_SKIN_IDS].sort()).toEqual(gameSkins);
  });
});

describe('board helpers', () => {
  it('ranks by descending score with combo as the tie-break', () => {
    const entries = [
      { id: 'a', score: 100, maxCombo: 2 },
      { id: 'b', score: 300, maxCombo: 4 },
      { id: 'c', score: 100, maxCombo: 9 },
    ];
    expect(sortLeaderboard(entries).map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
    expect(rankOfRun(sortLeaderboard(entries), 'a')).toBe(3);
    expect(rankOfRun(entries, 'missing')).toBe(0);
  });

  it('labels recent runs without inventing absolute dates', () => {
    const now = Date.UTC(2026, 9, 24, 12, 0, 0);
    expect(formatRunDate(now - 30_000, now)).toBe('Just now');
    expect(formatRunDate(now - 5 * 60_000, now)).toBe('5m ago');
    expect(formatRunDate(now - 3 * 3_600_000, now)).toBe('3h ago');
    expect(formatRunDate(now - 2 * 86_400_000, now)).toBe('2d ago');
  });
});
