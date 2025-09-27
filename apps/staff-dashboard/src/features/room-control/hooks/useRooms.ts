import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import type { Room } from '@/lib/types/supabase';
import { fetchRooms, registerRoomSubscription } from '@/features/room-control/services/roomsService';
import { isSupabaseConfigured } from '@/lib/supabase';

export const useRooms = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.rooms,
    queryFn: fetchRooms,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const unsubscribe = registerRoomSubscription(updatedRoom => {
      queryClient.setQueryData<Room[]>(queryKeys.rooms, prev => {
        if (!prev) {
          return [updatedRoom];
        }

        const index = prev.findIndex(room => room.roomNumber === updatedRoom.roomNumber);
        if (index >= 0) {
          const next = [...prev];
          next[index] = updatedRoom;
          return next;
        }

        return [updatedRoom, ...prev];
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);

  return {
    ...query,
    rooms: query.data ?? [],
  };
};
