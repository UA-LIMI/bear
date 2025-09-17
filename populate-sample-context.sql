-- POPULATE SAMPLE CONTEXT DATA FOR TEST USERS
-- Using actual UUIDs from the created users

-- ===================================
-- GUEST ENTITIES FOR UMER ASIF (Hotel Owner)
-- ===================================
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
('a397a03b-f65e-42c1-a8ed-6bebb7c6751b', 'Umer_Asif_Lighting_Preferences', 'preference', 'lighting', 0.9, 'analysis', 
 '["Prefers functional lighting for business work", "Uses bright white light for technical reviews", "Enjoys testing all lighting effects as hotel owner"]',
 '{"preferred_brightness": 75, "work_brightness": 90, "testing_mode": true, "preferred_effects": ["solid_white", "bright_white", "all_effects"]}'),

('a397a03b-f65e-42c1-a8ed-6bebb7c6751b', 'Umer_Asif_Schedule_Pattern', 'behavior', 'timing', 0.8, 'analysis',
 '["Works late hours on hotel management", "Tests hotel systems regularly", "Prefers consistent lighting setups"]',
 '{"work_hours": "flexible", "testing_schedule": "regular", "consistency_preference": "high"}'),

('a397a03b-f65e-42c1-a8ed-6bebb7c6751b', 'Room_Owner_Suite', 'location', 'accommodation', 1.0, 'orchestrator',
 '["Owner suite with all amenities", "Testing room for new lighting features", "Has latest WLED system"]',
 '{"room_type": "owner_suite", "view": "premium", "floor": "penthouse", "amenities": ["office", "testing_area", "latest_tech"]}'),

('a397a03b-f65e-42c1-a8ed-6bebb7c6751b', 'Hotel_Management_Preferences', 'preference', 'services', 0.9, 'research',
 '["Focuses on guest experience optimization", "Tests all hotel features personally", "Values system reliability and performance"]',
 '{"role": "owner", "priorities": ["guest_experience", "system_testing", "reliability"], "access_level": "full"}');

-- ===================================
-- GUEST ENTITIES FOR TAYLOR OGEN (Sustainability Researcher)
-- ===================================
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
('22bbda6e-f82e-4910-84c2-dd694aa2953f', 'Taylor_Ogen_Eco_Preferences', 'preference', 'lighting', 0.9, 'research',
 '["Prefers energy-efficient lighting", "Interested in circadian rhythm lighting", "Values sustainable hotel practices"]',
 '{"eco_conscious": true, "energy_efficiency": "high_priority", "preferred_effects": ["natural_white", "warm_sunset", "sunrise_simulation"]}'),

('22bbda6e-f82e-4910-84c2-dd694aa2953f', 'Taylor_Ogen_Research_Schedule', 'behavior', 'timing', 0.85, 'analysis',
 '["Works on research projects in evenings", "Prefers natural light cycles", "Values quiet environment for concentration"]',
 '{"work_hours": "19:00-23:00", "natural_cycles": true, "concentration_needs": "high"}'),

('22bbda6e-f82e-4910-84c2-dd694aa2953f', 'Room_Green_Suite', 'location', 'accommodation', 1.0, 'orchestrator',
 '["Eco-friendly suite with sustainable features", "Natural lighting integration", "Energy monitoring systems"]',
 '{"room_type": "eco_suite", "sustainability_features": true, "energy_monitoring": true}'),

('22bbda6e-f82e-4910-84c2-dd694aa2953f', 'Sustainability_Research_Context', 'preference', 'services', 0.8, 'research',
 '["Studies renewable energy systems", "Interested in hotel sustainability metrics", "Appreciates transparency in energy usage"]',
 '{"research_field": "renewable_energy", "interests": ["sustainability_metrics", "energy_transparency"], "professional_focus": true}');

-- ===================================
-- GUEST ENTITIES FOR KAREN LAW (Business Professional)
-- ===================================
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
('0c359b31-5129-47da-ae5c-019cf141507e', 'Karen_Law_Professional_Preferences', 'preference', 'lighting', 0.85, 'analysis',
 '["Prefers clean, professional lighting", "Uses bright light for video calls", "Appreciates adjustable brightness"]',
 '{"professional_focus": true, "video_call_lighting": 85, "preferred_effects": ["clean_white", "professional_bright"]}'),

('0c359b31-5129-47da-ae5c-019cf141507e', 'Karen_Law_Work_Schedule', 'behavior', 'timing', 0.8, 'analysis',
 '["Early morning meetings at 7 AM", "Video conferences throughout day", "Prefers consistent lighting during work hours"]',
 '{"morning_meetings": "07:00", "work_hours": "07:00-18:00", "consistency_preference": "high"}'),

('0c359b31-5129-47da-ae5c-019cf141507e', 'Room_Business_Center', 'location', 'accommodation', 1.0, 'orchestrator',
 '["Business center suite with conference setup", "Professional lighting system", "High-speed internet"]',
 '{"room_type": "business_suite", "conference_setup": true, "professional_amenities": ["desk", "meeting_space", "tech_support"]}'),

('0c359b31-5129-47da-ae5c-019cf141507e', 'Business_Travel_Preferences', 'preference', 'services', 0.9, 'research',
 '["Values efficient check-in/out", "Needs reliable technology", "Prefers quiet professional environment"]',
 '{"efficiency_priority": true, "tech_reliability": "critical", "environment": "professional_quiet"}');

