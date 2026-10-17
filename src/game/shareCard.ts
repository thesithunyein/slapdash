/**
 * High-Resolution (1080x1350) Run Achievement Share Card Generator
 * Inspired by Wrackline's tactile export card architecture.
 */

export interface ShareCardData {
  score: number;
  highScore: number;
  slapsCount: number;
  maxCombo: number;
  distanceRun: number;
  feverCount: number;
  playerName: string;
  paceName: string;
}

export const SHARE_NAME_KEY = 'slapdash_name';

export function sanitizeName(raw: string): string {
  const clean = raw.trim().replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 16);
  return clean || 'RUNNER';
}

export function buildShareCard(data: ShareCardData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas 2D context unavailable'));
      return;
    }

    // 1. Warm Parchment Background
    ctx.fillStyle = '#FAF6ED';
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. Thick Ink Border
    ctx.strokeStyle = '#17181C';
    ctx.lineWidth = 16;
    ctx.strokeRect(32, 32, 1080 - 64, 1350 - 64);

    // Inner dashed decorative border
    ctx.strokeStyle = '#17181C';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.strokeRect(52, 52, 1080 - 104, 1350 - 104);
    ctx.setLineDash([]);

    // 3. Header Badge: Official Runner Record
    ctx.fillStyle = '#24698F';
    ctx.fillRect(240, 100, 600, 70);
    ctx.strokeStyle = '#17181C';
    ctx.lineWidth = 6;
    ctx.strokeRect(240, 100, 600, 70);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = "900 28px 'Space Grotesk', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SLAPDASH · OFFICIAL RUN RECORD', 540, 136);

    // 4. Game Logo & Title
    ctx.fillStyle = '#17181C';
    ctx.font = "900 84px 'Righteous', system-ui, sans-serif";
    ctx.fillText('SLAPDASH', 540, 260);

    ctx.fillStyle = '#17181C';
    ctx.font = "700 24px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText('STREET BOULEVARD ARCADE GAUNTLET', 540, 315);

    // 5. Giant Score Box (Neo-Brutalist Tactile Box)
    const boxX = 140;
    const boxY = 370;
    const boxW = 800;
    const boxH = 340;

    // Hard drop shadow
    ctx.fillStyle = '#17181C';
    ctx.fillRect(boxX + 14, boxY + 14, boxW, boxH);

    // Main box fill
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#17181C';
    ctx.lineWidth = 8;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Score label
    ctx.fillStyle = '#767E88';
    ctx.font = "900 26px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText('FINAL RUN SCORE', 540, boxY + 60);

    // Score number in Deep Cobalt
    ctx.fillStyle = '#24698F';
    ctx.font = "900 120px 'Righteous', system-ui, sans-serif";
    ctx.fillText(data.score.toLocaleString(), 540, boxY + 180);

    // Subtag: Pace and Rank
    ctx.fillStyle = '#F6C445';
    ctx.fillRect(360, boxY + 245, 360, 52);
    ctx.strokeStyle = '#17181C';
    ctx.lineWidth = 4;
    ctx.strokeRect(360, boxY + 245, 360, 52);

    ctx.fillStyle = '#17181C';
    ctx.font = "900 22px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText(`PACE: ${data.paceName.toUpperCase()} · HIGH: ${Math.max(data.score, data.highScore).toLocaleString()}`, 540, boxY + 273);

    // 6. Stats Grid (4 Tactile Mini-Cards)
    const statCards = [
      { label: 'SLAPS LANDED', val: `${data.slapsCount}`, color: '#FF4757' },
      { label: 'MAX COMBO', val: `${data.maxCombo}x`, color: '#F6C445' },
      { label: 'DISTANCE', val: `${Math.round(data.distanceRun)}m`, color: '#10B981' },
      { label: 'FEVER RUSHES', val: `${data.feverCount || 1}`, color: '#24698F' },
    ];

    const gridX = 140;
    const gridY = 760;
    const cardW = 380;
    const cardH = 160;
    const gap = 40;

    statCards.forEach((st, idx) => {
      const cx = gridX + (idx % 2) * (cardW + gap);
      const cy = gridY + Math.floor(idx / 2) * (cardH + 28);

      // Shadow
      ctx.fillStyle = '#17181C';
      ctx.fillRect(cx + 8, cy + 8, cardW, cardH);

      // Card
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = '#17181C';
      ctx.lineWidth = 6;
      ctx.strokeRect(cx, cy, cardW, cardH);

      // Color pill left accent
      ctx.fillStyle = st.color;
      ctx.fillRect(cx, cy, 16, cardH);

      // Text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#767E88';
      ctx.font = "800 20px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillText(st.label, cx + 40, cy + 50);

      ctx.fillStyle = '#17181C';
      ctx.font = "900 56px 'Righteous', system-ui, sans-serif";
      ctx.fillText(st.val, cx + 40, cy + 120);
    });

    // 7. Footer: Player Signature & Timestamp
    const footerY = 1170;
    ctx.textAlign = 'center';

    ctx.fillStyle = '#17181C';
    ctx.font = "800 28px 'Righteous', system-ui, sans-serif";
    ctx.fillText(`AUTHENTICATED BY RUNNER: ${data.playerName.toUpperCase()}`, 540, footerY);

    ctx.fillStyle = '#767E88';
    ctx.font = "700 20px 'Space Grotesk', system-ui, sans-serif";
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    ctx.fillText(`VERIFIED ON ${dateStr} · PLAY AT SLAPDASH ARCADE`, 540, footerY + 45);

    // Export Canvas to Blob
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create Blob from Canvas'));
    }, 'image/png');
  });
}
