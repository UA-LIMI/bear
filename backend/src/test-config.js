/**
 * Test script to verify environment configuration
 */

const { config, logConfig } = require('./config');

console.log('🧪 Testing Environment Configuration...\n');

// Log the configuration (with sanitized sensitive values)
logConfig();

// Test specific configurations
console.log('✅ Configuration loaded successfully!');
console.log(`   Server will run on port: ${config.port}`);
console.log(`   Environment: ${config.nodeEnv}`);
console.log(`   Frontend URL: ${config.frontendUrl}`);

if (config.isDevelopment) {
  console.log('\n📝 Note: Running in DEVELOPMENT mode');
}

console.log('\n✨ Environment configuration is ready!');
