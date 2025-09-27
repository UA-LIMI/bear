import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ completion: '' });
}

export async function POST(req: Request) {
  try {
    const { prompt, guest } = await req.json();

    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY;
    const openAIApiKey = process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY;

    if (!geminiApiKey && !openAIApiKey) {
      return NextResponse.json(
        {
          error:
            'GOOGLE_GENERATIVE_AI_API_KEY (or GOOGLE_API_KEY) or AI_GATEWAY_API_KEY / OPENAI_API_KEY must be configured.',
        },
        { status: 500 },
      );
    }

    const systemPrompt = `You are LIMI's hospitality AI concierge. Craft concise, actionable insights for staff.`;

    const userPrompt = typeof prompt === 'string' && prompt.trim().length > 0
      ? prompt
      : 'Summarize the guest context and suggest the next best action.';

    let guestContext = '';
    try {
      guestContext = JSON.stringify(guest, null, 2);
    } catch (jsonError) {
      console.error('Failed to serialize guest payload for insight prompt.', jsonError);
      guestContext = 'Guest data unavailable (serialization error).';
    }

    const promptPayload = `Guest profile data:
${guestContext}

Instruction:
${userPrompt}`;

    if (geminiApiKey) {
      const { text } = await generateText({
        model: google(process.env.GOOGLE_GEMINI_MODEL ?? 'gemini-2.5-flash'),
        system: systemPrompt,
        prompt: promptPayload,
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 8192,
              includeThoughts: true,
            },
          },
        },
      });

      return NextResponse.json({ completion: text });
    }

    if (openAIApiKey) {
      const openai = createOpenAI({
        apiKey: openAIApiKey,
        baseURL: process.env.AI_GATEWAY_URL,
      });

      const { text } = await generateText({
        model: openai(process.env.OPENAI_MODEL ?? 'gpt-4o-mini'),
        system: systemPrompt,
        prompt: promptPayload,
      });

      return NextResponse.json({ completion: text });
    }

    return NextResponse.json(
      {
        error: 'Unable to generate guest insight because no compatible provider is configured.',
      },
      { status: 500 },
    );
  } catch (error) {
    console.error('Guest insight generation failed.', error);
    return NextResponse.json(
      {
        error: 'Unable to generate guest insight at this time.',
      },
      { status: 500 },
    );
  }
}
