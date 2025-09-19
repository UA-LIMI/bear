-- UPDATE TEST USERS WITH REALISTIC HONG KONG HOTEL LOCATIONS
-- All users staying at The Peninsula Hong Kong but in different areas/activities

UPDATE profiles SET 
    current_location_address = CASE username
        WHEN 'umer_asif' THEN 'The Peninsula Hong Kong, Salisbury Road, Tsim Sha Tsui, Kowloon'
        WHEN 'taylor_ogen' THEN 'IFC Mall, 8 Finance Street, Central, Hong Kong Island (near The Peninsula Hong Kong)'
        WHEN 'karen_law' THEN 'Exchange Square, 8 Connaught Place, Central, Hong Kong Island (near The Peninsula Hong Kong)'
        WHEN 'sarah_smith' THEN 'Harbour City, Canton Road, Tsim Sha Tsui, Kowloon (near The Peninsula Hong Kong)'
    END,
    current_location_city = 'Hong Kong',
    current_location_country = 'Hong Kong SAR',
    location_updated_at = NOW(),
    location_source = 'realistic_hk_setup'
WHERE username IN ('umer_asif', 'taylor_ogen', 'karen_law', 'sarah_smith');

-- Add detailed location history showing their movements around Hong Kong
INSERT INTO user_location_history (user_id, location_address, location_city, location_country, location_source, session_id) 
SELECT 
    p.id,
    CASE p.username
        WHEN 'umer_asif' THEN 'The Peninsula Hong Kong - Owner Suite, Salisbury Road, Tsim Sha Tsui'
        WHEN 'taylor_ogen' THEN 'IFC Mall - Sustainable Shopping District, Central Hong Kong'
        WHEN 'karen_law' THEN 'Exchange Square - Financial District, Central Hong Kong'  
        WHEN 'sarah_smith' THEN 'Harbour City Shopping Centre, Canton Road, Tsim Sha Tsui'
    END,
    'Hong Kong',
    'Hong Kong SAR',
    'detailed_location_setup',
    'hk_setup_session'
FROM profiles p 
WHERE p.username IN ('umer_asif', 'taylor_ogen', 'karen_law', 'sarah_smith');
