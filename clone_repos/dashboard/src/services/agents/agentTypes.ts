// Define types for AI agents
export interface AIAgent {
  id: string;
  name: string;
  description: string;
  execute: (input: any, context?: any) => Promise<any>;
}
export interface AgentResponse {
  result: any;
  explanation?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}
export interface AgentContext {
  hotelData?: any;
  userData?: any;
  systemSettings?: any;
  previousInteractions?: Array<any>;
}