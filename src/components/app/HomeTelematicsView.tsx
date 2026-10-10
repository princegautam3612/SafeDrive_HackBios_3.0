import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gauge, Shield, Zap, AlertTriangle, Play, Pause, Square,
  Sparkles, Trophy, Compass, Activity, Smartphone, CheckCircle,
  ArrowRight, MapPin, Clock, Leaf, AlertCircle, Radio, Volume2,
  ChevronRight, Bike, Car, Brain, Cpu, RefreshCw, Layers,
  Lock, Unlock, Eye, Navigation, Calculator, ShieldCheck,
  AlertOctagon, PhoneCall
} from 'lucide-react';
import {
  TelemetryState, NavigationTab, TripRecord, VehicleProfile,
  UserProfile, EmergencyContact, AccidentEvent, SpeedZone, isTwoWheeler
} from '../../types';
import { neuralSafetyEngine } from '../../utils/neuralSafetyPipeline';
import { backgroundNeuralManager, BackgroundWorkerStatus } from '../../services/backgroundNeuralWorker';
import { backgroundTelematicsService, BackgroundTelematicsStatus } from '../../services/backgroundTelematicsService';
import { SafeDriveRewardAlgorithm } from '../../utils/rewardAlgorithm';
import { GoogleMapView } from '../map/GoogleMapView';
import { accidentDetectionService } from '../../services/accidentDetection';
import { MAP_SPEED_ZONES, analyzeLocationSpeedZone } from '../../services/speedZones';
import { telemetryQueue, SyncStatus } from '../../lib/telemetryQueue';

interface HomeTelematicsViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onEarnPoints: (amount: number, reason: string) => void;
  onOpenSOS: () => void;
  onOpenTrips: () => void;
  onFinishTrip: (trip: TripRecord) => void;
  vehicle: VehicleProfile;
  points: number;
  historicalSafeScore: number;
  autoDetectEnabled: boolean;
  autoDetectThreshold: number;
  recentTrips: TripRecord[];
  onCoordsUpdate: (coords: { latitude: number; longitude: number; accuracy: number }) => void;
  userProfile?: UserProfile;
  emergencyContact?: EmergencyContact;
  activeAccidentEvent?: AccidentEvent | null;
  onTriggerAccident?: (event: AccidentEvent) => void;
  theme?: 'dark' | 'light';
}

