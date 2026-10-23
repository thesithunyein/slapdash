import React, { useState } from 'react';
import { X, Star, Lock, Play, Trophy, Palmtree, Waves, Flame, Building2, Snowflake, Crown } from 'lucide-react';
import { LevelProgress, getLevel, getMapForLevel } from '../game/levels.ts';
import { getMapById } from '../game/maps.ts';
import { sounds } from '../game/SoundEngine.ts';

interface LevelSelectModalProps {
  progress: LevelProgress;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  onSelectLevel,
  onClose,
}) => {
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const CHAPTERS = [
    { id: 'market', name: 'Sunken Palms', minLvl: 1, maxLvl: 4, icon: Palmtree },
    { id: 'tropical_coast', name: 'Lagoon Surf', minLvl: 5, maxLvl: 9, icon: Waves },
    { id: 'sunset_desert', name: 'Volcano Canyon', minLvl: 10, maxLvl: 17, icon: Flame },
    { id: 'neon_night', name: 'Neon Metropolis', minLvl: 18, maxLvl: 24, icon: Building2 },
    { id: 'winter_peak', name: 'Ice Age Glacier', minLvl: 25, maxLvl: 34, icon: Snowflake },
    { id: 'golden_temple', name: 'Blossom Sanctum', minLvl: 35, maxLvl: 40, icon: Crown },
  ];

  const currentChapter = CHAPTERS[activeChapter];
  const levelsInChapter: number[] = [];
  for (let l = currentChapter.minLvl; l <= currentChapter.maxLvl; l++) {
    levelsInChapter.push(l);
  }

  // Calculate total stars earned
  const totalStars = Object.values(progress.levelStars).reduce((sum, s) => sum + s, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md select-none animate-fadeIn font-['Fredoka']">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-gradient-to-b from-[#2A1E14] via-[#1E1712] to-[#140F0C] border-3 border-[#F97316] shadow-[0_12px_36px_rgba(0,0,0,0.85)] rounded-3xl text-[#FFF8E7] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-[#19110B] border-b-2 border-[#F97316]/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white flex items-center justify-center border-2 border-[#FEF08A] rounded-2xl shadow-md">
              <Star className="w-6 h-6 fill-white text-white drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Lilita_One'] text-xl sm:text-2xl font-bold text-[#FEF08A] tracking-wider">
                  STAGE SELECT
                </h2>
                <span className="text-xs font-['Lilita_One'] bg-[#10B981] text-white px-2 py-0.5 rounded-full border border-white/40">
                  {totalStars} STARS
                </span>
              </div>
              <span className="text-xs text-[#FED7AA] font-medium block">
                Conquer 40+ stages across 6 prehistoric worlds
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center bg-[#EF4444] hover:bg-[#F87171] text-white border-2 border-white/40 shadow-md active:scale-95 rounded-2xl cursor-pointer transition-all"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Chapter Tabs */}
        <div className="flex items-center gap-1.5 p-2.5 bg-[#120A05] border-b border-white/10 overflow-x-auto scrollbar-none">
          {CHAPTERS.map((ch, idx) => {
            const isUnlocked = progress.unlockedLevel >= ch.minLvl;
            const isActive = idx === activeChapter;

            const IconComponent = ch.icon;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveChapter(idx);
                }}
                className={`px-3 py-1.5 rounded-xl font-['Lilita_One'] text-xs flex items-center gap-1.5 shrink-0 transition-all border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white border-[#FEF08A] shadow-md scale-105'
                    : isUnlocked
                    ? 'bg-[#24170E] text-[#FED7AA] hover:bg-[#322013] border-white/10'
                    : 'bg-[#180E07] text-white/40 border-transparent opacity-60'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{ch.name}</span>
                {!isUnlocked && <Lock className="w-3 h-3 text-red-400" />}
              </button>
            );
          })}
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {levelsInChapter.map((lvl) => {
            const def = getLevel(lvl);
            const isUnlocked = progress.unlockedLevel >= lvl;
            const stars = progress.levelStars[lvl] || 0;
            const bestScore = progress.levelScores[lvl] || 0;

            return (
              <div
                key={lvl}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-[#2E1E12] to-[#1D130B] border-[#F97316]/60 hover:border-[#FBBF24] shadow-md'
                    : 'bg-[#180E07]/60 border-white/10 opacity-60'
                }`}
              >
                {/* Level Title & Badge */}
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F97316] text-white font-['Lilita_One'] text-base flex items-center justify-center border border-white/40 shadow-xs">
                    {lvl}
                  </div>
                  {isUnlocked ? (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx <= stars
                              ? 'text-[#FBBF24] fill-[#FBBF24] filter drop-shadow'
                              : 'text-white/20 fill-black/30'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-6 h-6 flex items-center justify-center bg-black/40 rounded-full">
                      <Lock className="w-3.5 h-3.5 text-white/40" />
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <h4 className="font-['Lilita_One'] text-sm text-white line-clamp-1">
                    {def.title}
                  </h4>
                  <span className="inline-block my-1 px-2 py-0.5 bg-black/40 border border-amber-500/30 rounded-md text-[9px] font-bold text-amber-300">
                    ⚠️ {def.obstacleThemeName}
                  </span>
                  <p className="text-[11px] text-[#FED7AA]/80 line-clamp-1">
                    {def.description}
                  </p>
                  {bestScore > 0 && (
                    <span className="text-[10px] text-[#10B981] font-bold block mt-0.5">
                      Best: {bestScore.toLocaleString()} pts
                    </span>
                  )}
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => {
                      sounds.playStart();
                      onSelectLevel(lvl);
                    }}
                    className="w-full py-1.5 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-['Lilita_One'] text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-all border border-white/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>PLAY STAGE</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 bg-black/40 text-white/40 font-['Lilita_One'] text-xs rounded-xl flex items-center justify-center gap-1 border border-white/5">
                    <span>LOCKED</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#160E08] border-t border-white/10 flex items-center justify-between text-xs text-[#FED7AA]">
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#FBBF24] fill-[#FBBF24] shrink-0" />
            <span>Complete distance, slaps & coin goals to earn 3 stars</span>
          </span>
          <span className="font-['Lilita_One'] text-[#FBBF24]">Stage {progress.unlockedLevel} Max Unlocked</span>
        </div>
      </div>
    </div>
  );
};
