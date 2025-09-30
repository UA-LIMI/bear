export type VoiceQualityPreset = 'hd' | 'low-bandwidth';

export interface SessionSettings {
  qualityPreset: VoiceQualityPreset;
  autoReconnect: boolean;
  preferredLanguage: 'auto' | 'en' | 'zh' | 'fr' | 'ar' | 'custom';
  customLanguageCode?: string;
  telemetryIntervalMs: number;
  enableTranscripts: boolean;
  operatorNotes: string;
  mcpExposureMode: 'auto' | 'manual';
  includedMcpTools: string[];
}

export interface McpToolDefinition {
  serverLabel: string;
  serverName: string;
  tools: {
    name: string;
    title: string;
    description: string;
  }[];
}

export interface VoiceContextSection {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  required?: boolean;
  payload: Record<string, unknown>;
}

export interface SessionControlCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
}
