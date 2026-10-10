import React from 'react';
import { Trophy, Medal, X, Crown, Flame } from 'lucide-react';
import { LeaderboardEntry } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';

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
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md select-none animate-slap-pop">
      <div className="w-full max-w-md bg-white/95 border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.22)] flex flex-col relative max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Digit7 Tournament</div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Global Rankings</h3>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Tournament Tiers Notice */}
        <div className="my-3 py-1.5 px-3 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-between text-[11px] font-bold text-emerald-800">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-emerald-600" />
            <span>Season 1 Jam · Top 10 Elite</span>
          </div>
          <span className="text-emerald-600 font-extrabold font-mono-numbers">Best: {playerScore.toLocaleString()}</span>
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
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isPlayer
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-sm ring-1 ring-emerald-500/30'
                    : isTop3
                    ? 'bg-amber-50/60 border-amber-200/70'
                    : 'bg-slate-50 border-slate-200/60'
                }`}
              >
                {/* Rank & Runner Info */}
                <div className="flex items-center gap-3">
                  <div className="w-7 text-center font-black font-mono-numbers text-sm">
                    {rank === 1 ? (
                      <span className="text-lg">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-lg">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-lg">🥉</span>
                    ) : (
                      <span className="text-slate-400">#{rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 tracking-wide">
                        {entry.name}
                      </span>
                      {isPlayer && (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>{entry.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Flame className="w-2.5 h-2.5" />
                        {entry.maxCombo}x streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-sm md:text-base font-mono-numbers font-black text-slate-900 leading-tight">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">
                    {rank === 1 ? 'Grandmaster' : rank <= 3 ? 'Master' : 'Challenger'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-1 text-slate-400">
            <Medal className="w-3.5 h-3.5" />
            <span>Updated live from tournament runs</span>
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-transform active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
