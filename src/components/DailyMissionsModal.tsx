import React, { useState } from 'react';
import {
  DailyMission,
  loadDailyMissions,
  claimDailyMission,
} from '../game/dailyMissions.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Target, Coins, Check, X, Sparkles, Footprints, Flame, ShieldAlert, Award } from 'lucide-react';

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

  const renderIcon = (type: DailyMission['iconType']) => {
    switch (type) {
      case 'slap':
        return <Award className="w-5 h-5 text-[#EF4444]" />;
      case 'run':
        return <Footprints className="w-5 h-5 text-[#38BDF8]" />;
      case 'fever':
        return <Flame className="w-5 h-5 text-[#EC4899] fill-[#EC4899]" />;
      case 'coin':
        return <Coins className="w-5 h-5 text-[#F6C445] fill-[#F6C445]" />;
      case 'escape':
        return <ShieldAlert className="w-5 h-5 text-[#10B981]" />;
      default:
        return <Target className="w-5 h-5 text-[#F6C445]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-[#181A24] border-3 sm:border-4 border-black shadow-[6px_6px_0px_#000000] flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-[#0F172A] border-b-3 border-black px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#38BDF8] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
              <Target className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wider flex items-center gap-1.5">
                <span>DAILY BOUNTIES</span>
                <span className="text-[8px] bg-[#38BDF8] text-black px-1.5 py-0.5 border border-black font-bold">
                  24H RESET
                </span>
              </h2>
              <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8] block">
                COMPLETE TASKS TO HARVEST EXTRA COINS
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
            className="w-8 h-8 bg-[#EF4444] hover:bg-[#DC2626] text-white border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mission List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3">
          {missions.map((m) => {
            const percent = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className={`p-3 bg-[#0B0F19] border-2 border-black shadow-[2px_2px_0px_#000000] flex flex-col gap-2 ${
                  m.completed && !m.claimed ? 'border-[#10B981] ring-1 ring-[#10B981]' : ''
                } ${m.claimed ? 'opacity-65' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#181A24] border-2 border-black flex items-center justify-center shrink-0">
                      {renderIcon(m.iconType)}
                    </div>
                    <div>
                      <h3 className="font-pixel text-[10px] sm:text-xs text-white">
                        {m.title}
                      </h3>
                      <p className="text-[8px] sm:text-[9px] text-[#94A3B8]">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  {/* Reward Coin Badge */}
                  <div className="flex items-center gap-1 font-pixel text-[9px] sm:text-xs text-[#F6C445] bg-[#181A24] border border-black px-2 py-1 shrink-0">
                    <Coins className="w-3 h-3 fill-[#F6C445]" />
                    <span>+{m.rewardCoins}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
                    <span>PROGRESS</span>
                    <span className="text-white">
                      {m.current} / {m.target} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black border border-black/80 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        m.completed ? 'bg-[#10B981]' : 'bg-[#38BDF8]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-1 flex justify-end">
                  {m.claimed ? (
                    <div className="flex items-center gap-1 text-[8px] font-pixel text-[#10B981] bg-[#10B981]/10 px-2 py-1 border border-[#10B981]/30">
                      <Check className="w-3 h-3" />
                      <span>REWARD CLAIMED</span>
                    </div>
                  ) : m.completed ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(m.id)}
                      className="px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-black border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 font-pixel text-[9px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>CLAIM +{m.rewardCoins} COINS</span>
                    </button>
                  ) : (
                    <div className="text-[8px] font-pixel text-[#64748B] px-2 py-1">
                      IN PROGRESS
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-[#0B0F19] border-t-2 border-black px-4 py-2.5 flex items-center justify-between text-[7px] sm:text-[8px] font-pixel text-[#94A3B8]">
          <span>DAILY REFRESH AT MIDNIGHT UTC</span>
          {resetCountdown ? (
            <span className="text-[#38BDF8] font-bold">RESETS IN {resetCountdown.toUpperCase()}</span>
          ) : (
            <span className="text-[#10B981]">SYNCED</span>
          )}
        </div>
      </div>
    </div>
  );
};
