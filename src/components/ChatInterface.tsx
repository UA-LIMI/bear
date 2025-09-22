'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';
import { 
  Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, 
  Loader2, Zap, Lightbulb, MapPin
} from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

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
}

interface ChatInterfaceProps {
  selectedGuest: GuestProfile;
  weather: WeatherData;
  uiTextContent: Record<string, string>;
  onAddMessage?: (content: string, role: 'user' | 'ai') => void;
}

export function ChatInterface({ selectedGuest, weather, uiTextContent, onAddMessage }: ChatInterfaceProps) {
  // Clean modular chat implementation
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enumerate audio devices on component mount
  useEffect(() => {
    getConnectedAudioDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getConnectedAudioDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getConnectedAudioDevices);
    };
  }, []);

  // Get available audio input devices
  const getConnectedAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
      
      // Auto-select default device if none selected
      if (!selectedMicrophone && audioInputs.length > 0) {
        setSelectedMicrophone(audioInputs[0].deviceId);
      }
      
      console.log('📱 Audio devices found:', audioInputs.length);
    } catch (error) {
      console.error('Error enumerating audio devices:', error);
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
    onAddMessage?.(content, role);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Enhanced streaming text chat using our API route
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    addMessage(userMessage, 'user');
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          guestContext: {
            guestName: selectedGuest.name,
            roomNumber: selectedGuest.stayInfo?.room,
            membershipTier: selectedGuest.membershipTier,
            occupation: selectedGuest.profile.occupation,
            location: selectedGuest.stayInfo?.location,
            weather: weather
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      let aiResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        aiResponse += chunk;
      }

      addMessage(aiResponse, 'ai');
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(`Sorry ${selectedGuest.name}, I'm having trouble with my chat service. Please try voice chat or contact hotel staff.`, 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced voice connection with proper WebRTC settings
  const connectVoice = async () => {
    setVoiceProcessing(true);
    
    try {
      // Get fresh weather data for context
      let currentWeather = weather;
      try {
        const weatherResponse = await fetch(`/api/get-weather?location=${encodeURIComponent('Hong Kong')}`);
        const weatherResult = await weatherResponse.json();
        if (weatherResult?.success && weatherResult.weather) {
          currentWeather = {
            temp: Math.round(weatherResult.weather.temp),
            condition: weatherResult.weather.condition,
            humidity: weatherResult.weather.humidity,
            isLive: true,
            source: weatherResult.source
          };
        }
      } catch (weatherError) {
        console.warn('Could not fetch fresh weather for voice context:', weatherError);
      }

      // Build comprehensive AI instructions with real-time context
      const comprehensiveInstructions = `
You are LIMI AI for The Peninsula Hong Kong. Current guest: ${selectedGuest.name} (${selectedGuest.profile.occupation}) in Room ${selectedGuest.stayInfo?.room}.

REAL-TIME CONTEXT:
- Weather: ${currentWeather.temp}°C, ${currentWeather.condition}, ${currentWeather.humidity}% humidity (${currentWeather.isLive ? 'live data' : 'fallback'})
- Location: ${selectedGuest.stayInfo?.location}
- Membership: ${selectedGuest.membershipTier} (${selectedGuest.loyaltyPoints} points)

VOICE INTERACTION RULES:
1. Keep responses under 30 words for natural conversation flow
2. Always confirm before room changes: "Should I turn on romantic lighting?"
3. Use guest name and room number for personalization
4. Stop immediately if interrupted - respond with "Yes, what can I help with?"

AVAILABLE ROOM CONTROLS:
- Lighting: FX=88 (romantic candle), #FFFFFF (work light), OFF (turn off)
- Temperature: Ask preferred setting before adjusting
- Services: Room service, concierge, transportation

Provide helpful, concise assistance based on current weather and guest preferences.
      `.trim();
      
      const response = await fetch('/api/client-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `guest_${selectedGuest.id}_${Date.now()}`,
          model: 'gpt-4o-realtime-preview',
          voice: 'alloy'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Voice session failed: ${errorData.message || 'Unknown error'}`);
      }

      const { ephemeralKey } = await response.json();
      
      // Professional WebRTC audio constraints following best practices
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 24000, min: 16000 },
          channelCount: { ideal: 1 },
          latency: { ideal: 0.01, max: 0.05 },
          volume: { ideal: 1.0 },
          // Advanced constraints for better quality
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          googAudioMirroring: false
        }
      };

      const agent = new RealtimeAgent({
        name: 'LIMI AI Assistant',
        instructions: comprehensiveInstructions
      });

      const voiceSession = new RealtimeSession(agent);
      
      // Use specific microphone if selected, otherwise default
      const finalConstraints = selectedMicrophone ? {
        audio: {
          ...audioConstraints.audio,
          deviceId: { exact: selectedMicrophone }
        }
      } : audioConstraints;
      
      const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      
      // Log audio track settings for debugging
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        console.log('🎤 Audio track settings:', settings);
        console.log('📊 Audio constraints applied:', audioTrack.getConstraints());
      }
      
      setAudioStream(stream);

      // Connect with enhanced audio settings
      await voiceSession.connect({ apiKey: ephemeralKey });
      
      setSession(voiceSession);
      setVoiceConnected(true);
      
      console.log('✅ Voice session connected with enhanced audio settings');
      addMessage(`Voice connected! Hello ${selectedGuest.name}, I'm your AI assistant with enhanced audio quality. How can I help?`, 'ai');

    } catch (error) {
      console.error('❌ Voice connection failed:', error);
      // Add voice error to AI SDK messages
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: `Voice connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. You can still chat with me using text.`
      };
      // Note: AI SDK manages messages, but we need to show voice errors
    } finally {
      setVoiceProcessing(false);
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
      setVoiceProcessing(false);
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      setSession(null);
      setVoiceConnected(false);
      setAudioStream(null);
      addMessage('Voice session ended.', 'ai');
    }
  };

  // Voice session management only - text chat handled by AI SDK

  // Toggle mute with better audio handling
  const toggleMute = () => {
    if (audioStream) {
      const audioTrack = audioStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(`🎤 Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
      }
    }
  };

  return (
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
              <p className="text-[#f3ebe2]/60 text-xs">The Peninsula Hong Kong • Room {selectedGuest.stayInfo?.room}</p>
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
                {selectedGuest.status === 'inRoom' && 
                  `Hello ${selectedGuest.name}! I can control your Room ${selectedGuest.stayInfo?.room} lighting, provide Hong Kong recommendations, and assist with all hotel services.`
                }
                {selectedGuest.status === 'bookedOffsite' && 
                  `Welcome ${selectedGuest.name}! I can help prepare for your arrival, make reservations, and plan your Hong Kong experience.`
                }
                {selectedGuest.status === 'notLinked' && 
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

        {/* Clean message history with proper streaming */}
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
        
        {/* AI SDK Loading indicator */}
        {isLoading && (
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
      
      {/* AI SDK Text input area with proper form handling */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder={`Message LIMI AI for Room ${selectedGuest.stayInfo?.room}...`}
            className="flex-1 p-3 rounded-lg bg-white/10 text-[#f3ebe2] placeholder-[#f3ebe2]/50 border border-white/20 focus:border-[#54bb74] focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 rounded-lg bg-[#54bb74] hover:bg-[#54bb74]/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Enhanced voice controls with better status */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-4">
          {/* Main voice button */}
          <button
            onClick={voiceConnected ? disconnectVoice : connectVoice}
            disabled={voiceProcessing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              voiceConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-[#54bb74] hover:bg-[#54bb74]/80'
            } ${voiceProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} shadow-lg`}
          >
            {voiceProcessing ? (
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
                  {voiceConnected ? 
                    `Room ${selectedGuest.stayInfo?.room} controls • HD Audio ${audioDevices.length > 0 ? `• ${audioDevices.length} mics available` : ''}` : 
                    'Click microphone for voice chat with noise cancellation'
                  }
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
                  
                  {/* Voice processing indicator */}
                  {voiceProcessing && (
                    <div className="flex items-center space-x-1 text-blue-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Connecting...</span>
                    </div>
                  )}
                  
                  {/* Microphone selector */}
                  {audioDevices.length > 1 && !voiceConnected && (
                    <select
                      value={selectedMicrophone}
                      onChange={(e) => setSelectedMicrophone(e.target.value)}
                      className="text-xs bg-white/10 text-[#f3ebe2] border border-white/20 rounded px-2 py-1"
                    >
                      {audioDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {/* Session status */}
                  {voiceConnected && (
                    <div className="text-xs text-green-300 ml-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span>HD Audio</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
