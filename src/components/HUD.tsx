import React from 'react';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Volume2, VolumeX, Pause, Play, Coins, Flame, ShieldAlert, Heart, AlertTriangle } from 'lucide-react';

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
  const totalSegments = 10;
  const activeSegments = Math.round((chaosPercent / 100) * totalSegments);

  const stamina = stats.stamina ?? 100;
  const isLowStamina = stamina <= 25;

  return (
    <>
      {/* 1. Damage Flash: 8-bit Pixel Screen Shake/Flash */}
      {hurtFlash && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-[#FF4757]/30 border-8 border-[#FF4757] animate-pulse" />
      )}

      {/* 2. In-Game Retro Pixel HUD Container */}
      <div className="absolute top-[max(0.35rem,env(safe-area-inset-top))] inset-x-0 px-2 sm:px-3 md:px-6 pointer-events-none z-30 flex flex-col gap-1.5 max-w-5xl mx-auto">
        {/* Top Row: Score + Coins + Pause & Mute controls */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full">
          {/* Top Left: Score & Combo Badge */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <div className="bg-[#181A24] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] px-2 py-1 sm:p-2 flex flex-col">
              <span className="text-[6px] sm:text-[7px] md:text-[8px] font-pixel text-[#F6C445] uppercase tracking-wider">
                SCORE
              </span>
              <span className="font-pixel text-sm sm:text-lg md:text-2xl font-bold text-[#FFFFFF] leading-tight">
                {stats.score.toLocaleString()}
              </span>
            </div>

            {/* Live Pixel Combo Streak Badge */}
            {stats.comboStreak > 1 && (
              <div className="bg-[#FF4757] text-[#FFFFFF] border-2 border-[#000000] px-1.5 py-1 shadow-[2px_2px_0px_#000000] font-pixel text-[7px] sm:text-[8px] md:text-[9px] tracking-wider flex items-center justify-center animate-pulse">
                <span>{stats.comboStreak}x</span>
              </div>
            )}
          </div>

          {/* Desktop/Tablet Center Chaos Meter (hidden on small mobile, shown on sm+) */}
          <div className="hidden sm:block flex-1 max-w-[180px] md:max-w-xs mx-1 pointer-events-auto self-start">
            <div className="bg-[#181A24] border-3 border-[#000000] shadow-[3px_3px_0px_#000000] p-1.5 md:p-2">
              <div className="flex items-center justify-between mb-1 text-[8px] md:text-[9px] font-pixel">
                <span className="flex items-center gap-1 text-[#FDFBF7]">
                  <Flame
                    className={`w-3 h-3 ${
                      stats.feverActive ? 'text-[#FF4757] animate-bounce' : 'text-[#38BDF8]'
                    }`}
                  />
                  <span>CHAOS</span>
                </span>

                <span
                  className={`font-pixel text-[7px] md:text-[9px] px-1 py-0.5 border-2 border-[#000000] ${
                    stats.feverActive
                      ? 'bg-[#FF4757] text-white animate-pixel-blink'
                      : stats.chaosMultiplier >= 8
                      ? 'bg-[#F6C445] text-[#000000]'
                      : stats.chaosMultiplier >= 4
                      ? 'bg-[#38BDF8] text-[#000000]'
                      : 'bg-[#FDFBF7] text-[#000000]'
                  }`}
                >
                  {stats.feverActive ? 'FEVER 16x' : `${stats.chaosMultiplier}x`}
                </span>
              </div>

              {/* Segmented Pixel Meter Track */}
              <div className="w-full bg-[#000000] p-0.5 border-2 border-[#000000] grid grid-cols-10 gap-0.5">
                {Array.from({ length: totalSegments }).map((_, i) => {
                  const isFilled = i < activeSegments;
                  return (
                    <div
                      key={i}
                      className={`h-2 transition-colors ${
                        isFilled
                          ? stats.feverActive
                            ? 'bg-[#FF4757] animate-pulse'
                            : i >= 7
                            ? 'bg-[#F6C445]'
                            : 'bg-[#38BDF8]'
                          : 'bg-[#2A2E3D]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Right: Coins, Distance & Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
            {/* Coins Counter */}
            <div className="bg-[#181A24] text-[#F6C445] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] px-2 py-1 sm:px-2.5 sm:py-1.5 flex items-center gap-1 font-pixel text-[9px] sm:text-[10px] md:text-xs">
              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F6C445] fill-[#F6C445]" />
              <span>{stats.coins}</span>
            </div>

            {/* Distance Display (hidden on very small screens to preserve space) */}
            <div className="hidden xs:flex bg-[#181A24] text-[#38BDF8] border-2 border-[#000000] shadow-[2px_2px_0px_#000000] px-1.5 py-1 font-pixel text-[7px] sm:text-[8px] md:text-[9px]">
              {Math.round(stats.distanceRun)}M
            </div>

            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleMute();
              }}
              title="Toggle Audio (M)"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#FDFBF7] hover:bg-[#F6C445] text-[#000000] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer transition-none select-none"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#FF4757]" /> : <Volume2 className="w-3.5 h-3.5 text-[#000000]" />}
            </button>

            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onTogglePause();
              }}
              title={isPaused ? 'Resume Game' : 'Pause Game'}
              aria-label={isPaused ? 'Resume' : 'Pause'}
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#FDFBF7] hover:bg-[#F6C445] text-[#000000] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer transition-none select-none"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>
        </div>

        {/* Second Row: Dual Health & Chaos Bars on Mobile, Health on Desktop */}
        <div className="flex items-center gap-1.5 w-full pointer-events-auto">
          {/* Health / Stamina Bar (Must slap characters to refill!) */}
          <div className={`flex-1 bg-[#181A24] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] px-2 py-1 sm:p-1.5 flex flex-col ${isLowStamina ? 'border-[#FF4757] animate-pulse' : ''}`}>
            <div className="flex items-center justify-between text-[6px] sm:text-[7px] md:text-[8px] font-pixel mb-0.5">
              <span className="flex items-center gap-1 text-[#FDFBF7]">
                <Heart className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isLowStamina ? 'text-[#FF4757] animate-ping' : 'text-[#10B981] fill-[#10B981]'}`} />
                <span>ENERGY</span>
              </span>
              <span className={`${isLowStamina ? 'text-[#FF4757] font-bold' : stamina > 50 ? 'text-[#10B981]' : 'text-[#F6C445]'}`}>
                {stamina}%
              </span>
            </div>
            <div className="w-full bg-[#000000] p-0.5 border border-[#000000]">
              <div
                className={`h-1.5 sm:h-2 transition-all duration-150 ${
                  isLowStamina
                    ? 'bg-[#FF4757] animate-pulse'
                    : stamina > 50
                    ? 'bg-[#10B981]'
                    : 'bg-[#F6C445]'
                }`}
                style={{ width: `${Math.max(4, stamina)}%` }}
              />
            </div>
            {isLowStamina && (
              <span className="text-[5px] sm:text-[6px] md:text-[7px] font-pixel text-[#FF4757] tracking-wider mt-0.5 animate-pixel-blink">
                SLAP TO RECHARGE!
              </span>
            )}
          </div>

          {/* Mobile-Only Chaos Meter Row (shown when screen < sm) */}
          <div className="sm:hidden flex-1 bg-[#181A24] border-2 border-[#000000] shadow-[2px_2px_0px_#000000] px-2 py-1 flex flex-col">
            <div className="flex items-center justify-between text-[6px] font-pixel mb-0.5">
              <span className="flex items-center gap-1 text-[#FDFBF7]">
                <Flame className={`w-2.5 h-2.5 ${stats.feverActive ? 'text-[#FF4757] animate-bounce' : 'text-[#38BDF8]'}`} />
                <span>CHAOS</span>
              </span>
              <span className={`px-1 py-0.2 border border-[#000000] text-[6px] font-pixel ${
                stats.feverActive ? 'bg-[#FF4757] text-white animate-pixel-blink' : 'bg-[#FDFBF7] text-[#000000]'
              }`}>
                {stats.feverActive ? 'FEVER' : `${stats.chaosMultiplier}x`}
              </span>
            </div>
            <div className="w-full bg-[#000000] p-0.5 border border-[#000000] grid grid-cols-10 gap-0.5">
              {Array.from({ length: totalSegments }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 transition-colors ${
                    i < activeSegments
                      ? stats.feverActive
                        ? 'bg-[#FF4757]'
                        : i >= 7
                        ? 'bg-[#F6C445]'
                        : 'bg-[#38BDF8]'
                      : 'bg-[#2A2E3D]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2b. Subway Surfers Style Chaser On-Screen Danger Alert Banner */}
        {stats.chaserOnScreen && (
          <div className="self-center bg-[#FF4757] text-[#FFFFFF] border-3 border-[#000000] shadow-[4px_4px_0px_#000000] px-3 py-1.5 flex items-center gap-2 font-pixel text-[8px] md:text-[10px] animate-pulse pointer-events-auto">
            <AlertTriangle className="w-4 h-4 text-[#F6C445] fill-[#F6C445] animate-bounce" />
            <span className="font-bold">CHASER ON-SCREEN! 1 MORE HIT = BUSTED!</span>
            <span className="bg-[#000000] text-[#F6C445] px-1.5 py-0.5 border border-[#000000]">
              {(stats.chaserAlertTimer || 0).toFixed(1)}S
            </span>
          </div>
        )}

        {/* 3. Paused Banner Overlay */}
        {isPaused && (
          <div className="self-center mt-6 bg-[#000000]/90 border-4 border-[#F6C445] shadow-[6px_6px_0px_#000000] px-6 py-4 flex flex-col items-center pointer-events-auto">
            <span className="font-pixel text-xl md:text-2xl text-[#F6C445] tracking-widest animate-pulse">
              PAUSED
            </span>
            <span className="font-pixel text-[9px] text-[#FFFFFF] mt-2">
              [PRESS ESC OR RESUME BUTTON]
            </span>
          </div>
        )}
      </div>
    </>
  );
};
