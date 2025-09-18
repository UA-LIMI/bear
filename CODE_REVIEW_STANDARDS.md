# CODE REVIEW STANDARDS & QUALITY SCHEME
**Mandatory standards for Peninsula Hong Kong Hotel AI System**

## 🎯 QUALITY STANDARDS

### ✅ REQUIRED BEFORE ANY CODE CHANGE

#### 1. **Functionality Preservation**
- ✅ Never remove working features
- ✅ Enhance existing functionality, don't replace
- ✅ Test that current features still work after changes
- ✅ Maintain backward compatibility

#### 2. **Database Integration**
- ✅ All data must come from database or external APIs
- ✅ No hardcoded values (hotel names, room numbers, text labels)
- ✅ Proper error handling for database failures
- ✅ Fallback data only when external services fail

#### 3. **TypeScript Compliance**
- ✅ All interfaces properly defined
- ✅ No `any` types unless absolutely necessary
- ✅ Proper error handling with typed exceptions
- ✅ Build must pass without errors (warnings acceptable)

#### 4. **Performance Standards**
- ✅ API calls optimized and cached when appropriate
- ✅ Database queries efficient with proper indexes
- ✅ UI responsive with loading states
- ✅ No blocking operations in main thread

## 🔍 CODE REVIEW PROCESS

### Phase 1: Self-Review Checklist
**Before submitting any code:**

#### Database Integration Review:
- [ ] All text content comes from database or config
- [ ] No hardcoded hotel names, room numbers, or labels
- [ ] Proper error handling for database failures
- [ ] Efficient queries with proper relationships

#### Functionality Review:
- [ ] All existing features still work
- [ ] New features enhance rather than replace
- [ ] User experience improved or maintained
- [ ] No broken links or missing functionality

#### Code Quality Review:
- [ ] TypeScript interfaces complete and accurate
- [ ] Error handling comprehensive
- [ ] Performance optimized
- [ ] Comments explain complex logic only

#### Testing Review:
- [ ] Local build passes without errors
- [ ] All user flows tested manually
- [ ] Database connections verified
- [ ] API endpoints respond correctly

### Phase 2: Documentation Review
**Before deployment:**

#### System Documentation:
- [ ] SYSTEM_STATE_DOCUMENTATION.md updated
- [ ] DATABASE_SCHEMA_DOCUMENTATION.md updated if schema changed
- [ ] New environment variables documented
- [ ] API changes documented with response times

#### Change Documentation:
- [ ] Clear commit message explaining changes
- [ ] TODO list updated with completed tasks
- [ ] Archive section updated if anything removed
- [ ] Deployment instructions clear

### Phase 3: Integration Review
**Before git push:**

#### End-to-End Testing:
- [ ] Guest selection works with all 4 Hong Kong users
- [ ] Voice connection establishes successfully
- [ ] Room lighting controls work with MQTT
- [ ] Weather data loads from API
- [ ] Hotel events display from database
- [ ] Text chat functions with AI Gateway

#### Cross-Feature Testing:
- [ ] Guest switching updates all components
- [ ] Room controls reflect selected guest's room
- [ ] AI context includes complete guest information
- [ ] Session management works properly
- [ ] Error states handled gracefully

## 🚨 COMMON REVIEW FAILURES

### ❌ Automatic Rejection Criteria:

#### 1. **Functionality Loss**
- Removing working features without replacement
- Breaking existing user flows
- Deleting functional code to fix warnings

#### 2. **Hardcoded Content**
- Hotel names, room numbers, or text labels in code
- Mock data that should come from database
- Fixed layouts that should be configurable

#### 3. **Poor Error Handling**
- No fallbacks when APIs fail
- Crashes when database unavailable
- No user feedback for error states

#### 4. **Documentation Failures**
- System state documentation not updated
- Database changes not documented
- No clear explanation of changes

## ✅ REVIEW APPROVAL CRITERIA

### 🎯 Code Quality Standards:
- **Maintainability:** Code is clean, well-organized, and documented
- **Reliability:** Comprehensive error handling and fallbacks
- **Performance:** Efficient database queries and API calls
- **Scalability:** Supports adding new guests, rooms, and features

### 🎯 Integration Standards:
- **Database Driven:** All content configurable via database
- **API Resilience:** Works when external services fail
- **User Experience:** Smooth, responsive, and intuitive
- **Cross-Platform:** Works on desktop and mobile

### 🎯 Documentation Standards:
- **System State:** Always current and accurate
- **Database Schema:** Complete table and relationship documentation
- **Change History:** Clear archive of what changed and why
- **Deployment:** Clear instructions for setup and updates

## 📋 REVIEW WORKFLOW

### Step 1: Developer Self-Review (30 minutes)
- Run through all checklists above
- Test all functionality manually
- Update all documentation
- Prepare clear commit message

### Step 2: System Integration Review (15 minutes)
- Verify system state documentation accuracy
- Check database schema documentation
- Confirm all dependencies working
- Test critical user flows

### Step 3: Quality Assurance (15 minutes)
- Build passes without errors
- Performance meets standards
- Error handling comprehensive
- User experience maintained or improved

**Total Review Time: ~60 minutes per significant change**
**This ensures high quality and prevents system degradation over time.**
