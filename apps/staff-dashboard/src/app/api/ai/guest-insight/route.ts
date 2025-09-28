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
    const { prompt } = await req.json().catch(() => ({ prompt: undefined }));

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

    const defaultPrompt = 'Write a haiku about hospitality operations.';
    const userPrompt = typeof prompt === 'string' && prompt.trim().length > 0 ? prompt : defaultPrompt;

    if (geminiApiKey) {
      const modelId = process.env.GOOGLE_GEMINI_MODEL ?? 'models/gemini-1.5-flash-latest';
      const { text } = await generateText({
        model: google(modelId),
        prompt: userPrompt,
      });

      return NextResponse.json({ completion: text, model: modelId, provider: 'google' });
    }

    if (openAIApiKey) {
      const openai = createOpenAI({
        apiKey: openAIApiKey,
        baseURL: process.env.AI_GATEWAY_URL,
      });

      const modelId = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      const { text } = await generateText({
        model: openai(modelId),
        prompt: userPrompt,
      });

      return NextResponse.json({ completion: text, model: modelId, provider: 'openai' });
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
