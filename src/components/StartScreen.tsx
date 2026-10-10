import React from 'react';
import { CharacterSkin } from '../game/types.ts';
import { CHARACTER_SKINS } from '../game/constants.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Play, Trophy, Volume2, VolumeX, Flame, Coins, Check, Lock, Sparkles } from 'lucide-react';

interface StartScreenProps {
  highScore: number;
  totalCoins: number;
  selectedSkin: CharacterSkin;
  unlockedSkinIds: string[];
  onSelectSkin: (skin: CharacterSkin) => void;
  onUnlockSkin: (skin: CharacterSkin) => void;
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  totalCoins,
  selectedSkin,
  unlockedSkinIds,
  onSelectSkin,
  onUnlockSkin,
  onStartGame,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-8 bg-gradient-to-b from-sky-900/20 via-transparent to-slate-950/40 pointer-events-none select-none">
      {/* Top Header Bar: Trophy / Leaderboard, Coins, Sound */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Left: Best Score & Leaderboard Trigger */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenLeaderboard();
          }}
          className="flex items-center gap-2.5 bg-white/95 hover:bg-white backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-transform active:scale-95 group text-left"
          title="Open Global Leaderboard"
        >
          <Trophy className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Rankings</span>
            <span className="text-sm font-mono-numbers font-black text-slate-900 leading-tight">
              {highScore > 0 ? highScore.toLocaleString() : 'Leaderboard'}
            </span>
          </div>
        </button>

        {/* Right: Coins Balance & Sound Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-mono-numbers font-black text-slate-900 leading-none">
              {totalCoins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="w-10 h-10 bg-white/95 hover:bg-white text-slate-700 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center transition-transform active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Center: Title & Runner Selection Card */}
      <div className="w-full max-w-sm mx-auto my-auto flex flex-col items-center pointer-events-auto max-h-[88dvh] overflow-y-auto py-1">
        {/* Game Title */}
        <div className="text-center mb-2.5 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-emerald-500/30 text-emerald-700 text-[11px] font-black tracking-widest uppercase mb-1 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>3D STREET RUNNER</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            SLAP<span className="text-emerald-400">DASH</span>
          </h1>
        </div>

        {/* Premium Frosted White Card */}
        <div className="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-4 md:p-5 shadow-[0_20px_60px_rgba(16,185,129,0.2)] flex flex-col items-center shrink-0">
          <div className="w-full text-left mb-2 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">Runner Store</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{unlockedSkinIds.length} / {CHARACTER_SKINS.length} Unlocked</span>
            </span>
          </div>

          {/* Runner Cards */}
          <div className="w-full grid grid-cols-3 gap-2 mb-2.5">
            {CHARACTER_SKINS.map((skin) => {
              const isUnlocked = unlockedSkinIds.includes(skin.id);
              const isSelected = skin.id === selectedSkin.id;
              const canAfford = totalCoins >= skin.cost;

              return (
                <div
                  key={skin.id}
                  className={`p-2 md:p-2.5 rounded-2xl border-2 text-center transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/90 shadow-[0_6px_20px_rgba(16,185,129,0.25)] scale-[1.02]'
                      : isUnlocked
                      ? 'border-slate-200/70 bg-slate-50/80 hover:border-slate-300'
                      : 'border-slate-200/60 bg-slate-100/70 opacity-90'
                  }`}
                >
                  {/* Status Badge */}
                  {isSelected ? (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : !isUnlocked ? (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-sm">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  ) : null}

                  {/* Character Avatar Preview with Hat/Headwear */}
                  <div
                    onClick={() => {
                      if (isUnlocked) {
                        sounds.playClick();
                        onSelectSkin(skin);
                      }
                    }}
                    className={`w-10 h-10 mx-auto rounded-full mb-1 flex items-center justify-center border-2 border-white shadow-md relative cursor-pointer ${
                      !isUnlocked ? 'grayscale-[0.5]' : ''
                    }`}
                    style={{ backgroundColor: skin.shirtColor }}
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-inner relative"
                      style={{ backgroundColor: skin.bodyColor }}
                    >
                      {skin.hat === 'cap' && (
                        <div className="absolute -top-1 -left-0.5 w-5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                      {skin.hat === 'headband' && (
                        <div className="absolute top-0.5 -left-1 w-6 h-1 bg-emerald-500 rounded-full" />
                      )}
                      {skin.hat === 'crown' && (
                        <div className="absolute -top-2 -left-1 text-[9px] leading-none">👑</div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-black text-slate-900 truncate">{skin.name}</div>

                  {/* Action / Perk / Price */}
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onSelectSkin(skin);
                      }}
                      className="text-[10px] font-bold text-emerald-600 mt-1 hover:underline"
                    >
                      {skin.speedBonus > 0 ? `+${Math.round(skin.speedBonus * 100)}% Speed` : 'Balanced'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          onUnlockSkin(skin);
                        } else {
                          sounds.playWhoosh();
                        }
                      }}
                      className={`mt-1 py-1 px-1.5 rounded-xl font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>{skin.cost}</span>
                      <span>🪙</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls Mini Guide */}
          <div className="w-full bg-slate-100/90 border border-slate-200/60 rounded-2xl py-1.5 px-3 mb-3 text-[11px] font-bold text-slate-600 flex items-center justify-center gap-2">
            <span>🕹️ Steer</span>
            <span className="text-slate-300">·</span>
            <span>👋 Space / Tap to Slap</span>
            <span className="text-slate-300">·</span>
            <span>🏃 Escape</span>
          </div>

          {/* Massive Emerald PLAY NOW Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onStartGame();
            }}
            className="w-full py-3.5 md:py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-105 active:scale-95 text-white font-black text-lg uppercase tracking-wider rounded-2xl shadow-[0_12px_36px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 transition-all"
          >
            <Play className="w-5 h-5 md:w-6 md:h-6 fill-white" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </div>

      {/* Bottom spacer for balance */}
      <div className="h-2" />
    </div>
  );
};
