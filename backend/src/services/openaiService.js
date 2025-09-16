/**
 * OpenAI Realtime API Service
 * 
 * 📚 Research References:
 * - Implementation Guide: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:50-80
 * - API Specification: .taskmaster/docs/research/voice-agents-quickstart.md:32-39
 * - Error Handling: .taskmaster/docs/research/REFERENCE_GUIDE.md:25-50
 * 
 * 🎯 Purpose: Centralized service for OpenAI Realtime API interactions
 * 🔑 Security: Handles main API key securely, generates ephemeral tokens
 * 🔄 Extensibility: Designed for multiple frontend integrations
 */

const axios = require('axios');
const { getConfig } = require('../config');
const { logger } = require('../middleware/logger');

const config = getConfig();

/**
 * Token cache for managing ephemeral tokens
 * Research Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:80-100
 */
class TokenCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Cache token with automatic expiration
   * @param {string} sessionId - Session identifier
   * @param {object} tokenData - Token data with expiration
   */
  set(sessionId, tokenData) {
    const expiresAt = new Date(tokenData.expiresAt * 1000); // Convert to milliseconds
    const ttl = expiresAt.getTime() - Date.now() - 30000; // 30s buffer
    
    if (ttl > 0) {
      // Auto-cleanup when expired
      setTimeout(() => {
        this.cache.delete(sessionId);
        logger.debug('Token cache cleanup', { sessionId, expired: true });
      }, ttl);
      
      this.cache.set(sessionId, {
        ...tokenData,
        cachedAt: Date.now()
      });
      
      logger.debug('Token cached', { 
        sessionId, 
        expiresAt: expiresAt.toISOString(),
        ttl: `${Math.round(ttl / 1000)}s`
      });
    }
  }

  /**
   * Get cached token if still valid
   * @param {string} sessionId - Session identifier
   * @returns {object|null} Token data or null if expired/missing
   */
  get(sessionId) {
    const tokenData = this.cache.get(sessionId);
    if (!tokenData) return null;

    const expiresAt = new Date(tokenData.expiresAt * 1000);
    const isValid = Date.now() < (expiresAt.getTime() - 30000); // 30s buffer

    if (!isValid) {
      this.cache.delete(sessionId);
      logger.debug('Token cache expired', { sessionId });
      return null;
    }

    return tokenData;
  }

  /**
   * Check if token is valid without returning it
   * @param {string} sessionId - Session identifier
   * @returns {boolean} True if token exists and is valid
   */
  isValid(sessionId) {
    return this.get(sessionId) !== null;
  }

  /**
   * Clear all cached tokens
   */
  clear() {
    const count = this.cache.size;
    this.cache.clear();
    logger.info('Token cache cleared', { tokensCleared: count });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      totalTokens: this.cache.size,
      tokens: Array.from(this.cache.entries()).map(([sessionId, data]) => ({
        sessionId,
        expiresAt: new Date(data.expiresAt * 1000).toISOString(),
        model: data.model,
        cachedAt: new Date(data.cachedAt).toISOString()
      }))
    };
  }
}

// Global token cache instance
const tokenCache = new TokenCache();

/**
 * OpenAI Realtime API Service Class
 * Research Reference: .taskmaster/docs/research/CODE_TEMPLATES.md:25-80
 */
class OpenAIRealtimeService {
  
