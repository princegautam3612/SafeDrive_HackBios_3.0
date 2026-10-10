import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertOctagon, PhoneCall, MessageSquare, ShieldAlert,
  MapPin, Check, X, BellRing, Share2, HeartPulse, User, Car, Edit3
} from 'lucide-react';
import { AccidentEvent, EmergencyContact, UserProfile, VehicleProfile } from '../../types';
import { accidentDetectionService } from '../../services/accidentDetection';
import { backgroundTelematicsService } from '../../services/backgroundTelematicsService';

interface AccidentCountdownModalProps {
  event: AccidentEvent | null;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  vehicle: VehicleProfile;
  emergencyContact: EmergencyContact;
  onConfirmDispatch?: (event: AccidentEvent) => void;
  onEditEmergencyContact?: () => void;
}

export const AccidentCountdownModal: React.FC<AccidentCountdownModalProps> = ({
  event,
  isOpen,
  onClose,
  userProfile,
  vehicle,
  emergencyContact,
  onConfirmDispatch,
  onEditEmergencyContact,
}) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [smsSentStatus, setSmsSentStatus] = useState<string>('pending');
  const [callStatus, setCallStatus] = useState<string>('pending');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Start siren & countdown on open
  useEffect(() => {
    if (!isOpen || !event) {
      setCountdown(10);
      setIsDispatched(false);
      setSmsSentStatus('pending');
      setCallStatus('pending');
      accidentDetectionService.stopAcousticBeacon();
      return;
    }

    // Trigger haptics and acoustic distress beacon
    accidentDetectionService.startAcousticBeacon();
    backgroundTelematicsService.speakTelematicsAlert('Warning. Crash detected. Emergency dispatch countdown initiated.');

    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500, 200, 800]);
    }

    setCountdown(10);
    setIsDispatched(false);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleExecuteAutoDispatch();
          return 0;
        }
        // Speak countdown warning at 5s and 3s
        if (prev === 5) {
          backgroundTelematicsService.speakTelematicsAlert('Five seconds to automated dispatch.');
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      accidentDetectionService.stopAcousticBeacon();
    };
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleCancelSafe = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    accidentDetectionService.stopAcousticBeacon();
    backgroundTelematicsService.speakTelematicsAlert('Emergency dispatch cancelled.');
    onClose();
  };

  const handleExecuteAutoDispatch = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    accidentDetectionService.stopAcousticBeacon();
    setIsDispatched(true);
    setSmsSentStatus('sent');
    setCallStatus('initiated');

    // 1. Dispatch SMS payload
    await accidentDetectionService.dispatchAutomatedSMS(
      event,
      userProfile,
      vehicle,
      emergencyContact
    );

    // 2. Initiate emergency phone call
    accidentDetectionService.initiateAutomatedCall(emergencyContact.phone);

    // 3. Audio confirmation
    backgroundTelematicsService.speakTelematicsAlert(
      'Automated crash message and emergency call dispatched to contact.'
    );

    if (onConfirmDispatch) {
      onConfirmDispatch({
        ...event,
        status: 'DISPATCHED',
        messageSent: true,
        callInitiated: true,
      });
    }
  };

  const handleCopySMS = () => {
    const text = accidentDetectionService.generateSMSPayload(
      event,
      userProfile,
      vehicle,
      emergencyContact
    );
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const mapsUrl = `https://maps.google.com/?q=${event.latitude.toFixed(6)},${event.longitude.toFixed(6)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 flex flex-col max-h-[92vh] ${
            isDispatched
              ? 'bg-slate-900 border-emerald-500 text-white'
              : 'bg-slate-950 border-rose-600 text-white'
          }`}
        >
          {/* Header */}
          <div className={`p-4 text-center relative overflow-hidden ${
            isDispatched
              ? 'bg-gradient-to-r from-emerald-700 to-teal-800'
              : 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 animate-pulse'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-2 shadow-lg">
              {isDispatched ? (
                <Check className="w-7 h-7 text-white" />
              ) : (
                <AlertOctagon className="w-7 h-7 text-white animate-bounce" />
              )}
            </div>

            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-200 block mb-0.5">
              {isDispatched ? 'DISPATCH PROTOCOL EXECUTED' : 'HIGH-ACCURACY TELEMATICS MODEL'}
            </span>
            <h2 className="text-xl font-black font-['Outfit'] tracking-tight">
              {isDispatched ? 'Emergency Dispatched!' : 'Collision Detected!'}
            </h2>
          </div>

          <div className="p-4 overflow-y-auto space-y-3.5 flex-1 no-scrollbar text-xs">
            {!isDispatched ? (
              <>
                {/* 10-Second Circular Countdown */}
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-center relative">
                  <div className="text-[11px] font-mono uppercase text-rose-300 font-bold mb-2">
                    Automated SOS Message &amp; Call Trigger
                  </div>

                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-rose-900/50 stroke-current"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-rose-500 stroke-current transition-all duration-1000 ease-linear"
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * countdown) / 10}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black font-mono text-white leading-none">
                        {countdown}
                      </span>
                      <span className="text-[9px] font-mono text-rose-300 uppercase">seconds</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-rose-200/90 mt-2 font-mono">
                    Auto-sending coordinates &amp; dialling ICE in <strong className="text-white font-bold">{countdown}s</strong>
                  </p>
                </div>

                {/* Crash Kinematics Analysis Badge */}
                <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Impact Deceleration:</span>
                    <strong className="text-rose-400 font-bold text-sm">{event.impactG}G</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Model Confidence:</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/40">
                      {event.confidenceScore}% • {event.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Pre-Impact Speed:</span>
                    <strong className="text-slate-200">{event.preCrashSpeedKmH} km/h</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Angular Spin:</span>
                    <span className="text-amber-300">{event.gyroRateDegSec}°/s</span>
                  </div>
                </div>

                {/* Dispatch Target Details */}
                <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <div className="flex items-center gap-2 truncate">
                      <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        ICE Recipient: <strong className="text-white">{emergencyContact.name || 'Emergency Helpline'}</strong> {emergencyContact.phone ? `(${emergencyContact.phone})` : '(112)'}
                      </span>
                    </div>
                    {onEditEmergencyContact && (
                      <button
                        onClick={onEditEmergencyContact}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-bold underline shrink-0 cursor-pointer flex items-center gap-0.5 ml-1"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <Car className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Vehicle: <strong className="text-white">{vehicle.model}</strong> ({vehicle.registrationNumber})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">GPS: {event.latitude.toFixed(5)}°N, {event.longitude.toFixed(5)}°E</span>
                  </div>
                </div>
              </>
            ) : (
              /* Dispatched Confirmation Screen */
              <div className="space-y-3.5 font-mono">
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Check className="w-4 h-4" />
                    <span>Automated Message &amp; Call Dispatched!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed font-sans">
                    SMS payload containing your GPS link, vehicle details, impact severity ({event.impactG}G), and blood group has been sent to <strong className="text-white">{emergencyContact.name} ({emergencyContact.phone})</strong>.
                  </p>
                </div>

                {/* Direct Action Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${emergencyContact.phone.replace(/[^\d+]/g, '')}`}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center flex flex-col items-center gap-1 transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span className="text-[10px]">Call ICE Contact</span>
                  </a>

                  <a
                    href="tel:112"
                    className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-center flex flex-col items-center gap-1 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px]">Call 112 Helpline</span>
                  </a>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopySMS}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Alert!</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Copy SMS Text</span>
                      </>
                    )}
                  </button>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Open Maps Pin</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-2">
            {!isDispatched ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCancelSafe}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>I AM OK (CANCEL)</span>
                </button>

                <button
                  onClick={handleExecuteAutoDispatch}
                  className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer animate-pulse"
                >
                  <BellRing className="w-4 h-4" />
                  <span>SEND NOW</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase font-mono tracking-wider transition-all cursor-pointer"
              >
                Close Emergency Dashboard
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
