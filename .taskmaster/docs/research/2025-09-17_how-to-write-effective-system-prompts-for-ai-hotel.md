---
title: Research Session
query: "How to write effective system prompts for AI hotel concierge assistants with OpenAI Realtime API - best practices for voice interactions, interruption handling, context management, and tool integration"
date: 9/18/2025
time: 7:53:01 AM
timestamp: 2025-09-17T23:53:01.004Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** How to write effective system prompts for AI hotel concierge assistants with OpenAI Realtime API - best practices for voice interactions, interruption handling, context management, and tool integration

**Response:**

To write **effective system prompts** for AI hotel concierge assistants using the OpenAI Realtime API, especially for **voice interactions**, you must design prompts and agent logic that maximize conversational naturalness, reliability, and context-awareness. Below is a comprehensive, actionable guide tailored to your project’s requirements, covering best practices for **voice UX, interruption handling, context management, and tool integration**.

---

## 1. System Prompt Design Principles for Voice Concierge Agents

### Clarity, Role, and Boundaries

- **Explicitly define the assistant’s persona and scope** in the system prompt. For a hotel concierge, specify:  
  - The assistant’s role (e.g., “You are LIMI, the voice concierge for the Grandview Hotel.”)
  - Allowed actions (e.g., “You can answer questions about hotel amenities, local attractions, and control in-room devices.”)
  - Tone and style (e.g., “Be friendly, concise, and professional. Use natural, conversational language.”)

- **Set behavioral guidelines** for voice:  
  - “Speak in short, clear sentences. Avoid jargon. Confirm actions before executing room controls.”

- **Example system prompt snippet:**
  ```
  You are LIMI, the AI voice concierge for the Grandview Hotel. Greet guests by name if known. Answer questions about hotel services, local recommendations, and room controls. Speak clearly and naturally. If unsure, ask clarifying questions. Always confirm before making changes to a guest’s room.
  ```

### Voice-Specific Instructions

- **Instruct the model to optimize for spoken output:**  
  - “Use natural pauses. Avoid listing more than three items at once. Offer to repeat or clarify if the guest sounds confused.”

- **Handle ambiguity gracefully:**  
  - “If a request is unclear, ask a clarifying question before proceeding.”

---

## 2. Best Practices for Voice Interactions

### Naturalness and Latency

- **Leverage the Realtime API’s low-latency, speech-to-speech pipeline** to minimize response delays and preserve conversational flow[2][4].
- **Use expressive, contextually appropriate voices** (e.g., Cedar, Marin) to enhance guest experience[2].

### Turn-taking and Interruptions

- **Explicitly instruct the agent to handle interruptions:**  
  - “If the guest interrupts, stop speaking immediately and listen. Resume only if prompted.”

- **Implement barge-in detection** at the transport layer (WebRTC/WebSocket) and propagate interruption events to the agent logic, so the model can adapt its response mid-turn[2][4].

- **Prompt example for interruption handling:**
  ```
  If the guest begins speaking while you are responding, stop immediately and listen. Do not finish your sentence unless the guest asks you to continue.
  ```

### Confirmation and Error Recovery

- **Always confirm critical actions** (e.g., room unlock, booking changes):  
  - “You requested to unlock your door. Should I proceed?”

- **Provide fallback and repair strategies:**  
  - “I didn’t catch that. Could you please repeat your request?”

---

## 3. Context Management

### Session and User Context

- **Inject guest profile and session data** into the system prompt at session start (e.g., name, room number, preferences)[1][3].
- **Maintain conversational state**:  
  - Track recent requests, unresolved actions, and guest preferences in memory or via the Realtime API’s context objects.

- **Prompt example for context awareness:**
  ```
  The guest’s name is Alex Chen, staying in room 512. They prefer a quiet room and have a dinner reservation at 7pm. Use this information to personalize your responses.
  ```

### Context Window and Memory

- **Summarize prior conversation turns** in the system prompt or via the API’s context field to maintain continuity, especially for multi-turn requests (e.g., “Earlier, the guest asked about late checkout.”).

