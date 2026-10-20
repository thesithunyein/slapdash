import React, { useState } from 'react';
import { GameSettings } from '../game/settings.ts';
import { sounds } from '../game/SoundEngine.ts';
import {
  Volume2,
  VolumeX,
  Sliders,
  Smartphone,
  Eye,
  Trash2,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'controls' | 'graphics' | 'data'>('audio');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    if (key === 'masterVolume' || key === 'sfxVolume' || key === 'bgmVolume') {
      sounds.setVolumes(
        (key === 'masterVolume' ? (value as number) : settings.masterVolume) / 100,
        (key === 'sfxVolume' ? (value as number) : settings.sfxVolume) / 100,
        (key === 'bgmVolume' ? (value as number) : settings.bgmVolume) / 100
      );
    }
    if (key === 'isMuted') {
      sounds.setMuted(value as boolean);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#000000]/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-[#181A24] border-3 sm:border-4 border-[#000000] shadow-[6px_6px_0px_#000000] flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn">
        {/* Header Bar */}
        <div className="bg-[#0F172A] border-b-3 border-[#000000] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#F6C445] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wider">
                GAME SETTINGS
              </h2>
              <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8] block">
                CUSTOMIZE CONTROLS, AUDIO & VISUALS
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close settings"
            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#EF4444] hover:bg-[#DC2626] text-white border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="grid grid-cols-4 bg-[#0B0F19] border-b-2 border-black p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('audio');
            }}
            className={`py-1.5 px-1 font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1 border-2 border-black cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-[#F6C445] text-black font-bold shadow-[2px_2px_0px_#000000]'
                : 'bg-[#181A24] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>AUDIO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('controls');
            }}
            className={`py-1.5 px-1 font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1 border-2 border-black cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-[#38BDF8] text-black font-bold shadow-[2px_2px_0px_#000000]'
                : 'bg-[#181A24] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3 h-3" />
            <span>CONTROLS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('graphics');
            }}
            className={`py-1.5 px-1 font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1 border-2 border-black cursor-pointer ${
              activeTab === 'graphics'
                ? 'bg-[#10B981] text-black font-bold shadow-[2px_2px_0px_#000000]'
                : 'bg-[#181A24] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>GRAPHICS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('data');
            }}
            className={`py-1.5 px-1 font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1 border-2 border-black cursor-pointer ${
              activeTab === 'data'
                ? 'bg-[#F43F5E] text-white font-bold shadow-[2px_2px_0px_#000000]'
                : 'bg-[#181A24] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            <span>SYSTEM</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 text-white">
          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="space-y-3.5">
              {/* Master Mute Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border-2 border-black">
                <div>
                  <span className="font-pixel text-[9px] sm:text-[10px] text-white block">
                    MASTER AUDIO
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
                    {settings.isMuted ? 'ALL SOUNDS MUTED' : 'ENABLED'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !settings.isMuted;
                    update('isMuted', next);
                    sounds.playClick();
                  }}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[9px] border-2 border-black cursor-pointer flex items-center gap-1.5 ${
                    settings.isMuted
                      ? 'bg-[#EF4444] text-white'
                      : 'bg-[#10B981] text-black font-bold'
                  }`}
                >
                  {settings.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  <span>{settings.isMuted ? 'MUTED' : 'ACTIVE'}</span>
                </button>
              </div>

              {/* Master Volume Slider */}
              <div className="p-2.5 bg-[#0F172A] border-2 border-black space-y-1.5">
                <div className="flex justify-between font-pixel text-[8px] sm:text-[9px]">
                  <span className="text-[#F6C445]">MASTER VOLUME</span>
                  <span>{settings.masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => update('masterVolume', Number(e.target.value))}
                  className="w-full accent-[#F6C445] cursor-pointer"
                />
              </div>

              {/* SFX Volume Slider */}
              <div className="p-2.5 bg-[#0F172A] border-2 border-black space-y-1.5">
                <div className="flex justify-between font-pixel text-[8px] sm:text-[9px]">
                  <span className="text-[#38BDF8]">SFX / SLAPS & COINS</span>
                  <span>{settings.sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume}
                  onChange={(e) => update('sfxVolume', Number(e.target.value))}
                  onMouseUp={() => sounds.playCoin()}
                  className="w-full accent-[#38BDF8] cursor-pointer"
                />
              </div>

              {/* Music / BGM Slider */}
              <div className="p-2.5 bg-[#0F172A] border-2 border-black space-y-1.5">
                <div className="flex justify-between font-pixel text-[8px] sm:text-[9px]">
                  <span className="text-[#A78BFA]">DYNAMIC ARCADE BEAT</span>
                  <span>{settings.bgmVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.bgmVolume}
                  onChange={(e) => update('bgmVolume', Number(e.target.value))}
                  className="w-full accent-[#A78BFA] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* CONTROLS TAB */}
          {activeTab === 'controls' && (
            <div className="space-y-3.5">
              {/* Left/Right Direction Buttons Display (Direct user feedback resolution) */}
              <div className="p-2.5 bg-[#0F172A] border-2 border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-pixel text-[9px] sm:text-[10px] text-[#FDE047] block">
                      LEFT / RIGHT LANE BUTTONS (◀ ▶)
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
                      On PC keyboard, hide these buttons to keep the screen uncluttered.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 font-pixel text-[7px] sm:text-[8px]">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      update('showLaneButtons', 'auto');
                    }}
                    className={`py-1.5 px-1 border-2 border-black cursor-pointer flex flex-col items-center justify-center ${
                      settings.showLaneButtons === 'auto'
                        ? 'bg-[#10B981] text-black font-bold shadow-[2px_2px_0px_#000000]'
                        : 'bg-[#181A24] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span>AUTO</span>
                    <span className="text-[6px] opacity-80">(TOUCH ONLY)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      update('showLaneButtons', 'hidden');
                    }}
                    className={`py-1.5 px-1 border-2 border-black cursor-pointer flex flex-col items-center justify-center ${
                      settings.showLaneButtons === 'hidden'
                        ? 'bg-[#EF4444] text-white font-bold shadow-[2px_2px_0px_#000000]'
                        : 'bg-[#181A24] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span>ALWAYS OFF</span>
                    <span className="text-[6px] opacity-80">(CLEAN SCREEN)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      update('showLaneButtons', 'always');
                    }}
                    className={`py-1.5 px-1 border-2 border-black cursor-pointer flex flex-col items-center justify-center ${
                      settings.showLaneButtons === 'always'
                        ? 'bg-[#38BDF8] text-black font-bold shadow-[2px_2px_0px_#000000]'
                        : 'bg-[#181A24] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span>ALWAYS ON</span>
                    <span className="text-[6px] opacity-80">(SHOW BUTTONS)</span>
                  </button>
                </div>
              </div>

              {/* Steering Sensitivity */}
              <div className="p-2.5 bg-[#0F172A] border-2 border-black space-y-2">
                <div className="flex justify-between font-pixel text-[8px] sm:text-[9px]">
                  <span className="text-white">STEERING SENSITIVITY</span>
                  <span className="text-[#38BDF8]">{settings.sensitivity.toFixed(1)}X</span>
                </div>
                <div className="grid grid-cols-4 gap-1 font-pixel text-[7px] sm:text-[8px]">
                  {[0.75, 1.0, 1.25, 1.5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => {
                        sounds.playClick();
                        update('sensitivity', val);
                      }}
                      className={`py-1 border-2 border-black cursor-pointer text-center ${
                        settings.sensitivity === val
                          ? 'bg-[#38BDF8] text-black font-bold'
                          : 'bg-[#181A24] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {val.toFixed(2)}x
                    </button>
                  ))}
                </div>
              </div>

              {/* PC Keybindings Cheatsheet */}
              <div className="p-2.5 bg-[#0F172A] border-2 border-black space-y-1.5">
                <div className="flex items-center gap-1.5 font-pixel text-[8px] sm:text-[9px] text-[#F6C445]">
                  <Info className="w-3 h-3 text-[#F6C445]" />
                  <span>PC KEYBOARD SHORTCUTS</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[7px] sm:text-[8px] font-pixel text-[#CBD5E1]">
                  <div className="flex items-center justify-between p-1 bg-black/40 border border-black">
                    <span className="text-[#94A3B8]">STEER</span>
                    <span className="bg-black text-[#38BDF8] px-1 py-0.5 border border-[#38BDF8]">A/D or ◀/▶</span>
                  </div>
                  <div className="flex items-center justify-between p-1 bg-black/40 border border-black">
                    <span className="text-[#94A3B8]">SLAP</span>
                    <span className="bg-black text-[#F43F5E] px-1 py-0.5 border border-[#F43F5E]">SPACE / ENTER</span>
                  </div>
                  <div className="flex items-center justify-between p-1 bg-black/40 border border-black">
                    <span className="text-[#94A3B8]">PAUSE</span>
                    <span className="bg-black text-[#FDE047] px-1 py-0.5 border border-[#FDE047]">ESC / P</span>
                  </div>
                  <div className="flex items-center justify-between p-1 bg-black/40 border border-black">
                    <span className="text-[#94A3B8]">MUTE</span>
                    <span className="bg-black text-[#10B981] px-1 py-0.5 border border-[#10B981]">M</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GRAPHICS TAB */}
          {activeTab === 'graphics' && (
            <div className="space-y-3.5">
              {/* Character Visibility & Focus Indicator */}
              <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border-2 border-black">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-[9px] sm:text-[10px] text-[#FDE047] block">
                      HERO FOCUS RING & BEACON
                    </span>
                    <span className="px-1 py-0.5 text-[6px] font-pixel bg-[#10B981] text-black font-bold">
                      CLEAR VIEW
                    </span>
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
                    Vibrant ground ring, lane indicator, overhead beacon & rim lighting
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    update('characterFocus', settings.characterFocus === 'classic' ? 'enhanced' : 'classic');
                  }}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[9px] border-2 border-black cursor-pointer ${
                    settings.characterFocus !== 'classic'
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-[#334155] text-white'
                  }`}
                >
                  {settings.characterFocus !== 'classic' ? 'ENHANCED' : 'CLASSIC'}
                </button>
              </div>

              {/* Screen Impact Shake */}
              <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border-2 border-black">
                <div>
                  <span className="font-pixel text-[9px] sm:text-[10px] text-white block">
                    CAMERA HIT SHAKE
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
                    Haptic screen jolt on high-speed slaps & crashes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    update('cameraShake', !settings.cameraShake);
                  }}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[9px] border-2 border-black cursor-pointer ${
                    settings.cameraShake
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-[#334155] text-white'
                  }`}
                >
                  {settings.cameraShake ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Reduced Motion Accessibility Option */}
              <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border-2 border-black">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-[9px] sm:text-[10px] text-white block">
                      REDUCED MOTION
                    </span>
                    <span className="px-1 py-0.5 text-[6px] font-pixel bg-[#38BDF8] text-black font-bold">
                      COMFORT
                    </span>
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
                    Disables camera shake & intense visual jolts for smooth comfort
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    update('reducedMotion', !settings.reducedMotion);
                  }}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[9px] border-2 border-black cursor-pointer ${
                    settings.reducedMotion
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-[#334155] text-white'
                  }`}
                >
                  {settings.reducedMotion ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Speed Warp FOV */}
              <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border-2 border-black">
                <div>
                  <span className="font-pixel text-[9px] sm:text-[10px] text-white block">
                    SPEED WARP FOV EFFECT
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
                    Expands camera field-of-view during Fever & Turbo sprints
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    update('fovWarp', !settings.fovWarp);
                  }}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[9px] border-2 border-black cursor-pointer ${
                    settings.fovWarp
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-[#334155] text-white'
                  }`}
                >
                  {settings.fovWarp ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Haptic Vibration */}
              <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border-2 border-black">
                <div>
                  <span className="font-pixel text-[9px] sm:text-[10px] text-white block">
                    DEVICE HAPTICS
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
                    Vibrate phone on slap impacts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    update('haptics', !settings.haptics);
                  }}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[9px] border-2 border-black cursor-pointer ${
                    settings.haptics
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-[#334155] text-white'
                  }`}
                >
                  {settings.haptics ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {/* SYSTEM / DATA TAB */}
          {activeTab === 'data' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-[#0F172A] border-2 border-black space-y-2">
                <span className="font-pixel text-[9px] sm:text-[10px] text-white block">
                  ABOUT SLAP DASH ARCADE
                </span>
                <p className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8] leading-relaxed">
                  Version 2.5.0 Pro Edition. Fully native 3D engine with 100+ procedural stages, 6 dynamic biomes, and arcade physics.
                </p>
              </div>

              {/* Reset Game Progress with double-confirmation */}
              <div className="p-3 bg-[#3F1419] border-2 border-[#EF4444] space-y-2.5">
                <div className="flex items-center gap-1.5 text-[#EF4444] font-pixel text-[8px] sm:text-[9px]">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DANGER: RESET PROGRESS</span>
                </div>
                <p className="text-[7px] sm:text-[8px] font-pixel text-[#FCA5A5] leading-relaxed">
                  This will reset all unlocked stages (1-100+), high scores, collected coins, and bonus character skins.
                </p>

                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="w-full py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-pixel text-[8px] sm:text-[9px] border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    RESET ALL SAVE DATA
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onResetProgress();
                        setConfirmReset(false);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-pixel text-[8px] sm:text-[9px] border-2 border-black cursor-pointer font-bold"
                    >
                      CONFIRM RESET
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 py-2 bg-[#181A24] text-white font-pixel text-[8px] sm:text-[9px] border-2 border-black cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Done Button */}
        <div className="p-2.5 sm:p-3 bg-[#0F172A] border-t-3 border-black flex justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-[#F6C445] hover:bg-[#FBBF24] text-black font-pixel text-xs border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer font-bold"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
