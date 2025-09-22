/**
 * LIMI AI x Hotels - Complete Guest Interface Rebuild
 * Modern, modular, user-differentiated hotel guest experience
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  User, Crown, Briefcase, Palmtree, MapPin, 
  Thermometer, Calendar, Settings, RefreshCw,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';

// Import our modular components
import { WeatherCard } from '@/components/WeatherCard';
import { ProfessionalVoiceInterface } from '@/components/ProfessionalVoiceInterface';
import { ChatInterface } from '@/components/ChatInterface';

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

interface UIComponents {
  name: string;
  priority: number;
  visible: boolean;
  position: string;
}

export default function GuestInterfaceRebuilt() {
  // Core state
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<GuestProfile[]>([]);
  
  // Module states
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    condition: '',
    humidity: 0,
    isLive: false,
    source: 'loading',
    error: undefined
  });
  
  const [hotelEvents, setHotelEvents] = useState<HotelEvent[]>([]);
  const [uiComponents, setUiComponents] = useState<UIComponents[]>([]);
  const [uiTextContent, setUiTextContent] = useState<Record<string, string>>({});
  const [refreshingWeather, setRefreshingWeather] = useState(false);

  // Load all data on mount
  useEffect(() => {
    initializeInterface();
  }, []);

  const initializeInterface = async () => {
    await Promise.all([
      loadGuestProfiles(),
      loadWeather(),
      loadEvents(),
      loadUIConfiguration()
    ]);
  };

  // Weather module - standalone and testable
  const loadWeather = async () => {
    try {
      console.log('🌤️ Loading weather data...');
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
        console.log('✅ Live weather loaded:', result.source, `${result.weather.temp}°C`);
      } else {
        // Handle API error response properly
        console.warn('⚠️ Weather API error:', result.error || 'Unknown error');
        setWeather({
          temp: result.weather?.temp || 26,
          condition: result.weather?.condition || 'Partly Cloudy',
          humidity: result.weather?.humidity || 70,
          isLive: false,
          source: result.source || 'api_error',
          error: result.error || 'Weather API failed',
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Weather loading failed:', error);
      setWeather({
        temp: 26,
        condition: 'Partly Cloudy',
        humidity: 70,
        isLive: false,
        source: 'fallback_error',
        error: `Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const refreshWeather = async () => {
    setRefreshingWeather(true);
    await loadWeather();
    setRefreshingWeather(false);
  };

  // Guest profiles module
  const loadGuestProfiles = async () => {
    try {
      console.log('👥 Loading guest profiles...');
      const response = await fetch('/api/get-guests');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load guests');
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
      console.log('✅ Loaded', convertedProfiles.length, 'guest profiles');
      
    } catch (error) {
      console.error('❌ Guest profiles loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hotel events module
  const loadEvents = async () => {
    try {
      console.log('📅 Loading hotel events...');
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
        console.log('✅ Loaded', formattedEvents.length, 'hotel events');
      }
    } catch (error) {
      console.error('❌ Events loading failed:', error);
    }
  };

  // UI configuration module
  const loadUIConfiguration = async (guestId?: string, guestType?: string) => {
    try {
      console.log('🎨 Loading UI configuration...');
      
      if (!guestId || !guestType) {
        // Set comprehensive default configuration
        setUiTextContent({
          voice_connected: 'Professional Voice Connected',
          voice_disconnected: 'Voice Disconnected', 
          loading_guests: 'Loading Hong Kong guests...',
          welcome_title: 'Welcome to LIMI AI x Hotels',
          ai_assistant_name: 'LIMI AI Assistant',
          room_controls_title: 'Smart Room Controls',
          weather_title: 'Live Hong Kong Weather',
          events_title: 'Today\'s Events',
          processing_message: 'LIMI AI is thinking...',
          guest_profile_title: 'Guest Profile',
          location_title: 'Current Location',
          services_title: 'Quick Services'
        });
        
        setUiComponents([
          { name: 'weather_card', priority: 10, visible: true, position: 'right' },
          { name: 'hotel_events', priority: 8, visible: true, position: 'right' },
          { name: 'room_controls', priority: 10, visible: true, position: 'left' },
          { name: 'chat_interface', priority: 10, visible: true, position: 'center' },
          { name: 'guest_profile', priority: 7, visible: true, position: 'right' },
          { name: 'location_info', priority: 6, visible: true, position: 'right' },
          { name: 'quick_services', priority: 9, visible: true, position: 'right' },
          { name: 'voice_interface', priority: 10, visible: true, position: 'bottom' }
        ]);
        return;
      }

      // Load user-specific configuration from database
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
      } else {
        console.warn('⚠️ UI config failed, using defaults:', result.error);
      }
    } catch (error) {
      console.error('❌ UI configuration loading failed:', error);
    }
  };

  // Message handling for all modules
  const handleAddMessage = (content: string, role: 'user' | 'ai') => {
    console.log(`💬 ${role.toUpperCase()}: ${content}`);
  };

  // Get guest-specific theme and layout
  const getGuestTheme = () => {
    if (!selectedGuest) return { primary: '#54bb74', secondary: '#93cfa2', accent: 'green' };
    
    const { guestType, profile } = selectedGuest;
    
    if (guestType === 'vip' || guestType === 'suite') {
      return { primary: '#9333ea', secondary: '#d946ef', accent: 'purple', icon: Crown };
    }
    
    if (profile.occupation.includes('Business') || guestType === 'platinum') {
      return { primary: '#2563eb', secondary: '#3b82f6', accent: 'blue', icon: Briefcase };
    }
    
    if (profile.occupation.includes('Leisure') || selectedGuest.status === 'bookedOffsite') {
      return { primary: '#059669', secondary: '#10b981', accent: 'green', icon: Palmtree };
    }
    
    return { primary: '#54bb74', secondary: '#93cfa2', accent: 'green', icon: User };
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <Loader2 className="w-16 h-16 text-[#54bb74] animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#54bb74]/20 rounded-full mx-auto animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">LIMI AI x Hotels</h2>
            <p className="text-gray-300">Loading Hong Kong guest profiles...</p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-[#54bb74] rounded-full animate-pulse" />
              <span>Initializing modules...</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Guest selection screen
  if (showUserDropdown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Image 
                src="/PNG/__Primary_Logo_Colored.png" 
                alt="LIMI AI Logo" 
                width={140} 
                height={56} 
                className="mx-auto mb-6" 
              />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">LIMI AI x Hotels</h1>
            <p className="text-gray-300 text-lg">The Peninsula Hong Kong</p>
            <p className="text-[#54bb74] text-sm mt-2">Select your guest profile to continue</p>
          </div>
          
          {/* Guest selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <select
              onChange={(e) => {
                const guest = profiles.find(g => g.id === e.target.value);
                if (guest) {
                  setSelectedGuest(guest);
                  setShowUserDropdown(false);
                  loadUIConfiguration(guest.id, guest.guestType);
                }
              }}
              className="w-full p-4 rounded-xl bg-white/10 backdrop-blur text-white border border-white/20 focus:border-[#54bb74] focus:outline-none transition-all"
            >
              <option value="" className="bg-gray-800">Select Guest Profile</option>
              {profiles.map(guest => {
                const theme = getGuestTheme();
                return (
                  <option key={guest.id} value={guest.id} className="bg-gray-800">
                    {guest.name} - {guest.membershipTier} - Room {guest.stayInfo?.room}
                  </option>
                );
              })}
            </select>
            
            {/* Guest preview cards */}
            <div className="grid grid-cols-1 gap-3 mt-6">
              {profiles.map(guest => {
                const guestTheme = {
                  primary: guest.guestType === 'vip' || guest.guestType === 'suite' ? '#9333ea' :
                          guest.profile.occupation.includes('Business') ? '#2563eb' : '#059669',
                  accent: guest.guestType === 'vip' || guest.guestType === 'suite' ? 'purple' :
                         guest.profile.occupation.includes('Business') ? 'blue' : 'green',
                  icon: guest.guestType === 'vip' || guest.guestType === 'suite' ? Crown :
                       guest.profile.occupation.includes('Business') ? Briefcase : Palmtree
                };
                const ThemeIcon = guestTheme.icon;
                
                return (
                  <motion.button
                    key={guest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * profiles.indexOf(guest) }}
                    onClick={() => {
                      setSelectedGuest(guest);
                      setShowUserDropdown(false);
                      loadUIConfiguration(guest.id, guest.guestType);
                    }}
                    className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:border-[#54bb74]/50 transition-all text-left group hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                        guest.guestType === 'vip' || guest.guestType === 'suite' ? 'from-purple-500 to-pink-500' :
                        guest.profile.occupation.includes('Business') ? 'from-blue-500 to-indigo-500' :
                        'from-green-500 to-emerald-500'
                      } flex items-center justify-center`}>
                        <ThemeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{guest.name}</h3>
                        <p className="text-gray-300 text-sm">{guest.profile.occupation}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            guest.guestType === 'vip' || guest.guestType === 'suite' ? 'bg-purple-500/20 text-purple-300' :
                            guest.guestType === 'platinum' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {guest.membershipTier}
                          </span>
                          <span className="text-gray-400 text-xs">Room {guest.stayInfo?.room}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
          
          {/* Status indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${weather.isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span>Weather: {weather.isLive ? 'Live' : 'Offline'}</span>
              </div>
              <span>•</span>
              <span>{profiles.length} guests</span>
              <span>•</span>
              <span>{weather.temp}°C {weather.condition}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!selectedGuest) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">No guest selected</div>;
  }

  const theme = getGuestTheme();
  const ThemeIcon = theme.icon || User;

  // Main guest interface - completely rebuilt with modern design
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Modern header with guest-specific styling */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 ${
          theme.accent === 'purple' ? 'bg-gradient-to-r from-purple-500/10 via-purple-600/5 to-purple-500/10' :
          theme.accent === 'blue' ? 'bg-gradient-to-r from-blue-500/10 via-blue-600/5 to-blue-500/10' :
          'bg-gradient-to-r from-green-500/10 via-green-600/5 to-green-500/10'
        } border-b border-white/10 backdrop-blur`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
              theme.accent === 'purple' ? 'from-purple-500 to-purple-600' :
              theme.accent === 'blue' ? 'from-blue-500 to-blue-600' :
              'from-green-500 to-green-600'
            } flex items-center justify-center shadow-lg`}>
              <ThemeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{selectedGuest.name}</h1>
              <div className="flex items-center space-x-3 text-sm">
                <span className={`font-medium ${
                  theme.accent === 'purple' ? 'text-purple-200' :
                  theme.accent === 'blue' ? 'text-blue-200' :
                  'text-green-200'
                }`}>{selectedGuest.membershipTier}</span>
                <span className="text-gray-400">•</span>
                <span className="text-white">Room {selectedGuest.stayInfo?.room}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">{selectedGuest.profile.occupation}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-yellow-400 text-sm font-medium">{selectedGuest.loyaltyPoints?.toLocaleString()} points</span>
              </div>
            </div>
          </div>
          
          {/* Real-time status indicators */}
          <div className="text-right space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-white text-lg font-medium">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${weather.isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-blue-200 text-sm">{weather.temp}°C • {weather.condition}</span>
              <span className="text-xs text-gray-400">({weather.source})</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content area with dynamic layout */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left panel - Room controls (conditional) */}
          {selectedGuest.status === 'inRoom' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6 h-full">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center">
                  <Thermometer className="w-5 h-5 mr-2 text-blue-400" />
                  Smart Room Controls
                </h2>
                {/* Room controls will go here */}
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">Room controls module loading...</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Center panel - Main chat interface */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={selectedGuest.status === 'inRoom' ? 'lg:col-span-6' : 'lg:col-span-8'}
          >
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 h-full">
              <ChatInterface
                selectedGuest={selectedGuest}
                weather={weather}
                uiTextContent={uiTextContent}
                onAddMessage={handleAddMessage}
              />
            </div>
          </motion.div>
          
          {/* Right panel - Information cards */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="space-y-6">
              {/* Weather module */}
              <WeatherCard 
                weather={weather} 
                uiTextContent={uiTextContent}
                onRefresh={refreshWeather}
                refreshing={refreshingWeather}
              />
              
              {/* Guest profile module */}
              <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-400" />
                  {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'VIP Profile' : 'Guest Profile'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Name</span>
                    <span className="text-white font-medium">{selectedGuest.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Membership</span>
                    <span className={`font-medium ${
                      theme.accent === 'purple' ? 'text-purple-300' :
                      theme.accent === 'blue' ? 'text-blue-300' :
                      'text-green-300'
                    }`}>{selectedGuest.membershipTier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Points</span>
                    <span className="text-yellow-400 font-bold">{selectedGuest.loyaltyPoints?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Events module */}
              <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-400" />
                  Today's Events
                </h3>
                <div className="space-y-3">
                  {hotelEvents.slice(0, 3).map((event, index) => (
                    <div key={index} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{event.event}</div>
                        {event.description && (
                          <div className="text-gray-400 text-xs mt-1">{event.description}</div>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs ml-3">{event.time}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Location module */}
              <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-400" />
                  Current Location
                </h3>
                <div className="space-y-2">
                  <div className="text-white text-sm">{selectedGuest.stayInfo?.location}</div>
                  <div className="text-gray-400 text-xs">
                    {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 
                      'Premium location with VIP facilities access' :
                      'Perfect location in Tsim Sha Tsui'
                    }
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Bottom panel - Professional voice interface */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ProfessionalVoiceInterface
          selectedGuest={selectedGuest}
          weather={weather}
          uiTextContent={uiTextContent}
          onAddMessage={handleAddMessage}
        />
      </motion.footer>
    </div>
  );
}
