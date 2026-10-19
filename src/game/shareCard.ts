/**
 * High-Resolution (1080x1350) 8-Bit Pixel Art Run Achievement Card Generator
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

    // 1. Dark Retro Arcade Cabinet Background
    ctx.fillStyle = '#181A24';
    ctx.fillRect(0, 0, 1080, 1350);

    // Subtle CRT Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let y = 0; y < 1350; y += 6) {
      ctx.fillRect(0, y, 1080, 3);
    }

    // 2. Thick Pixel Border Frame
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 20;
    ctx.strokeRect(30, 30, 1080 - 60, 1350 - 60);

    // Inner Gold Pixel Border
    ctx.strokeStyle = '#F6C445';
    ctx.lineWidth = 8;
    ctx.strokeRect(50, 50, 1080 - 100, 1350 - 100);

    // 3. Header Ribbon: 8-Bit Official Record
    ctx.fillStyle = '#000000';
    ctx.fillRect(200, 90, 680, 70);
    ctx.strokeStyle = '#F6C445';
    ctx.lineWidth = 4;
    ctx.strokeRect(200, 90, 680, 70);

    ctx.fillStyle = '#F6C445';
    ctx.font = "700 24px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ OFFICIAL ARCADE RECORD ★', 540, 126);

    // 4. Game Title in Retro Pixel Font
    ctx.fillStyle = '#000000';
    ctx.font = "900 68px 'Press Start 2P', monospace";
    ctx.fillText('SLAPDASH', 546, 246);

    ctx.fillStyle = '#F6C445';
    ctx.fillText('SLAPDASH', 540, 240);

    ctx.fillStyle = '#38BDF8';
    ctx.font = "700 18px 'Press Start 2P', monospace";
    ctx.fillText('8-BIT BOULEVARD ARCADE RUNNER', 540, 300);

    // 5. Giant Retro Pixel Score Box
    const boxX = 120;
    const boxY = 350;
    const boxW = 840;
    const boxH = 340;

    // Hard black shadow
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX + 16, boxY + 16, boxW, boxH);

    // Main box fill
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Score label
    ctx.fillStyle = '#F6C445';
    ctx.font = "700 24px 'Press Start 2P', monospace";
    ctx.fillText('FINAL RUN SCORE', 540, boxY + 65);

    // Score number in pure white pixel font
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "900 82px 'Press Start 2P', monospace";
    ctx.fillText(data.score.toLocaleString(), 540, boxY + 175);

    // Subtag: Pace and High Record
    ctx.fillStyle = '#F6C445';
    ctx.fillRect(240, boxY + 245, 600, 52);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(240, boxY + 245, 600, 52);

    ctx.fillStyle = '#000000';
    ctx.font = "700 16px 'Press Start 2P', monospace";
    ctx.fillText(`PACE: ${data.paceName} · BEST: ${Math.max(data.score, data.highScore).toLocaleString()}`, 540, boxY + 272);

    // 6. Stats Grid (4 Retro Pixel Terminal Boxes)
    const statCards = [
      { label: 'SLAPS', val: `${data.slapsCount}`, color: '#FF4757' },
      { label: 'COMBO', val: `${data.maxCombo}x`, color: '#F6C445' },
      { label: 'DISTANCE', val: `${Math.round(data.distanceRun)}M`, color: '#10B981' },
      { label: 'FEVER', val: `${data.feverCount || 1}X`, color: '#38BDF8' },
    ];

    const gridX = 120;
    const gridY = 740;
    const cardW = 400;
    const cardH = 170;
    const gap = 40;

    statCards.forEach((st, idx) => {
      const cx = gridX + (idx % 2) * (cardW + gap);
      const cy = gridY + Math.floor(idx / 2) * (cardH + 28);

      // Shadow
      ctx.fillStyle = '#000000';
      ctx.fillRect(cx + 10, cy + 10, cardW, cardH);

      // Card
      ctx.fillStyle = '#1E2333';
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 6;
      ctx.strokeRect(cx, cy, cardW, cardH);

      // Text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FDFBF7';
      ctx.font = "700 16px 'Press Start 2P', monospace";
      ctx.fillText(st.label, cx + 28, cy + 50);

      ctx.fillStyle = st.color;
      ctx.font = "900 44px 'Press Start 2P', monospace";
      ctx.fillText(st.val, cx + 28, cy + 122);
    });

    // 7. Footer: Player Signature & Timestamp
    const footerY = 1170;
    ctx.textAlign = 'center';

    ctx.fillStyle = '#F6C445';
    ctx.font = "700 20px 'Press Start 2P', monospace";
    ctx.fillText(`RUNNER: ${data.playerName.toUpperCase()}`, 540, footerY);

    ctx.fillStyle = '#FDFBF7';
    ctx.font = "700 14px 'Press Start 2P', monospace";
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    ctx.fillText(`VERIFIED ON ${dateStr} · SLAPDASH ARCADE`, 540, footerY + 45);

    // Export Canvas to Blob
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create Blob from Canvas'));
    }, 'image/png');
  });
}
