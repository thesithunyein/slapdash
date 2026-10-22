import React from 'react';
import {
  Zap,
  Flame,
  Trophy,
  Award,
  Crown,
  Footprints,
  Coins,
  Wind,
  Target,
  Palette,
  Rocket,
  Shield,
  Heart,
  Activity,
  Compass,
} from 'lucide-react';

/**
 * Clean 2D / 3D Vector Dinosaur Silhouette for HUD, Skins, and Menu
 */
export const DinoVectorIcon: React.FC<{
  className?: string;
  bodyColor?: string;
  bellyColor?: string;
  size?: number;
}> = ({ className = 'w-6 h-6', bodyColor = '#EF4444', bellyColor = '#F97316', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Dino Tail & Body */}
    <path
      d="M6 34 C12 36, 16 32, 20 28 C22 26, 25 25, 28 25 L34 25 C37 25, 39 23, 40 19 L40 15 C40 12, 38 10, 35 10 L28 10 C26 10, 24 11, 23 13 L20 18 C18 20, 16 22, 14 24 L8 28 Z"
      fill={bodyColor}
    />
    {/* Head & Jaws */}
    <path
      d="M26 10 L38 10 C42 10, 44 12, 44 16 L44 18 C44 20, 42 22, 39 22 L35 22 L35 25 L29 25 Z"
      fill={bodyColor}
    />
    {/* Belly Patch */}
    <path
      d="M22 25 C25 25, 28 24, 30 22 C32 20, 32 17, 30 15 L26 18 C24 20, 23 22, 22 25 Z"
      fill={bellyColor}
      opacity="0.9"
    />
    {/* Eye */}
    <circle cx="34" cy="14" r="2" fill="#FFFFFF" />
    <circle cx="35" cy="14" r="1" fill="#111827" />
    {/* Teeth */}
    <polygon points="36,22 38,20 40,22" fill="#FFFFFF" />
    {/* Legs */}
    <rect x="23" y="27" width="4" height="11" rx="2" fill={bodyColor} />
    <rect x="29" y="27" width="4" height="11" rx="2" fill={bodyColor} />
    {/* Feet */}
    <path d="M21 38 L29 38 L27 36 L23 36 Z" fill={bodyColor} />
    <path d="M27 38 L35 38 L33 36 L29 36 Z" fill={bodyColor} />
    {/* Back Spines */}
    <polygon points="18,22 20,18 22,23" fill={bellyColor} />
    <polygon points="13,26 15,22 17,27" fill={bellyColor} />
    <polygon points="8,30 10,26 12,31" fill={bellyColor} />
  </svg>
);

/**
 * 2D/3D Prehistoric Hatchery Dinosaur Egg
 */
export const DinoEggIcon: React.FC<{
  className?: string;
  day?: number;
  isGolden?: boolean;
}> = ({ className = 'w-7 h-7', day = 1, isGolden = false }) => {
  const eggFill = isGolden || day === 7 ? 'url(#goldEggGrad)' : 'url(#dinoEggGrad)';
  const shellBorder = isGolden || day === 7 ? '#FEF08A' : '#FED7AA';

  return (
    <svg viewBox="0 0 40 48" fill="none" className={className}>
      <defs>
        <linearGradient id="dinoEggGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="60%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="goldEggGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      {/* Egg Body */}
      <path
        d="M20 3 C10 3, 4 15, 4 28 C4 38, 11 45, 20 45 C29 45, 36 38, 36 28 C36 15, 30 3, 20 3 Z"
        fill={eggFill}
        stroke={shellBorder}
        strokeWidth="2.5"
      />
      {/* Speckles */}
      <circle cx="15" cy="22" r="2.5" fill="#D97706" opacity="0.4" />
      <circle cx="25" cy="18" r="2" fill="#D97706" opacity="0.4" />
      <circle cx="21" cy="32" r="3" fill="#D97706" opacity="0.4" />
      <circle cx="13" cy="35" r="1.8" fill="#D97706" opacity="0.3" />
      {/* Crack lines for high days */}
      {day >= 5 && (
        <path
          d="M14 18 L19 23 L16 27 L22 30"
          stroke={isGolden ? '#FFF' : '#78350F'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      )}
      {/* Shiny highlight */}
      <ellipse cx="14" cy="12" rx="4" ry="7" fill="#FFFFFF" opacity="0.5" transform="rotate(-25 14 12)" />
    </svg>
  );
};

/**
 * Prehistoric Dino Meat / Drumstick Vector Icon for Stamina
 */
export const DinoMeatIcon: React.FC<{ className?: string; isExhausted?: boolean }> = ({
  className = 'w-5 h-5',
  isExhausted = false,
}) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    {/* Bone */}
    <rect x="5" y="19" width="10" height="4" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" transform="rotate(45 5 19)" />
    <circle cx="7" cy="24" r="2.5" fill="#E2E8F0" />
    <circle cx="11" cy="26" r="2.5" fill="#E2E8F0" />
    {/* Meat Chunk */}
    <path
      d="M12 10 C15 6, 24 6, 27 10 C30 14, 28 22, 23 24 C18 26, 12 21, 12 16 Z"
      fill={isExhausted ? '#64748B' : '#EF4444'}
      stroke={isExhausted ? '#94A3B8' : '#FCA5A5'}
      strokeWidth="1.5"
    />
    <circle cx="20" cy="13" r="3" fill="#FFFFFF" opacity="0.3" />
  </svg>
);

