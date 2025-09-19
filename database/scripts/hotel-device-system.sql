-- HOTEL ROOM & DEVICE MANAGEMENT SYSTEM
-- Proper relational structure: Rooms → Devices → Functions

-- Hotel information table
CREATE TABLE IF NOT EXISTS hotels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_name VARCHAR(200) NOT NULL,
    hotel_address TEXT,
    ai_identity TEXT NOT NULL,
    ai_behavior_rules JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table  
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id),
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(50), -- suite, standard, etc.
    floor_number INTEGER,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(hotel_id, room_number)
);

-- Devices table (lights, thermostats, etc.)
CREATE TABLE IF NOT EXISTS devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES rooms(id),
    device_name VARCHAR(100) NOT NULL, -- "Main Ceiling Light", "Bedside Lamp"
    device_type VARCHAR(50) NOT NULL, -- WLED, MQTT, Thermostat
    mqtt_topic VARCHAR(100), -- "room1", "room1/api", etc.
    device_identifier VARCHAR(100), -- External device ID
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device functions table (what each device can do)
CREATE TABLE IF NOT EXISTS device_functions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id UUID REFERENCES devices(id),
    function_name VARCHAR(100) NOT NULL, -- "Turn On", "Set Candle Effect", "Set Red Color"
    payload_type VARCHAR(50) NOT NULL, -- "power", "effect", "color"
    payload_value VARCHAR(100) NOT NULL, -- "ON", "FX=88", "#FF0000"
    description TEXT NOT NULL, -- "Turns the light on", "Creates romantic candle effect"
    category VARCHAR(50), -- basic, romantic, energetic, professional
    rating INTEGER DEFAULT 3, -- 1-5 star rating
    usage_example TEXT, -- "Use for romantic dinners"
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_functions ENABLE ROW LEVEL SECURITY;

-- Create read policies
CREATE POLICY "Allow read access to hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Allow read access to rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow read access to devices" ON devices FOR SELECT USING (true);
CREATE POLICY "Allow read access to device functions" ON device_functions FOR SELECT USING (true);

-- Insert hotel data
INSERT INTO hotels (hotel_name, hotel_address, ai_identity, ai_behavior_rules) VALUES
('The Peninsula Hong Kong',
 'Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong SAR',
 'You are LIMI, an AI designed for The Peninsula Hong Kong to assist guests with every request they might have.',
 '["Greet guests by name and room number - Example: Hello Mr. Asif from Room 1, how may I assist you today?", "Acknowledge membership status to personalize service - Platinum guests receive priority assistance", "Speak clearly in short sentences with natural pauses - Avoid long explanations", "Always confirm before making room changes - Example: Should I turn on the romantic lighting for you?", "If interrupted, stop speaking immediately and listen - Do not continue previous sentence", "Ask clarifying questions if requests are unclear - Example: Which lighting effect would you prefer - romantic or energetic?"]'
);

-- Insert rooms
INSERT INTO rooms (hotel_id, room_number, room_type, floor_number, description) 
SELECT h.id, 'room1', 'Owner Suite', 1, 'Owner suite with premium WLED lighting system'
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

INSERT INTO rooms (hotel_id, room_number, room_type, floor_number, description)
SELECT h.id, '301', 'VIP Suite', 3, 'VIP suite with eco-friendly lighting features'  
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

INSERT INTO rooms (hotel_id, room_number, room_type, floor_number, description)
SELECT h.id, '425', 'Business Suite', 4, 'Business suite with professional lighting setup'
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

INSERT INTO rooms (hotel_id, room_number, room_type, floor_number, description)
SELECT h.id, '210', 'Standard Room', 2, 'Comfortable room with ambient lighting system'
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

-- Insert devices (WLED controllers)
INSERT INTO devices (room_id, device_name, device_type, mqtt_topic, device_identifier, description)
SELECT r.id, 'Main Ceiling Light', 'WLED', 'room1', 'wled_room1_main', 'Primary WLED lighting controller for room1'
FROM rooms r WHERE r.room_number = 'room1';

-- Insert device functions for room1 WLED
INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Turn On', 'power', 'ON', 'Turns the room lights on', 'basic', 5, 'Use when guest enters room or requests lights', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Turn Off', 'power', 'OFF', 'Turns the room lights off', 'basic', 5, 'Use when guest is sleeping or leaving room', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Romantic Candle Effect', 'effect', 'FX=88', 'Creates warm flickering candle-like lighting perfect for intimate moments', 'romantic', 5, 'Use for romantic dinners, special occasions, intimate conversations', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Ocean Waves Effect', 'effect', 'FX=101', 'Gentle blue-green wave patterns that create a calming ocean atmosphere', 'relaxing', 4, 'Use for relaxation, meditation, stress relief', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Lightning Effect', 'effect', 'FX=57', 'Dramatic bright white lightning flashes for energetic atmosphere', 'energetic', 3, 'Use for parties, energetic moments, wake-up lighting', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Twinkling Stars', 'effect', 'FX=80', 'Soft sparkling star-like lights for gentle ambiance', 'romantic', 4, 'Use for bedtime, quiet moments, gentle lighting', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Pure White Light', 'color', '#FFFFFF', 'Clean white light ideal for work, reading, and professional activities', 'professional', 5, 'Use for work, reading, video calls, detailed tasks', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Warm Red Light', 'color', '#FF0000', 'Warm red light creating cozy and intimate atmosphere', 'warm', 3, 'Use for cozy evenings, warm ambiance', true
FROM devices d WHERE d.mqtt_topic = 'room1';

-- Update profiles to link to rooms
UPDATE profiles SET room_number = 'room1' WHERE username = 'umer_asif';
UPDATE profiles SET room_number = '301' WHERE username = 'taylor_ogen';  
UPDATE profiles SET room_number = '425' WHERE username = 'karen_law';
UPDATE profiles SET room_number = '210' WHERE username = 'sarah_smith';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_rooms_hotel ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_devices_room ON devices(room_id);
CREATE INDEX IF NOT EXISTS idx_device_functions_device ON device_functions(device_id);
CREATE INDEX IF NOT EXISTS idx_device_functions_enabled ON device_functions(enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_room_number ON profiles(room_number);
