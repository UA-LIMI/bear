# Environment Variables Required for MCP Server

## Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
```

## MQTT Configuration for Hotel Lighting
```
MQTT_BROKER_URL=mqtt://mqtt.limilighting.com:1883
MQTT_USERNAME=mcp
MQTT_PASSWORD=mcp
```

## Optional: AI Integration
```
OPENAI_API_KEY=your-openai-key-here
PERPLEXITY_API_KEY=your-perplexity-key-here
```

## How to Add to Vercel:
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable above
4. Redeploy your project
