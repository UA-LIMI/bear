# LIMI AI - Voice-First Hotel Guest Experience Platform

A comprehensive voice AI system that provides intelligent assistance for hotel guests through adaptive interfaces and real-time conversation.

## 🎯 **What is LIMI AI?**

LIMI AI is a **voice-first hotel guest experience platform** that adapts dynamically based on guest status and needs. The system provides contextual AI assistance for:

- **Hotel room controls** (temperature, lighting, services)
- **City exploration** and recommendations  
- **Booking assistance** and travel planning
- **Real-time hotel services** (room service, concierge, transport)

## 🏗️ **System Architecture**

### **Multi-Interface Platform:**
- **`/`** - Main LIMI AI voice interface
- **`/guest`** - Hotel guest experience dashboard ⭐ **NEW**
- **`/mobile`** - Mobile-optimized interface

### **Key Libraries & SDKs**
- **`openai`**: The official Node.js library for interacting with all OpenAI APIs, including the Assistants API for building stateful, tool-calling agents.
- **`ai`**: The Vercel AI SDK for streamlined integration with various AI models and building chat interfaces with Generative UI.
- **`ai-elements`**: A collection of pre-built, production-ready Generative UI components that work with the Vercel AI SDK.
- **`@openai/agents-realtime`**: Used in the guest portal for live, low-latency voice sessions.
- **`ucaf`**: The Universal AI Chat Framework for building domain-agnostic, enterprise-grade chatbot experiences with Generative UI and MCP integration.

### **Deployment:**
```
┌─────────────────┐    HTTPS     ┌──────────────────┐    HTTP      ┌─────────────────┐
│   Vercel        │ ──────────► │  VPS Backend     │ ──────────► │   OpenAI API    │
│   (Frontend)    │              │  (Docker)        │              │   (Realtime)    │
└─────────────────┘              └──────────────────┘              └─────────────────┘
https://bear-beige   145.79.10.35:3001                            api.openai.com
.vercel.app         (Hostinger VPS)
```

## 🚀 **Quick Start**

### **Access the Live System:**
- **Main Interface:** [https://bear-beige.vercel.app](https://bear-beige.vercel.app)
- **Guest Dashboard:** [https://bear-beige.vercel.app/guest](https://bear-beige.vercel.app/guest)
- **Mobile Interface:** [https://bear-beige.vercel.app/mobile](https://bear-beige.vercel.app/mobile)

### **Local Development:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/UA-LIMI/bear.git
   cd bear
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access locally:**
   - Main: `http://localhost:3000`
   - Guest: `http://localhost:3000/guest`
   - Mobile: `http://localhost:3000/mobile`

## 🎨 **Guest Experience Interface**

### **Three Dynamic User States:**

#### **1. Umer - Business Executive (In Room)**
- **Status:** Currently in hotel room
- **AI Focus:** Room controls, business services, executive amenities
- **Features:** Temperature control, lighting scenes, room service, concierge

#### **2. Taylor - Hedge Fund CEO (En Route)**  
- **Status:** Traveling to hotel
- **AI Focus:** VIP arrival preparation, privacy, premium services
- **Features:** Digital key, private dining, airport transfer, market data

#### **3. Karen - Doctor & Mother (Exploring City)**
- **Status:** Out exploring with family
- **AI Focus:** Family-friendly recommendations, safety, hotel booking
- **Features:** Kid activities, safe locations, family suites, local attractions

## 🤖 **AI Integration**

### **Voice-First Design:**
- **Real-time voice chat** with OpenAI Realtime API
- **Contextual AI prompts** based on guest profile
- **WebRTC audio streaming** for low latency
- **Text chat fallback** for accessibility

### **Contextual Intelligence:**
- **Guest status awareness** - AI knows if user is in room, traveling, or exploring
- **Preference learning** - AI adapts to guest type (business, VIP, family)
- **Service integration** - AI can control room settings, make reservations, provide recommendations

## 🔧 **Technical Stack**

### **Frontend:**
- **Next.js 15** with TypeScript and App Router
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Shadcn UI** components
- **@openai/agents-realtime** for voice integration

### **Backend:**
- **Node.js & Express** with comprehensive middleware
- **Winston** for structured logging
- **Express-validator** for input validation
- **Docker** containerization for VPS deployment
- **Comprehensive security** (Helmet, CORS, rate limiting)

### **Deployment:**
- **Frontend:** Vercel (automatic deployments)
- **Backend:** Hostinger VPS with Docker
- **Database:** Ready for Supabase integration
- **Monitoring:** Winston logs + Docker logs

## 📋 **API Endpoints**

### **Voice & AI Services:**
- **`POST /api/client-secret`** - Generate ephemeral tokens for voice sessions
- **`POST /api/ai-proxy`** - Proxy text requests to AI models
- **`GET /api/client-secret/health`** - Check OpenAI connectivity

### **Health & Monitoring:**
- **`GET /healthz`** - Basic health check
- **`GET /readyz`** - Comprehensive readiness check  
- **`GET /live`** - Liveness probe
- **`GET /status`** - Detailed system status

## 🛡️ **Security Features**

- **Ephemeral tokens** - Short-lived keys for OpenAI access
- **API key protection** - Never exposed to frontend
- **CORS configuration** - Secure cross-origin requests
- **Rate limiting** - Prevent abuse and ensure stability
- **Input validation** - Comprehensive request sanitization
- **Audit logging** - Complete request/response tracking

## 🔄 **Development Workflow**

The project uses **Task Master AI** for development management:

```bash
# View current tasks
task-master list

# Get next task to work on  
task-master next

# Update task progress
task-master update-subtask --id=<id> --prompt="progress notes"
```
## 📊 **Current Status**

### **✅ Production Ready:**
- Backend infrastructure (94% test pass rate)
- Voice AI integration (WebRTC + OpenAI)
- Vercel deployment pipeline
- VPS Docker deployment
- Security and monitoring

### **🚧 In Development:**
- Hotel guest experience features
- Dynamic UI system
- Database integration (Supabase planned)
- IoT device integration (MQTT planned)

## 🎨 **Brand Integration**

- **Professional LIMI branding** throughout all interfaces
- **Consistent design tokens** with LIMI color palette
- **Logo variations** properly implemented
- **Typography** following brand guidelines

## 📱 **Mobile & Responsive**

- **PWA-ready** architecture
- **Mobile-first design** principles
- **Touch-optimized** interactions
- **Responsive layouts** across all screen sizes

## 🔮 **Future Roadmap**

1. **Database Integration** - Supabase deployment for guest data
2. **IoT Integration** - MQTT for room controls
3. **Live Data Agents** - Perplexity MCP for real-time info
4. **Dynamic UI System** - AI-driven component registry
5. **Authentication** - Secure guest login system

## 📞 **Support & Deployment**

- **VPS Access:** SSH key-based authentication configured
- **Monitoring:** Docker logs + Winston structured logging
- **Deployment:** Automated via git push to Vercel
- **Backend Updates:** Docker container rebuild on VPS

---

**LIMI AI represents a mature, production-ready voice AI platform with clear evolution toward comprehensive hotel guest experience management.**
