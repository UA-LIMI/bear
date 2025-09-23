import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, type } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Prepare system message based on the request type
    let systemMessage = '';
    switch (type) {
      case 'staff_qa':
        systemMessage = `You are an AI assistant for hotel staff. Provide helpful, professional responses to staff questions about hotel operations, guest services, and procedures. Keep responses concise and actionable.`;
        break;
      case 'guest_summary':
        systemMessage = `You are an AI that generates guest profile summaries for hotel staff. Analyze the provided guest data and create insightful summaries that help staff provide personalized service. Focus on preferences, patterns, and actionable recommendations.`;
        break;
      case 'guest_insights':
        systemMessage = `You are an AI that analyzes guest behavior and preferences. Generate detailed insights about guest patterns, spending habits, and service preferences that can help hotel staff provide exceptional personalized service.`;
        break;
      case 'request_analysis':
        systemMessage = `You are an AI that helps hotel staff understand and respond to guest requests. Analyze the request and provide suggestions for the best response and any relevant hotel information.`;
        break;
      default:
        systemMessage = `You are a helpful AI assistant for a luxury hotel management system. Provide professional, accurate, and helpful responses.`;
    }

    // Generate response using Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: systemMessage + (context ? `\n\nAdditional context: ${context}` : '')
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      response: text,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard AI API error:', error);
    
    // Provide fallback response
    const fallbackResponses = {
      staff_qa: "I understand your question. Please refer to the hotel operations manual or contact your supervisor for specific guidance.",
      guest_summary: "Guest profile summary is currently unavailable. Please review the guest's profile information manually.",
      guest_insights: "Guest insights are temporarily unavailable. Please use the guest's historical data for personalized service.",
      request_analysis: "I understand this request. Please handle it according to standard hotel procedures and guest preferences."
    };

    const { type } = await request.json().catch(() => ({ type: 'default' }));
    const fallbackResponse = fallbackResponses[type as keyof typeof fallbackResponses] || 
      "I'm currently unable to process this request. Please try again later.";

    return NextResponse.json({ 
      response: fallbackResponse,
      type,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}