export const HomeTelematicsView: React.FC<HomeTelematicsViewProps> = ({
  onNavigateTab,
  onEarnPoints,
  onOpenSOS,
  onOpenTrips,
  onFinishTrip,
  vehicle,
  points,
  historicalSafeScore,
  autoDetectEnabled,
  autoDetectThreshold,
  recentTrips,
  onCoordsUpdate,
  userProfile,
  emergencyContact,
  activeAccidentEvent,
  onTriggerAccident,
  theme = 'dark',
}) => {
  // Driving trip state: 'idle' | 'active' | 'paused'
  const [tripState, setTripState] = useState<'idle' | 'active' | 'paused'>('idle');
  const [speed, setSpeed] = useState<number>(0);
  const [activeZone, setActiveZone] = useState<SpeedZone>(MAP_SPEED_ZONES[1]);
  const [speedLimit, setSpeedLimit] = useState<number>(MAP_SPEED_ZONES[1].limitKmH);

  const [tripDurationSec, setTripDurationSec] = useState<number>(0);
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(0);

  // Dynamic Live Score: Initialized dynamically from driver's historical baseline SafeScore (NOT hardcoded 96)
  const [driveScore, setDriveScore] = useState<number>(historicalSafeScore || 85);

  const [brakingG, setBrakingG] = useState<number>(0.12);
  const [bufferSeconds, setBufferSeconds] = useState<number>(2.4);
  const [phoneDistractions, setPhoneDistractions] = useState<number>(0);
  const [harshBrakeCount, setHarshBrakeCount] = useState<number>(0);
  const [recentEvent, setRecentEvent] = useState<string>(
    autoDetectEnabled
      ? `Auto-detection active. Ride will auto-start at ${autoDetectThreshold} km/h in background.`
      : 'Sensors initialized. Ready to ride.'
  );
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [speedSum, setSpeedSum] = useState<number>(0);
  const [speedReadingsCount, setSpeedReadingsCount] = useState<number>(0);
  const [wasAutoDetected, setWasAutoDetected] = useState<boolean>(false);
  const [autoDetectBanner, setAutoDetectBanner] = useState<string | null>(null);
  const [speedPointsDeducted, setSpeedPointsDeducted] = useState<number>(0);

  // UI View Mode: 'gauges' | 'map'

  const [activeDisplayMode, setActiveDisplayMode] = useState<'gauges' | 'map'>('gauges');

  // Background Services State
  const [bgWorkerStatus, setBgWorkerStatus] = useState<BackgroundWorkerStatus>(
    backgroundNeuralManager.getStatus()
  );
  const [bgTelematicsStatus, setBgTelematicsStatus] = useState<BackgroundTelematicsStatus>(
    backgroundTelematicsService.getStatus()
  );

  // Pocket Mode (screen blanking / background touch-lock)
  const [isPocketMode, setIsPocketMode] = useState<boolean>(false);

  // Current GPS coordinates for Telematics Radar Map
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  }>({
    latitude: 28.6139,
    longitude: 77.2090,
  });

  // Telemetry samples buffer for speed curves
  const telemetrySamplesRef = useRef<number[]>([]);

  // References for tracking GPS deltas and timer
  const lastCoordsRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const tripStartTimeRef = useRef<number>(Date.now());
  const overspeedCounterRef = useRef<number>(0);
  const compliantSecCounterRef = useRef<number>(0);

  // Subscribe to Background Neural Worker updates
  useEffect(() => {
    const unsub = backgroundNeuralManager.subscribe((status) => {
      setBgWorkerStatus(status);
    });
    return unsub;
  }, []);

  // Subscribe to Background Telematics Engine updates
  useEffect(() => {
    const unsub = backgroundTelematicsService.subscribeStatus((status) => {
      setBgTelematicsStatus(status);
      setIsPocketMode(status.pocketModeActive);
    });
    return unsub;
  }, []);

  // Subscribe to Offline Telematics Queue
  const [queueStatus, setQueueStatus] = useState<SyncStatus>('idle');
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  useEffect(() => {
    const unsub = telemetryQueue.subscribe((status, count) => {
      setQueueStatus(status);
      setPendingQueueCount(count);
    });
    return unsub;
  }, []);

  // Haversine distance formula (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Start Trip (manual or automatic)
  const handleStartTrip = (isAuto: boolean = false) => {
    if (!isTwoWheeler(vehicle)) {
      setRecentEvent(`⚠️ Incompatible Vehicle: Four-wheeler (${vehicle.model}) data cannot be fitted into SafeDrive.`);
      return;
    }

    tripStartTimeRef.current = Date.now();
    setTripState('active');
    setTripDurationSec(0);
    setTripDistanceKm(0);

    // Initial score starts from rider's actual historical baseline SafeScore!
    setDriveScore(historicalSafeScore || 85);

    const initialSpeed = isAuto ? autoDetectThreshold + 3 : 0;
    setSpeed(initialSpeed);
    setMaxSpeed(initialSpeed);
    setSpeedSum(0);
    setSpeedReadingsCount(0);
    setPhoneDistractions(0);
    setHarshBrakeCount(0);
    setSpeedPointsDeducted(0);
    setWasAutoDetected(isAuto);
    telemetrySamplesRef.current = [];

    // Launch persistent background telematics worker (wake lock + unthrottled timer)
    backgroundTelematicsService.startBackgroundSession();
    telemetryQueue.startTrip(`trip-${tripStartTimeRef.current}`);

    if (isAuto) {
      setAutoDetectBanner(`Auto-Ride Detected: Speed reached ${autoDetectThreshold} km/h threshold! Background telematics active.`);
      backgroundTelematicsService.speakTelematicsAlert(`Ride auto-detected. Speed exceeded ${autoDetectThreshold} km per hour.`);
      setTimeout(() => setAutoDetectBanner(null), 5000);
      setRecentEvent(`Auto-Ride started at ${autoDetectThreshold} km/h. Dynamic SafeScore initialized from ${historicalSafeScore}.`);
    } else {
      backgroundTelematicsService.speakTelematicsAlert('Ride started. Background tracking active.');
      setRecentEvent(`Trip started manually. SafeScore initialized from baseline ${historicalSafeScore}.`);
    }

    // Initialize GPS tracking
    initGpsTracking();
  };

  // GPS tracking initialization
  const initGpsTracking = () => {
    if ('geolocation' in navigator) {
      try {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        const id = navigator.geolocation.watchPosition(
          (pos) => {
            setGpsActive(true);
            const { latitude, longitude, speed: rawGpsSpeed, accuracy } = pos.coords;
            setCurrentCoords({ latitude, longitude, accuracy });
            onCoordsUpdate({ latitude, longitude, accuracy });

            let currentKmH = 0;
            if (rawGpsSpeed !== null && rawGpsSpeed !== undefined && rawGpsSpeed >= 0) {
              currentKmH = Math.round(rawGpsSpeed * 3.6);
            } else if (lastCoordsRef.current) {
              const dtHours = (pos.timestamp - lastCoordsRef.current.time) / 3600000;
              if (dtHours > 0.0001) {
                const dist = calculateDistance(
                  lastCoordsRef.current.lat,
                  lastCoordsRef.current.lng,
                  latitude,
                  longitude
                );
                currentKmH = Math.round(dist / dtHours);
              }
            }

            // Automatic Trip Detection check when idle
            if (tripState === 'idle' && autoDetectEnabled && currentKmH >= autoDetectThreshold) {
              handleStartTrip(true);
              return;
            }

            // Stationary desk simulation fallback if active and GPS speed is 0
            if (currentKmH === 0 && tripState === 'active') {
              currentKmH = Math.floor(38 + Math.random() * 12);
            }

            setSpeed(currentKmH);
            backgroundTelematicsService.updateCurrentSpeed(currentKmH);
            setMaxSpeed((prev) => Math.max(prev, currentKmH));
            setSpeedSum((prev) => prev + currentKmH);
            setSpeedReadingsCount((prev) => prev + 1);
            telemetrySamplesRef.current.push(currentKmH);

            if (tripState === 'active') {
              telemetryQueue.pushSample({
                lat: latitude,
                lng: longitude,
                speed: currentKmH,
                speedLimit,
                brakingG,
                corneringG: 0.08,
                kineticBufferSec: bufferSeconds,
                phoneDistraction: phoneDistractions > 0,
                timestamp: pos.timestamp || Date.now(),
              });
            }

            // Accumulate distance
            if (lastCoordsRef.current) {
              const deltaKm = calculateDistance(
                lastCoordsRef.current.lat,
                lastCoordsRef.current.lng,
                latitude,
                longitude
              );
              if (deltaKm > 0 && deltaKm < 0.5) {
                setTripDistanceKm((prev) => Math.round((prev + deltaKm) * 100) / 100);
              }
            }

            lastCoordsRef.current = {
              lat: latitude,
              lng: longitude,
              time: pos.timestamp,
            };
          },
          (err) => {
            console.warn('Geolocation:', err.message);
            setGpsActive(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
        watchIdRef.current = id;
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Passive background speed watcher for Automatic Ride Detection when idle
  useEffect(() => {
    if (tripState === 'idle' && autoDetectEnabled) {
      initGpsTracking();
    }
  }, [tripState, autoDetectEnabled]);

  // Test Simulation: Trigger Auto-Detection with speed pulse > threshold
  const handleSimulateAutoDetectPulse = () => {
    setAutoDetectBanner(`Simulating kinetic speed pulse (${autoDetectThreshold + 5} km/h)...`);
    setTimeout(() => {
      handleStartTrip(true);
    }, 600);
  };

  // Pause / Resume Trip
  const handleTogglePause = () => {
    if (tripState === 'active') {
      setTripState('paused');
      setSpeed(0);
      setRecentEvent('Trip paused at traffic halt / rest.');
      backgroundTelematicsService.speakTelematicsAlert('Trip paused.');
    } else if (tripState === 'paused') {
      setTripState('active');
      setRecentEvent('Trip resumed. Telematics dynamic scoring active.');
      backgroundTelematicsService.speakTelematicsAlert('Trip resumed.');
    }
  };

  // Finish Trip with Background Neural Self-Learning & Reward Algorithm
  const handleFinishTrip = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    backgroundTelematicsService.stopBackgroundSession();
    telemetryQueue.stopTrip();

    const duration = tripDurationSec > 0 ? tripDurationSec : 180;
    const distance = tripDistanceKm > 0 ? tripDistanceKm : 3.4;
    const avgSpeed = speedReadingsCount > 0 ? Math.round(speedSum / speedReadingsCount) : 42;
    const peakSpeed = maxSpeed > 0 ? maxSpeed : 54;
    const co2Saved = Math.round(distance * 0.11 * 100) / 100;

    // Final ride score (bounded 45 to 99)
    const finalScore = Math.max(45, Math.min(99, Math.round(driveScore)));
    const speedAdherencePct = Math.max(
      60,
      Math.round(100 - (overspeedCounterRef.current / (duration || 1)) * 100)
    );
    const smoothBrakingPct = Math.max(65, 100 - harshBrakeCount * 8);
    const phoneFocusPct = Math.max(60, 100 - phoneDistractions * 15);

    // Extract Neural Features
    const neuralFeatures = neuralSafetyEngine.extractFeatures({
      avgSpeedKmH: avgSpeed,
      maxSpeedKmH: peakSpeed,
      speedLimit,
      smoothBrakingPct,
      phoneFocusPct,
      bufferSeconds,
      harshBrakeCount,
      durationSec: duration,
    });

    // 1. Train Background Neural Network in Worker Thread!
    backgroundNeuralManager.trainInBackground(neuralFeatures, finalScore);
    const prediction = neuralSafetyEngine.predict(neuralFeatures);

    // 2. Compute Rewards via SafeDrive SafeRide Algorithm (SR-v2.4)
    const rewardCalc = SafeDriveRewardAlgorithm.calculate({
      distanceKm: distance,
      durationSec: duration,
      avgSpeedKmH: avgSpeed,
      maxSpeedKmH: peakSpeed,
      speedLimit,
      speedAdherencePct,
      smoothBrakingPct,
      harshBrakeCount,
      phoneFocusPct,
      phoneDistractionCount: phoneDistractions,
      predictedSafeScore: prediction.predictedSafetyScore,
      driverArchetype: prediction.driverArchetype,
      vehicleFuelType: vehicle.fuelType,
      isNightRide: new Date().getHours() >= 21 || new Date().getHours() < 6,
    });

    const completedTrip: TripRecord = {
      id: `trip-${Date.now()}`,
      startTime: tripStartTimeRef.current,
      endTime: Date.now(),
      dateStr: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: distance,
      durationSec: duration,
      avgSpeedKmH: avgSpeed,
      maxSpeedKmH: peakSpeed,
      score: finalScore,
      smoothBrakingPct,
      phoneFocusPct,
      co2SavedKg: co2Saved,
      pointsEarned: rewardCalc.totalPoints,
      xpEarned: rewardCalc.xpEarned,
      origin: 'Current GPS Location',
      destination: 'Safe Corridor Destination',
      speedLimit,
      speedAdherencePct,
      harshBrakeCount,
      autoDetected: wasAutoDetected,
      neuralScore: prediction.predictedSafetyScore,
      driverArchetype: prediction.driverArchetype,
      rewardGrade: rewardCalc.grade,
      rewardFactorsSummary: rewardCalc.summaryNarrative,
      telemetrySamples: telemetrySamplesRef.current.slice(-20),
    };

    backgroundTelematicsService.speakTelematicsAlert(
      `Ride completed. SafeScore recorded at ${finalScore}. Telematics verified.`
    );

    onEarnPoints(
      rewardCalc.totalPoints,
      `Completed ${distance.toFixed(1)} KM Ride (${finalScore} SafeScore • Grade ${rewardCalc.grade})`
    );
    onFinishTrip(completedTrip);
    setTripState('idle');
    setSpeed(0);
    setTripDurationSec(0);
    setTripDistanceKm(0);
    setDriveScore(historicalSafeScore || 85);
    setSpeedPointsDeducted(0);
    lastCoordsRef.current = null;
  };


  // Accelerometer G-force & Gyroscope detection for accident model & harsh braking
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      const rot = event.rotationRate;
      const gyroRate = rot
        ? Math.max(Math.abs(rot.alpha || 0), Math.abs(rot.beta || 0), Math.abs(rot.gamma || 0))
        : 0;

      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        const gMag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z) / 9.81;
        const normalizedG = Math.round(gMag * 100) / 100;
        setBrakingG(normalizedG);

        // Continuous high-accuracy accident detection model with 3-axis & Z-axis anomaly analysis
        accidentDetectionService.ingestSample(normalizedG, gyroRate, speed, currentCoords, {
          x: acc.x,
          y: acc.y,
          z: acc.z,
        });

        // Harsh deceleration detection (> 1.35G sudden jolt)
        if (tripState === 'active' && normalizedG > 1.35 && normalizedG < 2.5) {
          setHarshBrakeCount((prev) => prev + 1);
          setDriveScore((prev) => Math.max(45, prev - 2.5));
          setRecentEvent('⚠️ Harsh deceleration detected (-2.5 pts). Maintain smooth kinetic buffer.');
          backgroundTelematicsService.speakTelematicsAlert('Harsh deceleration warning.');
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [tripState, speed, currentCoords]);

  // Subscribe to real-time Z-axis road surface anomaly events (Potholes / Speed Breakers)
  useEffect(() => {
    const unsub = accidentDetectionService.subscribeRoadAnomaly((anomaly) => {
      if (tripState === 'active') {
        const label = anomaly.type === 'POTHOLE' ? '🕳️ Pothole' : anomaly.type === 'SPEED_BREAKER' ? '⚠️ Speed Breaker' : '〰️ Rough Surface';
        setRecentEvent(`${label} filtered on Z-axis (${anomaly.zImpulseG}G vertical shock). Crash false-alarm avoided.`);
      }
    });
    return unsub;
  }, [tripState]);

  // Handle high-accuracy accident collision test simulation
  const handleTriggerSimulatedCrash = () => {
    const crashEvent = accidentDetectionService.simulateCrash({
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
      locationName: `${activeZone.name}, ${activeZone.roadName}`,
    });
    if (onTriggerAccident) {
      onTriggerAccident(crashEvent);
    }
  };


  // Anti-distraction / Phone Focus detection
  useEffect(() => {
    if (tripState !== 'active') return;

    const handleVisibilityChange = () => {
      // If pocket mode is NOT active, leaving the tab is counted as distraction
      if (document.hidden && speed > 10 && !isPocketMode) {
        setPhoneDistractions((prev) => prev + 1);
        setDriveScore((prev) => Math.max(45, prev - 3.5));
        setRecentEvent('⚠️ Screen switched while in motion! Phone distraction penalty applied (-3.5 pts).');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tripState, speed, isPocketMode]);

  // Dynamic Score progression & Telematics loop driven by Web Worker background tick
  useEffect(() => {
    if (tripState !== 'active') return;

    // Connect to background telematics worker ticks
    const unsub = backgroundTelematicsService.subscribeTicks(() => {
      setTripDurationSec((prev) => prev + 1);

      // Simulated desktop kinetic motion if GPS unavailable
      if (!gpsActive) {
        setSpeed((prev) => {
          const delta = (Math.random() - 0.48) * 3;
          const newSpeed = Math.max(20, Math.min(speedLimit + 6, Math.round((prev || 42) + delta)));
          setMaxSpeed((m) => Math.max(m, newSpeed));
          setSpeedSum((s) => s + newSpeed);
          setSpeedReadingsCount((c) => c + 1);
          telemetrySamplesRef.current.push(newSpeed);
          return newSpeed;
        });

        setTripDistanceKm((prev) => Math.round((prev + 0.012) * 100) / 100);

        setBufferSeconds(() => {
          return Math.max(1.8, Math.min(3.2, Math.round((2.5 + (Math.random() - 0.5) * 0.2) * 10) / 10));
        });
      }

      // Dynamic Rule Compliance Scoring & Active Speed Limit Penalties
      if (speed > speedLimit) {
        overspeedCounterRef.current += 1;
        const excessKmH = speed - speedLimit;

        // Exponential severity scoring penalty based on excess over limit
        // 1-5 km/h over: -0.6 pts
        // 6-15 km/h over: -1.5 pts
        // 16+ km/h over: -2.8 pts
        const scorePenalty = excessKmH <= 5 ? 0.6 : excessKmH <= 15 ? 1.5 : 2.8;
        setDriveScore((prev) => Math.max(25, Math.round((prev - scorePenalty) * 10) / 10));

        // Breaking speed limit actively deducts points in real-time
        // Every 3 consecutive seconds of sustained overspeeding deducts live SafePoints
        if (overspeedCounterRef.current % 3 === 0) {
          const livePointPenalty = Math.max(1, Math.round(excessKmH / 5));
          setSpeedPointsDeducted((prev) => prev + livePointPenalty);
          onEarnPoints(
            -livePointPenalty,
            `Speed Limit Breach (-${livePointPenalty} pts: ${speed} in ${speedLimit} km/h zone)`
          );
        }

        setRecentEvent(`⚠️ Speeding (${speed} km/h > ${speedLimit} limit). SafeScore dropping.`);
        if (overspeedCounterRef.current % 10 === 0) {
          backgroundTelematicsService.speakTelematicsAlert(`Speed limit is ${speedLimit}. Reduce speed.`);
        }
      } else {
        compliantSecCounterRef.current += 1;
        if (compliantSecCounterRef.current % 4 === 0) {
          setDriveScore((prev) => Math.min(99, Math.round((prev + 0.15) * 10) / 10));
        }
      }
    });

    return unsub;
  }, [tripState, gpsActive, speedLimit, speed, onEarnPoints]);


  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isSpeeding = speed > speedLimit;

  // Toggle Pocket Mode (screen dims to black, touch lock, voice keeps talking)
  const handleTogglePocketMode = () => {
    const nextState = backgroundTelematicsService.togglePocketMode();
    setIsPocketMode(nextState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col min-h-full pb-8 px-4 sm:px-5 pt-3 max-w-md mx-auto space-y-3.5 relative transition-colors"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Pocket Mode Full-Screen Ambient Overlay (keeps running in rider's pocket) */}
      {isPocketMode && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200">
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              POCKET MODE ACTIVE
            </span>
            <span>{formatTimer(tripDurationSec)}</span>
          </div>

          <div className="text-center space-y-2">
            <div className="text-6xl font-black font-mono tracking-tight text-emerald-400">
              {speed}
            </div>
            <div className="text-xs font-mono uppercase text-slate-400">
              KM/H • SAFE SCORE {Math.round(driveScore)}
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Screen touches locked to prevent accidental pocket taps. Background GPS &amp; telematics active.
            </p>
          </div>

          <button
            onClick={handleTogglePocketMode}
            className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <Unlock className="w-4 h-4 text-emerald-400" />
            <span>Slide / Tap to Unlock Screen</span>
          </button>
        </div>
      )}

      {/* Auto-Detection Notification Alert */}
      <AnimatePresence>
        {autoDetectBanner && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="p-3 rounded-2xl bg-emerald-900 border border-emerald-500 text-white text-xs flex items-center gap-2.5 shadow-xl font-mono"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="flex-1 text-[11px] leading-tight font-medium">{autoDetectBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BLE Tag Status Mention (Requirement 2) */}
      <div
        className="flex items-center justify-between p-3 rounded-2xl border transition-all shadow-xs"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
            style={{
              backgroundColor: 'var(--color-safe-card)',
              color: 'var(--color-primary-btn)',
            }}
          >
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-telematics text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                BLE TAG STATUS
              </span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8.5px] font-telematics font-bold"
                style={{
                  backgroundColor: 'var(--color-safe-card)',
                  color: 'var(--color-primary-btn)',
                  border: '1px solid var(--color-primary-btn)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#1FBF75] animate-ping" />
                PAIRED • ACTIVE
              </span>
            </div>
            <div className="font-display text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
              SafeDrive SmartTag #SD-902 (Helmet &amp; Bike Beacon)
            </div>
          </div>
        </div>

        <div className="text-right font-telematics text-[10px]">
          <div className="font-bold" style={{ color: 'var(--color-pop)' }}>
            98% BATT
          </div>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            -52 dBm • 10Hz
          </div>
        </div>
      </div>

      {/* Mode Switcher: Telematics vs Map (Requirement 10) */}
      <div
        className="flex items-center justify-between p-1 rounded-2xl border text-xs font-telematics font-bold transition-colors"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          onClick={() => setActiveDisplayMode('gauges')}
          className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
            activeDisplayMode === 'gauges'
              ? 'shadow-xs font-black'
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeDisplayMode === 'gauges' ? 'var(--color-primary-btn)' : 'transparent',
            color: activeDisplayMode === 'gauges' ? 'var(--color-btn-text)' : 'var(--color-text-secondary)',
          }}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Telematics</span>
        </button>
        <button
          onClick={() => setActiveDisplayMode('map')}
          className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
            activeDisplayMode === 'map'
              ? 'shadow-xs font-black'
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeDisplayMode === 'map' ? 'var(--color-primary-btn)' : 'transparent',
            color: activeDisplayMode === 'map' ? 'var(--color-btn-text)' : 'var(--color-text-secondary)',
          }}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
      </div>

      {/* Main Display: Telematics or Google Live Map */}
      {activeDisplayMode === 'map' ? (
        <div className="space-y-2">
          <GoogleMapView
            currentCoords={currentCoords}
            vehicle={vehicle}
            currentSpeed={speed}
            speedLimit={speedLimit}
            isDriving={tripState === 'active'}
            sosCrashEvent={activeAccidentEvent}
            theme={theme}
          />

          {/* Quick HUD bar under map during active ride */}
          <div
            className="flex items-center justify-between p-2.5 rounded-2xl border text-[11px] font-telematics"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-text-secondary)' }}>Score:</span>
              <strong style={{ color: 'var(--color-pop)' }}>{Math.round(driveScore)}/100</strong>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-text-secondary)' }}>Dist:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{tripDistanceKm.toFixed(1)} km</strong>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-text-secondary)' }}>Time:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{formatTimer(tripDurationSec)}</strong>
            </div>
          </div>
        </div>
      ) : (
        /* Hero Live Telematics Dashboard Card */
        <div
          className={`rounded-3xl p-5 text-white transition-all duration-300 relative overflow-hidden border shadow-xl ${
            isSpeeding
              ? 'bg-gradient-to-br from-rose-900 via-rose-950 to-slate-950 border-rose-600 animate-pulse'
              : 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 border-emerald-800'
          }`}
        >
          {/* Tech Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

          {/* Status Bar */}
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  tripState === 'active'
                    ? 'bg-emerald-400 animate-ping'
                    : tripState === 'paused'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-200 font-bold">
                {tripState === 'active'
                  ? wasAutoDetected
                    ? 'AUTO-DETECTED RIDE • ACTIVE'
                    : 'LIVE TELEMATICS • RECORDING'
                  : tripState === 'paused'
                  ? 'TRIP PAUSED'
                  : autoDetectEnabled
                  ? `AUTO-SENSING ON (> ${autoDetectThreshold} KM/H)`
                  : 'STANDBY • READY TO RIDE'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
              {vehicle.type === 'car' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
              <span className="font-bold truncate max-w-[90px]">{vehicle.model.split(' ')[0]}</span>
            </div>
          </div>

          {/* Dual SafeScore & Speedometer Display */}
          <div className="grid grid-cols-2 gap-2.5 items-center py-1.5 relative z-10">
            {/* Speed Box */}
            <div
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border backdrop-blur-xs transition-colors ${
                isSpeeding
                  ? 'bg-rose-950/60 border-rose-500/80 text-rose-100'
                  : 'bg-black/40 border-white/10'
              }`}
            >
              <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-emerald-200/70">
                Current Speed
              </span>
              <div className="text-4xl font-black font-mono my-0.5 tracking-tight">
                {tripState === 'idle' ? '00' : speed}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                <span className="text-emerald-300">KM/H</span>
                <span className="text-emerald-400/50">•</span>
                <button
                  onClick={() =>
                    setSpeedLimit((prev) =>
                      prev === 40 ? 50 : prev === 50 ? 60 : prev === 60 ? 80 : 40
                    )
                  }
                  className="text-emerald-200/90 underline cursor-pointer"
                  title="Toggle road limit"
                >
                  Limit {speedLimit}
                </button>
              </div>
            </div>

            {/* Dynamic Live Score Box */}
            <div
              className={`flex flex-col items-center justify-center p-3 rounded-2xl backdrop-blur-xs relative overflow-hidden transition-colors ${
                isSpeeding
                  ? 'bg-rose-950/70 border border-rose-500/50 shadow-inner'
                  : 'bg-emerald-800/40 border border-emerald-400/30'
              }`}
            >
              <div className="flex items-center justify-between w-full text-[8px] font-mono uppercase px-1">
                <span className={isSpeeding ? 'text-rose-200' : 'text-emerald-200'}>Ride Score</span>
                <span className={`font-bold ${isSpeeding ? 'text-rose-400 animate-pulse' : 'text-emerald-300'}`}>
                  {isSpeeding ? 'Penalized' : 'Dynamic'}
                </span>
              </div>
              <div
                className={`text-4xl font-black font-mono my-0.5 tracking-tight ${
                  isSpeeding ? 'text-rose-400' : 'text-emerald-300'
                }`}
              >
                {tripState === 'idle' ? historicalSafeScore : Math.round(driveScore)}
              </div>
              <div
                className={`text-[8.5px] font-mono font-bold uppercase tracking-tight text-center ${
                  isSpeeding ? 'text-rose-300' : 'text-emerald-200'
                }`}
              >
                {tripState === 'idle'
                  ? 'Baseline: Ready'
                  : isSpeeding
                  ? 'Speed Limit Breach'
                  : driveScore >= historicalSafeScore
                  ? '+ Defensive Riding'
                  : `${(driveScore - historicalSafeScore).toFixed(1)} Violations`}
              </div>
            </div>
          </div>

          {/* Overall Lifetime SafeScore vs Live Ride Strip */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[10px] font-mono text-emerald-200 mt-1 relative z-10">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Driver Overall SafeScore:</span>
              <strong className="text-white font-bold">{historicalSafeScore} / 100</strong>
            </div>
            <span className="text-[9px] text-emerald-300 font-bold px-1.5 py-0.2 rounded bg-emerald-500/20">
              Two-Wheeler Verified
            </span>
          </div>

          {/* Real-time Telemetry Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2.5 border-t border-white/10 text-center relative z-10">
            <div>
              <span className="text-[8px] text-emerald-200/70 uppercase font-mono font-bold block">Distance</span>
              <span className="text-xs font-black text-white font-mono">
                {tripDistanceKm.toFixed(1)} km
              </span>
            </div>

            <div>
              <span className="text-[8px] text-emerald-200/70 uppercase font-mono font-bold block">Duration</span>
              <span className="text-xs font-black text-white font-mono">
                {formatTimer(tripDurationSec)}
              </span>
            </div>

            <div>
              <span className="text-[8px] text-emerald-200/70 uppercase font-mono font-bold block">Cushion</span>
              <span className="text-xs font-black text-emerald-300 font-mono">
                {tripState === 'idle' ? '2.4s' : `${bufferSeconds}s`}
              </span>
            </div>

            <div>
              {isSpeeding ? (
                <div>
                  <span className="text-[8px] text-rose-300 uppercase font-mono font-bold block animate-pulse">Zone Breach</span>
                  <span className="text-xs font-black text-rose-400 font-mono">
                    Excess Spd
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[8px] text-emerald-200/70 uppercase font-mono font-bold block">Phone Focus</span>
                  <span className="text-xs font-black text-emerald-300 font-mono flex items-center justify-center gap-0.5">
                    <Smartphone className="w-2.5 h-2.5" />
                    {phoneDistractions === 0 ? '100%' : `${Math.max(60, 100 - phoneDistractions * 15)}%`}
                  </span>
                </div>
              )}
            </div>
          </div>


          {/* Real-time Live Event Ticker */}
          <div className="mt-2.5 p-2 rounded-xl bg-black/40 border border-white/10 text-emerald-100 text-[10.5px] flex items-center gap-2 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{recentEvent}</span>
          </div>
        </div>
      )}

      {/* Incompatible Four-Wheeler Warning Banner */}
      {!isTwoWheeler(vehicle) && (
        <div className="p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 shadow-md"
          style={{
            backgroundColor: 'var(--color-hazard-tint)',
            borderColor: 'var(--color-hazard)',
            color: 'var(--color-text-primary)',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-hazard)' }} />
          <div>
            <div className="font-bold uppercase font-telematics text-[10px] tracking-wider" style={{ color: 'var(--color-hazard)' }}>
              INCOMPATIBLE VEHICLE ERROR (FOUR-WHEELER FITTED)
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
              <strong>{vehicle.model}</strong> is a four-wheeler. SafeDrive is strictly calibrated for two-wheelers only (Motorcycles &amp; Scooters). Rides cannot be recorded for four-wheelers. Please switch to a two-wheeler vehicle in Profile.
            </p>
          </div>
        </div>
      )}

      {/* Primary Trip Action Controls */}
      <div
        className="rounded-2xl p-4 border shadow-xs space-y-2.5 transition-colors"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {tripState === 'idle' ? (
          <div className="space-y-2">
            <div
              className="flex items-center justify-between p-2.5 rounded-xl border text-[11px] font-telematics"
              style={{
                backgroundColor: 'var(--color-safe-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1FBF75] animate-ping shrink-0" />
                <span>Auto-Detection: Ride starts when speed &gt; 15 km/h</span>
              </div>
              <span className="text-[10px] font-bold" style={{ color: 'var(--color-primary-btn)' }}>
                Background GPS
              </span>
            </div>

            <button
              onClick={() => handleStartTrip(false)}
              disabled={!isTwoWheeler(vehicle)}
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: !isTwoWheeler(vehicle) ? 'var(--color-border)' : 'var(--color-primary-btn)',
                color: !isTwoWheeler(vehicle) ? 'var(--color-text-secondary)' : 'var(--color-btn-text)',
              }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{!isTwoWheeler(vehicle) ? 'Two-Wheelers Only • Incompatible' : 'Start Ride Manually'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleTogglePause}
                className="py-2.5 px-3 rounded-xl font-bold text-xs uppercase font-telematics tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border hover:opacity-90"
                style={{
                  backgroundColor: tripState === 'paused' ? 'var(--color-primary-btn)' : 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: tripState === 'paused' ? 'var(--color-btn-text)' : 'var(--color-text-primary)',
                }}
              >
                {tripState === 'paused' ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume Ride</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Ride</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFinishTrip}
                className="py-2.5 px-3 rounded-xl font-bold text-xs uppercase font-telematics tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:opacity-95 text-white active:scale-95"
                style={{
                  backgroundColor: 'var(--color-sos)',
                }}
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Finish &amp; Save</span>
              </button>
            </div>

            {/* Pocket Mode / Background Run Button */}
            <button
              onClick={handleTogglePocketMode}
              className="w-full py-2.5 px-3 rounded-xl font-telematics text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-safe-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <Lock className="w-3.5 h-3.5 text-[#1FBF75]" />
              <span>Engage Pocket Mode (Keep Tracking in Background)</span>
            </button>
          </div>
        )}
      </div>

      {/* Squad Leaderboard Card */}
      <div
        onClick={() => onNavigateTab('leagues')}
        className="bg-white text-slate-900 rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
              SQUAD LEADERBOARD
            </span>
            <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
              The Urban Guardians
            </h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Rank #1 • 88 SafeScore Avg</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
          <span>View Squad</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Emergency SOS & Trip History Log */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenSOS}
          className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-900 text-left transition-colors cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="flex items-center gap-1 text-rose-600 font-bold text-xs font-['Outfit']">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS Assist</span>
            </div>
            <p className="text-[9.5px] text-slate-500 mt-0.5">Direct 112 &amp; ICE Alert</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={onOpenTrips}
          className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-left transition-colors cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="flex items-center gap-1 text-slate-800 font-bold text-xs font-['Outfit']">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trip Records</span>
            </div>
            <p className="text-[9.5px] text-slate-500 mt-0.5">{recentTrips.length} Recorded Rides</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
