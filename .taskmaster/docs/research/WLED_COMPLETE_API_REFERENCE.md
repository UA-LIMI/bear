# WLED Complete API Reference
*For HTTP and MQTT Control*

## Overview
WLED versions since 0.8.4 implement a powerful JSON API over HTTP at the `/json` endpoint. **The same JSON payloads work for MQTT** by publishing to the `[deviceTopic]/api` topic.

## Key API Endpoints
- `/json` - Full state object
- `/json/state` - Current light state
- `/json/info` - Device information
- `/json/eff` - Effects list
- `/json/pal` - Palettes list
- `/json/fxdata` - Effect metadata

## MQTT Control
**HTTP**: `POST http://[wled-ip]/json/state` with JSON payload  
**MQTT**: Publish JSON to `[deviceTopic]/api` topic

Example: `room1/api` ← JSON payload

## Effects List (Sample from Documentation)
From the sample response, effects include:
```json
[
  "Solid", "Blink", "Breathe", "Wipe", "Wipe Random", "Random Colors", "Sweep", "Dynamic", "Colorloop", "Rainbow",
  "Scan", "Dual Scan", "Fade", "Chase", "Chase Rainbow", "Running", "Saw", "Twinkle", "Dissolve", "Dissolve Rnd",
  "Sparkle", "Dark Sparkle", "Sparkle+", "Strobe", "Strobe Rainbow", "Mega Strobe", "Blink Rainbow", "Android", "Chase", "Chase Random",
  "Chase Rainbow", "Chase Flash", "Chase Flash Rnd", "Rainbow Runner", "Colorful", "Traffic Light", "Sweep Random", "Running 2", "Red & Blue","Stream",
  "Scanner", "Lighthouse", "Fireworks", "Rain", "Merry Christmas", "Fire Flicker", "Gradient", "Loading", "In Out", "In In",
  "Out Out", "Out In", "Circus", "Halloween", "Tri Chase", "Tri Wipe", "Tri Fade", "Lightning", "ICU", "Multi Comet",
  "Dual Scanner", "Stream 2", "Oscillate", "Pride 2015", "Juggle", "Palette", "Fire 2012", "Colorwaves", "BPM", "Fill Noise", "Noise 1",
  "Noise 2", "Noise 3", "Noise 4", "Colortwinkle", "Lake", "Meteor", "Smooth Meteor", "Railway", "Ripple"
]
```

**Note**: "Pride 2015" is index 63. "Pride 2025" may be a newer effect not in this list.

## Basic Commands

### Power Control
```json
{"on": true}        // Turn on
{"on": false}       // Turn off  
{"on": "t"}         // Toggle
```

### Brightness Control
```json
{"bri": 255}        // Full brightness
{"bri": 128}        // Half brightness
{"bri": 0}          // Minimum (use on:false instead)
```

### Color Control
```json
{"seg":[{"col":[[255,0,0]]}]}           // Red
{"seg":[{"col":[[0,255,0]]}]}           // Green
{"seg":[{"col":[[255,255,255]]}]}       // White
{"seg":[{"col":[["FF0000"]]}]}          // Red (hex format)
```

### Effect Control
```json
{"seg":[{"fx": 63}]}                    // Pride 2015 effect
{"seg":[{"fx": 0}]}                     // Solid effect
{"seg":[{"fx": "r"}]}                   // Random effect
```

### Advanced Effect Control
```json
{
  "seg": [{
    "fx": 63,           // Effect ID
    "sx": 128,          // Speed (0-255)
    "ix": 128,          // Intensity (0-255) 
    "pal": 0            // Palette ID
  }]
}
```

### Combined Commands
```json
{
  "on": true,
  "bri": 200,
  "seg": [{
    "fx": 63,
    "col": [[255, 100, 0]],
    "sx": 100,
    "ix": 150
  }]
}
```

## Segment Control

### Multiple Segments
```json
{
  "seg": [
    {"id": 0, "col": [[255,0,0]], "fx": 22},    // Segment 0: Red with effect 22
    {"id": 1, "col": [[0,255,0]], "fx": 45}     // Segment 1: Green with effect 45
  ]
}
```

### Individual LED Control
```json
{"seg":{"i":["FF0000","00FF00","0000FF"]}}      // First 3 LEDs: Red, Green, Blue
{"seg":{"i":[0,"FF0000",2,"00FF00",4,"0000FF"]}} // LEDs 0,2,4: Red, Green, Blue
{"seg":{"i":[0,8,"FF0000",10,18,"0000FF"]}}     // LEDs 0-7: Red, LEDs 10-17: Blue
```

## Effect Parameters

### Speed and Intensity
```json
{"seg":[{"sx": 50}]}        // Slow speed
{"seg":[{"ix": 200}]}       // High intensity
{"seg":[{"sx": "~10"}]}     // Increase speed by 10
{"seg":[{"ix": "~-20"}]}    // Decrease intensity by 20
```

