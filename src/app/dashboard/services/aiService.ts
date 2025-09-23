// AI Service using Vercel AI SDK via API routes
// This service handles all AI interactions for the dashboard

interface AIRequest {
  prompt: string;
  context?: string;
  type: 'staff_qa' | 'guest_summary' | 'guest_insights' | 'request_analysis';
}

interface AIResponse {
  response: string;
  type: string;
  timestamp: string;
  fallback?: boolean;
}

// Main AI query function using Vercel AI SDK
export const queryAI = async ({ prompt, context, type }: AIRequest): Promise<string> => {
  try {
    const response = await fetch('/api/dashboard-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context,
        type
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.response;

  } catch (error) {
    console.error('AI Service error:', error);
    
    // Fallback responses for different types
    const fallbacks = {
      staff_qa: "I understand your question. Please refer to the hotel operations manual or contact your supervisor for specific guidance.",
      guest_summary: "Guest profile summary is currently unavailable. Please review the guest's profile information manually.",
      guest_insights: "Guest insights are temporarily unavailable. Please use the guest's historical data for personalized service.",
      request_analysis: "I understand this request. Please handle it according to standard hotel procedures and guest preferences."
    };

    return fallbacks[type] || "I'm currently unable to process this request. Please try again later.";
  }
};

// Staff Q&A - for staff asking questions about hotel operations
export const askStaffQuestion = async (question: string, context?: string): Promise<string> => {
  return queryAI({
    prompt: question,
    context,
    type: 'staff_qa'
  });
};

// Generate guest profile summary
export const generateGuestSummary = async (guestData: any): Promise<string> => {
  const guestContext = `
Guest Information:
- Name: ${guestData.name}
- VIP Status: ${guestData.vipStatus}
- Visit Count: ${guestData.visitCount}
- Room: ${guestData.currentRoom}
- Preferences: ${JSON.stringify(guestData.preferences)}
- Dietary Restrictions: ${guestData.dietaryRestrictions || 'None'}
- Allergies: ${guestData.allergies || 'None'}
- Notes: ${guestData.notes || 'None'}
  `;

  return queryAI({
    prompt: "Generate a concise professional summary for hotel staff about this guest, highlighting key preferences and service recommendations.",
    context: guestContext,
    type: 'guest_summary'
  });
};

// Generate detailed guest insights
export const generateGuestInsights = async (guestData: any, requestHistory?: any[]): Promise<string> => {
  const context = `
Guest Profile: ${JSON.stringify(guestData)}
Request History: ${requestHistory ? JSON.stringify(requestHistory) : 'No previous requests'}
  `;

  return queryAI({
    prompt: "Analyze this guest's behavior patterns, preferences, and history to provide actionable insights for personalized service.",
    context,
    type: 'guest_insights'
  });
};

// Analyze guest request and suggest response
export const analyzeGuestRequest = async (request: string, guestData?: any, knowledgeBase?: any[]): Promise<string> => {
  const context = `
Guest Request: ${request}
Guest Profile: ${guestData ? JSON.stringify(guestData) : 'No profile available'}
Hotel Knowledge: ${knowledgeBase ? knowledgeBase.map(kb => `${kb.title}: ${kb.content}`).join('\n') : 'No additional context'}
  `;

  return queryAI({
    prompt: "Analyze this guest request and suggest the best professional response and any relevant actions for hotel staff.",
    context,
    type: 'request_analysis'
  });
};

// Legacy compatibility - update existing OpenAI service calls
export const processGuestRequest = async (guestRequest: string, conversation: any[] = [], knowledgeContext: string = ''): Promise<string> => {
  return analyzeGuestRequest(guestRequest, null, knowledgeContext ? [{ title: 'Context', content: knowledgeContext }] : []);
};

export const generateStaffResponse = async (guestRequest: string, knowledgeBase: any[]): Promise<string> => {
  return analyzeGuestRequest(guestRequest, null, knowledgeBase);
};
