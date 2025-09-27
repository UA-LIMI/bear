import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import type { GuestProfile } from '@/lib/types/supabase';
import {
  fetchGuestProfiles,
  registerGuestProfileSubscription,
  createGuestProfile,
  updateGuestProfile,
  type GuestProfileInput,
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

  const createMutation = useMutation({
    mutationFn: (input: GuestProfileInput) => createGuestProfile(input),
    onSuccess: created => {
      queryClient.setQueryData<GuestProfile[]>(queryKeys.guestProfiles, prev => {
        const previous = prev ?? [];
        const without = previous.filter(item => item.id !== created.id);
        return [created, ...without];
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: GuestProfileInput }) =>
      updateGuestProfile(id, input),
    onSuccess: updated => {
      queryClient.setQueryData<GuestProfile[]>(queryKeys.guestProfiles, prev => {
        const previous = prev ?? [];
        const index = previous.findIndex(item => item.id === updated.id);
        if (index === -1) {
          return [updated, ...previous];
        }
        const next = [...previous];
        next[index] = updated;
        return next;
      });
    },
  });

  return {
    ...query,
    guestProfiles: query.data ?? [],
    createGuestProfile: createMutation.mutateAsync,
    updateGuestProfile: (id: string, input: GuestProfileInput) =>
      updateMutation.mutateAsync({ id, input }),
    isCreatingGuest: createMutation.isPending,
    isUpdatingGuest: updateMutation.isPending,
  };
};
