#!/usr/bin/env python3
"""
Pi Zero 2 W Voice Assistant Main Application
Combines wake word detection, OpenAI Realtime API, and MQTT hotel controls
"""

import os
import logging
import asyncio
import signal
import sys
from dotenv import load_dotenv
from wake_word_detector import WakeWordDetector
from openai_client import OpenAIRealtimeClient
from mcp_tools import MCPHotelController

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PiVoiceAssistant:
    def __init__(self):
        """Initialize the Pi Voice Assistant"""
        self.running = False
        self.wake_detector = None
        self.openai_client = None
        self.mcp_controller = None
        
        # Configuration from environment
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.mcp_server_url = os.getenv('MCP_SERVER_URL', 'https://srv1000332.hstgr.cloud/mcp')
        self.wake_word = os.getenv('WAKE_WORD', 'jarvis')
        self.custom_wake_word_path = os.getenv('CUSTOM_WAKE_WORD_PATH')
        
        # Validate configuration
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
    
    async def initialize(self) -> bool:
        """Initialize all components"""
        try:
            logger.info("🚀 Initializing Pi Voice Assistant...")
            
            # Initialize MCP controller
            logger.info("Initializing MCP controller...")
            self.mcp_controller = MCPHotelController(self.mcp_server_url)
            
            if self.mcp_controller.test_connection():
                logger.info("✅ MCP controller initialized")
            else:
                logger.error("❌ Failed to initialize MCP controller")
                return False
            
            # Initialize OpenAI client
            logger.info("Initializing OpenAI client...")
            self.openai_client = OpenAIRealtimeClient(
                api_key=self.openai_api_key,
                mcp_controller=self.mcp_controller
            )
            
            # Initialize wake word detector
            logger.info(f"Initializing wake word detector for '{self.wake_word}'...")
            if self.custom_wake_word_path and os.path.exists(self.custom_wake_word_path):
                self.wake_detector = WakeWordDetector(
                    keyword_paths=[self.custom_wake_word_path]
                )
            else:
                self.wake_detector = WakeWordDetector(
                    keywords=[self.wake_word]
                )
            
            if self.wake_detector.initialize():
                logger.info("✅ Wake word detector initialized")
            else:
                logger.error("❌ Failed to initialize wake word detector")
                return False
            
            logger.info("🎉 All components initialized successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize components: {e}")
            return False
    
    async def run_voice_session(self):
        """Run a voice conversation session"""
        try:
            logger.info("🎤 Starting voice session...")
            
            # Connect to OpenAI
            if await self.openai_client.connect():
                logger.info("Connected to OpenAI Realtime API")
                
                # Start conversation
                await self.openai_client.start_conversation()
                
                logger.info("Voice session completed")
            else:
                logger.error("Failed to connect to OpenAI")
                
        except Exception as e:
            logger.error(f"Error in voice session: {e}")
        finally:
            # Clean up
            await self.openai_client.disconnect()
    
    async def main_loop(self):
        """Main application loop"""
        self.running = True
        logger.info("🔊 Pi Voice Assistant is running!")
        logger.info(f"Listening for wake word: '{self.wake_word}'")
        logger.info("Press Ctrl+C to stop")
        
        try:
            while self.running:
                # Wait for wake word
                logger.info("👂 Listening for wake word...")
                
                # Run wake word detection in executor to avoid blocking
                loop = asyncio.get_event_loop()
                wake_detected = await loop.run_in_executor(
                    None, 
                    self.wake_detector.wait_for_wake_word
                )
                
                if wake_detected and self.running:
                    logger.info("🎯 Wake word detected!")
                    
                    # Run voice session
                    await self.run_voice_session()
                    
                    logger.info("Session ended, returning to wake word detection...")
                    
                    # Brief pause before listening again
                    await asyncio.sleep(1)
                
        except asyncio.CancelledError:
            logger.info("Main loop cancelled")
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
    
    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("🛑 Shutting down Pi Voice Assistant...")
        self.running = False
        
        try:
            if self.openai_client:
                await self.openai_client.disconnect()
            
            if self.mcp_controller:
                # MCP controller doesn't need explicit disconnection
                pass
            
            if self.wake_detector:
                self.wake_detector.cleanup()
            
            logger.info("✅ Shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")


def signal_handler(signum, frame):
    """Handle system signals for graceful shutdown"""
    logger.info(f"Received signal {signum}")
    # The main loop will handle the actual shutdown
    sys.exit(0)


async def main():
    """Main entry point"""
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    assistant = PiVoiceAssistant()
    
    try:
        # Initialize components
        if await assistant.initialize():
            # Run main loop
            await assistant.main_loop()
        else:
            logger.error("Failed to initialize assistant")
            return 1
            
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return 1
    finally:
        await assistant.shutdown()
    
    return 0


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("Application interrupted")
        sys.exit(0)
