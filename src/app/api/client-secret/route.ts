import { NextRequest, NextResponse } from 'next/server';

const VPS_BACKEND_URL = 'http://145.79.10.35:3001';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 VERCEL API: Proxying client-secret request to VPS backend');
    console.log('🔗 VERCEL API: VPS URL:', VPS_BACKEND_URL);
    
    // Get the request body
    const body = await request.json();
    console.log('🔗 VERCEL API: Request body:', body);

    // Forward request to VPS backend
    const response = await fetch(`${VPS_BACKEND_URL}/api/client-secret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bear-beige.vercel.app', // Set correct origin for CORS
      },
      body: JSON.stringify(body),
    });

    console.log('🔗 VERCEL API: VPS response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔗 VERCEL API: VPS error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('🔗 VERCEL API: Success! Proxied token from VPS');
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('🔗 VERCEL API: Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy Error', 
        message: 'Failed to connect to backend service',
        code: 'proxy_error'
      }, 
      { status: 500 }
    );
  }
}
