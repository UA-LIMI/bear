// Get hotel events from database
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
      .from('hotel_events')
      .select(`
        event_name,
        event_time,
        event_description,
        event_type
      `)
      .eq('active', true)
      .order('event_time');

    if (error) {
      console.error('Hotel events query error:', error);
      return Response.json({ success: false, error: error.message });
    }

    return Response.json({
      success: true,
      events: data || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get hotel events error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
