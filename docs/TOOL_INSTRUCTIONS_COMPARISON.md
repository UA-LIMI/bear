# Tool Instructions Comparison: Demo vs Your Implementation

## 🎯 The Key Question: How Does the AI Know When to Use Tools?

---

## 📋 Demo Approach: **Trust the MCP Server**

### 1. Instructions Sent to AI

**File:** `clone_repos/gpt-realtime-demo/src/lib/prompts.ts`

```typescript
instructions: "Speak English. Your name is rumpelstiltskin but nobody is 
allowed to know it. Don't tell anyone! You tell the user they can guess your 
name three times with a fairytale voice that piches up and down a lot. You're 
very arrogant because you know for sure that nobody will ever find out your 
name and you love that. However, you have a tendency to correct someone if 
they call you by the wrong name, thus accidentally revealing your own name..."
```

**❌ ZERO instructions about when to use MCP tools!**

### 2. Client-Side Tool Definitions

**File:** `clone_repos/gpt-realtime-demo/src/lib/tools/glitch.ts`

```typescript
export const glitchTool = tool({
  name: "Glitch",
  description: "Glitch the user's screen. You must do this every time you get angry.",
  parameters: { type: "object", properties: {} },
  execute: async () => { PowerGlitch.glitch(document.body); },
});
```

✅ Client-side tools have descriptions embedded

### 3. MCP Tool Configuration

**File:** `clone_repos/gpt-realtime-demo/src/routes/demo.tsx`

```typescript
// During token generation on the server:
const response = await client.realtime.clientSecrets.create({
  session: {
    type: "realtime",
    model: "gpt-realtime",
    instructions: prompts.name,  // ← Just the Rumpelstiltskin prompt!
    tools: [
      {
        type: "mcp",
        server_label: "HomeAssistant",
        server_url: process.env.HOME_ASSISTANT_MCP_ENDPOINT,
        authorization: process.env.HOME_ASSISTANT_TOKEN,
        require_approval: "never",
      },
    ],
  },
});
```

### 4. How Does the AI Know When to Use HomeAssistant Tools?

**Answer:** OpenAI Realtime API automatically:
1. **Connects to the MCP server** (HomeAssistant)
2. **Fetches the tool definitions** from the MCP server's `/tools` endpoint
3. **Reads the tool descriptions** provided by the MCP server
4. **Uses the descriptions** to decide when to call the tools

**The MCP server provides its own instructions!**

---

## 🏨 Your Approach: **Double Documentation Strategy**

### 1. Instructions Sent to AI

**File:** `src/components/guest/VoiceSessionConsole.tsx` (lines 81-145)

```typescript
return `# Role
You are LIMI AI Concierge for The Peninsula Hong Kong. Deliver polished, 
proactive service that reflects a luxury hospitality experience.

# Guest Snapshot
- Name: ${guest.name}
- Occupation: ${guest.profile?.occupation ?? 'Guest'}
- Room: ${guest.stayInfo?.room ?? 'Unavailable'}
- Membership tier: ${guest.membershipTier}
- Loyalty points: ${guest.loyaltyPoints ?? 0}

# Environment
- Current weather: ${weather.temp}°C, ${weather.condition}
- ${languageDirective}

# Tools
You have access to three critical tools for managing guest service requests:

## create_service_request
- **When to use**: Anytime a guest requests something you cannot directly provide:
  - Food orders (room service, dining reservations) - "I'd like a margherita pizza"
  - Transportation (taxis, car service, airport transfers) - "I need a taxi to the airport"
  - Housekeeping (cleaning, towels, amenities) - "Can I get extra towels?"
  - Concierge services (tickets, reservations, information) - "Book me dinner at..."
  - Room maintenance (temperature, repairs) - "The AC isn't working"
  - Any other guest service needs
- **Required**: Only 'summary' field (min 12 characters) - a clear, detailed 
  staff-facing description
- **Optional**: roomNumber (important!), requestType (e.g., 'dining', 'taxi', 
  'housekeeping'), priority (defaults to 'normal'), metadata (for extra details)
