import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bike,
  Code2,
} from 'lucide-react';
import { UserSessionPayload, UserProfile } from '../../types';
import { REGISTERED_DRIVERS, RegisteredDriverRecord } from '../../data/driversRegistry';

interface LoginViewProps {
  onLoginSuccess: (session: UserSessionPayload) => void;
  currentProfile?: UserProfile;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('arjun');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1-Tap Fast Login for Developers
  const handleDeveloperFastLogin = (driverRecord?: RegisteredDriverRecord) => {
    setIsLoading(true);
    setErrorMessage('');
    const driver = driverRecord || REGISTERED_DRIVERS[0]; // Arjun Sharma (Two-Wheeler Royal Enfield)

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
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
          driverRole: 'Developer / Telematics Pilot',
          badgeLabel: 'DEV ACCESS GRANTED',
        },
        vehicle: driver.vehicle,
        emergencyContact: driver.emergencyContact,
        points: driver.points,
        xp: driver.xp,
        trips: driver.trips,
        transactions: driver.transactions,
      });
    }, 250);
  };

  // User Login handler (username + password)
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedUser = loginUsername.trim();
    const trimmedPass = loginPassword.trim();

    if (!trimmedUser) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (trimmedPass.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Check against registered drivers or construct session
      const matched = REGISTERED_DRIVERS.find(
        (d) =>
          d.name.toLowerCase().includes(trimmedUser.toLowerCase()) ||
          d.email.toLowerCase().startsWith(trimmedUser.toLowerCase()) ||
          d.phone === trimmedUser
      );

      const baseDriver = matched || REGISTERED_DRIVERS[0];
      const displayName = matched ? matched.name : trimmedUser;

      onLoginSuccess({
        userProfile: {
          name: displayName,
          phone: matched ? matched.phone : '9876543210',
          email: matched ? matched.email : `${trimmedUser.toLowerCase().replace(/\s+/g, '.')}@safedrive.net`,
          avatar: baseDriver.avatar,
          dlNumber: baseDriver.dlNumber,
          dlVerified: true,
          dlDetails: baseDriver.dlDetails,
          isAuthenticated: true,
          joinedDate: matched ? matched.joinedDate : 'Today',
          historicalSafeScore: matched ? matched.historicalSafeScore : 90,
          totalKms: matched ? matched.totalKms : 120,
          totalRides: matched ? matched.totalRides : 5,
          autoDetectRidesEnabled: true,
          autoDetectThresholdSpeed: 15,
          driverRole: matched ? matched.driverRole : 'SafeDrive Rider',
          badgeLabel: matched ? matched.badgeLabel : 'VERIFIED RIDER',
        },
        vehicle: baseDriver.vehicle,
        emergencyContact: baseDriver.emergencyContact,
        points: matched ? matched.points : 500,
        xp: matched ? matched.xp : 250,
        trips: baseDriver.trips,
        transactions: baseDriver.transactions,
      });
    }, 400);
  };

  // User Register handler (username, password, email, phone)
  const handleUserRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedUser = regUsername.trim();
    const trimmedPass = regPassword.trim();
    const trimmedEmail = regEmail.trim();
    const cleanPhone = regPhone.trim().replace(/\D/g, '');

    if (!trimmedUser) {
      setErrorMessage('Please enter a username.');
      return;
    }
    if (!trimmedPass || trimmedPass.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const generatedDl = `DL-04${new Date().getFullYear()}00${Math.floor(10000 + Math.random() * 90000)}`;

      onLoginSuccess({
        userProfile: {
          name: trimmedUser,
          phone: cleanPhone,
          email: trimmedEmail,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          dlNumber: generatedDl,
          dlVerified: true,
          dlDetails: {
            dlNumber: generatedDl,
            holderName: trimmedUser.toUpperCase(),
            issueDate: new Date().toLocaleDateString('en-GB'),
            validUntil: '15-Jan-2044',
            vehicleClasses: ['MCWG (Two-Wheeler)'],
            issuingRTO: 'RTO Transport Authority',
            status: 'VERIFIED',
            bloodGroup: 'O+',
          },
          isAuthenticated: true,
          joinedDate: 'Just now',
          historicalSafeScore: 95,
          totalKms: 0,
          totalRides: 0,
          autoDetectRidesEnabled: true,
          autoDetectThresholdSpeed: 15,
          driverRole: 'Registered Two-Wheeler Pilot',
          badgeLabel: 'ROOKIE PRODIGY',
        },
        vehicle: {
          type: 'motorcycle',
          model: 'Two-Wheeler (Motorcycle)',
          registrationNumber: `DL-01-SD-${Math.floor(1000 + Math.random() * 9000)}`,
          fuelType: 'Petrol',
        },
        emergencyContact: {
          name: 'Emergency ICE Contact',
          phone: cleanPhone,
          relationship: 'Family',
        },
        points: 250,
        xp: 150,
        trips: [],
        transactions: [
          {
            id: `tx-welcome-${Date.now()}`,
            title: 'Welcome Bonus: New Rider Registered',
            date: 'Just now',
            amount: 250,
            type: 'earn',
            category: 'Bonus',
          },
        ],
      });
    }, 500);
  };

  return (
    <div
      className="h-full flex flex-col justify-between p-4 sm:p-5 relative overflow-y-auto no-scrollbar font-body transition-colors"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Top Branding */}
      <div className="shrink-0 pt-1 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-xs"
              style={{ backgroundColor: 'var(--color-primary-btn)' }}
            >
              <Bike className="w-4.5 h-4.5 text-[#0F1411]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight font-display block leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                SafeDrive
              </span>
              <span className="text-[10px] font-telematics tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                KINETIC TELEMATICS
              </span>
            </div>
          </div>

          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-telematics font-bold border flex items-center gap-1"
            style={{
              backgroundColor: 'var(--color-safe-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-primary-btn)',
            }}
          >
            <ShieldCheck className="w-3 h-3" />
            SECURE ACCESS
          </span>
        </div>

        {/* Developer Fast Login Banner */}
        <div
          className="p-3 rounded-2xl border mb-3 transition-all relative overflow-hidden"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-primary-btn)',
            boxShadow: '0 4px 20px -2px rgba(31, 191, 117, 0.12)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold font-telematics" style={{ color: 'var(--color-primary-btn)' }}>
              <Code2 className="w-4 h-4" />
              <span>DEVELOPER PORTAL</span>
            </div>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-telematics font-bold uppercase"
              style={{
                backgroundColor: 'var(--color-safe-card)',
                color: 'var(--color-pop)',
              }}
            >
              Instant Bypass
            </span>
          </div>

          <p className="text-[11.5px] leading-relaxed mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>
            One-click authentication preloaded with full two-wheeler telemetry data, trips, and demo points for rapid testing.
          </p>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDeveloperFastLogin()}
            className="w-full py-2.5 px-3 rounded-xl font-display font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-md hover:brightness-105"
            style={{
              backgroundColor: 'var(--color-primary-btn)',
              color: 'var(--color-btn-text)',
            }}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Fast Login for Developers (1-Tap)</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Register */}
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
              setTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'login' ? 'shadow-xs font-black' : 'hover:opacity-85'
            }`}
            style={{
              backgroundColor: tab === 'login' ? 'var(--color-primary-btn)' : 'transparent',
              color: tab === 'login' ? 'var(--color-btn-text)' : 'var(--color-text-secondary)',
            }}
          >
            <User className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'register' ? 'shadow-xs font-black' : 'hover:opacity-85'
            }`}
            style={{
              backgroundColor: tab === 'register' ? 'var(--color-primary-btn)' : 'transparent',
              color: tab === 'register' ? 'var(--color-btn-text)' : 'var(--color-text-secondary)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>
      </div>

      {/* Main Dynamic Viewport */}
      <div className="flex-1 my-auto py-1">
        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleUserLogin}
              className="space-y-3.5"
            >
              <div
                className="p-3.5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="text-[10px] font-telematics font-bold tracking-wider uppercase flex items-center justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>User Login Credentials</span>
                  <span style={{ color: 'var(--color-primary-btn)' }}>User &amp; Pass</span>
                </div>

                {/* Username Input */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-secondary)' }} />
                    <input
                      type="text"
                      autoComplete="username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter username (e.g. arjun)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-secondary)' }} />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 cursor-pointer opacity-70 hover:opacity-100"
                      style={{ color: 'var(--color-text-secondary)' }}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div
                  className="p-2.5 rounded-xl border text-xs flex items-center gap-2 text-left"
                  style={{
                    backgroundColor: 'var(--color-hazard-tint)',
                    borderColor: 'var(--color-hazard)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-hazard)' }} />
                  <p className="flex-1">{errorMessage}</p>
                </div>
              )}

              {/* Submit Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-display font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-md hover:brightness-105"
                style={{
                  backgroundColor: 'var(--color-primary-btn)',
                  color: 'var(--color-btn-text)',
                }}
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleUserRegister}
              className="space-y-3.5"
            >
              <div
                className="p-3.5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="text-[10px] font-telematics font-bold tracking-wider uppercase flex items-center justify-between" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>Rider Registration Form</span>
                  <span style={{ color: 'var(--color-pop)' }}>All 4 Fields Required</span>
                </div>

                {/* 1. Username */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-secondary)' }} />
                    <input
                      type="text"
                      autoComplete="username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. rahul_rider"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                </div>

                {/* 2. Password */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-secondary)' }} />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 cursor-pointer opacity-70 hover:opacity-100"
                      style={{ color: 'var(--color-text-secondary)' }}
                      title={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Email */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--color-text-secondary)' }} />
                    <input
                      type="email"
                      autoComplete="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="rider@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                </div>

                {/* 4. Phone Number */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-telematics uppercase font-bold block" style={{ color: 'var(--color-text-secondary)' }}>
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <div
                      className="absolute left-3 flex items-center gap-1 font-telematics text-xs border-r pr-2"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      autoComplete="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-18 pr-3 py-2 rounded-xl border text-xs font-telematics focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div
                  className="p-2.5 rounded-xl border text-xs flex items-center gap-2 text-left"
                  style={{
                    backgroundColor: 'var(--color-hazard-tint)',
                    borderColor: 'var(--color-hazard)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-hazard)' }} />
                  <p className="flex-1">{errorMessage}</p>
                </div>
              )}

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-display font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-md hover:brightness-105"
                style={{
                  backgroundColor: 'var(--color-primary-btn)',
                  color: 'var(--color-btn-text)',
                }}
              >
                <span>Create Account &amp; Register</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="shrink-0 pt-2 text-center">
        <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
          {tab === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage('');
                }}
                className="font-bold underline cursor-pointer hover:opacity-80"
                style={{ color: 'var(--color-primary-btn)' }}
              >
                Register now
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage('');
                }}
                className="font-bold underline cursor-pointer hover:opacity-80"
                style={{ color: 'var(--color-primary-btn)' }}
              >
                Log in here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
