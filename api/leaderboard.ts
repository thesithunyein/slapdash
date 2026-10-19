// Vercel Serverless Function Handler for /api/leaderboard
interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  maxCombo: number;
  date: string;
  skinId: string;
  isPlayer?: boolean;
}

let vercelLeaderboard: LeaderboardRecord[] = [
  { id: 'rec-1', name: 'SLAP_NINJA_99', score: 38450, maxCombo: 34, date: 'Today', skinId: 'golden_champ' },
  { id: 'rec-2', name: 'TURBO_DASH_PRO', score: 31200, maxCombo: 28, date: 'Today', skinId: 'cyber_boxer' },
  { id: 'rec-3', name: 'CHAOS_QUEEN', score: 26800, maxCombo: 24, date: 'Yesterday', skinId: 'market_ninja' },
  { id: 'rec-4', name: 'MARKET_MENACE', score: 22150, maxCombo: 19, date: '2d ago', skinId: 'speedy_dash' },
  { id: 'rec-5', name: 'SWERVE_KING', score: 18900, maxCombo: 17, date: '3d ago', skinId: 'golden_champ' },
  { id: 'rec-6', name: 'SLAP_MASTER_J', score: 15400, maxCombo: 15, date: '3d ago', skinId: 'speedy_dash' },
  { id: 'rec-7', name: 'MOB_RUNNER_X', score: 12600, maxCombo: 12, date: '4d ago', skinId: 'market_ninja' },
  { id: 'rec-8', name: 'CHIBI_BRAWLER', score: 9800, maxCombo: 10, date: '5d ago', skinId: 'cyber_boxer' },
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const sorted = [...vercelLeaderboard].sort((a, b) => b.score - a.score).slice(0, 20);
    return res.status(200).json({
      status: 'ok',
      totalEntries: vercelLeaderboard.length,
      entries: sorted,
      updatedAt: new Date().toISOString(),
    });
  }

  if (req.method === 'POST') {
    const { name, score, maxCombo, skinId } = req.body || {};
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

    vercelLeaderboard.push(newRecord);
    vercelLeaderboard.sort((a, b) => b.score - a.score);

    const rank = vercelLeaderboard.findIndex((e) => e.id === newRecord.id) + 1;
    const top20 = vercelLeaderboard.slice(0, 20);

    return res.status(200).json({
      status: 'ok',
      rank,
      totalEntries: vercelLeaderboard.length,
      newRecord,
      entries: top20,
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
