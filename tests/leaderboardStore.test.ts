import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileLeaderboardStore, RedisRestLeaderboardStore } from '../server/leaderboardStore.ts';

const run = (runId: string, score: number, maxCombo = 5) => ({
  runId,
  name: 'YOU',
  score,
  maxCombo,
  skinId: 'rex_red',
});

let dir: string;
let file: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'swiposaur-board-'));
  file = path.join(dir, 'leaderboard.json');
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe('FileLeaderboardStore', () => {
  it('creates only one record for a repeated runId', async () => {
    const store = new FileLeaderboardStore(file);

    const first = await store.submit(run('run-11111111', 1200, 8));
    expect(first.duplicate).toBe(false);
    expect(first.rank).toBe(1);
    expect(first.totalRuns).toBe(1);

    const retry = await store.submit(run('run-11111111', 1200, 8));
    expect(retry.duplicate).toBe(true);
    expect(retry.rank).toBe(1);
    expect(retry.totalRuns).toBe(1);
    expect(retry.record.id).toBe('run-11111111');

    expect(await store.list()).toHaveLength(1);
  });

  it('returns the original result when a retry is resent with a different score', async () => {
    const store = new FileLeaderboardStore(file);
    await store.submit(run('run-22222222', 900));
    const retry = await store.submit(run('run-22222222', 4_000_000));
    expect(retry.duplicate).toBe(true);
    expect(retry.record.score).toBe(900);
    expect((await store.list())[0].score).toBe(900);
  });

  it('survives a restart (new store instance, same file)', async () => {
    const first = new FileLeaderboardStore(file);
    await first.submit(run('run-33333333', 777));

    const restarted = new FileLeaderboardStore(file);
    const entries = await restarted.list();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ id: 'run-33333333', score: 777 });
  });

  it('ranks every run and returns the top board', async () => {
    const store = new FileLeaderboardStore(file);
    await store.submit(run('run-44444444', 100));
    await store.submit(run('run-55555555', 500));
    const third = await store.submit(run('run-66666666', 300));

    expect(third.rank).toBe(2);
    expect(third.entries.map((entry) => entry.score)).toEqual([500, 300, 100]);
  });

  it('limits submissions inside the window', async () => {
    const store = new FileLeaderboardStore(file);
    expect(await store.consumeRateLimit('ip:1', 2, 60)).toBe(true);
    expect(await store.consumeRateLimit('ip:1', 2, 60)).toBe(true);
    expect(await store.consumeRateLimit('ip:1', 2, 60)).toBe(false);
    // A different caller has its own budget.
    expect(await store.consumeRateLimit('ip:2', 2, 60)).toBe(true);
  });
});

/** Minimal in-memory stand-in for the Redis REST commands the store uses. */
function createFakeRedis() {
  const hash = new Map<string, string>();
  const counters = new Map<string, number>();
  const fetchImpl = (async (_url: string | URL | Request, init?: RequestInit) => {
    const [command, key, field, value] = JSON.parse(String(init?.body ?? '[]')) as string[];
    let result: unknown = null;
    if (command === 'HSETNX') {
      if (hash.has(field)) result = 0;
      else {
        hash.set(field, value);
        result = 1;
      }
    } else if (command === 'HGETALL') {
      result = [...hash.entries()].flat();
    } else if (command === 'INCR') {
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);
      result = next;
    } else if (command === 'EXPIRE') {
      result = 1;
    }
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  return { hash, fetchImpl };
}

describe('RedisRestLeaderboardStore', () => {
  it('is idempotent on runId and survives a new client instance', async () => {
    const redis = createFakeRedis();
    const store = new RedisRestLeaderboardStore('https://redis.test', 'token', redis.fetchImpl);

    const first = await store.submit(run('run-redis-01', 1500));
    const retry = await store.submit(run('run-redis-01', 2_000_000));
    expect(first.duplicate).toBe(false);
    expect(retry.duplicate).toBe(true);
    expect(retry.record.score).toBe(1500);
    expect(await store.list()).toHaveLength(1);

    // A fresh store instance (cold start) reads the same persisted hash.
    const restarted = new RedisRestLeaderboardStore('https://redis.test', 'token', redis.fetchImpl);
    expect((await restarted.list())[0]).toMatchObject({ id: 'run-redis-01', score: 1500 });
  });

  it('rate limits through INCR counters', async () => {
    const redis = createFakeRedis();
    const store = new RedisRestLeaderboardStore('https://redis.test', 'token', redis.fetchImpl);
    expect(await store.consumeRateLimit('ip', 1, 60)).toBe(true);
    expect(await store.consumeRateLimit('ip', 1, 60)).toBe(false);
  });
});
