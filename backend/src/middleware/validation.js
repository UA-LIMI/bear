/**
 * Input Validation Middleware
 * Provides validation for API endpoints using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('./logger');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    logger.warn('Validation failed', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      errors: errorDetails,
      ip: req.ip
    });

    return res.status(400).json({
      error: 'Validation Failed',
      message: 'Request contains invalid data',
      details: errorDetails,
      requestId: req.id
    });
  }
  
  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  // ID validation (for path parameters)
  id: param('id')
    .isLength({ min: 1, max: 100 })
    .withMessage('ID must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('ID can only contain alphanumeric characters, hyphens, and underscores'),

  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),

  // Password validation
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Text input validation (general purpose)
  text: (fieldName, options = {}) => {
    const { min = 1, max = 1000, required = true } = options;
    let validator = body(fieldName);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${fieldName} is required`);
    }
    
    return validator
      .isLength({ min, max })
      .withMessage(`${fieldName} must be between ${min} and ${max} characters`)
      .trim()
      .escape();
  },

  // URL validation
  url: (fieldName) => body(fieldName)
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`${fieldName} must be a valid URL with http or https protocol`),

  // JSON validation
  json: (fieldName) => body(fieldName)
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        throw new Error(`${fieldName} must be valid JSON`);
      }
    }),

  // API Key validation (for headers or body)
  apiKey: (fieldName, location = 'body') => {
    const validator = location === 'header' ? 
      require('express-validator').header(fieldName) : 
      body(fieldName);
    
    return validator
      .isLength({ min: 10, max: 200 })
      .withMessage(`${fieldName} must be between 10 and 200 characters`)
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage(`${fieldName} can only contain alphanumeric characters, hyphens, and underscores`);
  },

  // Pagination validation
  pagination: {
    page: query('page')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('Page must be a positive integer between 1 and 10000')
      .toInt(),
    
    limit: query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be a positive integer between 1 and 100')
      .toInt(),

    offset: query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
      .toInt()
  },

  // AI-related validation
  aiRequest: {
    model: body('model')
      .optional()
      .isIn(['gpt-4o-realtime-preview', 'gpt-realtime', 'gpt-4-realtime'])
      .withMessage('Model must be a supported realtime model (gpt-4o-realtime-preview, gpt-realtime, gpt-4-realtime)'),

    temperature: body('temperature')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Temperature must be a number between 0 and 2'),

    maxTokens: body('maxTokens')
      .optional()
      .isInt({ min: 1, max: 4096 })
      .withMessage('Max tokens must be an integer between 1 and 4096'),

    messages: body('messages')
      .isArray({ min: 1, max: 100 })
      .withMessage('Messages must be an array with 1 to 100 items'),

    'messages.*.role': body('messages.*.role')
      .isIn(['system', 'user', 'assistant'])
      .withMessage('Message role must be system, user, or assistant'),

    'messages.*.content': body('messages.*.content')
      .isLength({ min: 1, max: 10000 })
      .withMessage('Message content must be between 1 and 10000 characters')
      .trim()
  }
};

/**
 * Predefined validation chains for common endpoints
 */
const validationChains = {
  // Health check endpoints (no validation needed)
  healthCheck: [],

  // AI Gateway proxy validation
  aiGatewayRequest: [
    validationRules.aiRequest.messages,
    validationRules.aiRequest['messages.*.role'],
    validationRules.aiRequest['messages.*.content'],
    validationRules.aiRequest.model,
    validationRules.aiRequest.temperature,
    validationRules.aiRequest.maxTokens,
    handleValidationErrors
  ],

  // OpenAI client secret request validation
  clientSecretRequest: [
    body('sessionId')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Session ID must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Session ID can only contain alphanumeric characters, hyphens, and underscores'),
    
    body('model')
      .optional()
      .isIn(['gpt-4o-realtime-preview', 'gpt-realtime'])
      .withMessage('Model must be gpt-4o-realtime-preview or gpt-realtime'),

    body('voice')
      .optional()
      .isIn(['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar'])
      .withMessage('Voice must be one of: alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin, cedar'),

    body('instructions')
      .optional()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Instructions must be between 1 and 2000 characters')
      .trim(),
    
    body('capabilities')
      .optional()
      .isArray()
      .withMessage('Capabilities must be an array'),
    
    handleValidationErrors
  ],

  // Generic ID parameter validation
  idParam: [validationRules.id, handleValidationErrors],

  // Pagination query validation
  pagination: [
    validationRules.pagination.page,
    validationRules.pagination.limit,
    validationRules.pagination.offset,
    handleValidationErrors
  ]
};

/**
 * Rate limiting validation (check if request is within limits)
 */
const validateRateLimit = (req, res, next) => {
  const remaining = res.getHeader('X-RateLimit-Remaining');
  
  if (remaining !== undefined && remaining <= 0) {
    logger.warn('Rate limit exceeded', {
      requestId: req.id,
      ip: req.ip,
      method: req.method,
      url: req.url
    });
    
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please try again later.',
      requestId: req.id
    });
  }
  
  next();
};

/**
 * Sanitize input data (additional security layer)
 */
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove on* event handlers
      .trim();
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  };

  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = {
  validationRules,
  validationChains,
  handleValidationErrors,
  validateRateLimit,
  sanitizeInput
};
