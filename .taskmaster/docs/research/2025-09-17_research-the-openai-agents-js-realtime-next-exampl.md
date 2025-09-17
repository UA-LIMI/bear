---
title: Research Session
query: "Research the OpenAI Agents JS realtime-next example repository at https://github.com/openai/openai-agents-js/tree/main/examples/realtime-next. I need comprehensive analysis of: 1) The complete architecture and file structure of this Next.js realtime voice example, 2) How it implements tool calling and MCP server integration, 3) The exact patterns for integrating custom tools like our MQTT lighting control, 4) How to configure external MCP servers and tool registration, 5) Code patterns for tool discovery and real-time voice integration, 6) How it handles frontend-backend communication for voice + tools, 7) Security patterns and authentication flows. Focus on actionable implementation details for integrating our lighting control."
date: 9/17/2025
time: 2:35:15 PM
timestamp: 2025-09-17T06:35:15.371Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** Research the OpenAI Agents JS realtime-next example repository at https://github.com/openai/openai-agents-js/tree/main/examples/realtime-next. I need comprehensive analysis of: 1) The complete architecture and file structure of this Next.js realtime voice example, 2) How it implements tool calling and MCP server integration, 3) The exact patterns for integrating custom tools like our MQTT lighting control, 4) How to configure external MCP servers and tool registration, 5) Code patterns for tool discovery and real-time voice integration, 6) How it handles frontend-backend communication for voice + tools, 7) Security patterns and authentication flows. Focus on actionable implementation details for integrating our lighting control.

**Response:**

The **OpenAI Agents JS realtime-next example** demonstrates a modern, production-grade pattern for building real-time voice agents with tool-calling and MCP (Model Context Protocol) server integration using Next.js and the OpenAI Agents SDK. Below is a comprehensive, actionable analysis tailored for your project, with a focus on integrating custom tools such as MQTT-based lighting control.

---

## 1. **Architecture and File Structure**

The `realtime-next` example is a **Next.js TypeScript app** structured for clarity and extensibility. Its architecture is typical for modern agentic voice apps:

- **Frontend (Next.js):**
  - Handles UI, voice capture, and agent session management.
  - Integrates with the OpenAI Realtime API via ephemeral tokens.
  - Discovers and invokes tools via the agent SDK.

- **Backend (API routes):**
  - Provides secure endpoints for ephemeral key (client secret) generation.
  - Optionally acts as a proxy for tool execution or MCP server registration.

**Key file structure:**
```
examples/realtime-next/
├── .gitignore
├── README.md
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── client-secret/route.ts   # API route for ephemeral key
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── guest/page.tsx
│   │   ├── layout.tsx
│   │   ├── mobile/page.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── VoiceConnection.tsx         # Main voice agent UI logic
│   │   └── ui/                         # UI primitives
│   └── lib/
│       ├── apiClient.ts                # API client utilities
│       └── utils.ts
├── tsconfig.json
└── vercel.json
```
- **`src/app/api/client-secret/route.ts`**: Secure backend endpoint for ephemeral key generation.
- **`src/components/VoiceConnection.tsx`**: Core React component for managing the voice agent session, audio, and tool events.
- **`src/lib/apiClient.ts`**: Utility for calling backend APIs (e.g., ephemeral key endpoint).

---

## 2. **Tool Calling and MCP Server Integration**

**Tool calling** is implemented using the OpenAI Agents SDK's `tool()` abstraction. Tools can be local (executed in the browser or backend) or remote (via MCP servers).

- **Local tool example:**
  ```typescript
  import { tool } from '@openai/agents-realtime';

  const getWeatherTool = tool({
    name: 'get_weather',
    description: 'Get the weather for a given city',
    parameters: z.object({ city: z.string() }),
    execute: async (input) => {
      // Custom logic here
      return `The weather in ${input.city} is sunny`;
    },
  });
  ```

- **MCP server integration**: The agent can discover and call tools registered on an external MCP server. The MCP protocol allows tools to be registered, discovered, and invoked over HTTP or WebSocket, enabling decoupled, scalable tool hosting[2][6].

  - **Agent configuration** includes MCP server URLs for tool discovery.
  - **Tool calls** are routed to the MCP server, which executes the tool and returns results.

---

## 3. **Integrating Custom Tools (e.g., MQTT Lighting Control)**

To integrate a custom tool like **MQTT lighting control**, you have two main options:

### **A. Local Tool (Direct Integration)**
If your MQTT logic can run in the backend (Node.js), define a tool as follows:

```typescript
import { tool } from '@openai/agents-realtime';
import mqtt from 'mqtt';

const mqttClient = mqtt.connect('mqtt://broker-address');

const lightingControlTool = tool({
  name: 'set_lighting',
  description: 'Control hotel room lighting via MQTT',
  parameters: z.object({
    room: z.string(),
    state: z.enum(['on', 'off']),
    brightness: z.number().optional(),
    color: z.string().optional(),
  }),
  execute: async ({ room, state, brightness, color }) => {
    const topic = `hotel/room/${room}/lighting`;
    const payload = JSON.stringify({ state, brightness, color });
    mqttClient.publish(topic, payload);
    return `Lighting in room ${room} set to ${state}`;
  },
});
```
- Register this tool with your agent instance.

