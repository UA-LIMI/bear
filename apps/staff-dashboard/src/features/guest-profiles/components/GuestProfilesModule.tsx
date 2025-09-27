"use client";

import { useMemo, useState } from 'react';
import { Badge, Button, Card, Divider, Modal, Text, TextField, View } from 'reshaped';

import { useGuestProfiles } from '@/features/guest-profiles/hooks/useGuestProfiles';
import type { GuestEntity, GuestProfile, GuestPreferences, GuestSummary } from '@/lib/types/supabase';

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

const GuestProfileCard = ({
  guest,
  selected,
  onSelect,
}: {
  guest: GuestProfile;
  selected: boolean;
  onSelect: () => void;
}) => (
  <Card elevated={selected} onClick={onSelect} className="cursor-pointer">
    <View direction="column" gap={3}>
      <View direction="row" justify="space-between" align="center">
        <View direction="column" gap={1}>
          <Text variant="body-2" weight="bold">
            {guest.name}
          </Text>
          <Text variant="caption-1">Room {guest.currentRoom ?? '—'}</Text>
        </View>
        <Badge>{guest.vipStatus}</Badge>
      </View>
      <Divider />
      <View direction="column" gap={1}>
        <Text variant="caption-1">Email: {guest.email}</Text>
        <Text variant="caption-1">Phone: {guest.phone || '—'}</Text>
        <Text variant="caption-1">Check-out: {formatDate(guest.checkOut)}</Text>
      </View>
    </View>
  </Card>
);

