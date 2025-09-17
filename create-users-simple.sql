-- SIMPLE USER CREATION FOR HOTEL SYSTEM
-- This creates profiles that can be linked to users created via Supabase Dashboard

-- First, create users manually in Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add user" for each:
--    - Email: umer_asif@limi.hotel, Password: password123
--    - Email: taylor_ogen@limi.hotel, Password: password123  
--    - Email: karen_law@limi.hotel, Password: password123
--    - Email: sarah_smith@limi.hotel, Password: password123

-- Then run this SQL to create their profiles:
-- (Replace the UUIDs below with the actual user IDs from the dashboard)

-- Example profile creation (update UUIDs after creating users):
/*
INSERT INTO profiles (
    id,
    username, 
    display_name,
    guest_type,
    room_number,
    total_stays,
    loyalty_points
) VALUES 
(
    'REPLACE_WITH_UMER_UUID',
    'umer_asif',
    'Umer Asif', 
    'suite',
    'OWNER',
    100,
    10000
),
(
    'REPLACE_WITH_TAYLOR_UUID',
    'taylor_ogen',
    'Taylor Ogen',
    'vip', 
    '301',
    15,
    2800
),
(
    'REPLACE_WITH_KAREN_UUID', 
    'karen_law',
    'Karen Law',
    'platinum',
    '425', 
    45,
    4500
),
(
    'REPLACE_WITH_SARAH_UUID',
    'sarah_smith', 
    'Sarah Smith',
    'standard',
    '210',
    3,
    300
);
*/

-- Query to get user IDs after creating them:
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email LIKE '%@limi.hotel' ORDER BY created_at;
