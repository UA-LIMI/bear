-- ===================================
-- SAMPLE HOTEL DATA & TEST USERS
-- ===================================

-- First, insert agent types
INSERT INTO agent_types (name, description, capabilities, priority) VALUES
('summarization', 'Condenses guest interactions into key insights', 
 '{"extract_preferences": true, "identify_patterns": true, "create_summaries": true}', 1),
('analysis', 'Analyzes patterns and behaviors from guest data', 
 '{"pattern_recognition": true, "behavior_analysis": true, "trend_identification": true}', 2),
('recommendation', 'Generates personalized service suggestions', 
 '{"preference_matching": true, "service_suggestions": true, "experience_optimization": true}', 3),
('research', 'Gathers background information and context', 
 '{"preference_research": true, "service_research": true, "comparative_analysis": true}', 4),
('orchestrator', 'Coordinates between agents and manages context flow', 
 '{"agent_coordination": true, "context_management": true, "workflow_optimization": true}', 1);

-- ===================================
-- TEST USER 1: UMER ASIF (Business Traveler & Hotel Owner)
-- ===================================
-- Note: These users will be created via Supabase auth, this is sample data structure

-- Sample entities for Umer Asif (user_id will be replaced with actual UUID)
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
-- Replace 'umer_uuid' with actual user ID after auth creation
('umer_uuid', 'Umer_Asif_Lighting_Preferences', 'preference', 'lighting', 0.9, 'analysis', 
 '["Prefers functional lighting for business work", "Uses bright white light for technical reviews", "Enjoys testing all lighting effects as hotel owner"]',
 '{"preferred_brightness": 75, "work_brightness": 90, "testing_mode": true, "preferred_effects": ["solid_white", "bright_white", "all_effects"]}'),

('umer_uuid', 'Umer_Asif_Schedule_Pattern', 'behavior', 'timing', 0.8, 'analysis',
 '["Works late hours on hotel management", "Tests hotel systems regularly", "Prefers consistent lighting setups"]',
 '{"work_hours": "flexible", "testing_schedule": "regular", "consistency_preference": "high"}'),

('umer_uuid', 'Room_Owner_Suite', 'location', 'accommodation', 1.0, 'orchestrator',
 '["Owner suite with all amenities", "Testing room for new lighting features", "Has latest WLED system"]',
 '{"room_type": "owner_suite", "view": "premium", "floor": "penthouse", "amenities": ["office", "testing_area", "latest_tech"]}'),

('umer_uuid', 'Hotel_Management_Preferences', 'preference', 'services', 0.9, 'research',
 '["Focuses on guest experience optimization", "Tests all hotel features personally", "Values system reliability and performance"]',
 '{"role": "owner", "priorities": ["guest_experience", "system_testing", "reliability"], "access_level": "full"}'
);

-- Relations for John Smith
INSERT INTO guest_relations (user_id, from_entity_id, to_entity_id, relation_type, strength, source_agent) VALUES
-- These would reference actual entity IDs, simplified for example
('user1_uuid', 'entity_id_john_prefs', 'entity_id_room_237', 'applied_in', 0.9, 'orchestrator'),
('user1_uuid', 'entity_id_john_schedule', 'entity_id_business_prefs', 'influences', 0.8, 'analysis');

-- ===================================
-- TEST USER 2: TAYLOR OGEN (Sustainability Researcher)
-- ===================================
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
('taylor_uuid', 'Taylor_Ogen_Eco_Preferences', 'preference', 'lighting', 0.9, 'research',
 '["Prefers energy-efficient lighting", "Interested in circadian rhythm lighting", "Values sustainable hotel practices"]',
 '{"eco_conscious": true, "energy_efficiency": "high_priority", "preferred_effects": ["natural_white", "warm_sunset", "sunrise_simulation"]}'),

('taylor_uuid', 'Taylor_Ogen_Research_Schedule', 'behavior', 'timing', 0.85, 'analysis',
 '["Works on research projects in evenings", "Prefers natural light cycles", "Values quiet environment for concentration"]',
 '{"work_hours": "19:00-23:00", "natural_cycles": true, "concentration_needs": "high"}'),

('taylor_uuid', 'Room_Green_Suite', 'location', 'accommodation', 1.0, 'orchestrator',
 '["Eco-friendly suite with sustainable features", "Natural lighting integration", "Energy monitoring systems"]',
 '{"room_type": "eco_suite", "sustainability_features": true, "energy_monitoring": true}'),

('taylor_uuid', 'Sustainability_Research_Context', 'preference', 'services', 0.8, 'research',
 '["Studies renewable energy systems", "Interested in hotel sustainability metrics", "Appreciates transparency in energy usage"]',
 '{"research_field": "renewable_energy", "interests": ["sustainability_metrics", "energy_transparency"], "professional_focus": true}');

-- ===================================
-- TEST USER 3: KAREN LAW (Business Professional)
-- ===================================
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
('karen_uuid', 'Karen_Law_Professional_Preferences', 'preference', 'lighting', 0.85, 'analysis',
 '["Prefers clean, professional lighting", "Uses bright light for video calls", "Appreciates adjustable brightness"]',
 '{"professional_focus": true, "video_call_lighting": 85, "preferred_effects": ["clean_white", "professional_bright"]}'),

('karen_uuid', 'Karen_Law_Work_Schedule', 'behavior', 'timing', 0.8, 'analysis',
 '["Early morning meetings at 7 AM", "Video conferences throughout day", "Prefers consistent lighting during work hours"]',
 '{"morning_meetings": "07:00", "work_hours": "07:00-18:00", "consistency_preference": "high"}'),

('karen_uuid', 'Room_Business_Center', 'location', 'accommodation', 1.0, 'orchestrator',
 '["Business center suite with conference setup", "Professional lighting system", "High-speed internet"]',
 '{"room_type": "business_suite", "conference_setup": true, "professional_amenities": ["desk", "meeting_space", "tech_support"]}'),

('karen_uuid', 'Business_Travel_Preferences', 'preference', 'services', 0.9, 'research',
 '["Values efficient check-in/out", "Needs reliable technology", "Prefers quiet professional environment"]',
 '{"efficiency_priority": true, "tech_reliability": "critical", "environment": "professional_quiet"}');

-- ===================================
-- TEST USER 4: SARAH SMITH (Leisure Traveler)
-- ===================================
INSERT INTO guest_entities (user_id, name, entity_type, category, confidence_score, source_agent, observations, metadata) VALUES
('sarah_uuid', 'Sarah_Smith_Relaxation_Preferences', 'preference', 'lighting', 0.9, 'summarization',
 '["Enjoys warm, cozy lighting", "Loves sunset and sunrise effects", "Prefers colorful ambiance for relaxation"]',
 '{"relaxation_focus": true, "favorite_effects": ["sunset", "sunrise", "warm_cozy"], "ambiance_preference": "colorful"}'),

('sarah_uuid', 'Sarah_Smith_Leisure_Schedule', 'behavior', 'timing', 0.8, 'analysis',
 '["Late morning starts around 9 AM", "Enjoys evening relaxation time", "Flexible schedule for leisure activities"]',
 '{"morning_start": "09:00", "evening_relaxation": "20:00-23:00", "schedule_flexibility": "high"}'),

('sarah_uuid', 'Room_Comfort_Suite', 'location', 'accommodation', 1.0, 'orchestrator',
 '["Comfort-focused suite with relaxation amenities", "Ambient lighting system", "Spa-like atmosphere"]',
 '{"room_type": "comfort_suite", "relaxation_amenities": true, "atmosphere": "spa_like"}'),

('sarah_uuid', 'Leisure_Travel_Preferences', 'preference', 'services', 0.85, 'research',
 '["Enjoys spa services", "Values comfortable atmosphere", "Appreciates personalized attention"]',
 '{"service_preferences": ["spa", "comfort_amenities"], "atmosphere": "comfortable", "personalization": "appreciated"}');

-- ===================================
-- SAMPLE SUMMARIES (Generated by Summarization Agent)
-- ===================================
INSERT INTO guest_summaries (user_id, summary_type, title, content, key_points, confidence_score) VALUES
('umer_uuid', 'stay_summary', 'Umer Asif - Hotel Owner Testing Pattern Analysis',
 'Umer Asif approaches the hotel experience from both guest and owner perspectives. He systematically tests lighting features, values functional setups for business work, and maintains high standards for system reliability. His preferences focus on comprehensive testing and guest experience optimization.',
 '["Owner perspective", "Systematic testing approach", "Functional business lighting", "High reliability standards"]', 0.95),

('taylor_uuid', 'preference_summary', 'Taylor Ogen - Sustainability-Focused Guest Profile',
 'Taylor Ogen demonstrates strong eco-consciousness in hotel preferences. They prioritize energy-efficient lighting, show interest in circadian rhythm support, and value transparency in sustainability practices. Their research background influences their appreciation for innovative green technologies.',
 '["Eco-conscious preferences", "Energy efficiency priority", "Circadian rhythm interest", "Sustainability transparency valued"]', 0.9),

