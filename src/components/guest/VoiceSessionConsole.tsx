'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';
import { Loader2, Mic, MicOff, Phone, Settings, Sparkles, Waves } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { GuestProfile } from '@/types/guest';
import type { WeatherData } from '@/types/weather';
import type { SessionSettings, VoiceContextSection, VoiceQualityPreset } from '@/types/voice';

export type VoiceConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface VoiceSessionConsoleHandle {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

interface VoiceSessionConsoleProps {
  guest: GuestProfile;
  weather: WeatherData | null;
  settings: SessionSettings;
  contexts: VoiceContextSection[];
  onAddMessage: (content: string, role: 'user' | 'ai') => void;
  onSessionChange?: (session: RealtimeSession | null) => void;
  onConnectionStateChange?: (state: VoiceConnectionState) => void;
}

const QUALITY_CONSTRAINTS: Record<VoiceQualityPreset, MediaTrackConstraints> = {
  hd: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: { ideal: 24000, min: 16000 },
    channelCount: { ideal: 1 },
  },
  'low-bandwidth': {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: { ideal: 16000, min: 8000 },
    channelCount: { ideal: 1 },
  },
};

const buildInstructions = (
  guest: GuestProfile,
  weather: WeatherData | null,
  contexts: VoiceContextSection[],
  settings: SessionSettings
) => {
  const enabledContexts = contexts.filter((section) => section.enabled);
  const contextSection = enabledContexts.length
    ? enabledContexts
        .map(
          (section) =>
            `- ${section.title}: ${section.description}. Data: ${JSON.stringify(section.payload ?? {}, null, 2)}`
        )
        .join('\n')
    : '- None provided.';

  const languageDirective =
    settings.preferredLanguage === 'auto'
      ? 'Detect the guest’s spoken language automatically and respond accordingly.'
      : settings.preferredLanguage === 'custom'
      ? `Respond using the ISO language code "${settings.customLanguageCode ?? 'en'}".`
      : `Respond strictly in ${settings.preferredLanguage.toUpperCase()} unless the guest explicitly switches language.`;

  const weatherLine = weather
    ? `Current weather: ${weather.temp}°C, ${weather.condition}, humidity ${weather.humidity}%. Source: ${weather.source ?? 'unspecified'}.`
    : 'Weather data is unavailable; do not reference weather conditions.';

  return `# Role
You are LIMI AI Concierge for The Peninsula Hong Kong. Deliver polished, proactive service that reflects a luxury hospitality experience.

# Guest Snapshot
- Name: ${guest.name}
- Occupation: ${guest.profile?.occupation ?? 'Guest'}
- Room: ${guest.stayInfo?.room ?? 'Unavailable'}
- Membership tier: ${guest.membershipTier}
- Loyalty points: ${guest.loyaltyPoints ?? 0}
- Operator notes: ${settings.operatorNotes || 'None'}

# Context
${contextSection}

# Environment
- ${weatherLine}
- ${languageDirective}

# Tools
You have access to three critical tools for managing guest service requests:

## create_service_request
- **When to use**: Anytime a guest requests something you cannot directly provide:
  - Food orders (room service, dining reservations) - "I'd like a margherita pizza"
  - Transportation (taxis, car service, airport transfers) - "I need a taxi to the airport"
  - Housekeeping (cleaning, towels, amenities) - "Can I get extra towels?"
  - Concierge services (tickets, reservations, information) - "Book me dinner at..."
  - Room maintenance (temperature, repairs) - "The AC isn't working"
  - Any other guest service needs
- **Required**: Only 'summary' field (min 12 characters) - a clear, detailed staff-facing description
- **Optional**: roomNumber (important!), requestType (e.g., 'dining', 'taxi', 'housekeeping'), priority (defaults to 'normal'), metadata (for extra details)
- **Important**: Status automatically defaults to 'pending' - do NOT set it yourself
- **After calling**: IMMEDIATELY confirm to guest: "I've submitted your request for [item]. The staff will handle it right away."

## get_service_requests  
- **When to use**: Guest asks about status of their requests ("Where's my food?", "What's happening with my taxi?", "Did you get my order?")
- **Parameters**: Use roomNumber to find all requests for this guest's room
- **Returns**: List of requests with ID, status (pending/in_progress/completed), priority, summary, timestamps
- **After calling**: Tell guest the current status. If status is "in_progress", tell them staff is working on it. If "pending" and guest is asking, use update_service_request_priority tool next.

## update_service_request_priority
- **When to use**: Guest is asking about a request that's still pending ("Where is my pizza?", "What's taking so long?")
- **Parameters**: requestId (from get_service_requests), priority (set to 'urgent')
- **Purpose**: Alerts staff that guest is actively waiting and asking for updates
- **Flow**: 1) get_service_requests to find the request, 2) if status is 'pending', update priority to 'urgent', 3) reassure guest

**Critical Rules:**
- Never invent request data. If you create a request, you MUST receive confirmation with an ID.
- Always use roomNumber when creating requests so staff knows which room
- If tool fails, tell guest there was an issue and you'll escalate to staff directly
- When guest orders food, use requestType='dining' and include details in metadata if needed

# Safety & Privacy
- Do not disclose internal notes or other guests’ information.
- Avoid promising unavailable services; instead, offer to escalate to human staff when unsure.
- Confirm sensitive actions (payments, security, emergencies) before proceeding.

# Escalation
- Escalate any emergency, medical concern, or request outside concierge authority to a human staff member immediately.
- If the guest expresses dissatisfaction or the task requires manual approval, notify staff and summarize the situation.

# Response Style
- Keep replies concise, warm, and professional.
- Summarize actions taken and next steps.
- Offer proactive assistance related to the guest’s profile when appropriate.`;
};

