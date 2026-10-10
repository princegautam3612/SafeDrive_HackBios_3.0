import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share,
  PlusSquare,
  Smartphone,
  ExternalLink,
  Maximize,
  CheckCircle2,
  X,
  Sparkles,
  Monitor,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall,
}) => {
  const [activeOsTab, setActiveOsTab] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Detect OS for default tab
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    if (/android/i.test(userAgent)) {
      setActiveOsTab('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setActiveOsTab('ios');
    } else {
      setActiveOsTab('desktop');
    }
  }, []);

  if (!isOpen) return null;

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleOpenDirect = () => {
    // Open the direct standalone URL outside iframe
    window.open(window.location.href, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-slate-200 text-slate-900 flex flex-col max-h-[90dvh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white p-5 relative overflow-hidden shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-900/40">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 block mb-0.5">
                    STANDALONE WEB APP
                  </span>
                  <h2 className="text-lg font-black text-white font-['Outfit'] leading-tight">
                    Download &amp; Install SafeDrive
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-emerald-100/90 mt-2.5 leading-relaxed">
              Install SafeDrive as a standalone home-screen app to remove browser search bars, address bars, and preview tools.
            </p>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar">
            {/* Quick 1-Tap Action if Browser Prompt is Available */}
            {deferredPrompt ? (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900 font-['Outfit']">
                    1-Click Direct Install Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-3">
                  Your browser supports instant web app installation. Click below to add SafeDrive to your device.
                </p>
                <button
                  onClick={() => {
                    onTriggerInstall();
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install SafeDrive App Now</span>
                </button>
              </div>
            ) : null}

            {/* Platform Selector Tabs */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Choose Your Device Guide:
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveOsTab('ios')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeOsTab === 'ios'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iOS Safari</span>
                </button>
                <button
                  onClick={() => setActiveOsTab('android')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeOsTab === 'android'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
                <button
                  onClick={() => setActiveOsTab('desktop')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeOsTab === 'desktop'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              {activeOsTab === 'ios' && (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-['Outfit']">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">
                      iOS
                    </span>
                    <span>How to install on iPhone &amp; iPad:</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Share className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">1. Tap the Share Button</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          In Safari browser at the bottom of the screen, tap the <strong>Share icon</strong> (box with an arrow pointing up).
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <PlusSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">2. Tap &quot;Add to Home Screen&quot;</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Scroll down the share sheet and tap <strong>Add to Home Screen</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">3. Tap &quot;Add&quot; in Top-Right</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          SafeDrive appears on your Home Screen as an independent native app without any browser URL bars!
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeOsTab === 'android' && (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-['Outfit']">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">
                      AND
                    </span>
                    <span>How to install on Android (Chrome/Firefox/Samsung):</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        ⋮
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">1. Tap the 3 Dots Menu</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          In Chrome at the top right, tap the <strong>3 vertical dots (⋮)</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">2. Tap &quot;Install App&quot; or &quot;Add to Home screen&quot;</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Confirm the install prompt to place SafeDrive in your app drawer and home screen.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeOsTab === 'desktop' && (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-['Outfit']">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">
                      PC
                    </span>
                    <span>How to install on Mac / Windows / Chromebook:</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">1. Look for the Install Icon in Address Bar</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          In Google Chrome, Edge, or Brave, click the <strong>Install SafeDrive</strong> icon in the right side of the address bar.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">2. Runs as a Dedicated Desktop Window</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          SafeDrive opens in its own window without browser tabs, bookmarks, or preview headers.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Direct Open & Fullscreen Tools */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Instant Clean View Options:
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleOpenDirect}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Open in New Tab</span>
                </button>

                <button
                  onClick={handleToggleFullscreen}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Maximize className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
