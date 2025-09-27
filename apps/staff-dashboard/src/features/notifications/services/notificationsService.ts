import type { Notification } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToNotifications,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getNotificationsFixture } from '@/lib/fixtures';

export const fetchNotifications = async (): Promise<Notification[]> => {
  if (!isSupabaseConfigured()) {
    return getNotificationsFixture();
  }

  const client = getSupabaseClient();
  if (!client) {
    return getNotificationsFixture();
  }

  const { data, error } = await client
    .from('notifications')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Notification[];
};

export const registerNotificationSubscription = (
  onNotification: (notification: Notification) => void,
): SubscriptionCleanup | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  return subscribeToNotifications(client, onNotification);
};
