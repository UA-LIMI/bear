/**
 * OpenAI Realtime API Routes
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
const { config } = require('../config');
const { logger } = require('../middleware/logger');
const { validationChains } = require('../middleware/validation');
const { getRateLimiter } = require('../middleware/rateLimiter');
const { OpenAIRealtimeService } = require('../services/openaiService');

const router = express.Router();

// Apply AI-specific rate limiting (research-backed)
// Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:120-140
router.use(getRateLimiter('ai'));

/**
 * POST /api/client-secret
 * Generate ephemeral client secret for OpenAI Realtime API
 * 
 * 📋 Request Validation (research-backed):
 * - sessionId: optional string (1-100 chars, alphanumeric + hyphens)
 * - capabilities: optional array of strings
 * - model: optional string (gpt-realtime, gpt-4-realtime)
 * 
 * Research Reference: .taskmaster/docs/research/CODE_TEMPLATES.md:25-80
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

      // 🔗 Use OpenAI Service (enhanced with caching and error handling)
      const tokenData = await OpenAIRealtimeService.generateClientSecret({
        sessionId: req.body.sessionId,
        model: req.body.model,
        voice: req.body.voice,
        // Note: instructions handled on frontend RealtimeAgent, not backend session
        capabilities: req.body.capabilities,
        useCache: true // Enable token caching for efficiency
      });

      // ✅ Success Audit Log
      logger.info('Client secret generated successfully', {
        requestId: req.id,
        sessionId: tokenData.sessionId,
        expiresAt: new Date(tokenData.expiresAt * 1000).toISOString(),
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
      // 🚨 Error Handling (enhanced by service)
      const errorResponse = {
        error: 'Token Generation Failed',
        message: error.guidance?.issue || 'Unable to generate ephemeral client secret',
        code: error.guidance?.issue ? error.guidance.issue.toLowerCase().replace(/\s+/g, '_') : 'token_generation_failed',
        requestId: req.id,
        reference: error.researchReference || '.taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:160-180',
        retryAfter: error.response?.status === 429 ? 60000 : 5000
      };

      if (error.guidance?.action) {
        errorResponse.action = error.guidance.action;
      }

      const statusCode = error.response?.status === 429 ? 429 : 500;
      res.status(statusCode).json(errorResponse);
    }
  }
);

/**
 * GET /api/client-secret/health
 * Health check for OpenAI API connectivity
 * 
 * Research Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:140-160
 */
router.get('/client-secret/health', async (req, res) => {
  try {
    const healthStatus = await OpenAIRealtimeService.getApiHealth();
    
    const statusCode = healthStatus.accessible ? 200 : 503;
    res.status(statusCode).json({
      ...healthStatus,
      requestId: req.id
    });

  } catch (error) {
    logger.warn('OpenAI API health check failed', {
      requestId: req.id,
      error: error.message
    });

    res.status(503).json({
      status: 'unhealthy',
      accessible: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }
});

/**
 * GET /api/client-secret/stats
 * Service statistics and token cache information
 * 
 * Research Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:80-100
 */
router.get('/client-secret/stats', (req, res) => {
  try {
    const stats = OpenAIRealtimeService.getServiceStats();
    
    logger.info('Service stats requested', {
      requestId: req.id,
      ip: req.ip
    });

    res.json({
      ...stats,
      requestId: req.id
    });

  } catch (error) {
    logger.error('Failed to get service stats', {
      requestId: req.id,
      error: error.message
    });

    res.status(500).json({
      error: 'Stats Unavailable',
      message: 'Unable to retrieve service statistics',
      requestId: req.id
    });
  }
});

module.exports = router;
