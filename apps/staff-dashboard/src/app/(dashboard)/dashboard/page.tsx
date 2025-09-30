'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useServiceRequests } from '@/features/requests/hooks/useServiceRequests';
import { useRooms } from '@/features/room-control/hooks/useRooms';
import { getGuestProfilesFixture } from '@/lib/fixtures';

type AIBrief = {
  text: string;
  model?: string;
  requestId?: string;
};

type StaffCoverage = {
  role: string;
  coverage: number;
  onDuty: number;
  scheduled: number;
};

type AutomationLogEntry = {
  id: string;
  time: string;
  action: string;
  status: 'completed' | 'scheduled' | 'attention';
};

type ChannelMixEntry = {
  channel: string;
  share: number;
};

const STAFF_COVERAGE_DATA: StaffCoverage[] = [
  { role: 'Concierge', coverage: 0.82, onDuty: 5, scheduled: 6 },
  { role: 'Housekeeping', coverage: 0.68, onDuty: 17, scheduled: 25 },
  { role: 'Food & Beverage', coverage: 0.9, onDuty: 9, scheduled: 10 },
  { role: 'Maintenance', coverage: 0.6, onDuty: 3, scheduled: 5 },
];

const AUTOMATION_LOG: AutomationLogEntry[] = [
  { id: 'auto-001', time: '07:15', action: 'Sent welcome SMS to early-arrival guests', status: 'completed' },
  { id: 'auto-002', time: '08:05', action: 'Scheduled turndown for VIP Wilson (2104)', status: 'scheduled' },
  { id: 'auto-003', time: '08:30', action: 'Flagged maintenance check for room 1705 AC filter', status: 'attention' },
];

const CHANNEL_MIX: ChannelMixEntry[] = [
  { channel: 'Direct', share: 46 },
  { channel: 'OTA', share: 28 },
  { channel: 'Corporate', share: 18 },
  { channel: 'Travel agent', share: 8 },
];

const useGuestProfiles = () => useMemo(() => getGuestProfilesFixture(), []);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const formatPercentage = (value: number) => `${value}%`;

const minutesSince = (timestamp: string) => Math.round((Date.now() - new Date(timestamp).getTime()) / (1000 * 60));

const asTitle = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

const DEFAULT_AI_PROMPT = 'Invent a new holiday and describe its traditions.';

