---
title: Research Session
query: "Research comprehensive WLED API documentation and MQTT command reference. I need the complete list of WLED effects, including where to find the "pride2025" effect number. Also need all WLED MQTT topic structures and JSON API command formats for controlling lights, including: 1) Complete list of WLED effects with their index numbers, 2) JSON API command formats for effects, colors, brightness, segments, 3) Exact payload formats for the /api topic, 4) How to find or list available effects in WLED, 5) Complete WLED MQTT API reference with examples."
date: 9/17/2025
time: 12:13:06 PM
timestamp: 2025-09-17T04:13:06.847Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** Research comprehensive WLED API documentation and MQTT command reference. I need the complete list of WLED effects, including where to find the "pride2025" effect number. Also need all WLED MQTT topic structures and JSON API command formats for controlling lights, including: 1) Complete list of WLED effects with their index numbers, 2) JSON API command formats for effects, colors, brightness, segments, 3) Exact payload formats for the /api topic, 4) How to find or list available effects in WLED, 5) Complete WLED MQTT API reference with examples.

**Response:**

WLED provides a robust API and MQTT interface for real-time LED control, supporting granular commands for effects, colors, brightness, and segments. Below is a comprehensive, actionable reference tailored for advanced integration and automation scenarios, including effect indexing, JSON API formats, and MQTT topic structures.

---

## 1. Complete List of WLED Effects with Index Numbers (Including "pride2025")

