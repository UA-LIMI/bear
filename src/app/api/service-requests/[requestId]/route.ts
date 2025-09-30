import { NextRequest } from 'next/server';
import { z } from 'zod';

const getSupabaseAdmin = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(url, serviceKey);
};

const normalizePriority = (value: unknown): 'low' | 'normal' | 'high' | 'urgent' | null => {
  const allowed = new Set(['low', 'normal', 'high', 'urgent']);
  if (typeof value === 'string' && allowed.has(value)) {
    return value as 'low' | 'normal' | 'high' | 'urgent';
  }
  return null;
};

const normalizeStatus = (value: unknown): 'pending' | 'in_progress' | 'completed' | 'cancelled' | null => {
  const allowed = new Set(['pending', 'in_progress', 'completed', 'cancelled']);
  if (typeof value === 'string' && allowed.has(value)) {
    return value as 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }
  return null;
};

const ParamsSchema = z.object({ requestId: z.string().min(1) });

// Next.js generates the `RouteContext` type with `params` as a `Promise`. Rather than importing
// internal typegen helpers, we accept an arbitrary context and validate with Zod.
export async function PATCH(request: NextRequest, context: unknown) {
  try {
    const params = await (context as { params?: Promise<unknown> })?.params;
    const parseResult = ParamsSchema.safeParse(params);
    if (!parseResult.success) {
      return Response.json({ success: false, error: 'Invalid route parameters' }, { status: 400 });
    }

    const { requestId } = parseResult.data;

    if (!requestId) {
      return Response.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload !== 'object') {
      return Response.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    const status = normalizeStatus(payload.status);
    if (status) {
      updates.status = status;
    }

    const priority = normalizePriority(payload.priority);
    if (priority) {
      updates.priority = priority;
    }

    if (typeof payload.eta === 'string' || payload.eta === null) {
      updates.eta = payload.eta;
    }

    if (payload.metadata && typeof payload.metadata === 'object') {
      updates.metadata = payload.metadata;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ success: false, error: 'No valid fields provided to update' }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    const { data, error } = await supabase
      .from('service_requests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select('*, service_request_updates(*)')
      .single();

    if (error) {
      console.error('service-requests PATCH error:', error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, request: data });
  } catch (error) {
    console.error('service-requests PATCH unexpected error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
