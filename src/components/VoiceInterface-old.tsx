'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Using custom WebRTC implementation for better control
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';
import { Loader2, Phone, Settings, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

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

interface VoiceInterfaceProps {
  selectedGuest: GuestProfile;
  weather: WeatherData;
  uiTextContent: Record<string, string>;
  onAddMessage: (content: string, role: 'user' | 'ai') => void;
}

function VoiceInterfaceContent({ selectedGuest, weather, uiTextContent, onAddMessage }: VoiceInterfaceProps) {
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  
  // Get available audio devices
  const getConnectedAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
      
      if (!selectedMicrophone && audioInputs.length > 0) {
        setSelectedMicrophone(audioInputs[0].deviceId);
      }
      
      console.log('🎤 Audio devices found:', audioInputs.length);
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

  const connectVoice = async () => {
    setVoiceProcessing(true);
    
    try {
      // Get fresh weather context
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

      // Build comprehensive AI instructions
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
      
      // Get ephemeral key from backend
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
      
      // Create RealtimeAgent with enhanced instructions
      const agent = new RealtimeAgent({
        name: 'LIMI AI Assistant',
        instructions: comprehensiveInstructions
      });

      const voiceSession = new RealtimeSession(agent);
      
      // Get audio stream with professional WebRTC constraints
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
      
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      
      // Log audio settings for debugging
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        console.log('🎤 Audio track settings:', settings);
      }
      
      setAudioStream(stream);

      // Connect to OpenAI Realtime API
      await voiceSession.connect({ apiKey: ephemeralKey });
      
      setSession(voiceSession);
      setVoiceConnected(true);
      
      console.log('✅ Professional voice session connected');
      onAddMessage(`Voice connected! Hello ${selectedGuest.name}, I'm your AI assistant with professional audio quality. How can I help?`, 'ai');

    } catch (error) {
      console.error('❌ Voice connection failed:', error);
      onAddMessage(`Voice connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. You can still chat with me using text.`, 'ai');
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
      setVoiceProcessing(false);
      onAddMessage(`Voice disconnected. Thank you ${selectedGuest.name}, have a wonderful stay!`, 'ai');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      setSession(null);
      setVoiceConnected(false);
      setAudioStream(null);
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

  return (
    <div className="p-4 border-t border-white/10 bg-black/20">
      <div className="flex items-center gap-4">
        {/* Professional WebRTC Controls */}
        <div className="flex items-center gap-3">
          {/* Main voice connection button */}
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
              <Phone className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          
          {/* Microphone mute toggle */}
          {voiceConnected && (
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>
          )}
          
          {/* Device selector */}
          {audioDevices.length > 1 && !voiceConnected && (
            <select
              value={selectedMicrophone}
              onChange={(e) => setSelectedMicrophone(e.target.value)}
              className="text-xs bg-white/10 text-[#f3ebe2] border border-white/20 rounded px-3 py-2"
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
        
        {/* Voice status and info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f3ebe2] text-sm font-medium">
                {voiceConnected ? (uiTextContent.voice_connected || 'Voice Connected to LIMI AI') : (uiTextContent.voice_disconnected || 'Voice Disconnected')}
              </p>
              <p className="text-[#f3ebe2]/60 text-xs">
                {voiceConnected ? 
                  `Room ${selectedGuest.stayInfo?.room} • Professional WebRTC • ${audioDevices.length} devices` : 
                  'Professional voice chat with echo cancellation and noise suppression'
                }
              </p>
            </div>
            
            {/* Connection quality indicator */}
            {voiceConnected && (
              <div className="flex items-center space-x-2">
                <div className="text-xs text-green-300">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span>Professional Audio</span>
                  </div>
                </div>
                
                {/* Audio settings indicator */}
                <div className="text-xs text-blue-300">
                  <div className="flex items-center space-x-1">
                    <Settings className="w-3 h-3" />
                    <span>HD</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Professional audio status */}
      {voiceConnected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-2 bg-white/5 rounded-lg"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#f3ebe2]/60">
              Audio Quality: {audioDevices.find(d => d.deviceId === selectedMicrophone)?.label || 'Default Microphone'}
            </span>
            <span className="text-green-300">
              ✅ Echo Cancellation • Noise Suppression • Auto Gain
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Export the main component
export function VoiceInterface(props: VoiceInterfaceProps) {
  return <VoiceInterfaceContent {...props} />;
}
