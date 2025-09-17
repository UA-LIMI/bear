# Pi Zero 2 W Voice Assistant - Manual Deployment Guide

Your Pi at `192.168.16.161` doesn't have SSH enabled, so here's how to deploy manually:

## Option 1: Enable SSH First (Recommended)

### On the Pi directly:
```bash
# Enable SSH
sudo systemctl enable ssh
sudo systemctl start ssh

# Or use raspi-config
sudo raspi-config
# Navigate to: Interface Options > SSH > Enable
```

### Then from your Mac:
```bash
# Copy files
scp -r pi-voice-assistant/ pi@192.168.16.161:~/

# SSH and install
ssh pi@192.168.16.161
cd pi-voice-assistant
./install.sh
```

## Option 2: Manual File Transfer

### 1. Copy Files to Pi
- Use USB drive, SD card, or file sharing to copy `pi-voice-assistant.tar.gz` to the Pi
- Or use the individual files from the `pi-voice-assistant/` folder

### 2. On the Pi, extract and install:
```bash
# Extract files
cd ~
tar -xzf pi-voice-assistant.tar.gz
cd pi-voice-assistant

# Make install script executable
chmod +x install.sh

# Run installation
./install.sh
```

### 3. Configure the application:
```bash
# Edit configuration
nano /opt/pi-voice-assistant/.env

# Add your OpenAI API key
OPENAI_API_KEY=sk-proj-your-actual-key-here

# MQTT settings (should already be correct)
MQTT_BROKER=mqtt.limilighting.com
MQTT_USER=mcp
MQTT_PASSWORD=mcp
```

### 4. Test and start:
```bash
# Test manually first
cd /opt/pi-voice-assistant
source venv/bin/activate
python main.py

# If working, start as service
sudo systemctl start pi-voice-assistant
sudo systemctl enable pi-voice-assistant

# Check status
sudo systemctl status pi-voice-assistant
```

## Quick Test Commands

### Test individual components:
```bash
cd /opt/pi-voice-assistant
source venv/bin/activate

# Test wake word detection
python wake_word_detector.py

# Test MQTT connection
python mqtt_tools.py

# Test OpenAI client (needs API key)
python openai_client.py
```

### Test audio setup:
```bash
# List audio devices
arecord -L
aplay -L

# Test microphone (5 second recording)
arecord -D plughw:1,0 -d 5 -f cd test.wav

# Play back recording
aplay test.wav
```

## Usage

1. **Say "Jarvis"** to activate
2. **Voice commands:**
   - "Turn on the lights"
   - "Set romantic lighting" 
   - "Make it colorful"
   - "Set brightness to 100"
   - "Turn off the lights"
3. **Say "goodbye"** to end session

## Troubleshooting

### Service logs:
```bash
sudo journalctl -u pi-voice-assistant -f
```

### Audio issues:
- Check USB sound card is connected
- Test with `arecord -L` and `aplay -L`
- Make sure user is in `audio` group

### MQTT issues:
- Check network connectivity
- Test: `ping mqtt.limilighting.com`

## Files Included

- `main.py` - Main application
- `wake_word_detector.py` - Porcupine wake word detection
- `openai_client.py` - OpenAI Realtime API client  
- `mqtt_tools.py` - Hotel lighting controls
- `install.sh` - Installation script
- `requirements.txt` - Python dependencies
- `env.example` - Configuration template

The voice assistant will connect directly to OpenAI with your API key and control your hotel lights via MQTT!
