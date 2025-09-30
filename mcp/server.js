import express from 'express';

const {
  MCP_PORT = 8080,
  MCP_AUTH_TOKEN,
  SERVICE_REQUEST_API_BASE,
  SERVICE_REQUEST_API_KEY,
} = process.env;

if (!SERVICE_REQUEST_API_BASE) {
  console.warn('[MCP] SERVICE_REQUEST_API_BASE is not set. Tool calls will fail until configured.');
}

const app = express();
app.use(express.json());

const requireAuth = (req, res, next) => {
  if (!MCP_AUTH_TOKEN) {
    return next();
  }

  const header = req.headers.authorization;
  if (!header || header !== `Bearer ${MCP_AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'service-request-mcp' });
});

app.get('/tools', requireAuth, (_req, res) => {
  res.json([
    {
      name: 'create_service_request',
      description:
        'Create a new guest service request in Supabase. Use when the guest asks for assistance (e.g., taxis, amenities, reservations).',
      input_schema: {
        type: 'object',
        properties: {
          guestId: { type: ['string', 'null'], description: 'Supabase profile UUID for the guest, if available.' },
          roomNumber: { type: ['string', 'null'], description: 'Room number associated with the guest.' },
          requestType: { type: ['string', 'null'], description: 'Category such as taxi, housekeeping, dining.' },
          summary: { type: 'string', description: 'Clear staff-facing summary of the request.' },
          priority: {
            type: 'string',
            enum: ['low', 'normal', 'high', 'urgent'],
            description: 'Optional priority. Defaults to normal.',
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed', 'cancelled'],
            description: 'Initial status. Defaults to pending.',
          },
          eta: { type: ['string', 'null'], description: 'ISO timestamp for ETA if known.' },
          createdBy: {
            type: 'string',
            enum: ['agent', 'staff'],
            description: 'Who is creating the request. Defaults to agent.',
          },
          metadata: {
            type: 'object',
            description: 'Additional structured metadata (transport details, party size, etc.).',
          },
        },
        required: ['summary'],
        additionalProperties: false,
      },
    },
    {
      name: 'get_service_requests',
      description:
        'Fetch recent service requests for a guest or room. Use when a guest asks for status updates or history.',
      input_schema: {
        type: 'object',
        properties: {
          guestId: { type: ['string', 'null'], description: 'Supabase profile UUID for the guest.' },
          roomNumber: { type: ['string', 'null'], description: 'Guest room number.' },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed', 'cancelled'],
            description: 'Optional filter by status.',
          },
          includeHistory: {
            type: 'boolean',
            description: 'If true, include historical completed/cancelled items. Defaults to false.',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            description: 'Number of requests to return. Defaults to 10.',
          },
        },
        additionalProperties: false,
      },
    },
  ]);
});

const callApi = async (path, options = {}) => {
  if (!SERVICE_REQUEST_API_BASE) {
    throw new Error('SERVICE_REQUEST_API_BASE not configured');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (SERVICE_REQUEST_API_KEY) {
    headers.Authorization = `Bearer ${SERVICE_REQUEST_API_KEY}`;
  }

  const response = await fetch(`${SERVICE_REQUEST_API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error(`Failed to parse response JSON: ${error.message}`);
  }

  if (!response.ok) {
    const error = new Error(data?.error || 'Upstream error');
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
};

app.post('/tool/create_service_request', requireAuth, async (req, res) => {
  try {
    const { arguments: args } = req.body ?? {};
    if (!args || typeof args !== 'object') {
      return res.status(400).json({ error: 'Missing tool arguments' });
    }

    const payload = {
      guestId: args.guestId ?? null,
      roomNumber: args.roomNumber ?? null,
      requestType: args.requestType ?? null,
      summary: typeof args.summary === 'string' ? args.summary : '',
      priority: args.priority ?? 'normal',
      status: args.status ?? 'pending',
      eta: args.eta ?? null,
      createdBy: args.createdBy ?? 'agent',
      metadata: typeof args.metadata === 'object' && args.metadata !== null ? args.metadata : {},
    };

    if (!payload.summary || payload.summary.length < 12) {
      return res.status(400).json({ error: 'summary must be at least 12 characters' });
    }

    const result = await callApi('/service-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return res.json({ result });
  } catch (error) {
    console.error('[MCP] create_service_request error', error);
    const status = error.status ?? 500;
    res.status(status).json({ error: error.message, details: error.details ?? null });
  }
});

app.post('/tool/get_service_requests', requireAuth, async (req, res) => {
  try {
    const { arguments: args } = req.body ?? {};
    if (!args || typeof args !== 'object') {
      return res.status(400).json({ error: 'Missing tool arguments' });
    }

    const params = new URLSearchParams();
    if (args.guestId) params.append('guestId', args.guestId);
    if (args.roomNumber) params.append('roomNumber', args.roomNumber);
    if (args.status) params.append('status', args.status);
    params.append('includeHistory', args.includeHistory ? 'true' : 'false');
    params.append('limit', args.limit ? String(Math.min(Math.max(args.limit, 1), 50)) : '10');

    const result = await callApi(`/service-requests?${params.toString()}`, {
      method: 'GET',
    });

    return res.json({ result });
  } catch (error) {
    console.error('[MCP] get_service_requests error', error);
    const status = error.status ?? 500;
    res.status(status).json({ error: error.message, details: error.details ?? null });
  }
});

app.use((err, _req, res, _next) => {
  console.error('[MCP] Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(Number(MCP_PORT), () => {
  console.log(`[MCP] Service request MCP server listening on port ${MCP_PORT}`);
});
