// Direct Supabase connection test
export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_KEY);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return Response.json({
        success: false,
        error: 'Missing Supabase environment variables',
        env_check: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          service_key: !!process.env.SUPABASE_SERVICE_KEY
        }
      });
    }

    // Dynamic import to avoid build-time issues
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    console.log('Supabase client created, testing connection...');

    // Test basic connection
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, display_name, current_location_address, guest_type, loyalty_points')
      .order('loyalty_points', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return Response.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    console.log('Supabase query successful, found', profiles?.length || 0, 'profiles');

    return Response.json({
      success: true,
      message: "✅ Supabase connection working!",
      hong_kong_guests: profiles,
      total_guests: profiles?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Supabase test error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
