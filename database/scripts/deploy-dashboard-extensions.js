#!/usr/bin/env node

/**
 * Deploy Dashboard Extensions to Supabase
 * Creates the missing tables needed for the luxury hotel dashboard
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_KEY:', !!supabaseServiceKey);
  console.error('\n💡 Add these to your .env file or Vercel environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployDashboardExtensions() {
  try {
    console.log('🚀 Deploying dashboard extensions to Supabase...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'dashboard-extensions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`   ${i + 1}/${statements.length} Executing...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`   ⚠️  Warning on statement ${i + 1}:`, error.message);
          // Continue with other statements
        } else {
          console.log(`   ✅ Statement ${i + 1} completed`);
        }
      } catch (err) {
        console.warn(`   ⚠️  Error on statement ${i + 1}:`, err.message);
        // Continue with other statements
      }
    }
    
    console.log('\n🎉 Dashboard extensions deployment completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify tables in Supabase dashboard');
    console.log('   2. Test dashboard with real data');
    console.log('   3. Add sample data if needed');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Alternative: Manual SQL execution instructions
function showManualInstructions() {
  console.log('\n📋 MANUAL DEPLOYMENT INSTRUCTIONS:');
  console.log('\n1. Open your Supabase dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and paste the contents of database/scripts/dashboard-extensions.sql');
  console.log('4. Execute the SQL statements');
  console.log('\nThis will create the missing tables for:');
  console.log('   - Staff management');
  console.log('   - Guest requests');
  console.log('   - Menu management');
  console.log('   - Knowledge base');
  console.log('   - Notifications');
  console.log('   - Room status tracking');
}

// Run deployment
if (require.main === module) {
  deployDashboardExtensions().catch(error => {
    console.error('\n❌ Deployment script failed:', error);
    console.log('\n📋 You can also deploy manually:');
    showManualInstructions();
    process.exit(1);
  });
}

module.exports = { deployDashboardExtensions, showManualInstructions };
