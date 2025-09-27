import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import type { GuestProfile } from '@/lib/types/supabase';
import {
  fetchGuestProfiles,
  registerGuestProfileSubscription,
} from '@/features/guest-profiles/services/guestProfilesService';
import { isSupabaseConfigured } from '@/lib/supabase';

export const useGuestProfiles = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.guestProfiles,
    queryFn: fetchGuestProfiles,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const unsubscribe = registerGuestProfileSubscription(profile => {
      queryClient.setQueryData<GuestProfile[]>(queryKeys.guestProfiles, prev => {
        if (!prev) {
          return [profile];
        }

        const index = prev.findIndex(item => item.id === profile.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = profile;
          return next;
        }

        return [profile, ...prev];
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);

  return {
    ...query,
    guestProfiles: query.data ?? [],
  };
};
