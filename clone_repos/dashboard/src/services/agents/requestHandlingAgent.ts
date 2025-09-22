import { AIAgent, AgentResponse, AgentContext } from './agentTypes';
import { createChatCompletion } from '../aiGatewayService';
import { getKnowledgeBase } from '../dataService';
export class RequestHandlingAgent implements AIAgent {
  id = 'request-handling-agent';
  name = 'Request Handling Agent';
  description = 'Categorizes, prioritizes guest requests and suggests responses';
  async execute(request: any, context?: AgentContext): Promise<AgentResponse> {
    try {
      // Get knowledge base for context
      const knowledgeBase = await getKnowledgeBase();
      // Extract relevant knowledge items based on request content
      const relevantKnowledge = knowledgeBase.filter(item => request.message.toLowerCase().includes(item.title.toLowerCase())).map(item => `${item.title}: ${item.content}`).join('\n\n');
      // Create a prompt for the AI
      const messages = [{
        role: 'system',
        content: `You are an AI assistant for a luxury hotel. Analyze guest requests to categorize, prioritize, and suggest responses.
          Use the following hotel information in your analysis: ${relevantKnowledge}`
      }, {
        role: 'user',
        content: `Analyze this guest request:
          Guest: ${request.guestName}
          Room: ${request.roomNumber}
          Request: "${request.message}"
          Provide:
          1. The appropriate category for this request (room-service, housekeeping, concierge, maintenance, transportation, amenities)
          2. Priority level (high, normal, low) with explanation
          3. A suggested response for hotel staff
          4. Recommended staff department to handle this
          5. Estimated time to fulfill
          Format your response as JSON with the following structure:
          {
            "category": "category-name",
            "priority": {"level": "high/normal/low", "explanation": "Reason for this priority"},
            "suggestedResponse": "Full response text",
            "staffDepartment": "Department name",
            "estimatedTime": "Time in minutes/hours"
          }`
      }];
      // Get AI response
      const completion = await createChatCompletion(messages, 'openai:gpt-4');
      if (!completion) {
        return {
          result: null,
          explanation: 'Failed to analyze request'
        };
      }
      // Parse the JSON response
      try {
        const analysis = JSON.parse(completion);
        return {
          result: analysis,
          confidence: 0.89,
          metadata: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            model: 'openai:gpt-4'
          }
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return {
          result: completion,
          explanation: 'Generated analysis but failed to parse as JSON',
          confidence: 0.65
        };
      }
    } catch (error) {
      console.error('Error in RequestHandlingAgent:', error);
      return {
        result: null,
        explanation: `Error analyzing request: ${error.message}`
      };
    }
  }
}
export default new RequestHandlingAgent();