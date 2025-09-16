# Limi AI Backend Integration Guide

*Complete guide for integrating with different frontends and applications*
*Version 1.0 - September 15, 2025*

## 🎯 **Overview**

This backend service provides secure OpenAI Realtime API integration that can be used with **any frontend framework** or **external application**. The architecture is designed for maximum flexibility and reusability.

## 🏗️ **Architecture for Extensibility**

```
┌─────────────────┐    HTTPS/REST    ┌──────────────────┐    HTTPS/REST    ┌─────────────────┐
│   Any Frontend  │ ──────────────► │  Limi AI Backend │ ──────────────► │   OpenAI API    │
│   (React, Vue,  │                 │   (Node.js)      │                 │   (Realtime)    │
│   Angular, etc) │                 │                  │                 │                 │
└─────────────────┘                 └──────────────────┘                 └─────────────────┘
        │                                    │                                    │
        │ 1. POST /api/client-secret         │ 2. Generate ephemeral token       │
        │ 2. Receive ephemeral key           │ 3. Return secure token             │
        │ 3. Connect to OpenAI directly      │ 4. Log audit events               │
        │                                    │                                    │
        └────────────────── WebRTC/WebSocket Direct ──────────────────────────────┘
                            (Frontend connects directly to OpenAI)
```

## 📋 **API Specification**

### **Base URL**
```
Production: https://your-domain.com/api
Development: http://localhost:3001/api
```

### **Authentication**
- **Backend-to-OpenAI**: Bearer token with main OpenAI API key
- **Frontend-to-Backend**: No authentication required (add as needed)
- **Frontend-to-OpenAI**: Ephemeral tokens only (secure by design)

## 🔗 **Core Endpoints**

### **1. Generate Client Secret**

**Endpoint**: `POST /api/client-secret`

**Purpose**: Generate ephemeral tokens for frontend OpenAI connections

**Request**:
```json
{
  "sessionId": "optional-session-id",
  "model": "gpt-4o-realtime-preview"
}
```

**Response (Success)**:
```json
{
  "ephemeralKey": "ek_68c89332e1b08191b129a0f5ae3f5661",
  "expiresAt": 1757975946,
  "sessionId": "session-123",
  "model": "gpt-realtime",
  "requestId": "abc123"
}
```

**Response (Error)**:
```json
{
  "error": "Token Generation Failed",
  "message": "OpenAI API authentication failed",
  "code": "openai_auth_failed",
  "requestId": "abc123",
  "reference": ".taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180",
  "action": "Check OPENAI_API_KEY configuration",
  "retryAfter": 5000
}
```

### **2. Health Check**

**Endpoint**: `GET /api/client-secret/health`

**Purpose**: Check OpenAI API connectivity

**Response**:
```json
{
  "status": "healthy",
  "accessible": true,
  "responseTime": "245ms",
  "timestamp": "2025-09-15T22:30:00.000Z",
  "requestId": "def456"
}
```

### **3. Service Statistics**

**Endpoint**: `GET /api/client-secret/stats`

**Purpose**: Monitor service performance and token cache

**Response**:
```json
{
  "service": "OpenAI Realtime API Service",
  "version": "1.0.0",
  "tokenCache": {
    "totalTokens": 3,
    "tokens": [
      {
        "sessionId": "session-123",
        "expiresAt": "2025-09-15T23:00:00.000Z",
        "model": "gpt-realtime",
        "cachedAt": "2025-09-15T22:30:00.000Z"
      }
    ]
  },
  "uptime": 3600,
  "timestamp": "2025-09-15T22:30:00.000Z",
  "requestId": "ghi789"
}
```

## 🌐 **Frontend Integration Examples**

### **React Integration**

