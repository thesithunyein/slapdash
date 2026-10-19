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
import { StartScreen, PACE_MODES, PaceMode } from './components/StartScreen.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { GuideModal } from './components/GuideModal.tsx';
import { Play } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [selectedSkin, setSelectedSkin] = useState<CharacterSkin>(CHARACTER_SKINS[0]);
  const [selectedPace, setSelectedPace] = useState<PaceMode>(PACE_MODES[0]); // Default: NORMAL (1.0X)
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [hurtFlash, setHurtFlash] = useState<boolean>(false);

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
      stamina: 100,
      maxStamina: 100,
      chaserOnScreen: false,
      chaserAlertTimer: 0,
    };
  });

  // Initial Global Leaderboard Sync from API
  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.entries) && data.entries.length > 0) {
          setLeaderboardEntries(data.entries);
        }
      })
      .catch(() => {});
  }, []);

  // Handle stats updates from GameEngine
  const handleStatsUpdate = useCallback((newStats: GameStats, newState: GameState) => {
    setStats({ ...newStats });
    setGameState(newState);

    // If transitioned to GAMEOVER with a score, submit to real Leaderboard API!
    if (newState === 'GAMEOVER' && newStats.score > 0) {
      let savedName = 'YOU (CHAMPION)';
      try {
        const stored = localStorage.getItem('slap_run_share_name');
        if (stored) savedName = stored;
      } catch {}

      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: savedName,
          score: newStats.score,
          maxCombo: newStats.maxCombo,
          skinId: selectedSkin.id,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.rank) {
            setStats((curr) => ({ ...curr, globalRank: data.rank }));
            if (Array.isArray(data.entries)) {
              setLeaderboardEntries(data.entries);
            }
          }
        })
        .catch(() => {
          // Fallback if offline
          setLeaderboardEntries((prev) => {
            const newEntry = {
              id: String(Date.now()),
              name: savedName,
              score: newStats.score,
              maxCombo: newStats.maxCombo,
              date: 'Just Now',
              skinId: selectedSkin.id,
              isPlayer: true,
            };
            const updated = [...prev.filter((e) => !e.isPlayer || e.score >= newStats.score), newEntry]
              .sort((a, b) => b.score - a.score)
              .slice(0, 15);
            try {
              localStorage.setItem('slap_run_leaderboard', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        });
    }
  }, [selectedSkin.id]);

  const handleHurtFlash = useCallback(() => {
    setHurtFlash(true);
    setTimeout(() => setHurtFlash(false), 240);
  }, []);

  // Initialize GameEngine
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const engine = new GameEngine(canvasRef.current, handleStatsUpdate, handleHurtFlash);
    engineRef.current = engine;
    engine.paceMultiplier = selectedPace.multiplier;

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
  }, [handleStatsUpdate, handleHurtFlash]);

  // Fullscreen toggle helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard controls listener (Wrackline Style Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;

      // Global Shortcuts
      if (e.code === 'KeyM') {
        handleToggleMute();
        return;
      }
      if (e.code === 'KeyH' || e.key === '?') {
        setShowGuide((prev) => !prev);
        return;
      }
      if (e.code === 'KeyF') {
        toggleFullscreen();
        return;
      }

      // Title Screen Shortcuts: 1, 2, 3 for pace
      if (gameState === 'MENU') {
        if (e.code === 'Digit1' || e.code === 'Numpad1') {
          sounds.playClick();
          setSelectedPace(PACE_MODES[0]);
          if (engine) engine.paceMultiplier = PACE_MODES[0].multiplier;
          return;
        }
        if (e.code === 'Digit2' || e.code === 'Numpad2') {
          sounds.playClick();
          setSelectedPace(PACE_MODES[1]);
          if (engine) engine.paceMultiplier = PACE_MODES[1].multiplier;
          return;
        }
        if (e.code === 'Digit3' || e.code === 'Numpad3') {
          sounds.playClick();
          setSelectedPace(PACE_MODES[2]);
          if (engine) engine.paceMultiplier = PACE_MODES[2].multiplier;
          return;
        }
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleStartGame();
          return;
        }
      }

      // Game Over Shortcuts: R to restart
      if (gameState === 'GAMEOVER') {
        if (e.code === 'KeyR' || e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleRestart();
          return;
        }
      }

      if (!engine) return;

      // In-game steering & slapping
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
  }, [gameState, selectedPace]);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.paceMultiplier = selectedPace.multiplier;
      engineRef.current.setSkin(selectedSkin);
      engineRef.current.startGame();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.paceMultiplier = selectedPace.multiplier;
      engineRef.current.restartGame();
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.resetToMenu();
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
    if (engineRef.current) {
      engineRef.current.requestSlap();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(22);
        } catch {}
      }
    }
  };

  const handleUnlockSkin = (skin: CharacterSkin) => {
    if (stats.totalCoinsCollected >= skin.cost) {
      const remainingCoins = stats.totalCoinsCollected - skin.cost;
      const updatedSkins = [...unlockedSkinIds, skin.id];
      setUnlockedSkinIds(updatedSkins);
      setSelectedSkin(skin);
      if (engineRef.current) engineRef.current.setSkin(skin);

      setStats((prev) => ({
        ...prev,
        totalCoinsCollected: remainingCoins,
      }));

      try {
        localStorage.setItem('slap_run_unlocked_skins', JSON.stringify(updatedSkins));
        localStorage.setItem('slap_run_total_coins', String(remainingCoins));
      } catch {}
      sounds.playPowerup();
    }
  };

  // Pointer drag & swipe steering on canvas for mobile and desktop
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartXRef = useRef<number>(0);
  const pointerStartYRef = useRef<number>(0);
  const pointerStartTimeRef = useRef<number>(0);
  const swipeHandledRef = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    isPointerDownRef.current = true;
    swipeHandledRef.current = false;
    pointerStartXRef.current = e.clientX;
    pointerStartYRef.current = e.clientY;
    pointerStartTimeRef.current = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || !engineRef.current || gameState !== 'PLAYING') return;

    const deltaX = e.clientX - pointerStartXRef.current;
    const deltaY = e.clientY - pointerStartYRef.current;
    const elapsed = performance.now() - pointerStartTimeRef.current;

    // Fast flick / swipe detection for Subway Surfers lane switching
    if (!swipeHandledRef.current && elapsed < 260 && Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      swipeHandledRef.current = true;
      if (deltaX < 0) {
        engineRef.current.input.keys.left = true;
        setTimeout(() => {
          if (engineRef.current) engineRef.current.input.keys.left = false;
        }, 120);
      } else {
        engineRef.current.input.keys.right = true;
        setTimeout(() => {
          if (engineRef.current) engineRef.current.input.keys.right = false;
        }, 120);
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(15); } catch {}
      }
      return;
    }

    const threshold = 6;
    if (Math.abs(deltaX) > threshold) {
      // Smooth dynamic analog drag steering on mobile
      const steerStrength = Math.min(1.0, Math.max(-1.0, deltaX / 42));
      engineRef.current.input.joystick.active = true;
      engineRef.current.input.joystick.x = steerStrength;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    if (engineRef.current) {
      engineRef.current.input.joystick.active = false;
      engineRef.current.input.joystick.x = 0;
    }

    const elapsed = performance.now() - pointerStartTimeRef.current;
    const deltaX = Math.abs(e.clientX - pointerStartXRef.current);
    const deltaY = Math.abs(e.clientY - pointerStartYRef.current);

    // Short tap anywhere on road (< 240ms, < 16px motion) = Slap!
    if (!swipeHandledRef.current && elapsed < 240 && deltaX < 16 && deltaY < 16) {
      handleSlap();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-[100dvh] overflow-hidden select-none bg-[#181A24] font-pixel touch-none overscroll-none"
    >
      {/* Authentic Retro 3D Pixel Canvas Viewport */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block touch-none cursor-pointer pixel-canvas"
      />

      {/* Subtle Retro Arcade CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none pixel-scanlines z-10 opacity-70" />

      {/* Start / Menu Screen in Retro 8-bit Pixel Design */}
      {gameState === 'MENU' && (
        <StartScreen
          highScore={stats.highScore}
          totalCoins={stats.totalCoinsCollected}
          selectedSkin={selectedSkin}
          unlockedSkinIds={unlockedSkinIds}
          selectedPace={selectedPace}
          onSelectPace={(pace) => {
            setSelectedPace(pace);
            if (engineRef.current) engineRef.current.paceMultiplier = pace.multiplier;
          }}
          onSelectSkin={(skin) => {
            setSelectedSkin(skin);
            if (engineRef.current) engineRef.current.setSkin(skin);
          }}
          onUnlockSkin={handleUnlockSkin}
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenGuide={() => setShowGuide(true)}
          onToggleFullscreen={toggleFullscreen}
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
          hurtFlash={hurtFlash}
        />
      )}

      {/* Mobile & PC Touch Controls */}
      {gameState === 'PLAYING' && engineRef.current && (
        <TouchControls
          input={engineRef.current.input}
          onSlap={handleSlap}
          isPaused={false}
        />
      )}

      {/* 8-Bit Retro Arcade Pause Overlay */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-[#000000]/75 backdrop-blur-xs select-none">
          <div className="bg-[#181A24] border-4 border-[#000000] p-5 text-center max-w-xs w-full shadow-[6px_6px_0px_#000000]">
            <span className="text-[8px] font-pixel uppercase tracking-wider text-[#F6C445] block mb-1">
              ARCADE RUN
            </span>
            <h3 className="font-pixel text-lg md:text-xl font-bold text-[#FFFFFF] mb-4 tracking-wider">
              GAME PAUSED
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleTogglePause}
                className="w-full py-3 px-4 bg-[#F6C445] hover:bg-[#FBBF24] text-[#000000] font-pixel text-xs uppercase tracking-wider border-2 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-none"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>RESUME</span>
              </button>

              <button
                onClick={() => {
                  sounds.playStart();
                  handleRestart();
                }}
                className="w-full py-2.5 px-4 bg-[#24698F] hover:bg-[#38BDF8] text-white font-pixel text-xs uppercase tracking-wider border-2 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-none"
              >
                <span>RESTART</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  handleHome();
                }}
                className="w-full py-2 px-4 bg-[#FDFBF7] hover:bg-[#EAD7B0] text-[#000000] font-pixel text-[10px] uppercase tracking-wider border-2 border-[#000000] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-none"
              >
                <span>QUIT TO MENU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen in Wrackline Neo-Brutalist Faceted Scorecard Style */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          paceName={selectedPace.name}
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

      {/* How To Play Guide Modal */}
      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}
