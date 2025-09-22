# OpenAI Integration Guide
This document provides detailed information about the OpenAI integration in the Luxury Hotel Management System.
## Overview
The system uses OpenAI's API for several AI-powered features:
1. Generating response suggestions for guest requests
2. Creating guest insights and summaries
3. Analyzing guest preferences and behavior
4. Enhancing the knowledge base with AI-generated content
## Current Implementation
The current implementation in `services/openaiService.ts` provides:
1. API key configuration
2. Methods for generating AI responses to guest requests
3. Methods for updating AI context with knowledge base information
4. Utility functions for working with the OpenAI API
## Setting Up OpenAI
### 1. Get an API Key
1. Go to [OpenAI](https://platform.openai.com/) and sign up or log in
2. Navigate to the API section
3. Create an API key
4. Add the key to your `.env` file: