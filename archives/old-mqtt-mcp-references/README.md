# Archived: Old MQTT MCP References

**Date Archived**: September 30, 2025

## What Was Archived

This folder contains references to an old CoreFlux MQTT MCP server that is NOT part of the current project:

- `mqtt-mcp-server/` - Old MCP server configuration for MQTT
- `docker-compose-updated.yml` - Docker compose with CoreFlux MQTT MCP references

## Why Archived

These were from an earlier project iteration and are no longer relevant to the current LIMI AI hotel guest experience platform.

## Current Architecture

The current project uses:

1. **Guest App** (Vercel)
2. **Staff Dashboard** (Vercel)
3. **Backend Service** (VPS Port 3001) - Token generation
4. **Service Request MCP** (VPS Port 4000) - Database tools
5. **Supabase Database**
6. **MQTT Broker** (mqtt.limilighting.com) - External service for room controls, NOT an MCP server

## Note

The MQTT broker (mqtt.limilighting.com) is a separate external server for room device controls. It is NOT an MCP server - it's just a standard MQTT broker used for WLED lighting control.

