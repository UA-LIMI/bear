'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, RefreshCcw, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { GuestProfile } from '@/types/guest';
import type { WeatherData } from '@/types/weather';
import type { McpToolDefinition, SessionSettings, VoiceContextSection, VoiceQualityPreset } from '@/types/voice';
import type { VoiceTelemetry, VoiceTelemetryStatus } from '@/hooks/useVoiceTelemetry';

interface SessionControlPanelProps {
  guest: GuestProfile | null;
  weather: WeatherData | null;
  settings: SessionSettings;
  sections: VoiceContextSection[];
  selectedSections: VoiceContextSection[];
  telemetry: VoiceTelemetry;
  isConnected: boolean;
  isProcessing: boolean;
  onSettingsChange: (settings: SessionSettings) => void;
  onToggleSection: (id: string) => void;
  onEnableAllSections: (enabled: boolean) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  mcpCatalog: McpToolDefinition[];
  mcpCatalogStatus: 'idle' | 'loading' | 'success' | 'error';
  mcpCatalogError: string | null;
}

const QUALITY_OPTIONS: { value: VoiceQualityPreset; label: string }[] = [
  { value: 'hd', label: 'HD Audio (24 kHz)' },
  { value: 'low-bandwidth', label: 'Low Bandwidth (16 kHz)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Mandarin' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'custom', label: 'Custom Language Code' },
];

const statusConfig: Record<VoiceTelemetryStatus, { icon: JSX.Element; label: string; border: string; text: string }> = {
  healthy: {
    icon: <CheckCircle2 className="size-4 text-green-400" />,
    label: 'Healthy',
    border: 'border-green-500/40',
    text: 'text-green-200',
  },
  degraded: {
    icon: <AlertTriangle className="size-4 text-amber-400" />,
    label: 'Degraded',
    border: 'border-amber-500/40',
    text: 'text-amber-200',
  },
  critical: {
    icon: <AlertTriangle className="size-4 text-red-400" />,
    label: 'Critical',
    border: 'border-red-500/40',
    text: 'text-red-200',
  },
};

const ToggleButton = ({ pressed, onToggle, label }: { pressed: boolean; onToggle: () => void; label: string }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'relative inline-flex h-9 w-16 items-center rounded-full border transition-all focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-primary/40',
      pressed
        ? 'bg-emerald-500/80 border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]'
        : 'bg-muted border-border'
    )}
    aria-pressed={pressed}
  >
    <span
      className={cn(
        'inline-block h-7 w-7 transform rounded-full bg-background shadow-lg transition-transform',
        pressed ? 'translate-x-7' : 'translate-x-1'
      )}
    />
    <span className="sr-only">{label}</span>
  </button>
);

const ContextToggle = ({ section, onToggle }: { section: VoiceContextSection; onToggle: () => void }) => (
  <div
    className={cn(
      'flex items-start justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20',
      section.enabled ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.05)]' : 'opacity-70'
    )}
  >
    <div className="space-y-1 pr-3">
      <p className="text-sm font-medium text-white">{section.title}</p>
      <p className="text-xs text-white/60">{section.description}</p>
    </div>
    <div className="flex items-center gap-2">
      {section.required ? (
        <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
          Required
        </span>
      ) : (
        <ToggleButton pressed={section.enabled} onToggle={onToggle} label={`Toggle ${section.title}`} />
      )}
    </div>
  </div>
);

