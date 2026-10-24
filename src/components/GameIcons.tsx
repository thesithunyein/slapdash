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
 * Advanced 3D Trophy & Dinosaur Emblem Icon matching the Swiposaur Logo
 * Pure SVG code - zero raster, zero AI generation, perfectly styled to match the game logo.
 */
export const LeaderboardAdvancedIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-8 h-8',
  size,
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    style={size ? { width: size, height: size } : undefined}
    role="img"
    aria-label="Leaderboard Trophy Emblem"
  >
    <defs>
      <linearGradient id="trophyGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="20%" stopColor="#FEF08A" />
        <stop offset="55%" stopColor="#FACC15" />
        <stop offset="85%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="trophyCrestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="50%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
      <linearGradient id="trophyLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="50%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#15803D" />
      </linearGradient>
      <linearGradient id="trophyShadesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3730A3" />
        <stop offset="50%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <filter id="trophyGlow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>

    {/* Tropical Laurel Leaves behind Cup */}
    <g filter="url(#trophyGlow)">
      {/* Left Laurel Frond */}
      <path
        d="M13 36 C7 30 7 20 12 14 C16 16 18 22 20 28 C23 23 28 24 30 27 C24 31 18 36 13 36 Z"
        fill="url(#trophyLeafGrad)"
        stroke="#064E3B"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right Laurel Frond */}
      <path
        d="M51 36 C57 30 57 20 52 14 C48 16 46 22 44 28 C41 23 36 24 34 27 C40 31 46 36 51 36 Z"
        fill="url(#trophyLeafGrad)"
        stroke="#064E3B"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </g>

    {/* Dinosaur Dorsal Spikes / Crown on Top */}
    <g filter="url(#trophyGlow)">
      {/* Center Tall Spike */}
      <polygon points="32,2 38,15 26,15" fill="url(#trophyCrestGrad)" stroke="#450A0A" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Left Spike */}
      <polygon points="23,6 29,17 19,17" fill="url(#trophyCrestGrad)" stroke="#450A0A" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Right Spike */}
      <polygon points="41,6 45,17 35,17" fill="url(#trophyCrestGrad)" stroke="#450A0A" strokeWidth="1.2" strokeLinejoin="round" />
    </g>

    {/* Trophy Cup Outer Handles */}
    <path
      d="M19 22 C10 22 10 38 21 38 M45 22 C54 22 54 38 43 38"
      stroke="#B45309"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M19 22 C11 22 11 38 21 38 M45 22 C53 22 53 38 43 38"
      stroke="url(#trophyGoldGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Main Trophy Chalice Body */}
    <g filter="url(#trophyGlow)">
      <path
        d="M20 16 L44 16 C44 31 38 38 32 40 C26 38 20 31 20 16 Z"
        fill="url(#trophyGoldGrad)"
        stroke="#451A03"
        strokeWidth="2"
      />
      {/* Cup Rim Highlight */}
      <ellipse cx="32" cy="16" rx="12" ry="2.2" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />
    </g>

    {/* Dino Party Sunglasses on Front of Cup */}
    <g>
      {/* Left Lens */}
      <rect x="23" y="22" width="7.5" height="5.5" rx="1.8" fill="url(#trophyShadesGrad)" stroke="#451A03" strokeWidth="1" />
      {/* Right Lens */}
      <rect x="33.5" y="22" width="7.5" height="5.5" rx="1.8" fill="url(#trophyShadesGrad)" stroke="#451A03" strokeWidth="1" />
      {/* Bridge */}
      <rect x="30.5" y="23.5" width="3" height="1.5" rx="0.5" fill="#FEF08A" />
      {/* Glare Reflection */}
      <path d="M24 23 L27 23 L25 26 L24 26 Z" fill="#FFFFFF" opacity="0.7" />
      <path d="M34.5 23 L37.5 23 L35.5 26 L34.5 26 Z" fill="#FFFFFF" opacity="0.7" />
    </g>

    {/* Dino Smile / Fang */}
    <path d="M28 31 C30 33 34 33 36 31" stroke="#451A03" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <polygon points="31,31 33,31 32,33" fill="#FFFFFF" />

    {/* Trophy Stem & Pedestal Base */}
    <path d="M29 40 L35 40 L34 47 L30 47 Z" fill="#B45309" stroke="#451A03" strokeWidth="1.2" />
    <path d="M29.5 40.5 L34.5 40.5 L33.5 46.5 L30.5 46.5 Z" fill="url(#trophyGoldGrad)" />

    {/* Tiered Solid Gold Plinth Base */}
    <rect x="22" y="47" width="20" height="5" rx="2" fill="url(#trophyGoldGrad)" stroke="#451A03" strokeWidth="1.5" />
    <rect x="18" y="52" width="28" height="7" rx="2.5" fill="#451A03" />
    <rect x="19" y="53" width="26" height="5" rx="2" fill="url(#trophyGoldGrad)" stroke="#78350F" strokeWidth="0.8" />

    {/* Center Champion Star on Base */}
    <polygon
      points="32,54 33,56.5 35.5,56.5 33.5,58 34.2,60.5 32,59 29.8,60.5 30.5,58 28.5,56.5 31,56.5"
      fill="#FFFDF0"
      stroke="#78350F"
      strokeWidth="0.5"
    />
  </svg>
);

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

