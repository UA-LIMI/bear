import axios from 'axios';
// OpenAI API configuration
const API_URL = 'https://api.openai.com/v1/chat/completions';
// Safely access environment variables with fallback
let API_KEY = '';
try {
  API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
} catch (e) {
  API_KEY = '';
}
// Set the API key programmatically (useful for when it's loaded from elsewhere)
export const setApiKey = (key: string) => {
  API_KEY = key;
};
// Interface for the message format
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
// Process a guest request through the OpenAI API
export const processGuestRequest = async (guestRequest: string, conversation: Message[] = [], knowledgeContext: string = ''): Promise<string> => {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.warn('OpenAI API key not configured. Using fallback response.');
      return 'I understand your request. Let me help you with that right away. Our team will ensure this is handled professionally and promptly.';
    }
    // Prepare messages array with context
    const messages: Message[] = [{
      role: 'system',
      content: `You are an AI assistant for a luxury hotel. Your role is to help hotel staff respond to guest requests professionally and accurately. Use the following hotel information in your responses: ${knowledgeContext}`
    }, ...conversation, {
      role: 'user',
      content: guestRequest
    }];
    // Make API request
    const response = await axios.post(API_URL, {
      model: 'gpt-4',
      // or another appropriate model
      messages,
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    });
    // Return the generated response
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return "I'm sorry, I couldn't process this request at the moment. Please try again later.";
  }
};
// Generate a suggested response for hotel staff
export const generateStaffResponse = async (guestRequest: string, knowledgeBase: any[]): Promise<string> => {
  // Extract relevant knowledge from the knowledge base
  const relevantKnowledge = knowledgeBase.filter(item => guestRequest.toLowerCase().includes(item.title.toLowerCase())).map(item => `${item.title}: ${item.content}`).join('\n\n');
  // Process the request with the relevant knowledge
  return processGuestRequest(`Generate a professional response to this guest request: "${guestRequest}"`, [], relevantKnowledge);
};
// Update the AI model's context with new information
export const updateAiContext = async (knowledgeBase: any[]): Promise<boolean> => {
  try {
    // In a real implementation, this might involve fine-tuning or updating a vector database
    // For this mock implementation, we'll just return success
    console.log('AI context updated with latest knowledge base information');
    return true;
  } catch (error) {
    console.error('Error updating AI context:', error);
    return false;
  }
};