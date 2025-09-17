#!/usr/bin/env python3
"""
Wake Word Detection Module for Pi Zero 2 W
Uses Picovoice Porcupine for efficient local wake word detection
"""

import os
import logging
import numpy as np
import pyaudio
import pvporcupine
from typing import Optional, List

logger = logging.getLogger(__name__)

class WakeWordDetector:
    def __init__(self, 
                 keywords: List[str] = None, 
                 keyword_paths: List[str] = None,
                 sensitivity: float = 0.5):
        """
        Initialize wake word detector
        
        Args:
            keywords: Built-in keywords like ['jarvis', 'computer', 'hey google']
            keyword_paths: Paths to custom .ppn keyword files
            sensitivity: Detection sensitivity (0.0 to 1.0)
        """
        self.keywords = keywords or ['jarvis']
        self.keyword_paths = keyword_paths
        self.sensitivity = sensitivity
        self.porcupine = None
        self.audio_stream = None
        self.pyaudio = None
        
    def initialize(self) -> bool:
        """Initialize Porcupine and audio stream"""
        try:
            # Initialize Porcupine
            if self.keyword_paths:
                self.porcupine = pvporcupine.create(
                    keyword_paths=self.keyword_paths,
                    sensitivities=[self.sensitivity] * len(self.keyword_paths)
                )
            else:
                self.porcupine = pvporcupine.create(
                    keywords=self.keywords,
                    sensitivities=[self.sensitivity] * len(self.keywords)
                )
            
            # Initialize PyAudio
            self.pyaudio = pyaudio.PyAudio()
            
            # Create audio stream
            self.audio_stream = self.pyaudio.open(
                rate=self.porcupine.sample_rate,
                channels=1,
                format=pyaudio.paInt16,
                input=True,
                frames_per_buffer=self.porcupine.frame_length
            )
            
            logger.info(f"Wake word detector initialized with keywords: {self.keywords}")
            logger.info(f"Sample rate: {self.porcupine.sample_rate}Hz")
            logger.info(f"Frame length: {self.porcupine.frame_length}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize wake word detector: {e}")
            return False
    
    def listen_for_wake_word(self) -> Optional[int]:
        """
        Listen for wake word detection
        
        Returns:
            Index of detected keyword, or None if no detection
        """
        if not self.audio_stream or not self.porcupine:
            logger.error("Wake word detector not initialized")
            return None
            
        try:
            # Read audio frame
            pcm = self.audio_stream.read(
                self.porcupine.frame_length,
                exception_on_overflow=False
            )
            pcm = np.frombuffer(pcm, dtype=np.int16)
            
            # Process frame for wake word
            result = self.porcupine.process(pcm)
            
            if result >= 0:
                keyword = self.keywords[result] if result < len(self.keywords) else f"custom_{result}"
                logger.info(f"Wake word detected: {keyword}")
                return result
                
            return None
            
        except Exception as e:
            logger.error(f"Error during wake word detection: {e}")
            return None
    
    def wait_for_wake_word(self) -> bool:
        """
        Block until wake word is detected
        
        Returns:
            True if wake word detected, False on error
        """
        logger.info("Listening for wake word...")
        
        try:
            while True:
                result = self.listen_for_wake_word()
                if result is not None:
                    return True
                    
        except KeyboardInterrupt:
            logger.info("Wake word detection interrupted by user")
            return False
        except Exception as e:
            logger.error(f"Error in wake word loop: {e}")
            return False
    
    def cleanup(self):
        """Clean up resources"""
        try:
            if self.audio_stream:
                self.audio_stream.close()
                self.audio_stream = None
                
            if self.pyaudio:
                self.pyaudio.terminate()
                self.pyaudio = None
                
            if self.porcupine:
                self.porcupine.delete()
                self.porcupine = None
                
            logger.info("Wake word detector cleaned up")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    def __enter__(self):
        """Context manager entry"""
        if self.initialize():
            return self
        else:
            raise RuntimeError("Failed to initialize wake word detector")
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.cleanup()


def test_wake_word_detector():
    """Test the wake word detector"""
    logging.basicConfig(level=logging.INFO)
    
    print("Testing wake word detector...")
    print("Say 'Jarvis' to test detection")
    print("Press Ctrl+C to stop")
    
    try:
        with WakeWordDetector(keywords=['jarvis']) as detector:
            while True:
                if detector.wait_for_wake_word():
                    print("🎤 Wake word detected! Starting voice session...")
                    # Simulate processing time
                    import time
                    time.sleep(2)
                    print("Session ended, listening for wake word again...")
                    
    except KeyboardInterrupt:
        print("\nTest stopped by user")
    except Exception as e:
        print(f"Test failed: {e}")


if __name__ == "__main__":
    test_wake_word_detector()
