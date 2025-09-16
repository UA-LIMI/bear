/**
 * Authentication Middleware
 * 
 * Provides middleware for securing API endpoints.
 */

const { getConfig } = require('../config');
const { securityLogger } = require('./logger');

const config = getConfig();

/**
 * Middleware to protect endpoints with an API key.
 * Checks for a 'Authorization: Bearer <API_KEY>' header.
 */
function apiKeyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.split(' ')[1];

  if (!apiKey || apiKey !== config.aiGatewayApiKey) {
    securityLogger('api_key_auth_failed', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      reason: 'Missing or invalid API key',
    });
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'A valid API key is required to access this resource.',
      requestId: req.id,
    });
  }

  next();
}

module.exports = {
  apiKeyAuth,
};
