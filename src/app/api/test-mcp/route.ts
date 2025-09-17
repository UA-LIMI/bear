// Simple test endpoint to verify deployment
export async function GET() {
  return Response.json({ 
    message: "MCP server test endpoint working",
    timestamp: new Date().toISOString(),
    env_check: {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_service_key: !!process.env.SUPABASE_SERVICE_KEY,
      mqtt_broker: !!process.env.MQTT_BROKER_URL
    }
  });
}

export async function POST() {
  return Response.json({ 
    message: "POST method working",
    timestamp: new Date().toISOString()
  });
}
