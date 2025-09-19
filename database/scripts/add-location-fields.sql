-- ADD DETAILED LOCATION FIELDS TO USER PROFILES
-- Run this to extend the existing profiles table

-- Add location columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_location_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_location_city VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_location_country VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_location_coordinates POINT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_source VARCHAR(50) DEFAULT 'user_input';

-- Create location history table for tracking movements
CREATE TABLE IF NOT EXISTS user_location_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    location_address TEXT NOT NULL,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    coordinates POINT,
    location_source VARCHAR(50) DEFAULT 'user_input',
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on location history
ALTER TABLE user_location_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own location history" ON user_location_history
    USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_location_city ON profiles(current_location_city);
CREATE INDEX IF NOT EXISTS idx_profiles_location_country ON profiles(current_location_country);
CREATE INDEX IF NOT EXISTS idx_location_history_user ON user_location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_session ON user_location_history(session_id);

-- Update existing test users with sample locations
UPDATE profiles SET 
    current_location_address = CASE username
        WHEN 'umer_asif' THEN 'Limi Hotel, 123 Business District, Downtown Core'
        WHEN 'taylor_ogen' THEN '456 Green Avenue, Sustainability Hub, Eco District' 
        WHEN 'karen_law' THEN '789 Corporate Plaza, Financial Center, Business Bay'
        WHEN 'sarah_smith' THEN '321 Leisure Boulevard, Resort Area, Beachfront'
    END,
    current_location_city = CASE username
        WHEN 'umer_asif' THEN 'Singapore'
        WHEN 'taylor_ogen' THEN 'Copenhagen'
        WHEN 'karen_law' THEN 'Dubai'
        WHEN 'sarah_smith' THEN 'Bali'
    END,
    current_location_country = CASE username
        WHEN 'umer_asif' THEN 'Singapore'
        WHEN 'taylor_ogen' THEN 'Denmark'
        WHEN 'karen_law' THEN 'UAE'
        WHEN 'sarah_smith' THEN 'Indonesia'
    END,
    location_updated_at = NOW(),
    location_source = 'initial_setup'
WHERE username IN ('umer_asif', 'taylor_ogen', 'karen_law', 'sarah_smith');
