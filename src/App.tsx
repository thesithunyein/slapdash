/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine.ts';
import { GameState, GameStats, CharacterSkin } from './game/types.ts';
import { CHARACTER_SKINS, DEFAULT_LEADERBOARD } from './game/constants.ts';
import { sounds } from './game/SoundEngine.ts';
import { HUD } from './components/HUD.tsx';
import { TouchControls } from './components/TouchControls.tsx';
import { StartScreen } from './components/StartScreen.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { Play } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [selectedSkin, setSelectedSkin] = useState<CharacterSkin>(CHARACTER_SKINS[0]);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Persistent Unlocked Skins
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('slap_run_unlocked_skins');
      if (s) return JSON.parse(s);
    } catch {}
    return ['speedy_dash'];
  });

  // Persistent Tournament Leaderboard
  const [leaderboardEntries, setLeaderboardEntries] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('slap_run_leaderboard');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LEADERBOARD;
  });

  const [stats, setStats] = useState<GameStats>(() => {
    let savedHigh = 0;
    let savedCoins = 0;
    try {
      const h = localStorage.getItem('slap_run_highscore');
      if (h) savedHigh = parseInt(h, 10) || 0;
      const c = localStorage.getItem('slap_run_total_coins');
      if (c) savedCoins = parseInt(c, 10) || 0;
    } catch {}
    return {
      score: 0,
      highScore: savedHigh,
      coins: 0,
      totalCoinsCollected: savedCoins,
      slapsCount: 0,
      chaosLevel: 0,
      chaosMultiplier: 1,
      feverActive: false,
      distanceRun: 0,
      comboStreak: 0,
      maxCombo: 0,
      longestChaseEscape: 0,
    };
  });

  // Handle stats updates from GameEngine
  const handleStatsUpdate = useCallback((newStats: GameStats, newState: GameState) => {
    setStats({ ...newStats });
    setGameState(newState);

    // If transitioned to GAMEOVER with a score, update tournament leaderboard
    if (newState === 'GAMEOVER' && newStats.score > 0) {
      setLeaderboardEntries((prev) => {
        const newEntry = {
          id: String(Date.now()),
          name: 'YOU (CHAMPION)',
          score: newStats.score,
          maxCombo: newStats.maxCombo,
          date: 'Just Now',
          skinId: selectedSkin.id,
          isPlayer: true,
        };
        const updated = [...prev.filter((e) => !e.isPlayer || e.score >= newStats.score), newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        try {
          localStorage.setItem('slap_run_leaderboard', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [selectedSkin.id]);

  // Initialize GameEngine
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const engine = new GameEngine(canvasRef.current, handleStatsUpdate);
    engineRef.current = engine;

    const handleResize = () => {
      if (!containerRef.current || !engineRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      engineRef.current.resize(width, height, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  }, [handleStatsUpdate]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.input.keys.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.input.keys.right = true;
      } else if (e.code === 'Space') {
        e.preventDefault();
        engine.requestSlap();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (engine.state === 'PLAYING') {
          engine.pauseGame();
        } else if (engine.state === 'PAUSED') {
          engine.resumeGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.input.keys.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.input.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.setSkin(selectedSkin);
      engineRef.current.startGame();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.state = 'MENU';
      setGameState('MENU');
    }
  };

  const handleToggleMute = () => {
    const newMuted = sounds.toggleMute();
    setIsMuted(newMuted);
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      if (gameState === 'PLAYING') {
        engineRef.current.pauseGame();
      } else if (gameState === 'PAUSED') {
        engineRef.current.resumeGame();
      }
    }
  };

  const handleSlap = () => {
    if (engineRef.current && gameState === 'PLAYING') {
      engineRef.current.requestSlap();
    }
  };

  // Pointer/mouse tracking for PC and touch-drag steering on canvas
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartXRef = useRef<number>(0);
  const pointerStartTimeRef = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    isPointerDownRef.current = true;
    pointerStartXRef.current = e.clientX;
    pointerStartTimeRef.current = Date.now();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || gameState !== 'PLAYING' || !engineRef.current) return;
    const deltaX = e.clientX - pointerStartXRef.current;
    if (Math.abs(deltaX) > 10) {
      const maxDrag = Math.min(window.innerWidth * 0.25, 120);
      const steerX = Math.max(-1, Math.min(1, deltaX / maxDrag));
      engineRef.current.input.joystick.active = true;
      engineRef.current.input.joystick.x = steerX;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    const duration = Date.now() - pointerStartTimeRef.current;
    const deltaX = Math.abs(e.clientX - pointerStartXRef.current);

    // If quick click/tap without dragging, trigger SLAP!
    if (duration < 280 && deltaX < 18) {
      handleSlap();
    }

    if (engineRef.current) {
      engineRef.current.input.joystick.active = false;
      engineRef.current.input.joystick.x = 0;
    }
  };

  const handleUnlockSkin = (skin: CharacterSkin) => {
    if (stats.totalCoinsCollected >= skin.cost && !unlockedSkinIds.includes(skin.id)) {
      sounds.playUnlock();
      const remainingCoins = stats.totalCoinsCollected - skin.cost;
      const updatedUnlocked = [...unlockedSkinIds, skin.id];
      setUnlockedSkinIds(updatedUnlocked);
      setStats((prev) => ({ ...prev, totalCoinsCollected: remainingCoins }));
      setSelectedSkin(skin);
      if (engineRef.current) {
        engineRef.current.stats.totalCoinsCollected = remainingCoins;
        engineRef.current.setSkin(skin);
      }
      try {
        localStorage.setItem('slap_run_unlocked_skins', JSON.stringify(updatedUnlocked));
        localStorage.setItem('slap_run_total_coins', String(remainingCoins));
      } catch {}
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen h-[100dvh] overflow-hidden bg-sky-200 flex items-center justify-center select-none"
    >
      {/* 2.5D Arcade Canvas Viewport with PC & Mobile Pointer Drag/Click */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block touch-none cursor-pointer"
      />

      {/* Start Screen */}
      {gameState === 'MENU' && (
        <StartScreen
          highScore={stats.highScore}
          totalCoins={stats.totalCoinsCollected}
          selectedSkin={selectedSkin}
          unlockedSkinIds={unlockedSkinIds}
          onSelectSkin={(skin) => {
            setSelectedSkin(skin);
            if (engineRef.current) engineRef.current.setSkin(skin);
          }}
          onUnlockSkin={handleUnlockSkin}
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {/* In-Game HUD */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <HUD
          stats={stats}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isPaused={gameState === 'PAUSED'}
          onTogglePause={handleTogglePause}
        />
      )}

      {/* Mobile & PC Controls Overlay */}
      {gameState === 'PLAYING' && engineRef.current && (
        <TouchControls
          input={engineRef.current.input}
          onSlap={handleSlap}
          isPaused={false}
        />
      )}

      {/* Pause Overlay */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md select-none">
          <div className="bg-white/95 border border-slate-200/90 p-6 rounded-3xl text-center max-w-xs w-full shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">GAME PAUSED</h3>
            <button
              onClick={handleTogglePause}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-105 text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>RESUME RUN</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {/* Global Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          entries={leaderboardEntries}
          playerScore={stats.highScore}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}
    </div>
  );
}
