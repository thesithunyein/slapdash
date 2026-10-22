import React, { useState } from 'react';
import {
  DAILY_REWARD_TIERS,
  DailyRewardTier,
  loadDailyRewardState,
  isDailyRewardAvailable,
  claimDailyReward,
  DailyRewardState,
} from '../game/dailyRewards.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Gift, Coins, Flame, Crown, Trophy, Check, X } from 'lucide-react';
import { DinoEggIcon } from './GameIcons.tsx';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (coinsAdded: number) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [state, setState] = useState<DailyRewardState>(() => loadDailyRewardState());
  const [claimedTier, setClaimedTier] = useState<DailyRewardTier | null>(null);
  const isAvailable = isDailyRewardAvailable();

  if (!isOpen) return null;

  const handleClaim = () => {
    sounds.playCoin();
    sounds.playAchievement();
    const result = claimDailyReward();
    setState(result.updatedState);
    setClaimedTier(result.reward);
    onRewardClaimed(result.bonusCoins);
  };

  const renderEggIcon = (day: number) => {
    return <DinoEggIcon className="w-7 h-7 sm:w-8 sm:h-8" day={day} isGolden={day === 7} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md select-none animate-fadeIn font-['Fredoka']">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2A1E14] via-[#1E1712] to-[#140F0C] border-3 border-[#F97316] shadow-[0_12px_36px_rgba(0,0,0,0.8)] rounded-3xl flex flex-col max-h-[92vh] overflow-hidden text-[#FFF8E7]">
        {/* Header */}
        <div className="bg-[#19110B] border-b-2 border-[#F97316]/40 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] border-2 border-[#FEF08A] rounded-2xl flex items-center justify-center shadow-md">
              <DinoEggIcon className="w-7 h-7" isGolden={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Lilita_One'] text-xl text-[#FEF08A] tracking-wider uppercase">
                  DINO EGG HATCHERY
                </h2>
                <span className="text-[10px] font-['Lilita_One'] bg-[#10B981] text-white px-2 py-0.5 rounded-full border border-white/40">
                  7-DAY STREAK
                </span>
              </div>
              <span className="text-xs text-[#FED7AA] font-medium block">
                Log in daily to hatch dinosaur fossils & bonus coins!
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

        {/* Claim Alert Banner */}
        {claimedTier && (
          <div className="m-4 p-3 bg-gradient-to-r from-[#10B981]/25 to-[#059669]/25 border-2 border-[#10B981] rounded-2xl flex items-center gap-3 animate-bounce">
            <Crown className="w-6 h-6 text-[#FEF08A] shrink-0 fill-[#FEF08A]" />
            <div>
              <span className="font-['Lilita_One'] text-sm text-[#34D399] uppercase block">
                EGG HATCHED!
              </span>
              <span className="text-xs text-white">
                You collected <strong className="text-[#FEF08A]">+{claimedTier.coins} Coins</strong> and maintained your streak!
              </span>
            </div>
          </div>
        )}

        {/* 7 Days Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 mb-4">
            {DAILY_REWARD_TIERS.map((tier) => {
              const isPast = tier.day < state.currentDay;
              const isToday = tier.day === state.currentDay;
              const isClaimedToday = isToday && !isAvailable;
              const isUnlockable = isToday && isAvailable;

              return (
                <div
                  key={tier.day}
                  className={`relative p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all ${
                    tier.day === 7 ? 'col-span-4 sm:col-span-1 bg-gradient-to-b from-[#F59E0B]/30 to-[#B45309]/30 border-[#FBBF24]' : ''
                  } ${
                    isUnlockable
                      ? 'bg-gradient-to-b from-[#FFA726]/30 to-[#E65100]/30 border-[#FFE082] ring-2 ring-[#FFE082]/60 scale-105 shadow-md'
                      : isPast || isClaimedToday
                      ? 'bg-[#19110B] border-[#10B981]/60'
                      : 'bg-[#1D140D] border-white/10 opacity-70'
                  }`}
                >
                  <span className="text-[10px] font-['Lilita_One'] text-[#FED7AA] uppercase">
                    Day {tier.day}
                  </span>

                  <div className="my-1.5 flex items-center justify-center">
                    {isPast || isClaimedToday ? (
                      <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      renderEggIcon(tier.day)
                    )}
                  </div>

                  <span className="font-['Lilita_One'] text-xs text-[#FEF08A]">
                    +{tier.coins}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {isAvailable ? (
            <button
              type="button"
              onClick={handleClaim}
              className="w-full py-3.5 px-6 bg-gradient-to-b from-[#FFA726] via-[#FB8C00] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-lg tracking-wider uppercase rounded-2xl border-3 border-[#FFE082] shadow-[0_5px_0px_#BF360C] active:translate-y-1 active:shadow-[0_1px_0px_#BF360C] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5 text-[#FEF08A] fill-[#FEF08A]" />
              <span>HATCH TODAY'S DINO EGG</span>
            </button>
          ) : (
            <div className="w-full py-3 px-4 bg-[#19110B] border-2 border-white/10 rounded-2xl text-center text-xs text-[#FED7AA] font-medium flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#10B981]" />
              <span>Today's Dino Egg is already hatched! Come back tomorrow for Day {Math.min(7, state.currentDay + 1)}!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
