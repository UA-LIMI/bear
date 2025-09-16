/**
 * Central Configuration Module
 * Exports all configuration settings for the application
 */

const { getConfig, logConfig, validateEnv } = require('./env');

// Export utility functions and the getConfig function itself.
// Modules that need the configuration will call getConfig() on their own.
module.exports = {
  getConfig,
  logConfig,
  validateEnv,
};