/**
 * 3D Prehistoric Quest Target / Shield Icon for Daily Missions
 * Replaces generic 2D AI star/gift icons with authentic 3D hand-crafted vector art.
 */
export const Missions3DIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-6 h-6',
  size,
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    style={size ? { width: size, height: size } : undefined}
    role="img"
    aria-label="3D Missions Emblem"
  >
    <defs>
      <linearGradient id="mShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="50%" stopColor="#EA580C" />
        <stop offset="100%" stopColor="#9A3412" />
      </linearGradient>
      <linearGradient id="mGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="20%" stopColor="#FEF08A" />
        <stop offset="55%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="mScrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="60%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
      <filter id="mDropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="32" cy="58" rx="22" ry="4" fill="#000000" opacity="0.35" />
    {/* Crossed Prehistoric Bone Spears / Raptor Claws */}
    <g filter="url(#mDropShadow)">
      <path d="M12 12 L52 52 M16 8 L56 48" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 12 L52 52" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 12 L12 52 M48 8 L8 48" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
      <path d="M52 12 L12 52" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
      {/* Spear Tips */}
      <polygon points="12,12 7,6 15,8" fill="#FACC15" stroke="#78350F" strokeWidth="1.2" />
      <polygon points="52,12 57,6 49,8" fill="#FACC15" stroke="#78350F" strokeWidth="1.2" />
    </g>
    {/* 3D Quest Target / Shield */}
    <g filter="url(#mDropShadow)">
      <circle cx="32" cy="32" r="21" fill="url(#mShieldGrad)" stroke="#451A03" strokeWidth="3" />
      <circle cx="32" cy="32" r="16" fill="url(#mScrollGrad)" stroke="#78350F" strokeWidth="2" />
      <circle cx="32" cy="32" r="11" fill="url(#mShieldGrad)" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="5" fill="url(#mGoldGrad)" stroke="#451A03" strokeWidth="1.2" />
      {/* Specular White Glint */}
      <path d="M22 18 C28 14 36 14 42 18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      {/* Mini Star Medallion */}
      <polygon points="32,28 33.5,31 36.5,31.5 34.2,33.5 35,36.5 32,34.8 29,36.5 29.8,33.5 27.5,31.5 30.5,31" fill="#FFFFFF" opacity="0.9" />
    </g>
  </svg>
);

/**
 * 3D Prehistoric Dino Crest Emblem for Dino Paddock
 * Replaces generic AI 4-point sparkle icon with authentic 3D Dinosaur Crest & Sunglasses.
 */
