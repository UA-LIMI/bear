import { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeSession } from '@openai/agents-realtime';

export type VoiceTelemetryStatus = 'healthy' | 'degraded' | 'critical';

export interface VoiceTelemetrySample {
  timestamp: number;
  bitrateKbps: number | null;
  packetLossPct: number | null;
  jitterMs: number | null;
  rttMs: number | null;
}

export interface UseVoiceTelemetryOptions {
  /** How frequently to poll WebRTC stats (ms). */
  intervalMs?: number;
  /** Maximum number of historical samples to retain. */
  historySize?: number;
}

export interface VoiceTelemetry {
  metrics: VoiceTelemetrySample;
  history: VoiceTelemetrySample[];
  status: VoiceTelemetryStatus;
  isPolling: boolean;
}

/**
 * Extract the underlying RTCPeerConnection from a realtime session, if available.
 */
const resolvePeerConnection = (session: RealtimeSession | null): RTCPeerConnection | null => {
  if (!session) return null;
  const transport = (session as unknown as { transport?: { connectionState?: { peerConnection?: RTCPeerConnection } } }).transport;
  const connectionState = transport?.connectionState;
  if (connectionState?.peerConnection) {
    return connectionState.peerConnection;
  }
  return null;
};

const initialMetrics: VoiceTelemetrySample = {
  timestamp: Date.now(),
  bitrateKbps: null,
  packetLossPct: null,
  jitterMs: null,
  rttMs: null,
};

export const useVoiceTelemetry = (
  session: RealtimeSession | null,
  options: UseVoiceTelemetryOptions = {}
): VoiceTelemetry => {
  const intervalMs = options.intervalMs ?? 3_000;
  const historySize = options.historySize ?? 20;

  const [metrics, setMetrics] = useState<VoiceTelemetrySample>(initialMetrics);
  const [history, setHistory] = useState<VoiceTelemetrySample[]>([]);
  const pollingRef = useRef<number | undefined>();
  const previousStatsRef = useRef<{
    timestamp: number;
    bytesSent: number;
    packetsSent: number;
    packetsLost: number;
  } | null>(null);

  const isPolling = useMemo(() => Boolean(pollingRef.current), []);

  useEffect(() => {
    const peerConnection = resolvePeerConnection(session);
    if (!peerConnection) {
      previousStatsRef.current = null;
      setMetrics((prev) => ({ ...prev, timestamp: Date.now() }));
      setHistory([]);
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = undefined;
      }
      return;
    }

    const pollStats = async () => {
      try {
        const report = await peerConnection.getStats();
        let outbound: RTCStats | undefined;
        let inbound: RTCStats | undefined;
        let candidatePair: RTCStats | undefined;

        report.forEach((stat) => {
          const typed = stat as RTCStats;
          if (typed.type === 'outbound-rtp' && (typed as any).kind === 'audio') {
            outbound = typed;
          }
          if (typed.type === 'inbound-rtp' && (typed as any).kind === 'audio') {
            inbound = typed;
          }
          if (typed.type === 'candidate-pair' && (typed as any).state === 'succeeded') {
            candidatePair = typed;
          }
        });

        const timestamp = outbound?.timestamp ?? Date.now();
        const bytesSent = (outbound as any)?.bytesSent ?? 0;
        const packetsSent = (outbound as any)?.packetsSent ?? 0;
        const packetsLostOutbound = (outbound as any)?.packetsLost ?? 0;
        const packetsLostInbound = (inbound as any)?.packetsLost ?? 0;
        const totalPacketsLost = packetsLostOutbound + packetsLostInbound;

        let bitrateKbps: number | null = null;
        let packetLossPct: number | null = null;

        if (previousStatsRef.current) {
          const timeDelta = timestamp - previousStatsRef.current.timestamp;
          const bytesDelta = bytesSent - previousStatsRef.current.bytesSent;

          if (timeDelta > 0) {
            const kbps = (bytesDelta * 8) / timeDelta;
            bitrateKbps = Number(Math.max(0, kbps).toFixed(1));
          }

          const packetsDelta = packetsSent - previousStatsRef.current.packetsSent;
          const lostDelta = totalPacketsLost - previousStatsRef.current.packetsLost;
          if (packetsDelta + lostDelta > 0) {
            const lossRatio = Math.max(0, lostDelta) / Math.max(1, packetsDelta + lostDelta);
            packetLossPct = Number((lossRatio * 100).toFixed(1));
          }
        }

        previousStatsRef.current = {
          timestamp,
          bytesSent,
          packetsSent,
          packetsLost: totalPacketsLost,
        };

        const jitterMs = Number((((inbound as any)?.jitter ?? 0) * 1000).toFixed(1));
        const rttMs = Number((((candidatePair as any)?.currentRoundTripTime ?? 0) * 1000).toFixed(1));

        const sample: VoiceTelemetrySample = {
          timestamp,
          bitrateKbps,
          packetLossPct,
          jitterMs,
          rttMs,
        };

        setMetrics(sample);
        setHistory((prev) => [...prev.slice(-historySize + 1), sample]);
      } catch (error) {
        console.warn('useVoiceTelemetry: failed to read WebRTC stats', error);
      }
    };

    pollStats();
    pollingRef.current = window.setInterval(pollStats, intervalMs);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = undefined;
      }
      previousStatsRef.current = null;
    };
  }, [session, intervalMs, historySize]);

  const status: VoiceTelemetryStatus = useMemo(() => {
    const { bitrateKbps, packetLossPct, jitterMs, rttMs } = metrics;
    if (packetLossPct !== null && packetLossPct > 10) return 'critical';
    if (jitterMs !== null && jitterMs > 50) return 'critical';
    if (rttMs !== null && rttMs > 250) return 'critical';
    if (packetLossPct !== null && packetLossPct > 5) return 'degraded';
    if (jitterMs !== null && jitterMs > 30) return 'degraded';
    if (rttMs !== null && rttMs > 180) return 'degraded';
    if (bitrateKbps !== null && bitrateKbps < 24) return 'degraded';
    return 'healthy';
  }, [metrics]);

  return {
    metrics,
    history,
    status,
    isPolling: Boolean(pollingRef.current),
  };
};
