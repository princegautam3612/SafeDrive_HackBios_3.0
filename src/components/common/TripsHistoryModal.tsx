import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, MapPin, Clock, Gauge, Award, Trophy, ChevronRight,
  Calendar, ShieldCheck, Smartphone, Brain, Zap, ArrowLeft,
  AlertTriangle, CheckCircle2, Leaf
} from 'lucide-react';
import { TripRecord } from '../../types';

interface TripsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripRecord[];
}

export const TripsHistoryModal: React.FC<TripsHistoryModalProps> = ({
  isOpen,
  onClose,
  trips,
}) => {
  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full border border-slate-200 p-5 max-h-[88vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            {selectedTrip ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Trip Telematics Details</h3>
                  <span className="text-[10px] font-mono text-slate-500">{selectedTrip.dateStr}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Trip History &amp; Records</h3>
                  <span className="text-[10px] font-mono text-slate-500">{trips.length} Verified Commutes</span>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body Content */}
          {selectedTrip ? (
            /* Detailed Trip Inspection View */
            <div className="overflow-y-auto py-3 space-y-3 flex-1 pr-1">
              {/* Score Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[9px] font-mono uppercase text-emerald-300 font-bold block">
                    Dynamic Trip SafeScore
                  </span>
                  <div className="text-2xl font-black font-mono mt-0.5">
                    {selectedTrip.score} <span className="text-xs font-normal text-emerald-200">/ 100</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300">
                    {selectedTrip.score >= 90 ? '★ Ultra-Defensive Rating' : '★ Balanced Commuter'}
                  </span>
                </div>

                <div className="text-right">
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 font-mono font-bold text-xs inline-block">
                    Two-Wheeler Verified
                  </div>
                  <span className="text-[9px] font-mono text-emerald-300/80 block mt-1">
                    Telemetry Logged
                  </span>
                </div>
              </div>

              {/* Commute Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Total Distance</span>
                  <span className="text-sm font-black text-slate-800 font-mono">{selectedTrip.distanceKm.toFixed(1)} KM</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Trip Duration</span>
                  <span className="text-sm font-black text-slate-800 font-mono">{formatDuration(selectedTrip.durationSec)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Avg Speed</span>
                  <span className="text-sm font-black text-slate-800 font-mono">{selectedTrip.avgSpeedKmH} km/h</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Peak Speed</span>
                  <span className="text-sm font-black text-slate-800 font-mono">{selectedTrip.maxSpeedKmH} km/h</span>
                </div>
              </div>

              {/* Rule Compliance Telematics Breakdown */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-600 block">
                  Rule &amp; Safety Compliance Telemetry
                </span>

                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Smooth Deceleration:</span>
                    <span className="font-bold text-emerald-700">{selectedTrip.smoothBrakingPct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedTrip.smoothBrakingPct}%` }} />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-600">Phone Focus Discipline:</span>
                    <span className="font-bold text-emerald-700">{selectedTrip.phoneFocusPct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedTrip.phoneFocusPct}%` }} />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-600">CO2 Emissions Abated:</span>
                    <span className="font-bold text-emerald-700">{selectedTrip.co2SavedKg} kg</span>
                  </div>
                </div>
              </div>

              {selectedTrip.autoDetected && (
                <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-[11px] font-mono text-cyan-900 flex items-center justify-between">
                  <span>Ride Trigger:</span>
                  <span className="font-bold text-cyan-800">✓ Auto-Detected (&gt;15 km/h)</span>
                </div>
              )}
            </div>
          ) : (
            /* Trips List View */
            <div className="overflow-y-auto divide-y divide-slate-100 py-1 space-y-1.5 flex-1 my-1 pr-1">
              {trips.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium">No trips recorded yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Start riding past 15 km/h for automatic trip logging!</p>
                </div>
              ) : (
                trips.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTrip(t)}
                    className="pt-2.5 pb-1.5 space-y-1.5 cursor-pointer hover:bg-slate-50 rounded-xl px-2 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-mono text-slate-500">{t.dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {t.autoDetected && (
                          <span className="px-1 py-0.2 rounded bg-cyan-100 text-cyan-800 text-[8px] font-mono font-bold">
                            AUTO
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold">
                          Score: {t.score} ★
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-900 font-mono">
                        {t.distanceKm.toFixed(1)} KM • {formatDuration(t.durationSec)}
                      </div>
                      <div className="font-mono font-bold text-slate-600 flex items-center gap-1 text-[11px]">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Avg {t.avgSpeedKmH} km/h • Max {t.maxSpeedKmH} km/h</span>
                      <span className="text-emerald-600 font-medium">{t.phoneFocusPct}% Focus</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 mt-auto">
            {selectedTrip ? (
              <button
                onClick={() => setSelectedTrip(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider cursor-pointer border border-slate-200 transition-colors"
              >
                Back to All Trips
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider cursor-pointer border border-slate-200 transition-colors"
              >
                Close Trip Log
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
