# LIMI AI x HOTELS - VPS BACKEND COMMAND REFERENCE
**Complete guide to managing the VPS backend system**

## 🎯 BACKEND OVERVIEW
**VPS Server:** 145.79.10.35 (Hostinger VPS)  
**Purpose:** OpenAI Realtime API authentication and MQTT integration  
**Critical for:** Voice chat functionality across all hotels  
**Cannot be replaced:** Vercel serverless cannot handle WebSocket authentication  

---

## 🔐 SSH ACCESS & CONNECTION

### **Connect to VPS:**
```bash
# SSH into the VPS server
ssh limi-vps
# OR with full address:
ssh root@145.79.10.35

# Tool Used: OpenSSH client
# Purpose: Remote server access for administration
# Authentication: SSH key-based (configured in ~/.ssh/config)
```

### **Check SSH Configuration:**
```bash
# View SSH config (local machine)
cat ~/.ssh/config | grep -A 5 limi-vps

# Tool Used: SSH config file
# Purpose: Simplified connection alias
# Location: ~/.ssh/config on local machine
```

---

## 🐳 DOCKER CONTAINER MANAGEMENT

### **List All Containers:**
```bash
# Show all running containers
docker ps

# Show all containers (including stopped)
docker ps -a

# Tool Used: Docker CLI
# Purpose: View container status and information
# Output: Container ID, image, status, ports, names
```

### **LIMI AI Backend Container:**
```bash
# Check if LIMI backend is running
docker ps | grep limi-ai-backend

# View backend container logs
docker logs limi-ai-backend

# Follow live logs
docker logs -f limi-ai-backend

# Tool Used: Docker logs command
# Purpose: Monitor application logs and debug issues
# Log Format: Winston structured JSON logs
```

### **Container Health Checks:**
```bash
# Check container health status
docker inspect limi-ai-backend | grep -A 10 Health

# View health check logs
docker inspect limi-ai-backend | jq '.[0].State.Health'

# Tool Used: Docker inspect command
# Purpose: Detailed container health and configuration
# Health Check: Built into Dockerfile, checks /healthz endpoint
```

---

## 🔄 CONTAINER LIFECYCLE MANAGEMENT

### **Start/Stop/Restart Backend:**
```bash
# Stop the backend container
docker stop limi-ai-backend

# Start the backend container
docker start limi-ai-backend

# Restart the backend container
docker restart limi-ai-backend

# Tool Used: Docker container management commands
# Purpose: Control backend service availability
# Impact: Stops voice chat functionality when down
```

### **Rebuild and Deploy Backend:**
```bash
# Navigate to backend directory
cd /root/limi-ai-backend

# Stop current container
docker stop limi-ai-backend

# Remove old container
docker rm limi-ai-backend

# Rebuild image with latest code
docker build -t limi-ai-backend .

# Run new container
docker run -d \
  --name limi-ai-backend \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env \
  limi-ai-backend

# Tool Used: Docker build and run commands
# Purpose: Deploy new backend code to VPS
# Environment: Uses .env file for configuration
```

### **Update Backend Code:**
```bash
# Pull latest code from git
cd /root/limi-ai-backend
git pull origin main

# Rebuild and deploy
docker build -t limi-ai-backend .
docker stop limi-ai-backend
docker rm limi-ai-backend
docker run -d --name limi-ai-backend --restart unless-stopped -p 3001:3001 --env-file .env limi-ai-backend

# Tool Used: Git + Docker deployment pipeline
# Purpose: Update backend with latest code changes
# Process: Git pull → Docker build → Container replace
```

---

## 🌐 BACKEND API TESTING

### **Health Check Endpoints:**
```bash
# Basic health check
curl http://145.79.10.35:3001/healthz

# Expected: {"status":"ok"}
# Tool Used: cURL HTTP client
# Purpose: Verify basic backend availability

# Comprehensive readiness check
curl http://145.79.10.35:3001/readyz

# Expected: Detailed system status
# Tool Used: cURL with readiness endpoint
# Purpose: Verify all backend services operational

# Liveness probe
curl http://145.79.10.35:3001/live

# Expected: Service liveness confirmation
# Tool Used: cURL for Kubernetes-style probes
# Purpose: Container orchestration health checks
```

