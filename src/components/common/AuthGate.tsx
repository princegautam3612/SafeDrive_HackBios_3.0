import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, LogIn, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthGateProps {
  userProfile: UserProfile;
  onRequireLogin: () => void;
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  userProfile,
  onRequireLogin,
  children,
}) => {
  if (userProfile.isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full">
      {/* Blurred background preview */}
      <div className="opacity-25 pointer-events-none filter blur-xs select-none">
        {children}
      </div>

      {/* Lock Barrier Overlay */}
      <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl border border-slate-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1.5">
            Driver Authentication Required
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed mb-5">
            To record road telematics, earn safe driving rewards, and enable automated accident ICE dispatch, please authenticate your driver profile.
          </p>

          <button
            onClick={onRequireLogin}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Verify Driver License</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
