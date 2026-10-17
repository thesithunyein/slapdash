import React, { useState } from 'react';
import { CharacterSkin } from '../game/types.ts';
import { CHARACTER_SKINS } from '../game/constants.ts';
import { sounds } from '../game/SoundEngine.ts';
import { SlapDashLogo } from './SlapDashLogo.tsx';
import { Trophy, Volume2, VolumeX, Maximize2, HelpCircle, Coins, Check, Lock, Sparkles } from 'lucide-react';

export interface PaceMode {
  id: 'CRUISE' | 'RUSH' | 'MAYHEM';
  name: string;
  multiplier: number;
  label: string;
  keyHint: string;
  description: string;
}

export const PACE_MODES: PaceMode[] = [
  { id: 'CRUISE', name: 'CRUISE', multiplier: 1.0, label: '1.0X', keyHint: '1', description: 'Relaxed speed & forgiving mob' },
  { id: 'RUSH', name: 'RUSH', multiplier: 1.5, label: '1.5X', keyHint: '2', description: 'Classic fast arcade intensity' },
  { id: 'MAYHEM', name: 'MAYHEM', multiplier: 2.5, label: '2.5X', keyHint: '3', description: 'Turbo chaos & ruthless mob' },
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
  const [showWardrobe, setShowWardrobe] = useState<boolean>(false);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-6 bg-[#D6E6F2]/30 pointer-events-none select-none overflow-y-auto">
      {/* 1. TOP HEADER: Best Score Badge (Left) & Tactile Buttons (Right) */}
      <div className="w-full flex items-center justify-between pointer-events-auto shrink-0 z-40">
        {/* Top Left: Best Record Badge */}
        <div className="flex items-center gap-2">
          {highScore > 0 ? (
            <div className="bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl px-4 py-2 shadow-[0_3px_0_#17181C] flex items-center gap-2.5">
              <span className="text-[10px] font-black text-[#17181C]/60 uppercase tracking-widest">
                BEST
              </span>
              <span className="font-game text-xl font-bold text-[#24698F] leading-none">
                {highScore.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl px-3.5 py-2 shadow-[0_3px_0_#17181C] flex items-center gap-2">
              <span className="text-[10px] font-black text-[#17181C]/70 uppercase tracking-widest">
                ARCADE STAGE
              </span>
            </div>
          )}

          {/* Coins Badge */}
          <div className="bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl px-3.5 py-2 shadow-[0_3px_0_#17181C] flex items-center gap-1.5 font-mono-numbers font-black text-xs md:text-sm text-[#17181C]">
            <Coins className="w-4 h-4 text-[#F6C445] fill-[#F6C445]" />
            <span>{totalCoins.toLocaleString()}</span>
          </div>
        </div>

        {/* Top Right: Tactile 3D Action Buttons */}
        <div className="flex items-center gap-2 md:gap-2.5">
          {/* Leaderboard Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            title="Global Leaderboard"
            aria-label="Open leaderboard"
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#FDFBF7] hover:bg-[#EAD7B0] border-2 border-[#17181C] shadow-[0_3px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] text-[#17181C] flex items-center justify-center transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#F6C445]" />
          </button>

          {/* Guide / How to Play Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenGuide();
            }}
            title="How to Play (? / H)"
            aria-label="Guide and controls"
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#FDFBF7] hover:bg-[#EAD7B0] border-2 border-[#17181C] shadow-[0_3px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] text-[#17181C] font-bold text-base flex items-center justify-center transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#17181C]" />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            title="Toggle Audio (M)"
            aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#FDFBF7] hover:bg-[#EAD7B0] border-2 border-[#17181C] shadow-[0_3px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] text-[#17181C] flex items-center justify-center transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#E25B45]" /> : <Volume2 className="w-4 h-4 text-[#17181C]" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleFullscreen();
            }}
            title="Toggle Fullscreen"
            aria-label="Toggle fullscreen"
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#FDFBF7] hover:bg-[#EAD7B0] border-2 border-[#17181C] shadow-[0_3px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] text-[#17181C] flex items-center justify-center transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-[#17181C]" />
          </button>
        </div>
      </div>

      {/* 2. CENTER HERO: Logo, Pace Selector, Play Button & Runner Wardrobe */}
      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center pointer-events-auto py-2">
        {/* SlapDash Neo-Brutalist Logo */}
        <SlapDashLogo size="md" className="mb-3 md:mb-4" />

        {/* Pace / Difficulty Selector (Wrackline Style) */}
        <div className="w-full bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl p-2.5 shadow-[0_4px_0_#17181C] mb-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-black text-[#17181C]/60 uppercase tracking-widest">
              SELECT STREET PACE
            </span>
            <span className="text-[10px] font-bold text-[#24698F]">
              {selectedPace.description}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PACE_MODES.map((pace) => {
              const isSelected = selectedPace.id === pace.id;
              return (
                <button
                  key={pace.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectPace(pace);
                  }}
                  className={`py-2 px-2 rounded-xl font-game text-xs md:text-sm tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center border-2 border-[#17181C] ${
                    isSelected
                      ? 'bg-[#24698F] text-white shadow-[0_3px_0_#10364C] translate-y-[-2px]'
                      : 'bg-white text-[#17181C]/75 hover:bg-[#EAD7B0]/60 shadow-[0_2px_0_#17181C]'
                  }`}
                >
                  <span>{pace.name}</span>
                  <span className="text-[10px] font-ui font-bold opacity-80 mt-0.5 leading-none">
                    {pace.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Giant Tactile PLAY Button */}
        <button
          onClick={() => {
            sounds.playStart();
            onStartGame();
          }}
          className="w-full py-4 rounded-2xl bg-[#F6C445] hover:bg-[#EAD7B0] text-[#17181C] font-game text-2xl md:text-3xl tracking-wider border-3 border-[#17181C] shadow-[0_6px_0_#17181C] active:translate-y-[2px] active:shadow-[0_2px_0_#17181C] transition-all cursor-pointer flex items-center justify-center gap-3 mb-3.5"
        >
          <span>RUN BOULEVARD</span>
        </button>

        {/* Character Wardrobe Toggle & Selector */}
        <div className="w-full bg-[#FDFBF7] border-2 border-[#17181C] rounded-2xl p-3 shadow-[0_4px_0_#17181C]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-[#17181C]/60 uppercase tracking-widest flex items-center gap-1.5">
              <span>RUNNER:</span>
              <span className="text-[#17181C] font-game text-xs">{selectedSkin.name}</span>
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                setShowWardrobe(!showWardrobe);
              }}
              className="text-[10px] font-black uppercase text-[#24698F] underline decoration-dotted cursor-pointer hover:text-[#17181C]"
            >
              {showWardrobe ? 'HIDE WARDROBE' : 'CHANGE RUNNER'}
            </button>
          </div>

          {/* Skin Cards (Expanded or Compact) */}
          <div className="grid grid-cols-4 gap-2">
            {CHARACTER_SKINS.map((skin) => {
              const isUnlocked = unlockedSkinIds.includes(skin.id);
              const isSelected = selectedSkin.id === skin.id;

              return (
                <button
                  key={skin.id}
                  onClick={() => {
                    sounds.playClick();
                    if (isUnlocked) {
                      onSelectSkin(skin);
                    } else if (totalCoins >= skin.cost) {
                      onUnlockSkin(skin);
                    }
                  }}
                  className={`p-1.5 rounded-xl border-2 border-[#17181C] flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#EAD7B0] shadow-[0_2px_0_#17181C]'
                      : 'bg-white hover:bg-[#FAF6ED] shadow-[0_1px_0_#17181C]'
                  }`}
                >
                  {/* Swatch / Avatar */}
                  <div
                    className="w-8 h-8 rounded-full border-2 border-[#17181C] mb-1 flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: skin.shirtColor }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    {!isUnlocked && <Lock className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                  </div>

                  <span className="text-[9px] font-bold text-[#17181C] truncate max-w-full leading-tight">
                    {skin.name}
                  </span>

                  {!isUnlocked && (
                    <span className="text-[8px] font-black text-[#F6C445] bg-[#17181C] px-1 rounded-sm mt-0.5 leading-none">
                      {skin.cost}🪙
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ZONE: Instant Guide (Wrackline Style) */}
      <div className="shrink-0 w-full max-w-md mx-auto pointer-events-auto mt-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:flex md:flex-wrap md:items-center md:justify-center md:gap-4 bg-[#FDFBF7]/95 border-2 border-[#17181C] px-4 py-2.5 rounded-2xl shadow-[0_3px_0_#17181C] text-[11px] font-bold text-[#17181C] text-center">
          <span>DODGE PEELS</span>
          <span className="text-[#17181C]/25 hidden md:inline">|</span>
          <span>SLAP CROWD</span>
          <span className="text-[#17181C]/25 hidden md:inline">|</span>
          <span>16x FEVER</span>
          <span className="text-[#17181C]/25 hidden md:inline">|</span>
          <span>OUTRUN MOB</span>
        </div>
      </div>
    </div>
  );
};
