import { UserProfile, VehicleProfile, EmergencyContact, TripRecord, PointTransaction, DLVerificationDetails } from '../types';

export interface RegisteredDriverRecord {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  dlNumber: string;
  dlDetails: DLVerificationDetails;
  vehicle: VehicleProfile;
  emergencyContact: EmergencyContact;
  historicalSafeScore: number;
  totalKms: number;
  totalRides: number;
  points: number;
  xp: number;
  joinedDate: string;
  driverRole: string;
  badgeLabel: string;
  trips: TripRecord[];
  transactions: PointTransaction[];
}

export const REGISTERED_DRIVERS: RegisteredDriverRecord[] = [
  {
    id: 'driver-arjun',
    name: 'Arjun Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '9876543210',
    email: 'arjun.sharma@safedrive.net',
    dlNumber: 'DL-0420180054321',
    driverRole: 'Motorcycle Cruiser • Regular Commuter',
    badgeLabel: 'TOP 10% SAFE RIDER',
    joinedDate: 'Aug 2022',
    historicalSafeScore: 88,
    totalKms: 1840,
    totalRides: 42,
    points: 2450,
    xp: 980,
    dlDetails: {
      dlNumber: 'DL-0420180054321',
      holderName: 'ARJUN SHARMA',
      issueDate: '14-Aug-2018',
      validUntil: '13-Aug-2038',
      vehicleClasses: ['MCWG (Motorcycle with Gear)', 'LMV (Light Motor Vehicle)'],
      issuingRTO: 'DL-04 Janakpuri Delhi RTO',
      status: 'VERIFIED',
      bloodGroup: 'B+',
    },
    vehicle: {
      type: 'motorcycle',
      model: 'Royal Enfield Hunter 350',
      registrationNumber: 'DL 01 AB 7890',
      fuelType: 'Petrol',
    },
    emergencyContact: {
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      relationship: 'Spouse',
    },
    trips: [
      {
        id: 'trip-arjun-101',
        startTime: Date.now() - 3600000 * 4,
        endTime: Date.now() - 3600000 * 3.6,
        dateStr: 'Today, 08:30 AM',
        distanceKm: 8.4,
        durationSec: 1440,
        avgSpeedKmH: 44,
        maxSpeedKmH: 58,
        score: 94,
        smoothBrakingPct: 96,
        phoneFocusPct: 100,
        co2SavedKg: 0.92,
        pointsEarned: 165,
        xpEarned: 330,
        origin: 'Koramangala 4th Block',
        destination: 'Indiranagar 100ft Rd',
        rewardGrade: 'S+',
        rewardFactorsSummary: 'Zero harsh brakes, respected 50 km/h zonal limit',
      },
      {
        id: 'trip-arjun-102',
        startTime: Date.now() - 3600000 * 28,
        endTime: Date.now() - 3600000 * 27.2,
        dateStr: 'Yesterday, 06:15 PM',
        distanceKm: 12.2,
        durationSec: 2160,
        avgSpeedKmH: 38,
        maxSpeedKmH: 52,
        score: 91,
        smoothBrakingPct: 92,
        phoneFocusPct: 100,
        co2SavedKg: 1.34,
        pointsEarned: 220,
        xpEarned: 440,
        origin: 'Connaught Place Outer',
        destination: 'Saket District Centre',
        rewardGrade: 'A',
      },
    ],
    transactions: [
      {
        id: 'tx-arjun-1',
        title: 'Trip Reward: Koramangala 4th Block',
        date: 'Today',
        amount: 165,
        type: 'earn',
        category: 'Telematics',
      },
      {
        id: 'tx-arjun-2',
        title: 'Trip Reward: Connaught Place Outer',
        date: 'Yesterday',
        amount: 220,
        type: 'earn',
        category: 'Telematics',
      },
      {
        id: 'tx-arjun-3',
        title: 'Weekly Safe Corridor Adherence Bonus',
        date: '3 days ago',
        amount: 350,
        type: 'earn',
        category: 'Bonus',
      },
    ],
  },
  {
    id: 'driver-neha',
    name: 'Neha Verma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '9811223344',
    email: 'neha.verma@safedrive.net',
    dlNumber: 'MH-0220200084321',
    driverRole: 'EV Commuter • Eco Champion',
    badgeLabel: 'ZERO INFRACTION GOLD',
    joinedDate: 'Jan 2023',
    historicalSafeScore: 96,
    totalKms: 3420,
    totalRides: 68,
    points: 4120,
    xp: 1640,
    dlDetails: {
      dlNumber: 'MH-0220200084321',
      holderName: 'NEHA VERMA',
      issueDate: '05-Feb-2020',
      validUntil: '04-Feb-2040',
      vehicleClasses: ['LMV (Light Motor Vehicle)', 'MCWOG (Motorcycle Without Gear)'],
      issuingRTO: 'MH-02 Andheri Mumbai RTO',
      status: 'VERIFIED',
      bloodGroup: 'O+',
    },
    vehicle: {
      type: 'car',
      model: 'Tata Nexon EV Max',
      registrationNumber: 'MH 02 EV 9110',
      fuelType: 'EV',
    },
    emergencyContact: {
      name: 'Dr. Rajesh Verma',
      phone: '+91 98112 23399',
      relationship: 'Father',
    },
    trips: [
      {
        id: 'trip-neha-201',
        startTime: Date.now() - 3600000 * 3,
        endTime: Date.now() - 3600000 * 2.5,
        dateStr: 'Today, 09:15 AM',
        distanceKm: 14.8,
        durationSec: 1800,
        avgSpeedKmH: 42,
        maxSpeedKmH: 60,
        score: 97,
        smoothBrakingPct: 98,
        phoneFocusPct: 100,
        co2SavedKg: 2.1,
        pointsEarned: 290,
        xpEarned: 580,
        origin: 'Bandra West Promenade',
        destination: 'BKC Financial Center',
        rewardGrade: 'S+',
        rewardFactorsSummary: 'Zero emissions, 100% speed adherence, ultra-smooth regenerative braking',
      },
    ],
    transactions: [
      {
        id: 'tx-neha-1',
        title: 'Trip Reward: Bandra to BKC',
        date: 'Today',
        amount: 290,
        type: 'earn',
        category: 'Telematics',
      },
      {
        id: 'tx-neha-2',
        title: 'Clean Electric Mobility Champion',
        date: '2 days ago',
        amount: 500,
        type: 'earn',
        category: 'Bonus',
      },
    ],
  },
  {
    id: 'driver-vikram',
    name: 'Vikram Singh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '9988776655',
    email: 'vikram.singh@safedrive.net',
    dlNumber: 'KA-0320190019283',
    driverRole: 'Urban Courier • Smart Scooter',
    badgeLabel: 'URBAN EXPLORER',
    joinedDate: 'Jun 2023',
    historicalSafeScore: 82,
    totalKms: 5120,
    totalRides: 114,
    points: 1890,
    xp: 820,
    dlDetails: {
      dlNumber: 'KA-0320190019283',
      holderName: 'VIKRAM SINGH',
      issueDate: '22-Nov-2019',
      validUntil: '21-Nov-2039',
      vehicleClasses: ['MCWG (Motorcycle with Gear)', 'LMV (Light Motor Vehicle)'],
      issuingRTO: 'KA-03 Indiranagar Bengaluru RTO',
      status: 'VERIFIED',
      bloodGroup: 'A+',
    },
    vehicle: {
      type: 'scooter',
      model: 'Ather 450X Gen 3',
      registrationNumber: 'KA 03 EV 2049',
      fuelType: 'EV',
    },
    emergencyContact: {
      name: 'Sunita Singh',
      phone: '+91 99887 76611',
      relationship: 'Mother',
    },
    trips: [
      {
        id: 'trip-vikram-301',
        startTime: Date.now() - 3600000 * 6,
        endTime: Date.now() - 3600000 * 5.4,
        dateStr: 'Today, 07:45 AM',
        distanceKm: 11.2,
        durationSec: 1620,
        avgSpeedKmH: 39,
        maxSpeedKmH: 54,
        score: 84,
        smoothBrakingPct: 86,
        phoneFocusPct: 98,
        co2SavedKg: 1.15,
        pointsEarned: 140,
        xpEarned: 280,
        origin: 'HSR Layout Sector 1',
        destination: 'Electronic City Phase 1',
        rewardGrade: 'B',
        rewardFactorsSummary: 'Minor speed variation, good cornering stability',
      },
    ],
    transactions: [
      {
        id: 'tx-vikram-1',
        title: 'Trip Reward: HSR to Electronic City',
        date: 'Today',
        amount: 140,
        type: 'earn',
        category: 'Telematics',
      },
    ],
  },
];

