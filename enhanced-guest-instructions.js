// ENHANCED GUEST PAGE - Dynamic AI Instructions from Database
// This replaces the hardcoded instructions in guest/page.tsx

// NEW API endpoint to get complete AI context
const getAIContext = async (selectedGuest) => {
  const response = await fetch('/api/get-ai-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: selectedGuest.id,
      roomNumber: selectedGuest.stayInfo.room
    })
  });
  
  return await response.json();
};

// ENHANCED connectVoice function
const connectVoice = async () => {
  try {
    // Get complete AI context from database
    const aiContext = await getAIContext(selectedGuest);
    
    // Build dynamic instructions from database
    const dynamicInstructions = `
${aiContext.hotel.ai_identity}

👤 GUEST PROFILE:
- Name: ${selectedGuest.name}
- Occupation: ${selectedGuest.profile.occupation}
- Membership: ${selectedGuest.membershipTier}
- Room: ${selectedGuest.stayInfo.room}
- Current Location: ${selectedGuest.stayInfo.location}

🏨 HOTEL CONTEXT:
${aiContext.hotel.ai_primary_role}

🛠️ AVAILABLE TOOLS:
${aiContext.capabilities.map(cap => 
  `- ${cap.capability_name}: ${cap.description} (Tool: ${cap.tool_name})`
).join('\n')}

💡 ${selectedGuest.stayInfo.room.toUpperCase()} LIGHTING CONTROLS:
${aiContext.lighting_effects.map(effect => 
  `- ${effect.command_format}: ${effect.description} (${effect.rating}⭐ ${effect.category})`
).join('\n')}

🎯 BEHAVIOR GUIDELINES:
${aiContext.hotel.ai_behavior_guidelines.map(rule => `- ${rule}`).join('\n')}

🔧 GUEST CONTEXT: ${selectedGuest.profile.aiPrompt}
Status: ${selectedGuest.status === 'inRoom' ? 'In room - full hotel services available' : 'Preparing for arrival'}
    `.trim();

    // Send to OpenAI with dynamic instructions
    const response = await fetch('/api/client-secret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `guest_${selectedGuest.id}_${Date.now()}`,
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy',
        instructions: dynamicInstructions,
        tools: aiContext.tools // Tool definitions from database
      })
    });
    
    // Rest of connection logic...
  } catch (error) {
    console.error('Voice connection failed:', error);
  }
};

// NEW API endpoint: /api/get-ai-context
export async function POST(request) {
  try {
    const { userId, roomNumber } = await request.json();
    const supabase = await getSupabaseClient();
    
    // Get hotel configuration
    const { data: hotel } = await supabase
      .from('hotel_config')
      .select('*')
      .eq('active', true)
      .single();
    
    // Get AI capabilities
    const { data: capabilities } = await supabase
      .from('ai_capabilities')
      .select('*')
      .eq('enabled', true)
      .order('category');
    
    // Get lighting effects for this room
    const { data: lighting_effects } = await supabase
      .from('device_capabilities')
      .select('*')
      .eq('room_identifier', roomNumber)
      .eq('enabled', true)
      .order('rating', { ascending: false });
    
    // Get guest preferences
    const { data: preferences } = await supabase
      .from('guest_entities')
      .select('*')
      .eq('user_id', userId);
    
    // Build tool definitions from capabilities
    const tools = capabilities.map(cap => ({
      type: 'function',
      function: {
        name: cap.tool_name,
        description: cap.description,
        parameters: cap.tool_parameters
      }
    }));
    
    return Response.json({
      success: true,
      hotel,
      capabilities,
      lighting_effects,
      preferences,
      tools
    });
    
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
