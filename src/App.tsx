import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  NavigationTab, RewardItem, PointTransaction, TripRecord,
  VehicleProfile, EmergencyContact, UserProfile, UserSessionPayload
} from './types';
import {
  INITIAL_POINTS, INITIAL_XP, INITIAL_TRANSACTIONS, INITIAL_TRIPS
} from './data/mockData';

// Driver App Screen Components
import { AppHeader } from './components/app/AppHeader';
import { AppBottomNav } from './components/app/AppBottomNav';
import { HomeTelematicsView } from './components/app/HomeTelematicsView';
import { SquadsView } from './components/app/SquadsView';
import { MarketplaceView } from './components/app/MarketplaceView';
import { RoadIQView } from './components/app/RoadIQView';
import { ProfileView } from './components/app/ProfileView';
import { LoginView } from './components/auth/LoginView';

// Common Modals
import { InstallAppModal } from './components/common/InstallAppModal';
import { EmergencyModal } from './components/common/EmergencyModal';
import { TripSummaryModal } from './components/common/TripSummaryModal';
import { TripsHistoryModal } from './components/common/TripsHistoryModal';
import { AccidentCountdownModal } from './components/common/AccidentCountdownModal';
import { EditICEModal } from './components/common/EditICEModal';
import { accidentDetectionService } from './services/accidentDetection';
import { AccidentEvent } from './types';
import { api } from './lib/api';

