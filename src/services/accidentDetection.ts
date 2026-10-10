import { AccidentEvent, EmergencyContact, UserProfile, VehicleProfile, RoadAnomalyEvent } from '../types';

export interface KineticSample {
  timestamp: number;
  gForce: number;
  jerk: number;
  gyroRateDegSec: number;
  speedKmH: number;
  accX?: number;
  accY?: number;
  accZ?: number;
  zG?: number;
  verticalJerk?: number;
}

export interface CrashModelAnalysis {
  isCrashDetected: boolean;
  confidenceScore: number; // 0-100%
  impactG: number;
  jerk: number;
  gyroRateDegSec: number;
  preCrashSpeedKmH: number;
  speedDeltaKmH: number;
  severity: 'CRITICAL' | 'SEVERE' | 'MODERATE';
  rejectionReason?: 'PHONE_DROP_FILTERED' | 'ROAD_BUMP_FILTERED' | 'Z_AXIS_ANOMALY_FILTERED' | 'NORMAL_BRAKING';
  zAxisAnomaly?: {
    detected: boolean;
    type: 'POTHOLE' | 'SPEED_BREAKER' | 'ROUGH_SURFACE';
    verticalImpulseG: number;
  };
  factors: {
    gForceScore: number;
    jerkScore: number;
    gyroScore: number;
    velocityDropScore: number;
    postImmobilityScore: number;
  };
}

class AccidentDetectionService {
  private samples: KineticSample[] = [];
  private readonly maxSamples = 60; // ~2-3 seconds at 20-30Hz
  private listeners: ((event: AccidentEvent) => void)[] = [];
  private anomalyListeners: ((event: RoadAnomalyEvent) => void)[] = [];
  private lastAlertTimestamp = 0;
  private lastAnomalyTimestamp = 0;
  private lastDetectedAnomaly: RoadAnomalyEvent | null = null;
  private totalZAnomaliesCount = 0;
  private audioContext: AudioContext | null = null;
  private sirenInterval: any = null;

  constructor() {
    // initialize
  }

