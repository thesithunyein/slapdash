import React from 'react';
import { X, Check, Lock, Compass, Sparkles } from 'lucide-react';
import { GAME_MAPS, MapDefinition } from '../game/maps.ts';
import { sounds } from '../game/SoundEngine.ts';
import { BiomeGraphicPreview } from './BiomeGraphicPreview.tsx';

interface MapSelectModalProps {
  currentMapId: string;
  highestLevel: number;
  onSelectMap: (map: MapDefinition) => void;
  onClose: () => void;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  currentMapId,
  highestLevel,
  onSelectMap,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#181A24] border-4 border-black shadow-[8px_8px_0px_#000000] text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#0F172A] border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#06B6D4] text-black flex items-center justify-center font-pixel text-lg border-2 border-black">
              🗺️
            </div>
            <div>
              <span className="text-[9px] font-pixel text-[#38BDF8] uppercase tracking-wider block">
                3D VOXEL WORLDS
              </span>
              <h2 className="font-pixel text-base sm:text-lg font-bold text-white tracking-wide">
                SELECT MAP & BIOME
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

        {/* Subheader */}
        <div className="px-4 py-2 bg-[#1E293B] border-b-2 border-black text-xs font-pixel flex items-center justify-between text-[#94A3B8]">
          <span>6 UNIQUE THEMED RUNNING ENVIRONMENTS WITH CUSTOM 3D PROPS & WEATHER</span>
          <span className="text-[#38BDF8] font-bold">LV. {highestLevel} RUNNER</span>
        </div>

        {/* Maps Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#131620]">
          {GAME_MAPS.map((map) => {
            const isUnlocked = highestLevel >= map.unlockLevel;
            const isSelected = map.id === currentMapId;

            return (
              <div
                key={map.id}
                className={`relative flex flex-col justify-between p-4 border-3 border-black transition-none ${
                  isSelected
                    ? 'bg-[#1E293B] border-[#06B6D4] shadow-[4px_4px_0px_#06B6D4]'
                    : isUnlocked
                    ? 'bg-[#1E293B] hover:border-white shadow-[4px_4px_0px_#000000]'
                    : 'bg-[#0F172A]/70 opacity-60 border-dashed'
                }`}
              >
                {/* Real Themed Map Graphic Preview */}
                <div className="relative w-full mb-3 overflow-hidden border-2 border-black group">
                  <BiomeGraphicPreview
                    mapId={map.id}
                    className={`h-28 sm:h-32 transition-transform duration-300 ${
                      !isUnlocked ? 'grayscale contrast-125 opacity-40' : 'group-hover:scale-[1.02]'
                    }`}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center">
                      <Lock className="w-6 h-6 text-[#EF4444] mb-1" />
                      <span className="font-pixel text-[9px] text-white font-bold bg-[#EF4444] px-2 py-0.5 border border-black">
                        LOCKED · REACH LV. {map.unlockLevel}
                      </span>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#06B6D4] text-black text-[8px] font-pixel font-bold px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>SELECTED BIOME</span>
                    </div>
                  )}
                </div>

                {/* Map Info */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-pixel text-sm font-bold text-white flex items-center gap-2">
                      <span>{map.name}</span>
                      {isSelected && (
                        <span className="text-[8px] bg-[#06B6D4] text-black px-1.5 py-0.5 border border-black font-bold">
                          ACTIVE
                        </span>
                      )}
                    </h3>

                    <span
                      className="text-[8px] font-pixel px-2 py-0.5 border border-black font-bold uppercase"
                      style={{ backgroundColor: map.badgeColor, color: '#000000' }}
                    >
                      {map.propType} PROPS
                    </span>
                  </div>

                  <span className="text-[9px] font-pixel text-[#FDE047] block mb-1">
                    {map.theme}
                  </span>
                  <p className="text-[9px] font-pixel text-[#94A3B8] leading-relaxed mb-3">
                    {map.tagline}
                  </p>

                  {/* Weather badge */}
                  {map.weatherEffect && map.weatherEffect !== 'none' && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/60 border border-black text-[8px] font-pixel text-[#38BDF8] mb-3">
                      <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                      <span className="uppercase">ATMOSPHERE: {map.weatherEffect.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="flex items-center justify-between pt-3 border-t border-black/40 mt-2">
                  {isUnlocked ? (
                    <span className="font-pixel text-[9px] text-[#10B981]">
                      UNLOCKED (LV. {map.unlockLevel}+)
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[9px] font-pixel text-[#EF4444]">
                      <Lock className="w-3 h-3" />
                      <span>UNLOCKS AT LEVEL {map.unlockLevel}</span>
                    </div>
                  )}

                  {isUnlocked && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onSelectMap(map);
                      }}
                      disabled={isSelected}
                      className={`px-3 py-1.5 font-pixel text-[10px] font-bold border-2 border-black flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#06B6D4] text-black cursor-default'
                          : 'bg-[#10B981] hover:bg-[#059669] text-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>SELECTED</span>
                        </>
                      ) : (
                        <span>SELECT MAP</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0F172A] border-t-4 border-black flex items-center justify-between text-[9px] font-pixel text-[#94A3B8]">
          <span>LEVEL UP IN STAGE OR ENDLESS RUN TO UNLOCK ALL 6 WORLDS</span>
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
