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
import { Mic, Phone, Settings, Volume2 } from 'lucide-react';

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
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 h-full flex flex-col">
      {/* AI Module Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">LIMI AI Assistant</h2>
            <p className="text-gray-300 text-sm">Professional Voice & Text Chat • Room {selectedGuest.stayInfo?.room}</p>
          </div>
          <button
            onClick={() => setShowDeviceSettings(!showDeviceSettings)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            title="Audio device settings"
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
            <div className="h-full flex flex-col">
              
              {!client?.connected ? (
                /* DISCONNECTED STATE - Clean connection interface */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-8 max-w-md">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto shadow-2xl">
                      <Mic className="w-16 h-16 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-white text-2xl font-bold mb-3">Connect to LIMI AI</h3>
                      <p className="text-gray-300 text-lg">Start professional voice chat with your AI assistant</p>
                    </div>
                    
                    {/* Device Settings Panel */}
                    {showDeviceSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-4"
                      >
                        <h4 className="text-white font-medium text-center">Audio Device Selection</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-white text-sm block mb-2">🎤 Microphone Input</label>
                            <DeviceSelect
                              placeholder="Select your microphone"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm block mb-2">🔊 Audio Output</label>
                            <UserAudioOutputControl
                              label=""
                              placeholder="Select speakers/headphones"
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="text-center text-xs text-gray-400">
                          Professional WebRTC • Echo Cancellation • Noise Suppression
                        </div>
                      </motion.div>
                    )}
                    
                    <ConnectButton
                      onConnect={async () => {
                        onAddMessage?.(`Connecting to LIMI AI...`, 'ai');
                        if (handleConnect) {
                          await handleConnect();
                          onAddMessage?.(`Voice connected! Hello ${selectedGuest.name}, I'm your AI assistant.`, 'ai');
                        }
                      }}
                      onDisconnect={async () => {}}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
                    />
                  </div>
                </div>
              ) : (
                /* CONNECTED STATE - Active AI interface */
                <div className="h-full flex flex-col space-y-6">
                  
                  {/* Audio Visualizers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden">
                      <div className="p-3 border-b border-white/10 bg-blue-500/10">
                        <h4 className="text-white text-sm font-medium flex items-center">
                          <Mic className="w-4 h-4 mr-2" />
                          You Speaking
                        </h4>
                      </div>
                      <div className="h-40 relative">
                        <PlasmaVisualizer />
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden">
                      <div className="p-3 border-b border-white/10 bg-green-500/10">
                        <h4 className="text-white text-sm font-medium flex items-center">
                          <Volume2 className="w-4 h-4 mr-2" />
                          AI Speaking
                        </h4>
                      </div>
                      <div className="h-40 relative">
                        <PlasmaVisualizer />
                      </div>
                    </div>
                  </div>

                  {/* Live Transcript */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-6 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">Live Transcript</h4>
                      <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                        🔴 Live Session
                      </div>
                    </div>
                    <div className="min-h-[120px] flex items-center justify-center bg-black/20 rounded-lg">
                      <TranscriptOverlay 
                        participant="remote" 
                        size="lg"
                        className="text-white text-center p-4"
                        fadeInDuration={200}
                        fadeOutDuration={1000}
                      />
                    </div>
                  </div>

                  {/* Connected Controls */}
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <div className="font-medium">Connected to LIMI AI</div>
                      <div className="text-gray-400 text-sm">Professional WebRTC Session</div>
                    </div>
                    <ConnectButton
                      onConnect={async () => {}}
                      onDisconnect={async () => {
                        if (handleDisconnect) {
                          await handleDisconnect();
                          onAddMessage?.(`Voice disconnected. Thank you ${selectedGuest.name}!`, 'ai');
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4">
                  <ErrorCard className="bg-red-500/10 border border-red-500/20 text-red-300">
                    AI Connection Error: {error}
                  </ErrorCard>
                </div>
              )}
            </div>
          )}
        </PipecatAppBase>
      </div>
    </div>
  );
}
