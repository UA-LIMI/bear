-- Seed historical service requests for key guests
-- Migration: 20250930090002_seed_service_requests

insert into service_requests (
  id,
  guest_id,
  room_number,
  request_type,
  summary,
  status,
  priority,
  eta,
  created_by,
  created_at,
  updated_at,
  metadata
) values
  (
    '1c9c3eb7-4f9e-40f1-917f-8c6c1395f3e2',
    'a397a03b-f65e-42c1-a8ed-6bebb7c6751b',
    'OWNER',
    'dining',
    'Order two wagyu burgers with truffle fries and 2007 Château Lafite',
    'completed',
    'high',
    '2025-05-10T18:45:00+08',
    'agent',
    '2025-05-10T18:05:00+08',
    '2025-05-10T18:52:00+08',
    '{"items": ["wagyu burger", "truffle fries", "Château Lafite 2007"], "channel": "voice"}'
  ),
  (
    '5e3d73f0-d4d5-4385-95d9-3c55a8049606',
    '22bbda6e-f82e-4910-84c2-dd694aa2953f',
    '301',
    'housekeeping',
    'Arrange wardrobe steaming for gala attire and polish evening shoes',
    'completed',
    'normal',
    '2025-06-21T15:00:00+08',
    'staff',
    '2025-06-21T13:30:00+08',
    '2025-06-21T15:10:00+08',
    '{"occasion": "Black & White Ball", "channel": "concierge desk"}'
  ),
  (
    '3d62d51c-3c93-4dfd-8c9e-137fed2a094f',
    '0c359b31-5129-47da-ae5c-019cf141507e',
    '425',
    'transport',
    'Schedule Rolls-Royce airport transfer with luggage assistance',
    'completed',
    'high',
    '2025-07-04T09:30:00+08',
    'agent',
    '2025-07-03T22:15:00+08',
    '2025-07-04T09:45:00+08',
    '{"flight": "CX251", "pickup_time": "07:45", "channel": "app"}'
  ),
  (
    '0cf77481-2b3a-44b2-9300-58f3a92e3f6e',
    '7d759560-046b-452e-9965-a9b00871ba1c',
    '210',
    'dining',
    'Set up in-room birthday tea service with gluten-free pastries',
    'completed',
    'urgent',
    '2025-08-12T16:00:00+08',
    'agent',
    '2025-08-12T14:20:00+08',
    '2025-08-12T16:05:00+08',
    '{"celebration": "daughter birthday", "dietary": "gluten-free", "channel": "voice"}'
  )
  on conflict (id) do nothing;

insert into service_request_updates (
  id,
  request_id,
  author_type,
  staff_profile_id,
  note,
  status,
  visible_to_guest,
  added_at,
  metadata
) values
  (
    '66e86b3d-8f1e-4c66-8a82-0d9df7782a52',
    '1c9c3eb7-4f9e-40f1-917f-8c6c1395f3e2',
    'staff',
    null,
    'Chef confirmed wagyu burgers and wine pairing. Delivering on silver trolley.',
    'in_progress',
    true,
    '2025-05-10T18:25:00+08',
    '{"kitchen": "Felix"}'
  ),
  (
    '9f7d6b6d-95d8-4374-948d-c6d4a8ed4d78',
    '1c9c3eb7-4f9e-40f1-917f-8c6c1395f3e2',
    'staff',
    null,
    'Order delivered. Guest thanked the Butler and requested ambient lighting.',
    'completed',
    true,
    '2025-05-10T18:52:00+08',
    '{"follow_up": "dim lights"}'
  ),
  (
    '1d7d8abf-98a7-4bcc-9bb2-7de828b7b8f4',
    '5e3d73f0-d4d5-4385-95d9-3c55a8049606',
    'agent',
    null,
    'Butler en-route with wardrobe specialist and shoe care kit.',
    'in_progress',
    true,
    '2025-06-21T14:10:00+08',
    '{"team": "wardrobe"}'
  ),
  (
    '0f5cc6ea-6d0d-4e74-aea0-3324cb2912f0',
    '5e3d73f0-d4d5-4385-95d9-3c55a8049606',
    'staff',
    null,
    'Services completed; garments pressed and shoes polished to mirror finish.',
    'completed',
    true,
    '2025-06-21T15:05:00+08',
    '{"laundry_ticket": "HK-2215"}'
  ),
  (
    '39c3c096-d4c7-4e13-82cc-563c1d35b680',
    '3d62d51c-3c93-4dfd-8c9e-137fed2a094f',
    'agent',
    null,
    'Chauffeur assigned; luggage tags printed and cold towels prepared.',
    'in_progress',
    true,
    '2025-07-03T23:05:00+08',
    '{"vehicle": "Rolls-Royce Phantom"}'
  ),
  (
    'f1a42bb9-4952-4f5c-87cb-4143758d904d',
    '3d62d51c-3c93-4dfd-8c9e-137fed2a094f',
    'staff',
    null,
    'Guest collected at 07:48 and arrived airport with 90-minute buffer.',
    'completed',
    true,
    '2025-07-04T09:45:00+08',
    '{"arrival_gate": "E2"}'
  ),
  (
    '75748f23-69cc-4cfa-86bf-20f406042c2d',
    '0cf77481-2b3a-44b2-9300-58f3a92e3f6e',
    'agent',
    null,
    'Pastry team preparing gluten-free set; harpist booked for 15:50 arrival.',
    'in_progress',
    true,
    '2025-08-12T15:05:00+08',
    '{"musician": "harp"}'
  ),
  (
    '8d2843da-6431-4db4-9404-4d1cf51c0994',
    '0cf77481-2b3a-44b2-9300-58f3a92e3f6e',
    'staff',
    null,
    'Tea service delivered with gluten-free pastries and personalised card.',
    'completed',
    true,
    '2025-08-12T16:05:00+08',
    '{"card_signed_by": "GM"}'
  )
  on conflict (id) do nothing;
