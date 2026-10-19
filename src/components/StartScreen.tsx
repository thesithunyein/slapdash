import React from 'react';
import { CharacterSkin } from '../game/types.ts';
import { CHARACTER_SKINS } from '../game/constants.ts';
import { sounds } from '../game/SoundEngine.ts';
import { SlapDashLogo } from './SlapDashLogo.tsx';
import { Trophy, Volume2, VolumeX, Maximize2, HelpCircle, Coins, Check, Lock } from 'lucide-react';

export interface PaceMode {
  id: 'CRUISE' | 'RUSH' | 'MAYHEM';
  name: string;
  multiplier: number;
  label: string;
  keyHint: string;
  description: string;
}

export const PACE_MODES: PaceMode[] = [
  { id: 'CRUISE', name: 'NORMAL', multiplier: 1.0, label: '1.0X', keyHint: '1', description: 'CLASSIC ARCADE SPEED' },
  { id: 'RUSH', name: 'FAST', multiplier: 1.3, label: '1.3X', keyHint: '2', description: 'TURBO SPRINT SPEED' },
  { id: 'MAYHEM', name: 'MAYHEM', multiplier: 1.65, label: '1.65X', keyHint: '3', description: 'SUPERSONIC CHAOS' },
];

interface StartScreenProps {
  highScore: number;
  totalCoins: number;
  selectedSkin: CharacterSkin;
  unlockedSkinIds: string[];
  selectedPace: PaceMode;
  onSelectPace: (pace: PaceMode) => void;
  onSelectSkin: (skin: CharacterSkin) => void;
  onUnlockSkin: (skin: CharacterSkin) => void;
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  onOpenGuide: () => void;
  onToggleFullscreen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  totalCoins,
  selectedSkin,
  unlockedSkinIds,
  selectedPace,
  onSelectPace,
  onSelectSkin,
  onUnlockSkin,
  onStartGame,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
  onOpenGuide,
  onToggleFullscreen,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-2.5 sm:p-4 md:p-6 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-gradient-to-b from-[#0F172A]/40 via-transparent to-[#0F172A]/60 pointer-events-none select-none overflow-y-auto">
      {/* 1. TOP HEADER: Retro Arcade Score & Coin Counters + Arcade Icon Buttons */}
      <div className="w-full flex items-center justify-between pointer-events-auto shrink-0 z-40 gap-1.5">
        {/* Top Left: Pixel Score & Coins Ticker */}
        <div className="bg-[#181A24] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-pixel text-[#F6C445] uppercase tracking-wider">
              BEST
            </span>
            <span className="font-pixel text-[10px] sm:text-xs md:text-sm font-bold text-[#FFFFFF] leading-none">
              {highScore > 0 ? highScore.toLocaleString() : '00000'}
            </span>
          </div>
          <div className="h-3 sm:h-4 w-[2px] bg-[#FFFFFF]/20" />
          <div className="flex items-center gap-1 sm:gap-1.5 font-pixel text-[9px] sm:text-[10px] md:text-xs text-[#F6C445]">
            <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F6C445] fill-[#F6C445]" />
            <span>{totalCoins.toLocaleString()}</span>
          </div>
        </div>

        {/* Top Right: Pixel Arcade Control Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Leaderboard Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            title="High Scores / Leaderboard"
            aria-label="Open leaderboard"
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 bg-[#FDFBF7] hover:bg-[#F6C445] text-[#000000] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition-none cursor-pointer select-none"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#000000]" />
          </button>

          {/* Guide / How to Play Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenGuide();
            }}
            title="How to Play (? / H)"
            aria-label="Guide and controls"
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 bg-[#FDFBF7] hover:bg-[#F6C445] text-[#000000] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition-none cursor-pointer select-none"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#000000]" />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            title="Toggle Audio (M)"
            aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 bg-[#FDFBF7] hover:bg-[#F6C445] text-[#000000] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition-none cursor-pointer select-none"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF4757]" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#000000]" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleFullscreen();
            }}
            title="Toggle Fullscreen (F)"
            aria-label="Toggle fullscreen"
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 bg-[#FDFBF7] hover:bg-[#F6C445] text-[#000000] border-2 sm:border-3 border-[#000000] shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition-none cursor-pointer select-none"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#000000]" />
          </button>
        </div>
      </div>

      {/* 2. CENTER HERO: Floating Pixel Logo, Pace Selector, Play Button & Character Selection */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto flex flex-col items-center pointer-events-auto py-1 sm:py-2">
        {/* Floating 8-bit Pixel Logo */}
        <div className="animate-float-logo mb-1 sm:mb-2">
          <SlapDashLogo size="md" />
        </div>

        {/* Pace Selector (Retro 8-bit Arcade Segmented Box) */}
        <div className="w-full bg-[#181A24] border-2 sm:border-3 border-[#000000] shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] p-2 sm:p-3 mb-2 sm:mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-pixel text-[#F6C445] uppercase tracking-wider">
              SPEED MODE
            </span>
            <span className="text-[7px] sm:text-[8px] font-pixel text-[#38BDF8]">
              {selectedPace.description}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {PACE_MODES.map((pace) => {
              const isSelected = selectedPace.id === pace.id;
              return (
                <button
                  type="button"
                  key={pace.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectPace(pace);
                  }}
                  className={`py-1.5 sm:py-2 px-1 font-pixel text-[8px] sm:text-[9px] md:text-[10px] tracking-wide transition-none cursor-pointer flex flex-col items-center justify-center border-2 border-[#000000] select-none ${
                    isSelected
                      ? 'bg-[#24698F] text-[#FFFFFF] shadow-[2px_2px_0px_#000000] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-[#FDFBF7] text-[#000000] hover:bg-[#F6C445] shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  <span className="font-bold">{pace.name}</span>
                  <span className="text-[6px] sm:text-[7px] font-pixel opacity-75 mt-0.5">
                    {pace.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dominant Hero PLAY NOW Arcade Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playStart();
            onStartGame();
          }}
          className="w-full py-3.5 sm:py-4 md:py-4.5 bg-[#F6C445] hover:bg-[#FBBF24] active:bg-[#D97706] text-[#000000] font-pixel text-base sm:text-lg md:text-xl tracking-wider border-3 sm:border-4 border-[#000000] shadow-[4px_4px_0px_#000000] sm:shadow-[5px_5px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-none cursor-pointer flex items-center justify-center mb-2 sm:mb-3 animate-pulse-subtle select-none"
        >
          <span className="tracking-widest">▶ PLAY NOW</span>
        </button>

        {/* Character Wardrobe: Retro 8-bit Character Grid */}
        <div className="w-full bg-[#181A24] border-2 sm:border-3 border-[#000000] shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] p-2 sm:p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-pixel text-[#F6C445] uppercase tracking-wider flex items-center gap-1.5">
              <span>RUNNER:</span>
              <span className="text-[#FFFFFF]">{selectedSkin.name}</span>
            </span>
            <span className="text-[7px] sm:text-[8px] font-pixel text-[#10B981]">
              {selectedSkin.speedBonus > 0 ? `+${Math.round(selectedSkin.speedBonus * 100)}% SPD` : 'DEFAULT'}
            </span>
          </div>

          {/* Skin Cards */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {CHARACTER_SKINS.map((skin) => {
              const isUnlocked = unlockedSkinIds.includes(skin.id);
              const isSelected = selectedSkin.id === skin.id;

              return (
                <button
                  type="button"
                  key={skin.id}
                  onClick={() => {
                    sounds.playClick();
                    if (isUnlocked) {
                      onSelectSkin(skin);
                    } else if (totalCoins >= skin.cost) {
                      onUnlockSkin(skin);
                    }
                  }}
                  className={`p-1 sm:p-1.5 border-2 border-[#000000] flex flex-col items-center justify-center transition-none cursor-pointer relative select-none ${
                    isSelected
                      ? 'bg-[#F6C445] shadow-[2px_2px_0px_#000000]'
                      : 'bg-[#FDFBF7] hover:bg-[#EAD7B0] shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  {/* Pixel Voxel Character Swatch */}
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-[#000000] mb-1 flex items-center justify-center"
                    style={{ backgroundColor: skin.shirtColor }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3]" />}
                    {!isUnlocked && <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[2.5]" />}
                  </div>

                  <span className="text-[6px] sm:text-[7px] md:text-[8px] font-pixel text-[#000000] truncate max-w-full leading-tight">
                    {skin.name}
                  </span>

                  {!isUnlocked && (
                    <span className="text-[6px] sm:text-[7px] font-pixel text-[#F6C445] bg-[#000000] px-1 py-0.5 mt-0.5 leading-none">
                      {skin.cost}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Blinking 8-bit Insert Coin / Mobile Controls Prompt */}
        <div className="mt-2.5 sm:mt-3 text-center px-2">
          <span className="font-pixel text-[7px] sm:text-[8px] md:text-[9px] text-[#FDFBF7] tracking-wider animate-pixel-blink">
            [SWIPE / D-PAD TO STEER · SLAP TO RECHARGE]
          </span>
        </div>
      </div>
    </div>
  );
};
