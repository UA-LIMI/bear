'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGuestRequests } from '@/features/requests/hooks/useGuestRequests';

export default function RequestsPage() {
  const { requests, isLoading } = useGuestRequests();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Guest requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track incoming requests and manage assignments in realtime.
            </p>
          </div>
          <Button size="sm" variant="secondary">
            New request
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading requests…</p>}
          {requests.map(request => (
            <div key={request.id} className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-medium capitalize">{request.type.replace('-', ' ')}</h3>
                  <p className="text-sm text-muted-foreground">
                    Room {request.roomNumber} · {request.guestName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{request.status}</Badge>
                  <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                    {request.priority}
                  </Badge>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{request.message}</p>
              {request.assignedStaff ? (
                <p className="text-xs text-muted-foreground">
                  Assigned to {request.assignedStaff}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground font-medium">Unassigned</p>
              )}
              {/* TODO: Add detail drawer with full conversation, AI assistance, and action buttons. */}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
