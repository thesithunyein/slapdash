import React, { useRef, useState } from 'react';
import { InputState } from '../game/types.ts';
import { Hand } from 'lucide-react';

interface TouchControlsProps {
  input: InputState;
  onSlap: () => void;
  isPaused?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ input, onSlap, isPaused }) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);
  const [isSlapPressed, setIsSlapPressed] = useState<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);

  const resetJoystick = () => {
    activePointerIdRef.current = null;
    setIsJoystickActive(false);
    setKnobOffset({ x: 0, y: 0 });
    input.keys.left = false;
    input.keys.right = false;
    input.joystick.active = false;
    input.joystick.x = 0;
  };

  const processJoystickMovement = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxRadius = rect.width * 0.42;

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(deltaY, deltaX);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobOffset({ x: knobX, y: knobY });

    // Smooth analog lateral strength (-1.0 to 1.0)
    const normalizedX = knobX / maxRadius;
    const deadzone = 0.15;

    if (Math.abs(normalizedX) > deadzone) {
      input.joystick.active = true;
      input.joystick.x = normalizedX;
      if (normalizedX < 0) {
        input.keys.left = true;
        input.keys.right = false;
      } else {
        input.keys.left = false;
        input.keys.right = true;
      }
    } else {
      input.joystick.active = false;
      input.joystick.x = 0;
      input.keys.left = false;
      input.keys.right = false;
    }
  };

  // Pointer event handlers with pointer capture (supports Touch, Pen & Mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused || activePointerIdRef.current !== null) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    activePointerIdRef.current = e.pointerId;
    setIsJoystickActive(true);
    processJoystickMovement(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isJoystickActive || isPaused || e.pointerId !== activePointerIdRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    processJoystickMovement(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId === activePointerIdRef.current) {
      e.preventDefault();
      e.stopPropagation();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      resetJoystick();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 sm:px-4 md:px-8 pointer-events-none z-30 flex items-end justify-between select-none">
      {/* Left: Ergonomic Touch Joystick with Visual D-Pad */}
      <div className="flex flex-col items-center gap-1 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Steer joystick"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-[#181A24]/90 border-3 border-[#000000] shadow-[3px_3px_0px_#000000] relative flex items-center justify-center touch-none cursor-grab active:cursor-grabbing select-none"
        >
          {/* Retro Pixel Directional Indicators */}
          <div className="absolute top-1 text-[7px] sm:text-[8px] font-pixel text-[#F6C445]/60 pointer-events-none">▲</div>
          <div className="absolute bottom-1 text-[7px] sm:text-[8px] font-pixel text-[#F6C445]/60 pointer-events-none">▼</div>
          <div className="absolute left-1.5 text-[7px] sm:text-[8px] font-pixel text-[#F6C445]/60 pointer-events-none">◀</div>
          <div className="absolute right-1.5 text-[7px] sm:text-[8px] font-pixel text-[#F6C445]/60 pointer-events-none">▶</div>

          {/* Center Pixel Crosshair */}
          <div className="absolute inset-x-2.5 h-[2px] bg-[#000000] pointer-events-none opacity-40" />
          <div className="absolute inset-y-2.5 w-[2px] bg-[#000000] pointer-events-none opacity-40" />

          {/* Chunky Pixel Thumb Knob */}
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#24698F] border-2 border-[#000000] shadow-[2px_2px_0px_#000000] flex items-center justify-center transition-transform duration-75 ${
              isJoystickActive ? 'bg-[#38BDF8] scale-105' : ''
            }`}
            style={{
              transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
            }}
          >
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#FFFFFF] border border-[#000000]" />
          </div>
        </div>
        <span className="text-[6px] sm:text-[7px] font-pixel text-[#FFFFFF]/60 tracking-wider">
          STEER
        </span>
      </div>

      {/* Right: Tactile Arcade SLAP! Action Button with Haptics */}
      <div className="flex flex-col items-center gap-1 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSlapPressed(true);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(22); } catch {}
            }
            onSlap();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSlapPressed(false);
          }}
          onPointerCancel={() => {
            setIsSlapPressed(false);
          }}
          aria-label="Slap action button"
          className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-[#FF4757] hover:bg-[#E25B45] text-white border-3 sm:border-4 border-[#000000] shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] flex flex-col items-center justify-center cursor-pointer touch-none select-none transition-none ${
            isSlapPressed ? 'translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0px_#000000] bg-[#E25B45]' : ''
          }`}
        >
          <Hand className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[2.5] -rotate-12 mb-0.5" />
          <span className="font-pixel text-[9px] sm:text-xs md:text-sm tracking-wider text-white">
            SLAP!
          </span>
        </button>
        <span className="text-[6px] sm:text-[7px] font-pixel text-[#FF4757]/80 tracking-wider">
          RECHARGE
        </span>
      </div>
    </div>
  );
};
