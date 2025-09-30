import { NextRequest, NextResponse } from 'next/server';

const VPS_BACKEND_URL = 'http://145.79.10.35:3001';
const SERVICE_REQUEST_MCP_URL = process.env.SERVICE_REQUEST_MCP_URL ?? 'http://145.79.10.35:4000';
const SERVICE_REQUEST_MCP_TOKEN = process.env.SERVICE_REQUEST_MCP_TOKEN ?? 'limi-mcp-service-2025';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 VERCEL API: Proxying client-secret request to VPS backend');
    console.log('🔗 VERCEL API: VPS URL:', VPS_BACKEND_URL);
    
    // Get the request body
    const body = await request.json();
    console.log('🔗 VERCEL API: Request body:', body);

    // Forward request to VPS backend
    const response = await fetch(`${VPS_BACKEND_URL}/api/client-secret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bear-beige.vercel.app', // Set correct origin for CORS
      },
      body: JSON.stringify(body),
    });

    console.log('🔗 VERCEL API: VPS response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔗 VERCEL API: VPS error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('🔗 VERCEL API: Success! Proxied token from VPS');

    const existingMcpServers = Array.isArray(data?.mcpServers) ? data.mcpServers : [];
    const serviceRequestMcp = {
      name: 'service-request-mcp',
      label: 'service-request-mcp',
      url: SERVICE_REQUEST_MCP_URL,
      authorization: SERVICE_REQUEST_MCP_TOKEN ? `Bearer ${SERVICE_REQUEST_MCP_TOKEN}` : undefined,
    };

    const payload = {
      ...data,
      mcpServers: [
        ...existingMcpServers.filter(
          (server: { url?: string; label?: string }) =>
            server?.url !== serviceRequestMcp.url && server?.label !== serviceRequestMcp.label
        ),
        serviceRequestMcp,
      ],
    };

    return NextResponse.json(payload);

  } catch (error) {
    console.error('🔗 VERCEL API: Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy Error', 
        message: 'Failed to connect to backend service',
        code: 'proxy_error'
      }, 
      { status: 500 }
    );
  }
}
