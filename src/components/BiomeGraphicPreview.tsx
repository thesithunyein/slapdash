import React from 'react';

interface BiomeGraphicPreviewProps {
  mapId: string;
  className?: string;
}

export const BiomeGraphicPreview: React.FC<BiomeGraphicPreviewProps> = ({ mapId, className = '' }) => {
  switch (mapId) {
    case 'market':
      return (
        <div className={`relative w-full h-28 sm:h-32 overflow-hidden border-2 border-black ${className}`}>
          {/* Azure Daylight Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#38BDF8] via-[#7DD3FC] to-[#BAE6FD]" />
          
          {/* Glowing Radiant Sun */}
          <div className="absolute top-2 right-6 w-9 h-9 rounded-full bg-[#FEF08A] shadow-[0_0_12px_#FDE047] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-[#FACC15]" />
          </div>

          {/* Clouds */}
          <div className="absolute top-3 left-4 w-12 h-3.5 bg-white/90 rounded-full" />
          <div className="absolute top-5 left-12 w-10 h-3 bg-white/80 rounded-full" />
          <div className="absolute top-4 right-18 w-14 h-4 bg-white/85 rounded-full" />

          {/* Distant Mediterranean / Market Cityline */}
          <svg className="absolute bottom-11 w-full h-10" viewBox="0 0 300 40" preserveAspectRatio="none">
            <polygon points="0,40 0,22 18,22 18,12 36,12 36,25 54,25 68,15 84,28 110,20 126,12 142,24 165,18 185,10 205,25 220,16 240,24 260,14 278,22 300,18 300,40" fill="#CBD5E1" opacity="0.65" />
            <polygon points="0,40 12,28 30,18 48,26 62,30 80,18 100,24 120,16 145,26 170,18 190,28 215,16 235,26 260,18 285,28 300,22 300,40" fill="#94A3B8" opacity="0.9" />
          </svg>

          {/* Festive Marketplace Bunting Pennants */}
          <svg className="absolute top-8 left-0 w-full h-6" viewBox="0 0 300 24" preserveAspectRatio="none">
            <path d="M0,4 Q75,14 150,6 T300,8" fill="none" stroke="#000000" strokeWidth="1.2" />
            <polygon points="20,6 26,15 32,6" fill="#EF4444" stroke="#000" strokeWidth="0.8" />
            <polygon points="50,9 56,18 62,9" fill="#10B981" stroke="#000" strokeWidth="0.8" />
            <polygon points="80,10 86,19 92,10" fill="#F59E0B" stroke="#000" strokeWidth="0.8" />
            <polygon points="110,8 116,17 122,8" fill="#3B82F6" stroke="#000" strokeWidth="0.8" />
            <polygon points="140,6 146,15 152,6" fill="#EC4899" stroke="#000" strokeWidth="0.8" />
            <polygon points="175,8 181,17 187,8" fill="#FACC15" stroke="#000" strokeWidth="0.8" />
            <polygon points="210,9 216,18 222,9" fill="#10B981" stroke="#000" strokeWidth="0.8" />
            <polygon points="245,8 251,17 257,8" fill="#EF4444" stroke="#000" strokeWidth="0.8" />
            <polygon points="275,6 281,15 287,6" fill="#8B5CF6" stroke="#000" strokeWidth="0.8" />
          </svg>

          {/* Market Boutique Stalls on Left & Right */}
          <div className="absolute bottom-7 left-2 w-14 h-12 bg-[#B45309] border-2 border-black flex flex-col justify-between p-0.5">
            <div className="w-full h-3 bg-[#059669] border-b border-black flex items-center justify-center">
              <span className="text-[6px] font-pixel text-white font-bold">FRUIT</span>
            </div>
            <div className="flex gap-1 justify-center">
              <div className="w-2.5 h-2.5 bg-[#EF4444] rounded-xs border border-black" />
              <div className="w-2.5 h-2.5 bg-[#F59E0B] rounded-xs border border-black" />
              <div className="w-2.5 h-2.5 bg-[#FACC15] rounded-xs border border-black" />
            </div>
          </div>

          <div className="absolute bottom-7 right-2 w-14 h-12 bg-[#854D0E] border-2 border-black flex flex-col justify-between p-0.5">
            <div className="w-full h-3 bg-[#DC2626] border-b border-black flex items-center justify-center">
              <span className="text-[6px] font-pixel text-white font-bold">BAKERY</span>
            </div>
            <div className="flex gap-1 justify-center">
              <div className="w-2.5 h-2.5 bg-[#FDE047] rounded-xs border border-black" />
              <div className="w-2.5 h-2.5 bg-[#D97706] rounded-xs border border-black" />
            </div>
          </div>

          {/* Paved Boulevard Road */}
          <div className="absolute bottom-0 w-full h-8 bg-[#181A24] border-t-2 border-[#E2E8F0] flex items-center justify-center">
            {/* Dashed White Road Lines */}
            <div className="w-full flex justify-around px-4">
              <div className="w-7 h-1 bg-white border border-black" />
              <div className="w-7 h-1 bg-white border border-black" />
              <div className="w-7 h-1 bg-white border border-black" />
              <div className="w-7 h-1 bg-white border border-black" />
            </div>
          </div>

          {/* Biome Title Pill */}
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-[#10B981] flex items-center gap-1.5">
            <span className="text-[9px] font-pixel text-[#10B981] font-bold">BAZAAR BOULEVARD</span>
          </div>
        </div>
      );

    case 'tropical_coast':
      return (
        <div className={`relative w-full h-28 sm:h-32 overflow-hidden border-2 border-black ${className}`}>
          {/* Azure Ocean Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0284C7] via-[#38BDF8] to-[#BAE6FD]" />

          {/* Golden Sun */}
          <div className="absolute top-3 right-8 w-10 h-10 rounded-full bg-[#FEF08A] shadow-[0_0_16px_#F59E0B]" />

          {/* Distant Tropical Islands */}
          <svg className="absolute bottom-11 w-full h-7" viewBox="0 0 300 30" preserveAspectRatio="none">
            <path d="M0,30 Q30,12 70,30 T160,30 T250,22 T300,30" fill="#047857" opacity="0.75" />
          </svg>

          {/* Turquoise Ocean Water */}
          <div className="absolute bottom-6 w-full h-6 bg-gradient-to-b from-[#0EA5E9] to-[#0284C7] border-t border-[#38BDF8]">
            <div className="absolute top-1 left-6 w-16 h-0.5 bg-white/70 rounded-full" />
            <div className="absolute top-2.5 left-28 w-20 h-0.5 bg-white/60 rounded-full" />
            <div className="absolute top-1.5 right-8 w-14 h-0.5 bg-white/70 rounded-full" />
          </div>

          {/* Coconut Palm Trees */}
          <div className="absolute bottom-6 left-5 flex flex-col items-center">
            {/* Palm Fronds */}
            <div className="relative w-12 h-6 -mb-1">
              <div className="absolute top-0 left-0 w-6 h-2.5 bg-[#10B981] rounded-tl-full border border-black -rotate-12" />
              <div className="absolute top-0 right-0 w-6 h-2.5 bg-[#10B981] rounded-tr-full border border-black rotate-12" />
              <div className="absolute top-2 left-1 w-5 h-2 bg-[#059669] rounded-l-full border border-black -rotate-25" />
              <div className="absolute top-2 right-1 w-5 h-2 bg-[#059669] rounded-r-full border border-black rotate-25" />
              <div className="absolute bottom-0 left-4 w-2 h-2 bg-[#451A03] rounded-full" />
            </div>
            {/* Palm Trunk */}
            <div className="w-2 h-9 bg-[#854D0E] border-x border-black rotate-3" />
          </div>

          <div className="absolute bottom-6 right-8 flex flex-col items-center">
            {/* Resort Sun Parasol */}
            <div className="w-10 h-3 bg-gradient-to-r from-[#F43F5E] via-white to-[#F43F5E] border-2 border-black rounded-t-full" />
            <div className="w-1 h-7 bg-white border-x border-black" />
          </div>

          {/* Golden Beach Promenade Road */}
          <div className="absolute bottom-0 w-full h-7 bg-[#FDE68A] border-t-2 border-[#D97706] flex items-center justify-center">
            <div className="w-full flex justify-around px-4">
              <div className="w-6 h-1 bg-[#D97706] border border-black" />
              <div className="w-6 h-1 bg-[#D97706] border border-black" />
              <div className="w-6 h-1 bg-[#D97706] border border-black" />
            </div>
          </div>

          {/* Biome Title Pill */}
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-[#06B6D4] flex items-center gap-1.5">
            <span className="text-[9px] font-pixel text-[#06B6D4] font-bold">SUNNY PALM BAY</span>
          </div>
        </div>
      );

    case 'sunset_desert':
      return (
        <div className={`relative w-full h-28 sm:h-32 overflow-hidden border-2 border-black ${className}`}>
          {/* Terracotta Sunset Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#7C2D12] via-[#C2410C] to-[#FDBA74]" />

          {/* Blazing Sunset Sun */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#FEF08A] shadow-[0_0_24px_#EA580C]" />

          {/* Towering Red Sandstone Canyon Meshes */}
          <svg className="absolute bottom-7 w-full h-14" viewBox="0 0 300 50" preserveAspectRatio="none">
            {/* Distant mesas */}
            <polygon points="0,50 0,20 30,20 40,32 75,32 85,15 130,15 140,28 190,28 200,10 245,10 255,26 300,26 300,50" fill="#9A3412" opacity="0.8" />
            {/* Midground red cliffs */}
            <polygon points="0,50 15,28 35,28 45,38 90,38 105,22 150,22 165,36 210,36 225,18 265,18 280,35 300,35 300,50" fill="#78350F" />
          </svg>

          {/* Saguaro Cacti on Left & Right */}
          <div className="absolute bottom-6 left-6 flex flex-col items-center">
            <div className="relative w-6 h-10">
              {/* Main stem */}
              <div className="absolute left-2.5 bottom-0 w-2 h-10 bg-[#15803D] border border-black rounded-t-sm" />
              {/* Left arm */}
              <div className="absolute left-0 bottom-4 w-3.5 h-1.5 bg-[#15803D] border border-black" />
              <div className="absolute left-0 bottom-4 w-1.5 h-4 bg-[#15803D] border border-black rounded-t-sm" />
              {/* Right arm */}
              <div className="absolute left-3.5 bottom-6 w-3 h-1.5 bg-[#15803D] border border-black" />
              <div className="absolute right-0 bottom-6 w-1.5 h-3.5 bg-[#15803D] border border-black rounded-t-sm" />
            </div>
          </div>

          <div className="absolute bottom-6 right-8 flex flex-col items-center">
            <div className="relative w-5 h-8">
              <div className="absolute left-2 bottom-0 w-2 h-8 bg-[#166534] border border-black rounded-t-sm" />
              <div className="absolute left-0 bottom-3 w-3 h-1.5 bg-[#166534] border border-black" />
              <div className="absolute left-0 bottom-3 w-1.5 h-3.5 bg-[#166534] border border-black rounded-t-sm" />
            </div>
          </div>

          {/* Desert Clay Highway */}
          <div className="absolute bottom-0 w-full h-7 bg-[#292524] border-t-2 border-[#D97706] flex items-center justify-center">
            <div className="w-full flex justify-around px-4">
              <div className="w-6 h-1 bg-[#F97316] border border-black" />
              <div className="w-6 h-1 bg-[#F97316] border border-black" />
              <div className="w-6 h-1 bg-[#F97316] border border-black" />
            </div>
          </div>

          {/* Biome Title Pill */}
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-[#F97316] flex items-center gap-1.5">
            <span className="text-[9px] font-pixel text-[#F97316] font-bold">MIRAGE CANYON</span>
          </div>
        </div>
      );

    case 'neon_night':
      return (
        <div className={`relative w-full h-28 sm:h-32 overflow-hidden border-2 border-black ${className}`}>
          {/* Cyber Synthwave Skyline */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B091A] via-[#1E1B4B] to-[#3B0764]" />

          {/* Holographic Glowing Moon */}
          <div className="absolute top-3 right-8 w-9 h-9 rounded-full bg-[#E879F9] shadow-[0_0_18px_#C026D3] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-[#A21CAF]" />
          </div>

          {/* Cyberpunk Skyscraper Skyline with Glowing Neon Windows */}
          <svg className="absolute bottom-7 w-full h-16" viewBox="0 0 300 60" preserveAspectRatio="none">
            {/* Background Towers */}
            <rect x="10" y="8" width="24" height="52" fill="#0F172A" stroke="#4C1D95" strokeWidth="1" />
            <rect x="40" y="18" width="20" height="42" fill="#1E1B4B" stroke="#06B6D4" strokeWidth="0.8" />
            <rect x="68" y="4" width="28" height="56" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1" />
            <rect x="105" y="14" width="22" height="46" fill="#1E1B4B" stroke="#EC4899" strokeWidth="0.8" />
            <rect x="135" y="2" width="30" height="58" fill="#0F172A" stroke="#00F0FF" strokeWidth="1.2" />
            <rect x="175" y="12" width="24" height="48" fill="#1E1B4B" stroke="#F43F5E" strokeWidth="0.8" />
            <rect x="208" y="6" width="26" height="54" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1" />
            <rect x="242" y="16" width="22" height="44" fill="#1E1B4B" stroke="#06B6D4" strokeWidth="0.8" />
            <rect x="270" y="10" width="24" height="50" fill="#0F172A" stroke="#EC4899" strokeWidth="1" />
          </svg>

          {/* Neon Signboards */}
          <div className="absolute top-10 left-12 px-1 py-0.5 bg-[#00F0FF] text-black font-pixel text-[6px] font-bold shadow-[0_0_8px_#00F0FF] rotate-90">
            SHIBUYA
          </div>
          <div className="absolute top-8 right-16 px-1 py-0.5 bg-[#FF007F] text-white font-pixel text-[6px] font-bold shadow-[0_0_8px_#FF007F]">
            CYBER 2099
          </div>

          {/* Rain-Slicked Neon Highway */}
          <div className="absolute bottom-0 w-full h-7 bg-[#090D16] border-t-2 border-[#00F0FF] shadow-[0_0_10px_#00F0FF] flex items-center justify-center">
            <div className="w-full flex justify-around px-4">
              <div className="w-6 h-1 bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
              <div className="w-6 h-1 bg-[#E879F9] shadow-[0_0_6px_#E879F9]" />
              <div className="w-6 h-1 bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
            </div>
          </div>

          {/* Biome Title Pill */}
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-[#8B5CF6] flex items-center gap-1.5">
            <span className="text-[9px] font-pixel text-[#C084FC] font-bold">CYBER SHIBUYA</span>
          </div>
        </div>
      );

    case 'winter_peak':
      return (
        <div className={`relative w-full h-28 sm:h-32 overflow-hidden border-2 border-black ${className}`}>
          {/* Icy Alpine Gradient Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0284C7] via-[#38BDF8] to-[#CFFAFE]" />

          {/* Majestic Snow-Capped Mountain Range */}
          <svg className="absolute bottom-7 w-full h-16" viewBox="0 0 300 60" preserveAspectRatio="none">
            {/* Distant Mountain Peak */}
            <polygon points="10,60 70,12 130,60" fill="#64748B" />
            <polygon points="50,26 70,12 90,26 80,32 70,28 60,32" fill="#FFFFFF" />

            <polygon points="100,60 170,6 240,60" fill="#475569" />
            <polygon points="148,22 170,6 192,22 182,28 170,24 158,28" fill="#FFFFFF" />

            <polygon points="200,60 255,16 300,60" fill="#64748B" />
            <polygon points="238,28 255,16 272,28 265,34 255,30 245,34" fill="#FFFFFF" />
          </svg>

          {/* Snowy Pine Trees & Ski Chalet */}
          <div className="absolute bottom-7 left-5 flex flex-col items-center">
            {/* 3 stacked pine tiers */}
            <div className="w-0 h-0 border-x-4 border-x-transparent border-b-6 border-b-white -mb-1" />
            <div className="w-0 h-0 border-x-6 border-x-transparent border-b-8 border-b-[#064E3B] -mb-1" />
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-10 border-b-[#064E3B]" />
            <div className="w-1.5 h-3 bg-[#451A03]" />
          </div>

          <div className="absolute bottom-7 right-6 flex flex-col items-center">
            {/* Cozy Log Chalet */}
            <div className="w-11 h-4 bg-white border-2 border-black rounded-t-xs -mb-1 flex items-center justify-center">
              <span className="text-[5px] font-pixel text-black font-bold">LODGE</span>
            </div>
            <div className="w-9 h-6 bg-[#78350F] border-2 border-black flex items-center justify-around px-1">
              <div className="w-2.5 h-2.5 bg-[#FEF08A] border border-black shadow-[0_0_4px_#FDE047]" />
              <div className="w-2 h-4 bg-[#451A03] border border-black" />
            </div>
          </div>

          {/* Frosted Alpine Highway */}
          <div className="absolute bottom-0 w-full h-7 bg-[#1E293B] border-t-2 border-[#E0F2FE] flex items-center justify-center">
            <div className="w-full flex justify-around px-4">
              <div className="w-6 h-1 bg-white border border-black" />
              <div className="w-6 h-1 bg-white border border-black" />
              <div className="w-6 h-1 bg-white border border-black" />
            </div>
          </div>

          {/* Biome Title Pill */}
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-[#38BDF8] flex items-center gap-1.5">
            <span className="text-[9px] font-pixel text-[#38BDF8] font-bold">FROSTY ALPS</span>
          </div>
        </div>
      );

    case 'golden_temple':
    default:
      return (
        <div className={`relative w-full h-28 sm:h-32 overflow-hidden border-2 border-black ${className}`}>
          {/* Twilight Sakura Sanctuary Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E1B4B] via-[#4A044E] to-[#831843]" />

          {/* Full Golden Moon */}
          <div className="absolute top-2 right-8 w-11 h-11 rounded-full bg-[#FEF08A] shadow-[0_0_18px_#FDE047] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#FDE047]" />
          </div>

          {/* Silhouette Pagoda Roofs */}
          <svg className="absolute bottom-7 w-full h-12" viewBox="0 0 300 45" preserveAspectRatio="none">
            <path d="M10,45 Q25,25 40,25 Q55,25 70,45" fill="#18181B" />
            <path d="M22,25 Q30,12 40,12 Q50,12 58,25" fill="#18181B" />
            <rect x="36" y="5" width="8" height="7" fill="#18181B" />

            <path d="M220,45 Q235,25 250,25 Q265,25 280,45" fill="#18181B" />
            <path d="M232,25 Q240,12 250,12 Q260,12 268,25" fill="#18181B" />
          </svg>

          {/* Grand Crimson Torii Gate in Center */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Top curved lintel */}
            <div className="w-16 h-2 bg-[#DC2626] border border-black rounded-t-sm -mb-0.5" />
            {/* Secondary crossbeam */}
            <div className="w-13 h-1.5 bg-[#DC2626] border border-black" />
            {/* Pillars */}
            <div className="w-11 flex justify-between">
              <div className="w-2 h-8 bg-[#B91C1C] border border-black" />
              <div className="w-2 h-8 bg-[#B91C1C] border border-black" />
            </div>
          </div>

          {/* Glowing Red Paper Lanterns */}
          <div className="absolute top-6 left-6 flex flex-col items-center">
            <div className="w-0.5 h-3 bg-black" />
            <div className="w-4 h-5 bg-[#EF4444] rounded-sm border border-black shadow-[0_0_8px_#EF4444] flex items-center justify-center">
              <div className="w-2 h-3 bg-[#FEF08A]" />
            </div>
            <div className="w-1.5 h-1.5 bg-[#F59E0B]" />
          </div>

          <div className="absolute top-6 right-22 flex flex-col items-center">
            <div className="w-0.5 h-3 bg-black" />
            <div className="w-4 h-5 bg-[#EF4444] rounded-sm border border-black shadow-[0_0_8px_#EF4444] flex items-center justify-center">
              <div className="w-2 h-3 bg-[#FEF08A]" />
            </div>
            <div className="w-1.5 h-1.5 bg-[#F59E0B]" />
          </div>

          {/* Stone Cobblestone Lantern Road */}
          <div className="absolute bottom-0 w-full h-7 bg-[#27272A] border-t-2 border-[#E11D48] flex items-center justify-center">
            <div className="w-full flex justify-around px-4">
              <div className="w-6 h-1 bg-[#F43F5E] shadow-[0_0_6px_#F43F5E]" />
              <div className="w-6 h-1 bg-[#F43F5E] shadow-[0_0_6px_#F43F5E]" />
              <div className="w-6 h-1 bg-[#F43F5E] shadow-[0_0_6px_#F43F5E]" />
            </div>
          </div>

          {/* Biome Title Pill */}
          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-[#EC4899] flex items-center gap-1.5">
            <span className="text-[9px] font-pixel text-[#F472B6] font-bold">SACRED LANTERN WAY</span>
          </div>
        </div>
      );
  }
};
