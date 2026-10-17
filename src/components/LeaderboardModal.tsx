import React from 'react';
import { Trophy, X, Crown, Flame } from 'lucide-react';
import { LeaderboardEntry } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { SlapDashMark } from './SlapDashLogo.tsx';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  playerScore: number;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  playerScore,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#17181C]/55 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-md bg-[#FDFBF7] border-3 border-[#17181C] rounded-3xl p-5 md:p-6 shadow-[0_8px_0_#17181C] flex flex-col relative max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#17181C]/15 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 drop-shadow-[0_2px_0_#17181C]">
              <SlapDashMark className="w-full h-full" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#17181C]/60">
                ARCADE LEADERBOARD
              </div>
              <h3 className="font-game text-2xl text-[#17181C] tracking-wide leading-none">
                TOP RUNNERS
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#EAD7B0] text-[#17181C] border-2 border-[#17181C] shadow-[0_2px_0_#17181C] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Best Callout */}
        <div className="my-3 py-2 px-3.5 bg-[#FAF6ED] border-2 border-[#17181C] rounded-2xl flex items-center justify-between text-xs font-bold text-[#17181C] shadow-[0_2px_0_#17181C] shrink-0">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-[#F6C445]" />
            <span className="font-game tracking-wider">SEASON 1 STANDINGS</span>
          </div>
          <span className="font-game text-[#24698F] text-sm">
            YOUR BEST: {playerScore.toLocaleString()}
          </span>
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const isPlayer = entry.isPlayer;

            return (
              <div
                key={entry.id}
                className={`p-2.5 rounded-2xl border-2 border-[#17181C] flex items-center justify-between transition-all ${
                  isPlayer
                    ? 'bg-[#EAD7B0] shadow-[0_3px_0_#17181C]'
                    : isTop3
                    ? 'bg-[#FAF6ED] shadow-[0_2px_0_#17181C]'
                    : 'bg-white shadow-[0_1px_0_#17181C]'
                }`}
              >
                {/* Rank & Runner Info */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 text-center font-game font-bold text-base">
                    {rank === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-[#17181C]/50 text-sm">#{rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#17181C] tracking-wide">
                        {entry.name}
                      </span>
                      {isPlayer && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#24698F] text-white text-[9px] font-game tracking-wider">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#17181C]/50 font-bold">
                      <span>{entry.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-[#FF4757] font-black">
                        <Flame className="w-2.5 h-2.5" />
                        <span>{entry.maxCombo}x combo</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="font-game text-base md:text-lg font-bold text-[#24698F] block leading-none">
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-black text-[#17181C]/40 uppercase tracking-widest">
                    PTS
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Got It Button */}
        <div className="pt-3 border-t-2 border-[#17181C]/15 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-[#24698F] hover:bg-[#1B5575] text-white font-game text-sm tracking-wider border-2 border-[#17181C] shadow-[0_3px_0_#17181C] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
