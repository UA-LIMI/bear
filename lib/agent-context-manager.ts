// ===================================
// MULTI-AGENT CONTEXT MANAGEMENT
// ===================================

import { supabase } from './supabase-auth'

// ===================================
// TYPES
// ===================================

export interface AgentExecution {
  id: string
  agent_type_id: number
  user_id: string
  session_id: string
  input_data: Record<string, unknown>
  output_data: Record<string, unknown>
  execution_time_ms: number
  status: 'pending' | 'completed' | 'failed'
  error_message?: string
  created_at: string
}

export interface GuestEntity {
  id: string
  user_id: string
  name: string
  entity_type: string
  category: string
  confidence_score: number
  source_agent: string
  observations: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface GuestRelation {
  id: string
  user_id: string
  from_entity_id: string
  to_entity_id: string
  relation_type: string
  strength: number
  source_agent: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AgentContextResult {
  success: boolean
  data?: unknown
  error?: string
}

// ===================================
// AGENT CONTEXT MANAGER CLASS
// ===================================

export class AgentContextManager {
  private userId: string
  private sessionId: string
  
  constructor(userId: string, sessionId?: string) {
    this.userId = userId
    this.sessionId = sessionId || `session_${Date.now()}`
  }
  
  // ===================================
  // AGENT EXECUTION TRACKING
  // ===================================
  
  async logAgentExecution(
    agentName: string,
    inputData: Record<string, unknown>,
    outputData: Record<string, unknown>,
    executionTimeMs: number,
    status: 'completed' | 'failed' = 'completed',
    errorMessage?: string
  ): Promise<AgentContextResult> {
    try {
      // Get agent type ID
      const { data: agentType, error: agentError } = await supabase
        .from('agent_types')
        .select('id')
        .eq('name', agentName)
        .single()
      
      if (agentError || !agentType) {
        return { success: false, error: `Unknown agent type: ${agentName}` }
      }
      
      const { data, error } = await supabase
        .from('agent_executions')
        .insert({
          agent_type_id: agentType.id,
          user_id: this.userId,
          session_id: this.sessionId,
          input_data: inputData,
          output_data: outputData,
          execution_time_ms: executionTimeMs,
          status,
          error_message: errorMessage
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  // ===================================
  // ENTITY MANAGEMENT
  // ===================================
  
  async createOrUpdateEntity(
    name: string,
    entityType: string,
    category: string,
    observations: string[],
    metadata: Record<string, unknown> = {},
    sourceAgent: string,
    confidenceScore: number = 0.5
  ): Promise<AgentContextResult> {
    try {
      const { data, error } = await supabase
        .from('guest_entities')
        .upsert({
          user_id: this.userId,
          name,
          entity_type: entityType,
          category,
          observations,
          metadata,
          source_agent: sourceAgent,
          confidence_score: confidenceScore,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,name,entity_type',
          ignoreDuplicates: false
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  async addObservationToEntity(
    entityName: string,
    entityType: string,
    observation: string,
    sourceAgent: string
  ): Promise<AgentContextResult> {
    try {
      // Get existing entity
      const { data: entity, error: fetchError } = await supabase
        .from('guest_entities')
        .select('*')
        .eq('user_id', this.userId)
        .eq('name', entityName)
        .eq('entity_type', entityType)
        .single()
      
      if (fetchError) {
        return { success: false, error: `Entity not found: ${entityName}` }
      }
      
      // Add observation if not already present
      const observations = entity.observations || []
      if (!observations.includes(observation)) {
        observations.push(observation)
        
        const { data, error } = await supabase
          .from('guest_entities')
          .update({
            observations,
            source_agent: sourceAgent,
            updated_at: new Date().toISOString()
          })
          .eq('id', entity.id)
          .select()
          .single()
        
        if (error) {
          return { success: false, error: error.message }
        }
        
        return { success: true, data }
      }
      
      return { success: true, data: entity }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  // ===================================
  // RELATION MANAGEMENT
  // ===================================
  
  async createRelation(
    fromEntityName: string,
    toEntityName: string,
    relationType: string,
    strength: number = 0.5,
    sourceAgent: string,
    metadata: Record<string, unknown> = {}
  ): Promise<AgentContextResult> {
    try {
      // Get entity IDs
      const { data: fromEntity } = await supabase
        .from('guest_entities')
        .select('id')
        .eq('user_id', this.userId)
        .eq('name', fromEntityName)
        .single()
      
      const { data: toEntity } = await supabase
        .from('guest_entities')
        .select('id')
        .eq('user_id', this.userId)
        .eq('name', toEntityName)
        .single()
      
      if (!fromEntity || !toEntity) {
        return { success: false, error: 'One or both entities not found' }
      }
      
      const { data, error } = await supabase
        .from('guest_relations')
        .upsert({
          user_id: this.userId,
          from_entity_id: fromEntity.id,
          to_entity_id: toEntity.id,
          relation_type: relationType,
          strength,
          source_agent: sourceAgent,
          metadata
        }, {
          onConflict: 'from_entity_id,to_entity_id,relation_type',
          ignoreDuplicates: false
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  // ===================================
  // CONTEXT RETRIEVAL
  // ===================================
  
  async getFullGuestContext(): Promise<AgentContextResult> {
    try {
      // Get all entities
      const { data: entities, error: entitiesError } = await supabase
        .from('guest_entities')
        .select('*')
        .eq('user_id', this.userId)
        .order('confidence_score', { ascending: false })
      
      if (entitiesError) {
        return { success: false, error: entitiesError.message }
      }
      
      // Get all relations
      const { data: relations, error: relationsError } = await supabase
        .from('guest_relations')
        .select('*')
        .eq('user_id', this.userId)
        .order('strength', { ascending: false })
      
      if (relationsError) {
        return { success: false, error: relationsError.message }
      }
      
      // Get recent summaries
      const { data: summaries, error: summariesError } = await supabase
        .from('guest_summaries')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (summariesError) {
        return { success: false, error: summariesError.message }
      }
      
      // Get active recommendations
      const { data: recommendations, error: recommendationsError } = await supabase
        .from('guest_recommendations')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'pending')
        .order('priority', { ascending: true })
      
      if (recommendationsError) {
        return { success: false, error: recommendationsError.message }
      }
      
      return {
        success: true,
        data: {
          entities,
          relations,
          summaries,
          recommendations,
          context_summary: this.generateContextSummary(entities, relations, summaries)
        }
      }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  async getContextByCategory(category: string): Promise<AgentContextResult> {
    try {
      const { data: entities, error } = await supabase
        .from('guest_entities')
        .select('*')
        .eq('user_id', this.userId)
        .eq('category', category)
        .order('confidence_score', { ascending: false })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data: entities }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  // ===================================
  // AGENT-SPECIFIC CONTEXT STORAGE
  // ===================================
  
  async storeSummary(
    summaryType: string,
    title: string,
    content: string,
    keyPoints: string[],
    confidenceScore: number = 0.5,
    sourceConversations: string[] = []
  ): Promise<AgentContextResult> {
    try {
      const { data, error } = await supabase
        .from('guest_summaries')
        .insert({
          user_id: this.userId,
          summary_type: summaryType,
          title,
          content,
          key_points: keyPoints,
          confidence_score: confidenceScore,
          source_conversations: sourceConversations
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  async storePattern(
    patternType: string,
    patternName: string,
    description: string,
    frequencyData: Record<string, unknown>,
    triggers: string[] = [],
    confidenceScore: number = 0.5,
    sampleSize: number = 1
  ): Promise<AgentContextResult> {
    try {
      const { data, error } = await supabase
        .from('guest_patterns')
        .upsert({
          user_id: this.userId,
          pattern_type: patternType,
          pattern_name: patternName,
          description,
          frequency_data: frequencyData,
          triggers,
          confidence_score: confidenceScore,
          sample_size: sampleSize,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,pattern_type,pattern_name',
          ignoreDuplicates: false
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  async storeRecommendation(
    recommendationType: string,
    title: string,
    description: string,
    reasoning: string,
    priority: number = 2,
    validUntil?: Date,
    metadata: Record<string, unknown> = {}
  ): Promise<AgentContextResult> {
    try {
      const { data, error } = await supabase
        .from('guest_recommendations')
        .insert({
          user_id: this.userId,
          recommendation_type: recommendationType,
          title,
          description,
          reasoning,
          priority,
          valid_until: validUntil?.toISOString(),
          metadata
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  // ===================================
  // UTILITY METHODS
  // ===================================
  
  private generateContextSummary(
    entities: GuestEntity[],
    relations: GuestRelation[],
    summaries: Record<string, unknown>[]
  ): string {
    const lightingEntities = entities.filter(e => e.category === 'lighting')
    const behaviorEntities = entities.filter(e => e.category === 'timing' || e.category === 'behavior')
    const preferenceEntities = entities.filter(e => e.entity_type === 'preference')
    
    let summary = `Guest Context Summary:\n`
    summary += `- ${entities.length} total entities tracked\n`
    summary += `- ${lightingEntities.length} lighting preferences\n`
    summary += `- ${behaviorEntities.length} behavioral patterns\n`
    summary += `- ${preferenceEntities.length} general preferences\n`
    summary += `- ${relations.length} relationships identified\n`
    summary += `- ${summaries.length} recent summaries available\n`
    
    // Add top insights
    const highConfidenceEntities = entities.filter(e => e.confidence_score > 0.8)
    if (highConfidenceEntities.length > 0) {
      summary += `\nHigh Confidence Insights:\n`
      highConfidenceEntities.slice(0, 3).forEach(entity => {
        summary += `- ${entity.name}: ${entity.observations[0] || 'No observations'}\n`
      })
    }
    
    return summary
  }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Create context manager for user
 */
export function createContextManager(userId: string, sessionId?: string): AgentContextManager {
  return new AgentContextManager(userId, sessionId)
}

/**
 * Get agent execution history for user
 */
export async function getAgentExecutionHistory(
  userId: string,
  agentName?: string,
  limit: number = 10
): Promise<AgentContextResult> {
  try {
    let query = supabase
      .from('agent_executions')
      .select(`
        *,
        agent_types (name, description)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (agentName) {
      const { data: agentType } = await supabase
        .from('agent_types')
        .select('id')
        .eq('name', agentName)
        .single()
      
      if (agentType) {
        query = query.eq('agent_type_id', agentType.id)
      }
    }
    
    const { data, error } = await query
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
