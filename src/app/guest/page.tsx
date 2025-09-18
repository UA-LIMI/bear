'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';
import { 
  ChevronDown, 
  Mic,
  MicOff,
  Send,
  MapPin, 
  Thermometer,
  Phone,
  Car,
  Utensils,
  Settings,
  User,
  MessageSquare,
  Volume2,
  VolumeX,
  Lightbulb,
  Wind,
  Tv,
  Shield,
  Calendar,
  Cloud,
  Menu,
  X,
  Home,
  CreditCard,
  Bell,
  Info
} from 'lucide-react';

interface GuestProfile {
  id: string;
  name: string;
  status: 'notLinked' | 'bookedOffsite' | 'inRoom';
  membershipTier: string;
  profile: {
    occupation: string;
    aiPrompt: string;
  };
  stayInfo?: {
    hotel: string;
    room?: string;
    location?: string;
    checkIn?: string;
    checkOut?: string;
    eta?: string;
  };
}

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Guest profiles will be loaded from Supabase database
let guestProfiles: GuestProfile[] = [];

export default function GuestInterface() {
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(true);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<GuestProfile[]>([]);
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  // Load guest profiles from Supabase
  useEffect(() => {
    loadGuestProfiles();
  }, []);

  const loadGuestProfiles = async () => {
    try {
      const response = await fetch('/api/get-guests');
      const result = await response.json();

      if (!result.success) {
        console.error('Error loading guest profiles:', result.error);
        return;
      }

      // Convert Supabase data to GuestProfile format
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
          aiPrompt: `${profile.display_name as string} - ${profile.guest_type as string} guest at The Peninsula Hong Kong`
        },
        stayInfo: { 
          hotel: 'The Peninsula Hong Kong', 
          room: profile.room_number as string,
          location: profile.current_location_address as string
        }
      }));

      setProfiles(convertedProfiles);
      guestProfiles = convertedProfiles; // Update global array
      
    } catch (error) {
      console.error('Error loading guest profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data that would come from Supabase
  const mockRoomControls = {
    temperature: 22,
    lighting: 75,
    blinds: 30,
    scene: 'Business'
  };

  const mockWeather = {
    temp: 26,
    condition: 'Partly Cloudy',
    humidity: 65
  };

  const mockEvents = [
    { time: '2:00 PM', event: 'Business Center Available' },
    { time: '6:00 PM', event: 'Executive Lounge Happy Hour' },
    { time: '8:00 PM', event: 'Rooftop Pool Open' }
  ];

  // Real AI Integration Functions
  const connectVoice = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🔗 Connecting to LIMI AI voice system...');
      
      // Enhanced AI instructions - keeping simple format that works
      const enhancedInstructions = `You are LIMI, an AI concierge for The Peninsula Hong Kong assisting ${selectedGuest?.name}, a ${selectedGuest?.profile.occupation} with ${selectedGuest?.membershipTier} status in Room ${selectedGuest?.stayInfo?.room}. Current location: ${selectedGuest?.stayInfo?.location}. Always greet by name and room number, confirm before room changes, speak clearly in short sentences, handle interruptions gracefully. Available tools: control_hotel_lighting for room devices, update_user_location for location changes, remember_guest_preference for storing preferences. ${selectedGuest?.profile.aiPrompt}. Help with ${selectedGuest?.status === 'inRoom' ? 'room controls, hotel services' : selectedGuest?.status === 'bookedOffsite' ? 'arrival preparation, reservations' : 'city exploration, hotel booking'}.`;
      
      // Get ephemeral key from our backend
      const response = await fetch('/api/client-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `guest_${selectedGuest?.id}_${Date.now()}`,
          model: 'gpt-4o-realtime-preview',
          voice: 'alloy',
          instructions: enhancedInstructions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get voice session key');
      }

      const { ephemeralKey } = await response.json();
      
      // Create OpenAI Realtime session
      const agent = new RealtimeAgent({
        name: 'LIMI AI Assistant',
        instructions: enhancedInstructions
      });

      const voiceSession = new RealtimeSession(agent);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      // Connect to OpenAI
      await voiceSession.connect({ apiKey: ephemeralKey });
      
      setSession(voiceSession);
      setVoiceConnected(true);
      addMessage(`Voice connected! Hi ${selectedGuest?.name}, I'm your LIMI AI assistant. How can I help?`, 'ai');

    } catch (error) {
      console.error('❌ Voice connection failed:', error);
      addMessage('Voice connection failed. You can still chat with me using text.', 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  const disconnectVoice = () => {
    // Clean up audio stream
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    
    // Reset voice state
    setSession(null);
    setVoiceConnected(false);
    setIsMuted(false);
    addMessage('Voice disconnected.', 'ai');
  };

  const toggleMute = () => {
    if (audioStream) {
      const audioTrack = audioStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    addMessage(userMessage, 'user');
    setInputText('');
    setIsProcessing(true);

    try {
      // Send to our AI backend for processing
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer vck_52EnLxAogWpvslydz4fqAaFXvDaafizr7Ny0pRHq8XCxSMZjNp0Oofps`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are LIMI AI assistant for ${selectedGuest?.name}, a ${selectedGuest?.profile.occupation} with ${selectedGuest?.membershipTier} status at JW Marriott Shenzhen. ${selectedGuest?.profile.aiPrompt}`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          model: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 150
        })
      });

      if (response.ok) {
        const data = await response.json();
        addMessage(data.data || 'I understand. How else can I help you?', 'ai');
      } else {
        // Fallback to contextual response
        const contextualResponse = generateContextualResponse(userMessage);
        addMessage(contextualResponse, 'ai');
      }
    } catch (error) {
      console.error('AI response error:', error);
      const contextualResponse = generateContextualResponse(userMessage);
      addMessage(contextualResponse, 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateContextualResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (selectedGuest?.status === 'inRoom') {
      if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
        return "I'll adjust your room temperature. What temperature would you prefer?";
      }
      if (lowerMessage.includes('lights') || lowerMessage.includes('lighting')) {
        return "I can control your room lighting. Would you like it brighter, dimmer, or a specific scene?";
      }
      if (lowerMessage.includes('room service') || lowerMessage.includes('food')) {
        return "I'd be happy to help with room service! What would you like to order?";
      }
    }
    
    return `I understand you said "${message}". As your LIMI AI assistant, I'm here to help with anything you need. What would you like me to do?`;
  };

  const addMessage = (content: string, role: 'user' | 'ai') => {
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const renderUserSelection = () => (
    <div className="min-h-screen bg-[#292929] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <select
          onChange={(e) => {
            const guest = profiles.find(g => g.id === e.target.value);
            if (guest) {
              setSelectedGuest(guest);
              setShowUserDropdown(false);
            }
          }}
          className="w-full p-4 rounded-xl bg-white/10 text-[#f3ebe2] border border-white/20"
        >
          <option value="">Select Guest</option>
          {profiles.map(guest => (
            <option key={guest.id} value={guest.id}>
              {guest.name} - {guest.membershipTier}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTopInfo = () => {
    if (!selectedGuest) return null;

    return (
      <div className="p-4 bg-gradient-to-r from-[#54bb74]/20 to-[#93cfa2]/20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#f3ebe2] font-bold text-lg">{selectedGuest.name}</h2>
            <p className="text-[#93cfa2] text-sm">{selectedGuest.membershipTier}</p>
          </div>
          <div className="text-right">
            <p className="text-[#f3ebe2] text-sm font-medium">{new Date().toLocaleTimeString()}</p>
            <p className="text-[#f3ebe2]/60 text-xs">{mockWeather.temp}°C • {mockWeather.condition}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderControls = () => {
    if (selectedGuest?.status !== 'inRoom') return null;

    return (
      <div className="p-4">
        <h3 className="text-[#f3ebe2] font-semibold mb-4">Room Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="h-5 w-5 text-[#93cfa2]" />
              <span className="text-[#f3ebe2] text-sm">Temperature</span>
            </div>
            <p className="text-[#f3ebe2] text-xl font-bold">{mockRoomControls.temperature}°C</p>
          </button>
          
          <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-[#93cfa2]" />
              <span className="text-[#f3ebe2] text-sm">Lighting</span>
            </div>
            <p className="text-[#f3ebe2] text-xl font-bold">{mockRoomControls.lighting}%</p>
          </button>
          
          <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="h-5 w-5 text-[#93cfa2]" />
              <span className="text-[#f3ebe2] text-sm">Blinds</span>
            </div>
            <p className="text-[#f3ebe2] text-xl font-bold">{mockRoomControls.blinds}%</p>
          </button>
          
          <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Tv className="h-5 w-5 text-[#93cfa2]" />
              <span className="text-[#f3ebe2] text-sm">Scene</span>
            </div>
            <p className="text-[#f3ebe2] text-lg font-bold">{mockRoomControls.scene}</p>
          </button>
        </div>
      </div>
    );
  };

  const renderInfoCards = () => (
    <div className="p-4 space-y-4">
      {/* Weather Card */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="h-5 w-5 text-[#93cfa2]" />
          <span className="text-[#f3ebe2] font-medium">Weather in Shenzhen</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#f3ebe2] text-2xl font-bold">{mockWeather.temp}°C</p>
            <p className="text-[#f3ebe2]/60 text-sm">{mockWeather.condition}</p>
          </div>
          <p className="text-[#f3ebe2]/60 text-sm">Humidity {mockWeather.humidity}%</p>
        </div>
      </div>

      {/* Events Card */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-[#93cfa2]" />
          <span className="text-[#f3ebe2] font-medium">Today&apos;s Schedule</span>
        </div>
        <div className="space-y-2">
          {mockEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-[#f3ebe2]/60 text-sm">{event.time}</span>
              <span className="text-[#f3ebe2] text-sm">{event.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIChat = () => (
    <div className="flex-1 flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs p-3 rounded-xl ${
              message.role === 'user'
                ? 'bg-[#54bb74]/20 text-[#f3ebe2] border border-[#54bb74]/30'
                : 'bg-white/5 text-[#f3ebe2] border border-white/10'
            }`}>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-[#f3ebe2] border border-white/10 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-[#93cfa2] rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-sm">LIMI AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {!messages.length && (
          <div className="text-center py-8">
            <Mic className="h-12 w-12 text-[#93cfa2] mx-auto mb-4" />
            <h3 className="text-[#f3ebe2] font-bold text-lg mb-2">LIMI AI Assistant</h3>
            <p className="text-[#f3ebe2]/60">
              {selectedGuest?.status === 'inRoom' && 'Control your room, order services, or ask questions'}
              {selectedGuest?.status === 'bookedOffsite' && 'Prepare for arrival, make reservations, or get updates'}
              {selectedGuest?.status === 'notLinked' && 'Explore Shenzhen, find hotels, or get recommendations'}
            </p>
          </div>
        )}
      </div>

      {/* Voice Controls */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={voiceConnected ? disconnectVoice : connectVoice}
            disabled={isProcessing}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              voiceConnected
                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                : 'bg-gradient-to-r from-[#54bb74] to-[#93cfa2]'
            } ${isProcessing ? 'opacity-50' : ''}`}
          >
            {isProcessing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Settings className="h-6 w-6 text-white" />
              </motion.div>
            ) : voiceConnected ? (
              <Phone className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </button>
          
          {voiceConnected && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-xl ${isMuted ? 'bg-red-500' : 'bg-white/10'} transition-all`}
            >
              {isMuted ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-[#f3ebe2]" />}
            </button>
          )}
          
          <div className="flex-1">
            <p className="text-[#f3ebe2] font-medium text-sm">
              {voiceConnected ? 'Voice Active' : 'Tap to Talk'}
            </p>
          </div>
        </div>

        {/* Text Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
            placeholder="Ask LIMI AI anything..."
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[#f3ebe2] placeholder-[#f3ebe2]/50 text-sm"
          />
          <button 
            onClick={sendTextMessage}
            disabled={!inputText.trim() || isProcessing}
            className="p-2 rounded-xl bg-gradient-to-r from-[#54bb74] to-[#93cfa2] text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderExpandableMenu = () => (
    <AnimatePresence>
      {showMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowMenu(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-[#292929] rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#f3ebe2] text-xl font-bold">Menu</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 rounded-xl bg-white/10 text-[#f3ebe2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Home, label: 'Dashboard', desc: 'Main overview' },
                { icon: Settings, label: 'Room Controls', desc: 'Lights, climate, TV' },
                { icon: Utensils, label: 'Dining', desc: 'Restaurants & room service' },
                { icon: Car, label: 'Transport', desc: 'Taxis & transfers' },
                { icon: MapPin, label: 'Explore', desc: 'City attractions' },
                { icon: Bell, label: 'Requests', desc: 'Service requests' },
                { icon: CreditCard, label: 'Billing', desc: 'Charges & payments' },
                { icon: User, label: 'Profile', desc: 'Account settings' }
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all"
                >
                  <item.icon className="h-6 w-6 text-[#93cfa2] mb-2" />
                  <p className="text-[#f3ebe2] font-medium text-sm">{item.label}</p>
                  <p className="text-[#f3ebe2]/60 text-xs">{item.desc}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

  return (
    <div className="min-h-screen bg-[#292929] flex flex-col">
      {/* Top Info Bar */}
      {renderTopInfo()}

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        
        {/* Left Column - Controls (if in room) */}
        {selectedGuest?.status === 'inRoom' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-[#f3ebe2] font-semibold">Room Controls</h3>
            <div className="space-y-3">
              {[
                { icon: Thermometer, label: 'Temperature', value: `${mockRoomControls.temperature}°C`, action: 'Adjust climate' },
                { icon: Lightbulb, label: 'Lighting', value: `${mockRoomControls.lighting}%`, action: 'Change brightness' },
                { icon: Wind, label: 'Blinds', value: `${mockRoomControls.blinds}%`, action: 'Open/close blinds' },
                { icon: Tv, label: 'Scene', value: mockRoomControls.scene, action: 'Change scene' }
              ].map((control) => (
                <motion.button
                  key={control.label}
                  whileHover={{ scale: 1.02 }}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <control.icon className="h-5 w-5 text-[#93cfa2]" />
                      <span className="text-[#f3ebe2] font-medium text-sm">{control.label}</span>
                    </div>
                    <span className="text-[#f3ebe2] font-bold">{control.value}</span>
                  </div>
                  <p className="text-[#f3ebe2]/60 text-xs mt-1">{control.action}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Center Column - AI Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${selectedGuest?.status === 'inRoom' ? 'lg:col-span-1' : 'lg:col-span-2'} bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm`}
        >
          {renderAIChat()}
        </motion.div>

        {/* Right Column - Info Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Weather Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-5 w-5 text-[#93cfa2]" />
              <span className="text-[#f3ebe2] font-medium text-sm">Weather</span>
            </div>
            <p className="text-[#f3ebe2] text-xl font-bold">{mockWeather.temp}°C</p>
            <p className="text-[#f3ebe2]/60 text-xs">{mockWeather.condition}</p>
          </div>

          {/* Events Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-[#93cfa2]" />
              <span className="text-[#f3ebe2] font-medium text-sm">Today</span>
            </div>
            <div className="space-y-2">
              {mockEvents.slice(0, 3).map((event, index) => (
                <div key={index} className="text-xs">
                  <span className="text-[#93cfa2]">{event.time}</span>
                  <span className="text-[#f3ebe2]/80 ml-2">{event.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            {selectedGuest?.status === 'inRoom' && [
              { icon: Utensils, label: 'Room Service' },
              { icon: Shield, label: 'Do Not Disturb' },
              { icon: Phone, label: 'Concierge' }
            ].map((action) => (
              <button
                key={action.label}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4 text-[#93cfa2]" />
                  <span className="text-[#f3ebe2] text-sm">{action.label}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Menu Button */}
      <div className="p-4">
        <button
          onClick={() => setShowMenu(true)}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-[#54bb74] to-[#93cfa2] text-white font-bold flex items-center justify-center gap-2"
        >
          <Menu className="h-5 w-5" />
          <span>Open Menu</span>
        </button>
      </div>

      {/* Expandable Menu */}
      {renderExpandableMenu()}
    </div>
  );
}