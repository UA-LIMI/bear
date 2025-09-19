#!/bin/bash
# Peninsula Hong Kong Hotel AI System - Complete Database Deployment
# This script deploys the entire database schema and sample data

echo "🏨 Deploying Peninsula Hong Kong Hotel AI Database System..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Initialize Supabase if not already done
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase project..."
    npx supabase init
fi

# Login to Supabase (if not already logged in)
echo "🔑 Checking Supabase authentication..."
npx supabase projects list > /dev/null 2>&1 || {
    echo "Please log in to Supabase:"
    npx supabase login
}

# Link to remote project
echo "🔗 Linking to remote Supabase project..."
echo "Please enter your Supabase project reference ID:"
read -r PROJECT_REF
npx supabase link --project-ref "$PROJECT_REF"

# Push all migrations
echo "📊 Deploying database schema..."
npx supabase db push

# Verify deployment
echo "✅ Verifying database deployment..."
npx supabase db diff

echo "🎉 Database deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify tables created in Supabase dashboard"
echo "2. Check that sample data is present"
echo "3. Test API endpoints: /api/test-supabase"
echo "4. Update SYSTEM_STATE_DOCUMENTATION.md if needed"
echo ""
echo "🔧 To add more data:"
echo "npx supabase migration new add_more_data"
echo "npx supabase db push"
