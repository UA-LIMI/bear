# OpenAI Realtime API Reference Guide

*Quick reference for developers and AI assistants*
*Research completed: September 15, 2025*

## 🚀 **Quick Implementation Reference**

### **When implementing client secret generation:**
→ **See**: `.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md` (lines 15-45)
→ **API**: `POST https://api.openai.com/v1/realtime/client_secrets`
→ **Auth**: `Bearer ${OPENAI_API_KEY}` (backend only!)
→ **Response**: `{ "value": "ek_...", "expires_at": "..." }`

### **When implementing WebRTC connection:**
→ **See**: `.taskmaster/docs/research/voice-agents-quickstart.md` (lines 50-85)
→ **SDK**: `@openai/agents-realtime`
→ **Classes**: `RealtimeAgent` + `RealtimeSession`
→ **Connection**: `session.connect({ apiKey: "ek_..." })`

### **When debugging connection issues:**
→ **See**: `.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md` (lines 180-220)
→ **Browser Tools**: `chrome://webrtc-internals/`
→ **States**: `connecting` → `connected` → `disconnected` → `failed`
→ **Recovery**: Request new ephemeral key + reconnect

### **When handling errors:**
→ **See**: `.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md` (lines 160-180)
→ **Token Expired**: Get new ephemeral key from backend
→ **Network Issues**: Exponential backoff retry (1s, 2s, 4s)
→ **Microphone Denied**: Show permission request UI
→ **WebRTC Unsupported**: Fallback to WebSocket transport

## 📋 **Error Code Reference**

### **Backend Errors (Task 4)**
```javascript
// Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md
const ERROR_CODES = {
  TOKEN_GENERATION_FAILED: {
    code: 'token_generation_failed',
    message: 'Unable to generate ephemeral token',
    reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:25-45',
    action: 'Check OpenAI API key and endpoint availability'
  },
  
  OPENAI_API_DOWN: {
    code: 'openai_api_unavailable', 
    message: 'OpenAI Realtime API is temporarily unavailable',
    reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180',
    action: 'Implement retry logic with exponential backoff'
  },
  
  INVALID_SESSION_CONFIG: {
    code: 'invalid_session_config',
    message: 'Session configuration validation failed',
    reference: '.taskmaster/docs/research/voice-agents-quickstart.md:35-50',
    action: 'Validate model, type, and session parameters'
  }
};
```

### **Frontend Errors (Tasks 5 & 6)**
```javascript
// Reference: .taskmaster/docs/research/voice-agents-quickstart.md
const FRONTEND_ERROR_CODES = {
  EPHEMERAL_KEY_EXPIRED: {
    code: 'ephemeral_key_expired',
    message: 'Voice session token has expired',
    reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:80-100',
    action: 'Request new ephemeral key from /api/client-secret'
  },
  
  WEBRTC_CONNECTION_FAILED: {
    code: 'webrtc_connection_failed',
    message: 'Unable to establish WebRTC connection',
    reference: '.taskmaster/docs/research/voice-agents-quickstart.md:70-85',
    action: 'Check network, try WebSocket fallback'
  },
  
  MICROPHONE_ACCESS_DENIED: {
    code: 'microphone_access_denied',
    message: 'Microphone permission required for voice chat',
    reference: '.taskmaster/docs/research/voice-agents-quickstart.md:90-95',
    action: 'Show permission request UI and guide user'
  }
};
```

## 🧭 **AI Assistant Decision Tree**

### **When AI encounters OpenAI Realtime API issues:**

```
1. Check error type:
   ├── Authentication Error → Reference: IMPLEMENTATION_GUIDE.md:25-45
   ├── Connection Error → Reference: voice-agents-quickstart.md:70-85  
   ├── Token Expired → Reference: IMPLEMENTATION_GUIDE.md:80-100
   └── Unknown Error → Check all research files in .taskmaster/docs/research/

2. Validate against research:
   ├── API endpoint correct? → IMPLEMENTATION_GUIDE.md:15-25
   ├── Request format correct? → voice-agents-quickstart.md:25-35
   ├── Authentication proper? → IMPLEMENTATION_GUIDE.md:120-140
   └── Error handling implemented? → IMPLEMENTATION_GUIDE.md:160-180

3. Implementation guidance:
   ├── Backend issues → Focus on Task 4 research findings
   ├── Frontend issues → Focus on Task 5/6 research findings
   ├── WebRTC specific → WebRTC platform docs research
   └── General patterns → Consolidated IMPLEMENTATION_GUIDE.md
```

## 📖 **Research File Index**

