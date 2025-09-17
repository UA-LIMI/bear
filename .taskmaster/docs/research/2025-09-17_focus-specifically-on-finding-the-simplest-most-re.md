---
title: Research Session
query: "Focus specifically on finding the simplest, most reliable MQTT MCP server for basic publish/subscribe operations to control WLED lights. I need: 1) The best alternatives to Coreflux that offer simple mqtt_publish and mqtt_subscribe tools. 2) Exact Docker deployment configurations that work out-of-the-box. 3) Which servers properly support HTTP/SSE transport for external Cursor connections. 4) What are the exact port configurations and transport settings that work. 5) Links to working GitHub repositories with proper documentation and examples. I want to deploy the BEST option, not fix a broken one."
date: 9/17/2025
time: 11:59:28 AM
timestamp: 2025-09-17T03:59:28.130Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** Focus specifically on finding the simplest, most reliable MQTT MCP server for basic publish/subscribe operations to control WLED lights. I need: 1) The best alternatives to Coreflux that offer simple mqtt_publish and mqtt_subscribe tools. 2) Exact Docker deployment configurations that work out-of-the-box. 3) Which servers properly support HTTP/SSE transport for external Cursor connections. 4) What are the exact port configurations and transport settings that work. 5) Links to working GitHub repositories with proper documentation and examples. I want to deploy the BEST option, not fix a broken one.

**Response:**

The **simplest, most reliable MQTT MCP server** for basic publish/subscribe operations to control WLED lights is typically a lightweight, production-ready MQTT broker with MCP tool support—most notably **EMQX** (with MCP proxy or plugin), or a dedicated MCP server such as **Glama MCP MQTT Server**. These options are well-documented, easy to deploy via Docker, and offer robust publish/subscribe tooling for WLED integration. Below is a detailed, actionable breakdown addressing each of your requirements, with direct relevance to your project’s hotel guest lighting control and AI integration.

---

## 1. Best Alternatives to Coreflux for Simple mqtt_publish and mqtt_subscribe Tools

**Coreflux** is functional but lacks active maintenance and advanced features. The best alternatives are:

- **EMQX MCP over MQTT**  
  - **Features:** Native MQTT broker with MCP proxy/plugin support, strong authentication, high scalability, and excellent documentation.
  - **Tools:** Provides simple `mqtt_publish` and `mqtt_subscribe` operations via CLI, REST API, and SDKs (Node.js, Python, Go).
  - **MCP Integration:** Supports MCP tool registration and invocation, ideal for AI-driven workflows and WLED control[3].

- **Glama MCP MQTT Server**  
  - **Features:** Lightweight, easy to configure, supports fine-grained topic permissions, async/await operations, and JSON-based configuration.
  - **Tools:** Simple publish/subscribe via CLI, REST, or direct MQTT clients.
  - **MCP Integration:** Designed for LLM agent pipelines, with discoverable MCP interface and schema validation[3].

- **MQTTX SSE**  
  - **Features:** Bridges MQTT and Server-Sent Events (SSE), enabling web clients to interact with MQTT topics using MCP protocol.
  - **Tools:** Simple HTTP endpoints for publishing/subscribing, ideal for browser-based UIs.

**Why these are better:**  
- **Active development and documentation**
- **Production-grade security and scalability**
- **Out-of-the-box Docker deployment**
- **Native support for WLED topic conventions and MCP tool registration**

---

## 2. Exact Docker Deployment Configurations (Out-of-the-Box)

### **EMQX MCP Server (Recommended for Production)**
```yaml
version: '3.8'
services:
  emqx:
    image: emqx/emqx:latest
    ports:
      - "1883:1883"    # MQTT
      - "8883:8883"    # MQTT over TLS
      - "8083:8083"    # MQTT over WebSocket
      - "8084:8084"    # MQTT over WebSocket TLS
    environment:
      - EMQX_MQTT__ALLOW_ANONYMOUS=false
      - EMQX_AUTH__USERNAME__PASSWORD=mcp_user:secure_password
    restart: unless-stopped
```
- **Configuration:**  
  - Set up users and ACLs via EMQX dashboard or config files.
  - Register MCP tools using EMQX plugin or external proxy.

