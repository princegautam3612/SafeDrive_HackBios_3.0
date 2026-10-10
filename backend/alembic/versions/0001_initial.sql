-- Initial Schema for SafeDrive Kinetic Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128),
    avatar VARCHAR(256),
    dl_number VARCHAR(64),
    dl_verified BOOLEAN DEFAULT TRUE,
    historical_safe_score FLOAT DEFAULT 85.0,
    total_kms FLOAT DEFAULT 0.0,
    total_rides INT DEFAULT 0,
    points INT DEFAULT 1200,
    xp INT DEFAULT 3400,
    driver_role VARCHAR(64) DEFAULT 'Regular Commuter',
    badge_label VARCHAR(64) DEFAULT 'TOP 10% SAFE RIDER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) DEFAULT 'motorcycle',
    model VARCHAR(128) NOT NULL,
    registration_number VARCHAR(64) NOT NULL,
    fuel_type VARCHAR(32) DEFAULT 'Petrol',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Contacts (ICE)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    relationship VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    distance_km FLOAT NOT NULL,
    duration_sec INT NOT NULL,
    safety_score FLOAT NOT NULL,
    points_earned INT DEFAULT 0,
    xp_earned INT DEFAULT 0,
    harsh_braking_count INT DEFAULT 0,
    harsh_cornering_count INT DEFAULT 0,
    speeding_duration_sec INT DEFAULT 0,
    tailgating_duration_sec INT DEFAULT 0,
    phone_distraction_sec INT DEFAULT 0,
    start_location VARCHAR(128),
    end_location VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- High-Frequency Telemetry Ingestion Samples
CREATE TABLE IF NOT EXISTS telemetry_samples (
    id BIGSERIAL PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    speed FLOAT NOT NULL,
    speed_limit FLOAT NOT NULL,
    braking_g FLOAT NOT NULL,
    cornering_g FLOAT NOT NULL,
    kinetic_buffer_sec FLOAT NOT NULL,
    phone_distraction BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_user_time ON telemetry_samples(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_trips_user_time ON trips(user_id, start_time DESC);

-- Automated Emergency Dispatch Events
CREATE TABLE IF NOT EXISTS emergency_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    impact_g FLOAT NOT NULL,
    tilt_degrees FLOAT DEFAULT 0.0,
    speed_drop_kmh FLOAT DEFAULT 0.0,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    contact_name VARCHAR(128) NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    dispatch_status VARCHAR(32) DEFAULT 'DISPATCHED',
    sms_sent BOOLEAN DEFAULT TRUE,
    call_placed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
