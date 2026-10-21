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
  { id: 'rec-1', name: 'REXY_PRIME', score: 48900, maxCombo: 34, date: 'Today', skinId: 'rex_red' },
  { id: 'rec-2', name: 'BUBBLES_SURF', score: 38200, maxCombo: 28, date: 'Today', skinId: 'spino_blue' },
  { id: 'rec-3', name: 'GOLDIE_BASH', score: 29400, maxCombo: 24, date: 'Yesterday', skinId: 'spike_gold' },
  { id: 'rec-4', name: 'RAPTOR_DASH', score: 21500, maxCombo: 19, date: '2d ago', skinId: 'snappy_green' },
  { id: 'rec-5', name: 'FOSSIL_KING', score: 18900, maxCombo: 17, date: '3d ago', skinId: 'king_fossil' },
  { id: 'rec-6', name: 'CYBER_SAUR', score: 15400, maxCombo: 15, date: '3d ago', skinId: 'mecha_saur' },
  { id: 'rec-7', name: 'ISLAND_SPEED', score: 12600, maxCombo: 12, date: '4d ago', skinId: 'rex_red' },
  { id: 'rec-8', name: 'TROPIC_RUNNER', score: 9800, maxCombo: 10, date: '5d ago', skinId: 'spino_blue' },
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
