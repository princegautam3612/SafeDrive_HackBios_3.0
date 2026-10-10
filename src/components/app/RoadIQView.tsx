import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, User, ShieldCheck, MapPin, ArrowRight, CheckCircle2,
  HelpCircle, Sparkles, Award, RotateCcw, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ROAD_IQ_QUESTIONS, ROAD_IQ_PILLARS } from '../../data/mockData';

interface RoadIQViewProps {
  onCompleteInitiation: () => void;
  onClose: () => void;
}

export const RoadIQView: React.FC<RoadIQViewProps> = ({ onCompleteInitiation, onClose }) => {
  const [currentStep, setCurrentStep] = useState<'lessons' | 'quiz' | 'oath_celebrate'>('lessons');
  const [pillarIndex, setPillarIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(1);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(true);
  const [oathSigned, setOathSigned] = useState(false);

  const activePillar = ROAD_IQ_PILLARS[pillarIndex];
  const question = ROAD_IQ_QUESTIONS[0];

  const handleNextPillar = () => {
    if (pillarIndex < ROAD_IQ_PILLARS.length - 1) {
      setPillarIndex(pillarIndex + 1);
    } else {
      setCurrentStep('quiz');
    }
  };

  const handleFinishInitiation = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
    setOathSigned(true);
    setCurrentStep('oath_celebrate');
    onCompleteInitiation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col min-h-full pb-8 px-5 pt-3 bg-white text-slate-900 max-w-md mx-auto relative"
    >
      {/* Top Bar with Progress */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Line */}
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{
              width:
                currentStep === 'lessons'
                  ? `${((pillarIndex + 1) / ROAD_IQ_PILLARS.length) * 45}%`
                  : currentStep === 'quiz'
                  ? '85%'
                  : '100%'
            }}
          />
        </div>

        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'lessons' ? (
          <motion.div
            key="lessons-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>LEVEL 0: INITIATION</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-1.5 font-['Outfit']">
                Master the Road IQ
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Before you join a <strong className="text-emerald-700 font-bold">Squad</strong>, you must master the 3 Pillars of Two-Wheeler Safety. Knowledge is the foundation of defensive commuting.
              </p>
            </div>

            {/* Rule Cards Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-['Outfit']">The Rule Cards</h3>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider">
                {ROAD_IQ_PILLARS.length - pillarIndex} LESSONS LEFT
              </span>
            </div>

            {/* Pillar Card */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-xs p-4 space-y-4">
              {/* Telematics HUD Road Visual */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-800">
                <img
                  src={activePillar.image}
                  alt={activePillar.title}
                  className="w-full h-full object-cover opacity-75"
                />

                {/* HUD Augmented Reality Overlay Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between text-[9px] font-mono text-emerald-300 font-bold">
                    <span>{activePillar.hudTag}</span>
                    <span className="text-slate-300">BIKE 1: 60 KM/H | SAFE DISTANCE: 92%</span>
                  </div>

                  {/* AR Corridor Guide */}
                  <div className="self-center flex flex-col items-center">
                    <div className="w-16 h-8 border-b-2 border-emerald-400/80 border-dashed mb-1" />
                    <span className="px-2 py-0.5 rounded bg-slate-950/90 text-emerald-300 font-mono text-[8px] font-black tracking-widest border border-emerald-500/40">
                      SAFE DISTANCE 2.4S
                    </span>
                  </div>

                  <span className="self-start px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-xs">
                    {activePillar.badge}
                  </span>
                </div>
              </div>

              {/* Pin Icon & Pillar Title */}
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4 fill-current" />
                </div>

                <h2 className="text-base font-black text-slate-900 tracking-tight font-['Outfit']">
                  {activePillar.title}
                </h2>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {activePillar.subtitle}
                </p>

                <p className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed shadow-xs">
                  {activePillar.detail}
                </p>
              </div>

              {/* Next Pillar Button */}
              <button
                onClick={handleNextPillar}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>{pillarIndex < ROAD_IQ_PILLARS.length - 1 ? 'NEXT PILLAR' : 'ENTER CHALLENGE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Button: Driver's Oath */}
            <button
              onClick={() => setCurrentStep('quiz')}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-xs uppercase font-['Outfit'] tracking-wider"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Take the Driver&apos;s Oath</span>
            </button>

            <p className="text-center text-[10px] text-slate-500 font-mono">
              By joining, you agree to the Kinetic Code of Conduct
            </p>
          </motion.div>
        ) : currentStep === 'quiz' ? (
          <motion.div
            key="quiz-step"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {/* Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>FINAL CHALLENGE</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-1 font-['Outfit']">
                Road IQ Challenge
              </h1>
              <p className="text-xs text-slate-600">
                Prove your mastery to join the squad.
              </p>
            </div>

            {/* Quiz Question Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 leading-snug font-['Outfit']">
                {question.question}
              </h2>

              {/* 4 Interactive Options */}
              <div className="space-y-2">
                {question.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === question.correctIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOption(idx);
                        setHasSubmittedAnswer(true);
                      }}
                      className={`w-full p-3 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer border ${
                        isSelected
                          ? isCorrect
                            ? 'border-emerald-500 bg-emerald-50 text-slate-900 shadow-xs'
                            : 'border-rose-300 bg-rose-50 text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {hasSubmittedAnswer && (
                <div className="bg-white rounded-xl p-3.5 border border-emerald-200 flex items-start gap-2.5 shadow-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Button */}
            <button
              onClick={handleFinishInitiation}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-xs uppercase font-['Outfit'] tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish Initiation</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="celebrate-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4 bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-xs text-slate-900"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                INITIATION COMPLETE
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1 font-['Outfit']">
                Welcome to The Urban Guardians
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You’ve officially unlocked the full Two-Wheeler Telematics Engine and Squad Leaderboard.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-emerald-200 text-left space-y-1 font-mono text-xs shadow-xs">
              <div className="font-bold text-emerald-700">✔ Level 0 Verified Safe Rider</div>
              <div className="text-slate-600">✔ Defensive Riding Baseline Established</div>
              <div className="text-slate-600">✔ Two-Wheeler Telematics Pipeline Activated</div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Go to Squad Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

