/*
 * ESP32-S3-Korvo-2 LIMI AI Voice Assistant Client - HTTP VERSION
 * Alternative implementation using HTTP requests instead of WebSocket
 * 
 * This version uses your backend's HTTP API for text-based AI conversations
 * More stable than WebSocket for ESP32, good for testing and development
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <driver/i2s.h>
#include <Wire.h>

// ===================================
// CONFIGURATION - UPDATE THESE!
// ===================================

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// LIMI AI Backend HTTP server
const char* backend_server = "145.79.10.35";  // Your VPS IP
const int backend_port = 3001;  // Your backend HTTP port

// Guest profile for contextual AI
const char* guest_name = "Hotel Guest";
const char* guest_type = "vip";  // standard, vip, platinum, suite
const char* room_number = "2847";

// ===================================
// HARDWARE CONFIGURATION
// ===================================

// ESP32-S3-Korvo-2 V3.1 pin definitions
#define I2C_SDA_PIN     17
#define I2C_SCL_PIN     18
#define PA_CTRL_PIN     48  // Power amplifier control
#define BOOT_KEY_PIN    0   // Boot button for interaction

// I2C addresses
#define ES8311_ADDR     0x18  // Audio codec
#define ES7210_ADDR     0x40  // ADC for microphones

// ===================================
// GLOBAL STATE
// ===================================

bool buttonPressed = false;
String sessionId = "";
unsigned long lastInteraction = 0;

// ===================================
// SETUP
// ===================================

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n\n=== LIMI AI HTTP Client ===");
    Serial.println("ESP32-S3-Korvo-2 V3.1 HTTP Version");
    Serial.printf("ESP32 Chip: %s\n", ESP.getChipModel());
    Serial.printf("Free Heap: %d bytes\n", ESP.getFreeHeap());
    
    // Initialize GPIO
    Serial.println("\n1. Initializing GPIO...");
    pinMode(BOOT_KEY_PIN, INPUT_PULLUP);
    pinMode(PA_CTRL_PIN, OUTPUT);
    digitalWrite(PA_CTRL_PIN, HIGH); // Enable power amplifier
    Serial.println("   ✓ GPIO initialized");
    
    // Initialize I2C for basic audio chip detection
    Serial.println("\n2. Initializing I2C...");
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN, 100000);
    delay(100);
    scanI2CDevices();
    Serial.println("   ✓ I2C initialized");
    
    // Connect to WiFi
    Serial.println("\n3. Connecting to WiFi...");
    connectToWiFi();
    
    // Generate session ID
    sessionId = "esp32_http_" + String(ESP.getEfuseMac(), HEX) + "_" + String(millis());
    
    Serial.println("\n=== Setup Complete ===");
    Serial.println("Press BOOT button to send test message to LIMI AI");
    Serial.printf("Session ID: %s\n", sessionId.c_str());
}

// ===================================
// MAIN LOOP
// ===================================

void loop() {
    handleButton();
    
    // Print status every 30 seconds
    static unsigned long lastStatus = 0;
    if (millis() - lastStatus > 30000) {
        lastStatus = millis();
        printStatus();
    }
    
    delay(100);
}

// ===================================
// NETWORK FUNCTIONS
// ===================================

void connectToWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    
    Serial.printf("   Connecting to %s", ssid);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.printf("   ✓ Connected! IP: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("   Signal strength: %d dBm\n", WiFi.RSSI());
        
        // Test backend connectivity
        testBackendConnection();
    } else {
        Serial.println();
        Serial.println("   ✗ WiFi connection failed!");
    }
}

void testBackendConnection() {
    Serial.println("\n4. Testing backend connection...");
    
    HTTPClient http;
    String url = "http://" + String(backend_server) + ":" + String(backend_port) + "/healthz";
    
    http.begin(url);
    http.setTimeout(5000);
    
    int httpCode = http.GET();
    
    if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        Serial.printf("   ✓ Backend accessible: %s\n", response.c_str());
    } else {
        Serial.printf("   ✗ Backend not accessible (HTTP %d)\n", httpCode);
    }
    
    http.end();
}

void sendAIRequest(String userMessage) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[AI] ✗ No WiFi connection");
        return;
    }
    
    Serial.printf("[AI] Sending message: %s\n", userMessage.c_str());
    
    HTTPClient http;
    String url = "http://" + String(backend_server) + ":" + String(backend_port) + "/api/ai-proxy";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer vck_52EnLxAogWpvslydz4fqAaFXvDaafizr7Ny0pRHq8XCxSMZjNp0Oofps");
    http.setTimeout(15000); // 15 second timeout for AI response
    
    // Create request body
    DynamicJsonDocument requestDoc(1024);
    
    JsonArray messages = requestDoc.createNestedArray("messages");
    
    JsonObject systemMessage = messages.createNestedObject();
    systemMessage["role"] = "system";
    systemMessage["content"] = "You are LIMI AI assistant for " + String(guest_name) + 
                              ", a " + String(guest_type) + " guest in room " + String(room_number) + 
                              " at JW Marriott Shenzhen. Provide helpful, contextual hotel assistance. Keep responses concise.";
    
    JsonObject userMsg = messages.createNestedObject();
    userMsg["role"] = "user";
    userMsg["content"] = userMessage;
    
    requestDoc["model"] = "gpt-4o";
    requestDoc["temperature"] = 0.7;
    requestDoc["maxTokens"] = 150;
    
    String requestBody;
    serializeJson(requestDoc, requestBody);
    
    Serial.println("[AI] 🤖 Sending request to LIMI AI backend...");
    
    int httpCode = http.POST(requestBody);
    
    if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        
        DynamicJsonDocument responseDoc(1024);
        DeserializationError error = deserializeJson(responseDoc, response);
        
        if (!error && responseDoc.containsKey("data")) {
            String aiResponse = responseDoc["data"];
            Serial.println("[AI] ✅ LIMI AI Response:");
            Serial.println("    " + aiResponse);
        } else {
            Serial.println("[AI] ✗ Invalid response format");
            Serial.println("    " + response);
        }
    } else {
        Serial.printf("[AI] ✗ HTTP error: %d\n", httpCode);
        String errorResponse = http.getString();
        Serial.println("    " + errorResponse);
    }
    
    http.end();
    lastInteraction = millis();
}

// ===================================
// INPUT HANDLING
// ===================================

void handleButton() {
    static unsigned long lastDebounce = 0;
    static bool lastButtonState = HIGH;
    static int messageCounter = 1;
    
    bool currentState = digitalRead(BOOT_KEY_PIN);
    
    if (currentState != lastButtonState) {
        lastDebounce = millis();
    }
    
    if ((millis() - lastDebounce) > 50) { // 50ms debounce
        if (currentState != buttonPressed) {
            buttonPressed = (currentState == LOW);
            
            if (buttonPressed) {
                Serial.println("\n[Button] 🎤 Button pressed - sending test message");
                
                // Send different test messages
                String testMessages[] = {
                    "Hello, I'm in my hotel room. Can you help me?",
                    "What's the weather like in Shenzhen today?",
                    "I'd like to order room service.",
                    "Can you adjust my room temperature?",
                    "What are some good restaurants nearby?",
                    "I need to book a taxi to the airport.",
                    "What time does the hotel gym open?",
                    "Can you recommend some local attractions?"
                };
                
                int messageIndex = (messageCounter - 1) % 8;
                String testMessage = testMessages[messageIndex];
                
                Serial.printf("[Button] Test message %d: %s\n", messageCounter, testMessage.c_str());
                sendAIRequest(testMessage);
                
                messageCounter++;
            }
        }
    }
    
    lastButtonState = currentState;
}

// ===================================
// HARDWARE FUNCTIONS
// ===================================

void scanI2CDevices() {
    Serial.println("   Scanning I2C bus...");
    int deviceCount = 0;
    
    for (byte address = 1; address < 127; address++) {
        Wire.beginTransmission(address);
        byte error = Wire.endTransmission();
        
        if (error == 0) {
            Serial.printf("   Found device at 0x%02X", address);
            if (address == ES8311_ADDR) Serial.print(" (ES8311 Codec)");
            if (address == ES7210_ADDR) Serial.print(" (ES7210 ADC)");
            Serial.println();
            deviceCount++;
        }
    }
    
    Serial.printf("   Found %d I2C device(s)\n", deviceCount);
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

void printStatus() {
    Serial.printf("Status: WiFi=%s, Heap=%d, Last interaction: %lu ms ago\n",
                 WiFi.isConnected() ? "✓" : "✗",
                 ESP.getFreeHeap(),
                 lastInteraction > 0 ? (millis() - lastInteraction) : 0);
}
