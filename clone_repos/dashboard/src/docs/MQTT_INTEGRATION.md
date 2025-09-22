# MQTT Integration Guide
This document provides detailed information about the MQTT integration in the Luxury Hotel Management System.
## Overview
The system uses MQTT (Message Queuing Telemetry Transport) to communicate with IoT devices in hotel rooms, such as:
- Lights
- Air conditioning
- Thermostats
- Curtains
- Do Not Disturb indicators
## Current Implementation
The current implementation in `services/mqttService.ts` is a mock implementation that simulates MQTT functionality without actually connecting to a broker. This is useful for development and testing purposes.
### Mock Implementation Details
- The mock implementation simulates connecting to an MQTT broker
- It provides methods for subscribing to topics and publishing messages
- It maintains a local registry of callbacks for different topics
- It doesn't actually send or receive any messages over the network
## Real Implementation Requirements
To implement a real MQTT integration, you'll need:
1. An MQTT broker (e.g., Mosquitto, HiveMQ, AWS IoT Core)
2. MQTT client library for JavaScript/TypeScript
3. IoT devices that support MQTT communication
## Implementation Steps
### 1. Set Up an MQTT Broker
You can set up an MQTT broker in several ways:
- **Self-hosted**: Install Mosquitto or another MQTT broker on your server
- **Cloud-based**: Use services like HiveMQ Cloud, AWS IoT Core, or Azure IoT Hub
- **Managed service**: Use a managed MQTT service like CloudMQTT
### 2. Install MQTT Client Library