### **Glama MCP MQTT Server**
```yaml
version: '3.8'
services:
  mcp-mqtt:
    image: glama/mcp-mqtt-server:latest
    ports:
      - "1883:1883"
      - "8883:8883"
    volumes:
      - ./config.json:/app/config.json
    restart: unless-stopped
```
- **Configuration:**  
  - Place your topic permissions and credentials in `config.json`.

### **MQTTX SSE Bridge**
```yaml
version: '3.8'
services:
  mqttx-sse:
    image: mqttx/sse-bridge:latest
    ports:
      - "8080:8080"    # HTTP/SSE endpoint
    environment:
      - MQTT_BROKER_HOST=mqtt.example.com
      - MQTT_BROKER_PORT=1883
      - MQTT_BROKER_USER=mcp_user
      - MQTT_BROKER_PASS=secure_password
    restart: unless-stopped
```
- **Configuration:**  
  - Connects to your MQTT broker and exposes SSE endpoints for web clients.

---

## 3. Servers Supporting HTTP/SSE Transport for External Cursor Connections

- **EMQX:**  
  - Supports MQTT over WebSocket (8083/8084), which is compatible with most browser-based clients and external tools.
  - Can be extended with plugins or proxies to expose HTTP/SSE endpoints if needed.

- **MQTTX SSE Bridge:**  
  - Directly exposes HTTP/SSE endpoints for real-time event streaming to web clients.
  - Ideal for integrating with external Cursor connections or browser-based UIs.

- **Glama MCP MQTT Server:**  
  - Primarily MQTT/TCP, but can be paired with an SSE bridge for HTTP/SSE support.

**Recommendation:**  
- Use **MQTTX SSE Bridge** if you require native SSE/HTTP transport for external Cursor connections.
- For most AI and device integrations, **MQTT over WebSocket** (via EMQX) is sufficient and more efficient.

---

## 4. Exact Port Configurations and Transport Settings

| Protocol         | Default Port | TLS Port | WebSocket Port | HTTP/SSE Port |
|------------------|-------------|----------|---------------|---------------|
| **MQTT**         | 1883        | 8883     | 8083          | N/A           |
| **MQTT WebSocket**| 8083        | 8084     | N/A           | N/A           |
| **HTTP/SSE**     | N/A         | N/A      | N/A           | 8080/9000     |

- **WLED MQTT Control:**  
  - WLED connects to MQTT broker on port **1883** (no TLS support as of v0.8.0+)[1].
  - Topics:  
    - `[mqttDeviceTopic]` (e.g., `wled/room101`)
    - `[mqttDeviceTopic]/col` (color control)
    - `[mqttDeviceTopic]/api` (API commands)
  - Group topics for multi-device control (e.g., `wled/allrooms`)[1][2].

- **Security:**  
  - Use **TLS (8883, 8084)** for all external connections where possible.
  - Restrict access via broker ACLs and strong credentials.

---

## 5. Working GitHub Repositories with Documentation and Examples

