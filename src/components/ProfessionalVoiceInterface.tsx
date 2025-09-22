'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PipecatAppBase,
  DeviceSelect,
  UserAudioOutputControl,
  ConnectButton,
  VoiceVisualizer,
  ErrorCard,
  SpinLoader,
  TranscriptOverlay,
  type PipecatBaseChildProps
} from '@pipecat-ai/voice-ui-kit';
import { PlasmaVisualizer } from '@pipecat-ai/voice-ui-kit/webgl';
import { Loader2, Phone, Settings } from 'lucide-react';

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

interface ProfessionalVoiceInterfaceProps {
  selectedGuest: GuestProfile;
  weather: WeatherData;
  uiTextContent: Record<string, string>;
  onAddMessage: (content: string, role: 'user' | 'ai') => void;
}

export function ProfessionalVoiceInterface({ 
  selectedGuest, 
  weather, 
  uiTextContent, 
  onAddMessage 
}: ProfessionalVoiceInterfaceProps) {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  return (
    <div className="p-4 border-t border-white/10 bg-black/20">
      <PipecatAppBase
        transportType="smallwebrtc"
        connectParams={{
          webrtcUrl: "/api/webrtc-offer", // We'll need to create this endpoint
        }}
      >
        {({ client, handleConnect, handleDisconnect, error }: PipecatBaseChildProps) => (
          <div className="space-y-4">
            {/* Professional WebGL Plasma Visualizer */}
            <div className="mb-6 bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
              <div className="w-full h-48 relative">
                <PlasmaVisualizer />
                {/* Overlay with transcript */}
                {client?.connected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur rounded-lg p-4 max-w-md">
                      <div className="text-xs text-white/60 text-center mb-2">Live AI Transcript</div>
                      <TranscriptOverlay 
                        participant="remote" 
                        size="lg"
                        className="text-white text-center"
                        fadeInDuration={200}
                        fadeOutDuration={1000}
                      />
                    </div>
                  </div>
                )}
                {/* Connection status overlay */}
                <div className="absolute top-4 left-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    client?.connected ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {client?.connected ? '🔴 Live AI Session' : '⚫ Disconnected'}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional voice controls */}
            <div className="flex items-center gap-6">{/* Remove the old simple visualizer */}
              
              {/* Connect/disconnect button */}
              <ConnectButton
                onConnect={async () => {
                  // Get fresh weather context before connecting
                  try {
                    const weatherResponse = await fetch(`/api/get-weather?location=${encodeURIComponent('Hong Kong')}`);
                    const weatherResult = await weatherResponse.json();
                    console.log('Fresh weather for voice context:', weatherResult);
                  } catch (e) {
                    console.warn('Could not fetch weather for voice context');
                  }
                  
                  onAddMessage(`Starting voice connection for ${selectedGuest.name}...`, 'ai');
                  if (handleConnect) {
                    await handleConnect();
                  }
                  onAddMessage(`Voice connected! Hello ${selectedGuest.name}, I'm your AI assistant. How can I help?`, 'ai');
                }}
                onDisconnect={async () => {
                  if (handleDisconnect) {
                    await handleDisconnect();
                  }
                  onAddMessage(`Voice disconnected. Thank you ${selectedGuest.name}!`, 'ai');
                }}
                className="bg-[#54bb74] hover:bg-[#54bb74]/80 text-white px-6 py-3 rounded-lg font-medium"
              />
              
              {/* Advanced controls toggle */}
              <button
                onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#f3ebe2] transition-all"
                title="Audio settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {/* Voice status */}
              <div className="flex-1">
                <p className="text-[#f3ebe2] text-sm font-medium">
                  {client?.connected ? (uiTextContent.voice_connected || 'Voice Connected to LIMI AI') : (uiTextContent.voice_disconnected || 'Voice Disconnected')}
                </p>
                <p className="text-[#f3ebe2]/60 text-xs">
                  {client?.connected ? 
                    `Room ${selectedGuest.stayInfo?.room} • Professional Pipecat WebRTC` : 
                    'Professional voice chat with advanced audio processing'
                  }
                </p>
              </div>
            </div>

            {/* Professional Audio Device Controls */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">Professional Audio Controls</h4>
                <button
                  onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {showAdvancedControls ? 'Hide' : 'Show'} Advanced
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Microphone input selection */}
                <div>
                  <label className="text-white text-sm font-medium block mb-3">Microphone Input</label>
                  <DeviceSelect
                    placeholder="Select microphone"
                    className="w-full"
                    guide={
                      <div className="text-xs text-gray-400 mt-1">
                        Choose your preferred microphone for voice chat
                      </div>
                    }
                  />
                </div>
                
                {/* Audio output selection */}
                <div>
                  <label className="text-white text-sm font-medium block mb-3">Audio Output</label>
                  <UserAudioOutputControl
                    label=""
                    placeholder="Select speaker/headphones"
                    className="w-full"
                    guide={
                      <div className="text-xs text-gray-400 mt-1">
                        Choose where you want to hear the AI voice
                      </div>
                    }
                  />
                </div>
              </div>
              
              {/* Advanced controls */}
              {showAdvancedControls && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-white/10 space-y-4"
                >
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white font-semibold">Echo Cancellation</div>
                      <div className="text-green-400 text-xs mt-1">✅ Enabled</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white font-semibold">Noise Suppression</div>
                      <div className="text-green-400 text-xs mt-1">✅ Enabled</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white font-semibold">Auto Gain Control</div>
                      <div className="text-green-400 text-xs mt-1">✅ Enabled</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">
                      Professional WebRTC with Pipecat Voice UI Kit • 24kHz Sample Rate • Low Latency
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Error handling */}
            {error && (
              <ErrorCard className="bg-red-500/10 border border-red-500/20 text-red-300">
                Voice Error: {error}
              </ErrorCard>
            )}
          </div>
        )}
      </PipecatAppBase>
    </div>
  );
}
