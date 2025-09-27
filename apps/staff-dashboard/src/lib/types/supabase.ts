export type UUID = string;

export interface GuestPreferences {
  dining: string[];
  activities: string[];
  roomService: string[];
}

export interface GuestProfile {
  id: UUID;
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
  preferences: GuestPreferences;
  created_at?: string | null;
}

export type StaffStatus = 'on duty' | 'on break' | 'off duty';

export interface StaffSkill {
  name: string;
  level: number;
}

export interface StaffScheduleEntry {
  day: string;
  working: boolean;
  hours: string;
}

export interface StaffMetrics {
  guestSatisfaction: number;
  guestSatisfactionTrend: 'up' | 'down' | 'flat';
  taskEfficiency: number;
  taskEfficiencyTrend: 'up' | 'down' | 'flat';
  totalTasks: number;
  tasksOnTime: number;
  avgResolutionTime: number;
  responseRate: number;
  ratings: number[];
}

export interface StaffProfile {
  id: UUID;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  photo: string;
  joinDate: string;
  status: StaffStatus;
  shift: string;
  performance: number;
  notes: string;
  skills: StaffSkill[];
  schedule: StaffScheduleEntry[];
  metrics: StaffMetrics;
  created_at?: string | null;
}

export type RoomStatus = 'occupied' | 'vacant' | 'maintenance';

export interface RoomScheduleEntry {
  time: string;
  activity: string;
  notes: string;
}

export interface Room {
  roomNumber: string;
  status: RoomStatus;
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
  guestSchedule: RoomScheduleEntry[];
  updated_at?: string | null;
}

export type RequestStatus = 'pending' | 'in-progress' | 'completed';
export type RequestPriority = 'high' | 'normal' | 'low';

export interface GuestRequestMessage {
  sender: 'guest' | 'staff';
  message: string;
  timestamp: string;
}

export interface GuestRequest {
  id: UUID;
  roomNumber: string;
  guestName: string;
  type: string;
  status: RequestStatus;
  priority: RequestPriority;
  timestamp: string;
  message: string;
  scheduled: boolean;
  scheduledFor?: string | null;
  assignedStaff: string | null;
  aiSuggestion?: string | null;
  conversation: GuestRequestMessage[];
  created_at?: string | null;
}

export interface MenuItem {
  id: UUID;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  preparationTime: number;
  allergens: string[];
  dietaryInfo: string;
  image: string;
  updated_at?: string | null;
}

export interface KnowledgeBaseItem {
  id: UUID;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
  updated_at?: string | null;
}

export interface Notification {
  id: UUID;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requestId?: string | null;
  roomNumber?: string | null;
  guestId?: string | null;
  sender: string;
  created_at?: string | null;
}

export interface GuestAISummaryRecommendation {
  title: string;
  description: string;
}

export interface GuestAISummary {
  id: UUID;
  guestId: UUID;
  overview: string;
  preferences: string[];
  spendingPatterns: string;
  loyaltyInsights: string;
  recommendations: GuestAISummaryRecommendation[];
  lastUpdated: string;
  updated_at?: string | null;
}

export interface Database {
  public: {
    Tables: {
      guest_profiles: {
        Row: GuestProfile;
        Insert: Omit<GuestProfile, 'id' | 'created_at'> & {
          id?: UUID;
          created_at?: string | null;
        };
        Update: Partial<Omit<GuestProfile, 'id'>>;
      };
      staff_profiles: {
        Row: StaffProfile;
        Insert: Omit<StaffProfile, 'id' | 'created_at'> & {
          id?: UUID;
          created_at?: string | null;
        };
        Update: Partial<Omit<StaffProfile, 'id'>>;
      };
      rooms: {
        Row: Room;
        Insert: Omit<Room, 'updated_at'> & { updated_at?: string | null };
        Update: Partial<Omit<Room, 'roomNumber'>>;
      };
      guest_requests: {
        Row: GuestRequest;
        Insert: Omit<GuestRequest, 'id' | 'created_at'> & {
          id?: UUID;
          created_at?: string | null;
        };
        Update: Partial<Omit<GuestRequest, 'id'>>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id' | 'updated_at'> & {
          id?: UUID;
          updated_at?: string | null;
        };
        Update: Partial<Omit<MenuItem, 'id'>>;
      };
      knowledge_base: {
        Row: KnowledgeBaseItem;
        Insert: Omit<KnowledgeBaseItem, 'id' | 'updated_at'> & {
          id?: UUID;
          updated_at?: string | null;
        };
        Update: Partial<Omit<KnowledgeBaseItem, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & {
          id?: UUID;
          created_at?: string | null;
        };
        Update: Partial<Omit<Notification, 'id'>>;
      };
      guest_ai_summaries: {
        Row: GuestAISummary;
        Insert: Omit<GuestAISummary, 'id' | 'updated_at'> & {
          id?: UUID;
          updated_at?: string | null;
        };
        Update: Partial<Omit<GuestAISummary, 'id'>>;
      };
    };
  };
}

export type TableName = keyof Database['public']['Tables'];
