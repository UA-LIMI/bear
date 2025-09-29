import { useEffect, useMemo, useState } from 'react';
import type { GuestProfile } from '@/types/guest';
import type { WeatherData } from '@/types/weather';
import type { VoiceContextSection } from '@/types/voice';

export interface GuestContextOptions {
  includeWeather?: boolean;
}

export interface UseGuestContextResult {
  sections: VoiceContextSection[];
  selectedSections: VoiceContextSection[];
  toggleSection: (id: string) => void;
  updateSectionPayload: (id: string, payload: Record<string, unknown>) => void;
  setAllEnabled: (enabled: boolean) => void;
}

const buildSectionPayloads = (
  guest: GuestProfile | null,
  weather: WeatherData | null
): VoiceContextSection[] => {
  const sections: VoiceContextSection[] = [];

  if (guest) {
    sections.push({
      id: 'guest-profile',
      title: 'Guest Profile',
      description: 'Name, role, membership tier, loyalty points, and guest type.',
      enabled: true,
      required: true,
      payload: {
        name: guest.name,
        occupation: guest.profile?.occupation,
        membershipTier: guest.membershipTier,
        loyaltyPoints: guest.loyaltyPoints,
        guestType: guest.guestType,
      },
    });

    if (guest.stayInfo) {
      sections.push({
        id: 'room-info',
        title: 'Room & Location',
        description: 'Room number, hotel name, and current location details.',
        enabled: true,
        payload: {
          hotel: guest.stayInfo.hotel,
          room: guest.stayInfo.room,
          location: guest.stayInfo.location,
        },
      });
    }
  }

  if (weather) {
    sections.push({
      id: 'weather',
      title: 'Live Weather',
      description: 'Temperature, conditions, humidity, and data source.',
      enabled: true,
      payload: {
        temperature: weather.temp,
        condition: weather.condition,
        humidity: weather.humidity,
        source: weather.source,
        isLive: weather.isLive,
      },
    });
  }

  sections.push({
    id: 'voice-guidelines',
    title: 'Voice Interaction Guidelines',
    description: 'Tone, word count, confirmation rules, and language policies.',
    enabled: true,
    required: true,
    payload: {
      maxWords: 60,
      confirmBeforeRoomChanges: true,
      useGuestName: true,
      interruptionResponse: 'Yes, what can I help you with?',
    },
  });

  sections.push({
    id: 'hotel-services',
    title: 'Hotel Services Catalogue',
    description: 'Lighting presets, room service, concierge, and transportation options.',
    enabled: true,
    payload: {
      lightingPresets: ['Romantic Candle (FX=88)', 'Work Light (#FFFFFF)', 'Turn Off'],
      services: ['Room Service', 'Concierge', 'Transportation'],
    },
  });

  return sections;
};

export const useGuestContext = (
  guest: GuestProfile | null,
  weather: WeatherData | null,
  _options: GuestContextOptions = {}
): UseGuestContextResult => {
  const initialSections = useMemo(() => buildSectionPayloads(guest, weather), [guest, weather]);
  const [sections, setSections] = useState<VoiceContextSection[]>(initialSections);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const selectedSections = useMemo(
    () => sections.filter((section) => section.enabled),
    [sections]
  );

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === id) {
          if (section.required) return section;
          return { ...section, enabled: !section.enabled };
        }
        return section;
      })
    );
  };

  const updateSectionPayload = (id: string, payload: Record<string, unknown>) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, payload: { ...section.payload, ...payload } } : section
      )
    );
  };

  const setAllEnabled = (enabled: boolean) => {
    setSections((prev) =>
      prev.map((section) =>
        section.required ? section : { ...section, enabled }
      )
    );
  };

  return {
    sections,
    selectedSections,
    toggleSection,
    updateSectionPayload,
    setAllEnabled,
  };
};
