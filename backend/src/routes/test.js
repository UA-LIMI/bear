/**
 * Test Routes for Validation
 * Demonstrates input validation middleware functionality
 */

const express = require('express');
const { validationChains } = require('../middleware/validation');

const router = express.Router();

/**
 * Test endpoint for AI request validation
 * POST /test/ai-request
 */
router.post('/ai-request', validationChains.aiRequestValidation, (req, res) => {
  res.json({
    message: 'AI request validation passed',
    data: {
      model: req.body.model,
      messageCount: req.body.messages?.length,
      temperature: req.body.temperature,
      maxTokens: req.body.maxTokens
    },
    requestId: req.id
  });
});

/**
 * Test endpoint for client secret request validation
 * POST /test/client-secret
 */
router.post('/client-secret', validationChains.clientSecretRequest, (req, res) => {
  res.json({
    message: 'Client secret request validation passed',
    data: {
      sessionId: req.body.sessionId,
      capabilities: req.body.capabilities
    },
    requestId: req.id
  });
});

/**
 * Test endpoint for pagination validation
 * GET /test/pagination
 */
router.get('/pagination', validationChains.pagination, (req, res) => {
  res.json({
    message: 'Pagination validation passed',
    data: {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      offset: req.query.offset || 0
    },
    requestId: req.id
  });
});

/**
 * Test endpoint for ID parameter validation
 * GET /test/item/:id
 */
router.get('/item/:id', validationChains.idParam, (req, res) => {
  res.json({
    message: 'ID parameter validation passed',
    data: {
      id: req.params.id
    },
    requestId: req.id
  });
});

module.exports = router;
