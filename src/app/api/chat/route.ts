import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, guestContext } = await req.json();

    // Get guest context from request
    const { guestName, roomNumber, membershipTier, occupation, location, weather } = guestContext || {};

    const result = await streamText({
      model: openai('gpt-4o'),
      messages,
      system: `You are LIMI AI for The Peninsula Hong Kong.

CURRENT GUEST CONTEXT:
- Guest: ${guestName} (${occupation})
- Room: ${roomNumber}
- Membership: ${membershipTier}
- Location: ${location}
- Weather: ${weather?.temp}°C ${weather?.condition} (${weather?.isLive ? 'live data' : 'fallback'})

INTERACTION RULES:
1. Keep responses concise and helpful
2. Always confirm before room changes
3. Reference weather for activity suggestions
4. Acknowledge membership tier appropriately
5. Use guest name for personalization

Provide professional, personalized assistance for this ${membershipTier} guest.`,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Chat service temporarily unavailable', { status: 500 });
  }
}
