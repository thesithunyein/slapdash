import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLeaderboardHandler } from './api/leaderboard.ts';
import { FileLeaderboardStore } from './server/leaderboardStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Durable file store for the dev server: submissions survive a restart, so the
// optional online board behaves like the real endpoint instead of an array.
const leaderboardStore = new FileLeaderboardStore(path.join(__dirname, '.data', 'leaderboard.json'));
const leaderboardHandler = createLeaderboardHandler(() => leaderboardStore);

// In-memory lightweight gameplay analytics
interface AnalyticsSummary {
  runsStarted: number;
  runsCompleted: number;
  totalScoreLogged: number;
  bustedFailures: number;
  exhaustedFailures: number;
  stageClears: number;
}

const analyticsData: AnalyticsSummary = {
  runsStarted: 0,
  runsCompleted: 0,
  totalScoreLogged: 0,
  bustedFailures: 0,
  exhaustedFailures: 0,
  stageClears: 0,
};

// GET/POST /api/leaderboard - durable, idempotent, validated. Shares its handler
// with the Vercel function so dev and production enforce the same rules.
app.all('/api/leaderboard', (req, res) => {
  void leaderboardHandler(
    req as unknown as Parameters<typeof leaderboardHandler>[0],
    res as unknown as Parameters<typeof leaderboardHandler>[1]
  );
});

// GET /api/daily-schedule - Synchronized UTC reset schedule for online players
app.get('/api/daily-schedule', (_req, res) => {
  const now = new Date();
  const todayKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  
  // Next reset is tomorrow at 00:00:00 UTC
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const msUntilReset = tomorrow.getTime() - now.getTime();
  const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

  res.json({
    status: 'ok',
    todayKey,
    hoursUntilReset,
    minutesUntilReset,
    resetTimeFormatted: `${hoursUntilReset}h ${minutesUntilReset}m`,
  });
});

// POST /api/analytics - Safe, privacy-friendly gameplay telemetry
app.post('/api/analytics', (req, res) => {
  const { event, reason } = req.body || {};
  if (event === 'run_start') analyticsData.runsStarted++;
  if (event === 'stage_clear') analyticsData.stageClears++;
  if (event === 'game_over') {
    if (reason === 'BUSTED') analyticsData.bustedFailures++;
    else if (reason === 'EXHAUSTED') analyticsData.exhaustedFailures++;
  }
  res.json({ status: 'ok', totalRunsTracked: analyticsData.runsStarted });
});

import http from 'http';

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Swiposaur Full-Stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
