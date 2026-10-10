import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, AlertTriangle, PhoneCall, Share2, MapPin, ShieldAlert,
  Volume2, VolumeX, Flame, HeartHandshake, Check, Radio, Edit3
} from 'lucide-react';
import { EmergencyContact } from '../../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: { latitude: number; longitude: number; accuracy: number } | null;
  emergencyContact: EmergencyContact;
  onEditEmergencyContact?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  currentCoords,
  emergencyContact,
  onEditEmergencyContact,
}) => {
  const [sirenActive, setSirenActive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio siren synthesizer via Web Audio API
  useEffect(() => {
    if (!sirenActive) return;

    // Trigger haptic vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([400, 150, 400, 150, 400]);
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      const interval = setInterval(() => {
        if (ctx.state === 'running') {
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.3);
          osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);
        }
      }, 600);

      return () => {
        clearInterval(interval);
        try {
          osc.stop();
          ctx.close();
        } catch {
          // ignore cleanup errors
        }
      };
    } catch {
      // AudioContext unavailable or blocked
    }
  }, [sirenActive]);

  if (!isOpen) return null;

  const lat = currentCoords?.latitude ?? 28.6139;
  const lng = currentCoords?.longitude ?? 77.2090;
  const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

  const handleShareLocation = async () => {
    const text = `EMERGENCY ALERT: SafeDrive rider needs assistance. Live GPS Location: ${mapsUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SafeDrive Emergency Location',
          text,
          url: mapsUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border ${
            sirenActive ? 'bg-rose-950 border-rose-500 animate-pulse text-white' : 'bg-white border-rose-200 text-slate-900'
          } max-h-[92vh] flex flex-col`}
        >
          {/* Header */}
          <div className="p-5 pb-3 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-600 to-red-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-90 block">
                  SAFEDRIVE EMERGENCY TOOLKIT
                </span>
                <h2 className="text-base font-black font-['Outfit'] leading-tight">
                  Emergency Assistance &amp; SOS
                </h2>
              </div>
            </div>

            <button
              onClick={() => {
                setSirenActive(false);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Live GPS Coordinates Card */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-rose-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    Current GPS Location
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Accuracy ±{currentCoords ? Math.round(currentCoords.accuracy) : 8}m
                </span>
              </div>

              <div className="font-mono text-xs font-bold text-slate-900">
                {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
              </div>

              <button
                onClick={handleShareLocation}
                className="mt-2.5 w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-rose-600/30"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Location Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Live GPS Pin</span>
                  </>
                )}
              </button>
            </div>

            {/* Siren / Hazard Strobe Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Acoustic Siren &amp; Hazard Flash</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Emit audio beacon to alert surrounding motorists
                </p>
              </div>

              <button
                onClick={() => setSirenActive(!sirenActive)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  sirenActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 animate-pulse'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {sirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{sirenActive ? 'STOP SIREN' : 'SOUND SIREN'}</span>
              </button>
            </div>

            {/* Emergency Speed Dials */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1-Tap Instant Emergency Dials
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 112 National */}
                <a
                  href="tel:112"
                  className="p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-slate-900 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold group-hover:text-red-700">112 Helpline</div>
                    <div className="text-[10px] text-slate-500">All-in-One SOS</div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-red-600" />
                </a>

                {/* 108 Ambulance */}
                <a
                  href="tel:108"
                  className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-slate-900 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold group-hover:text-emerald-700">108 Ambulance</div>
                    <div className="text-[10px] text-slate-500">Medical Rapid</div>
                  </div>
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                </a>

                {/* 100 Police */}
                <a
                  href="tel:100"
                  className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-slate-900 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold group-hover:text-blue-700">100 Police</div>
                    <div className="text-[10px] text-slate-500">Highway Patrol</div>
                  </div>
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                </a>

                {/* 1033 Highway Helpline */}
                <a
                  href="tel:1033"
                  className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-slate-900 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold group-hover:text-amber-700">1033 NHAI</div>
                    <div className="text-[10px] text-slate-500">Highway Tow/SOS</div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                </a>
              </div>
            </div>

            {/* In Case of Emergency (ICE) Contact */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Your Designated ICE Family Contact
                </span>
                {onEditEmergencyContact && (
                  <button
                    onClick={() => {
                      setSirenActive(false);
                      onEditEmergencyContact();
                    }}
                    className="text-[10px] font-mono text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit ICE</span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {emergencyContact.name || 'No Contact Details Configured'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {emergencyContact.phone ? `${emergencyContact.relationship || 'Contact'} • ${emergencyContact.phone}` : 'Tap Edit to enter contact details'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {emergencyContact.phone ? (
                    <a
                      href={`tel:${emergencyContact.phone.replace(/[^\d+]/g, '')}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call ICE</span>
                    </a>
                  ) : (
                    onEditEmergencyContact && (
                      <button
                        onClick={() => {
                          setSirenActive(false);
                          onEditEmergencyContact();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        <span>Add Details</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => {
                setSirenActive(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase font-mono tracking-wider transition-colors cursor-pointer"
            >
              Close Toolkit
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
