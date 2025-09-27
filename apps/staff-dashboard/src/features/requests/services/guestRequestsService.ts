import type { GuestRequest } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToGuestRequests,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getGuestRequestsFixture } from '@/lib/fixtures';

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
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as GuestRequest[];
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

  return subscribeToGuestRequests(client, onRequest);
};
