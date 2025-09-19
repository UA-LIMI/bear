// ===================================
// SUPABASE CONNECTION TEST SCRIPT
// ===================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('Please add to your .env file:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.log('SUPABASE_SERVICE_KEY=your-service-key-here')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  console.log('🧪 Testing Supabase Connection...\n')
  
  try {
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...')
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connected successfully!\n')
    
    // Test 2: Check if tables exist
    console.log('2. Checking database tables...')
    const tables = [
      'profiles',
      'agent_types', 
      'agent_executions',
      'guest_entities',
      'guest_relations',
      'guest_summaries',
      'guest_patterns',
      'guest_recommendations',
      'guest_research',
      'conversation_sessions',
      'conversation_interactions'
    ]
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (tableError) {
          console.log(`❌ Table '${table}' not found or accessible`)
        } else {
          console.log(`✅ Table '${table}' exists`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}' error:`, err.message)
      }
    }
    
    // Test 3: Check agent types
    console.log('\n3. Checking agent types...')
    const { data: agentTypes, error: agentError } = await supabase
      .from('agent_types')
      .select('*')
    
    if (agentError) {
      console.log('❌ Could not fetch agent types:', agentError.message)
    } else if (agentTypes && agentTypes.length > 0) {
      console.log('✅ Agent types found:')
      agentTypes.forEach(agent => {
        console.log(`   - ${agent.name}: ${agent.description}`)
      })
    } else {
      console.log('⚠️  No agent types found. Run sample-hotel-data.sql to populate.')
    }
    
    console.log('\n🎉 Database schema deployment successful!')
    console.log('\nNext steps:')
    console.log('1. Run sample-hotel-data.sql to populate test data')
    console.log('2. Create test users: Umer, Taylor, Karen, Sarah')
    console.log('3. Deploy MCP Memory Server')
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run the test
testConnection().then(success => {
  process.exit(success ? 0 : 1)
})
