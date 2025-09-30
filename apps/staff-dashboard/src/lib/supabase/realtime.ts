import type { TypedSupabaseClient } from './client';

type UnsubscribeResult = Promise<'ok' | 'timed out' | 'error'>;

export type SubscriptionCleanup = () => UnsubscribeResult;

const channelKey = (table: string) => `public:${table}`;

export const subscribeToGuestRequests = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('guest_requests'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_requests' }, payload => {
      const record = payload.new as Record<string, unknown> | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToServiceRequests = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('service_requests'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, payload => {
      const record = payload.new as Record<string, unknown> | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToServiceRequestUpdates = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('service_request_updates'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_request_updates' }, payload => {
      const record = payload.new as Record<string, unknown> | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToRoomUpdates = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('rooms'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, payload => {
      const record = payload.new as Record<string, unknown> | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToNotifications = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('notifications'))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      payload => {
        const record = payload.new as Record<string, unknown> | null;
        if (record) {
          handler(record);
        }
      }
    )
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToGuestProfiles = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('guest_profiles'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_profiles' }, payload => {
      const record = payload.new as Record<string, unknown> | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToStaffProfiles = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('staff_profiles'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_profiles' }, payload => {
      const record = payload.new as Record<string, unknown> | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToMenuItems = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('menu_items'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, payload => {
      const record = payload.new as Record<string, unknown> | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};

export const subscribeToKnowledgeBase = (
  client: TypedSupabaseClient,
  handler: (payload: Record<string, unknown>) => void
): SubscriptionCleanup => {
  const channel = client
    .channel(channelKey('knowledge_base'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'knowledge_base' }, payload => {
      const record = payload.new as Record<string, unknown> | null;
      if (record) {
        handler(record);
      }
    })
    .subscribe();

  return () => channel.unsubscribe();
};
