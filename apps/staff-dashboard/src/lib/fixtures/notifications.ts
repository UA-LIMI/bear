import type { Notification } from '@/lib/types/supabase';

const notifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'request',
    title: 'New Room Service Request',
    message: 'Room 2104 requested extra towels and toiletries.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false,
    requestId: 'req-001',
    roomNumber: '2104',
    guestId: 'guest-001',
    sender: 'AI Concierge',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-002',
    type: 'system',
    title: 'Nightly Sync Complete',
    message: 'Supabase sync completed successfully at 02:00 AM.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    sender: 'System',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const getNotificationsFixture = () => structuredClone(notifications);
