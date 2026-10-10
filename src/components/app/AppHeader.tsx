import React from 'react';
import { AlertTriangle, UserCheck, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../../types';

interface AppHeaderProps {
  points: number;
  xp: number;
  isDriving?: boolean;
  onOpenProfile: () => void;
  onOpenRewards: () => void;
  onOpenSOS: () => void;
  userProfile?: UserProfile;
  onSwitchDriver?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  points,
  xp,
  onOpenProfile,
  onOpenRewards,
  onOpenSOS,
  userProfile,
  onSwitchDriver,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className="flex items-center justify-between px-4 pt-3.5 pb-2.5 backdrop-blur-md border-b sticky top-0 z-30 max-w-md mx-auto w-full transition-colors"
      style={{
        backgroundColor: 'var(--color-header-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Brand & Avatar */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenProfile}
          className="relative rounded-full overflow-hidden cursor-pointer transition-all shrink-0 hover:scale-105"
          style={{
            boxShadow: '0 0 0 2px var(--color-primary-btn)',
          }}
          title={`Logged in as ${userProfile?.name || 'Driver'}. Click to view Profile.`}
        >
          <img
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
            alt="Driver Avatar"
            className="w-8 h-8 object-cover"
          />
          <div
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-primary-btn)',
              boxShadow: '0 0 0 1.5px var(--color-card)',
            }}
          />
        </button>

        <div className="flex items-center gap-1.5">
          <div
            className="w-5.5 h-5.5 rounded flex items-center justify-center font-black text-xs shadow-xs"
            style={{ backgroundColor: 'var(--color-primary-btn)' }}
          >
            <span
              className="transform rotate-45 block w-2 h-2 rounded-xs"
              style={{ backgroundColor: 'var(--color-btn-text)' }}
            />
          </div>
          <span
            className="text-base font-black tracking-tight font-display"
            style={{ color: 'var(--color-text-primary)' }}
          >
            SafeDrive
          </span>
        </div>
      </div>

      {/* Right Controls: Theme Toggle + Driver Switch + Sleek SOS Caution Button */}
      <div className="flex items-center gap-2">
        {/* Dark / Light Mode Switcher Button (Sun icon in light, Moon icon in dark) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: isDark ? 'var(--color-pop)' : 'var(--color-caution)',
            }}
            aria-label="Toggle theme mode"
          >
            {isDark ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Switch Driver quick button */}
        {onSwitchDriver && (
          <button
            onClick={onSwitchDriver}
            title="Switch Driver / Re-Authenticate"
            className="px-2.5 py-1.5 rounded-full border text-[10px] font-telematics font-bold transition-all cursor-pointer flex items-center gap-1 hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <UserCheck className="w-3 h-3 text-[#1FBF75]" />
            <span className="hidden xs:inline">Driver</span>
          </button>
        )}

        {/* Sleek SOS Emergency Trigger: caution mark icon only (no text), Chilli Deep #C62828 fill */}
        <button
          onClick={onOpenSOS}
          title="Emergency Assistance & SOS"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer hover:brightness-110"
          style={{
            backgroundColor: 'var(--color-sos)',
          }}
          aria-label="Emergency SOS"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
        </button>
      </div>
    </header>
  );
};