### **OpenAI Integration Testing:**
```bash
# Test ephemeral key generation (critical endpoint)
curl -X POST http://145.79.10.35:3001/api/client-secret \
  -H "Content-Type: application/json" \
  -H "Origin: https://bear-beige.vercel.app" \
  -d '{
    "sessionId": "test_session_123",
    "model": "gpt-4o-realtime-preview",
    "voice": "alloy",
    "instructions": "You are a test assistant"
  }'

# Expected: {"ephemeralKey":"ek_...", "expiresAt":..., "sessionId":"...", "model":"...", "requestId":"..."}
# Tool Used: cURL with POST request and JSON payload
# Purpose: Verify OpenAI Realtime API integration working
# Critical: This endpoint enables all voice chat functionality
```

### **API Proxy Testing:**
```bash
# Test AI proxy endpoint
curl -X POST http://145.79.10.35:3001/api/ai-proxy \
  -H "Content-Type: application/json" \
  -H "Origin: https://bear-beige.vercel.app" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, test message"}
    ]
  }'

# Tool Used: cURL with AI proxy endpoint
# Purpose: Test text AI integration
# Expected: AI response from configured model
```

---

## 📊 MONITORING & DIAGNOSTICS

### **System Resource Monitoring:**
```bash
# Check CPU and memory usage
docker stats limi-ai-backend

# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node

# Tool Used: Docker stats and Linux system commands
# Purpose: Monitor VPS resource utilization
# Alerts: Watch for high CPU/memory usage
```

### **Network Connectivity:**
```bash
# Test internet connectivity
ping google.com

# Test OpenAI API connectivity
curl -s https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY" | head -50

# Test MQTT broker connectivity
telnet mqtt.limilighting.com 1883

# Tool Used: ping, cURL, telnet
# Purpose: Verify external service connectivity
# Critical: OpenAI and MQTT must be reachable
```

### **Log Analysis:**
```bash
# View recent backend logs
docker logs --tail 100 limi-ai-backend

# Search for errors in logs
docker logs limi-ai-backend 2>&1 | grep -i error

# Monitor live logs with timestamps
docker logs -f --timestamps limi-ai-backend

# Filter logs by level
docker logs limi-ai-backend 2>&1 | grep '"level":"error"'

# Tool Used: Docker logs with grep filtering
# Purpose: Debug issues and monitor application health
# Log Format: Winston structured JSON with timestamps
```

---

## 🔧 DOCKER COMPOSE MANAGEMENT

### **Multi-Service Stack:**
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart limi-ai-backend

# View service logs
docker-compose logs limi-ai-backend

# Tool Used: Docker Compose
# Purpose: Orchestrate multiple related containers
# Services: Backend, Caddy proxy, MCP servers
```

### **Service Status:**
```bash
# Check all services status
docker-compose ps

# View service configuration
docker-compose config

# Scale services (if needed)
docker-compose up -d --scale limi-ai-backend=2

# Tool Used: Docker Compose management commands
# Purpose: Multi-container application management
# Configuration: docker-compose.yml in project root
```

---

## 🔒 ENVIRONMENT & CONFIGURATION

### **Environment Variables:**
```bash
# View backend environment (secure)
docker exec limi-ai-backend env | grep -v API_KEY

# Check environment file
cat /root/limi-ai-backend/.env | grep -v API_KEY

# Update environment variables
nano /root/limi-ai-backend/.env

# Tool Used: Docker exec and file editors
# Purpose: Manage backend configuration
# Security: Never expose API keys in logs
```

### **Configuration Files:**
```bash
# View backend package.json
docker exec limi-ai-backend cat package.json

# Check Node.js version
docker exec limi-ai-backend node --version

# View application structure
docker exec limi-ai-backend ls -la /app

# Tool Used: Docker exec for container inspection
# Purpose: Verify backend application configuration
# Structure: Express.js app with middleware and routes
```

---

## 🚨 TROUBLESHOOTING COMMANDS

### **Backend Not Responding:**
```bash
# Check if container is running
docker ps | grep limi-ai-backend

