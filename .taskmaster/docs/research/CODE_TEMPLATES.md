# OpenAI Realtime API Code Templates

*Research-backed implementation templates with references*
*Based on comprehensive research - September 15, 2025*

## 🔧 **Backend Templates (Task 4)**

### **Client Secret Generation Endpoint**

```javascript
/**
 * OpenAI Client Secret Generation Endpoint
 * 
 * 📚 Research References:
 * - Implementation Guide: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:25-45
 * - API Specification: .taskmaster/docs/research/voice-agents-quickstart.md:25-35
 * - Error Handling: .taskmaster/docs/research/REFERENCE_GUIDE.md:25-50
 * 
 * 🔗 OpenAI API Endpoint: POST https://api.openai.com/v1/realtime/client_secrets
 * 🔑 Authentication: Bearer token (main OpenAI API key - backend only!)
 * 📤 Response: { "value": "ek_...", "expires_at": "...", "session_id": "..." }
 * 
 * ⚠️ SECURITY: Never expose main API key to frontend!
 */

const express = require('express');
const axios = require('axios');
const { config } = require('../config');
const { logger } = require('../middleware/logger');
const { validationChains } = require('../middleware/validation');
const { getRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply AI-specific rate limiting (research-backed)
router.use(getRateLimiter('ai'));

/**
 * POST /api/client-secret
 * Generate ephemeral client secret for OpenAI Realtime API
 * 
 * 📋 Request Validation (research-backed):
 * - sessionId: optional string (1-100 chars, alphanumeric + hyphens)
 * - capabilities: optional array of strings
 * - model: optional string (gpt-realtime, gpt-4-realtime)
 */
router.post('/client-secret', 
  validationChains.clientSecretRequest, // Research: IMPLEMENTATION_GUIDE.md:120-140
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      // 📊 Audit Logging (research-backed pattern)
      logger.info('Client secret generation requested', {
        requestId: req.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.body.sessionId,
        model: req.body.model || 'gpt-realtime',
        timestamp: new Date().toISOString()
      });

      // 🔗 OpenAI API Integration (research specification)
      const response = await axios.post(
        'https://api.openai.com/v1/realtime/client_secrets',
        {
          session: {
            type: 'realtime',
            model: req.body.model || 'gpt-realtime',
            // Additional session config from research
            ...(req.body.capabilities && { capabilities: req.body.capabilities })
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openaiApiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Limi-AI-Backend/1.0.0'
          },
          timeout: 10000 // 10s timeout (research recommendation)
        }
      );

      const tokenData = {
        ephemeralKey: response.data.value,
        expiresAt: response.data.expires_at,
        sessionId: response.data.session_id || req.body.sessionId,
        model: response.data.model
      };

      // ✅ Success Audit Log
      logger.info('Client secret generated successfully', {
        requestId: req.id,
        sessionId: tokenData.sessionId,
        expiresAt: tokenData.expiresAt,
        model: tokenData.model,
        duration: `${Date.now() - startTime}ms`
      });

      // 📤 Response (research-backed format)
      res.json({
        ephemeralKey: tokenData.ephemeralKey,
        expiresAt: tokenData.expiresAt,
        sessionId: tokenData.sessionId,
        model: tokenData.model,
        requestId: req.id
      });

    } catch (error) {
      // 🚨 Error Handling (research-backed patterns)
      const errorContext = {
        requestId: req.id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        duration: `${Date.now() - startTime}ms`,
        ip: req.ip
      };

      logger.error('Client secret generation failed', errorContext);

      // Research-backed error response format
      const errorResponse = {
        error: 'Token Generation Failed',
        message: 'Unable to generate ephemeral client secret',
        code: 'token_generation_failed',
        requestId: req.id,
        reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180',
        retryAfter: 5000 // 5 second retry recommendation
      };

      // Add specific error details based on research patterns
      if (error.response?.status === 401) {
        errorResponse.message = 'OpenAI API authentication failed';
        errorResponse.code = 'openai_auth_failed';
        errorResponse.action = 'Check OPENAI_API_KEY configuration';
      } else if (error.response?.status === 429) {
        errorResponse.message = 'OpenAI API rate limit exceeded';
        errorResponse.code = 'openai_rate_limited';
        errorResponse.retryAfter = 60000; // 1 minute
      } else if (error.code === 'ECONNABORTED') {
        errorResponse.message = 'OpenAI API request timeout';
        errorResponse.code = 'openai_timeout';
        errorResponse.action = 'Retry request or check OpenAI status';
      }

      const statusCode = error.response?.status === 429 ? 429 : 500;
      res.status(statusCode).json(errorResponse);
    }
  }
);

module.exports = router;
```

