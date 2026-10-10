"""Kinetic Telematics Scoring Engine
Calculates real-time safety scores, driving penalties, points, and XP rewards
based on multi-sensor telemetry inputs (G-force, kinetic buffer, speed delta, distraction).
"""

from typing import List
from .schemas import TelemetrySampleItem

def calculate_batch_safety_metrics(samples: List[TelemetrySampleItem]) -> dict:
    if not samples:
        return {
            "score": 90.0,
            "harsh_braking": 0,
            "harsh_cornering": 0,
            "speeding_count": 0,
            "tailgating_count": 0,
            "distraction_count": 0,
            "points_earned": 50,
            "xp_earned": 120,
        }

    total_samples = len(samples)
    harsh_braking = sum(1 for s in samples if s.brakingG > 0.40)
    harsh_cornering = sum(1 for s in samples if s.corneringG > 0.35)
    speeding = sum(1 for s in samples if s.speed > s.speedLimit + 2)
    tailgating = sum(1 for s in samples if s.kineticBufferSec < 1.8 and s.speed > 25)
    distraction = sum(1 for s in samples if s.phoneDistraction)

    # Base score
    score = 100.0

    # Penalties
    score -= (harsh_braking * 3.5)
    score -= (harsh_cornering * 2.5)
    score -= (speeding * 1.5)
    score -= (tailgating * 2.0)
    score -= (distraction * 4.0)

    # Clamp between 0 and 100
    score = max(20.0, min(100.0, score))

    # Points & XP calculated from score
    points_earned = int((score / 100.0) * (total_samples * 1.5))
    xp_earned = int((score / 100.0) * (total_samples * 3.0))

    return {
        "score": round(score, 1),
        "harsh_braking": harsh_braking,
        "harsh_cornering": harsh_cornering,
        "speeding_count": speeding,
        "tailgating_count": tailgating,
        "distraction_count": distraction,
        "points_earned": points_earned,
        "xp_earned": xp_earned,
    }
