import React from 'react';
import { LayoutGrid, Trophy, Gift, User, ShieldCheck } from 'lucide-react';
import { NavigationTab } from '../../types';

interface AppBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const AppBottomNav: React.FC<AppBottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'leagues', label: 'Squads', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'roadiq', label: 'Road IQ', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t px-2 sm:px-3 pt-2 pb-2.5 pb-safe shadow-lg max-w-md mx-auto w-full transition-colors"
      style={{
        backgroundColor: 'var(--color-bottom-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center transition-all duration-200 cursor-pointer min-w-[50px] min-h-[44px]"
              style={{
                color: isActive ? 'var(--color-primary-btn)' : 'var(--color-text-secondary)',
              }}
            >
              {isActive ? (
                <div
                  className="w-10 sm:w-11 h-6 sm:h-7 rounded-lg flex items-center justify-center shadow-md mb-0.5 sm:mb-1 transition-transform scale-105"
                  style={{
                    backgroundColor: 'var(--color-primary-btn)',
                    color: 'var(--color-btn-text)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-6 sm:h-7 flex items-center justify-center mb-0.5 sm:mb-1 opacity-70 hover:opacity-100 transition-opacity">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              )}
              <span
                className={`text-[9px] sm:text-[9.5px] uppercase font-telematics tracking-wider ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
                style={{
                  color: isActive ? 'var(--color-pop)' : 'var(--color-text-secondary)',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
