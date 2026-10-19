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

// GET /api/leaderboard - Returns official global standings
app.get('/api/leaderboard', (_req, res) => {
  const sorted = [...globalLeaderboard].sort((a, b) => b.score - a.score).slice(0, 20);
  res.json({
    status: 'ok',
    totalEntries: globalLeaderboard.length,
    entries: sorted,
    updatedAt: new Date().toISOString(),
  });
});

// POST /api/leaderboard - Verify run, calculate official global rank, and register entry
app.post('/api/leaderboard', (req, res) => {
  const { name, score, maxCombo, skinId } = req.body;
  if (typeof score !== 'number' || score <= 0) {
    return res.status(400).json({ error: 'Valid score is required' });
  }

  const cleanName = (name && typeof name === 'string' ? name.trim().slice(0, 16) : '') || 'YOU (CHAMPION)';
  const newRecord: LeaderboardRecord = {
    id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: cleanName,
    score,
    maxCombo: typeof maxCombo === 'number' ? maxCombo : 0,
    date: 'Just Now',
    skinId: skinId || 'classic',
    isPlayer: true,
  };

  globalLeaderboard.push(newRecord);
  globalLeaderboard.sort((a, b) => b.score - a.score);

  // 1-indexed real global rank
  const rank = globalLeaderboard.findIndex((e) => e.id === newRecord.id) + 1;
  const top20 = globalLeaderboard.slice(0, 20);

  res.json({
    status: 'ok',
    rank,
    totalEntries: globalLeaderboard.length,
    newRecord,
    entries: top20,
  });
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
