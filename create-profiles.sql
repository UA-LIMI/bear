-- CREATE PROFILES FOR TEST USERS
-- Using the actual UUIDs from Supabase

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
    'a397a03b-f65e-42c1-a8ed-6bebb7c6751b',
    'umer_asif',
    'Umer Asif', 
    'suite',
    'OWNER',
    100,
    10000
),
(
    '22bbda6e-f82e-4910-84c2-dd694aa2953f',
    'taylor_ogen',
    'Taylor Ogen',
    'vip', 
    '301',
    15,
    2800
),
(
    '0c359b31-5129-47da-ae5c-019cf141507e', 
    'karen_law',
    'Karen Law',
    'platinum',
    '425', 
    45,
    4500
),
(
    '7d759560-046b-452e-9965-a9b00871ba1c',
    'sarah_smith', 
    'Sarah Smith',
    'standard',
    '210',
    3,
    300
);
