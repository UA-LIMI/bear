/**
 * Main Server Entry Point
 * Starts the Express server with proper configuration
 */

const app = require('./app');
const { config, logConfig } = require('./config');
const { logger } = require('./middleware/logger');

// Log configuration on startup
logConfig();

// Start the server
const server = app.listen(config.port, () => {
  logger.info('Limi AI Backend Server Started', {
    port: config.port,
    environment: config.nodeEnv,
    frontendUrl: config.frontendUrl,
    logLevel: config.logLevel,
    status: 'running'
  });
  
  // Keep console output for development visibility
  if (config.isDevelopment) {
    console.log('\n🚀 Limi AI Backend Server Started!');
    console.log('=====================================');
    console.log(`📍 Server running on port: ${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
    console.log(`📊 Log Level: ${config.logLevel}`);
    console.log('=====================================\n');
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...', { signal: 'SIGTERM' });
  if (config.isDevelopment) {
    console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  }
  server.close(() => {
    logger.info('Server closed successfully', { status: 'shutdown' });
    if (config.isDevelopment) {
      console.log('✅ Server closed successfully');
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...', { signal: 'SIGINT' });
  if (config.isDevelopment) {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  }
  server.close(() => {
    logger.info('Server closed successfully', { status: 'shutdown' });
    if (config.isDevelopment) {
      console.log('✅ Server closed successfully');
    }
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  if (config.isDevelopment) {
    console.error('💥 Uncaught Exception:', err);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise: promise.toString() });
  if (config.isDevelopment) {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  }
  process.exit(1);
});

module.exports = server;
