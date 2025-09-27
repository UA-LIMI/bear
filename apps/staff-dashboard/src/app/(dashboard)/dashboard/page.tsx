'use client';

import { useMemo } from 'react';

import { getGuestProfilesFixture } from '@/lib/fixtures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGuestRequests } from '@/features/requests/hooks/useGuestRequests';
import { useRooms } from '@/features/room-control/hooks/useRooms';

const formatPercentage = (value: number) => `${value}%`;

const useGuestProfiles = () => useMemo(() => getGuestProfilesFixture(), []);

export default function DashboardPage() {
  const { requests, isLoading: requestsLoading } = useGuestRequests();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const guests = useGuestProfiles();

  const pendingRequests = useMemo(
    () => requests.filter(request => request.status !== 'completed'),
    [requests],
  );

  const occupancyRate = useMemo(() => {
    if (rooms.length === 0) {
      return 0;
    }
    const occupiedRooms = rooms.filter(room => room.status === 'occupied');
    return Math.round((occupiedRooms.length / rooms.length) * 100);
  }, [rooms]);

  const vipGuests = useMemo(
    () => guests.filter(guest => guest.vipStatus !== 'Standard').length,
    [guests],
  );

  const liveRequests = useMemo(() => requests.slice(0, 5), [requests]);
  const isLoading = requestsLoading || roomsLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{isLoading ? '—' : pendingRequests.length}</p>
            <p className="text-sm text-muted-foreground">Awaiting assignment or completion.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {isLoading ? '—' : formatPercentage(occupancyRate)}
            </p>
            <p className="text-sm text-muted-foreground">Based on realtime room inventory.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">VIP guests on property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{vipGuests}</p>
            <p className="text-sm text-muted-foreground">Remember to prepare amenity drops.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Live request feed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading requests…</p>}
          {liveRequests.map(request => (
            <div key={request.id} className="flex flex-col gap-1 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{request.type.replace('-', ' ')}</h3>
                <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                  {request.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Room {request.roomNumber} · {request.guestName}</p>
              <p className="text-sm">{request.message}</p>
            </div>
          ))}
          {!isLoading && liveRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">No active requests at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
