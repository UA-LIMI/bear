import type { Database, GuestEntity, GuestProfile, GuestPreferences, GuestSummary } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToGuestProfiles,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getGuestProfilesFixture } from '@/lib/fixtures';

type GuestProfileRow = Database['public']['Tables']['guest_profiles']['Row'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parsePreferences = (value: GuestProfileRow['preferences']): GuestPreferences => {
  if (!isRecord(value)) {
    return {
      dining: [],
      activities: [],
      roomService: [],
    };
  }

  return {
    dining: Array.isArray(value.dining)
      ? (value.dining as string[])
      : [],
    activities: Array.isArray(value.activities)
      ? (value.activities as string[])
      : [],
    roomService: Array.isArray(value.roomService)
      ? (value.roomService as string[])
      : [],
  };
};

const parseSummaries = (value: GuestProfileRow['summary']): GuestSummary[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = isRecord(item) ? item : {};
    return {
      id: typeof record.id === 'string' ? record.id : `${record.type ?? 'summary'}-${index}`,
      type: typeof record.type === 'string' ? record.type : 'insight',
      title: typeof record.title === 'string' ? record.title : 'Summary',
      content: typeof record.content === 'string' ? record.content : '',
      keyPoints: Array.isArray(record.key_points) ? (record.key_points as string[]) : undefined,
      confidenceScore:
        typeof record.confidence_score === 'number' ? record.confidence_score : undefined,
      createdAt: typeof record.created_at === 'string' ? record.created_at : null,
    } satisfies GuestSummary;
  });
};

const parseEntities = (value: GuestProfileRow['entities']): GuestEntity[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = isRecord(item) ? item : {};
    return {
      id: typeof record.id === 'string' ? record.id : `entity-${index}`,
      name: typeof record.name === 'string' ? record.name : 'Entity',
      entityType: typeof record.entity_type === 'string' ? record.entity_type : 'metadata',
      category: typeof record.category === 'string' ? record.category : 'general',
      metadata: isRecord(record.metadata) ? record.metadata : {},
      confidenceScore:
        typeof record.confidence_score === 'number' ? record.confidence_score : undefined,
      createdAt: typeof record.created_at === 'string' ? record.created_at : null,
    } satisfies GuestEntity;
  });
};

const mapGuestProfile = (row: GuestProfileRow): GuestProfile => ({
  id: row.id,
  name: row.name ?? 'Guest',
  displayName: row.display_name,
  username: row.username,
  email: row.email ?? '',
  phone: row.phone ?? '',
  nationality: row.nationality ?? '',
  language: row.language ?? '',
  vipStatus: row.vip_status ?? 'Standard',
  visitCount: row.visit_count ?? 0,
  loyaltyPoints: row.loyalty_points ?? 0,
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
  preferences: parsePreferences(row.preferences),
  summary: parseSummaries(row.summary),
  entities: parseEntities(row.entities),
  created_at: row.created_at,
  updated_at: row.updated_at,
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
      'id, name, display_name, username, email, phone, nationality, language, vip_status, visit_count, loyalty_points, last_visit, room_preferences, dietary_restrictions, allergies, special_occasions, notes, photo, current_room, check_in, check_out, preferences, summary, entities, created_at, updated_at'
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

type UpsertGuestProfileInput = {
  name: string;
  displayName?: string | null;
  username?: string | null;
  email: string;
  phone?: string | null;
  nationality?: string | null;
  language?: string | null;
  vipStatus?: string | null;
  visitCount?: number | null;
  loyaltyPoints?: number | null;
  lastVisit?: string | null;
  roomPreferences?: string | null;
  dietaryRestrictions?: string | null;
  allergies?: string | null;
  specialOccasions?: string | null;
  notes?: string | null;
  photo?: string | null;
  currentRoom?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  preferences?: GuestPreferences;
};

const buildPayload = (input: UpsertGuestProfileInput) =>
  ({
    name: input.name,
    display_name: input.displayName ?? null,
    username: input.username ?? null,
    email: input.email,
    phone: input.phone ?? null,
    nationality: input.nationality ?? null,
    language: input.language ?? null,
    vip_status: input.vipStatus ?? null,
    visit_count: input.visitCount ?? null,
    loyalty_points: input.loyaltyPoints ?? null,
    last_visit: input.lastVisit ?? null,
    room_preferences: input.roomPreferences ?? null,
    dietary_restrictions: input.dietaryRestrictions ?? null,
    allergies: input.allergies ?? null,
    special_occasions: input.specialOccasions ?? null,
    notes: input.notes ?? null,
    photo: input.photo ?? null,
    current_room: input.currentRoom ?? null,
    check_in: input.checkIn ?? null,
    check_out: input.checkOut ?? null,
    preferences: {
      dining: input.preferences?.dining ?? [],
      activities: input.preferences?.activities ?? [],
      roomService: input.preferences?.roomService ?? [],
    },
  }) satisfies Database['public']['Tables']['guest_profiles']['Insert'];

export type GuestProfileInput = UpsertGuestProfileInput;

export const createGuestProfile = async (input: GuestProfileInput): Promise<GuestProfile> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Cannot create guest profile.');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is unavailable.');
  }

  const payload = buildPayload(input);

  const { data, error } = await client
    .from('guest_profiles')
    .insert(payload)
    .select(
      'id, name, display_name, username, email, phone, nationality, language, vip_status, visit_count, loyalty_points, last_visit, room_preferences, dietary_restrictions, allergies, special_occasions, notes, photo, current_room, check_in, check_out, preferences, summary, entities, created_at, updated_at'
    )
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create guest profile');
  }

  return mapGuestProfile(data as GuestProfileRow);
};

export const updateGuestProfile = async (
  id: string,
  input: GuestProfileInput,
): Promise<GuestProfile> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Cannot update guest profile.');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is unavailable.');
  }

  const payload = buildPayload(input);

  const { data, error } = await client
    .from('guest_profiles')
    .update(payload)
    .eq('id', id)
    .select(
      'id, name, display_name, username, email, phone, nationality, language, vip_status, visit_count, loyalty_points, last_visit, room_preferences, dietary_restrictions, allergies, special_occasions, notes, photo, current_room, check_in, check_out, preferences, summary, entities, created_at, updated_at'
    )
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to update guest profile');
  }

  return mapGuestProfile(data as GuestProfileRow);
}
