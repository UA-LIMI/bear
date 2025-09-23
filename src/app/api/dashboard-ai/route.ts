import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 });
    }

    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(messages);

    // Generate response using Vercel AI SDK with streaming
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: modelMessages,
      system: `You are an AI assistant for a luxury hotel management system. You help hotel staff with:

1. **Guest Service Questions**: Answer questions about hotel policies, services, and procedures
2. **Operational Guidance**: Provide guidance on handling guest requests, room management, and service standards
3. **Problem Solving**: Help resolve guest issues and operational challenges
4. **Information Lookup**: Provide information about hotel facilities, services, and local attractions

Always respond professionally and provide actionable guidance for hotel staff. Keep responses concise but comprehensive.`,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Dashboard AI API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'AI service temporarily unavailable',
        message: 'Please try again later or contact IT support.'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}