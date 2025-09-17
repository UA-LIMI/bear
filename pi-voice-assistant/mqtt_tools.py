#!/usr/bin/env python3
"""
MQTT Tools for OpenAI Realtime API Agent
Provides hotel room lighting and device control via MQTT
"""

import json
import logging
import asyncio
from typing import Dict, Any, Optional
import paho.mqtt.client as mqtt
from asyncio_mqtt import Client as AsyncMQTTClient

logger = logging.getLogger(__name__)

class MQTTHotelController:
    def __init__(self, 
                 broker: str,
                 port: int = 1883,
                 username: str = None,
                 password: str = None,
                 use_tls: bool = False):
        """
        Initialize MQTT hotel controller
        
        Args:
            broker: MQTT broker hostname
            port: MQTT broker port
            username: MQTT username
            password: MQTT password
            use_tls: Use TLS encryption
        """
        self.broker = broker
        self.port = port
        self.username = username
        self.password = password
        self.use_tls = use_tls
        
        # Room control topics
        self.room_topics = {
            'room1': 'room1',
            'room1_api': 'room1/api',
            'room1_col': 'room1/col'
        }
        
        # WLED effect mappings for natural language
        self.effects = {
            'off': 'OFF',
            'on': 'ON',
            'colorful': 'FX=9',      # Colorloop
            'romantic': 'FX=88',     # Palette effect
            'relaxing': 'FX=2',      # Breathe
            'rainbow': 'FX=73',      # Rainbow chase
            'party': 'FX=23',        # Strobe
            'bright': 'FX=0',        # Solid
            'dim': 'FX=2',           # Breathe (soft)
            'energetic': 'FX=97',    # High energy effect
            'calm': 'FX=38',         # Gentle effect
            'fire': 'FX=65',         # Fire flicker
            'ocean': 'FX=70',        # Ocean waves
        }
        
        # Color mappings
        self.colors = {
            'red': [255, 0, 0],
            'green': [0, 255, 0],
            'blue': [0, 0, 255],
            'white': [255, 255, 255],
            'yellow': [255, 255, 0],
            'purple': [128, 0, 128],
            'orange': [255, 165, 0],
            'pink': [255, 192, 203],
            'teal': [0, 255, 200],
            'warm_white': [255, 180, 120],
            'cool_white': [200, 220, 255]
        }
    
    async def connect(self) -> bool:
        """Connect to MQTT broker"""
        try:
            self.client = AsyncMQTTClient(
                hostname=self.broker,
                port=self.port,
                username=self.username,
                password=self.password,
                tls=self.use_tls
            )
            await self.client.connect()
            logger.info(f"Connected to MQTT broker: {self.broker}:{self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from MQTT broker"""
        try:
            await self.client.disconnect()
            logger.info("Disconnected from MQTT broker")
        except Exception as e:
            logger.error(f"Error disconnecting from MQTT: {e}")
    
    async def publish_message(self, topic: str, payload: str) -> bool:
        """Publish message to MQTT topic"""
        try:
            await self.client.publish(topic, payload)
            logger.info(f"Published to {topic}: {payload}")
            return True
        except Exception as e:
            logger.error(f"Failed to publish to {topic}: {e}")
            return False
    
    async def control_room_lighting(self, 
                                  room: str = "room1",
                                  action: str = "on",
                                  effect: str = None,
                                  color: str = None,
                                  brightness: int = None) -> Dict[str, Any]:
        """
        Control room lighting via MQTT
        
        Args:
            room: Room identifier (default: room1)
            action: Basic action (on/off/toggle)
            effect: Lighting effect name
            color: Color name
            brightness: Brightness level (0-255)
            
        Returns:
            Dict with result status and message
        """
        try:
            if not hasattr(self, 'client'):
                return {"success": False, "message": "MQTT not connected"}
            
            topic = self.room_topics.get(room, room)
            
            # Handle basic on/off
            if action.lower() in ['off', 'on']:
                payload = action.upper()
                success = await self.publish_message(topic, payload)
                return {
                    "success": success,
                    "message": f"Turned {action} lights in {room}",
                    "topic": topic,
                    "payload": payload
                }
            
            # Handle effects
            if effect:
                effect_cmd = self.effects.get(effect.lower())
                if effect_cmd:
                    success = await self.publish_message(topic, effect_cmd)
                    return {
                        "success": success,
                        "message": f"Set {room} lights to {effect} effect",
                        "topic": topic,
                        "payload": effect_cmd
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Unknown effect: {effect}. Available: {list(self.effects.keys())}"
                    }
            
            # Handle brightness via JSON API
            if brightness is not None:
                api_topic = f"{room}/api"
                brightness = max(0, min(255, brightness))  # Clamp to valid range
                payload = json.dumps({"bri": brightness})
                success = await self.publish_message(api_topic, payload)
                return {
                    "success": success,
                    "message": f"Set {room} brightness to {brightness}",
                    "topic": api_topic,
                    "payload": payload
                }
            
            # Handle color
            if color:
                color_rgb = self.colors.get(color.lower())
                if color_rgb:
                    api_topic = f"{room}/api"
                    payload = json.dumps({"seg": [{"col": [color_rgb]}]})
                    success = await self.publish_message(api_topic, payload)
                    return {
                        "success": success,
                        "message": f"Set {room} color to {color}",
                        "topic": api_topic,
                        "payload": payload
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Unknown color: {color}. Available: {list(self.colors.keys())}"
                    }
            
            return {
                "success": False,
                "message": "No valid action specified"
            }
            
        except Exception as e:
            logger.error(f"Error controlling room lighting: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }


# OpenAI Tool Definitions
OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "control_hotel_lighting",
            "description": "Control hotel room lighting including on/off, effects, colors, and brightness",
            "parameters": {
                "type": "object",
                "properties": {
                    "room": {
                        "type": "string",
                        "description": "Room identifier",
                        "default": "room1"
                    },
                    "action": {
                        "type": "string",
                        "enum": ["on", "off", "toggle"],
                        "description": "Basic lighting action"
                    },
                    "effect": {
                        "type": "string",
                        "enum": ["colorful", "romantic", "relaxing", "rainbow", "party", "bright", "dim", "energetic", "calm", "fire", "ocean"],
                        "description": "Lighting effect to apply"
                    },
                    "color": {
                        "type": "string",
                        "enum": ["red", "green", "blue", "white", "yellow", "purple", "orange", "pink", "teal", "warm_white", "cool_white"],
                        "description": "Color to set"
                    },
                    "brightness": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 255,
                        "description": "Brightness level (0-255)"
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
            "description": "Get current status of hotel room lighting",
            "parameters": {
                "type": "object",
                "properties": {
                    "room": {
                        "type": "string",
                        "description": "Room identifier",
                        "default": "room1"
                    }
                },
                "required": []
            }
        }
    }
]


async def test_mqtt_controller():
    """Test MQTT hotel controller"""
    logging.basicConfig(level=logging.INFO)
    
    controller = MQTTHotelController(
        broker="mqtt.limilighting.com",
        username="mcp",
        password="mcp"
    )
    
    try:
        print("Connecting to MQTT broker...")
        if await controller.connect():
            print("✅ Connected successfully!")
            
            # Test basic commands
            print("\nTesting lighting controls:")
            
            # Turn on
            result = await controller.control_room_lighting(action="on")
            print(f"Turn ON: {result}")
            await asyncio.sleep(2)
            
            # Set colorful effect
            result = await controller.control_room_lighting(effect="colorful")
            print(f"Colorful effect: {result}")
            await asyncio.sleep(3)
            
            # Set brightness
            result = await controller.control_room_lighting(brightness=100)
            print(f"Brightness 100: {result}")
            await asyncio.sleep(2)
            
            # Turn off
            result = await controller.control_room_lighting(action="off")
            print(f"Turn OFF: {result}")
            
            print("✅ All tests completed!")
            
        else:
            print("❌ Failed to connect to MQTT broker")
            
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"Test error: {e}")
    finally:
        await controller.disconnect()


if __name__ == "__main__":
    asyncio.run(test_mqtt_controller())
