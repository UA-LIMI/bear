import type { TypedSupabaseClient } from './client';
import type { GuestRequest, Room, Notification } from '@/lib/types/supabase';

type UnsubscribeResult = Promise<'ok' | 'timed out' | 'error'>;

export type SubscriptionCleanup = () => UnsubscribeResult;

const channelKey = (table: string) => `public:${table}`;

export const subscribeToGuestRequests = (
  client: TypedSupabaseClient,
  handler: (payload: GuestRequest) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('guest_requests'))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guest_requests' }, payload => {
      const record = payload.new as GuestRequest | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToRoomUpdates = (
  client: TypedSupabaseClient,
  handler: (payload: Room) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('rooms'))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, payload => {
      const record = payload.new as Room | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToNotifications = (
  client: TypedSupabaseClient,
  handler: (payload: Notification) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('notifications'))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      payload => {
        const record = payload.new as Notification | null;
        if (record) {
          handler(record);
        }
      }
    )
    .subscribe();

  return () => channel.unsubscribe();
};