export default function App() {
  // Navigation
  const [appTab, setAppTab] = useState<NavigationTab>('home');

  // Modals
  const [showSOSModal, setShowSOSModal] = useState<boolean>(false);
  const [showEditICEModal, setShowEditICEModal] = useState<boolean>(false);
  const [showTripSummary, setShowTripSummary] = useState<boolean>(false);
  const [completedTrip, setCompletedTrip] = useState<TripRecord | null>(null);
  const [showTripsHistory, setShowTripsHistory] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // High-Accuracy Accident Detection & Auto-Dispatch State
  const [accidentEvent, setAccidentEvent] = useState<AccidentEvent | null>(null);
  const [showAccidentModal, setShowAccidentModal] = useState<boolean>(false);

  // Time string for phone status bar
  const [timeStr, setTimeStr] = useState<string>('09:41');

  // Google Maps Platform Quota Exceeded state (Client-Side Quota Defense)
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);


  // Theme State: 'dark' (Night Tarmac) | 'light' (Paper Chalk)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('safedrive_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('safedrive_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark', 'dark-mode');
      document.documentElement.classList.remove('light', 'light-mode');
    } else {
      document.documentElement.classList.add('light', 'light-mode');
      document.documentElement.classList.remove('dark', 'dark-mode');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const isAuthedSession = (sessionStorage.getItem('safedrive_authenticated') || sessionStorage.getItem('safepod_authenticated')) === 'true';
    const saved = localStorage.getItem('safedrive_user_profile') || localStorage.getItem('safepod_user_profile');
    if (saved && isAuthedSession) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, isAuthenticated: true };
      } catch {
        // fallback
      }
    }
    return {
      name: 'Arjun Sharma',
      phone: '9876543210',
      dlNumber: 'DL-0420180054321',
      dlVerified: true,
      dlDetails: {
        dlNumber: 'DL-0420180054321',
        holderName: 'ARJUN SHARMA',
        issueDate: '14-Aug-2018',
        validUntil: '13-Aug-2038',
        vehicleClasses: ['MCWG (Motorcycle with Gear)', 'LMV (Light Motor Vehicle)'],
        issuingRTO: 'DL-04 West Delhi Janakpuri RTO',
        status: 'VERIFIED',
        bloodGroup: 'B+',
      },
      isAuthenticated: false,
      joinedDate: 'Aug 2022',
      historicalSafeScore: 88,
      totalKms: 1840,
      totalRides: 42,
      autoDetectRidesEnabled: true,
      autoDetectThresholdSpeed: 15,
      driverRole: 'Motorcycle Cruiser • Regular Commuter',
      badgeLabel: 'TOP 10% SAFE RIDER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    };
  });

  useEffect(() => {
    localStorage.setItem('safedrive_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Capture PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Listen for High-Accuracy Accident Detection Events across the app
  useEffect(() => {
    const unsub = accidentDetectionService.subscribeAccident((event) => {
      setAccidentEvent(event);
      setShowAccidentModal(true);
    });
    return unsub;
  }, []);

  const handleTriggerInstall = async () => {

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // User State (Points, XP, Transactions) with local persistence
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('safedrive_points') || localStorage.getItem('safepod_points');
    return saved ? parseInt(saved, 10) : INITIAL_POINTS;
  });

  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('safedrive_xp') || localStorage.getItem('safepod_xp');
    return saved ? parseInt(saved, 10) : INITIAL_XP;
  });

  const [transactions, setTransactions] = useState<PointTransaction[]>(() => {
    const saved = localStorage.getItem('safedrive_transactions') || localStorage.getItem('safepod_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [trips, setTrips] = useState<TripRecord[]>(() => {
    const saved = localStorage.getItem('safedrive_trips') || localStorage.getItem('safepod_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [vehicle, setVehicle] = useState<VehicleProfile>(() => {
    const saved = localStorage.getItem('safedrive_vehicle') || localStorage.getItem('safepod_vehicle');
    return saved
      ? JSON.parse(saved)
      : {
          type: 'motorcycle',
          model: 'Royal Enfield Hunter 350',
          registrationNumber: 'DL 01 AB 7890',
          fuelType: 'Petrol',
        };
  });

  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>(() => {
    const saved = localStorage.getItem('safedrive_ice') || localStorage.getItem('safepod_ice');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {
        // fallback
      }
    }
    return {
      name: '',
      phone: '',
      relationship: '',
    };
  });

  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('safedrive_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('safedrive_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('safedrive_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('safedrive_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('safedrive_vehicle', JSON.stringify(vehicle));
  }, [vehicle]);

  useEffect(() => {
    localStorage.setItem('safedrive_ice', JSON.stringify(emergencyContact));
  }, [emergencyContact]);

  // Point earning & penalty deduction handler
  const handleEarnPoints = (amount: number, reason: string) => {
    setPoints((prev) => Math.max(0, prev + amount));
    setXp((prev) => Math.max(0, prev + (amount > 0 ? amount * 2 : 0)));
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        title: reason,
        date: 'Just now',
        amount: amount,
        type: amount >= 0 ? 'earn' : 'redeem',
        category: 'Telematics',
      },
      ...prev,
    ]);
  };


  // Reward redemption handler
  const handleRedeemReward = (reward: RewardItem) => {
    if (points >= reward.cost) {
      setPoints((prev) => prev - reward.cost);
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          title: `Redeemed ${reward.title}`,
          date: 'Just now',
          amount: -reward.cost,
          type: 'redeem',
          category: 'Marketplace',
        },
        ...prev,
      ]);
    }
  };

  // Road IQ initiation completion
  const handleCompleteInitiation = () => {
    handleEarnPoints(250, 'Road IQ Level 0 Initiation Passed');
  };

  // Dynamic Historical SafeScore computed from rider's performance and rule compliance across completed trips
  const historicalSafeScore = useMemo(() => {
    if (!trips || trips.length === 0) return userProfile.historicalSafeScore || 86;
    const scores = trips.slice(0, 10).map((t) => t.score);
    const avg = scores.reduce((acc, s) => acc + s, 0) / scores.length;
    return Math.round(avg);
  }, [trips, userProfile.historicalSafeScore]);

  // Finish Trip handler
  const handleFinishTrip = (trip: TripRecord) => {
    setTrips((prev) => [trip, ...prev]);
    setCompletedTrip(trip);
    setShowTripSummary(true);
    // Asynchronously submit trip to API / cloud store
    api.submitCompletedTrip(trip).catch(() => {});
    // Update user profile statistics
    setUserProfile((prev) => ({
      ...prev,
      totalKms: Math.round((prev.totalKms + trip.distanceKm) * 10) / 10,
      totalRides: prev.totalRides + 1,
      historicalSafeScore: Math.round((prev.historicalSafeScore * 0.7) + (trip.score * 0.3)),
    }));
  };

  // Login Success & Driver Data Hydration handler
  const handleLoginSuccess = (session: UserSessionPayload) => {
    sessionStorage.setItem('safedrive_authenticated', 'true');
    setUserProfile(session.userProfile);
    setVehicle(session.vehicle);
    setEmergencyContact(session.emergencyContact);
    setPoints(session.points);
    setXp(session.xp);
    if (session.trips && session.trips.length > 0) {
      setTrips(session.trips);
    }
    if (session.transactions && session.transactions.length > 0) {
      setTransactions(session.transactions);
    }
  };

  // Logout / Switch Driver handler
  const handleLogout = () => {
    sessionStorage.removeItem('safedrive_authenticated');
    sessionStorage.removeItem('safepod_authenticated');
    api.setToken(null);
    setUserProfile((prev) => ({
      ...prev,
      isAuthenticated: false,
    }));
  };

  // Render Screens
  const renderAppScreen = () => {
    switch (appTab) {
      case 'home':
        return (
          <HomeTelematicsView
            onNavigateTab={(tab) => setAppTab(tab)}
            onEarnPoints={handleEarnPoints}
            onOpenSOS={() => setShowSOSModal(true)}
            onOpenTrips={() => setShowTripsHistory(true)}
            onFinishTrip={handleFinishTrip}
            vehicle={vehicle}
            points={points}
            historicalSafeScore={historicalSafeScore}
            autoDetectEnabled={userProfile.autoDetectRidesEnabled}
            autoDetectThreshold={userProfile.autoDetectThresholdSpeed || 15}
            recentTrips={trips}
            onCoordsUpdate={(coords) => setCurrentCoords(coords)}
            userProfile={userProfile}
            emergencyContact={emergencyContact}
            activeAccidentEvent={accidentEvent}
            onTriggerAccident={(ev) => {
              setAccidentEvent(ev);
              setShowAccidentModal(true);
            }}
            theme={theme}
          />

        );
      case 'leagues':
        return (
          <SquadsView
            onOpenHome={() => setAppTab('home')}
            onOpenRoadIQ={() => setAppTab('roadiq')}
          />
        );
      case 'rewards':
        return (
          <MarketplaceView
            points={points}
            xp={xp}
            transactions={transactions}
            onRedeemReward={handleRedeemReward}
          />
        );
      case 'roadiq':
        return (
          <RoadIQView
            onCompleteInitiation={handleCompleteInitiation}
            onClose={() => setAppTab('home')}
          />
        );
      case 'profile':
        return (
          <ProfileView
            userProfile={userProfile}
            onUpdateUserProfile={setUserProfile}
            onLogout={handleLogout}
            points={points}
            xp={xp}
            historicalSafeScore={historicalSafeScore}
            onOpenRoadIQ={() => setAppTab('roadiq')}
            onOpenInstall={() => setShowInstallModal(true)}
            onOpenTrips={() => setShowTripsHistory(true)}
            onOpenSOS={() => setShowSOSModal(true)}
            emergencyContact={emergencyContact}
            onUpdateEmergencyContact={setEmergencyContact}
            onOpenEditICE={() => setShowEditICEModal(true)}
            vehicle={vehicle}
            onUpdateVehicle={setVehicle}
          />
        );
    }
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center font-body sm:p-4 overflow-hidden transition-colors"
      style={{
        backgroundColor: theme === 'dark' ? '#0F1411' : '#EFECE2',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Phone Shell Layout */}
      <div
        className="w-full h-[100dvh] sm:h-[94vh] sm:max-h-[890px] sm:max-w-md sm:rounded-[40px] overflow-hidden sm:shadow-2xl sm:border-[6px] flex flex-col relative transition-colors"
        style={{
          backgroundColor: 'var(--color-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Google Maps Platform Quota Exceeded Sticky Notice */}
        {gmpQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm shrink-0">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        {/* Desktop Phone Status Bar simulation */}
        <div
          className="hidden sm:flex items-center justify-between px-6 pt-2.5 pb-1 text-[11px] font-telematics select-none z-30 shrink-0 transition-colors"
          style={{
            backgroundColor: 'var(--color-header-bg)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{timeStr}</span>
          <div
            className="w-24 h-4.5 rounded-full mx-auto -mt-1 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-card)' }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--color-bg)' }}
            />
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[10px]">
            <span>5G</span>
            <span style={{ color: 'var(--color-primary-btn)' }}>100%</span>
          </div>
        </div>

        {!userProfile.isAuthenticated ? (
          <LoginView onLoginSuccess={handleLoginSuccess} currentProfile={userProfile} />
        ) : (
          <>
            {/* Global Application Header */}
            <AppHeader
              points={points}
              xp={xp}
              isDriving={appTab === 'home'}
              onOpenProfile={() => setAppTab('profile')}
              onOpenRewards={() => setAppTab('rewards')}
              onOpenSOS={() => setShowSOSModal(true)}
              userProfile={userProfile}
              onSwitchDriver={handleLogout}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            {/* Main Application Screen Viewport */}
            <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">
              <AnimatePresence mode="wait">
                {renderAppScreen()}
              </AnimatePresence>
            </div>

            {/* Global Bottom Navigation */}
            <AppBottomNav
              currentTab={appTab}
              onSelectTab={(tab) => setAppTab(tab)}
            />
          </>
        )}
      </div>

      {/* Emergency Assistance & SOS Modal */}
      <EmergencyModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
        currentCoords={currentCoords}
        emergencyContact={emergencyContact}
        onEditEmergencyContact={() => setShowEditICEModal(true)}
      />

      {/* Edit Auto-Dispatch ICE Emergency Contact Modal */}
      <EditICEModal
        isOpen={showEditICEModal}
        onClose={() => setShowEditICEModal(false)}
        emergencyContact={emergencyContact}
        onSave={(updated) => {
          setEmergencyContact(updated);
          api.updateEmergencyContact(updated).catch(() => {});
        }}
        onTestDispatch={(contact) => {
          if (accidentEvent) {
            accidentDetectionService.dispatchAutomatedSMS(
              accidentEvent,
              userProfile,
              vehicle,
              contact
            );
          } else {
            const simulatedEvent = accidentDetectionService.simulateCrash();
            accidentDetectionService.dispatchAutomatedSMS(
              simulatedEvent,
              userProfile,
              vehicle,
              contact
            );
          }
        }}
      />

      {/* Trip Completion Summary Modal */}
      <TripSummaryModal
        trip={completedTrip}
        isOpen={showTripSummary}
        onClose={() => setShowTripSummary(false)}
      />

      {/* Trips History Log Modal */}
      <TripsHistoryModal
        isOpen={showTripsHistory}
        onClose={() => setShowTripsHistory(false)}
        trips={trips}
      />

      {/* Standalone Web App Download & Installation Guide Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerInstall}
      />

      {/* High-Accuracy Accident Collision Auto-Dispatch Modal */}
      <AccidentCountdownModal
        isOpen={showAccidentModal}
        event={accidentEvent}
        onClose={() => setShowAccidentModal(false)}
        userProfile={userProfile}
        vehicle={vehicle}
        emergencyContact={emergencyContact}
        onConfirmDispatch={(dispatchedEvent) => {
          setAccidentEvent(dispatchedEvent);
        }}
        onEditEmergencyContact={() => setShowEditICEModal(true)}
      />
    </div>
  );
}

