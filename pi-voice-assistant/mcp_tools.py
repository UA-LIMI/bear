#!/usr/bin/env python3
"""
MCP Tools for OpenAI Realtime API Agent
Provides hotel room lighting and device control via MCP server
"""

import json
import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class MCPHotelController:
    def __init__(self, mcp_server_url: str):
        """
        Initialize MCP hotel controller
        
        Args:
            mcp_server_url: URL of the MCP server (e.g., https://srv1000332.hstgr.cloud/mcp)
        """
        self.mcp_server_url = mcp_server_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Pi-Voice-Assistant/1.0'
        })
        
    def test_connection(self) -> bool:
        """Test connection to MCP server"""
        try:
            response = self.session.get(f"{self.mcp_server_url}/health", timeout=5)
            logger.info(f"MCP server connection test: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"MCP server connection failed: {e}")
            return False
    
    async def call_mcp_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """
        Call an MCP tool on the server
        
        Args:
            tool_name: Name of the MCP tool to call
            **kwargs: Tool parameters
            
        Returns:
            Dict with result from MCP server
        """
        try:
            payload = {
                "tool": tool_name,
                "parameters": kwargs
            }
            
            logger.info(f"Calling MCP tool: {tool_name} with params: {kwargs}")
            
            response = self.session.post(
                f"{self.mcp_server_url}/call-tool",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"MCP tool result: {result}")
                return {
                    "success": True,
                    "result": result,
                    "message": f"Successfully called {tool_name}"
                }
            else:
                logger.error(f"MCP tool call failed: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "message": f"Failed to call {tool_name}"
                }
                
        except Exception as e:
            logger.error(f"Error calling MCP tool {tool_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Exception calling {tool_name}: {str(e)}"
            }
    
    async def control_hotel_lighting(self, 
                                   room: str = "room1",
                                   action: str = "on",
                                   effect: str = None,
                                   brightness: int = None) -> Dict[str, Any]:
        """
        Control hotel lighting via MCP MQTT tools
        
        Args:
            room: Room identifier
            action: Basic action (on/off)
            effect: Lighting effect
            brightness: Brightness level
            
        Returns:
            Result from MCP server
        """
        # Determine MQTT topic and payload based on action
        topic = room
        payload = action.upper() if action.lower() in ['on', 'off'] else None
        
        # Handle effects
        if effect:
            effect_mappings = {
                'colorful': 'FX=9',
                'romantic': 'FX=88', 
                'relaxing': 'FX=2',
                'rainbow': 'FX=73',
                'party': 'FX=23',
                'bright': 'FX=0',
                'energetic': 'FX=97',
                'calm': 'FX=38'
            }
            payload = effect_mappings.get(effect.lower(), f'FX={effect}')
        
        # Handle brightness via JSON API
        if brightness is not None:
            topic = f"{room}/api"
            payload = json.dumps({"bri": max(0, min(255, brightness))})
        
        # Call MCP MQTT publish tool
        return await self.call_mcp_tool(
            "mqtt_publish",
            topic=topic,
            message=payload,
            qos=0,
            retain=False
        )
    
    async def get_lighting_status(self, room: str = "room1") -> Dict[str, Any]:
        """Get lighting status via MCP"""
        return await self.call_mcp_tool(
            "mqtt_read_messages",
            topic=f"{room}/status",
            max_messages=1
        )


# OpenAI Tool Definitions for MCP Integration
OPENAI_MCP_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "control_hotel_lighting",
            "description": "Control hotel room lighting via MCP MQTT server. This connects to the hotel's MQTT system to control WLED lighting effects, colors, and brightness.",
            "parameters": {
                "type": "object",
                "properties": {
                    "room": {
                        "type": "string",
                        "description": "Room identifier (e.g., room1, room2)",
                        "default": "room1"
                    },
                    "action": {
                        "type": "string",
                        "enum": ["on", "off"],
                        "description": "Basic lighting action - turn lights on or off"
                    },
                    "effect": {
                        "type": "string",
                        "enum": ["colorful", "romantic", "relaxing", "rainbow", "party", "bright", "energetic", "calm"],
                        "description": "Lighting effect to apply - creates different visual patterns and moods"
                    },
                    "brightness": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 255,
                        "description": "Brightness level from 0 (off) to 255 (maximum brightness)"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_lighting_status", 
            "description": "Get current status of hotel room lighting system via MCP MQTT server",
            "parameters": {
                "type": "object",
                "properties": {
                    "room": {
                        "type": "string",
                        "description": "Room identifier to check status for",
                        "default": "room1"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "call_mcp_tool",
            "description": "Call any available MCP tool on the hotel's MCP server. Use this for advanced hotel system controls beyond basic lighting.",
            "parameters": {
                "type": "object", 
                "properties": {
                    "tool_name": {
                        "type": "string",
                        "description": "Name of the MCP tool to call (e.g., mqtt_publish, mqtt_subscribe, mqtt_read_messages)"
                    },
                    "parameters": {
                        "type": "object",
                        "description": "Parameters to pass to the MCP tool",
                        "additionalProperties": True
                    }
                },
                "required": ["tool_name"]
            }
        }
    }
]


def test_mcp_controller():
    """Test MCP hotel controller"""
    import asyncio
    import os
    
    logging.basicConfig(level=logging.INFO)
    
    mcp_url = os.getenv('MCP_SERVER_URL', 'https://srv1000332.hstgr.cloud/mcp')
    controller = MCPHotelController(mcp_url)
    
    async def run_tests():
        print(f"Testing MCP controller with server: {mcp_url}")
        
        # Test connection
        print("\n1. Testing connection...")
        if controller.test_connection():
            print("✅ MCP server connection successful")
        else:
            print("❌ MCP server connection failed")
            return
        
        # Test lighting control
        print("\n2. Testing lighting controls...")
        
        # Turn on lights
        result = await controller.control_hotel_lighting(action="on")
        print(f"Turn ON: {result}")
        
        # Set effect
        result = await controller.control_hotel_lighting(effect="colorful")
        print(f"Colorful effect: {result}")
        
        # Set brightness
        result = await controller.control_hotel_lighting(brightness=150)
        print(f"Brightness 150: {result}")
        
        # Turn off
        result = await controller.control_hotel_lighting(action="off")
        print(f"Turn OFF: {result}")
        
        print("\n✅ All MCP tests completed!")
    
    try:
        asyncio.run(run_tests())
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"Test error: {e}")


if __name__ == "__main__":
    test_mcp_controller()
