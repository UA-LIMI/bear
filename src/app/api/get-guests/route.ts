// API endpoint to get all guest profiles from database
// This uses server-side environment variables

const getSupabaseClient = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(url, key);
};

export async function GET() {
  try {
    const supabase = await getSupabaseClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, guest_type, room_number, current_location_address, current_location_city, loyalty_points')
      .order('loyalty_points', { ascending: false });

    if (error) {
      console.error('Database query error:', error);
      return Response.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      guests: data || [],
      total: data?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get guests error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
