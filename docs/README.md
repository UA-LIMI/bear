# DOCUMENTATION - Peninsula Hong Kong Hotel AI System
**Complete documentation for hotel guest experience platform**

## 📚 DOCUMENTATION OVERVIEW
This folder contains all project documentation, processes, and system information for the Peninsula Hong Kong Hotel AI System.

## 📁 FOLDER STRUCTURE

### `/system/` - System Documentation
**Purpose:** Current system state, architecture, and configuration
**Files:**
- `SYSTEM_STATE_DOCUMENTATION.md` - Complete system overview with current/archive sections

**What's Inside:**
- Database table status and record counts
- Vercel environment variable configuration
- API endpoint status and response times
- Page integration status and dependencies
- Data flow architecture diagrams
- Automation status and manual processes

### `/processes/` - Development Processes
**Purpose:** Rules, standards, and processes for development work
**Files:**
- `PROJECT_RULES.md` - Critical rules that must never be broken
- `CODE_REVIEW_STANDARDS.md` - Quality standards and review workflow
- `CHANGE_TRACKING_PROCESS.md` - Mandatory process for all changes

**What's Inside:**
- Development workflow guidelines
- Quality gates and review checklists
- Change documentation requirements
- Error handling standards
- Database integration rules

### `/api/` - API Documentation
**Purpose:** Documentation for all API endpoints and integrations
**Files:** (To be created)
- `API_ENDPOINTS.md` - Complete API documentation
- `INTEGRATION_GUIDE.md` - External service integration
- `AUTHENTICATION.md` - Auth flow and security

## 🎯 HOW TO USE THIS DOCUMENTATION

### Before Making Any Changes:
1. **Read system documentation** - Understand current state
2. **Review project rules** - Ensure compliance with guidelines
3. **Check change process** - Follow mandatory change tracking

### During Development:
1. **Follow code review standards** - Maintain quality
2. **Update documentation** - Keep system state current
3. **Track changes** - Document what changed and why

### After Deployment:
1. **Update system state** - Reflect new configuration
2. **Archive old information** - Move outdated info to archive section
3. **Test documentation** - Verify accuracy of documented system

## 📊 SYSTEM QUICK REFERENCE

### Current Status:
- **✅ 1186-line guest interface** - Complete hotel experience
- **✅ Supabase database** - 18 tables with Hong Kong guest data
- **✅ Voice AI integration** - OpenAI Realtime via VPS backend
- **✅ Room controls** - MQTT lighting with 20+ WLED effects
- **✅ Dynamic UI system** - Database-configurable layouts

### Environment Variables:
- **✅ Supabase** - Database connection working
- **✅ MQTT** - Lighting control working
- **❌ Weather API** - Need to add NEXT_PUBLIC_WEATHER_API_KEY
- **❌ AI Gateway** - Need to add NEXT_PUBLIC_AI_GATEWAY_API_KEY

### Database Deployment:
```bash
# Deploy complete schema:
./deploy-database.sh

# Test connection:
curl https://bear-beige.vercel.app/api/test-supabase
```

## 🔗 RELATED FOLDERS

- **`/database/`** - Database schema, migrations, and SQL scripts
- **`/src/`** - Frontend application code and components
- **`/supabase/`** - Supabase configuration and local development
- **`/.taskmaster/`** - Task management and research documentation

---

**This documentation system ensures clear understanding of the Peninsula Hong Kong Hotel AI System for all team members and future development work.**