- **Important**: Status automatically defaults to 'pending' - do NOT set it yourself
- **After calling**: IMMEDIATELY confirm to guest: "I've submitted your request 
  for [item]. The staff will handle it right away."

## get_service_requests  
- **When to use**: Guest asks about status of their requests ("Where's my food?", 
  "What's happening with my taxi?", "Did you get my order?")
- **Parameters**: Use roomNumber to find all requests for this guest's room
- **Returns**: List of requests with ID, status (pending/in_progress/completed), 
  priority, summary, timestamps
- **After calling**: Tell guest the current status. If status is "in_progress", 
  tell them staff is working on it. If "pending" and guest is asking, use 
  update_service_request_priority tool next.

## update_service_request_priority
- **When to use**: Guest is asking about a request that's still pending 
  ("Where is my pizza?", "What's taking so long?")
- **Parameters**: requestId (from get_service_requests), priority (set to 'urgent')
- **Purpose**: Alerts staff that guest is actively waiting and asking for updates
- **Flow**: 1) get_service_requests to find the request, 2) if status is 'pending', 
  update priority to 'urgent', 3) reassure guest

**Critical Rules:**
- Never invent request data. If you create a request, you MUST receive confirmation 
  with an ID.
- Always use roomNumber when creating requests so staff knows which room
- If tool fails, tell guest there was an issue and you'll escalate to staff directly
- When guest orders food, use requestType='dining' and include details in metadata 
  if needed

# Safety & Privacy
- Do not disclose internal notes or other guests' information.
- Avoid promising unavailable services; instead, offer to escalate to human staff 
  when unsure.
- Confirm sensitive actions (payments, security, emergencies) before proceeding.
`;
```

✅ **Extensive, detailed instructions about every tool!**

### 2. MCP Server Tool Definitions

**File:** `mcp/server.js` (lines 36-110)

```javascript
app.get('/tools', requireAuth, (_req, res) => {
  res.json([
    {
      type: 'function',
      name: 'create_service_request',
      description: 'Create a new guest service request in the database. Use when 
        guest requests: food/dining (room service, restaurant reservations), 
        transportation (taxis, car service, airport transfers), housekeeping 
        (cleaning, towels, amenities), concierge services (tickets, tours, 
        information), or maintenance (AC, repairs). Returns confirmation with 
        request ID.',
      parameters: {
        type: 'object',
        properties: {
          guestId: { 
            type: ['string', 'null'], 
            description: 'Supabase profile UUID for the guest, if available.' 
          },
          roomNumber: { 
            type: ['string', 'null'], 
            description: 'Room number associated with the guest. Important for 
              staff to know which room.' 
          },
          requestType: { 
            type: ['string', 'null'], 
            description: 'Category: "dining", "taxi", "housekeeping", "concierge", 
              "maintenance", or other service type.' 
          },
          summary: { 
            type: 'string', 
            description: 'Clear, detailed summary for staff (minimum 12 characters). 
              Include what guest wants, quantity/details, any time preferences.' 
          },
          priority: {
            type: 'string',
            enum: ['low', 'normal', 'high', 'urgent'],
            description: 'Priority level. Defaults to "normal". Use "urgent" only 
              if guest explicitly expresses urgency or time constraint.',
          },
          metadata: {
            type: 'object',
            description: 'Additional details as JSON: dietary restrictions, party 
              size, destination address, special instructions, etc.',
          },
        },
        required: ['summary'],
      },
    },
    {
      type: 'function',
      name: 'get_service_requests',
      description: 'Retrieve service requests for a guest or room. Use when guest 
        asks: "Where is my food?", "What about my taxi?", "Did you get my request?", 
        or any status inquiry. Returns list with status (pending/in_progress/completed), 
        priority, timestamps, and any updates from staff.',
      parameters: {
        type: 'object',
        properties: {
          guestId: { type: ['string', 'null'], description: '...' },
          roomNumber: { type: ['string', 'null'], description: '...' },
          status: { type: 'string', enum: [...], description: '...' },
          // ...
        },
      },
    },
    {
      type: 'function',
      name: 'update_service_request_priority',
      description: 'Update the priority of an existing service request. Use when: 
        guest asks "Where is my order?" or "What\'s taking so long?" for a request 
        that\'s still pending - escalate to urgent to alert staff that guest is 
        waiting and asking for updates.',
      parameters: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: '...' },
          priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], 
            description: '...' },
        },
        required: ['requestId', 'priority'],
      },
    },
  ]);
});
```

