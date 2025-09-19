-- Initial Peninsula Hong Kong Hotel AI System Schema
-- Migration: 20250917000001_initial_hotel_system
-- Description: Creates all core tables for hotel guest management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    guest_type VARCHAR(20) DEFAULT 'standard',
    room_number VARCHAR(10),
    check_in_date TIMESTAMP WITH TIME ZONE,
    check_out_date TIMESTAMP WITH TIME ZONE,
    total_stays INTEGER DEFAULT 1,
    loyalty_points INTEGER DEFAULT 0,
    current_location_address TEXT,
    current_location_city VARCHAR(100),
    current_location_country VARCHAR(100),
    location_updated_at TIMESTAMP WITH TIME ZONE,
    location_source VARCHAR(50) DEFAULT 'user_input',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest entities for AI context
CREATE TABLE IF NOT EXISTS guest_entities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(200) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    source_agent VARCHAR(50),
    observations JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name, entity_type)
);

-- Hotels configuration
CREATE TABLE IF NOT EXISTS hotels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_name VARCHAR(200) NOT NULL,
    hotel_address TEXT,
    ai_identity TEXT NOT NULL,
    ai_behavior_rules JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms information
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id),
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(50),
    floor_number INTEGER,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_id, room_number)
);

-- Devices (WLED controllers)
CREATE TABLE IF NOT EXISTS devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES rooms(id),
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    mqtt_topic VARCHAR(100),
    device_identifier VARCHAR(100),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device functions (WLED effects)
CREATE TABLE IF NOT EXISTS device_functions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id UUID REFERENCES devices(id),
    function_name VARCHAR(100) NOT NULL,
    payload_type VARCHAR(50) NOT NULL,
    payload_value VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    rating INTEGER DEFAULT 3,
    usage_example TEXT,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotel events
CREATE TABLE IF NOT EXISTS hotel_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id),
    event_name VARCHAR(200) NOT NULL,
    event_time TIME NOT NULL,
    event_description TEXT,
    event_type VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can manage own entities" ON guest_entities USING (auth.uid() = user_id);
CREATE POLICY "Allow read access to hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Allow read access to rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow read access to devices" ON devices FOR SELECT USING (true);
CREATE POLICY "Allow read access to device functions" ON device_functions FOR SELECT USING (true);
CREATE POLICY "Allow read access to hotel events" ON hotel_events FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_room_number ON profiles(room_number);
CREATE INDEX IF NOT EXISTS idx_guest_entities_user_type ON guest_entities(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_devices_room ON devices(room_id);
CREATE INDEX IF NOT EXISTS idx_device_functions_device ON device_functions(device_id);
CREATE INDEX IF NOT EXISTS idx_hotel_events_hotel ON hotel_events(hotel_id);
