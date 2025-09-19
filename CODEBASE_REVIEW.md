# Codebase Review

This document contains a detailed review of the entire codebase. Each file and folder is documented with its purpose and contents.

## `archives/` Directory

This directory appears to contain backups and archived versions of different parts of the project. The files are in `.tar.gz` format, which is a compressed archive format.

- `backend-cors-fix.tar.gz`: Likely an archive of the backend with a CORS fix.
- `backend-deploy.tar.gz`: Likely an archive of the backend ready for deployment.
- `backend-final-fix.tar.gz`: Likely an archive of the backend with a final fix.
- `backend-fixed.tar.gz`: Likely an archive of a fixed version of the backend.
- `limi-ai-backend-fixed.tar.gz`: Likely an archive of a fixed version of the "limi-ai-backend".
- `limi-ai-backend-latest.tar.gz`: Likely an archive of the latest version of the "limi-ai-backend".
- `pi-voice-assistant.tar.gz`: Likely an archive of the "pi-voice-assistant" component.

## `backend/` Directory

The `backend/` directory contains the Node.js/Express backend service for the Limi AI application. It acts as a Backend-for-Frontend (BFF), securely managing interactions with AI services like OpenAI.

### Files and Subdirectories

#### `Dockerfile`

This file defines the Docker image for the backend service. It uses a multi-stage build process based on the `node:18-alpine` image for a smaller production image. It sets up the working directory, installs dependencies, creates a non-root user for security, and defines the command to start the application. It also includes a `HEALTHCHECK` instruction.

#### Documentation (`.md` files)

The backend is well-documented through several Markdown files:

-   **`README.md`**: Provides a comprehensive overview of the backend service, including setup instructions, API documentation for health checks and other endpoints, security features, architecture details, and deployment guidelines.
-   **`INTEGRATION_GUIDE.md`**: A detailed guide for integrating the backend with various frontend frameworks (React, Vue, Vanilla JS) and other applications (React Native, Electron). It includes code examples, architectural diagrams, and API specifications.
-   **`LESSONS_LEARNED.md`**: Documents key lessons learned during the development process, covering topics like routing patterns, environment variable management, and security best practices.
-   **`REVIEW.md`**: A progress summary of the backend infrastructure setup, detailing completed and pending tasks.
-   **`STANDARDIZATION_SUMMARY.md`**: Summarizes the efforts to standardize the backend architecture, focusing on logging, input validation, and health checks, aligning with industry best practices.

#### Other files

- **`backend-final-fix.tar.gz`**: Another archive file, likely a backup.

#### `package.json`

This file defines the project's metadata and dependencies.

-   **`name`**: `limi-ai-backend`
-   **`version`**: `1.0.0`
-   **`description`**: "Backend service for Limi AI - Secure AI Gateway and Voice Services"
-   **`main`**: `src/index.js`
-   **`scripts`**:
    -   `start`: Runs the application using `node`. It uses the `-r dotenv/config` flag to load environment variables.
    -   `dev`: Runs the application using `nodemon` for automatic restarts during development.
    -   `test`: An empty test script.
-   **`dependencies`**:
    -   `@ai-sdk/gateway`: Vercel AI SDK gateway.
    -   `axios`: For making HTTP requests.
    -   `cors`: For handling Cross-Origin Resource Sharing.
    -   `dotenv`: For loading environment variables from a `.env` file.
    -   `express`: The web framework.
    -   `express-rate-limit`: For rate limiting requests.
    -   `express-validator`: For input validation.
    -   `helmet`: For securing Express apps by setting various HTTP headers.
    -   `morgan`: For logging HTTP requests.
    -   `mqtt`: MQTT client for messaging.
    -   `winston`: A logger for just about everything.
    -   `zod`: TypeScript-first schema validation.
-   **`devDependencies`**:
    -   `nodemon`: For automatically restarting the server during development.

#### `test-comprehensive.js`

This file contains a comprehensive testing suite for the backend. It uses `axios` to make requests to the running server and validates various features.

-   **Test Structure**: It includes functions to test:
    -   Health Check Endpoints (`/healthz`, `/readyz`, `/live`, `/status`)
    -   Input Validation (for AI requests, pagination, etc.)
    -   Rate Limiting
    -   Logging Consolidation (request ID generation, error logging)
    -   Security Features (CORS, Helmet headers, input sanitization)
    -   Error Handling (404, malformed JSON)
