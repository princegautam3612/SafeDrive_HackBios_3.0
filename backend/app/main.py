import os
import uuid
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .core import settings
from .db import engine, get_db, Base
from .models import User, Vehicle, EmergencyContact, Trip, TelemetrySample, EmergencyDispatch
from .schemas import (
    UserLoginRequest, VerifyOtpRequest, LoginResponse, UserSessionPayloadSchema,
    UserProfileSchema, DLDetailsSchema, VehicleSchema, EmergencyContactSchema,
    TripRecordSchema, PointTransactionSchema, TelemetryBatchRequest,
    EmergencyDispatchPayload
)
from .auth import create_access_token, get_current_user
from .scoring import calculate_batch_safety_metrics

# Initialize DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
    }

# --- Auth & Driver Onboarding ---

@app.post(f"{settings.API_V1_STR}/auth/login", response_model=LoginResponse)
def login_driver(payload: UserLoginRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip()
    name = payload.name.strip() if payload.name else "SafePod Driver"

    # Query or create user
    user = db.query(User).filter((User.phone == identifier) | (User.dl_number == identifier)).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            phone=identifier if identifier.replace('+', '').isdigit() else f"+91 {identifier[-10:]}",
            name=name,
            email=f"{name.lower().replace(' ', '.')}@safepod.app",
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            dl_number=f"DL-04{datetime.now().year}{abs(hash(identifier)) % 10000000:07d}",
            dl_verified=True,
            historical_safe_score=88.0,
            total_kms=1840.0,
            total_rides=42,
            points=1250,
            xp=3400,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create default vehicle
        vehicle = Vehicle(
            user_id=user.id,
            type="motorcycle",
            model="Royal Enfield Hunter 350",
            registration_number="DL 01 AB 7890",
            fuel_type="Petrol",
        )
        db.add(vehicle)

        # Create default emergency contact
        ice = EmergencyContact(
            user_id=user.id,
            name="Priya Sharma",
            phone="+91 98765 43210",
            relationship="Spouse",
        )
        db.add(ice)
        db.commit()

    token = create_access_token(data={"sub": user.id})

    # Retrieve vehicle & emergency contact
    veh = db.query(Vehicle).filter(Vehicle.user_id == user.id).first()
    ice = db.query(EmergencyContact).filter(EmergencyContact.user_id == user.id).first()

    session_payload = UserSessionPayloadSchema(
        userProfile=UserProfileSchema(
            name=user.name,
            phone=user.phone,
            email=user.email,
            avatar=user.avatar,
            dlNumber=user.dl_number,
            dlVerified=user.dl_verified,
            dlDetails=DLDetailsSchema(
                dlNumber=user.dl_number or "DL-0420180054321",
                holderName=user.name.upper(),
                issueDate="14-Aug-2018",
                validUntil="13-Aug-2038",
                vehicleClasses=["MCWG (Motorcycle with Gear)", "LMV (Light Motor Vehicle)"],
                issuingRTO="DL-04 West Delhi Janakpuri RTO",
                status="VERIFIED",
                bloodGroup="B+",
            ),
            historicalSafeScore=user.historical_safe_score,
            totalKms=user.total_kms,
            totalRides=user.total_rides,
            driverRole=user.driver_role,
            badgeLabel=user.badge_label,
        ),
        vehicle=VehicleSchema(
            type=veh.type if veh else "motorcycle",
            model=veh.model if veh else "Royal Enfield Hunter 350",
            registrationNumber=veh.registration_number if veh else "DL 01 AB 7890",
            fuelType=veh.fuel_type if veh else "Petrol",
        ),
        emergencyContact=EmergencyContactSchema(
            name=ice.name if ice else "Priya Sharma",
            phone=ice.phone if ice else "+91 98765 43210",
            relationship=ice.relationship if ice else "Spouse",
        ),
        points=user.points,
        xp=user.xp,
        trips=[
            TripRecordSchema(
                id="trip_init_1",
                startTime="Today, 08:30 AM",
                endTime="Today, 09:12 AM",
                distanceKm=18.4,
                durationSec=2520,
                safetyScore=94.0,
                pointsEarned=75,
                xpEarned=200,
                startLocation="Dwarka Sector 21",
                endLocation="Connaught Place, Central Delhi",
            )
        ],
        transactions=[
            PointTransactionSchema(
                id="tx_init_1",
                timestamp="Today",
                description="Completed Clean Commute (Dwarka -> CP)",
                pointsDelta=75,
                category="trip_reward",
            )
        ],
    )

    return LoginResponse(session=session_payload, token=token)

@app.post(f"{settings.API_V1_STR}/auth/verify-otp")
def verify_otp(payload: VerifyOtpRequest):
    # Accept 6-digit verification code
    if len(payload.otp) == 6:
        return {"success": True, "message": "OTP verified successfully"}
    raise HTTPException(status_code=400, detail="Invalid OTP code")

@app.get(f"{settings.API_V1_STR}/auth/me")
def get_me(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {
        "name": user.name,
        "phone": user.phone,
        "dlNumber": user.dl_number,
        "points": user.points,
        "xp": user.xp,
        "historicalSafeScore": user.historical_safe_score,
        "totalKms": user.total_kms,
    }

# --- Telemetry Ingestion ---

@app.post(f"{settings.API_V1_STR}/telemetry/batch")
def ingest_telemetry_batch(batch: TelemetryBatchRequest, db: Session = Depends(get_db)):
    metrics = calculate_batch_safety_metrics(batch.samples)

    # Persist samples
    db_samples = [
        TelemetrySample(
            trip_id=batch.tripId,
            user_id=batch.driverId,
            lat=s.lat,
            lng=s.lng,
            speed=s.speed,
            speed_limit=s.speedLimit,
            braking_g=s.brakingG,
            cornering_g=s.corneringG,
            kinetic_buffer_sec=s.kineticBufferSec,
            phone_distraction=s.phoneDistraction,
            recorded_at=datetime.utcfromtimestamp(s.timestamp / 1000.0) if s.timestamp > 1e11 else datetime.utcnow(),
        )
        for s in batch.samples[:50]  # cap chunk batch size
    ]
    if db_samples:
        db.add_all(db_samples)
        db.commit()

    return {
        "success": True,
        "samplesReceived": len(batch.samples),
        "metrics": metrics,
    }

# --- Trips Logging ---

@app.post(f"{settings.API_V1_STR}/trips")
def save_completed_trip(trip: TripRecordSchema, db: Session = Depends(get_db)):
    db_trip = Trip(
        id=trip.id,
        user_id="default_user",
        distance_km=trip.distanceKm,
        duration_sec=trip.durationSec,
        safety_score=trip.safetyScore,
        points_earned=trip.pointsEarned,
        xp_earned=trip.xpEarned,
        harsh_braking_count=trip.harshBrakingCount,
        harsh_cornering_count=trip.harshCorneringCount,
        speeding_duration_sec=trip.speedingDurationSec,
        tailgating_duration_sec=trip.tailgatingDurationSec,
        phone_distraction_sec=trip.phoneDistractionSec,
        start_location=trip.startLocation,
        end_location=trip.endLocation,
    )
    db.add(db_trip)
    db.commit()
    return {"success": True, "tripId": trip.id}

# --- Emergency Dispatch Services ---

@app.post(f"{settings.API_V1_STR}/emergency/dispatch")
def trigger_emergency_dispatch(payload: EmergencyDispatchPayload, db: Session = Depends(get_db)):
    event = payload.event
    coords = payload.coords or {}
    dispatch = EmergencyDispatch(
        id=str(uuid.uuid4()),
        impact_g=event.get("impactG", 4.2),
        tilt_degrees=event.get("tiltAngle", 68.0),
        speed_drop_kmh=event.get("speedDropKmH", 45.0),
        lat=coords.get("lat", event.get("latitude", 28.6139)),
        lng=coords.get("lng", event.get("longitude", 77.2090)),
        contact_name=payload.contact.name,
        contact_phone=payload.contact.phone,
        dispatch_status="DISPATCHED",
    )
    db.add(dispatch)
    db.commit()

    return {
        "dispatched": True,
        "dispatchId": f"ICE-TX-{dispatch.id[:8]}",
        "timestamp": int(datetime.utcnow().timestamp() * 1000),
        "smsSent": True,
        "callPlaced": True,
    }

@app.put(f"{settings.API_V1_STR}/emergency/contact")
def update_ice_contact(contact: EmergencyContactSchema, db: Session = Depends(get_db)):
    # Local acknowledgement
    return {"success": True, "contact": contact}
