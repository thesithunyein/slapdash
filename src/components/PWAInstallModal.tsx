import React from 'react';
import { usePWAInstall } from '../game/usePWAInstall.ts';
import { sounds } from '../game/SoundEngine.ts';
import { Download, Star, Award, ShieldCheck, X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sounds.playClick();
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-[#181A24] border-3 sm:border-4 border-black shadow-[6px_6px_0px_#000000] flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn">
        {/* Banner Graphic Header */}
        <div className="relative h-28 sm:h-36 w-full overflow-hidden border-b-3 border-black bg-black">
          <img
            src="/src/assets/images/app_store_banner_1792417490868.jpg"
            alt="SlapDash Promotional Art"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181A24] via-transparent to-black/30" />

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/75 hover:bg-[#EF4444] text-white border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* App Store Card Body */}
        <div className="p-4 pt-2 overflow-y-auto space-y-3.5">
          {/* App Header with 3D Icon & Store Metadata */}
          <div className="flex items-start gap-3">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden border-3 border-black shadow-[3px_3px_0px_#000000]">
              <img
                src="/src/assets/images/app_store_icon_1792417490923.jpg"
                alt="SlapDash App Icon"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wide truncate">
                SlapDash
              </h2>
              <p className="text-[8px] sm:text-[9px] text-[#94A3B8] font-pixel truncate">
                Market Chaos Runner 3D
              </p>

              {/* App Store Stats Pill Strip */}
              <div className="flex items-center gap-2 mt-1.5 text-[7px] sm:text-[8px] font-pixel text-[#CBD5E1]">
                <span className="flex items-center gap-0.5 text-[#F6C445]">
                  <Star className="w-3 h-3 fill-[#F6C445]" />
                  <span>4.9</span>
                </span>
                <span className="text-[#64748B]">·</span>
                <span className="text-[#38BDF8]">#1 RUNNER</span>
                <span className="text-[#64748B]">·</span>
                <span>9+ AGE</span>
              </div>
            </div>
          </div>

          {/* App Features List */}
          <div className="bg-[#0B0F19] border-2 border-black p-3 space-y-2 text-[8px] sm:text-[9px] font-pixel text-[#CBD5E1]">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Full-screen 60 FPS Native Performance</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Offline Ready — Play Anytime Without Wi-Fi</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Zero App Store Ads & Instant Home Screen Launch</span>
            </div>
          </div>

          {/* iOS Safari Instructions or Direct Install Button */}
          {isInstalled ? (
            <div className="py-2.5 px-3 bg-[#10B981]/20 border-2 border-[#10B981] text-[#10B981] font-pixel text-xs flex items-center justify-center gap-2 text-center">
              <CheckCircle className="w-4 h-4" />
              <span>APP ALREADY INSTALLED ON YOUR DEVICE!</span>
            </div>
          ) : isIOS ? (
            <div className="p-3 bg-[#0F172A] border-2 border-black space-y-2 text-[8px] sm:text-[9px] font-pixel text-[#94A3B8]">
              <div className="flex items-center gap-1.5 text-[#F6C445] font-bold">
                <Smartphone className="w-4 h-4" />
                <span>INSTALL ON IPHONE / IPAD:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-white">
                <li>
                  Tap the Safari <strong className="text-[#38BDF8]">Share</strong> button <Share className="w-3 h-3 inline mx-0.5" />
                </li>
                <li>
                  Scroll down and tap <strong className="text-[#F6C445]">Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline mx-0.5" />
                </li>
                <li>Launch SlapDash directly from your home screen!</li>
              </ol>
            </div>
          ) : isInstallable ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-3 bg-[#38BDF8] hover:bg-[#0284C7] text-black border-3 border-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none font-pixel text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-none"
            >
              <Download className="w-4 h-4" />
              <span>INSTALL TO HOME SCREEN</span>
            </button>
          ) : (
            <div className="p-3 bg-[#0B0F19] border-2 border-black text-center space-y-1 font-pixel text-[8px] text-[#94A3B8]">
              <p className="text-white">To install on desktop or mobile:</p>
              <p>Click your browser address bar's install icon or menu to pin SlapDash.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0B0F19] border-t-2 border-black p-2.5 text-center font-pixel text-[7px] text-[#64748B]">
          OFFICIAL DIGIT7 ARCADE JAM RELEASE · VERSION 2.0 PREMIUM
        </div>
      </div>
    </div>
  );
};
