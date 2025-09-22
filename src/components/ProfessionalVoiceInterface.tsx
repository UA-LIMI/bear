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
  type PipecatBaseChildProps
} from '@pipecat-ai/voice-ui-kit';
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
            {/* Main voice controls */}
            <div className="flex items-center gap-4">
              {/* Professional voice visualizer */}
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#54bb74] to-[#93cfa2]">
                <VoiceVisualizer
                  participantType="bot"
                  className="w-full h-full"
                />
              </div>
              
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

            {/* Advanced audio controls */}
            {showAdvancedControls && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white/5 rounded-lg p-4 space-y-3"
              >
                <h4 className="text-[#f3ebe2] font-medium text-sm">Professional Audio Controls</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Microphone input selection */}
                  <div>
                    <label className="text-[#f3ebe2]/70 text-xs block mb-2">Microphone Input</label>
                    <DeviceSelect
                      placeholder="Select microphone"
                      className="w-full"
                    />
                  </div>
                  
                  {/* Audio output selection */}
                  <div>
                    <label className="text-[#f3ebe2]/70 text-xs block mb-2">Audio Output</label>
                    <UserAudioOutputControl
                      label=""
                      placeholder="Select speaker"
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Audio quality info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#f3ebe2]/60">
                    Professional WebRTC with Pipecat Voice UI Kit
                  </span>
                  <span className="text-green-300">
                    ✅ Echo Cancellation • Noise Suppression • Auto Gain • Device Management
                  </span>
                </div>
              </motion.div>
            )}

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