const useDashboardAIBrief = () => {
  const [brief, setBrief] = useState<AIBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState(DEFAULT_AI_PROMPT);

  const run = useCallback(
    async (prompt?: string) => {
      const nextPrompt = prompt && prompt.trim().length > 0 ? prompt : DEFAULT_AI_PROMPT;
      const controller = new AbortController();
      setLoading(true);
      setError(null);
      setLastPrompt(nextPrompt);

      try {
        const response = await fetch('/api/ai/guest-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: nextPrompt }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const errorMessage = typeof errorBody?.error === 'string' ? errorBody.error : 'AI request failed.';
          const details = typeof errorBody?.details === 'string' ? ` Details: ${errorBody.details}` : '';
          throw new Error(`${errorMessage} (status ${response.status}).${details}`);
        }

        const data = await response.json();
        setBrief({
          text: typeof data.completion === 'string' ? data.completion : '',
          model: typeof data.model === 'string' ? data.model : undefined,
          requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
        });
      } catch (err) {
        setBrief(null);
        setError(err instanceof Error ? err.message : 'Unable to load AI briefing.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    run();
  }, [run]);

  return { brief, loading, error, run, lastPrompt };
};

const ExecutiveSnapshot = ({
  metrics,
  isLoading,
}: {
  metrics: Array<{ title: string; value: string; helper: string; trend?: string; emphasize?: boolean }>;
  isLoading: boolean;
}) => (
  <div className="grid gap-4 lg:grid-cols-4">
    {metrics.map(metric => (
      <Card key={metric.title} className={metric.emphasize ? 'border-primary/70 shadow-sm' : undefined}>
        <CardHeader className="pb-2">
          <CardDescription>{metric.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-foreground">{isLoading ? '—' : metric.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{metric.helper}</p>
        </CardContent>
        {metric.trend && (
          <CardFooter className="pt-0">
            <span className="text-xs text-muted-foreground">{metric.trend}</span>
          </CardFooter>
        )}
      </Card>
    ))}
  </div>
);

const AIBriefingPanel = ({
  brief,
  loading,
  error,
  onRun,
  prompt,
}: {
  brief: AIBrief | null;
  loading: boolean;
  error: string | null;
  onRun: () => void;
  prompt: string;
}) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-start justify-between gap-3">
      <div className="space-y-1">
        <CardTitle>AI sample response</CardTitle>
        <CardDescription>Runs the Vercel AI SDK example prompt to verify connectivity.</CardDescription>
      </div>
      <Badge variant="outline">AI</Badge>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2 rounded-md border p-3 text-sm">
        <p className="font-semibold text-foreground">Prompt</p>
        <p className="text-muted-foreground">{prompt}</p>
        <Button variant="secondary" size="sm" onClick={onRun} disabled={loading}>
          {loading ? 'Running…' : 'Run prompt'}
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {error && !loading && (
        <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <p className="font-semibold">Request failed</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && brief && (
        <div className="space-y-3">
          <div className="space-y-2 rounded-md border bg-muted/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model output</p>
            <p className="whitespace-pre-wrap text-sm text-foreground">{brief.text || '—'}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {brief.model && <span>Model: {brief.model}</span>}
            {brief.requestId && <span>Request ID: {brief.requestId}</span>}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const RequestCommandCenter = ({
  requests,
  isLoading,
  showRelativeTimes,
}: {
  requests: ReturnType<typeof useServiceRequests>['requests'];
  isLoading: boolean;
  showRelativeTimes: boolean;
}) => {
  const grouped = useMemo(() => {
    const map = new Map<string, ReturnType<typeof useServiceRequests>['requests']>();
    requests.forEach(request => {
      const key = request.requestType ?? 'general';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(request);
    });
    return Array.from(map.entries());
  }, [requests]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations command center</CardTitle>
        <CardDescription>Track and triage active guest requests across departments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading requests…</p>}
        {!isLoading && grouped.length === 0 && (
          <p className="text-sm text-muted-foreground">No live requests at the moment. Great job!</p>
        )}
        {!isLoading &&
          grouped.map(([category, items]) => (
            <div key={category} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{asTitle(category)}</h3>
                  <p className="text-xs text-muted-foreground">{items.length} open</p>
                </div>
                <Badge variant="secondary">
                  {items.filter(item => item.priority === 'high' || item.priority === 'urgent').length} high
                </Badge>
              </div>
              <div className="space-y-3">
                {items.slice(0, 3).map(item => (
                  <div key={item.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Room {item.roomNumber ?? '—'}</p>
                      <Badge
                        variant={item.priority === 'high' || item.priority === 'urgent' ? 'destructive' : 'outline'}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.guestName ?? 'Guest'}</p>
                    <p className="mt-2 text-sm text-foreground">{item.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Assigned: {item.assignedStaff ?? 'Unassigned'}</span>
                      <span>
                        Age: {showRelativeTimes ? `${minutesSince(item.createdAt)} min` : '—'}
                      </span>
                      {item.eta && <Badge variant="outline">ETA {new Date(item.eta).toLocaleTimeString()}</Badge>}
                      {item.scheduled && <Badge variant="outline">Scheduled</Badge>}
                    </div>
                    {item.latestUpdate?.note && (
                      <p className="mt-2 text-xs italic text-muted-foreground">
                        Latest: {item.latestUpdate.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

const AutomationLogCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Automation log</CardTitle>
      <CardDescription>Recent AI-triggered workflows and follow-up requirements.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {AUTOMATION_LOG.map(entry => (
        <div key={entry.id} className="rounded-lg border p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{entry.time}</span>
            <Badge
              variant={
                entry.status === 'completed'
                  ? 'secondary'
                  : entry.status === 'scheduled'
                    ? 'outline'
                    : 'destructive'
              }
            >
              {entry.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-foreground">{entry.action}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);

const QuickActionsPanel = () => (
  <Card>
    <CardHeader>
      <CardTitle>Quick actions</CardTitle>
      <CardDescription>Shortcuts for concierge and operations workflows.</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-2 sm:grid-cols-2">
      {[
        {
          label: 'Concierge copilot',
          description: 'Open the AI concierge workspace for live guests.',
          href: '/guest-profiles',
        },
        {
          label: 'High-priority requests',
          description: 'Jump to unresolved high-priority tickets.',
          href: '/requests',
        },
        {
          label: 'Room control dashboard',
          description: 'Adjust climate, lighting, and service statuses.',
          href: '/room-control',
        },
        {
          label: 'Knowledge base',
          description: 'Reference SOPs and playbooks for unusual cases.',
          href: '/knowledge-base',
        },
      ].map(action => (
        <Button key={action.label} variant="outline" className="h-full flex-col items-start" asChild>
          <Link href={action.href}>
            <span className="font-semibold text-foreground">{action.label}</span>
            <span className="mt-1 text-xs text-muted-foreground">{action.description}</span>
          </Link>
        </Button>
      ))}
    </CardContent>
  </Card>
);

const GuestIntelligenceSpotlight = ({
  guests,
}: {
  guests: ReturnType<typeof useGuestProfiles>;
}) => {
  const vipGuests = useMemo(
    () =>
      guests
        .filter(guest => guest.vipStatus !== 'Standard')
        .slice(0, 3)
        .map(guest => ({
          id: guest.id,
          name: guest.name,
          room: guest.currentRoom ?? '—',
          nightsRemaining: guest.checkOut
            ? Math.max(0, Math.ceil((new Date(guest.checkOut).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : '—',
          loyaltyPoints: guest.loyaltyPoints,
          dining: (guest.preferences.dining ?? []).slice(0, 2).join(', ') || 'No dining notes',
          activities: (guest.preferences.activities ?? []).slice(0, 2).join(', ') || 'No activity notes',
        })),
    [guests],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Guest intelligence</CardTitle>
        <CardDescription>Key VIP guests to engage this shift.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {vipGuests.length === 0 && <p className="text-sm text-muted-foreground">No VIP guests on property.</p>}
        {vipGuests.map(guest => (
          <div key={guest.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{guest.name}</p>
                <p className="text-xs text-muted-foreground">Room {guest.room}</p>
              </div>
              <Badge variant="secondary">{guest.loyaltyPoints} pts</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">Nights remaining:</span> {guest.nightsRemaining}
              </span>
              <span>
                <span className="font-medium text-foreground">Dining:</span> {guest.dining}
              </span>
              <span>
                <span className="font-medium text-foreground">Activities:</span> {guest.activities}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const StaffCoverageCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Staff coverage</CardTitle>
      <CardDescription>On-duty vs. scheduled team members by department.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {STAFF_COVERAGE_DATA.map(item => (
        <div key={item.role} className="space-y-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.role}</span>
            <span>
              {item.onDuty}/{item.scheduled} on shift
            </span>
          </div>
          <Progress value={Math.round(item.coverage * 100)} className="h-2" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const ChannelMixCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Channel mix</CardTitle>
      <CardDescription>Distribution of tonight’s stays by booking channel.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {CHANNEL_MIX.map(channel => (
        <div key={channel.channel} className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{channel.channel}</span>
            <span>{channel.share}%</span>
          </div>
          <Progress value={channel.share} className="h-2" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const OccupancyHealthCard = ({
  occupiedRooms,
  totalRooms,
  housekeepingBacklog,
}: {
  occupiedRooms: number;
  totalRooms: number;
  housekeepingBacklog: number;
}) => {
  const occupancyRate = totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy health</CardTitle>
        <CardDescription>Snapshot of current room usage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Occupancy</span>
            <span>{occupancyRate}%</span>
          </div>
          <Progress value={occupancyRate} className="h-2" />
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-xs uppercase tracking-wide">Occupied rooms</p>
            <p className="text-lg font-semibold text-foreground">{occupiedRooms}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs uppercase tracking-wide">Total rooms</p>
            <p className="text-lg font-semibold text-foreground">{totalRooms}</p>
          </div>
          <div className="rounded-md border p-3 md:col-span-2">
            <p className="text-xs uppercase tracking-wide">Housekeeping backlog</p>
            <p className="text-lg font-semibold text-foreground">{housekeepingBacklog}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { requests, isLoading: requestsLoading } = useServiceRequests();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const guests = useGuestProfiles();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isLoading = requestsLoading || roomsLoading;

  const pendingRequests = useMemo(
    () => requests.filter(request => request.status !== 'completed' && request.status !== 'cancelled'),
    [requests],
  );

  const highPriorityRequests = useMemo(
    () => pendingRequests.filter(request => request.priority === 'high' || request.priority === 'urgent'),
    [pendingRequests],
  );

  const averageRequestAge = useMemo(() => {
    if (!isHydrated || requests.length === 0) return null;
    const totalMinutes = requests.reduce((total, request) => total + minutesSince(request.createdAt), 0);
    return Math.max(1, Math.round(totalMinutes / requests.length));
  }, [isHydrated, requests]);

  const occupiedRooms = useMemo(() => rooms.filter(room => room.status === 'occupied'), [rooms]);
  const occupancyRate = rooms.length === 0 ? 0 : Math.round((occupiedRooms.length / rooms.length) * 100);

  const arrivalsToday = useMemo(() => {
    if (!isHydrated) return null;
    const today = new Date().toDateString();
    return guests.filter(guest => guest.checkIn && new Date(guest.checkIn).toDateString() === today).length;
  }, [guests, isHydrated]);

  const departuresToday = useMemo(() => {
    if (!isHydrated) return null;
    const today = new Date().toDateString();
    return guests.filter(guest => guest.checkOut && new Date(guest.checkOut).toDateString() === today).length;
  }, [guests, isHydrated]);

  const estimatedRevenue = useMemo(
    () => guests.reduce((total, guest) => total + (guest.loyaltyPoints ?? 0) * 18, 0),
    [guests],
  );

  const housekeepingBacklog = useMemo(
    () => rooms.filter(room => room.housekeepingStatus !== 'cleaned' && room.status !== 'vacant').length,
    [rooms],
  );

  const { brief: aiBrief, loading: aiLoading, error: aiError, run: runAIBrief, lastPrompt: aiPrompt } =
    useDashboardAIBrief();

  const metrics = [
    {
      title: 'Occupancy rate',
      value: formatPercentage(occupancyRate),
      helper: `${occupiedRooms.length} of ${rooms.length} rooms occupied`,
      trend:
        arrivalsToday != null && departuresToday != null
          ? arrivalsToday > departuresToday
            ? 'Positive pickup vs. departures'
            : 'Monitor checkout volume'
          : 'Monitoring arrivals/departures',
      emphasize: true,
    },
    {
      title: 'Active guest requests',
      value: pendingRequests.length.toString(),
      helper: `${highPriorityRequests.length} high priority tickets`,
    },
    {
      title: 'Avg. request age',
      value: averageRequestAge != null ? `${averageRequestAge}m` : '—',
      helper: 'Time since creation across active tickets',
    },
    {
      title: 'Revenue pacing',
      value: formatCurrency(estimatedRevenue),
      helper: 'Estimated from loyalty engagement',
    },
  ];

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-6">
        <ExecutiveSnapshot metrics={metrics} isLoading={true} />
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <AIBriefingPanel
              brief={null}
              loading={true}
              error={null}
              onRun={() => runAIBrief()}
              prompt={aiPrompt}
            />
            <RequestCommandCenter requests={pendingRequests} isLoading={true} showRelativeTimes={false} />
            <AutomationLogCard />
          </div>
          <div className="space-y-6">
            <OccupancyHealthCard occupiedRooms={0} totalRooms={rooms.length} housekeepingBacklog={0} />
            <GuestIntelligenceSpotlight guests={guests} />
            <QuickActionsPanel />
            <Card>
              <CardHeader>
                <CardTitle>Arrivals & departures</CardTitle>
                <CardDescription>Guest flow today to prep concierge touchpoints.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase tracking-wide">Arrivals today</p>
                  <p className="text-lg font-semibold text-foreground">—</p>
                  <p className="text-xs text-muted-foreground">Coordinate welcome amenities.</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase tracking-wide">Departures today</p>
                  <p className="text-lg font-semibold text-foreground">—</p>
                  <p className="text-xs text-muted-foreground">Plan express checkout support.</p>
                </div>
              </CardContent>
            </Card>
            <ChannelMixCard />
            <StaffCoverageCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ExecutiveSnapshot metrics={metrics} isLoading={isLoading} />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <AIBriefingPanel
            brief={aiBrief}
            loading={aiLoading}
            error={aiError}
            onRun={() => runAIBrief()}
            prompt={aiPrompt}
          />
          <RequestCommandCenter
            requests={pendingRequests}
            isLoading={isLoading}
            showRelativeTimes={isHydrated}
          />
          <AutomationLogCard />
        </div>

        <div className="space-y-6">
          <OccupancyHealthCard
            occupiedRooms={occupiedRooms.length}
            totalRooms={rooms.length}
            housekeepingBacklog={housekeepingBacklog}
          />
          <GuestIntelligenceSpotlight guests={guests} />
          <QuickActionsPanel />
          <Card>
            <CardHeader>
              <CardTitle>Arrivals & departures</CardTitle>
              <CardDescription>Guest flow today to prep concierge touchpoints.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="text-xs uppercase tracking-wide">Arrivals today</p>
                <p className="text-lg font-semibold text-foreground">{arrivalsToday ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Coordinate welcome amenities.</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs uppercase tracking-wide">Departures today</p>
                <p className="text-lg font-semibold text-foreground">{departuresToday ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Plan express checkout support.</p>
              </div>
            </CardContent>
          </Card>
          <ChannelMixCard />
          <StaffCoverageCard />
        </div>
      </div>
    </div>
  );
}
