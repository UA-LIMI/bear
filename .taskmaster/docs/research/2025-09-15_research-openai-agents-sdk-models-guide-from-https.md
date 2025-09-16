---
title: Research Session
query: "Research OpenAI Agents SDK Models Guide from https://openai.github.io/openai-agents-js/guides/models/ for September 2025. Extract comprehensive information about: 1) Available models for realtime voice (gpt-realtime, gpt-4-realtime), 2) Model configuration options and parameters, 3) Model selection best practices, 4) Performance characteristics and limitations, 5) Pricing and usage considerations, 6) Integration patterns with RealtimeAgent, 7) Model-specific features and capabilities, 8) Compatibility with different transport layers. Focus on practical implementation details and code examples."
date: 9/16/2025
time: 6:04:52 AM
timestamp: 2025-09-15T22:04:52.782Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** Research OpenAI Agents SDK Models Guide from https://openai.github.io/openai-agents-js/guides/models/ for September 2025. Extract comprehensive information about: 1) Available models for realtime voice (gpt-realtime, gpt-4-realtime), 2) Model configuration options and parameters, 3) Model selection best practices, 4) Performance characteristics and limitations, 5) Pricing and usage considerations, 6) Integration patterns with RealtimeAgent, 7) Model-specific features and capabilities, 8) Compatibility with different transport layers. Focus on practical implementation details and code examples.

**Response:**

The OpenAI Agents SDK provides a flexible, production-ready framework for integrating real-time voice models such as **gpt-realtime** and **gpt-4-realtime** into agentic applications. Below is a comprehensive guide tailored for backend and integration teams, focusing on practical implementation, configuration, and best practices as of September 2025.

---

## 1. Available Models for Realtime Voice

- **gpt-realtime** and **gpt-4-realtime** are specialized for low-latency, streaming voice interactions.
- These models are designed for use cases requiring rapid, conversational responses, such as voice assistants, live support bots, and interactive agents.
- Model selection is typically done by specifying the model name (e.g., `"gpt-4-realtime"`) in the agent or session configuration[1].

---

## 2. Model Configuration Options and Parameters

- **Model selection**: Set via the `model` parameter when initializing an `Agent` or `Runner` instance[1][3].
- **ModelSettings**: Fine-tune model behavior with options such as:
  - `reasoning.effort`: Controls depth of reasoning (`"minimal"`, `"low"`, etc.).
  - `verbosity`: Adjusts output length/detail.
  - `temperature`: Controls randomness (0.0–1.0; lower is more deterministic)[3].
- **Default model**: If not specified, the SDK uses the default (`gpt-4.1` as of September 2025), but you can override globally via the `OPENAI_DEFAULT_MODEL` environment variable or per-runner[1].
- **Realtime-specific settings**: For voice, ensure the agent is configured for streaming input/output and low-latency operation.

**Example: Agent Initialization with Model Settings**
```python
from agents import Agent

agent = Agent(
    name="VoiceAssistant",
    instructions="Assist users in real time.",
    model="gpt-4-realtime",
    temperature=0.3,
    modelSettings={"reasoning.effort": "minimal", "verbosity": "low"}
)
```
[1][3]

---

## 3. Model Selection Best Practices

- **Use `gpt-4-realtime`** for high-accuracy, low-latency voice tasks where quality is critical.
- **Use `gpt-realtime`** for cost-sensitive or ultra-low-latency scenarios with simpler requirements.
- For agentic workflows, prefer models with predictable latency and output (e.g., `gpt-4.1` or `gpt-4-realtime`)[1].
- Set the default model at the environment or runner level for consistency across agents[1].
- Adjust `reasoning.effort` and `verbosity` for performance/quality trade-offs; `"minimal"` effort is fastest but may not support all tools[1].

---

## 4. Performance Characteristics and Limitations

- **Latency**: Realtime models are optimized for sub-second response times, suitable for live voice streaming.
- **Throughput**: Designed for concurrent sessions, but actual throughput depends on your API quota and backend infrastructure.
- **Limitations**:
  - Some advanced tools (e.g., file search, image generation) may not be available or may require higher reasoning effort settings[1].
  - `"minimal"` reasoning may not support all agent tools.
  - Voice models may have stricter rate limits and require ephemeral client secrets for secure access[1].

---

## 5. Pricing and Usage Considerations

- **Realtime models** are typically priced higher per token or per minute than standard models due to infrastructure demands.
- Usage is billed based on streaming duration and/or tokens processed.
- Always monitor usage and set up rate limiting to avoid unexpected costs.
- Use ephemeral client secrets for secure, auditable access (see Task 4 in your project context).

---

## 6. Integration Patterns with RealtimeAgent

- **RealtimeAgent** is the recommended abstraction for voice streaming.
- **Session management**: Use `RealtimeSession` to manage connection state, handle reconnections, and clean up resources[1].
- **Transport**: Supports both WebRTC (preferred for low-latency, browser-to-cloud audio) and WebSocket (for broader compatibility).
- **Token management**: Integrate with your backend to fetch ephemeral client secrets before initializing the agent (see Task 4).

**Example: RealtimeAgent Initialization (Pseudocode)**
```javascript
import { RealtimeAgent } from 'openai-agents-js';

const agent = new RealtimeAgent({
  model: 'gpt-4-realtime',
  token: '<ephemeral-client-secret>',
  transport: 'webrtc', // or 'websocket'
  onConnectionStateChange: (state) => { /* handle UI updates */ },
  onTranscript: (text) => { /* handle live transcript */ },
});
```
[1]

---

## 7. Model-Specific Features and Capabilities

- **gpt-4-realtime**:
  - Supports advanced reasoning and context retention in live conversations.
  - Optimized for streaming, with incremental output and low latency.
  - May support limited tool use (e.g., web search) depending on `reasoning.effort`[1].
- **gpt-realtime**:
  - Prioritizes speed and cost-efficiency.
  - Best for simple Q&A, command-and-control, or rapid dialog flows.
- Both models support live transcript streaming and can be integrated with speech-to-text and text-to-speech pipelines.

---

## 8. Compatibility with Different Transport Layers

| Transport Layer | Description | Best Use Cases | Limitations |
|-----------------|-------------|---------------|-------------|
| **WebRTC**      | Peer-to-peer, low-latency audio streaming | Browser-based voice apps, mobile | Requires ICE/TURN setup, may be blocked by strict firewalls |
| **WebSocket**   | Persistent, bidirectional messaging | Server-to-server, fallback for browsers | Slightly higher latency, less optimal for raw audio |

- The SDK abstracts transport selection; specify via the `transport` parameter when initializing `RealtimeAgent`.
- For browser-based voice, **WebRTC** is preferred for its low latency and direct audio streaming capabilities[1].
- For backend or environments where WebRTC is unavailable, **WebSocket** provides a reliable alternative.

---

## Practical Implementation Checklist

- **Backend**: Implement secure `/api/generate-client-secret` endpoint to issue ephemeral tokens (see Task 4).
- **Frontend**: Use the SDK’s `RealtimeAgent` with the chosen model and transport; manage connection state and error handling (see Tasks 5, 6, 7).
- **Configuration**: Set model, temperature, and modelSettings per agent or globally as needed.
- **Testing**: Validate with both WebRTC and WebSocket transports; monitor latency and error rates.
- **Documentation**: Maintain clear references in `.taskmaster/docs/research/` for all integration patterns and configuration options.

---

**References:**  
- [OpenAI Agents SDK Models Guide][1]  
- [SDK usage and configuration examples][3]  
- [SDK architecture and agent patterns][2][4]


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-15T22:04:52.782Z*
