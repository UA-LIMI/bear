---
title: Research Session
query: "Research building a Raspberry Pi Zero 2 W wake word detection application that can: 1) Listen for wake words locally, 2) Connect to a backend API to get OpenAI session keys, 3) Establish WebSocket connection to OpenAI Realtime API for voice conversation. I need to understand: hardware requirements and limitations of Pi Zero 2 W, best wake word detection libraries (Picovoice Porcupine, Snowboy, etc.), audio capture and playback setup, WebSocket libraries for real-time communication, power management considerations, deployment strategies, and complete implementation architecture with code examples."
date: 9/17/2025
time: 3:31:37 PM
timestamp: 2025-09-17T07:31:37.993Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** Research building a Raspberry Pi Zero 2 W wake word detection application that can: 1) Listen for wake words locally, 2) Connect to a backend API to get OpenAI session keys, 3) Establish WebSocket connection to OpenAI Realtime API for voice conversation. I need to understand: hardware requirements and limitations of Pi Zero 2 W, best wake word detection libraries (Picovoice Porcupine, Snowboy, etc.), audio capture and playback setup, WebSocket libraries for real-time communication, power management considerations, deployment strategies, and complete implementation architecture with code examples.

**Response:**

A **Raspberry Pi Zero 2 W** can be used for a local wake word detection application that connects to a backend for OpenAI session keys and establishes a WebSocket connection for real-time voice conversation. However, the Pi Zero 2 W’s limited resources require careful selection of libraries and system architecture. Below is a comprehensive, actionable research synthesis covering hardware, software, deployment, and implementation strategies, with code examples and edge case considerations.

---

## 1. Hardware Requirements and Limitations

**Raspberry Pi Zero 2 W** is a quad-core ARM Cortex-A53 (1 GHz) with 512MB RAM. Key limitations and considerations:

- **CPU & RAM**: Limited compared to Pi 4/5. Real-time audio and wake word detection must use lightweight models.
- **Audio Input/Output**: No built-in microphone or audio jack. Use a USB sound card, I2S microphone (e.g., INMP441), or a HAT (e.g., ReSpeaker 2-Mic HAT)[1][2].
- **Networking**: 2.4GHz Wi-Fi only, which can be a bottleneck for real-time streaming.
- **Power**: Micro-USB, typically 5V/2A recommended for peripherals.
- **Storage**: microSD card; use high-endurance cards for reliability.
- **GPIO**: Available for hardware triggers or status LEDs.

**Edge Cases**:
- USB audio devices may require additional drivers.
- Wi-Fi instability can disrupt real-time sessions.
- Limited RAM restricts use of large ML models or multiple concurrent processes.

---

## 2. Wake Word Detection Libraries

### **Best Options for Pi Zero 2 W**

| Library         | Local/Cloud | License      | Pi Zero 2 W Support | Custom Wake Words | Notes |
|-----------------|-------------|--------------|---------------------|-------------------|-------|
| **Picovoice Porcupine** | Local       | Free for personal, commercial paid | Yes                 | Yes (via console)   | Very efficient, low CPU/RAM, Python/C SDKs[3] |
| **Snowboy**     | Local       | Discontinued | Yes                 | Yes               | Still used, but no longer maintained officially |
| **OpenWakeWord**| Local       | Open Source  | Yes                 | Yes               | Modern, supports TFLite models, used in Rhasspy[2] |
| **Mycroft Precise** | Local   | Open Source  | Yes                 | Yes               | Heavier, but works with tuning |
| **Rhasspy Wyoming Satellite** | Local/Remote | Open Source  | Yes                 | Yes               | Integrates with OpenWakeWord, VAD, and more[2] |

**Recommendation**:  
- **Picovoice Porcupine** for commercial/production (best performance, easy custom model creation, Python SDK)[3].
- **OpenWakeWord** for open-source, community-driven, and easy integration with Rhasspy/Wyoming[2].

