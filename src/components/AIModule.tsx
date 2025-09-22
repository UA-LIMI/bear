'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PipecatAppBase,
  DeviceSelect,
  UserAudioOutputControl,
  ConnectButton,
  TranscriptOverlay,
  ErrorCard,
  type PipecatBaseChildProps
} from '@pipecat-ai/voice-ui-kit';
import { PlasmaVisualizer } from '@pipecat-ai/voice-ui-kit/webgl';
import { Mic, MicOff, Phone, Settings } from 'lucide-react';

interface GuestProfile {
  id: string;
  name: string;
  stayInfo?: { room?: string; };
  membershipTier: string;
  guestType?: string;
}

interface AIModuleProps {
  selectedGuest: GuestProfile;
  onAddMessage?: (content: string, role: 'user' | 'ai') => void;
}

export function AIModule({ selectedGuest, onAddMessage }: AIModuleProps) {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 h-full flex flex-col">
      {/* AI Module Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">LIMI AI Assistant</h2>
            <p className="text-gray-300 text-sm">Voice & Text Chat • Room {selectedGuest.stayInfo?.room}</p>
          </div>
          <button
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Pipecat AI Integration */}
      <div className="flex-1 p-6">
        <PipecatAppBase
          transportType="smallwebrtc"
          connectParams={{
            webrtcUrl: "/api/webrtc-offer",
          }}
        >
          {({ client, handleConnect, handleDisconnect, error }: PipecatBaseChildProps) => (
            <div className="h-full flex flex-col space-y-6">
              
              {/* Audio Visualizers */}
              <div className="grid grid-cols-2 gap-4">
                {/* User Audio Visualizer */}
                <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-3 border-b border-white/10">
                    <h4 className="text-white text-sm font-medium">You Speaking</h4>
                  </div>
                  <div className="h-32 relative">
                    <PlasmaVisualizer />
                    <div className="absolute top-2 left-2">
                      <div className={`w-2 h-2 rounded-full ${client?.connected ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} />
                    </div>
                  </div>
                </div>
                
                {/* AI Audio Visualizer */}
                <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-3 border-b border-white/10">
                    <h4 className="text-white text-sm font-medium">AI Speaking</h4>
                  </div>
                  <div className="h-32 relative">
                    <PlasmaVisualizer />
                    <div className="absolute top-2 left-2">
                      <div className={`w-2 h-2 rounded-full ${client?.connected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Transcript Display */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 min-h-[100px]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Live Transcript</h4>
                  <div className={`px-2 py-1 rounded text-xs ${
                    client?.connected ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {client?.connected ? 'Live' : 'Offline'}
                  </div>
                </div>
                <div className="min-h-[60px] flex items-center justify-center">
                  {client?.connected ? (
                    <TranscriptOverlay 
                      participant="remote" 
                      size="lg"
                      className="text-white text-center"
                      fadeInDuration={200}
                      fadeOutDuration={1000}
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">Connect to see live transcript</p>
                  )}
                </div>
              </div>

              {/* Voice Connection Controls */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <ConnectButton
                    onConnect={async () => {
                      onAddMessage?.(`Starting voice connection for ${selectedGuest.name}...`, 'ai');
                      if (handleConnect) await handleConnect();
                      onAddMessage?.(`Voice connected! Hello ${selectedGuest.name}, I'm your AI assistant.`, 'ai');
                    }}
                    onDisconnect={async () => {
                      if (handleDisconnect) await handleDisconnect();
                      onAddMessage?.(`Voice disconnected. Thank you ${selectedGuest.name}!`, 'ai');
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-6 rounded-lg"
                  />
                  
                  <div className="text-center">
                    <div className="text-white text-sm font-medium">
                      {client?.connected ? 'Connected' : 'Disconnected'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {client?.connected ? 'Professional WebRTC' : 'Click to connect'}
                    </div>
                  </div>
                </div>

                {/* Device Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium block mb-2">Microphone</label>
                    <DeviceSelect
                      placeholder="Select microphone"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium block mb-2">Speaker</label>
                    <UserAudioOutputControl
                      label=""
                      placeholder="Select speaker"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Audio Settings */}
              {showAdvancedControls && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/5 rounded-xl border border-white/10 p-4"
                >
                  <h4 className="text-white font-medium mb-3">Audio Settings</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white text-sm">Echo Cancel</div>
                      <div className="text-green-400 text-xs">✅ On</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white text-sm">Noise Suppress</div>
                      <div className="text-green-400 text-xs">✅ On</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white text-sm">Auto Gain</div>
                      <div className="text-green-400 text-xs">✅ On</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Display */}
              {error && (
                <ErrorCard className="bg-red-500/10 border border-red-500/20 text-red-300">
                  AI Error: {error}
                </ErrorCard>
              )}
            </div>
          )}
        </PipecatAppBase>
      </div>
    </div>
  );
}
