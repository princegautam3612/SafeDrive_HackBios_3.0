import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Award, Zap, Leaf, CheckCircle2, ShieldCheck,
  Smartphone, ArrowRight, Gauge, Clock, MapPin, Calculator,
  Cpu, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TripRecord } from '../../types';

interface TripSummaryModalProps {
  trip: TripRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRewardAlgorithm?: () => void;
}

export const TripSummaryModal: React.FC<TripSummaryModalProps> = ({
  trip,
  isOpen,
  onClose,
  onOpenRewardAlgorithm,
}) => {
  useEffect(() => {
    if (isOpen && trip) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
      });
    }
  }, [isOpen, trip]);

  if (!isOpen || !trip) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 25 }}
          className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full border border-emerald-200 flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 p-6 text-white text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 block mb-1">
              TELEMATICS VERIFIED &amp; CERTIFIED
            </span>
            <h2 className="text-xl font-black font-['Outfit'] tracking-tight">
              Safe Commute Completed!
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1">
              Your physical kinetic riding has been telematics verified and logged
            </p>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 flex-1 no-scrollbar">
            {/* Score & Riding Style Callout */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-center">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Trip SafeScore
                </span>
                <div className="text-3xl font-black text-emerald-800 font-mono">
                  {trip.score}
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600">
                  Out of 100
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-center flex flex-col justify-center">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Riding Style
                </span>
                <div className="text-base font-bold text-slate-900 font-['Outfit'] truncate">
                  {trip.driverArchetype || 'Defensive'}
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                  Two-Wheeler Verified
                </span>
              </div>
            </div>

            {/* Trip Detailed Telematics Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Verified Kinetic Metrics
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Distance</span>
                    <span className="font-bold text-slate-900 font-mono">{trip.distanceKm.toFixed(2)} KM</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Duration</span>
                    <span className="font-bold text-slate-900 font-mono">{formatDuration(trip.durationSec)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Avg / Max Speed</span>
                    <span className="font-bold text-slate-900 font-mono">{trip.avgSpeedKmH} / {trip.maxSpeedKmH} km/h</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">CO2 Saved</span>
                    <span className="font-bold text-emerald-700 font-mono">{trip.co2SavedKg.toFixed(2)} kg</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="font-medium">Phone Distraction:</span>
                </div>
                <span className="font-bold font-mono text-emerald-700">
                  {trip.phoneFocusPct}% Focus Clean
                </span>
              </div>

              {trip.autoDetected && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-cyan-800">
                  <span>Detection Trigger:</span>
                  <span className="font-bold bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded">
                    Auto-Detected In Background
                  </span>
                </div>
              )}
            </div>

            {/* Safe Driving Verified Feedback */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Safe Ride Verified &amp; Recorded</span>
              </div>
              <p className="text-[10px] text-emerald-700 leading-normal">
                Your clean driving telemetry has been validated and saved to your two-wheeler driver profile.
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <span>Return to Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
