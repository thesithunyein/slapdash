import React from 'react';
import { CharacterSkin } from '../game/types.ts';
import { CHARACTER_SKINS } from '../game/constants.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Shirt, Check, Lock, Coins, X, Zap } from 'lucide-react';

interface SkinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSkin: CharacterSkin;
  unlockedSkinIds: string[];
  totalCoins: number;
  onSelectSkin: (skin: CharacterSkin) => void;
  onUnlockSkin: (skin: CharacterSkin) => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  isOpen,
  onClose,
  selectedSkin,
  unlockedSkinIds,
  totalCoins,
  onSelectSkin,
  onUnlockSkin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#000000]/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-[#181A24] border-3 sm:border-4 border-[#000000] shadow-[6px_6px_0px_#000000] flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-[#0F172A] border-b-3 border-[#000000] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#10B981] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
              <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wider">
                RUNNER WARDROBE
              </h2>
              <span className="text-[7px] sm:text-[8px] font-pixel text-[#94A3B8] block">
                CUSTOMIZE OUTFITS & SPEED PERKS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Coins badge */}
            <div className="bg-black text-[#F6C445] px-2 py-1 border border-black flex items-center gap-1 font-pixel text-[8px] sm:text-[9px]">
              <Coins className="w-3 h-3 fill-[#F6C445]" />
              <span>{totalCoins.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              aria-label="Close wardrobe"
              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#EF4444] hover:bg-[#DC2626] text-white border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Skins Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHARACTER_SKINS.map((skin) => {
            const isUnlocked = unlockedSkinIds.includes(skin.id);
            const isSelected = selectedSkin.id === skin.id;
            const canAfford = totalCoins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`p-3 border-3 border-black flex flex-col justify-between transition-none ${
                  isSelected
                    ? 'bg-[#1E293B] ring-2 ring-[#F6C445] shadow-[3px_3px_0px_#000000]'
                    : 'bg-[#0F172A] shadow-[2px_2px_0px_#000000]'
                }`}
              >
                <div className="flex items-start gap-3 mb-2.5">
                  {/* Swatch Preview */}
                  <div
                    className="w-12 h-12 border-2 border-black shrink-0 relative flex items-center justify-center shadow-[2px_2px_0px_#000000]"
                    style={{ backgroundColor: skin.shirtColor }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-black"
                      style={{ backgroundColor: skin.bodyColor }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="w-6 h-6 text-[#F6C445] stroke-[3]" />
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white/90" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className="font-pixel text-[11px] sm:text-xs text-white font-bold whitespace-nowrap">
                        {skin.name}
                      </h4>
                      {skin.speedBonus > 0 && (
                        <span className="font-pixel text-[7px] text-[#10B981] bg-black/60 px-1.5 py-0.5 border border-[#10B981] flex items-center gap-0.5 shrink-0">
                          <Zap className="w-2 h-2 fill-current" />
                          <span>+{Math.round(skin.speedBonus * 100)}% SPD</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[8px] font-pixel text-[#94A3B8] mt-1 leading-snug">
                      {skin.tagline}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                {isSelected ? (
                  <button
                    disabled
                    className="w-full py-1.5 bg-[#10B981] text-black font-pixel text-[8px] sm:text-[9px] border-2 border-black font-bold flex items-center justify-center gap-1 opacity-95"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>EQUIPPED</span>
                  </button>
                ) : isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onSelectSkin(skin);
                    }}
                    className="w-full py-1.5 bg-[#F6C445] hover:bg-[#FBBF24] text-black font-pixel text-[8px] sm:text-[9px] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer font-bold"
                  >
                    EQUIP RUNNER
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => {
                      if (canAfford) {
                        sounds.playUnlock();
                        onUnlockSkin(skin);
                      }
                    }}
                    className={`w-full py-1.5 font-pixel text-[8px] sm:text-[9px] border-2 border-black flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-[#38BDF8] hover:bg-[#7DD3FC] text-black font-bold shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer'
                        : 'bg-[#334155] text-[#94A3B8] opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>UNLOCK FOR {skin.cost} COINS</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3 bg-[#0F172A] border-t-3 border-black flex justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-[#F6C445] hover:bg-[#FBBF24] text-black font-pixel text-xs border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer font-bold"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