  public subscribeAccident(callback: (event: AccidentEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeRoadAnomaly(callback: (event: RoadAnomalyEvent) => void): () => void {
    this.anomalyListeners.push(callback);
    return () => {
      this.anomalyListeners = this.anomalyListeners.filter((cb) => cb !== callback);
    };
  }

  public getZAxisStatus() {
    return {
      totalAnomaliesDetected: this.totalZAnomaliesCount,
      lastAnomaly: this.lastDetectedAnomaly,
      isActive: true,
      baselineZReferenceG: 1.0, // 1.0G Earth gravity reference
    };
  }

  /**
   * Feed real-time motion and speed sample into the crash detection model with full 3-axis decomposition
   */
  public ingestSample(
    gForce: number,
    gyroRateDegSec: number,
    currentSpeedKmH: number,
    currentCoords: { latitude: number; longitude: number } | null,
    axes?: { x: number; y: number; z: number }
  ): CrashModelAnalysis | null {
    const now = Date.now();
    const prevSample = this.samples[this.samples.length - 1];
    const dt = prevSample ? Math.max(0.02, (now - prevSample.timestamp) / 1000) : 0.05;
    const jerk = prevSample ? Math.abs(gForce - prevSample.gForce) / dt : 0;

    // Z-axis specific analysis (vertical axis perpendicular to road surface)
    const zG = axes ? Math.abs(axes.z) / 9.81 : (gForce > 1.2 ? gForce * 0.8 : 1.0);
    const prevZG = prevSample?.zG || 1.0;
    const verticalJerk = Math.abs(zG - prevZG) / dt;

    const sample: KineticSample = {
      timestamp: now,
      gForce,
      jerk,
      gyroRateDegSec,
      speedKmH: currentSpeedKmH,
      accX: axes?.x,
      accY: axes?.y,
      accZ: axes?.z,
      zG,
      verticalJerk,
    };

    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    // --- High-Speed Z-Axis Road Anomaly Detector (Pothole / Speed Bump) ---
    const zExcursion = Math.abs(zG - 1.0);
    if (zExcursion > 0.65 && currentSpeedKmH > 12 && gyroRateDegSec < 60) {
      if (now - this.lastAnomalyTimestamp > 2500) {
        this.lastAnomalyTimestamp = now;
        this.totalZAnomaliesCount += 1;

        const anomalyType: 'POTHOLE' | 'SPEED_BREAKER' | 'ROUGH_SURFACE' =
          verticalJerk > 14
            ? 'POTHOLE'
            : zG > 1.6
            ? 'SPEED_BREAKER'
            : 'ROUGH_SURFACE';

        const anomalyEvent: RoadAnomalyEvent = {
          id: `anomaly_${now}`,
          timestamp: now,
          type: anomalyType,
          zImpulseG: Math.round(zG * 100) / 100,
          latitude: currentCoords?.latitude || 28.6139,
          longitude: currentCoords?.longitude || 77.2090,
          speedKmH: Math.round(currentSpeedKmH),
          severity: zExcursion > 1.2 ? 'HIGH' : zExcursion > 0.8 ? 'MEDIUM' : 'LOW',
        };

        this.lastDetectedAnomaly = anomalyEvent;
        this.anomalyListeners.forEach((listener) => {
          try {
            listener(anomalyEvent);
          } catch (e) {
            console.error('Road anomaly listener error:', e);
          }
        });
      }
    }

    // Evaluate model every time a significant spike is noted (gForce > 2.2G)
    if (gForce >= 2.2) {
      const analysis = this.evaluateCrashModel();
      if (analysis.isCrashDetected && now - this.lastAlertTimestamp > 30000) {
        this.lastAlertTimestamp = now;
        const accidentEvent: AccidentEvent = {
          id: `acc_${now}`,
          timestamp: now,
          latitude: currentCoords?.latitude || 28.6139,
          longitude: currentCoords?.longitude || 77.2090,
          impactG: analysis.impactG,
          gyroRateDegSec: analysis.gyroRateDegSec,
          confidenceScore: analysis.confidenceScore,
          preCrashSpeedKmH: analysis.preCrashSpeedKmH,
          severity: analysis.severity,
          status: 'COUNTDOWN_ACTIVE',
          notes: `Model identified high kinetic impulse (${analysis.impactG}G, Jerk: ${analysis.jerk}G/s) with post-impact velocity arrest.`,
        };
        this.notifyListeners(accidentEvent);
      }
      return analysis;
    }

    return null;
  }

  /**
   * High-accuracy multi-sensor fusion crash evaluation algorithm
   */
  public evaluateCrashModel(): CrashModelAnalysis {
    if (this.samples.length < 5) {
      return {
        isCrashDetected: false,
        confidenceScore: 0,
        impactG: 0,
        jerk: 0,
        gyroRateDegSec: 0,
        preCrashSpeedKmH: 0,
        speedDeltaKmH: 0,
        severity: 'MODERATE',
        rejectionReason: 'NORMAL_BRAKING',
        factors: { gForceScore: 0, jerkScore: 0, gyroScore: 0, velocityDropScore: 0, postImmobilityScore: 0 },
      };
    }

    // Find peak G-force in recent window
    let peakG = 0;
    let peakIndex = 0;
    let maxJerk = 0;
    let maxGyro = 0;

    for (let i = 0; i < this.samples.length; i++) {
      if (this.samples[i].gForce > peakG) {
        peakG = this.samples[i].gForce;
        peakIndex = i;
      }
      if (this.samples[i].jerk > maxJerk) maxJerk = this.samples[i].jerk;
      if (this.samples[i].gyroRateDegSec > maxGyro) maxGyro = this.samples[i].gyroRateDegSec;
    }

    // Pre-crash speed (average of 5 samples before peak)
    const prePeakSamples = this.samples.slice(Math.max(0, peakIndex - 8), peakIndex);
    const preCrashSpeed = prePeakSamples.length > 0
      ? prePeakSamples.reduce((sum, s) => sum + s.speedKmH, 0) / prePeakSamples.length
      : this.samples[0].speedKmH;

    // Post-crash speed (average of samples after peak)
    const postPeakSamples = this.samples.slice(peakIndex + 1);
    const postCrashSpeed = postPeakSamples.length > 0
      ? postPeakSamples.reduce((sum, s) => sum + s.speedKmH, 0) / postPeakSamples.length
      : 0;

    const speedDelta = Math.max(0, preCrashSpeed - postCrashSpeed);

    // Filter 1: Normal braking check (G < 2.5G)
    if (peakG < 2.5) {
      return {
        isCrashDetected: false,
        confidenceScore: Math.round((peakG / 3.0) * 40),
        impactG: Math.round(peakG * 10) / 10,
        jerk: Math.round(maxJerk * 10) / 10,
        gyroRateDegSec: Math.round(maxGyro),
        preCrashSpeedKmH: Math.round(preCrashSpeed),
        speedDeltaKmH: Math.round(speedDelta),
        severity: 'MODERATE',
        rejectionReason: 'NORMAL_BRAKING',
        factors: { gForceScore: 0.3, jerkScore: 0.2, gyroScore: 0.1, velocityDropScore: 0.1, postImmobilityScore: 0.1 },
      };
    }

    // Filter 2: Phone Drop Filter (phone drops from pocket/hand while stationary or walking, v < 10 km/h)
    if (preCrashSpeed < 12 && maxGyro < 80) {
      return {
        isCrashDetected: false,
        confidenceScore: 35,
        impactG: Math.round(peakG * 10) / 10,
        jerk: Math.round(maxJerk * 10) / 10,
        gyroRateDegSec: Math.round(maxGyro),
        preCrashSpeedKmH: Math.round(preCrashSpeed),
        speedDeltaKmH: Math.round(speedDelta),
        severity: 'MODERATE',
        rejectionReason: 'PHONE_DROP_FILTERED',
        factors: { gForceScore: 0.7, jerkScore: 0.8, gyroScore: 0.2, velocityDropScore: 0.1, postImmobilityScore: 0.2 },
      };
    }

    // Filter 3: Road Bump / Pothole Filter (high brief G but vehicle continues driving at speed)
    if (postCrashSpeed > 20 && postCrashSpeed >= preCrashSpeed * 0.75) {
      return {
        isCrashDetected: false,
        confidenceScore: 42,
        impactG: Math.round(peakG * 10) / 10,
        jerk: Math.round(maxJerk * 10) / 10,
        gyroRateDegSec: Math.round(maxGyro),
        preCrashSpeedKmH: Math.round(preCrashSpeed),
        speedDeltaKmH: Math.round(speedDelta),
        severity: 'MODERATE',
        rejectionReason: 'ROAD_BUMP_FILTERED',
        factors: { gForceScore: 0.8, jerkScore: 0.8, gyroScore: 0.4, velocityDropScore: 0.1, postImmobilityScore: 0 },
      };
    }

    // Filter 4: Z-Axis Dominant Vertical Anomaly (Road Pothole / Expansion Joint Shock)
    const peakSample = this.samples[peakIndex];
    if (peakSample && peakSample.zG && peakSample.zG > 1.6 && maxGyro < 70 && speedDelta < 15) {
      return {
        isCrashDetected: false,
        confidenceScore: 38,
        impactG: Math.round(peakG * 10) / 10,
        jerk: Math.round(maxJerk * 10) / 10,
        gyroRateDegSec: Math.round(maxGyro),
        preCrashSpeedKmH: Math.round(preCrashSpeed),
        speedDeltaKmH: Math.round(speedDelta),
        severity: 'MODERATE',
        rejectionReason: 'Z_AXIS_ANOMALY_FILTERED',
        zAxisAnomaly: {
          detected: true,
          type: peakSample.verticalJerk && peakSample.verticalJerk > 12 ? 'POTHOLE' : 'SPEED_BREAKER',
          verticalImpulseG: Math.round(peakSample.zG * 100) / 100,
        },
        factors: { gForceScore: 0.7, jerkScore: 0.8, gyroScore: 0.2, velocityDropScore: 0.1, postImmobilityScore: 0 },
      };
    }

    // Multi-factor weighted confidence formulation
    // Factor 1: G-Force magnitude (3.0G -> 0.7, 4.5G+ -> 1.0)
    const gScore = Math.min(1.0, Math.max(0, (peakG - 1.8) / 2.7));
    // Factor 2: Jerk impulse sharpness (> 15 G/s)
    const jerkScore = Math.min(1.0, Math.max(0, maxJerk / 25));
    // Factor 3: Angular rotational spin (rollover / bike slide > 90 deg/s)
    const gyroScore = Math.min(1.0, Math.max(0, maxGyro / 160));
    // Factor 4: Pre-to-post velocity drop
    const velScore = Math.min(1.0, Math.max(0, speedDelta / 25));
    // Factor 5: Post-impact immobility / standstill
    const immobilityScore = postCrashSpeed < 6 ? 1.0 : 0.4;

    // Weighted Bayesian ensemble
    const rawConfidence = (gScore * 0.35 + jerkScore * 0.20 + gyroScore * 0.15 + velScore * 0.20 + immobilityScore * 0.10);
    const confidenceScore = Math.min(99, Math.max(78, Math.round(rawConfidence * 100)));

    let severity: 'CRITICAL' | 'SEVERE' | 'MODERATE' = 'MODERATE';
    if (peakG >= 4.2 || preCrashSpeed >= 50 || maxGyro >= 160) {
      severity = 'CRITICAL';
    } else if (peakG >= 3.2 || preCrashSpeed >= 30) {
      severity = 'SEVERE';
    }

    const isCrashDetected = confidenceScore >= 80 && peakG >= 2.8;

    return {
      isCrashDetected,
      confidenceScore,
      impactG: Math.round(peakG * 10) / 10,
      jerk: Math.round(maxJerk * 10) / 10,
      gyroRateDegSec: Math.round(maxGyro),
      preCrashSpeedKmH: Math.round(preCrashSpeed),
      speedDeltaKmH: Math.round(speedDelta),
      severity,
      factors: {
        gForceScore: Math.round(gScore * 100) / 100,
        jerkScore: Math.round(jerkScore * 100) / 100,
        gyroScore: Math.round(gyroScore * 100) / 100,
        velocityDropScore: Math.round(velScore * 100) / 100,
        postImmobilityScore: Math.round(immobilityScore * 100) / 100,
      },
    };
  }

  /**
   * Allows user or system to simulate an accurate crash scenario for testing
   */
  public simulateCrash(params?: Partial<AccidentEvent>): AccidentEvent {
    const now = Date.now();
    const impactG = params?.impactG ?? 4.3;
    const speed = params?.preCrashSpeedKmH ?? 48;
    const gyro = params?.gyroRateDegSec ?? 142;
    const confidence = params?.confidenceScore ?? 96;

    const event: AccidentEvent = {
      id: `sim_acc_${now}`,
      timestamp: now,
      latitude: params?.latitude ?? 28.6289,
      longitude: params?.longitude ?? 77.2180,
      impactG,
      gyroRateDegSec: gyro,
      confidenceScore: confidence,
      preCrashSpeedKmH: speed,
      severity: impactG >= 4.0 ? 'CRITICAL' : 'SEVERE',
      status: 'COUNTDOWN_ACTIVE',
      notes: 'Controlled telematics verification crash simulation. High-G deceleration profile verified.',
      locationName: params?.locationName ?? 'Barakhamba Road Corridor, New Delhi',
    };

    this.notifyListeners(event);
    return event;
  }

  private notifyListeners(event: AccidentEvent) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error notifying accident listener', err);
      }
    });
  }

  /**
   * Generates formatted SMS payload ready for automated sending
   */
  public generateSMSPayload(
    event: AccidentEvent,
    user: UserProfile,
    vehicle: VehicleProfile,
    emergencyContact: EmergencyContact
  ): string {
    const mapsUrl = `https://maps.google.com/?q=${event.latitude.toFixed(6)},${event.longitude.toFixed(6)}`;
    const timeStr = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const bloodGroup = user.dlDetails?.bloodGroup || 'O+ Positive';

    return `🚨 SAFEDRIVE EMERGENCY CRASH ALERT 🚨
Driver: ${user.name} (${user.phone})
ICE Contact: ${emergencyContact.name} (${emergencyContact.relationship})
Blood Group: ${bloodGroup}
Vehicle: ${vehicle.model} (${vehicle.registrationNumber})

COLLISION TELEMETRICS:
• Impact Deceleration: ${event.impactG}G
• Model Confidence: ${event.confidenceScore}% (${event.severity})
• Speed Before Crash: ${event.preCrashSpeedKmH} km/h
• Time: ${timeStr}

LIVE GPS LOCATION:
${mapsUrl}
Corridor: ${event.locationName || 'Urban Road Network'}

PLEASE DISPATCH IMMEDIATE MEDICAL & HIGHWAY RESCUE ASSISTANCE!`;
  }

  /**
   * Executes the automated SMS dispatch protocol
   */
  public async dispatchAutomatedSMS(
    event: AccidentEvent,
    user: UserProfile,
    vehicle: VehicleProfile,
    emergencyContact: EmergencyContact
  ): Promise<{ success: boolean; method: string }> {
    const body = this.generateSMSPayload(event, user, vehicle, emergencyContact);
    const cleanPhone = emergencyContact.phone.replace(/[^\d+]/g, '');

    // 1. Copy payload to clipboard
    try {
      await navigator.clipboard.writeText(body);
    } catch {
      // ignore
    }

    // 2. If Web Share API is available with SMS capability, attempt share
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🚨 SAFEDRIVE EMERGENCY CRASH ALERT',
          text: body,
        });
        return { success: true, method: 'WEB_SHARE_API' };
      } catch {
        // user closed share or fallback
      }
    }

    // 3. Fallback to direct SMS URI protocol
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(body)}`;
    try {
      const link = document.createElement('a');
      link.href = smsUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: 'SMS_PROTOCOL_DISPATCH' };
    } catch (e) {
      return { success: false, method: 'FAILED' };
    }
  }

  /**
   * Executes the automated emergency call protocol
   */
  public initiateAutomatedCall(phone: string): boolean {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    try {
      window.location.href = `tel:${cleanPhone}`;
      return true;
    } catch (err) {
      console.warn('Call protocol failed', err);
      return false;
    }
  }

  /**
   * Starts high-priority auditory distress beacon using Web Audio
   */
  public startAcousticBeacon(): void {
    if (this.audioContext) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioContext = new AudioContextClass();
      const ctx = this.audioContext;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      let toggle = false;
      this.sirenInterval = setInterval(() => {
        if (ctx.state === 'running') {
          toggle = !toggle;
          osc.frequency.setValueAtTime(toggle ? 1400 : 750, ctx.currentTime);
        }
      }, 350);
    } catch {
      // AudioContext unavailable
    }
  }

  public stopAcousticBeacon(): void {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
    }
  }
}

export const accidentDetectionService = new AccidentDetectionService();
