import React, { useState } from 'react';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { buildShareCard, sanitizeName, SHARE_NAME_KEY } from '../game/shareCard.ts';
import {
  RotateCcw,
  Trophy,
  Share2,
  Home,
  Star,
  ArrowRight,
  Sparkles,
  Coins,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  paceName?: string;
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
  onRetryLeaderboard?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  paceName = 'NORMAL',
  onRestart,
  onHome,
  onOpenLeaderboard,
  onRetryLeaderboard,
}) => {
  const isNewBest = stats.score > 0 && stats.score >= stats.highScore;
  const isStageMode = stats.isLevelMode;
  const isCleared = stats.levelComplete;

  // Player Name for Share Card
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem(SHARE_NAME_KEY) || '';
    } catch {}
    return '';
  });

  const [askName, setAskName] = useState<boolean>(false);
  const [nameDraft, setNameDraft] = useState<string>('');
  const [cardState, setCardState] = useState<'IDLE' | 'WORKING' | 'DONE'>('IDLE');
  const [shareNote, setShareNote] = useState<string>('');

  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeName(nameDraft);
    setPlayerName(clean);
    try {
      localStorage.setItem(SHARE_NAME_KEY, clean);
    } catch {}
    setAskName(false);
    generateAndDownloadCard(clean);
  };

  const handleShare = () => {
    sounds.playClick();
    if (!playerName) {
      setNameDraft('');
      setAskName(true);
      return;
    }
    generateAndDownloadCard(playerName);
  };

  const generateAndDownloadCard = async (name: string) => {
    setCardState('WORKING');
    try {
      const blob = await buildShareCard({
        score: stats.score,
        highScore: stats.highScore,
        slapsCount: stats.slapsCount,
        maxCombo: stats.maxCombo,
        distanceRun: stats.distanceRun,
        feverCount: stats.feverActive ? 2 : 1,
        playerName: name || 'CHAMPION',
        paceName,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slapdash-${stats.score}-points.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setCardState('DONE');
      setShareNote('SAVED!');
      setTimeout(() => {
        setCardState('IDLE');
        setShareNote('');
      }, 3000);
    } catch {
      setCardState('IDLE');
      setShareNote('FAILED');
      setTimeout(() => setShareNote(''), 2000);
    }
  };

  const distPercent = Math.min(
    100,
    Math.round((stats.distanceRun / (stats.levelTargetDistance || 100)) * 100)
  );
  const slapPercent = Math.min(
    100,
    Math.round((stats.slapsCount / (stats.levelTargetSlaps || 3)) * 100)
  );

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 pointer-events-auto p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
        {/* Top Header Badge */}
        <div className="text-center mb-3">
          {isStageMode && isCleared ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-[#F6C445] text-lg sm:text-xl">
                {Array.from({ length: stats.levelStars || 3 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#F6C445] animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </div>
              <h2 className="font-pixel text-xl sm:text-2xl text-[#10B981] tracking-wider drop-shadow-md">
                STAGE CLEARED!
              </h2>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <h2 className="font-pixel text-xl sm:text-2xl text-[#FF4757] tracking-wider drop-shadow-md">
                GAME OVER
              </h2>
              <p className="text-[8px] sm:text-[9px] font-pixel text-[#94A3B8] tracking-wide uppercase">
                {stats.gameOverReason === 'EXHAUSTED'
                  ? '⚡ Exhausted · Out of Stamina'
                  : stats.gameOverReason === 'BUSTED'
                  ? '🚨 Busted · Chaser caught up!'
                  : `Caught at ${Math.round(stats.distanceRun)}m`}
              </p>
            </div>
          )}
        </div>

        {/* Polished Main Results Card */}
        <div className="w-full bg-[#181A24]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col items-center">
          {/* Final Score */}
          <span className="text-[8px] font-pixel text-[#94A3B8] uppercase tracking-wider mb-1">
            FINAL SCORE
          </span>
          <span className="font-pixel text-3xl sm:text-4xl text-white font-bold tracking-tight mb-1 tabular-nums">
            {stats.score.toLocaleString()}
          </span>

          {/* New Record / Global Rank Badges */}
          <div className="flex flex-col items-center gap-1.5 mb-3 w-full">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {isNewBest && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F6C445]/20 border border-[#F6C445]/40 text-[#F6C445] rounded-full text-[8px] font-pixel font-bold animate-pulse">
                  <Sparkles className="w-3 h-3 fill-[#F6C445]" />
                  NEW RECORD!
                </span>
              )}
              {stats.globalRankPending && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] rounded-full text-[7px] sm:text-[8px] font-pixel animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
                  SUBMITTING RUN...
                </span>
              )}
              {stats.globalRankConfirmed && stats.globalRank && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] rounded-full text-[8px] font-pixel font-bold">
                  <Award className="w-3 h-3" />
                  GLOBAL RANK #{stats.globalRank} (CONFIRMED)
                </span>
              )}
              {stats.leaderboardError && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-full text-[7px] font-pixel">
                    SAVED LOCALLY
                  </span>
                  {onRetryLeaderboard && (
                    <button
                      type="button"
                      onClick={onRetryLeaderboard}
                      className="px-2 py-0.5 bg-[#38BDF8] hover:bg-[#7DD3FC] text-black font-pixel text-[7px] rounded-full font-bold cursor-pointer transition-none"
                    >
                      RETRY
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Gap to next player ahead */}
            {stats.nextPlayerAbove && stats.globalRank && stats.globalRank > 1 && (
              <div className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8] bg-black/40 px-2.5 py-1 rounded-md border border-white/5 text-center">
                <span>Score </span>
                <span className="text-[#F6C445] font-bold">+{stats.nextPlayerAbove.scoreToSurpass.toLocaleString()}</span>
                <span> to surpass #{stats.globalRank - 1} {stats.nextPlayerAbove.name}!</span>
              </div>
            )}
          </div>

          {/* 4-Stat Strip with Generous Space (NO TRUNCATION!) */}
          <div className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 sm:p-3 grid grid-cols-4 gap-1 text-center font-pixel mb-3">
            <div>
              <div className="text-[7px] text-[#64748B] uppercase">SLAPS</div>
              <div className="text-sm sm:text-base text-white font-bold mt-0.5 tabular-nums">
                {stats.slapsCount}
              </div>
            </div>

            <div>
              <div className="text-[7px] text-[#64748B] uppercase">COMBO</div>
              <div className="text-sm sm:text-base text-[#FF4757] font-bold mt-0.5 tabular-nums">
                {stats.maxCombo}x
              </div>
            </div>

            <div>
              <div className="text-[7px] text-[#64748B] uppercase">COINS</div>
              <div className="text-sm sm:text-base text-[#F6C445] font-bold mt-0.5 tabular-nums">
                +{stats.coins}
              </div>
            </div>

            <div>
              <div className="text-[7px] text-[#64748B] uppercase">BEST</div>
              <div className="text-sm sm:text-base text-[#38BDF8] font-bold mt-0.5 tabular-nums">
                {Math.max(stats.score, stats.highScore).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Integrated Stage Progress (Clean & Uncluttered) */}
          {isStageMode && (
            <div className="w-full bg-black/30 border border-white/5 rounded-xl p-2.5 mb-3 space-y-2">
              <div className="flex items-center justify-between text-[8px] font-pixel">
                <span className="text-[#FDE047]">
                  STAGE {stats.currentLevel}: {stats.levelTitle || 'GOAL'}
                </span>
                <span className={isCleared ? 'text-[#10B981] font-bold' : 'text-[#EF4444]'}>
                  {isCleared ? 'CLEARED' : 'FAILED'}
                </span>
              </div>

              {/* Progress bars */}
              <div className="grid grid-cols-2 gap-2 text-[7px] font-pixel text-[#94A3B8]">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>DISTANCE</span>
                    <span className="text-white">{Math.round(stats.distanceRun)}/{stats.levelTargetDistance || 100}m</span>
                  </div>
                  <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#38BDF8] h-full rounded-full transition-all" style={{ width: `${distPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>SLAPS</span>
                    <span className="text-white">{stats.slapsCount}/{stats.levelTargetSlaps || 3}</span>
                  </div>
                  <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full rounded-full transition-all" style={{ width: `${slapPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Symmetrical Button Actions */}
          <div className="w-full space-y-2">
            {/* Primary Action Button (Full Width, Radiant & Prominent) */}
            {isStageMode && isCleared ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playStart();
                  onRestart();
                }}
                className="w-full py-3 sm:py-3.5 bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] text-black font-pixel text-xs sm:text-sm font-bold tracking-wider rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <span>NEXT STAGE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.playStart();
                  onRestart();
                }}
                className="w-full py-3 sm:py-3.5 bg-[#F6C445] hover:bg-[#FBBF24] active:scale-[0.98] text-black font-pixel text-xs sm:text-sm font-bold tracking-wider rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>
            )}

            {/* Secondary Actions: Exactly 3 Balanced Equal-Width Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenLeaderboard();
                }}
                className="py-2.5 px-2 bg-[#252A3C] hover:bg-[#32384E] text-white border border-white/10 rounded-xl font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-[#F6C445]" />
                <span>RANKS</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-2 bg-[#252A3C] hover:bg-[#32384E] text-white border border-white/10 rounded-xl font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{cardState === 'WORKING' ? 'SAVING' : shareNote || 'SHARE'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onHome();
                }}
                className="py-2.5 px-2 bg-[#252A3C] hover:bg-[#32384E] text-white border border-white/10 rounded-xl font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-[#CBD5E1]" />
                <span>MENU</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Share Card Signature */}
        {playerName && (
          <div className="mt-2.5 text-[7px] font-pixel text-[#64748B]">
            SIGNED AS:{' '}
            <button
              onClick={() => {
                setNameDraft(playerName);
                setAskName(true);
              }}
              className="text-[#94A3B8] hover:text-white underline cursor-pointer"
            >
              {playerName}
            </button>
          </div>
        )}
      </div>

      {/* Name Prompt Modal for Share Card */}
      {askName && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={submitName}
            className="bg-[#181A24] border border-white/10 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3"
          >
            <h3 className="font-pixel text-xs sm:text-sm text-white tracking-wide">
              ENTER RUNNER NAME
            </h3>
            <p className="text-[8px] font-pixel text-[#94A3B8]">
              Your name will appear on your downloadable arcade share card.
            </p>
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={16}
              placeholder="SLAPDASH HERO"
              className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg font-pixel text-xs text-white placeholder:text-[#64748B] outline-none focus:border-[#F6C445]"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#F6C445] hover:bg-[#FBBF24] text-black font-pixel text-xs font-bold rounded-lg cursor-pointer"
              >
                SAVE & SHARE
              </button>
              <button
                type="button"
                onClick={() => setAskName(false)}
                className="px-4 py-2.5 bg-[#252A3C] hover:bg-[#32384E] text-white font-pixel text-xs rounded-lg cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
