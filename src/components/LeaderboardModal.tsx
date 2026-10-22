import React from 'react';
import { X, Crown, Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { RankMedalBadge } from './GameIcons.tsx';

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
      className="absolute inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/75 backdrop-blur-md select-none pointer-events-auto touch-auto animate-fadeIn font-['Fredoka']"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-[#2A1E14] via-[#1E1712] to-[#140F0C] border-3 border-[#F97316] shadow-[0_12px_36px_rgba(0,0,0,0.8)] rounded-3xl p-5 flex flex-col relative max-h-[90dvh] overflow-hidden text-[#FFF8E7] pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#F97316]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] border-2 border-[#FEF08A] rounded-2xl flex items-center justify-center shadow-md">
              <Trophy className="w-6 h-6 text-white fill-[#FEF08A] drop-shadow" />
            </div>
            <div>
              <span className="text-[10px] text-[#FEF08A] uppercase font-bold tracking-wider block">
                Dino Island Tournament
              </span>
              <h3 className="font-['Lilita_One'] text-xl text-white tracking-wide leading-none mt-0.5">
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
            className="w-9 h-9 bg-[#EF4444] hover:bg-[#F87171] text-white border-2 border-white/40 shadow-md active:scale-95 rounded-2xl flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tournament & Player Best Card */}
        <div className="my-3 p-3.5 bg-[#19110B] border-2 border-[#F97316]/40 rounded-2xl flex flex-col gap-1.5 shrink-0 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#FEF08A] font-['Lilita_One'] text-xs">
              <Crown className="w-4 h-4 text-[#FBBF24]" />
              <span>{tournament?.season || 'Season 1: Beach Mayhem Blitz'}</span>
            </div>
            <span className="font-['Lilita_One'] text-xs text-[#38BDF8]">
              Your Best: {playerScore.toLocaleString()}
            </span>
          </div>

          {tournament && (
            <div className="flex items-center justify-between text-xs text-[#FED7AA] border-t border-white/10 pt-2 font-medium">
              <span>Prize: <strong className="text-white font-['Lilita_One']">{tournament.topReward}</strong></span>
              <span className="text-[#34D399] font-['Lilita_One']">Ends in {tournament.endsInHours}h</span>
            </div>
          )}
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
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  isPlayer
                    ? 'bg-gradient-to-r from-[#FFA726] to-[#FB8C00] text-white border-[#FFE082] shadow-md font-bold'
                    : isTop3
                    ? 'bg-[#291A10] border-[#FBBF24]/50 text-white'
                    : 'bg-[#19110B] border-white/10 text-[#FED7AA]'
                }`}
              >
                {/* Rank & Runner Info */}
                <div className="flex items-center gap-3">
                  <div className="w-7 flex items-center justify-center font-['Lilita_One'] text-sm">
                    {rank <= 3 ? (
                      <RankMedalBadge rank={rank} className="w-6 h-6" />
                    ) : (
                      <span className="text-xs text-[#FED7AA]/70">#{rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-['Lilita_One'] text-sm text-white truncate max-w-[150px]">
                        {entry.name}
                      </span>
                      {isPlayer && (
                        <span className="text-[9px] font-['Lilita_One'] bg-black text-[#FEF08A] px-1.5 py-0.5 rounded-full border border-white/20">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Combo */}
                <div className="flex items-center gap-2">
                  {entry.maxCombo && entry.maxCombo > 1 && (
                    <span className="font-['Lilita_One'] text-[10px] text-[#EF4444] bg-black/40 px-1.5 py-0.5 rounded-lg border border-white/10">
                      {entry.maxCombo}x ROAR
                    </span>
                  )}
                  <span className={`font-['Lilita_One'] text-sm sm:text-base tabular-nums ${isPlayer ? 'text-black font-black' : 'text-[#FEF08A]'}`}>
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-[#F97316]/40 flex items-center justify-between text-xs text-[#FED7AA] shrink-0 font-medium">
          <span>Island tournament standings</span>
          <span className="text-[#34D399] flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-ping" />
            Live Sync
          </span>
        </div>
      </div>
    </div>
  );
};