export const Paddock3DIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-6 h-6',
  size,
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    style={size ? { width: size, height: size } : undefined}
    role="img"
    aria-label="3D Dino Paddock Emblem"
  >
    <defs>
      <linearGradient id="padCrestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF5722" />
        <stop offset="50%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
      <linearGradient id="padSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="50%" stopColor="#EA580C" />
        <stop offset="100%" stopColor="#9A3412" />
      </linearGradient>
      <linearGradient id="padGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="60%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <filter id="padDropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>
    {/* Ground Shadow */}
    <ellipse cx="32" cy="58" rx="20" ry="4" fill="#000000" opacity="0.35" />
    {/* 3D Prehistoric Crest Spikes on Top */}
    <g filter="url(#padDropShadow)">
      <polygon points="32,4 39,18 25,18" fill="url(#padCrestGrad)" stroke="#450A0A" strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points="19,10 27,22 13,22" fill="url(#padCrestGrad)" stroke="#450A0A" strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points="45,10 51,22 37,22" fill="url(#padCrestGrad)" stroke="#450A0A" strokeWidth="1.6" strokeLinejoin="round" />
    </g>
    {/* 3D Dinosaur Head / Snout Silhouette */}
    <g filter="url(#padDropShadow)">
      <path
        d="M16 48 C14 36, 18 20, 32 18 C46 20, 50 36, 48 48 C42 54, 22 54, 16 48 Z"
        fill="url(#padSkinGrad)"
        stroke="#450A0A"
        strokeWidth="2.5"
      />
      {/* 3D Golden Jaws Accent */}
      <path
        d="M22 36 C27 40, 37 40, 42 36 C44 44, 40 48, 32 48 C24 48, 20 44, 22 36 Z"
        fill="url(#padGoldGrad)"
        stroke="#78350F"
        strokeWidth="1.8"
      />
      {/* Sunglasses / Eye Visor */}
      <rect x="22" y="26" width="9" height="7" rx="2" fill="#1E1B4B" stroke="#FEF08A" strokeWidth="1.2" />
      <rect x="33" y="26" width="9" height="7" rx="2" fill="#1E1B4B" stroke="#FEF08A" strokeWidth="1.2" />
      <rect x="30" y="28" width="4" height="2.5" fill="#FEF08A" />
      {/* White Specular Glare */}
      <path d="M24 28 L27 28 L25 32 L23 32 Z" fill="#FFFFFF" opacity="0.6" />
      <path d="M35 28 L38 28 L36 32 L34 32 Z" fill="#FFFFFF" opacity="0.6" />
      {/* Sharp Teeth */}
      <polygon points="26,38 28,42 30,38" fill="#FFFFFF" stroke="#450A0A" strokeWidth="0.8" />
      <polygon points="34,38 36,42 38,38" fill="#FFFFFF" stroke="#450A0A" strokeWidth="0.8" />
    </g>
  </svg>
);

/**
 * 3D Stylized Dinosaur Profile Card Thumbnail
 * Replaces the flat 2D sprite in dinosaur selection cards.
 */
export const DinoAvatar3DIcon: React.FC<{
  className?: string;
  bodyColor?: string;
  bellyColor?: string;
  hasSpinoSail?: boolean;
  hasCrown?: boolean;
}> = ({
  className = 'w-7 h-7',
  bodyColor = '#38BDF8',
  bellyColor = '#BAE6FD',
  hasSpinoSail = false,
  hasCrown = false,
}) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`select-none ${className}`}>
    <defs>
      <filter id="dinoHeadShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>
    {/* Spino Dorsal Sail if applicable */}
    {hasSpinoSail && (
      <path
        d="M10 24 C14 10, 26 8, 30 20 Z"
        fill="#0284C7"
        stroke="#075985"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    )}
    {/* Crown if applicable */}
    {hasCrown && (
      <polygon points="20,12 24,6 28,12 32,7 34,14 18,14" fill="#FACC15" stroke="#78350F" strokeWidth="1.2" />
    )}
    {/* 3D Dinosaur Head */}
    <g filter="url(#dinoHeadShadow)">
      {/* Head & Jaws */}
      <path
        d="M12 28 C10 18, 16 12, 28 12 L36 12 C42 12, 45 16, 45 22 L45 26 C45 29, 42 32, 38 32 L34 32 C32 36, 26 38, 20 38 C14 38, 12 34, 12 28 Z"
        fill={bodyColor}
        stroke="#1E1B18"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Belly / Jaw Highlight */}
      <path
        d="M20 32 C26 32, 32 30, 36 26 L38 30 C34 34, 28 36, 20 36 Z"
        fill={bellyColor}
        opacity="0.85"
      />
      {/* Cool Shades or Big Dino Eye */}
      <rect x="26" y="16" width="12" height="8" rx="2.5" fill="#0F172A" stroke="#FDE047" strokeWidth="1.5" />
      <path d="M28 18 L33 18 L30 23 L27 23 Z" fill="#FFFFFF" opacity="0.6" />
      {/* Nostril */}
      <circle cx="41" cy="20" r="1.2" fill="#1E1B18" />
      {/* Sharp White Teeth */}
      <polygon points="34,31 36,28 38,31" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="0.8" />
      <polygon points="40,31 42,28 44,31" fill="#FFFFFF" stroke="#1E1B18" strokeWidth="0.8" />
    </g>
  </svg>
);

