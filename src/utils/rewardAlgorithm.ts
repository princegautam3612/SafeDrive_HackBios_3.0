// SafeDrive SafeRide Reward Algorithm (SR-v2.4)
// Mathematical, multi-factor scoring model that converts kinetic telemetry & neural classification into SafePoints and XP.

export interface RewardCalculationInput {
  distanceKm: number;
  durationSec: number;
  avgSpeedKmH: number;
  maxSpeedKmH: number;
  speedLimit: number;
  speedAdherencePct: number; // 0 to 100
  smoothBrakingPct: number;   // 0 to 100
  harshBrakeCount: number;
  phoneFocusPct: number;      // 0 to 100
  phoneDistractionCount: number;
  predictedSafeScore: number; // 45 to 99 (from neural model)
  driverArchetype: 'Ultra-Defensive' | 'Balanced Commuter' | 'Dynamic Rider' | 'Aggressive Risk';
  vehicleFuelType: 'Petrol' | 'EV' | 'Diesel' | 'CNG';
  isNightRide?: boolean;
  isInHighRiskCorridor?: boolean;
}

export interface AlgorithmicFactor {
  id: string;
  name: string;
  category: 'base' | 'neural' | 'safety' | 'focus' | 'eco' | 'deduction';
  formula: string;
  multiplier: number;
  deltaPoints: number;
  description: string;
  status: 'positive' | 'neutral' | 'penalty';
}

export interface RewardCalculationResult {
  basePoints: number;
  totalPoints: number;
  xpEarned: number;
  effectiveRatePerKm: number;
  factors: AlgorithmicFactor[];
  summaryNarrative: string;
  grade: 'S+' | 'A' | 'B' | 'C' | 'D';
}

export class SafeDriveRewardAlgorithm {
  public static readonly BASE_RATE_PER_KM = 12; // 12 SafePoints per verified safe km

