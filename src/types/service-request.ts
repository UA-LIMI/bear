export type ServiceRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ServiceRequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ServiceRequestUpdate {
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

export interface ServiceRequest {
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
  service_request_updates?: ServiceRequestUpdate[];
}

export interface CreateServiceRequestPayload {
  guestId: string | null;
  roomNumber: string | null;
  requestType: string | null;
  summary: string;
  priority?: ServiceRequestPriority;
  status?: ServiceRequestStatus;
  eta?: string | null;
  createdBy?: 'agent' | 'staff';
  metadata?: Record<string, unknown>;
}

export interface AppendServiceRequestUpdatePayload {
  note?: string;
  status?: ServiceRequestStatus;
  visibleToGuest?: boolean;
  staffProfileId?: string | null;
  authorType?: 'staff' | 'agent' | 'system';
  metadata?: Record<string, unknown>;
}
