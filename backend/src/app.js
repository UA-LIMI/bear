/**
 * Express Application Setup
 * Configures all middleware and routes for the Limi AI backend
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { getConfig } = require('./config');
const { getRateLimiter } = require('./middleware/rateLimiter');
const { errorLogger, requestLogger, logger } = require('./middleware/logger');
const { sanitizeInput } = require('./middleware/validation');

// Create Express app
const app = express();
const config = getConfig();

// Security middleware - must be first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://ai-gateway.vercel.sh"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for WebRTC
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow frontend URL
    if (origin === config.frontendUrl) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (config.isDevelopment && origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Rate-Limit-Limit', 'X-Rate-Limit-Remaining', 'X-Rate-Limit-Reset'],
};

app.use(cors(corsOptions));

// Request parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware
const morganFormat = config.logFormat === 'json' 
  ? 'combined' 
  : ':method :url :status :response-time ms - :res[content-length]';

app.use(morgan(morganFormat, {
  skip: (req, res) => {
    // Skip logging for health checks in production
    if (config.isProduction && req.url === '/health') {
      return res.statusCode < 400;
    }
    return false;
  }
}));

// Add request ID for tracing (before logging)
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Winston request logging middleware
app.use(requestLogger);

// Input sanitization middleware (after parsing, before validation)
app.use(sanitizeInput);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Rate limiting middleware - apply to all routes
app.use(getRateLimiter('general'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Limi AI Backend Service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

// Health check routes
const healthRoutes = require('./routes/health');
app.use('/', healthRoutes);

// Test routes (for validation demonstration)
const testRoutes = require('./routes/test');
app.use('/test', testRoutes);

// OpenAI API routes
const openaiRoutes = require('./routes/openai');
app.use('/api', openaiRoutes);

// Vercel AI Gateway Proxy route
const aiProxyRoutes = require('./routes/aiProxy');
app.use('/api/ai-proxy', aiProxyRoutes);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: req.id,
  });
});

// Error logging middleware (must be before error handler)
app.use(errorLogger);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  // Don't leak error details in production
  const isDevelopment = config.isDevelopment;
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    requestId: req.id,
    ...(isDevelopment && { stack: err.stack }),
  });
});

module.exports = app;
