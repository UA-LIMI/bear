'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RealtimeClient } from 'openai-realtime-api';
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

export function VoiceInterface({ selectedGuest, weather, uiTextContent, onAddMessage }: VoiceInterfaceProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const localStream = useRef<MediaStream | null>(null);

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

  // Professional WebRTC voice connection following OpenAI's pattern
  const startSession = async () => {
    setIsConnecting(true);
    
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

      // Get ephemeral token from our backend
      const tokenResponse = await fetch('/api/client-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `guest_${selectedGuest.id}_${Date.now()}`,
          model: 'gpt-4o-realtime-preview',
          voice: 'alloy'
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Failed to get session token: ${errorData.message || 'Unknown error'}`);
      }

      const { ephemeralKey } = await tokenResponse.json();

      // Create peer connection following OpenAI's WebRTC pattern
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Set up to play remote audio from the model
      audioElement.current = document.createElement('audio');
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track with professional constraints
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

      const ms = await navigator.mediaDevices.getUserMedia(audioConstraints);
      localStream.current = ms;
      
      // Log audio settings
      const audioTrack = ms.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        console.log('🎤 Professional audio settings:', settings);
      }
      
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for events
      const dc = pc.createDataChannel('oai-events');
      dataChannel.current = dc;

      // Create offer and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Connect to OpenAI Realtime API using WebRTC
      const baseUrl = 'https://api.openai.com/v1/realtime/calls';
      const model = 'gpt-4o-realtime-preview';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const sdp = await sdpResponse.text();
      const answer = { type: 'answer' as const, sdp };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;

      // Set up event listeners
      dc.addEventListener('open', () => {
        console.log('✅ Professional voice session connected');
        setIsSessionActive(true);
        setEvents([]);
        onAddMessage(`Voice connected! Hello ${selectedGuest.name}, I'm your AI assistant with professional audio quality. How can I help?`, 'ai');
        
        // Send session configuration with guest context
        sendClientEvent({
          type: 'session.update',
          session: {
            instructions: `You are LIMI AI for The Peninsula Hong Kong. Guest: ${selectedGuest.name} (${selectedGuest.profile.occupation}) in Room ${selectedGuest.stayInfo?.room}. Weather: ${currentWeather.temp}°C ${currentWeather.condition}. Keep responses under 30 words. Always confirm before room changes.`,
            voice: 'alloy',
            turn_detection: { type: 'server_vad', threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 200 }
          }
        });
      });

      dc.addEventListener('message', (e) => {
        const event = JSON.parse(e.data);
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }
        setEvents(prev => [event, ...prev]);
        
        // Handle AI responses
        if (event.type === 'response.audio_transcript.done') {
          onAddMessage(event.transcript, 'ai');
        }
      });

    } catch (error) {
      console.error('❌ Professional voice connection failed:', error);
      onAddMessage(`Voice connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or use text chat.`, 'ai');
    } finally {
      setIsConnecting(false);
    }
  };

  // Stop session and clean up
  const stopSession = () => {
    try {
      if (dataChannel.current) {
        dataChannel.current.close();
      }

      if (peerConnection.current) {
        peerConnection.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        peerConnection.current.close();
      }

      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }

      setIsSessionActive(false);
      dataChannel.current = null;
      peerConnection.current = null;
      localStream.current = null;
      
      onAddMessage(`Voice disconnected. Thank you ${selectedGuest.name}, have a wonderful stay!`, 'ai');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  };

  // Send event to OpenAI
  const sendClientEvent = (message: any) => {
    if (dataChannel.current && dataChannel.current.readyState === 'open') {
      const timestamp = new Date().toLocaleTimeString();
      message.event_id = message.event_id || crypto.randomUUID();
      
      dataChannel.current.send(JSON.stringify(message));
      
      if (!message.timestamp) {
        message.timestamp = timestamp;
      }
      setEvents(prev => [message, ...prev]);
    } else {
      console.error('Failed to send message - no data channel available', message);
    }
  };

  // Toggle mute functionality
  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
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
            onClick={isSessionActive ? stopSession : startSession}
            disabled={isConnecting}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#54bb74] hover:bg-[#54bb74]/80'
            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} shadow-lg`}
          >
            {isConnecting ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isSessionActive ? (
              <Phone className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          
          {/* Microphone mute toggle */}
          {isSessionActive && (
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
          {audioDevices.length > 1 && !isSessionActive && (
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
                {isSessionActive ? (uiTextContent.voice_connected || 'Voice Connected to LIMI AI') : (uiTextContent.voice_disconnected || 'Voice Disconnected')}
              </p>
              <p className="text-[#f3ebe2]/60 text-xs">
                {isSessionActive ? 
                  `Room ${selectedGuest.stayInfo?.room} • Professional WebRTC • ${audioDevices.length} devices` : 
                  'Professional voice chat with echo cancellation and noise suppression'
                }
              </p>
            </div>
            
            {/* Connection quality indicator */}
            {isSessionActive && (
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
      {isSessionActive && (
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
              ✅ Professional WebRTC • Echo Cancellation • Noise Suppression
            </span>
          </div>
          
          {/* Event count for debugging */}
          <div className="mt-1 text-xs text-blue-300">
            Events received: {events.length} • Session active: {isSessionActive ? 'Yes' : 'No'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
