import type { Notification } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToNotifications,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getNotificationsFixture } from '@/lib/fixtures';

interface NotificationRow {
  id: string;
  type: string | null;
  title: string | null;
  message: string | null;
  timestamp: string | null;
  read: boolean | null;
  request_id: string | null;
  room_number: string | null;
  guest_id: string | null;
  sender: string | null;
  created_at: string | null;
}

const mapNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  type: row.type ?? 'general',
  title: row.title ?? 'Notification',
  message: row.message ?? '',
  timestamp: row.timestamp ?? row.created_at ?? new Date().toISOString(),
  read: row.read ?? false,
  requestId: row.request_id,
  roomNumber: row.room_number,
  guestId: row.guest_id,
  sender: row.sender ?? 'system',
  created_at: row.created_at ?? null,
});

const isNotificationRow = (payload: unknown): payload is NotificationRow => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const record = payload as Partial<NotificationRow>;
  return typeof record.id === 'string';
};

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
    .select(
      'id, type, title, message, timestamp, read, request_id, room_number, guest_id, sender, created_at'
    )
    .order('timestamp', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(row => mapNotification(row as NotificationRow));
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

  return subscribeToNotifications(client, payload => {
    if (!isNotificationRow(payload)) {
      return;
    }

    onNotification(mapNotification(payload));
  });
};
