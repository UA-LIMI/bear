import { createClient } from '@supabase/supabase-js';
// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock data instead.');
}
// Only create the client if we have valid credentials
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
// Types for our Supabase tables
export type GuestProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  language: string;
  vipStatus: string;
  visitCount: number;
  lastVisit: string | null;
  roomPreferences: string;
  dietaryRestrictions: string | null;
  allergies: string | null;
  specialOccasions: string | null;
  notes: string | null;
  photo: string;
  currentRoom: string | null;
  checkIn: string | null;
  checkOut: string | null;
  preferences: {
    dining: string[];
    activities: string[];
    roomService: string[];
  };
  created_at?: string;
};
export type StaffProfile = {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  photo: string;
  joinDate: string;
  status: 'on duty' | 'on break' | 'off duty';
  shift: string;
  performance: number;
  notes: string;
  skills: Array<{
    name: string;
    level: number;
  }>;
  schedule: Array<{
    day: string;
    working: boolean;
    hours: string;
  }>;
  metrics: {
    guestSatisfaction: number;
    guestSatisfactionTrend: string;
    taskEfficiency: number;
    taskEfficiencyTrend: string;
    totalTasks: number;
    tasksOnTime: number;
    avgResolutionTime: number;
    responseRate: number;
    ratings: number[];
  };
  created_at?: string;
};
export type Room = {
  roomNumber: string;
  status: 'occupied' | 'vacant' | 'maintenance';
  guestName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  temperature: number;
  lights: boolean;
  doNotDisturb: boolean;
  acOn: boolean;
  curtainsOpen: boolean;
  housekeepingStatus: 'cleaned' | 'pending' | 'in progress';
  minibarRestocked: boolean;
  maintenanceNeeded: boolean;
  guestSchedule: Array<{
    time: string;
    activity: string;
    notes: string;
  }>;
  updated_at?: string;
};
export type GuestRequest = {
  id: string;
  roomNumber: string;
  guestName: string;
  type: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  message: string;
  scheduled: boolean;
  scheduledFor?: string;
  assignedStaff: string | null;
  aiSuggestion?: string;
  conversation: Array<{
    sender: 'guest' | 'staff';
    message: string;
    timestamp: string;
  }>;
  created_at?: string;
};
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  preparationTime: number;
  allergens: string[];
  dietaryInfo: string;
  image: string;
  updated_at?: string;
};
export type KnowledgeBaseItem = {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
  updated_at?: string;
};
export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
  roomNumber?: string;
  guestId?: string;
  sender: string;
  created_at?: string;
};
export type GuestAISummary = {
  id: string;
  guestId: string;
  overview: string;
  preferences: string[];
  spendingPatterns: string;
  loyaltyInsights: string;
  recommendations: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  lastUpdated: string;
  updated_at?: string;
};
// Helper functions for real-time subscriptions
export const subscribeToRequests = (callback: (payload: any) => void) => {
  return supabase.channel('public:guest_requests').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'guest_requests'
  }, callback).subscribe();
};
export const subscribeToRooms = (callback: (payload: any) => void) => {
  return supabase.channel('public:rooms').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'rooms'
  }, callback).subscribe();
};
export const subscribeToNotifications = (callback: (payload: any) => void) => {
  return supabase.channel('public:notifications').on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'notifications'
  }, callback).subscribe();
};