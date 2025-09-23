import axios from 'axios';
// Vercel AI Gateway configuration
const AI_GATEWAY_URL = 'https://api.ai-gateway.example.com/v1'; // Replace with actual gateway URL
let API_KEY = '';
// Initialize API key from environment variables
try {
  API_KEY = typeof process !== 'undefined' && process.env?.REACT_APP_AI_GATEWAY_KEY || '';
} catch (e) {
  API_KEY = '';
}
// Set the API key programmatically
export const setApiKey = (key: string) => {
  API_KEY = key;
};
// Create a streaming completion
export const createStreamingCompletion = async (messages: string, model: string = 'openai:gpt-4'): Promise<AsyncIterable<string>> => {
  if (!API_KEY) {
    console.warn('AI Gateway API key not configured. Using fallback response.');
    return mockStreamingResponse('I am a fallback response due to missing API key configuration.');
  }
  try {
    const response = await fetch(`${AI_GATEWAY_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: typeof messages === 'string' ? JSON.parse(messages) : messages,
        stream: true
      })
    });
    if (!response.ok) {
      throw new Error(`AI Gateway returned ${response.status}: ${response.statusText}`);
    }
    // Return the stream for caller to process
    return streamAsyncIterator(response.body);
  } catch (error) {
    console.error('Error creating streaming completion:', error);
    return mockStreamingResponse('Sorry, I encountered an error while processing your request.');
  }
};
// Create a chat completion (non-streaming)
export const createChatCompletion = async (messages: any[], model: string = 'openai:gpt-4'): Promise<string> => {
  if (!API_KEY) {
    console.warn('AI Gateway API key not configured. Using fallback response.');
    return 'I am a fallback response due to missing API key configuration.';
  }
  try {
    const response = await axios.post(`${AI_GATEWAY_URL}/chat`, {
      model,
      messages,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error creating chat completion:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
};
// Helper function to convert ReadableStream to AsyncIterable
async function* streamAsyncIterator(stream: ReadableStream<Uint8Array> | null): AsyncIterable<string> {
  if (!stream) {
    return;
  }
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const {
        done,
        value
      } = await reader.read();
      if (done) return;
      const chunk = decoder.decode(value, {
        stream: true
      });
      // Parse the SSE format if needed
      const lines = chunk.split('\n').filter(line => line.startsWith('data: ') && line !== 'data: [DONE]').map(line => {
        try {
          const json = JSON.parse(line.substring(6));
          return json.choices[0]?.delta?.content || '';
        } catch (e) {
          return line.substring(6);
        }
      }).join('');
      yield lines;
    }
  } finally {
    reader.releaseLock();
  }
}
// Mock streaming response for fallback
async function* mockStreamingResponse(text: string): AsyncIterable<string> {
  const words = text.split(' ');
  for (const word of words) {
    yield word + ' ';
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}