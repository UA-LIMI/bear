/**
 * Custom Logging Middleware
 * Provides structured logging for requests and responses
 */

const winston = require('winston');
const { config } = require('../config');

// Create Winston logger
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'limi-ai-backend' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
  ],
});

// Add file logging in production
if (config.isProduction) {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log' 
  }));
}

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  logger.info('Request started', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    // Log response
    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0,
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

/**
 * Error logging middleware
 */
function errorLogger(err, req, res, next) {
  logger.error('Request error', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    statusCode: err.status || 500,
  });
  
  next(err);
}

/**
 * Security event logger
 */
function securityLogger(event, details) {
  logger.warn('Security event', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  securityLogger,
};
