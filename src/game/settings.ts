export interface GameSettings {
  // Audio
  masterVolume: number; // 0 to 100
  sfxVolume: number; // 0 to 100
  bgmVolume: number; // 0 to 100
  isMuted: boolean;

  // Controls
  onScreenControls: 'auto' | 'always' | 'hidden'; // auto = touch only
  showLaneButtons: 'auto' | 'always' | 'hidden'; // auto = hide on PC, show on touch
  sensitivity: number; // 0.75 to 1.75

  // Graphics & Feel
  characterFocus: 'enhanced' | 'classic'; // High-visibility beacon, ground target ring & rim light
  cameraShake: boolean;
  reducedMotion: boolean;
  fovWarp: boolean;
  haptics: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
}

const SETTINGS_KEY = 'slap_dash_game_settings';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 85,
  sfxVolume: 100,
  bgmVolume: 70,
  isMuted: false,

  onScreenControls: 'auto',
  showLaneButtons: 'auto',
  sensitivity: 1.0,

  characterFocus: 'enhanced',
  cameraShake: true,
  reducedMotion: false,
  fovWarp: true,
  haptics: true,
  graphicsQuality: 'high',
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage access disabled or quota exceeded
  }
}

export function isTouchEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}
