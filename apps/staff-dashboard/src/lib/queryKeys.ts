export const queryKeys = {
  guestRequests: ['guestRequests'] as const,
  rooms: ['rooms'] as const,
  notifications: ['notifications'] as const,
};

type QueryKeyMap = typeof queryKeys;

export type QueryKey = QueryKeyMap[keyof QueryKeyMap];