## 🎨 **Frontend Templates (Tasks 5 & 6)**

### **Voice Connection Component**

```typescript
/**
 * OpenAI Realtime Voice Connection Component
 * 
 * 📚 Research References:
 * - Voice Agents Guide: .taskmaster/docs/research/voice-agents-quickstart.md:50-85
 * - WebRTC Details: .taskmaster/docs/research/WebRTC-platform-research.md
 * - Error Handling: .taskmaster/docs/research/REFERENCE_GUIDE.md:25-50
 * 
 * 🔗 SDK: @openai/agents-realtime
 * 📱 Classes: RealtimeAgent + RealtimeSession
 * 🎙️ Transport: WebRTC (automatic in browser)
 */

import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

interface VoiceConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'failed';
  error?: string;
  sessionId?: string;
}

class VoiceConnection {
  private agent: RealtimeAgent;
  private session: RealtimeSession;
  private state: VoiceConnectionState = { status: 'disconnected' };
  private onStateChange?: (state: VoiceConnectionState) => void;

  constructor(onStateChange?: (state: VoiceConnectionState) => void) {
    this.onStateChange = onStateChange;
    
    // 🤖 Agent Configuration (research-backed)
    this.agent = new RealtimeAgent({
      name: 'Limi AI Assistant',
      instructions: 'You are a helpful voice assistant for Limi AI.',
      // Research: Use gpt-4-realtime for higher quality
      model: 'gpt-4-realtime'
    });

    // 📞 Session Configuration (research-backed)
    this.session = new RealtimeSession(this.agent, {
      model: 'gpt-4-realtime',
      // Research: Optimal settings for voice
      audioFormat: 'pcm16', // 16kHz mono
      turnDetection: { type: 'semantic_vad' }, // Server-side VAD
      inputAudioNoiseSuppression: { type: 'near_field' } // Noise reduction
    });

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers based on research patterns
   * Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:180-220
   */
  private setupEventHandlers() {
    // Connection state management (research-backed)
    this.session.on('connectionStateChange', (state) => {
      this.updateState({ status: state });
      
      switch (state) {
        case 'connecting':
          console.log('🔗 Connecting to OpenAI Realtime API...');
          break;
        case 'connected':
          console.log('✅ Voice assistant connected and ready!');
          break;
        case 'disconnected':
          console.log('🔌 Disconnected from voice service');
          this.handleDisconnection();
          break;
        case 'failed':
          console.error('❌ Connection failed');
          this.handleConnectionFailure();
          break;
      }
    });

    // Error handling (research-backed patterns)
    this.session.on('error', (error) => {
      console.error('🚨 Voice session error:', error);
      this.handleError(error);
    });

    // Audio events (research-backed)
    this.session.on('audioStart', () => {
      console.log('🎙️ Audio input started');
    });

    this.session.on('audioEnd', () => {
      console.log('🔇 Audio input ended');
    });
  }

  /**
   * Connect to OpenAI Realtime API
   * Reference: .taskmaster/docs/research/voice-agents-quickstart.md:70-85
   */
  async connect(): Promise<void> {
    try {
      this.updateState({ status: 'connecting' });

      // 🔑 Get ephemeral key from backend (research pattern)
      const ephemeralKey = await this.getEphemeralKey();

      // 🔗 Connect using ephemeral key (research-backed)
      await this.session.connect({ 
        apiKey: ephemeralKey // Format: "ek_..."
      });

      console.log('🎉 Voice connection established!');

    } catch (error) {
      console.error('💥 Connection failed:', error);
      this.updateState({ 
        status: 'failed', 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get ephemeral key from backend
   * Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:80-100
   */
  private async getEphemeralKey(): Promise<string> {
    try {
      const response = await fetch('/api/client-secret', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Client-Version': '1.0.0'
        },
        body: JSON.stringify({
          sessionId: this.generateSessionId(),
          capabilities: ['audio_input', 'audio_output'],
          model: 'gpt-4-realtime'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend error: ${errorData.message} (${errorData.code})`);
      }

      const data = await response.json();
      
      // Validate ephemeral key format (research requirement)
      if (!data.ephemeralKey || !data.ephemeralKey.startsWith('ek_')) {
        throw new Error('Invalid ephemeral key format received from backend');
      }

      return data.ephemeralKey;

    } catch (error) {
      console.error('🔑 Failed to get ephemeral key:', error);
      throw new Error(`Token acquisition failed: ${error.message}`);
    }
  }

  /**
   * Handle disconnection with reconnection logic
   * Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:200-220
   */
  private async handleDisconnection() {
    console.log('🔄 Attempting automatic reconnection...');
    
    // Research-backed exponential backoff
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.delay(1000 * (i + 1)); // 1s, 2s, 3s
        await this.connect();
        return; // Success
      } catch (error) {
        console.warn(`🔄 Reconnection attempt ${i + 1} failed:`, error);
      }
    }

    this.updateState({ 
      status: 'failed', 
      error: 'Unable to reconnect after multiple attempts' 
    });
  }

  /**
   * Handle connection failures
   * Reference: .taskmaster/docs/research/REFERENCE_GUIDE.md:25-50
   */
  private handleConnectionFailure() {
    // Research-backed error categorization
    const errorActions = {
      'token_expired': 'Request new ephemeral key',
      'webrtc_unsupported': 'Fallback to WebSocket transport',
      'microphone_denied': 'Request microphone permission',
      'network_error': 'Check internet connection'
    };

    console.log('📋 Troubleshooting guide:');
    Object.entries(errorActions).forEach(([code, action]) => {
      console.log(`   ${code}: ${action}`);
    });
  }

  /**
   * Handle various error types
   * Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180
   */
  private handleError(error: any) {
    // Log error with research reference
    console.error('🔍 Error details:', {
      message: error.message,
      type: error.type,
      reference: '.taskmaster/docs/research/REFERENCE_GUIDE.md:25-50',
      troubleshooting: 'See research docs for error handling patterns'
    });

    // Update state with error
    this.updateState({ 
      status: 'failed', 
      error: error.message 
    });
  }

  // Utility methods
  private updateState(newState: Partial<VoiceConnectionState>) {
    this.state = { ...this.state, ...newState };
    this.onStateChange?.(this.state);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public getters
  get connectionState(): VoiceConnectionState {
    return { ...this.state };
  }

  async disconnect(): Promise<void> {
    await this.session.disconnect();
    this.updateState({ status: 'disconnected' });
  }
}

