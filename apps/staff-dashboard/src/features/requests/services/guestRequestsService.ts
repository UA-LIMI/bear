import type { ServiceRequest, ServiceRequestRow, ServiceRequestUpdateRow } from '@/lib/types/serviceRequests';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToServiceRequests,
  subscribeToServiceRequestUpdates,
  type SubscriptionCleanup,
} from '@/lib/supabase';

const mapUpdate = (row: ServiceRequestUpdateRow) => ({
  ...row,
  metadata: row.metadata ?? {},
});

const mapRequest = (row: ServiceRequestRow): ServiceRequest => {
  const updates = (row.service_request_updates ?? []).map(mapUpdate).sort(
    (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime(),
  );

  return {
    id: row.id,
    guestId: row.guest_id,
    guestName: row.profiles?.display_name ?? row.profiles?.username ?? null,
    roomNumber: row.room_number,
    requestType: row.request_type,
    summary: row.summary,
    status: row.status,
    priority: row.priority,
    eta: row.eta,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: row.metadata ?? {},
    updates,
    latestUpdate: updates[0] ?? null,
    assignedStaff: row.assigned_staff ?? null,
    aiSummary: row.ai_summary ?? null,
    source: row.source ?? null,
    resolvedAt: row.resolved_at ?? null,
    followUp: row.follow_up ?? {},
    scheduled: row.scheduled ?? false,
    scheduledFor: row.scheduled_for ?? null,
    lastReviewerId: row.last_reviewer_id ?? null,
  };
};

const fetchRequestById = async (id: string): Promise<ServiceRequest | null> => {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('service_requests')
    .select('*, profiles(display_name, username), service_request_updates(*)')
    .eq('id', id)
    .limit(1)
    .single();

  if (error) {
    console.error('fetchRequestById error', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapRequest(data as ServiceRequestRow);
};

export const fetchServiceRequests = async (): Promise<ServiceRequest[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from('service_requests')
    .select('*, profiles(display_name, username), service_request_updates(*)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return (data ?? []).map(row => mapRequest(row as ServiceRequestRow));
};

export const registerServiceRequestSubscription = (
  onRequest: (request: ServiceRequest) => void,
): SubscriptionCleanup | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const handleChange = async (record: Record<string, unknown>) => {
    const id = typeof record.id === 'string' ? record.id : null;
    if (!id) {
      return;
    }

    const latest = await fetchRequestById(id);
    if (latest) {
      onRequest(latest);
    }
  };

  const requestCleanup = subscribeToServiceRequests(client, async payload => {
    await handleChange(payload);
  });

  const updatesCleanup = subscribeToServiceRequestUpdates(client, async payload => {
    const requestId = typeof payload.request_id === 'string' ? payload.request_id : null;
    if (!requestId) {
      return;
    }

    const latest = await fetchRequestById(requestId);
    if (latest) {
      onRequest(latest);
    }
  });

  return () =>
    Promise.all([requestCleanup?.(), updatesCleanup?.()])
      .then(() => 'ok' as const)
      .catch(() => 'error' as const);
};