### Custom Sliders (Effect-Dependent)
```json
{"seg":[{"c1": 128}]}       // Custom slider 1
{"seg":[{"c2": 64}]}        // Custom slider 2
{"seg":[{"c3": 16}]}        // Custom slider 3
```

### Effect Options (Effect-Dependent)
```json
{"seg":[{"o1": true}]}      // Option 1 enabled
{"seg":[{"o2": false}]}     // Option 2 disabled
{"seg":[{"o3": true}]}      // Option 3 enabled
```

## Palette Control
```json
{"seg":[{"pal": 11}]}       // Rainbow palette
{"seg":[{"pal": "r"}]}      // Random palette
{"seg":[{"pal": "~"}]}      // Next palette
{"seg":[{"pal": "~-"}]}     // Previous palette
```

## Advanced Features

### Nightlight
```json
{
  "nl": {
    "on": true,         // Enable nightlight
    "dur": 60,          // Duration in minutes
    "mode": 1,          // Mode: 0=instant, 1=fade, 2=color fade, 3=sunrise
    "tbri": 10          // Target brightness
  }
}
```

### Playlists
```json
{
  "playlist": {
    "ps": [26, 20, 18, 20],         // Preset IDs
    "dur": [30, 20, 10, 50],        // Duration for each (tenths of seconds)
    "transition": 0,                 // Transition time
    "repeat": 10,                   // Repeat count (0 = infinite)
    "end": 21                       // Final preset after playlist
  }
}
```

### Presets
```json
{"ps": 5}              // Load preset 5
{"psave": 3}           // Save current state to preset 3
{"pdel": 7}            // Delete preset 7
{"ps": "1~6~"}         // Cycle through presets 1-6
```

## Useful Shortcuts

### Quick Effects
```json
{"seg":[{"fx": 0}]}     // Solid color
{"seg":[{"fx": 9}]}     // Rainbow
{"seg":[{"fx": 63}]}    // Pride 2015
{"seg":[{"fx": 46}]}    // Fire Flicker
{"seg":[{"fx": 42}]}    // Fireworks
```

### Quick Colors  
```json
{"seg":[{"col":[[255,0,0]]}]}       // Red
{"seg":[{"col":[[0,255,0]]}]}       // Green  
{"seg":[{"col":[[0,0,255]]}]}       // Blue
{"seg":[{"col":[[255,255,255]]}]}   // White
{"seg":[{"col":[[255,165,0]]}]}     // Orange
{"seg":[{"col":[[128,0,128]]}]}     // Purple
```

### Hotel Room Presets (Examples)
```json
{"on":true,"bri":80,"seg":[{"fx":0,"col":[[255,220,180]]}]}     // Warm reading light
{"on":true,"bri":255,"seg":[{"fx":0,"col":[[255,255,255]]}]}    // Bright white
{"on":true,"bri":30,"seg":[{"fx":63}]}                          // Mood lighting (Pride 2015)
{"on":true,"bri":150,"seg":[{"fx":46}]}                         // Ambient (Fire Flicker)
{"on":false}                                                    // Off
```

## How to Find "Pride 2025" Effect

Since "Pride 2025" isn't in the sample effects list, it may be:
1. **Added in newer WLED versions** - check `/json/eff` on your device
2. **Custom effect** - may have different name
3. **Different index** - try indices 100-150 for newer effects

### To Get Current Effects List:
**HTTP**: `GET http://[wled-ip]/json/eff`  
**MQTT**: Subscribe to status updates or query via HTTP

### To Test Effect Numbers:
Try these ranges for "Pride 2025":
- 95-110 (around Pride 2015 area)
- 115-130 (newer effects area)
- 140-160 (latest effects)

## MQTT Topics Summary

| Topic | Purpose | Example Payload |
|-------|---------|-----------------|
| `room1` | Basic control | `"ON"`, `"OFF"`, `"T"`, `128` |
| `room1/col` | Color only | `"#FF0000"`, `"#00FF00"` |
| `room1/api` | Full API | `{"seg":[{"fx":63}]}` |
| `room1/g` | Status: Brightness | `128` (published by WLED) |
| `room1/c` | Status: Color | `"#FF0000"` (published by WLED) |
| `room1/v` | Status: Full | XML state (published by WLED) |

## Error Handling
- Invalid JSON: Command ignored
- Invalid effect ID: Falls back to Solid (fx: 0)
- Invalid color: Falls back to previous color
- Out of range values: Clamped to valid range

## Security Notes
- **WLED does not support MQTT over TLS** (as of v0.8.0+)
- Use on trusted networks only
- Username/password supported but transmitted unencrypted
- Consider network isolation for production deployments

---

*This reference enables complete control of WLED devices via HTTP or MQTT using the same JSON API commands.*
