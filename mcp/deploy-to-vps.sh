#!/bin/bash

# Deploy Updated MCP Server to VPS
# This script helps you deploy the service request MCP server with tool call support

echo "🚀 MCP Server Deployment Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Please run this script from the /mcp directory"
    exit 1
fi

echo "📋 This will:"
echo "  1. Copy updated server.js to VPS"
echo "  2. Rebuild Docker image"
echo "  3. Restart container with new code"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

VPS_HOST="root@145.79.10.35"
VPS_PATH="/root/backend/mcp"

echo ""
echo "Step 1: Copying server.js to VPS..."
scp server.js package.json Dockerfile ${VPS_HOST}:${VPS_PATH}/

echo ""
echo "Step 2: Rebuilding and restarting on VPS..."
ssh ${VPS_HOST} << 'EOF'
    cd /root/backend/mcp
    
    echo "Stopping existing container..."
    docker stop service-request-mcp 2>/dev/null || true
    docker rm service-request-mcp 2>/dev/null || true
    
    echo "Building new image..."
    docker build -t service-request-mcp .
    
    echo "Starting new container..."
    docker run -d \
      --name service-request-mcp \
      --restart unless-stopped \
      -p 4000:8080 \
      -e SERVICE_REQUEST_API_BASE="https://bear-beige.vercel.app/api" \
      -e MCP_AUTH_TOKEN="limi-mcp-service-2025" \
      service-request-mcp
    
    echo ""
    echo "Waiting for container to start..."
    sleep 3
    
    echo ""
    echo "Container status:"
    docker ps | grep service-request-mcp
    
    echo ""
    echo "Health check:"
    curl -s http://localhost:4000/health | python3 -m json.tool
EOF

echo ""
echo "Step 3: Testing from external network..."
curl -s http://145.79.10.35:4000/health

echo ""
echo "Step 4: Checking tools endpoint..."
curl -s -H "Authorization: Bearer limi-mcp-service-2025" \
  http://145.79.10.35:4000/tools | \
  grep -E "name|description" | head -6

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 To test:"
echo "  1. Open: https://bear-beige.vercel.app/guest"
echo "  2. Select a guest"
echo "  3. Connect voice"
echo "  4. Say: 'I'd like a margherita pizza'"
echo "  5. Check database for new request"
echo ""

