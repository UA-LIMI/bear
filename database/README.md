# DATABASE SYSTEM - Peninsula Hong Kong Hotel AI
**Complete database schema and management for hotel guest experience**

## 🎯 OVERVIEW
This folder contains all database-related files for the Peninsula Hong Kong Hotel AI System. The database stores guest information, hotel configuration, room devices, conversation history, and dynamic UI settings.

## 📁 FOLDER STRUCTURE

### `/migrations/` - Automated Database Schema
**Purpose:** Version-controlled database schema changes using Supabase CLI
**Files:**
- `20250917000001_initial_hotel_system.sql` - Core tables (profiles, hotels, rooms, devices)
- `20250917000002_insert_sample_data.sql` - Sample data for 4 Hong Kong guests
- `20250918000001_ui_content_system.sql` - Dynamic UI and content system

**How to Deploy:**
```bash
# From project root:
./deploy-database.sh

# Or manually:
npx supabase db push
```

### `/scripts/` - Manual Database Operations
**Purpose:** Individual SQL scripts for specific database operations
**Files:**
- `hotel-device-system.sql` - Complete room and device setup
- `dynamic-ui-system.sql` - UI component configuration
- `add-hotel-events.sql` - Hotel events and activities
- `complete-wled-functions.sql` - All WLED lighting effects
- `populate-sample-context.sql` - Guest context and preferences

**Usage:** Copy/paste into Supabase SQL Editor for manual execution

### `/documentation/` - Database Documentation
**Purpose:** Complete documentation of database schema and relationships
**Files:**
- `DATABASE_SCHEMA_DOCUMENTATION.md` - Complete table documentation with relationships

### `/examples/` - Sample Data and Queries
**Purpose:** Example data and common database queries for reference

## 🗄️ DATABASE OVERVIEW

### Core Tables (18 total):
- **profiles** - Guest information with Hong Kong locations
- **hotels** - Hotel configuration and AI behavior
- **rooms** - Room information and device assignments  
- **devices** - WLED controllers and MQTT topics
- **device_functions** - Complete WLED effects library
- **guest_entities** - Guest preferences and AI context
- **ui_components** - Dynamic UI component configuration
- **conversation_sessions** - Chat session tracking
- **hotel_events** - Real-time hotel events and services

### Current Data:
- **4 Hong Kong guests** - Umer, Taylor, Karen, Sarah with Peninsula Hotel locations
- **20+ WLED effects** - Complete lighting control library
- **Hotel events** - Peninsula Hong Kong daily activities
- **UI configurations** - Component visibility per guest type

## 🔧 DEPLOYMENT STATUS

### ✅ Ready to Deploy:
- **Core schema** - All tables defined with proper relationships
- **Sample data** - 4 guests with realistic Hong Kong data
- **UI system** - Dynamic component and text content configuration
- **Automated migrations** - Version-controlled deployment

### ❌ Pending Deployment:
- **Migration files** - Need to run `./deploy-database.sh`
- **UI content system** - Dynamic layout tables not yet deployed
- **Conversation storage** - Tables exist but not used by frontend

## 🔗 INTEGRATION POINTS

### Frontend Integration:
- **Guest page** - Loads profiles, events, weather from database
- **Dashboard** - Shows guest information and room controls
- **API endpoints** - All routes connect to Supabase for data

### External Services:
- **Supabase** - PostgreSQL database with Row Level Security
- **MQTT Broker** - Device control via database device configurations
- **OpenAI/Claude** - AI instructions built from database content

## 🚨 CRITICAL NOTES

### Security:
- **Row Level Security (RLS)** enabled on all tables
- **Service keys** required for write operations
- **Guest data isolation** - Users can only access their own data

### Performance:
- **Proper indexes** on all foreign keys and frequently queried columns
- **Efficient queries** with proper table relationships
- **Caching** implemented where appropriate

### Maintenance:
- **Always use migrations** for schema changes
- **Update documentation** when tables change
- **Test queries** before deploying to production

---

**This database system powers the complete Peninsula Hong Kong hotel guest experience with voice AI, room controls, and personalized service.**
