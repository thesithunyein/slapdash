import React from 'react';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Volume2, VolumeX, Pause, Play, Coins, Flame, ShieldAlert, Sparkles } from 'lucide-react';

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

  return (
    <>
      {/* 1. Damage Flash: When slipping on banana peel */}
      {hurtFlash && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-[#E25B45]/25 border-8 border-[#E25B45]/60 animate-pulse" />
      )}

      {/* 2. In-Game Tactile HUD Container */}
      <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] inset-x-0 px-3 md:px-6 pointer-events-none z-30 flex flex-col gap-2 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Top Left: Score Card + Health Hearts (Wrackline Style) */}
          <div className="bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl p-2.5 md:p-3 shadow-[0_4px_0_#17181C] flex flex-col pointer-events-auto">
            <span className="text-[10px] font-black text-[#17181C]/60 uppercase tracking-widest leading-none mb-1">
              SCORE
            </span>
            <span className="font-game text-3xl md:text-5xl font-bold text-[#17181C] leading-none tracking-tight">
              {stats.score.toLocaleString()}
            </span>

            {/* Health Hearts */}
            <div
              className="flex items-center gap-1 mt-1.5"
              role="img"
              aria-label="Runner stamina lives"
            >
              {[1, 2, 3].map((heartIndex) => {
                const isFull = stats.chaosMultiplier > 1 || heartIndex <= 2;
                return (
                  <span
                    key={heartIndex}
                    className={`text-sm leading-none ${
                      isFull ? 'text-[#FF4757]' : 'text-[#17181C]/30'
                    }`}
                  >
                    ♥
                  </span>
                );
              })}
              <span className="text-[9px] font-bold text-[#17181C]/50 ml-1 uppercase">
                {stats.feverActive ? 'FEVER' : 'STAMINA'}
              </span>
            </div>

            {/* Live Combo Streak Badge */}
            {stats.comboStreak > 1 && (
              <div className="mt-1.5 bg-[#F6C445] text-[#17181C] border border-[#17181C] rounded-lg px-2 py-0.5 shadow-[0_1px_0_#17181C] font-game text-[10px] md:text-xs tracking-wider flex items-center gap-1 animate-bounce">
                <span>🔥</span>
                <span>{stats.comboStreak}x STREAK!</span>
              </div>
            )}
          </div>

          {/* Top Center: Tactile Chaos & Multiplier Bar */}
          <div className="flex-1 max-w-[190px] md:max-w-xs mx-1 pointer-events-auto">
            <div className="bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl p-2 shadow-[0_4px_0_#17181C]">
              <div className="flex items-center justify-between mb-1 text-[10px] md:text-[11px] font-black text-[#17181C]">
                <span className="flex items-center gap-1">
                  <Flame
                    className={`w-3.5 h-3.5 ${
                      stats.feverActive ? 'text-[#FF4757] animate-bounce' : 'text-[#24698F]'
                    }`}
                  />
                  <span>CHAOS</span>
                </span>

                <span
                  className={`font-game text-xs px-2 py-0.5 rounded-lg border border-[#17181C] ${
                    stats.feverActive
                      ? 'bg-[#FF4757] text-white animate-pulse shadow-[0_2px_0_#17181C]'
                      : stats.chaosMultiplier >= 8
                      ? 'bg-[#F6C445] text-[#17181C] shadow-[0_1px_0_#17181C]'
                      : stats.chaosMultiplier >= 4
                      ? 'bg-[#EAD7B0] text-[#17181C]'
                      : 'bg-white text-[#17181C]'
                  }`}
                >
                  {stats.feverActive ? 'FEVER 16x' : `${stats.chaosMultiplier}x`}
                </span>
              </div>

              {/* Meter Track */}
              <div className="w-full bg-[#EAD7B0]/40 h-2.5 rounded-full overflow-hidden border border-[#17181C] p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    stats.feverActive
                      ? 'bg-gradient-to-r from-[#FF4757] via-[#F6C445] to-[#FF4757] animate-pulse'
                      : stats.chaosLevel > 70
                      ? 'bg-[#F6C445]'
                      : 'bg-[#24698F]'
                  }`}
                  style={{ width: `${chaosPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Top Right: Mob Distance, Coins & Tactile Buttons */}
          <div className="flex items-center gap-1.5 md:gap-2 pointer-events-auto">
            {/* Mob Danger / Proximity Alert */}
            {stats.mobDistance !== undefined && stats.mobDistance < 250 && (
              <div
                className={`bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl px-2 py-1 md:px-2.5 md:py-1.5 shadow-[0_3px_0_#17181C] flex items-center gap-1 font-game text-[10px] md:text-xs tracking-wider ${
                  stats.mobDistance < 80
                    ? 'text-[#FF4757] animate-pulse border-[#FF4757]'
                    : stats.mobDistance < 140
                    ? 'text-[#D97706]'
                    : 'text-[#24698F]'
                }`}
                title={`Mob distance: ${stats.mobDistance} meters`}
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{stats.mobDistance < 80 ? 'CLOSE!' : `${stats.mobDistance}m`}</span>
              </div>
            )}

            {/* Coins Counter */}
            <div className="bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl px-2.5 py-1.5 md:px-3 md:py-2 shadow-[0_3px_0_#17181C] flex items-center gap-1 text-[#17181C] font-mono-numbers font-black text-xs md:text-sm">
              <Coins className="w-3.5 h-3.5 text-[#F6C445] fill-[#F6C445]" />
              <span>{stats.coins}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                sounds.playClick();
                onToggleMute();
              }}
              title="Toggle Audio"
              aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#FDFBF7] hover:bg-[#EAD7B0] border-2 border-[#17181C] shadow-[0_3px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] text-[#17181C] flex items-center justify-center transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#E25B45]" /> : <Volume2 className="w-4 h-4 text-[#17181C]" />}
            </button>

            {/* Pause Toggle */}
            <button
              onClick={() => {
                sounds.playClick();
                onTogglePause();
              }}
              title="Pause Game (ESC / P)"
              aria-label={isPaused ? 'Resume' : 'Pause'}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#FDFBF7] hover:bg-[#EAD7B0] border-2 border-[#17181C] shadow-[0_3px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] text-[#17181C] flex items-center justify-center transition-all cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4 text-[#24698F] fill-[#24698F]" /> : <Pause className="w-4 h-4 text-[#17181C]" />}
            </button>
          </div>
        </div>

        {/* 3. FEVER 16x Full-Width Banner Alert */}
        {stats.feverActive && (
          <div className="max-w-xs md:max-w-sm mx-auto w-full text-center py-1.5 px-4 bg-[#FF4757] text-white font-game text-xs md:text-sm tracking-wider uppercase rounded-xl border-2 border-[#17181C] shadow-[0_4px_0_#17181C] animate-pulse flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>FEVER MODE 16x MULTIPLIER!</span>
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </div>
    </>
  );
};
