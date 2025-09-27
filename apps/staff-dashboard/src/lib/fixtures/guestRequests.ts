import type { GuestRequest } from '@/lib/types/supabase';

const guestRequests: GuestRequest[] = [
  {
    id: 'req-001',
    roomNumber: '2104',
    guestName: 'James Wilson',
    type: 'room-service',
    status: 'pending',
    priority: 'high',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    message: 'Could I get some extra towels and toiletries delivered to my room?',
    scheduled: false,
    assignedStaff: 'Maria Garcia',
    aiSuggestion:
      "I'll arrange to have extra towels and toiletries delivered right away. Would you like any specific items?",
    conversation: [
      {
        sender: 'guest',
        message: 'Could I get some extra towels and toiletries delivered to my room?',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-002',
    roomNumber: '1802',
    guestName: 'Emma Thompson',
    type: 'food',
    status: 'in-progress',
    priority: 'normal',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    message: 'Please schedule breakfast for tomorrow at 8am: avocado toast and a cappuccino.',
    scheduled: true,
    assignedStaff: 'Carlos Rodriguez',
    aiSuggestion:
      'Breakfast scheduled for 8am. Offer fresh fruit based on dietary preferences?',
    conversation: [
      {
        sender: 'guest',
        message: 'Please schedule breakfast for tomorrow at 8am: avocado toast and a cappuccino.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        sender: 'staff',
        message: 'Confirmed. Would you like breakfast delivered to your room or at the restaurant?',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const getGuestRequestsFixture = () => structuredClone(guestRequests);
