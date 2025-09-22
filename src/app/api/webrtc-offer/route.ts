import { NextRequest, NextResponse } from 'next/server';

// WebRTC offer endpoint for Pipecat Voice UI Kit
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 WebRTC Offer: Received offer from Pipecat client');
    
    // Get the SDP offer from the request body
    const body = await request.text();
    console.log('🔗 WebRTC Offer: SDP offer received, length:', body.length);

    // Forward the offer to our VPS backend which will handle OpenAI Realtime API
    const VPS_BACKEND_URL = 'http://145.79.10.35:3001';
    
    const response = await fetch(`${VPS_BACKEND_URL}/api/webrtc-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Origin': 'https://bear-beige.vercel.app',
      },
      body: body,
    });

    console.log('🔗 WebRTC Offer: VPS response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔗 WebRTC Offer: VPS error:', errorText);
      return new NextResponse(`WebRTC offer failed: ${errorText}`, { status: response.status });
    }

    // Return the SDP answer from the backend
    const sdpAnswer = await response.text();
    console.log('🔗 WebRTC Offer: SDP answer received, length:', sdpAnswer.length);
    
    return new NextResponse(sdpAnswer, {
      headers: {
        'Content-Type': 'application/sdp',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('🔗 WebRTC Offer: Proxy error:', error);
    return new NextResponse(
      `WebRTC offer proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