**Example: Picovoice Porcupine Python SDK**
```python
import pvporcupine
import pyaudio

porcupine = pvporcupine.create(keywords=["jarvis"])  # or use custom keyword file
pa = pyaudio.PyAudio()
stream = pa.open(rate=porcupine.sample_rate, channels=1, format=pyaudio.paInt16, input=True, frames_per_buffer=porcupine.frame_length)

try:
    while True:
        pcm = stream.read(porcupine.frame_length)
        pcm = np.frombuffer(pcm, dtype=np.int16)
        result = porcupine.process(pcm)
        if result >= 0:
            print("Wake word detected!")
finally:
    stream.close()
    pa.terminate()
    porcupine.delete()
```
**Example: OpenWakeWord with Wyoming Satellite**
- Run OpenWakeWord as a local service, then configure Wyoming Satellite to use it for wake word detection[2].

---

## 3. Audio Capture and Playback Setup

- **Input**: Use `arecord` (ALSA) or Python’s `sounddevice`/`pyaudio` for capturing 16kHz mono PCM audio[1][2][3].
- **Output**: Use `aplay` (ALSA) or Python’s `sounddevice`/`pyaudio` for playback.
- **Device Selection**: List devices with `arecord -L` and `aplay -L`. Prefer `plughw:` devices for direct hardware access[2].
- **Example Command**:
  ```bash
  arecord -D plughw:1,0 -r 16000 -c 1 -f S16_LE -t raw
  aplay -D plughw:1,0 -r 22050 -c 1 -f S16_LE -t raw
  ```
- **Edge Cases**:
  - USB audio devices may enumerate differently on reboot.
  - Buffer underruns/overruns can cause audio glitches; tune buffer sizes as needed.

---

## 4. WebSocket Libraries for Real-Time Communication

- **Python**: Use `websockets` (async), `websocket-client` (sync), or `aiohttp` for robust WebSocket support.
- **Node.js**: Use `ws` or `socket.io` for integration with backend services.
- **OpenAI Realtime API**: Use official SDKs if available, or standard WebSocket libraries to connect to `/v1/realtime` endpoints.

**Example: Python WebSocket Client**
```python
import asyncio
import websockets

async def connect_openai_ws(session_key):
    uri = f"wss://api.openai.com/v1/realtime?session_key={session_key}"
    async with websockets.connect(uri) as websocket:
        await websocket.send("audio data or control message")
        async for message in websocket:
            print("Received:", message)

asyncio.run(connect_openai_ws("YOUR_SESSION_KEY"))
```
**Edge Cases**:
- Handle dropped connections and implement reconnection logic.
- Ensure session key expiration is handled (refresh as needed).

---

## 5. Power Management Considerations

- **Idle Power**: Pi Zero 2 W draws ~0.5-1W idle, more with peripherals.
- **Wake Word Standby**: Keep CPU usage low by using efficient wake word engines (Porcupine/OpenWakeWord).
- **Sleep/Wake**: No deep sleep; use software to reduce polling or throttle processes.
- **Peripheral Power**: USB microphones and Wi-Fi increase draw; use powered hubs if needed.
- **Edge Cases**:
  - Brownouts can corrupt SD cards; use high-quality power supplies.
  - Consider hardware watchdog for auto-reboot on failure.

---

## 6. Deployment Strategies

- **Headless Setup**: SSH or serial console for initial configuration.
- **Systemd Services**: Run wake word, audio, and WebSocket clients as systemd services for auto-restart and logging.
- **Docker**: Possible, but resource-intensive on Pi Zero 2 W; prefer native Python/Node.js scripts.
- **Updates**: Use `git pull` or OTA update scripts for code updates.
- **Monitoring**: Use lightweight monitoring (e.g., `monit`, custom health checks).
- **Edge Cases**:
  - SD card wear; use read-only root or overlayfs if possible.
  - Network outages; queue audio for later upload if needed.

---

## 7. Complete Implementation Architecture

### **System Flow**

