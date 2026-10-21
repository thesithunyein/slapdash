import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share, CheckCircle2, Sparkles, ShieldCheck, Chrome, Compass } from 'lucide-react';
import { sounds } from '../game/SoundEngine.ts';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sounds.playStart();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md select-none animate-fadeIn font-['Fredoka']">
      <div className="relative w-full max-w-lg flex flex-col bg-gradient-to-b from-[#2A1E14] via-[#1E1712] to-[#140F0C] border-3 border-[#F97316] shadow-[0_12px_36px_rgba(0,0,0,0.85)] rounded-3xl text-[#FFF8E7] overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-[#19110B] border-b-2 border-[#F97316]/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#10B981] to-[#047857] text-white flex items-center justify-center border-2 border-white/40 rounded-2xl shadow-md">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Lilita_One'] text-xl sm:text-2xl font-bold text-[#FEF08A] tracking-wider">
                  INSTALL APP
                </h2>
                <span className="text-[10px] font-['Lilita_One'] bg-[#10B981] text-white px-2 py-0.5 rounded-full border border-white/40">
                  PWA READY
                </span>
              </div>
              <span className="text-xs text-[#FED7AA] font-medium block">
                Instant loading, offline play & fullscreen 60FPS
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center bg-[#EF4444] hover:bg-[#F87171] text-white border-2 border-white/40 shadow-md active:scale-95 rounded-2xl cursor-pointer transition-all"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* App Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-[#25180E] rounded-2xl border border-white/10">
            <img
              src="/apple-touch-icon.png"
              alt="Partysaur"
              className="w-16 h-16 rounded-2xl shadow-md border-2 border-[#F97316] object-cover"
              onError={(e) => {
                // fallback if image not present
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex-1">
              <h3 className="font-['Lilita_One'] text-base text-white">
                PARTYSAUR: Dino Mayhem
              </h3>
              <p className="text-xs text-[#FED7AA]/80">
                Action-packed 3D dinosaur runner with zero lag
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#10B981] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> No App Store Download Required
                </span>
              </div>
            </div>
          </div>

          {/* Direct Install Button if supported */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-['Lilita_One'] text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg border-2 border-white/30 cursor-pointer active:scale-95 transition-all animate-pulse"
            >
              <Download className="w-5 h-5" />
              <span>ADD TO HOME SCREEN NOW</span>
            </button>
          )}

          {isInstalled && (
            <div className="p-3 bg-[#10B981]/20 border-2 border-[#10B981] rounded-2xl flex items-center gap-2.5 text-[#A7F3D0] text-xs font-['Lilita_One']">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <span>Partysaur is installed! Launch it from your home screen for fullscreen immersion.</span>
            </div>
          )}

          {/* iOS Instructions */}
          <div className="p-3.5 bg-[#1C120B] rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-['Lilita_One'] text-sm text-[#FBBF24] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#FBBF24]" />
              <span>iOS / iPhone / iPad Safari:</span>
            </h4>
            <ol className="text-xs text-[#FED7AA] space-y-1.5 list-decimal list-inside pl-1">
              <li>Tap the <strong className="text-white">Share</strong> icon <Share className="w-3.5 h-3.5 inline mx-0.5 text-[#38BDF8]" /> at the bottom of Safari.</li>
              <li>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</li>
              <li>Tap <strong className="text-white">Add</strong> in the top right corner. Enjoy full-screen dino chaos!</li>
            </ol>
          </div>

          {/* Android / Chrome Instructions */}
          <div className="p-3.5 bg-[#1C120B] rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-['Lilita_One'] text-sm text-[#38BDF8] flex items-center gap-1.5">
              <Chrome className="w-4 h-4 text-[#38BDF8]" />
              <span>Android / Chrome:</span>
            </h4>
            <ol className="text-xs text-[#FED7AA] space-y-1.5 list-decimal list-inside pl-1">
              <li>Tap the <strong className="text-white">Three Dots</strong> menu in Chrome.</li>
              <li>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</li>
              <li>Confirm and launch directly from your app drawer with offline support.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#160E08] border-t border-white/10 text-center text-xs text-[#FED7AA]/80">
          Powered by Progressive Web App Technology
        </div>
      </div>
    </div>
  );
};
