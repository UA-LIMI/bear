// Guest Profile Service - Maps actual Supabase schema to dashboard interface
import { supabase } from './supabaseClient';

// Dashboard Guest Profile interface (what the UI expects)
export interface DashboardGuestProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  language?: string;
  vipStatus: string;
  visitCount: number;
  lastVisit: string | null;
  roomPreferences?: string;
  dietaryRestrictions?: string | null;
  allergies?: string | null;
  specialOccasions?: string | null;
  notes?: string | null;
  photo: string;
  currentRoom: string | null;
  checkIn: string | null;
  checkOut: string | null;
  preferences: {
    dining: string[];
    activities: string[];
    roomService: string[];
  };
  location?: {
    address?: string;
    city?: string;
    country?: string;
  };
  created_at?: string;
}

// Actual Supabase Profile interface (from your real schema)
interface SupabaseProfile {
  id: string;
  username: string;
  display_name: string | null;
  guest_type: string;
  room_number: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  total_stays: number;
  loyalty_points: number;
  current_location_address: string | null;
  current_location_city: string | null;
  current_location_country: string | null;
  location_updated_at: string | null;
  location_source: string | null;
  created_at: string;
  updated_at: string;
}

// Map actual database profile to dashboard profile
const mapDatabaseToProfile = (dbProfile: SupabaseProfile): DashboardGuestProfile => {
  // Determine VIP status based on guest_type and loyalty_points
  let vipStatus = 'Standard';
  if (dbProfile.guest_type === 'vip' || dbProfile.loyalty_points > 5000) {
    vipStatus = 'Platinum';
  } else if (dbProfile.guest_type === 'premium' || dbProfile.loyalty_points > 2000) {
    vipStatus = 'Gold';
  } else if (dbProfile.guest_type === 'suite' || dbProfile.loyalty_points > 500) {
    vipStatus = 'Silver';
  }

  return {
    id: dbProfile.id,
    name: dbProfile.display_name || dbProfile.username,
    email: `${dbProfile.username}@guest.com`, // Generate email from username
    phone: '+1 (555) 000-0000', // Default phone - could be enhanced with user data
    nationality: dbProfile.current_location_country || 'Unknown',
    language: 'English', // Default - could be enhanced with user preference
    vipStatus,
    visitCount: dbProfile.total_stays,
    lastVisit: dbProfile.check_in_date,
    roomPreferences: `${dbProfile.guest_type} guest preferences`,
    dietaryRestrictions: null,
    allergies: null,
    specialOccasions: null,
    notes: `Guest type: ${dbProfile.guest_type}, Loyalty: ${dbProfile.loyalty_points} points`,
    photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&sig=${dbProfile.id.slice(0, 8)}`,
    currentRoom: dbProfile.room_number,
    checkIn: dbProfile.check_in_date,
    checkOut: dbProfile.check_out_date,
    preferences: {
      dining: getDiningPreferences(dbProfile.guest_type),
      activities: getActivityPreferences(dbProfile.guest_type),
      roomService: getRoomServicePreferences(dbProfile.guest_type)
    },
    location: {
      address: dbProfile.current_location_address || undefined,
      city: dbProfile.current_location_city || undefined,
      country: dbProfile.current_location_country || undefined
    },
    created_at: dbProfile.created_at
  };
};

// Helper functions to generate preferences based on guest type
const getDiningPreferences = (guestType: string): string[] => {
  switch (guestType) {
    case 'vip':
    case 'platinum':
      return ['Fine dining', 'Wine pairing', 'Private dining', 'Chef\'s table'];
    case 'premium':
    case 'suite':
      return ['Premium dining', 'Room service', 'Local cuisine'];
    case 'business':
      return ['Express breakfast', 'Business lunch', 'Coffee service'];
    default:
      return ['Standard dining', 'Breakfast service'];
  }
};

const getActivityPreferences = (guestType: string): string[] => {
  switch (guestType) {
    case 'vip':
    case 'platinum':
      return ['Spa premium', 'Golf', 'Private tours', 'Concierge services'];
    case 'premium':
    case 'suite':
      return ['Spa', 'Fitness center', 'Pool', 'Local attractions'];
    case 'business':
      return ['Business center', 'Meeting rooms', 'Express services'];
    default:
      return ['Pool', 'Fitness center', 'Standard activities'];
  }
};

const getRoomServicePreferences = (guestType: string): string[] => {
  switch (guestType) {
    case 'vip':
    case 'platinum':
      return ['24/7 butler service', 'Premium amenities', 'Turndown service'];
    case 'premium':
    case 'suite':
      return ['Room service', 'Daily housekeeping', 'Premium toiletries'];
    case 'business':
      return ['Express housekeeping', 'Business amenities', 'High-speed internet'];
    default:
      return ['Daily housekeeping', 'Standard amenities'];
  }
};

// Get all guest profiles from actual database
export const getGuestProfiles = async (): Promise<DashboardGuestProfile[]> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        guest_type,
        room_number,
        check_in_date,
        check_out_date,
        total_stays,
        loyalty_points,
        current_location_address,
        current_location_city,
        current_location_country,
        location_updated_at,
        location_source,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching guest profiles:', error);
      return getMockGuestProfiles();
    }

    if (!profiles || profiles.length === 0) {
      console.warn('No guest profiles found in database, using mock data');
      return getMockGuestProfiles();
    }

    // Map database profiles to dashboard format
    return profiles.map(mapDatabaseToProfile);

  } catch (error) {
    console.error('Database connection error:', error);
    return getMockGuestProfiles();
  }
};

// Get single guest profile by ID with AI summaries
export const getGuestProfile = async (guestId: string): Promise<DashboardGuestProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', guestId)
      .single();

    if (error || !profile) {
      console.error('Error fetching guest profile:', error);
      return null;
    }

    return mapDatabaseToProfile(profile);

  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
};

// Get AI summaries for a guest
export const getGuestAISummaries = async (guestId: string) => {
  try {
    const { data: summaries, error } = await supabase
      .from('guest_summaries')
      .select('*')
      .eq('user_id', guestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI summaries:', error);
      return [];
    }

    return summaries || [];
  } catch (error) {
    console.error('Database connection error:', error);
    return [];
  }
};

// Get recommendations for a guest
export const getGuestRecommendations = async (guestId: string) => {
  try {
    const { data: recommendations, error } = await supabase
      .from('guest_recommendations')
      .select('*')
      .eq('user_id', guestId)
      .eq('status', 'pending')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    return recommendations || [];
  } catch (error) {
    console.error('Database connection error:', error);
    return [];
  }
};

// Fallback mock data when database is unavailable
const getMockGuestProfiles = (): DashboardGuestProfile[] => {
  return [
    {
      id: 'guest-mock-001',
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      phone: '+1 (555) 123-4567',
      nationality: 'United States',
      language: 'English',
      vipStatus: 'Gold',
      visitCount: 5,
      lastVisit: '2023-08-15',
      roomPreferences: 'High floor, away from elevator, extra pillows',
      dietaryRestrictions: 'No shellfish, prefers low-carb options',
      allergies: 'Shellfish',
      specialOccasions: 'Anniversary on September 12',
      notes: 'Prefers sparkling water in room. Enjoys the spa facilities.',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      currentRoom: '2104',
      checkIn: '2023-11-10',
      checkOut: '2023-11-15',
      preferences: {
        dining: ['Fine dining', 'Italian cuisine', 'Wine pairing'],
        activities: ['Spa', 'Golf', 'Business center'],
        roomService: ['Breakfast', 'Evening turndown service']
      }
    },
    {
      id: 'guest-mock-002',
      name: 'Maria Rodriguez',
      email: 'maria.r@example.com',
      phone: '+1 (555) 987-6543',
      nationality: 'Spain',
      language: 'Spanish',
      vipStatus: 'Platinum',
      visitCount: 10,
      lastVisit: '2023-10-01',
      roomPreferences: 'Suite with city view, non-smoking',
      dietaryRestrictions: 'Vegetarian',
      allergies: null,
      specialOccasions: 'Birthday on December 5',
      notes: 'Enjoys late check-out. Prefers organic toiletries.',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?w=200&h=200&fit=crop&crop=faces',
      currentRoom: '3001',
      checkIn: '2023-11-20',
      checkOut: '2023-11-25',
      preferences: {
        dining: ['Vegetarian options', 'Spanish tapas'],
        activities: ['Yoga', 'Shopping'],
        roomService: ['Fresh fruit platter', 'Herbal tea']
      }
    }
  ];
};

// Update guest profile in database
export const updateGuestProfile = async (guestId: string, updates: Partial<SupabaseProfile>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', guestId);

    if (error) {
      console.error('Error updating guest profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};