1. **Audio Capture**: Microphone input via ALSA or Python.
2. **Wake Word Detection**: Local engine (Porcupine/OpenWakeWord).
3. **Backend API Call**: On wake, POST to backend to get OpenAI session key (use `/api/generate-client-secret` as per Task 4).
4. **WebSocket Connection**: Establish connection to OpenAI Realtime API with session key.
5. **Voice Conversation**: Stream audio, receive responses, play back via speaker.
6. **Session Management**: Handle session key expiration, errors, and reconnection.

### **Component Diagram**

| Component                | Technology/Library         | Notes |
|--------------------------|---------------------------|-------|
| Audio Capture            | ALSA, sounddevice, pyaudio| 16kHz mono PCM |
| Wake Word Detection      | Porcupine/OpenWakeWord    | Local, low-latency |
| Backend API Client       | requests, httpx           | Secure, ephemeral keys |
| WebSocket Client         | websockets, websocket-client | Real-time audio |
| Audio Playback           | ALSA, sounddevice, pyaudio| Speaker output |
| Service Management       | systemd                   | Auto-restart, logging |

### **Example: High-Level Python Skeleton**

```python
import pvporcupine
import pyaudio
import requests
import asyncio
import websockets

# 1. Wake word detection loop
def detect_wake_word():
    porcupine = pvporcupine.create(keywords=["jarvis"])
    pa = pyaudio.PyAudio()
    stream = pa.open(rate=porcupine.sample_rate, channels=1, format=pyaudio.paInt16, input=True, frames_per_buffer=porcupine.frame_length)
    try:
        while True:
            pcm = stream.read(porcupine.frame_length)
            pcm = np.frombuffer(pcm, dtype=np.int16)
            result = porcupine.process(pcm)
            if result >= 0:
                print("Wake word detected!")
                return
    finally:
        stream.close()
        pa.terminate()
        porcupine.delete()

# 2. Get OpenAI session key from backend
def get_session_key():
    resp = requests.post("https://your-backend/api/generate-client-secret", headers={"Authorization": "Bearer ..."})
    return resp.json()["session_key"]

# 3. WebSocket connection to OpenAI
async def openai_voice_session(session_key):
    uri = f"wss://api.openai.com/v1/realtime?session_key={session_key}"
    async with websockets.connect(uri) as ws:
        # Send/receive audio data here
        pass

# 4. Main loop
def main():
    while True:
        detect_wake_word()
        session_key = get_session_key()
        asyncio.run(openai_voice_session(session_key))

if __name__ == "__main__":
    main()
```

---

## 8. Integration with Project Context

- **Task 33**: The above architecture can be extended to integrate with a Perplexity MCP server for advanced search/agent capabilities. The wake word device can act as a voice satellite, forwarding queries to MCP/OpenAI agents via the backend.
- **Task 4**: The `/api/generate-client-secret` endpoint is used to obtain ephemeral OpenAI session keys, as described in your backend infrastructure.
- **Task 11**: Ensure the client follows the latest OpenAI Realtime API and session management patterns, including token refresh and error handling.
- **Deployment**: Use systemd to manage the wake word and voice session services, ensuring resilience and auto-restart.

---

## 9. Edge Cases and Pitfalls

- **Wake Word False Positives/Negatives**: Tune sensitivity, use high-quality microphones, and test in real environments.
- **Audio Device Enumeration**: Hardcode device IDs or use udev rules to ensure consistent device mapping.
- **Network Instability**: Implement retry logic for backend and WebSocket connections.
- **Session Key Expiry**: Monitor and refresh keys as needed.
- **Resource Exhaustion**: Monitor CPU/RAM usage; restart services if memory leaks are detected.

---

## 10. References and Further Reading

- [Picovoice Porcupine Python SDK Tutorial][3]
- [OpenWakeWord and Wyoming Satellite for Pi Zero 2 W][2]
- [Custom Wake Word Detection on Raspberry Pi][1]

---

This architecture and set of recommendations provide a robust foundation for a **Raspberry Pi Zero 2 W wake word detection and OpenAI real-time voice interface**, with actionable code, deployment strategies, and integration points for your project’s backend and agent infrastructure.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-17T07:31:37.993Z*