export default VoiceConnection;
```

## 🎨 **UI Component Templates (Task 5)**

### **Voice Connection Status Component**

```typescript
/**
 * Voice Connection Status UI Component
 * 
 * 📚 Research Reference: .taskmaster/docs/research/voice-agents-quickstart.md:90-95
 * 🎨 UI Framework: shadcn/ui (as specified in project requirements)
 * 🔗 Integration: Uses VoiceConnection class above
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import VoiceConnection from './VoiceConnection';

interface VoiceConnectionUIProps {
  onConnectionChange?: (connected: boolean) => void;
}

export function VoiceConnectionUI({ onConnectionChange }: VoiceConnectionUIProps) {
  const [connection, setConnection] = useState<VoiceConnection | null>(null);
  const [state, setState] = useState({ status: 'disconnected' });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initialize voice connection with state handler
    const voiceConnection = new VoiceConnection((newState) => {
      setState(newState);
      onConnectionChange?.(newState.status === 'connected');
    });
    
    setConnection(voiceConnection);

    return () => {
      // Cleanup on unmount
      voiceConnection.disconnect();
    };
  }, [onConnectionChange]);

  /**
   * Handle connect/disconnect button click
   * Research: .taskmaster/docs/research/voice-agents-quickstart.md:70-85
   */
  const handleConnectionToggle = async () => {
    if (!connection) return;

    try {
      setIsConnecting(true);

      if (state.status === 'connected') {
        await connection.disconnect();
      } else {
        await connection.connect();
      }
    } catch (error) {
      console.error('Connection toggle failed:', error);
      // Error handled by VoiceConnection class
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Get status badge variant based on connection state
   * Research: Connection states from IMPLEMENTATION_GUIDE.md:140-160
   */
  const getStatusBadge = () => {
    switch (state.status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary">Connecting...</Badge>;
      case 'disconnected':
        return <Badge variant="outline">Disconnected</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  /**
   * Get appropriate icon based on connection state
   * Research: UI patterns from voice-agents-quickstart.md:90-95
   */
  const getConnectionIcon = () => {
    if (isConnecting || state.status === 'connecting') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    switch (state.status) {
      case 'connected':
        return <Mic className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MicOff className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
      {/* Status Display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Voice Assistant:</span>
        {getStatusBadge()}
      </div>

      {/* Connection Button */}
      <Button
        onClick={handleConnectionToggle}
        disabled={isConnecting || !connection}
        variant={state.status === 'connected' ? 'destructive' : 'default'}
        className="flex items-center space-x-2"
      >
        {getConnectionIcon()}
        <span>
          {isConnecting ? 'Connecting...' : 
           state.status === 'connected' ? 'Disconnect' : 'Connect Voice'}
        </span>
      </Button>

      {/* Error Display */}
      {state.error && (
        <div className="text-sm text-red-600 text-center max-w-md">
          <p>{state.error}</p>
          <p className="text-xs mt-1 text-gray-500">
            📚 See: .taskmaster/docs/research/REFERENCE_GUIDE.md for troubleshooting
          </p>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center max-w-md">
        {state.status === 'disconnected' && 
          'Click "Connect Voice" to start talking with the AI assistant'}
        {state.status === 'connecting' && 
          'Establishing secure connection to OpenAI...'}
        {state.status === 'connected' && 
          'Voice assistant is ready! Start speaking.'}
        {state.status === 'failed' && 
          'Connection failed. Check your internet and try again.'}
      </p>
    </div>
  );
}
```

## 🔍 **Debug and Error Reference System**

### **Research-Linked Error Handler**

```javascript
/**
 * Research-Backed Error Handler
 * Automatically references research documentation for troubleshooting
 */

class ResearchLinkedErrorHandler {
  
  /**
   * Create error with research references
   * @param {string} errorType - Type of error encountered
   * @param {object} context - Error context and details
   * @returns {object} Error object with research references
   */
  static createError(errorType, context = {}) {
    const errorMappings = {
      // Backend errors (Task 4)
      'openai_client_secret_failed': {
        reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:25-45',
        troubleshooting: 'Check API endpoint, authentication, and request format',
        codeExample: 'See IMPLEMENTATION_GUIDE.md:50-80 for correct implementation'
      },
      
      'token_generation_timeout': {
        reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180',
        troubleshooting: 'Implement retry logic with exponential backoff',
        codeExample: 'See CODE_TEMPLATES.md:25-50 for retry patterns'
      },

      // Frontend errors (Tasks 5 & 6)
      'webrtc_connection_failed': {
        reference: '.taskmaster/docs/research/voice-agents-quickstart.md:70-85',
        troubleshooting: 'Check WebRTC support, try WebSocket fallback',
        codeExample: 'See CODE_TEMPLATES.md:100-150 for connection handling'
      },

      'ephemeral_key_invalid': {
        reference: '.taskmaster/docs/research/voice-agents-quickstart.md:25-35',
        troubleshooting: 'Verify key format (starts with ek_), check expiration',
        codeExample: 'See IMPLEMENTATION_GUIDE.md:80-100 for key validation'
      }
    };

    const errorInfo = errorMappings[errorType] || {
      reference: '.taskmaster/docs/research/REFERENCE_GUIDE.md',
      troubleshooting: 'Check all research documentation for similar patterns',
      codeExample: 'Review all research files for implementation guidance'
    };

    return {
      type: errorType,
      message: context.message || 'An error occurred',
      context,
      research: {
        primaryReference: errorInfo.reference,
        troubleshootingGuide: errorInfo.troubleshooting,
        codeExample: errorInfo.codeExample,
        allResearchDocs: '.taskmaster/docs/research/',
        lastUpdated: '2025-09-15'
      },
      timestamp: new Date().toISOString(),
      debugInfo: {
        hint: 'Check research documentation for implementation patterns',
        aiGuidance: 'Reference research files before making implementation decisions'
      }
    };
  }

  /**
   * Log error with research guidance
   */
  static logErrorWithResearch(logger, errorType, context) {
    const error = this.createError(errorType, context);
    
    logger.error('Error with research reference', {
      ...error,
      aiGuidance: {
        checkFirst: error.research.primaryReference,
        ifStuck: 'Review all files in .taskmaster/docs/research/',
        updateNeeded: 'Run task-master research if patterns not found'
      }
    });

    return error;
  }
}

module.exports = ResearchLinkedErrorHandler;
```

## 🧭 **AI Implementation Guide**

### **Decision Making Framework**

```markdown
## When implementing OpenAI Realtime API features:

### 1. **Always Start With Research**
   ✅ Check: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md
   ✅ Validate: Against official patterns in research files
   ✅ Reference: Specific sections for implementation area

### 2. **Follow Research-Backed Patterns**
   ✅ Use: Exact API endpoints from research
   ✅ Implement: Security patterns from research findings
   ✅ Handle: Error scenarios documented in research

### 3. **Link Code to Research**
   ✅ Add: Research file references in code comments
   ✅ Include: Error codes that map to research sections
   ✅ Provide: Debug info that guides to research docs

### 4. **When Research is Insufficient**
   ✅ Run: task-master research "specific new question"
   ✅ Update: Existing research files with new findings
   ✅ Document: New patterns in research system

### 5. **Validate Implementation**
   ✅ Compare: Against research-documented patterns
   ✅ Test: Using research-backed test scenarios
   ✅ Debug: Using research-referenced troubleshooting
```

## 📚 **Research File Organization**

```
.taskmaster/docs/research/
├── IMPLEMENTATION_GUIDE.md     # 🎯 Primary consolidated guide
├── REFERENCE_GUIDE.md          # 🔍 Quick reference and error codes
├── CODE_TEMPLATES.md           # 🔧 Research-backed code templates
├── voice-agents-quickstart.md  # 📋 Step-by-step implementation
├── models-guide-research.md    # 🤖 Model configuration details
├── platform-api-research.md   # 🔗 Official API specifications
└── webrtc-platform-research.md # 🌐 WebRTC implementation details
```

**Every implementation decision is now backed by comprehensive research and can be validated against official OpenAI documentation!** 🚀

---

*This system ensures that AI assistants and developers always have immediate access to research-backed implementation patterns and troubleshooting guidance.*
