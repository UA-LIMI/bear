#!/usr/bin/env python3
"""
OpenAI Realtime API Client for Pi Zero 2 W
Handles WebSocket connection and tool integration
"""

import os
import json
import logging
import asyncio
import websockets
import pyaudio
import numpy as np
from typing import Dict, Any, Optional, Callable
from mcp_tools import MCPHotelController, OPENAI_MCP_TOOLS

logger = logging.getLogger(__name__)

class OpenAIRealtimeClient:
    def __init__(self, api_key: str, mcp_controller: MCPHotelController = None):
        """
        Initialize OpenAI Realtime API client
        
        Args:
            api_key: OpenAI API key
            mcp_controller: MCP controller for tool execution
        """
        self.api_key = api_key
        self.mcp_controller = mcp_controller
        self.websocket = None
        self.audio_stream = None
        self.pyaudio = None
        
        # Audio configuration
        self.sample_rate = 24000  # OpenAI Realtime API sample rate
        self.channels = 1
        self.chunk_size = 1024
        
        # Session state
        self.session_active = False
        self.conversation_id = None
        
    async def connect(self) -> bool:
        """Connect to OpenAI Realtime API"""
        try:
            uri = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "OpenAI-Beta": "realtime=v1"
            }
            
            logger.info("Connecting to OpenAI Realtime API...")
            self.websocket = await websockets.connect(uri, extra_headers=headers)
            logger.info("✅ Connected to OpenAI Realtime API")
            
            # Configure session with tools
            await self.configure_session()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to OpenAI: {e}")
            return False
    
    async def configure_session(self):
        """Configure the session with tools and instructions"""
        session_config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": """You are LIMI AI, a helpful hotel room assistant. You can control the room lighting and provide information about hotel services.

For lighting control, you have access to these effects:
- colorful: Fun colorful patterns
- romantic: Soft romantic lighting  
- relaxing: Calm, soothing effects
- rainbow: Rainbow patterns
- party: Energetic party lighting
- bright: Bright white light
- dim: Soft dim lighting
- energetic: High-energy effects
- calm: Peaceful effects
- fire: Fire flicker effect
- ocean: Ocean wave patterns

You can also set specific colors (red, green, blue, white, yellow, purple, orange, pink, teal, warm_white, cool_white) and brightness levels (0-255).

Be conversational and helpful. When controlling lights, describe what you're doing.""",
                "voice": "alloy",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 200
                },
                "tools": OPENAI_MCP_TOOLS,
                "tool_choice": "auto",
                "temperature": 0.8,
                "max_response_output_tokens": 4096
            }
        }
        
        await self.send_message(session_config)
        logger.info("Session configured with tools")
    
    async def send_message(self, message: Dict[str, Any]):
        """Send message to OpenAI API"""
        if self.websocket:
            await self.websocket.send(json.dumps(message))
    
    async def handle_tool_call(self, tool_call: Dict[str, Any]) -> Dict[str, Any]:
        """Handle tool function calls"""
        try:
            function_name = tool_call["function"]["name"]
            arguments = json.loads(tool_call["function"]["arguments"])
            call_id = tool_call["call_id"]
            
            logger.info(f"Executing tool: {function_name} with args: {arguments}")
            
            if function_name == "control_hotel_lighting":
                if self.mcp_controller:
                    result = await self.mcp_controller.control_hotel_lighting(**arguments)
                    return {
                        "type": "conversation.item.create",
                        "item": {
                            "type": "function_call_output",
                            "call_id": call_id,
                            "output": json.dumps(result)
                        }
                    }
                else:
                    return {
                        "type": "conversation.item.create", 
                        "item": {
                            "type": "function_call_output",
                            "call_id": call_id,
                            "output": json.dumps({
                                "success": False,
                                "message": "MCP controller not available"
                            })
                        }
                    }
            
            elif function_name == "get_lighting_status":
                if self.mcp_controller:
                    result = await self.mcp_controller.get_lighting_status(**arguments)
                    return {
                        "type": "conversation.item.create",
                        "item": {
                            "type": "function_call_output", 
                            "call_id": call_id,
                            "output": json.dumps(result)
                        }
                    }
                else:
                    return {
                        "type": "conversation.item.create",
                        "item": {
                            "type": "function_call_output", 
                            "call_id": call_id,
                            "output": json.dumps({
                                "success": False,
                                "message": "MCP controller not available"
                            })
                        }
                    }
            
            elif function_name == "call_mcp_tool":
                if self.mcp_controller:
                    tool_name = arguments.pop("tool_name", "")
                    parameters = arguments.pop("parameters", {})
                    result = await self.mcp_controller.call_mcp_tool(tool_name, **parameters)
                    return {
                        "type": "conversation.item.create",
                        "item": {
                            "type": "function_call_output",
                            "call_id": call_id,
                            "output": json.dumps(result)
                        }
                    }
                else:
                    return {
                        "type": "conversation.item.create",
                        "item": {
                            "type": "function_call_output",
                            "call_id": call_id,
                            "output": json.dumps({
                                "success": False,
                                "message": "MCP controller not available"
                            })
                        }
                    }
            
            else:
                return {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "function_call_output",
                        "call_id": call_id,
                        "output": json.dumps({
                            "success": False,
                            "message": f"Unknown function: {function_name}"
                        })
                    }
                }
                
        except Exception as e:
            logger.error(f"Error handling tool call: {e}")
            return {
                "type": "conversation.item.create",
                "item": {
                    "type": "function_call_output",
                    "call_id": tool_call.get("call_id", "unknown"),
                    "output": json.dumps({
                        "success": False,
                        "message": f"Tool execution error: {str(e)}"
                    })
                }
            }
    
    def initialize_audio(self) -> bool:
        """Initialize audio input/output"""
        try:
            self.pyaudio = pyaudio.PyAudio()
            
            # Create input stream
            self.audio_stream = self.pyaudio.open(
                format=pyaudio.paInt16,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size
            )
            
            logger.info(f"Audio initialized: {self.sample_rate}Hz, {self.channels} channel(s)")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize audio: {e}")
            return False
    
    async def start_conversation(self):
        """Start a voice conversation"""
        if not self.websocket:
            logger.error("Not connected to OpenAI")
            return False
        
        if not self.initialize_audio():
            return False
        
        try:
            self.session_active = True
            logger.info("🎤 Starting voice conversation...")
            
            # Start conversation
            await self.send_message({
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"]
                }
            })
            
            # Handle messages in parallel
            await asyncio.gather(
                self.handle_incoming_messages(),
                self.stream_audio_input(),
                return_exceptions=True
            )
            
        except Exception as e:
            logger.error(f"Error in conversation: {e}")
        finally:
            self.session_active = False
            self.cleanup_audio()
    
    async def handle_incoming_messages(self):
        """Handle incoming WebSocket messages"""
        try:
            async for message in self.websocket:
                data = json.loads(message)
                message_type = data.get("type")
                
                logger.debug(f"Received: {message_type}")
                
                if message_type == "session.created":
                    logger.info("Session created successfully")
                
                elif message_type == "response.audio.delta":
                    # Handle audio output (would implement audio playback here)
                    audio_data = data.get("delta", "")
                    if audio_data:
                        # TODO: Implement audio playback
                        pass
                
                elif message_type == "response.function_call_arguments.delta":
                    # Function call in progress
                    pass
                
                elif message_type == "response.function_call_arguments.done":
                    # Function call complete, execute it
                    if "item" in data and "function_call" in data["item"]:
                        tool_response = await self.handle_tool_call(data["item"]["function_call"])
                        await self.send_message(tool_response)
                        
                        # Continue the response
                        await self.send_message({
                            "type": "response.create",
                            "response": {
                                "modalities": ["text", "audio"]
                            }
                        })
                
                elif message_type == "response.done":
                    logger.info("Response completed")
                    
                elif message_type == "error":
                    logger.error(f"OpenAI API error: {data}")
                    break
                
                elif message_type == "conversation.item.input_audio_transcription.completed":
                    transcript = data.get("transcript", "")
                    logger.info(f"User said: {transcript}")
                    
                    # Check for exit commands
                    if any(word in transcript.lower() for word in ["goodbye", "bye", "stop", "exit", "end"]):
                        logger.info("User ended conversation")
                        break
                        
        except websockets.exceptions.ConnectionClosed:
            logger.info("WebSocket connection closed")
        except Exception as e:
            logger.error(f"Error handling messages: {e}")
    
    async def stream_audio_input(self):
        """Stream audio input to OpenAI"""
        try:
            while self.session_active and self.audio_stream:
                # Read audio data
                audio_data = self.audio_stream.read(
                    self.chunk_size,
                    exception_on_overflow=False
                )
                
                # Convert to base64 for transmission
                import base64
                audio_b64 = base64.b64encode(audio_data).decode('utf-8')
                
                # Send audio to OpenAI
                await self.send_message({
                    "type": "input_audio_buffer.append",
                    "audio": audio_b64
                })
                
                # Small delay to prevent overwhelming the API
                await asyncio.sleep(0.01)
                
        except Exception as e:
            logger.error(f"Error streaming audio: {e}")
    
    def cleanup_audio(self):
        """Clean up audio resources"""
        try:
            if self.audio_stream:
                self.audio_stream.close()
                self.audio_stream = None
                
            if self.pyaudio:
                self.pyaudio.terminate()
                self.pyaudio = None
                
            logger.info("Audio cleaned up")
            
        except Exception as e:
            logger.error(f"Error cleaning up audio: {e}")
    
    async def disconnect(self):
        """Disconnect from OpenAI API"""
        try:
            self.session_active = False
            
            if self.websocket:
                await self.websocket.close()
                self.websocket = None
                
            self.cleanup_audio()
            logger.info("Disconnected from OpenAI API")
            
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")


async def test_openai_client():
    """Test OpenAI client with MCP tools"""
    logging.basicConfig(level=logging.INFO)
    
    # Load API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not set")
        return
    
    # Load MCP server URL
    mcp_url = os.getenv("MCP_SERVER_URL", "https://srv1000332.hstgr.cloud/mcp")
    
    # Initialize MCP controller
    mcp_controller = MCPHotelController(mcp_url)
    
    # Initialize OpenAI client
    client = OpenAIRealtimeClient(api_key, mcp_controller)
    
    try:
        # Test MCP connection
        print(f"Testing MCP server connection to: {mcp_url}")
        if mcp_controller.test_connection():
            print("✅ MCP server connected")
        else:
            print("❌ MCP server connection failed")
            return
        
        # Connect to OpenAI
        print("Connecting to OpenAI...")
        if await client.connect():
            print("✅ OpenAI connected")
            print("🎤 Starting voice conversation...")
            print("Say something like: 'Turn on the lights' or 'Set romantic lighting'")
            print("The AI will use MCP tools to control your hotel systems")
            print("Say 'goodbye' to end the conversation")
            
            # Start conversation
            await client.start_conversation()
            
        else:
            print("❌ OpenAI connection failed")
            
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"Test error: {e}")
    finally:
        await client.disconnect()


if __name__ == "__main__":
    asyncio.run(test_openai_client())