export function lookupOrGenerateDriverRecord(
  identifier: string,
  preferredName?: string
): RegisteredDriverRecord {
  const cleanId = identifier.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Check if matches one of the pre-configured IDs or phone or DL
  const existing = REGISTERED_DRIVERS.find(
    (d) =>
      d.phone.includes(cleanId) ||
      cleanId.includes(d.phone) ||
      d.dlNumber.replace(/[^A-Z0-9]/g, '') === cleanId ||
      d.dlNumber.includes(cleanId) ||
      cleanId.includes(d.dlNumber.replace(/[^A-Z0-9]/g, ''))
  );

  if (existing) {
    return existing;
  }

  // Generate realistic custom profile based on input
  const nameToUse = (preferredName && preferredName.trim().length > 2)
    ? preferredName.trim()
    : 'Driver ' + (cleanId.slice(-4) || '7890');

  const stateCode = cleanId.slice(0, 2).match(/[A-Z]{2}/) ? cleanId.slice(0, 2) : 'DL';
  const rtoCode = cleanId.slice(2, 4).match(/[0-9]{2}/) ? cleanId.slice(2, 4) : '04';
  const dlFormatted = `${stateCode}-${rtoCode}${new Date().getFullYear() - 4}${cleanId.slice(-7).padStart(7, '0')}`;

  const stateNames: Record<string, string> = {
    DL: 'Delhi',
    MH: 'Maharashtra',
    KA: 'Karnataka',
    UP: 'Uttar Pradesh',
    HR: 'Haryana',
    TN: 'Tamil Nadu',
    TS: 'Telangana',
    GJ: 'Gujarat',
    WB: 'West Bengal',
  };

  const stateName = stateNames[stateCode] || 'National';

  return {
    id: `driver-dyn-${Date.now()}`,
    name: nameToUse,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: cleanId.length >= 10 ? cleanId.slice(-10) : '9876543210',
    email: `${nameToUse.toLowerCase().replace(/\s+/g, '.')}@safedrive.net`,
    dlNumber: dlFormatted,
    driverRole: 'Registered SafeDrive Telematics Driver',
    badgeLabel: 'VERIFIED REGISTRY DRIVER',
    joinedDate: 'Today',
    historicalSafeScore: 87,
    totalKms: 450,
    totalRides: 12,
    points: 1200,
    xp: 450,
    dlDetails: {
      dlNumber: dlFormatted,
      holderName: nameToUse.toUpperCase(),
      issueDate: '15-Mar-2021',
      validUntil: '14-Mar-2041',
      vehicleClasses: ['MCWG (Motorcycle with Gear)', 'LMV (Light Motor Vehicle)'],
      issuingRTO: `${stateCode}-${rtoCode} ${stateName} Central RTO`,
      status: 'VERIFIED',
      bloodGroup: 'B+',
    },
    vehicle: {
      type: 'motorcycle',
      model: 'Honda CB350 Hness',
      registrationNumber: `${stateCode} ${rtoCode} EQ 4421`,
      fuelType: 'Petrol',
    },
    emergencyContact: {
      name: 'Primary Family Contact',
      phone: '+91 98765 00000',
      relationship: 'Family Member',
    },
    trips: [
      {
        id: `trip-dyn-${Date.now()}`,
        startTime: Date.now() - 3600000 * 5,
        endTime: Date.now() - 3600000 * 4.4,
        dateStr: 'Today, 08:45 AM',
        distanceKm: 9.2,
        durationSec: 1500,
        avgSpeedKmH: 42,
        maxSpeedKmH: 56,
        score: 89,
        smoothBrakingPct: 91,
        phoneFocusPct: 98,
        co2SavedKg: 0.85,
        pointsEarned: 150,
        xpEarned: 300,
        origin: 'Main Highway Sector 12',
        destination: 'Central Business District',
        rewardGrade: 'A',
      },
    ],
    transactions: [
      {
        id: `tx-dyn-${Date.now()}`,
        title: 'Initial Welcome SafePoints',
        date: 'Today',
        amount: 1000,
        type: 'earn',
        category: 'Bonus',
      },
      {
        id: `tx-dyn-${Date.now() + 1}`,
        title: 'Trip Reward: Central Business District',
        date: 'Today',
        amount: 150,
        type: 'earn',
        category: 'Telematics',
      },
    ],
  };
}
