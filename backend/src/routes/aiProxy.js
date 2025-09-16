/**
 * Vercel AI Gateway Proxy Route
 * 
 * This route proxies requests from the frontend to the Vercel AI Gateway,
 * ensuring that sensitive API keys are not exposed to the client.
 */

const express = require('express');
const { validationResult } = require('express-validator');
const { createGateway } = require('@ai-sdk/gateway');
const { validationChains } = require('../middleware/validation');
const { apiKeyAuth } = require('../middleware/auth');
const { getConfig } = require('../config');
const { logger } = require('../middleware/logger');

const config = getConfig();

const router = express.Router();

// Create the Vercel AI Gateway provider
const gateway = createGateway({
  apiKey: config.aiGatewayApiKey,
  baseUrl: config.vercelAiGatewayUrl,
});

/**
 * Implements exponential backoff for retrying failed requests.
 * @param {Function} fn The function to retry.
 * @param {number} retries The maximum number of retries.
 * @param {number} delay The initial delay in milliseconds.
 * @returns {Promise<any>} The result of the function.
 */
async function withRetry(fn, retries = 3, delay = 1000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

/**
 * @route   POST /api/ai-proxy
 * @desc    Proxies a request to the Vercel AI Gateway
 * @access  Private
 */
router.post('/', apiKeyAuth, validationChains.aiRequestValidation, async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation Failed',
      details: errors.array() 
    });
  }

  try {
    const { messages, model, temperature, maxTokens } = req.body;

    // Log the request
    logger.info('Proxying request to Vercel AI Gateway', {
      requestId: req.id,
      model,
      temperature,
      maxTokens,
    });

    // Use the gateway to generate text with retry logic
    const result = await withRetry(() => gateway.generateText({
      model,
      messages,
      temperature,
      maxTokens,
    }));

    // Log the successful response
    logger.info('Successfully received response from Vercel AI Gateway', {
      requestId: req.id,
      finishReason: result.finishReason,
      usage: result.usage,
    });

    // Send the response back to the client
    res.status(200).json({
      message: 'Successfully proxied request to Vercel AI Gateway',
      data: result.text,
      finishReason: result.finishReason,
      usage: result.usage,
      requestId: req.id,
    });

  } catch (error) {
    // Pass error to the centralized error handler
    error.requestId = req.id;
    
    // Classify the error for better logging and response
    if (error.response) {
      // API error from Vercel AI Gateway
      error.status = error.response.status;
      error.message = `Vercel AI Gateway error: ${error.response.data.message}`;
    } else if (error.request) {
      // Network error
      error.status = 503; // Service Unavailable
      error.message = 'Network error while connecting to Vercel AI Gateway.';
    }

    next(error);
  }
});

module.exports = router;