# If not running, check why it stopped
docker logs limi-ai-backend --tail 50

# Check for port conflicts
netstat -tulpn | grep 3001

# Restart container
docker restart limi-ai-backend

# Tool Used: Docker diagnostics and netstat
# Purpose: Diagnose and resolve backend issues
# Common Issues: Port conflicts, environment errors, API key issues
```

### **OpenAI API Issues:**
```bash
# Test OpenAI connectivity from container
docker exec limi-ai-backend curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | head -20

# Check OpenAI API key validity
docker exec limi-ai-backend node -e "
  const openai = require('openai');
  const client = new openai.OpenAI();
  client.models.list().then(console.log).catch(console.error);
"

# Tool Used: Docker exec with Node.js and cURL
# Purpose: Verify OpenAI API integration from backend
# Debugging: Check API key validity and network access
```

### **MQTT Integration Issues:**
```bash
# Test MQTT broker connection
docker exec limi-ai-backend node -e "
  const mqtt = require('mqtt');
  const client = mqtt.connect('mqtt://mqtt.limilighting.com:1883', {
    username: 'mcp',
    password: 'mcp'
  });
  client.on('connect', () => {
    console.log('MQTT connected');
    client.publish('test', 'Hello from backend');
    client.end();
  });
"

# Tool Used: Docker exec with Node.js MQTT client
# Purpose: Verify MQTT broker connectivity for room controls
# Testing: Publish test message to verify connection
```

---

## 🔄 DEPLOYMENT & UPDATES

### **Backend Code Deployment:**
```bash
# Full deployment process
cd /root/limi-ai-backend

# 1. Backup current version
docker tag limi-ai-backend limi-ai-backend:backup-$(date +%Y%m%d)

# 2. Pull latest code
git pull origin main

# 3. Build new image
docker build -t limi-ai-backend:latest .

# 4. Stop current container
docker stop limi-ai-backend

# 5. Remove old container
docker rm limi-ai-backend

# 6. Deploy new version
docker run -d \
  --name limi-ai-backend \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env \
  limi-ai-backend:latest

# 7. Verify deployment
sleep 10
curl http://localhost:3001/healthz

# Tool Used: Complete Docker deployment pipeline
# Purpose: Zero-downtime backend updates
# Rollback: Use backup image if deployment fails
```

### **Environment Updates:**
```bash
# Update environment variables
nano /root/limi-ai-backend/.env

# Restart to apply changes
docker restart limi-ai-backend

# Verify new configuration
docker logs limi-ai-backend --tail 20

# Tool Used: File editor and Docker restart
# Purpose: Update backend configuration without rebuild
# Variables: OPENAI_API_KEY, MQTT credentials, CORS settings
```

---

## 🔍 BACKEND ARCHITECTURE DETAILS

### **Container Structure:**
```bash
# View container details
docker inspect limi-ai-backend

# Check exposed ports
docker port limi-ai-backend

# View mounted volumes
docker inspect limi-ai-backend | jq '.[0].Mounts'

# Tool Used: Docker inspect command
# Purpose: Understand container configuration
# Ports: 3001 (HTTP API), potential MQTT ports
```

### **Application Structure:**
```bash
# View backend application files
docker exec limi-ai-backend find /app -name "*.js" -type f

# Check route definitions
docker exec limi-ai-backend cat /app/src/routes/openai.js | head -30

# View middleware configuration
docker exec limi-ai-backend cat /app/src/app.js | head -50

# Tool Used: Docker exec with file system commands
# Purpose: Understand backend application structure
# Key Files: app.js (main), routes/ (endpoints), middleware/ (security)
```

---

## 📈 PERFORMANCE MONITORING

### **Real-time Monitoring:**
```bash
# Monitor container performance
docker stats limi-ai-backend --no-stream

# Monitor network connections
docker exec limi-ai-backend netstat -tulpn

# Monitor active processes
docker exec limi-ai-backend ps aux

# Tool Used: Docker stats and container process monitoring
# Purpose: Track backend performance and resource usage
# Metrics: CPU%, memory usage, network I/O
```

### **Load Testing:**
```bash
# Test backend under load (be careful!)
for i in {1..10}; do
  curl -s http://145.79.10.35:3001/healthz &