### **B. MCP Tool (External Server)**
If you want to decouple tool execution (recommended for scalability/security), implement an **MCP server** that exposes your MQTT lighting control as an HTTP/WebSocket endpoint.

- **MCP server** receives tool calls, executes MQTT logic, and returns results.
- Register the MCP server with your agent (see below).

---

## 4. **Configuring External MCP Servers and Tool Registration**

**MCP server configuration** is handled in the agent setup:

```typescript
import { RealtimeAgent } from '@openai/agents-realtime';

const agent = new RealtimeAgent({
  name: 'Hotel Assistant',
  instructions: 'You control hotel lighting and answer guest questions.',
  mcpServers: [
    {
      url: 'https://your-mcp-server.example.com', // Your MCP server endpoint
      // Optionally, authentication headers or tokens
    },
  ],
});
```
- **Tool registration**: Your MCP server must implement the MCP tool registration protocol (see [OpenAI MCP docs][6]). Each tool exposes a JSON schema for parameters and a handler for execution.
- **Discovery**: The agent will automatically discover tools from the MCP server at startup or on demand.

---

## 5. **Code Patterns for Tool Discovery and Real-Time Voice Integration**

**Tool discovery** is automatic when using MCP servers. The agent queries the MCP server for available tools and their schemas.

**Voice integration** uses the `RealtimeSession` class:

```typescript
import { RealtimeSession } from '@openai/agents-realtime';

// Assume agent is already configured with tools/MCP servers
const session = new RealtimeSession(agent);

// Connect using ephemeral key from backend
await session.connect({ apiKey: ephemeralKey });

// Listen for tool calls and results
session.on('toolCall', (toolCall) => {
  // Optionally handle tool call events (for logging, UI, etc.)
});
```
- **Audio I/O** is handled automatically by the SDK (WebRTC, Opus codec).
- **Tool calls** are triggered by the agent when user intent matches a tool schema.

---

## 6. **Frontend-Backend Communication for Voice + Tools**

**Frontend**:
- Requests an ephemeral key from `/api/client-secret` before starting a session.
- Instantiates the agent and session, passing the ephemeral key.
- Handles UI, microphone permissions, and session state.

**Backend**:
- Implements `/api/client-secret` route to generate ephemeral keys securely (never expose your OpenAI API key to the frontend).
- Optionally proxies tool calls or acts as an MCP server for local tools.

**Example flow:**
1. User opens the app, frontend requests ephemeral key.
2. Frontend creates agent/session, connects to OpenAI Realtime API.
3. User speaks; audio is streamed to the agent.
4. Agent processes input, may call tools (local or via MCP).
5. Tool results are returned and spoken to the user.

---

## 7. **Security Patterns and Authentication Flows**

**Critical security practices:**
- **Ephemeral key generation**: Only the backend holds the OpenAI API key. The frontend requests short-lived ephemeral keys for each session[6].
- **Rate limiting and input validation**: Backend endpoints are protected with rate limiting and schema validation.
- **Audit logging**: All ephemeral key requests and tool calls are logged for traceability.
- **No API keys in frontend**: Only ephemeral keys are ever sent to the browser.
- **WebRTC encryption**: All audio streams are encrypted (DTLS-SRTP).
- **Origin validation**: Backend checks the `Origin` header to prevent CSRF.

**Authentication flow:**
- User must be authenticated (e.g., JWT, session cookie) before requesting an ephemeral key.
- Backend verifies user, generates ephemeral key, and returns it.
- Optionally, MCP servers can require authentication tokens for tool calls.

---

## **Actionable Steps for Integrating MQTT Lighting Control**

1. **Decide on tool hosting**:
   - For rapid prototyping, implement as a local tool in your backend.
   - For production, expose lighting control via an MCP server (Node.js/Express or Python/Flask) that handles MQTT logic.

2. **Implement the tool**:
   - Define the tool schema (parameters, description).
   - Implement the handler to publish MQTT messages.

3. **Register the tool**:
   - If local, add it to your agent's `tools` array.
   - If remote, ensure your MCP server registers the tool and exposes the correct schema.

4. **Configure the agent**:
   - Add the MCP server URL to the agent config.
   - Test tool discovery by querying the agent for available tools.

5. **Secure the system**:
   - Protect all backend endpoints with authentication and rate limiting.
   - Ensure ephemeral keys are short-lived and single-use.

6. **Test end-to-end**:
   - Use the voice UI to issue lighting commands (e.g., "Turn on the lights in room 101").
   - Verify MQTT messages are sent and lighting state changes.

---

## **References for Further Implementation**

- [OpenAI Agents SDK Documentation][4]
- [Voice Agents Guide][6]
- [MCP Protocol Reference][6]
- [OpenAI Realtime API Security Patterns][1][6]

---

**This architecture and pattern will allow you to build a robust, secure, and extensible real-time voice agent system with seamless tool integration, including MQTT-based hotel lighting control.**


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-17T06:35:15.371Z*