('karen_uuid', 'stay_summary', 'Karen Law - Professional Business Traveler Profile',
 'Karen Law maintains a highly professional approach to hotel stays. She requires consistent, clean lighting for video conferences, values reliable technology, and appreciates efficient service delivery. Her preferences center on maintaining professional productivity.',
 '["Professional consistency", "Video conference lighting needs", "Technology reliability", "Efficiency valued"]', 0.88),

('sarah_uuid', 'preference_summary', 'Sarah Smith - Leisure-Focused Relaxation Profile',
 'Sarah Smith seeks a relaxing, comfortable hotel experience with emphasis on ambiance and personal comfort. She enjoys colorful lighting effects, flexible scheduling, and spa-like amenities. Her preferences indicate a focus on stress relief and leisure enjoyment.',
 '["Relaxation focus", "Colorful ambiance preference", "Flexible scheduling", "Spa-like comfort desired"]', 0.85);

-- ===================================
-- SAMPLE PATTERNS (Generated by Analysis Agent)
-- ===================================
INSERT INTO guest_patterns (user_id, pattern_type, pattern_name, description, frequency_data, confidence_score, sample_size) VALUES
('user1_uuid', 'lighting_preference', 'Work-focused lighting pattern',
 'Consistently requests bright white lighting during work hours (7-11 PM) and dims lights for calls after 9 PM',
 '{"work_hours": "19:00-23:00", "call_dimming": "21:00+", "brightness_work": 80, "brightness_calls": 30}', 0.85, 8),

('user3_uuid', 'timing_pattern', 'Gaming session lighting cycle',
 'Activates dynamic, colorful lighting effects during late-night gaming sessions, then transitions to calm lighting for sleep',
 '{"gaming_start": "22:00", "gaming_end": "02:00", "transition_duration": "30min", "sleep_prep": "02:00-02:30"}', 0.8, 5);

-- ===================================
-- SAMPLE RECOMMENDATIONS (Generated by Recommendation Agent)
-- ===================================
INSERT INTO guest_recommendations (user_id, recommendation_type, title, description, reasoning, priority, status) VALUES
('user1_uuid', 'lighting', 'Automated Work Lighting Profile',
 'Set up an automated lighting profile that switches to bright white light at 7 PM and dims for evening calls after 9 PM',
 'Based on consistent pattern of manual lighting adjustments during business hours over 8 stays', 1, 'pending'),

('user2_uuid', 'lighting', 'Anniversary Surprise Lighting Sequence',
 'Create a special romantic lighting sequence with candle effects and warm colors for anniversary celebration',
 'User has shown strong preference for romantic lighting and is celebrating special occasion', 1, 'pending'),

('user4_uuid', 'lighting', 'Circadian Rhythm Lighting Program',
 'Implement gradual lighting transitions that support natural circadian rhythms for wellness routine',
 'User practices meditation and wellness routines that would benefit from circadian-supporting lighting', 2, 'pending');

-- ===================================
-- SAMPLE RESEARCH (Generated by Research Agent)  
-- ===================================
INSERT INTO guest_research (user_id, research_type, query, findings, sources, relevance_score) VALUES
('user1_uuid', 'preference_research', 'Business traveler lighting preferences in luxury hotels',
 'Research indicates business travelers prefer consistent, functional lighting with minimal variation. 78% prefer white light for work, 65% prefer dimmer settings for evening calls.',
 '["Hotel industry reports", "Guest satisfaction surveys", "Lighting preference studies"]', 0.8),

('user4_uuid', 'service_research', 'Circadian rhythm lighting benefits for hotel guests',
 'Studies show circadian rhythm lighting can improve sleep quality by 23% and reduce jet lag effects by 31% for hotel guests. Gradual transitions are preferred over sudden changes.',
 '["Sleep research journals", "Hospitality lighting studies", "Circadian rhythm research"]', 0.9);

-- ===================================
-- NOTES FOR IMPLEMENTATION
-- ===================================

/*
IMPLEMENTATION STEPS:
1. Run the main schema file first
2. Create actual users via Supabase auth signup
3. Replace 'userX_uuid' with actual user UUIDs from auth.users
4. Insert sample data with real UUIDs
5. Test agent workflows with this data

AGENT WORKFLOW EXAMPLE:
1. Guest interacts with voice system
2. Orchestrator agent logs conversation
3. Analysis agent identifies patterns from interaction
4. Research agent gathers relevant context
5. Summarization agent creates insights
6. Recommendation agent generates suggestions
7. All data persists in respective tables
8. Next login pulls comprehensive context

TESTING SCENARIOS:
- John Smith: Test business-focused lighting automation
- Sarah Johnson: Test romantic lighting recommendations
- Mike Chen: Test gaming lighting profiles
- Elena Rodriguez: Test wellness lighting programs  
- Robert Taylor: Test loyalty member consistency preferences
*/
