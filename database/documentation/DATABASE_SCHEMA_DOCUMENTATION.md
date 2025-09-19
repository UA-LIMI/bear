# PENINSULA HONG KONG DATABASE SCHEMA DOCUMENTATION
**Database:** Supabase PostgreSQL  
**Last Updated:** 2025-09-17  
**Total Tables:** 13 operational + 5 pending  

## 🎯 DATABASE OVERVIEW
Complete hotel guest management system with AI context, room controls, and dynamic UI configuration.

---

## 📊 OPERATIONAL TABLES (Currently Working)

### 👤 **profiles** - Guest Information
**Purpose:** Core guest data with Hong Kong locations and room assignments  
**Records:** 4 Hong Kong guests (Umer, Taylor, Karen, Sarah)

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `id` | UUID | Primary key, references auth.users | a397a03b-f65e-42c1-a8ed-6bebb7c6751b |
| `username` | VARCHAR(50) | Unique identifier | umer_asif |
| `display_name` | VARCHAR(100) | Full name for display | Umer Asif |
| `guest_type` | VARCHAR(20) | Membership tier | suite, platinum, vip, standard |
| `room_number` | VARCHAR(10) | Assigned room | room1, 301, 425, 210 |
| `current_location_address` | TEXT | Hong Kong location | The Peninsula Hong Kong, Salisbury Road |
| `current_location_city` | VARCHAR(100) | City name | Hong Kong |
| `current_location_country` | VARCHAR(100) | Country | Hong Kong SAR |
| `loyalty_points` | INTEGER | Loyalty program points | 10000, 4500, 2800, 300 |
| `total_stays` | INTEGER | Number of stays | 100, 45, 15, 3 |

**Relationships:**
- Links to `auth.users` for authentication
- Referenced by `guest_entities` for preferences
- Used by guest page for profile loading

---

### 🧠 **guest_entities** - Guest Preferences and Context
**Purpose:** Store AI-generated insights and guest preferences  
**Records:** Sample preference data for personalization

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `id` | UUID | Primary key | Generated UUID |
| `user_id` | UUID | Links to profiles | a397a03b-f65e-42c1-a8ed-6bebb7c6751b |
| `name` | VARCHAR(200) | Entity identifier | Umer_Asif_Lighting_Preferences |
| `entity_type` | VARCHAR(50) | Type of entity | preference, behavior, location |
| `category` | VARCHAR(50) | Category | lighting, dining, services |
| `observations` | JSONB | Preference details | ["Prefers romantic lighting"] |
| `confidence_score` | DECIMAL(3,2) | AI confidence | 0.9 |
| `source_agent` | VARCHAR(50) | Which AI created this | analysis, summarization |

**Usage:** AI uses get_guest_context tool to retrieve stored preferences

---

### 🏨 **hotels** - Hotel Configuration
**Purpose:** Hotel identity and AI behavior configuration  
**Records:** 1 (The Peninsula Hong Kong)

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `hotel_name` | VARCHAR(200) | Hotel identity | The Peninsula Hong Kong |
| `hotel_address` | TEXT | Physical address | Salisbury Road, Tsim Sha Tsui |
| `ai_identity` | TEXT | AI system prompt base | You are an AI designed for... |
| `ai_behavior_rules` | JSONB | Behavior guidelines | ["Greet by name", "Confirm changes"] |

**Usage:** Guest page loads hotel identity for AI instructions

---

### 🏠 **rooms** - Room Information
**Purpose:** Room details and device assignments  
**Records:** 4 rooms (room1, 301, 425, 210)

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `room_number` | VARCHAR(50) | Room identifier | room1, 301, 425, 210 |
| `room_type` | VARCHAR(50) | Room category | Owner Suite, VIP Suite, Business Suite |
| `floor_number` | INTEGER | Floor location | 1, 3, 4, 2 |
| `description` | TEXT | Room features | Owner suite with premium WLED lighting |

**Relationships:** Links to devices table for room-specific controls

---

### 💡 **devices** - WLED Controllers
**Purpose:** Physical device configuration for room controls  
**Records:** 1 (room1 WLED controller)

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `device_name` | VARCHAR(100) | Device identifier | Main Ceiling Light |
| `device_type` | VARCHAR(50) | Device category | WLED |
| `mqtt_topic` | VARCHAR(100) | MQTT control topic | room1 |
| `device_identifier` | VARCHAR(100) | External device ID | wled_room1_main |

**Usage:** Guest page uses MQTT topic for lighting control

---

### ⚡ **device_functions** - WLED Effects Library
**Purpose:** Complete WLED lighting effects with descriptions  
**Records:** 8+ effects (ON, OFF, FX=88, FX=101, colors)

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `function_name` | VARCHAR(100) | Effect name | Romantic Candle Effect |
| `payload_value` | VARCHAR(100) | MQTT command | FX=88 |
| `description` | TEXT | Effect description | Warm flickering candle-like lighting |
| `category` | VARCHAR(50) | Effect type | romantic, relaxing, energetic |
| `rating` | INTEGER | Quality rating 1-5 | 5 |
| `usage_example` | TEXT | When to use | Perfect for intimate dinners |

**Usage:** AI instructions include available effects for room

---

## 🔄 PENDING TABLES (SQL Ready, Not Deployed)

### 🎨 **ui_components** - Dynamic Component System
**Purpose:** Configure which UI components are available  
**SQL File:** dynamic-ui-system.sql

| Column | Type | Purpose |
|--------|------|---------|
| `component_name` | VARCHAR(100) | Component identifier |
| `display_name` | VARCHAR(200) | User-visible name |
| `component_type` | VARCHAR(50) | Type (card, panel, chat) |
| `default_priority` | INTEGER | Display priority 1-10 |

### 👥 **user_component_assignments** - Personalized Layouts
**Purpose:** Which components each guest sees  
**SQL File:** dynamic-ui-system.sql

| Column | Type | Purpose |
|--------|------|---------|
| `user_id` | UUID | Links to profiles |
| `component_id` | UUID | Links to ui_components |
| `priority` | INTEGER | User-specific priority |
| `visible` | BOOLEAN | Show/hide component |

---

## 🔧 DEPLOYMENT INSTRUCTIONS

### Manual Deployment (Current):
1. Copy SQL from .sql files
2. Paste into Supabase SQL Editor  
3. Run to create tables and data

### Automated Deployment (Planned):
```bash
# Set up migrations
npx supabase migration new hotel_system_complete
npx supabase db push

# Deploy on git push
git push → Vercel deploy → Auto-run migrations
```

---

## 🔗 TABLE RELATIONSHIPS

```
auth.users (Supabase built-in)
    ↓
profiles (guest info)
    ↓
guest_entities (preferences) + rooms (room info)
    ↓                              ↓
guest_relations (connections) + devices (WLED controllers)
                                   ↓
                               device_functions (lighting effects)

UI System:
ui_components → user_component_assignments → profiles
ui_text_content (labels and messages)
hotel_services (available services)
layout_configurations (layout rules)
```

**This documentation ensures we understand exactly how the database is structured and how all tables relate to each other.**
