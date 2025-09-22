import { supabase, GuestProfile, StaffProfile, Room, GuestRequest, MenuItem, KnowledgeBaseItem, Notification, GuestAISummary, subscribeToRequests, subscribeToRooms, subscribeToNotifications } from './supabaseClient';
import { mockRequests, mockRooms, mockMenuItems, mockKnowledgeBase, mockNotifications, mockStaffProfiles, mockGuestAISummaries } from './mockData';
// Flag to use mock data when Supabase is not configured
const useMockData = !process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY;
// Guest Profiles
export const getGuestProfiles = async (): Promise<GuestProfile[]> => {
  if (useMockData) {
    // Return mock data from mockData.ts
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([{
          id: 'guest-001',
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
        }
        // Add more mock guest profiles here
        ]);
      }, 500);
    });
  }
  const {
    data,
    error
  } = await supabase.from('guest_profiles').select('*');
  if (error) {
    console.error('Error fetching guest profiles:', error);
    throw error;
  }
  return data as GuestProfile[];
};
export const getGuestProfileById = async (id: string): Promise<GuestProfile | null> => {
  if (useMockData) {
    // Return mock data
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: 'guest-001',
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
        });
      }, 300);
    });
  }
  const {
    data,
    error
  } = await supabase.from('guest_profiles').select('*').eq('id', id).single();
  if (error) {
    console.error(`Error fetching guest profile with ID ${id}:`, error);
    return null;
  }
  return data as GuestProfile;
};
// Guest Requests
export const getGuestRequests = async (): Promise<GuestRequest[]> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockRequests);
      }, 500);
    });
  }
  const {
    data,
    error
  } = await supabase.from('guest_requests').select('*').order('timestamp', {
    ascending: false
  });
  if (error) {
    console.error('Error fetching guest requests:', error);
    throw error;
  }
  return data as GuestRequest[];
};
export const updateGuestRequest = async (id: string, update: Partial<GuestRequest>): Promise<GuestRequest> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const updatedRequest = mockRequests.find(req => req.id === id);
        if (updatedRequest) {
          Object.assign(updatedRequest, update);
        }
        resolve(updatedRequest as GuestRequest);
      }, 300);
    });
  }
  const {
    data,
    error
  } = await supabase.from('guest_requests').update(update).eq('id', id).select().single();
  if (error) {
    console.error(`Error updating guest request with ID ${id}:`, error);
    throw error;
  }
  return data as GuestRequest;
};
export const createGuestRequest = async (request: Omit<GuestRequest, 'id' | 'created_at'>): Promise<GuestRequest> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newRequest = {
          ...request,
          id: `req-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        };
        mockRequests.unshift(newRequest as GuestRequest);
        resolve(newRequest as GuestRequest);
      }, 300);
    });
  }
  const {
    data,
    error
  } = await supabase.from('guest_requests').insert(request).select().single();
  if (error) {
    console.error('Error creating guest request:', error);
    throw error;
  }
  return data as GuestRequest;
};
// Rooms
export const getRooms = async (): Promise<Room[]> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockRooms);
      }, 500);
    });
  }
  const {
    data,
    error
  } = await supabase.from('rooms').select('*');
  if (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
  return data as Room[];
};
export const updateRoom = async (roomNumber: string, update: Partial<Room>): Promise<Room> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const updatedRoom = mockRooms.find(room => room.roomNumber === roomNumber);
        if (updatedRoom) {
          Object.assign(updatedRoom, update);
        }
        resolve(updatedRoom as Room);
      }, 300);
    });
  }
  const {
    data,
    error
  } = await supabase.from('rooms').update(update).eq('roomNumber', roomNumber).select().single();
  if (error) {
    console.error(`Error updating room ${roomNumber}:`, error);
    throw error;
  }
  return data as Room;
};
// Menu Items
export const getMenuItems = async (): Promise<MenuItem[]> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockMenuItems);
      }, 500);
    });
  }
  const {
    data,
    error
  } = await supabase.from('menu_items').select('*');
  if (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
  return data as MenuItem[];
};
export const updateMenuItem = async (id: string, update: Partial<MenuItem>): Promise<MenuItem> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const updatedItem = mockMenuItems.find(item => item.id === id);
        if (updatedItem) {
          Object.assign(updatedItem, update);
        }
        resolve(updatedItem as MenuItem);
      }, 300);
    });
  }
  const {
    data,
    error
  } = await supabase.from('menu_items').update(update).eq('id', id).select().single();
  if (error) {
    console.error(`Error updating menu item with ID ${id}:`, error);
    throw error;
  }
  return data as MenuItem;
};
// Knowledge Base
export const getKnowledgeBase = async (): Promise<KnowledgeBaseItem[]> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockKnowledgeBase);
      }, 500);
    });
  }
  const {
    data,
    error
  } = await supabase.from('knowledge_base').select('*');
  if (error) {
    console.error('Error fetching knowledge base:', error);
    throw error;
  }
  return data as KnowledgeBaseItem[];
};
export const updateKnowledgeBaseItem = async (id: string, update: Partial<KnowledgeBaseItem>): Promise<KnowledgeBaseItem> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const updatedItem = mockKnowledgeBase.find(item => item.id === id);
        if (updatedItem) {
          Object.assign(updatedItem, update);
        }
        resolve(updatedItem as KnowledgeBaseItem);
      }, 300);
    });
  }
  const {
    data,
    error
  } = await supabase.from('knowledge_base').update(update).eq('id', id).select().single();
  if (error) {
    console.error(`Error updating knowledge base item with ID ${id}:`, error);
    throw error;
  }
  return data as KnowledgeBaseItem;
};
// Staff Profiles
export const getStaffProfiles = async (): Promise<StaffProfile[]> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockStaffProfiles);
      }, 500);
    });
  }
  const {
    data,
    error
  } = await supabase.from('staff_profiles').select('*');
  if (error) {
    console.error('Error fetching staff profiles:', error);
    throw error;
  }
  return data as StaffProfile[];
};
// Notifications
export const getNotifications = async (): Promise<Notification[]> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockNotifications);
      }, 500);
    });
  }
  const {
    data,
    error
  } = await supabase.from('notifications').select('*').order('timestamp', {
    ascending: false
  });
  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
  return data as Notification[];
};
export const markNotificationAsRead = async (id: string): Promise<void> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const notification = mockNotifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
        }
        resolve();
      }, 300);
    });
  }
  const {
    error
  } = await supabase.from('notifications').update({
    read: true
  }).eq('id', id);
  if (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    throw error;
  }
};
// Guest AI Summaries
export const getGuestAISummary = async (guestId: string): Promise<GuestAISummary | null> => {
  if (useMockData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockGuestAISummaries[guestId] || null);
      }, 300);
    });
  }
  const {
    data,
    error
  } = await supabase.from('guest_ai_summaries').select('*').eq('guestId', guestId).single();
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error(`Error fetching AI summary for guest ${guestId}:`, error);
    throw error;
  }
  return data as GuestAISummary;
};
// Webhook handler for incoming requests
export const setupRequestWebhook = (callback: (request: GuestRequest) => void) => {
  // In a real implementation, this would set up a webhook endpoint
  // For now, we'll use Supabase's real-time subscriptions
  if (useMockData) {
    // Simulate incoming requests in mock mode
    const interval = setInterval(() => {
      const shouldCreateRequest = Math.random() > 0.8; // 20% chance
      if (shouldCreateRequest) {
        const mockRequest = {
          id: `req-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          roomNumber: ['2104', '1802', '1506', '2301', '1904'][Math.floor(Math.random() * 5)],
          guestName: ['James Wilson', 'Emma Thompson', 'Michael Chen', 'Sophia Rodriguez', 'David Johnson'][Math.floor(Math.random() * 5)],
          type: ['room-service', 'food', 'housekeeping', 'transportation', 'amenities', 'concierge'][Math.floor(Math.random() * 6)],
          status: 'pending',
          priority: Math.random() > 0.8 ? 'high' : 'normal',
          timestamp: new Date().toISOString(),
          message: ['Could I get some extra towels delivered to my room?', 'I would like to order room service for dinner tonight.', 'The AC in my room is not working properly.', 'Can you recommend a good restaurant nearby?', 'I need a late checkout tomorrow if possible.'][Math.floor(Math.random() * 5)],
          scheduled: false,
          assignedStaff: null,
          conversation: [{
            sender: 'guest',
            message: ['Could I get some extra towels delivered to my room?', 'I would like to order room service for dinner tonight.', 'The AC in my room is not working properly.', 'Can you recommend a good restaurant nearby?', 'I need a late checkout tomorrow if possible.'][Math.floor(Math.random() * 5)],
            timestamp: new Date().toISOString()
          }]
        };
        callback(mockRequest as GuestRequest);
        mockRequests.unshift(mockRequest as GuestRequest);
      }
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }
  // Set up real-time subscription for new requests
  return subscribeToRequests(payload => {
    if (payload.eventType === 'INSERT') {
      callback(payload.new as GuestRequest);
    }
  });
};
// Set up real-time updates for rooms
export const setupRoomUpdates = (callback: (room: Room) => void) => {
  if (useMockData) {
    // No real-time updates in mock mode
    return () => {};
  }
  return subscribeToRooms(payload => {
    if (payload.eventType === 'UPDATE') {
      callback(payload.new as Room);
    }
  });
};
// Set up real-time updates for notifications
export const setupNotificationUpdates = (callback: (notification: Notification) => void) => {
  if (useMockData) {
    // No real-time updates in mock mode
    return () => {};
  }
  return subscribeToNotifications(payload => {
    if (payload.eventType === 'INSERT') {
      callback(payload.new as Notification);
    }
  });
};