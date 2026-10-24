// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  LEGACY_BOARD_KEY,
  LOCAL_BOARD_KEY,
  PLAYER_ID_KEY,
  PLAYER_NAME_KEY,
  getPlayerId,
  loadLocalBoard,
  loadPlayerName,
  markPlayerEntry,
  saveLocalRun,
  savePlayerName,
} from '../src/game/leaderboard.ts';
import { MAX_LOCAL_RUNS } from '../src/game/leaderboardCore.ts';

const run = (runId: string, score: number, maxCombo = 4) => ({
  playerId: 'player-aaaaaaaa',
  runId,
  name: 'YOU',
  score,
  maxCombo,
  skinId: 'rex_red',
});

beforeEach(() => {
  localStorage.clear();
});

describe('local Hall of Fame', () => {
  it('starts empty instead of shipping seeded competitors', () => {
    expect(loadLocalBoard()).toEqual([]);
  });

  it('saves a best record for the first run', () => {
    const result = saveLocalRun(run('run-aaaaaaaa', 500));
    expect(result.entries).toHaveLength(1);
    expect(result.rank).toBe(1);
    expect(result.entries[0]).toMatchObject({ id: 'run-aaaaaaaa', score: 500, isPlayer: true });
    expect(loadLocalBoard()).toHaveLength(1);
  });

  it('does not duplicate a row when the same runId is retried', () => {
    saveLocalRun(run('run-bbbbbbbb', 800));
    const retry = saveLocalRun(run('run-bbbbbbbb', 800));
    expect(retry.entries).toHaveLength(1);
    expect(retry.rank).toBe(1);
    expect(loadLocalBoard()).toHaveLength(1);
  });

  it('ignores a forged higher score on a retried runId', () => {
    saveLocalRun(run('run-cccccccc', 800));
    const forgedRetry = saveLocalRun(run('run-cccccccc', 900_000));
    expect(forgedRetry.entries).toHaveLength(1);
    expect(forgedRetry.entries[0].score).toBe(800);
  });

  it(`keeps exactly ${MAX_LOCAL_RUNS} highest run, not a history`, () => {
    for (let i = 0; i < 7; i++) {
      saveLocalRun(run(`run-history-${i}`, (i + 1) * 100, i));
    }
    const board = loadLocalBoard();
    expect(board).toHaveLength(MAX_LOCAL_RUNS);
    expect(board.map((entry) => entry.score)).toEqual([700]);
  });

  it('keeps the best score when a later run is lower', () => {
    expect(saveLocalRun(run('run-high-01', 900)).rank).toBe(1);
    const lower = saveLocalRun(run('run-low-0001', 400));

    expect(lower.rank).toBe(0);
    expect(lower.entries).toHaveLength(1);
    expect(lower.entries[0].score).toBe(900);

    const higher = saveLocalRun(run('run-higher-1', 950));
    expect(higher.rank).toBe(1);
    expect(higher.entries).toHaveLength(1);
    expect(higher.entries[0].score).toBe(950);
  });

  it('drops seeded legacy rows and keeps only real player runs', () => {
    localStorage.setItem(
      LEGACY_BOARD_KEY,
      JSON.stringify([
        { id: '1', name: 'REX_CHAMPION', score: 38400, maxCombo: 14, date: 'Today', skinId: 'raptor_gold' },
        { id: '2', name: 'ISLAND_RUNNER', score: 29500, maxCombo: 11, date: 'Today', skinId: 'spino_blue' },
        {
          id: 'run-legacy01',
          name: 'YOU',
          score: 900,
          maxCombo: 6,
          date: 'Today',
          skinId: 'rex_red',
          isPlayer: true,
        },
        {
          id: 'run-legacy02',
          name: 'YOU',
          score: 1500,
          maxCombo: 9,
          date: 'Yesterday',
          skinId: 'rex_red',
          isPlayer: true,
        },
      ])
    );

    const board = loadLocalBoard();
    expect(board).toHaveLength(1);
    expect(board[0]).toMatchObject({ name: 'YOU', score: 1500 });
    // Nothing is written until the next save, so the legacy key stays readable.
    expect(localStorage.getItem(LOCAL_BOARD_KEY)).toBeNull();
  });

  it('marks the player row by player id, not by run id', () => {
    const marked = markPlayerEntry(
      [
        {
          id: 'run-best-001',
          name: 'NEON_REX42',
          score: 900,
          maxCombo: 9,
          date: 'Just now',
          skinId: 'rex_red',
          playerId: 'player-aaaaaaaa',
        },
        {
          id: 'run-best-002',
          name: 'IRON_TALON77',
          score: 500,
          maxCombo: 4,
          date: 'Just now',
          skinId: 'spino_blue',
          playerId: 'player-bbbbbbbb',
        },
      ],
      'player-aaaaaaaa'
    );
    expect(marked.map((entry) => entry.isPlayer)).toEqual([true, false]);
  });
});

describe('player identity', () => {
  it('generates and persists a board name on a first visit', () => {
    const name = loadPlayerName();
    expect(name).toMatch(/^[A-Z]+_[A-Z]+\d{2}$/);
    expect(localStorage.getItem(PLAYER_NAME_KEY)).toBe(name);
    // Reading it again must not reshuffle the name.
    expect(loadPlayerName()).toBe(name);
  });

  it('generates one stable player id per device', () => {
    const id = getPlayerId();
    expect(id).toHaveLength(36);
    expect(localStorage.getItem(PLAYER_ID_KEY)).toBe(id);
    expect(getPlayerId()).toBe(id);
  });

  it('lets the player rename themselves and sanitizes the input', () => {
    expect(savePlayerName('  Sir   Sithu  ')).toBe('Sir Sithu');
    expect(loadPlayerName()).toBe('Sir Sithu');

    expect(savePlayerName('')).toBe('YOU');
    expect(savePlayerName('X'.repeat(40))).toHaveLength(16);
  });

  it('keeps the generated name off the high-score reset', () => {
    const name = loadPlayerName();
    localStorage.removeItem(LOCAL_BOARD_KEY);
    expect(loadPlayerName()).toBe(name);
  });
});
