import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import type { GuestRequest } from '@/lib/types/supabase';
import {
  fetchGuestRequests,
  registerGuestRequestSubscription,
} from '@/features/requests/services/guestRequestsService';
import { isSupabaseConfigured } from '@/lib/supabase';

export const useGuestRequests = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.guestRequests,
    queryFn: fetchGuestRequests,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const unsubscribe = registerGuestRequestSubscription(newRequest => {
      queryClient.setQueryData<GuestRequest[]>(queryKeys.guestRequests, prev => {
        if (!prev) {
          return [newRequest];
        }

        const existingIndex = prev.findIndex(request => request.id === newRequest.id);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = newRequest;
          return next;
        }

        return [newRequest, ...prev];
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);

  return {
    ...query,
    requests: query.data ?? [],
  };
};
