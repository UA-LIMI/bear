import type { GuestProfile, GuestPreferences } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToGuestProfiles,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getGuestProfilesFixture } from '@/lib/fixtures';

type GuestPreferencesRow = Partial<GuestPreferences> | null;

interface GuestProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  language: string | null;
  vip_status: string | null;
  visit_count: number | null;
  last_visit: string | null;
  room_preferences: string | null;
  dietary_restrictions: string | null;
  allergies: string | null;
  special_occasions: string | null;
  notes: string | null;
  photo: string | null;
  current_room: string | null;
  check_in: string | null;
  check_out: string | null;
  preferences: GuestPreferencesRow;
  created_at: string | null;
  updated_at: string | null;
}

const mapPreferences = (preferences: GuestPreferencesRow): GuestPreferences => ({
  dining: preferences?.dining ?? [],
  activities: preferences?.activities ?? [],
  roomService: preferences?.roomService ?? [],
});

const mapGuestProfile = (row: GuestProfileRow): GuestProfile => ({
  id: row.id,
  name: row.name ?? 'Guest',
  email: row.email ?? '',
  phone: row.phone ?? '',
  nationality: row.nationality ?? '',
  language: row.language ?? '',
  vipStatus: row.vip_status ?? 'Standard',
  visitCount: row.visit_count ?? 0,
  lastVisit: row.last_visit,
  roomPreferences: row.room_preferences ?? '',
  dietaryRestrictions: row.dietary_restrictions,
  allergies: row.allergies,
  specialOccasions: row.special_occasions,
  notes: row.notes,
  photo: row.photo ?? '',
  currentRoom: row.current_room,
  checkIn: row.check_in,
  checkOut: row.check_out,
  preferences: mapPreferences(row.preferences),
  created_at: row.created_at,
});

export const fetchGuestProfiles = async (): Promise<GuestProfile[]> => {
  if (!isSupabaseConfigured()) {
    return getGuestProfilesFixture();
  }

  const client = getSupabaseClient();
  if (!client) {
    return getGuestProfilesFixture();
  }

  const { data, error } = await client
    .from('guest_profiles')
    .select(
      'id, name, email, phone, nationality, language, vip_status, visit_count, last_visit, room_preferences, dietary_restrictions, allergies, special_occasions, notes, photo, current_room, check_in, check_out, preferences, created_at, updated_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(row => mapGuestProfile(row as GuestProfileRow));
};

export const registerGuestProfileSubscription = (
  onProfile: (profile: GuestProfile) => void,
): SubscriptionCleanup | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  return subscribeToGuestProfiles(client, payload => {
    if (!payload || typeof payload !== 'object' || !('id' in payload)) {
      return;
    }

    onProfile(mapGuestProfile(payload as unknown as GuestProfileRow));
  });
};
