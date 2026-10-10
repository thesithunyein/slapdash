import React, { useState } from 'react';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { RotateCcw, Home, Trophy, Hand, Flame, Coins, ShieldAlert, Share2, Download, Check } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onHome,
  onOpenLeaderboard,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  // Copy score to clipboard
  const handleCopyScore = () => {
    sounds.playClick();
    const text = `🏆 SlapDash Rampage!\nScore: ${stats.score.toLocaleString()} points\n👋 Slaps: ${stats.slapsCount}\n🔥 Max Multiplier: ${stats.maxCombo > 0 ? `${stats.maxCombo}x` : '1x'}\n🪙 Coins: ${stats.coins}\nCan you outrun the mob? Play now!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  // Generate & Download high-res achievement run badge image via canvas
  const handleDownloadCard = () => {
    sounds.playClick();
    setDownloading(true);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient: clean white & emerald
    const grad = ctx.createLinearGradient(0, 0, 0, 720);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, '#F0FDF4');
    grad.addColorStop(1, '#DCFCE7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 720);

    // Decorative Emerald Border
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 620, 700);

    // Header Badge
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(170, 45, 300, 44, 22);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = "900 20px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SLAPDASH CHAMPION', 320, 67);

    // Score Label & Big Value
    ctx.fillStyle = '#64748B';
    ctx.font = "700 16px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('OFFICIAL RUN SCORE', 320, 140);

    ctx.fillStyle = '#0F172A';
    ctx.font = "900 68px 'JetBrains Mono', monospace";
    ctx.fillText(stats.score.toLocaleString(), 320, 205);

    // High Score Badge
    if (isNewHighScore) {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(200, 250, 240, 36, 18);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "900 16px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText('★ NEW HIGH SCORE ★', 320, 268);
    }

    // Stats Grid Container
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(60, 310, 520, 180, 24);
    ctx.fill();
    ctx.stroke();

    // 3 Stat Columns
    const cols = [
      { label: 'SLAPS LANDED', val: `${stats.slapsCount}`, col: 146 },
      { label: 'MAX COMBO', val: `${stats.maxCombo > 0 ? `${stats.maxCombo}x` : '1x'}`, col: 320 },
      { label: 'COINS LOOTED', val: `${stats.coins}`, col: 494 },
    ];

    cols.forEach((c) => {
      ctx.fillStyle = '#64748B';
      ctx.font = "700 13px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText(c.label, c.col, 365);

      ctx.fillStyle = '#059669';
      ctx.font = "900 36px 'JetBrains Mono', monospace";
      ctx.fillText(c.val, c.col, 420);
    });

    // Date & Footer stamp
    ctx.fillStyle = '#94A3B8';
    ctx.font = "600 14px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText(`Recorded on ${new Date().toLocaleDateString()} · Digit7 Tournament Verified`, 320, 540);

    // App Branding
    ctx.fillStyle = '#047857';
    ctx.font = "900 24px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('🏃 SLAPDASH: 3D ARCADE RAMPAGE', 320, 620);

    // Download file
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `slapdash_score_${stats.score}.png`;
    a.click();
    setDownloading(false);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-slap-pop select-none">
      <div className="w-full max-w-sm bg-white/95 border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle Ambient Emerald Flare */}
        <div className="absolute -top-16 inset-x-0 h-28 bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Busted Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-black tracking-widest uppercase mb-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>CAUGHT BY THE MOB!</span>
        </div>

        <h2 className="text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm mb-1.5">
          BUSTED!
        </h2>

        {/* New High Score Celebratory Banner */}
        {isNewHighScore && (
          <div className="mb-2 px-3.5 py-1 bg-amber-50 border border-amber-300 rounded-xl text-amber-700 font-extrabold text-xs tracking-wider flex items-center gap-1.5 animate-pulse">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        {/* Score Display Card */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 my-1.5 shadow-inner">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Final Score</div>
          <div className="text-4xl font-mono-numbers font-black text-slate-900 my-0.5 tracking-tight">
            {stats.score.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-semibold">
            <span>Best:</span>
            <span className="font-mono-numbers text-slate-700">{stats.highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Run Breakdown Grid */}
        <div className="w-full grid grid-cols-3 gap-2 my-1.5 text-left">
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <Hand className="w-3 h-3 text-rose-500" />
              <span>Slaps</span>
            </div>
            <div className="text-lg font-mono-numbers font-black text-slate-900 mt-0.5">
              {stats.slapsCount}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Max Mult</span>
            </div>
            <div className="text-lg font-mono-numbers font-black text-amber-600 mt-0.5">
              {stats.maxCombo > 0 ? `${Math.min(16, Math.max(1, stats.maxCombo))}x` : '1x'}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <Coins className="w-3 h-3 text-emerald-500" />
              <span>Coins</span>
            </div>
            <div className="text-lg font-mono-numbers font-black text-emerald-600 mt-0.5">
              {stats.coins}
            </div>
          </div>
        </div>

        {/* Tournament Actions: Copy & Save Badge */}
        <div className="w-full grid grid-cols-2 gap-2 my-2">
          <button
            onClick={handleCopyScore}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Share Score'}</span>
          </button>

          <button
            onClick={handleDownloadCard}
            disabled={downloading}
            className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Save Badge</span>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full flex items-center gap-2 mt-2">
          <button
            onClick={() => {
              sounds.playClick();
              onHome();
            }}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl border border-slate-200 text-slate-700 flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-sm"
            title="Menu"
          >
            <Home className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            className="p-3.5 bg-amber-50 hover:bg-amber-100 rounded-2xl border border-amber-300 text-amber-700 flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-sm"
            title="Leaderboard"
          >
            <Trophy className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="flex-1 py-3.5 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-105 text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
