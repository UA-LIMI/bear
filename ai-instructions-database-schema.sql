-- AI INSTRUCTIONS DATABASE SCHEMA
-- All AI behavior and capabilities stored in database

-- Hotel configuration table
CREATE TABLE IF NOT EXISTS hotel_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_name VARCHAR(200) NOT NULL,
    hotel_address TEXT,
    ai_identity TEXT NOT NULL, -- "You are a hotel AI assistant at..."
    ai_primary_role TEXT NOT NULL, -- "Your primary role is to..."
    ai_behavior_guidelines JSONB DEFAULT '[]', -- Array of behavior rules
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI capabilities table (what the AI can do)
CREATE TABLE IF NOT EXISTS ai_capabilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    capability_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    tool_name VARCHAR(100), -- Actual tool/function name to call
    tool_parameters JSONB DEFAULT '{}', -- Expected parameters
    usage_instructions TEXT, -- How to use this capability
    category VARCHAR(50), -- lighting, location, preferences, etc.
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device capabilities (WLED, MQTT, etc.)
CREATE TABLE IF NOT EXISTS device_capabilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_type VARCHAR(50) NOT NULL, -- WLED, MQTT, etc.
    room_identifier VARCHAR(50), -- room1, room2, etc.
    capability_type VARCHAR(50), -- lighting_effect, color_control, power
    command_format VARCHAR(100), -- FX=88, #FF0000, ON/OFF
    command_value VARCHAR(50), -- 88, FF0000, ON
    description TEXT, -- "Romantic candle effect"
    category VARCHAR(50), -- romantic, energetic, relaxing
    rating INTEGER DEFAULT 3, -- 1-5 star rating for effects
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert hotel configuration
INSERT INTO hotel_config (hotel_name, hotel_address, ai_identity, ai_primary_role, ai_behavior_guidelines) VALUES
('The Peninsula Hong Kong', 
 'Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong SAR',
 'You are a sophisticated AI assistant for The Peninsula Hong Kong, one of the world''s finest luxury hotels.',
 'Your primary role is to provide personalized, location-aware hotel services while maintaining detailed guest context and preferences across all interactions.',
 '["Always acknowledge guests by name", "Reference current Hong Kong location", "Store mentioned preferences", "Provide location-based recommendations", "Control lighting when requested", "Maintain professional luxury hotel service standards"]'
);

-- Insert AI capabilities
INSERT INTO ai_capabilities (capability_name, description, tool_name, tool_parameters, usage_instructions, category, enabled) VALUES
('Update Guest Location', 
 'Update guest''s current location with detailed Hong Kong address',
 'update_user_location',
 '{"userId": "string", "address": "string", "city": "string", "country": "string"}',
 'Use when guest mentions moving to a new location or being somewhere different',
 'location', true),

('Control Room Lighting',
 'Control hotel room lighting via MQTT using WLED effects and colors', 
 'control_hotel_lighting',
 '{"room": "string", "command": "string"}',
 'Use when guest requests lighting changes. Commands from device_capabilities table.',
 'lighting', true),

('Store Guest Preference',
 'Remember guest preferences and context for future stays',
 'remember_guest_preference', 
 '{"userId": "string", "entityName": "string", "category": "string", "observations": "array"}',
 'Use whenever guest expresses preferences, likes, or dislikes',
 'preferences', true),

('Get Guest Context',
 'Retrieve guest''s stored preferences and history',
 'get_guest_context',
 '{"userId": "string", "category": "string"}', 
 'Use at conversation start or when personalizing recommendations',
 'preferences', true);

-- Insert WLED lighting capabilities
INSERT INTO device_capabilities (device_type, room_identifier, capability_type, command_format, command_value, description, category, rating, enabled) VALUES
('WLED', 'room1', 'power_control', 'ON', 'ON', 'Turn lights on', 'basic', 5, true),
('WLED', 'room1', 'power_control', 'OFF', 'OFF', 'Turn lights off', 'basic', 5, true),
('WLED', 'room1', 'lighting_effect', 'FX=88', '88', 'Romantic candle flame effect', 'romantic', 5, true),
('WLED', 'room1', 'lighting_effect', 'FX=101', '101', 'Gentle ocean waves (Pacifica)', 'relaxing', 4, true),
('WLED', 'room1', 'lighting_effect', 'FX=57', '57', 'Bright lightning strobe', 'energetic', 3, true),
('WLED', 'room1', 'lighting_effect', 'FX=80', '80', 'Gentle twinkling stars', 'romantic', 4, true),
('WLED', 'room1', 'lighting_effect', 'FX=89', '89', 'Exploding fireworks', 'party', 3, true),
('WLED', 'room1', 'color_control', '#FF0000', 'FF0000', 'Red color', 'colorful', 3, true),
('WLED', 'room1', 'color_control', '#00FF00', '00FF00', 'Green color', 'colorful', 3, true),
('WLED', 'room1', 'color_control', '#0000FF', '0000FF', 'Blue color', 'colorful', 3, true),
('WLED', 'room1', 'color_control', '#FFFFFF', 'FFFFFF', 'Pure white light', 'professional', 5, true);
