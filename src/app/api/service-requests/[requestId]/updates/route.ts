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

const normalizeStatus = (value: unknown): 'pending' | 'in_progress' | 'completed' | 'cancelled' | null => {
  const allowed = new Set(['pending', 'in_progress', 'completed', 'cancelled']);
  if (typeof value === 'string' && allowed.has(value)) {
    return value as 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }
  return null;
};

const ParamsSchema = z.object({ requestId: z.string().min(1) });

export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
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

    const note = typeof payload.note === 'string' ? payload.note.trim() : null;
    const status = normalizeStatus(payload.status);
    const visibleToGuest = typeof payload.visibleToGuest === 'boolean' ? payload.visibleToGuest : true;
    const staffProfileId = typeof payload.staffProfileId === 'string' ? payload.staffProfileId : null;
    const authorType = payload.authorType === 'staff' || payload.authorType === 'system' ? payload.authorType : 'agent';

    if (!note && !status) {
      return Response.json(
        { success: false, error: 'At least a note or status is required' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdmin();

    const { data, error } = await supabase
      .from('service_request_updates')
      .insert({
        request_id: requestId,
        note,
        status,
        visible_to_guest: visibleToGuest,
        staff_profile_id: staffProfileId,
        author_type: authorType,
        metadata:
          payload.metadata && typeof payload.metadata === 'object'
            ? payload.metadata
            : {},
      })
      .select('*')
      .single();

    if (error) {
      console.error('service-request update POST error:', error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    if (status) {
      const { error: statusError } = await supabase
        .from('service_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (statusError) {
        console.error('service-request update status sync error:', statusError);
      }
    }

    return Response.json({ success: true, update: data });
  } catch (error) {
    console.error('service-request update POST unexpected error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