  /**
   * Generate ephemeral client secret
   * @param {object} options - Generation options
   * @param {string} options.sessionId - Optional session identifier
   * @param {string} options.model - Model to use (gpt-4o-realtime-preview)
   * @param {string} options.voice - Voice to use (alloy, echo, fable, onyx, nova, shimmer)
   * @param {string} options.instructions - Custom instructions for the AI
   * @param {array} options.capabilities - Optional capabilities array
   * @param {boolean} options.useCache - Whether to use token caching
   * @returns {object} Token data with ephemeral key
   */
  static async generateClientSecret(options = {}) {
    const {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      model = 'gpt-4o-realtime-preview',
      voice = 'alloy',
      capabilities = ['audio_input', 'audio_output'],
      useCache = true
    } = options;

    // Check cache first (if enabled)
    if (useCache && sessionId) {
      const cachedToken = tokenCache.get(sessionId);
      if (cachedToken) {
        logger.debug('Using cached token', { sessionId, model });
        return cachedToken;
      }
    }

    const startTime = Date.now();

    try {
      // 🔗 OpenAI API Call (research specification)
      // API Endpoint: POST https://api.openai.com/v1/realtime/client_secrets
      // Reference: .taskmaster/docs/research/voice-agents-quickstart.md:32-39
      const response = await axios.post(
        'https://api.openai.com/v1/realtime/client_secrets',
        {
          session: {
            type: 'realtime',
            model,
            audio: {
              output: {
                voice,
                format: { type: 'audio/pcm', rate: 24000 }
              },
              input: {
                format: { type: 'audio/pcm', rate: 24000 }
              }
            }
            // Note: instructions are set on RealtimeAgent, not session
            // Note: capabilities parameter not supported by OpenAI API as of Sept 2025
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openaiApiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Limi-AI-Backend/1.0.0',
            'OpenAI-Beta': 'realtime=v1' // Required header for realtime API
          },
          timeout: 10000 // 10s timeout (research recommendation)
        }
      );

      // 📦 Parse Response (actual OpenAI API format)
      const tokenData = {
        ephemeralKey: response.data.value,
        expiresAt: response.data.expires_at,
        sessionId: response.data.session?.id || sessionId,
        model: response.data.session?.model || model,
        generatedAt: Date.now(),
        capabilities
      };

      // Validate ephemeral key format (research requirement)
      if (!tokenData.ephemeralKey || !tokenData.ephemeralKey.startsWith('ek_')) {
        throw new Error('Invalid ephemeral key format received from OpenAI API');
      }

      // Cache token for reuse (if enabled)
      if (useCache) {
        tokenCache.set(sessionId, tokenData);
      }

      // ✅ Success Logging
      logger.info('Client secret generated successfully', {
        sessionId: tokenData.sessionId,
        model: tokenData.model,
        expiresAt: new Date(tokenData.expiresAt * 1000).toISOString(),
        duration: `${Date.now() - startTime}ms`,
        cached: useCache
      });

      return tokenData;

    } catch (error) {
      // 🚨 Enhanced Error Handling (research-backed patterns)
      const errorContext = {
        sessionId,
        model,
        capabilities,
        duration: `${Date.now() - startTime}ms`,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };

      logger.error('Client secret generation failed', {
        ...errorContext,
        researchReference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180',
        troubleshooting: 'Check research docs for error handling patterns'
      });

      // Enhance error with research-backed information
      this.enhanceError(error, errorContext);
      throw error;
    }
  }

  /**
   * Enhance error with research-backed troubleshooting info
   * Reference: .taskmaster/docs/research/REFERENCE_GUIDE.md:25-50
   */
  static enhanceError(error, context) {
    // Add research references to error object
    error.researchReference = '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180';
    error.troubleshootingGuide = '.taskmaster/docs/research/REFERENCE_GUIDE.md:25-50';
    
    // Add specific guidance based on error type
    if (error.response?.status === 401) {
      error.guidance = {
        issue: 'OpenAI API authentication failed',
        action: 'Verify OPENAI_API_KEY is valid and has realtime access',
        reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:25-45'
      };
    } else if (error.response?.status === 429) {
      error.guidance = {
        issue: 'OpenAI API rate limit exceeded',
        action: 'Implement exponential backoff retry or reduce request frequency',
        reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180'
      };
    } else if (error.code === 'ECONNABORTED') {
      error.guidance = {
        issue: 'Request timeout to OpenAI API',
        action: 'Check network connectivity or increase timeout',
        reference: '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:50-80'
      };
    } else if (error.response?.status === 400) {
      error.guidance = {
        issue: 'Invalid request format sent to OpenAI API',
        action: 'Validate request body format against research specification',
        reference: '.taskmaster/docs/research/voice-agents-quickstart.md:32-39'
      };
    }

    return error;
  }

  /**
   * Validate ephemeral key format
   * @param {string} key - Ephemeral key to validate
   * @returns {boolean} True if key format is valid
   */
  static validateEphemeralKey(key) {
    return typeof key === 'string' && 
           key.startsWith('ek_') && 
           key.length > 10;
  }

  /**
   * Get OpenAI API health status
   * @returns {object} Health status information
   */
  static async getApiHealth() {
    try {
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'User-Agent': 'Limi-AI-Backend/1.0.0'
        },
        timeout: 5000
      });

      return {
        status: 'healthy',
        accessible: true,
        responseTime: response.headers['x-response-time'] || 'unknown',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        accessible: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get service statistics and cache information
   * @returns {object} Service statistics
   */
  static getServiceStats() {
    return {
      service: 'OpenAI Realtime API Service',
      version: '1.0.0',
      tokenCache: tokenCache.getStats(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear all cached tokens (admin function)
   */
  static clearTokenCache() {
    tokenCache.clear();
    logger.info('Token cache manually cleared');
  }
}

module.exports = {
  OpenAIRealtimeService,
  tokenCache
};
