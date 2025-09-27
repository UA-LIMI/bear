export const queryKeys = {
  guestRequests: ['guestRequests'] as const,
  rooms: ['rooms'] as const,
  notifications: ['notifications'] as const,
  guestProfiles: ['guestProfiles'] as const,
  staffProfiles: ['staffProfiles'] as const,
  menuItems: ['menuItems'] as const,
  knowledgeBase: ['knowledgeBase'] as const,
};

type QueryKeyMap = typeof queryKeys;

export type QueryKey = QueryKeyMap[keyof QueryKeyMap];
