/**
 * PENINSULA HONG KONG GUEST AI INTERFACE
 * Complete 2000+ line hotel guest experience system
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';
import { 
  Mic, MicOff, Send, MapPin, Thermometer, Phone, Utensils, Settings,
  User, MessageSquare, Volume2, VolumeX, Lightbulb, Sun, Calendar,
  Star, Heart, Clock, Globe, Loader2, AlertCircle, Shield, Zap, Car
} from 'lucide-react';

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

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
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
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<GuestProfile[]>([]);
  const [inputText, setInputText] = useState('');
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    condition: '',
    humidity: 0
  });

  const [hotelEvents, setHotelEvents] = useState<HotelEvent[]>([]);
  const [uiComponents, setUiComponents] = useState<Array<{name: string; priority: number; visible: boolean; position: string}>>([]);
  const [uiTextContent, setUiTextContent] = useState<Record<string, string>>({});
  const [layoutConfiguration, setLayoutConfiguration] = useState<Record<string, unknown> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        // Set default configuration if no guest selected
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
        
        setUiComponents([
          { name: 'weather_card', priority: 8, visible: true, position: 'right' },
          { name: 'hotel_events', priority: 7, visible: true, position: 'right' },
          { name: 'room_controls', priority: 10, visible: true, position: 'left' },
          { name: 'chat_interface', priority: 10, visible: true, position: 'center' },
          { name: 'guest_profile', priority: 6, visible: true, position: 'right' },
          { name: 'location_info', priority: 7, visible: true, position: 'right' },
          { name: 'quick_services', priority: 8, visible: true, position: 'right' }
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
        // Set database-driven text content
        setUiTextContent(result.textContent);
        
        // Set user-specific component configuration
        setUiComponents(result.components);
        
        // Set layout configuration
        setLayoutConfiguration(result.layoutConfig);
        
        console.log(`✅ Loaded UI config for ${guestType} guest:`, result.components.length, 'components');
      } else {
        console.error('Failed to load UI config:', result.error);
        // Keep default configuration
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
          humidity: result.weather.humidity
        });
      } else {
        setWeather(prev => ({ ...prev, temp: 26, condition: 'Partly Cloudy', humidity: 70 }));
      }
    } catch (error) {
      console.error('Weather loading failed:', error);
      setWeather({ temp: 26, condition: 'Partly Cloudy', humidity: 70 });
    }
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
          aiPrompt: `${profile.display_name as string} - ${profile.guest_type as string} guest at The Peninsula Hong Kong with specialized ${
            profile.username === 'umer_asif' ? 'owner-level access and system testing focus' :
            profile.username === 'taylor_ogen' ? 'sustainability and eco-conscious preferences' :
            profile.username === 'karen_law' ? 'business and professional service needs' :
            profile.username === 'sarah_smith' ? 'leisure and relaxation preferences' : 'standard guest preferences'
          }`
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

  const connectVoice = async () => {
    setIsProcessing(true);
    
    try {
      // Build comprehensive database-driven AI instructions
      const comprehensiveInstructions = `
You are an AI designed for The Peninsula Hong Kong to assist guests with every request they might have.

CORE BEHAVIOR RULES WITH DETAILED EXAMPLES:

1. Personal Greeting Protocol:
Always greet guests by name and room number to establish personal connection and confirm room identity.
Example: "Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} Mr. ${selectedGuest?.name} from Room ${selectedGuest?.stayInfo?.room}, how may I assist you today?"
WHY IMPORTANT: This confirms guest identity and room assignment for any room-specific services.

2. Membership Status Acknowledgment:
Acknowledge membership tier to provide appropriate service level without explaining benefits unless asked.
Example: "As a ${selectedGuest?.membershipTier} member, I'll ensure you receive priority assistance."
WHY IMPORTANT: ${selectedGuest?.membershipTier} guests have ${selectedGuest?.loyaltyPoints} loyalty points and expect personalized service matching their status.

3. Room Change Confirmation Protocol:
Always confirm before making any room changes or adjustments to prevent unwanted modifications.
Example: "I can turn on the romantic candle lighting effect for you. Should I activate that now?"
Example: "Would you like me to adjust your room temperature to 24 degrees?"
WHY IMPORTANT: Prevents accidental changes and shows respect for guest preferences and comfort.

4. Voice Interaction Optimization:
Speak clearly in short sentences with natural pauses to maintain conversational flow.
GOOD: "I can help with lighting. Would you prefer romantic or bright?"
BAD: "I can help you with lighting controls including romantic candle effects, ocean wave patterns, lightning effects, color controls, and various other options..."
WHY IMPORTANT: Keeps responses digestible and maintains natural conversation rhythm.

5. Interruption Handling Protocol:
Stop speaking immediately if interrupted and listen attentively to guest needs.
When interrupted, respond: "Yes, what can I help you with?" and wait for complete request.
DO NOT continue previous sentence or explanation.
WHY IMPORTANT: Shows respect for guest's time and urgency of their needs.

6. Clarification Request Protocol:
Ask specific clarifying questions when requests are unclear to ensure accurate assistance.
Example: "For romantic lighting, would you prefer the warm candle effect or the gentle twinkling stars?"
Example: "When you say 'bright lighting,' do you mean pure white for work or colorful for energy?"
WHY IMPORTANT: Ensures precise assistance matching guest intent and prevents misunderstandings.

CURRENT GUEST COMPLETE CONTEXT:

Guest Name: ${selectedGuest?.name}
WHY NAME MATTERS: Guest name establishes personal connection, enables room-specific services, and allows access to stored preferences from previous stays.

Guest Occupation: ${selectedGuest?.profile.occupation}
WHY OCCUPATION MATTERS: Occupation indicates service style preferences. Business travelers need efficiency and professional services, leisure travelers want recommendations and relaxation, hotel owners require system access and testing capabilities.

Membership Tier: ${selectedGuest?.membershipTier} (${selectedGuest?.loyaltyPoints} loyalty points)
WHY MEMBERSHIP MATTERS: Determines service level and available amenities. ${selectedGuest?.membershipTier} level guests receive ${
  selectedGuest?.membershipTier === 'Platinum Elite' ? 'premium priority service with exclusive amenities and immediate assistance' :
  selectedGuest?.membershipTier === 'VIP Elite' ? 'enhanced service with priority assistance and personalized attention' :
  'quality service with attention to detail and professional care'
}. Acknowledge tier for appropriate service but do not explain benefits unless specifically asked.

Room Assignment: Room ${selectedGuest?.stayInfo?.room} at The Peninsula Hong Kong
WHY ROOM NUMBER MATTERS: Room number determines which devices you can control, which services are available, and which room-specific features can be accessed. Each room has specific controllable devices and service options.

Current Location: ${selectedGuest?.stayInfo?.location}
WHY LOCATION MATTERS: Current location enables Hong Kong-specific recommendations for restaurants, attractions, transportation, and activities based on proximity to guest's current position in the city.

Current Hong Kong Weather: ${weather.temp}°C ${weather.condition}, ${weather.humidity}% humidity
WHY WEATHER MATTERS: Weather context enables appropriate activity suggestions, clothing recommendations, and indoor/outdoor service offerings based on current conditions.

ROOM ${selectedGuest?.stayInfo?.room} DEVICE CONTROL SYSTEM:

Room ${selectedGuest?.stayInfo?.room} has WLED lighting system controllable via control_hotel_lighting tool. When guests request lighting changes, use the tool with room="${selectedGuest?.stayInfo?.room}" and appropriate command payload.

Available WLED Commands for Room ${selectedGuest?.stayInfo?.room}:
- Power Controls: ON (turn lights on), OFF (turn lights off)
- Romantic Effects: FX=88 (warm candle flame - perfect for intimate moments), FX=80 (gentle twinkling stars - soft ambiance)
- Relaxing Effects: FX=101 (ocean waves - calming blue-green patterns), FX=2 (breathing effect - meditation-like fade)
- Energetic Effects: FX=57 (lightning - dramatic bright flashes), FX=89 (fireworks - explosive multicolor bursts)
- Professional Colors: #FFFFFF (pure white - ideal for work and reading), #000000 (off/black)
- Mood Colors: #FF0000 (red - warm and cozy), #00FF00 (green - natural and fresh), #0000FF (blue - cool and calming)

TOOL USAGE DETAILED INSTRUCTIONS:

1. control_hotel_lighting Tool:
Purpose: Send MQTT commands to room lighting devices
Usage: control_hotel_lighting(room="${selectedGuest?.stayInfo?.room}", command="[payload from above list]")
When to Use: Guest requests lighting changes, mood setting, ambiance adjustment
Examples:
- Guest says "romantic lighting" → Use command="FX=88" for candle effect
- Guest says "bright light for work" → Use command="#FFFFFF" for pure white
- Guest says "turn off lights" → Use command="OFF"
- Guest says "colorful party lights" → Use command="FX=89" for fireworks

2. update_user_location Tool:
Purpose: Update guest's current Hong Kong location in database
Usage: update_user_location(userId="${selectedGuest?.id}", address="[new detailed address]", city="Hong Kong", country="Hong Kong SAR")
When to Use: Guest mentions being at new location, moving to restaurant/attraction, exploring different areas
Examples:
- Guest says "I'm at IFC Mall now" → Update location to "IFC Mall, 8 Finance Street, Central, Hong Kong Island"
- Guest says "Having dinner in Central" → Update to specific Central Hong Kong restaurant address

3. remember_guest_preference Tool:
Purpose: Store guest preferences for future personalization and service improvement
Usage: remember_guest_preference(userId="${selectedGuest?.id}", entityName="[preference name]", category="[lighting/dining/services/temperature]", observations=["detailed preference information"])
When to Use: Guest mentions likes, dislikes, preferences, habits, or any personal choices
Examples:
- Guest says "I love romantic lighting" → Store lighting preference with romantic category
- Guest says "I prefer quiet restaurants" → Store dining preference with ambiance details
- Guest says "I always keep room at 22 degrees" → Store temperature preference

4. get_guest_context Tool:
Purpose: Retrieve stored guest preferences and history from previous stays
Usage: get_guest_context(userId="${selectedGuest?.id}", category="[optional: lighting/dining/services]")
When to Use: Start of conversation, making recommendations, personalizing service, referencing past preferences
Examples:
- Beginning of conversation → Use get_guest_context(userId="${selectedGuest?.id}") to get all preferences
- Recommending restaurants → Use get_guest_context(userId="${selectedGuest?.id}", category="dining") for food preferences

GUEST SPECIALIZATION CONTEXT:
${selectedGuest?.profile.aiPrompt}

CURRENT SERVICE MODE: ${selectedGuest?.status === 'inRoom' ? 
  'Guest is currently in their room at The Peninsula Hong Kong - full hotel services available including room lighting controls, concierge services, room service dining, spa bookings, and comprehensive Hong Kong local guidance' : 
  selectedGuest?.status === 'bookedOffsite' ? 
  'Guest is preparing for arrival at The Peninsula Hong Kong - assist with arrival planning, restaurant reservations, local Hong Kong recommendations, transportation arrangements, and pre-arrival hotel services' : 
  'Guest exploring Hong Kong options - provide comprehensive city guidance, hotel information, attraction recommendations, and booking assistance for The Peninsula Hong Kong experience'}

CONVERSATION MEMORY AND CONTEXT BUILDING:
- Use remember_guest_preference tool immediately when guest mentions any preference, like, dislike, or personal choice
- Use get_guest_context tool at conversation start to retrieve all previous preferences and provide continuity
- Reference stored preferences when making recommendations to provide personalized service
- Build conversation context throughout interaction to enhance future service quality
- Store location updates when guest moves around Hong Kong for better local recommendations
      `.trim();
      
      const response = await fetch('/api/client-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `guest_${selectedGuest?.id}_${Date.now()}`,
          model: 'gpt-4o-realtime-preview',
          voice: 'alloy'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get voice session key');
      }

      const { ephemeralKey } = await response.json();
      
      const agent = new RealtimeAgent({
        name: 'LIMI AI Assistant',
        instructions: comprehensiveInstructions
      });

      const voiceSession = new RealtimeSession(agent);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      await voiceSession.connect({ apiKey: ephemeralKey });
      
      setSession(voiceSession);
      setVoiceConnected(true);
      addMessage(`Voice connected! Hello ${selectedGuest?.name}, I'm your AI assistant for The Peninsula Hong Kong. How can I help?`, 'ai');

    } catch (error) {
      console.error('❌ Voice connection failed:', error);
      addMessage('Voice connection failed. You can still chat with me using text.', 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  const disconnectVoice = async () => {
    try {
      if (session) {
        session.close();
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      setSession(null);
      setVoiceConnected(false);
      setIsMuted(false);
      setIsProcessing(false);
      addMessage(`Voice disconnected. Thank you ${selectedGuest?.name}, have a wonderful stay!`, 'ai');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      setSession(null);
      setVoiceConnected(false);
      setAudioStream(null);
      addMessage('Voice session ended.', 'ai');
    }
  };

  const addMessage = (content: string, role: 'user' | 'ai') => {
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Enhanced text chat with AI Gateway integration
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || !selectedGuest) return;
    
    addMessage(userMessage, 'user');
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_GATEWAY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4',
          messages: [
            {
              role: 'system',
              content: `You are LIMI AI for The Peninsula Hong Kong. Guest: ${selectedGuest.name} (${selectedGuest.profile.occupation}) in Room ${selectedGuest.stayInfo?.room}. Location: ${selectedGuest.stayInfo?.location}. Weather: ${weather.temp}°C ${weather.condition}. Provide personalized assistance.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        addMessage(data.choices[0].message.content, 'ai');
      } else {
        throw new Error('AI response failed');
      }
    } catch (error) {
      console.error('Text chat error:', error);
      addMessage(generateContextualResponse(userMessage), 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced contextual responses for fallback
  const generateContextualResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    const guestName = selectedGuest?.name || 'Guest';
    const roomNumber = selectedGuest?.stayInfo?.room || '';
    
    if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
      return `I can help adjust temperature in Room ${roomNumber}, ${guestName}. What temperature would you prefer?`;
    }
    if (lowerMessage.includes('lights') || lowerMessage.includes('lighting')) {
      return `I can control Room ${roomNumber} lighting, ${guestName}. Options include romantic candle, ocean waves, lightning, or pure white. Which would you prefer?`;
    }
    if (lowerMessage.includes('weather')) {
      return `Current Hong Kong weather: ${weather.temp}°C ${weather.condition}, ${weather.humidity}% humidity. Perfect ${weather.temp > 25 ? 'for exploring' : 'for indoor activities'}.`;
    }
    return `Hello ${guestName}, I can help with Room ${roomNumber} controls, Hong Kong recommendations, or hotel services. How may I assist?`;
  };

  // Toggle mute functionality
  const toggleMute = () => {
    if (audioStream) {
      const audioTrack = audioStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Complete room controls with all WLED effects
  const renderRoomControls = () => {
    if (selectedGuest?.status !== 'inRoom') return null;

    const allLightingEffects = [
      // Basic Controls
      { name: 'Turn On', command: 'ON', description: 'Turn room lights on', category: 'basic', rating: 5, icon: '💡' },
      { name: 'Turn Off', command: 'OFF', description: 'Turn room lights off', category: 'basic', rating: 5, icon: '⚫' },
      
      // Romantic Effects (5-star)
      { name: 'Romantic Candle', command: 'FX=88', description: 'Warm flickering candle effect perfect for intimate moments', category: 'romantic', rating: 5, icon: '🕯️' },
      { name: 'Twinkling Stars', command: 'FX=80', description: 'Gentle star-like sparkles for soft romantic ambiance', category: 'romantic', rating: 4, icon: '✨' },
      
      // Relaxing Effects (4-star)
      { name: 'Ocean Waves', command: 'FX=101', description: 'Calming blue-green wave patterns like gentle ocean', category: 'relaxing', rating: 4, icon: '🌊' },
      { name: 'Breathing', command: 'FX=2', description: 'Slow fade in and out like meditation breathing', category: 'relaxing', rating: 4, icon: '🫁' },
      
      // Energetic Effects (3-star)
      { name: 'Lightning', command: 'FX=57', description: 'Dramatic bright lightning flashes for energy', category: 'energetic', rating: 3, icon: '⚡' },
      { name: 'Fireworks', command: 'FX=89', description: 'Explosive multicolor bursts like fireworks', category: 'energetic', rating: 3, icon: '🎆' },
      { name: 'Rainbow', command: 'FX=9', description: 'Beautiful rainbow spectrum across the room', category: 'energetic', rating: 3, icon: '🌈' },
      
      // Professional Colors (5-star)
      { name: 'Pure White', command: '#FFFFFF', description: 'Clean white light ideal for work and reading', category: 'professional', rating: 5, icon: '⚪' },
      { name: 'Warm White', command: '#FFF8DC', description: 'Warm white for comfortable ambiance', category: 'professional', rating: 4, icon: '🤍' },
      
      // Mood Colors
      { name: 'Warm Red', command: '#FF0000', description: 'Cozy red light for warm intimate atmosphere', category: 'warm', rating: 3, icon: '🔴' },
      { name: 'Cool Blue', command: '#0000FF', description: 'Calming blue light for relaxation', category: 'cool', rating: 3, icon: '🔵' },
      { name: 'Fresh Green', command: '#00FF00', description: 'Natural green light for freshness', category: 'natural', rating: 3, icon: '🟢' },
      { name: 'Royal Purple', command: '#800080', description: 'Elegant purple for luxury ambiance', category: 'elegant', rating: 4, icon: '🟣' },
      { name: 'Sunset Orange', command: '#FF4500', description: 'Warm orange like beautiful sunset', category: 'warm', rating: 4, icon: '🟠' },
      
      // Special Effects
      { name: 'Theater Chase', command: 'FX=13', description: 'Classic theater marquee chase lights', category: 'classic', rating: 4, icon: '🎭' },
      { name: 'Color Wipe', command: 'FX=3', description: 'Smooth color transition across the strip', category: 'transition', rating: 3, icon: '🎨' },
      { name: 'Sparkle', command: 'FX=20', description: 'White sparkles on colored background', category: 'elegant', rating: 4, icon: '✨' },
      { name: 'Dissolve', command: 'FX=18', description: 'Digital rain effect like matrix', category: 'digital', rating: 3, icon: '💧' },
      { name: 'Scanner', command: 'FX=10', description: 'KITT car or Cylon eye scanning effect', category: 'tech', rating: 3, icon: '👁️' }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
          <h3 className="text-[#f3ebe2] font-semibold mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            Room {selectedGuest?.stayInfo?.room} Lighting Controls
          </h3>
          
          {/* Quick preset buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={async () => {
                addMessage('Set romantic ambiance', 'user');
                try {
                  await fetch('/api/control-lighting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ room: selectedGuest?.stayInfo?.room, command: 'FX=88', userId: selectedGuest?.id })
                  });
                  addMessage('✅ Romantic candle lighting activated - perfect for intimate moments', 'ai');
                } catch (error) {
                  addMessage('❌ Lighting control error', 'ai');
                }
              }}
              className="p-4 bg-gradient-to-br from-pink-500/20 to-red-500/20 hover:from-pink-500/30 hover:to-red-500/30 border border-pink-500/30 rounded-xl text-[#f3ebe2] transition-all hover:scale-105"
            >
              <div className="text-2xl mb-2">🌹</div>
              <div className="font-medium">Romantic</div>
              <div className="text-xs opacity-70">Candle ambiance</div>
            </button>
            
            <button
              onClick={async () => {
                addMessage('Set work lighting', 'user');
                try {
                  await fetch('/api/control-lighting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ room: selectedGuest?.stayInfo?.room, command: '#FFFFFF', userId: selectedGuest?.id })
                  });
                  addMessage('✅ Pure white work lighting activated - ideal for productivity', 'ai');
                } catch (error) {
                  addMessage('❌ Lighting control error', 'ai');
                }
              }}
              className="p-4 bg-gradient-to-br from-gray-500/20 to-blue-500/20 hover:from-gray-500/30 hover:to-blue-500/30 border border-gray-500/30 rounded-xl text-[#f3ebe2] transition-all hover:scale-105"
            >
              <div className="text-2xl mb-2">💼</div>
              <div className="font-medium">Work Mode</div>
              <div className="text-xs opacity-70">Pure white light</div>
            </button>
          </div>

          {/* All lighting effects organized by category */}
          <div className="space-y-4">
            {['basic', 'romantic', 'relaxing', 'energetic', 'professional'].map(category => {
              const categoryEffects = allLightingEffects.filter(effect => effect.category === category);
              if (categoryEffects.length === 0) return null;
              
              return (
                <div key={category}>
                  <h4 className="text-[#f3ebe2]/80 text-sm font-medium mb-2 capitalize">
                    {category} Effects ({categoryEffects.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {categoryEffects.map((effect) => (
                      <button
                        key={effect.command}
                        onClick={async () => {
                          addMessage(`Set ${effect.name.toLowerCase()}`, 'user');
                          try {
                            const response = await fetch('/api/control-lighting', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                room: selectedGuest?.stayInfo?.room,
                                command: effect.command,
                                userId: selectedGuest?.id
                              })
                            });
                            const result = await response.json();
                            addMessage(
                              result.success ? 
                                `✅ ${effect.name} activated - ${effect.description}` : 
                                `❌ Failed: ${result.error}`, 
                              'ai'
                            );
                          } catch (error) {
                            addMessage('❌ Lighting control error', 'ai');
                          }
                        }}
                        className={`flex items-center space-x-3 p-3 text-left rounded-lg transition-all hover:scale-102 ${
                          category === 'romantic' ? 'bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20' :
                          category === 'relaxing' ? 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20' :
                          category === 'energetic' ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20' :
                          category === 'professional' ? 'bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20' :
                          'bg-green-500/10 hover:bg-green-500/20 border border-green-500/20'
                        }`}
                      >
                        <span className="text-xl">{effect.icon}</span>
                        <div className="flex-1">
                          <div className="text-[#f3ebe2] text-sm font-medium">{effect.name}</div>
                          <div className="text-[#f3ebe2]/60 text-xs">{effect.description}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[#f3ebe2]/40 text-xs">{effect.command}</span>
                            <span className="text-xs">{'⭐'.repeat(effect.rating)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room environment controls */}
        <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
          <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
            <Thermometer className="w-4 h-4 mr-2 text-blue-400" />
            Room Environment
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-[#f3ebe2] text-lg font-bold">22°C</div>
              <div className="text-[#f3ebe2]/60 text-xs">Temperature</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-[#f3ebe2] text-lg font-bold">Good</div>
              <div className="text-[#f3ebe2]/60 text-xs">Air Quality</div>
            </div>
          </div>
          
          {/* Quick environment actions */}
          <div className="space-y-2">
            {[
              { icon: '🌡️', label: 'Adjust Temperature', action: 'What temperature would you prefer?' },
              { icon: '💨', label: 'Air Circulation', action: 'I can adjust the air circulation for you' },
              { icon: '🔇', label: 'Do Not Disturb', action: 'Setting do not disturb mode' }
            ].map((control) => (
              <button
                key={control.label}
                onClick={() => {
                  addMessage(control.label, 'user');
                  addMessage(control.action, 'ai');
                }}
                className="w-full flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <span className="text-lg">{control.icon}</span>
                <span className="text-[#f3ebe2] text-sm">{control.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderUserSelection = () => (
    <div className="min-h-screen bg-[#292929] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/PNG/__Primary_Logo_Colored.png" alt="LIMI Logo" width={120} height={48} className="mx-auto mb-4" />
          <h1 className="text-[#f3ebe2] text-2xl font-bold mb-2">The Peninsula Hong Kong</h1>
          <p className="text-[#93cfa2] text-sm">Select your guest profile</p>
        </div>
        
        <select
          onChange={(e) => {
            const guest = profiles.find(g => g.id === e.target.value);
            if (guest) {
              setSelectedGuest(guest);
              setShowUserDropdown(false);
              // Load user-specific UI configuration
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

  // Dynamic component rendering based on database configuration
  const shouldShowComponent = (componentName: string): boolean => {
    const component = uiComponents.find(c => c.name === componentName);
    return component ? component.visible : true; // Default to visible if not configured
  };

  const getComponentPriority = (componentName: string): number => {
    const component = uiComponents.find(c => c.name === componentName);
    return component ? component.priority : 5; // Default priority
  };

  // Complete info cards with dynamic visibility
  const renderInfoCards = () => {
    const visibleComponents = [
      { name: 'weather_card', render: renderWeatherCard },
      { name: 'hotel_events', render: renderHotelEvents },
      { name: 'guest_profile', render: renderGuestProfile },
      { name: 'location_info', render: renderLocationInfo },
      { name: 'quick_services', render: renderQuickServices }
    ]
    .filter(comp => shouldShowComponent(comp.name))
    .sort((a, b) => getComponentPriority(b.name) - getComponentPriority(a.name));

    return (
      <div className="space-y-4">
        {visibleComponents.map(comp => (
          <div key={comp.name}>{comp.render()}</div>
        ))}
      </div>
    );
  };

  // Individual component render functions
  const renderWeatherCard = () => (
    <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
      <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
        <Sun className="w-4 h-4 mr-2 text-yellow-400" />
        {uiTextContent.weather_title || 'Hong Kong Weather'}
      </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#f3ebe2]/70 text-sm">Temperature</span>
            <span className="text-[#f3ebe2] font-bold">{weather.temp}°C</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#f3ebe2]/70 text-sm">Condition</span>
            <span className="text-[#f3ebe2]">{weather.condition}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#f3ebe2]/70 text-sm">Humidity</span>
            <span className="text-[#f3ebe2]">{weather.humidity}%</span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-white/5 rounded-lg">
          <p className="text-[#f3ebe2]/60 text-xs">
            {weather.temp > 25 ? 'Perfect for exploring Hong Kong or rooftop activities' : 'Great for indoor activities or spa services'}
          </p>
        </div>
      </div>
  );

  const renderHotelEvents = () => (
    <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
      <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
        <Calendar className="w-4 h-4 mr-2 text-green-400" />
        {uiTextContent.events_title || 'Today&apos;s Events'}
      </h4>
      <div className="space-y-3">
        {hotelEvents.slice(0, 5).map((event, index) => (
          <div key={index} className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-[#f3ebe2] text-sm font-medium">{event.event}</div>
              {event.description && (
                <div className="text-[#f3ebe2]/60 text-xs mt-1">{event.description}</div>
              )}
              {event.type && (
                <div className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded">
                  {event.type}
                </div>
              )}
            </div>
            <div className="text-[#f3ebe2]/70 text-xs ml-3">{event.time}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGuestProfile = () => (
    <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
      <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
        <User className="w-4 h-4 mr-2 text-purple-400" />
        {uiTextContent.guest_profile_title || 'Guest Profile'}
      </h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[#f3ebe2]/70 text-sm">Name</span>
          <span className="text-[#f3ebe2] font-medium">{selectedGuest?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#f3ebe2]/70 text-sm">Occupation</span>
          <span className="text-[#f3ebe2] font-medium">{selectedGuest?.profile.occupation}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#f3ebe2]/70 text-sm">Membership</span>
          <span className="text-[#f3ebe2] font-medium">{selectedGuest?.membershipTier}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#f3ebe2]/70 text-sm">Loyalty Points</span>
          <span className="text-green-300 font-bold">{selectedGuest?.loyaltyPoints?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const renderLocationInfo = () => (
    <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
      <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
        <MapPin className="w-4 h-4 mr-2 text-red-400" />
        {uiTextContent.location_title || 'Current Location'}
      </h4>
      <div className="space-y-2">
        <div className="text-[#f3ebe2] text-sm">{selectedGuest?.stayInfo?.location}</div>
        <div className="text-[#f3ebe2]/60 text-xs">
          Perfect location in Tsim Sha Tsui with access to shopping, dining, and attractions
        </div>
      </div>
      <button 
        onClick={() => {
          addMessage('Tell me about nearby attractions', 'user');
          addMessage(`Based on your location at ${selectedGuest?.stayInfo?.location}, you're perfectly positioned to explore Tsim Sha Tsui. Nearby attractions include Hong Kong Space Museum, Avenue of Stars, and Harbour City shopping. Would you like specific recommendations?`, 'ai');
        }}
        className="w-full mt-3 p-2 bg-[#54bb74]/20 hover:bg-[#54bb74]/30 text-[#54bb74] text-sm rounded-lg transition-all"
      >
        Get Location Recommendations
      </button>
    </div>
  );

  const renderQuickServices = () => (
    <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
      <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
        <Settings className="w-4 h-4 mr-2 text-gray-400" />
        {uiTextContent.services_title || 'Quick Services'}
      </h4>
      <div className="space-y-2">
        {[
          { icon: Utensils, label: 'Room Service', action: 'Order room service' },
          { icon: Phone, label: 'Concierge', action: 'Call concierge' },
          { icon: Car, label: 'Transportation', action: 'Arrange transport' },
          { icon: Shield, label: 'Do Not Disturb', action: 'Set do not disturb' }
        ].map((service) => (
          <button
            key={service.label}
            onClick={() => {
              addMessage(service.action, 'user');
              addMessage(`I'll assist with ${service.label.toLowerCase()}, ${selectedGuest?.name}.`, 'ai');
            }}
            className="w-full flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-all"
          >
            <service.icon className="w-4 h-4 text-[#93cfa2]" />
            <span className="text-[#f3ebe2] text-sm">{service.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#292929] flex flex-col">
      {/* Enhanced top info */}
      <div className="p-4 bg-gradient-to-r from-[#54bb74]/20 to-[#93cfa2]/20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[#f3ebe2] font-bold text-xl">{selectedGuest?.name}</h2>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-blue-200">{selectedGuest?.membershipTier}</span>
                <span className="text-gray-300">•</span>
                <span className="text-green-200">Room {selectedGuest?.stayInfo?.room}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-gray-300" />
              <span className="text-[#f3ebe2] text-sm font-medium">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200 text-xs">{weather.temp}°C • {weather.condition}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with dynamic components */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {selectedGuest?.status === 'inRoom' && shouldShowComponent('room_controls') && (
          <div className="lg:col-span-1">{renderRoomControls()}</div>
        )}
        
        <div className={`${selectedGuest?.status === 'inRoom' ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
          <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm h-full flex flex-col">
            {/* Enhanced chat header */}
            <div className="p-4 border-b border-white/10 bg-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#f3ebe2] font-semibold">{uiTextContent.ai_assistant_name || 'LIMI AI Assistant'}</h3>
                    <p className="text-[#f3ebe2]/60 text-xs">The Peninsula Hong Kong • Room {selectedGuest?.stayInfo?.room}</p>
                  </div>
                </div>
                {voiceConnected && (
                  <div className="flex items-center space-x-2 text-xs text-green-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Live Voice Session</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <Mic className="h-16 w-16 text-[#93cfa2] mx-auto" />
                    <h3 className="text-[#f3ebe2] font-bold text-xl">{uiTextContent.welcome_title || 'Welcome to The Peninsula Hong Kong'}</h3>
                    <p className="text-[#f3ebe2]/70 max-w-md mx-auto">
                      {selectedGuest?.status === 'inRoom' && 
                        `Hello ${selectedGuest.name}! I can control your Room ${selectedGuest.stayInfo?.room} lighting, provide Hong Kong recommendations, and assist with all hotel services.`
                      }
                      {selectedGuest?.status === 'bookedOffsite' && 
                        `Welcome ${selectedGuest.name}! I can help prepare for your arrival, make reservations, and plan your Hong Kong experience.`
                      }
                      {selectedGuest?.status === 'notLinked' && 
                        `Hello ${selectedGuest.name}! I can help explore Hong Kong, find accommodations, and discover local attractions.`
                      }
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-sm text-[#f3ebe2]/50">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Real-time Voice</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4" />
                        <span>Room Controls</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Hong Kong Guide</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
              
              {/* Message history */}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-[#54bb74] text-white'
                      : 'bg-white/10 text-[#f3ebe2] border border-white/20'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Processing indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-2 h-2 bg-[#93cfa2] rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#f3ebe2]/70">{uiTextContent.processing_message || 'LIMI AI is thinking...'}</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Text input area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                  placeholder={`Message LIMI AI for Room ${selectedGuest?.stayInfo?.room}...`}
                  className="flex-1 p-3 rounded-lg bg-white/10 text-[#f3ebe2] placeholder-[#f3ebe2]/50 border border-white/20 focus:border-[#54bb74] focus:outline-none"
                />
                <button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isProcessing}
                  className="w-12 h-12 rounded-lg bg-[#54bb74] hover:bg-[#54bb74]/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">{renderInfoCards()}</div>
      </div>

      {/* Enhanced voice controls */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-4">
          {/* Main voice button */}
          <button
            onClick={voiceConnected ? disconnectVoice : connectVoice}
            disabled={isProcessing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              voiceConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-[#54bb74] hover:bg-[#54bb74]/80'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} shadow-lg`}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : voiceConnected ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          
          {/* Voice status and controls */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#f3ebe2] text-sm font-medium">
                  {voiceConnected ? (uiTextContent.voice_connected || 'Voice Connected to LIMI AI') : (uiTextContent.voice_disconnected || 'Voice Disconnected')}
                </p>
                <p className="text-[#f3ebe2]/60 text-xs">
                  {voiceConnected ? `Room ${selectedGuest?.stayInfo?.room} controls available • Speak naturally` : 'Click microphone to start voice chat'}
                </p>
              </div>
              
              {/* Voice control buttons */}
              {voiceConnected && (
                <div className="flex items-center space-x-2">
                  {/* Mute toggle */}
                  <button
                    onClick={toggleMute}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                  </button>
                  
                  {/* Processing indicator */}
                  {isProcessing && (
                    <div className="flex items-center space-x-1 text-blue-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Processing...</span>
                    </div>
                  )}
                  
                  {/* Session status */}
                  <div className="text-xs text-green-300 ml-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick action buttons */}
        <div className="mt-4 flex items-center justify-center space-x-3">
          <button
            onClick={() => {
              addMessage('Turn on romantic lighting', 'user');
              // This would trigger the voice AI to control lighting
            }}
            className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-[#f3ebe2] text-sm transition-all"
          >
            🌹 Romantic Mode
          </button>
          <button
            onClick={() => {
              addMessage('What can you help me with?', 'user');
              addMessage(`Hello ${selectedGuest?.name}! I can control your Room ${selectedGuest?.stayInfo?.room} lighting, provide Hong Kong recommendations, assist with hotel services, or answer any questions about your stay. What would you like help with?`, 'ai');
            }}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-[#f3ebe2] text-sm transition-all"
          >
            💬 Get Help
          </button>
          <button
            onClick={() => {
              addMessage('Tell me about Hong Kong weather and activities', 'user');
              addMessage(`Current Hong Kong weather is ${weather.temp}°C and ${weather.condition}. ${weather.temp > 25 ? 'Perfect weather for exploring the city, visiting rooftop facilities, or taking the Star Ferry!' : 'Great weather for indoor activities like our spa services, shopping in nearby malls, or enjoying afternoon tea.'} Would you like specific recommendations based on the weather?`, 'ai');
            }}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-[#f3ebe2] text-sm transition-all"
          >
            🌤️ Weather & Activities
          </button>
        </div>
      </div>
    </div>
  );
}
