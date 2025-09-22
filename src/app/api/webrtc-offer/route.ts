import { NextRequest, NextResponse } from 'next/server';

// WebRTC offer endpoint for Pipecat Voice UI Kit
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 WebRTC Offer: Received offer from Pipecat client');
    
    // Get the SDP offer from the request body
    const body = await request.text();
    console.log('🔗 WebRTC Offer: SDP offer received, length:', body.length);

    // For now, return a simple error response since VPS backend doesn't have WebRTC endpoint yet
    console.log('🔗 WebRTC Offer: VPS backend WebRTC endpoint not implemented yet');
    
    const errorResponse = {
      error: 'WebRTC endpoint not implemented',
      message: 'VPS backend does not have /api/webrtc-offer endpoint yet. Using fallback.',
      fallback: true,
      timestamp: new Date().toISOString()
    };
    
    const sdpAnswer = `v=0
o=- 0 0 IN IP4 127.0.0.1
s=WebRTC Fallback
t=0 0
m=audio 0 RTP/AVP 0
c=IN IP4 0.0.0.0`;
    
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
