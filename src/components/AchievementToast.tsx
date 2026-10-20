import React from 'react';
import { Achievement } from '../game/achievements.ts';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  if (!achievement) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-[#181A24]/95 border-3 border-[#F59E0B] text-white shadow-[4px_4px_0px_#000000] cursor-pointer animate-bounce-short select-none max-w-sm w-[90%]"
      style={{ animationDuration: '0.4s' }}
    >
      <div className="w-10 h-10 shrink-0 bg-[#F59E0B] text-black flex items-center justify-center font-pixel text-xl border-2 border-black">
        {achievement.icon || '🏆'}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[8px] font-pixel text-[#FDE047] uppercase tracking-wider block">
          ACHIEVEMENT UNLOCKED!
        </span>
        <h4 className="font-pixel text-xs text-white truncate font-bold">
          {achievement.title}
        </h4>
        <p className="text-[9px] text-[#94A3B8] font-pixel truncate mt-0.5">
          {achievement.description}
        </p>
      </div>
      <div className="shrink-0 font-pixel text-[10px] text-[#10B981] bg-[#064E3B] px-2 py-1 border border-[#10B981]">
        +{achievement.reward}🪙
      </div>
    </div>
  );
};
