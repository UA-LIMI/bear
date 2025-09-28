import { NextResponse } from 'next/server';
import { generateText } from 'ai';

export const runtime = 'edge';

const DEFAULT_PROMPT = 'Invent a new holiday and describe its traditions.';
const DEFAULT_MODEL = process.env.AI_MODEL ?? 'google/gemini-2.5-flash';

export async function GET() {
  return NextResponse.json({ completion: '' });
}

export async function POST(req: Request) {
  const requestId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  console.info('[guest-insight] request received', { requestId });

  try {
    const { prompt } = await req.json().catch(() => ({ prompt: undefined }));
    const aiGatewayKey = process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_AI_API_KEY;

    if (!aiGatewayKey) {
      console.error('[guest-insight] missing AI gateway key', { requestId });
      return NextResponse.json(
        {
          error: 'AI gateway API key is not configured.',
          requestId,
        },
        { status: 500 },
      );
    }

    const userPrompt =
      typeof prompt === 'string' && prompt.trim().length > 0 ? prompt : DEFAULT_PROMPT;

    console.info('[guest-insight] invoking model', {
      requestId,
      model: DEFAULT_MODEL,
      promptPreview: userPrompt.slice(0, 80),
    });

    const { text } = await generateText({
      model: DEFAULT_MODEL,
      prompt: userPrompt,
    });

    console.info('[guest-insight] completed', { requestId });

    return NextResponse.json({ completion: text, model: DEFAULT_MODEL, requestId });
  } catch (error) {
    console.error('[guest-insight] failed', { requestId, error });

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Unable to generate guest insight at this time.',
        requestId,
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 },
    );
  }
}
