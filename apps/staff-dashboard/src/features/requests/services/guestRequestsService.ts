import type { Database, GuestRequest, GuestRequestMessage } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToGuestRequests,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getGuestRequestsFixture } from '@/lib/fixtures';

type GuestRequestRow = Database['public']['Tables']['guest_requests']['Row'];

const parseConversation = (conversation: GuestRequestRow['conversation']): GuestRequestMessage[] => {
  if (!Array.isArray(conversation)) {
    return [];
  }

  return conversation
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const sender = record.sender;
      const message = record.message;
      const timestamp = record.timestamp;

      if (
        (sender === 'guest' || sender === 'staff') &&
        typeof message === 'string' &&
        typeof timestamp === 'string'
      ) {
        return {
          sender,
          message,
          timestamp,
        } satisfies GuestRequestMessage;
      }

      return null;
    })
    .filter((item): item is GuestRequestMessage => item !== null);
};

const mapGuestRequest = (row: GuestRequestRow): GuestRequest => ({
  id: row.id,
  roomNumber: row.room_number ?? '—',
  guestName: row.guest_name ?? 'Guest',
  guestId: row.guest_id,
  type: row.request_type ?? 'general',
  status: (row.status as GuestRequest['status']) ?? 'pending',
  priority: (row.priority as GuestRequest['priority']) ?? 'normal',
  timestamp: row.timestamp ?? row.created_at ?? new Date().toISOString(),
  message: row.message ?? '',
  scheduled: row.scheduled ?? false,
  scheduledFor: row.scheduled_for ?? null,
  assignedStaff: row.assigned_staff ?? null,
  aiSuggestion: row.ai_suggestion ?? null,
  conversation: parseConversation(row.conversation),
  created_at: row.created_at ?? null,
  updated_at: row.updated_at ?? null,
});

const isGuestRequestRow = (payload: unknown): payload is GuestRequestRow => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const record = payload as Partial<GuestRequestRow>;
  return typeof record.id === 'string';
};

export const fetchGuestRequests = async (): Promise<GuestRequest[]> => {
  if (!isSupabaseConfigured()) {
    return getGuestRequestsFixture();
  }

  const client = getSupabaseClient();
  if (!client) {
    return getGuestRequestsFixture();
  }

  const { data, error } = await client
    .from('guest_requests')
    .select(
      'id, guest_id, room_number, guest_name, request_type, status, priority, message, conversation, scheduled, scheduled_for, assigned_staff, ai_suggestion, created_at, updated_at, timestamp'
    )
    .order('timestamp', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapGuestRequest);
};

export const registerGuestRequestSubscription = (
  onRequest: (request: GuestRequest) => void,
): SubscriptionCleanup | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  return subscribeToGuestRequests(client, payload => {
    if (!isGuestRequestRow(payload)) {
      return;
    }

    onRequest(mapGuestRequest(payload));
  });
};
