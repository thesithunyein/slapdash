import React, { useRef, useState, useEffect } from 'react';
import { InputState } from '../game/types.ts';
import { isTouchEnvironment } from '../game/settings.ts';
import { Hand } from 'lucide-react';

interface TouchControlsProps {
  input: InputState;
  onSlap: () => void;
  onJump?: () => void;
  onLaneLeft?: () => void;
  onLaneRight?: () => void;
  isPaused?: boolean;
  isIntroActive?: boolean;
  showLaneButtonsSetting?: 'auto' | 'always' | 'hidden';
  onScreenControlsSetting?: 'auto' | 'always' | 'hidden';
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  input,
  onSlap,
  onJump,
  onLaneLeft,
  onLaneRight,
  isPaused,
  isIntroActive,
  showLaneButtonsSetting = 'auto',
  onScreenControlsSetting = 'auto',
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);
  const [isSlapPressed, setIsSlapPressed] = useState<boolean>(false);
  const [isJumpPressed, setIsJumpPressed] = useState<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);

  const [isTouch, setIsTouch] = useState<boolean>(() => isTouchEnvironment());

  useEffect(() => {
    const handleCheck = () => {
      setIsTouch(isTouchEnvironment());
    };
    handleCheck();
    window.addEventListener('resize', handleCheck);
    return () => window.removeEventListener('resize', handleCheck);
  }, []);

  // On PC, do not display buttons for left/right selection
  const shouldShowLaneButtons =
    showLaneButtonsSetting === 'always' ||
    (showLaneButtonsSetting === 'auto' && isTouch);

  // If onScreenControlsSetting is explicitly hidden, don't show controls at all
  if (onScreenControlsSetting === 'hidden') {
    return null;
  }

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

    // Lateral strength
    const normalizedX = knobX / maxRadius;
    const deadzone = 0.22;

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
      {/* Left: 3-Lane Quick Switches (Touch only / Hidden on PC) & Analog Joystick */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Rapid Lane Left / Right Buttons - Hidden when played on PC */}
        {shouldShowLaneButtons && (
          <div className="flex flex-col gap-1.5 animate-fadeIn">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onLaneLeft) onLaneLeft();
              }}
              aria-label="Move left lane"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-[#181A24] border-2 border-[#000000] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] text-[#F6C445] font-pixel text-xs flex items-center justify-center cursor-pointer select-none"
            >
              ◀
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onLaneRight) onLaneRight();
              }}
              aria-label="Move right lane"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-[#181A24] border-2 border-[#000000] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] text-[#F6C445] font-pixel text-xs flex items-center justify-center cursor-pointer select-none"
            >
              ▶
            </button>
          </div>
        )}

        {/* Ergonomic Steer Joystick - on touch or always visible */}
        {isTouch && (
          <div className="flex flex-col items-center gap-1">
            <div
              ref={joystickBaseRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              aria-label="Steer joystick"
              className="w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 bg-[#181A24]/90 border-3 border-[#000000] shadow-[3px_3px_0px_#000000] relative flex items-center justify-center touch-none cursor-grab active:cursor-grabbing select-none"
            >
              <div className="absolute left-1 text-[7px] font-pixel text-[#F6C445]/60 pointer-events-none">◀</div>
              <div className="absolute right-1 text-[7px] font-pixel text-[#F6C445]/60 pointer-events-none">▶</div>
              <div className="absolute inset-x-2.5 h-[2px] bg-[#000000] pointer-events-none opacity-40" />

              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 bg-[#24698F] border-2 border-[#000000] shadow-[2px_2px_0px_#000000] flex items-center justify-center transition-transform duration-75 ${
                  isJoystickActive ? 'bg-[#38BDF8] scale-105' : ''
                }`}
                style={{
                  transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
                }}
              >
                <div className="w-2.5 h-2.5 bg-[#FFFFFF] border border-[#000000]" />
              </div>
            </div>
            <span className="text-[6px] font-pixel text-[#FFFFFF]/60 tracking-wider">
              3-LANE STEER
            </span>
          </div>
        )}

        {/* On PC: Sleek minimal keyboard guide badge */}
        {!isTouch && (
          <div className="hidden sm:flex items-center gap-2 bg-[#181A24]/85 border-2 border-[#000000] px-2.5 py-1 text-[#F6C445] shadow-[2px_2px_0px_#000000] font-pixel text-[8px] pointer-events-none">
            <div className="flex items-center gap-1">
              <span className="bg-black/60 px-1 py-0.5 border border-[#38BDF8] text-white">A/D</span>
              <span className="text-[#94A3B8]">or</span>
              <span className="bg-black/60 px-1 py-0.5 border border-[#38BDF8] text-white">◀/▶</span>
              <span className="text-[#94A3B8] ml-0.5">STEER</span>
            </div>
            <div className="w-[1px] h-3 bg-white/20" />
            <div className="flex items-center gap-1">
              <span className="bg-black/60 px-1 py-0.5 border border-[#10B981] text-white">W / ↑</span>
              <span className="text-[#10B981]">JUMP</span>
            </div>
            <div className="w-[1px] h-3 bg-white/20" />
            <div className="flex items-center gap-1">
              <span className="bg-black/60 px-1 py-0.5 border border-[#EF4444] text-white">SPACE</span>
              <span className="text-[#EF4444]">SLAP</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Tactile Arcade Action Buttons (Jump & Slap) */}
      <div className="flex items-end gap-2 pointer-events-auto">
        {/* Jump Button (available on touch or when visible) */}
        {isTouch && (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsJumpPressed(true);
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try { navigator.vibrate(15); } catch {}
                }
                if (onJump) onJump();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsJumpPressed(false);
              }}
              onPointerCancel={() => setIsJumpPressed(false)}
              aria-label="Jump action button"
              className={`w-14 h-14 sm:w-16 sm:h-16 bg-[#059669] hover:bg-[#10B981] text-white border-3 border-[#000000] shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] flex flex-col items-center justify-center cursor-pointer touch-none select-none ${
                isJumpPressed ? 'translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0px_#000000] bg-[#10B981]' : ''
              }`}
            >
              <span className="text-sm font-pixel font-bold">▲</span>
              <span className="font-pixel text-[7px] sm:text-[8px] tracking-wider text-white">
                JUMP
              </span>
            </button>
            <span className="text-[6px] font-pixel text-[#10B981]/90 tracking-wider">
              VAULT
            </span>
          </div>
        )}

        {/* Slap Action Button */}
        <div className="flex flex-col items-center gap-1">
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
            className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-white border-3 sm:border-4 border-[#000000] shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] flex flex-col items-center justify-center cursor-pointer touch-none select-none ${
              isIntroActive
                ? 'bg-[#E11D48] animate-pulse shadow-[0_0_20px_#E11D48]'
                : 'bg-[#FF4757] hover:bg-[#E25B45]'
            } ${
              isSlapPressed ? 'translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0px_#000000] bg-[#E25B45]' : ''
            }`}
          >
            <Hand className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[2.5] -rotate-12 mb-0.5" />
            <span className="font-pixel text-[9px] sm:text-xs md:text-sm tracking-wider text-white">
              {isIntroActive ? '⚡ SLAP!' : 'SLAP!'}
            </span>
          </button>
          <span className="text-[6px] sm:text-[7px] font-pixel text-[#FF4757]/80 tracking-wider">
            {isIntroActive ? 'HIT BOSS' : 'RECHARGE'}
          </span>
        </div>
      </div>
    </div>
  );
};
