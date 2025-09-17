---
title: Research Session
query: "Research OpenAI documentation on how MCP servers work with the realtime API. I need to understand: 1) How OpenAI's realtime agents connect to external MCP servers over the internet, 2) What transport protocols are used (WebSocket, HTTP, SSE), 3) What ports and connection methods are supported, 4) How authentication and security works for external MCP servers, 5) Whether MCP servers need to be publicly accessible on the internet, 6) The exact configuration patterns for connecting realtime agents to remote MCP servers, 7) How tool calls flow from OpenAI servers to external MCP servers. Focus on practical deployment patterns for production systems."
date: 9/17/2025
time: 2:47:27 PM
timestamp: 2025-09-17T06:47:27.301Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** Research OpenAI documentation on how MCP servers work with the realtime API. I need to understand: 1) How OpenAI's realtime agents connect to external MCP servers over the internet, 2) What transport protocols are used (WebSocket, HTTP, SSE), 3) What ports and connection methods are supported, 4) How authentication and security works for external MCP servers, 5) Whether MCP servers need to be publicly accessible on the internet, 6) The exact configuration patterns for connecting realtime agents to remote MCP servers, 7) How tool calls flow from OpenAI servers to external MCP servers. Focus on practical deployment patterns for production systems.

**Response:**

OpenAI’s realtime agents connect to external **MCP servers** over the internet using a standardized protocol that enables dynamic tool discovery and invocation, supporting production-grade extensibility for voice and multimodal agents. Below is a comprehensive, actionable breakdown addressing each aspect of your query, with practical deployment patterns and configuration examples relevant to your project’s integration and security needs.

---

## 1. **How OpenAI's Realtime Agents Connect to External MCP Servers**

- **Connection Mechanism:**  
  OpenAI’s Realtime API allows you to specify one or more MCP servers in the session configuration. The agent connects to these servers by referencing their URLs in the session payload. Once connected, the API automatically manages tool discovery and invocation, abstracting away manual integration logic[1][2][3].
- **Session Configuration Example:**
  ```json
  {
    "session": {
      "type": "realtime",
      "tools": [
        {
          "type": "mcp",
          "server_label": "hotel-mcp",
          "server_url": "https://mcp.hotel.example.com",
          "authorization": "{access_token}",
          "require_approval": "never"
        }
      ]
    }
  }
  ```
- **Automatic Tool Handling:**  
  After connection, the agent queries the MCP server for available tools and their schemas, then routes tool calls as needed[1][2][3].

---

## 2. **Transport Protocols Used (WebSocket, HTTP, SSE)**

- **Supported Protocols:**  
  MCP servers can be exposed over **HTTP(S)**, **WebSocket**, or **Server-Sent Events (SSE)**, depending on the server’s implementation and the session configuration[3].
- **Typical Patterns:**
  - **HTTP(S):** Most common for RESTful MCP servers; endpoints are called via standard POST/GET requests.
  - **WebSocket:** Used for persistent, bidirectional communication, enabling lower latency for tool calls and responses.
  - **SSE:** Supported for streaming responses from MCP servers, especially for long-running tool calls[3].
- **Configuration Example:**
  ```json
  {
    "server_url": "https://mcp.hotel.example.com/sse"
  }
  ```
  The protocol is inferred from the URL scheme and endpoint path.

---

## 3. **Ports and Connection Methods Supported**

- **Default Ports:**  
  - **HTTPS:** Port **443** (recommended for production)
  - **HTTP:** Port **80** (not recommended for sensitive data)
  - **Custom Ports:** Supported if specified in the MCP server URL (e.g., `https://mcp.hotel.example.com:8443`)
- **Connection Methods:**  
  - **Direct Internet Access:** MCP servers must be accessible from OpenAI’s cloud infrastructure, typically via public DNS and open firewall rules on the chosen port[1][2][3].
  - **TLS/SSL:** Strongly recommended for all production deployments to ensure encrypted transport.

---

## 4. **Authentication and Security for External MCP Servers**