-   **Execution**: The script runs all tests and provides a summary of passed and failed tests, along with a success rate.

#### `src/` Directory

This is the main source code directory for the backend application.

-   **`index.js`**: The main entry point for the server. It initializes the Express application, loads the configuration, and starts the server. It also includes graceful shutdown logic for `SIGTERM` and `SIGINT` signals, as well as handlers for uncaught exceptions and unhandled promise rejections.

-   **`app.js`**: The core Express application setup file. It configures all middleware in the correct order:
    1.  `helmet` for security headers.
    2.  `cors` for Cross-Origin Resource Sharing.
    3.  `express.json` and `express.urlencoded` for request body parsing.
    4.  `morgan` and a custom `winston` logger for request logging.
    5.  A middleware to add a unique `X-Request-ID` to each request for tracing.
    6.  `sanitizeInput` for preventing XSS.
    7.  Rate limiting middleware.
    
    It then sets up the application's routes and finishes with a 404 handler and a centralized error-handling middleware.

-   **`config/`**: This directory contains the application's configuration.
    -   **`index.js`**: A central module that exports all configuration-related functions.
    -   **`env.js`**: Manages environment variables. It uses `dotenv` to load variables from a `.env` file, validates that all required variables are present, and provides default values for optional ones. It also includes a function to sanitize sensitive values for logging.
    -   **`models.js`**: Defines a list of supported AI models from various providers (OpenAI, Anthropic, Google, etc.). This is used for validation and configuration of the Vercel AI Gateway proxy.

-   **`middleware/`**: Contains Express middleware functions.
    -   **`logger.js`**: Sets up `winston` for structured logging. It includes a `requestLogger` to log incoming requests and their responses, an `errorLogger` to log any errors that occur, and a `securityLogger` for security-related events. In production, it's configured to write logs to files.
    -   **`rateLimiter.js`**: Implements rate limiting using `express-rate-limit`. It defines different limiters for general use, AI-related endpoints, and authentication, with more generous limits in development.
    -   **`validation.js`**: Provides input validation and sanitization using `express-validator`. It defines reusable validation rules for common data types (IDs, emails, passwords, etc.) and specific validation chains for different API endpoints. It also includes a middleware to sanitize input to prevent XSS attacks.
    -   **`auth.js`**: An empty file, presumably for future authentication middleware.

-   **`routes/`**: Defines the API routes for the application.
    -   **`health.js`**: Sets up the health check endpoints (`/healthz`, `/readyz`, `/live`, and `/status`). These routes provide information about the service's status, including memory usage, environment variable validation, and API key presence.
    -   **`test.js`**: Contains routes used for demonstrating and testing the input validation middleware.
    -   **`openai.js`**: Handles routes related to the OpenAI Realtime API. The main endpoint is `POST /api/client-secret`, which generates an ephemeral client secret for the frontend to connect directly to OpenAI's voice service. It includes validation, rate limiting, and detailed logging.
    -   **`aiProxy.js`**: Implements a secure proxy to the Vercel AI Gateway. This route (`POST /api/ai-proxy`) forwards requests from the client to the Vercel AI Gateway, injecting the necessary API key on the backend so it's not exposed. It includes authentication middleware, input validation, and a retry mechanism with exponential backoff.

-   **`services/`**: Contains business logic separated from the route handlers.
    -   **`openaiService.js`**: A centralized service for interacting with the OpenAI Realtime API. It handles the logic for generating ephemeral client secrets, including caching the tokens to improve performance and reduce redundant API calls. It also includes methods for checking the health of the OpenAI API and retrieving service statistics.

-   **`utils/`**: Utility functions.
    -   **`sanitizer.js`**: Provides a `sanitizeObject` function that recursively traverses an object and masks sensitive fields (like `apiKey`, `secret`, `password`, `token`) for safe logging.

-   **Other Test Files**:
    -   **`test-config.js`**: A simple script that loads the environment configuration and logs it to the console, verifying that the configuration is loaded correctly.
    -   **`test-rate-limit.js`**: A script for testing the rate-limiting middleware. It makes a series of requests to demonstrate that the rate limiter is working as expected and that health check endpoints are correctly exempted.

## `configs/` Directory

This directory contains various configuration files for different parts of the project, including the frontend, backend, and external services.

