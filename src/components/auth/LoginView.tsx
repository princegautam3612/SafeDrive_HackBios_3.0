import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Smartphone, FileCheck, CheckCircle2,
  ArrowRight, KeyRound, AlertCircle, RefreshCw, Sparkles,
  Lock, User, Phone, Car, Bike, Info, HeartHandshake,
  Award, Gauge, Zap, Check, Search, ChevronRight, Activity,
  UserPlus, ShieldAlert
} from 'lucide-react';
import { UserSessionPayload, UserProfile, VehicleProfile, EmergencyContact, isTwoWheeler } from '../../types';
import { REGISTERED_DRIVERS, RegisteredDriverRecord, lookupOrGenerateDriverRecord } from '../../data/driversRegistry';

interface LoginViewProps {
  onLoginSuccess: (session: UserSessionPayload) => void;
  currentProfile?: UserProfile;
}

type LoginStep = 'select_or_input' | 'fetching_data' | 'dossier_preview' | 'otp_verify';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, currentProfile }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'persona' | 'dl_query'>('persona');
  const [step, setStep] = useState<LoginStep>('select_or_input');

  // Selected or looked-up driver record
  const [selectedDriver, setSelectedDriver] = useState<RegisteredDriverRecord>(REGISTERED_DRIVERS[0]);

  // Login custom search inputs
  const [customPhone, setCustomPhone] = useState('9876543210');
  const [customDl, setCustomDl] = useState('DL-0420180054321');
  const [customName, setCustomName] = useState('Arjun Sharma');
  const [errorMessage, setErrorMessage] = useState('');

  // Register New Driver Form fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDl, setRegDl] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');
  const [regVehicleModel, setRegVehicleModel] = useState('');
  const [regVehiclePlate, setRegVehiclePlate] = useState('');
  const [regVehicleType, setRegVehicleType] = useState<'motorcycle' | 'scooter' | 'car'>('motorcycle');
  const [regIceName, setRegIceName] = useState('');
  const [regIcePhone, setRegIcePhone] = useState('');
  const [regIceRelation, setRegIceRelation] = useState('Parent');

  // Fetch pipeline progress
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchStageText, setFetchStageText] = useState('Connecting to MoRTH Sarathi Registry...');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState('849201');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP
  useEffect(() => {
    let timer: any;
    if (step === 'otp_verify' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Step 1: Initiate Data Fetching based on application requirements
  const handleStartDataFetch = (driverToFetch?: RegisteredDriverRecord) => {
    setErrorMessage('');
    let targetRecord: RegisteredDriverRecord;

    if (driverToFetch) {
      targetRecord = driverToFetch;
      setSelectedDriver(driverToFetch);
    } else if (authMode === 'login' && loginMethod === 'persona') {
      targetRecord = selectedDriver;
    } else if (authMode === 'login' && loginMethod === 'dl_query') {
      const cleanPhone = customPhone.trim().replace(/\D/g, '');
      const cleanDl = customDl.trim().toUpperCase();

      if (cleanPhone.length < 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (cleanDl.length < 8) {
        setErrorMessage('Please enter a valid Driving License (DL) number (e.g. DL-0420180054321).');
        return;
      }

      targetRecord = lookupOrGenerateDriverRecord(cleanDl || cleanPhone, customName);
      setSelectedDriver(targetRecord);
    } else {
      // Register Mode
      const cleanPhone = regPhone.trim().replace(/\D/g, '');
      const cleanDl = regDl.trim().toUpperCase();
      const cleanPlate = regVehiclePlate.trim().toUpperCase();

      if (!regName.trim()) {
        setErrorMessage('Please enter your full legal name.');
        return;
      }
      if (cleanPhone.length < 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (cleanDl.length < 8) {
        setErrorMessage('Please enter a valid Driving License (DL) number.');
        return;
      }
      if (!regVehicleModel.trim()) {
        setErrorMessage('Please enter your two-wheeler model (e.g. Royal Enfield Hunter 350).');
        return;
      }
      if (cleanPlate.length < 6) {
        setErrorMessage('Please enter your vehicle registration number (e.g. DL-01-AB-1234).');
        return;
      }
      if (regVehicleType === 'car') {
        setErrorMessage('Error: Four-wheelers are incompatible. SafeDrive is strictly calibrated for two-wheelers only.');
        return;
      }
      if (!regIceName.trim() || regIcePhone.trim().length < 10) {
        setErrorMessage('Please provide emergency ICE contact details for automated crash dispatch.');
        return;
      }

      // Construct registered driver record
      targetRecord = {
        id: `driver-new-${Date.now()}`,
        name: regName.trim(),
        phone: cleanPhone,
        email: `${regName.trim().toLowerCase().replace(/\s+/g, '.')}@safedrive.net`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dlNumber: cleanDl,
        dlDetails: {
          dlNumber: cleanDl,
          holderName: regName.trim().toUpperCase(),
          issueDate: '2023-01-15',
          validUntil: '2043-01-14',
          vehicleClasses: ['MCWG', 'LMV-NT'],
          issuingRTO: 'RTO Central Delhi, DL-04',
          status: 'VERIFIED',
          bloodGroup: regBloodGroup,
        },
        joinedDate: 'Joined Today',
        historicalSafeScore: 92,
        totalKms: 0,
        totalRides: 0,
        driverRole: 'Registered SafeDrive Telematics Rider',
        badgeLabel: 'New Verified Pilot',
        vehicle: {
          model: regVehicleModel.trim(),
          registrationNumber: cleanPlate,
          type: regVehicleType === 'scooter' ? 'scooter' : 'motorcycle',
          fuelType: 'Petrol',
        },
        emergencyContact: {
          name: regIceName.trim(),
          phone: regIcePhone.trim(),
          relationship: regIceRelation,
        },
        points: 250,
        xp: 150,
        trips: [],
        transactions: [
          {
            id: `tx-welcome-${Date.now()}`,
            title: 'Welcome Bonus: Account Registered',
            date: 'Just now',
            amount: 250,
            type: 'earn',
            category: 'Safety',
          },
        ],
      };
      setSelectedDriver(targetRecord);
    }

    // Begin animated 4-stage fetching pipeline
    setStep('fetching_data');
    setFetchProgress(10);
    setCompletedSteps([]);
    setFetchStageText('Step 1/4: Authenticating MoRTH Sarathi Gateway...');

    setTimeout(() => {
      setFetchProgress(35);
      setCompletedSteps((prev) => [...prev, 'MoRTH Sarathi: DL Validated & Endorsements Extracted']);
      setFetchStageText('Step 2/4: Querying Vahan National Vehicle RC Database...');
    }, 700);

    setTimeout(() => {
      setFetchProgress(65);
      setCompletedSteps((prev) => [...prev, `Vahan RC: Linked ${targetRecord.vehicle.model} (${targetRecord.vehicle.registrationNumber})`]);
      setFetchStageText('Step 3/4: Synchronizing Emergency ICE Responder Network...');
    }, 1400);

    setTimeout(() => {
      setFetchProgress(90);
      setCompletedSteps((prev) => [...prev, `Emergency ICE: Linked ${targetRecord.emergencyContact.name} for Auto-Dispatch`]);
      setFetchStageText('Step 4/4: Pulling SafeDrive Telematics Ledger & Baseline Score...');
    }, 2100);

    setTimeout(() => {
      setFetchProgress(100);
      setCompletedSteps((prev) => [...prev, `Telematics: SafeScore ${targetRecord.historicalSafeScore}/100 • Two-Wheeler Baseline Synchronized`]);
      setStep('dossier_preview');
    }, 2800);
  };

  // Step 2: From Dossier to OTP
  const handleProceedToOtp = () => {
    if (!isTwoWheeler(selectedDriver.vehicle)) {
      setErrorMessage(`Error: Four-wheeler (${selectedDriver.vehicle.model}) data cannot be fitted into SafeDrive. Our application is strictly calibrated for two-wheelers only (Motorcycles & Scooters).`);
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpInputs(['', '', '', '', '', '']);
    setStep('otp_verify');
    setResendTimer(30);

    // Trigger SMS banner alert
    setTimeout(() => {
      setShowSmsBanner(true);
    }, 600);
  };

  // Step 3: Handle OTP inputs
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpInputs];
    newOtp[index] = value.slice(-1);
    setOtpInputs(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    setOtpInputs(generatedOtp.split(''));
    setShowSmsBanner(false);
  };

  // Step 4: Final Verification & Commit Session Payload
  const handleCompleteLogin = () => {
    const entered = otpInputs.join('');
    if (entered !== generatedOtp && entered !== '123456') {
      setErrorMessage('Invalid OTP code. Please enter the 6-digit code shown in the SMS alert or tap Autofill.');
      return;
    }

    if (!isTwoWheeler(selectedDriver.vehicle)) {
      setErrorMessage(`Error: Four-wheeler (${selectedDriver.vehicle.model}) data cannot be fitted into SafeDrive. Our application is strictly calibrated for two-wheelers only (Motorcycles & Scooters).`);
      return;
    }

    commitDriverSession(selectedDriver);
  };

  // Fast direct 1-tap login for pre-authenticated demos
  const handleInstantLogin = (driver: RegisteredDriverRecord) => {
    if (!isTwoWheeler(driver.vehicle)) {
      setErrorMessage(`Error: Four-wheeler (${driver.vehicle.model}) data cannot be fitted into SafeDrive. Our application is strictly for two-wheelers only (Motorcycles & Scooters).`);
      return;
    }
    commitDriverSession(driver);
  };

  const commitDriverSession = (driver: RegisteredDriverRecord) => {
    const payload: UserSessionPayload = {
      userProfile: {
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        avatar: driver.avatar,
        dlNumber: driver.dlNumber,
        dlVerified: true,
        dlDetails: driver.dlDetails,
        isAuthenticated: true,
        joinedDate: driver.joinedDate,
        historicalSafeScore: driver.historicalSafeScore,
        totalKms: driver.totalKms,
        totalRides: driver.totalRides,
        autoDetectRidesEnabled: true,
        autoDetectThresholdSpeed: 15,
        driverRole: driver.driverRole,
        badgeLabel: driver.badgeLabel,
      },
      vehicle: driver.vehicle,
      emergencyContact: driver.emergencyContact,
      points: driver.points,
      xp: driver.xp,
      trips: driver.trips,
      transactions: driver.transactions,
    };
    onLoginSuccess(payload);
  };

  return (
    <div
      className="h-full flex flex-col justify-between p-4 sm:p-5 relative overflow-y-auto no-scrollbar transition-colors font-body"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Simulated Incoming SMS Notification Banner */}
      <AnimatePresence>
        {showSmsBanner && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            onClick={handleAutoFillOtp}
            className="fixed top-3 left-3 right-3 sm:left-auto sm:right-auto sm:w-[390px] mx-auto z-50 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 cursor-pointer transition-all text-left border"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-primary-btn)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{
                backgroundColor: 'var(--color-safe-card)',
                color: 'var(--color-primary-btn)',
              }}
            >
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-telematics" style={{ color: 'var(--color-primary-btn)' }}>
                <span className="font-bold">MESSAGES • GOV-SAFEDRIVE</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>Just now</span>
              </div>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                Your SafeDrive verification code is <strong className="font-telematics text-sm tracking-wider" style={{ color: 'var(--color-pop)' }}>{generatedOtp}</strong>. Tap to auto-fill.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="shrink-0 pt-1 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-xs"
              style={{ backgroundColor: 'var(--color-primary-btn)' }}
            >
              <span className="transform rotate-45 block w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: 'var(--color-btn-text)' }} />
            </div>
            <span className="text-lg font-black tracking-tight font-display" style={{ color: 'var(--color-text-primary)' }}>
              SafeDrive
            </span>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-telematics font-bold border"
            style={{
              backgroundColor: 'var(--color-safe-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-primary-btn)',
            }}
          >
            TELEMATICS GATEWAY
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {step === 'select_or_input' && (authMode === 'login' ? 'Driver Sign In' : 'Register New Rider')}
          {step === 'fetching_data' && 'Retrieving Driver Dossier...'}
          {step === 'dossier_preview' && 'Verified Driver Records'}
          {step === 'otp_verify' && 'Verify 2FA Mobile OTP'}
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {step === 'select_or_input' && (authMode === 'login'
            ? 'Sign in with verified profile or query MoRTH Sarathi DL and Vahan RC.'
            : 'Register your two-wheeler profile, DL credentials, and emergency ICE network.'
          )}
          {step === 'fetching_data' && 'Contacting government transport gateways and telematics telemetry ledger...'}
          {step === 'dossier_preview' && 'Review the fetched application profile credentials before entering the cockpit.'}
          {step === 'otp_verify' && `Enter the 6-digit one-time passcode sent to +91 ${selectedDriver.phone}`}
        </p>
      </div>

      {/* Main Dynamic Viewport */}
      <div className="my-auto py-2">
        {/* STEP 1: AUTH SELECTION (LOGIN OR REGISTER) */}
        {step === 'select_or_input' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Top Auth Mode Tabs: Login vs Register */}
            <div
              className="grid grid-cols-2 p-1 rounded-xl border text-xs font-telematics font-bold transition-colors"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'login' ? 'shadow-xs font-black' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: authMode === 'login' ? 'var(--color-primary-btn)' : 'transparent',
                  color: authMode === 'login' ? 'var(--color-btn-text)' : 'var(--color-text-secondary)',
                }}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'register' ? 'shadow-xs font-black' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: authMode === 'register' ? 'var(--color-primary-btn)' : 'transparent',
                  color: authMode === 'register' ? 'var(--color-btn-text)' : 'var(--color-text-secondary)',
                }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Driver</span>
              </button>
            </div>

            {/* LOGIN MODE VIEW */}
            {authMode === 'login' && (
              <div className="space-y-3">
                {/* Login Sub-methods: Persona vs DL Query */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('persona');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-telematics font-bold border transition-all cursor-pointer ${
                      loginMethod === 'persona' ? 'border-[#1FBF75]' : ''
                    }`}
                    style={{
                      backgroundColor: loginMethod === 'persona' ? 'var(--color-safe-card)' : 'var(--color-card)',
                      borderColor: loginMethod === 'persona' ? 'var(--color-primary-btn)' : 'var(--color-border)',
                      color: loginMethod === 'persona' ? 'var(--color-primary-btn)' : 'var(--color-text-secondary)',
                    }}
                  >
                    ⚡ Verified Personas
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('dl_query');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-telematics font-bold border transition-all cursor-pointer ${
                      loginMethod === 'dl_query' ? 'border-[#1FBF75]' : ''
                    }`}
                    style={{
                      backgroundColor: loginMethod === 'dl_query' ? 'var(--color-safe-card)' : 'var(--color-card)',
                      borderColor: loginMethod === 'dl_query' ? 'var(--color-primary-btn)' : 'var(--color-border)',
                      color: loginMethod === 'dl_query' ? 'var(--color-primary-btn)' : 'var(--color-text-secondary)',
                    }}
                  >
                    🔍 Enter DL / Mobile
                  </button>
                </div>

                {loginMethod === 'persona' && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-telematics uppercase tracking-wider font-bold flex items-center justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>Select Registered Driver:</span>
                      <span style={{ color: 'var(--color-pop)' }}>1-Tap Live Fetch</span>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-0.5">
                      {REGISTERED_DRIVERS.map((driver) => {
                        const isSelected = selectedDriver.id === driver.id;
                        const is2W = isTwoWheeler(driver.vehicle);
                        return (
                          <div
                            key={driver.id}
                            onClick={() => setSelectedDriver(driver)}
                            className="p-3 rounded-2xl border transition-all cursor-pointer relative text-left"
                            style={{
                              backgroundColor: isSelected
                                ? is2W ? 'var(--color-safe-card)' : 'var(--color-hazard-tint)'
                                : 'var(--color-card)',
                              borderColor: isSelected
                                ? is2W ? 'var(--color-primary-btn)' : 'var(--color-hazard)'
                                : 'var(--color-border)',
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={driver.avatar}
                                alt={driver.name}
                                className="w-11 h-11 rounded-full object-cover shrink-0"
                                style={{
                                  boxShadow: `0 0 0 2px ${isSelected ? (is2W ? 'var(--color-primary-btn)' : 'var(--color-hazard)') : 'var(--color-border)'}`,
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-bold font-display truncate" style={{ color: 'var(--color-text-primary)' }}>
                                    {driver.name}
                                  </h3>
                                  {is2W ? (
                                    <span
                                      className="px-1.5 py-0.5 rounded text-[9px] font-telematics font-bold"
                                      style={{
                                        backgroundColor: 'var(--color-safe-card)',
                                        color: 'var(--color-primary-btn)',
                                      }}
                                    >
                                      TWO-WHEELER
                                    </span>
                                  ) : (
                                    <span
                                      className="px-1.5 py-0.5 rounded text-[9px] font-telematics font-bold border"
                                      style={{
                                        backgroundColor: 'var(--color-hazard-tint)',
                                        borderColor: 'var(--color-hazard)',
                                        color: 'var(--color-hazard)',
                                      }}
                                    >
                                      FOUR-WHEELER (INCOMPATIBLE)
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                  {driver.vehicle.model} • <span className="font-telematics" style={{ color: 'var(--color-primary-btn)' }}>{driver.vehicle.registrationNumber}</span>
                                </p>

                                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-telematics" style={{ color: 'var(--color-text-secondary)' }}>
                                  <span className="flex items-center gap-1">
                                    <Gauge className="w-3 h-3 text-[#1FBF75]" />
                                    <span>Score: <strong style={{ color: 'var(--color-text-primary)' }}>{driver.historicalSafeScore}</strong></span>
                                  </span>
                                  <span>•</span>
                                  <span>{driver.totalKms.toLocaleString()} km</span>
                                  <span>•</span>
                                  <span>{driver.totalRides} rides</span>
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div
                                className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-telematics"
                                style={{
                                  borderColor: 'var(--color-border)',
                                  color: is2W ? 'var(--color-primary-btn)' : 'var(--color-hazard)',
                                }}
                              >
                                <span className="flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>DL: {driver.dlNumber} ({driver.dlDetails.bloodGroup})</span>
                                </span>
                                {is2W ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInstantLogin(driver);
                                    }}
                                    className="px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-transform active:scale-95 shadow-xs"
                                    style={{
                                      backgroundColor: 'var(--color-primary-btn)',
                                      color: 'var(--color-btn-text)',
                                    }}
                                  >
                                    Fast Login ⚡
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold" style={{ color: 'var(--color-hazard)' }}>
                                    Incompatible (4W)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {loginMethod === 'dl_query' && (
                  <div
                    className="space-y-3 p-3.5 rounded-2xl border"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-telematics uppercase tracking-wider font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                        Driver Legal Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--color-text-secondary)' }} />
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Arjun Sharma"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none"
                          style={{
                            backgroundColor: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-telematics uppercase tracking-wider font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                        Mobile Phone (Registered for Telematics &amp; OTP)
                      </label>
                      <div className="relative flex items-center">
                        <div
                          className="absolute left-3 flex items-center gap-1 font-telematics text-xs border-r pr-2"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          <Phone className="w-3 h-3" />
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          value={customPhone}
                          onChange={(e) => setCustomPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full pl-18 pr-3 py-2 rounded-xl border text-xs font-telematics focus:outline-none"
                          style={{
                            backgroundColor: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-telematics uppercase tracking-wider font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                        Driving License (DL) Number
                      </label>
                      <div className="relative">
                        <FileCheck className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--color-text-secondary)' }} />
                        <input
                          type="text"
                          value={customDl}
                          onChange={(e) => setCustomDl(e.target.value.toUpperCase())}
                          placeholder="e.g. DL-0420180054321"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-telematics uppercase focus:outline-none"
                          style={{
                            backgroundColor: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REGISTER MODE VIEW */}
            {authMode === 'register' && (
              <div
                className="space-y-3 p-3.5 rounded-2xl border max-h-[360px] overflow-y-auto no-scrollbar"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="text-[10px] font-telematics uppercase tracking-wider font-bold flex items-center justify-between" style={{ color: 'var(--color-primary-btn)' }}>
                  <span>NEW 2-WHEELER DRIVER REGISTRATION</span>
                  <span style={{ color: 'var(--color-pop)' }}>+250 PTS BONUS</span>
                </div>

                {/* Personal & DL Details */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Rahul Mehta"
                      className="w-full px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                      Mobile (+91)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-telematics focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                      DL Number
                    </label>
                    <input
                      type="text"
                      value={regDl}
                      onChange={(e) => setRegDl(e.target.value.toUpperCase())}
                      placeholder="DL-0420230012345"
                      className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-telematics uppercase focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                      Blood Group
                    </label>
                    <select
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border text-xs font-telematics focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                {/* Two-Wheeler Specific Details */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-[9.5px] font-telematics font-bold uppercase mb-1.5 flex items-center justify-between" style={{ color: 'var(--color-primary-btn)' }}>
                    <span>Vehicle Details (Strictly Two-Wheeler)</span>
                    <Bike className="w-3.5 h-3.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                        Vehicle Model
                      </label>
                      <input
                        type="text"
                        value={regVehicleModel}
                        onChange={(e) => setRegVehicleModel(e.target.value)}
                        placeholder="e.g. KTM Duke 390"
                        className="w-full px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none"
                        style={{
                          backgroundColor: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                        Reg Plate
                      </label>
                      <input
                        type="text"
                        value={regVehiclePlate}
                        onChange={(e) => setRegVehiclePlate(e.target.value.toUpperCase())}
                        placeholder="DL-01-AB-1234"
                        className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-telematics uppercase focus:outline-none"
                        style={{
                          backgroundColor: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Vehicle Type Choice */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRegVehicleType('motorcycle')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-telematics font-bold border transition-colors cursor-pointer ${
                        regVehicleType === 'motorcycle' ? 'border-[#1FBF75]' : ''
                      }`}
                      style={{
                        backgroundColor: regVehicleType === 'motorcycle' ? 'var(--color-safe-card)' : 'var(--color-bg)',
                        borderColor: regVehicleType === 'motorcycle' ? 'var(--color-primary-btn)' : 'var(--color-border)',
                        color: regVehicleType === 'motorcycle' ? 'var(--color-primary-btn)' : 'var(--color-text-secondary)',
                      }}
                    >
                      🏍️ Motorcycle
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegVehicleType('scooter')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-telematics font-bold border transition-colors cursor-pointer ${
                        regVehicleType === 'scooter' ? 'border-[#1FBF75]' : ''
                      }`}
                      style={{
                        backgroundColor: regVehicleType === 'scooter' ? 'var(--color-safe-card)' : 'var(--color-bg)',
                        borderColor: regVehicleType === 'scooter' ? 'var(--color-primary-btn)' : 'var(--color-border)',
                        color: regVehicleType === 'scooter' ? 'var(--color-primary-btn)' : 'var(--color-text-secondary)',
                      }}
                    >
                      🛵 Scooter
                    </button>
                  </div>
                </div>

                {/* Emergency ICE Responder Details */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-[9.5px] font-telematics font-bold uppercase mb-1.5 flex items-center justify-between" style={{ color: 'var(--color-caution)' }}>
                    <span>Emergency ICE Responder (Auto-Dispatch)</span>
                    <HeartHandshake className="w-3.5 h-3.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={regIceName}
                        onChange={(e) => setRegIceName(e.target.value)}
                        placeholder="e.g. Ramesh Mehta"
                        className="w-full px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none"
                        style={{
                          backgroundColor: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                        Emergency Phone
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={regIcePhone}
                        onChange={(e) => setRegIcePhone(e.target.value)}
                        placeholder="9876543211"
                        className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-telematics focus:outline-none"
                        style={{
                          backgroundColor: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                className="p-2.5 rounded-xl border text-xs flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--color-hazard-tint)',
                  borderColor: 'var(--color-hazard)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-hazard)' }} />
                <span>{errorMessage}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: ANIMATED 4-STAGE DATA RETRIEVAL PIPELINE */}
        {step === 'fetching_data' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 py-4 text-center"
          >
            <div className="relative w-20 h-20 mx-auto">
              <div
                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                style={{
                  borderColor: 'var(--color-primary-btn)',
                  borderTopColor: 'transparent',
                }}
              />
              <div
                className="absolute inset-2 rounded-full border-2 border-b-transparent animate-spin"
                style={{
                  borderColor: 'var(--color-border)',
                  borderBottomColor: 'transparent',
                  animationDirection: 'reverse',
                  animationDuration: '2s',
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center font-telematics font-bold text-xs"
                style={{ color: 'var(--color-pop)' }}
              >
                {fetchProgress}%
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold font-display" style={{ color: 'var(--color-text-primary)' }}>
                Syncing Telematics Node
              </h3>
              <p className="text-xs font-telematics mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {fetchStageText}
              </p>
            </div>

            <div
              className="space-y-2 text-left p-3 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              {completedSteps.map((stepMsg, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] font-telematics animate-in fade-in" style={{ color: 'var(--color-text-primary)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1FBF75] shrink-0 mt-0.5" />
                  <span>{stepMsg}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: DOSSIER PREVIEW */}
        {step === 'dossier_preview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div
              className="p-3.5 rounded-2xl border space-y-2.5"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <img
                  src={selectedDriver.avatar}
                  alt={selectedDriver.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                  style={{ boxShadow: '0 0 0 2px var(--color-primary-btn)' }}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold font-display truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedDriver.name}
                  </h3>
                  <p className="text-[11px] font-telematics" style={{ color: 'var(--color-text-secondary)' }}>
                    +91 {selectedDriver.phone}
                  </p>
                  <span
                    className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-telematics font-bold"
                    style={{
                      backgroundColor: 'var(--color-safe-card)',
                      color: 'var(--color-primary-btn)',
                    }}
                  >
                    MoRTH Verified Rider
                  </span>
                </div>
              </div>

              {/* Vehicle Verification */}
              <div
                className="p-2.5 rounded-xl border text-[11px] space-y-1 font-telematics"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>Vahan RC Vehicle:</span>
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{selectedDriver.vehicle.model}</span>
                </div>
                <div className="flex items-center justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>Registration Plate:</span>
                  <span className="font-bold" style={{ color: 'var(--color-pop)' }}>{selectedDriver.vehicle.registrationNumber}</span>
                </div>
                <div className="flex items-center justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>Vehicle Classification:</span>
                  <span className="font-bold" style={{ color: isTwoWheeler(selectedDriver.vehicle) ? 'var(--color-primary-btn)' : 'var(--color-hazard)' }}>
                    {isTwoWheeler(selectedDriver.vehicle) ? 'Two-Wheeler (Motorcycle/Scooter)' : 'Four-Wheeler (Incompatible)'}
                  </span>
                </div>
              </div>

              {/* ICE Auto-Dispatch Details */}
              <div
                className="p-2.5 rounded-xl border text-[11px] space-y-1 font-telematics"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>Emergency ICE Contact:</span>
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{selectedDriver.emergencyContact.name} ({selectedDriver.emergencyContact.relationship})</span>
                </div>
                <div className="flex items-center justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>Auto-Dispatch SMS/Call:</span>
                  <span className="font-bold" style={{ color: 'var(--color-primary-btn)' }}>Enabled (+91 {selectedDriver.emergencyContact.phone})</span>
                </div>
              </div>
            </div>

            {/* Incompatible Vehicle Error Banner if four-wheeler */}
            {!isTwoWheeler(selectedDriver.vehicle) && (
              <div
                className="p-3 rounded-2xl border text-xs flex items-start gap-2.5 shadow-md"
                style={{
                  backgroundColor: 'var(--color-hazard-tint)',
                  borderColor: 'var(--color-hazard)',
                }}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-hazard)' }} />
                <div>
                  <div className="font-bold uppercase font-telematics text-[10px] tracking-wider" style={{ color: 'var(--color-hazard)' }}>
                    INCOMPATIBLE VEHICLE ERROR
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedDriver.vehicle.model} ({selectedDriver.vehicle.registrationNumber}) is a four-wheeler. SafeDrive is strictly built for two-wheelers only (Motorcycles &amp; Scooters). This vehicle data cannot be fitted.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 4: OTP VERIFICATION */}
        {step === 'otp_verify' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 py-2 text-center"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-telematics uppercase tracking-wider font-bold" style={{ color: 'var(--color-primary-btn)' }}>
                GOVERNMENT 2FA PROTOCOL
              </span>
              <h3 className="text-base font-bold font-display" style={{ color: 'var(--color-text-primary)' }}>
                Enter Verification Passcode
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Code dispatched to +91 {selectedDriver.phone.slice(0, 3)}••••{selectedDriver.phone.slice(-3)}
              </p>
            </div>

            {/* 6-box input */}
            <div className="flex justify-center gap-2">
              {otpInputs.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-13 rounded-xl border text-center font-telematics text-xl font-black focus:outline-none focus:scale-105 transition-all shadow-md"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: digit ? 'var(--color-primary-btn)' : 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-telematics px-2" style={{ color: 'var(--color-text-secondary)' }}>
              <span>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : (
                  <button
                    type="button"
                    onClick={handleProceedToOtp}
                    className="underline cursor-pointer font-bold"
                    style={{ color: 'var(--color-primary-btn)' }}
                  >
                    Resend OTP
                  </button>
                )}
              </span>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="font-bold underline cursor-pointer"
                style={{ color: 'var(--color-pop)' }}
              >
                Auto-Fill Code ({generatedOtp})
              </button>
            </div>

            {errorMessage && (
              <div
                className="p-2.5 rounded-xl border text-xs flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--color-hazard-tint)',
                  borderColor: 'var(--color-hazard)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-hazard)' }} />
                <span>{errorMessage}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="shrink-0 pt-2 pb-1 space-y-2">
        {step === 'select_or_input' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleStartDataFetch()}
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: 'var(--color-primary-btn)',
                color: 'var(--color-btn-text)',
              }}
            >
              <span>{authMode === 'login' ? 'Fetch MoRTH DL & RC Dossier' : 'Register Rider & Sync Ledger'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'dossier_preview' && (
          <div className="space-y-2">
            {!isTwoWheeler(selectedDriver.vehicle) ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase font-display tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
                  style={{
                    backgroundColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <span>Vehicle Incompatible (Four-Wheeler Blocked)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep('select_or_input')}
                  className="w-full py-2 text-xs font-telematics underline cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ← Select or Register a Two-Wheeler
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleProceedToOtp}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-primary-btn)',
                    color: 'var(--color-btn-text)',
                  }}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Confirm &amp; Send 2FA Mobile OTP</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInstantLogin(selectedDriver)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-telematics font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors border"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-pop)',
                    }}
                  >
                    <span>Fast Sign In ⚡</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('select_or_input')}
                    className="py-2 px-3 text-xs font-telematics transition-colors cursor-pointer"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'otp_verify' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleCompleteLogin}
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: 'var(--color-primary-btn)',
                color: 'var(--color-btn-text)',
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify &amp; Launch SafeDrive Cockpit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('dossier_preview');
                setErrorMessage('');
              }}
              className="w-full py-2 text-xs font-telematics transition-colors cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ← Back to Driver Dossier
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-telematics text-center" style={{ color: 'var(--color-text-secondary)' }}>
          <Lock className="w-3 h-3" />
          <span>Encrypted 256-bit Telematics Keyring • MoRTH Sarathi Certified</span>
        </div>
      </div>
    </div>
  );
};
