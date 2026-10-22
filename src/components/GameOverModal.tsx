import React from 'react';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { RotateCcw, Home, Trophy, Award } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  paceName?: string;
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
  onRetryLeaderboard?: () => void;
}

import { DinoVectorIcon } from './GameIcons.tsx';

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onHome,
}) => {
  const isNewBest = stats.score > 0 && stats.score >= stats.highScore;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 pointer-events-auto p-4 select-none animate-fadeIn font-['Fredoka']">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-3">
          <div className="w-14 h-14 mx-auto mb-1 flex items-center justify-center bg-gradient-to-br from-[#EF4444] to-[#B91C1C] rounded-2xl border-2 border-white/40 shadow-lg animate-bounce">
            <DinoVectorIcon className="w-9 h-9" bodyColor="#FFF" bellyColor="#FEF08A" />
          </div>
          <h2 className="font-['Lilita_One'] text-3xl sm:text-4xl text-[#FEF08A] tracking-wider uppercase drop-shadow-[0_4px_16px_rgba(249,115,22,0.8)]">
            {stats.gameOverReason === 'BUSTED' ? 'STAMPEDE BUSTED!' : 'RUN COMPLETED!'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#FED7AA] mt-1">
            {stats.gameOverReason === 'EXHAUSTED'
              ? 'Out of Dino Energy · Tail-whip critters to recharge!'
              : stats.gameOverReason === 'BUSTED'
              ? 'Caught by the Enraged Stampede Mob!'
              : `Dashed ${Math.round(stats.distanceRun)} meters across the resort!`}
          </p>
        </div>

        {/* Results Card */}
        <div className="w-full bg-gradient-to-b from-[#2A1E14] via-[#1E1712] to-[#140F0C] border-3 border-[#F97316] rounded-3xl p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col items-center text-[#FFF8E7]">
          {/* Final Score */}
          <span className="text-[11px] text-[#FED7AA] uppercase font-bold tracking-widest mb-0.5">
            Final Dinosaur Score
          </span>
          <span className="font-['Lilita_One'] text-4xl sm:text-5xl text-[#FEF08A] tracking-tight mb-2 drop-shadow">
            {stats.score.toLocaleString()}
          </span>

          {/* New Record Banner */}
          {isNewBest && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-full text-xs font-['Lilita_One'] shadow-md animate-pulse mb-3 border border-white/40">
              <Trophy className="w-4 h-4 fill-black text-black" />
              <span>NEW PERSONAL BEST!</span>
            </div>
          )}

          {stats.globalRankConfirmed && stats.globalRank && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/25 border border-[#10B981]/60 text-[#34D399] rounded-full text-xs font-['Lilita_One'] mb-3">
              <Award className="w-4 h-4" />
              <span>ISLAND RANK #{stats.globalRank}</span>
            </div>
          )}

          {/* 4 Stats Cards */}
          <div className="w-full bg-[#19110B] border-2 border-white/10 rounded-2xl p-3 grid grid-cols-4 gap-2 text-center mb-5">
            <div>
              <div className="text-[10px] text-[#FED7AA] font-bold uppercase">Tail-Whips</div>
              <div className="text-lg text-white font-['Lilita_One'] mt-0.5">
                {stats.slapsCount}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#FED7AA] font-bold uppercase">Max Roar</div>
              <div className="text-lg text-[#F43F5E] font-['Lilita_One'] mt-0.5">
                {stats.maxCombo}x
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#FED7AA] font-bold uppercase">Dino Coins</div>
              <div className="text-lg text-[#FEF08A] font-['Lilita_One'] mt-0.5">
                +{stats.coins}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#FED7AA] font-bold uppercase">Distance</div>
              <div className="text-lg text-[#38BDF8] font-['Lilita_One'] mt-0.5">
                {Math.round(stats.distanceRun)}m
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                sounds.playStart();
                onRestart();
              }}
              className="w-full py-3.5 px-5 bg-gradient-to-b from-[#FFA726] via-[#FB8C00] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-base sm:text-lg tracking-wider uppercase rounded-2xl border-3 border-[#FFE082] shadow-[0_5px_0px_#BF360C] active:translate-y-1 active:shadow-[0_1px_0px_#BF360C] cursor-pointer transition-all flex items-center justify-center gap-2 drop-shadow"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>RUN AGAIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onHome();
              }}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-[#FFF8E7] rounded-2xl font-['Lilita_One'] text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/15 active:scale-95"
            >
              <Home className="w-4 h-4 text-[#FED7AA]" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
