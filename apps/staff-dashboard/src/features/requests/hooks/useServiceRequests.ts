import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchServiceRequests, registerServiceRequestSubscription } from '@/features/requests/services/guestRequestsService';
import { queryKeys } from '@/lib/queryKeys';
import type { ServiceRequest } from '@/lib/types/serviceRequests';
import { isSupabaseConfigured } from '@/lib/supabase';

export const useServiceRequests = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.serviceRequests,
    queryFn: fetchServiceRequests,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const unsubscribe = registerServiceRequestSubscription(request => {
      queryClient.setQueryData<ServiceRequest[]>(queryKeys.serviceRequests, prev => {
        if (!prev) {
          return [request];
        }

        const idx = prev.findIndex(item => item.id === request.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = request;
          return next;
        }

        return [request, ...prev];
      });
    });

    return () => {
      void unsubscribe?.();
    };
  }, [queryClient]);

  return {
    ...query,
    requests: query.data ?? [],
  };
};
