import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export const SlapDashMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="SlapDash 3D Championship Emblem"
  >
    <defs>
      {/* 3D Gold Rim Gradient */}
      <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF3B0" />
        <stop offset="35%" stopColor="#F6C445" />
        <stop offset="70%" stopColor="#D98A16" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>

      {/* 3D Deep Cobalt Core Gradient */}
      <radialGradient id="badgeCoreGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="45%" stopColor="#24698F" />
        <stop offset="90%" stopColor="#10364C" />
        <stop offset="100%" stopColor="#081E2C" />
      </radialGradient>

      {/* 3D Glove Volumetric Gradient */}
      <linearGradient id="gloveGrad" x1="20%" y1="15%" x2="90%" y2="85%">
        <stop offset="0%" stopColor="#FF7685" />
        <stop offset="40%" stopColor="#FF3B56" />
        <stop offset="85%" stopColor="#C91834" />
        <stop offset="100%" stopColor="#7F0D1E" />
      </linearGradient>

      {/* 3D Glove Palm Shading */}
      <radialGradient id="palmShade" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FF8595" />
        <stop offset="60%" stopColor="#FF3B56" />
        <stop offset="100%" stopColor="#991124" />
      </radialGradient>

      {/* Speed Lightning Gold */}
      <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="40%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>

      {/* Heavy Drop Shadow */}
      <filter id="badgeShadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="0" dy="5" stdDeviation="2" floodColor="#17181C" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* 1. Heavy Base Extrusion / 3D Bevel Shadow */}
    <circle cx="60" cy="65" r="50" fill="#17181C" />

    {/* 2. Outer Beveled Metallic Gold Ring */}
    <circle cx="60" cy="60" r="50" fill="url(#goldRimGrad)" stroke="#17181C" strokeWidth="3.5" />
    <circle cx="60" cy="60" r="45" fill="#17181C" />
    <circle cx="60" cy="59" r="43" fill="url(#badgeCoreGrad)" />

    {/* Dynamic Radial Speed Ray Chevrons */}
    <path
      d="M60 59 L45 18 L55 59 L75 22 L62 59 L98 42 L65 62 L102 68 L64 66 L95 90 L61 68 L70 101 L58 68 L42 98 L56 66 L18 78 L55 62 L18 52 L57 59 L25 32 Z"
      fill="#FFFFFF"
      opacity="0.12"
    />

    {/* 3. Electric Dash Lightning Bolt */}
    <path
      d="M32 78 L68 22 L55 52 L92 36 L54 96 L64 64 Z"
      fill="url(#speedGrad)"
      stroke="#17181C"
      strokeWidth="3"
      strokeLinejoin="round"
      filter="url(#badgeShadow)"
    />
    <path
      d="M36 74 L66 26 L55 51 L84 39 L56 90 L63 65 Z"
      fill="#FFFFFF"
      opacity="0.5"
    />

    {/* 4. Sculpted 3D Cartoon Slap Glove */}
    <g transform="translate(24, 20)">
      {/* 3D Motion Swoosh Trails behind hand */}
      <path
        d="M-4 36 C4 20 18 12 36 10"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M-2 48 C8 32 24 22 46 18"
        stroke="#F6C445"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Main Glove Body & Palm */}
      <path
        d="M26 58 C18 52 14 38 18 28 C20 22 26 21 30 26 C33 21 39 19 43 24 C46 19 53 19 56 25 C59 21 66 22 68 28 C72 38 68 56 56 66 C46 74 32 70 26 58 Z"
        fill="url(#gloveGrad)"
        stroke="#17181C"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Palm Specular Bubble (3D Volume Highlight) */}
      <ellipse cx="44" cy="42" rx="14" ry="12" fill="url(#palmShade)" />
      <path
        d="M32 30 C34 26 40 25 46 27 C42 32 36 34 32 30 Z"
        fill="#FFFFFF"
        opacity="0.6"
      />

      {/* Curved 3D Thumb */}
      <path
        d="M22 46 C12 48 8 58 14 65 C19 70 25 66 27 60 Z"
        fill="url(#gloveGrad)"
        stroke="#17181C"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <ellipse cx="18" cy="56" rx="4" ry="6" fill="#FFFFFF" opacity="0.35" />

      {/* Padded Glove Wrist Cuff in Pure Athletic White with 3D Roll */}
      <path
        d="M28 66 C28 62 52 64 56 68 C58 74 32 78 28 66 Z"
        fill="#FFFFFF"
        stroke="#17181C"
        strokeWidth="3"
      />
      {/* Gold Buckle on Cuff */}
      <rect x="38" y="67" width="8" height="5" rx="1.5" fill="#F6C445" stroke="#17181C" strokeWidth="1.5" />
    </g>

    {/* 5. 3D Slap Impact Burst Stars */}
    <g transform="translate(86, 26)">
      <polygon
        points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3"
        fill="#FFFFFF"
        stroke="#17181C"
        strokeWidth="2"
      />
      <circle cx="0" cy="0" r="3" fill="#FDE047" />
    </g>
    <g transform="translate(20, 36) scale(0.65)">
      <polygon
        points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3"
        fill="#FDE047"
        stroke="#17181C"
        strokeWidth="2"
      />
    </g>
  </svg>
);

export const SlapDashLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTitle = true,
}) => {
  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20 md:w-24 md:h-24',
    lg: 'w-28 h-28 md:w-32 md:h-32',
  };

  const titleSizes = {
    sm: 'text-2xl md:text-3xl',
    md: 'text-4xl md:text-5xl lg:text-6xl',
    lg: 'text-5xl md:text-6xl lg:text-7xl',
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Shield Emblem */}
      <div className={`${iconSizes[size]} drop-shadow-[0_6px_0_#17181C] mb-2 md:mb-3 transition-transform hover:scale-105`}>
        <SlapDashMark className="w-full h-full" />
      </div>

      {showTitle && (
        <div className="flex flex-col items-center text-center">
          {/* Volumetric 3D Extruded Title Header */}
          <div className="relative inline-block">
            {/* Dark 3D Extrusion Shadow Layer */}
            <span
              className={`font-game text-[#17181C] select-none block leading-none ${titleSizes[size]} translate-y-[4px] tracking-wider`}
              style={{
                textShadow: '0 4px 0 #101114, 0 6px 0 #08090A, 0 8px 12px rgba(0,0,0,0.4)',
              }}
              aria-hidden="true"
            >
              SLAPDASH
            </span>

            {/* Front Gradient 3D Fill Layer */}
            <h1
              className={`font-game absolute inset-0 select-none leading-none ${titleSizes[size]} tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF0] via-[#FFD15C] to-[#E58F10]`}
              style={{
                WebkitTextStroke: '2px #17181C',
                filter: 'drop-shadow(0 2px 0 rgba(255,255,255,0.4))',
              }}
            >
              SLAP<span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FFE3E7] via-[#FF4757] to-[#B91C1C]">DASH</span>
            </h1>
          </div>

          {/* Arcade Sub-Ribbon Badge */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDFBF7] border-2 border-[#17181C] shadow-[0_3px_0_#17181C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
            <span className="font-ui font-black text-[9px] md:text-[11px] text-[#17181C] uppercase tracking-widest">
              3D ARCADE GAUNTLET · OUTRUN THE MOB
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4757]" />
          </div>
        </div>
      )}
    </div>
  );
};
