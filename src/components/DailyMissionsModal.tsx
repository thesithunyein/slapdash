import React, { useState } from 'react';
import {
  DailyMission,
  loadDailyMissions,
  claimDailyMission,
} from '../game/dailyMissions.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Target, Coins, Check, X, Footprints, Flame, Clock, Zap, Gift } from 'lucide-react';
import { DinoVectorIcon, Missions3DIcon } from './GameIcons.tsx';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (coinsAdded: number) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [missions, setMissions] = useState<DailyMission[]>(() => loadDailyMissions());
  const [resetCountdown, setResetCountdown] = useState<string>('');

  React.useEffect(() => {
    fetch('/api/daily-schedule')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.resetTimeFormatted) {
          setResetCountdown(data.resetTimeFormatted);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleClaim = (missionId: string) => {
    sounds.playCoin();
    sounds.playAchievement();
    const result = claimDailyMission(missionId);
    if (result.success) {
      setMissions([...result.missions]);
      onRewardClaimed(result.rewardCoins);
    }
  };

  const completedCount = missions.filter((m) => m.completed).length;

  const renderIcon = (type: DailyMission['iconType']) => {
    switch (type) {
      case 'slap':
        return <Zap className="w-5 h-5 text-[#FACC15] fill-[#FACC15]" />;
      case 'run':
        return <Footprints className="w-5 h-5 text-[#34D399]" />;
      case 'fever':
        return <Flame className="w-5 h-5 text-[#F97316] fill-[#F97316]" />;
      case 'coin':
        return <Coins className="w-5 h-5 text-[#FACC15] fill-[#FACC15]" />;
      case 'escape':
        return <DinoVectorIcon className="w-5 h-5 text-white" bodyColor="#10B981" bellyColor="#D1FAE5" />;
      default:
        return <Target className="w-5 h-5 text-[#EF4444]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn font-['Fredoka']">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#241911] via-[#1A120D] to-[#120B07] border-3 border-[#F97316] shadow-[0_16px_48px_rgba(0,0,0,0.85)] rounded-3xl flex flex-col max-h-[90vh] overflow-hidden text-[#FFF8E7]">
        {/* Header */}
        <div className="bg-[#140D08] border-b-2 border-[#F97316]/40 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FFA726] to-[#E65100] border-2 border-[#FFE082] rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <Missions3DIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Lilita_One'] text-xl text-[#FEF08A] tracking-wider uppercase">
                  DAILY MISSIONS
                </h2>
                <span className="text-xs font-['Lilita_One'] text-[#FED7AA]">
                  ({completedCount}/{missions.length})
                </span>
              </div>
              <span className="text-xs text-[#FED7AA] font-medium block">
                Complete daily runs to earn free coin bounties
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#EF4444] hover:bg-[#F87171] text-white border-2 border-white/40 shadow-md active:scale-95 rounded-2xl cursor-pointer flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Clean Missions List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5">
          {missions.map((m) => {
            const percent = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                  m.completed && !m.claimed
                    ? 'bg-gradient-to-r from-[#1E2B1E] to-[#142015] border-[#10B981] ring-1 ring-[#10B981]/50 shadow-sm'
                    : m.claimed
                    ? 'bg-[#150E09]/70 border-white/10 opacity-70'
                    : 'bg-[#1D140D] border-white/15'
                }`}
              >
                {/* Left: Icon */}
                <div className="w-10 h-10 bg-[#2D1B0F] border border-white/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  {renderIcon(m.iconType)}
                </div>

                {/* Center: Mission info & progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-['Lilita_One'] text-sm sm:text-base text-white tracking-wide">
                      {m.title}
                    </h3>
                    <div className="flex items-center gap-1 font-['Lilita_One'] text-xs text-[#FACC15] shrink-0">
                      <Coins className="w-3.5 h-3.5 fill-[#FACC15]" />
                      <span>+{m.rewardCoins}</span>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-[#FED7AA]/90 font-medium leading-snug mb-1.5">
                    {m.description}
                  </p>

                  {/* Clean Progress Line */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          m.completed
                            ? 'bg-gradient-to-r from-[#10B981] to-[#34D399]'
                            : 'bg-gradient-to-r from-[#FFA726] to-[#FB8C00]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="font-['Lilita_One'] text-xs text-white shrink-0">
                      {m.current}/{m.target}
                    </span>
                  </div>
                </div>

                {/* Right: Action Button */}
                <div className="shrink-0 pl-1">
                  {m.claimed ? (
                    <div className="flex items-center gap-1 font-['Lilita_One'] text-[11px] text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded-xl border border-[#10B981]/40">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>DONE</span>
                    </div>
                  ) : m.completed ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(m.id)}
                      className="px-3.5 py-1.5 bg-gradient-to-b from-[#10B981] to-[#047857] hover:from-[#34D399] hover:to-[#059669] text-white border border-[#A7F3D0] shadow-sm active:scale-95 rounded-xl font-['Lilita_One'] text-xs flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                    >
                      <span>CLAIM</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-['Lilita_One'] text-[#94A3B8] px-2 py-1 bg-black/30 rounded-lg">
                      {percent}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-[#140D08] border-t-2 border-[#F97316]/40 px-5 py-3 flex items-center justify-between text-xs text-[#FED7AA] font-medium shrink-0">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
            Resets Daily at Midnight UTC
          </span>
          {resetCountdown && (
            <span className="text-[#38BDF8] font-['Lilita_One'] text-xs tracking-wider">
              {resetCountdown} remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
