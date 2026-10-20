import React from 'react';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Volume2, VolumeX, Pause, Play, Coins, Flame, Heart } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  hurtFlash?: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isMuted,
  onToggleMute,
  isPaused,
  onTogglePause,
  hurtFlash = false,
}) => {
  const chaosPercent = Math.min(100, Math.max(0, stats.chaosLevel));
  const stamina = stats.stamina ?? 100;
  const isLowStamina = stamina <= 25;

  return (
    <>
      {/* 1. Subtle Damage Flash */}
      {hurtFlash && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-[#FF4757]/20 animate-pulse" />
      )}

      {/* 2. Soft Ambient Fever Vignette */}
      {stats.feverActive && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-[#FF4757]/15 via-transparent to-[#FF4757]/15 animate-pulse" />
      )}

      {/* 3. Soft Chaser Warning */}
      {stats.chaserOnScreen && !stats.feverActive && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-[#EF4444]/15 via-transparent to-transparent animate-pulse" />
      )}

      {/* 4. Ultra-Clean Minimal HUD Container */}
      <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] inset-x-0 px-3 sm:px-6 pointer-events-none z-30 flex flex-col gap-2 max-w-4xl mx-auto">
        {/* Top Bar: Score + Energy + Coins + Utility Controls */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Top Left: Score & Combo */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-[#181A24]/90 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 flex flex-col shadow-sm">
              <span className="text-[7px] font-pixel text-[#94A3B8] uppercase tracking-wider">
                SCORE
              </span>
              <span className="font-pixel text-base sm:text-xl font-bold text-white leading-tight">
                {stats.score.toLocaleString()}
              </span>
            </div>

            {stats.comboStreak > 1 && (
              <div className="bg-[#FF4757] text-white rounded-lg px-2 py-1 shadow-sm font-pixel text-[8px] sm:text-[9px] tracking-wider flex items-center justify-center animate-pulse">
                <span>{stats.comboStreak}x</span>
              </div>
            )}
          </div>

          {/* Center: Sleek Chaos & Energy Pill (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center gap-3 bg-[#181A24]/90 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 pointer-events-auto shadow-sm">
            {/* Stamina */}
            <div className="flex items-center gap-2">
              <Heart className={`w-3.5 h-3.5 ${isLowStamina ? 'text-[#FF4757] animate-ping' : 'text-[#10B981] fill-[#10B981]'}`} />
              <div className="w-20 bg-black/50 h-2 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    isLowStamina ? 'bg-[#FF4757]' : stamina > 50 ? 'bg-[#10B981]' : 'bg-[#F6C445]'
                  }`}
                  style={{ width: `${Math.max(4, stamina)}%` }}
                />
              </div>
            </div>

            <span className="text-white/20">|</span>

            {/* Chaos */}
            <div className="flex items-center gap-2">
              <Flame className={`w-3.5 h-3.5 ${stats.feverActive ? 'text-[#FF4757] animate-bounce' : 'text-[#38BDF8]'}`} />
              <div className="w-20 bg-black/50 h-2 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    stats.feverActive ? 'bg-[#FF4757] animate-pulse' : 'bg-[#38BDF8]'
                  }`}
                  style={{ width: `${chaosPercent}%` }}
                />
              </div>
              <span className="font-pixel text-[8px] text-[#F6C445] font-bold">
                {stats.feverActive ? '16x' : `${stats.chaosMultiplier}x`}
              </span>
            </div>
          </div>

          {/* Top Right: Coins, Distance & Actions */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Coins */}
            <div className="bg-[#181A24]/90 backdrop-blur-md text-[#F6C445] border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 font-pixel text-[9px] sm:text-xs shadow-sm">
              <Coins className="w-3.5 h-3.5 fill-[#F6C445]" />
              <span className="font-bold text-white">{stats.coins}</span>
            </div>

            {/* Distance */}
            <div className="bg-[#181A24]/90 backdrop-blur-md text-[#38BDF8] border border-white/10 rounded-xl px-2.5 py-1.5 font-pixel text-[9px] sm:text-xs shadow-sm">
              {Math.round(stats.distanceRun)}M
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleMute();
              }}
              title="Toggle Audio"
              aria-label="Sound"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-[#181A24]/90 hover:bg-[#252A3C] text-white border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#FF4757]" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
            </button>

            {/* Pause Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onTogglePause();
              }}
              title="Pause"
              aria-label="Pause"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-[#181A24]/90 hover:bg-[#252A3C] text-white border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>
        </div>

        {/* Mobile-Only Slim Stamina & Chaos Strip */}
        <div className="sm:hidden flex items-center gap-2 bg-[#181A24]/90 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1.5 pointer-events-auto">
          {/* Energy */}
          <div className="flex-1 flex items-center gap-1.5">
            <Heart className={`w-3 h-3 ${isLowStamina ? 'text-[#FF4757]' : 'text-[#10B981]'}`} />
            <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isLowStamina ? 'bg-[#FF4757]' : 'bg-[#10B981]'}`}
                style={{ width: `${Math.max(4, stamina)}%` }}
              />
            </div>
          </div>

          {/* Chaos */}
          <div className="flex-1 flex items-center gap-1.5">
            <Flame className={`w-3 h-3 ${stats.feverActive ? 'text-[#FF4757]' : 'text-[#38BDF8]'}`} />
            <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${stats.feverActive ? 'bg-[#FF4757]' : 'bg-[#38BDF8]'}`}
                style={{ width: `${chaosPercent}%` }}
              />
            </div>
            <span className="font-pixel text-[7px] text-[#F6C445]">
              {stats.feverActive ? '16x' : `${stats.chaosMultiplier}x`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
