-- Insert sample data for Peninsula Hong Kong Hotel System
-- Migration: 20250917000002_insert_sample_data

-- Insert hotel configuration
INSERT INTO hotels (hotel_name, hotel_address, ai_identity, ai_behavior_rules) VALUES
('The Peninsula Hong Kong',
 'Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong SAR',
 'You are an AI designed for The Peninsula Hong Kong to assist guests with every request they might have',
 '["Greet guests by name and room number", "Acknowledge membership status", "Confirm before room changes", "Speak in short clear sentences", "Handle interruptions gracefully", "Ask clarifying questions when unclear"]'
);

-- Insert rooms
INSERT INTO rooms (hotel_id, room_number, room_type, floor_number, description) 
SELECT h.id, 'room1', 'Owner Suite', 1, 'Owner suite with premium WLED lighting system'
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

-- Insert WLED device for room1
INSERT INTO devices (room_id, device_name, device_type, mqtt_topic, device_identifier, description)
SELECT r.id, 'Main Ceiling Light', 'WLED', 'room1', 'wled_room1_main', 'Primary WLED lighting controller'
FROM rooms r WHERE r.room_number = 'room1';

-- Insert WLED functions
INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Turn On', 'power', 'ON', 'Turn room lights on', 'basic', 5, 'Use when guest enters room', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Turn Off', 'power', 'OFF', 'Turn room lights off', 'basic', 5, 'Use when guest sleeps', true
FROM devices d WHERE d.mqtt_topic = 'room1';

INSERT INTO device_functions (device_id, function_name, payload_type, payload_value, description, category, rating, usage_example, enabled)
SELECT d.id, 'Romantic Candle', 'effect', 'FX=88', 'Warm flickering candle effect', 'romantic', 5, 'Perfect for intimate moments', true
FROM devices d WHERE d.mqtt_topic = 'room1';

-- Insert hotel events
INSERT INTO hotel_events (hotel_id, event_name, event_time, event_description, event_type, active)
SELECT h.id, 'Afternoon Tea Service', '14:00:00', 'Traditional afternoon tea in lobby', 'dining', true
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

INSERT INTO hotel_events (hotel_id, event_name, event_time, event_description, event_type, active)
SELECT h.id, 'Executive Lounge Happy Hour', '18:00:00', 'Complimentary cocktails for suite guests', 'service', true
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';
