# Pi Zero 2 W Voice Assistant

A voice-controlled hotel room assistant that runs on Raspberry Pi Zero 2 W. Features wake word detection, OpenAI Realtime API integration, and MQTT-based hotel room controls.

## Features

- 🎤 **Local Wake Word Detection** - Uses Picovoice Porcupine for "Hey LIMI" activation
- 🤖 **OpenAI Realtime API** - Natural voice conversations with GPT-4o
- 💡 **Hotel Room Controls** - MQTT-based lighting and device control
- 🔄 **Auto-Restart** - Systemd service with automatic recovery
- ⚡ **Pi Zero 2 W Optimized** - Efficient resource usage

## Quick Start

### 1. Hardware Setup

**Required:**
- Raspberry Pi Zero 2 W
- USB sound card or I2S microphone (ReSpeaker 2-Mic HAT recommended)
- Speaker (USB or 3.5mm)
- microSD card (32GB+ high-endurance)

**Audio Setup:**
```bash
# List audio devices
arecord -L
aplay -L

# Test microphone
arecord -D plughw:1,0 -d 5 -f cd test.wav && aplay test.wav
```

### 2. Installation

```bash
# Clone or copy files to Pi
git clone <repository> pi-voice-assistant
cd pi-voice-assistant

# Run installation script
./install.sh
```

### 3. Configuration

Edit the configuration file:
```bash
nano /opt/pi-voice-assistant/.env
```

**Required settings:**
```bash
# Your OpenAI API key
OPENAI_API_KEY=sk-proj-your-key-here

# MQTT broker (your hotel system)
MQTT_BROKER=mqtt.limilighting.com
MQTT_USER=mcp
MQTT_PASSWORD=mcp
```

### 4. Test & Run

**Manual test:**
```bash
cd /opt/pi-voice-assistant
source venv/bin/activate
python main.py
```

**Start service:**
```bash
sudo systemctl start pi-voice-assistant
sudo systemctl status pi-voice-assistant
```

**View logs:**
```bash
sudo journalctl -u pi-voice-assistant -f
```

## Usage

1. **Wake Word**: Say "Jarvis" (or your custom wake word)
2. **Voice Commands**: 
   - "Turn on the lights"
   - "Set romantic lighting"
   - "Make it blue and bright"
   - "Turn off the lights"
   - "Set brightness to 50"
3. **End Session**: Say "goodbye" or "stop"

## Voice Commands

### Lighting Effects
- **colorful** - Fun colorful patterns
- **romantic** - Soft romantic lighting
- **relaxing** - Calm, soothing effects
- **rainbow** - Rainbow patterns
- **party** - Energetic party lighting
- **bright** - Bright white light
- **dim** - Soft dim lighting
- **fire** - Fire flicker effect
- **ocean** - Ocean wave patterns

### Colors
- red, green, blue, white, yellow
- purple, orange, pink, teal
- warm_white, cool_white

### Examples
- "Set the lights to romantic"
- "Make it blue"
- "Turn on party lighting"
- "Set brightness to 200"
- "Turn off the lights"

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Wake Word      │    │  OpenAI          │    │  MQTT Hotel     │
│  Detection      │───▶│  Realtime API    │───▶│  Controls       │
│  (Porcupine)    │    │  (GPT-4o)        │    │  (WLED/Devices) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        ▲                        │                        │
        │                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Audio I/O      │    │  Tool Functions  │    │  Room Lighting  │
│  (PyAudio)      │    │  (MQTT Commands) │    │  & Devices      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Files

- **`main.py`** - Main application entry point
- **`wake_word_detector.py`** - Porcupine wake word detection
- **`openai_client.py`** - OpenAI Realtime API client
- **`mqtt_tools.py`** - MQTT hotel room controls
- **`install.sh`** - Installation script
- **`requirements.txt`** - Python dependencies

## Troubleshooting

### Audio Issues
```bash
# Check audio devices
arecord -L
aplay -L

# Test recording
arecord -D plughw:1,0 -d 5 -f cd test.wav

# Test playback
aplay test.wav
```

### Service Issues
```bash
# Check service status
sudo systemctl status pi-voice-assistant

# View logs
sudo journalctl -u pi-voice-assistant -f

# Restart service
sudo systemctl restart pi-voice-assistant
```

### Wake Word Issues
- Ensure microphone is working
- Adjust sensitivity in wake_word_detector.py
- Train custom wake word with Picovoice Console

### MQTT Connection Issues
- Check network connectivity
- Verify MQTT broker settings in .env
- Test MQTT connection manually

## Custom Wake Words

1. Visit [Picovoice Console](https://console.picovoice.ai/)
2. Create custom "Hey LIMI" wake word
3. Download .ppn file
4. Update .env:
   ```bash
   CUSTOM_WAKE_WORD_PATH=/opt/pi-voice-assistant/custom_wake_word.ppn
   ```

## Development

### Adding New Tools

1. Add tool definition to `mqtt_tools.py` in `OPENAI_TOOLS`
2. Implement handler in `OpenAIRealtimeClient.handle_tool_call()`
3. Test with voice commands

### Debugging

Enable debug logging:
```bash
# In .env file
LOG_LEVEL=DEBUG
```

## Performance

**Pi Zero 2 W Resources:**
- CPU: ~15-25% during conversation
- RAM: ~150-200MB
- Wake word detection: ~5% CPU idle
- Network: WebSocket + MQTT minimal

## Security

- OpenAI API key stored locally in .env
- MQTT credentials configurable
- No external dependencies for wake word
- Local audio processing

## License

MIT License - See LICENSE file for details.

## Support

For issues and questions:
1. Check logs: `sudo journalctl -u pi-voice-assistant -f`
2. Verify configuration in .env
3. Test components individually
4. Check hardware connections