- **Handle context resets gracefully:**  
  - “If you lose context, politely ask the guest to restate their request.”

---

## 4. Tool Integration (e.g., Room Controls, Search, Booking)

### Tool Use Instructions

- **Describe available tools and their invocation patterns** in the system prompt:
  - “You can call the ‘lighting_control’ tool to adjust room lights, and the ‘perplexity_search’ tool for local recommendations.”

- **Provide tool usage examples**:
  ```
  To dim the lights, call lighting_control with {level: 30%}.
  To find nearby Italian restaurants, call perplexity_search with {query: 'Italian restaurants near me'}.
  ```

- **Instruct the model to explain actions to the guest**:
  - “When invoking a tool, briefly explain what you are doing.”

### Error and Exception Handling

- **Prompt for tool failure scenarios**:
  - “If a tool call fails, apologize and offer to try again or suggest alternatives.”

---

## 5. Implementation Patterns with OpenAI Realtime API

### System Prompt Injection

- **Dynamically construct system prompts** at session start, merging static instructions with real-time context (guest info, hotel policies, available tools).

- **Update system prompt or context field** on significant context changes (e.g., after a successful booking or device control).

### Transport and Session Management

- **Use WebRTC for low-latency, high-quality voice**; fallback to WebSocket if necessary[4].
- **Monitor session state** (e.g., disconnects, reconnections) and re-inject context as needed (see Task 17 for disconnect handling).

### Example: Session Initialization Flow

1. Retrieve guest and room context from SPA state (Task 26).
2. Build system prompt with persona, context, and tool descriptions.
3. Start RealtimeSession with constructed prompt and context.
4. On each user utterance, update context as needed and handle interruptions.
5. On tool invocation, call backend APIs (e.g., MQTT for lighting, MCP for search) and relay results to the agent.

---

## 6. Edge Cases and Pitfalls

- **Ambiguous or multi-intent requests:**  
  - Prompt the model to clarify (“Did you want to book a table or just see restaurant options?”).

- **Rapid context switching:**  
  - Instruct the agent to confirm when the guest changes topics abruptly.

- **Session drops or reconnects:**  
  - Ensure context is rehydrated on reconnect (see Task 17).

- **Tool unavailability:**  
  - Provide fallback responses (“I’m unable to control the lights right now. Would you like me to notify the front desk?”).

---

## 7. Testing and Iteration

- **Test with real voice data** to ensure prompts yield natural, robust interactions[2][3].
- **Iterate on prompt wording** based on guest feedback and observed failure modes.
- **Peer review and cross-reference** with official OpenAI documentation and SDK updates (aligns with Task 11’s knowledge base goals).

---

## 8. Example System Prompt Template

```plaintext
You are LIMI, the AI voice concierge for the Grandview Hotel. Greet guests by name if known. Answer questions about hotel amenities, local attractions, and control in-room devices (lights, thermostat, TV) using available tools. Speak clearly and naturally, using short sentences and natural pauses. If the guest interrupts, stop speaking and listen. Confirm before making changes to the guest’s room. If you are unsure, ask clarifying questions. If a tool call fails, apologize and offer alternatives. The guest’s name is {guest_name}, staying in room {room_number}. They prefer {preferences}. Available tools: lighting_control, perplexity_search, booking_manager.
```

---

## 9. References to Project Tasks

- **Task 11:** Use this guidance to structure the “Prompt Engineering” and “Voice Interaction” sections of your knowledge base.
- **Task 17:** Ensure disconnect/reconnect logic preserves and re-injects context and system prompt.
- **Task 26:** Integrate prompt construction and context injection into the SPA’s session initiation flow.
- **Task 32/33:** Document tool invocation patterns and error handling for MQTT and MCP integrations.

---

By following these best practices, you will create robust, natural, and context-aware system prompts that leverage the full capabilities of the OpenAI Realtime API for hotel concierge voice assistants, ensuring a seamless guest experience and reliable backend integration[1][2][3][4].


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-17T23:53:01.004Z*
