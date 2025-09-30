# MCP Service Request Tool Deployment

## Authentication
- **Auth token:** `limi-mcp-service-2025`
- Set it via environment variable when running the container:
  ```bash
  -e MCP_AUTH_TOKEN="limi-mcp-service-2025"
  ```

## Required Environment Variables
- `SERVICE_REQUEST_API_BASE=https://bear-beige.vercel.app/api`
- `SERVICE_REQUEST_API_KEY` *(optional; only if the API enforces bearer auth)*

## Docker Commands
```bash
cd /root/backend/mcp

# Build image
docker build -t service-request-mcp .

# Restart container with new image
docker stop service-request-mcp 2>/dev/null || true
docker rm service-request-mcp 2>/dev/null || true

docker run -d \
  --name service-request-mcp \
  --restart unless-stopped \
  -p 4000:8080 \
  -e SERVICE_REQUEST_API_BASE="https://bear-beige.vercel.app/api" \
  -e MCP_AUTH_TOKEN="limi-mcp-service-2025" \
  service-request-mcp
```

## Verification
```bash
curl http://localhost:4000/health
curl -H "Authorization: Bearer limi-mcp-service-2025" http://localhost:4000/tools
```
