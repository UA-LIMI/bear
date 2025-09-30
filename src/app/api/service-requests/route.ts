import { NextRequest } from 'next/server';

const getSupabaseAdmin = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(url, serviceKey);
};

const normalizePriority = (value: unknown): 'low' | 'normal' | 'high' | 'urgent' => {
  const allowed = new Set(['low', 'normal', 'high', 'urgent']);
  if (typeof value === 'string' && allowed.has(value)) {
    return value as 'low' | 'normal' | 'high' | 'urgent';
  }
  return 'normal';
};

const normalizeStatus = (value: unknown): 'pending' | 'in_progress' | 'completed' | 'cancelled' => {
  const allowed = new Set(['pending', 'in_progress', 'completed', 'cancelled']);
  if (typeof value === 'string' && allowed.has(value)) {
    return value as 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }
  return 'pending';
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const guestId = searchParams.get('guestId');
    const roomNumber = searchParams.get('roomNumber');
    const status = searchParams.get('status');
    const includeHistory = searchParams.get('includeHistory') !== 'false';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 25, 100) : 25;

    let query = supabase
      .from('service_requests')
      .select(
        includeHistory
          ? '*, service_request_updates(*)'
          : '*'
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (guestId) {
      query = query.eq('guest_id', guestId);
    }

    if (roomNumber) {
      query = query.eq('room_number', roomNumber);
    }

    if (status) {
      query = query.eq('status', normalizeStatus(status));
    }

    if (includeHistory) {
      query = query.order('added_at', { ascending: false, foreignTable: 'service_request_updates' });
    }

    const { data, error } = await query;

    if (error) {
      console.error('service-requests GET error:', error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, requests: data ?? [] });
  } catch (error) {
    console.error('service-requests GET unexpected error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload !== 'object') {
      return Response.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
    if (summary.length < 12) {
      return Response.json({ success: false, error: 'Summary must be at least 12 characters' }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    const insertPayload = {
      guest_id: typeof payload.guestId === 'string' ? payload.guestId : null,
      room_number: typeof payload.roomNumber === 'string' ? payload.roomNumber : null,
      request_type: typeof payload.requestType === 'string' ? payload.requestType : null,
      summary,
      priority: normalizePriority(payload.priority),
      status: normalizeStatus(payload.status),
      eta: typeof payload.eta === 'string' ? payload.eta : null,
      created_by: payload.createdBy === 'staff' ? 'staff' : 'agent',
      metadata:
        payload.metadata && typeof payload.metadata === 'object'
          ? payload.metadata
          : {},
    };

    const { data, error } = await supabase
      .from('service_requests')
      .insert(insertPayload)
      .select('*, service_request_updates(*)')
      .single();

    if (error) {
      console.error('service-requests POST error:', error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, request: data }, { status: 201 });
  } catch (error) {
    console.error('service-requests POST unexpected error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
