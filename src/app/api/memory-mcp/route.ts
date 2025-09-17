// ===================================
// HOTEL MEMORY MCP SERVER - Vercel Deployment
// Location Management + Guest Context + Lighting Control
// ===================================

import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// MQTT client setup (lazy initialization for Vercel Functions)
let mqttClient: any = null;

const getMqttClient = () => {
  if (!mqttClient) {
    const mqtt = require('mqtt');
    mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://mqtt.limilighting.com:1883', {
      username: process.env.MQTT_USERNAME || 'mcp',
      password: process.env.MQTT_PASSWORD || 'mcp'
    });
  }
  return mqttClient;
};

const handler = createMcpHandler(
  (server) => {
    
    // ===================================
    // LOCATION MANAGEMENT TOOLS
    // ===================================
    
    server.tool(
      'update_user_location',
      'Update the current location for a user with detailed address information',
      {
        userId: z.string().describe('User ID (UUID)'),
        address: z.string().describe('Full detailed address (e.g., "123 Main St, Building A, Floor 5, New York, NY 10001")'),
        city: z.string().optional().describe('City name'),
        country: z.string().optional().describe('Country name'),
        sessionId: z.string().optional().describe('Current session ID for tracking'),
        source: z.enum(['user_input', 'gps', 'check_in', 'manual']).default('user_input').describe('How the location was determined')
      },
      async ({ userId, address, city, country, sessionId, source }) => {
        try {
          // Update current location in profiles
          const { data: profileUpdate, error: profileError } = await supabase
            .from('profiles')
            .update({
              current_location_address: address,
              current_location_city: city,
              current_location_country: country,
              location_updated_at: new Date().toISOString(),
              location_source: source,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

          if (profileError) {
            return {
              content: [{
                type: 'text',
                text: `❌ Failed to update location: ${profileError.message}`
              }]
            };
          }

          // Add to location history
          const { error: historyError } = await supabase
            .from('user_location_history')
            .insert({
              user_id: userId,
              location_address: address,
              location_city: city,
              location_country: country,
              location_source: source,
              session_id: sessionId || `session_${Date.now()}`
            });

          if (historyError) {
            console.error('Location history error:', historyError);
            // Don't fail the main operation for history logging issues
          }

          return {
            content: [{
              type: 'text',
              text: `✅ Location updated successfully!\n📍 Address: ${address}\n🏙️ City: ${city || 'Not specified'}\n🌍 Country: ${country || 'Not specified'}\n🕐 Updated: ${new Date().toLocaleString()}`
            }]
          };

        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error updating location: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    server.tool(
      'get_user_location',
      'Retrieve the current location information for a user',
      {
        userId: z.string().describe('User ID (UUID)')
      },
      async ({ userId }) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, display_name, current_location_address, current_location_city, current_location_country, location_updated_at, location_source')
            .eq('id', userId)
            .single();

          if (error || !data) {
            return {
              content: [{
                type: 'text',
                text: `❌ User not found or no location data available`
              }]
            };
          }

          const locationInfo = `
📍 **Current Location for ${data.display_name} (@${data.username})**
🏠 Address: ${data.current_location_address || 'Not set'}
🏙️ City: ${data.current_location_city || 'Not set'}
🌍 Country: ${data.current_location_country || 'Not set'}
🕐 Last Updated: ${data.location_updated_at ? new Date(data.location_updated_at).toLocaleString() : 'Never'}
📱 Source: ${data.location_source || 'Unknown'}
          `.trim();

          return {
            content: [{
              type: 'text',
              text: locationInfo
            }]
          };

        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error retrieving location: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    server.tool(
      'get_location_history',
      'Get the location history for a user (recent movements)',
      {
        userId: z.string().describe('User ID (UUID)'),
        limit: z.number().default(10).describe('Number of recent locations to retrieve')
      },
      async ({ userId, limit }) => {
        try {
          const { data, error } = await supabase
            .from('user_location_history')
            .select('location_address, location_city, location_country, location_source, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (error) {
            return {
              content: [{
                type: 'text',
                text: `❌ Error retrieving location history: ${error.message}`
              }]
            };
          }

          if (!data || data.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `📍 No location history found for this user`
              }]
            };
          }

          const historyText = data.map((location, index) => 
            `${index + 1}. ${location.location_address} (${location.location_city}, ${location.location_country}) - ${new Date(location.created_at).toLocaleString()} [${location.location_source}]`
          ).join('\n');

          return {
            content: [{
              type: 'text',
              text: `📍 **Location History (${data.length} recent locations):**\n${historyText}`
            }]
          };

        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error retrieving location history: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    // ===================================
    // HOTEL LIGHTING CONTROL (MQTT)
    // ===================================
    
    server.tool(
      'control_hotel_lighting',
      'Control hotel room lighting via MQTT',
      {
        room: z.string().describe('Room identifier (e.g., "room1")'),
        command: z.string().describe('Lighting command (e.g., "ON", "OFF", "FX=88", "#FF0000")'),
        topic: z.string().optional().describe('MQTT topic override (defaults to room name)')
      },
      async ({ room, command, topic }) => {
        return new Promise((resolve) => {
          const mqttTopic = topic || room;
          const client = getMqttClient();
          
          client.publish(mqttTopic, command, (error: any) => {
            if (error) {
              resolve({
                content: [{
                  type: 'text',
                  text: `❌ Failed to send lighting command: ${error.message}`
                }]
              });
            } else {
              resolve({
                content: [{
                  type: 'text',
                  text: `✅ Lighting command sent successfully!\n🏠 Room: ${room}\n💡 Command: ${command}\n📡 Topic: ${mqttTopic}`
                }]
              });
            }
          });
        });
      }
    );

    // ===================================
    // GUEST CONTEXT MANAGEMENT
    // ===================================
    
    server.tool(
      'remember_guest_preference',
      'Store guest preferences and context information',
      {
        userId: z.string().describe('User ID (UUID)'),
        entityName: z.string().describe('Name of the preference/entity'),
        entityType: z.string().describe('Type of entity (preference, behavior, location, etc.)'),
        category: z.string().describe('Category (lighting, dining, services, etc.)'),
        observations: z.array(z.string()).describe('Array of observations about this preference'),
        metadata: z.record(z.any()).optional().describe('Additional structured data'),
        sourceAgent: z.string().default('memory_mcp').describe('Which agent/source created this'),
        confidenceScore: z.number().min(0).max(1).default(0.7).describe('Confidence in this information (0-1)')
      },
      async ({ userId, entityName, entityType, category, observations, metadata, sourceAgent, confidenceScore }) => {
        try {
          const { data, error } = await supabase
            .from('guest_entities')
            .upsert({
              user_id: userId,
              name: entityName,
              entity_type: entityType,
              category,
              observations,
              metadata: metadata || {},
              source_agent: sourceAgent,
              confidence_score: confidenceScore,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,name,entity_type',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (error) {
            return {
              content: [{
                type: 'text',
                text: `❌ Failed to store preference: ${error.message}`
              }]
            };
          }

          return {
            content: [{
              type: 'text',
              text: `✅ Guest preference stored successfully!\n📝 Entity: ${entityName}\n🏷️ Type: ${entityType}\n📂 Category: ${category}\n🎯 Confidence: ${Math.round(confidenceScore * 100)}%`
            }]
          };

        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error storing preference: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    server.tool(
      'get_guest_context',
      'Retrieve all context and preferences for a guest',
      {
        userId: z.string().describe('User ID (UUID)'),
        category: z.string().optional().describe('Filter by category (lighting, dining, etc.)')
      },
      async ({ userId, category }) => {
        try {
          let query = supabase
            .from('guest_entities')
            .select('*')
            .eq('user_id', userId)
            .order('confidence_score', { ascending: false });

          if (category) {
            query = query.eq('category', category);
          }

          const { data, error } = await query;

          if (error) {
            return {
              content: [{
                type: 'text',
                text: `❌ Error retrieving guest context: ${error.message}`
              }]
            };
          }

          if (!data || data.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `📝 No guest context found${category ? ` for category: ${category}` : ''}`
              }]
            };
          }

          const contextText = data.map(entity => 
            `**${entity.name}** (${entity.entity_type})\n` +
            `Category: ${entity.category}\n` +
            `Observations: ${entity.observations.join(', ')}\n` +
            `Confidence: ${Math.round(entity.confidence_score * 100)}%\n` +
            `Source: ${entity.source_agent}\n`
          ).join('\n---\n');

          return {
            content: [{
              type: 'text',
              text: `📝 **Guest Context (${data.length} entities found):**\n\n${contextText}`
            }]
          };

        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error retrieving guest context: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

  },
  {},
  { basePath: '/api' }
);

export { handler as GET, handler as POST, handler as DELETE };
