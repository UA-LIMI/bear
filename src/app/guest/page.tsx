/**
 * LIMI AI x Hotels - Complete Guest Interface
 * Fully modular, user-differentiated, working hotel guest experience
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  User, Crown, Briefcase, Palmtree, MapPin, Calendar, Settings,
  CheckCircle, AlertCircle, Loader2, RefreshCw, Phone, Star,
  Send, MessageSquare, Zap, Lightbulb, Utensils, Car, Shield
} from 'lucide-react';

// Import all working modules
import { WeatherModule } from '@/components/WeatherModule';
import { AIModule } from '@/components/AIModule';
import { RoomControlsComplete } from '@/components/guest/RoomControlsComplete';
import { SessionControlPanel } from '@/components/guest/SessionControlPanel';
import { VoiceSessionConsole, type VoiceSessionConsoleHandle, type VoiceConnectionState } from '@/components/guest/VoiceSessionConsole';
import { GuestServiceRequestPanel } from '@/components/guest/GuestServiceRequestPanel';
import type { ServiceRequest } from '@/types/service-request';
import { VoiceInterface } from '@/components/VoiceInterface';
import { useGuestContext } from '@/hooks/useGuestContext';
import { useVoiceTelemetry } from '@/hooks/useVoiceTelemetry';
import type { GuestProfile } from '@/types/guest';
import type { WeatherData } from '@/types/weather';
import type { McpToolDefinition, SessionSettings, VoiceContextSection } from '@/types/voice';
import type { RealtimeSession } from '@openai/agents-realtime';

interface HotelEvent {
  time: string;
  event: string;
  description?: string;
  type?: string;
}

interface UIComponentConfig {
  name: string;
  displayName: string;
  type: string;
  position: string;
  priority: number;
  visible: boolean;
  configuration?: Record<string, unknown> | null;
}

export default function CompleteGuestInterface() {
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
  const [uiTextContent, setUiTextContent] = useState<Record<string, string>>({});
  const [uiComponents, setUiComponents] = useState<UIComponentConfig[]>([]);
  const [refreshingWeather, setRefreshingWeather] = useState(false);
  const [moduleStatus, setModuleStatus] = useState({
    weather: 'loading',
    events: 'loading',
    profiles: 'loading',
    ui: 'idle'
  });
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    qualityPreset: 'hd',
    autoReconnect: true,
    preferredLanguage: 'auto',
    customLanguageCode: '',
    telemetryIntervalMs: 3000,
    enableTranscripts: false,
    operatorNotes: '',
    mcpExposureMode: 'auto',
    includedMcpTools: [],
  });
  const voiceConsoleRef = useRef<VoiceSessionConsoleHandle | null>(null);
  const [voiceConnectionState, setVoiceConnectionState] = useState<VoiceConnectionState>('idle');
  const [voiceSession, setVoiceSession] = useState<RealtimeSession | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [mcpCatalog, setMcpCatalog] = useState<McpToolDefinition[]>([]);
  const [mcpCatalogStatus, setMcpCatalogStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mcpCatalogError, setMcpCatalogError] = useState<string | null>(null);

  const {
    sections: contextSections,
    selectedSections,
    toggleSection,
    setAllEnabled,
  } = useGuestContext(selectedGuest, weather);

  const telemetry = useVoiceTelemetry(voiceSession, {
    intervalMs: sessionSettings.telemetryIntervalMs,
  });

  const handleVoiceConnect = useCallback(() => {
    void voiceConsoleRef.current?.connect?.();
  }, []);

  const handleVoiceDisconnect = useCallback(() => {
    void voiceConsoleRef.current?.disconnect?.();
  }, []);

  const isVoiceConnected = voiceConnectionState === 'connected';
  const isVoiceProcessing = voiceConnectionState === 'connecting' || voiceConnectionState === 'disconnecting';

  const handleSessionChange = useCallback((session: RealtimeSession | null) => {
    setVoiceSession(session);
  }, []);

  const handleConnectionStateChange = useCallback((state: VoiceConnectionState) => {
    setVoiceConnectionState(state);
  }, []);

  const handleSettingsChange = useCallback((nextSettings: SessionSettings) => {
    setSessionSettings(nextSettings);
  }, []);

  const handleEnableAllSections = useCallback((enabled: boolean) => {
    setAllEnabled(enabled);
  }, [setAllEnabled]);

  const refreshServiceRequests = useCallback(async () => {
    if (!selectedGuest) {
      setServiceRequests([]);
      setRequestsError(null);
      return;
    }

    try {
      setIsLoadingRequests(true);
      setRequestsError(null);
      const response = await fetch(`/api/service-requests?guestId=${selectedGuest.id}&includeHistory=true&limit=20`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      if (!payload?.success) {
        throw new Error(payload?.error || 'Failed to load service requests');
      }

      setServiceRequests(payload.requests ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error fetching service requests';
      console.error('❌ Service request load failed:', message);
      setRequestsError(message);
      setServiceRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [selectedGuest]);

  // Initialize all modules
  useEffect(() => {
    initializeAllModules();
  }, []);

  const initializeAllModules = async () => {
    
    // Load modules in parallel for better performance
    const modulePromises = [
      loadGuestProfiles(),
      loadWeather(),
      loadEvents(),
      loadMcpCatalog(),
    ];

    const results = await Promise.allSettled(modulePromises);

    // Log module loading results
    results.forEach((result, index) => {
      const modules = ['profiles', 'weather', 'events', 'mcp'];
      if (result.status === 'fulfilled') {
        console.log(`✅ Module ${modules[index]} loaded successfully`);
      } else {
        console.error(`❌ Module ${modules[index]} failed:`, result.reason);
      }
    });

    setLoading(false);
    if (selectedGuest) {
      await Promise.allSettled([
        loadUIConfiguration(selectedGuest.id, selectedGuest.guestType),
        refreshServiceRequests(),
      ]);
    }
  };

  const loadMcpCatalog = async () => {
    try {
      setMcpCatalogStatus('loading');
      setMcpCatalogError(null);

      const response = await fetch('/api/mcp-tool-catalog', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`MCP catalog request failed (${response.status})`);
      }

      const data = (await response.json()) as { servers?: McpToolDefinition[] };
      const servers = data.servers ?? [];
      setMcpCatalog(servers);
      setMcpCatalogStatus('success');

      const allToolNames = servers.flatMap((server) => server.tools.map((tool) => `${server.serverLabel}:${tool.name}`));
      if (allToolNames.length > 0) {
        setSessionSettings((prev) => ({
          ...prev,
          includedMcpTools: prev.includedMcpTools.length > 0 ? prev.includedMcpTools : allToolNames,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ MCP catalog: Failed -', message);
      setMcpCatalogStatus('error');
      setMcpCatalogError(message);
    }
  };

  // Weather module with enhanced error handling
  const loadWeather = async () => {
    try {
      setModuleStatus(prev => ({ ...prev, weather: 'loading' }));
      console.log('🌤️ Weather module: Loading data...');
      
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
        setModuleStatus(prev => ({ ...prev, weather: 'success' }));
        console.log('✅ Weather module: Live data loaded -', result.source, `${result.weather.temp}°C`);
      } else {
        // Handle API error response properly
        console.warn('⚠️ Weather module: API error -', result.error || 'Unknown error');
        setWeather({
          temp: result.weather?.temp || 26,
          condition: result.weather?.condition || 'Partly Cloudy',
          humidity: result.weather?.humidity || 70,
          isLive: false,
          source: result.source || 'api_error',
          error: result.error || 'Weather API failed',
          lastUpdated: new Date().toISOString()
        });
        setModuleStatus(prev => ({ ...prev, weather: 'fallback' }));
      }
    } catch (error) {
      console.error('❌ Weather module: Network error -', error);
      setWeather({
        temp: 26,
        condition: 'Partly Cloudy',
        humidity: 70,
        isLive: false,
        source: 'network_error',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`,
        lastUpdated: new Date().toISOString()
      });
      setModuleStatus(prev => ({ ...prev, weather: 'error' }));
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
      setModuleStatus(prev => ({ ...prev, profiles: 'loading' }));
      console.log('👥 Profiles module: Loading guest data...');
      
      const response = await fetch('/api/get-guests');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load guests');
      }

      const convertedProfiles: GuestProfile[] = result.guests.map((profile: Record<string, unknown>) => ({
        id: profile.id as string,
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
          aiPrompt: `${profile.display_name as string} - ${profile.guest_type as string} guest with specialized preferences`
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
      setModuleStatus(prev => ({ ...prev, profiles: 'success' }));
      console.log('✅ Profiles module: Loaded', convertedProfiles.length, 'guests');
      
    } catch (error) {
      console.error('❌ Profiles module: Failed -', error);
      setModuleStatus(prev => ({ ...prev, profiles: 'error' }));
    }
  };

  // Hotel events module
  const loadEvents = async () => {
    try {
      setModuleStatus(prev => ({ ...prev, events: 'loading' }));
      console.log('📅 Events module: Loading hotel events...');
      
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
        setModuleStatus(prev => ({ ...prev, events: 'success' }));
        console.log('✅ Events module: Loaded', formattedEvents.length, 'events');
      } else {
        throw new Error('Events API failed');
      }
    } catch (error) {
      console.error('❌ Events module: Failed -', error);
      setModuleStatus(prev => ({ ...prev, events: 'error' }));
    }
  };

  // UI configuration module
  const loadUIConfiguration = useCallback(async (guestId?: string, guestType?: string) => {
    if (!guestId) {
      console.warn('🎨 UI module: Skipping configuration load — missing guestId');
      setUiComponents([]);
      setUiTextContent({});
      setModuleStatus(prev => ({ ...prev, ui: 'idle' }));
      return;
    }

    try {
      setModuleStatus(prev => ({ ...prev, ui: 'loading' }));
      console.log('🎨 UI module: Loading configuration...');

      const response = await fetch('/api/get-ui-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: guestId,
          guestType: guestType ?? 'standard',
          screenSize:
            window.innerWidth < 768
              ? 'mobile'
              : window.innerWidth < 1024
              ? 'tablet'
              : 'desktop',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUiTextContent(result.textContent ?? {});
        setUiComponents(result.components ?? []);
        setModuleStatus(prev => ({ ...prev, ui: 'success' }));
        console.log(`✅ UI module: Loaded config for ${guestType ?? 'standard'} guest`);
      } else {
        console.warn('⚠️ UI module: Database config failed, using defaults');
        setUiComponents([]);
        setUiTextContent({});
        setModuleStatus(prev => ({ ...prev, ui: 'fallback' }));
      }
    } catch (error) {
      console.error('❌ UI module: Failed -', error);
      setUiComponents([]);
      setModuleStatus(prev => ({ ...prev, ui: 'error' }));
    }
  }, []);

  useEffect(() => {
    if (!selectedGuest) {
      setUiComponents([]);
      setUiTextContent({});
      setModuleStatus((prev) => ({ ...prev, ui: 'idle' }));
      setServiceRequests([]);
      setRequestsError(null);
      return;
    }

    void loadUIConfiguration(selectedGuest.id, selectedGuest.guestType);
    void refreshServiceRequests();
  }, [loadUIConfiguration, selectedGuest, refreshServiceRequests]);

  // Message handling for all modules
  const handleAddMessage = useCallback((content: string, role: 'user' | 'ai') => {
    console.log(`💬 ${role.toUpperCase()}: ${content}`);
  }, []);

  const theme = useMemo(() => {
    if (!selectedGuest) {
      return { primary: '#54bb74', secondary: '#93cfa2', accent: 'green', icon: User };
    }

    const { guestType, profile, status } = selectedGuest;
    const occupation = profile?.occupation ?? '';

    if (guestType === 'vip' || guestType === 'suite') {
      return { primary: '#9333ea', secondary: '#d946ef', accent: 'purple', icon: Crown };
    }

    if (occupation.includes('Business') || guestType === 'platinum') {
      return { primary: '#2563eb', secondary: '#3b82f6', accent: 'blue', icon: Briefcase };
    }

    if (occupation.includes('Leisure') || status === 'bookedOffsite') {
      return { primary: '#059669', secondary: '#10b981', accent: 'green', icon: Palmtree };
    }

    return { primary: '#54bb74', secondary: '#93cfa2', accent: 'green', icon: User };
  }, [selectedGuest]);

  const layout = useMemo(() => {
    if (!selectedGuest) {
      return {
        leftSpan: 'lg:col-span-2',
        centerSpan: 'lg:col-span-6',
        rightSpan: 'lg:col-span-4',
        showLeftPanel: false,
        showRightPanel: true,
        headerGradient: 'from-green-500/10 via-green-600/5 to-emerald-500/10',
      };
    }

    const { guestType, profile, status } = selectedGuest;
    const occupation = profile?.occupation ?? '';

    if (guestType === 'vip' || guestType === 'suite') {
      return {
        leftSpan: 'lg:col-span-3',
        centerSpan: 'lg:col-span-6',
        rightSpan: 'lg:col-span-3',
        showLeftPanel: true,
        showRightPanel: true,
        headerGradient: 'from-purple-500/10 via-purple-600/5 to-pink-500/10',
      };
    }

    if (occupation.includes('Business') || guestType === 'platinum') {
      return {
        leftSpan: 'lg:col-span-3',
        centerSpan: 'lg:col-span-9',
        rightSpan: 'hidden',
        showLeftPanel: true,
        showRightPanel: false,
        headerGradient: 'from-blue-500/10 via-blue-600/5 to-indigo-500/10',
      };
    }

    return {
      leftSpan: 'lg:col-span-2',
      centerSpan: 'lg:col-span-6',
      rightSpan: 'lg:col-span-4',
      showLeftPanel: status === 'inRoom',
      showRightPanel: true,
      headerGradient: 'from-green-500/10 via-green-600/5 to-emerald-500/10',
    };
  }, [selectedGuest]);

  const isVoicePanelReady = useMemo(
    () => Boolean(selectedGuest && contextSections.length > 0 && !isVoiceProcessing && !loading),
    [contextSections.length, isVoiceProcessing, loading, selectedGuest]
  );

  const voiceModuleVisibility = useMemo(() => {
    if (uiComponents.length === 0) {
      return {
        sessionPanel: true,
        sessionConsole: true,
      };
    }

    const isVisible = (componentName: string) =>
      uiComponents.some(
        (component) => component.name === componentName && component.visible !== false
      );

    return {
      sessionPanel: isVisible('session_control_panel'),
      sessionConsole: isVisible('voice_session_console'),
    };
  }, [uiComponents]);

  const voiceControls = useMemo(() => {
    if (!isVoicePanelReady || !selectedGuest) return null;

    const { sessionPanel, sessionConsole } = voiceModuleVisibility;
    if (!sessionPanel && !sessionConsole) return null;

    return (
      <div className="space-y-6">
        {sessionPanel && (
          <SessionControlPanel
            guest={selectedGuest}
            weather={weather}
            settings={sessionSettings}
            sections={contextSections}
            selectedSections={selectedSections}
            telemetry={telemetry}
            isConnected={isVoiceConnected}
            isProcessing={isVoiceProcessing}
            onSettingsChange={handleSettingsChange}
            onToggleSection={toggleSection}
            onEnableAllSections={handleEnableAllSections}
            onConnect={handleVoiceConnect}
            onDisconnect={handleVoiceDisconnect}
            mcpCatalog={mcpCatalog}
            mcpCatalogStatus={mcpCatalogStatus}
            mcpCatalogError={mcpCatalogError}
          />
        )}
        <GuestServiceRequestPanel
          guest={selectedGuest}
          requests={serviceRequests}
          isLoading={isLoadingRequests}
          error={requestsError}
          onRefresh={refreshServiceRequests}
        />
        {sessionConsole && (
          <VoiceSessionConsole
            ref={voiceConsoleRef}
            guest={selectedGuest}
            weather={weather}
            settings={sessionSettings}
            contexts={contextSections}
            onAddMessage={handleAddMessage}
            onSessionChange={handleSessionChange}
            onConnectionStateChange={handleConnectionStateChange}
          />
        )}
      </div>
    );
  }, [
    contextSections,
    handleAddMessage,
    handleConnectionStateChange,
    handleEnableAllSections,
    handleSessionChange,
    handleSettingsChange,
    handleVoiceConnect,
    handleVoiceDisconnect,
    isVoiceConnected,
    isVoicePanelReady,
    isVoiceProcessing,
    selectedGuest,
    selectedSections,
    sessionSettings,
    telemetry,
    toggleSection,
    voiceConsoleRef,
    voiceModuleVisibility,
    weather,
  ]);

  // Enhanced loading screen with module status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="relative">
            <Loader2 className="w-20 h-20 text-[#54bb74] animate-spin mx-auto" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-[#54bb74]/20 rounded-full mx-auto animate-pulse" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">LIMI AI x Hotels</h2>
            <p className="text-gray-300 text-lg">Initializing guest experience...</p>
          </div>
          
          {/* Module loading status */}
          <div className="space-y-3 text-sm">
            {Object.entries(moduleStatus).map(([module, status]) => (
              <div key={module} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300 capitalize">{module} Module</span>
                <div className="flex items-center space-x-2">
                  {status === 'loading' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                  {status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span className={`text-xs ${
                    status === 'success' ? 'text-green-400' :
                    status === 'error' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Enhanced guest selection with module status
  if (showUserDropdown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Image 
                src="/PNG/__Primary_Logo_Colored.png" 
                alt="LIMI AI Logo" 
                width={160} 
                height={64} 
                className="mx-auto mb-6" 
              />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-3">LIMI AI x Hotels</h1>
            <p className="text-gray-300 text-xl">The Peninsula Hong Kong</p>
            <p className="text-[#54bb74] text-lg mt-3">Select your guest profile to continue</p>
          </div>
          
          {/* Module status indicators */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {Object.entries(moduleStatus).map(([module, status]) => (
              <div key={module} className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  {status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                  {status === 'fallback' && <AlertCircle className="w-5 h-5 text-orange-400" />}
                  {status === 'loading' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                </div>
                <div className="text-white text-xs font-medium capitalize">{module}</div>
                <div className={`text-xs mt-1 ${
                  status === 'success' ? 'text-green-400' :
                  status === 'error' ? 'text-red-400' :
                  status === 'fallback' ? 'text-orange-400' :
                  'text-blue-400'
                }`}>{status}</div>
              </div>
            ))}
          </div>
          
          {/* Guest profile cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * profiles.indexOf(guest) }}
                  onClick={() => {
                    setSelectedGuest(guest);
                    setShowUserDropdown(false);
                    loadUIConfiguration(guest.id, guest.guestType);
                  }}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 transition-all text-left group hover:bg-white/10"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                      guest.guestType === 'vip' || guest.guestType === 'suite' ? 'from-purple-500 to-pink-500' :
                      guest.profile.occupation.includes('Business') ? 'from-blue-500 to-indigo-500' :
                      'from-green-500 to-emerald-500'
                    } flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <ThemeIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{guest.name}</h3>
                      <p className="text-gray-300">{guest.profile.occupation}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          guest.guestType === 'vip' || guest.guestType === 'suite' ? 'bg-purple-500/20 text-purple-300' :
                          guest.guestType === 'platinum' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {guest.membershipTier}
                        </span>
                        <span className="text-gray-400 text-sm">Room {guest.stayInfo?.room}</span>
                      </div>
                      <div className="text-yellow-400 text-sm font-medium mt-1">
                        {guest.loyaltyPoints?.toLocaleString()} points
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {/* System status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${weather.isLive ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
                <span>Weather: {weather.isLive ? 'Live Google API' : 'Fallback Data'}</span>
              </div>
              <span>•</span>
              <span>{profiles.length} guests loaded</span>
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

  const ThemeIcon = theme.icon;

  // Main guest interface - completely rebuilt with all working modules
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Modern header with guest-specific styling and full context */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 bg-gradient-to-r ${layout.headerGradient} border-b border-white/10 backdrop-blur`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${
              theme.accent === 'purple' ? 'from-purple-500 to-pink-500' :
              theme.accent === 'blue' ? 'from-blue-500 to-indigo-500' :
              'from-green-500 to-emerald-500'
            } flex items-center justify-center shadow-xl`}>
              <ThemeIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedGuest.name}</h1>
              <div className="flex items-center space-x-4 text-lg mt-1">
                <span className={`font-semibold ${
                  theme.accent === 'purple' ? 'text-purple-200' :
                  theme.accent === 'blue' ? 'text-blue-200' :
                  'text-green-200'
                }`}>{selectedGuest.membershipTier}</span>
                <span className="text-gray-400">•</span>
                <span className="text-white">Room {selectedGuest.stayInfo?.room}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">{selectedGuest.profile.occupation}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-yellow-400 font-semibold">{selectedGuest.loyaltyPoints?.toLocaleString()} points</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">{selectedGuest.stayInfo?.hotel}</span>
              </div>
            </div>
          </div>
          
          {/* Real-time status indicators with module health */}
          <div className="text-right space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-white text-xl font-semibold">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${weather.isLive ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
              <span className="text-blue-200">{weather.temp}°C • {weather.condition}</span>
              <span className="text-xs text-gray-400">({weather.source})</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              {Object.entries(moduleStatus).map(([module, status]) => (
                <div key={module} className={`w-2 h-2 rounded-full ${
                  status === 'success' ? 'bg-green-400' :
                  status === 'error' ? 'bg-red-400' :
                  status === 'fallback' ? 'bg-orange-400' :
                  'bg-blue-400'
                }`} title={`${module}: ${status}`} />
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content area with dynamic modular layout */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[80vh]">
          
          {/* Left panel - Room controls module */}
          {layout.showLeftPanel && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={layout.leftSpan}
            >
              <RoomControlsComplete
                selectedGuest={selectedGuest}
                onAddMessage={handleAddMessage}
              />
            </motion.div>
          )}
          
          {/* Center panel - Complete AI Module (voice + text + visualizer + devices) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={layout.centerSpan}
          >
            <AIModule
              selectedGuest={selectedGuest}
              weather={weather}
              uiTextContent={uiTextContent}
              onAddMessage={handleAddMessage}
            />
          </motion.div>
          
          {/* Right panel - Information modules */}
          {layout.showRightPanel && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={layout.rightSpan}
            >
              <div className="space-y-6">
                {voiceControls}

                {/* Complete Weather Module with map */}
                <WeatherModule 
                  initialLocation="Hong Kong"
                  className="h-fit"
                />
                
                {/* Events module with guest-specific filtering */}
                <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-green-400" />
                    {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'Exclusive Events' :
                     selectedGuest.profile.occupation.includes('Business') ? 'Business Events' :
                     'Today\'s Events'}
                  </h3>
                  <div className="space-y-3">
                    {hotelEvents.slice(0, 4).map((event, index) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">{event.event}</div>
                          {event.description && (
                            <div className="text-gray-400 text-xs mt-1">{event.description}</div>
                          )}
                          {event.type && (
                            <div className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                              event.type === 'exclusive' || event.type === 'vip' ? 'bg-purple-500/20 text-purple-300' :
                              event.type === 'business' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {event.type}
                            </div>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs ml-3">{event.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Location and services module */}
                <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-3 text-red-400" />
                    Location & Services
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-white text-sm font-medium">{selectedGuest.stayInfo?.location}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 
                          'Premium location with VIP facilities access' :
                          selectedGuest.profile.occupation.includes('Business') ?
                          'Strategic location for business activities' :
                          'Perfect location for Hong Kong exploration'
                        }
                      </div>
                    </div>
                    
                    {/* Quick services */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Phone, label: 'Concierge', color: 'blue' },
                        { icon: Utensils, label: 'Room Service', color: 'green' },
                        { icon: Car, label: 'Transport', color: 'yellow' },
                        { icon: Star, label: selectedGuest.guestType === 'vip' ? 'VIP Services' : 'Services', color: 'purple' }
                      ].map((service) => (
                        <button
                          key={service.label}
                          onClick={() => {
                            handleAddMessage(`Request ${service.label.toLowerCase()}`, 'user');
                            handleAddMessage(`I'll assist with ${service.label.toLowerCase()}, ${selectedGuest.name}.`, 'ai');
                          }}
                          className="flex flex-col items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                        >
                          <service.icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                          <span className="text-white text-xs mt-1">{service.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

    </div>
  );
}
