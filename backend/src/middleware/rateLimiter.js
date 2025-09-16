/**
 * Rate Limiting Middleware
 * Provides user-friendly rate limiting for early adopters while protecting against abuse
 */

const rateLimit = require('express-rate-limit');
const { config } = require('../config');

/**
 * General API rate limiter - generous for early users
 * 100 requests per minute per IP (1.67 requests per second)
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 1 minute
  max: config.rateLimitMaxRequests,   // 100 requests per window
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000), // seconds
    requestId: null, // Will be set by the handler
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    // Add request ID to the error message
    const errorResponse = {
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
      requestId: req.id,
    };
    
    res.status(429).json(errorResponse);
  },
  // Skip rate limiting for health checks
  skip: (req) => {
    return req.url === '/healthz' || req.url === '/readyz' || req.url === '/live';
  },
});

/**
 * Strict rate limiter for AI endpoints - more restrictive
 * 20 requests per minute per IP for AI operations
 */
const aiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 1 minute
  max: 20, // 20 AI requests per minute
  message: {
    error: 'AI Rate Limit Exceeded',
    message: 'You have exceeded the AI request rate limit. Please wait before making more AI requests.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
    requestId: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const errorResponse = {
      error: 'AI Rate Limit Exceeded',
      message: 'You have exceeded the AI request rate limit. Please wait before making more AI requests.',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
      requestId: req.id,
    };
    
    res.status(429).json(errorResponse);
  },
});

/**
 * Very strict rate limiter for authentication endpoints
 * 5 requests per minute per IP for auth operations
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 1 minute
  max: 5, // 5 auth requests per minute
  message: {
    error: 'Authentication Rate Limit Exceeded',
    message: 'Too many authentication attempts. Please wait before trying again.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
    requestId: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const errorResponse = {
      error: 'Authentication Rate Limit Exceeded',
      message: 'Too many authentication attempts. Please wait before trying again.',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
      requestId: req.id,
    };
    
    res.status(429).json(errorResponse);
  },
});

/**
 * Development mode rate limiter - very generous for testing
 * 1000 requests per minute in development
 */
const devLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: 1000, // Very generous for development
  message: {
    error: 'Development Rate Limit Exceeded',
    message: 'Even in development mode, you have exceeded the rate limit!',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
    requestId: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const errorResponse = {
      error: 'Development Rate Limit Exceeded',
      message: 'Even in development mode, you have exceeded the rate limit!',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
      requestId: req.id,
    };
    
    res.status(429).json(errorResponse);
  },
});

/**
 * Get the appropriate rate limiter based on environment and route
 */
function getRateLimiter(routeType = 'general') {
  // In development, use more generous limits
  if (config.isDevelopment) {
    return devLimiter;
  }
  
  // In production, use appropriate limits based on route type
  switch (routeType) {
    case 'ai':
      return aiLimiter;
    case 'auth':
      return authLimiter;
    case 'general':
    default:
      return generalLimiter;
  }
}

/**
 * Rate limiting configuration for different route types
 */
const rateLimitConfig = {
  // General API routes
  general: {
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    description: 'General API requests (100/min)',
  },
  
  // AI-specific routes
  ai: {
    windowMs: config.rateLimitWindowMs,
    max: 20,
    description: 'AI requests (20/min)',
  },
  
  // Authentication routes
  auth: {
    windowMs: config.rateLimitWindowMs,
    max: 5,
    description: 'Authentication requests (5/min)',
  },
  
  // Development mode
  development: {
    windowMs: config.rateLimitWindowMs,
    max: 1000,
    description: 'Development mode (1000/min)',
  },
};

module.exports = {
  generalLimiter,
  aiLimiter,
  authLimiter,
  devLimiter,
  getRateLimiter,
  rateLimitConfig,
};
