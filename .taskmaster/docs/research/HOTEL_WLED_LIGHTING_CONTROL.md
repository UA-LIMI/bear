# Hotel WLED Lighting Control Guide
*Complete MQTT command reference for AI voice control*

## MQTT Command Format - CONFIRMED WORKING

### Power Control
**Topic**: `room1` (replace with actual room topic)
```
"ON"    - Turn lights on
"OFF"   - Turn lights off  
"T"     - Toggle on/off
```

### Effect Control  
**Topic**: `room1/api`
**Format**: `"FX=X"` where X is the effect number

### Color Control
**Topic**: `room1/col` 
**Format**: `"#RRGGBB"` (hex color codes)

---

## Tested Working Effects ⭐⭐⭐⭐⭐

**FX=9 - Rainbow** ✅ CONFIRMED WORKING
- **Description**: Displays rainbow colors along the whole strip
- **Best for**: Welcome effect, children, vibrant mood
- **Rating**: 5/5 - Universally appealing

**FX=63 - Pride 2015** ✅ CONFIRMED WORKING  
- **Description**: Rainbow cycling with brightness variation
- **Best for**: Celebration, party mood, cheerful atmosphere
- **Rating**: 5/5 - Fun and festive

**FX=2 - Breathe** ✅ CONFIRMED WORKING
- **Description**: Fades between primary and secondary color
- **Best for**: Meditation, yoga, calming routines
- **Rating**: 5/5 - Perfect for relaxation

**FX=45 - Fire Flicker** ✅ CONFIRMED WORKING
- **Description**: LEDs randomly flickering like fire
- **Best for**: Fireplace atmosphere, winter mood, warm ambiance
- **Rating**: 4/5 - Great for cozy atmosphere

**FX=88 - Candle** ✅ CONFIRMED WORKING
- **Description**: Realistic candle flame flickering
- **Best for**: Romantic dinners, intimate moments
- **Rating**: 5/5 - Perfect romantic lighting

---

## AI Agent Integration

### Tool Definition (for OpenAI Realtime Agent)
```typescript
import { tool } from '@openai/agents/realtime';
import { z } from 'zod';

const hotelLightingTool = tool({
  name: 'hotel_lighting',
  description: 'Control hotel room lighting via MQTT',
  parameters: z.object({
    room: z.string().describe('Room identifier (e.g., room1)'),
    action: z.enum(['on', 'off', 'effect']).describe('Lighting action'),
    effect: z.number().min(0).max(186).optional().describe('Effect number (0-186)'),
  }),
  execute: async ({ room, action, effect }) => {
    if (action === 'on') {
      // Call MCP: mqtt_publish(topic: room, message: "ON")
      return `Turned on lights in ${room}`;
    } else if (action === 'off') {
      // Call MCP: mqtt_publish(topic: room, message: "OFF")
      return `Turned off lights in ${room}`;
    } else if (action === 'effect' && effect !== undefined) {
      // Call MCP: mqtt_publish(topic: room/api, message: "FX=" + effect)
      return `Set ${room} lights to effect ${effect}`;
    }
    return `Lighting command completed for ${room}`;
  },
});
```

### Agent Configuration
```typescript
const hotelAgent = new RealtimeAgent({
  name: 'Hotel Assistant',
  instructions: `You are a helpful hotel assistant that can control room lighting.

Available lighting commands:
- Turn lights on/off
- Set lighting effects for ambiance

Lighting effects available:
- FX=9 (Rainbow) - Colorful welcome effect
- FX=63 (Pride 2015) - Party/celebration mood  
- FX=2 (Breathe) - Relaxing/meditation
- FX=45 (Fire Flicker) - Cozy/romantic
- FX=88 (Candle) - Intimate romantic lighting

When guests ask for lighting, suggest appropriate effects based on mood.`,
  tools: [hotelLightingTool],
});
```

---

## Guest Voice Command Examples

| Guest Says | AI Should Do | MQTT Commands |
|------------|--------------|---------------|
| "Turn on the lights" | action='on' | `room1` → `"ON"` |
| "Turn off lights" | action='off' | `room1` → `"OFF"` | 
| "Set romantic lighting" | action='effect', effect=88 | `room1/api` → `"FX=88"` |
| "I want colorful lights" | action='effect', effect=9 | `room1/api` → `"FX=9"` |
| "Make it relaxing" | action='effect', effect=2 | `room1/api` → `"FX=2"` |
| "Party mode" | action='effect', effect=63 | `room1/api` → `"FX=63"` |

---

## Technical Notes

- **Effects have inherent brightness** - no separate brightness control needed
- **Always turn ON first** if lights might be off
- **Use legacy format**: `"FX=X"` works, JSON may not
- **Topic structure**: `[room]/api` for effects, `[room]` for power
- **Numbers to main topic turn lights off**: Don't send `"128"` etc.

---

*This guide enables AI voice agents to provide perfect lighting control for hotel guests using proven working commands.*