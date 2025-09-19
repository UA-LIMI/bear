-- DYNAMIC AI INSTRUCTION SYSTEM
-- Copy and paste this entire block into Supabase SQL Editor

-- Hotel configuration table
CREATE TABLE IF NOT EXISTS hotel_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_name VARCHAR(200) NOT NULL,
    hotel_address TEXT,
    ai_identity TEXT NOT NULL,
    ai_primary_role TEXT NOT NULL,
    ai_behavior_guidelines JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI capabilities table
CREATE TABLE IF NOT EXISTS ai_capabilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    capability_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    tool_name VARCHAR(100),
    tool_parameters JSONB DEFAULT '{}',
    usage_instructions TEXT,
    category VARCHAR(50),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device capabilities table (WLED effects)
CREATE TABLE IF NOT EXISTS device_capabilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_type VARCHAR(50) NOT NULL,
    room_identifier VARCHAR(50),
    capability_type VARCHAR(50),
    command_format VARCHAR(100),
    command_value VARCHAR(50),
    description TEXT,
    category VARCHAR(50),
    rating INTEGER DEFAULT 3,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hotel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_capabilities ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read access)
CREATE POLICY "Allow read access to hotel config" ON hotel_config FOR SELECT USING (true);
CREATE POLICY "Allow read access to ai capabilities" ON ai_capabilities FOR SELECT USING (true);
CREATE POLICY "Allow read access to device capabilities" ON device_capabilities FOR SELECT USING (true);

-- Insert hotel configuration
INSERT INTO hotel_config (hotel_name, hotel_address, ai_identity, ai_primary_role, ai_behavior_guidelines) VALUES
('The Peninsula Hong Kong', 
 'Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong SAR',
 'You are a sophisticated AI assistant for The Peninsula Hong Kong, one of the world''s finest luxury hotels in Hong Kong.',
 'Your primary role is to provide personalized, location-aware hotel services while maintaining detailed guest context and preferences across all interactions.',
 '["Always acknowledge guests by name and room number", "Reference current Hong Kong location for recommendations", "Store any preferences mentioned during conversation", "Provide location-based Hong Kong recommendations", "Control room lighting when requested using proper MQTT commands", "Maintain professional luxury hotel service standards", "Use guest''s loyalty status to personalize service level"]'
);

-- Insert AI capabilities with exact tool definitions
INSERT INTO ai_capabilities (capability_name, description, tool_name, tool_parameters, usage_instructions, category, enabled) VALUES
('Update Guest Location', 
 'Update guest current location with detailed Hong Kong address',
 'update_user_location',
 '{"userId": {"type": "string", "description": "Guest user ID"}, "address": {"type": "string", "description": "Full detailed address"}, "city": {"type": "string", "description": "City name"}, "country": {"type": "string", "description": "Country name"}}',
 'Use when guest mentions moving to a new location or being somewhere different in Hong Kong',
 'location', true),

('Control Room Lighting',
 'Control hotel room lighting via MQTT using WLED effects and colors', 
 'control_hotel_lighting',
 '{"room": {"type": "string", "description": "Room identifier like room1"}, "command": {"type": "string", "description": "MQTT command from device capabilities"}}',
 'Use when guest requests lighting changes. Use command_format from device_capabilities table for this room.',
 'lighting', true),

('Store Guest Preference',
 'Remember guest preferences and context for future stays',
 'remember_guest_preference', 
 '{"userId": {"type": "string"}, "entityName": {"type": "string"}, "category": {"type": "string"}, "observations": {"type": "array", "items": {"type": "string"}}}',
 'Use whenever guest expresses preferences, likes, dislikes, or mentions habits',
 'preferences', true),

('Get Guest Context',
 'Retrieve guest stored preferences and history',
 'get_guest_context',
 '{"userId": {"type": "string"}, "category": {"type": "string", "description": "Optional category filter"}}', 
 'Use at conversation start or when personalizing recommendations',
 'preferences', true);

-- Insert WLED lighting capabilities for room1 (Umer's room)
INSERT INTO device_capabilities (device_type, room_identifier, capability_type, command_format, command_value, description, category, rating, enabled) VALUES
-- Basic Power Controls
('WLED', 'room1', 'power_control', 'ON', 'ON', 'Turn room lights on', 'basic', 5, true),
('WLED', 'room1', 'power_control', 'OFF', 'OFF', 'Turn room lights off', 'basic', 5, true),

-- Romantic Effects (5-star rating)
('WLED', 'room1', 'lighting_effect', 'FX=88', '88', 'Romantic candle flame effect - warm flickering like real candles', 'romantic', 5, true),
('WLED', 'room1', 'lighting_effect', 'FX=80', '80', 'Gentle twinkling stars - soft sparkling lights', 'romantic', 4, true),

-- Relaxing Effects (4-star rating)  
('WLED', 'room1', 'lighting_effect', 'FX=101', '101', 'Gentle ocean waves (Pacifica) - calming blue-green waves', 'relaxing', 4, true),

-- Energetic Effects (3-star rating)
('WLED', 'room1', 'lighting_effect', 'FX=57', '57', 'Bright lightning strobe - dramatic white flashes', 'energetic', 3, true),
('WLED', 'room1', 'lighting_effect', 'FX=89', '89', 'Exploding fireworks - multicolor bursts', 'party', 3, true),
('WLED', 'room1', 'lighting_effect', 'FX=97', '97', 'Rainbow cycling - smooth color transitions', 'colorful', 3, true),

-- Color Controls (Professional)
('WLED', 'room1', 'color_control', '#FFFFFF', 'FFFFFF', 'Pure white light - ideal for work and reading', 'professional', 5, true),
('WLED', 'room1', 'color_control', '#FF0000', 'FF0000', 'Red color - warm and cozy', 'colorful', 3, true),
('WLED', 'room1', 'color_control', '#00FF00', '00FF00', 'Green color - natural and fresh', 'colorful', 3, true),
('WLED', 'room1', 'color_control', '#0000FF', '0000FF', 'Blue color - cool and calming', 'colorful', 3, true),
('WLED', 'room1', 'color_control', '#FFA500', 'FFA500', 'Orange color - warm sunset feeling', 'warm', 4, true),
('WLED', 'room1', 'color_control', '#800080', '800080', 'Purple color - luxurious and elegant', 'elegant', 4, true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotel_config_active ON hotel_config(active);
CREATE INDEX IF NOT EXISTS idx_ai_capabilities_enabled ON ai_capabilities(enabled);
CREATE INDEX IF NOT EXISTS idx_ai_capabilities_category ON ai_capabilities(category);
CREATE INDEX IF NOT EXISTS idx_device_capabilities_room ON device_capabilities(room_identifier);
CREATE INDEX IF NOT EXISTS idx_device_capabilities_enabled ON device_capabilities(enabled);
CREATE INDEX IF NOT EXISTS idx_device_capabilities_rating ON device_capabilities(rating);
