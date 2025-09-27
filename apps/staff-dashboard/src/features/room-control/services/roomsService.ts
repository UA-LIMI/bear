import type { Room } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToRoomUpdates,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getRoomsFixture } from '@/lib/fixtures';

export const fetchRooms = async (): Promise<Room[]> => {
  if (!isSupabaseConfigured()) {
    return getRoomsFixture();
  }

  const client = getSupabaseClient();
  if (!client) {
    return getRoomsFixture();
  }

  const { data, error } = await client.from('rooms').select('*');

  if (error) {
    throw error;
  }

  return (data ?? []) as Room[];
};

export const registerRoomSubscription = (
  onRoomUpdate: (room: Room) => void,
): SubscriptionCleanup | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  return subscribeToRoomUpdates(client, onRoomUpdate);
};
