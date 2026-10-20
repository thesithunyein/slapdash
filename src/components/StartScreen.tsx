import React from 'react';
import { CharacterSkin } from '../game/types.ts';
import { MapDefinition } from '../game/maps.ts';
import { sounds } from '../game/SoundEngine.ts';
import { SlapDashLogo } from './SlapDashLogo.tsx';
import {
  Trophy,
  Volume2,
  VolumeX,
  Coins,
  Star,
  Compass,
  Play,
  Settings,
  Shirt,
  Flame,
  Gift,
} from 'lucide-react';

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
  unlockedLevel,
  currentMap,
  isDailyAvailable = false,
  isLevelMode,
  onToggleMode,
  onStartGame,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
  onOpenLevelSelect,
  onOpenMapSelect,
  onOpenDailyRewards,
  onOpenSettings,
  onOpenSkins,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none select-none">
      {/* 1. TOP HEADER: Ultra-Clean & Minimalist */}
      <div className="w-full flex items-center justify-between pointer-events-auto shrink-0 z-40 max-w-4xl mx-auto">
        {/* Left: Clean Arcade Stats (No heavy clunky boxes) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-[#181A24]/90 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-lg shadow-sm">
            <span className="text-[8px] font-pixel text-[#94A3B8]">BEST</span>
            <span className="font-pixel text-xs sm:text-sm font-bold text-white leading-none">
              {highScore > 0 ? highScore.toLocaleString() : '0'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#181A24]/90 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-lg shadow-sm text-[#F6C445]">
            <Coins className="w-3.5 h-3.5 fill-[#F6C445]" />
            <span className="font-pixel text-xs sm:text-sm font-bold text-white leading-none">
              {totalCoins.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Exactly 3 Clean Utility Icons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Sound"
            className="w-9 h-9 bg-[#181A24]/90 hover:bg-[#252A3C] text-white border border-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#EF4444]" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>

          {/* Global Leaderboard */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            title="Leaderboard Rankings"
            aria-label="Leaderboard"
            className="w-9 h-9 bg-[#181A24]/90 hover:bg-[#252A3C] text-white border border-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          >
            <Trophy className="w-4 h-4 text-[#F6C445]" />
          </button>

          {/* Settings Menu */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            title="Game Settings"
            aria-label="Settings"
            className="w-9 h-9 bg-[#181A24]/90 hover:bg-[#252A3C] text-white border border-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4 text-[#94A3B8]" />
          </button>
        </div>
      </div>

      {/* 2. CENTER HERO ZONE: Clean, Focused, Beautiful Breathing Room */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto flex flex-col items-center pointer-events-auto py-4">
        {/* SlapDash Hero Brand Logo (Centered, No distracting images) */}
        <div className="animate-float-logo mb-6">
          <SlapDashLogo size="lg" />
        </div>

        {/* Clean Mode Switcher: Stage Run vs Endless */}
        <div className="w-full bg-[#181A24]/90 backdrop-blur-md p-1 border border-white/10 rounded-xl mb-4 shadow-lg">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleMode(true);
              }}
              className={`py-2 px-3 font-pixel text-[9px] rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                isLevelMode
                  ? 'bg-[#10B981] text-black font-bold shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isLevelMode ? 'fill-black' : 'text-[#94A3B8]'}`} />
              <span>STAGES</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleMode(false);
              }}
              className={`py-2 px-3 font-pixel text-[9px] rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                !isLevelMode
                  ? 'bg-[#F59E0B] text-black font-bold shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${!isLevelMode ? 'fill-black' : 'text-[#94A3B8]'}`} />
              <span>ENDLESS</span>
            </button>
          </div>
        </div>

        {/* Primary Hero PLAY Button - Clean, Confident, Modern Arcade CTA */}
        <button
          type="button"
          onClick={() => {
            sounds.playStart();
            onStartGame();
          }}
          className="w-full py-4 sm:py-5 bg-[#F6C445] hover:bg-[#FBBF24] active:scale-[0.98] text-black font-pixel text-base sm:text-lg tracking-wider rounded-xl shadow-[0_8px_20px_rgba(246,196,69,0.3)] cursor-pointer flex flex-col items-center justify-center transition-all select-none group"
        >
          <div className="flex items-center gap-2.5">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-widest">
              {isLevelMode ? `PLAY STAGE ${unlockedLevel}` : 'START ENDLESS RUN'}
            </span>
          </div>
        </button>

        {/* Minimal Runner Info */}
        <div className="mt-3 flex items-center gap-2 text-[8px] font-pixel text-[#94A3B8]">
          <span className="text-white flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: selectedSkin.shirtColor }}
            />
            {selectedSkin.name}
          </span>
          <span>·</span>
          <span className="text-[#38BDF8]">{currentMap.name}</span>
        </div>

        {/* Keyboard hint */}
        <span className="mt-3 font-pixel text-[7px] text-[#64748B] tracking-wider hidden sm:block">
          PRESS SPACEBAR OR ENTER TO RUN
        </span>
      </div>

      {/* 3. BOTTOM NAVIGATION: Sleek, Minimal, Generously Spaced */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto shrink-0 z-40">
        <div className="bg-[#181A24]/90 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-xl grid grid-cols-4 gap-1.5">
          {/* 1. STAGES */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenLevelSelect();
            }}
            className="py-2.5 px-2 hover:bg-white/5 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-colors"
          >
            <Star className="w-4 h-4 text-[#FDE047] fill-[#FDE047] mb-1" />
            <span className="font-pixel text-[8px] text-white font-bold leading-tight">
              STAGES
            </span>
            <span className="font-pixel text-[6px] text-[#94A3B8] leading-tight mt-0.5">
              LV {unlockedLevel}/100
            </span>
          </button>

          {/* 2. WORLDS */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenMapSelect();
            }}
            className="py-2.5 px-2 hover:bg-white/5 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-colors"
          >
            <Compass className="w-4 h-4 text-[#38BDF8] mb-1" />
            <span className="font-pixel text-[8px] text-white font-bold leading-tight">
              WORLDS
            </span>
            <span className="font-pixel text-[6px] text-[#94A3B8] leading-tight mt-0.5 truncate max-w-full">
              {currentMap.name.split(' ')[0]}
            </span>
          </button>

          {/* 3. SKINS */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenSkins();
            }}
            className="py-2.5 px-2 hover:bg-white/5 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-colors"
          >
            <Shirt className="w-4 h-4 text-[#10B981] mb-1" />
            <span className="font-pixel text-[8px] text-white font-bold leading-tight">
              SKINS
            </span>
            <span className="font-pixel text-[6px] text-[#94A3B8] leading-tight mt-0.5">
              WARDROBE
            </span>
          </button>

          {/* 4. DAILY BONUS */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenDailyRewards?.();
            }}
            className="relative py-2.5 px-2 hover:bg-white/5 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-colors"
          >
            <Gift className={`w-4 h-4 mb-1 ${isDailyAvailable ? 'text-[#F6C445] animate-bounce' : 'text-[#94A3B8]'}`} />
            <span className="font-pixel text-[8px] text-white font-bold leading-tight">
              REWARDS
            </span>
            <span className={`font-pixel text-[6px] leading-tight mt-0.5 ${isDailyAvailable ? 'text-[#10B981] font-bold' : 'text-[#94A3B8]'}`}>
              {isDailyAvailable ? 'READY!' : 'DAILY'}
            </span>
            {isDailyAvailable && (
              <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#181A24] animate-ping" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
