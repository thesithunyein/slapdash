// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  LEGACY_BOARD_KEY,
  LOCAL_BOARD_KEY,
  loadLastSubmittedRunId,
  loadLocalBoard,
  markLocalBoardEntry,
  rememberSubmittedRunId,
  saveLocalRun,
} from '../src/game/leaderboard.ts';
import { MAX_LOCAL_RUNS } from '../src/game/leaderboardCore.ts';

const run = (runId: string, score: number, maxCombo = 4) => ({
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

  it('saves one row per run', () => {
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

  it(`keeps the best ${MAX_LOCAL_RUNS} runs sorted by score`, () => {
    for (let i = 0; i < 7; i++) {
      saveLocalRun(run(`run-history-${i}`, (i + 1) * 100, i));
    }
    const board = loadLocalBoard();
    expect(board).toHaveLength(MAX_LOCAL_RUNS);
    expect(board.map((entry) => entry.score)).toEqual([700, 600, 500, 400, 300]);
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
      ])
    );

    const board = loadLocalBoard();
    expect(board).toHaveLength(1);
    expect(board[0]).toMatchObject({ name: 'YOU', score: 900 });
    // Nothing is written until the next save, so the legacy key stays readable.
    expect(localStorage.getItem(LOCAL_BOARD_KEY)).toBeNull();
  });

  it('marks only the last submitted run as YOU on an online board', () => {
    rememberSubmittedRunId('run-dddddddd');
    expect(loadLastSubmittedRunId()).toBe('run-dddddddd');
    const marked = markLocalBoardEntry(
      [
        { id: 'run-dddddddd', name: 'YOU', score: 10, maxCombo: 1, date: 'Just now', skinId: 'rex_red' },
        { id: 'run-eeeeeeee', name: 'RIVAL', score: 20, maxCombo: 1, date: 'Just now', skinId: 'rex_red' },
      ],
      'run-dddddddd'
    );
    expect(marked.map((entry) => entry.isPlayer)).toEqual([true, false]);
  });
});
