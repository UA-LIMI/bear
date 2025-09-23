import { AIAgent, AgentResponse, AgentContext } from './agentTypes';
import { createChatCompletion } from '../aiGatewayService';
import { getGuestProfileById } from '../dataService';
export class GuestInsightAgent implements AIAgent {
  id = 'guest-insight-agent';
  name = 'Guest Insight Agent';
  description = 'Analyzes guest data to provide personalized insights and recommendations';
  async execute(guestId: string, context?: AgentContext): Promise<AgentResponse> {
    try {
      // Get guest profile data
      const guestProfile = await getGuestProfileById(guestId);
      if (!guestProfile) {
        return {
          result: null,
          explanation: 'Guest profile not found'
        };
      }
      // Create a prompt for the AI
      const messages = [{
        role: 'system',
        content: `You are an AI assistant for a luxury hotel. Analyze the guest profile data and provide insights and personalized recommendations. 
          Focus on identifying preferences, patterns, and opportunities to enhance the guest experience.`
      }, {
        role: 'user',
        content: `Analyze this guest profile and provide insights:
          Guest Name: ${guestProfile.name}
          VIP Status: ${guestProfile.vipStatus}
          Visit Count: ${guestProfile.visitCount}
          Preferences: ${JSON.stringify(guestProfile.preferences)}
          Special Occasions: ${guestProfile.specialOccasions || 'None'}
          Dietary Restrictions: ${guestProfile.dietaryRestrictions || 'None'}
          Allergies: ${guestProfile.allergies || 'None'}
          Notes: ${guestProfile.notes || 'None'}
          Provide:
          1. A brief overview of the guest
          2. Key preferences detected
          3. Three personalized recommendations to enhance their stay
          4. Any special attention points for staff
          Format your response as JSON with the following structure:
          {
            "overview": "Brief overview text",
            "preferences": ["pref1", "pref2", "pref3"],
            "recommendations": [
              {"title": "Rec 1 title", "description": "Description", "priority": "high/medium/low"},
              {"title": "Rec 2 title", "description": "Description", "priority": "high/medium/low"},
              {"title": "Rec 3 title", "description": "Description", "priority": "high/medium/low"}
            ],
            "specialAttention": ["point1", "point2"]
          }`
      }];
      // Get AI response
      const completion = await createChatCompletion(messages, 'openai:gpt-4');
      if (!completion) {
        return {
          result: null,
          explanation: 'Failed to generate insights'
        };
      }
      // Parse the JSON response
      try {
        const insights = JSON.parse(completion);
        return {
          result: insights,
          confidence: 0.92,
          metadata: {
            guestId,
            timestamp: new Date().toISOString(),
            model: 'openai:gpt-4'
          }
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return {
          result: completion,
          explanation: 'Generated insights but failed to parse as JSON',
          confidence: 0.7
        };
      }
    } catch (error) {
      console.error('Error in GuestInsightAgent:', error);
      return {
        result: null,
        explanation: `Error generating insights: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
export default new GuestInsightAgent();