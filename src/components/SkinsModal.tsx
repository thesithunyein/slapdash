import React from 'react';
import { CharacterSkin } from '../game/types.ts';
import { CHARACTER_SKINS } from '../game/constants.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Check, Lock, Coins, X, Zap } from 'lucide-react';
import { DinoVectorIcon } from './GameIcons.tsx';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md select-none animate-fadeIn font-['Fredoka']">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#2A1E14] via-[#1E1712] to-[#140F0C] border-3 border-[#F97316] shadow-[0_12px_36px_rgba(0,0,0,0.8)] rounded-3xl flex flex-col max-h-[92vh] overflow-hidden text-[#FFF8E7]">
        {/* Header */}
        <div className="bg-[#19110B] border-b-2 border-[#F97316]/40 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FFA726] to-[#E65100] border-2 border-[#FFE082] rounded-2xl flex items-center justify-center shadow-md">
              <DinoVectorIcon bodyColor="#FEF08A" bellyColor="#FFF" className="w-7 h-7 drop-shadow" />
            </div>
            <div>
              <h2 className="font-['Lilita_One'] text-xl sm:text-2xl text-[#FEF08A] tracking-wider uppercase drop-shadow">
                DINO RESORT PADDOCK
              </h2>
              <span className="text-xs text-[#FED7AA] font-medium block">
                Choose your party dinosaur & speed traits
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Coins badge */}
            <div className="bg-[#2D1B0F] text-[#FACC15] px-3.5 py-1.5 border-2 border-[#F59E0B] rounded-2xl shadow-sm flex items-center gap-1.5 font-['Lilita_One'] text-sm">
              <Coins className="w-4 h-4 fill-[#FACC15]" />
              <span>{totalCoins.toLocaleString()}</span>
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
        </div>

        {/* Skins Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {CHARACTER_SKINS.map((skin) => {
            const isUnlocked = unlockedSkinIds.includes(skin.id);
            const isSelected = selectedSkin.id === skin.id;
            const canAfford = totalCoins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#432A15] to-[#2B1B0E] border-[#FBBF24] ring-2 ring-[#FBBF24]/50 shadow-[0_6px_18px_rgba(251,191,36,0.25)]'
                    : 'bg-[#1D140D] border-white/10 hover:border-white/20 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5 mb-3">
                  {/* Dino Avatar Swatch */}
                  <div
                    className="w-14 h-14 border-2 border-white/40 rounded-2xl shrink-0 relative flex items-center justify-center shadow-inner overflow-hidden p-1.5"
                    style={{ backgroundColor: skin.bodyColor }}
                  >
                    <DinoVectorIcon bodyColor="#FFFFFF" bellyColor={skin.shirtColor} className="w-10 h-10 drop-shadow" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center">
                        <Check className="w-7 h-7 text-[#10B981] stroke-[3]" />
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-[#94A3B8]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-['Lilita_One'] text-base text-white tracking-wide truncate">
                        {skin.name}
                      </h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-[#10B981] text-black font-['Lilita_One'] text-[10px] uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#E2E8F0]/80 line-clamp-2 mt-0.5 leading-snug">
                      {skin.tagline}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#FACC15]">
                        <Zap className="w-3 h-3 fill-[#FACC15]" />
                        {skin.speedBonus > 0 ? `+${Math.round(skin.speedBonus * 100)}% Speed` : 'Base Speed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div>
                  {isSelected ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 bg-[#10B981]/20 border border-[#10B981] text-[#10B981] font-['Lilita_One'] text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>SELECTED RUNNER</span>
                    </button>
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onSelectSkin(skin);
                      }}
                      className="w-full py-2 bg-gradient-to-b from-[#FFA726] to-[#E65100] hover:from-[#FFB74D] hover:to-[#EF6C00] text-white font-['Lilita_One'] text-xs tracking-wider uppercase rounded-xl border border-[#FFE082] shadow-sm active:scale-95 cursor-pointer transition-all"
                    >
                      CHOOSE DINOSAUR
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        if (canAfford) {
                          sounds.playCoin();
                          onUnlockSkin(skin);
                        }
                      }}
                      className={`w-full py-2 font-['Lilita_One'] text-xs tracking-wider uppercase rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        canAfford
                          ? 'bg-gradient-to-b from-[#10B981] to-[#047857] hover:from-[#34D399] hover:to-[#059669] text-white border-[#A7F3D0] shadow-sm active:scale-95 cursor-pointer'
                          : 'bg-black/40 border-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 fill-current" />
                      <span>UNLOCK · {skin.cost.toLocaleString()} COINS</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
