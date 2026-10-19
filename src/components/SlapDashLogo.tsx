import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

/**
 * Hand-crafted 8-bit Pixel Art Slap Glove Emblem
 * Rendered using crisp pixel rectangles (16x16 grid scaled to viewBox 64x64)
 */
export const SlapDashPixelMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 64 64"
    className={`pixel-canvas ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="8-bit Pixel SlapDash Glove Emblem"
    shapeRendering="crispEdges"
  >
    {/* Pixel Badge Background Frame (Octagonal Retro Shield) */}
    {/* Dark Drop Shadow Pixels */}
    <rect x="12" y="12" width="44" height="44" fill="#000000" />
    <rect x="8" y="16" width="52" height="36" fill="#000000" />
    <rect x="16" y="8" width="36" height="52" fill="#000000" />

    {/* Outer Pixel Gold Border */}
    <rect x="10" y="10" width="44" height="44" fill="#F6C445" />
    <rect x="6" y="14" width="52" height="36" fill="#F6C445" />
    <rect x="14" y="6" width="36" height="52" fill="#F6C445" />

    {/* Inner Black Inset */}
    <rect x="12" y="12" width="40" height="40" fill="#181A24" />
    <rect x="8" y="16" width="48" height="32" fill="#181A24" />
    <rect x="16" y="8" width="32" height="48" fill="#181A24" />

    {/* Retro Cyan/Cobalt Sky Background Core */}
    <rect x="14" y="14" width="36" height="36" fill="#24698F" />
    <rect x="10" y="18" width="44" height="28" fill="#24698F" />
    <rect x="18" y="10" width="28" height="44" fill="#24698F" />

    {/* Pixel Lightning Bolt in Background */}
    <rect x="36" y="12" width="8" height="8" fill="#FDE047" />
    <rect x="32" y="20" width="8" height="8" fill="#FDE047" />
    <rect x="28" y="26" width="16" height="6" fill="#FDE047" />
    <rect x="30" y="32" width="8" height="8" fill="#FDE047" />
    <rect x="26" y="40" width="8" height="8" fill="#FDE047" />
    <rect x="24" y="48" width="6" height="6" fill="#FDE047" />

    {/* 8-bit Pixel Red Slap Glove (Chunky retro arcade fist & slap open hand) */}
    {/* Glove Black Outline */}
    <rect x="18" y="20" width="6" height="18" fill="#000000" />
    <rect x="24" y="16" width="6" height="8" fill="#000000" />
    <rect x="30" y="14" width="6" height="8" fill="#000000" />
    <rect x="36" y="16" width="6" height="8" fill="#000000" />
    <rect x="42" y="20" width="6" height="16" fill="#000000" />
    <rect x="22" y="36" width="24" height="14" fill="#000000" />

    {/* Glove Red Fill */}
    <rect x="20" y="22" width="4" height="14" fill="#FF4757" />
    <rect x="26" y="18" width="4" height="18" fill="#FF4757" />
    <rect x="32" y="16" width="4" height="20" fill="#FF4757" />
    <rect x="38" y="18" width="4" height="18" fill="#FF4757" />
    <rect x="24" y="28" width="16" height="16" fill="#FF4757" />

    {/* Glove Highlights (Pink / Light Coral) */}
    <rect x="26" y="18" width="2" height="6" fill="#FFA4B0" />
    <rect x="32" y="16" width="2" height="8" fill="#FFA4B0" />
    <rect x="38" y="18" width="2" height="6" fill="#FFA4B0" />
    <rect x="26" y="28" width="4" height="6" fill="#FFA4B0" />

    {/* Glove Thumb */}
    <rect x="14" y="30" width="8" height="6" fill="#000000" />
    <rect x="16" y="32" width="6" height="4" fill="#FF4757" />
    <rect x="16" y="32" width="4" height="2" fill="#FFA4B0" />

    {/* White Wrist Band with Gold Buckle */}
    <rect x="22" y="44" width="20" height="8" fill="#000000" />
    <rect x="24" y="46" width="16" height="6" fill="#FFFFFF" />
    <rect x="30" y="46" width="4" height="6" fill="#F6C445" />

    {/* Pixel Slap Impact Sparks */}
    <rect x="46" y="10" width="4" height="4" fill="#FFFFFF" />
    <rect x="44" y="14" width="4" height="4" fill="#FDE047" />
    <rect x="50" y="14" width="4" height="4" fill="#FDE047" />
    <rect x="48" y="18" width="4" height="4" fill="#FFFFFF" />

    <rect x="8" y="24" width="4" height="4" fill="#FFFFFF" />
    <rect x="10" y="28" width="4" height="4" fill="#FDE047" />
  </svg>
);

export const SlapDashMark = SlapDashPixelMark;

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
    sm: 'text-lg md:text-xl',
    md: 'text-2xl md:text-4xl lg:text-5xl',
    lg: 'text-3xl md:text-5xl lg:text-6xl',
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 8-bit Pixel Emblem */}
      <div className={`${iconSizes[size]} drop-shadow-[0_4px_0_#000000] mb-2 transition-transform hover:scale-105`}>
        <SlapDashPixelMark className="w-full h-full" />
      </div>

      {showTitle && (
        <div className="flex flex-col items-center text-center">
          {/* Authentic Retro Arcade Pixel Title */}
          <div className="relative inline-block">
            {/* Black Stepped Pixel Drop Shadow */}
            <span
              className={`font-pixel text-[#000000] select-none block leading-none ${titleSizes[size]} translate-x-[4px] translate-y-[4px]`}
              style={{
                textShadow: '4px 4px 0px #000000, 2px 2px 0px #000000',
              }}
              aria-hidden="true"
            >
              SLAPDASH
            </span>

            {/* Front Pixel Fill */}
            <h1
              className={`font-pixel absolute inset-0 select-none leading-none ${titleSizes[size]} tracking-tight text-[#F6C445]`}
              style={{
                textShadow: '2px 2px 0px #78350F, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000',
              }}
            >
              SLAP<span className="text-[#FF4757]">DASH</span>
            </h1>
          </div>

          {/* 8-bit Pixel Sub-Ribbon Badge */}
          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-[#000000] border-2 border-[#F6C445] shadow-[3px_3px_0px_#000000]">
            <span className="w-2 h-2 bg-[#10B981] animate-ping" />
            <span className="font-pixel text-[8px] md:text-[10px] text-[#FDFBF7] uppercase tracking-wider">
              ★ 8-BIT ARCADE RUNNER ★
            </span>
            <span className="w-2 h-2 bg-[#FF4757]" />
          </div>
        </div>
      )}
    </div>
  );
};
