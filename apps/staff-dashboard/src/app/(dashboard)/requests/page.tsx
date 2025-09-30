'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useServiceRequests } from '@/features/requests/hooks/useServiceRequests';

export default function RequestsPage() {
  const { requests, isLoading } = useServiceRequests();

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
            <div key={request.id} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-medium capitalize">{request.requestType ?? 'general'}</h3>
                  <p className="text-sm text-muted-foreground">
                    Room {request.roomNumber ?? '—'} · {request.guestName ?? 'Guest'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{request.status.replace('_', ' ')}</Badge>
                  <Badge
                    variant={
                      request.priority === 'high' || request.priority === 'urgent' ? 'destructive' : 'secondary'
                    }
                  >
                    {request.priority}
                  </Badge>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{request.summary}</p>
              {request.latestUpdate && (
                <div className="rounded-md border border-muted p-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">Latest update</span>
                    <span>{new Date(request.latestUpdate.added_at).toLocaleString()}</span>
                  </div>
                  {request.latestUpdate.note && <p className="mt-1 text-foreground">{request.latestUpdate.note}</p>}
                  {request.latestUpdate.status && (
                    <p className="mt-1">
                      Status set to <span className="font-medium text-foreground">{request.latestUpdate.status}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
