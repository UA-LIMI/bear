// Hotel AI Agent with Local Tools - Correct Vercel Approach
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // Extended duration for hotel operations

// Supabase client setup
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(url, key);
};

// MQTT client setup
const getMqttClient = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mqtt = require('mqtt');
  return mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://mqtt.limilighting.com:1883', {
    username: process.env.MQTT_USERNAME || 'mcp',
    password: process.env.MQTT_PASSWORD || 'mcp'
  });
};

export const POST = async (request: Request) => {
  const { prompt, userId }: { prompt?: string; userId?: string } = await request.json();

  if (!prompt) {
    return new Response('Prompt is required', { status: 400 });
  }

  if (!userId) {
    return new Response('User ID is required', { status: 400 });
  }

  try {
    const result = await generateText({
      model: openai('gpt-4o'),
      prompt,
      maxSteps: 3,
      system: `You are a sophisticated Hotel AI Assistant at The Peninsula Hong Kong.

GUEST CONTEXT: You have access to detailed guest information, location tracking, and hotel lighting control.

AVAILABLE TOOLS:
- updateLocation: Update guest's current location
- getGuestLocation: Get guest's current location  
- controlLighting: Control hotel room lighting
- rememberPreference: Store guest preferences
- getGuestContext: Retrieve guest history and preferences

BEHAVIOR:
- ALWAYS greet returning guests with their location and preferences
- IMMEDIATELY store any preferences mentioned
- Provide location-aware recommendations for Hong Kong
- Control lighting based on guest requests
- Maintain detailed context for personalized service

CURRENT GUEST ID: ${userId}`,

      tools: {
        updateLocation: tool({
          description: 'Update guest location with detailed Hong Kong address',
          parameters: z.object({
            address: z.string().describe('Full detailed address'),
            city: z.string().optional().describe('City name'),
            country: z.string().optional().describe('Country name'),
          }),
          execute: async ({ address, city, country }) => {
            try {
              const supabase = getSupabaseClient();
              
              const { error } = await supabase
                .from('profiles')
                .update({
                  current_location_address: address,
                  current_location_city: city || 'Hong Kong',
                  current_location_country: country || 'Hong Kong SAR',
                  location_updated_at: new Date().toISOString(),
                  location_source: 'ai_agent'
                })
                .eq('id', userId);

              if (error) throw error;

              // Add to location history
              await supabase
                .from('user_location_history')
                .insert({
                  user_id: userId,
                  location_address: address,
                  location_city: city || 'Hong Kong',
                  location_country: country || 'Hong Kong SAR',
                  location_source: 'ai_agent',
                  session_id: `agent_${Date.now()}`
                });

              return {
                success: true,
                message: `Location updated: ${address}`,
                timestamp: new Date().toISOString()
              };
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          },
        }),

        getGuestLocation: tool({
          description: 'Get guest current location and details',
          parameters: z.object({}),
          execute: async () => {
            try {
              const supabase = getSupabaseClient();
              
              const { data, error } = await supabase
                .from('profiles')
                .select('username, display_name, current_location_address, current_location_city, current_location_country, location_updated_at, guest_type, loyalty_points')
                .eq('id', userId)
                .single();

              if (error || !data) {
                return { success: false, error: 'Guest not found' };
              }

              return {
                success: true,
                guest: data.display_name,
                location: {
                  address: data.current_location_address,
                  city: data.current_location_city,
                  country: data.current_location_country,
                  updated: data.location_updated_at
                },
                guestType: data.guest_type,
                loyaltyPoints: data.loyalty_points
              };
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          },
        }),

        controlLighting: tool({
          description: 'Control hotel room lighting via MQTT',
          parameters: z.object({
            room: z.string().describe('Room identifier (e.g., room1)'),
            command: z.string().describe('Lighting command (ON/OFF/FX=88/#FF0000)'),
          }),
          execute: async ({ room, command }) => {
            return new Promise((resolve) => {
              const client = getMqttClient();
              
              client.publish(room, command, (error: Error | null) => {
                if (error) {
                  resolve({
                    success: false,
                    error: error.message
                  });
                } else {
                  resolve({
                    success: true,
                    message: `Lighting command sent to ${room}: ${command}`,
                    room,
                    command
                  });
                }
              });
            });
          },
        }),

        rememberPreference: tool({
          description: 'Store guest preferences and context',
          parameters: z.object({
            entityName: z.string().describe('Name of the preference'),
            category: z.string().describe('Category (lighting, dining, services)'),
            observations: z.array(z.string()).describe('Preference details'),
          }),
          execute: async ({ entityName, category, observations }) => {
            try {
              const supabase = getSupabaseClient();
              
              const { error } = await supabase
                .from('guest_entities')
                .upsert({
                  user_id: userId,
                  name: entityName,
                  entity_type: 'preference',
                  category,
                  observations,
                  source_agent: 'hotel_ai_agent',
                  confidence_score: 0.8,
                  metadata: {},
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id,name,entity_type'
                });

              if (error) throw error;

              return {
                success: true,
                message: `Preference stored: ${entityName}`,
                category,
                observations
              };
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          },
        }),

        getGuestContext: tool({
          description: 'Retrieve guest preferences and history',
          parameters: z.object({
            category: z.string().optional().describe('Filter by category'),
          }),
          execute: async ({ category }) => {
            try {
              const supabase = getSupabaseClient();
              
              let query = supabase
                .from('guest_entities')
                .select('*')
                .eq('user_id', userId)
                .order('confidence_score', { ascending: false });

              if (category) {
                query = query.eq('category', category);
              }

              const { data, error } = await query;

              if (error) throw error;

              return {
                success: true,
                entities: data || [],
                count: data?.length || 0,
                category: category || 'all'
              };
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          },
        }),
      },
    });

    return Response.json({
      steps: result.steps,
      finalAnswer: result.text,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
    });

  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};
