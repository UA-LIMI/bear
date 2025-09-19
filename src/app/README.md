# APPLICATION PAGES & API ROUTES
**Next.js App Router structure for Peninsula Hong Kong Hotel AI**

## 🏨 PAGES

### **`page.tsx`** - Main Landing Page
**Purpose:** Entry point with navigation to hotel features
**Features:**
- Peninsula Hong Kong branding
- Navigation to guest interface and dashboard
- Clean, professional hotel presentation

### **`guest/page.tsx`** - 🎯 MAIN HOTEL INTERFACE (1186 lines)
**Purpose:** Complete hotel guest experience with AI chat and room controls
**Features:**
- **Guest selection** - 4 Hong Kong guests from database
- **Voice AI chat** - OpenAI Realtime with comprehensive hotel instructions
- **Text AI chat** - Vercel AI Gateway with Claude Sonnet 4
- **Room lighting controls** - 20+ WLED effects via MQTT
- **Dynamic UI** - Components adapt based on guest type
- **Real-time data** - Hong Kong weather and hotel events
- **Session management** - Connect/disconnect with proper cleanup

**Database Integration:**
- Loads guest profiles from Supabase
- Fetches hotel events and weather data
- Configures UI components per guest type
- Stores conversation context (planned)

### **`dashboard/page.tsx`** - Hotel Dashboard
**Purpose:** Guest profile management and room controls
**Features:**
- Guest profile display with Hong Kong location
- Room lighting control interface
- Loyalty points and membership information

### **`mobile/page.tsx`** - Mobile Interface
**Purpose:** Mobile-optimized hotel experience
**Features:**
- Responsive design for mobile devices
- Touch-friendly controls
- Simplified interface for smaller screens

## 🌐 API ROUTES

### **Core Hotel APIs:**

#### **`api/client-secret/route.ts`** - 🔑 CRITICAL
**Purpose:** Generate OpenAI ephemeral keys for voice chat
**Integration:** Proxies to VPS Docker backend
**Usage:** Voice connection authentication

#### **`api/control-lighting/route.ts`** - 💡 CRITICAL  
**Purpose:** Control room WLED lighting via MQTT
**Integration:** Direct MQTT broker connection
**Usage:** Room lighting control from guest interface

#### **`api/get-guests/route.ts`** - 👥 CORE
**Purpose:** Load guest profiles from Supabase database
**Integration:** Supabase profiles table
**Usage:** Guest selection and profile loading

#### **`api/get-hotel-events/route.ts`** - 📅 CORE
**Purpose:** Load hotel events from database
**Integration:** Supabase hotel_events table  
**Usage:** Display daily hotel activities

#### **`api/get-ui-config/route.ts`** - 🎨 ENHANCEMENT
**Purpose:** Load user-specific UI configuration
**Integration:** Supabase ui_components and user_component_assignments tables
**Usage:** Dynamic component visibility and layout

### **Advanced APIs:**

#### **`api/memory-mcp/route.ts`** - 🤖 MULTI-AI
**Purpose:** MCP server for external AI clients (Claude, Cursor)
**Integration:** Supabase + MQTT broker
**Usage:** Multi-AI compatibility for hotel system

### **Testing APIs:**
- **`api/test-mcp/route.ts`** - Environment variable testing
- **`api/test-supabase/route.ts`** - Database connection testing
- **`api/test-db/route.ts`** - Database query testing

## 🔗 INTEGRATION FLOW

### **Guest Experience Flow:**
```
1. Guest Selection → /api/get-guests → Supabase profiles
2. UI Configuration → /api/get-ui-config → Dynamic layout
3. Voice Connection → /api/client-secret → VPS → OpenAI
4. Room Controls → /api/control-lighting → MQTT → WLED
5. Weather Data → OpenWeatherMap API → Real-time display
6. Hotel Events → /api/get-hotel-events → Database display
```

### **Data Sources:**
- **Supabase Database** - Guest profiles, hotel config, events, UI settings
- **VPS Docker Backend** - OpenAI Realtime API authentication
- **MQTT Broker** - Room device control and status
- **OpenWeatherMap** - Hong Kong weather data
- **Vercel AI Gateway** - Enhanced text chat responses

## 🚨 CRITICAL DEPENDENCIES

### **Required for Voice Chat:**
- VPS Docker backend for OpenAI authentication
- Supabase database for guest context
- MQTT broker for room control integration

### **Required for Room Controls:**
- MQTT broker connection
- Supabase device_functions table
- Guest room assignment in profiles table

### **Required for Dynamic UI:**
- Supabase ui_components table
- user_component_assignments table
- ui_text_content table

## 🔧 DEVELOPMENT NOTES

### **File Naming Convention:**
- **`page.tsx`** - Next.js page components
- **`route.ts`** - API route handlers
- **`layout.tsx`** - Layout components

### **Key Patterns:**
- **Database integration** - All data from Supabase
- **Error handling** - Comprehensive fallbacks
- **TypeScript** - Proper interfaces and type safety
- **Real-time updates** - Live data integration

### **Performance Considerations:**
- **Efficient queries** - Proper database indexes
- **Caching** - API response caching where appropriate
- **Lazy loading** - Dynamic imports for large components

---

**This application structure provides the complete Peninsula Hong Kong hotel guest experience with proper separation of concerns and scalable architecture.**