export const VoiceSessionConsole = forwardRef<VoiceSessionConsoleHandle, VoiceSessionConsoleProps>(
  (
    { guest, weather, settings, contexts, onAddMessage, onSessionChange, onConnectionStateChange },
    ref
  ) => {
    const [connectionState, setConnectionState] = useState<VoiceConnectionState>('idle');
    const [session, setSession] = useState<RealtimeSession | null>(null);
    const sessionRef = useRef<RealtimeSession | null>(null);

    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedMicrophone, setSelectedMicrophone] = useState<string | null>(null);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const instructions = useMemo(
      () => buildInstructions(guest, weather, contexts, settings),
      [guest, weather, contexts, settings]
    );

    const updateState = useCallback(
      (next: VoiceConnectionState) => {
        setConnectionState(next);
        onConnectionStateChange?.(next);
      },
      [onConnectionStateChange]
    );

    const cleanupStream = useCallback(() => {
      const stream = audioStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      audioStreamRef.current = null;
      setAudioStream(null);
      setIsMuted(false);
    }, []);

    const cleanupSession = useCallback(() => {
      const activeSession = sessionRef.current;
      if (activeSession) {
        try {
          activeSession.close();
        } catch (error) {
          console.warn('VoiceSessionConsole: failed to close session cleanly', error);
        }
      }
      sessionRef.current = null;
      setSession(null);
      onSessionChange?.(null);
    }, [onSessionChange]);

    const handleDisconnect = useCallback(
      async (silent: boolean) => {
        if (connectionState === 'idle') {
          cleanupStream();
          cleanupSession();
          updateState('idle');
          return;
        }

        updateState('disconnecting');
        try {
          cleanupSession();
          cleanupStream();
          if (!silent) {
            onAddMessage(`Voice session closed for ${guest.name}.`, 'ai');
          }
        } finally {
          setErrorMessage(null);
          updateState('idle');
        }
      },
      [cleanupSession, cleanupStream, connectionState, guest.name, onAddMessage, updateState]
    );

    const enumerateDevices = useCallback(async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((device) => device.kind === 'audioinput');
        setAudioDevices(inputs);
        if (!selectedMicrophone && inputs.length > 0) {
          setSelectedMicrophone(inputs[0].deviceId);
        }
      } catch (error) {
        console.warn('VoiceSessionConsole: unable to enumerate audio devices', error);
      }
    }, [selectedMicrophone]);

    useEffect(() => {
      enumerateDevices();
      navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
      return () => navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    }, [enumerateDevices]);

    useEffect(() => () => {
      void handleDisconnect(true);
    }, [handleDisconnect]);

    const handleConnect = useCallback(async () => {
      if (connectionState === 'connecting' || connectionState === 'connected') return;

      setErrorMessage(null);
      updateState('connecting');

      try {
        if (sessionRef.current) {
          await handleDisconnect(true);
        }

        const response = await fetch('/api/client-secret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: `guest_${guest.id}_${Date.now()}`,
            model: 'gpt-4o-realtime-preview',
            voice: settings.qualityPreset === 'low-bandwidth' ? 'verse' : 'alloy',
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'Failed to obtain realtime session key');
        }

        const { ephemeralKey, mcpServers = [] } = await response.json();

        const hostedMcpServersMeta = Array.isArray(mcpServers)
          ? mcpServers
              .filter((server: { url?: string }) => typeof server?.url === 'string')
              .map((server: { name?: string; label?: string; url: string; authorization?: string }) => {
                const baseName = server.label ?? server.name ?? 'service-request-mcp';
                const normalizedLabel = baseName.replace(/\s+/g, '_');
                return {
                  serverLabel: normalizedLabel,
                  originalLabel: normalizedLabel,
                  serverUrl: server.url,
                  authorization: server.authorization,
                };
              })
          : [];

        const agent = new RealtimeAgent({
          name: 'LIMI AI Concierge',
          instructions,
        });

        const realtimeSession = new RealtimeSession(agent);

        // Set up MCP tool call handler
        realtimeSession.on('conversation.item.created', async (event: any) => {
          if (event?.item?.type === 'function_call') {
            const functionCall = event.item;
            const toolName = functionCall.name;
            const callId = functionCall.call_id;
            
            console.log('🔧 Tool call detected:', {
              name: toolName,
              callId,
              arguments: functionCall.arguments
            });

            try {
              // Parse arguments
              const args = typeof functionCall.arguments === 'string' 
                ? JSON.parse(functionCall.arguments)
                : functionCall.arguments;

              // Find the MCP server for this tool
              const mcpServer = hostedMcpServersMeta.find(() => true); // We only have one server
              
              if (!mcpServer) {
                throw new Error('No MCP server configured');
              }

              console.log('🔧 Executing tool via MCP server:', mcpServer.serverUrl);

              // Execute tool call via HTTP to MCP server
              const toolResponse = await fetch(`${mcpServer.serverUrl}/tool/${toolName}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(mcpServer.authorization ? { 'Authorization': mcpServer.authorization } : {}),
                },
                body: JSON.stringify({ arguments: args }),
              });

              if (!toolResponse.ok) {
                const errorText = await toolResponse.text();
                console.error('🔧 Tool call failed:', errorText);
                throw new Error(`Tool execution failed: ${errorText}`);
              }

              const toolResult = await toolResponse.json();
              console.log('🔧 Tool result:', toolResult);

              // Send result back to AI
              realtimeSession.sendEvent({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: callId,
                  output: JSON.stringify(toolResult.result || toolResult),
                },
              });

              // Tell AI to respond
              realtimeSession.sendEvent({
                type: 'response.create',
              });

              onAddMessage?.(
                `Tool executed: ${toolName} completed successfully`,
                'ai'
              );

            } catch (error) {
              console.error('🔧 Tool execution error:', error);
              
              // Send error back to AI
              realtimeSession.sendEvent({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: callId,
                  output: JSON.stringify({
                    error: error instanceof Error ? error.message : 'Unknown error',
                    success: false,
                  }),
                },
              });

              // Tell AI to respond with error
              realtimeSession.sendEvent({
                type: 'response.create',
              });

              onAddMessage?.(
                `Tool error: ${toolName} failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
                'ai'
              );
            }
          }
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            ...QUALITY_CONSTRAINTS[settings.qualityPreset],
            deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          },
        });

        audioStreamRef.current = stream;
        setAudioStream(stream);
        setIsMuted(false);

        await realtimeSession.connect({ apiKey: ephemeralKey });

        if (hostedMcpServersMeta.length > 0) {
          const manualToolMap = new Map<string, string[]>();
          if (settings.mcpExposureMode === 'manual') {
            for (const entry of settings.includedMcpTools) {
              const [label, toolName] = entry.split(':');
              if (!label || !toolName) continue;
              const normalizedLabel = label.replace(/\s+/g, '_');
              const bucket = manualToolMap.get(normalizedLabel) ?? [];
              bucket.push(toolName);
              manualToolMap.set(normalizedLabel, bucket);
            }
          }

          const configuredServers = hostedMcpServersMeta.map(({ serverLabel, serverUrl, authorization }) => {
            const serverConfig: Record<string, unknown> = {
              server_label: serverLabel,
              server_url: serverUrl,
            };

            if (authorization) {
              serverConfig.authorization = authorization;
            }

            if (settings.mcpExposureMode === 'manual') {
              const allowedTools = manualToolMap.get(serverLabel) ?? [];
              serverConfig.allowed_tools = allowedTools;
            }

            return serverConfig;
          });

          realtimeSession.transport.sendEvent({
            type: 'session.update',
            session: {
              // The Realtime API accepts mcp_servers even though the SDK typings do not yet expose it
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              mcp_servers: configuredServers as any,
            } as unknown as Partial<Record<string, unknown>>,
          });
        }

        sessionRef.current = realtimeSession;
        setSession(realtimeSession);
        onSessionChange?.(realtimeSession);

        onAddMessage(
          `Voice connected for ${guest.name} with ${settings.qualityPreset === 'hd' ? 'HD' : 'low bandwidth'} profile.`,
          'ai'
        );

        updateState('connected');
      } catch (error) {
        console.error('VoiceSessionConsole: connect failed', error);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        onAddMessage(
          `Voice connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please retry.`,
          'ai'
        );
        await handleDisconnect(true);
        updateState('error');
      }
    }, [connectionState, guest, handleDisconnect, instructions, onAddMessage, onSessionChange, selectedMicrophone, settings]);

    useImperativeHandle(
      ref,
      () => ({
        connect: () => handleConnect(),
        disconnect: () => handleDisconnect(false),
      }),
      [handleConnect, handleDisconnect]
    );

    const toggleMute = useCallback(() => {
      const stream = audioStreamRef.current;
      if (!stream) return;
      const track = stream.getAudioTracks()[0];
      if (!track) return;
      const next = !track.enabled;
      track.enabled = next;
      setIsMuted(!next);
    }, []);

    const connectionBadge = useMemo(() => {
      switch (connectionState) {
        case 'connected':
          return { label: 'Connected', tone: 'text-emerald-300', dot: 'bg-emerald-400' };
        case 'connecting':
          return { label: 'Connecting', tone: 'text-blue-300', dot: 'bg-blue-400 animate-pulse' };
        case 'disconnecting':
          return { label: 'Disconnecting', tone: 'text-amber-300', dot: 'bg-amber-400 animate-pulse' };
        case 'error':
          return { label: 'Error', tone: 'text-red-300', dot: 'bg-red-400 animate-pulse' };
        default:
          return { label: 'Idle', tone: 'text-gray-300', dot: 'bg-gray-400' };
      }
    }, [connectionState]);

    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Voice Session Console</h3>
            <p className="text-sm text-white/60">
              Launch realtime audio with luxury concierge presets and live context streaming.
            </p>
          </div>
          <Settings className="size-5 text-white/60" />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => void handleConnect()}
            disabled={connectionState === 'connecting'}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full text-white transition-all',
              connectionState === 'connected'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600',
              connectionState === 'connecting' && 'opacity-60'
            )}
          >
            {connectionState === 'connecting' ? (
              <Loader2 className="size-6 animate-spin" />
            ) : connectionState === 'connected' ? (
              <Phone className="size-6" />
            ) : (
              <Mic className="size-6" />
            )}
          </button>

          {connectionState === 'connected' && (
            <button
              onClick={() => void handleDisconnect(false)}
              className="flex h-12 items-center rounded-full bg-white/10 px-4 text-sm text-white hover:bg-white/20"
            >
              Hang Up
            </button>
          )}

          {connectionState === 'connected' && (
            <button
              onClick={toggleMute}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-700'
              )}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="size-5 text-white" /> : <Mic className="size-5 text-white" />}
            </button>
          )}

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
              <span className={cn('h-2 w-2 rounded-full', connectionBadge.dot)} />
              {connectionBadge.label}
            </span>
            <span className="text-xs text-white/50">
              {settings.qualityPreset === 'hd' ? 'HD 24 kHz' : 'Low bandwidth 16 kHz'}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-white/50">Microphone Source</label>
            <select
              value={selectedMicrophone ?? ''}
              onChange={(event) => setSelectedMicrophone(event.target.value || null)}
              disabled={connectionState === 'connected'}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            >
              <option value="">Default System Microphone</option>
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-white/50">Language Policy</label>
            <div className="rounded-md border border-white/10 bg-black/40 p-3 text-sm text-white/70">
              {settings.preferredLanguage === 'auto'
                ? 'Automatic language detection for guest dialogue.'
                : settings.preferredLanguage === 'custom'
                ? `Respond in custom language code ${settings.customLanguageCode || '—'}.`
                : `Respond in ${settings.preferredLanguage.toUpperCase()} unless guest requests otherwise.`}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Waves className="size-4" />
              <span>Active Context ({contexts.filter((section) => section.enabled).length})</span>
            </div>
            <Sparkles className="size-4 text-amber-300" />
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {contexts.filter((section) => section.enabled).map((section) => (
              <div key={section.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                <p className="text-sm font-semibold text-white">{section.title}</p>
                <p className="mt-1 line-clamp-3 text-white/60">{section.description}</p>
              </div>
            ))}
            {contexts.filter((section) => section.enabled).length === 0 && (
              <div className="rounded-lg border border-dashed border-white/20 bg-transparent p-3 text-xs text-white/50">
                Enable context sections from the control panel to enrich the realtime agent instructions.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/60">
          <p>
            <span className="text-white/80">Instructions Preview:</span>
          </p>
          <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[11px] text-white/70">
            {instructions}
          </pre>
        </div>
      </div>
    );
  }
);

VoiceSessionConsole.displayName = 'VoiceSessionConsole';
