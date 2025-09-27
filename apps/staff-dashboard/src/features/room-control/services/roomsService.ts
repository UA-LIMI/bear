import type { Room, RoomScheduleEntry } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToRoomUpdates,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getRoomsFixture } from '@/lib/fixtures';

interface RoomRow {
  room_number: string;
  status: string | null;
  guest_name: string | null;
  check_in: string | null;
  check_out: string | null;
  temperature: number | null;
  lights: boolean | null;
  do_not_disturb: boolean | null;
  ac_on: boolean | null;
  curtains_open: boolean | null;
  housekeeping_status: string | null;
  minibar_restocked: boolean | null;
  maintenance_needed: boolean | null;
  guest_schedule: RoomScheduleEntry[] | null;
  updated_at: string | null;
}

const mapRoom = (row: RoomRow): Room => ({
  roomNumber: row.room_number,
  status: (row.status as Room['status']) ?? 'vacant',
  guestName: row.guest_name,
  checkIn: row.check_in,
  checkOut: row.check_out,
  temperature: row.temperature ?? 22,
  lights: row.lights ?? false,
  doNotDisturb: row.do_not_disturb ?? false,
  acOn: row.ac_on ?? false,
  curtainsOpen: row.curtains_open ?? true,
  housekeepingStatus: (row.housekeeping_status as Room['housekeepingStatus']) ?? 'cleaned',
  minibarRestocked: row.minibar_restocked ?? true,
  maintenanceNeeded: row.maintenance_needed ?? false,
  guestSchedule: row.guest_schedule ?? [],
  updated_at: row.updated_at ?? null,
});

export const fetchRooms = async (): Promise<Room[]> => {
  if (!isSupabaseConfigured()) {
    return getRoomsFixture();
  }

  const client = getSupabaseClient();
  if (!client) {
    return getRoomsFixture();
  }

  const { data, error } = await client
    .from('rooms')
    .select(
      'room_number, status, guest_name, check_in, check_out, temperature, lights, do_not_disturb, ac_on, curtains_open, housekeeping_status, minibar_restocked, maintenance_needed, guest_schedule, updated_at'
    )
    .order('room_number');

  if (error) {
    throw error;
  }

  return (data ?? []).map(row => mapRoom(row as RoomRow));
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

  return subscribeToRoomUpdates(client, payload => {
    if (!payload || typeof payload !== 'object' || !('room_number' in payload)) {
      return;
    }

    onRoomUpdate(mapRoom(payload as unknown as RoomRow));
  });
};
