import React, { useState } from 'react';
import {
  DailyMission,
  loadDailyMissions,
  claimDailyMission,
} from '../game/dailyMissions.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Target, Coins, Check, X, Sparkles, Footprints, Flame, ShieldAlert, Award, Clock, Zap } from 'lucide-react';
import { DinoVectorIcon } from './GameIcons.tsx';

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
        return <Zap className="w-5 h-5 text-[#FBBF24] fill-[#FBBF24]" />;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md select-none animate-fadeIn font-['Fredoka']">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2A1E14] via-[#1E1712] to-[#140F0C] border-3 border-[#F97316] shadow-[0_12px_36px_rgba(0,0,0,0.8)] rounded-3xl flex flex-col max-h-[92vh] overflow-hidden text-[#FFF8E7]">
        {/* Header */}
        <div className="bg-[#19110B] border-b-2 border-[#F97316]/40 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FFA726] to-[#E65100] border-2 border-[#FFE082] rounded-2xl flex items-center justify-center shadow-md">
              <Target className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Lilita_One'] text-xl text-[#FEF08A] tracking-wider uppercase">
                  DINO MAYHEM MISSIONS
                </h2>
                <span className="text-[10px] font-['Lilita_One'] bg-[#38BDF8] text-black px-2 py-0.5 rounded-full border border-white/40">
                  24H
                </span>
              </div>
              <span className="text-xs text-[#FED7AA] font-medium block">
                Tail-whip targets & complete dinosaur feats for bounties
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
            className="w-9 h-9 bg-[#EF4444] hover:bg-[#F87171] text-white border-2 border-white/40 shadow-md active:scale-95 rounded-2xl cursor-pointer flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Mission List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {missions.map((m) => {
            const percent = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className={`p-3.5 bg-[#1D140D] border-2 rounded-2xl shadow-sm flex flex-col gap-2.5 transition-all ${
                  m.completed && !m.claimed
                    ? 'border-[#10B981] ring-2 ring-[#10B981]/40 bg-gradient-to-b from-[#1C2C1D] to-[#141F15]'
                    : 'border-white/10'
                } ${m.claimed ? 'opacity-65' : ''}`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2D1B0F] border-2 border-[#F97316]/50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                      {renderIcon(m.iconType)}
                    </div>
                    <div>
                      <h3 className="font-['Lilita_One'] text-sm sm:text-base text-white tracking-wide">
                        {m.title}
                      </h3>
                      <p className="text-xs text-[#FED7AA]/80 leading-snug">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  {/* Reward Coin Badge */}
                  <div className="flex items-center gap-1 font-['Lilita_One'] text-xs font-bold text-[#FACC15] bg-[#2D1B0F] border-2 border-[#F59E0B]/60 px-2.5 py-1 rounded-xl shrink-0 shadow-xs">
                    <Coins className="w-3.5 h-3.5 fill-[#FACC15]" />
                    <span>+{m.rewardCoins}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#FED7AA] font-medium">
                    <span>Target Progress</span>
                    <span className="font-['Lilita_One'] text-white">
                      {m.current} / {m.target} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/15 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        m.completed
                          ? 'bg-gradient-to-r from-[#10B981] to-[#34D399]'
                          : 'bg-gradient-to-r from-[#FFA726] to-[#FB8C00]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-1 flex justify-end">
                  {m.claimed ? (
                    <div className="flex items-center gap-1 font-['Lilita_One'] text-xs text-[#10B981] bg-[#10B981]/15 px-3 py-1.5 rounded-xl border border-[#10B981]/50">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>BOUNTY CLAIMED</span>
                    </div>
                  ) : m.completed ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(m.id)}
                      className="px-4 py-2 bg-gradient-to-b from-[#10B981] to-[#047857] hover:from-[#34D399] hover:to-[#059669] text-white border-2 border-[#A7F3D0] shadow-md active:scale-95 rounded-xl font-['Lilita_One'] text-xs flex items-center gap-1.5 cursor-pointer transition-all animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 text-[#FEF08A] fill-[#FEF08A]" />
                      <span>CLAIM +{m.rewardCoins} DINO COINS</span>
                    </button>
                  ) : (
                    <div className="text-[11px] font-['Lilita_One'] text-[#94A3B8] uppercase tracking-wider px-2 py-1">
                      IN PROGRESS
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-[#19110B] border-t-2 border-[#F97316]/40 px-5 py-3 flex items-center justify-between text-xs text-[#FED7AA] font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
            Midnight UTC Reset
          </span>
          {resetCountdown ? (
            <span className="text-[#38BDF8] font-['Lilita_One'] text-xs tracking-wider">
              Resets in {resetCountdown}
            </span>
          ) : (
            <span className="text-[#10B981] font-bold">Synced</span>
          )}
        </div>
      </div>
    </div>
  );
};
