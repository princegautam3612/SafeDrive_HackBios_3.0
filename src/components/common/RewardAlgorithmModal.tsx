import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles, Award, Calculator, ShieldCheck, Zap,
  AlertTriangle, Smartphone, Leaf, Sliders, CheckCircle,
  HelpCircle, TrendingUp, Info, ChevronRight, RefreshCw
} from 'lucide-react';
import {
  SafeDriveRewardAlgorithm,
  RewardCalculationInput,
  RewardCalculationResult
} from '../../utils/rewardAlgorithm';

interface RewardAlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
  userHistoricalSafeScore?: number;
}

export const RewardAlgorithmModal: React.FC<RewardAlgorithmModalProps> = ({
  isOpen,
  onClose,
  userHistoricalSafeScore = 88,
}) => {
  // Simulator input parameters
  const [distanceKm, setDistanceKm] = useState<number>(5.0);
  const [safeScore, setSafeScore] = useState<number>(userHistoricalSafeScore);
  const [speedAdherencePct, setSpeedAdherencePct] = useState<number>(96);
  const [harshBrakes, setHarshBrakes] = useState<number>(0);
  const [phoneDistractions, setPhoneDistractions] = useState<number>(0);
  const [fuelType, setFuelType] = useState<'Petrol' | 'EV'>('Petrol');
  const [isNight, setIsNight] = useState<boolean>(false);

  // Derive driver archetype based on neural score
  const driverArchetype: RewardCalculationInput['driverArchetype'] = useMemo(() => {
    if (safeScore >= 92) return 'Ultra-Defensive';
    if (safeScore >= 80) return 'Balanced Commuter';
    if (safeScore >= 68) return 'Dynamic Rider';
    return 'Aggressive Risk';
  }, [safeScore]);

  // Run the SafeDrive Reward Algorithm
  const calculation: RewardCalculationResult = useMemo(() => {
    return SafeDriveRewardAlgorithm.calculate({
      distanceKm,
      durationSec: Math.round(distanceKm * 120),
      avgSpeedKmH: 42,
      maxSpeedKmH: speedAdherencePct < 80 ? 68 : 48,
      speedLimit: 50,
      speedAdherencePct,
      smoothBrakingPct: Math.max(50, 100 - harshBrakes * 12),
      harshBrakeCount: harshBrakes,
      phoneFocusPct: Math.max(40, 100 - phoneDistractions * 20),
      phoneDistractionCount: phoneDistractions,
      predictedSafeScore: safeScore,
      driverArchetype,
      vehicleFuelType: fuelType,
      isNightRide: isNight,
    });
  }, [distanceKm, safeScore, speedAdherencePct, harshBrakes, phoneDistractions, fuelType, isNight, driverArchetype]);

  const applyPreset = (preset: 'flawless' | 'highway' | 'rush' | 'evNight') => {
    if (preset === 'flawless') {
      setDistanceKm(6.4);
      setSafeScore(94);
      setSpeedAdherencePct(98);
      setHarshBrakes(0);
      setPhoneDistractions(0);
      setFuelType('Petrol');
      setIsNight(false);
    } else if (preset === 'highway') {
      setDistanceKm(14.0);
      setSafeScore(86);
      setSpeedAdherencePct(92);
      setHarshBrakes(1);
      setPhoneDistractions(0);
      setFuelType('Petrol');
      setIsNight(false);
    } else if (preset === 'rush') {
      setDistanceKm(4.2);
      setSafeScore(64);
      setSpeedAdherencePct(68);
      setHarshBrakes(3);
      setPhoneDistractions(2);
      setFuelType('Petrol');
      setIsNight(false);
    } else if (preset === 'evNight') {
      setDistanceKm(8.5);
      setSafeScore(91);
      setSpeedAdherencePct(96);
      setHarshBrakes(0);
      setPhoneDistractions(0);
      setFuelType('EV');
      setIsNight(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-lg max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold font-['Outfit']">
                  SafePoints &amp; Scoring Guide
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                  Points Simulator
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                See how clean driving habits boost your SafePoints and rewards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Transparent Scoring Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono uppercase font-bold tracking-wider">
              <span>Trip Earnings Formula</span>
              <span className="text-emerald-700 font-bold">12 SafePoints / KM Base</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900 text-xs font-bold leading-relaxed">
              Ride Points = (Distance × Base) × Tier Multiplier + Clean Driving Bonuses − Infraction Deductions
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 pt-1">
              <div className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Speed limit match (+bonus)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Gentle braking (+bonus)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Zero phone distraction</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Safe 2.5s+ vehicle buffer</span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
              Simulate Commute Scenarios:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                onClick={() => applyPreset('flawless')}
                className="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono text-center cursor-pointer transition-colors"
              >
                ★ Flawless Ride (S+)
              </button>
              <button
                onClick={() => applyPreset('highway')}
                className="py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold font-mono text-center cursor-pointer transition-colors"
              >
                🛣️ Highway Cruise
              </button>
              <button
                onClick={() => applyPreset('evNight')}
                className="py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold font-mono text-center cursor-pointer transition-colors"
              >
                ⚡ EV Clean Commute
              </button>
              <button
                onClick={() => applyPreset('rush')}
                className="py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold font-mono text-center cursor-pointer transition-colors"
              >
                ⚠️ Aggressive Rush
              </button>
            </div>
          </div>

          {/* Real-time Result Output Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 border border-slate-700 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Simulated Reward Yield
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    +{calculation.totalPoints}
                  </span>
                  <span className="text-xs font-mono text-slate-300">SafePoints</span>
                  <span className="text-xs font-mono text-amber-400 ml-1">
                    (+{calculation.xpEarned} XP)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Grade</span>
                <span className={`text-xl font-black font-mono px-2.5 py-0.5 rounded-lg inline-block border ${
                  calculation.grade === 'S+'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : calculation.grade === 'A'
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                    : calculation.grade === 'B'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-rose-500/20 border-rose-400 text-rose-300'
                }`}>
                  {calculation.grade}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span>Effective Yield Rate:</span>
              <strong className="text-emerald-400 font-bold">
                {calculation.effectiveRatePerKm} pts / km
              </strong>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug italic bg-slate-950/50 p-2 rounded-xl border border-slate-800">
              "{calculation.summaryNarrative}"
            </p>
          </div>

          {/* Interactive Input Sliders */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-['Outfit']">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Interactive Telematics Inputs</span>
            </div>

            {/* Distance Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-600">Trip Distance:</span>
                <strong className="text-slate-900">{distanceKm} km</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* SafeScore Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-600">Driver SafeScore ({driverArchetype}):</span>
                <strong className="text-emerald-700">{safeScore}/100</strong>
              </div>
              <input
                type="range"
                min="45"
                max="99"
                value={safeScore}
                onChange={(e) => setSafeScore(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Speed Adherence */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-600">Speed Zone Adherence:</span>
                <strong className={speedAdherencePct >= 90 ? 'text-emerald-700' : 'text-rose-600'}>
                  {speedAdherencePct}% in Limit
                </strong>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={speedAdherencePct}
                onChange={(e) => setSpeedAdherencePct(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Harsh Brakes & Phone Distractions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                  Harsh Decelerations
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setHarshBrakes(num)}
                      className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                        harshBrakes === num
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                  Phone Touches
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPhoneDistractions(num)}
                      className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                        phoneDistractions === num
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggles: Fuel Type & Night Corridor */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-mono font-bold text-slate-700">EV Vehicle (+15%)</span>
                <button
                  onClick={() => setFuelType(fuelType === 'EV' ? 'Petrol' : 'EV')}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    fuelType === 'EV' ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    fuelType === 'EV' ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-mono font-bold text-slate-700">Night Risk (+15%)</span>
                <button
                  onClick={() => setIsNight(!isNight)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    isNight ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    isNight ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Factor-by-Factor Reward Breakdown */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
              Reward &amp; Bonus Breakdown:
            </span>
            <div className="space-y-1.5">
              {calculation.factors.map((f) => (
                <div
                  key={f.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-colors ${
                    f.status === 'positive'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : f.status === 'penalty'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold flex items-center gap-1 truncate">
                      <span>{f.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {f.description}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-black ${
                      f.deltaPoints > 0
                        ? 'text-emerald-700'
                        : f.deltaPoints < 0
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }`}>
                      {f.deltaPoints > 0 ? `+${f.deltaPoints}` : f.deltaPoints} pts
                    </div>
                    <span className="text-[9px] text-slate-400 block">{f.formula}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically verified telematics ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
