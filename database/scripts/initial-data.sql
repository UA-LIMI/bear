-- INITIAL DATA FOR HOTEL MULTI-AGENT SYSTEM
-- Run this AFTER database-schema-clean.sql

-- Insert agent types
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