  public static calculate(input: RewardCalculationInput): RewardCalculationResult {
    const factors: AlgorithmicFactor[] = [];
    const distance = Math.max(0.2, input.distanceKm);

    // 1. Base Distance Rewards
    const basePoints = Math.round(distance * this.BASE_RATE_PER_KM);
    factors.push({
      id: 'base_distance',
      name: 'Kinetic Base Distance',
      category: 'base',
      formula: `Distance (${distance.toFixed(1)} km) × ${this.BASE_RATE_PER_KM} pts/km`,
      multiplier: 1.0,
      deltaPoints: basePoints,
      description: 'Standard distance credit for actively recorded telematics ride.',
      status: 'neutral',
    });

    let runningPoints = basePoints;

    // 2. Neural Driver Archetype Multiplier (from in-browser perceptron)
    let neuralMult = 1.0;
    let archetypeDesc = '';
    if (input.driverArchetype === 'Ultra-Defensive' || input.predictedSafeScore >= 92) {
      neuralMult = 1.35;
      archetypeDesc = 'Ultra-Defensive rider (+35% neural safety dividend)';
    } else if (input.driverArchetype === 'Balanced Commuter' || input.predictedSafeScore >= 80) {
      neuralMult = 1.15;
      archetypeDesc = 'Balanced Commuter (+15% consistent discipline bonus)';
    } else if (input.driverArchetype === 'Dynamic Rider' || input.predictedSafeScore >= 68) {
      neuralMult = 1.0;
      archetypeDesc = 'Standard dynamic profile (1.0x baseline)';
    } else {
      neuralMult = 0.75;
      archetypeDesc = 'Elevated risk profile (-25% cautionary discount)';
    }

    const neuralDelta = Math.round(runningPoints * (neuralMult - 1.0));
    runningPoints += neuralDelta;

    factors.push({
      id: 'neural_multiplier',
      name: `Neural Model: ${input.driverArchetype}`,
      category: 'neural',
      formula: `Base × ${neuralMult.toFixed(2)}x (Score: ${input.predictedSafeScore}/100)`,
      multiplier: neuralMult,
      deltaPoints: neuralDelta,
      description: archetypeDesc,
      status: neuralDelta >= 0 ? 'positive' : 'penalty',
    });

    // 3. Speed Compliance & Speed Limit Violation Penalties
    let speedDelta = 0;
    if (input.speedAdherencePct >= 95) {
      speedDelta = Math.round(basePoints * 0.25);
      factors.push({
        id: 'speed_compliance',
        name: 'Zone Speed Mastery (>95% in limit)',
        category: 'safety',
        formula: '+25% Base Distance Bonus',
        multiplier: 1.25,
        deltaPoints: speedDelta,
        description: `Maintained speed below ${input.speedLimit} km/h zone throughout 95%+ of the commute.`,
        status: 'positive',
      });
    } else if (input.speedAdherencePct >= 70 && input.speedAdherencePct < 85) {
      speedDelta = -Math.round(basePoints * 0.25);
      factors.push({
        id: 'speed_overspeed_moderate',
        name: `Speed Limit Breaches (${Math.round(100 - input.speedAdherencePct)}% of ride)`,
        category: 'deduction',
        formula: '-25% Speed Compliance Deduction',
        multiplier: 0.75,
        deltaPoints: speedDelta,
        description: `Frequent driving above the ${input.speedLimit} km/h corridor ceiling.`,
        status: 'penalty',
      });
    } else if (input.speedAdherencePct >= 50 && input.speedAdherencePct < 70) {
      speedDelta = -Math.round(basePoints * 0.45);
      factors.push({
        id: 'speed_overspeed_heavy',
        name: `Severe Speeding Violations (${Math.round(100 - input.speedAdherencePct)}% over limit)`,
        category: 'deduction',
        formula: '-45% Kinetic Penalty',
        multiplier: 0.55,
        deltaPoints: speedDelta,
        description: `Repeated overspeeding above ${input.speedLimit} km/h road threshold.`,
        status: 'penalty',
      });
    } else if (input.speedAdherencePct < 50) {
      speedDelta = -Math.round(basePoints * 0.65);
      factors.push({
        id: 'speed_overspeed_critical',
        name: 'Chronic Speed Limit Defiance (<50% compliance)',
        category: 'deduction',
        formula: '-65% Heavy Violation Penalty',
        multiplier: 0.35,
        deltaPoints: speedDelta,
        description: `Cruising consistently above the posted ${input.speedLimit} km/h zone limit.`,
        status: 'penalty',
      });
    }

    // 3b. Peak Excess Speed Surcharge Penalty (if max speed spiked above limit)
    let peakExcessDelta = 0;
    if (input.maxSpeedKmH > input.speedLimit + 5) {
      const excessKmH = input.maxSpeedKmH - input.speedLimit;
      peakExcessDelta = -Math.round(excessKmH * 1.5);
      factors.push({
        id: 'peak_speed_breach',
        name: `Peak Speed Breach (${input.maxSpeedKmH} in ${input.speedLimit} km/h zone)`,
        category: 'deduction',
        formula: `-${excessKmH} km/h excess × 1.5 pts`,
        multiplier: 1.0,
        deltaPoints: peakExcessDelta,
        description: `Velocity peaked at ${input.maxSpeedKmH} km/h (+${excessKmH} km/h over limit). Points forfeited.`,
        status: 'penalty',
      });
    }


    // 4. Smooth Braking & G-Force Stability Factor
    let brakeDelta = 0;
    if (input.harshBrakeCount === 0 && input.smoothBrakingPct >= 90) {
      brakeDelta = Math.round(basePoints * 0.15);
      factors.push({
        id: 'smooth_braking',
        name: 'Flawless Deceleration (<0.28G)',
        category: 'safety',
        formula: '+15% Smooth Chassis Bonus',
        multiplier: 1.15,
        deltaPoints: brakeDelta,
        description: 'Zero emergency lockups or sudden weight transfers recorded.',
        status: 'positive',
      });
    } else if (input.harshBrakeCount > 0) {
      const penaltyPerBrake = 12;
      brakeDelta = -Math.min(basePoints * 0.4, input.harshBrakeCount * penaltyPerBrake);
      factors.push({
        id: 'harsh_braking',
        name: `Harsh Braking Penalty (${input.harshBrakeCount} event${input.harshBrakeCount > 1 ? 's' : ''})`,
        category: 'safety',
        formula: `-${input.harshBrakeCount} × ${penaltyPerBrake} pts`,
        multiplier: 1.0,
        deltaPoints: Math.round(brakeDelta),
        description: 'Sudden deceleration spikes indicate compromised following buffer.',
        status: 'penalty',
      });
    }

    // 5. Phone Focus / Distraction Protection
    let focusDelta = 0;
    if (input.phoneDistractionCount === 0 && input.phoneFocusPct >= 98) {
      focusDelta = Math.round(basePoints * 0.2);
      factors.push({
        id: 'phone_focus',
        name: '100% Screen Focus (Zero Distraction)',
        category: 'focus',
        formula: '+20% Undivided Attention Dividend',
        multiplier: 1.2,
        deltaPoints: focusDelta,
        description: 'Phone screen stayed completely dark and locked during vehicle transit.',
        status: 'positive',
      });
    } else if (input.phoneDistractionCount > 0) {
      focusDelta = -(input.phoneDistractionCount * 15);
      factors.push({
        id: 'phone_distraction',
        name: `Phone Touch / Screen Interaction (${input.phoneDistractionCount}x)`,
        category: 'focus',
        formula: `-${input.phoneDistractionCount} × 15 pts`,
        multiplier: 1.0,
        deltaPoints: focusDelta,
        description: 'Screen touches or app switching while vehicle was in kinetic motion.',
        status: 'penalty',
      });
    }

    // 6. Hazard & Corridor Protection (Night or High-Risk Corridor)
    let riskDelta = 0;
    if (input.isNightRide || input.isInHighRiskCorridor) {
      riskDelta = Math.round(basePoints * 0.15);
      factors.push({
        id: 'risk_corridor',
        name: 'High-Risk Corridor Vigilance',
        category: 'safety',
        formula: '+15% Night / Accident Blackspot Pay',
        multiplier: 1.15,
        deltaPoints: riskDelta,
        description: 'Successfully navigated low-visibility or high-accident zones with zero incidents.',
        status: 'positive',
      });
    }

    // 7. Eco & Zero Emission Vehicle Fleet Bonus
    let ecoDelta = 0;
    if (input.vehicleFuelType === 'EV') {
      ecoDelta = Math.round(basePoints * 0.15);
      factors.push({
        id: 'eco_ev',
        name: 'Clean Mobility (Zero Tailpipe EV)',
        category: 'eco',
        formula: '+15% Green Carbon Offset',
        multiplier: 1.15,
        deltaPoints: ecoDelta,
        description: 'Electric vehicle operation reducing urban emissions and acoustic noise.',
        status: 'positive',
      });
    }

    // Calculate Total Points (floor drops to 1 if speed limit was heavily breached)
    const rawTotal = basePoints + neuralDelta + speedDelta + peakExcessDelta + brakeDelta + focusDelta + riskDelta + ecoDelta;
    const finalPoints = Math.max(1, Math.round(rawTotal));
    const xpEarned = Math.round(finalPoints * 2.5);
    const effectiveRate = Math.round((finalPoints / distance) * 10) / 10;

    // Assign Grade (penalize grade if speed limit was violated)
    let grade: RewardCalculationResult['grade'] = 'B';
    const netMultiplier = finalPoints / basePoints;
    if (netMultiplier >= 1.6 && input.phoneDistractionCount === 0 && input.harshBrakeCount === 0 && input.speedAdherencePct >= 95) {
      grade = 'S+';
    } else if (netMultiplier >= 1.25 && input.speedAdherencePct >= 90) {
      grade = 'A';
    } else if (netMultiplier >= 0.85 && input.speedAdherencePct >= 75) {
      grade = 'B';
    } else if (netMultiplier >= 0.55 && input.speedAdherencePct >= 50) {
      grade = 'C';
    } else {
      grade = 'D';
    }


    let summaryNarrative = '';
    if (grade === 'S+') {
      summaryNarrative = 'Exemplary ride! Perfect phone discipline and neural safety yield the maximum algorithm dividend.';
    } else if (grade === 'A') {
      summaryNarrative = 'Strong defensive driving. Smooth deceleration and steady speed boosted your reward rate.';
    } else if (grade === 'B') {
      summaryNarrative = 'Solid standard commute. Eliminating minor speed spikes will unlock the +25% zone mastery bonus.';
    } else {
      summaryNarrative = 'Distractions or sudden braking reduced your reward yield. Maintain safe headway to recover points.';
    }

    return {
      basePoints,
      totalPoints: finalPoints,
      xpEarned,
      effectiveRatePerKm: effectiveRate,
      factors,
      summaryNarrative,
      grade,
    };
  }
}

export const SafePodRewardAlgorithm = SafeDriveRewardAlgorithm;

