import { SpeedZone } from '../types';

export type { SpeedZone };

export const MAP_SPEED_ZONES: SpeedZone[] = [
  {
    id: 'zone_school_dps',
    name: 'DPS & AIIMS Campus Pedestrian Zone',
    type: 'school',
    limitKmH: 30,
    center: { lat: 28.5820, lng: 77.2340 },
    radiusMeters: 550,
    description: 'Active child pedestrian & medical emergency zone. Strict 30 km/h limit enforced.',
    roadName: 'Sri Aurobindo Marg / Ring Intersection',
  },
  {
    id: 'zone_cp_inner',
    name: 'Connaught Place Commercial Heritage Zone',
    type: 'residential',
    limitKmH: 40,
    center: { lat: 28.6315, lng: 77.2167 },
    radiusMeters: 850,
    description: 'Dense retail & pedestrian crossing precinct. Speed ceiling 40 km/h.',
    roadName: 'Inner & Outer Circle, Connaught Place',
  },
  {
    id: 'zone_radar_barakhamba',
    name: 'Delhi Traffic Police Radar Camera Zone',
    type: 'radar_zone',
    limitKmH: 50,
    center: { lat: 28.6289, lng: 77.2180 },
    radiusMeters: 650,
    description: 'Automated 24/7 laser radar speed violation capture cameras active.',
    roadName: 'Barakhamba Road Corridor',
  },
  {
    id: 'zone_blackspot_ashoka',
    name: 'MoRTH Accident Blackspot Caution Zone',
    type: 'arterial',
    limitKmH: 40,
    center: { lat: 28.6012, lng: 77.2250 },
    radiusMeters: 700,
    description: 'High-risk merge junction. Advisory limit reduced to 40 km/h.',
    roadName: 'Ashoka Road / C-Hexagon',
  },
  {
    id: 'zone_barapullah_elevated',
    name: 'Barapullah Elevated Bypass Corridor',
    type: 'elevated',
    limitKmH: 60,
    center: { lat: 28.5870, lng: 77.2400 },
    radiusMeters: 1400,
    description: 'Signal-free elevated expressway. 60 km/h regulated transit speed.',
    roadName: 'Banda Bahadur Marg Flyover',
  },
  {
    id: 'zone_dnd_flyway',
    name: 'Delhi-Noida Direct (DND) Flyway',
    type: 'expressway',
    limitKmH: 70,
    center: { lat: 28.5700, lng: 77.2900 },
    radiusMeters: 2600,
    description: 'Multi-lane inter-city expressway. 70 km/h speed threshold.',
    roadName: 'DND Toll Corridor',
  },
  {
    id: 'zone_meerut_expressway',
    name: 'Delhi-Meerut National Expressway',
    type: 'expressway',
    limitKmH: 80,
    center: { lat: 28.6180, lng: 77.3400 },
    radiusMeters: 3500,
    description: 'Access-controlled national transit corridor. 80 km/h highway ceiling.',
    roadName: 'NH-9 Expressway Section',
  },
];

export const DEFAULT_URBAN_ZONE: SpeedZone = {
  id: 'zone_delhi_urban_default',
  name: 'Delhi-NCR Standard Urban Arterial',
  type: 'arterial',
  limitKmH: 50,
  center: { lat: 28.6139, lng: 77.2090 },
  radiusMeters: 15000,
  description: 'Standard municipal urban arterial road network speed limit.',
  roadName: 'City Urban Arterial',
};

/**
 * Calculates Haversine distance in meters between two lat/lng points
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ZoneAnalysisResult {
  currentZone: SpeedZone;
  speedLimit: number;
  isInsideSpecificZone: boolean;
  distanceToZoneCenterMeters: number;
  allNearbyZones: { zone: SpeedZone; distanceMeters: number; isInside: boolean }[];
}

/**
 * Evaluates the driver's current coordinates against all map-listed speed zones
 */
export function analyzeLocationSpeedZone(lat: number, lng: number): ZoneAnalysisResult {
  // If coordinates are invalid, return default
  if (!lat || !lng || (lat === 0 && lng === 0)) {
    return {
      currentZone: DEFAULT_URBAN_ZONE,
      speedLimit: DEFAULT_URBAN_ZONE.limitKmH,
      isInsideSpecificZone: false,
      distanceToZoneCenterMeters: 0,
      allNearbyZones: [],
    };
  }

  const sortedZones = MAP_SPEED_ZONES.map((zone) => {
    const dist = calculateDistanceMeters(lat, lng, zone.center.lat, zone.center.lng);
    return {
      zone,
      distanceMeters: Math.round(dist),
      isInside: dist <= zone.radiusMeters,
    };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);

  // Check if driver is inside any active zone boundary
  // Prioritize safety-critical lower limits (e.g. school zones) if overlapping
  const activeEnclosing = sortedZones
    .filter((z) => z.isInside)
    .sort((a, b) => a.zone.limitKmH - b.zone.limitKmH);

  if (activeEnclosing.length > 0) {
    const topZone = activeEnclosing[0];
    return {
      currentZone: topZone.zone,
      speedLimit: topZone.zone.limitKmH,
      isInsideSpecificZone: true,
      distanceToZoneCenterMeters: topZone.distanceMeters,
      allNearbyZones: sortedZones,
    };
  }

  // If outside all specific boundaries, use nearest zone info or default urban arterial
  const nearest = sortedZones[0];
  return {
    currentZone: DEFAULT_URBAN_ZONE,
    speedLimit: DEFAULT_URBAN_ZONE.limitKmH,
    isInsideSpecificZone: false,
    distanceToZoneCenterMeters: nearest ? nearest.distanceMeters : 0,
    allNearbyZones: sortedZones,
  };
}
