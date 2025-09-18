// Get complete hotel context for AI instructions
// Fetches hotel info, room details, devices, and functions from database

const getSupabaseClient = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(url, key);
};

export async function POST(request: Request) {
  try {
    const { roomNumber, userId } = await request.json();
    const supabase = await getSupabaseClient();
    
    // Get hotel information
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .eq('active', true)
      .single();
    
    if (hotelError) {
      console.error('Hotel query error:', hotelError);
      return Response.json({ success: false, error: hotelError.message });
    }
    
    // Get room information
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_number', roomNumber)
      .single();
    
    if (roomError) {
      console.error('Room query error:', roomError);
      return Response.json({ success: false, error: roomError.message });
    }
    
    // Get devices for this room
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select(`
        *,
        device_functions (
          function_name,
          payload_type,
          payload_value,
          description,
          category,
          rating,
          usage_example,
          enabled
        )
      `)
      .eq('room_id', room.id)
      .eq('active', true);
    
    if (devicesError) {
      console.error('Devices query error:', devicesError);
      return Response.json({ success: false, error: devicesError.message });
    }
    
    // Get guest preferences if userId provided
    let guestPreferences = [];
    if (userId) {
      const { data: preferences } = await supabase
        .from('guest_entities')
        .select('*')
        .eq('user_id', userId);
      
      guestPreferences = preferences || [];
    }
    
    return Response.json({
      success: true,
      hotel,
      room,
      devices,
      guestPreferences,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get room context error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
