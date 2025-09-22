'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';
import { 
  Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, 
  Loader2, Settings, Phone
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

interface AIModuleProps {
  selectedGuest: GuestProfile;
  weather: WeatherData;
  uiTextContent: Record<string, string>;
  onAddMessage?: (content: string, role: 'user' | 'ai') => void;
}

export function AIModule({ selectedGuest, weather, uiTextContent, onAddMessage }: AIModuleProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enumerate audio devices on component mount
  useEffect(() => {
    getConnectedAudioDevices();
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

  // WORKING voice connection using client-secret (from good commit)
  const connectVoice = async () => {
    setIsProcessing(true);
    
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

      // Build comprehensive AI instructions with real-time weather (WORKING VERSION)
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
5. Reference current weather for activity suggestions

AVAILABLE ROOM CONTROLS:
- Lighting: FX=88 (romantic candle), #FFFFFF (work light), OFF (turn off)
- Temperature: Ask preferred setting before adjusting
- Services: Room service, concierge, transportation

Provide helpful, concise assistance based on current weather and guest preferences.
      `.trim();
      
      // Use WORKING client-secret endpoint (not broken WebRTC)
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
      
      // Enhanced audio constraints for better call quality (WORKING VERSION)
      const audioConstraints = {
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 24000, min: 16000 },
          channelCount: { ideal: 1 },
          latency: { ideal: 0.01, max: 0.05 }
        }
      };

      const agent = new RealtimeAgent({
        name: 'LIMI AI Assistant',
        instructions: comprehensiveInstructions
      });

      const voiceSession = new RealtimeSession(agent);
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      
      // Log audio settings for debugging
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        console.log('🎤 Audio track settings:', settings);
      }
      
      setAudioStream(stream);

      await voiceSession.connect({ apiKey: ephemeralKey });
      
      setSession(voiceSession);
      setVoiceConnected(true);
      
      console.log('✅ Voice session connected with enhanced audio settings');
      addMessage(`Voice connected! Hello ${selectedGuest.name}, I'm your AI assistant with enhanced audio quality. How can I help?`, 'ai');

    } catch (error) {
      console.error('❌ Voice connection failed:', error);
      addMessage(`Voice connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. You can still chat with me using text.`, 'ai');
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
      addMessage(`Voice disconnected. Thank you ${selectedGuest.name}, have a wonderful stay!`, 'ai');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      setSession(null);
      setVoiceConnected(false);
      setAudioStream(null);
      addMessage('Voice session ended.', 'ai');
    }
  };

  // Toggle mute functionality
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

  // Enhanced text chat
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    addMessage(userMessage, 'user');
    setInputText('');
    setIsProcessing(true);

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

      addMessage(aiResponse.trim(), 'ai');
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(`Sorry ${selectedGuest.name}, I'm having trouble with my chat service. Please try voice chat or contact hotel staff.`, 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 h-full flex flex-col">
      {/* AI Module Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">LIMI AI Assistant</h2>
            <p className="text-gray-300 text-sm">Professional Voice & Text Chat • Room {selectedGuest.stayInfo?.room}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${voiceConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className={`text-xs ${voiceConnected ? 'text-green-300' : 'text-gray-400'}`}>
              {voiceConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                : 'bg-white/10 text-white border border-white/20'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                <span className="text-sm text-white/70">LIMI AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Text input */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder={`Message LIMI AI for Room ${selectedGuest.stayInfo?.room}...`}
            className="flex-1 p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-green-400 focus:outline-none"
            disabled={isProcessing}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isProcessing}
            className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* WORKING Voice controls using client-secret */}
      <div className="p-6 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-4">
          {/* Main voice button */}
          <button
            onClick={voiceConnected ? disconnectVoice : connectVoice}
            disabled={isProcessing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              voiceConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
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
                <p className="text-white text-sm font-medium">
                  {voiceConnected ? 'Voice Connected to LIMI AI' : 'Voice Disconnected'}
                </p>
                <p className="text-gray-400 text-xs">
                  {voiceConnected ? `Room ${selectedGuest.stayInfo?.room} • Enhanced audio quality • ${audioDevices.length} devices` : 'Click microphone for voice chat with noise cancellation'}
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
                  
                  {/* Session status */}
                  <div className="text-xs text-green-300 ml-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span>HD Audio</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Microphone selector */}
              {audioDevices.length > 1 && !voiceConnected && (
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="text-xs bg-white/10 text-white border border-white/20 rounded px-2 py-1 ml-4"
                >
                  <option value="">Select Microphone</option>
                  {audioDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
