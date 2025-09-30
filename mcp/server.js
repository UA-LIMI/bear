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
        'Create a new guest service request in the database. Use when guest requests: food/dining (room service, restaurant reservations), transportation (taxis, car service, airport transfers), housekeeping (cleaning, towels, amenities), concierge services (tickets, tours, information), or maintenance (AC, repairs). Returns confirmation with request ID.',
      input_schema: {
        type: 'object',
        properties: {
          guestId: { type: ['string', 'null'], description: 'Supabase profile UUID for the guest, if available.' },
          roomNumber: { type: ['string', 'null'], description: 'Room number associated with the guest. Important for staff to know which room.' },
          requestType: { type: ['string', 'null'], description: 'Category: "dining", "taxi", "housekeeping", "concierge", "maintenance", or other service type.' },
          summary: { type: 'string', description: 'Clear, detailed summary for staff (minimum 12 characters). Include what guest wants, quantity/details, any time preferences.' },
          priority: {
            type: 'string',
            enum: ['low', 'normal', 'high', 'urgent'],
            description: 'Priority level. Defaults to "normal". Use "urgent" only if guest explicitly expresses urgency or time constraint.',
          },
          metadata: {
            type: 'object',
            description: 'Additional details as JSON: dietary restrictions, party size, destination address, special instructions, etc.',
          },
        },
        required: ['summary'],
        additionalProperties: false,
      },
    },
    {
      name: 'get_service_requests',
      description:
        'Retrieve service requests for a guest or room. Use when guest asks: "Where is my food?", "What about my taxi?", "Did you get my request?", or any status inquiry. Returns list with status (pending/in_progress/completed), priority, timestamps, and any updates from staff.',
      input_schema: {
        type: 'object',
        properties: {
          guestId: { type: ['string', 'null'], description: 'Supabase profile UUID for the guest.' },
          roomNumber: { type: ['string', 'null'], description: 'Room number to find all requests for that room. Use this to check guest\'s requests.' },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed', 'cancelled'],
            description: 'Filter by status. Leave empty to see all active requests (pending + in_progress).',
          },
          includeHistory: {
            type: 'boolean',
            description: 'Set true to include completed/cancelled requests. Default false shows only active requests.',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            description: 'Maximum number of requests to return. Default 10.',
          },
        },
        additionalProperties: false,
      },
    },
    {
      name: 'update_service_request_priority',
      description:
        'Update the priority of an existing service request. Use when: guest asks "Where is my order?" or "What\'s taking so long?" for a request that\'s still pending - escalate to urgent to alert staff that guest is waiting and asking for updates.',
      input_schema: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: 'The UUID of the service request to update (from get_service_requests).' },
          priority: {
            type: 'string',
            enum: ['low', 'normal', 'high', 'urgent'],
            description: 'New priority level. Use "urgent" when guest is actively asking about a pending request.',
          },
        },
        required: ['requestId', 'priority'],
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

app.post('/tool/update_service_request_priority', requireAuth, async (req, res) => {
  try {
    const { arguments: args } = req.body ?? {};
    if (!args || typeof args !== 'object') {
      return res.status(400).json({ error: 'Missing tool arguments' });
    }

    const requestId = typeof args.requestId === 'string' ? args.requestId : null;
    const priority = typeof args.priority === 'string' ? args.priority : null;

    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' });
    }

    if (!priority || !['low', 'normal', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ error: 'priority must be one of: low, normal, high, urgent' });
    }

    const result = await callApi(`/service-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });

    return res.json({ result });
  } catch (error) {
    console.error('[MCP] update_service_request_priority error', error);
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
