import { NextRequest, NextResponse } from 'next/server';

// WebRTC offer endpoint for Pipecat Voice UI Kit
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 WebRTC Offer: Received offer from Pipecat client');
    
    // Get the SDP offer from the request body
    const body = await request.text();
    console.log('🔗 WebRTC Offer: SDP offer received, length:', body.length);

    // Return proper JSON error response instead of SDP for now
    console.log('🔗 WebRTC Offer: VPS backend WebRTC endpoint not implemented yet');
    
    return NextResponse.json({
      error: 'WebRTC endpoint not implemented',
      message: 'VPS backend does not have /api/webrtc-offer endpoint yet. Please implement backend WebRTC support.',
      fallback: true,
      timestamp: new Date().toISOString(),
      instructions: 'Add WebRTC endpoint to VPS backend at http://145.79.10.35:3001/api/webrtc-offer'
    }, { 
      status: 503,
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