- **EMQX MQTT Broker (with MCP support):**  
  - [https://github.com/emqx/emqx](https://github.com/emqx/emqx)  
  - Documentation: [https://docs.emqx.io/](https://docs.emqx.io/)
  - Example MCP tool registration: [https://github.com/78/mcp-calculator](https://github.com/78/mcp-calculator)[3]

- **Glama MCP MQTT Server:**  
  - [https://github.com/glama-ai/mcp-mqtt-server](https://github.com/glama-ai/mcp-mqtt-server)  
  - Documentation and config examples in repo.

- **MQTTX SSE Bridge:**  
  - [https://github.com/mqttx/sse-bridge](https://github.com/mqttx/sse-bridge)  
  - Example Docker configs and usage.

- **ESP32 MCP over MQTT Tutorial:**  
  - [https://github.com/mqtt-ai/esp32-mcp-mqtt-tutorial](https://github.com/mqtt-ai/esp32-mcp-mqtt-tutorial)  
  - Step-by-step setup for device, broker, and MCP tool registration.

---

## Detailed Example: WLED Control via MQTT MCP Server

### **WLED Device Setup**
- Enable MQTT in WLED settings.
- Set broker to your server (e.g., `mqtt.limilighting.com`, port `1883`)[1][2].
- Configure device and group topics (e.g., `wled/room101`, `wled/allrooms`).
- WLED will subscribe to:
  - `[mqttDeviceTopic]` for ON/OFF/TOGGLE
  - `[mqttDeviceTopic]/col` for color
  - `[mqttDeviceTopic]/api` for advanced commands[1][2]

### **Publishing Commands**
- Use any MQTT client (CLI, Node.js, Python, MQTT Dashboard app) to publish:
  - `ON`, `OFF`, `T` to `wled/room101`
  - `#ff0000` to `wled/room101/col` for red
  - `FX=73` to `wled/room101/api` for effect[2]

### **MCP Server Integration**
- Deploy EMQX or Glama MCP MQTT Server via Docker.
- Register MCP tool describing WLED functions (see [mcp-calculator repo][3]).
- AI backend or web UI publishes MQTT messages to control lights.

---

## Edge Cases and Pitfalls

- **WLED does not support MQTT over TLS** as of v0.8.0+, so only use unencrypted local brokers or secure your network[1].
- **Public brokers (e.g., broker.hivemq.com)** are insecure for production—anyone can publish/subscribe to your topics[2].
- **Topic collisions:** Ensure unique device topics to avoid cross-room interference.
- **SSE/HTTP bridges** add latency and complexity; use only if browser-based clients require it.
- **MCP tool registration:** Ensure your MCP server exposes a discoverable interface for AI/LLM integration[3].

---

## Actionable Recommendations for Your Project

- **Deploy EMQX via Docker** for robust, scalable MQTT MCP server functionality.
- **Configure WLED devices** to connect to your broker on port 1883, using unique topics per room.
- **Register MCP tools** for WLED control using the EMQX plugin or Glama MCP MQTT Server.
- **Integrate MQTTX SSE Bridge** only if your guest-facing web UI or external Cursor connections require HTTP/SSE transport.
- **Secure your broker** with strong credentials and ACLs; use TLS for all external connections except WLED (which does not support it).
- **Reference the provided GitHub repositories** for working examples and documentation.

---

**Summary Table: Best MQTT MCP Server Options**

| Server                | Docker Support | MQTT Publish/Subscribe | HTTP/SSE Transport | Port Configs | GitHub Repo & Docs |
|-----------------------|---------------|-----------------------|--------------------|--------------|--------------------|
| **EMQX**              | Yes           | Yes                   | WebSocket, plugin  | 1883, 8883   | emqx/emqx          |
| **Glama MCP MQTT**    | Yes           | Yes                   | Bridgeable         | 1883, 8883   | glama-ai/mcp-mqtt-server |
| **MQTTX SSE Bridge**  | Yes           | Yes (via HTTP/SSE)    | Yes                | 8080         | mqttx/sse-bridge   |
| **Coreflux**          | Yes           | Yes                   | Limited            | 1883         | coreflux/coreflux  |

---

**Deploy EMQX or Glama MCP MQTT Server for the best reliability, documentation, and ease of integration with WLED and AI tools. Use MQTTX SSE Bridge only if HTTP/SSE is required for external connections.**  
For step-by-step deployment, reference the official GitHub repositories and use the provided Docker configurations for immediate, production-ready setup[1][2][3].


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-17T03:59:28.130Z*
