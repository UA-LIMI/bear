---
title: Research Session
query: "Can OpenAI backend agents run on Vercel AI Gateway? I need to understand: 1) Whether Vercel AI Gateway supports running OpenAI Agent and Runner classes, 2) How backend agents would be deployed on Vercel's serverless functions, 3) Whether Vercel AI Gateway can handle the @openai/agents package and its dependencies, 4) Performance implications of running backend agents on serverless vs VPS, 5) How to configure backend agents to work with Vercel's environment, 6) Whether there are any limitations or restrictions for running complex agent workflows on Vercel AI Gateway."
date: 9/17/2025
time: 5:38:08 PM
timestamp: 2025-09-17T09:38:08.169Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** Can OpenAI backend agents run on Vercel AI Gateway? I need to understand: 1) Whether Vercel AI Gateway supports running OpenAI Agent and Runner classes, 2) How backend agents would be deployed on Vercel's serverless functions, 3) Whether Vercel AI Gateway can handle the @openai/agents package and its dependencies, 4) Performance implications of running backend agents on serverless vs VPS, 5) How to configure backend agents to work with Vercel's environment, 6) Whether there are any limitations or restrictions for running complex agent workflows on Vercel AI Gateway.

**Response:**

OpenAI backend agents can be integrated with Vercel AI Gateway, but there are important distinctions and limitations regarding *where* and *how* agent logic runs, what the Gateway supports, and the deployment model for backend agent code. Below is a detailed, actionable breakdown addressing each of your six research points, with direct relevance to your project’s use of OpenAI Agents SDK, @openai/agents-realtime, and secure backend infrastructure.

---

## 1. Does Vercel AI Gateway Support Running OpenAI Agent and Runner Classes?

**Vercel AI Gateway** provides an **OpenAI-compatible API endpoint** that acts as a proxy for OpenAI and other LLM providers[1]. This means:

- **The Gateway itself does not execute arbitrary backend code or agent logic** (such as OpenAI Agent or Runner classes) on your behalf.
- It exposes endpoints like `/v1/chat/completions`, `/v1/embeddings`, etc., which you can call using OpenAI client libraries or compatible SDKs[1].
- **Agent orchestration logic (e.g., using `@openai/agents` or `@openai/agents-realtime`) must run in your own backend code**, not inside the Gateway.

**Summary:**  
Vercel AI Gateway does *not* run agent or runner classes itself; it provides an API surface compatible with OpenAI, which your backend code (deployed on Vercel or elsewhere) can call[1][3].

---

## 2. How Are Backend Agents Deployed on Vercel's Serverless Functions?

To run backend agent logic (e.g., using `@openai/agents`), you deploy your code as **Vercel Serverless Functions** (API routes):

- **Agent orchestration code** (e.g., instantiating `RealtimeAgent`, managing sessions, handling tool calls) lives in your API route handlers (e.g., `/api/agent`).
- These handlers can use the OpenAI SDK, Agents SDK, and any compatible AI SDKs[4].
- **Vercel’s “fluid compute”** for AI agents allows longer-running, background, and concurrent workloads, with function durations up to 800 seconds depending on your plan[4].
- You can set a custom `maxDuration` in your API route to control agent execution time[4].

**Example:**
```typescript
// /api/agent.ts
import { RealtimeAgent } from '@openai/agents-realtime';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 120; // seconds

export const POST = async (req: Request) => {
  const { prompt } = await req.json();
  const agent = new RealtimeAgent({ model: openai('gpt-4o') });
  const response = await agent.run({ prompt });
  return new Response(JSON.stringify(response));
};
```
**Summary:**  
You deploy agent logic as Vercel API routes; the Gateway is used as the LLM backend, not as a code execution environment[4].

---

## 3. Can Vercel AI Gateway Handle the @openai/agents Package and Its Dependencies?

- **Vercel AI Gateway** is *agnostic* to your codebase; it simply exposes an OpenAI-compatible API[1].
- **Your serverless function** (API route) can install and use `@openai/agents`, `@openai/agents-realtime`, and their dependencies as part of its Node.js environment.
- The only integration point is that you configure your agent or SDK to use the Gateway’s base URL and API key[1][3].