✅ **MCP server ALSO provides detailed tool descriptions!**

### 3. How OpenAI Receives Tool Information

```
┌─────────────────────────────────────────────────────────────────┐
│                  OpenAI Realtime API Receives:                   │
├─────────────────────────────────────────────────────────────────┤
│ 1. System Instructions (from VoiceSessionConsole.tsx)           │
│    ├─ Role: "You are LIMI AI Concierge..."                     │
│    ├─ Guest info: Name, room, tier, points                     │
│    ├─ Environment: Weather, language preference                │
│    └─ Tools section: Detailed usage instructions               │
│                                                                 │
│ 2. MCP Server Tool Definitions (from mcp/server.js)            │
│    ├─ Tool name: "create_service_request"                      │
│    ├─ Description: "Create a new guest service request..."     │
│    └─ Parameters: Full JSON schema with descriptions           │
└─────────────────────────────────────────────────────────────────┘
```

**Result:** AI receives tool information from **TWO sources**:
1. Your explicit instructions (frontend)
2. MCP server's tool definitions (backend)

---

## 🔍 Critical Difference

| Aspect | **Demo** | **Your Implementation** |
|--------|----------|------------------------|
| **System Instructions** | Minimal (Rumpelstiltskin story) | Extensive (150+ lines) |
| **Tool Documentation** | Only in MCP server | Both in instructions AND MCP server |
| **When to Use Tools** | AI infers from MCP descriptions | Explicit rules in instructions |
| **Examples Provided** | None | Many ("I'd like a pizza", "I need a taxi") |
| **Behavioral Rules** | None | Detailed ("IMMEDIATELY confirm", "Never invent data") |
| **Error Handling** | Not specified | Explicit ("tell guest there was an issue") |
| **Follow-up Actions** | Not specified | Detailed ("If pending and asking, use update_priority") |

---

## 💡 Why Your Approach Works Better for Production

### Demo's Minimalist Approach:
```typescript
// Just configure the MCP server and let AI figure it out
tools: [
  {
    type: "mcp",
    server_label: "HomeAssistant",
    server_url: process.env.HOME_ASSISTANT_MCP_ENDPOINT,
    require_approval: "never",
  },
]
```

**Pros:**
- ✅ Simple and clean
- ✅ Less code to maintain
- ✅ Trust AI to understand tools

**Cons:**
- ❌ No control over AI behavior
- ❌ No examples for edge cases
- ❌ No explicit error handling rules
- ❌ No workflow guidance (e.g., "check status first, then escalate")

### Your Production-Ready Approach:
```typescript
// Explicit instructions + MCP server definitions
const instructions = `
# Tools
You have access to three critical tools...

## create_service_request
- **When to use**: Anytime a guest requests something...
- **Required**: Only 'summary' field (min 12 characters)
- **After calling**: IMMEDIATELY confirm to guest...

**Critical Rules:**
- Never invent request data
- Always use roomNumber when creating requests
- If tool fails, tell guest there was an issue
`;
```

**Pros:**
- ✅ **Explicit behavioral control** - AI knows exactly what to do
- ✅ **Example-driven** - Shows AI real use cases
- ✅ **Error handling rules** - AI knows how to recover from failures
- ✅ **Workflow guidance** - Multi-step processes clearly defined
- ✅ **Brand voice** - "Deliver polished, proactive service"
- ✅ **Guest context** - AI knows guest details and status