-   **`Caddyfile-updated`**: A configuration file for the Caddy web server. It sets up reverse proxies for `homeassistant` and the `coreflux-mcp-server`.
-   **`components.json`**: A configuration file for `shadcn/ui`, a UI component library. It defines the styling, component aliases, and other settings for the UI components.
-   **`env-variables-needed.md`**: A markdown file that lists the necessary environment variables for the MCP Server, including Supabase and MQTT configurations.
-   **`next.config.ts`**: The configuration file for the Next.js frontend. It's currently a boilerplate file with no custom configuration.
-   **`opencode.json`**: A configuration file for `opencode.ai`, defining settings for the `task-master-ai` MCP tool, including API keys for various AI services.
-   **`package.json`**: This `package.json` seems to be for the frontend application, given the Next.js, React, and various UI-related dependencies. It defines scripts for development, building, linting, and interacting with a Supabase database.
-   **`supabase-env-template.txt`**: A template for Supabase and MQTT environment variables.
-   **`tsconfig.json`**: The TypeScript configuration file for the project. It sets up compiler options, including paths aliases, and specifies which files to include and exclude.

## `database/` Directory

This directory contains all database-related files for the project, centered around a Supabase (PostgreSQL) database.

-   **`README.md`**: Provides an excellent overview of the database system. It details the folder structure, gives an overview of the core tables, summarizes the deployment status, and outlines integration points with the frontend and external services. It also covers critical notes on security, performance, and maintenance.

-   **`documentation/`**: Contains detailed documentation for the database schema.
-   **`examples/`**: Contains sample data and queries for reference.
-   **`migrations/`**: Holds version-controlled database schema changes to be applied via the Supabase CLI.
-   **`scripts/`**: Contains individual SQL scripts for various manual database operations, such as setting up devices, UI components, and populating data.

## `docs/` Directory

This directory contains a rich set of documentation covering the project's architecture, development processes, AI agent instructions, and deployment guides.

-   **Agent Instructions (`AGENT.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`)**: These files provide detailed instructions for AI agents, particularly for integrating with a "Task Master AI" tool. They cover a wide range of topics from command-line usage and MCP integration to best practices for an AI-assisted development workflow. The content is largely similar across these files, likely tailored for different AI models.

-   **Deployment Guides**:
    -   **`PI_DEPLOYMENT_GUIDE.md`**: A manual for deploying a voice assistant to a Raspberry Pi Zero 2 W.
    -   **`deploy-supabase-schema.md`**: A step-by-step guide to deploying the database schema to Supabase.

-   **Project Overviews**:
    -   **`README.md`**: The main README for the `docs` directory, providing an overview of the documentation structure.
    -   **`REPOSITORY_REVIEW.md`**: A high-level review of the entire repository, analyzing the architecture, file structure, and features, and providing recommendations.

-   **OpenAI Agent Specifics**:
    -   **`openai-agent-instructions.md`**: Instructions for the Hotel AI Assistant, focusing on its tools for location and context management.
    -   **`openai-system-prompt-structure.md`**: A detailed system prompt for the OpenAI agent, outlining its identity, tools, and conversation protocols.

-   **Product and Processes**:
    -   **`prd.txt`**: An empty file, likely a placeholder for a Product Requirements Document.
    -   **`processes/`**: Contains documents related to development processes.
        -   **`CHANGE_TRACKING_PROCESS.md`**: Outlines a mandatory process for tracking all changes to the system, emphasizing the importance of keeping the `SYSTEM_STATE_DOCUMENTATION.md` up to date.
        -   **`CODE_REVIEW_STANDARDS.md`**: Defines the quality standards and code review process for the project, including checklists for self-review, documentation review, and integration review.
        -   **`PROJECT_RULES.md`**: Lists critical, mandatory rules for development, such as never removing working functionality and making everything database-driven.
    -   **`system/`**: Contains system-level documentation.
        -   **`SYSTEM_STATE_DOCUMENTATION.md`**: A living document that tracks the current state of the entire system, including database schema, Vercel configuration, API endpoints, and page status. It also has an archive section for removed components and past approaches.
    -   **`api/`**: This subdirectory is currently empty.

## `examples/` Directory

This directory contains example code and projects that demonstrate various integrations and use cases.

