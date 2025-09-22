// Get user-specific UI configuration from database
// Returns component visibility, text content, and layout settings

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
    const { userId, guestType = 'standard', screenSize = 'desktop' } = await request.json();
    const supabase = await getSupabaseClient();
    
    // Get user-specific component assignments
    const { data: userComponents, error: componentsError } = await supabase
      .from('user_component_assignments')
      .select(`
        priority,
        position,
        visible,
        configuration,
        ui_components (
          component_name,
          display_name,
          component_type,
          default_priority
        )
      `)
      .eq('user_id', userId)
      .eq('visible', true)
      .order('priority', { ascending: false });

    if (componentsError) {
      console.error('Components query error:', componentsError);
    }

    // Get UI text content
    const { data: textContent, error: textError } = await supabase
      .from('ui_text_content')
      .select('text_key, text_value')
      .eq('language', 'en')
      .eq('context', 'guest_page');

    if (textError) {
      console.error('Text content query error:', textError);
    }

    // Get layout configuration for guest type and screen size
    const { data: layoutConfig, error: layoutError } = await supabase
      .from('layout_configurations')
      .select('*')
      .eq('guest_type', guestType)
      .eq('screen_size', screenSize)
      .eq('active', true)
      .single();

    if (layoutError) {
      console.error('Layout config query error:', layoutError);
    }

    // Transform text content to key-value object
    const textContentMap = (textContent || []).reduce((acc, item) => {
      acc[item.text_key] = item.text_value;
      return acc;
    }, {} as Record<string, string>);

    // Transform component assignments
    const componentConfig = (userComponents || []).map((assignment: Record<string, unknown>) => ({
      name: (assignment.ui_components as Record<string, unknown>).component_name as string,
      displayName: (assignment.ui_components as Record<string, unknown>).display_name as string,
      type: (assignment.ui_components as Record<string, unknown>).component_type as string,
      priority: assignment.priority,
      position: assignment.position,
      visible: assignment.visible,
      configuration: assignment.configuration
    }));

    return Response.json({
      success: true,
      components: componentConfig,
      textContent: textContentMap,
      layoutConfig: layoutConfig || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get UI config error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
