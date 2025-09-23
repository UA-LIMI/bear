# Luxury Hotel Management System
A comprehensive hotel management system with real-time guest requests, room controls, and AI-powered insights.

## Overview
This application provides a complete management solution for luxury hotels, featuring:
- Real-time guest request management
- Smart room controls (IoT integration)
- AI-powered guest insights and response suggestions
- Staff management and task assignment
- Room status monitoring
- Menu and dining management
- Knowledge base for hotel information

## System Architecture
The system consists of several interconnected components:
1. **Frontend Interface**: React-based dashboard with multiple panels
2. **Data Services**: Supabase integration for database and real-time updates
3. **IoT Integration**: MQTT client for room control devices
4. **AI Services**: OpenAI integration for guest insights and response suggestions

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Supabase account
- OpenAI API key (for AI features)
- MQTT broker (for production IoT integration)

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the development server:
   ```
   npm start
   ```

## Supabase Setup
This application uses Supabase as its backend database and real-time engine. Follow these steps to set up your Supabase project:

### 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your project URL and anon key for later use

### 2. Set Up Database Tables
Execute the following SQL in the Supabase SQL Editor to create the necessary tables: