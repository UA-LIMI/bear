// Direct MQTT Lighting Control for Room1
// This works independently of MCP server

export async function POST(request: Request): Promise<Response> {
  try {
    const { room, command, userId } = await request.json();
    
    console.log(`🏨 Lighting control request: ${room} → ${command} (User: ${userId})`);
    
    // Validate user has access to this room
    if (userId !== 'a397a03b-f65e-42c1-a8ed-6bebb7c6751b' && room === 'room1') {
      return Response.json({
        success: false,
        error: 'Access denied: This room is not assigned to your profile'
      }, { status: 403 });
    }
    
    // Dynamic import to avoid build issues
    const mqtt = await import('mqtt');
    
    return new Promise<Response>((resolve) => {
      const client = mqtt.default.connect(process.env.MQTT_BROKER_URL || 'mqtt://mqtt.limilighting.com:1883', {
        username: process.env.MQTT_USERNAME || 'mcp',
        password: process.env.MQTT_PASSWORD || 'mcp'
      });
      
      client.on('connect', () => {
        console.log(`🔗 MQTT connected, sending command to ${room}`);
        
        client.publish(room, command, (error) => {
          client.end();
          
          if (error) {
            console.error('MQTT publish error:', error);
            resolve(Response.json({
              success: false,
              error: error.message
            }, { status: 500 }));
          } else {
            console.log(`✅ Lighting command sent: ${room} → ${command}`);
            resolve(Response.json({
              success: true,
              message: `Lighting command sent successfully`,
              room,
              command,
              timestamp: new Date().toISOString()
            }));
          }
        });
      });
      
      client.on('error', (error) => {
        console.error('MQTT connection error:', error);
        resolve(Response.json({
          success: false,
          error: `MQTT connection failed: ${error.message}`
        }, { status: 500 }));
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        client.end();
        resolve(Response.json({
          success: false,
          error: 'MQTT connection timeout'
        }, { status: 408 }));
      }, 10000);
    });
    
  } catch (error) {
    console.error('Lighting control error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
