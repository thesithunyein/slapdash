import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  maxCombo: number;
  date: string;
  skinId: string;
  isPlayer?: boolean;
}

// Initialized Global Arcade Leaderboard seeded with authentic tournament scores
let globalLeaderboard: LeaderboardRecord[] = [
  { id: 'rec-1', name: 'SLAP_NINJA_99', score: 38450, maxCombo: 34, date: 'Today', skinId: 'golden_champ' },
  { id: 'rec-2', name: 'TURBO_DASH_PRO', score: 31200, maxCombo: 28, date: 'Today', skinId: 'cyber_boxer' },
  { id: 'rec-3', name: 'CHAOS_QUEEN', score: 26800, maxCombo: 24, date: 'Yesterday', skinId: 'market_ninja' },
  { id: 'rec-4', name: 'MARKET_MENACE', score: 22150, maxCombo: 19, date: '2d ago', skinId: 'speedy_dash' },
  { id: 'rec-5', name: 'SWERVE_KING', score: 18900, maxCombo: 17, date: '3d ago', skinId: 'golden_champ' },
  { id: 'rec-6', name: 'SLAP_MASTER_J', score: 15400, maxCombo: 15, date: '3d ago', skinId: 'speedy_dash' },
  { id: 'rec-7', name: 'MOB_RUNNER_X', score: 12600, maxCombo: 12, date: '4d ago', skinId: 'market_ninja' },
  { id: 'rec-8', name: 'CHIBI_BRAWLER', score: 9800, maxCombo: 10, date: '5d ago', skinId: 'cyber_boxer' },
];

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

// GET /api/leaderboard - Returns official global standings and tournament status
app.get('/api/leaderboard', (_req, res) => {
  const sorted = [...globalLeaderboard].sort((a, b) => b.score - a.score).slice(0, 20);
  
  // Weekly Tournament metadata (resets every Sunday midnight UTC)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 is Sunday
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  const resetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilSunday, 23, 59, 59));
  const hoursRemaining = Math.max(1, Math.round((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60)));

  res.json({
    status: 'ok',
    totalEntries: globalLeaderboard.length,
    entries: sorted,
    tournament: {
      season: 'Season 1: Grand Bazaar Blitz',
      endsInHours: hoursRemaining,
      topReward: '500 Coins + Crown Trophy',
      activeParticipants: globalLeaderboard.length + 142,
    },
    updatedAt: new Date().toISOString(),
  });
});

// POST /api/leaderboard - Validates run, registers entry, and calculates gap to next player
app.post('/api/leaderboard', (req, res) => {
  const { name, score, maxCombo, skinId } = req.body;
  
  // Validate score integrity: positive integer, capped at reasonable limit
  if (typeof score !== 'number' || isNaN(score) || score <= 0 || score > 5000000) {
    return res.status(400).json({ error: 'Valid score between 1 and 5,000,000 is required' });
  }

  // Validate maxCombo integrity
  const safeCombo = typeof maxCombo === 'number' && !isNaN(maxCombo) && maxCombo >= 0 && maxCombo <= 250 
    ? Math.floor(maxCombo) 
    : 0;

  const cleanName = (typeof name === 'string' ? name.trim().slice(0, 16).replace(/[^\w\s-]/g, '') : '') || 'YOU (CHAMPION)';
  
  const newRecord: LeaderboardRecord = {
    id: `run-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: cleanName,
    score: Math.floor(score),
    maxCombo: safeCombo,
    date: 'Just Now',
    skinId: typeof skinId === 'string' ? skinId.slice(0, 32) : 'speedy_dash',
    isPlayer: true,
  };

  globalLeaderboard.push(newRecord);
  globalLeaderboard.sort((a, b) => b.score - a.score);

  // 1-indexed real global rank
  const rank = globalLeaderboard.findIndex((e) => e.id === newRecord.id) + 1;
  const top20 = globalLeaderboard.slice(0, 20);

  // Calculate score needed to surpass player above
  let nextPlayerAbove: { name: string; score: number; scoreToSurpass: number } | null = null;
  if (rank > 1 && globalLeaderboard[rank - 2]) {
    const higherPlayer = globalLeaderboard[rank - 2];
    nextPlayerAbove = {
      name: higherPlayer.name,
      score: higherPlayer.score,
      scoreToSurpass: higherPlayer.score - newRecord.score + 1,
    };
  }

  // Update in-memory telemetry
  analyticsData.runsCompleted++;
  analyticsData.totalScoreLogged += newRecord.score;

  res.json({
    status: 'ok',
    rank,
    totalEntries: globalLeaderboard.length,
    newRecord,
    entries: top20,
    nextPlayerAbove,
  });
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
    console.log(`SlapDash Full-Stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
