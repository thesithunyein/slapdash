import { validateRunPayload } from '../src/game/leaderboardCore.ts';
import {
  createUpstashStoreFromEnv,
  type LeaderboardStore,
} from '../server/leaderboardStore.ts';

/**
 * /api/leaderboard — optional online board.
 *
 * Requires durable storage (Vercel KV / Upstash Redis REST). Without it the
 * endpoint answers 503 with `storage: 'unavailable'`, and the game falls back to
 * the on-device Hall of Fame rather than inventing a "live global" board.
 *
 * Scores are self-reported: this is a community leaderboard, not a cheat-proof
 * tournament. Only a signed run or replay could justify that claim.
 */

const RATE_LIMIT_MAX_SUBMISSIONS = 6;
const RATE_LIMIT_WINDOW_SECONDS = 60;

interface ApiRequest {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): unknown;
  setHeader(name: string, value: string | string[]): unknown;
  end(body?: string): unknown;
}

function clientKey(req: ApiRequest): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  const headerValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = headerValue?.split(',')[0]?.trim();
  return first || req.socket?.remoteAddress || 'unknown';
}

export function createLeaderboardHandler(getStore: () => LeaderboardStore | null) {
  return async function handler(req: ApiRequest, res: ApiResponse): Promise<unknown> {
    const store = getStore();
    if (!store) {
      return res.status(503).json({
        status: 'disabled',
        storage: 'unavailable',
        error: 'Online leaderboard storage is not configured',
      });
    }

    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'GET') {
      try {
        const entries = await store.list();
        return res.status(200).json({
          status: 'ok',
          storage: 'durable',
          entries,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).json({
          status: 'error',
          error: error instanceof Error ? error.message : 'Leaderboard unavailable',
        });
      }
    }

    if (req.method === 'POST') {
      const parsed = validateRunPayload(req.body);
      if (!parsed.ok) {
        return res.status(400).json({ status: 'error', storage: 'durable', error: parsed.error });
      }

      try {
        // Rate limiting lives inside the same guard: a datastore outage must
        // answer 500, not leave the request hanging on an unhandled rejection.
        const allowed = await store.consumeRateLimit(
          `submit:${clientKey(req)}`,
          RATE_LIMIT_MAX_SUBMISSIONS,
          RATE_LIMIT_WINDOW_SECONDS
        );
        if (!allowed) {
          return res.status(429).json({
            status: 'error',
            storage: 'durable',
            error: 'Too many submissions, try again in a minute',
          });
        }

        const result = await store.submit(parsed.run);
        return res.status(200).json({
          status: 'ok',
          storage: 'durable',
          rank: result.rank,
          duplicate: result.duplicate,
          newRecord: result.record,
          entries: result.entries,
          totalRuns: result.totalRuns,
        });
      } catch (error) {
        return res.status(500).json({
          status: 'error',
          error: error instanceof Error ? error.message : 'Score could not be persisted',
        });
      }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ status: 'error', error: `Method ${req.method ?? 'UNKNOWN'} not allowed` });
  };
}

export default createLeaderboardHandler(() => createUpstashStoreFromEnv());
