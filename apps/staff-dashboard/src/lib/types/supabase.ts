export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      guest_profiles: {
        Row: {
          id: string;
          name: string;
          display_name: string | null;
          username: string | null;
          email: string;
          phone: string | null;
          nationality: string | null;
          language: string | null;
          vip_status: string | null;
          visit_count: number | null;
          loyalty_points: number | null;
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
          preferences: Json | null;
          summary: Json | null;
          entities: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          display_name?: string | null;
          username?: string | null;
          email: string;
          phone?: string | null;
          nationality?: string | null;
          language?: string | null;
          vip_status?: string | null;
          visit_count?: number | null;
          loyalty_points?: number | null;
          last_visit?: string | null;
          room_preferences?: string | null;
          dietary_restrictions?: string | null;
          allergies?: string | null;
          special_occasions?: string | null;
          notes?: string | null;
          photo?: string | null;
          current_room?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          preferences?: Json | null;
          summary?: Json | null;
          entities?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string | null;
          username?: string | null;
          email?: string;
          phone?: string | null;
          nationality?: string | null;
          language?: string | null;
          vip_status?: string | null;
          visit_count?: number | null;
          loyalty_points?: number | null;
          last_visit?: string | null;
          room_preferences?: string | null;
          dietary_restrictions?: string | null;
          allergies?: string | null;
          special_occasions?: string | null;
          notes?: string | null;
          photo?: string | null;
          current_room?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          preferences?: Json | null;
          summary?: Json | null;
          entities?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      guest_requests: {
        Row: {
          id: string;
          guest_id: string | null;
          room_number: string | null;
          guest_name: string | null;
          request_type: string | null;
          status: string | null;
          priority: string | null;
          message: string | null;
          conversation: Json | null;
          scheduled: boolean | null;
          scheduled_for: string | null;
          assigned_staff: string | null;
          ai_suggestion: string | null;
          created_at: string | null;
          updated_at: string | null;
          timestamp: string | null;
        };
        Insert: Partial<Database['public']['Tables']['guest_requests']['Row']>;
        Update: Partial<Database['public']['Tables']['guest_requests']['Row']>;
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          hotel_id: string | null;
          room_number: string;
          room_type: string | null;
          floor_number: number | null;
          description: string | null;
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
          guest_schedule: Json | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['rooms']['Row']>;
        Update: Partial<Database['public']['Tables']['rooms']['Row']>;
        Relationships: [];
      };
      notifications: {
        Row: {
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
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number | null;
          category: string | null;
          available: boolean | null;
          preparation_time: number | null;
          allergens: string[] | null;
          dietary_info: string | null;
          image: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['menu_items']['Row']>;
        Update: Partial<Database['public']['Tables']['menu_items']['Row']>;
        Relationships: [];
      };
      knowledge_base: {
        Row: {
          id: string;
          title: string;
          category: string | null;
          content: string | null;
          last_updated: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['knowledge_base']['Row']>;
        Update: Partial<Database['public']['Tables']['knowledge_base']['Row']>;
        Relationships: [];
      };
      staff_profiles: {
        Row: {
          id: string;
          name: string;
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
          skills: Json | null;
          schedule: Json | null;
          metrics: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['staff_profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['staff_profiles']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
export type UUID = string;

export interface GuestPreferences {
  dining?: string[];
  activities?: string[];
  roomService?: string[];
}

export interface GuestSummary {
  id: UUID;
  type: string;
  title: string;
  content: string;
  keyPoints?: string[];
  confidenceScore?: number;
  createdAt?: string | null;
}

export interface GuestEntity {
  id: UUID;
  name: string;
  entityType: string;
  category: string;
  metadata?: Record<string, unknown>;
  confidenceScore?: number;
  createdAt?: string | null;
}

export interface GuestProfile {
  id: UUID;
  name: string;
  displayName?: string | null;
  username?: string | null;
  email: string;
  phone: string;
  nationality: string;
  language: string;
  vipStatus: string;
  visitCount: number;
  loyaltyPoints: number;
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
  summary: GuestSummary[];
  entities: GuestEntity[];
  created_at?: string | null;
  updated_at?: string | null;
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
  guestId?: UUID | null;
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
  updated_at?: string | null;
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
