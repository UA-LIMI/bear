import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import type { Notification } from '@/lib/types/supabase';
import {
  fetchNotifications,
  registerNotificationSubscription,
} from '@/features/notifications/services/notificationsService';
import { isSupabaseConfigured } from '@/lib/supabase';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const unsubscribe = registerNotificationSubscription(notification => {
      queryClient.setQueryData<Notification[]>(queryKeys.notifications, prev => {
        if (!prev) {
          return [notification];
        }

        const updated = prev.filter(item => item.id !== notification.id);
        return [notification, ...updated];
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);

  return {
    ...query,
    notifications: query.data ?? [],
  };
};
