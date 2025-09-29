export interface GuestStayInfo {
  hotel: string;
  room?: string;
  location?: string;
}

export interface GuestProfileDetails {
  occupation: string;
  aiPrompt: string;
}

export interface GuestProfile {
  id: string;
  name: string;
  status: 'inRoom' | 'bookedOffsite' | 'notLinked';
  membershipTier: string;
  profile: GuestProfileDetails;
  stayInfo?: GuestStayInfo;
  loyaltyPoints?: number;
  guestType?: string;
}
