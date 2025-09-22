# FRONTEND APPLICATION - Peninsula Hong Kong Hotel AI
**Next.js application for hotel guest experience**

## 🎯 OVERVIEW
This folder contains the complete frontend application for the Peninsula Hong Kong Hotel AI System. Built with Next.js, TypeScript, and Tailwind CSS.

## 📁 FOLDER STRUCTURE

### `/app/` - Next.js App Router
**Purpose:** Main application pages and API routes

#### **Pages:**
- **`page.tsx`** - Main landing page with navigation to hotel features
- **`layout.tsx`** - Root layout with global styles and metadata
- **`guest/page.tsx`** - **MAIN FEATURE** - 1186-line complete hotel guest interface
- **`dashboard/page.tsx`** - Hotel dashboard with guest profile and room controls
- **`mobile/page.tsx`** - Mobile-optimized hotel interface

#### **API Routes (`/api/`):**
- **`client-secret/route.ts`** - OpenAI ephemeral key generation (proxies to VPS)
- **`control-lighting/route.ts`** - **CRITICAL** - MQTT lighting control for room devices
- **`get-guests/route.ts`** - Load guest profiles from Supabase database
- **`get-hotel-events/route.ts`** - Load hotel events from database
- **`get-ui-config/route.ts`** - Load user-specific UI configuration
- **`memory-mcp/route.ts`** - Multi-AI MCP server for external AI clients
- **`test-*`** - Various testing endpoints for system verification

### `/components/` - Reusable UI Components
**Purpose:** Shared components used across pages

#### **UI Components (`/ui/`):**
- **`button.tsx`** - Styled button component
- **`badge.tsx`** - Status and label badges
- **`select.tsx`** - Dropdown selection components
- **`textarea.tsx`** - Text input areas
- **`label.tsx`** - Form labels

#### **Hotel Components:**
- **`VoiceConnection.tsx`** - Voice AI connection interface (original)
- **`UserLocationDisplay.tsx`** - Guest location display with Hong Kong data

### `/lib/` - Utility Libraries
**Purpose:** Shared utilities and helper functions
- **`apiClient.ts`** - API client utilities
- **`utils.ts`** - General utility functions
- **`supabase-auth.ts`** - Authentication system (username/password)
- **`agent-context-manager.ts`** - AI context management utilities

## 🎯 KEY FEATURES

### **Guest Interface (`/guest/page.tsx`) - MAIN FEATURE**
**1186 lines of comprehensive hotel experience:**

#### **Core Functionality:**
- **Guest selection** - 4 Hong Kong guests from database
- **Voice AI chat** - OpenAI Realtime API with comprehensive hotel instructions
- **Text AI chat** - Vercel AI Gateway with Claude Sonnet 4
- **Room lighting controls** - 20+ WLED effects with MQTT integration
- **Real-time data** - Hong Kong weather and hotel events
- **Dynamic UI** - Components show/hide based on guest type

#### **Database Integration:**
- **Guest profiles** - Complete Hong Kong Peninsula Hotel data
- **Room capabilities** - WLED effects and device configurations
- **Hotel events** - Real-time events from database
- **UI configuration** - Component visibility per guest type
- **Text content** - All labels and messages from database

#### **AI Context System:**
- **Comprehensive instructions** - 200+ lines of detailed AI behavior
- **Guest-specific context** - Name, occupation, room, location, preferences
- **Tool integration** - Room controls, location updates, preference storage
- **Hong Kong integration** - Weather, location recommendations, local context

## 🔧 TECHNICAL ARCHITECTURE

### **Frontend Stack:**
- **Next.js 15.5.3** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling system
- **Framer Motion** - Animations and transitions
- **Lucide React** - Icon system

### **Database Integration:**
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Secure data access per user
- **Real-time subscriptions** - Live data updates
- **Edge functions** - Server-side logic

### **External Integrations:**
- **OpenAI Realtime API** - Voice AI chat (via VPS proxy)
- **Vercel AI Gateway** - Text AI chat with Claude
- **OpenWeatherMap** - Real-time Hong Kong weather
- **MQTT Broker** - Room device control

## 🚨 CRITICAL FILES

### **Must Read First:**
- **`guest/page.tsx`** - Main hotel guest interface (1186 lines)
- **`api/control-lighting/route.ts`** - Room lighting control
- **`api/client-secret/route.ts`** - Voice AI connection

### **Configuration:**
- **`layout.tsx`** - Global app configuration
- **`globals.css`** - Global styles and Tailwind imports

### **Utilities:**
- **`lib/supabase-auth.ts`** - Authentication system
- **`components/UserLocationDisplay.tsx`** - Location tracking

## 🔗 INTEGRATION POINTS

### **Database Connection:**
All pages connect to Supabase database for:
- Guest profiles and Hong Kong location data
- Hotel events and real-time information
- Room device capabilities and WLED effects
- Dynamic UI configuration per guest type

### **External APIs:**
- **OpenWeatherMap** - Hong Kong weather data
- **Vercel AI Gateway** - Enhanced AI responses
- **MQTT Broker** - Room lighting control
- **VPS Backend** - OpenAI Realtime API proxy

### **Authentication Flow:**
- **Guest selection** - Choose from 4 Hong Kong guests
- **No login required** - Demo mode with direct guest selection
- **Room assignment** - Each guest linked to specific room

## 🚀 DEVELOPMENT WORKFLOW

### **Local Development:**
```bash
npm run dev          # Start development server
npm run build        # Test build locally
npm run lint         # Check code quality
```

### **Database Development:**
```bash
npx supabase start   # Start local Supabase
npx supabase db push # Deploy schema changes
npx supabase db pull # Pull remote changes
```

### **Deployment:**
```bash
git push             # Auto-deploy to Vercel
./deploy-database.sh # Deploy database changes
```

---

**This frontend application provides the complete Peninsula Hong Kong hotel guest experience with voice AI, room controls, and database-driven personalization.**
