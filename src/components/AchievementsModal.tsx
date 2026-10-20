import React, { useState } from 'react';
import { X, Award, Check, Gift, Sparkles, Lock } from 'lucide-react';
import {
  ACHIEVEMENTS_LIST,
  Achievement,
  loadAchievementStorage,
  saveAchievementStorage,
} from '../game/achievements.ts';
import { GameStats } from '../game/types.ts';
import { sounds } from '../game/SoundEngine.ts';

interface AchievementsModalProps {
  stats: GameStats;
  totalCoins: number;
  unlockedLevel: number;
  totalStars: number;
  unlockedSkinsCount: number;
  onCoinsClaimed: (coins: number) => void;
  onClose: () => void;
}

type FilterTab = 'ALL' | 'CLAIMABLE' | 'UNLOCKED' | 'IN_PROGRESS';

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  stats,
  totalCoins,
  unlockedLevel,
  totalStars,
  unlockedSkinsCount,
  onCoinsClaimed,
  onClose,
}) => {
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [store, setStore] = useState(() => loadAchievementStorage());

  // Compute progress for each achievement
  const enrichedAchievements = ACHIEVEMENTS_LIST.map((ach) => {
    let current = 0;
    switch (ach.id) {
      case 'first_slap':
        current = Math.max(stats.slapsCount, store.cumulative.totalSlaps);
        break;
      case 'slaps_50':
      case 'slaps_200':
      case 'slaps_500':
      case 'slaps_1500':
        current = store.cumulative.totalSlaps;
        break;
      case 'combo_5':
      case 'combo_15':
      case 'combo_25':
        current = stats.maxCombo;
        break;
      case 'fever_trigger':
        current = stats.feverActive ? 1 : 0;
        break;
      case 'chaos_16x':
        current = stats.chaosMultiplier;
        break;
      case 'distance_100':
      case 'distance_500':
      case 'distance_1500':
        current = stats.distanceRun;
        break;
      case 'chaser_escaped_3':
        current = store.cumulative.totalEscaped;
        break;
      case 'near_miss_10':
        current = store.cumulative.totalNearMisses;
        break;
      case 'boost_ramps_10':
        current = store.cumulative.totalRamps;
        break;
      case 'coins_50':
      case 'coins_500':
      case 'coins_2500':
        current = totalCoins;
        break;
      case 'unlock_skin_1':
      case 'unlock_all_skins':
        current = unlockedSkinsCount;
        break;
      case 'level_5':
      case 'level_10':
      case 'level_25':
      case 'level_50':
      case 'level_100':
        current = unlockedLevel;
        break;
      case 'stars_30':
        current = totalStars;
        break;
      case 'maps_all_6':
        current = store.cumulative.mapsPlayed.length;
        break;
      default:
        current = 0;
    }

    const isUnlocked = Boolean(store.unlocked[ach.id]) || current >= ach.targetValue;
    const isClaimed = Boolean(store.claimed[ach.id]);
    const isClaimable = isUnlocked && !isClaimed;

    return {
      ...ach,
      currentValue: Math.min(ach.targetValue, current),
      isUnlocked,
      isClaimed,
      isClaimable,
    };
  });

  const totalUnlocked = enrichedAchievements.filter((a) => a.isUnlocked).length;
  const totalClaimableCount = enrichedAchievements.filter((a) => a.isClaimable).length;
  const totalClaimableCoins = enrichedAchievements
    .filter((a) => a.isClaimable)
    .reduce((sum, a) => sum + a.reward, 0);

  const filteredList = enrichedAchievements.filter((a) => {
    if (filter === 'CLAIMABLE') return a.isClaimable;
    if (filter === 'UNLOCKED') return a.isUnlocked;
    if (filter === 'IN_PROGRESS') return !a.isUnlocked;
    return true;
  });

  const handleClaim = (achId: string, reward: number) => {
    sounds.playCoin();
    const updated = {
      ...store,
      claimed: { ...store.claimed, [achId]: true },
    };
    setStore(updated);
    saveAchievementStorage(updated);
    onCoinsClaimed(reward);
  };

  const handleClaimAll = () => {
    if (totalClaimableCoins <= 0) return;
    sounds.playCoin();
    const newClaimed = { ...store.claimed };
    enrichedAchievements
      .filter((a) => a.isClaimable)
      .forEach((a) => {
        newClaimed[a.id] = true;
      });
    const updated = { ...store, claimed: newClaimed };
    setStore(updated);
    saveAchievementStorage(updated);
    onCoinsClaimed(totalClaimableCoins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#181A24] border-4 border-black shadow-[8px_8px_0px_#000000] text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#0F172A] border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F59E0B] text-black flex items-center justify-center font-pixel text-lg border-2 border-black">
              ⭐
            </div>
            <div>
              <span className="text-[9px] font-pixel text-[#FDE047] uppercase tracking-wider block">
                TROPHY HALL
              </span>
              <h2 className="font-pixel text-base sm:text-lg font-bold text-white tracking-wide">
                ACHIEVEMENTS & TROPHIES
              </h2>
            </div>
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

        {/* Global Progress Bar Banner */}
        <div className="p-4 bg-[#1E293B] border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs font-pixel mb-1.5">
              <span className="text-[#94A3B8]">TOTAL COMPLETION:</span>
              <span className="text-[#FDE047] font-bold">
                {totalUnlocked} / {ACHIEVEMENTS_LIST.length} ({Math.round((totalUnlocked / ACHIEVEMENTS_LIST.length) * 100)}%)
              </span>
            </div>
            <div className="h-3 w-full bg-[#0A0D14] border-2 border-black overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F59E0B] to-[#10B981] transition-all duration-300"
                style={{ width: `${(totalUnlocked / ACHIEVEMENTS_LIST.length) * 100}%` }}
              />
            </div>
          </div>

          {totalClaimableCoins > 0 && (
            <button
              onClick={handleClaimAll}
              className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black font-pixel text-xs font-bold border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4 fill-black" />
              <span>CLAIM ALL (+{totalClaimableCoins}🪙)</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-2 bg-[#0A0D14] border-b-2 border-black overflow-x-auto no-scrollbar">
          {(['ALL', 'CLAIMABLE', 'UNLOCKED', 'IN_PROGRESS'] as FilterTab[]).map((tab) => {
            const count =
              tab === 'ALL'
                ? ACHIEVEMENTS_LIST.length
                : tab === 'CLAIMABLE'
                ? totalClaimableCount
                : tab === 'UNLOCKED'
                ? totalUnlocked
                : ACHIEVEMENTS_LIST.length - totalUnlocked;

            return (
              <button
                key={tab}
                onClick={() => {
                  sounds.playClick();
                  setFilter(tab);
                }}
                className={`py-1.5 px-3 font-pixel text-[10px] uppercase tracking-wider border-2 border-black cursor-pointer transition-none flex items-center gap-1.5 ${
                  filter === tab
                    ? 'bg-[#F59E0B] text-black font-bold shadow-[2px_2px_0px_#000000]'
                    : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>{tab.replace('_', ' ')}</span>
                <span className="text-[8px] px-1 bg-black/40 rounded-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#131620]">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center font-pixel text-xs text-[#64748B]">
              NO ACHIEVEMENTS MATCH THIS FILTER
            </div>
          ) : (
            filteredList.map((ach) => {
              const progressPct = Math.round(((ach.currentValue || 0) / ach.targetValue) * 100);

              return (
                <div
                  key={ach.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border-3 border-black gap-3 transition-none ${
                    ach.isClaimable
                      ? 'bg-[#1E3A8A]/40 border-[#F59E0B] shadow-[3px_3px_0px_#F59E0B]'
                      : ach.isClaimed
                      ? 'bg-[#1E293B] opacity-80'
                      : 'bg-[#0F172A]/80'
                  }`}
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 shrink-0 bg-[#0A0D14] border-2 border-black flex items-center justify-center font-pixel text-xl">
                      {ach.isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-[#64748B]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-pixel text-xs font-bold text-white truncate">
                          {ach.title}
                        </h4>
                        <span className="text-[8px] font-pixel px-1.5 py-0.2 bg-[#0A0D14] border border-black text-[#94A3B8] uppercase">
                          {ach.category}
                        </span>
                      </div>
                      <p className="font-pixel text-[9px] text-[#94A3B8] line-clamp-1">
                        {ach.description}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-1.5 flex items-center gap-2 max-w-xs">
                        <div className="h-1.5 flex-1 bg-[#0A0D14] border border-black overflow-hidden">
                          <div
                            className={`h-full ${ach.isUnlocked ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[8px] font-pixel text-[#94A3B8] shrink-0">
                          {ach.currentValue} / {ach.targetValue}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Claim button or Claimed status */}
                  <div className="shrink-0 flex items-center gap-2 sm:self-center">
                    {ach.isClaimable ? (
                      <button
                        onClick={() => handleClaim(ach.id, ach.reward)}
                        className="w-full sm:w-auto px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-black font-pixel text-[10px] font-bold border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Gift className="w-3.5 h-3.5 fill-black" />
                        <span>CLAIM +{ach.reward}🪙</span>
                      </button>
                    ) : ach.isClaimed ? (
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-[#064E3B] border border-[#10B981] text-[#10B981] font-pixel text-[9px]">
                        <Check className="w-3.5 h-3.5" />
                        <span>CLAIMED</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 bg-[#0A0D14] border border-black text-[#F59E0B] font-pixel text-[9px]">
                        +{ach.reward}🪙
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0F172A] border-t-4 border-black flex items-center justify-between text-[9px] font-pixel text-[#94A3B8]">
          <span>ACHIEVE MILESTONES IN GAMEPLAY TO UNLOCK GOLD COIN REWARDS</span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-3 py-1 bg-[#334155] hover:bg-[#475569] text-white border border-black cursor-pointer uppercase"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