### **Primary References**
1. **IMPLEMENTATION_GUIDE.md** - Consolidated technical guide
2. **voice-agents-quickstart.md** - Step-by-step implementation
3. **Platform API research** - Official API specifications
4. **WebRTC platform research** - Browser integration details

### **When to Get New Research**
- ✅ **API changes**: If endpoints return unexpected responses
- ✅ **SDK updates**: If @openai/agents-realtime package changes
- ✅ **New features**: If implementing advanced capabilities
- ✅ **Error patterns**: If encountering undocumented errors
- ✅ **Performance issues**: If latency/quality problems arise

### **Research Update Triggers**
```javascript
// Add this pattern to error handlers:
if (error.code === 'UNKNOWN_OPENAI_ERROR') {
  logger.warn('Unknown OpenAI error - research update may be needed', {
    error: error.message,
    reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md',
    action: 'Consider running: task-master research "Latest OpenAI Realtime API changes"'
  });
}
```

## 🔗 **Code Integration Patterns**

### **Backend Code Comments**
```javascript
/**
 * OpenAI Client Secret Generation Endpoint
 * 
 * Research Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:25-45
 * API Specification: POST https://api.openai.com/v1/realtime/client_secrets
 * 
 * Security Notes:
 * - Never expose main OpenAI API key to frontend
 * - Ephemeral tokens start with "ek_" and are short-lived
 * - Log all token generation for audit compliance
 * 
 * Error Handling Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180
 */
async function generateClientSecret(sessionConfig) {
  // Implementation with research-backed patterns
}
```

### **Frontend Code Comments**
```typescript
/**
 * OpenAI Realtime Voice Connection
 * 
 * Research Reference: .taskmaster/docs/research/voice-agents-quickstart.md:50-85
 * SDK Documentation: @openai/agents-realtime package
 * 
 * Connection Pattern:
 * 1. Get ephemeral key from backend (/api/client-secret)
 * 2. Create RealtimeAgent + RealtimeSession
 * 3. Connect with ephemeral key (WebRTC auto-configured)
 * 
 * Error Recovery Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:180-220
 */
async function connectVoiceAgent() {
  // Implementation with research-backed patterns
}
```

### **Error Message Integration**
```javascript
// Error messages that reference research
const createResearchBasedError = (errorType, context) => {
  const errorRef = ERROR_CODES[errorType];
  return {
    error: errorRef.code,
    message: errorRef.message,
    reference: errorRef.reference,
    suggestedAction: errorRef.action,
    researchDocs: '.taskmaster/docs/research/',
    context
  };
};
```

## 🎯 **Implementation Workflow Guide**

### **For Task 4 Implementation:**
1. **Start Here**: `.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:25-45`
2. **API Specs**: Research files for exact endpoint format
3. **Security**: Follow backend security patterns from research
4. **Testing**: Use research-backed test scenarios
5. **Error Handling**: Implement patterns from research findings

### **For Tasks 5 & 6 Implementation:**
1. **Start Here**: `.taskmaster/docs/research/voice-agents-quickstart.md:50-85`
2. **SDK Usage**: Follow RealtimeAgent + RealtimeSession patterns
3. **WebRTC**: Reference WebRTC platform research for browser setup
4. **Connection Management**: Use state management patterns from research
5. **Error Recovery**: Implement reconnection logic from research

## 🧠 **AI Assistant Usage Patterns**

### **When AI needs to solve OpenAI integration issues:**

```markdown
1. **Always check research first**:
   - Read .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md
   - Check specific research files for detailed patterns
   - Validate against official documentation findings

2. **Reference in code**:
   - Add research file references in comments
   - Include error code mappings to research sections
   - Link debug logs to specific research findings

3. **Update research when needed**:
   - If encountering undocumented patterns
   - If API responses don't match research
   - If new features or changes are discovered

4. **Guide implementation decisions**:
   - Use research-backed patterns over assumptions
   - Follow security patterns from research findings
   - Implement error handling based on research scenarios
```

## 📚 **Quick Reference Links**

| Implementation Area | Primary Reference | Backup Reference |
|-------------------|------------------|------------------|
| **Client Secret API** | `IMPLEMENTATION_GUIDE.md:25-45` | Platform API research |
| **WebRTC Connection** | `voice-agents-quickstart.md:50-85` | WebRTC platform research |
| **Error Handling** | `IMPLEMENTATION_GUIDE.md:160-180` | All research files |
| **Security Patterns** | `IMPLEMENTATION_GUIDE.md:120-140` | Voice agents quickstart |
| **SDK Integration** | `voice-agents-quickstart.md:35-50` | Models guide research |

---

**This reference system ensures that every implementation decision is backed by comprehensive research and can be validated against official OpenAI documentation!** 🚀
