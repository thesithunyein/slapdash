import React, { useState } from 'react';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';
import { SlapDashLogo } from './SlapDashLogo.tsx';
import { buildShareCard, sanitizeName, SHARE_NAME_KEY } from '../game/shareCard.ts';

interface GameOverModalProps {
  stats: GameStats;
  paceName?: string;
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  paceName = 'RUSH',
  onRestart,
  onHome,
  onOpenLeaderboard,
}) => {
  const isNewBest = stats.score > 0 && stats.score >= stats.highScore;

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
        playerName: name || 'RUNNER',
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
      setShareNote('SAVED PNG!');
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

  return (
    <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-xs flex flex-col items-center justify-start sm:justify-center z-50 pointer-events-auto touch-auto overflow-y-auto p-3 sm:p-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] select-none">
      <div className="my-auto flex flex-col items-center w-full max-w-md py-2">
        {/* Top Pixel Logo Mark */}
        <SlapDashLogo size="sm" showTitle={false} className="mb-1.5" />

        {/* Retro Arcade GAME OVER Header */}
        <h2 className="font-pixel text-xl sm:text-2xl md:text-4xl text-[#FF4757] tracking-wider text-center mb-1 drop-shadow-[3px_3px_0px_#000000]">
          GAME OVER
        </h2>
        <p className="font-pixel text-[7px] sm:text-[8px] md:text-[9px] text-[#FDFBF7]/85 uppercase tracking-wider mb-3 sm:mb-4 text-center px-2 max-w-sm">
          {stats.gameOverReason === 'EXHAUSTED'
            ? `⚡ OUT OF STAMINA! RAN OUT OF ENERGY AFTER ${Math.round(stats.distanceRun)}M · SLAP CHARACTERS TO RECHARGE!`
            : stats.gameOverReason === 'BUSTED'
            ? `🚨 BUSTED! HIT 2 OBSTACLES IN A ROW WHILE CHASER WAS ON-SCREEN!`
            : `CAUGHT AFTER ${Math.round(stats.distanceRun)}M · ${stats.slapsCount} SLAPS`}
        </p>

        {/* 8-Bit Pixel Scorecard Terminal */}
        <div className="bg-[#181A24] border-3 sm:border-4 border-[#000000] shadow-[4px_4px_0px_#000000] sm:shadow-[5px_5px_0px_#000000] w-full max-w-xs flex flex-col items-center p-3 sm:p-4 md:p-5 mb-3 sm:mb-4">
          <span className="text-[7px] sm:text-[8px] md:text-[9px] font-pixel text-[#F6C445] uppercase tracking-wider mb-1">
            FINAL SCORE
          </span>
          <span className="font-pixel text-2xl sm:text-3xl md:text-5xl text-[#FFFFFF] mb-2 leading-none">
            {stats.score.toLocaleString()}
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2">
            {stats.globalRank && (
              <span className="font-pixel text-[7px] sm:text-[8px] tracking-wider text-[#FFFFFF] bg-[#24698F] border-2 border-[#000000] px-2 py-0.5 shadow-[2px_2px_0px_#000000]">
                GLOBAL RANK #{stats.globalRank}
              </span>
            )}
            {isNewBest && (
              <span className="font-pixel text-[7px] sm:text-[8px] tracking-wider text-[#000000] bg-[#F6C445] border-2 border-[#000000] px-2 py-0.5 shadow-[2px_2px_0px_#000000] animate-pixel-blink">
                ★ NEW RECORD! ★
              </span>
            )}
          </div>

          {/* 4-Stat 8-Bit Grid */}
          <div className="w-full pt-2 sm:pt-3 border-t-2 border-[#000000] grid grid-cols-4 gap-1 text-center font-pixel">
            <div>
              <div className="text-[6px] sm:text-[7px] text-[#FDFBF7]/60">SLAPS</div>
              <div className="text-xs sm:text-sm md:text-base text-[#FFFFFF] mt-0.5">{stats.slapsCount}</div>
            </div>
            <div>
              <div className="text-[6px] sm:text-[7px] text-[#FDFBF7]/60">COMBO</div>
              <div className="text-xs sm:text-sm md:text-base text-[#FF4757] mt-0.5">{stats.maxCombo}x</div>
            </div>
            <div>
              <div className="text-[6px] sm:text-[7px] text-[#FDFBF7]/60">COINS</div>
              <div className="text-xs sm:text-sm md:text-base text-[#F6C445] mt-0.5">+{stats.coins}</div>
            </div>
            <div>
              <div className="text-[6px] sm:text-[7px] text-[#FDFBF7]/60">BEST</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-[#38BDF8] mt-0.5 truncate">{Math.max(stats.score, stats.highScore).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* High score gap prompt */}
        {!isNewBest && stats.highScore > stats.score && (
          <p className="font-pixel text-[7px] sm:text-[8px] md:text-[9px] text-[#F6C445] mb-3">
            {(stats.highScore - stats.score).toLocaleString()} PTS TO BEAT RECORD
          </p>
        )}

        {/* Retro Pixel Arcade Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-2.5 w-full max-w-xs sm:max-w-sm">
          <button
            type="button"
            onClick={() => {
              sounds.playStart();
              onRestart();
            }}
            className="py-2.5 sm:py-3 px-3 sm:px-5 bg-[#F6C445] hover:bg-[#FBBF24] text-[#000000] font-pixel text-[10px] sm:text-xs md:text-sm tracking-wider border-2 sm:border-3 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-none cursor-pointer select-none text-center"
          >
            ▶ RETRY
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenLeaderboard();
            }}
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-[#24698F] hover:bg-[#38BDF8] text-[#FFFFFF] font-pixel text-[10px] sm:text-xs md:text-sm tracking-wider border-2 sm:border-3 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-none cursor-pointer select-none text-center"
          >
            RANKS
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onHome();
            }}
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-[#FDFBF7] hover:bg-[#EAD7B0] text-[#000000] font-pixel text-[10px] sm:text-xs md:text-sm tracking-wider border-2 sm:border-3 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-none cursor-pointer select-none text-center"
          >
            MENU
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Save high-res share card of this run"
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-[#FDFBF7] hover:bg-[#EAD7B0] text-[#000000] font-pixel text-[10px] sm:text-xs md:text-sm tracking-wider border-2 sm:border-3 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-none cursor-pointer select-none text-center"
          >
            {cardState === 'WORKING' ? 'MAKING...' : shareNote || 'SHARE'}
          </button>
        </div>
      </div>

      {/* Signature Name */}
      {playerName && (
        <div className="mt-3 text-[8px] font-pixel text-[#FDFBF7]/60 uppercase tracking-wider text-center">
          CARD NAME:{' '}
          <button
            onClick={() => {
              setNameDraft(playerName);
              setAskName(true);
            }}
            aria-label="Change signature name"
            className="underline cursor-pointer text-[#F6C445] ml-1"
          >
            {playerName}
          </button>
        </div>
      )}

      {/* Name Prompt Modal (Pixel Terminal) */}
      {askName && (
        <div className="absolute inset-0 z-[60] bg-[#000000]/80 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto">
          <form
            onSubmit={submitName}
            className="bg-[#181A24] border-4 border-[#000000] shadow-[6px_6px_0px_#000000] max-w-sm w-full p-5"
          >
            <h3 className="font-pixel text-sm md:text-base text-[#F6C445] tracking-wide mb-2">
              ENTER RUNNER NAME
            </h3>
            <p className="font-pixel text-[8px] text-[#FDFBF7]/75 mb-3 leading-relaxed">
              NAME APPEARS ON YOUR ARCADE SHARE CARD.
            </p>
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={16}
              placeholder="SLAPDASH HERO"
              aria-label="Name to sign your share card"
              className="w-full px-3 py-2 bg-[#000000] border-2 border-[#F6C445] font-pixel text-xs tracking-wider uppercase text-[#FFFFFF] placeholder:text-[#FFFFFF]/30 mb-3 outline-none"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#F6C445] hover:bg-[#FBBF24] text-[#000000] font-pixel text-xs tracking-wider border-2 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer mb-2"
            >
              SAVE & DOWNLOAD
            </button>
            <button
              type="button"
              onClick={() => setAskName(false)}
              className="w-full py-2 bg-[#FDFBF7] hover:bg-[#EAD7B0] text-[#000000] font-pixel text-xs tracking-wider border-2 border-[#000000] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
            >
              CANCEL
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
