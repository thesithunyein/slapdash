import React from 'react';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Volume2, VolumeX, Pause, Play, Flame, Coins, Zap } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isMuted,
  onToggleMute,
  isPaused,
  onTogglePause,
}) => {
  const chaosPercent = Math.min(100, Math.max(0, stats.chaosLevel));

  return (
    <div className="absolute top-0 inset-x-0 p-3 md:p-6 pointer-events-none z-20 flex flex-col gap-2.5 max-w-5xl mx-auto">
      {/* Top Bar: Scores, Chaos Meter, and Action Buttons */}
      <div className="flex items-center justify-between gap-2 md:gap-4 w-full">
        {/* Score & Best */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.08)] pointer-events-auto">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Score</div>
            <div className="text-xl md:text-2xl font-mono-numbers font-black text-slate-900 leading-none tracking-tight">
              {stats.score.toLocaleString()}
            </div>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Best</div>
            <div className="text-sm md:text-base font-mono-numbers font-bold text-slate-500 leading-none">
              {Math.max(stats.score, stats.highScore).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Center: Clean Emerald Chaos Energy Core */}
        <div className="flex-1 max-w-[210px] md:max-w-xs mx-1 md:mx-4">
          <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Flame className={`w-3.5 h-3.5 ${stats.chaosLevel > 30 ? 'animate-bounce text-emerald-500' : 'text-emerald-600'}`} />
                <span className="tracking-wide">CHAOS</span>
              </span>
              <span
                className={`font-mono-numbers font-black text-xs px-2 py-0.5 rounded-lg shadow-sm transition-all ${
                  stats.feverActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white animate-pulse'
                    : stats.chaosMultiplier >= 8
                    ? 'bg-rose-500 text-white'
                    : stats.chaosMultiplier >= 4
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {stats.feverActive ? 'FEVER 16x' : `${stats.chaosMultiplier}x`}
              </span>
            </div>

            {/* Meter Bar with Vibrant Emerald Fill */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  stats.feverActive
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-pulse'
                    : stats.chaosLevel > 70
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                }`}
                style={{ width: `${chaosPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Coins, Sound, & Pause Buttons */}
        <div className="flex items-center gap-1.5 md:gap-2 pointer-events-auto">
          {/* Coin Counter */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xl px-3 py-2 rounded-2xl border border-slate-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.08)] text-slate-800 font-mono-numbers font-black text-xs md:text-sm">
            <Coins className="w-4 h-4 text-amber-500 drop-shadow-sm" />
            <span>{stats.coins}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="w-9 h-9 md:w-10 md:h-10 bg-white/95 hover:bg-white text-slate-700 rounded-2xl border border-slate-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.08)] flex items-center justify-center transition-transform active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Pause Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onTogglePause();
            }}
            aria-label={isPaused ? 'Resume' : 'Pause'}
            className="w-9 h-9 md:w-10 md:h-10 bg-white/95 hover:bg-white text-slate-700 rounded-2xl border border-slate-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.08)] flex items-center justify-center transition-transform active:scale-95"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" /> : <Pause className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* FEVER RUN Full-Width Banner Alert */}
      {stats.feverActive && (
        <div className="max-w-md mx-auto w-full text-center py-2 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] animate-pulse flex items-center justify-center gap-2 border border-white/40">
          <Zap className="w-4 h-4 fill-white animate-spin" />
          <span>FEVER RUN ACTIVE · RAM OBSTACLES!</span>
          <Zap className="w-4 h-4 fill-white animate-spin" />
        </div>
      )}

      {/* App Store Combo Banner */}
      {stats.comboStreak >= 3 && !stats.feverActive && (
        <div className="max-w-xs mx-auto text-center py-1.5 px-4 bg-white/95 border border-emerald-400/50 rounded-full backdrop-blur-xl text-emerald-700 font-black text-xs tracking-wider uppercase shadow-[0_4px_20px_rgba(16,185,129,0.2)] animate-pulse">
          {stats.comboStreak >= 10
            ? `⚡ GODLIKE SPREE (${stats.comboStreak}x)!`
            : stats.comboStreak >= 7
            ? `💥 UNSTOPPABLE (${stats.comboStreak}x)!`
            : stats.comboStreak >= 5
            ? `🔥 SAVAGE SLAPPER (${stats.comboStreak}x)!`
            : `✨ SWEET COMBO (${stats.comboStreak}x)!`}
        </div>
      )}
    </div>
  );
};
