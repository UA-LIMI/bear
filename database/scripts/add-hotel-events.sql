-- Add hotel events table for real-time hotel information
CREATE TABLE IF NOT EXISTS hotel_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id),
    event_name VARCHAR(200) NOT NULL,
    event_time TIME NOT NULL,
    event_description TEXT,
    event_type VARCHAR(50), -- service, dining, amenity, activity
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hotel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to hotel events" ON hotel_events FOR SELECT USING (true);

-- Insert Peninsula Hong Kong events
INSERT INTO hotel_events (hotel_id, event_name, event_time, event_description, event_type, active)
SELECT h.id, 'Afternoon Tea Service', '14:00:00', 'Traditional afternoon tea service in the lobby', 'dining', true
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

INSERT INTO hotel_events (hotel_id, event_name, event_time, event_description, event_type, active)
SELECT h.id, 'Executive Lounge Happy Hour', '18:00:00', 'Complimentary cocktails and canapés for suite guests', 'service', true
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

INSERT INTO hotel_events (hotel_id, event_name, event_time, event_description, event_type, active)
SELECT h.id, 'Rooftop Pool Open', '06:00:00', 'Rooftop pool and fitness center available', 'amenity', true
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

INSERT INTO hotel_events (hotel_id, event_name, event_time, event_description, event_type, active)
SELECT h.id, 'Spa Services Available', '09:00:00', 'Full spa treatments and wellness services', 'service', true
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';

INSERT INTO hotel_events (hotel_id, event_name, event_time, event_description, event_type, active)
SELECT h.id, 'Business Center', '24:00:00', 'Business center and meeting facilities available 24/7', 'service', true
FROM hotels h WHERE h.hotel_name = 'The Peninsula Hong Kong';