```typescript
// React Hook for OpenAI Voice Connection
import { useState, useEffect } from 'react';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

interface UseVoiceConnectionOptions {
  backendUrl?: string;
  model?: string;
  autoConnect?: boolean;
}

export function useVoiceConnection(options: UseVoiceConnectionOptions = {}) {
  const {
    backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    model = 'gpt-realtime',
    autoConnect = false
  } = options;

  const [state, setState] = useState({
    status: 'disconnected',
    error: null,
    session: null
  });

  // Get ephemeral key from Limi AI Backend
  const getEphemeralKey = async () => {
    const response = await fetch(`${backendUrl}/api/client-secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `react_${Date.now()}`,
        model,
        capabilities: ['audio_input', 'audio_output']
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Backend error: ${error.message} (${error.code})`);
    }

    const data = await response.json();
    return data.ephemeralKey;
  };

  // Connect to OpenAI
  const connect = async () => {
    try {
      setState(prev => ({ ...prev, status: 'connecting', error: null }));

      const agent = new RealtimeAgent({
        name: 'Limi AI Assistant',
        instructions: 'You are a helpful voice assistant.',
      });

      const session = new RealtimeSession(agent, { model });
      const ephemeralKey = await getEphemeralKey();

      await session.connect({ apiKey: ephemeralKey });

      setState({
        status: 'connected',
        error: null,
        session
      });

    } catch (error) {
      setState({
        status: 'failed',
        error: error.message,
        session: null
      });
    }
  };

  // Disconnect
  const disconnect = async () => {
    if (state.session) {
      await state.session.disconnect();
      setState({
        status: 'disconnected',
        error: null,
        session: null
      });
    }
  };

  // Auto-connect if requested
  useEffect(() => {
    if (autoConnect && state.status === 'disconnected') {
      connect();
    }
  }, [autoConnect]);

  return {
    ...state,
    connect,
    disconnect,
    isConnected: state.status === 'connected',
    isConnecting: state.status === 'connecting'
  };
}
```

### **Vue.js Integration**

```typescript
// Vue Composition API for OpenAI Voice
import { ref, reactive } from 'vue';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

export function useOpenAIVoice(backendUrl = 'http://localhost:3001') {
  const state = reactive({
    status: 'disconnected',
    error: null,
    session: null
  });

  const isConnected = ref(false);

  const getEphemeralKey = async (model = 'gpt-realtime') => {
    const response = await fetch(`${backendUrl}/api/client-secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `vue_${Date.now()}`,
        model,
        capabilities: ['audio_input', 'audio_output']
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Backend error: ${error.message}`);
    }

    return (await response.json()).ephemeralKey;
  };

  const connect = async (model = 'gpt-realtime') => {
    try {
      state.status = 'connecting';
      state.error = null;

      const agent = new RealtimeAgent({
        name: 'Vue AI Assistant',
        instructions: 'You are a helpful voice assistant for Vue applications.',
      });

      const session = new RealtimeSession(agent, { model });
      const ephemeralKey = await getEphemeralKey(model);

      await session.connect({ apiKey: ephemeralKey });

      state.status = 'connected';
      state.session = session;
      isConnected.value = true;

    } catch (error) {
      state.status = 'failed';
      state.error = error.message;
      isConnected.value = false;
    }
  };

  const disconnect = async () => {
    if (state.session) {
      await state.session.disconnect();
      state.status = 'disconnected';
      state.session = null;
      isConnected.value = false;
    }
  };

  return {
    state,
    isConnected,
    connect,
    disconnect
  };
}
```

### **Vanilla JavaScript Integration**

```javascript
// Pure JavaScript OpenAI Voice Integration
class LimiAIVoiceClient {
  constructor(backendUrl = 'http://localhost:3001') {
    this.backendUrl = backendUrl;
    this.state = {
      status: 'disconnected',
      session: null,
      error: null
    };
    this.callbacks = {
      onStateChange: [],
      onError: [],
      onConnected: []
    };
  }

  // Event handling
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Get ephemeral key from backend
  async getEphemeralKey(model = 'gpt-realtime') {
    const response = await fetch(`${this.backendUrl}/api/client-secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `vanilla_${Date.now()}`,
        model,
        capabilities: ['audio_input', 'audio_output']
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Backend error: ${error.message} (${error.code})`);
    }

    return (await response.json()).ephemeralKey;
  }

  // Connect to OpenAI
  async connect(model = 'gpt-realtime') {
    try {
      this.state.status = 'connecting';
      this.emit('onStateChange', this.state);

      // Import OpenAI SDK dynamically
      const { RealtimeAgent, RealtimeSession } = await import('@openai/agents-realtime');

      const agent = new RealtimeAgent({
        name: 'Vanilla JS Assistant',
        instructions: 'You are a helpful voice assistant.',
      });

      const session = new RealtimeSession(agent, { model });
      const ephemeralKey = await this.getEphemeralKey(model);

      await session.connect({ apiKey: ephemeralKey });

      this.state.status = 'connected';
      this.state.session = session;
      this.state.error = null;

      this.emit('onStateChange', this.state);
      this.emit('onConnected', { session });

    } catch (error) {
      this.state.status = 'failed';
      this.state.error = error.message;
      this.emit('onStateChange', this.state);
      this.emit('onError', error);
    }
  }

  // Disconnect
  async disconnect() {
    if (this.state.session) {
      await this.state.session.disconnect();
      this.state.status = 'disconnected';
      this.state.session = null;
      this.emit('onStateChange', this.state);
    }
  }
}

// Usage example
const voiceClient = new LimiAIVoiceClient('http://localhost:3001');

voiceClient.on('onStateChange', (state) => {
  console.log('Voice state changed:', state.status);
});

voiceClient.on('onError', (error) => {
  console.error('Voice error:', error.message);
});

// Connect
document.getElementById('connect-btn').onclick = () => voiceClient.connect();
document.getElementById('disconnect-btn').onclick = () => voiceClient.disconnect();
```

## 🔗 **External Application Integration**

### **Mobile App Integration (React Native)**

```typescript
// React Native integration with Limi AI Backend
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

class LimiAIMobileClient {
  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  async getEphemeralKey(model = 'gpt-realtime') {
    const response = await fetch(`${this.backendUrl}/api/client-secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `mobile_${Date.now()}`,
        model,
        capabilities: ['audio_input', 'audio_output']
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Backend error: ${data.message} (${data.code})`);
    }

    return data.ephemeralKey;
  }

  async createVoiceSession(model = 'gpt-realtime') {
    const agent = new RealtimeAgent({
      name: 'Mobile AI Assistant',
      instructions: 'You are a helpful mobile voice assistant.',
    });

    const session = new RealtimeSession(agent, { model });
    const ephemeralKey = await this.getEphemeralKey(model);

    await session.connect({ apiKey: ephemeralKey });
    return session;
  }
}
```

### **Desktop Application Integration (Electron)**

```javascript
// Electron main process integration
const { ipcMain } = require('electron');
const axios = require('axios');

class LimiAIDesktopIntegration {
  constructor(backendUrl) {
    this.backendUrl = backendUrl;
    this.setupIPC();
  }

  setupIPC() {
    // Handle voice connection requests from renderer
    ipcMain.handle('voice-connect', async (event, options) => {
      try {
        const response = await axios.post(`${this.backendUrl}/api/client-secret`, {
          sessionId: `desktop_${Date.now()}`,
          model: options.model || 'gpt-realtime',
          capabilities: options.capabilities || ['audio_input', 'audio_output']
        });

        return {
          success: true,
          ephemeralKey: response.data.ephemeralKey,
          expiresAt: response.data.expiresAt,
          sessionId: response.data.sessionId
        };

      } catch (error) {
        return {
          success: false,
          error: error.message,
          code: error.response?.data?.code || 'unknown_error'
        };
      }
    });

    // Health check
    ipcMain.handle('voice-health', async () => {
      try {
        const response = await axios.get(`${this.backendUrl}/api/client-secret/health`);
        return response.data;
      } catch (error) {
        return { status: 'unhealthy', error: error.message };
      }
    });
  }
}
```

### **Third-Party Service Integration**

```javascript
// Integration with external services (webhooks, APIs, etc.)
class LimiAIServiceIntegration {
  constructor(backendUrl, apiKey = null) {
    this.backendUrl = backendUrl;
    this.apiKey = apiKey; // Optional API key for service-to-service auth
  }

  async generateTokenForService(serviceId, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    
    // Add service authentication if available
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.backendUrl}/api/client-secret`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sessionId: `service_${serviceId}_${Date.now()}`,
        model: options.model || 'gpt-realtime',
        capabilities: options.capabilities || ['audio_input', 'audio_output']
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Limi AI Backend error: ${error.message} (${error.code})`);
    }

    return response.json();
  }

  async checkServiceHealth() {
    const response = await fetch(`${this.backendUrl}/api/client-secret/health`);
    return response.json();
  }
}

// Usage in external service
const limiAI = new LimiAIServiceIntegration('https://your-limi-backend.com');

// Generate token for external voice integration
const tokenData = await limiAI.generateTokenForService('external-app-123', {
  model: 'gpt-4-realtime',
  capabilities: ['audio_input', 'audio_output']
});

// Use ephemeral key with your own OpenAI integration
// tokenData.ephemeralKey can be used directly with OpenAI SDK
```

## 🛠️ **Backend Extension Patterns**

### **Adding Authentication**

```javascript
// Add authentication middleware to routes
const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Valid API key required for this endpoint',
      code: 'auth_required'
    });
  }

  req.apiKey = apiKey;
  next();
};

// Apply to OpenAI routes
router.use('/client-secret', authenticateRequest);
```

### **Adding Rate Limiting per Client**

```javascript
// Client-specific rate limiting
const clientRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: (req) => {
    // Different limits based on client type
    const userAgent = req.get('User-Agent') || '';
    
    if (userAgent.includes('mobile')) return 10; // Mobile apps
    if (userAgent.includes('desktop')) return 20; // Desktop apps
    return 5; // Default/unknown clients
  },
  keyGenerator: (req) => {
    // Rate limit by API key if available, otherwise by IP
    return req.apiKey || req.ip;
  }
});
```

### **Adding Webhook Support**

```javascript
// Webhook endpoint for external integrations
router.post('/webhook/token-generated', (req, res) => {
  // Notify external systems when tokens are generated
  const { sessionId, model, expiresAt } = req.body;
  
  // Forward to registered webhook URLs
  notifyWebhooks('token.generated', {
    sessionId,
    model,
    expiresAt,
    timestamp: new Date().toISOString()
  });

  res.json({ status: 'webhook_received' });
});
```

## 📊 **Monitoring and Analytics**

### **Usage Analytics**

```javascript
// Track usage patterns for different frontend types
const analytics = {
  trackTokenGeneration: (sessionId, model, userAgent) => {
    logger.info('Token generation analytics', {
      event: 'token_generated',
      sessionId,
      model,
      userAgent,
      frontendType: detectFrontendType(userAgent),
      timestamp: new Date().toISOString()
    });
  },

  trackConnectionSuccess: (sessionId, duration) => {
    logger.info('Connection success analytics', {
      event: 'connection_successful',
      sessionId,
      duration,
      timestamp: new Date().toISOString()
    });
  },

  trackError: (errorCode, errorMessage, sessionId) => {
    logger.warn('Error analytics', {
      event: 'error_occurred',
      errorCode,
      errorMessage,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }
};

function detectFrontendType(userAgent) {
  if (userAgent.includes('React')) return 'react';
  if (userAgent.includes('Vue')) return 'vue';
  if (userAgent.includes('Angular')) return 'angular';
  if (userAgent.includes('Electron')) return 'electron';
  if (userAgent.includes('Mobile')) return 'mobile';
  return 'unknown';
}
```

## 🔧 **Configuration for Different Environments**

### **Environment-Specific Settings**

```javascript
// config/environments.js
const environments = {
  development: {
    backendUrl: 'http://localhost:3001',
    openaiModel: 'gpt-realtime',
    rateLimits: {
      tokensPerMinute: 100,
      connectionsPerMinute: 50
    },
    logging: {
      level: 'debug',
      includeUserAgent: true
    }
  },

  staging: {
    backendUrl: 'https://staging-api.limi.ai',
    openaiModel: 'gpt-4-realtime',
    rateLimits: {
      tokensPerMinute: 60,
      connectionsPerMinute: 30
    },
    logging: {
      level: 'info',
      includeUserAgent: false
    }
  },

  production: {
    backendUrl: 'https://api.limi.ai',
    openaiModel: 'gpt-4-realtime',
    rateLimits: {
      tokensPerMinute: 30,
      connectionsPerMinute: 15
    },
    logging: {
      level: 'warn',
      includeUserAgent: false
    }
  }
};

module.exports = environments[process.env.NODE_ENV || 'development'];
```

## 📚 **Documentation for Teams**

### **Quick Integration Checklist**

```markdown
## Integrating with Limi AI Backend

### 1. **Setup**
- [ ] Install OpenAI Agents SDK: `npm install @openai/agents-realtime`
- [ ] Configure backend URL in your environment
- [ ] Test backend connectivity: `GET /api/client-secret/health`

### 2. **Implementation**
- [ ] Create ephemeral key request function
- [ ] Initialize RealtimeAgent and RealtimeSession
- [ ] Handle connection states (connecting, connected, failed)
- [ ] Implement error handling and retry logic

### 3. **Testing**
- [ ] Test successful voice connection
- [ ] Test error scenarios (network issues, token expiration)
- [ ] Test microphone permission handling
- [ ] Validate audio quality and latency

### 4. **Production**
- [ ] Configure production backend URL
- [ ] Set up monitoring and analytics
- [ ] Implement proper error reporting
- [ ] Add user feedback mechanisms
```

## 🚀 **Deployment Patterns**

### **Multi-Frontend Deployment**

```yaml
# docker-compose.yml for multiple frontends
version: '3.8'
services:
  limi-backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    
  react-frontend:
    build: ./frontend-react
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://limi-backend:3001
    
  vue-frontend:
    build: ./frontend-vue
    ports:
      - "3002:3000"
    environment:
      - VUE_APP_BACKEND_URL=http://limi-backend:3001
    
  mobile-api:
    build: ./mobile-backend
    ports:
      - "3003:3000"
    environment:
      - LIMI_BACKEND_URL=http://limi-backend:3001
```

## 📖 **API Client Libraries**

### **JavaScript/TypeScript Client**

```typescript
// npm package: @limi-ai/client
export class LimiAIClient {
  constructor(backendUrl: string, options?: ClientOptions) {
    // Implementation
  }

  async generateEphemeralKey(options?: TokenOptions): Promise<TokenData> {
    // Implementation
  }

  async createVoiceSession(options?: SessionOptions): Promise<VoiceSession> {
    // Implementation
  }

  async checkHealth(): Promise<HealthStatus> {
    // Implementation
  }
}
```

### **Python Client**

```python
# pip package: limi-ai-client
import requests
from typing import Optional, Dict, Any

class LimiAIClient:
    def __init__(self, backend_url: str, api_key: Optional[str] = None):
        self.backend_url = backend_url
        self.api_key = api_key

    def generate_ephemeral_key(self, model: str = "gpt-realtime", 
                             session_id: Optional[str] = None) -> Dict[str, Any]:
        response = requests.post(
            f"{self.backend_url}/api/client-secret",
            json={
                "sessionId": session_id or f"python_{int(time.time())}",
                "model": model,
                "capabilities": ["audio_input", "audio_output"]
            },
            headers={"Content-Type": "application/json"}
        )
        
        if not response.ok:
            raise Exception(f"Backend error: {response.json().get('message')}")
        
        return response.json()

    def check_health(self) -> Dict[str, Any]:
        response = requests.get(f"{self.backend_url}/api/client-secret/health")
        return response.json()
```

## 🔐 **Security Considerations for Integrations**

### **Production Security Checklist**

- [ ] **API Key Management**: Secure storage of OpenAI API key
- [ ] **CORS Configuration**: Restrict to authorized domains
- [ ] **Rate Limiting**: Prevent abuse from different clients
- [ ] **Authentication**: Add API key auth for production use
- [ ] **Audit Logging**: Track all token generation and usage
- [ ] **Input Validation**: Validate all requests from external clients
- [ ] **Error Sanitization**: Don't leak sensitive information in errors

### **Multi-Tenant Considerations**

```javascript
// Tenant-aware token generation
router.post('/client-secret', [
  authenticateRequest,
  validateTenant,
  rateLimitByTenant,
  validationChains.clientSecretRequest
], async (req, res) => {
  const tokenData = await OpenAIRealtimeService.generateClientSecret({
    sessionId: `${req.tenant}_${req.body.sessionId}`,
    model: req.body.model,
    capabilities: req.body.capabilities
  });

  // Log with tenant context
  logger.info('Tenant token generated', {
    tenantId: req.tenant,
    sessionId: tokenData.sessionId,
    model: tokenData.model
  });

  res.json(tokenData);
});
```

---

**This integration guide enables the Limi AI Backend to work with any frontend framework or external application, providing a solid foundation for extensible voice AI integration!** 🚀
