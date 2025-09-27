"use client";

import { FormEvent, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { useGuestProfiles } from '@/features/guest-profiles/hooks/useGuestProfiles';
import type { GuestEntity, GuestProfile, GuestPreferences, GuestSummary } from '@/lib/types/supabase';

type FormState = {
  name: string;
  email: string;
  phone: string;
  vipStatus: string;
  currentRoom: string;
  checkIn: string;
  checkOut: string;
  notes: string;
  dining: string;
  activities: string;
  roomService: string;
};

const emptyFormState: FormState = {
  name: '',
  email: '',
  phone: '',
  vipStatus: 'Standard',
  currentRoom: '',
  checkIn: '',
  checkOut: '',
  notes: '',
  dining: '',
  activities: '',
  roomService: '',
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const createFormStateFromProfile = (profile: GuestProfile): FormState => ({
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  vipStatus: profile.vipStatus,
  currentRoom: profile.currentRoom ?? '',
  checkIn: profile.checkIn ?? '',
  checkOut: profile.checkOut ?? '',
  notes: profile.notes ?? '',
  dining: (profile.preferences.dining ?? []).join(', '),
  activities: (profile.preferences.activities ?? []).join(', '),
  roomService: (profile.preferences.roomService ?? []).join(', '),
});

const parsePreferences = (state: FormState): GuestPreferences => ({
  dining: state.dining
    .split(',')
    .map(item => item.trim())
    .filter(Boolean),
  activities: state.activities
    .split(',')
    .map(item => item.trim())
    .filter(Boolean),
  roomService: state.roomService
    .split(',')
    .map(item => item.trim())
    .filter(Boolean),
});

type GuestProfileCardProps = {
  guest: GuestProfile;
  selected: boolean;
  onSelect: () => void;
};

const GuestProfileCard = ({ guest, selected, onSelect }: GuestProfileCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'w-full rounded-lg border p-4 text-left transition-colors',
      selected ? 'border-primary bg-primary/10' : 'hover:bg-muted'
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-foreground">{guest.name}</p>
        <p className="text-sm text-muted-foreground">Room {guest.currentRoom ?? '—'}</p>
      </div>
      <Badge variant="secondary" className="capitalize">
        {guest.vipStatus || 'standard'}
      </Badge>
    </div>

    <Separator className="my-3" />

    <dl className="space-y-1 text-sm text-muted-foreground">
      <div className="flex items-center justify-between gap-2">
        <dt>Email</dt>
        <dd className="text-foreground">{guest.email}</dd>
      </div>
      <div className="flex items-center justify-between gap-2">
        <dt>Phone</dt>
        <dd className="text-foreground">{guest.phone || '—'}</dd>
      </div>
      <div className="flex items-center justify-between gap-2">
        <dt>Check-out</dt>
        <dd className="text-foreground">{formatDate(guest.checkOut)}</dd>
      </div>
    </dl>
  </button>
);

type SummaryListProps = {
  items: GuestSummary[];
};

const SummaryList = ({ items }: SummaryListProps) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No AI summaries available.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map(summary => (
        <div key={summary.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-foreground">{summary.title}</p>
            <span className="text-xs text-muted-foreground">{formatDate(summary.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{summary.content}</p>
          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {summary.keyPoints.map(point => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

type EntityListProps = {
  items: GuestEntity[];
};

const EntityList = ({ items }: EntityListProps) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No guest intelligence captured yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map(entity => (
        <div key={entity.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-foreground">{entity.name}</p>
            <Badge variant="outline" className="capitalize">
              {entity.entityType}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Category: {entity.category}</p>
          {entity.metadata && Object.keys(entity.metadata).length > 0 && (
            <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
              {Object.entries(entity.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <dt className="capitalize">{key}</dt>
                  <dd className="text-foreground">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </div>
  );
};

type GuestProfileFormProps = {
  formState: FormState;
  error: string | null;
  loading: boolean;
  confirmLabel: string;
  onChange: (state: FormState) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const GuestProfileForm = ({
  formState,
  error,
  loading,
  confirmLabel,
  onChange,
  onSubmit,
  onClose,
}: GuestProfileFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-6">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="name"
            value={formState.name}
            onChange={event => onChange({ ...formState, name: event.target.value })}
            placeholder="Guest name"
            required
          />
          <Input
            name="email"
            type="email"
            value={formState.email}
            onChange={event => onChange({ ...formState, email: event.target.value })}
            placeholder="Email"
            required
          />
          <Input
            name="phone"
            value={formState.phone}
            onChange={event => onChange({ ...formState, phone: event.target.value })}
            placeholder="Phone"
          />
          <Input
            name="vipStatus"
            value={formState.vipStatus}
            onChange={event => onChange({ ...formState, vipStatus: event.target.value })}
            placeholder="VIP status"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="currentRoom"
            value={formState.currentRoom}
            onChange={event => onChange({ ...formState, currentRoom: event.target.value })}
            placeholder="Current room"
          />
          <Input
            name="checkIn"
            value={formState.checkIn}
            onChange={event => onChange({ ...formState, checkIn: event.target.value })}
            placeholder="Check-in (ISO date)"
          />
          <Input
            name="checkOut"
            value={formState.checkOut}
            onChange={event => onChange({ ...formState, checkOut: event.target.value })}
            placeholder="Check-out (ISO date)"
          />
        </div>

        <div className="grid gap-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-foreground">Notes</span>
            <textarea
              name="notes"
              value={formState.notes}
              onChange={event => onChange({ ...formState, notes: event.target.value })}
              placeholder="Internal notes"
              className="h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </label>
        </div>

        <Separator />

        <div className="grid gap-4">
          <p className="text-sm font-semibold text-foreground">Preferences (comma-separated)</p>
          <Input
            name="dining"
            value={formState.dining}
            onChange={event => onChange({ ...formState, dining: event.target.value })}
            placeholder="Dining preferences"
          />
          <Input
            name="activities"
            value={formState.activities}
            onChange={event => onChange({ ...formState, activities: event.target.value })}
            placeholder="Activity preferences"
          />
          <Input
            name="roomService"
            value={formState.roomService}
            onChange={event => onChange({ ...formState, roomService: event.target.value })}
            placeholder="Room service preferences"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <SheetFooter className="mt-auto flex flex-row items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : confirmLabel}
        </Button>
      </SheetFooter>
    </form>
  );
};

export const GuestProfilesModule = () => {
  const {
    guestProfiles,
    isLoading,
    createGuestProfile,
    updateGuestProfile,
    isCreatingGuest,
    isUpdatingGuest,
  } = useGuestProfiles();

  const guests = useMemo(
    () => guestProfiles.filter(guest => Boolean(guest.currentRoom)),
    [guestProfiles],
  );

  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedGuest = useMemo(() => {
    if (!selectedGuestId && guests.length > 0) {
      return guests[0];
    }

    return guests.find(guest => guest.id === selectedGuestId) ?? null;
  }, [guests, selectedGuestId]);

  const handleOpenCreate = () => {
    setFormState(emptyFormState);
    setFormError(null);
    setCreateOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedGuest) {
      return;
    }

    setFormState(createFormStateFromProfile(selectedGuest));
    setFormError(null);
    setEditOpen(true);
  };

  const handleCloseModals = () => {
    setCreateOpen(false);
    setEditOpen(false);
    setFormState(emptyFormState);
    setFormError(null);
  };

  const handleSubmitCreate = async () => {
    if (!formState.name || !formState.email) {
      setFormError('Name and email are required.');
      return;
    }

    try {
      await createGuestProfile({
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        vipStatus: formState.vipStatus.trim() || 'Standard',
        currentRoom: formState.currentRoom.trim() || null,
        checkIn: formState.checkIn || null,
        checkOut: formState.checkOut || null,
        notes: formState.notes || null,
        preferences: parsePreferences(formState),
      });
      handleCloseModals();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create guest profile.');
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedGuest) {
      return;
    }

    if (!formState.name || !formState.email) {
      setFormError('Name and email are required.');
      return;
    }

    try {
      await updateGuestProfile(selectedGuest.id, {
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        vipStatus: formState.vipStatus.trim() || selectedGuest.vipStatus,
        currentRoom: formState.currentRoom.trim() || null,
        checkIn: formState.checkIn || null,
        checkOut: formState.checkOut || null,
        notes: formState.notes || null,
        preferences: parsePreferences(formState),
      });
      handleCloseModals();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to update guest profile.');
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guest profiles</h1>
          <p className="text-sm text-muted-foreground">
            Manage in-house guests, personalize their stay, and review AI insights.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>Create guest</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading guests…</p>
      ) : guests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No checked-in guests found.</p>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <ScrollArea className="h-[70vh] rounded-lg border lg:w-1/3">
            <div className="space-y-3 p-3">
              {guests.map(guest => (
                <GuestProfileCard
                  key={guest.id}
                  guest={guest}
                  selected={selectedGuest?.id === guest.id}
                  onSelect={() => setSelectedGuestId(guest.id)}
                />
              ))}
            </div>
          </ScrollArea>

          <div className="flex-1">
            {selectedGuest ? (
              <Card className="h-full">
                <Tabs defaultValue="overview" className="flex h-full flex-col">
                  <div className="flex flex-col gap-4 border-b p-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        {selectedGuest.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Room {selectedGuest.currentRoom ?? '—'} · {selectedGuest.language}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 lg:items-end">
                      <Button variant="outline" onClick={handleOpenEdit}>
                        Edit profile
                      </Button>
                      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="rounded-md border p-3">
                          <p className="text-xs uppercase tracking-wide">Loyalty points</p>
                          <p className="text-lg font-semibold text-foreground">
                            {selectedGuest.loyaltyPoints}
                          </p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-xs uppercase tracking-wide">Visit count</p>
                          <p className="text-lg font-semibold text-foreground">
                            {selectedGuest.visitCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b px-6 pb-0 pt-4">
                    <TabsList className="grid w-full gap-2 bg-transparent p-0 text-muted-foreground sm:w-auto sm:grid-cols-3">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="summaries" className="data-[state=active]:bg-background">
                        AI summaries
                        <Badge variant="secondary" className="ml-2">
                          {selectedGuest.summary.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="intelligence" className="data-[state=active]:bg-background">
                        Guest intelligence
                        <Badge variant="secondary" className="ml-2">
                          {selectedGuest.entities.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <TabsContent value="overview" className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Contact
                        </h3>
                        <dl className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center justify-between gap-2">
                            <dt>Email</dt>
                            <dd className="text-foreground">{selectedGuest.email}</dd>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <dt>Phone</dt>
                            <dd className="text-foreground">{selectedGuest.phone || '—'}</dd>
                          </div>
                        </dl>
                      </section>

                      <Separator />

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Stay details
                        </h3>
                        <dl className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center justify-between gap-2">
                            <dt>Check-in</dt>
                            <dd className="text-foreground">{formatDate(selectedGuest.checkIn)}</dd>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <dt>Check-out</dt>
                            <dd className="text-foreground">{formatDate(selectedGuest.checkOut)}</dd>
                          </div>
                        </dl>
                      </section>

                      <Separator />

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Preferences
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>
                            <span className="font-medium text-foreground">Dining:</span>{' '}
                            {(selectedGuest.preferences.dining ?? []).join(', ') || '—'}
                          </li>
                          <li>
                            <span className="font-medium text-foreground">Activities:</span>{' '}
                            {(selectedGuest.preferences.activities ?? []).join(', ') || '—'}
                          </li>
                          <li>
                            <span className="font-medium text-foreground">Room service:</span>{' '}
                            {(selectedGuest.preferences.roomService ?? []).join(', ') || '—'}
                          </li>
                        </ul>
                      </section>

                      {selectedGuest.notes && (
                        <>
                          <Separator />
                          <section className="space-y-2">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              Notes
                            </h3>
                            <p className="text-sm text-muted-foreground">{selectedGuest.notes}</p>
                          </section>
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="summaries" className="space-y-3">
                      <SummaryList items={selectedGuest.summary} />
                    </TabsContent>

                    <TabsContent value="intelligence" className="space-y-3">
                      <EntityList items={selectedGuest.entities} />
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">Select a guest to view details.</p>
            )}
          </div>
        </div>
      )}

      <Sheet
        open={isCreateOpen}
        onOpenChange={open => {
          if (!open) {
            handleCloseModals();
          } else {
            setCreateOpen(true);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Create guest profile</SheetTitle>
            <SheetDescription>Fill in guest details and preferences.</SheetDescription>
          </SheetHeader>
          <GuestProfileForm
            formState={formState}
            error={formError}
            loading={isCreatingGuest}
            confirmLabel="Create"
            onChange={setFormState}
            onSubmit={handleSubmitCreate}
            onClose={handleCloseModals}
          />
        </SheetContent>
      </Sheet>

      <Sheet
        open={isEditOpen}
        onOpenChange={open => {
          if (!open) {
            handleCloseModals();
          } else {
            setEditOpen(true);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Edit guest profile</SheetTitle>
            <SheetDescription>Update guest contact details and stay preferences.</SheetDescription>
          </SheetHeader>
          <GuestProfileForm
            formState={formState}
            error={formError}
            loading={isUpdatingGuest}
            confirmLabel="Save changes"
            onChange={setFormState}
            onSubmit={handleSubmitEdit}
            onClose={handleCloseModals}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
