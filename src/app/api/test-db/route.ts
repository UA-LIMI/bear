// Test database connection and Hong Kong location data
import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(url, key);
};

export async function GET() {
  try {
    // Test database connection
    const supabase = getSupabaseClient();
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, display_name, current_location_address, current_location_city, guest_type, loyalty_points')
      .order('loyalty_points', { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({
      success: true,
      message: "Database connection successful!",
      hong_kong_guests: profiles,
      total_guests: profiles?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
