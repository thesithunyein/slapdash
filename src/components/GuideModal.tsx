import React from 'react';
import { sounds } from '../game/SoundEngine.ts';
import { SlapDashMark } from './SlapDashLogo.tsx';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-[#17181C]/55 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 select-none pointer-events-auto">
      <div className="bg-[#FDFBF7] border-3 border-[#17181C] rounded-3xl max-w-lg w-full p-5 md:p-7 shadow-[0_8px_0_#17181C] max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Header with SlapDash icon */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-[#17181C]/15 shrink-0">
          <div className="w-10 h-10 shrink-0 drop-shadow-[0_2px_0_#17181C]">
            <SlapDashMark className="w-full h-full" />
          </div>
          <div>
            <h2 className="font-game text-2xl md:text-3xl text-[#17181C] leading-none">
              HOW TO PLAY
            </h2>
            <p className="font-ui font-black text-[10px] md:text-xs text-[#17181C]/60 uppercase tracking-widest mt-1">
              Four verbs and nothing else: Steer, Slap, Fever, Escape
            </p>
          </div>
        </div>

        {/* Scrollable Core Rules & Table */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs md:text-sm font-ui text-[#17181C]">
          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white border-2 border-[#17181C] shadow-[0_3px_0_#17181C]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-game text-base text-[#24698F]">STEER</span>
                <span className="text-[10px] font-black uppercase text-[#17181C]/50">LANE CONTROL</span>
              </div>
              <p className="text-[#17181C]/80 leading-snug">
                Weave left and right across the wide 3-lane boulevard to line up targets and avoid banana peels.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#17181C] shadow-[0_3px_0_#17181C]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-game text-base text-[#FF4757]">SLAP</span>
                <span className="text-[10px] font-black uppercase text-[#17181C]/50">HIGH REACH</span>
              </div>
              <p className="text-[#17181C]/80 leading-snug">
                Smack pedestrians as you zoom past. Every hit rewards coins, points, and fills the Chaos meter!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#17181C] shadow-[0_3px_0_#17181C]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-game text-base text-[#F6C445]">FEVER 16x</span>
                <span className="text-[10px] font-black uppercase text-[#17181C]/50">CHAOS BOOST</span>
              </div>
              <p className="text-[#17181C]/80 leading-snug">
                Hit consecutive combos without tripping to ignite full FEVER mode: maximum 16x multiplier and blazing speed!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#17181C] shadow-[0_3px_0_#17181C]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-game text-base text-[#E25B45]">OUTRUN MOB</span>
                <span className="text-[10px] font-black uppercase text-[#17181C]/50">SURVIVAL</span>
              </div>
              <p className="text-[#17181C]/80 leading-snug">
                The enraged mob is chasing you! Slipping on peels stumbles you and lets the mob close the distance.
              </p>
            </div>
          </div>

          {/* Controls Keymap Table */}
          <div className="border-2 border-[#17181C] rounded-2xl bg-[#FAF6ED] p-3 shadow-[0_2px_0_#17181C]">
            <span className="text-[10px] font-black text-[#17181C]/60 uppercase tracking-widest block mb-2">
              CONTROL MAPPINGS
            </span>
            <div className="space-y-1.5 text-xs font-bold">
              <div className="flex items-center justify-between py-1 border-b border-[#17181C]/10">
                <span className="text-[#17181C]/75">Steer Left / Right</span>
                <div className="flex items-center gap-1.5 font-game">
                  <kbd className="px-2 py-0.5 bg-white border border-[#17181C] rounded-md shadow-[0_1px_0_#17181C]">A</kbd>
                  <kbd className="px-2 py-0.5 bg-white border border-[#17181C] rounded-md shadow-[0_1px_0_#17181C]">D</kbd>
                  <span className="text-[#17181C]/40">or</span>
                  <span className="text-[11px] font-ui">Drag / Thumbstick</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#17181C]/10">
                <span className="text-[#17181C]/75">Slap Action</span>
                <div className="flex items-center gap-1.5 font-game">
                  <kbd className="px-2.5 py-0.5 bg-white border border-[#17181C] rounded-md shadow-[0_1px_0_#17181C]">SPACE</kbd>
                  <span className="text-[#17181C]/40">or</span>
                  <span className="text-[11px] font-ui">Click / Tap Screen</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#17181C]/75">Pause / Menu</span>
                <div className="flex items-center gap-1.5 font-game">
                  <kbd className="px-2 py-0.5 bg-white border border-[#17181C] rounded-md shadow-[0_1px_0_#17181C]">ESC</kbd>
                  <kbd className="px-2 py-0.5 bg-white border border-[#17181C] rounded-md shadow-[0_1px_0_#17181C]">P</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tactile GOT IT button */}
        <div className="pt-4 mt-3 border-t-2 border-[#17181C]/15 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-[#24698F] hover:bg-[#1B5575] text-white font-game text-base tracking-wider border-2 border-[#17181C] shadow-[0_4px_0_#17181C] active:translate-y-[2px] active:shadow-[0_1px_0_#17181C] transition-all cursor-pointer"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
