/**
 * LIMI AI x Hotels - Modular Guest Interface
 * Clean, user-differentiated hotel guest experience
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GuestLayout } from '@/components/guest/GuestLayout';
import { RoomControls } from '@/components/guest/RoomControls';
import { GuestInfoPanel } from '@/components/guest/GuestInfoPanel';
import { ChatInterface } from '@/components/ChatInterface';
import { VoiceInterface } from '@/components/VoiceInterface';

interface GuestProfile {
  id: string;
  name: string;
  status: 'inRoom' | 'bookedOffsite' | 'notLinked';
  membershipTier: string;
  profile: { occupation: string; aiPrompt: string; };
  stayInfo?: { hotel: string; room?: string; location?: string; };
  loyaltyPoints?: number;
  guestType?: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  source?: string;
  isLive?: boolean;
  lastUpdated?: string;
  error?: string;
}

interface HotelEvent {
  time: string;
  event: string;
  description?: string;
  type?: string;
}

export default function GuestInterface() {
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<GuestProfile[]>([]);
  const [refreshingWeather, setRefreshingWeather] = useState(false);

  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    condition: '',
    humidity: 0,
    isLive: false,
    source: 'loading',
    error: undefined
  });

  const [hotelEvents, setHotelEvents] = useState<HotelEvent[]>([]);
  const [uiComponents, setUiComponents] = useState<Array<{name: string; priority: number; visible: boolean; position: string}>>([]);
  const [uiTextContent, setUiTextContent] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGuestProfiles();
    loadWeather();
    loadEvents();
    loadUIConfiguration();
  }, []);

  // Load user-specific UI configuration from database
  const loadUIConfiguration = async (guestId?: string, guestType?: string) => {
    try {
      if (!guestId || !guestType) {
        setUiTextContent({
          voice_connected: 'Voice Connected to LIMI AI',
          voice_disconnected: 'Voice Disconnected', 
          loading_guests: 'Loading Hong Kong guests...',
          welcome_title: 'Welcome to The Peninsula Hong Kong',
          ai_assistant_name: 'LIMI AI Assistant',
          room_controls_title: 'Room Controls',
          weather_title: 'Hong Kong Weather',
          events_title: 'Today&apos;s Events',
          processing_message: 'LIMI AI is thinking...'
        });
        return;
      }

      const response = await fetch('/api/get-ui-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: guestId,
          guestType: guestType,
          screenSize: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUiTextContent(result.textContent);
        setUiComponents(result.components);
        console.log(`✅ Loaded UI config for ${guestType} guest:`, result.components.length, 'components');
      }
    } catch (error) {
      console.error('UI configuration loading failed:', error);
    }
  };

  const loadWeather = async () => {
    try {
      const response = await fetch(`/api/get-weather?location=${encodeURIComponent('Hong Kong')}`);
      const result = await response.json();
      if (result?.success && result.weather) {
        setWeather({
          temp: Math.round(result.weather.temp),
          condition: result.weather.condition,
          humidity: result.weather.humidity,
          isLive: true,
          source: result.source,
          lastUpdated: new Date().toISOString(),
          error: undefined
        });
        console.log('✅ Live weather loaded:', result.source);
      } else {
        setWeather({
          temp: 26, 
          condition: 'Partly Cloudy', 
          humidity: 70,
          isLive: false,
          source: 'api_failed',
          error: 'Weather API returned no data',
          lastUpdated: new Date().toISOString()
        });
        console.warn('⚠️ Weather API failed, using fallback data');
      }
    } catch (error) {
      console.error('Weather loading failed:', error);
      setWeather({ 
        temp: 26, 
        condition: 'Partly Cloudy', 
        humidity: 70,
        isLive: false,
        source: 'network_error',
        error: `Network error: ${error}`,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const refreshWeather = async () => {
    setRefreshingWeather(true);
    await loadWeather();
    setRefreshingWeather(false);
  };

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/get-hotel-events');
      const result = await response.json();
      if (result.success) {
        const formattedEvents = result.events.map((event: Record<string, unknown>) => ({
          time: new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString('en-US', { 
            hour: 'numeric', minute: '2-digit', hour12: true 
          }),
          event: event.event_name as string,
          description: event.event_description as string,
          type: event.event_type as string
        }));
        setHotelEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Events loading failed:', error);
    }
  };

  const loadGuestProfiles = async () => {
    try {
      const response = await fetch('/api/get-guests');
      const result = await response.json();

      if (!result.success) {
        console.error('Error loading guest profiles:', result.error);
        return;
      }

      const convertedProfiles: GuestProfile[] = result.guests.map((profile: Record<string, unknown>) => ({
        id: profile.username as string,
        name: profile.display_name as string,
        status: 'inRoom' as const,
        membershipTier: profile.guest_type === 'suite' ? 'Platinum Elite' : 
                       profile.guest_type === 'platinum' ? 'Platinum Elite' :
                       profile.guest_type === 'vip' ? 'VIP Elite' : 'Gold Elite',
        profile: {
          occupation: profile.username === 'umer_asif' ? 'Hotel Owner' :
                     profile.username === 'taylor_ogen' ? 'Sustainability Researcher' :
                     profile.username === 'karen_law' ? 'Business Professional' :
                     profile.username === 'sarah_smith' ? 'Leisure Traveler' : 'Guest',
          aiPrompt: `${profile.display_name as string} - ${profile.guest_type as string} guest`
        },
        stayInfo: { 
          hotel: 'The Peninsula Hong Kong', 
          room: profile.room_number as string,
          location: profile.current_location_address as string
        },
        loyaltyPoints: profile.loyalty_points as number,
        guestType: profile.guest_type as string
      }));

      setProfiles(convertedProfiles);
      
    } catch (error) {
      console.error('Error loading guest profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = (content: string, role: 'user' | 'ai') => {
    console.log(`${role}: ${content}`);
  };

  // User selection screen
  const renderUserSelection = () => (
    <div className="min-h-screen bg-[#292929] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/PNG/__Primary_Logo_Colored.png" alt="LIMI Logo" width={120} height={48} className="mx-auto mb-4" />
          <h1 className="text-[#f3ebe2] text-2xl font-bold mb-2">LIMI AI x Hotels</h1>
          <p className="text-[#93cfa2] text-sm">Select your guest profile</p>
        </div>
        
        <select
          onChange={(e) => {
            const guest = profiles.find(g => g.id === e.target.value);
            if (guest) {
              setSelectedGuest(guest);
              setShowUserDropdown(false);
              loadUIConfiguration(guest.id, guest.guestType);
            }
          }}
          className="w-full p-4 rounded-xl bg-white/10 text-[#f3ebe2] border border-white/20"
        >
          <option value="">Select Guest</option>
          {profiles.map(guest => (
            <option key={guest.id} value={guest.id}>
              {guest.name} - {guest.membershipTier} - Room {guest.stayInfo?.room}
            </option>
          ))}
        </select>
        
        <div className="mt-6 text-center">
          <p className="text-[#f3ebe2]/60 text-sm">
            {profiles.length} Hong Kong guests • {weather.temp}°C {weather.condition}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292929] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3ebe2] mx-auto"></div>
          <p className="mt-4 text-[#f3ebe2]">Loading Hong Kong guests...</p>
        </div>
      </div>
    );
  }

  if (showUserDropdown) {
    return renderUserSelection();
  }

  if (!selectedGuest) {
    return <div>No guest selected</div>;
  }

  // Render modular layout with user-specific components
  return (
    <GuestLayout
      selectedGuest={selectedGuest}
      weather={weather}
      leftPanel={
        selectedGuest.status === 'inRoom' ? (
          <RoomControls 
            selectedGuest={selectedGuest}
            onAddMessage={handleAddMessage}
          />
        ) : null
      }
      rightPanel={
        <GuestInfoPanel
          selectedGuest={selectedGuest}
          weather={weather}
          hotelEvents={hotelEvents}
          uiTextContent={uiTextContent}
          onAddMessage={handleAddMessage}
          onRefreshWeather={refreshWeather}
        />
      }
      bottomPanel={
        <VoiceInterface
          selectedGuest={selectedGuest}
          weather={weather}
          uiTextContent={uiTextContent}
          onAddMessage={handleAddMessage}
        />
      }
    >
      {/* Main chat interface */}
      <ChatInterface
        selectedGuest={selectedGuest}
        weather={weather}
        uiTextContent={uiTextContent}
        onAddMessage={handleAddMessage}
      />
    </GuestLayout>
  );
}
