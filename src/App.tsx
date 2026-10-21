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
import { LevelSelectModal } from './components/LevelSelectModal.tsx';
import { MapSelectModal } from './components/MapSelectModal.tsx';
import { AchievementsModal } from './components/AchievementsModal.tsx';
import { AchievementToast } from './components/AchievementToast.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { SkinsModal } from './components/SkinsModal.tsx';
import { DailyRewardsModal } from './components/DailyRewardsModal.tsx';
import { DailyMissionsModal } from './components/DailyMissionsModal.tsx';
import { PWAInstallModal } from './components/PWAInstallModal.tsx';
import { isDailyRewardAvailable } from './game/dailyRewards.ts';
import { getUnclaimedMissionsCount, updateMissionsOnRun } from './game/dailyMissions.ts';
import { loadLevelProgress, LevelProgress, getMapForLevel } from './game/levels.ts';
import { GAME_MAPS, MapDefinition, getMapById } from './game/maps.ts';
import { Achievement, loadAchievementStorage, ACHIEVEMENTS_LIST } from './game/achievements.ts';
import { loadSettings, saveSettings, GameSettings } from './game/settings.ts';
import { trackGameEvent } from './game/analytics.ts';
import { Play, Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [selectedSkin, setSelectedSkin] = useState<CharacterSkin>(() => {
    try {
      const savedSkinId = localStorage.getItem('slap_run_selected_skin');
      if (savedSkinId) {
        const found = CHARACTER_SKINS.find((s) => s.id === savedSkinId);
        if (found) return found;
      }
    } catch {}
    return CHARACTER_SKINS[0];
  });
  const [selectedPace, setSelectedPace] = useState<PaceMode>(PACE_MODES[0]); // Default: NORMAL (1.0X)
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [hurtFlash, setHurtFlash] = useState<boolean>(false);
  const [tournamentInfo, setTournamentInfo] = useState<{
    season: string;
    endsInHours: number;
    topReward: string;
    activeParticipants: number;
  } | undefined>(undefined);

  // Daily Rewards, Missions & PWA Install
  const [isDailyRewardsOpen, setIsDailyRewardsOpen] = useState<boolean>(false);
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState<boolean>(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState<boolean>(false);
  const [isDailyAvailable, setIsDailyAvailable] = useState<boolean>(() => isDailyRewardAvailable());
  const [unclaimedMissions, setUnclaimedMissions] = useState<number>(() => getUnclaimedMissionsCount());

  // Levels, Maps, and Achievements State
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isMapSelectOpen, setIsMapSelectOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSkinsOpen, setIsSkinsOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [activeToastAchievement, setActiveToastAchievement] = useState<Achievement | null>(null);

  const [levelProgress, setLevelProgress] = useState<LevelProgress>(() => loadLevelProgress());
  const [currentLevel, setCurrentLevel] = useState<number>(() => levelProgress.unlockedLevel || 1);
  const [isLevelMode, setIsLevelMode] = useState<boolean>(true);
  const [currentMap, setCurrentMap] = useState<MapDefinition>(() => getMapById(getMapForLevel(levelProgress.unlockedLevel || 1)));

  // Persistent Unlocked Skins
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('slap_run_unlocked_skins');
      if (s) {
        const parsed = JSON.parse(s);
        if (!parsed.includes('rex_red')) {
          parsed.unshift('rex_red');
        }
        return parsed;
      }
    } catch {}
    return ['rex_red', 'spino_blue'];
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
      mobDistance: 180,
      currentLevel: levelProgress.unlockedLevel || 1,
      isLevelMode: true,
      currentMapId: 'market',
      boostJumpsCount: 0,
      nearMissesCount: 0,
      escapedCount: 0,
    };
  });

  // Calculate total stars earned
  let totalStars = 0;
  Object.values(levelProgress.levelStars).forEach((s) => {
    totalStars += s;
  });

  // Calculate claimable achievements count for UI notification
  const achievementStore = loadAchievementStorage();
  let claimableAchievementsCount = 0;
  ACHIEVEMENTS_LIST.forEach((a) => {
    if (achievementStore[a.id]) {
      claimableAchievementsCount++;
    }
  });

  // Initial Global Leaderboard Sync from API
  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.entries) && data.entries.length > 0) {
            setLeaderboardEntries(data.entries);
          }
          if (data.tournament) {
            setTournamentInfo(data.tournament);
          }
        }
      })
      .catch(() => {});
  }, []);

  const submitScoreToLeaderboard = useCallback((scoreToSubmit: number, comboToSubmit: number) => {
    let savedName = 'YOU (CHAMPION)';
    try {
      const stored = localStorage.getItem('slap_run_share_name');
      if (stored) savedName = stored;
    } catch {}

    setStats((curr) => ({
      ...curr,
      globalRankPending: true,
      globalRankConfirmed: false,
      leaderboardError: false,
    }));

    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: savedName,
        score: scoreToSubmit,
        maxCombo: comboToSubmit,
        skinId: selectedSkin.id,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.rank) {
          setStats((curr) => ({
            ...curr,
            globalRank: data.rank,
            globalRankConfirmed: true,
            globalRankPending: false,
            nextPlayerAbove: data.nextPlayerAbove,
          }));
          if (Array.isArray(data.entries)) {
            setLeaderboardEntries(data.entries);
          }
        } else {
          setStats((curr) => ({
            ...curr,
            globalRankPending: false,
            leaderboardError: true,
          }));
        }
      })
      .catch(() => {
        setStats((curr) => ({
          ...curr,
          globalRankPending: false,
          leaderboardError: true,
        }));
        // Fallback if offline - save locally
        setLeaderboardEntries((prev) => {
          const newEntry = {
            id: String(Date.now()),
            name: savedName,
            score: scoreToSubmit,
            maxCombo: comboToSubmit,
            date: 'Just Now',
            skinId: selectedSkin.id,
            isPlayer: true,
          };
          const updated = [
            ...prev.filter((e) => !e.isPlayer || e.score >= scoreToSubmit),
            newEntry,
          ]
            .sort((a, b) => b.score - a.score)
            .slice(0, 15);
          try {
            localStorage.setItem('slap_run_leaderboard', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      });
  }, [selectedSkin.id]);

  // Handle stats updates from GameEngine
  const handleStatsUpdate = useCallback(
    (newStats: GameStats, newState: GameState) => {
      setStats((curr) => ({
        ...newStats,
        globalRank: curr.globalRank,
        globalRankPending: curr.globalRankPending,
        globalRankConfirmed: curr.globalRankConfirmed,
        nextPlayerAbove: curr.nextPlayerAbove,
        leaderboardError: curr.leaderboardError,
      }));
      setGameState(newState);

      // If transitioned to GAMEOVER
      if (newState === 'GAMEOVER') {
        trackGameEvent('game_over', {
          reason: newStats.gameOverReason,
          score: newStats.score,
          slaps: newStats.slapsCount,
          combo: newStats.maxCombo,
        });

        const completedBounties = updateMissionsOnRun(newStats);
        if (completedBounties.length > 0) {
          setUnclaimedMissions(getUnclaimedMissionsCount());
          sounds.playAchievement();
          setActiveToastAchievement({
            id: completedBounties[0].id,
            title: `Bounty: ${completedBounties[0].title}`,
            description: `Earned +${completedBounties[0].rewardCoins} Coins!`,
            icon: 'target',
            category: 'slap',
            unlocked: true,
            rewardCoins: completedBounties[0].rewardCoins,
          });
        }

        if (newStats.score > 0) {
          submitScoreToLeaderboard(newStats.score, newStats.maxCombo);
        }
      }
    },
    [submitScoreToLeaderboard]
  );

  const handleRetryLeaderboard = useCallback(() => {
    if (stats.score > 0) {
      submitScoreToLeaderboard(stats.score, stats.maxCombo);
    }
  }, [stats.score, stats.maxCombo, submitScoreToLeaderboard]);

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
    engine.setSkin(selectedSkin);
    const initialMap = isLevelMode ? getMapById(getMapForLevel(currentLevel)) : currentMap;
    engine.setMap(initialMap);

    // Connect Achievement Toast Hook
    engine.onAchievementUnlocked = (ach: Achievement) => {
      setActiveToastAchievement(ach);
      setTimeout(() => {
        setActiveToastAchievement((curr) => (curr?.id === ach.id ? null : curr));
      }, 4500);
    };

    // Connect Level Completed Hook
    engine.onLevelCompleted = (_lvl, _stars, _score, _coins) => {
      trackGameEvent('stage_clear');
      const refreshed = loadLevelProgress();
      setLevelProgress(refreshed);
    };

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

  // Keep engine settings in sync with user preferences
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.applySettings(settings);
    }
  }, [settings]);

  // Fullscreen toggle helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard controls listener
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
      if (e.code === 'KeyL') {
        setIsLevelSelectOpen((prev) => !prev);
        return;
      }

      // Title Screen Shortcuts
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

      // In-game 3-lane steering, jumping & slapping
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.input.keys.left = true;
        engine.changeLane(-1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.input.keys.right = true;
        engine.changeLane(1);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        engine.requestJump();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (engine.introState.active) {
          engine.triggerIntroSlapNow();
        } else {
          engine.requestSlap();
        }
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
      if (isLevelMode) {
        engineRef.current.setLevel(currentLevel, true);
      } else {
        engineRef.current.isLevelMode = false;
        engineRef.current.setMap(currentMap);
      }
      engineRef.current.startGame();
    }
  };

  const handleToggleMode = useCallback((levelMode: boolean) => {
    setIsLevelMode(levelMode);
    if (levelMode) {
      const stageMap = getMapById(getMapForLevel(currentLevel));
      setCurrentMap(stageMap);
      if (engineRef.current) {
        engineRef.current.isLevelMode = true;
        engineRef.current.setLevel(currentLevel, true);
      }
    } else {
      if (engineRef.current) {
        engineRef.current.isLevelMode = false;
        engineRef.current.setMap(currentMap);
      }
    }
  }, [currentLevel, currentMap]);

  const handleSelectLevel = (levelNumber: number) => {
    setCurrentLevel(levelNumber);
    setIsLevelMode(true);
    const targetMap = getMapById(getMapForLevel(levelNumber));
    setCurrentMap(targetMap);
    setIsLevelSelectOpen(false);
    if (engineRef.current) {
      engineRef.current.paceMultiplier = selectedPace.multiplier;
      engineRef.current.setSkin(selectedSkin);
      engineRef.current.setLevel(levelNumber, true);
      engineRef.current.startGame();
    }
  };

  const handleSelectMap = (map: MapDefinition) => {
    setCurrentMap(map);
    setIsMapSelectOpen(false);
    setIsLevelMode(false);
    if (engineRef.current) {
      engineRef.current.isLevelMode = false;
      engineRef.current.setMap(map);
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.paceMultiplier = selectedPace.multiplier;
      if (isLevelMode) {
        // If current level was cleared, advance to next stage!
        const nextLvl = stats.levelComplete ? currentLevel + 1 : currentLevel;
        setCurrentLevel(nextLvl);
        engineRef.current.setLevel(nextLvl, true);
      } else {
        engineRef.current.isLevelMode = false;
        engineRef.current.setMap(currentMap);
      }
      engineRef.current.restartGame();
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.resetToMenu();
      const activeMap = isLevelMode ? getMapById(getMapForLevel(currentLevel)) : currentMap;
      engineRef.current.setMap(activeMap);
      setGameState('MENU');
      setLevelProgress(loadLevelProgress());
    }
  };

  const handleToggleMute = () => {
    const newMuted = sounds.toggleMute();
    setIsMuted(newMuted);
    setSettings((prev) => {
      const up = { ...prev, isMuted: newMuted };
      saveSettings(up);
      return up;
    });
  };

  const handleResetProgress = () => {
    try {
      localStorage.removeItem('slap_run_level_progress');
      localStorage.removeItem('slap_run_highscore');
      localStorage.removeItem('slap_run_total_coins');
      localStorage.removeItem('slap_run_unlocked_skins');
      localStorage.removeItem('slap_run_achievements');
      localStorage.removeItem('slap_run_leaderboard');
    } catch {}

    setLevelProgress({ unlockedLevel: 1, levelStars: {}, levelScores: {} });
    setUnlockedSkinIds(['speedy_dash']);
    setSelectedSkin(CHARACTER_SKINS[0]);
    if (engineRef.current) {
      engineRef.current.setSkin(CHARACTER_SKINS[0]);
      engineRef.current.setLevel(1);
    }
    setStats((prev) => ({
      ...prev,
      score: 0,
      highScore: 0,
      coins: 0,
      totalCoinsCollected: 0,
      currentLevel: 1,
      chaosLevel: 0,
      distanceRun: 0,
      comboStreak: 0,
    }));
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
      if (engineRef.current.introState.active) {
        engineRef.current.triggerIntroSlapNow();
      } else {
        engineRef.current.requestSlap();
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(22);
        } catch {}
      }
    }
  };

  const handleSelectSkin = (skin: CharacterSkin) => {
    setSelectedSkin(skin);
    try {
      localStorage.setItem('slap_run_selected_skin', skin.id);
    } catch {}
    if (engineRef.current) engineRef.current.setSkin(skin);
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
        localStorage.setItem('slap_run_selected_skin', skin.id);
        localStorage.setItem('slap_run_total_coins', String(remainingCoins));
      } catch {}
      sounds.playPowerup();
    }
  };

  const handleCoinsClaimed = (coins: number) => {
    const newTotal = stats.totalCoinsCollected + coins;
    setStats((prev) => ({
      ...prev,
      totalCoinsCollected: newTotal,
      coins: prev.coins + coins,
    }));
    try {
      localStorage.setItem('slap_run_total_coins', String(newTotal));
    } catch {}
    sounds.playPowerup();
  };

  const handleDailyRewardClaimed = (coinsAdded: number) => {
    handleCoinsClaimed(coinsAdded);
    setIsDailyAvailable(isDailyRewardAvailable());
  };

  const handleBountyClaimed = (coinsAdded: number) => {
    handleCoinsClaimed(coinsAdded);
    setUnclaimedMissions(getUnclaimedMissionsCount());
  };

  // Pointer drag & swipe steering on canvas
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

    // Fast flick / swipe detection for 3-lane switching, diagonal jumps & vaults
    if (!swipeHandledRef.current && elapsed < 320) {
      // 1. Diagonal Swipe UP-LEFT or UP-RIGHT -> Jump AND change lane simultaneously!
      if (deltaY < -24 && Math.abs(deltaX) > 20) {
        swipeHandledRef.current = true;
        if (deltaX < 0) {
          engineRef.current.changeLane(-1);
        } else {
          engineRef.current.changeLane(1);
        }
        engineRef.current.requestJump();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(18); } catch {}
        }
        return;
      }

      // 2. Pure Swipe UP -> Jump Vault
      if (deltaY < -26 && Math.abs(deltaY) > Math.abs(deltaX) * 1.05) {
        swipeHandledRef.current = true;
        engineRef.current.requestJump();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(15); } catch {}
        }
        return;
      }

      // 3. Pure Horizontal Swipe Left / Right -> Lane switch
      if (Math.abs(deltaX) > 24 && Math.abs(deltaX) > Math.abs(deltaY) * 0.9) {
        swipeHandledRef.current = true;
        if (deltaX < 0) {
          engineRef.current.changeLane(-1);
        } else {
          engineRef.current.changeLane(1);
        }
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(14); } catch {}
        }
        return;
      }
    }

    const threshold = 6;
    if (Math.abs(deltaX) > threshold) {
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
    const deltaX = e.clientX - pointerStartXRef.current;
    const deltaY = e.clientY - pointerStartYRef.current;

    // Tap detection when user didn't swipe
    if (!swipeHandledRef.current && elapsed < 260 && Math.abs(deltaX) < 18 && Math.abs(deltaY) < 18) {
      const screenW = window.innerWidth;
      const clientX = e.clientX;

      // Intuitive edge taps: tap left 28% to move left, right 28% to move right, center to slap
      if (clientX < screenW * 0.28) {
        engineRef.current?.changeLane(-1);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(12); } catch {}
        }
      } else if (clientX > screenW * 0.72) {
        engineRef.current?.changeLane(1);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(12); } catch {}
        }
      } else {
        handleSlap();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-[100dvh] overflow-hidden select-none bg-[#181A24] font-pixel touch-none overscroll-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block touch-none cursor-pointer pixel-canvas"
      />

      {/* Warm Tropical Resort Frame (Desktop only, edge-to-edge full bleed on mobile) */}
      <div className="hidden md:block absolute inset-3 rounded-[34px] border-[5px] border-[#F97316]/50 shadow-[0_0_35px_rgba(249,115,22,0.3)] pointer-events-none z-30" />



      {/* Achievement Unlocked Toast Notification */}
      <AchievementToast
        achievement={activeToastAchievement}
        onDismiss={() => setActiveToastAchievement(null)}
      />

      {/* Start / Menu Screen */}
      {gameState === 'MENU' && (
        <StartScreen
          highScore={stats.highScore}
          totalCoins={stats.totalCoinsCollected}
          selectedSkin={selectedSkin}
          unlockedSkinIds={unlockedSkinIds}
          selectedPace={selectedPace}
          unlockedLevel={levelProgress.unlockedLevel}
          totalStars={totalStars}
          currentMap={currentMap}
          claimableAchievementsCount={claimableAchievementsCount}
          isDailyAvailable={isDailyAvailable}
          unclaimedMissionsCount={unclaimedMissions}
          isLevelMode={isLevelMode}
          onToggleMode={handleToggleMode}
          onSelectPace={(pace) => {
            setSelectedPace(pace);
            if (engineRef.current) engineRef.current.paceMultiplier = pace.multiplier;
          }}
          onSelectSkin={handleSelectSkin}
          onUnlockSkin={handleUnlockSkin}
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onOpenMapSelect={() => setIsMapSelectOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onOpenDailyRewards={() => setIsDailyRewardsOpen(true)}
          onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
          onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
          onOpenGuide={() => setShowGuide(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSkins={() => setIsSkinsOpen(true)}
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

      {/* Opening Boss Encounter Prompt */}
      {gameState === 'PLAYING' && stats.introActive && stats.introPhase === 'WINDUP' && (
        <div className="absolute top-[24%] inset-x-0 z-30 flex flex-col items-center pointer-events-none px-4 animate-bounce">
          <div className="bg-[#19110B]/95 border-2 border-[#F97316] shadow-[0_8px_24px_rgba(0,0,0,0.6)] px-4 py-2.5 rounded-2xl flex flex-col items-center gap-1 backdrop-blur-sm text-center max-w-sm">
            <span className="font-['Lilita_One'] text-xs sm:text-sm text-[#FACC15] tracking-wider uppercase">
              SMACK {engineRef.current?.introState.victim?.name || 'THE BOSS'}!
            </span>
            <span className="font-['Fredoka'] text-xs text-[#38BDF8] font-bold">
              TAP SLAP OR PRESS SPACE FOR MEGA SLAP!
            </span>
          </div>
        </div>
      )}

      {/* Touch Controls - On PC, left/right buttons are automatically hidden */}
      {gameState === 'PLAYING' && engineRef.current && (
        <TouchControls
          input={engineRef.current.input}
          onSlap={handleSlap}
          onJump={() => engineRef.current?.requestJump()}
          onLaneLeft={() => engineRef.current?.changeLane(-1)}
          onLaneRight={() => engineRef.current?.changeLane(1)}
          onJumpLeft={() => {
            engineRef.current?.changeLane(-1);
            engineRef.current?.requestJump();
          }}
          onJumpRight={() => {
            engineRef.current?.changeLane(1);
            engineRef.current?.requestJump();
          }}
          isPaused={false}
          isIntroActive={stats.introActive}
          showLaneButtonsSetting={settings.showLaneButtons}
          onScreenControlsSetting={settings.onScreenControls}
        />
      )}

      {/* Pause Overlay */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-[#0F121C]/80 backdrop-blur-md select-none animate-fadeIn">
          <div className="bg-[#1B1D2A] border-3 border-black rounded-2xl p-6 text-center max-w-xs w-full shadow-[6px_6px_0px_#000000]">
            <span className="font-ui text-[9px] uppercase font-bold tracking-wider text-[#FACC15] block mb-1">
              Sprint Paused
            </span>
            <h3 className="font-pixel text-lg font-bold text-white mb-5 tracking-wide">
              PAUSED
            </h3>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleTogglePause}
                className="w-full py-3 px-4 bg-[#10B981] hover:bg-[#34D399] text-black font-ui text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>RESUME SPRINT</span>
              </button>

              <button
                onClick={() => {
                  sounds.playStart();
                  handleRestart();
                }}
                className="w-full py-2.5 px-4 bg-[#FACC15] hover:bg-[#FDE047] text-black font-ui text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                <span>RESTART</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsSettingsOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-[#25283B] hover:bg-[#31354D] text-white font-ui text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer transition-transform"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>SETTINGS</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  handleHome();
                }}
                className="w-full py-2.5 px-4 bg-[#12131C] hover:bg-[#1B1D2A] text-[#94A3B8] hover:text-white font-ui text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-black cursor-pointer transition-colors"
              >
                <span>MAIN MENU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          paceName={selectedPace.name}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onRetryLeaderboard={handleRetryLeaderboard}
        />
      )}

      {/* Level Select Modal (1 to 100+) */}
      {isLevelSelectOpen && (
        <LevelSelectModal
          progress={levelProgress}
          onSelectLevel={handleSelectLevel}
          onClose={() => setIsLevelSelectOpen(false)}
        />
      )}

      {/* Map Select Modal (6 Biomes) */}
      {isMapSelectOpen && (
        <MapSelectModal
          currentMapId={currentMap.id}
          highestLevel={levelProgress.unlockedLevel}
          onSelectMap={handleSelectMap}
          onClose={() => setIsMapSelectOpen(false)}
        />
      )}

      {/* Achievements Modal (28 Trophies) */}
      {isAchievementsOpen && (
        <AchievementsModal
          stats={stats}
          totalCoins={stats.totalCoinsCollected}
          unlockedLevel={levelProgress.unlockedLevel}
          totalStars={totalStars}
          unlockedSkinsCount={unlockedSkinIds.length}
          onCoinsClaimed={handleCoinsClaimed}
          onClose={() => setIsAchievementsOpen(false)}
        />
      )}

      {/* Global Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          entries={leaderboardEntries}
          playerScore={stats.highScore}
          tournament={tournamentInfo}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* Game Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
            setIsMuted(newSettings.isMuted);
            engineRef.current?.setCharacterFocus(newSettings.characterFocus !== 'classic');
          }}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Runner Wardrobe / Skins Modal */}
      {isSkinsOpen && (
        <SkinsModal
          isOpen={isSkinsOpen}
          onClose={() => setIsSkinsOpen(false)}
          selectedSkin={selectedSkin}
          unlockedSkinIds={unlockedSkinIds}
          totalCoins={stats.totalCoinsCollected}
          onSelectSkin={handleSelectSkin}
          onUnlockSkin={handleUnlockSkin}
        />
      )}

      {/* How To Play Guide Modal */}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {/* Daily Login Rewards Modal */}
      {isDailyRewardsOpen && (
        <DailyRewardsModal
          isOpen={isDailyRewardsOpen}
          onClose={() => setIsDailyRewardsOpen(false)}
          onRewardClaimed={handleDailyRewardClaimed}
        />
      )}

      {/* Daily Bounties / Missions Modal */}
      {isDailyMissionsOpen && (
        <DailyMissionsModal
          isOpen={isDailyMissionsOpen}
          onClose={() => setIsDailyMissionsOpen(false)}
          onRewardClaimed={handleBountyClaimed}
        />
      )}

      {/* App Store PWA Install Modal */}
      {isPWAInstallOpen && (
        <PWAInstallModal
          isOpen={isPWAInstallOpen}
          onClose={() => setIsPWAInstallOpen(false)}
        />
      )}
    </div>
  );
}
