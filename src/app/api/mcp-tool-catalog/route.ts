import { NextResponse } from 'next/server';

const SERVICE_REQUEST_MCP_URL = process.env.SERVICE_REQUEST_MCP_URL ?? 'http://145.79.10.35:4000';
const SERVICE_REQUEST_MCP_TOKEN = process.env.SERVICE_REQUEST_MCP_TOKEN ?? 'limi-mcp-service-2025';

const SERVICE_REQUEST_MCP_LABEL = 'service-request-mcp';
const SERVICE_REQUEST_MCP_NAME = 'Service Request MCP';

export async function GET() {
  if (!SERVICE_REQUEST_MCP_URL) {
    return NextResponse.json(
      { error: 'SERVICE_REQUEST_MCP_URL is not configured' },
      { status: 500 }
    );
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (SERVICE_REQUEST_MCP_TOKEN) {
      headers.Authorization = `Bearer ${SERVICE_REQUEST_MCP_TOKEN}`;
    }

    const response = await fetch(`${SERVICE_REQUEST_MCP_URL}/tools`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        {
          error: 'Failed to fetch MCP tools',
          status: response.status,
          message: message || response.statusText,
        },
        { status: response.status }
      );
    }

    const tools = (await response.json()) as Array<{
      name: string;
      description?: string;
      input_schema?: unknown;
    }>;

    const formatted = {
      servers: [
        {
          serverLabel: SERVICE_REQUEST_MCP_LABEL,
          serverName: SERVICE_REQUEST_MCP_NAME,
          url: SERVICE_REQUEST_MCP_URL,
          authorization: SERVICE_REQUEST_MCP_TOKEN ? `Bearer ${SERVICE_REQUEST_MCP_TOKEN}` : undefined,
          tools: tools.map((tool) => ({
            name: tool.name,
            title: tool.name.replace(/_/g, ' '),
            description: tool.description ?? 'No description provided.',
          })),
        },
      ],
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Unexpected error fetching MCP tool catalog',
        message,
      },
      { status: 500 }
    );
  }
}
