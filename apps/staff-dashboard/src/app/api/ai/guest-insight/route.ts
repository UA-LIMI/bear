import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ completion: '' });
}

export async function POST(req: Request) {
  try {
    const { prompt, guest } = await req.json();

    const apiKey = process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI_GATEWAY_API_KEY or OPENAI_API_KEY must be configured.' },
        { status: 500 },
      );
    }

    const baseURL = process.env.AI_GATEWAY_URL;
    const openai = createOpenAI({
      apiKey,
      baseURL,
    });

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

    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL ?? 'gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Guest profile data:
${guestContext}

Instruction:
${userPrompt}`,
    });

    return NextResponse.json({ completion: text });
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
