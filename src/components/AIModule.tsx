'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  const [session, setSession] = useState<any>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice configuration
  const config = {
    model: 'gpt-4o-realtime-preview-2024-10-01',
    voice: selectedGuest.guestType === 'vip' ? 'alloy' : 'echo',
    instructions: `You are LIMI AI for The Peninsula Hong Kong, providing personalized assistance to hotel guests.

CURRENT GUEST COMPLETE CONTEXT:
- Guest Name: ${selectedGuest.name} (${selectedGuest.profile.occupation})
- Room: ${selectedGuest.stayInfo?.room} at The Peninsula Hong Kong
- Membership Tier: ${selectedGuest.membershipTier} (${selectedGuest.loyaltyPoints} loyalty points)
- Guest Type: ${selectedGuest.guestType}
- Current Location: ${selectedGuest.stayInfo?.location}
- Service Level: ${selectedGuest.guestType}

REAL-TIME HONG KONG WEATHER:
- Temperature: ${weather.temp}°C
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Data Source: ${weather.source} (${weather.isLive ? 'live Google Weather API' : 'fallback data'})

Keep responses concise but comprehensive (under 100 words). Always greet guests by name and acknowledge their membership tier.`
  };

  // Get available audio input and output devices
  const getConnectedAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      
      setAudioDevices(audioInputs);
      setAudioOutputDevices(audioOutputs);
      
      if (!selectedMicrophone && audioInputs.length > 0) {
        setSelectedMicrophone(audioInputs[0].deviceId);
      }
      
      if (!selectedSpeaker && audioOutputs.length > 0) {
        setSelectedSpeaker(audioOutputs[0].deviceId);
      }
      
      console.log('📱 Audio devices found:', audioInputs.length, 'inputs,', audioOutputs.length, 'outputs');
    } catch (error) {
      console.error('Error enumerating audio devices:', error);
    }
  };

  useEffect(() => {
    getConnectedAudioDevices();
    navigator.mediaDevices.addEventListener('devicechange', getConnectedAudioDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getConnectedAudioDevices);
    };
  }, []);

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

  /**
   * Get ephemeral key from VPS backend via Vercel proxy
   */
  const getEphemeralKey = async (): Promise<string> => {
    try {
      console.log('🔑 Requesting ephemeral key from VPS backend...');
      
      const response = await fetch('/api/client-secret', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: `frontend_${Date.now()}`,
          model: config.model,
          voice: config.voice,
          instructions: config.instructions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔑 Backend error:', errorData);
        throw new Error(`Backend error: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('🔑 Ephemeral key received from VPS backend');
      
      // Validate ephemeral key format
      if (!data.ephemeralKey || !data.ephemeralKey.startsWith('ek_')) {
        console.error('🔑 Invalid key format received:', data.ephemeralKey);
        throw new Error('Invalid ephemeral key format received from backend');
      }

      return data.ephemeralKey;

    } catch (error) {
      console.error('🔑 Failed to get ephemeral key:', error);
      throw new Error(`Token acquisition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * REAL voice connection using VPS backend + WebRTC
   */
  const connectVoice = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🔗 Connecting to LIMI AI voice system...');
      
      // Dynamic import to avoid SSR issues
      const { RealtimeAgent, RealtimeSession } = await import('@openai/agents-realtime');

      // Create agent with guest context
      const agent = new RealtimeAgent({
        name: 'Limi AI Assistant',
        instructions: config.instructions,
      });

      // Create session
      const voiceSession = new RealtimeSession(agent);

      // Get ephemeral key from VPS backend (THIS IS THE KEY PART!)
      const ephemeralKey = await getEphemeralKey();

      // Connect using ephemeral key from VPS
      await voiceSession.connect({ 
        apiKey: ephemeralKey 
      });

      // Set up event handlers with proper typing
      (voiceSession as any).on('connected', () => {
        console.log('🎉 Voice session connected successfully');
        setVoiceConnected(true);
        addMessage(`Voice connected! Hi ${selectedGuest.name}, I'm your LIMI AI assistant. How can I help?`, 'ai');
      });

      (voiceSession as any).on('disconnected', () => {
        console.log('🔌 Voice session disconnected');
        setVoiceConnected(false);
      });

      (voiceSession as any).on('response.audio_transcript.delta', (event: any) => {
        if (event.delta) {
          setTranscript(prev => [...prev, event.delta]);
          setIsAISpeaking(true);
        }
      });

      (voiceSession as any).on('response.audio_transcript.done', () => {
        setIsAISpeaking(false);
        setTimeout(() => setTranscript([]), 2000);
      });

      (voiceSession as any).on('input_audio_buffer.speech_started', () => {
        setIsUserSpeaking(true);
      });

      (voiceSession as any).on('input_audio_buffer.speech_stopped', () => {
        setIsUserSpeaking(false);
      });

      // Store session
      setSession(voiceSession);

    } catch (error) {
      console.error('❌ Voice connection failed:', error);
      addMessage('Voice connection failed. You can still chat with me using text.', 'ai');
      setVoiceConnected(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const disconnectVoice = () => {
    if (session) {
      session.disconnect();
      setSession(null);
    }
    setVoiceConnected(false);
    setIsMuted(false);
    setTranscript([]);
    setIsAISpeaking(false);
    setIsUserSpeaking(false);
    addMessage('Voice disconnected.', 'ai');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (session) {
      // Toggle microphone in session
      if (isMuted) {
        session.startRecording();
      } else {
        session.stopRecording();
      }
    }
  };

  // Enhanced text chat using Vercel AI SDK
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
            { role: 'user', content: userMessage }
          ],
          guestContext: {
            guestName: selectedGuest.name,
            roomNumber: selectedGuest.stayInfo?.room,
            membershipTier: selectedGuest.membershipTier,
            occupation: selectedGuest.profile.occupation,
            location: selectedGuest.stayInfo?.location,
            weather: weather,
            guestType: selectedGuest.guestType,
            loyaltyPoints: selectedGuest.loyaltyPoints,
            serviceLevel: selectedGuest.guestType
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

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
            <p className="text-gray-300 text-sm">Voice & Text Chat • Room {selectedGuest.stayInfo?.room}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${voiceConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className={`text-xs ${voiceConnected ? 'text-green-300' : 'text-gray-400'}`}>
              {voiceConnected ? 'Connected' : 'Disconnected'}
            </span>
            <button
              onClick={() => setShowDeviceSettings(!showDeviceSettings)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all ml-2"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Device Settings Panel */}
        {showDeviceSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-white/5 rounded-xl border border-white/10 p-4 space-y-4"
          >
            <h4 className="text-white font-medium text-center">Audio Device Selection</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Microphone Selection */}
              <div>
                <label className="text-white text-sm block mb-2">🎤 Microphone</label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20"
                  disabled={voiceConnected}
                >
                  <option value="">Select microphone</option>
                  {audioDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Speaker Selection */}
              <div>
                <label className="text-white text-sm block mb-2">🔊 Speaker</label>
                <select
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20"
                >
                  <option value="">Select speakers</option>
                  {audioOutputDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Voice Interface (when connected) */}
      {voiceConnected && (
        <div className="p-6 border-b border-white/10 space-y-4">
          {/* Audio Visualizers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white text-sm font-medium">You Speaking</h4>
                <div className={`w-2 h-2 rounded-full ${isUserSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} />
              </div>
              <div className="h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                {isUserSpeaking ? (
                  <div className="flex items-center space-x-1">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, Math.random() * 40 + 8, 8] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-blue-400 rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">Listening...</div>
                )}
              </div>
            </div>

            <div className="bg-black/20 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white text-sm font-medium">LIMI AI Speaking</h4>
                <div className={`w-2 h-2 rounded-full ${isAISpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              </div>
              <div className="h-16 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                {isAISpeaking ? (
                  <div className="flex items-center space-x-1">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, Math.random() * 40 + 8, 8] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-green-400 rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">Ready to speak...</div>
                )}
              </div>
            </div>
          </div>

          {/* Live Transcript */}
          {transcript.length > 0 && (
            <div className="bg-black/20 rounded-xl border border-white/10 p-4">
              <h4 className="text-white text-sm font-medium mb-2">Live Transcript</h4>
              <p className="text-gray-300 text-sm">
                {transcript.join(' ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white/60 mb-4">
              👋 Welcome {selectedGuest.name}!
            </div>
            <div className="text-white/40 text-sm">
              Connect voice or start typing to chat with LIMI AI
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white border border-white/20'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Text Input */}
      <div className="p-6 border-t border-white/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder={`Type a message to LIMI AI...`}
            className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
            disabled={isProcessing}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={isProcessing || !inputText.trim()}
            className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Voice controls */}
      <div className="p-6 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-4">
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
          
          <div className="flex-1">
            <p className="text-white text-sm font-medium">
              {voiceConnected ? 'Voice Connected to LIMI AI' : 'Voice Disconnected'}
            </p>
            <p className="text-gray-400 text-xs">
              {voiceConnected ? `Room ${selectedGuest.stayInfo?.room} • ${audioDevices.length} devices` : 'Click to connect'}
            </p>
          </div>
          
          {voiceConnected && (
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}