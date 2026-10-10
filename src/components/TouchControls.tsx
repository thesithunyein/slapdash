import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Hand, MousePointer } from 'lucide-react';
import { InputState } from '../game/types.ts';

interface TouchControlsProps {
  input: InputState;
  onSlap: () => void;
  isPaused: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  input,
  onSlap,
  isPaused,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSlapPressed, setIsSlapPressed] = useState<boolean>(false);
  const activeTouchIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update base center coordinates on mount / resize
  const updateBaseCenter = useCallback(() => {
    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      baseCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, []);

  useEffect(() => {
    updateBaseCenter();
    window.addEventListener('resize', updateBaseCenter);
    return () => window.removeEventListener('resize', updateBaseCenter);
  }, [updateBaseCenter]);

  // Touch handlers for joystick
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPaused) return;
    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;
    updateBaseCenter();
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPaused || activeTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        const dx = touch.clientX - baseCenterRef.current.x;
        const dy = touch.clientY - baseCenterRef.current.y;
        const maxRadius = 45;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > maxRadius) {
          clampedX = (dx / dist) * maxRadius;
          clampedY = (dy / dist) * maxRadius;
        }

        setStickPos({ x: clampedX, y: clampedY });
        input.joystick.active = true;
        input.joystick.x = clampedX / maxRadius; // -1 to 1
        input.joystick.y = clampedY / maxRadius;
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
        activeTouchIdRef.current = null;
        setStickPos({ x: 0, y: 0 });
        input.joystick.active = false;
        input.joystick.x = 0;
        input.joystick.y = 0;
        break;
      }
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 pointer-events-none z-20 select-none flex items-end justify-between">
      {/* Left: Virtual Thumb Joystick in Crisp Frosted White */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/95 border-2 border-slate-200/90 backdrop-blur-xl pointer-events-auto flex items-center justify-center relative touch-none shadow-[0_12px_36px_rgba(0,0,0,0.12)] active:border-emerald-500 transition-colors"
      >
        {/* Subtle Crosshair Guide Ring */}
        <div className="absolute inset-4 rounded-full border border-slate-200 pointer-events-none" />

        {/* Joystick Stick Knob in Emerald Green */}
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-[0_6px_20px_rgba(16,185,129,0.4)] border-2 border-white pointer-events-none transition-transform duration-75 flex items-center justify-center"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-white/70 shadow-inner" />
        </div>
      </div>

      {/* Desktop PC Keyboard & Mouse Control Guide (Clean White Card) */}
      <div className="hidden md:flex flex-col items-center gap-1.5 bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-1.5 text-slate-700 text-[11px]">
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-300 font-mono text-slate-800 shadow-sm">A</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-300 font-mono text-slate-800 shadow-sm">D</kbd>
          <span className="text-slate-400 font-normal">or</span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-300 font-mono text-slate-800 shadow-sm">◄</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-300 font-mono text-slate-800 shadow-sm">►</kbd>
          <span className="text-slate-500 font-medium ml-0.5">Steer</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-bold">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-300 font-mono text-emerald-800 shadow-sm">SPACE</kbd>
            <span className="text-slate-400 font-normal">or</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700">
              <MousePointer className="w-3 h-3" />
              <span>CLICK</span>
            </span>
          </div>
          <span>to SLAP!</span>
        </div>
      </div>

      {/* Right: Big Action Tactile SLAP Button in Emerald Green */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          setIsSlapPressed(true);
          onSlap();
        }}
        onTouchEnd={() => setIsSlapPressed(false)}
        onTouchCancel={() => setIsSlapPressed(false)}
        onMouseDown={() => {
          setIsSlapPressed(true);
          onSlap();
        }}
        onMouseUp={() => setIsSlapPressed(false)}
        onMouseLeave={() => setIsSlapPressed(false)}
        aria-label="Slap"
        className={`w-24 h-24 md:w-28 md:h-28 rounded-full pointer-events-auto transition-transform flex flex-col items-center justify-center gap-1 shadow-[0_12px_36px_rgba(16,185,129,0.45)] border-4 border-white active:scale-90 ${
          isSlapPressed
            ? 'bg-gradient-to-br from-emerald-600 to-teal-700 scale-95 shadow-[0_4px_16px_rgba(16,185,129,0.6)]'
            : 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-[0_12px_36px_rgba(16,185,129,0.45)] hover:scale-105'
        }`}
      >
        <Hand className="w-8 h-8 md:w-10 md:h-10 text-white fill-white drop-shadow" />
        <span className="text-white font-black text-xs md:text-sm tracking-wider uppercase drop-shadow">
          SLAP!
        </span>
      </button>
    </div>
  );
};