const SummaryList = ({ items }: { items: GuestSummary[] }) => {
  if (items.length === 0) {
    return <Text variant="body-2">No AI summaries available.</Text>;
  }

  return (
    <View direction="column" gap={3}>
      {items.map(summary => (
        <Card key={summary.id} padding={{ s: 3 }}>
          <View direction="column" gap={2}>
            <Text variant="body-2" weight="bold">
              {summary.title}
            </Text>
            <Text variant="caption-1" color="neutral-faded">
              {formatDate(summary.createdAt)}
            </Text>
            <Text variant="body-2">{summary.content}</Text>
            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <View direction="column" gap={1}>
                <Text variant="caption-1" color="neutral-faded">
                  Key points
                </Text>
                <View direction="column" gap={0.5}>
                  {summary.keyPoints.map(point => (
                    <Text key={point} variant="caption-1">
                      • {point}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Card>
      ))}
    </View>
  );
};

const EntityList = ({ items }: { items: GuestEntity[] }) => {
  if (items.length === 0) {
    return <Text variant="body-2">No guest intelligence captured yet.</Text>;
  }

  return (
    <View direction="column" gap={3}>
      {items.map(entity => (
        <Card key={entity.id} padding={{ s: 3 }}>
          <View direction="column" gap={2}>
            <View direction="row" justify="space-between" align="center">
              <Text variant="body-2" weight="bold">
                {entity.name}
              </Text>
              <Badge>{entity.entityType}</Badge>
            </View>
            <Text variant="caption-1" color="neutral-faded">
              Category: {entity.category}
            </Text>
            {entity.metadata && Object.keys(entity.metadata).length > 0 && (
              <View direction="column" gap={1}>
                {Object.entries(entity.metadata).map(([key, value]) => (
                  <Text key={key} variant="caption-1">
                    <strong>{key}:</strong> {String(value)}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </Card>
      ))}
    </View>
  );
};

type GuestProfileModalProps = {
  title: string;
  confirmLabel: string;
  loading: boolean;
  open: boolean;
  formState: FormState;
  error: string | null;
  onChange: (state: FormState) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const GuestProfileModal = ({
  title,
  confirmLabel,
  loading,
  open,
  formState,
  error,
  onChange,
  onClose,
  onSubmit,
}: GuestProfileModalProps) => (
  <Modal active={open} onClose={onClose} position="center" size={{ s: '100%', l: '640px' }}>
    <View direction="column" gap={4} padding={{ s: 4 }}>
      <View direction="column" gap={1}>
        <Text variant="title-6" weight="bold">
          {title}
        </Text>
        <Text variant="caption-1" color="neutral-faded">
          Fill in guest details and preferences.
        </Text>
      </View>

      <View direction="column" gap={3}>
        <TextField
          name="name"
          value={formState.name}
          onChange={({ value }) => onChange({ ...formState, name: value })}
          placeholder="Guest name"
        />
        <TextField
          name="email"
          value={formState.email}
          onChange={({ value }) => onChange({ ...formState, email: value })}
          placeholder="Email"
        />
        <TextField
          name="phone"
          value={formState.phone}
          onChange={({ value }) => onChange({ ...formState, phone: value })}
          placeholder="Phone"
        />
        <TextField
          name="vipStatus"
          value={formState.vipStatus}
          onChange={({ value }) => onChange({ ...formState, vipStatus: value })}
          placeholder="VIP status"
        />
        <TextField
          name="currentRoom"
          value={formState.currentRoom}
          onChange={({ value }) => onChange({ ...formState, currentRoom: value })}
          placeholder="Current room"
        />
        <View direction={{ s: 'column', l: 'row' }} gap={3}>
          <TextField
            name="checkIn"
            value={formState.checkIn}
            onChange={({ value }) => onChange({ ...formState, checkIn: value })}
            placeholder="Check-in (ISO date)"
          />
          <TextField
            name="checkOut"
            value={formState.checkOut}
            onChange={({ value }) => onChange({ ...formState, checkOut: value })}
            placeholder="Check-out (ISO date)"
          />
        </View>
        <TextField
          name="notes"
          value={formState.notes}
          onChange={({ value }) => onChange({ ...formState, notes: value })}
          placeholder="Notes"
          multiline
        />
      </View>

      <Divider />

      <View direction="column" gap={3}>
        <Text variant="body-2" weight="bold">
          Preferences (comma-separated)
        </Text>
        <TextField
          name="dining"
          value={formState.dining}
          onChange={({ value }) => onChange({ ...formState, dining: value })}
          placeholder="Dining preferences"
        />
        <TextField
          name="activities"
          value={formState.activities}
          onChange={({ value }) => onChange({ ...formState, activities: value })}
          placeholder="Activity preferences"
        />
        <TextField
          name="roomService"
          value={formState.roomService}
          onChange={({ value }) => onChange({ ...formState, roomService: value })}
          placeholder="Room service preferences"
        />
      </View>

      {error && (
        <Text variant="caption-1" color="critical">
          {error}
        </Text>
      )}

      <View direction="row" justify="end" gap={2}>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="solid" color="primary" onClick={onSubmit} disabled={loading}>
          {loading ? 'Saving…' : confirmLabel}
        </Button>
      </View>
    </View>
  </Modal>
);

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

  const selectedGuest = useMemo(() => {
    if (!selectedGuestId && guests.length > 0) {
      return guests[0];
    }

    return guests.find(guest => guest.id === selectedGuestId) ?? null;
  }, [guests, selectedGuestId]);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [formError, setFormError] = useState<string | null>(null);

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
    <View direction="column" gap={6} className="min-h-full">
      <View direction="row" justify="space-between" align="center">
        <Text variant="title-4" weight="bold">
          Guest profiles
        </Text>
        <Button onClick={handleOpenCreate} color="primary" variant="solid">
          Create guest
        </Button>
      </View>

      {isLoading ? (
        <Text variant="body-2">Loading guests…</Text>
      ) : guests.length === 0 ? (
        <Text variant="body-2">No checked-in guests found.</Text>
      ) : (
        <View direction={{ s: 'column', l: 'row' }} gap={6} className="w-full">
          <View
            width={{ s: '100%', l: '32%' }}
            direction="column"
            gap={3}
            className="max-h-[70vh] overflow-y-auto pr-2"
          >
            {guests.map(guest => (
              <GuestProfileCard
                key={guest.id}
                guest={guest}
                selected={selectedGuest?.id === guest.id}
                onSelect={() => setSelectedGuestId(guest.id)}
              />
            ))}
          </View>

          <View width={{ s: '100%', l: '68%' }} direction="column" gap={4}>
            {selectedGuest ? (
              <Card padding={{ s: 4 }}>
                <View direction="column" gap={4}>
                  <View direction="row" justify="space-between" align="center">
                    <View direction="column" gap={1}>
                      <Text variant="title-6" weight="bold">
                        {selectedGuest.name}
                      </Text>
                      <Text variant="caption-1" color="neutral-faded">
                        Room {selectedGuest.currentRoom ?? '—'} • {selectedGuest.language}
                      </Text>
                    </View>
                    <Button variant="outline" onClick={handleOpenEdit}>
                      Edit profile
                    </Button>
                  </View>

                  <Divider />

                  <View direction="column" gap={3}>
                    <Text variant="body-2" weight="bold">
                      Contact
                    </Text>
                    <View direction="column" gap={1}>
                      <Text variant="caption-1">Email: {selectedGuest.email}</Text>
                      <Text variant="caption-1">Phone: {selectedGuest.phone || '—'}</Text>
                    </View>
                  </View>

                  <Divider />

                  <View direction="column" gap={3}>
                    <Text variant="body-2" weight="bold">
                      Stay details
                    </Text>
                    <View direction="column" gap={1}>
                      <Text variant="caption-1">Check-in: {formatDate(selectedGuest.checkIn)}</Text>
                      <Text variant="caption-1">Check-out: {formatDate(selectedGuest.checkOut)}</Text>
                      <Text variant="caption-1">Loyalty points: {selectedGuest.loyaltyPoints}</Text>
                      <Text variant="caption-1">Visit count: {selectedGuest.visitCount}</Text>
                    </View>
                  </View>

                  <Divider />

                  <View direction="column" gap={3}>
                    <Text variant="body-2" weight="bold">
                      Preferences
                    </Text>
                    <View direction="column" gap={1}>
                      <Text variant="caption-1">
                        Dining: {(selectedGuest.preferences.dining ?? []).join(', ') || '—'}
                      </Text>
                      <Text variant="caption-1">
                        Activities: {(selectedGuest.preferences.activities ?? []).join(', ') || '—'}
                      </Text>
                      <Text variant="caption-1">
                        Room service: {(selectedGuest.preferences.roomService ?? []).join(', ') || '—'}
                      </Text>
                    </View>
                  </View>

                  {selectedGuest.notes && (
                    <>
                      <Divider />
                      <View direction="column" gap={2}>
                        <Text variant="body-2" weight="bold">
                          Notes
                        </Text>
                        <Text variant="caption-1">{selectedGuest.notes}</Text>
                      </View>
                    </>
                  )}

                  <Divider />

                  <View direction="column" gap={3}>
                    <Text variant="body-2" weight="bold">
                      AI summaries
                    </Text>
                    <SummaryList items={selectedGuest.summary} />
                  </View>

                  <Divider />

                  <View direction="column" gap={3}>
                    <Text variant="body-2" weight="bold">
                      Guest intelligence
                    </Text>
                    <EntityList items={selectedGuest.entities} />
                  </View>
                </View>
              </Card>
            ) : (
              <Text variant="body-2">Select a guest to view details.</Text>
            )}
          </View>
        </View>
      )}

      <GuestProfileModal
        title="Create guest profile"
        confirmLabel="Create"
        loading={isCreatingGuest}
        open={isCreateOpen}
        formState={formState}
        error={formError}
        onChange={setFormState}
        onClose={handleCloseModals}
        onSubmit={handleSubmitCreate}
      />

      <GuestProfileModal
        title="Edit guest profile"
        confirmLabel="Save changes"
        loading={isUpdatingGuest}
        open={isEditOpen}
        formState={formState}
        error={formError}
        onChange={setFormState}
        onClose={handleCloseModals}
        onSubmit={handleSubmitEdit}
      />
    </View>
  );
};
