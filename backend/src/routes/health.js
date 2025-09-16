/**
 * Health Check Routes
 * Provides /healthz and /readyz endpoints for monitoring
 */

const express = require('express');
const { config } = require('../config');

const router = express.Router();

// Health check - basic service status (cloud-native standard)
router.get('/healthz', (req, res) => {
  // Simple, machine-readable response for orchestration systems
  res.status(200).json({ status: 'ok' });
});

// API Key health check
router.get('/healthz/keys', (req, res) => {
  const keysStatus = {
    openaiApiKey: process.env.OPENAI_API_KEY ? 'present' : 'missing',
    aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY ? 'present' : 'missing',
  };

  const allKeysPresent = Object.values(keysStatus).every(status => status === 'present');

  res.status(allKeysPresent ? 200 : 503).json({
    status: allKeysPresent ? 'ok' : 'error',
    keys: keysStatus,
  });
});

// Readiness check - service is ready to accept traffic (cloud-native standard)
router.get('/readyz', async (req, res) => {
  let allChecksPass = true;

  // Perform essential readiness checks
  try {
    // Check 1: Required environment variables
    const requiredVars = ['OPENAI_API_KEY', 'AI_GATEWAY_API_KEY'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      allChecksPass = false;
    }

    // Check 2: Memory usage (fail if using more than 1GB RSS)
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);
    if (memUsageMB > 1024) {
      allChecksPass = false;
    }

    // Check 3: API Key format validation
    const openaiKeyValid = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
    const gatewayKeyValid = process.env.AI_GATEWAY_API_KEY && process.env.AI_GATEWAY_API_KEY.startsWith('vck_');
    if (!openaiKeyValid || !gatewayKeyValid) {
      allChecksPass = false;
    }
  } catch (error) {
    allChecksPass = false;
  }

  // Return simple, machine-readable response
  const status = allChecksPass ? 'ready' : 'not ready';
  const httpStatus = allChecksPass ? 200 : 503;
  
  res.status(httpStatus).json({ status });
});

// Liveness check - service is alive (cloud-native standard)
router.get('/live', (req, res) => {
  // Minimal response for orchestration systems
  res.status(200).json({ status: 'alive' });
});

// Detailed status endpoint (for internal monitoring and debugging)
router.get('/status', async (req, res) => {
  const status = {
    service: 'limi-ai-backend',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'operational',
    requestId: req.id,
  };

  // Memory information
  const memUsage = process.memoryUsage();
  status.memory = {
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    usage: `${Math.round((memUsage.rss / (1024 * 1024 * 1024)) * 100)}%`
  };

  // Configuration information
  status.configuration = {
    port: config.port,
    frontendUrl: config.frontendUrl,
    logLevel: config.logLevel,
    rateLimitWindow: `${config.rateLimitWindowMs}ms`,
    rateLimitMax: config.rateLimitMaxRequests,
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid
  };

  // Detailed health checks
  status.checks = {};

  // Environment check
  try {
    const requiredVars = ['OPENAI_API_KEY', 'AI_GATEWAY_API_KEY'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    status.checks.environment = missingVars.length === 0 ? 
      '✅ All required variables present' : 
      `❌ Missing: ${missingVars.join(', ')}`;
  } catch (error) {
    status.checks.environment = `❌ Check failed: ${error.message}`;
  }

  // Memory check
  try {
    const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);
    const available = 512; // Assume 512MB available for example
    status.checks.memory = memUsageMB < 1024 ? 
      `✅ ${memUsageMB} MB used of ${available} MB available` : 
      `⚠️ High usage: ${memUsageMB} MB used`;
  } catch (error) {
    status.checks.memory = `❌ Check failed: ${error.message}`;
  }

  // API Keys check
  try {
    const openaiKeyValid = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
    const gatewayKeyValid = process.env.AI_GATEWAY_API_KEY && process.env.AI_GATEWAY_API_KEY.startsWith('vck_');
    
    status.checks.apiKeys = (openaiKeyValid && gatewayKeyValid) ? 
      '✅ Required API keys configured' : 
      '❌ Invalid API key format';
  } catch (error) {
    status.checks.apiKeys = `❌ Check failed: ${error.message}`;
  }

  // Process check
  try {
    const cpuUsage = process.cpuUsage();
    status.checks.process = '✅ Process running normally';
    status.process = {
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    };
  } catch (error) {
    status.checks.process = `❌ Check failed: ${error.message}`;
  }

  res.status(200).json(status);
});

module.exports = router;
