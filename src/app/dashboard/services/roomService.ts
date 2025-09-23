// Room Service - Maps actual Supabase rooms table to dashboard interface
import { supabase } from './supabaseClient';

// Dashboard Room interface (what the UI expects)
export interface DashboardRoom {
  roomNumber: string;
  status: 'occupied' | 'available' | 'maintenance';
  guestName?: string;
  temperature: number;
  lights: boolean;
  maintenanceNeeded: boolean;
  roomType?: string;
  floor?: number;
  description?: string;
}

// Actual Supabase Room interface
interface SupabaseRoom {
  id: string;
  hotel_id: string | null;
  room_number: string;
  room_type: string | null;
  floor_number: number | null;
  description: string | null;
  active: boolean;
  created_at: string;
}

// Get all rooms from database
export const getRooms = async (): Promise<DashboardRoom[]> => {
  try {
    // Get rooms data
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('active', true)
      .order('room_number');

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return getMockRooms();
    }

    if (!rooms || rooms.length === 0) {
      console.warn('No rooms found in database, using mock data');
      return getMockRooms();
    }

    // Get current guests (profiles with room assignments)
    const { data: guests, error: guestsError } = await supabase
      .from('profiles')
      .select('room_number, display_name, username')
      .not('room_number', 'is', null);

    const guestMap = new Map();
    if (!guestsError && guests) {
      guests.forEach(guest => {
        guestMap.set(guest.room_number, guest.display_name || guest.username);
      });
    }

    // Map rooms to dashboard format
    return rooms.map(room => mapRoomToProfile(room, guestMap.get(room.room_number)));

  } catch (error) {
    console.error('Database connection error:', error);
    return getMockRooms();
  }
};

// Map database room to dashboard room
const mapRoomToProfile = (room: SupabaseRoom, guestName?: string): DashboardRoom => {
  return {
    roomNumber: room.room_number,
    status: guestName ? 'occupied' : 'available',
    guestName,
    temperature: 22, // Default temperature - could be enhanced with device data
    lights: false, // Default - could be enhanced with device data
    maintenanceNeeded: false, // Default - could be enhanced with maintenance data
    roomType: room.room_type || undefined,
    floor: room.floor_number || undefined,
    description: room.description || undefined
  };
};

// Get room by number
export const getRoom = async (roomNumber: string): Promise<DashboardRoom | null> => {
  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_number', roomNumber)
      .eq('active', true)
      .single();

    if (error || !room) {
      console.error('Error fetching room:', error);
      return null;
    }

    // Get guest for this room
    const { data: guest } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('room_number', roomNumber)
      .single();

    const guestName = guest ? (guest.display_name || guest.username) : undefined;
    return mapRoomToProfile(room, guestName);

  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
};

// Mock data fallback
const getMockRooms = (): DashboardRoom[] => {
  return [
    {
      roomNumber: '2104',
      status: 'occupied',
      guestName: 'James Wilson',
      temperature: 22,
      lights: true,
      maintenanceNeeded: false,
      roomType: 'Suite',
      floor: 21
    },
    {
      roomNumber: '1502',
      status: 'occupied',
      guestName: 'Maria Garcia',
      temperature: 24,
      lights: false,
      maintenanceNeeded: false,
      roomType: 'Standard',
      floor: 15
    },
    {
      roomNumber: '3001',
      status: 'available',
      temperature: 21,
      lights: false,
      maintenanceNeeded: false,
      roomType: 'Premium',
      floor: 30
    }
  ];
};
