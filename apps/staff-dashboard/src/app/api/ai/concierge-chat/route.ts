import { NextResponse } from 'next/server';
import { streamText, convertToModelMessages, tool, type UIMessage, jsonSchema } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import type { GuestProfile } from '@/lib/types/supabase';

export const runtime = 'edge';

const buildGuestSummary = (guest: GuestProfile) => {
  const summaryTitles = guest.summary?.map(item => item.title) ?? [];
  const keyPoints = guest.summary?.flatMap(item => item.keyPoints ?? []) ?? [];

  return {
    name: guest.name,
    vipStatus: guest.vipStatus,
    stay: {
      room: guest.currentRoom ?? '—',
      checkIn: guest.checkIn,
      checkOut: guest.checkOut,
    },
    preferences: {
      dining: guest.preferences.dining ?? [],
      activities: guest.preferences.activities ?? [],
      roomService: guest.preferences.roomService ?? [],
    },
    highlights: summaryTitles,
    keyPoints,
  };
};

const buildDelightIdeas = (guest: GuestProfile) => {
  const ideas = [] as { title: string; description: string; channel: string; impact: 'high' | 'medium' }[];

  const diningPref = guest.preferences.dining?.[0];
  if (diningPref) {
    ideas.push({
      title: 'Chef welcome amenity',
      description: `Arrange a small tasting inspired by ${diningPref} to be delivered before dinner service.`,
      channel: 'In-room surprise',
      impact: 'high',
    });
  }

  const activityPref = guest.preferences.activities?.[0];
  if (activityPref) {
    ideas.push({
      title: 'Personalized activity note',
      description: `Provide a handwritten invitation highlighting a ${activityPref} experience available tomorrow.`,
      channel: 'Turn-down note',
      impact: 'medium',
    });
  }

  if (guest.notes) {
    ideas.push({
      title: 'Follow-up on notes',
      description: guest.notes,
      channel: 'Guest message',
      impact: 'medium',
    });
  }

  if (ideas.length === 0) {
    ideas.push({
      title: 'Concierge check-in',
      description: 'Send a friendly message to confirm everything is comfortable and offer assistance.',
      channel: 'Messaging',
      impact: 'medium',
    });
  }

  return ideas;
};

export async function POST(req: Request) {
  const { messages, guest }: { messages: UIMessage[]; guest: GuestProfile } = await req.json();

  const apiKey = process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI gateway or OpenAI API key missing.' },
      { status: 500 },
    );
  }

  const baseURL = process.env.AI_GATEWAY_URL;
  const openai = createOpenAI({ apiKey, baseURL });

  const showGuestSummary = tool({
    description: 'Summarize the selected guest and their stay for reference.',
    inputSchema: jsonSchema({
      type: 'object',
      properties: {},
      additionalProperties: false,
    }),
    execute: async () => buildGuestSummary(guest),
  });

  const proposeDelight = tool({
    description: 'Suggest tailored next-touchpoint ideas for the guest.',
    inputSchema: jsonSchema({
      type: 'object',
      properties: {
        focus: {
          type: 'string',
          minLength: 3,
          maxLength: 160,
          description: 'Optional area the concierge should emphasize.',
        },
      },
      additionalProperties: false,
    }),
    execute: async () => ({ suggestions: buildDelightIdeas(guest) }),
  });

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? 'gpt-4o-mini'),
    system:
      "You are LIMI's concierge copilot. Respond concisely, referencing available tools. Start by reviewing the guest summary when helpful, then propose next-touch actions.",
    messages: convertToModelMessages(messages),
    tools: {
      'showGuestSummary': showGuestSummary,
      'proposeDelightIdeas': proposeDelight,
    },
  });

  return result.toUIMessageStreamResponse();
}