-- ===================================
-- GUEST ENTITIES FOR SARAH SMITH (Leisure Traveler)
-- ===================================
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
('7d759560-046b-452e-9965-a9b00871ba1c', 'Sarah_Smith_Relaxation_Preferences', 'preference', 'lighting', 0.9, 'summarization',
 '["Enjoys warm, cozy lighting", "Loves sunset and sunrise effects", "Prefers colorful ambiance for relaxation"]',
 '{"relaxation_focus": true, "favorite_effects": ["sunset", "sunrise", "warm_cozy"], "ambiance_preference": "colorful"}'),

('7d759560-046b-452e-9965-a9b00871ba1c', 'Sarah_Smith_Leisure_Schedule', 'behavior', 'timing', 0.8, 'analysis',
 '["Late morning starts around 9 AM", "Enjoys evening relaxation time", "Flexible schedule for leisure activities"]',
 '{"morning_start": "09:00", "evening_relaxation": "20:00-23:00", "schedule_flexibility": "high"}'),

('7d759560-046b-452e-9965-a9b00871ba1c', 'Room_Comfort_Suite', 'location', 'accommodation', 1.0, 'orchestrator',
 '["Comfort-focused suite with relaxation amenities", "Ambient lighting system", "Spa-like atmosphere"]',
 '{"room_type": "comfort_suite", "relaxation_amenities": true, "atmosphere": "spa_like"}'),

('7d759560-046b-452e-9965-a9b00871ba1c', 'Leisure_Travel_Preferences', 'preference', 'services', 0.85, 'research',
 '["Enjoys spa services", "Values comfortable atmosphere", "Appreciates personalized attention"]',
 '{"service_preferences": ["spa", "comfort_amenities"], "atmosphere": "comfortable", "personalization": "appreciated"}');

-- ===================================
-- SAMPLE SUMMARIES (Generated by Summarization Agent)
-- ===================================
INSERT INTO guest_summaries (user_id, summary_type, title, content, key_points, confidence_score) VALUES
('a397a03b-f65e-42c1-a8ed-6bebb7c6751b', 'stay_summary', 'Umer Asif - Hotel Owner Testing Pattern Analysis',
 'Umer Asif approaches the hotel experience from both guest and owner perspectives. He systematically tests lighting features, values functional setups for business work, and maintains high standards for system reliability. His preferences focus on comprehensive testing and guest experience optimization.',
 '["Owner perspective", "Systematic testing approach", "Functional business lighting", "High reliability standards"]', 0.95),

('22bbda6e-f82e-4910-84c2-dd694aa2953f', 'preference_summary', 'Taylor Ogen - Sustainability-Focused Guest Profile',
 'Taylor Ogen demonstrates strong eco-consciousness in hotel preferences. They prioritize energy-efficient lighting, show interest in circadian rhythm support, and value transparency in sustainability practices. Their research background influences their appreciation for innovative green technologies.',
 '["Eco-conscious preferences", "Energy efficiency priority", "Circadian rhythm interest", "Sustainability transparency valued"]', 0.9),

('0c359b31-5129-47da-ae5c-019cf141507e', 'stay_summary', 'Karen Law - Professional Business Traveler Profile',
 'Karen Law maintains a highly professional approach to hotel stays. She requires consistent, clean lighting for video conferences, values reliable technology, and appreciates efficient service delivery. Her preferences center on maintaining professional productivity.',
 '["Professional consistency", "Video conference lighting needs", "Technology reliability", "Efficiency valued"]', 0.88),

('7d759560-046b-452e-9965-a9b00871ba1c', 'preference_summary', 'Sarah Smith - Leisure-Focused Relaxation Profile',
 'Sarah Smith seeks a relaxing, comfortable hotel experience with emphasis on ambiance and personal comfort. She enjoys colorful lighting effects, flexible scheduling, and spa-like amenities. Her preferences indicate a focus on stress relief and leisure enjoyment.',
 '["Relaxation focus", "Colorful ambiance preference", "Flexible scheduling", "Spa-like comfort desired"]', 0.85);

-- ===================================
-- SAMPLE RECOMMENDATIONS (Generated by Recommendation Agent)
-- ===================================
INSERT INTO guest_recommendations (user_id, recommendation_type, title, description, reasoning, priority, status) VALUES
('a397a03b-f65e-42c1-a8ed-6bebb7c6751b', 'lighting', 'Owner Testing Dashboard Integration',
 'Create a comprehensive lighting control dashboard for systematic testing of all WLED effects and configurations',
 'Based on owner role and systematic testing patterns observed across multiple stays', 1, 'pending'),

('22bbda6e-f82e-4910-84c2-dd694aa2953f', 'lighting', 'Circadian Rhythm Lighting Program',
 'Implement automated circadian rhythm lighting that adjusts throughout the day to support natural sleep cycles',
 'User shows strong interest in natural lighting cycles and sustainable practices', 1, 'pending'),

('0c359b31-5129-47da-ae5c-019cf141507e', 'lighting', 'Professional Video Call Lighting Profile',
 'Set up optimized lighting profile that automatically activates during business hours for video conferencing',
 'Based on consistent pattern of early morning meetings and video conference usage', 1, 'pending'),

('7d759560-046b-452e-9965-a9b00871ba1c', 'lighting', 'Relaxation Ambiance Sequence',
 'Create a personalized relaxation lighting sequence with sunset effects and warm colors for evening wind-down',
 'User consistently prefers colorful, warm lighting for relaxation and stress relief', 2, 'pending');
