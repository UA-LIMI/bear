export type NavigationKey =
  | 'dashboard'
  | 'requests'
  | 'room-control'
  | 'guest-profiles'
  | 'staff'
  | 'menu-management'
  | 'knowledge-base'
  | 'settings';

export interface NavigationItem {
  key: NavigationKey;
  href: string;
  label: string;
  description?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    label: 'Overview',
    description: 'KPIs, occupancy snapshot, and realtime activity feed.',
  },
  {
    key: 'requests',
    href: '/requests',
    label: 'Requests',
    description: 'Manage guest requests and assignments.',
  },
  {
    key: 'room-control',
    href: '/room-control',
    label: 'Room Control',
    description: 'Monitor room status, occupancy, and controls.',
  },
  {
    key: 'guest-profiles',
    href: '/guest-profiles',
    label: 'Guests',
    description: 'Profiles, preferences, and AI insights.',
  },
  {
    key: 'staff',
    href: '/staff',
    label: 'Staff',
    description: 'Roster, shifts, and staff performance metrics.',
  },
  {
    key: 'menu-management',
    href: '/menu-management',
    label: 'Menu',
    description: 'Manage menus, availability, and pricing.',
  },
  {
    key: 'knowledge-base',
    href: '/knowledge-base',
    label: 'Knowledge Base',
    description: 'Articles, SOPs, and curated resources.',
  },
  {
    key: 'settings',
    href: '/settings',
    label: 'Settings',
    description: 'Supabase credentials, notifications, integrations.',
  },
];