export function SessionControlPanel({
  guest,
  weather,
  settings,
  sections,
  selectedSections,
  telemetry,
  isConnected,
  isProcessing,
  onSettingsChange,
  onToggleSection,
  onEnableAllSections,
  onConnect,
  onDisconnect,
  mcpCatalog,
  mcpCatalogStatus,
  mcpCatalogError,
}: SessionControlPanelProps) {
  const [localSettings, setLocalSettings] = useState<SessionSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingUpdate = (next: Partial<SessionSettings>) => {
    setLocalSettings((prev) => {
      const merged = { ...prev, ...next } as SessionSettings;
      onSettingsChange(merged);
      return merged;
    });
  };

  const allMcpTools = useMemo(
    () =>
      mcpCatalog.flatMap((server) =>
        server.tools.map((tool) => ({
          key: `${server.serverLabel}:${tool.name}`,
          name: tool.title ?? tool.name,
          description: tool.description,
          serverLabel: server.serverLabel,
          serverName: server.serverName,
        }))
      ),
    [mcpCatalog]
  );

  const allToolKeys = useMemo(() => allMcpTools.map((tool) => tool.key), [allMcpTools]);

  const handleMcpModeChange = (mode: SessionSettings['mcpExposureMode']) => {
    if (mode === localSettings.mcpExposureMode) return;

    if (mode === 'auto') {
      handleSettingUpdate({ mcpExposureMode: 'auto', includedMcpTools: allToolKeys });
    } else {
      const seed = localSettings.includedMcpTools.length > 0 ? localSettings.includedMcpTools : allToolKeys;
      handleSettingUpdate({ mcpExposureMode: 'manual', includedMcpTools: seed });
    }
  };

  const handleToolToggle = (toolKey: string) => {
    if (localSettings.mcpExposureMode !== 'manual') return;

    const exists = localSettings.includedMcpTools.includes(toolKey);
    const nextTools = exists
      ? localSettings.includedMcpTools.filter((key) => key !== toolKey)
      : [...localSettings.includedMcpTools, toolKey];
    handleSettingUpdate({ includedMcpTools: nextTools });
  };

  const handleSelectAllTools = () => handleSettingUpdate({ includedMcpTools: allToolKeys });
  const handleClearTools = () => handleSettingUpdate({ includedMcpTools: [] });

  const statusStyles = statusConfig[telemetry.status];
  const latestHistory = useMemo(() => telemetry.history.slice(-6).reverse(), [telemetry.history]);
  const enabledSectionsCount = selectedSections.length;
  const totalSectionsCount = sections.length;
  const selectedToolCount = localSettings.includedMcpTools.length;

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Session Controls</h3>
          <p className="text-sm text-white/60">
            Tailor voice quality, language, and operator preferences before launching a realtime session.
          </p>
        </div>
        <Settings2 className="size-5 text-white/60" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-white/80">Audio Quality Preset</Label>
          <Select
            value={localSettings.qualityPreset}
            onValueChange={(value) => handleSettingUpdate({ qualityPreset: value as VoiceQualityPreset })}
            disabled={isConnected || isProcessing}
          >
            <SelectTrigger className="min-w-[220px]">
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Presets</SelectLabel>
                {QUALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Preferred Language</Label>
          <Select
            value={localSettings.preferredLanguage}
            onValueChange={(value) => handleSettingUpdate({ preferredLanguage: value as SessionSettings['preferredLanguage'] })}
          >
            <SelectTrigger className="min-w-[220px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {localSettings.preferredLanguage === 'custom' && (
            <input
              type="text"
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="Enter ISO language code"
              value={localSettings.customLanguageCode ?? ''}
              onChange={(event) => handleSettingUpdate({ customLanguageCode: event.target.value })}
            />
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-white/50">Auto Reconnect</p>
          <ToggleButton
            pressed={localSettings.autoReconnect}
            onToggle={() => handleSettingUpdate({ autoReconnect: !localSettings.autoReconnect })}
            label="Toggle auto reconnect"
          />
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-white/50">Telemetry Interval (ms)</p>
          <input
            type="number"
            min={1000}
            max={10000}
            step={500}
            className="w-32 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            value={localSettings.telemetryIntervalMs}
            onChange={(event) => handleSettingUpdate({ telemetryIntervalMs: Number(event.target.value) })}
          />
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-white/50">Transcripts</p>
          <ToggleButton
            pressed={localSettings.enableTranscripts}
            onToggle={() => handleSettingUpdate({ enableTranscripts: !localSettings.enableTranscripts })}
            label="Toggle transcripts"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label className="text-white/80">Operator Notes</Label>
        <Textarea
          placeholder="Add quick notes for the session (e.g. special requests, VIP preferences)."
          value={localSettings.operatorNotes}
          onChange={(event) => handleSettingUpdate({ operatorNotes: event.target.value })}
          className="min-h-[90px] border-white/20 bg-white/5 text-white placeholder:text-white/40"
        />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-col gap-1">
          <Label className="text-white/80">AI Tool Exposure</Label>
          <p className="text-xs text-white/60">
            Decide which MCP tools the concierge may call during this guest session.
          </p>
        </div>
        <Select
          value={localSettings.mcpExposureMode}
          onValueChange={(value) => handleMcpModeChange(value as SessionSettings['mcpExposureMode'])}
          disabled={mcpCatalogStatus === 'loading'}
        >
          <SelectTrigger className="min-w-[220px]">
            <SelectValue placeholder="Select exposure mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Exposure Mode</SelectLabel>
              <SelectItem value="auto">Automatic (all available tools)</SelectItem>
              <SelectItem value="manual" disabled={mcpCatalogStatus !== 'success'}>
                Manual selection
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {localSettings.mcpExposureMode === 'manual' && (
          <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
            {mcpCatalogStatus === 'loading' && (
              <p className="text-xs text-white/60">Loading MCP tools…</p>
            )}
            {mcpCatalogStatus === 'error' && (
              <p className="text-xs text-red-300">
                Failed to load tools: {mcpCatalogError ?? 'Unknown error'}. Please retry later.
              </p>
            )}
            {mcpCatalogStatus === 'success' && allMcpTools.length === 0 && (
              <p className="text-xs text-white/60">No MCP tools available to configure.</p>
            )}
            {mcpCatalogStatus === 'success' && allMcpTools.length > 0 && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                  <span>
                    {selectedToolCount} of {allMcpTools.length} tools enabled
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:bg-white/10"
                      onClick={handleSelectAllTools}
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:bg-white/10"
                      onClick={handleClearTools}
                    >
                      Disable All
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {allMcpTools.map((tool) => (
                    <label
                      key={tool.key}
                      className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={localSettings.includedMcpTools.includes(tool.key)}
                        onChange={() => handleToolToggle(tool.key)}
                        className="mt-1 h-4 w-4 rounded border-white/40 bg-black/60 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <span className="space-y-1 text-sm text-white/80">
                        <span className="block text-sm font-semibold text-white">{tool.name}</span>
                        {tool.description && (
                          <span className="block text-xs text-white/60">{tool.description}</span>
                        )}
                        <span className="block text-[10px] uppercase tracking-wide text-white/40">
                          Server: {tool.serverName}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isProcessing}
          className={cn('px-6', isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600')}
        >
          {isProcessing ? (
            <>
              <RefreshCcw className="mr-2 size-4 animate-spin" />
              Processing
            </>
          ) : isConnected ? (
            'Disconnect Voice'
          ) : (
            'Connect Voice'
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            handleSettingUpdate({
              qualityPreset: 'hd',
              autoReconnect: true,
              preferredLanguage: 'auto',
              customLanguageCode: '',
              telemetryIntervalMs: 3000,
              enableTranscripts: false,
              operatorNotes: '',
              mcpExposureMode: 'auto',
              includedMcpTools: allToolKeys,
            });
            onEnableAllSections(true);
          }}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          Reset to Defaults
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Context Builder</h3>
            <p className="text-sm text-white/60">
              Enable or disable data segments before sending context to the realtime agent.
            </p>
            <p className="text-xs text-white/50">
              {enabledSectionsCount} of {totalSectionsCount} sections enabled
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-sm text-white/70 hover:bg-white/10"
              onClick={() => onEnableAllSections(true)}
            >
              Enable All
            </Button>
            <Button
              variant="ghost"
              className="text-sm text-white/60 hover:bg-white/10"
              onClick={() => onEnableAllSections(false)}
            >
              Disable Optional
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <ContextToggle key={section.id} section={section} onToggle={() => onToggleSection(section.id)} />
          ))}
        </div>
      </div>

      <div
        className={cn(
          'rounded-2xl border p-4 shadow-xl backdrop-blur',
          statusStyles.border,
          'bg-gradient-to-br from-black/50 via-black/40 to-black/60'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={statusStyles.text}>{statusStyles.icon}</span>
            <h3 className="text-lg font-semibold text-white">Connection Diagnostics</h3>
          </div>
          <span className={cn('rounded-full border px-3 py-1 text-xs uppercase tracking-wide', statusStyles.text, statusStyles.border)}>
            {statusStyles.label}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <MetricTile label="Bitrate" value={telemetry.metrics.bitrateKbps ? `${telemetry.metrics.bitrateKbps} kbps` : '—'} />
          <MetricTile label="Packet Loss" value={telemetry.metrics.packetLossPct ? `${telemetry.metrics.packetLossPct}%` : '—'} />
          <MetricTile label="Jitter" value={telemetry.metrics.jitterMs ? `${telemetry.metrics.jitterMs} ms` : '—'} />
          <MetricTile label="Round Trip" value={telemetry.metrics.rttMs ? `${telemetry.metrics.rttMs} ms` : '—'} />
        </div>

        {latestHistory.length > 0 && (
          <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3">
            <p className="text-xs uppercase tracking-wide text-white/40">Recent Samples</p>
            <div className="mt-2 grid gap-2 text-[11px] text-white/70 md:grid-cols-3">
              {latestHistory.map((sample) => (
                <div key={sample.timestamp} className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1">
                  <span>{new Date(sample.timestamp).toLocaleTimeString()}</span>
                  <span>
                    {sample.bitrateKbps ? `${sample.bitrateKbps} kbps` : '—'} |{' '}
                    {sample.packetLossPct ? `${sample.packetLossPct}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-2 text-xs text-white/60 md:grid-cols-2">
          <p>
            <span className="font-semibold text-white/80">Guest:</span>{' '}
            {guest ? `${guest.name} • ${guest.membershipTier}` : 'No guest selected'}
          </p>
          <p>
            <span className="font-semibold text-white/80">Weather Context:</span>{' '}
            {weather ? `${weather.temp}°C, ${weather.condition}` : 'Unavailable'}
          </p>
        </div>
      </div>
    </div>
  );
}

const MetricTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
      <span>{label}</span>
      <Activity className="size-3 text-white/60" />
    </div>
    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
  </div>
);
