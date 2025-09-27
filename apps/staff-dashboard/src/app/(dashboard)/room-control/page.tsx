'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useRooms } from '@/features/room-control/hooks/useRooms';

export default function RoomControlPage() {
  const { rooms, isLoading } = useRooms();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Room status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor occupancy, environmental controls, and housekeeping state.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading rooms…</p>}
          {rooms.map(room => (
            <div key={room.roomNumber} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    {room.status === 'occupied' ? room.guestName ?? 'Occupied' : 'Vacant'}
                  </p>
                </div>
                <Badge variant={room.status === 'occupied' ? 'default' : 'secondary'}>
                  {room.status}
                </Badge>
              </div>
              <div className="grid gap-2 text-sm">
                <p>Temperature: {room.temperature}&deg;C</p>
                <p>Housekeeping: {room.housekeepingStatus}</p>
                <p>Maintenance needed: {room.maintenanceNeeded ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Lights</span>
                  <Switch defaultChecked={room.lights} disabled className="data-[disabled]:opacity-60" />
                </div>
                <div className="flex items-center justify-between">
                  <span>AC</span>
                  <Switch defaultChecked={room.acOn} disabled className="data-[disabled]:opacity-60" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Do not disturb</span>
                  <Switch defaultChecked={room.doNotDisturb} disabled className="data-[disabled]:opacity-60" />
                </div>
              </div>
              {/* TODO: Enable live control toggles connected to IoT endpoints. */}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