**WLED effects** are indexed numerically, and each effect is referenced by its index in API and MQTT commands. The full, up-to-date list is maintained in the [WLED source code](https://github.com/Aircoookie/WLED/blob/main/wled00/FX.cpp) and is also available in the WLED UI under "Effects." As of WLED 0.14.x and later, the effect list includes "pride2025" and other recent additions.

**How to find the effect index for "pride2025":**
- The effect index is determined by its position in the internal effect array.
- You can retrieve the current effect list and their indices via the JSON API:  
  - Send a GET request to `/json/effects` on your WLED device (e.g., `http://[wled-ip]/json/effects`).
  - The response is an array of effect names; the array index is the effect number.
- For example, if "pride2025" is the 85th item in the array, its effect number is 84 (zero-based index).

**Example (abbreviated):**
```json
["Solid", "Blink", "Breathe", ..., "Pride 2025"]
```
If "Pride 2025" is at position 100, its effect number is 99.

**Direct reference:**  
- The [WLED FX.cpp source](https://github.com/Aircoookie/WLED/blob/main/wled00/FX.cpp) is the canonical list.
- The `/json/effects` endpoint is the recommended programmatic method.

---

## 2. JSON API Command Formats for Effects, Colors, Brightness, Segments

WLED's JSON API allows granular control via HTTP or MQTT by sending JSON payloads to the `/json` endpoint (HTTP) or `[mqttDeviceTopic]/api` (MQTT).

### **Set Effect**
```json
{
  "seg": [
    {
      "fx": 99  // Effect index for "pride2025"
    }
  ]
}
```

### **Set Color**
```json
{
  "seg": [
    {
      "col": [[255, 0, 0]]  // RGB for red
    }
  ]
}
```

### **Set Brightness**
```json
{
  "bri": 128  // Brightness 0-255
}
```

### **Set Multiple Segments**
```json
{
  "seg": [
    {"id": 0, "col": [[0,255,0]], "fx": 22},
    {"id": 1, "col": [[0,0,255]], "fx": 45}
  ]
}
```

### **Combined Example**
```json
{
  "on": true,
  "bri": 200,
  "seg": [
    {
      "id": 0,
      "col": [[255, 100, 0]],
      "fx": 99,
      "sx": 128,   // Effect speed
      "ix": 128    // Effect intensity
    }
  ]
}
```

**Notes:**
- `"on": true` turns the light on.
- `"fx"` is the effect index.
- `"sx"` and `"ix"` control effect speed and intensity (0-255).
- `"col"` is an array of RGB arrays (primary, secondary, tertiary colors).

---

## 3. Exact Payload Formats for the `/api` MQTT Topic

WLED supports both **legacy API** (key-value pairs) and **JSON API** payloads on the `[mqttDeviceTopic]/api` topic.

### **Legacy API (Key-Value)**
- Set effect:  
  `FX=99` (sets effect to index 99, e.g., "pride2025")
- Set brightness:  
  `A=128`
- Set color:  
  `CL=FF0000` (hex RGB)

### **JSON API**
- Send the same JSON as for the HTTP API, e.g.:
```json
{"seg":[{"fx":99}]}
```
- To set color and brightness together:
```json
{"bri":180,"seg":[{"col":[[0,255,200]]}]}
```

**How to send:**  
- Publish the payload to `[mqttDeviceTopic]/api` (e.g., `wled/room101/api`).

---

## 4. How to Find or List Available Effects in WLED

**Programmatic method:**
- HTTP GET `/json/effects` returns an array of effect names in order; the array index is the effect number.

**Manual method:**
- Open the WLED web UI, go to the "Effects" tab; the order matches the API indices.

**MQTT method:**
- There is no direct MQTT command to list effects; use the HTTP API for enumeration.

---

## 5. Complete WLED MQTT API Reference with Examples

### **MQTT Topics**

| Topic                        | Purpose                                      | Payload Example                |
|------------------------------|----------------------------------------------|--------------------------------|
| `[mqttDeviceTopic]`          | On/Off/Toggle/Brightness                     | `"ON"`, `"OFF"`, `"T"`, `128` |
| `[mqttDeviceTopic]/col`      | Set color (HEX or 32-bit DEC)                | `#FF0000`, `0xFF0000`          |
| `[mqttDeviceTopic]/api`      | API commands (legacy or JSON)                | `FX=99`, `{"bri":128}`         |
| `[mqttDeviceTopic]/g`        | Publishes current brightness                 | `128`                          |
| `[mqttDeviceTopic]/c`        | Publishes current color (HEX)                | `#FF0000`                      |
| `[mqttDeviceTopic]/v`        | Publishes XML API response                   | `<state>...</state>`           |

**Device and group topics** are set in WLED's Sync settings.  
- `[mqttDeviceTopic]` is unique per device (e.g., `wled/room101`)
- `[mqttGroupTopic]` is for group control (e.g., `wled/allrooms`)

### **MQTT Command Examples**

- **Turn on:**  
  Topic: `wled/room101`  
  Payload: `ON`

- **Set brightness:**  
  Topic: `wled/room101`  
  Payload: `200`

- **Set color (red):**  
  Topic: `wled/room101/col`  
  Payload: `#FF0000`

- **Set effect (pride2025, index 99):**  
  Topic: `wled/room101/api`  
  Payload: `FX=99`  
  or  
  Payload: `{"seg":[{"fx":99}]}`

- **Set color and effect via JSON:**  
  Topic: `wled/room101/api`  
  Payload: `{"seg":[{"col":[[0,255,200]],"fx":99}]}`

### **MQTT State Publishing**

- **Brightness:**  
  Topic: `wled/room101/g`  
  Payload: `128`

- **Color:**  
  Topic: `wled/room101/c`  
  Payload: `#FF0000`

- **Full state (XML):**  
  Topic: `wled/room101/v`  
  Payload: `<state>...</state>`

---

## Additional Integration Notes and Edge Cases

- **MQTT over TLS is not supported** as of WLED v0.8.0+; use only on trusted local networks[2].
- **Message size:** Limited by device RAM; avoid excessively large JSON payloads[2].
- **Effect indices:** Always zero-based; confirm via `/json/effects` for your firmware version.
- **Group topics:** Use `[mqttGroupTopic]` for multi-device control, but ensure topic uniqueness to avoid collisions[2].
- **No MQTT autodiscovery:** Home Assistant integration now uses native WLED integration, not MQTT autodiscovery[2].
- **Authentication:** Supported, but credentials are sent unencrypted[2].

---

## References for Further Detail

- **WLED MQTT Wiki:** Full topic and payload documentation[1][2].
- **WLED JSON API:** [Official documentation](https://kno.wled.ge/interfaces/json/) (for all JSON commands).
- **WLED Effects List:** `/json/effects` endpoint or [FX.cpp source](https://github.com/Aircoookie/WLED/blob/main/wled00/FX.cpp).
- **Community Examples:** [Home Assistant forum][3], [MCQN tutorial][4].

---

## Actionable Steps for Your Project

1. **Retrieve the effect list and indices** from `/json/effects` on each device to dynamically map effect names (like "pride2025") to their current index.
2. **Control WLED via MQTT** by publishing to `[mqttDeviceTopic]/api` using either legacy or JSON API formats as shown above.
3. **Integrate effect selection in your UI** by fetching `/json/effects` and presenting the names to users, mapping selection to the correct index.
4. **Document all MQTT topic structures and payloads** in your integration layer for maintainability and future-proofing.
5. **Test all commands** on your actual WLED firmware version, as effect indices and supported features may change between releases.

---

**This reference is designed for direct application in advanced hotel guest UI systems, enabling dynamic effect selection, real-time control, and robust automation via MQTT and WLED’s JSON API.**


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-17T04:13:06.847Z*
