# OpenAI Voice Agents Quickstart - Implementation Guide

*Source: https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/*
*Researched: September 15, 2025*

## 🎯 Overview

The OpenAI Agents SDK provides a complete solution for building voice agents that can run in browsers using WebRTC for real-time audio streaming.

## 📋 Implementation Steps

### 1. Project Setup
```bash
# For new projects
npm create vite@latest my-project -- --template vanilla-ts

# Install required dependencies
npm install @openai/agents zod@3

# Alternative: Standalone browser package
npm install @openai/agents-realtime
```

### 2. **CRITICAL: Client Ephemeral Token Generation**

**Backend Implementation Required:**
```bash
# API Endpoint: POST https://api.openai.com/v1/realtime/client_secrets
# Headers: Authorization: Bearer $OPENAI_API_KEY
# Content-Type: application/json

curl -X POST https://api.openai.com/v1/realtime/client_secrets \
   -H "Authorization: Bearer $OPENAI_API_KEY" \
   -H "Content-Type: application/json" \
   -d '{
     "session": {
       "type": "realtime",
       "model": "gpt-realtime"
     }
   }'
```

**Response Format:**
```json
{
  "value": "ek_...",  // Ephemeral key starting with "ek_"
  "expires_at": "...", // Token expiration timestamp
  // ... other fields
}
```

**⚠️ SECURITY NOTE**: This endpoint MUST be called from backend only - never expose your main OpenAI API key to the frontend!

### 3. RealtimeAgent Creation

```typescript
import { RealtimeAgent } from '@openai/agents-realtime';

const agent = new RealtimeAgent({
  name: 'Assistant',
  instructions: 'You are a helpful assistant.',
});
```

### 4. RealtimeSession Management

```typescript
import { RealtimeSession } from '@openai/agents-realtime';

const session = new RealtimeSession(agent, {
  model: 'gpt-realtime',
});
```

**Key Points:**
- `RealtimeSession` handles conversation and connection lifecycle
- Manages audio processing, interruptions, and session state
- Takes an `agent` as first argument
- Continuously running and listening

### 5. **Connection Establishment**

```typescript
await session.connect({ 
  apiKey: 'ek_...(ephemeral key from backend)' 
});
```

**Transport Layer Auto-Selection:**
- **Browser**: Automatically uses WebRTC for low-latency audio
- **Node.js Backend**: Automatically uses WebSocket
- **Manual Override**: Can specify transport layer if needed

### 6. **Complete Implementation Example**

```typescript
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

export async function setupVoiceAgent(element: HTMLButtonElement) {
  const agent = new RealtimeAgent({
    name: 'Assistant',
    instructions: 'You are a helpful assistant.',
  });
  
  const session = new RealtimeSession(agent);
  
  try {
    // Get ephemeral key from YOUR backend endpoint
    const response = await fetch('/api/client-secret', { method: 'POST' });
    const { ephemeralKey } = await response.json();
    
    // Connect using ephemeral key
    await session.connect({
      apiKey: ephemeralKey, // Starts with "ek_"
    });
    
    console.log('Voice agent connected!');
    
    // Automatically handles:
    // - Microphone access request
    // - Audio input/output setup
    // - WebRTC connection establishment
    
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
```

## 🔧 Technical Implementation Details

### Microphone and Audio Setup
- **Automatic**: SDK automatically requests microphone access
- **Browser Permissions**: User must grant microphone permission
- **Audio Processing**: Handles real-time audio streaming automatically
- **Output**: Automatic speaker/headphone output configuration

### Connection Management
- **WebRTC in Browser**: Direct peer-to-peer audio streaming
- **WebSocket in Node.js**: Server-side connections
- **Automatic Fallback**: SDK handles transport selection
- **Error Handling**: Built-in connection recovery and retry logic

### Session Lifecycle
- **Continuous Operation**: Session runs continuously once connected
- **Interruption Handling**: Supports natural conversation interruptions
- **State Management**: Maintains conversation context automatically
- **Cleanup**: Proper resource cleanup on disconnect

## 🛡️ Security Considerations

### Ephemeral Token Security
- **Short-lived**: Tokens expire quickly (minutes, not hours)
- **Backend Only**: Main API key never exposed to frontend
- **Regeneration**: Must implement token refresh logic
- **Audit Logging**: Log all token generation events

### Frontend Security
- **No API Keys**: Frontend only receives ephemeral tokens
- **Secure Transport**: WebRTC provides encrypted audio streams
- **Origin Validation**: Backend should validate frontend origin

## 🚀 Production Deployment

### Backend Requirements
- Secure `/api/client-secret` endpoint (our Task 4)
- Token lifecycle management
- Rate limiting for token generation
- Audit logging for security compliance

### Frontend Requirements
- Microphone permission handling
- Connection state management
- Error handling and user feedback
- Graceful degradation for unsupported browsers

## 📚 Integration with Our Tasks

This research directly supports:
- **Task 4**: OpenAI Client Secret Generation Endpoint
- **Task 5**: Frontend Voice Connection UI  
- **Task 6**: WebRTC Voice Connection Logic
- **Task 7**: Frontend-Backend Integration

## 🔗 Related Documentation Sources

Next research priorities:
1. **Realtime API Platform Docs** - For detailed API specifications
2. **Realtime WebRTC Platform Docs** - For WebRTC-specific implementation
3. **Context Management Guide** - For session state handling
4. **Tools Integration Guide** - For advanced agent capabilities

---

*This document provides the foundation for implementing OpenAI voice agents with proper security and architecture patterns.*
