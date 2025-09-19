-- CREATE TEST USERS FOR HOTEL SYSTEM
-- Note: These are created directly in auth.users (bypassing normal signup)
-- In production, users would sign up through the frontend

-- Insert users into auth.users table
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'umer_asif@limi.hotel',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "umer_asif", "display_name": "Umer Asif"}',
    false,
    'authenticated'
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'taylor_ogen@limi.hotel',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "taylor_ogen", "display_name": "Taylor Ogen"}',
    false,
    'authenticated'
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'karen_law@limi.hotel',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "karen_law", "display_name": "Karen Law"}',
    false,
    'authenticated'
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'sarah_smith@limi.hotel',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "sarah_smith", "display_name": "Sarah Smith"}',
    false,
    'authenticated'
);

-- Create corresponding profiles
INSERT INTO profiles (
    id,
    username,
    display_name,
    guest_type,
    room_number,
    total_stays,
    loyalty_points
) 
SELECT 
    u.id,
    u.raw_user_meta_data->>'username',
    u.raw_user_meta_data->>'display_name',
    CASE 
        WHEN u.raw_user_meta_data->>'username' = 'umer_asif' THEN 'suite'
        WHEN u.raw_user_meta_data->>'username' = 'taylor_ogen' THEN 'vip'
        WHEN u.raw_user_meta_data->>'username' = 'karen_law' THEN 'platinum'
        WHEN u.raw_user_meta_data->>'username' = 'sarah_smith' THEN 'standard'
    END,
    CASE 
        WHEN u.raw_user_meta_data->>'username' = 'umer_asif' THEN 'OWNER'
        WHEN u.raw_user_meta_data->>'username' = 'taylor_ogen' THEN '301'
        WHEN u.raw_user_meta_data->>'username' = 'karen_law' THEN '425'
        WHEN u.raw_user_meta_data->>'username' = 'sarah_smith' THEN '210'
    END,
    CASE 
        WHEN u.raw_user_meta_data->>'username' = 'umer_asif' THEN 100
        WHEN u.raw_user_meta_data->>'username' = 'taylor_ogen' THEN 15
        WHEN u.raw_user_meta_data->>'username' = 'karen_law' THEN 45
        WHEN u.raw_user_meta_data->>'username' = 'sarah_smith' THEN 3
    END,
    CASE 
        WHEN u.raw_user_meta_data->>'username' = 'umer_asif' THEN 10000
        WHEN u.raw_user_meta_data->>'username' = 'taylor_ogen' THEN 2800
        WHEN u.raw_user_meta_data->>'username' = 'karen_law' THEN 4500
        WHEN u.raw_user_meta_data->>'username' = 'sarah_smith' THEN 300
    END
FROM auth.users u
WHERE u.email LIKE '%@limi.hotel';
