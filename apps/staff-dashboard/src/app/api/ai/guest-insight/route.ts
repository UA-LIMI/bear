import { NextResponse } from 'next/server';
import { generateText } from 'ai';

export const runtime = 'edge';

const DEFAULT_PROMPT = 'Invent a new holiday and describe its traditions.';
const DEFAULT_MODEL = process.env.AI_MODEL ?? 'google/gemini-2.5-flash';
const CACHE_WINDOW_MS = 60 * 60 * 1000;

type BriefingRecord = {
  completion: string;
  model: string | null;
  request_id: string | null;
  created_at: string;
  prompt: string | null;
  payload: unknown;
};

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    null;

  return { url, key };
};

const fetchCachedBriefing = async (scope: string, prompt: string | null) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return null;
  }

  const cutoffIso = new Date(Date.now() - CACHE_WINDOW_MS).toISOString();

  const searchParams = new URLSearchParams();
  searchParams.set('select', 'completion,model,request_id,created_at,prompt,payload');
  searchParams.set('scope', `eq.${scope}`);
  if (prompt) {
    searchParams.set('prompt', `eq.${prompt}`);
  }
  searchParams.set('created_at', `gte.${cutoffIso}`);
  searchParams.set('order', 'created_at.desc');
  searchParams.set('limit', '1');

  try {
    const response = await fetch(`${url}/rest/v1/ai_briefings?${searchParams.toString()}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[guest-insight] cache lookup failed', response.status, errorText);
      return null;
    }

    const records = (await response.json()) as BriefingRecord[];
    if (!records || records.length === 0) {
      return null;
    }

    return records[0];
  } catch (error) {
    console.error('[guest-insight] cache lookup threw', error);
    return null;
  }
};

const storeBriefing = async (
  scope: string,
  payload: Record<string, unknown> | null,
  entry: {
  prompt: string;
  completion: string;
  model: string;
  requestId: string;
  },
) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return null;
  }

  try {
    const response = await fetch(`${url}/rest/v1/ai_briefings`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        scope,
        prompt: entry.prompt,
        payload: payload ?? null,
        completion: entry.completion,
        model: entry.model,
        request_id: entry.requestId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[guest-insight] cache insert failed', response.status, errorText);
      return null;
    }

    const [record] = ((await response.json()) as BriefingRecord[]) ?? [];
    return record ?? null;
  } catch (error) {
    console.error('[guest-insight] cache insert threw', error);
    return null;
  }
};

export async function GET() {
  return NextResponse.json({ completion: '' });
}

export async function POST(req: Request) {
  const requestId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  console.info('[guest-insight] request received', { requestId });

  try {
    const body = (await req.json().catch(() => ({}))) as {
      prompt?: unknown;
      payload?: unknown;
      scope?: unknown;
      forceRefresh?: unknown;
    };

    const rawPrompt = typeof body.prompt === 'string' ? body.prompt : null;
    const userPrompt = rawPrompt && rawPrompt.trim().length > 0 ? rawPrompt : DEFAULT_PROMPT;
    const scope = typeof body.scope === 'string' && body.scope.trim().length > 0 ? body.scope.trim() : 'dashboard';
    const forceRefresh = Boolean(body.forceRefresh);
    const payload = typeof body.payload === 'object' && body.payload !== null ? body.payload : null;

    if (!forceRefresh) {
      const cached = await fetchCachedBriefing(scope, userPrompt);
      if (cached) {
        console.info('[guest-insight] returning cached result', {
          requestId,
          cachedAt: cached.created_at,
        });

        return NextResponse.json({
          completion: cached.completion,
          model: cached.model ?? DEFAULT_MODEL,
          requestId: cached.request_id ?? requestId,
          cached: true,
          cachedAt: cached.created_at,
        });
      }
    }

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

    console.info('[guest-insight] invoking model', {
      requestId,
      model: DEFAULT_MODEL,
      promptPreview: userPrompt.slice(0, 80),
      forceRefresh,
    });

    const { text } = await generateText({
      model: DEFAULT_MODEL,
      prompt: userPrompt,
    });

    console.info('[guest-insight] completed', { requestId });

    const normalizedPayload: Record<string, unknown> | null = payload
      ? { ...(payload as Record<string, unknown>) }
      : null;

    const stored = await storeBriefing(scope, normalizedPayload, {
      prompt: userPrompt,
      completion: text,
      model: DEFAULT_MODEL,
      requestId,
    });

    return NextResponse.json({
      completion: text,
      model: DEFAULT_MODEL,
      requestId,
      cached: false,
      cachedAt: stored?.created_at ?? new Date().toISOString(),
    });
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
