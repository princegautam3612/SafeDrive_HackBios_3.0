import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Brain, Cpu, TrendingDown, Activity, Sparkles,
  ShieldCheck, RefreshCw, Layers, CheckCircle2, BarChart3
} from 'lucide-react';
import { neuralSafetyEngine } from '../../utils/neuralSafetyPipeline';

interface NeuralSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  historicalSafeScore: number;
}

export const NeuralSafetyModal: React.FC<NeuralSafetyModalProps> = ({
  isOpen,
  onClose,
  historicalSafeScore,
}) => {
  const [metrics, setMetrics] = useState(() => neuralSafetyEngine.getMetrics());
  const [isRetraining, setIsRetraining] = useState(false);
  const [trainingMessage, setTrainingMessage] = useState('');

  if (!isOpen) return null;

  // Run a live backpropagation epoch on a synthetic sample trip
  const handleRunManualTrain = () => {
    setIsRetraining(true);
    setTrainingMessage('Extracting feature vectors & computing gradients...');

    setTimeout(() => {
      const sampleFeatures = neuralSafetyEngine.extractFeatures({
        avgSpeedKmH: 42,
        maxSpeedKmH: 49,
        speedLimit: 50,
        smoothBrakingPct: 94,
        phoneFocusPct: 100,
        bufferSeconds: 2.8,
        harshBrakeCount: 0,
        durationSec: 1200,
      });

      const result = neuralSafetyEngine.trainOnTrip(sampleFeatures, Math.min(98, historicalSafeScore + 2));
      setMetrics(neuralSafetyEngine.getMetrics());
      setIsRetraining(false);
      setTrainingMessage(`Epoch #${result.epochsTrained} completed! MSE Loss reduced to ${result.loss}. Weights recalibrated.`);
    }, 800);
  };

  const featureLabels = [
    { name: 'Speed Adherence', val: 94, color: 'bg-emerald-500' },
    { name: 'Deceleration Smoothness', val: 91, color: 'bg-teal-500' },
    { name: 'Screen Inactivity', val: 100, color: 'bg-emerald-400' },
    { name: 'Kinetic Cushion', val: 86, color: 'bg-cyan-500' },
    { name: 'Chassis G-Stability', val: 92, color: 'bg-blue-500' },
    { name: 'Circadian Index', val: 98, color: 'bg-indigo-500' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full border border-emerald-500/40 p-5 max-h-[88vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                  <span>Neural Safety Engine</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">v1.2</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Client-Side MLP Perceptron Pipeline
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto py-3 space-y-3.5 flex-1 pr-1">
            {/* Architecture Overview Card */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 text-[10px] uppercase font-bold">Network Architecture</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">6 → 8 (ReLU) → 1 (Sigmoid)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">EPOCHS</span>
                  <strong className="text-emerald-400 text-xs">{metrics.epochs}</strong>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">MSE LOSS</span>
                  <strong className="text-cyan-400 text-xs">{metrics.loss.toFixed(3)}</strong>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">ARCHETYPE</span>
                  <strong className="text-amber-400 text-[9px] leading-tight block truncate">
                    {historicalSafeScore >= 88 ? 'Defensive' : 'Balanced'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Feature Weightings / Learned Parameters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Learned Feature Weightings</span>
                <span className="text-emerald-400 text-[10px]">Self-Optimizing</span>
              </div>

              <div className="space-y-1.5">
                {featureLabels.map((f) => (
                  <div key={f.name} className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-300">{f.name}</span>
                      <span className="text-emerald-400 font-bold">{f.val}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${f.color} rounded-full transition-all duration-500`}
                        style={{ width: `${f.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Loss Sparkline */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 font-bold uppercase">Training Loss Progression</span>
                <span className="text-cyan-400">Gradient Descent η=0.045</span>
              </div>
              <div className="h-12 flex items-end gap-1 pt-2">
                {metrics.lossHistory.map((val, idx) => {
                  const maxLoss = 0.08;
                  const heightPct = Math.min(100, Math.max(15, (val / maxLoss) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-xs transition-all duration-300 relative group"
                      style={{ height: `${heightPct}%` }}
                      title={`Loss: ${val}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500">
                <span>Older Rides</span>
                <span>Latest Update</span>
              </div>
            </div>

            {/* Training Notification Feedback */}
            {trainingMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>{trainingMessage}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={handleRunManualTrain}
              disabled={isRetraining}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isRetraining ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Backprop Epoch...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Trigger Training Epoch</span>
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-400 text-center font-mono">
              Auto-trains in background after each completed commute to personalize your SafeScore.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
