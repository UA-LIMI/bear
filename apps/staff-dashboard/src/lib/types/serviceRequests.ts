export type ServiceRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ServiceRequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ServiceRequestUpdateRow {
  id: string;
  request_id: string;
  author_type: 'staff' | 'agent' | 'system';
  staff_profile_id: string | null;
  note: string | null;
  status: ServiceRequestStatus | null;
  visible_to_guest: boolean;
  added_at: string;
  metadata: Record<string, unknown>;
}

export interface ServiceRequestRow {
  id: string;
  guest_id: string | null;
  room_number: string | null;
  request_type: string | null;
  summary: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  eta: string | null;
  created_by: 'agent' | 'staff';
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  assigned_staff: string | null;
  ai_summary: string | null;
  source: string | null;
  resolved_at: string | null;
  follow_up: Record<string, unknown> | null;
  scheduled: boolean | null;
  scheduled_for: string | null;
  last_reviewer_id: string | null;
  profiles?: {
    id: string;
    display_name: string | null;
    username: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  service_request_updates?: ServiceRequestUpdateRow[] | null;
}

export interface ServiceRequest {
  id: string;
  guestId: string | null;
  guestName: string | null;
  roomNumber: string | null;
  requestType: string | null;
  summary: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  eta: string | null;
  createdBy: 'agent' | 'staff';
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  updates: ServiceRequestUpdateRow[];
  latestUpdate: ServiceRequestUpdateRow | null;
  assignedStaff: string | null;
  aiSummary: string | null;
  source: string | null;
  resolvedAt: string | null;
  followUp: Record<string, unknown>;
  scheduled: boolean;
  scheduledFor: string | null;
  lastReviewerId: string | null;
}

export type CreateServiceRequestPayload = {
  guestId: string | null;
  roomNumber: string | null;
  requestType: string | null;
  summary: string;
  priority?: ServiceRequestPriority;
  eta?: string | null;
  metadata?: Record<string, unknown>;
};

export type UpdateServiceRequestPayload = {
  status?: ServiceRequestStatus;
  note?: string;
  visibleToGuest?: boolean;
  metadata?: Record<string, unknown>;
  eta?: string | null;
  staffProfileId?: string | null;
};
