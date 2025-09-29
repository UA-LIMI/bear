const VPS_BACKEND_URL = process.env.VPS_BACKEND_URL ?? 'http://145.79.10.35:3001';
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;
const AI_GATEWAY_MODEL = process.env.AI_GATEWAY_MODEL ?? 'openai:gpt-4o';
const AI_GATEWAY_TEMPERATURE = process.env.AI_GATEWAY_TEMPERATURE
  ? Number(process.env.AI_GATEWAY_TEMPERATURE)
  : 0.7;

function buildSystemPrompt(guestContext: any) {
  const guestName = guestContext?.guestName ?? 'Guest';
  const occupation = guestContext?.occupation ?? 'Guest';
  const roomNumber = guestContext?.roomNumber ?? 'Unknown';
  const membershipTier = guestContext?.membershipTier ?? 'Member';
  const loyaltyPoints = guestContext?.loyaltyPoints ?? 'N/A';
  const guestType = guestContext?.guestType ?? 'standard';
  const location = guestContext?.location ?? 'Unknown';
  const serviceLevel = guestContext?.serviceLevel ?? 'standard';
  const weather = guestContext?.weather ?? {};
  const roomCapabilities = guestContext?.roomCapabilities ?? {};

  const weatherRecommendation = weather?.temp > 25
    ? 'Perfect for outdoor activities like Victoria Peak, Star Ferry, or rooftop dining'
    : weather?.temp < 18
      ? 'Great for indoor activities like shopping, museums, or spa services'
      : 'Pleasant weather for both indoor and outdoor Hong Kong exploration';

  const serviceLevelDescription = serviceLevel === 'premium'
    ? 'VIP/Suite guest - Provide premium service with exclusive amenities, private dining options, luxury transportation, and VIP facility access. Acknowledge their elite status.'
    : serviceLevel === 'business'
      ? 'Business traveler - Focus on efficiency, productivity, and professional services. Offer meeting facilities, express transportation, and work-optimized room settings.'
      : 'Standard guest - Provide excellent hospitality with comprehensive Hong Kong guidance, hotel services, and personalized recommendations.';

  const lightingOptions = guestType === 'vip'
    ? 'Royal Ambiance (FX=88), Diamond Sparkle (FX=80), Pure Platinum (#FFFFFF)'
    : serviceLevel === 'business'
      ? 'Work Mode (#FFFFFF), Meeting Light (#FFF8DC), Focus Blue (#0000FF)'
      : 'Romantic Candle (FX=88), Ocean Waves (FX=101), Rainbow Magic (FX=9)';

  return `You are LIMI AI for The Peninsula Hong Kong, providing personalized assistance to hotel guests.

CURRENT GUEST COMPLETE CONTEXT:
- Guest Name: ${guestName} (${occupation})
- Room: ${roomNumber} at The Peninsula Hong Kong
- Membership Tier: ${membershipTier} (${loyaltyPoints} loyalty points)
- Guest Type: ${guestType}
- Current Location: ${location}
- Service Level: ${serviceLevel}

REAL-TIME HONG KONG WEATHER:
- Temperature: ${weather?.temp ?? 'N/A'}°C
- Condition: ${weather?.condition ?? 'Unknown'}
- Humidity: ${weather?.humidity ?? 'N/A'}%
- Data Source: ${weather?.source ?? 'Unknown'} (${weather?.isLive ? 'live Google Weather API' : 'fallback data'})
- Weather Recommendations: ${weatherRecommendation}

ROOM ${roomNumber} CAPABILITIES:
- Lighting System: ${roomCapabilities?.lighting ?? 'Standard lighting controls'}
- Climate Control: ${roomCapabilities?.temperature ?? 'Adjustable climate settings'}
- Privacy Features: ${roomCapabilities?.privacy ?? 'Do not disturb and privacy modes'}
- Entertainment: ${roomCapabilities?.entertainment ?? 'In-room entertainment system'}

GUEST-SPECIFIC SERVICE LEVEL:
${serviceLevelDescription}

INTERACTION RULES:
1. Always greet guests by name and acknowledge their membership tier
2. Reference current weather when making activity recommendations
3. Always confirm before making room changes (lighting, temperature, etc.)
4. Keep responses concise but comprehensive (under 100 words)
5. Use guest's location context for relevant Hong Kong recommendations
6. Acknowledge loyalty points and membership benefits appropriately

AVAILABLE ROOM CONTROLS (mention these when relevant):
- Lighting Effects: ${lightingOptions}
- Temperature Control: Adjustable climate settings
- Privacy Settings: Do not disturb and privacy modes
- Entertainment: ${roomCapabilities?.entertainment ?? 'In-room entertainment system'}

Provide professional, personalized assistance that matches this ${membershipTier} guest's expectations and service level.`;
}

export async function POST(req: Request) {
  if (!AI_GATEWAY_API_KEY) {
    return Response.json(
      {
        error: 'Configuration Error',
        message: 'AI gateway API key is not configured on the server.',
      },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const incomingMessages = Array.isArray(body?.messages) ? body.messages : [];
    const guestContext = body?.guestContext ?? {};

    const systemMessage = {
      role: 'system',
      content: buildSystemPrompt(guestContext),
    };

    const proxyPayload = {
      model: AI_GATEWAY_MODEL,
      temperature: AI_GATEWAY_TEMPERATURE,
      messages: [systemMessage, ...incomingMessages],
    };

    const response = await fetch(`${VPS_BACKEND_URL}/api/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_GATEWAY_API_KEY}`,
      },
      body: JSON.stringify(proxyPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('VPS ai-proxy error:', response.status, errorBody);
      return Response.json(
        {
          error: 'Chat Proxy Error',
          message: 'Failed to process chat request via backend.',
          status: response.status,
        },
        { status: 502 },
      );
    }

    const data = await response.json();

    return Response.json({
      completion: data?.data ?? '',
      finishReason: data?.finishReason ?? null,
      usage: data?.usage ?? null,
      requestId: data?.requestId ?? null,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      {
        error: 'Chat Service Unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
