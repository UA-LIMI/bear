/**
 * Central Configuration Module
 * Exports all configuration settings for the application
 */

const { getConfig, logConfig, validateEnv } = require('./env');

// Get the configuration object
const config = getConfig();

// Export everything
module.exports = {
  // The main config object
  config,
  
  // Utility functions
  logConfig,
  validateEnv,
  
  // Direct access to commonly used values
  port: config.port,
  isDevelopment: config.isDevelopment,
  isProduction: config.isProduction,
};