done
wait

# Monitor response times
time curl http://145.79.10.35:3001/api/client-secret \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"load-test","model":"gpt-4o-realtime-preview","voice":"alloy","instructions":"test"}'

# Tool Used: Bash loops and time command
# Purpose: Verify backend can handle concurrent requests
# Caution: Don't overload production backend
```

---

## 🔧 MAINTENANCE COMMANDS

### **Backend Maintenance:**
```bash
# Clean up unused Docker images
docker image prune -f

# Clean up stopped containers
docker container prune -f

# View disk usage
docker system df

# Clean up everything (DANGEROUS - use carefully)
docker system prune -f

# Tool Used: Docker cleanup commands
# Purpose: Maintain VPS disk space and performance
# Caution: Prune commands remove unused resources permanently
```

### **Log Rotation:**
```bash
# Check log file sizes
docker exec limi-ai-backend du -sh /app/logs/*

# Rotate logs (if log files exist)
docker exec limi-ai-backend find /app/logs -name "*.log" -mtime +7 -delete

# Configure log rotation
docker exec limi-ai-backend cat /etc/logrotate.d/docker

# Tool Used: File system commands and logrotate
# Purpose: Prevent log files from filling disk space
# Rotation: Automatic cleanup of old log files
```

---

## 🌐 NETWORK & CONNECTIVITY

### **Port Management:**
```bash
# Check what's listening on port 3001
netstat -tulpn | grep 3001

# Test port accessibility from outside
curl -I http://145.79.10.35:3001/healthz

# Check firewall status
ufw status

# Tool Used: netstat, cURL, UFW firewall
# Purpose: Verify network configuration and accessibility
# Ports: 3001 (backend API), 22 (SSH), 80/443 (Caddy proxy)
```

### **DNS & Domain Testing:**
```bash
# Test domain resolution
nslookup srv1000332.hstgr.cloud

# Test HTTPS access through Caddy
curl -I https://srv1000332.hstgr.cloud/api/client-secret

# Check Caddy proxy status
docker ps | grep caddy

# Tool Used: nslookup, cURL with HTTPS
# Purpose: Verify domain and proxy configuration
# Proxy: Caddy handles HTTPS and routes to backend
```

---

## 🔐 SECURITY & ACCESS CONTROL

### **SSL/TLS Configuration:**
```bash
# Check SSL certificate status
docker exec caddy cat /data/caddy/certificates/local/srv1000332.hstgr.cloud.crt

# View Caddy configuration
docker exec caddy cat /etc/caddy/Caddyfile

# Test SSL connectivity
openssl s_client -connect srv1000332.hstgr.cloud:443 -servername srv1000332.hstgr.cloud

# Tool Used: OpenSSL and Caddy inspection
# Purpose: Verify HTTPS security configuration
# Certificates: Automatically managed by Caddy
```

### **Access Control:**
```bash
# Check CORS configuration
docker exec limi-ai-backend cat /app/src/middleware/cors.js

# View rate limiting settings
docker exec limi-ai-backend cat /app/src/middleware/rateLimiter.js

# Check authentication middleware
docker exec limi-ai-backend cat /app/src/middleware/auth.js

# Tool Used: Docker exec with file inspection
# Purpose: Verify security middleware configuration
# Security: CORS, rate limiting, input validation
```

---

## 🔍 DEBUGGING & DIAGNOSTICS

### **Application Debugging:**
```bash
# Enter container for debugging
docker exec -it limi-ai-backend /bin/bash

# Check Node.js process
docker exec limi-ai-backend ps aux | grep node

# Test internal endpoints
docker exec limi-ai-backend curl http://localhost:3001/healthz

# Check environment variables (safe ones)
docker exec limi-ai-backend printenv | grep -v API_KEY

# Tool Used: Docker exec with interactive shell
# Purpose: Debug issues from inside the container
# Safety: Never expose API keys in debugging
```

### **Database Connectivity (if applicable):**
```bash
# Test database connection from backend
docker exec limi-ai-backend node -e "
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error(err);
    else console.log('DB connected:', res.rows[0]);
    pool.end();
  });
"

# Tool Used: Docker exec with Node.js database test
# Purpose: Verify database connectivity from backend
# Database: PostgreSQL connection testing
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### **Backend Performance Tuning:**
```bash
# Check Node.js memory usage
docker exec limi-ai-backend node -e "console.log(process.memoryUsage())"

# Monitor API response times
time curl http://145.79.10.35:3001/api/client-secret \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"perf-test","model":"gpt-4o-realtime-preview","voice":"alloy","instructions":"test"}'

# Check concurrent connections
docker exec limi-ai-backend netstat -an | grep :3001 | wc -l

# Tool Used: Node.js memory monitoring and connection counting
# Purpose: Optimize backend performance
# Metrics: Memory usage, response times, concurrent connections
```

---

## 🆘 EMERGENCY PROCEDURES

### **Backend Down - Quick Recovery:**
```bash
# 1. Check if container exists
docker ps -a | grep limi-ai-backend

# 2. If stopped, restart
docker start limi-ai-backend

# 3. If failed, check logs
docker logs limi-ai-backend --tail 50

# 4. If corrupted, redeploy
docker stop limi-ai-backend
docker rm limi-ai-backend
docker run -d --name limi-ai-backend --restart unless-stopped -p 3001:3001 --env-file .env limi-ai-backend

# 5. Verify recovery
curl http://145.79.10.35:3001/healthz

# Tool Used: Emergency recovery procedure
# Purpose: Restore voice chat functionality quickly
# Impact: Voice chat unavailable until backend restored
```

### **Complete System Reset:**
```bash
# DANGEROUS - Only use if everything is broken
docker stop $(docker ps -q)
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)

# Redeploy from scratch
cd /root
git clone https://github.com/UA-LIMI/bear.git
cd bear/backend
docker build -t limi-ai-backend .
docker run -d --name limi-ai-backend --restart unless-stopped -p 3001:3001 --env-file .env limi-ai-backend

# Tool Used: Complete Docker reset and redeploy
# Purpose: Nuclear option for complete system recovery
# WARNING: This destroys all containers and data
```

---

## 📋 BACKEND CONFIGURATION REFERENCE

### **Key Environment Variables:**
```bash
# Required for OpenAI integration:
OPENAI_API_KEY=sk-...                    # OpenAI API access
AI_GATEWAY_API_KEY=your_vercel_key       # Vercel AI Gateway

# CORS and security:
FRONTEND_URL=https://bear-beige.vercel.app
ALLOWED_ORIGINS=https://bear-beige.vercel.app

# MQTT integration:
MQTT_BROKER_URL=mqtt://mqtt.limilighting.com:1883
MQTT_USERNAME=mcp
MQTT_PASSWORD=mcp

# Tool Used: Environment variable configuration
# Purpose: Backend service integration
# Security: Store in .env file, never in code
```

### **Critical Endpoints:**
- **`/healthz`** - Basic health check (always test first)
- **`/api/client-secret`** - OpenAI ephemeral keys (critical for voice)
- **`/api/ai-proxy`** - Text AI integration
- **`/readyz`** - Comprehensive readiness check
- **`/live`** - Liveness probe for monitoring

---

## 🎯 BACKEND STATUS SUMMARY

### **✅ Currently Working:**
- **Health endpoint** - Basic availability confirmed
- **OpenAI integration** - Ephemeral key generation working
- **Vercel proxy** - Frontend to backend communication working
- **Docker deployment** - Container running stable

### **❌ Issues Identified:**
- **Status endpoint** - Returning internal server error
- **MQTT connectivity** - Not verified with actual devices
- **Conversation storage** - Not implemented

### **🔧 Maintenance Schedule:**
- **Daily:** Check health endpoints and logs
- **Weekly:** Monitor resource usage and performance
- **Monthly:** Update dependencies and security patches
- **As needed:** Deploy code updates and configuration changes

---

**This VPS backend is the critical infrastructure enabling voice AI functionality across the entire LIMI AI x Hotels platform. Proper monitoring and maintenance ensure reliable hotel guest experiences.**
