import React from 'react';
import { CharacterSkin } from '../game/types.ts';
import { MapDefinition } from '../game/maps.ts';
import { sounds } from '../game/SoundEngine.ts';
import { PartysaurLogo } from './SlapDashLogo.tsx';
import {
  Trophy,
  Volume2,
  VolumeX,
  Coins,
  Gift,
  HelpCircle,
} from 'lucide-react';

import { DinoVectorIcon } from './GameIcons.tsx';

export interface PaceMode {
  id: 'CRUISE' | 'RUSH' | 'MAYHEM';
  name: string;
  multiplier: number;
  label: string;
  keyHint: string;
  description: string;
}

export const PACE_MODES: PaceMode[] = [
  { id: 'CRUISE', name: 'BEACH CHILL', multiplier: 1.0, label: '1.0X', keyHint: '1', description: 'SUNNY' },
  { id: 'RUSH', name: 'TURBO DINO', multiplier: 1.3, label: '1.3X', keyHint: '2', description: 'SPEEDY' },
  { id: 'MAYHEM', name: 'PRIMAL MAYHEM', multiplier: 1.65, label: '1.65X', keyHint: '3', description: 'CHAOS' },
];

interface StartScreenProps {
  highScore: number;
  totalCoins: number;
  selectedSkin: CharacterSkin;
  unlockedSkinIds: string[];
  selectedPace: PaceMode;
  unlockedLevel: number;
  totalStars: number;
  currentMap: MapDefinition;
  claimableAchievementsCount: number;
  isDailyAvailable?: boolean;
  unclaimedMissionsCount?: number;
  isLevelMode: boolean;
  onToggleMode: (levelMode: boolean) => void;
  onSelectPace: (pace: PaceMode) => void;
  onSelectSkin: (skin: CharacterSkin) => void;
  onUnlockSkin: (skin: CharacterSkin) => void;
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  onOpenLevelSelect: () => void;
  onOpenMapSelect: () => void;
  onOpenAchievements: () => void;
  onOpenDailyRewards?: () => void;
  onOpenDailyMissions?: () => void;
  onOpenPWAInstall?: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenSkins: () => void;
  onToggleFullscreen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  totalCoins,
  selectedSkin,
  currentMap,
  unclaimedMissionsCount = 0,
  isDailyAvailable = false,
  onStartGame,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
  onOpenMapSelect,
  onOpenDailyRewards,
  onOpenDailyMissions,
  onOpenGuide,
  onOpenSettings,
  onOpenSkins,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-2 sm:p-5 md:p-6 pointer-events-none select-none overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]">
      {/* 3D Gameplay Scene Passthrough Layer: Menu background directly matches live 3D gameplay */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Cinematic arcade top and bottom vignettes to keep UI buttons ultra crisp while letting 3D track show through */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111927]/85 via-black/15 to-[#111927]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
      </div>

      {/* Top Header: Responsive Claymorphic Tropical Badges */}
      <header className="w-full flex items-center justify-between pointer-events-auto shrink-0 z-40 px-1 sm:px-4">
        {/* Top-Left: Active Dinosaur Pill */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenSkins();
          }}
          className="flex items-center gap-1.5 sm:gap-2 bg-[#FF7B1C]/90 hover:bg-[#FF8F3D] text-white border-2 border-[#FFE8A3] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.35)] backdrop-blur-md active:scale-95 transition-all cursor-pointer"
        >
          <DinoVectorIcon bodyColor={selectedSkin.bodyColor} bellyColor={selectedSkin.shirtColor} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#FEF08A] leading-tight">
              Runner
            </span>
            <span className="text-[11px] sm:text-xs md:text-sm font-['Lilita_One'] text-white leading-tight truncate max-w-[90px] sm:max-w-none">
              {selectedSkin.name}
            </span>
          </div>
        </button>

        {/* Top-Right: Coins, High Score, Daily Gift, Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Best Score Trophy */}
          <div className="bg-[#182335]/85 backdrop-blur-md border-2 border-[#FBBF24]/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FDE047] fill-[#FACC15] shrink-0 drop-shadow" />
            <div className="flex flex-col">
              <span className="text-[7px] sm:text-[8px] font-bold text-[#94A3B8] uppercase tracking-wider leading-none">
                Best
              </span>
              <span className="font-['Lilita_One'] text-[11px] sm:text-xs md:text-sm text-[#FEF08A] leading-none mt-0.5">
                {highScore > 0 ? highScore.toLocaleString() : '0'}
              </span>
            </div>
          </div>

          {/* Dino Fossils & Coins */}
          <div className="bg-[#182335]/85 backdrop-blur-md border-2 border-[#F97316]/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FACC15] fill-[#FACC15] shrink-0 drop-shadow" />
            <div className="flex flex-col">
              <span className="text-[7px] sm:text-[8px] font-bold text-[#94A3B8] uppercase tracking-wider leading-none">
                Coins
              </span>
              <span className="font-['Lilita_One'] text-[11px] sm:text-xs md:text-sm text-[#FBBF24] leading-none mt-0.5">
                {totalCoins.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Daily Egg Hatch Rewards */}
          {onOpenDailyRewards && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenDailyRewards();
              }}
              title="Daily Dino Egg Hatch"
              className={`h-8 sm:h-10 px-2 sm:px-3 bg-[#182335]/90 hover:bg-[#202E44] border-2 rounded-xl sm:rounded-2xl flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95 ${
                isDailyAvailable
                  ? 'border-[#FACC15] text-[#FACC15] ring-2 ring-[#FACC15]/50 animate-pulse'
                  : 'border-white/20 text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#FACC15]" />
              <span className="text-xs font-['Lilita_One'] hidden md:inline text-white">REWARDS</span>
              {isDailyAvailable && (
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              )}
            </button>
          )}

          {/* How to play / Guide */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenGuide();
            }}
            title="How to Play"
            aria-label="Guide"
            className="w-8 h-8 sm:w-10 sm:h-10 bg-[#182335]/90 hover:bg-[#202E44] text-white border-2 border-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38BDF8]" />
          </button>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle Sound"
            className="w-8 h-8 sm:w-10 sm:h-10 bg-[#182335]/90 hover:bg-[#202E44] text-white border-2 border-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F43F5E]" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#34D399]" />}
          </button>
        </div>
      </header>

      {/* Main Content Area: Left Stack Menu matching reference screenshot */}
      <div className="flex-1 flex items-center justify-start px-2 sm:px-8 md:px-16 pointer-events-none z-30 py-2 sm:py-4">
        {/* Left-Aligned Menu Column (Optimized with responsive scaling so it never overflows on mobile) */}
        <div className="flex flex-col items-start gap-1.5 sm:gap-2.5 pointer-events-auto max-w-[210px] sm:max-w-[260px] md:max-w-xs w-full max-h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar">
          {/* 3D PARTYSALUR DINO MAYHEM Logo above the buttons */}
          <div className="w-full max-w-[190px] sm:max-w-[240px] md:max-w-[280px] -ml-1 -mb-1 sm:-mb-2 transition-transform duration-300 hover:scale-[1.02]">
            <PartysaurLogo size="sm" showSubtitle={false} />
          </div>

          {/* Vertical Stacked Chunky Orange Buttons (Exact design from uploaded image) */}
          <div className="flex flex-col gap-1.5 sm:gap-2.5 w-full">
            {/* 1. PLAY BUTTON (Hero primary button) */}
            <button
              type="button"
              onClick={() => {
                sounds.playStart();
                onStartGame();
              }}
              className="w-full py-2.5 sm:py-3.5 md:py-4 px-4 sm:px-6 bg-gradient-to-b from-[#FFA726] via-[#FB8C00] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-base sm:text-xl md:text-2xl tracking-wider uppercase rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-3 border-[#FFE082] shadow-[0_4px_0px_#BF360C,0_8px_16px_rgba(0,0,0,0.45)] sm:shadow-[0_6px_0px_#BF360C,0_10px_20px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0px_#BF360C] cursor-pointer transition-all flex items-center justify-center text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            >
              PLAY
            </button>

            {/* 2. OPTIONS / SETTINGS BUTTON */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenSettings();
              }}
              className="w-full py-2 sm:py-2.5 md:py-3 px-3.5 sm:px-5 bg-gradient-to-b from-[#FFA726] via-[#FB8C00] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-xs sm:text-base md:text-lg tracking-wider uppercase rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-3 border-[#FFE082] shadow-[0_3px_0px_#BF360C,0_6px_12px_rgba(0,0,0,0.4)] sm:shadow-[0_5px_0px_#BF360C,0_8px_16px_rgba(0,0,0,0.45)] active:translate-y-1 active:shadow-[0_1px_0px_#BF360C] cursor-pointer transition-all flex items-center justify-center text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            >
              OPTIONS
            </button>

            {/* 3. DINO SKINS BUTTON */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenSkins();
              }}
              className="relative w-full py-2 sm:py-2.5 md:py-3 px-3.5 sm:px-5 bg-gradient-to-b from-[#FFA726] via-[#FB8C00] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-xs sm:text-base md:text-lg tracking-wider uppercase rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-3 border-[#FFE082] shadow-[0_3px_0px_#BF360C,0_6px_12px_rgba(0,0,0,0.4)] sm:shadow-[0_5px_0px_#BF360C,0_8px_16px_rgba(0,0,0,0.45)] active:translate-y-1 active:shadow-[0_1px_0px_#BF360C] cursor-pointer transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            >
              <span>DINO SKINS</span>
              <span
                className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-white sm:border-2 shadow-xs"
                style={{ backgroundColor: selectedSkin.bodyColor }}
                title={selectedSkin.name}
              />
            </button>

            {/* 4. MAPS / BIOMES BUTTON */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenMapSelect();
              }}
              className="w-full py-2 sm:py-2.5 md:py-3 px-3.5 sm:px-5 bg-gradient-to-b from-[#FFA726] via-[#FB8C00] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-xs sm:text-base md:text-lg tracking-wider uppercase rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-3 border-[#FFE082] shadow-[0_3px_0px_#BF360C,0_6px_12px_rgba(0,0,0,0.4)] sm:shadow-[0_5px_0px_#BF360C,0_8px_16px_rgba(0,0,0,0.45)] active:translate-y-1 active:shadow-[0_1px_0px_#BF360C] cursor-pointer transition-all flex items-center justify-between text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span>MAPS:</span>
                <span className="text-[#FEF08A] truncate">{currentMap ? currentMap.name : 'BIOMES'}</span>
              </div>
              {currentMap && (
                <span
                  className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-white sm:border-2 shadow-xs shrink-0 ml-1.5"
                  style={{ backgroundColor: currentMap.badgeColor }}
                  title={currentMap.name}
                />
              )}
            </button>

            {/* 5. MISSIONS BUTTON */}
            {onOpenDailyMissions && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenDailyMissions();
                }}
                className="relative w-full py-2 sm:py-2.5 md:py-3 px-3.5 sm:px-5 bg-gradient-to-b from-[#FFA726] via-[#FB8C00] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-xs sm:text-base md:text-lg tracking-wider uppercase rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-3 border-[#FFE082] shadow-[0_3px_0px_#BF360C,0_6px_12px_rgba(0,0,0,0.4)] sm:shadow-[0_5px_0px_#BF360C,0_8px_16px_rgba(0,0,0,0.45)] active:translate-y-1 active:shadow-[0_2px_0px_#BF360C] cursor-pointer transition-all flex items-center justify-center text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              >
                <span>MISSIONS</span>
                {unclaimedMissionsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#10B981] text-white font-['Lilita_One'] text-[9px] border border-white shadow-md animate-bounce">
                    {unclaimedMissionsCount}
                  </span>
                )}
              </button>
            )}

            {/* 6. LEADERBOARDS / HALL OF FAME */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenLeaderboard();
              }}
              className="w-full py-2 sm:py-2.5 md:py-3 px-3.5 sm:px-5 bg-gradient-to-b from-[#FFA726] via-[#FB8C00] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-xs sm:text-base md:text-lg tracking-wider uppercase rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-3 border-[#FFE082] shadow-[0_3px_0px_#BF360C,0_6px_12px_rgba(0,0,0,0.4)] sm:shadow-[0_5px_0px_#BF360C,0_8px_16px_rgba(0,0,0,0.45)] active:translate-y-1 active:shadow-[0_2px_0px_#BF360C] cursor-pointer transition-all flex items-center justify-center text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            >
              HALL OF FAME
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hint Banner: HIDDEN ON MOBILE (hidden md:flex) as requested by user */}
      <footer className="hidden md:flex w-full items-center justify-center pointer-events-auto shrink-0 z-40 pb-1">
        <div className="bg-[#111927]/85 backdrop-blur-md px-5 py-2 rounded-2xl border-2 border-white/15 flex items-center gap-3 text-xs sm:text-sm font-['Fredoka'] font-medium text-amber-100 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/20 text-xs text-[#FDE047] font-['Lilita_One']">SPACE</kbd>
            <span>Tail-Whip / Jump</span>
          </div>
          <span className="text-white/30">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/20 text-xs text-[#38BDF8] font-['Lilita_One']">A / D</kbd>
            <span>Dodge Lanes</span>
          </div>
          <span className="text-white/30">·</span>
          <span className="text-[#34D399] font-bold">Swipe & Tap on Touch!</span>
        </div>
      </footer>
    </div>
  );
};
