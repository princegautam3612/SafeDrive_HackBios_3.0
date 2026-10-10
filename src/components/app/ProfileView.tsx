import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Award, Leaf, Zap, Trophy, CheckCircle,
  ChevronRight, Download, Bike, Car, PhoneCall, Volume2,
  VolumeX, Clock, MapPin, HeartHandshake, User, FileCheck,
  Brain, LogOut, Phone, ShieldAlert, Sliders, Check, Edit3, AlertCircle
} from 'lucide-react';
import { EmergencyContact, VehicleProfile, UserProfile, isTwoWheeler } from '../../types';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  points: number;
  xp: number;
  historicalSafeScore: number;
  onOpenRoadIQ: () => void;
  onOpenInstall: () => void;
  onOpenTrips: () => void;
  onOpenSOS: () => void;
  emergencyContact: EmergencyContact;
  onUpdateEmergencyContact: (contact: EmergencyContact) => void;
  onOpenEditICE?: () => void;
  vehicle: VehicleProfile;
  onUpdateVehicle: (vehicle: VehicleProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateUserProfile,
  onLogout,
  points,
  xp,
  historicalSafeScore,
  onOpenRoadIQ,
  onOpenInstall,
  onOpenTrips,
  onOpenSOS,
  emergencyContact,
  onUpdateEmergencyContact,
  onOpenEditICE,
  vehicle,
  onUpdateVehicle,
}) => {
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [showDlDetails, setShowDlDetails] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  const vehicleOptions: VehicleProfile[] = [
    { type: 'motorcycle', model: 'Royal Enfield Hunter 350', registrationNumber: 'DL 01 AB 7890', fuelType: 'Petrol' },
    { type: 'scooter', model: 'Ather 450X Gen 3', registrationNumber: 'KA 03 EV 2049', fuelType: 'EV' },
    { type: 'motorcycle', model: 'Hero Splendor Plus', registrationNumber: 'UP 16 Z 4412', fuelType: 'Petrol' },
    { type: 'car', model: 'Tata Nexon EV Max', registrationNumber: 'MH 02 EV 9110', fuelType: 'EV' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col min-h-full pb-8 px-4 sm:px-5 pt-3 max-w-md mx-auto space-y-3.5 transition-colors font-body"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Driver Profile Header Card */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div className="relative shrink-0">
          <img
            src={userProfile.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
            alt="Profile Avatar"
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
            ★
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-slate-900 font-['Outfit'] truncate">
              {userProfile.name}
            </h1>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium truncate font-mono">
            +91 {userProfile.phone} • {userProfile.driverRole || 'Verified Driver'}
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-mono font-bold">
              Verified Two-Wheeler Commuter
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-mono font-bold">
              SafeScore {historicalSafeScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Verified Driving License Registry Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 border border-slate-700 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                OFFICIAL DRIVING LICENSE (DL)
              </span>
              <h3 className="text-xs font-bold font-mono text-white tracking-wider">
                {userProfile.dlNumber}
              </h3>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold">
            ✓ VERIFIED
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-700/80 flex items-center justify-between">
          <span>Endorsements:</span>
          <span className="text-emerald-300 font-bold">MCWG &amp; LMV</span>
        </div>

        <button
          onClick={() => setShowDlDetails(!showDlDetails)}
          className="w-full py-1.5 text-center text-[10px] font-mono text-slate-400 hover:text-emerald-300 transition-colors underline cursor-pointer"
        >
          {showDlDetails ? 'Hide Registry Certificate ▲' : 'View Full Sarathi Transport Record ▼'}
        </button>

        <AnimatePresence>
          {showDlDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-slate-700 space-y-1.5 text-[10px] font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800"
            >
              <div className="flex justify-between">
                <span className="text-slate-400">License Holder:</span>
                <span className="text-white font-bold">{userProfile.name.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issuing Authority:</span>
                <span className="text-slate-200">{userProfile.dlDetails?.issuingRTO || 'DL-04 West Delhi RTO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date of Issue:</span>
                <span className="text-slate-200">{userProfile.dlDetails?.issueDate || '14-Aug-2018'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Until:</span>
                <span className="text-slate-200">{userProfile.dlDetails?.validUntil || '13-Aug-2038'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blood Group:</span>
                <span className="text-rose-400 font-bold">B+</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      {/* Lifetime Driver SafeScore & Style Card */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-black text-emerald-700 font-mono">{historicalSafeScore}</div>
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Overall SafeScore</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-1">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-black text-slate-900 font-mono">{userProfile.totalKms}</div>
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Logged KMs</span>
        </div>

        <div
          className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center"
        >
          <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-black text-purple-700 font-mono truncate">Defensive</div>
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Driving Style</span>
        </div>
      </div>

      {/* Incompatible Vehicle Fitted Alert Banner */}
      {!isTwoWheeler(vehicle) && (
        <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-start gap-2.5 shadow-md">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase font-telematics text-[10px] tracking-wider" style={{ color: 'var(--color-hazard)' }}>
              INCOMPATIBLE FOUR-WHEELER FITTED
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
              {vehicle.model} ({vehicle.registrationNumber}) is a four-wheeler. SafeDrive is engineered exclusively for two-wheelers (Motorcycles &amp; Scooters). Telematics and ride tracking cannot be initiated for four-wheelers. Please switch to a two-wheeler below.
            </p>
          </div>
        </div>
      )}

      {/* Vehicle Action Error Alert */}
      {vehicleError && (
        <div className="p-3 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] font-medium">{vehicleError}</span>
          </div>
          <button
            onClick={() => setVehicleError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold cursor-pointer px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Vehicle Garage Card */}
      <div className={`rounded-2xl p-4 border shadow-xs space-y-2.5 ${
        !isTwoWheeler(vehicle) ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              !isTwoWheeler(vehicle) ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {vehicle.type === 'car' ? <Car className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
            </div>
            <div>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block ${
                !isTwoWheeler(vehicle) ? 'text-rose-600' : 'text-slate-400'
              }`}>
                {!isTwoWheeler(vehicle) ? 'INCOMPATIBLE VEHICLE' : 'ACTIVE TWO-WHEELER'}
              </span>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                {vehicle.model}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              setVehicleError(null);
              setShowVehiclePicker(!showVehiclePicker);
            }}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors"
          >
            {showVehiclePicker ? 'Close' : 'Switch'}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
          <span>Plate: <strong className="text-slate-700 font-bold">{vehicle.registrationNumber}</strong></span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
            !isTwoWheeler(vehicle) ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {!isTwoWheeler(vehicle) ? 'Four-Wheeler' : vehicle.fuelType}
          </span>
        </div>

        {showVehiclePicker && (
          <div className="pt-2 space-y-1.5 border-t border-slate-200">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Select Vehicle from Garage:
            </span>
            {vehicleOptions.map((v) => {
              const is2W = isTwoWheeler(v);
              const isCurrent = vehicle.registrationNumber === v.registrationNumber;
              return (
                <button
                  key={v.registrationNumber}
                  onClick={() => {
                    if (!is2W) {
                      setVehicleError(`Error: Four-wheeler (${v.model}) cannot be fitted into SafeDrive. Our application is strictly for two-wheelers only (Motorcycles & Scooters).`);
                      return;
                    }
                    setVehicleError(null);
                    onUpdateVehicle(v);
                    setShowVehiclePicker(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                    isCurrent
                      ? is2W
                        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-rose-100/70 border-rose-300 text-rose-900 font-bold'
                      : is2W
                      ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      : 'bg-rose-50/40 hover:bg-rose-50 border-rose-200 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{v.model}</span>
                      {!is2W && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 font-mono text-[8px] font-bold">
                          FOUR-WHEELER ✕
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{v.registrationNumber} • {v.fuelType}</span>
                  </div>
                  {isCurrent && (
                    <CheckCircle className={`w-4 h-4 ${is2W ? 'text-emerald-600' : 'text-rose-600'}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Emergency Contact & Auto-Dispatch Card */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-600 block">
                AUTO-DISPATCH ICE CONTACT
              </span>
              <h4 className="text-xs font-bold text-slate-900">
                {emergencyContact.name ? `${emergencyContact.name} (${emergencyContact.relationship || 'Emergency Contact'})` : 'No Emergency Contact Added'}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenEditICE && (
              <button
                onClick={onOpenEditICE}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-rose-600 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                title="Edit ICE Contact"
              >
                <Edit3 className="w-3 h-3 text-slate-500" />
                <span>{emergencyContact.name ? 'Edit' : 'Add Contact'}</span>
              </button>
            )}
            <button
              onClick={onOpenSOS}
              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
            >
              SOS Tool
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1.5 border-t border-slate-200">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <strong className="text-slate-800">{emergencyContact.phone || 'No phone number set'}</strong>
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
            emergencyContact.phone ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {emergencyContact.phone ? 'Crash SOS Linked' : 'Not Set'}
          </span>
        </div>
      </div>

      {/* Trip History Log Shortcut */}
      <div
        onClick={onOpenTrips}
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-500 transition-colors group"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700">
              TRIP LEDGER
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </div>
        <h3 className="text-xs font-bold text-slate-900 font-['Outfit']">
          View Past Trip Logs &amp; Commute Scores
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Review your distance, safe braking accuracy, and defensive riding metrics.
        </p>
      </div>

      {/* Voice Alerts Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            {voiceAlertsEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Audio Telematics Alerts</h4>
            <p className="text-[11px] text-slate-500">Speed warnings and safe distance cues</p>
          </div>
        </div>

        <button
          onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            voiceAlertsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              voiceAlertsEnabled ? 'right-1' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Download Web App (Standalone PWA) Card - Shifted from Topbar (Requirement 3) */}
      <div
        onClick={onOpenInstall}
        className="rounded-2xl p-4 border shadow-sm cursor-pointer transition-all group hover:scale-[1.01]"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-primary-btn)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
              style={{
                backgroundColor: 'var(--color-safe-card)',
                color: 'var(--color-primary-btn)',
              }}
            >
              <Download className="w-4 h-4" />
            </div>
            <span className="text-[9.5px] font-telematics font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary-btn)' }}>
              INSTALL STANDALONE PWA
            </span>
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--color-primary-btn)' }} />
        </div>
        <h3 className="text-sm font-bold font-display" style={{ color: 'var(--color-text-primary)' }}>
          Download &amp; Install SafeDrive App
        </h3>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Install SafeDrive directly onto your phone home screen for instant full-screen background telematics, no browser address bars, and zero lag.
        </p>
      </div>

      {/* Driver Registry & Account Switcher Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                AUTHENTICATED DRIVER GATEWAY
              </span>
              <h4 className="text-xs font-bold font-['Outfit'] text-white">
                MoRTH Sarathi &amp; Vahan Connected
              </h4>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
            ACTIVE SESSION
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span>Current Driver:</span>
            <span className="text-white font-bold">{userProfile.name}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>DL Registration:</span>
            <span className="text-emerald-400">{userProfile.dlNumber}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Assigned Vehicle:</span>
            <span className="text-slate-200">{vehicle.model}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Driver / Re-Authenticate Records</span>
        </button>
      </div>
    </motion.div>
  );
};
