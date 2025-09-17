-- ===================================
-- HOTEL MULTI-AGENT CONTEXT SYSTEM
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- 1. USER MANAGEMENT & AUTH
-- ===================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    guest_type VARCHAR(20) DEFAULT 'standard', -- standard, vip, platinum, suite
    room_number VARCHAR(10),
    check_in_date TIMESTAMP WITH TIME ZONE,
    check_out_date TIMESTAMP WITH TIME ZONE,
    total_stays INTEGER DEFAULT 1,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Auth policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ===================================
-- 2. AGENT SYSTEM TABLES
-- ===================================

-- Agent types and their capabilities
CREATE TABLE agent_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    capabilities JSONB, -- What this agent can do
    priority INTEGER DEFAULT 1, -- Execution priority
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent execution logs
CREATE TABLE agent_executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_type_id INTEGER REFERENCES agent_types(id),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(100), -- Links to conversation session
    input_data JSONB, -- What was sent to the agent
    output_data JSONB, -- What the agent produced
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 3. GUEST CONTEXT SYSTEM
-- ===================================

-- Main guest entities (people, places, things)
CREATE TABLE guest_entities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(200) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- guest, room, service, preference, etc.
    category VARCHAR(50), -- lighting, dining, entertainment, etc.
    confidence_score DECIMAL(3,2) DEFAULT 0.5, -- How confident we are about this info
    source_agent VARCHAR(50), -- Which agent created this
    observations JSONB DEFAULT '[]', -- Array of observations
    metadata JSONB DEFAULT '{}', -- Additional structured data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, name, entity_type)
);

-- Relations between entities
CREATE TABLE guest_relations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    from_entity_id UUID REFERENCES guest_entities(id) ON DELETE CASCADE,
    to_entity_id UUID REFERENCES guest_entities(id) ON DELETE CASCADE,
    relation_type VARCHAR(100) NOT NULL,
    strength DECIMAL(3,2) DEFAULT 0.5, -- How strong this relationship is
    source_agent VARCHAR(50), -- Which agent identified this relation
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(from_entity_id, to_entity_id, relation_type)
);

-- ===================================
-- 4. AGENT-SPECIFIC CONTEXT STORAGE
-- ===================================

-- Summarization Agent - Key insights and summaries
CREATE TABLE guest_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    summary_type VARCHAR(50) NOT NULL, -- stay_summary, preference_summary, behavior_summary
    title VARCHAR(200),
    content TEXT NOT NULL,
    key_points JSONB DEFAULT '[]', -- Array of key insights
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    source_conversations JSONB DEFAULT '[]', -- References to conversations used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis Agent - Patterns and behavioral insights
CREATE TABLE guest_patterns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    pattern_type VARCHAR(50) NOT NULL, -- lighting_preference, timing_pattern, service_usage
    pattern_name VARCHAR(100),
    description TEXT,
    frequency_data JSONB, -- When/how often this pattern occurs
    triggers JSONB DEFAULT '[]', -- What triggers this pattern
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    sample_size INTEGER DEFAULT 1, -- How many observations support this pattern
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation Agent - Personalized suggestions
CREATE TABLE guest_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    recommendation_type VARCHAR(50) NOT NULL, -- lighting, dining, activity, service
    title VARCHAR(200),
    description TEXT,
    reasoning TEXT, -- Why this recommendation was made
    priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
    status VARCHAR(20) DEFAULT 'pending', -- pending, presented, accepted, declined
    valid_until TIMESTAMP WITH TIME ZONE, -- When this recommendation expires
    metadata JSONB DEFAULT '{}', -- Additional recommendation data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research Agent - Background information and context
CREATE TABLE guest_research (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    research_type VARCHAR(50) NOT NULL, -- preference_research, service_research, comparative_analysis
    query VARCHAR(500), -- What was researched
    findings TEXT, -- Research results
    sources JSONB DEFAULT '[]', -- Where information came from
    relevance_score DECIMAL(3,2) DEFAULT 0.5,
    applied_to_recommendations BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 5. CONVERSATION & INTERACTION TRACKING
-- ===================================

-- Conversation sessions
CREATE TABLE conversation_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_type VARCHAR(50) DEFAULT 'voice_chat', -- voice_chat, text_chat, service_request
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_interactions INTEGER DEFAULT 0,
    context_updates INTEGER DEFAULT 0, -- How many context updates occurred
    agent_executions INTEGER DEFAULT 0, -- How many agents were triggered
    satisfaction_score INTEGER, -- 1-5 rating if provided
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual interactions within sessions
CREATE TABLE conversation_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    interaction_type VARCHAR(50), -- user_message, ai_response, tool_execution, context_update
    content TEXT,
    metadata JSONB DEFAULT '{}', -- Additional interaction data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 6. INDEXES FOR PERFORMANCE
-- ===================================

-- User-based indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_room_number ON profiles(room_number);
CREATE INDEX idx_profiles_guest_type ON profiles(guest_type);

-- Entity indexes
CREATE INDEX idx_entities_user_type ON guest_entities(user_id, entity_type);
CREATE INDEX idx_entities_category ON guest_entities(category);
CREATE INDEX idx_entities_source_agent ON guest_entities(source_agent);
CREATE INDEX idx_entities_confidence ON guest_entities(confidence_score);

-- Relation indexes
CREATE INDEX idx_relations_user ON guest_relations(user_id);
CREATE INDEX idx_relations_from_entity ON guest_relations(from_entity_id);
CREATE INDEX idx_relations_to_entity ON guest_relations(to_entity_id);

-- Agent execution indexes
CREATE INDEX idx_executions_user_agent ON agent_executions(user_id, agent_type_id);
CREATE INDEX idx_executions_session ON agent_executions(session_id);
CREATE INDEX idx_executions_status ON agent_executions(status);

-- Context-specific indexes
CREATE INDEX idx_summaries_user_type ON guest_summaries(user_id, summary_type);
CREATE INDEX idx_patterns_user_type ON guest_patterns(user_id, pattern_type);
CREATE INDEX idx_recommendations_user_status ON guest_recommendations(user_id, status);
CREATE INDEX idx_research_user_type ON guest_research(user_id, research_type);

-- Conversation indexes
CREATE INDEX idx_sessions_user ON conversation_sessions(user_id);
CREATE INDEX idx_interactions_session ON conversation_interactions(session_id);
CREATE INDEX idx_interactions_user ON conversation_interactions(user_id);

-- ===================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ===================================

-- Guest entities
ALTER TABLE guest_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own entities" ON guest_entities
    USING (auth.uid() = user_id);

-- Guest relations
ALTER TABLE guest_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own relations" ON guest_relations
    USING (auth.uid() = user_id);

-- Agent executions
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own executions" ON agent_executions
    FOR SELECT USING (auth.uid() = user_id);

-- Context tables
ALTER TABLE guest_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own summaries" ON guest_summaries
    USING (auth.uid() = user_id);

ALTER TABLE guest_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own patterns" ON guest_patterns
    USING (auth.uid() = user_id);

ALTER TABLE guest_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own recommendations" ON guest_recommendations
    USING (auth.uid() = user_id);

ALTER TABLE guest_research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own research" ON guest_research
    USING (auth.uid() = user_id);

-- Conversation tables
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sessions" ON conversation_sessions
    USING (auth.uid() = user_id);

ALTER TABLE conversation_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own interactions" ON conversation_interactions
    USING (auth.uid() = user_id);