- **Authentication Patterns:**
  - **Bearer Tokens:** Pass an `authorization` field in the session configuration, which is sent as an HTTP header or WebSocket auth payload to the MCP server[1][2][3].
  - **OAuth Access Tokens:** For third-party MCP servers (e.g., Stripe, Dropbox), use OAuth tokens in the `authorization` field[3].
  - **Custom Headers:** Some MCP servers may require additional headers or API keys; these can be configured in the session payload.
- **Security Best Practices:**
  - **TLS/SSL:** All MCP server endpoints should use HTTPS/WSS for encrypted transport.
  - **Short-Lived Tokens:** Use ephemeral, time-limited tokens for session authentication.
  - **IP Whitelisting:** Restrict MCP server access to OpenAI’s known IP ranges if possible.
  - **Audit Logging:** Log all tool calls and authentication events for traceability.
- **Example Configuration:**
  ```json
  {
    "server_url": "https://mcp.hotel.example.com",
    "authorization": "Bearer ek_abc123"
  }
  ```

---

## 5. **Public Accessibility Requirements for MCP Servers**

- **Public Internet Accessibility:**  
  MCP servers **must be publicly accessible** over the internet so that OpenAI’s cloud infrastructure can reach them. This means:
  - **Public DNS:** The server must have a resolvable domain name.
  - **Open Firewall:** The relevant port (typically 443 for HTTPS) must be open to inbound connections from OpenAI’s servers[1][2][3].
- **Security Considerations:**  
  - **Do not expose sensitive internal services directly;** use reverse proxies, API gateways, or dedicated MCP endpoints.
  - **Private MCP servers** (e.g., on a VPN or behind a firewall) are not supported unless you provide a public-facing proxy.

---

## 6. **Exact Configuration Patterns for Connecting Realtime Agents to Remote MCP Servers**

- **Session Payload Example (Realtime API):**
  ```json
  {
    "session": {
      "type": "realtime",
      "model": "gpt-realtime",
      "tools": [
        {
          "type": "mcp",
          "server_label": "hotel-mcp",
          "server_url": "https://mcp.hotel.example.com",
          "authorization": "Bearer ek_abc123",
          "require_approval": "never"
        }
      ]
    }
  }
  ```
- **RealtimeAgent SDK Example (JavaScript):**
  ```typescript
  import { RealtimeAgent } from '@openai/agents-realtime';

  const agent = new RealtimeAgent({
    name: 'Hotel Assistant',
    instructions: 'Assist guests and control hotel systems.',
    mcpServers: [
      {
        url: 'https://mcp.hotel.example.com',
        authorization: 'Bearer ek_abc123'
      }
    ]
  });
  ```
- **Tool Registration:**  
  The MCP server must expose a `/tools` endpoint (or similar) that returns a JSON schema describing available tools, their parameters, and execution handlers[3].

---

## 7. **Tool Call Flow: OpenAI Servers to External MCP Servers**

- **Step-by-Step Flow:**
  1. **Session Initialization:**  
     The agent session is created with MCP server details in the configuration payload.
  2. **Tool Discovery:**  
     OpenAI’s servers query the MCP server’s `/tools` endpoint to list available tools and their schemas[3].
  3. **User Input:**  
     The agent receives user input (voice, text, image).
  4. **Intent Matching:**  
     The model determines if a tool call is needed and selects the appropriate MCP tool.
  5. **Tool Invocation:**  
     OpenAI’s servers send a request to the MCP server’s tool endpoint (via HTTP, WebSocket, or SSE), passing the required parameters.
  6. **Tool Execution:**  
     The MCP server executes the tool logic (e.g., controls MQTT lighting, fetches data) and returns the result.
  7. **Response Handling:**  
     The agent receives the tool result and incorporates it into the conversation or action flow.
- **Example Output Items:**
  - `mcp_list_tools`: Lists available tools and schemas.
  - `mcp_call`: Shows the tool invocation and returned output[3].

---

## **Practical Deployment Patterns for Production Systems**

### **Recommended MCP Server Architecture**
- **Containerized Deployment:**  
  Use Docker to package your MCP server (e.g., Node.js/Express, Python/Flask) for portability and scalability.