/**
 * 3D Tropical Prehistoric Atoll / Island Oasis
 * Replaces flat 2D palm clip-art in "EXPLORE ISLAND BIOMES".
 */
export const IslandBiomes3DIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-6 h-6',
  size,
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    style={size ? { width: size, height: size } : undefined}
    role="img"
    aria-label="3D Island Biomes Emblem"
  >
    <defs>
      <linearGradient id="islSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="islSandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
      <linearGradient id="islLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="60%" stopColor="#16A34A" />
        <stop offset="100%" stopColor="#065F46" />
      </linearGradient>
      <filter id="islDropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>
    {/* Ground Ocean Shadow */}
    <ellipse cx="32" cy="56" rx="22" ry="4.5" fill="#000000" opacity="0.3" />
    {/* 3D Tropical Sand Atoll */}
    <g filter="url(#islDropShadow)">
      <ellipse cx="32" cy="50" rx="22" ry="8" fill="url(#islSandGrad)" stroke="#78350F" strokeWidth="2" />
      <ellipse cx="32" cy="48" rx="17" ry="5.5" fill="#22C55E" opacity="0.8" />
    </g>
    {/* Curved 3D Palm Trunk */}
    <g filter="url(#islDropShadow)">
      <path
        d="M26 50 C29 38, 35 30, 31 16"
        stroke="#9A3412"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M26 50 C29 38, 35 30, 31 16"
        stroke="#EA580C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* 3D Lush Palm Fronds */}
      <path d="M31 16 C22 13, 13 18, 10 26 C16 23, 23 23, 31 16 Z" fill="url(#islLeafGrad)" stroke="#064E3B" strokeWidth="1.5" />
      <path d="M31 16 C24 8, 16 7, 10 11 C16 13, 24 14, 31 16 Z" fill="url(#islLeafGrad)" stroke="#064E3B" strokeWidth="1.5" />
      <path d="M31 16 C34 7, 43 7, 49 11 C43 13, 36 14, 31 16 Z" fill="url(#islLeafGrad)" stroke="#064E3B" strokeWidth="1.5" />
      <path d="M31 16 C38 13, 46 17, 51 25 C45 22, 38 22, 31 16 Z" fill="url(#islLeafGrad)" stroke="#064E3B" strokeWidth="1.5" />
      <path d="M31 16 C32 6, 30 2, 31 1 C33 6, 32 10, 31 16 Z" fill="#86EFAC" stroke="#064E3B" strokeWidth="1.2" />
      {/* 3D Coconuts */}
      <circle cx="29" cy="18" r="2.5" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
      <circle cx="33" cy="18" r="2.5" fill="#9A3412" stroke="#451A03" strokeWidth="0.8" />
      <circle cx="31" cy="21" r="2.2" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
    </g>
  </svg>
);

/**
 * 3D Golden Arcade Champion Star with Laurel Wreath
 * Used beside the Hall of Fame / community leaderboard footer label.
 */
export const TournamentStandings3DIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-4 h-4',
  size,
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    style={size ? { width: size, height: size } : undefined}
    role="img"
    aria-label="Leaderboard emblem"
  >
    <defs>
      <linearGradient id="tournStarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="25%" stopColor="#FEF08A" />
        <stop offset="65%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="tournLaurelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="100%" stopColor="#15803D" />
      </linearGradient>
    </defs>
    {/* Laurel Wreath base */}
    <path
      d="M6 18 C6 24, 11 28, 16 29 C21 28, 26 24, 26 18"
      stroke="url(#tournLaurelGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Faceted 3D Champion Star */}
    <polygon
      points="16,3 19,10 27,11 21,17 23,24 16,20 9,24 11,17 5,11 13,10"
      fill="url(#tournStarGrad)"
      stroke="#78350F"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Specular White Glint on top tip */}
    <circle cx="16" cy="5" r="1.5" fill="#FFFFFF" opacity="0.9" />
  </svg>
);

