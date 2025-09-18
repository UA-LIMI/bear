# PENINSULA HONG KONG PROJECT RULES
**Mandatory rules for all development work**

## 🚨 CRITICAL RULES (Never Break These)

### 1. **NEVER REMOVE WORKING FUNCTIONALITY**
- ✅ Enhance existing features, don't replace them
- ✅ Add new capabilities alongside current ones
- ✅ If something works, keep it working
- ❌ Don't delete working code to fix warnings
- ❌ Don't remove features to simplify implementation

### 2. **DATABASE-DRIVEN EVERYTHING**
- ✅ All content must come from database or external APIs
- ✅ Hotel names, room numbers, labels from database
- ✅ Guest information from Supabase profiles
- ❌ No hardcoded hotel names or room assignments
- ❌ No mock data that should be real data

### 3. **DOCUMENTATION ALWAYS CURRENT**
- ✅ Update SYSTEM_STATE_DOCUMENTATION.md after every change
- ✅ Update DATABASE_SCHEMA_DOCUMENTATION.md for schema changes
- ✅ Follow CHANGE_TRACKING_PROCESS.md for all changes
- ❌ Don't make changes without updating documentation
- ❌ Don't commit without explaining what changed

### 4. **TEST BEFORE DEPLOY**
- ✅ Run `npm run build` locally before git push
- ✅ Test all user flows manually
- ✅ Verify database connections work
- ❌ Don't push code that doesn't build locally
- ❌ Don't assume Vercel will handle build issues

## 🎯 DEVELOPMENT WORKFLOW

### Phase 1: Planning (Required)
1. **Check system state** documentation for current status
2. **Review TODO list** for planned changes
3. **Verify compatibility** with existing architecture
4. **Plan testing approach** for changes

### Phase 2: Implementation (Careful)
1. **Make small changes** and test frequently
2. **Preserve existing functionality** while enhancing
3. **Update documentation** as you go
4. **Test build** after significant changes

### Phase 3: Review (Mandatory)
1. **Run code review checklist** from CODE_REVIEW_STANDARDS.md
2. **Update system documentation** with all changes
3. **Test complete system** end-to-end
4. **Commit with detailed message** explaining changes

### Phase 4: Deployment (Verified)
1. **Final build test** to ensure no errors
2. **Verify all dependencies** are documented
3. **Push to git** with confidence
4. **Monitor deployment** for issues

## 🗄️ DATABASE MANAGEMENT RULES

### Schema Changes:
- ✅ Use Supabase migrations for version control
- ✅ Document all table changes in database documentation
- ✅ Test schema changes in development first
- ❌ Don't make direct production database changes
- ❌ Don't create tables without proper documentation

### Data Management:
- ✅ Use proper foreign key relationships
- ✅ Enable Row Level Security (RLS) for all tables
- ✅ Create proper indexes for performance
- ❌ Don't store sensitive data without encryption
- ❌ Don't create orphaned records without relationships

## 🌐 API DEVELOPMENT RULES

### Endpoint Creation:
- ✅ Use existing patterns from working endpoints
- ✅ Implement proper error handling and status codes
- ✅ Document response formats and dependencies
- ❌ Don't create endpoints that duplicate existing functionality
- ❌ Don't build complex endpoints when simple ones work

### Integration:
- ✅ Reuse existing database connections
- ✅ Follow established authentication patterns
- ✅ Maintain consistent response formats
- ❌ Don't create new authentication methods
- ❌ Don't break existing API contracts

## 🎨 UI DEVELOPMENT RULES

### Component Design:
- ✅ Use existing design system and color schemes
- ✅ Maintain responsive design for all screen sizes
- ✅ Implement proper loading and error states
- ❌ Don't create inconsistent UI patterns
- ❌ Don't remove accessibility features

### State Management:
- ✅ Keep related state in same component
- ✅ Use proper TypeScript interfaces
- ✅ Implement proper cleanup for resources
- ❌ Don't create unnecessary state complexity
- ❌ Don't share state inappropriately between components

## 🤖 AI INTEGRATION RULES

### System Prompts:
- ✅ Build instructions from database content
- ✅ Include complete guest context and room information
- ✅ Provide detailed tool usage examples
- ❌ Don't use hardcoded instructions
- ❌ Don't send incomplete context to AI

### Tool Integration:
- ✅ Follow OpenAI Realtime API documentation exactly
- ✅ Implement proper session management
- ✅ Handle tool call errors gracefully
- ❌ Don't invent new protocols or patterns
- ❌ Don't ignore session cleanup requirements

## 📋 QUALITY GATES

### Before Code Review:
- [ ] All critical rules followed
- [ ] Documentation updated
- [ ] Local build passes
- [ ] Manual testing completed

### Before Deployment:
- [ ] Code review checklist completed
- [ ] System state documentation current
- [ ] All dependencies verified
- [ ] Rollback plan prepared

### After Deployment:
- [ ] System functionality verified
- [ ] Performance metrics checked
- [ ] Error monitoring active
- [ ] User feedback collected

## 🚨 VIOLATION CONSEQUENCES

### Minor Violations (Warnings):
- **Unused imports** - Optimize but don't break functionality
- **Hardcoded fallback data** - Replace with database when possible
- **Missing comments** - Add for complex logic only

### Major Violations (Must Fix):
- **Removing working features** - Restore functionality immediately
- **Breaking database integration** - Fix database connections
- **Ignoring error handling** - Implement proper error management

### Critical Violations (Block Deployment):
- **Build failures** - Must resolve before any deployment
- **Security vulnerabilities** - Address immediately
- **Data loss risks** - Review and mitigate before proceeding

**These rules ensure the Peninsula Hong Kong hotel AI system maintains high quality and reliability as it grows in complexity.**
