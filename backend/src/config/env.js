/**
 * Environment Variable Management
 * Securely loads and validates environment variables
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Required environment variables
 */
const requiredVars = [
  'OPENAI_API_KEY',
  'AI_GATEWAY_API_KEY',
];

/**
 * Optional environment variables with defaults
 */
const optionalVars = {
  PORT: 3001,
  NODE_ENV: 'development',
  FRONTEND_URL: 'http://localhost:3000',
  VERCEL_AI_GATEWAY_URL: 'https://ai-gateway.vercel.sh/v1',
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'json',
};

/**
 * Validates that all required environment variables are present
 */
function validateEnv() {
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Please create a .env file in the backend directory with these variables.');
    console.error('   You can use .env.example as a template.\n');
    process.exit(1);
  }
}

/**
 * Sanitizes sensitive values for logging
 */
function sanitizeValue(key, value) {
  const sensitiveKeys = ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'];
  const isSensitive = sensitiveKeys.some(sensitive => key.includes(sensitive));
  
  if (isSensitive && value) {
    // Show only first 4 and last 4 characters
    if (value.length > 8) {
      return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
    }
    return '***hidden***';
  }
  
  return value;
}

/**
 * Get configuration object with all environment variables
 */
function getConfig() {
  // Validate on first call
  validateEnv();
  
  const config = {
    // Server Configuration
    port: parseInt(process.env.PORT || optionalVars.PORT, 10),
    nodeEnv: process.env.NODE_ENV || optionalVars.NODE_ENV,
    isDevelopment: (process.env.NODE_ENV || optionalVars.NODE_ENV) === 'development',
    isProduction: (process.env.NODE_ENV || optionalVars.NODE_ENV) === 'production',
    
    // CORS Configuration
    frontendUrl: process.env.FRONTEND_URL || optionalVars.FRONTEND_URL,
    
    // API Keys (Required)
    openaiApiKey: process.env.OPENAI_API_KEY,
    aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY,
    
    // Vercel AI Gateway
    vercelAiGatewayUrl: process.env.VERCEL_AI_GATEWAY_URL || optionalVars.VERCEL_AI_GATEWAY_URL,
    
    // Rate Limiting
    rateLimitWindowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || optionalVars.RATE_LIMIT_WINDOW_MS,
      10
    ),
    rateLimitMaxRequests: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || optionalVars.RATE_LIMIT_MAX_REQUESTS,
      10
    ),
    
    // Logging
    logLevel: process.env.LOG_LEVEL || optionalVars.LOG_LEVEL,
    logFormat: process.env.LOG_FORMAT || optionalVars.LOG_FORMAT,
    
    // Security
    sessionSecret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-production',
    jwtSecret: process.env.JWT_SECRET || 'default-dev-jwt-secret-change-in-production',
  };
  
  // Warn about default secrets in production
  if (config.isProduction) {
    if (config.sessionSecret === 'default-dev-secret-change-in-production') {
      console.warn('⚠️  Warning: Using default SESSION_SECRET in production!');
    }
    if (config.jwtSecret === 'default-dev-jwt-secret-change-in-production') {
      console.warn('⚠️  Warning: Using default JWT_SECRET in production!');
    }
  }
  
  return config;
}

/**
 * Logs the current configuration (with sensitive values sanitized)
 */
function logConfig() {
  const config = getConfig();
  console.log('\n📋 Environment Configuration:');
  console.log('================================');
  
  Object.entries(config).forEach(([key, value]) => {
    const sanitizedValue = sanitizeValue(key, String(value));
    console.log(`  ${key}: ${sanitizedValue}`);
  });
  
  console.log('================================\n');
}

// Export configuration
module.exports = {
  getConfig,
  validateEnv,
  logConfig,
  sanitizeValue,
};

// Validate environment variables on module load
if (require.main !== module) {
  validateEnv();
}