/**
 * Tropical Palm Tree Vector Graphic
 */
export const PalmVectorIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className}>
    {/* Trunk */}
    <path d="M16 34 C17 26, 19 20, 20 14" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
    {/* Fronds */}
    <path d="M20 14 C14 12, 8 16, 6 22" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 14 C17 8, 12 6, 6 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 14 C22 7, 28 6, 32 10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 14 C24 13, 30 17, 33 24" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 14 C20 6, 21 3, 20 2" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
    {/* Coconuts */}
    <circle cx="18" cy="14" r="1.8" fill="#78350F" />
    <circle cx="21" cy="14" r="1.8" fill="#78350F" />
  </svg>
);

/**
 * 2D/3D Tournament Rank Badges
 */
export const RankMedalBadge: React.FC<{ rank: number; className?: string }> = ({ rank, className = 'w-7 h-7' }) => {
  if (rank === 1) {
    return (
      <div className={`rounded-xl bg-gradient-to-b from-[#FEF08A] to-[#F59E0B] border-2 border-white text-[#78350F] flex items-center justify-center font-['Lilita_One'] text-sm shadow-md ${className}`}>
        1ST
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className={`rounded-xl bg-gradient-to-b from-[#F1F5F9] to-[#94A3B8] border-2 border-white text-[#1E293B] flex items-center justify-center font-['Lilita_One'] text-sm shadow-md ${className}`}>
        2ND
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className={`rounded-xl bg-gradient-to-b from-[#FED7AA] to-[#C2410C] border-2 border-white text-[#431407] flex items-center justify-center font-['Lilita_One'] text-sm shadow-md ${className}`}>
        3RD
      </div>
    );
  }
  return (
    <div className={`rounded-xl bg-[#2A1E14] border border-white/20 text-[#FED7AA] flex items-center justify-center font-['Lilita_One'] text-xs ${className}`}>
      #{rank}
    </div>
  );
};

/**
 * Unified 2D/3D Achievement Vector Icon Lookup
 */
export const AchievementVectorIcon: React.FC<{
  iconKey: string;
  className?: string;
}> = ({ iconKey, className = 'w-6 h-6' }) => {
  switch (iconKey) {
    case 'dino':
      return <DinoVectorIcon className={className} bodyColor="#EF4444" bellyColor="#F97316" />;
    case 'wind':
      return <Wind className={`${className} text-[#38BDF8]`} />;
    case 'flame':
      return <Flame className={`${className} text-[#F97316] fill-[#F97316]`} />;
    case 'zap':
      return <Zap className={`${className} text-[#FBBF24] fill-[#FBBF24]`} />;
    case 'beach':
      return <PalmVectorIcon className={className} />;
    case 'runner':
      return <Footprints className={`${className} text-[#34D399]`} />;
    case 'medal':
    case 'trophy':
      return <Trophy className={`${className} text-[#FBBF24] fill-[#FBBF24]`} />;
    case 'coin':
    case 'chest':
      return <Coins className={`${className} text-[#FACC15] fill-[#FACC15]`} />;
    case 'blast':
      return <Flame className={`${className} text-[#F97316] fill-[#F97316]`} />;
    case 'party':
      return <Award className={`${className} text-[#A855F7]`} />;
    case 'crown':
      return <Crown className={`${className} text-[#F59E0B] fill-[#F59E0B]`} />;
    case 'dash':
      return <Zap className={`${className} text-[#06B6D4]`} />;
    case 'rocket':
      return <Rocket className={`${className} text-[#EF4444]`} />;
    case 'palm':
      return <PalmVectorIcon className={className} />;
    case 'volcano':
      return <Flame className={`${className} text-[#EA580C] fill-[#EA580C]`} />;
    case 'star':
      return <Award className={`${className} text-[#FBBF24]`} />;
    case 'palette':
      return <Palette className={`${className} text-[#EC4899]`} />;
    case 'target':
      return <Target className={`${className} text-[#EF4444]`} />;
    default:
      return <Trophy className={`${className} text-[#FBBF24]`} />;
  }
};