**Example:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});
```
- **The Gateway does not “run” the package**; your backend code does. The Gateway simply proxies API calls[1][3].

**Summary:**  
You can use `@openai/agents` and related packages in your Vercel backend; configure them to point to the Gateway endpoint[1][3].

---

## 4. Performance Implications: Serverless vs VPS for Backend Agents

**Vercel Serverless (Fluid Compute for AI Agents):**
- **Pros:**
  - Scales automatically with load.
  - Minimizes cold starts for AI agents[4].
  - Supports long-running and concurrent agent tasks (up to 800s per invocation)[4].
  - No server maintenance.
- **Cons:**
  - **Stateless:** Each invocation is isolated; persistent state must be externalized (e.g., database, cache).
  - **Resource limits:** Memory and CPU per function are capped; very large models or heavy in-memory workflows may hit limits.
  - **Startup latency:** Cold starts are minimized but not eliminated.
  - **Timeouts:** Hard upper bound on execution time (plan-dependent)[4].

**VPS (Virtual Private Server):**
- **Pros:**
  - Full control over environment, resources, and process lifetime.
  - Can run persistent, stateful agent processes.
  - No hard timeouts (other than OS/process limits).
- **Cons:**
  - Manual scaling, monitoring, and failover.
  - Higher operational overhead.
  - Not as elastic for bursty workloads.

**Summary:**  
For most agent workflows (including OpenAI Agents SDK), Vercel’s serverless “fluid compute” is suitable and recommended for scalability and ease of deployment[4]. For extremely stateful, resource-intensive, or persistent agent processes, a VPS may be preferable.

---

## 5. How to Configure Backend Agents to Work with Vercel's Environment

- **Install dependencies** in your project (`@openai/agents`, `@openai/agents-realtime`, `openai`, `ai`, etc.).
- **Set environment variables** in Vercel dashboard:
  - `AI_GATEWAY_API_KEY` (for Gateway)
  - `OPENAI_API_KEY` (if using OpenAI directly)
- **Configure SDKs** to use the Gateway endpoint:
  ```typescript
  const openai = new OpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    baseURL: 'https://ai-gateway.vercel.sh/v1',
  });
  ```
- **Deploy agent orchestration code** as API routes (e.g., `/api/agent`, `/api/generate-client-secret`).
- **Handle state and session management** externally (e.g., Redis, Supabase, or Vercel KV) if needed for multi-step or long-lived agent workflows.

**For your Task 4:**  
Your `/api/generate-client-secret` endpoint can use `@openai/agents-realtime` and point to the Gateway for LLM calls, with ephemeral key management and audit logging handled in your backend logic.

---

## 6. Limitations or Restrictions for Running Complex Agent Workflows on Vercel AI Gateway

- **Gateway Limitations:**
  - Only proxies OpenAI-compatible API calls; does not execute agent logic or custom code[1].
  - Supported endpoints are limited to those exposed by the Gateway (e.g., `/v1/chat/completions`, `/v1/embeddings`)[1].
  - Rate limits and quotas apply per your Vercel plan.

- **Serverless Function Limitations:**
  - **Execution time:** Max duration per invocation (60–800s)[4].
  - **Statelessness:** No persistent in-memory state between invocations.
  - **Resource limits:** Memory and CPU per function are capped.
  - **Cold starts:** Reduced but possible, especially after periods of inactivity.
  - **Concurrency:** Supported, but each invocation is isolated.

- **Complex Workflows:**
  - For multi-step, tool-using, or streaming agent workflows, you must manage session state externally (e.g., in a database or cache).
  - For real-time voice or WebRTC, ensure your backend can maintain session state and handle disconnects robustly (see Task 17).

**Summary:**  
You can run complex agent workflows on Vercel, but must architect for statelessness, manage session state externally, and respect function duration/resource limits[4].

---

## Actionable Recommendations for Your Project

- **For Task 4:**  
  - Deploy `/api/generate-client-secret` as a Vercel API route.
  - Use `@openai/agents-realtime` and configure it to use the Gateway endpoint.
  - Store ephemeral keys and audit logs in a persistent store (e.g., Supabase, Vercel KV).
  - Handle token expiration and refresh logic in your backend code.

- **For Task 11:**  
  - Document the distinction between Gateway (API proxy) and backend agent execution.
  - Include configuration examples for using the Gateway with OpenAI Agents SDK and AI SDK.

- **For Task 17:**  
  - Ensure session disconnect/cleanup logic is robust to stateless serverless execution.
  - Use external state management for session tracking.

---

## References to Project Context

- **Your backend agent logic (e.g., RealtimeAgent, RealtimeSession)** must run in your own Vercel API routes, not inside the Gateway.
- **The Gateway is used as a drop-in replacement for OpenAI’s API endpoint**—point your SDKs to its base URL and use the Gateway API key[1][3].
- **All ephemeral key management, audit logging, and session handling** must be implemented in your backend code, leveraging Vercel’s serverless environment and external state stores as needed.

---

## Further Reading

- [Vercel AI Gateway OpenAI-Compatible API][1]
- [Vercel AI Agents Deployment Guide][4]
- [OpenAI Agents SDK with Vercel AI SDK][3]

If you need code samples or configuration templates for any of these integration points, please specify your preferred stack or workflow.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-17T09:38:08.169Z*
