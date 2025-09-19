# Vercel AI Gateway Integration for Hotel System

## 🎯 Architecture Overview

```
Guest Voice Chat (OpenAI Realtime API)
    ↓
Vercel AI Gateway (https://ai-gateway.vercel.sh/v1)
    ↓
Hotel MCP Server (Vercel Functions)
    ↓
Supabase Database + MQTT Lighting
```

## 🔧 Implementation Strategy

### **1. Update Backend to Use AI Gateway**
Replace direct OpenAI API calls with Vercel AI Gateway:

```typescript
// OLD: Direct OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1'
});

// NEW: Vercel AI Gateway
const openai = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1'
});
```

### **2. MCP Tools as OpenAI Function Tools**
Convert our MCP server tools to OpenAI function definitions:

```typescript
// Define MCP tools as OpenAI functions
const hotelTools = [
  {
    type: 'function',
    function: {
      name: 'update_user_location',
      description: 'Update guest location with detailed address',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User UUID' },
          address: { type: 'string', description: 'Full detailed address' },
          city: { type: 'string', description: 'City name' },
          country: { type: 'string', description: 'Country name' }
        },
        required: ['userId', 'address']
      }
    }
  },
  {
    type: 'function', 
    function: {
      name: 'control_hotel_lighting',
      description: 'Control hotel room lighting via MQTT',
      parameters: {
        type: 'object',
        properties: {
          room: { type: 'string', description: 'Room identifier' },
          command: { type: 'string', description: 'Lighting command' }
        },
        required: ['room', 'command']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'remember_guest_preference', 
      description: 'Store guest preferences and context',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          entityName: { type: 'string' },
          entityType: { type: 'string' },
          category: { type: 'string' },
          observations: { type: 'array', items: { type: 'string' } }
        },
        required: ['userId', 'entityName', 'entityType', 'category', 'observations']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_guest_context',
      description: 'Retrieve guest preferences and history',
      parameters: {
        type: 'object', 
        properties: {
          userId: { type: 'string' },
          category: { type: 'string', description: 'Optional category filter' }
        },
        required: ['userId']
      }
    }
  }
];
```

### **3. Tool Execution Handler**
Create a unified tool execution system:

```typescript
// /src/app/api/execute-hotel-tool/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  const { toolName, parameters } = await request.json();
  
  try {
    switch (toolName) {
      case 'update_user_location':
        return await updateUserLocation(parameters);
      case 'control_hotel_lighting':  
        return await controlHotelLighting(parameters);
      case 'remember_guest_preference':
        return await rememberGuestPreference(parameters);
      case 'get_guest_context':
        return await getGuestContext(parameters);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

async function updateUserLocation(params: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      current_location_address: params.address,
      current_location_city: params.city,
      current_location_country: params.country,
      location_updated_at: new Date().toISOString()
    })
    .eq('id', params.userId);
    
  if (error) throw error;
  return Response.json({ success: true, data });
}

// ... other tool implementations
```

### **4. Updated OpenAI Realtime Integration**
```typescript
// Frontend: VoiceConnection.tsx
const getEphemeralKey = async (): Promise<string> => {
  const response = await fetch('/api/client-secret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: `frontend_${Date.now()}`,
      model: 'gpt-4o-realtime-preview',
      tools: hotelTools, // Include our hotel tools
      instructions: hotelSystemPrompt
    })
  });
  
  const data = await response.json();
  return data.ephemeralKey;
};
```

### **5. Backend Client Secret Generation**
```typescript
// /src/app/api/client-secret/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'realtime=v1'
    },
    body: JSON.stringify({
      session: {
        type: 'realtime',
        model: body.model,
        tools: hotelTools, // Our hotel function tools
        instructions: `
          You are a Hotel AI Assistant at The Peninsula Hong Kong.
          
          Available tools:
          - update_user_location: Update guest location
          - control_hotel_lighting: Control room lighting  
          - remember_guest_preference: Store preferences
          - get_guest_context: Retrieve guest history
          
          ALWAYS use tools when:
          - Guest mentions location changes
          - Guest requests lighting changes
          - Guest expresses preferences
          - Starting conversation (get context)
        `,
        audio: {
          input: { format: 'pcm16', sample_rate: 24000 },
          output: { format: 'pcm16', sample_rate: 24000 }
        }
      }
    })
  });
  
  const data = await response.json();
  return Response.json({ ephemeralKey: data.client_secret.value });
}
```

## 🌟 Benefits of This Approach

### **✅ Simplified Architecture:**
- No separate MCP server deployment needed
- Direct tool integration with OpenAI Realtime API
- Unified API endpoint through Vercel AI Gateway

### **✅ Better Reliability:**
- Provider fallbacks (OpenAI → Anthropic → Google)
- Built-in error handling and retries
- Vercel's global edge network

### **✅ Enhanced Features:**
- Multi-modal support (text + images)
- Streaming responses
- Tool calling with structured outputs
- Cost optimization and monitoring

### **✅ Development Benefits:**
- OpenAI-compatible API (familiar interface)
- Easy testing with existing OpenAI tools
- Comprehensive error handling
- Built-in authentication

## 🚀 Migration Steps

1. **Update Environment Variables:**
   ```
   AI_GATEWAY_API_KEY=your-vercel-ai-gateway-key
   ```

2. **Replace OpenAI Client:**
   ```typescript
   const openai = new OpenAI({
     apiKey: process.env.AI_GATEWAY_API_KEY,
     baseURL: 'https://ai-gateway.vercel.sh/v1'
   });
   ```

3. **Convert MCP Tools to OpenAI Functions:**
   - Define function schemas
   - Create execution handlers
   - Update tool calling logic

4. **Test Integration:**
   - Verify tool calling works
   - Test location updates
   - Test lighting control
   - Test preference storage

This approach leverages Vercel's infrastructure while maintaining all our hotel-specific functionality through standard OpenAI function calling.
