import React from 'react';
import { X, Crown } from 'lucide-react';
import { LeaderboardEntry } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { SlapDashPixelMark } from './SlapDashLogo.tsx';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  playerScore: number;
  tournament?: {
    season: string;
    endsInHours: number;
    topReward: string;
    activeParticipants: number;
  };
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  playerScore,
  tournament,
  onClose,
}) => {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick();
          onClose();
        }
      }}
      className="absolute inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-[#000000]/75 backdrop-blur-xs select-none pointer-events-auto touch-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#181A24] border-4 border-[#000000] shadow-[6px_6px_0px_#000000] p-4 md:p-5 flex flex-col relative max-h-[90dvh] overflow-hidden text-[#FDFBF7] pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#000000] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 shrink-0">
              <SlapDashPixelMark className="w-full h-full" />
            </div>
            <div>
              <div className="text-[7px] md:text-[8px] font-pixel text-[#F6C445] uppercase tracking-wider">
                WORLD HIGH SCORES
              </div>
              <h3 className="font-pixel text-base md:text-xl text-[#FFFFFF] tracking-wide leading-none mt-0.5">
                HALL OF FAME
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 bg-[#FF4757] hover:bg-[#E25B45] text-[#FFFFFF] border-2 border-[#000000] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer transition-none pointer-events-auto touch-manipulation"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Tournament & Player Best Callout */}
        <div className="my-2.5 p-2 bg-[#000000] border-2 border-[#F6C445] flex flex-col gap-1 text-[8px] md:text-[9px] font-pixel text-[#FDFBF7] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#F6C445]">
              <Crown className="w-3.5 h-3.5" />
              <span>{tournament?.season || 'SEASON 1'}</span>
            </div>
            <span className="text-[#38BDF8]">
              YOUR BEST: {playerScore.toLocaleString()}
            </span>
          </div>
          {tournament && (
            <div className="flex items-center justify-between text-[7px] text-[#94A3B8] border-t border-white/10 pt-1">
              <span>PRIZE: {tournament.topReward}</span>
              <span className="text-[#10B981]">ENDS IN {tournament.endsInHours}H</span>
            </div>
          )}
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 my-1">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const isPlayer = entry.isPlayer;

            return (
              <div
                key={entry.id}
                className={`p-2 border-2 border-[#000000] flex items-center justify-between transition-none ${
                  isPlayer
                    ? 'bg-[#F6C445] text-[#000000] shadow-[2px_2px_0px_#000000]'
                    : isTop3
                    ? 'bg-[#24698F] text-[#FFFFFF] shadow-[2px_2px_0px_#000000]'
                    : 'bg-[#1E2333] text-[#FDFBF7] shadow-[1px_1px_0px_#000000]'
                }`}
              >
                {/* Rank & Runner Info */}
                <div className="flex items-center gap-2">
                  <div className="w-6 text-center font-pixel font-bold text-xs">
                    {rank === 1 ? (
                      <span className="text-[#F6C445]">1ST</span>
                    ) : rank === 2 ? (
                      <span className="text-[#E2E8F0]">2ND</span>
                    ) : rank === 3 ? (
                      <span className="text-[#F97316]">3RD</span>
                    ) : (
                      <span className="opacity-60">#{rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] md:text-[9px] font-pixel truncate max-w-[120px] md:max-w-[150px]">
                        {entry.name}
                      </span>
                      {isPlayer && (
                        <span className="text-[6px] font-pixel bg-[#000000] text-[#FFFFFF] px-1 py-0.5">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Combo */}
                <div className="flex items-center gap-2 font-pixel">
                  {entry.maxCombo && entry.maxCombo > 1 && (
                    <span className="text-[7px] text-[#FF4757]">
                      {entry.maxCombo}x
                    </span>
                  )}
                  <span className={`text-[10px] md:text-xs font-bold ${isPlayer ? 'text-[#000000]' : 'text-[#F6C445]'}`}>
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t-2 border-[#000000] flex items-center justify-between text-[7px] font-pixel text-[#FDFBF7]/60 shrink-0">
          <span>RUN FAST · SLAP HARD</span>
          <span className="text-[#10B981]">● GLOBAL LIVE</span>
        </div>
      </div>
    </div>
  );
};
