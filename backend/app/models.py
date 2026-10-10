import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Float, Integer,
    DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .db import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    dl_number = Column(String, nullable=True)
    dl_verified = Column(Boolean, default=True)
    historical_safe_score = Column(Float, default=88.0)
    total_kms = Column(Float, default=0.0)
    total_rides = Column(Integer, default=0)
    points = Column(Integer, default=1250)
    xp = Column(Integer, default=3400)
    driver_role = Column(String, default="Motorcycle Cruiser • Regular Commuter")
    badge_label = Column(String, default="TOP 10% SAFE RIDER")
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicles = relationship("Vehicle", back_populates="owner", cascade="all, delete-orphan")
    emergency_contacts = relationship("EmergencyContact", back_populates="owner", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="owner", cascade="all, delete-orphan")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, default="motorcycle")
    model = Column(String, nullable=False)
    registration_number = Column(String, nullable=False)
    fuel_type = Column(String, default="Petrol")

    owner = relationship("User", back_populates="vehicles")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    relationship = Column(String, nullable=False)

    owner = relationship("User", back_populates="emergency_contacts")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, default=datetime.utcnow)
    distance_km = Column(Float, default=0.0)
    duration_sec = Column(Integer, default=0)
    safety_score = Column(Float, default=90.0)
    points_earned = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    harsh_braking_count = Column(Integer, default=0)
    harsh_cornering_count = Column(Integer, default=0)
    speeding_duration_sec = Column(Integer, default=0)
    tailgating_duration_sec = Column(Integer, default=0)
    phone_distraction_sec = Column(Integer, default=0)
    start_location = Column(String, nullable=True)
    end_location = Column(String, nullable=True)

    owner = relationship("User", back_populates="trips")


class TelemetrySample(Base):
    __tablename__ = "telemetry_samples"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trip_id = Column(String, nullable=True)
    user_id = Column(String, nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    speed = Column(Float, nullable=False)
    speed_limit = Column(Float, nullable=False)
    braking_g = Column(Float, default=0.0)
    cornering_g = Column(Float, default=0.0)
    kinetic_buffer_sec = Column(Float, default=3.0)
    phone_distraction = Column(Boolean, default=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)


class EmergencyDispatch(Base):
    __tablename__ = "emergency_dispatches"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    impact_g = Column(Float, nullable=False)
    tilt_degrees = Column(Float, default=0.0)
    speed_drop_kmh = Column(Float, default=0.0)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    contact_name = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    dispatch_status = Column(String, default="DISPATCHED")
    created_at = Column(DateTime, default=datetime.utcnow)
