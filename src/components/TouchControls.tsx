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
    const maxRadius = rect.width * 0.45;

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
    <div className="absolute inset-x-0 bottom-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] px-4 md:px-8 pointer-events-none z-30 flex items-end justify-between select-none">
      {/* Left: Virtual Thumb Joystick in Wrackline Neo-Brutalist Tactile Cream */}
      <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Steer joystick"
          className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#FDFBF7]/90 backdrop-blur-xs border-2 border-[#17181C] shadow-[0_4px_0_#17181C] relative flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
        >
          {/* Crosshairs */}
          <div className="absolute inset-x-2 h-[2px] bg-[#17181C]/15 pointer-events-none" />
          <div className="absolute inset-y-2 w-[2px] bg-[#17181C]/15 pointer-events-none" />

          {/* Tactile Thumb Knob in Deep Cobalt */}
          <div
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#24698F] border-2 border-[#17181C] shadow-[0_3px_0_#10364C] flex items-center justify-center transition-transform ${
              isJoystickActive ? 'scale-105 shadow-[0_1px_0_#10364C]' : 'scale-100'
            }`}
            style={{
              transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/30 border border-white/50" />
          </div>
        </div>

        {/* Desktop Keyboard Cues */}
        <span className="hidden md:inline-block font-game text-[10px] text-[#17181C]/60 bg-[#FDFBF7]/80 px-2 py-0.5 rounded-md border border-[#17181C]/30 shadow-[0_1px_0_#17181C]">
          [A] [D] / [◄] [►] STEER
        </span>
      </div>

      {/* Right: Tactile Neo-Brutalist SLAP! Button in Punch Coral */}
      <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSlapPressed(true);
            onSlap();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSlapPressed(false);
          }}
          onPointerCancel={(e) => {
            setIsSlapPressed(false);
          }}
          aria-label="Slap action button"
          className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-[#FF4757] hover:bg-[#E25B45] text-white border-3 border-[#17181C] shadow-[0_6px_0_#17181C] active:translate-y-[2px] active:shadow-[0_2px_0_#17181C] flex flex-col items-center justify-center transition-all cursor-pointer touch-none ${
            isSlapPressed ? 'translate-y-[2px] shadow-[0_2px_0_#17181C]' : ''
          }`}
        >
          <Hand className="w-8 h-8 md:w-9 md:h-9 stroke-[2.5] -rotate-12 mb-0.5 drop-shadow-[0_2px_0_#17181C]" />
          <span className="font-game text-base md:text-lg tracking-wider text-white drop-shadow-[0_1px_0_#17181C]">
            SLAP!
          </span>
        </button>

        {/* Desktop Keyboard Cue */}
        <span className="hidden md:inline-block font-game text-[10px] text-[#17181C]/60 bg-[#FDFBF7]/80 px-2 py-0.5 rounded-md border border-[#17181C]/30 shadow-[0_1px_0_#17181C]">
          [SPACE] SLAP
        </span>
      </div>
    </div>
  );
};
