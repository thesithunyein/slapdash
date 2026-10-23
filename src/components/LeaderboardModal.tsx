import React from 'react';
import { X, Crown, Sparkles } from 'lucide-react';
import { LeaderboardEntry } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { LeaderboardAdvancedIcon, TournamentStandings3DIcon } from './GameIcons.tsx';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn font-['Fredoka']"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md sm:max-w-lg bg-gradient-to-b from-[#241911] via-[#1A120D] to-[#120B07] border-3 border-[#F97316] shadow-[0_16px_48px_rgba(0,0,0,0.85)] rounded-3xl flex flex-col max-h-[90vh] overflow-hidden text-[#FFF8E7]"
      >
        {/* Header */}
        <div className="bg-[#140D08] border-b-2 border-[#F97316]/40 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#2A1E14] to-[#160E08] border-2 border-[#FBBF24]/60 rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <LeaderboardAdvancedIcon className="w-8 h-8 drop-shadow" />
            </div>
            <div>
              <h2 className="font-['Lilita_One'] text-xl text-[#FEF08A] tracking-wider uppercase">
                GLOBAL LEADERBOARD
              </h2>
              <span className="text-xs text-[#FED7AA] font-medium block">
                Top championship runners & tournament scores
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#EF4444] hover:bg-[#F87171] text-white border-2 border-white/40 shadow-md active:scale-95 rounded-2xl flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Clean Tournament & Personal Best Banner */}
        <div className="p-3.5 mx-4 mt-3 bg-[#19110B] border-2 border-[#F97316]/30 rounded-2xl flex flex-col gap-1.5 shrink-0 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#FEF08A] font-['Lilita_One']">
              <Crown className="w-4 h-4 text-[#FBBF24] shrink-0" />
              <span className="truncate">{tournament?.season || 'Season 1: Dino Mayhem Blitz'}</span>
            </div>
            <span className="text-[#34D399] font-['Lilita_One'] shrink-0">
              {tournament ? `${tournament.endsInHours}h left` : 'Active'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#FED7AA]/80 border-t border-white/10 pt-1.5">
            <span>Prize: <strong className="text-white font-['Lilita_One']">{tournament?.topReward || '500 Coins'}</strong></span>
            <span>Your Best: <strong className="text-[#FEF08A] font-['Lilita_One']">{playerScore.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Standings List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isFirst = rank === 1;
            const isSecond = rank === 2;
            const isThird = rank === 3;
            const isPlayer = entry.isPlayer;

            const cardBorder = isPlayer
              ? 'border-[#FFE082] bg-gradient-to-r from-[#FFA726] to-[#FB8C00] text-black font-bold shadow-md'
              : isFirst
              ? 'border-[#FBBF24] bg-gradient-to-r from-[#3A2A12] to-[#251A0B] text-white shadow-xs'
              : isSecond
              ? 'border-[#CBD5E1]/60 bg-[#1F1914] text-white'
              : isThird
              ? 'border-[#EA580C]/60 bg-[#1F1914] text-white'
              : 'border-white/10 bg-[#160F0A] text-[#FED7AA]';

            return (
              <div
                key={entry.id || idx}
                className={`px-3.5 py-2.5 rounded-2xl border-2 flex items-center justify-between gap-2.5 transition-all ${cardBorder}`}
              >
                {/* Left: Rank & Player info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank Badge */}
                  <div className="w-6 text-center font-['Lilita_One'] text-sm shrink-0">
                    {isFirst ? (
                      <span className="text-[#FACC15] drop-shadow">🥇</span>
                    ) : isSecond ? (
                      <span className="text-[#E2E8F0] drop-shadow">🥈</span>
                    ) : isThird ? (
                      <span className="text-[#FB923C] drop-shadow">🥉</span>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">#{rank}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="truncate flex items-center gap-1.5">
                    <span className={`font-['Lilita_One'] text-xs sm:text-sm truncate ${isPlayer ? 'text-black' : 'text-white'}`}>
                      {entry.name}
                    </span>
                    {isPlayer && (
                      <span className="text-[9px] font-['Lilita_One'] bg-black text-[#FEF08A] px-1.5 py-0.2 rounded-full shrink-0">
                        YOU
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Score */}
                <div className="flex items-center gap-2 shrink-0">
                  {entry.maxCombo && entry.maxCombo > 1 && (
                    <span className={`text-[10px] font-['Lilita_One'] px-1.5 py-0.5 rounded-md ${isPlayer ? 'bg-black/20 text-black' : 'bg-black/50 text-[#F87171]'}`}>
                      {entry.maxCombo}x
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
        <div className="bg-[#140D08] border-t-2 border-[#F97316]/40 px-5 py-2.5 flex items-center justify-between text-xs text-[#FED7AA] shrink-0 font-medium">
          <span className="flex items-center gap-2">
            <TournamentStandings3DIcon className="w-4 h-4 shrink-0" />
            Official Tournament Standings
          </span>
          <span className="text-[#10B981] font-['Lilita_One'] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            LIVE
          </span>
        </div>
      </div>
    </div>
  );
};
