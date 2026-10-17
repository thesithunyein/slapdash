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

  // Player Name for Share Card (saved in localStorage, just like wrackline)
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
    } catch (err) {
      setCardState('IDLE');
      setShareNote('FAILED');
      setTimeout(() => setShareNote(''), 2000);
    }
  };

  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <div className="absolute inset-0 bg-[#D6E6F2]/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 pointer-events-auto overflow-y-auto p-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-6 select-none">
      {/* Top Logo Mark */}
      <SlapDashLogo size="sm" showTitle={false} className="mb-2 md:mb-3" />

      {/* The headline names the cause (Wrackline Style) */}
      <h2 className="font-game text-3xl md:text-5xl tracking-wide text-center mb-1 text-[#17181C]">
        THE MOB CAUGHT YOU
      </h2>
      <p className="text-[10px] md:text-xs font-black text-[#17181C]/60 uppercase tracking-widest mb-4 md:mb-6 text-center">
        tripped on peel and cornered after {Math.round(stats.distanceRun)}m sprint
      </p>

      {/* Neo-Brutalist Faceted Scorecard */}
      <div className="bg-[#FDFBF7] border-3 border-[#17181C] rounded-3xl shadow-[0_8px_0_#17181C] w-80 max-w-full flex flex-col items-center p-5 md:p-6 mb-5 md:mb-7">
        <span className="text-xs font-black text-[#17181C]/60 uppercase tracking-widest mb-1">
          FINAL SCORE
        </span>
        <span className="font-game text-5xl md:text-6xl text-[#24698F] mb-2 leading-none">
          {stats.score.toLocaleString()}
        </span>

        {isNewBest && (
          <span className="font-game text-xs tracking-widest text-[#17181C] bg-[#F6C445] border-2 border-[#17181C] px-3.5 py-1 rounded-lg shadow-[0_2px_0_#17181C] mb-2.5">
            NEW RECORD!
          </span>
        )}

        <div className="w-full pt-3 border-t-2 border-[#17181C]/15 grid grid-cols-4 gap-1.5 text-center text-xs font-bold text-[#17181C]/75">
          <div>
            <div className="text-[8px] uppercase font-black text-[#17181C]/45">SLAPS</div>
            <div className="font-game text-base text-[#17181C]">{stats.slapsCount}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase font-black text-[#17181C]/45">COMBO</div>
            <div className="font-game text-base text-[#17181C]">{stats.maxCombo}x</div>
          </div>
          <div>
            <div className="text-[8px] uppercase font-black text-[#17181C]/45">COINS</div>
            <div className="font-game text-base text-[#F59E0B]">+{stats.coins}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase font-black text-[#17181C]/45">BEST</div>
            <div className="font-game text-base text-[#24698F] truncate">{Math.max(stats.score, stats.highScore).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Near-miss framing: pull to play again */}
      {!isNewBest && stats.highScore > stats.score && (
        <p className="font-game text-sm md:text-base text-[#E25B45] mb-4 md:mb-5">
          {(stats.highScore - stats.score).toLocaleString()} POINTS TO BEAT YOUR BEST
        </p>
      )}

      {/* Tactile Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4 max-w-sm">
        <button
          onClick={() => {
            sounds.playStart();
            onRestart();
          }}
          className="px-6 py-3 md:px-8 md:py-3.5 rounded-2xl bg-[#17181C] hover:bg-[#24698F] text-[#FFFDF8] font-game text-lg md:text-xl tracking-wider border-2 border-[#17181C] shadow-[0_5px_0_#0D0E10] active:translate-y-[2px] active:shadow-[0_1px_0_#0D0E10] transition-all cursor-pointer"
        >
          PLAY AGAIN
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onHome();
          }}
          className="px-5 py-3 md:px-6 md:py-3.5 rounded-2xl bg-[#FDFBF7] hover:bg-[#EAD7B0] text-[#17181C] font-game text-lg md:text-xl tracking-wider border-2 border-[#17181C] shadow-[0_5px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] transition-all cursor-pointer"
        >
          MENU
        </button>

        <button
          onClick={handleShare}
          aria-label="Save high-res share card of this run"
          className="px-5 py-3 md:px-6 md:py-3.5 rounded-2xl bg-[#FDFBF7] hover:bg-[#EAD7B0] text-[#17181C] font-game text-lg md:text-xl tracking-wider border-2 border-[#17181C] shadow-[0_5px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] transition-all cursor-pointer"
        >
          {cardState === 'WORKING' ? 'MAKING CARD...' : shareNote || 'SHARE'}
        </button>
      </div>

      {/* Who the card is signed by */}
      <p className="mt-3 text-[10px] font-black text-[#17181C]/50 uppercase tracking-widest text-center max-w-xs">
        {playerName ? (
          <>
            the card signs as{' '}
            <button
              onClick={() => {
                setNameDraft(playerName);
                setAskName(true);
              }}
              aria-label="Change signature name"
              className="underline decoration-dotted underline-offset-2 cursor-pointer text-[#24698F]"
            >
              {playerName}
            </button>
          </>
        ) : (
          'share asks for a name the first time, and keeps it on this device'
        )}
      </p>

      <p className="mt-2 text-[10px] font-black text-[#17181C]/40 uppercase tracking-widest">
        {isTouch ? 'Tap PLAY AGAIN for another run' : 'Press R or Space to go again'}
      </p>

      {/* Name Prompt Modal (Wrackline Style) */}
      {askName && (
        <div className="absolute inset-0 z-[60] bg-[#17181C]/50 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto">
          <form
            onSubmit={submitName}
            className="bg-[#FDFBF7] border-3 border-[#17181C] rounded-3xl max-w-sm w-full p-6 shadow-[0_8px_0_#17181C]"
          >
            <h3 className="font-game text-2xl text-[#17181C] tracking-wide mb-1">
              WHO IS DASHING?
            </h3>
            <p className="text-xs font-bold text-[#17181C]/70 mb-4">
              Your name goes on the official run card. It stays on this device, like your best score: no account, no server.
            </p>
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={16}
              placeholder="SLAPDASH CHAMP"
              aria-label="Name to sign your share card"
              className="w-full px-4 py-3 rounded-xl bg-[#EAD7B0]/40 border-2 border-[#17181C] font-game text-lg tracking-widest uppercase text-[#17181C] placeholder:text-[#17181C]/35 mb-4 outline-none"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#24698F] hover:bg-[#1B5575] text-white font-game text-base tracking-wider border-2 border-[#17181C] shadow-[0_4px_0_#17181C] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer mb-2"
            >
              MAKE MY CARD
            </button>
            <button
              type="button"
              onClick={() => setAskName(false)}
              className="w-full py-2.5 rounded-xl bg-[#FDFBF7] hover:bg-[#EAD7B0] text-[#17181C] font-game text-sm tracking-wider border-2 border-[#17181C] shadow-[0_3px_0_#17181C] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              NOT NOW
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
