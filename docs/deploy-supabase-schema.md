# 🚀 Deploy Hotel Context Database Schema to Supabase

## **Step 1: Access Your Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your **`supabase-emerald-queen`** project
3. Navigate to **SQL Editor** in the left sidebar

## **Step 2: Deploy the Schema**

### **Option A: Copy & Paste (Recommended)**

1. Open the `database-schema.sql` file in this project
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** to execute

### **Option B: Upload File**

1. In Supabase SQL Editor, click **"New Query"**
2. Use the upload option to upload `database-schema.sql`
3. Click **"Run"** to execute

## **Step 3: Verify Deployment**

After running the schema, you should see these tables created:

### **Core Tables:**
- ✅ `profiles` - User profiles extending auth.users
- ✅ `agent_types` - Available AI agents
- ✅ `agent_executions` - Agent execution logs

### **Context System Tables:**
- ✅ `guest_entities` - Guest information entities
- ✅ `guest_relations` - Relationships between entities
- ✅ `guest_summaries` - AI-generated summaries
- ✅ `guest_patterns` - Behavioral patterns
- ✅ `guest_recommendations` - Personalized suggestions
- ✅ `guest_research` - Background research data

### **Conversation Tables:**
- ✅ `conversation_sessions` - Chat sessions
- ✅ `conversation_interactions` - Individual messages

## **Step 4: Configure Row Level Security**

The schema includes RLS policies. Verify they're active:

1. Go to **Authentication > Policies** in Supabase
2. You should see policies for each table
3. All policies should be **enabled**

## **Step 5: Get Your Connection Details**

1. Go to **Settings > API** in your Supabase project
2. Copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
```

3. Add them to your `.env` file in the project root

## **Step 6: Test the Connection**

Run this in your terminal to test the connection:

```bash
# Install Supabase CLI if needed
npm install -g @supabase/cli

# Test connection (replace with your project URL)
supabase db diff --db-url="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## **🚨 If You Get Errors:**

### **UUID Extension Error:**
```sql
-- Run this first if you get UUID errors:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Auth Schema Error:**
The schema assumes Supabase's built-in `auth.users` table exists. This should be automatic, but if you get errors, enable Authentication in your Supabase project settings.

### **Permission Errors:**
Make sure you're using the **Service Key** (not anon key) for schema deployment.

## **✅ Success Indicators:**

- No error messages in SQL Editor
- All tables visible in **Database > Tables**
- RLS policies visible in **Authentication > Policies**
- Can insert test data without errors

## **🎯 Next Steps After Deployment:**

1. **Update your `.env`** with Supabase credentials
2. **Test authentication** with the auth functions we created
3. **Create test users** (Umer, Taylor, Karen, Sarah)
4. **Deploy MCP Memory Server** with database connection

---

**Need help?** The schema is designed to be idempotent - you can run it multiple times safely. If something goes wrong, you can drop the tables and re-run the schema.