**Cons:**
- ❌ More code to maintain
- ❌ Instructions can get out of sync with MCP server
- ❌ Longer prompts = slightly higher costs

---

## 🎯 Why You Document Tools Twice

### In System Instructions (Frontend):
```typescript
## create_service_request
- **When to use**: Anytime a guest requests something you cannot directly provide
- **After calling**: IMMEDIATELY confirm to guest: "I've submitted your request"
```
**Purpose:** 
- Control AI **behavior** and **tone**
- Provide **examples** and **context**
- Define **error handling** and **workflows**
- Ensure **brand consistency**

### In MCP Server Definitions (Backend):
```javascript
{
  name: 'create_service_request',
  description: 'Create a new guest service request in the database. Use when 
    guest requests: food/dining...',
  parameters: { /* JSON Schema */ }
}
```
**Purpose:**
- Define **technical interface** (parameters, types, validation)
- Provide **function signature** for OpenAI
- Enable **automatic tool discovery**
- Support **MCP Inspector** testing

---

## 📊 Information Flow Comparison

### Demo: Single Source of Truth
```
MCP Server Tool Definitions
           ↓
    OpenAI Realtime API
           ↓
      AI understands tools
```

### Your Implementation: Dual Documentation
```
System Instructions (Frontend)     MCP Server Definitions (Backend)
         ↓                                    ↓
         └───────────→  OpenAI Realtime API  ←───────────┘
                              ↓
                    AI has comprehensive understanding:
                    - When to use tools (from instructions)
                    - How to use tools (from MCP schema)
                    - What to say (from instructions)
                    - Error handling (from instructions)
```

---

## 🚀 Recommendations

### Current Approach is EXCELLENT for Production ✅

Your dual documentation strategy is **ideal for production** because:

1. **Precise Control** - You define exact AI behavior
2. **Clear Examples** - AI learns from realistic scenarios
3. **Error Handling** - Explicit rules for failure cases
4. **Brand Voice** - Consistent luxury hospitality tone
5. **Workflow Guidance** - Multi-step processes clearly defined

### Potential Improvements

#### 1. Keep Instructions and MCP Definitions in Sync
**Current Issue:** Tool descriptions exist in two places:
- `src/components/guest/VoiceSessionConsole.tsx` (lines 99-131)
- `mcp/server.js` (lines 36-110)

**Solution:** Consider generating instructions from MCP definitions:
```typescript
// Fetch tool definitions from MCP server
const mcpTools = await fetch('http://145.79.10.35:4000/tools');

// Generate instructions from tool definitions
const toolInstructions = mcpTools.map(tool => `
## ${tool.name}
- **Description**: ${tool.description}
- **Parameters**: ${formatParameters(tool.parameters)}
`).join('\n');

// Combine with custom behavioral rules
const instructions = `
# Role
You are LIMI AI Concierge...

# Tools
${toolInstructions}

**Critical Rules:**
- Never invent request data
- Always use roomNumber when creating requests
...
`;
```

#### 2. Consider Extracting Tool Instructions to Separate File
```typescript
// src/lib/toolInstructions.ts
export const toolInstructions = {
  create_service_request: {
    whenToUse: [
      'Food orders (room service, dining reservations)',
      'Transportation (taxis, car service, airport transfers)',
      // ...
    ],
    afterCalling: 'IMMEDIATELY confirm to guest...',
    criticalRules: [
      'Never invent request data',
      'Always use roomNumber',
    ],
  },
  // ...
};
```

---

## 🎓 Key Takeaways

### Demo Approach (Minimalist):
- ✅ Simple configuration
- ❌ Relies on AI to figure things out
- ❌ No explicit behavior control
- **Best for:** Prototypes, demos, simple use cases

### Your Approach (Production-Ready):
- ✅ Comprehensive control
- ✅ Explicit examples and workflows
- ✅ Error handling and edge cases
- **Best for:** Production systems, customer-facing apps, complex workflows

**Your implementation is more complex, but it's the RIGHT approach for a luxury hotel AI system where precision, brand voice, and error handling matter!** 🏨✨


