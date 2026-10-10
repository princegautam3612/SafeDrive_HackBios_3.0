export type NavigationTab = 'home' | 'leagues' | 'rewards' | 'profile' | 'roadiq';

export interface DLVerificationDetails {
  dlNumber: string;
  holderName: string;
  issueDate: string;
  validUntil: string;
  vehicleClasses: string[]; // e.g. ['MCWG', 'LMV']
  issuingRTO: string;
  status: 'VERIFIED' | 'PENDING' | 'INVALID';
  bloodGroup?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  dlNumber: string;
  dlVerified: boolean;
  dlDetails?: DLVerificationDetails;
  isAuthenticated: boolean;
  joinedDate: string;
  historicalSafeScore: number;
  totalKms: number;
  totalRides: number;
  autoDetectRidesEnabled: boolean;
  autoDetectThresholdSpeed: number; // in km/h (default 15)
  driverRole?: string;
  badgeLabel?: string;
}

export interface UserSessionPayload {
  userProfile: UserProfile;
  vehicle: VehicleProfile;
  emergencyContact: EmergencyContact;
  points: number;
  xp: number;
  trips: TripRecord[];
  transactions: PointTransaction[];
}

export interface TripRecord {
  id: string;
  startTime: number;
  endTime: number;
  dateStr: string;
  distanceKm: number;
  durationSec: number;
  avgSpeedKmH: number;
  maxSpeedKmH: number;
  score: number;
  smoothBrakingPct: number;
  phoneFocusPct: number;
  co2SavedKg: number;
  pointsEarned: number;
  xpEarned: number;
  origin?: string;
  destination?: string;
  speedLimit?: number;
  speedAdherencePct?: number;
  harshBrakeCount?: number;
  autoDetected?: boolean;
  neuralScore?: number;
  driverArchetype?: string;
  rewardGrade?: 'S+' | 'A' | 'B' | 'C' | 'D';
  rewardFactorsSummary?: string;
  telemetrySamples?: number[]; // speed readings for chart
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface VehicleProfile {
  type: 'motorcycle' | 'scooter' | 'car' | 'ev';
  model: string;
  registrationNumber: string;
  fuelType: 'Petrol' | 'EV' | 'Diesel' | 'CNG';
}

/**
 * Validates whether a vehicle is a supported two-wheeler (motorcycle or scooter).
 * Four-wheelers (cars, SUVs, LMVs) are strictly incompatible.
 */
export function isTwoWheeler(vehicle?: VehicleProfile | null): boolean {
  if (!vehicle) return false;
  const t = (vehicle.type || '').toLowerCase();
  const m = (vehicle.model || '').toLowerCase();
  if (t === 'car' || t.includes('car') || t.includes('four') || t.includes('lmv')) return false;
  if (m.includes('nexon') || m.includes('car') || m.includes('sedan') || m.includes('suv') || m.includes('creta') || m.includes('swift')) return false;
  return t === 'motorcycle' || t === 'scooter' || (t === 'ev' && !m.includes('nexon') && !m.includes('car'));
}

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  status: string;
  score: number;
  isCurrentUser?: boolean;
  trend: 'up' | 'down' | 'same';
  streakDays: number;
  highlightBadge?: string;
}

export interface ActiveChallenge {
  id: string;
  title: string;
  iconType: 'speed' | 'moon' | 'leaf' | 'shield';
  currentValue: number;
  targetValue: number;
  unit: string;
  rewardXp: number;
  rewardPoints: number;
  description: string;
  completed?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  subtitle: string;
  cost: number;
  badge: 'POPULAR' | 'PREMIUM' | 'IMPACT' | 'GREEN' | 'EXCLUSIVE';
  category: 'fuel' | 'insurance' | 'trees' | 'ev' | 'all';
  image: string;
  terms: string;
  partner: string;
  expiryDays: number;
}

export interface PointTransaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'earn' | 'redeem';
  category: string;
}

export interface QuizQuestion {
  id: string;
  level: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TelemetryState {
  isDriving: boolean;
  speed: number;
  speedLimit: number;
  bufferSeconds: number;
  driveScore: number;
  brakingG: number;
  corneringG: number;
  phoneDistraction: boolean;
  tripDistanceKm: number;
  tripDurationSec: number;
  co2SavedKg: number;
  pointsEarned: number;
  recentEvent?: string;
}

export interface AccidentEvent {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  impactG: number;
  gyroRateDegSec: number;
  confidenceScore: number;
  preCrashSpeedKmH: number;
  severity: 'CRITICAL' | 'SEVERE' | 'MODERATE';
  status: 'COUNTDOWN_ACTIVE' | 'DISPATCHED' | 'CANCELLED_SAFE';
  messageSent?: boolean;
  callInitiated?: boolean;
  notes?: string;
  locationName?: string;
}

export interface RoadAnomalyEvent {
  id: string;
  timestamp: number;
  type: 'POTHOLE' | 'SPEED_BREAKER' | 'ROUGH_SURFACE';
  zImpulseG: number;
  latitude: number;
  longitude: number;
  speedKmH: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SpeedZone {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'residential' | 'arterial' | 'elevated' | 'expressway' | 'radar_zone';
  limitKmH: number;
  center: { lat: number; lng: number };
  radiusMeters: number;
  description: string;
  roadName: string;
}