-   **ESP32 Firmware**:
    -   **`ESP32_LIMI_AI_Client/`**: (Directory, not reviewed)
    -   **`ESP32_LIMI_AI_Client_Fixed.ino`**: An Arduino sketch for an ESP32-S3-Korvo-2 board, acting as a voice assistant client. It connects to the backend to get an ephemeral token and then establishes a WebSocket connection with the OpenAI Realtime API for voice interaction.
    -   **`ESP32_LIMI_AI_HTTP_Client.ino`**: An alternative ESP32 client that uses HTTP requests for text-based AI conversations instead of a WebSocket connection for voice.

-   **`pi-voice-assistant/`**: A project for a voice assistant running on a Raspberry Pi. It includes Python scripts for wake word detection, an OpenAI Realtime API client, MQTT tools for light control, and an installation script.

-   **`vercel-ai-gateway-integration.md`**: A markdown file outlining a strategy for integrating with the Vercel AI Gateway. It proposes converting the MCP server tools into OpenAI function definitions and using a unified tool execution handler.

## `frontend-v2/` Directory

This directory appears to be an abandoned attempt at a second frontend. It contains the basic structure of a Next.js project, but the `src/app` and `src/components` directories are empty, indicating that no actual development took place.

## `mcp/` Directory

This directory contains Docker configuration for a Redis-based MCP (Model Context Protocol) server.

-   **`Dockerfile`**: Defines a Docker image that installs and runs the `@mcp/redis-server` package from npm.
-   **`docker-compose.yml`**: A Docker Compose file that sets up two services: `redis-mcp-server` and `redis`. It configures the MCP server to connect to the Redis instance and exposes the necessary ports.

## `mqtt-mcp-server/` Directory

This directory contains a `docker-compose.yml` file for deploying a Coreflux MQTT MCP server. This server acts as a bridge between the Model Context Protocol and an MQTT broker, likely used for controlling IoT devices like the hotel room lighting.

## `public/` Directory

This directory holds static assets for the frontend application.

-   **SVG Images**: It contains several SVG files, including `limi-logo.svg`, `next.svg`, and `vercel.svg`, which are likely used for branding and UI elements.
-   **`PNG/` Subdirectory**: This folder contains a large collection of PNG images, which appear to be different variations of the "Limi AI" logo (icon, wordmark, primary logo, etc.) in various colors (black, white, colored, inverted).

## `scripts/` Directory

This directory contains various scripts for deployment, testing, and managing services with Docker Compose.

-   **`deploy-database.sh`**: A shell script that automates the deployment of the database schema to Supabase. It checks for the Supabase CLI, initializes a project if necessary, and pushes the migrations.
-   **`docker-compose-updated.yml`** and **`root-docker-compose.yml`**: These appear to be identical Docker Compose files for setting up a multi-container environment with `homeassistant`, `caddy`, and the `coreflux-mcp-server`.
-   **`test-supabase-connection.js`**: A Node.js script to test the connection to the Supabase database. It verifies the presence of environment variables and checks if the required tables exist.

## `src/` Directory (Frontend)

This directory contains the source code for the main frontend application, built with Next.js.

-   **`README.md`**: Provides a detailed overview of the frontend application, including the folder structure, key features, technical architecture, and development workflow. It highlights the `/guest/page.tsx` as the main feature.

-   **`app/`**: The core of the Next.js application, containing pages and API routes.
-   **`components/`**: Contains reusable React components.
-   **`lib/`**: Holds utility and helper functions.
-   **`next-env.d.ts`**: TypeScript declaration file for Next.js.

## `supabase/` Directory

This directory contains configuration for the Supabase project.

-   **`config.toml`**: The main configuration file for the local Supabase development environment. It defines settings for the API, database, authentication, and other Supabase services.
-   **`migrations/`**: This directory is currently empty, but it's intended to hold database migration files generated by the Supabase CLI.

## Root Directory Files

The root directory contains several important files for the project's configuration and documentation.

-   **`README.md`**: The main README for the entire project. It provides a high-level overview of the "LIMI AI x Hotels" platform, a quick start guide for guests and developers, and a summary of the monorepo structure.
-   **`TODO_LIST.md`**: A detailed to-do list for the project, broken down into critical tasks and future enhancements. It also includes a list of completed tasks and an overview of the system architecture.
-   **`eslint.config.mjs`**: The configuration file for ESLint, a linter for JavaScript and TypeScript.
-   **`postcss.config.mjs`**: The configuration file for PostCSS, a tool for transforming CSS with JavaScript.
-   **`tsconfig.tsbuildinfo`**: A file generated by TypeScript to speed up incremental builds. It's not meant to be edited manually.
