import React, { useState } from 'react';
import { X, Star, Lock, Play, Trophy } from 'lucide-react';
import { getLevel, LevelDefinition, LevelProgress } from '../game/levels.ts';
import { getMapById } from '../game/maps.ts';
import { sounds } from '../game/SoundEngine.ts';
import { BiomeGraphicPreview } from './BiomeGraphicPreview.tsx';

interface LevelSelectModalProps {
  progress: LevelProgress;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

interface ChapterDef {
  id: string;
  worldNum: number;
  name: string;
  mapId: string;
  min: number;
  max: number;
  icon: string;
}

const CHAPTERS: ChapterDef[] = [
  { id: 'w1', worldNum: 1, name: 'Bazaar Boulevard', mapId: 'market', min: 1, max: 20, icon: '🍎' },
  { id: 'w2', worldNum: 2, name: 'Sunny Palm Bay', mapId: 'tropical_coast', min: 21, max: 40, icon: '🌴' },
  { id: 'w3', worldNum: 3, name: 'Mirage Canyon', mapId: 'sunset_desert', min: 41, max: 60, icon: '🏜️' },
  { id: 'w4', worldNum: 4, name: 'Cyber Shibuya', mapId: 'neon_night', min: 61, max: 80, icon: '🌆' },
  { id: 'w5', worldNum: 5, name: 'Frosty Alps', mapId: 'winter_peak', min: 81, max: 100, icon: '❄️' },
  { id: 'w6', worldNum: 6, name: 'Sacred Lantern Way', mapId: 'golden_temple', min: 101, max: 120, icon: '🌸' },
];

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  onSelectLevel,
  onClose,
}) => {
  const unlocked = progress.unlockedLevel || 1;

  // Find chapter containing player's current unlocked level
  const initialChapter = CHAPTERS.find((c) => unlocked >= c.min && unlocked <= c.max) || CHAPTERS[0];
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapter.id);

  // Selected level for inspection in the hero briefing
  const [inspectedLevel, setInspectedLevel] = useState<number>(unlocked);

  const currentChapter = CHAPTERS.find((c) => c.id === selectedChapterId) || CHAPTERS[0];

  // Total stars accumulated
  let totalStars = 0;
  Object.values(progress.levelStars).forEach((s) => {
    totalStars += s;
  });

  // Calculate stars for current chapter
  let chapterStars = 0;
  for (let l = currentChapter.min; l <= currentChapter.max; l++) {
    chapterStars += progress.levelStars[l] || 0;
  }
  const maxChapterStars = (currentChapter.max - currentChapter.min + 1) * 3;

  // Selected level details
  const activeLevelDef: LevelDefinition = getLevel(inspectedLevel);
  const activeLevelMap = getMapById(activeLevelDef.mapId);
  const isActiveUnlocked = inspectedLevel <= unlocked;
  const activeStars = progress.levelStars[inspectedLevel] || 0;
  const activeBestScore = progress.levelScores[inspectedLevel] || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#141722] border-4 border-black shadow-[8px_8px_0px_#000000] text-white overflow-hidden">
        {/* 1. Header: Clean Arcade Bar */}
        <div className="flex items-center justify-between p-3.5 bg-[#0F131E] border-b-4 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#F59E0B] text-black flex items-center justify-center font-pixel text-base border-2 border-black">
              🏆
            </div>
            <div>
              <span className="text-[8px] font-pixel text-[#FDE047] uppercase tracking-wider block">
                STAGE CAMPAIGN
              </span>
              <h2 className="font-pixel text-sm sm:text-base font-bold text-white tracking-wide">
                SELECT STAGE
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars counter badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black border-2 border-[#F59E0B] text-[#FDE047] font-pixel text-xs">
              <Star className="w-3.5 h-3.5 fill-[#FDE047]" />
              <span>{totalStars} STARS</span>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center bg-[#EF4444] hover:bg-[#DC2626] text-white border-2 border-black active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Top Hero Stage Briefing Showcase (Clean, Visual, Prominent) */}
        <div className="p-3 sm:p-4 bg-[#181C2B] border-b-3 border-black">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Left: Real Map Graphic Preview */}
            <div className="md:col-span-5 relative overflow-hidden border-2 border-black shadow-[3px_3px_0px_#000000] bg-black">
              <BiomeGraphicPreview
                mapId={activeLevelDef.mapId}
                className="h-28 sm:h-32 w-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-[#10B981] flex items-center gap-1">
                <span className="text-[8px] font-pixel text-[#10B981] font-bold">
                  {activeLevelMap.name.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Right: Stage Details & Primary CTA */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F59E0B] text-black font-pixel text-xs px-2 py-0.5 border border-black font-bold">
                      STAGE {inspectedLevel}
                    </span>
                    <span className="font-pixel text-[9px] text-[#94A3B8]">
                      WORLD {currentChapter.worldNum}
                    </span>
                  </div>

                  {/* Stars for this level */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-4 h-4 ${
                          starNum <= activeStars
                            ? 'fill-[#FDE047] text-[#FDE047]'
                            : 'text-[#475569]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="font-pixel text-sm sm:text-base font-bold text-white mb-0.5">
                  {activeLevelDef.title.replace(/^\d+\.\s*/, '')}
                </h3>
                <p className="font-pixel text-[9px] text-[#94A3B8] mb-2.5">
                  {activeLevelDef.subtitle}
                </p>

                {/* Clean Objectives Badges */}
                <div className="grid grid-cols-3 gap-1.5 mb-2 text-center font-pixel text-[9px]">
                  <div className="bg-[#0F131E] p-1.5 border border-black/60">
                    <span className="text-[#94A3B8] block text-[7px] uppercase">DISTANCE</span>
                    <span className="text-[#38BDF8] font-bold">{activeLevelDef.targetDistance}m</span>
                  </div>
                  <div className="bg-[#0F131E] p-1.5 border border-black/60">
                    <span className="text-[#94A3B8] block text-[7px] uppercase">TARGET SLAPS</span>
                    <span className="text-[#F59E0B] font-bold">{activeLevelDef.targetSlaps} Slaps</span>
                  </div>
                  <div className="bg-[#0F131E] p-1.5 border border-black/60">
                    <span className="text-[#94A3B8] block text-[7px] uppercase">REWARD</span>
                    <span className="text-[#10B981] font-bold">+{activeLevelDef.coinReward}🪙</span>
                  </div>
                </div>

                {activeBestScore > 0 && (
                  <div className="flex items-center gap-1.5 text-[8px] font-pixel text-[#FDE047] mb-2.5">
                    <Trophy className="w-3 h-3 text-[#F59E0B]" />
                    <span>PERSONAL BEST: {activeBestScore.toLocaleString()} PTS</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {isActiveUnlocked ? (
                <button
                  onClick={() => {
                    sounds.playStart();
                    onSelectLevel(inspectedLevel);
                  }}
                  className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-pixel text-xs sm:text-sm font-bold border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>{activeStars > 0 ? `REPLAY STAGE ${inspectedLevel}` : `START STAGE ${inspectedLevel}`}</span>
                </button>
              ) : (
                <div className="w-full py-2 bg-[#1E293B] text-[#94A3B8] font-pixel text-[10px] border-2 border-black flex items-center justify-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>LOCKED · CLEAR STAGE {inspectedLevel - 1} FIRST</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Worlds / Chapters Horizontal Tabs */}
        <div className="bg-[#0B0E17] border-b-2 border-black px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 shrink-0">
            {CHAPTERS.map((chap) => {
              const isChapActive = chap.id === selectedChapterId;
              const isChapUnlocked = unlocked >= chap.min;

              return (
                <button
                  key={chap.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedChapterId(chap.id);
                    // If inspected level is outside this chapter, select first level of chapter or highest unlocked
                    if (inspectedLevel < chap.min || inspectedLevel > chap.max) {
                      const targetLvl = Math.min(Math.max(unlocked, chap.min), chap.max);
                      setInspectedLevel(targetLvl);
                    }
                  }}
                  className={`px-3 py-1.5 font-pixel text-[9px] uppercase border-2 border-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-none ${
                    isChapActive
                      ? 'bg-[#F59E0B] text-black font-bold shadow-[2px_2px_0px_#000000]'
                      : isChapUnlocked
                      ? 'bg-[#181C2B] text-[#94A3B8] hover:text-white hover:bg-[#22273B]'
                      : 'bg-[#101420] text-[#475569] opacity-60'
                  }`}
                >
                  <span>{chap.icon}</span>
                  <span>{chap.name}</span>
                  {!isChapUnlocked && <Lock className="w-2.5 h-2.5 text-[#EF4444]" />}
                </button>
              );
            })}
          </div>

          {/* Quick jump to player's current progression level */}
          <button
            onClick={() => {
              sounds.playClick();
              const chap = CHAPTERS.find((c) => unlocked >= c.min && unlocked <= c.max) || CHAPTERS[0];
              setSelectedChapterId(chap.id);
              setInspectedLevel(unlocked);
            }}
            className="shrink-0 px-2.5 py-1 bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981] text-[#10B981] font-pixel text-[8px] font-bold cursor-pointer"
          >
            CURRENT: LV {unlocked}
          </button>
        </div>

        {/* 4. Clean Level Tiles Grid (Clean 5x4 Grid) */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#111420]">
          <div className="flex items-center justify-between mb-3 text-[9px] font-pixel text-[#94A3B8]">
            <span className="text-white font-bold">
              {currentChapter.name.toUpperCase()} (STAGES {currentChapter.min} - {currentChapter.max})
            </span>
            <div className="flex items-center gap-1 text-[#FDE047]">
              <Star className="w-3 h-3 fill-[#FDE047]" />
              <span>{chapterStars} / {maxChapterStars} STARS</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-2.5">
            {Array.from({ length: currentChapter.max - currentChapter.min + 1 }).map((_, idx) => {
              const lvlNum = currentChapter.min + idx;
              const isLvlUnlocked = lvlNum <= unlocked;
              const isNext = lvlNum === unlocked;
              const isSelected = lvlNum === inspectedLevel;
              const stars = progress.levelStars[lvlNum] || 0;

              return (
                <button
                  key={lvlNum}
                  onClick={() => {
                    sounds.playClick();
                    setInspectedLevel(lvlNum);
                  }}
                  className={`relative p-2.5 flex flex-col items-center justify-between border-2 border-black transition-none cursor-pointer min-h-[72px] ${
                    isSelected
                      ? 'bg-[#1E293B] border-white shadow-[3px_3px_0px_#FFFFFF]'
                      : isNext
                      ? 'bg-[#064E3B] border-[#10B981] shadow-[3px_3px_0px_#10B981]'
                      : isLvlUnlocked
                      ? 'bg-[#181C2B] hover:bg-[#22273B] hover:border-[#F59E0B] shadow-[2px_2px_0px_#000000]'
                      : 'bg-[#0F131E] opacity-50 border-dashed cursor-not-allowed'
                  }`}
                >
                  {/* Top: Status Badge / Lock */}
                  <div className="w-full flex justify-between items-center text-[7px] font-pixel">
                    <span className="text-[#94A3B8]">#{lvlNum}</span>
                    {isNext && (
                      <span className="bg-[#10B981] text-black px-1 font-bold">
                        NEXT
                      </span>
                    )}
                    {!isLvlUnlocked && <Lock className="w-3 h-3 text-[#64748B]" />}
                  </div>

                  {/* Center: Big Clear Level Number */}
                  <div className="my-1">
                    <span
                      className={`font-pixel text-base sm:text-lg font-bold ${
                        isSelected
                          ? 'text-white'
                          : isNext
                          ? 'text-[#34D399]'
                          : isLvlUnlocked
                          ? 'text-[#F59E0B]'
                          : 'text-[#475569]'
                      }`}
                    >
                      {lvlNum}
                    </span>
                  </div>

                  {/* Bottom: Stars Rating */}
                  <div className="flex items-center gap-0.5">
                    {isLvlUnlocked ? (
                      [1, 2, 3].map((starNum) => (
                        <Star
                          key={starNum}
                          className={`w-2.5 h-2.5 ${
                            starNum <= stars
                              ? 'fill-[#FDE047] text-[#FDE047]'
                              : 'text-[#475569]'
                          }`}
                        />
                      ))
                    ) : (
                      <span className="text-[7px] font-pixel text-[#475569]">LOCKED</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Clean Minimal Footer */}
        <div className="p-3 bg-[#0F131E] border-t-3 border-black flex items-center justify-between text-[9px] font-pixel text-[#94A3B8]">
          <span className="truncate max-w-[70%]">
            💡 TIP: SELECT ANY STAGE TILE TO INSPECT ITS OBJECTIVES & MAP
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-3 py-1 bg-[#334155] hover:bg-[#475569] text-white border border-black cursor-pointer uppercase font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
