import { AIAgent } from './agentTypes';
import guestInsightAgent from './guestInsightAgent';
import requestHandlingAgent from './requestHandlingAgent';
// Add more agent imports as you create them
class AgentRegistry {
  private agents: Map<string, AIAgent> = new Map();
  constructor() {
    this.registerAgent(guestInsightAgent);
    this.registerAgent(requestHandlingAgent);
    // Register more agents here
  }
  registerAgent(agent: AIAgent): void {
    this.agents.set(agent.id, agent);
  }
  getAgent(agentId: string): AIAgent | undefined {
    return this.agents.get(agentId);
  }
  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }
  async executeAgent(agentId: string, input: any, context?: any): Promise<any> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }
    return agent.execute(input, context);
  }
}
export const agentRegistry = new AgentRegistry();