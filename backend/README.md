# Limi AI Backend Service

A secure Node.js/Express backend service for the Limi AI application, providing AI Gateway proxy and voice services.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration  
FRONTEND_URL=http://localhost:3000

# API Keys (Required)
OPENAI_API_KEY=your_openai_api_key_here
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key_here

# Vercel AI Gateway Configuration
VERCEL_AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security (Change these in production!)
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret
```

### Running the Server

```bash
# Development
npm run dev

# Production  
npm start
```

## 📋 API Documentation

### Health Check Endpoints

#### `GET /healthz`
Basic health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-15T21:35:00.000Z",
  "service": "limi-ai-backend"
}
```

#### `GET /readyz`
Comprehensive readiness check including environment validation.

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2025-09-15T21:35:00.000Z",
  "service": "limi-ai-backend",
  "version": "1.0.0",
  "checks": {
    "environment": "✅ All required variables present",
    "memory": "✅ 45.2 MB used of 512 MB available",
    "apiKeys": "✅ Required API keys configured",
    "process": "✅ Process running normally"
  }
}
```

#### `GET /live`
Liveness probe for orchestration systems.

**Response:**
```json
{
  "status": "alive",
  "timestamp": "2025-09-15T21:35:00.000Z"
}
```

#### `GET /status`
Detailed service status for internal monitoring.

**Response:**
```json
{
  "status": "operational",
  "timestamp": "2025-09-15T21:35:00.000Z",
  "service": "limi-ai-backend",
  "version": "1.0.0",
  "environment": "development",
  "uptime": "2h 15m 30s",
  "memory": {
    "used": "45.2 MB",
    "available": "512 MB",
    "usage": "8.8%"
  },
  "configuration": {
    "port": 3001,
    "logLevel": "info",
    "rateLimitWindow": "60000ms",
    "rateLimitMax": 100
  }
}
```

### Core Service Endpoint

#### `GET /`
Basic service information.

**Response:**
```json
{
  "message": "Limi AI Backend Service",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2025-09-15T21:35:00.000Z",
  "requestId": "abc123def"
}
```

## 🛡️ Security Features

### Input Validation
- **express-validator** for comprehensive input validation
- **Input sanitization** middleware to prevent XSS attacks
- **Type validation** for all API endpoints
- **Custom validation rules** for AI-specific data types

### Rate Limiting
- **Development**: 1000 requests/minute (general), 500 requests/minute (AI endpoints)
- **Production**: 100 requests/minute (general), 20 requests/minute (AI endpoints)
- **Authentication endpoints**: 5 requests/minute (production)

### CORS Configuration
- Configured for frontend URL: `http://localhost:3000`
- Development: Allows localhost with any port
- Production: Strict origin validation

### Security Headers
- Helmet.js for security headers
- CSP configured for AI services
- Cross-origin embedder policy disabled for WebRTC compatibility

### Logging Security
- **Winston-based structured logging** (consolidated)
- Sensitive data sanitization
- Request ID tracking for debugging
- **No console.log statements** - all logging centralized

## 🏗️ Architecture

### Middleware Stack
1. **Security** - Helmet.js security headers
2. **CORS** - Cross-origin resource sharing
3. **Body Parsing** - JSON and URL-encoded support (10MB limit)
4. **Request Tracing** - Unique request ID generation
5. **Logging** - Winston structured logging (consolidated)
6. **Input Sanitization** - XSS prevention and data cleaning
7. **Rate Limiting** - Express-rate-limit with IP-based tracking
8. **Input Validation** - express-validator for API endpoints

### Configuration Management
- Centralized in `src/config/env.js`
- Environment variable validation on startup
- Sensitive value sanitization for logs
- Default values for optional settings

### Error Handling
- Centralized error logging with Winston
- Environment-aware error responses
- Request ID tracking for debugging
- Stack traces in development only

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express application setup
│   ├── index.js                  # Server entry point
│   ├── config/
│   │   ├── env.js                # Environment configuration
│   │   └── index.js              # Configuration exports
│   ├── middleware/
│   │   ├── logger.js             # Winston logging middleware
│   │   ├── rateLimiter.js        # Rate limiting configuration
│   │   └── validation.js         # Input validation middleware
│   └── routes/
│       ├── health.js             # Standardized health check endpoints
│       └── test.js               # Validation test endpoints
├── logs/                         # Log files (production)
├── test-comprehensive.js         # Comprehensive test suite
├── test-rate-limit.js           # Rate limiting tests
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🔧 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for voice services | `sk-proj-...` |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key | `vck_...` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |
| `VERCEL_AI_GATEWAY_URL` | `https://ai-gateway.vercel.sh/v1` | AI Gateway endpoint |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Logging level |
| `LOG_FORMAT` | `json` | Log output format |
| `SESSION_SECRET` | Auto-generated | Session encryption key |
| `JWT_SECRET` | Auto-generated | JWT signing key |

## 🧪 Testing

### Manual Testing

```bash
# Health checks (cloud-native standard)
curl http://localhost:3001/healthz   # Returns: {"status":"ok"}
curl http://localhost:3001/readyz    # Returns: {"status":"ready"}
curl http://localhost:3001/live      # Returns: {"status":"alive"}
curl http://localhost:3001/status    # Returns: detailed diagnostics

# Basic service
curl http://localhost:3001/

# OpenAI client secret generation
curl -X POST http://localhost:3001/api/client-secret \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","model":"gpt-4o-realtime-preview"}'

# Input validation testing  
curl -X POST http://localhost:3001/test/ai-request \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"model":"gpt-3.5-turbo"}'

# Rate limiting test
for i in {1..10}; do curl http://localhost:3001/ & done

# Comprehensive test suite
node test-comprehensive.js
```

### Rate Limiting Verification

The server includes rate limiting headers in responses:
- `X-Rate-Limit-Limit` - Maximum requests allowed
- `X-Rate-Limit-Remaining` - Requests remaining in window
- `X-Rate-Limit-Reset` - Window reset time

## 📊 Monitoring

### Log Levels
- `error` - Error conditions
- `warn` - Warning conditions  
- `info` - Informational messages
- `debug` - Debug information

### Log Format (Production)
```json
{
  "level": "info",
  "message": "Request completed",
  "timestamp": "2025-09-15T21:35:00.000Z",
  "service": "limi-ai-backend",
  "requestId": "abc123def",
  "method": "GET",
  "url": "/healthz",
  "statusCode": 200,
  "duration": "5ms"
}
```

## 🚀 Deployment

### Production Checklist
- [ ] Update `SESSION_SECRET` and `JWT_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `FRONTEND_URL`
- [ ] Set up log aggregation
- [ ] Configure process manager (PM2, Docker)
- [ ] Set up health check monitoring
- [ ] Configure reverse proxy (nginx)

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Follow the existing code structure
2. Use the centralized configuration system
3. Add appropriate logging and error handling
4. Update documentation for new endpoints
5. Test rate limiting and security features

## 📄 License

ISC