- **API Gateway:**  
  Place an API gateway (e.g., NGINX, AWS API Gateway) in front of your MCP server for SSL termination, rate limiting, and request validation.
- **Authentication:**  
  Require Bearer tokens or OAuth for all incoming requests; validate tokens on each tool call.
- **Tool Schema Endpoint:**  
  Expose a `/tools` endpoint returning JSON schemas for all available tools.
- **Tool Execution Endpoint:**  
  Expose `/tool/{tool_name}` endpoints for executing tool logic (e.g., MQTT lighting control).
- **Audit Logging:**  
  Log all tool calls, authentication attempts, and errors for compliance and debugging.

### **Example: MCP Server for MQTT Lighting Control**
```javascript
// Express MCP server skeleton
const express = require('express');
const app = express();
app.use(express.json());

app.get('/tools', (req, res) => {
  res.json([
    {
      name: 'set_lighting',
      description: 'Control hotel room lighting via MQTT',
      input_schema: {
        type: 'object',
        properties: {
          room: { type: 'string' },
          state: { type: 'string', enum: ['on', 'off'] },
          brightness: { type: 'number' }
        },
        required: ['room', 'state']
      }
    }
  ]);
});

app.post('/tool/set_lighting', authenticate, async (req, res) => {
  // MQTT logic here
  res.json({ result: `Lighting in room ${req.body.room} set to ${req.body.state}` });
});

function authenticate(req, res, next) {
  // Validate Bearer token from Authorization header
  next();
}

app.listen(443, () => console.log('MCP server running on port 443'));
```

---

## **Edge Cases and Pitfalls**

- **Token Expiry:**  
  Ephemeral tokens (`ek_...`) expire quickly; ensure your backend refreshes them and handles reconnection logic gracefully[1].
- **Network Latency:**  
  Place MCP servers geographically close to OpenAI’s infrastructure or use CDN/proxying to minimize latency.
- **Firewall Issues:**  
  Ensure ports are open and accessible; test connectivity from external locations.
- **Schema Mismatches:**  
  Tool schemas must strictly follow JSON Schema standards; mismatches can cause tool discovery failures.
- **Authentication Failures:**  
  Log and alert on failed authentication attempts; rotate tokens regularly.

---

## **Summary Table: MCP Server Integration Patterns**

| Aspect                | Details/Options                                                                 |
|-----------------------|--------------------------------------------------------------------------------|
| **Transport Protocol**| HTTPS (443), HTTP (80), WebSocket, SSE                                         |
| **Authentication**    | Bearer token, OAuth access token, custom headers                               |
| **Accessibility**     | Publicly accessible over internet, open firewall, valid DNS                    |
| **Tool Discovery**    | `/tools` endpoint returns JSON schema                                          |
| **Tool Execution**    | `/tool/{tool_name}` endpoint, accepts POST with parameters                     |
| **Security**          | TLS/SSL, short-lived tokens, audit logging, rate limiting                      |
| **Session Config**    | Specify MCP server in `tools` array of session payload                         |
| **Error Handling**    | Token expiry, network issues, schema mismatches, authentication failures       |

---

## **Actionable Steps for Your Project**

1. **Deploy your Redis MCP server** on a public VPS, ensuring HTTPS and open port 443.
2. **Expose `/tools` and `/tool/{tool_name}` endpoints** with strict JSON schema validation.
3. **Implement Bearer token authentication** using ephemeral keys generated by your backend.
4. **Configure your OpenAI RealtimeAgent** with the MCP server URL and authorization token.
5. **Test tool discovery and invocation** end-to-end, including error and reconnection handling.
6. **Monitor and log all tool calls** for security and compliance.
7. **Review OpenAI’s official MCP and Realtime API docs** for updates and advanced patterns[1][2][3].

This approach ensures robust, secure, and scalable integration of external MCP servers with OpenAI’s realtime agents, supporting dynamic tool invocation and production-grade reliability.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-17T06:47:27.301Z*
