-- UI Content Localization System
-- Migration: 20250918000001_ui_content_system
-- Description: Creates tables for dynamic UI content and component configuration

-- UI Components configuration
CREATE TABLE IF NOT EXISTS ui_components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    component_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    component_type VARCHAR(50) NOT NULL,
    default_priority INTEGER DEFAULT 5,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-specific component assignments
CREATE TABLE IF NOT EXISTS user_component_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    component_id UUID REFERENCES ui_components(id),
    priority INTEGER DEFAULT 5,
    position VARCHAR(20) DEFAULT 'auto',
    visible BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, component_id)
);

-- UI text content for localization
CREATE TABLE IF NOT EXISTS ui_text_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text_key VARCHAR(100) NOT NULL,
    text_value TEXT NOT NULL,
    text_category VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    context VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(text_key, language, context)
);

-- Hotel services configuration
CREATE TABLE IF NOT EXISTS hotel_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    service_description TEXT,
    service_icon VARCHAR(50),
    service_category VARCHAR(50),
    availability_hours VARCHAR(100),
    guest_types JSONB DEFAULT '["all"]',
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Layout configurations
CREATE TABLE IF NOT EXISTS layout_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    configuration_name VARCHAR(100) NOT NULL,
    guest_type VARCHAR(50),
    screen_size VARCHAR(20) DEFAULT 'desktop',
    layout_structure JSONB NOT NULL,
    priority_rules JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ui_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_component_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_text_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to ui components" ON ui_components FOR SELECT USING (true);
CREATE POLICY "Allow read access to user assignments" ON user_component_assignments FOR SELECT USING (true);
CREATE POLICY "Allow read access to ui text" ON ui_text_content FOR SELECT USING (true);
CREATE POLICY "Allow read access to hotel services" ON hotel_services FOR SELECT USING (true);
CREATE POLICY "Allow read access to layout configs" ON layout_configurations FOR SELECT USING (true);

-- Insert UI components
INSERT INTO ui_components (component_name, display_name, description, component_type, default_priority, enabled) VALUES
('weather_card', 'Hong Kong Weather', 'Real-time weather information for Hong Kong', 'info_card', 8, true),
('hotel_events', 'Hotel Events', 'Daily events and activities at the hotel', 'info_card', 7, true),
('room_controls', 'Room Controls', 'Lighting and environment controls for guest room', 'control_panel', 10, true),
('chat_interface', 'AI Assistant Chat', 'Text and voice chat with hotel AI assistant', 'chat', 10, true),
('guest_profile', 'Guest Profile', 'Guest information and loyalty status', 'info_card', 6, true),
('location_info', 'Current Location', 'Guest location and nearby recommendations', 'info_card', 7, true),
('quick_services', 'Quick Services', 'Fast access to hotel services', 'service_panel', 8, true),
('voice_controls', 'Voice Controls', 'Voice connection and audio controls', 'control_panel', 10, true);

-- Insert UI text content
INSERT INTO ui_text_content (text_key, text_value, text_category, context) VALUES
('voice_connected', 'Voice Connected to LIMI AI', 'status_message', 'guest_page'),
('voice_disconnected', 'Voice Disconnected', 'status_message', 'guest_page'),
('loading_guests', 'Loading Hong Kong guests...', 'loading_message', 'guest_page'),
('welcome_title', 'Welcome to The Peninsula Hong Kong', 'title', 'guest_page'),
('ai_assistant_name', 'LIMI AI Assistant', 'label', 'guest_page'),
('room_controls_title', 'Room Controls', 'section_title', 'guest_page'),
('weather_title', 'Hong Kong Weather', 'section_title', 'guest_page'),
('events_title', 'Today''s Events', 'section_title', 'guest_page'),
('guest_profile_title', 'Guest Profile', 'section_title', 'guest_page'),
('location_title', 'Current Location', 'section_title', 'guest_page'),
('services_title', 'Quick Services', 'section_title', 'guest_page'),
('processing_message', 'LIMI AI is thinking...', 'status_message', 'guest_page'),
('connection_failed', 'Voice connection failed. You can still chat with me using text.', 'error_message', 'guest_page'),
('session_ended', 'Voice session ended.', 'status_message', 'guest_page');

-- Insert hotel services
INSERT INTO hotel_services (service_name, service_description, service_icon, service_category, availability_hours, guest_types, enabled) VALUES
('Room Service', 'In-room dining and beverage service', 'Utensils', 'dining', '24/7', '["all"]', true),
('Concierge', 'Personal assistance and local recommendations', 'Phone', 'concierge', '24/7', '["all"]', true),
('Transportation', 'Airport transfers and local transportation', 'Car', 'transport', '24/7', '["all"]', true),
('Do Not Disturb', 'Privacy and quiet time settings', 'Shield', 'amenity', '24/7', '["all"]', true),
('Spa Services', 'Wellness and relaxation treatments', 'Heart', 'wellness', '9:00-21:00', '["suite", "platinum", "vip"]', true),
('Business Center', 'Meeting rooms and business facilities', 'Settings', 'business', '24/7', '["suite", "platinum"]', true);

-- User component assignments for Hong Kong guests
INSERT INTO user_component_assignments (user_id, component_id, priority, position, visible, configuration)
SELECT 
    p.id,
    c.id,
    CASE 
        WHEN p.guest_type = 'suite' AND c.component_name = 'room_controls' THEN 10
        WHEN p.guest_type = 'suite' AND c.component_name = 'chat_interface' THEN 10  
        WHEN c.component_name = 'weather_card' THEN 8
        WHEN c.component_name = 'hotel_events' THEN 7
        ELSE c.default_priority
    END,
    'auto',
    true,
    CASE 
        WHEN c.component_name = 'weather_card' THEN '{"update_interval": 600000, "show_details": true}'
        WHEN c.component_name = 'room_controls' THEN '{"show_advanced": true, "quick_presets": true}'
        ELSE '{}'
    END
FROM profiles p
CROSS JOIN ui_components c
WHERE p.username IN ('umer_asif', 'taylor_ogen', 'karen_law', 'sarah_smith')
AND c.enabled = true;
