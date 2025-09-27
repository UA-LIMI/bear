import type { StaffMetrics, StaffProfile, StaffScheduleEntry, StaffSkill } from '@/lib/types/supabase';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  subscribeToStaffProfiles,
  type SubscriptionCleanup,
} from '@/lib/supabase';
import { getStaffProfilesFixture } from '@/lib/fixtures';

interface StaffProfileRow {
  id: string;
  name: string | null;
  position: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  photo: string | null;
  join_date: string | null;
  status: string | null;
  shift: string | null;
  performance: number | null;
  notes: string | null;
  skills: StaffSkill[] | null;
  schedule: StaffScheduleEntry[] | null;
  metrics: Partial<StaffMetrics> | null;
  created_at: string | null;
  updated_at: string | null;
}

const defaultMetrics: StaffMetrics = {
  guestSatisfaction: 0,
  guestSatisfactionTrend: 'flat',
  taskEfficiency: 0,
  taskEfficiencyTrend: 'flat',
  totalTasks: 0,
  tasksOnTime: 0,
  avgResolutionTime: 0,
  responseRate: 0,
  ratings: [],
};

const mapStaffProfile = (row: StaffProfileRow): StaffProfile => ({
  id: row.id,
  name: row.name ?? 'Team member',
  position: row.position ?? 'Role TBD',
  department: row.department ?? 'Operations',
  email: row.email ?? '',
  phone: row.phone ?? '',
  photo: row.photo ?? '',
  joinDate: row.join_date ?? '',
  status: (row.status as StaffProfile['status']) ?? 'off duty',
  shift: row.shift ?? 'Day',
  performance: row.performance ?? 0,
  notes: row.notes ?? '',
  skills: row.skills ?? [],
  schedule: row.schedule ?? [],
  metrics: {
    ...defaultMetrics,
    ...(row.metrics ?? {}),
    guestSatisfactionTrend: (row.metrics?.guestSatisfactionTrend as StaffMetrics['guestSatisfactionTrend']) ?? 'flat',
    taskEfficiencyTrend: (row.metrics?.taskEfficiencyTrend as StaffMetrics['taskEfficiencyTrend']) ?? 'flat',
  },
  created_at: row.created_at ?? null,
});

const isStaffProfileRow = (payload: unknown): payload is StaffProfileRow => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const record = payload as Partial<StaffProfileRow>;
  return typeof record.id === 'string';
};

export const fetchStaffProfiles = async (): Promise<StaffProfile[]> => {
  if (!isSupabaseConfigured()) {
    return getStaffProfilesFixture();
  }

  const client = getSupabaseClient();
  if (!client) {
    return getStaffProfilesFixture();
  }

  const { data, error } = await client
    .from('staff_profiles')
    .select(
      'id, name, position, department, email, phone, photo, join_date, status, shift, performance, notes, skills, schedule, metrics, created_at, updated_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(row => mapStaffProfile(row as StaffProfileRow));
};

export const registerStaffProfileSubscription = (
  onProfile: (profile: StaffProfile) => void,
): SubscriptionCleanup | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  return subscribeToStaffProfiles(client, payload => {
    if (!isStaffProfileRow(payload)) {
      return;
    }

    onProfile(mapStaffProfile(payload));
  });
};
