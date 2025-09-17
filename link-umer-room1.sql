-- Link Umer Asif to Room1 WLED Controller
-- Run this in Supabase to connect Umer's profile to room1

UPDATE profiles 
SET room_number = 'room1'
WHERE username = 'umer_asif';

-- Add room1 entity for Umer
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
('a397a03b-f65e-42c1-a8ed-6bebb7c6751b', 'Room1_WLED_Controller', 'device', 'lighting', 1.0, 'system',
 '["Connected to MQTT broker mqtt.limilighting.com", "Supports full WLED API", "Room1 main lighting controller"]',
 '{"mqtt_topic": "room1", "device_type": "WLED", "api_support": ["FX", "color", "brightness"], "effects_available": true}');

-- Verify the update
SELECT username, room_number, current_location_address FROM profiles WHERE username = 'umer_asif';
