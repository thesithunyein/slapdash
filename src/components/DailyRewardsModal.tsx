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
import { Gift, Coins, Flame, Crown, Trophy, Check, X, Sparkles, Calendar } from 'lucide-react';

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

  const renderIcon = (name: DailyRewardTier['iconName']) => {
    switch (name) {
      case 'flame':
        return <Flame className="w-5 h-5 text-[#EF4444] fill-[#EF4444]" />;
      case 'crown':
        return <Crown className="w-6 h-6 text-[#F6C445] fill-[#F6C445] animate-bounce" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />;
      default:
        return <Coins className="w-5 h-5 text-[#F6C445] fill-[#F6C445]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-[#181A24] border-3 sm:border-4 border-black shadow-[6px_6px_0px_#000000] flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-[#0F172A] border-b-3 border-black px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#F6C445] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
              <Gift className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wider flex items-center gap-1.5">
                <span>DAILY LOGIN BONUS</span>
                <span className="text-[8px] bg-[#10B981] text-black px-1.5 py-0.5 border border-black font-bold">
                  7-DAY STREAK
                </span>
              </h2>
              <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8] block">
                LOG IN DAILY TO COLLECT EPIC COIN DROPS
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

        {/* Claim celebration alert */}
        {claimedTier && (
          <div className="bg-[#10B981] border-b-3 border-black p-3 text-black font-pixel text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 fill-black" />
              <span>
                CLAIMED {claimedTier.title.toUpperCase()}: +{claimedTier.coins} COINS!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setClaimedTier(null)}
              className="text-black font-bold hover:underline cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {/* 7-Day Grid */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAILY_REWARD_TIERS.map((tier) => {
              const isPast = tier.day < state.currentDay || (!isAvailable && tier.day === state.currentDay);
              const isCurrent = tier.day === state.currentDay && isAvailable;
              const isFuture = tier.day > state.currentDay;
              const isBigDay = tier.day === 7;

              return (
                <div
                  key={tier.day}
                  className={`relative p-2.5 sm:p-3 border-2 border-black flex flex-col items-center justify-between text-center ${
                    isBigDay ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border-[#F6C445]' : 'bg-[#0B0F19]'
                  } ${
                    isCurrent
                      ? 'border-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.5)] ring-2 ring-[#10B981]'
                      : 'shadow-[2px_2px_0px_#000000]'
                  } ${isPast ? 'opacity-60' : ''}`}
                >
                  {/* Status Tag */}
                  <div className="w-full flex items-center justify-between mb-1">
                    <span className="font-pixel text-[8px] sm:text-[9px] text-[#94A3B8]">
                      DAY {tier.day}
                    </span>
                    {isPast && (
                      <span className="flex items-center gap-0.5 text-[7px] font-pixel text-[#10B981]">
                        <Check className="w-3 h-3 text-[#10B981]" />
                        CLAIMED
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[7px] font-pixel bg-[#10B981] text-black px-1 font-bold animate-pulse">
                        READY!
                      </span>
                    )}
                    {isFuture && (
                      <span className="text-[7px] font-pixel text-[#64748B]">
                        LOCKED
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="my-1.5 p-2 bg-[#181A24] border border-black/60 rounded flex items-center justify-center">
                    {renderIcon(tier.iconName)}
                  </div>

                  {/* Reward text */}
                  <span className="font-pixel text-xs sm:text-sm font-bold text-[#F6C445] leading-none mb-1">
                    +{tier.coins.toLocaleString()}
                  </span>
                  <span className="text-[7px] text-[#CBD5E1] line-clamp-1">
                    {tier.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action CTA Container */}
          <div className="pt-2">
            {isAvailable ? (
              <button
                type="button"
                onClick={handleClaim}
                className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-black border-3 border-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none font-pixel text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-none"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>CLAIM DAY {state.currentDay} REWARD!</span>
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 bg-[#0B0F19] border-2 border-black flex items-center justify-between text-[#94A3B8] font-pixel text-[8px] sm:text-[9px]">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <Check className="w-3.5 h-3.5" />
                  DAY {state.currentDay} REWARD CLAIMED TODAY
                </span>
                <span className="text-[#64748B]">
                  NEXT BONUS IN 24H
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
