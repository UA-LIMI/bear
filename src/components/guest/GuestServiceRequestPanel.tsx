'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ServiceRequest } from '@/types/service-request';

interface GuestServiceRequestPanelProps {
  guest: { id: string; name: string } | null;
  requests: ServiceRequest[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const statusStyles: Record<ServiceRequest['status'], string> = {
  pending: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40',
  in_progress: 'bg-blue-500/20 text-blue-200 border border-blue-500/40',
  completed: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40',
  cancelled: 'bg-red-500/20 text-red-200 border border-red-500/40',
};

const priorityStyles: Record<ServiceRequest['priority'], string> = {
  low: 'text-emerald-200',
  normal: 'text-slate-200',
  high: 'text-orange-200',
  urgent: 'text-red-200',
};

export function GuestServiceRequestPanel({
  guest,
  requests,
  isLoading,
  error,
  onRefresh,
}: GuestServiceRequestPanelProps) {
  const formatTimestamp = (value: string) => {
    try {
      const date = new Date(value);
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.warn('Failed to format timestamp', error);
      return value;
    }
  };

  const formatShortTimestamp = (value: string) => {
    try {
      const date = new Date(value);
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.warn('Failed to format timestamp', error);
      return value;
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Guest Service Requests</h3>
          <p className="text-sm text-white/60">
            Track outstanding concierge tasks for {guest ? guest.name : 'the selected guest'}.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || !guest}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {!guest && (
        <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white/70">
          Select a guest to view their service history.
        </div>
      )}

      {guest && error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load requests: {error}
        </div>
      )}

      {guest && !error && !isLoading && requests.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white/70">
          No service requests recorded yet.
        </div>
      )}

      {guest && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-white/10 bg-black/40 p-4 transition hover:border-white/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{request.summary}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                    {request.room_number && <span>Room {request.room_number}</span>}
                    {request.request_type && <span className="uppercase tracking-wide">{request.request_type}</span>}
                    <span className={cn('font-medium', priorityStyles[request.priority])}>
                      Priority: {request.priority}
                    </span>
                    <span>Created {formatTimestamp(request.created_at)}</span>
                  </div>
                </div>
                <span className={cn('rounded-full px-3 py-1 text-xs uppercase tracking-wide', statusStyles[request.status])}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>

              {request.service_request_updates && request.service_request_updates.length > 0 && (
                <div className="mt-3 space-y-2">
                  {request.service_request_updates.slice(0, 3).map((update) => (
                    <div
                      key={update.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70"
                    >
                      <div className="flex items-center justify-between">
                        <span className="uppercase tracking-wide text-white/50">
                          {update.status ?? 'note'}
                        </span>
                        <span className="text-white/40">{formatShortTimestamp(update.added_at)}</span>
                      </div>
                      {update.note && <p className="mt-1 text-white/80">{update.note}</p>}
                    </div>
                  ))}
                  {request.service_request_updates.length > 3 && (
                    <p className="text-[10px] uppercase tracking-wide text-white/40">
                      {request.service_request_updates.length - 3} more updates in history
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
