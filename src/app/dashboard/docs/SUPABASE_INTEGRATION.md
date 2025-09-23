# Supabase Integration Guide
This document provides detailed information about the Supabase integration in the Luxury Hotel Management System.
## Overview
The system uses Supabase for:
1. Database storage
2. Real-time updates
3. Authentication (when implemented)
4. File storage (for images)
## Current Implementation
The current implementation in `services/supabaseClient.ts` and `services/dataService.ts` provides:
1. A Supabase client configured with environment variables
2. Type definitions for all database tables
3. Helper functions for real-time subscriptions
4. Data access methods with fallback to mock data
## Database Schema
The system uses the following tables in Supabase:
- `guest_profiles`: Information about hotel guests
- `staff_profiles`: Information about hotel staff
- `rooms`: Room information and status
- `guest_requests`: Guest service requests
- `menu_items`: Food and beverage items
- `knowledge_base`: Hotel information and FAQs
- `notifications`: System notifications
- `guest_ai_summaries`: AI-generated guest insights
## Setting Up Supabase
### 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your project URL and anon key for later use
### 2. Set Up Database Tables
Execute the SQL in the main README.md file in the Supabase SQL Editor to create all necessary tables.
### 3. Configure Environment Variables
Create a `.env` file in the project root with your Supabase credentials: