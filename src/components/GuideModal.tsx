import React from 'react';
import { X } from 'lucide-react';
import { sounds } from '../game/SoundEngine.ts';
import { SlapDashPixelMark } from './SlapDashLogo.tsx';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick();
          onClose();
        }
      }}
      className="absolute inset-0 z-50 bg-[#000000]/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 select-none pointer-events-auto touch-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#181A24] border-4 border-[#000000] shadow-[6px_6px_0px_#000000] max-w-lg w-full p-4 md:p-6 max-h-[90dvh] flex flex-col overflow-hidden text-[#FDFBF7] relative pointer-events-auto"
      >
        {/* Header with SlapDash icon */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#000000] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 shrink-0">
              <SlapDashPixelMark className="w-full h-full" />
            </div>
            <div>
              <h2 className="font-pixel text-base md:text-xl text-[#F6C445] leading-none">
                HOW TO PLAY
              </h2>
              <p className="font-pixel text-[7px] md:text-[8px] text-[#FDFBF7]/60 uppercase tracking-wider mt-1">
                STEER · SLAP · FEVER · ESCAPE
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 bg-[#FF4757] hover:bg-[#E25B45] text-white border-2 border-[#000000] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer transition-none pointer-events-auto touch-manipulation"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Scrollable Core Rules & Table */}
        <div className="overflow-y-auto pr-1 space-y-3 font-pixel text-[#FDFBF7] my-3">
          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="p-2.5 bg-[#1E2333] border-2 border-[#000000] shadow-[2px_2px_0px_#000000]">
              <div className="text-[10px] text-[#F6C445] mb-1">
                ▶ OPENING MEGA SLAP
              </div>
              <p className="text-[8px] text-[#FDFBF7]/80 leading-relaxed font-ui">
                Every run starts with a massive slap to the smug guy in the middle of the road! Hit SLAP or Space to land the blow and trigger the chase.
              </p>
            </div>

            <div className="p-2.5 bg-[#1E2333] border-2 border-[#000000] shadow-[2px_2px_0px_#000000]">
              <div className="text-[10px] text-[#10B981] mb-1">
                ▶ SLAP FOR STAMINA
              </div>
              <p className="text-[8px] text-[#FDFBF7]/80 leading-relaxed font-ui">
                Your energy constantly depletes! You MUST slap bystanders on the sidewalk platforms to replenish health (+35%) and stay alive.
              </p>
            </div>

            <div className="p-2.5 bg-[#1E2333] border-2 border-[#000000] shadow-[2px_2px_0px_#000000]">
              <div className="text-[10px] text-[#FF4757] mb-1">
                ▶ TWO-HIT CHASE RULE
              </div>
              <p className="text-[8px] text-[#FDFBF7]/80 leading-relaxed font-ui">
                A police officer stalks behind you. Hit 1 obstacle and they surge on-screen! Hit a 2nd obstacle while they are visible and you get BUSTED!
              </p>
            </div>

            <div className="p-2.5 bg-[#1E2333] border-2 border-[#000000] shadow-[2px_2px_0px_#000000]">
              <div className="text-[10px] text-[#38BDF8] mb-1">
                ▶ 5 LANES WITH AUTO-ALIGN
              </div>
              <p className="text-[8px] text-[#FDFBF7]/80 leading-relaxed font-ui">
                Steer left or right to squarely land in the center of any of the 5 lanes. Easily grab lines of coins and cleanly dodge barricades!
              </p>
            </div>
          </div>

          {/* Controls Keymap Box */}
          <div className="border-2 border-[#000000] bg-[#000000] p-2.5 sm:p-3 shadow-[2px_2px_0px_#000000]">
            <span className="text-[7px] sm:text-[8px] font-pixel text-[#F6C445] uppercase tracking-wider block mb-2">
              MOBILE & KEYBOARD CONTROLS
            </span>
            <div className="space-y-1.5 text-[7px] sm:text-[8px]">
              <div className="flex items-center justify-between py-1 border-b border-[#333333]">
                <span className="text-[#FDFBF7]/80">5-Lane Steer</span>
                <div className="flex items-center gap-1 text-[#F6C445]">
                  <span className="text-[#38BDF8]">Swipe / ◀ ▶ Buttons</span>
                  <span className="opacity-50">or A/D / Arrows</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#333333]">
                <span className="text-[#FDFBF7]/80">Slap & Kickoff</span>
                <div className="flex items-center gap-1 text-[#FF4757]">
                  <span className="text-[#FF4757]">Tap Screen / SLAP!</span>
                  <span className="opacity-50">or Space</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#FDFBF7]/80">Audio / Fullscreen</span>
                <div className="flex items-center gap-1 text-[#38BDF8]">
                  <span>Top Bar Buttons</span>
                  <span className="opacity-50">or M/F</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start / Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sounds.playClick();
            onClose();
          }}
          className="w-full py-3 bg-[#F6C445] hover:bg-[#FBBF24] text-[#000000] font-pixel text-xs tracking-wider border-3 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-none shrink-0 pointer-events-auto touch-manipulation"
        >
          GOT IT - LET'S RUN!
        </button>
      </div>
    </div>
  );
};
