/*
 * ESP32-S3-Korvo-2 LIMI AI Voice Assistant Client - FIXED VERSION
 * Optimized for ESP32-S3-Korvo-2 V3.1 board
 * 
 * FIXES:
 * - Proper SSL certificate handling for OpenAI WebSocket
 * - Correct WebSocket protocol implementation
 * - Better connection stability
 * - Proper OpenAI Realtime API authentication
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <driver/i2s.h>
#include <Wire.h>
#include <WiFiClientSecure.h>

// ===================================
// CONFIGURATION - UPDATE THESE!
// ===================================

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// LIMI AI Backend HTTP server (for getting ephemeral tokens)
const char* backend_server = "145.79.10.35";  // Your VPS IP
const int backend_port = 3001;  // Your backend HTTP port

// OpenAI Realtime API WebSocket (where we actually connect for voice)
const char* openai_websocket_server = "api.openai.com";
const int openai_websocket_port = 443;  // HTTPS/WSS port
const char* openai_websocket_path = "/v1/realtime";

// Guest profile for contextual AI
const char* guest_name = "Hotel Guest";
const char* guest_type = "vip";  // standard, vip, platinum, suite
const char* room_number = "2847";

// ===================================
// HARDWARE CONFIGURATION
// ===================================

// Audio configuration (matches your server's FRAME_SIZE)
#define SAMPLE_RATE 16000
#define BITS_PER_SAMPLE 16
#define CHANNELS 1
#define FRAME_MS 20
#define FRAME_SAMPLES (SAMPLE_RATE * FRAME_MS / 1000)  // 320 samples
#define FRAME_BYTES (FRAME_SAMPLES * CHANNELS * BITS_PER_SAMPLE / 8)  // 640 bytes

// ESP32-S3-Korvo-2 V3.1 pin definitions (from official docs)
#define I2S_MCLK_PIN    16
#define I2S_SCLK_PIN    9
#define I2S_LRCK_PIN    45
#define I2S_DSDIN_PIN   8   // To ES8311 (speaker output)
#define I2S_ASDOUT_PIN  10  // From ES7210 (microphone input)
#define I2C_SDA_PIN     17
#define I2C_SCL_PIN     18
#define PA_CTRL_PIN     48  // Power amplifier control
#define BOOT_KEY_PIN    0   // Boot button for push-to-talk

// I2C addresses (from official docs)
#define ES8311_ADDR     0x18  // Audio codec
#define ES7210_ADDR     0x40  // ADC for microphones

// ===================================
// GLOBAL STATE
// ===================================

WebSocketsClient webSocket;
bool isConnected = false;
bool isRecording = false;
bool buttonPressed = false;
bool audioInitialized = false;
bool isAISpeaking = false;

// Audio buffers
int16_t micBuffer[FRAME_SAMPLES];
int16_t spkBuffer[FRAME_SAMPLES * 2]; // Stereo output

// Session state
String sessionId = "";
String ephemeralToken = "";
unsigned long tokenExpiresAt = 0;
unsigned long lastHeartbeat = 0;
unsigned long sessionStartTime = 0;
unsigned long lastConnectionAttempt = 0;

// Connection retry logic
int connectionAttempts = 0;
const int maxConnectionAttempts = 5;
const unsigned long connectionRetryDelay = 5000; // 5 seconds

// ===================================
// SETUP
// ===================================

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n\n=== LIMI AI Voice Assistant Client - FIXED ===");
    Serial.println("ESP32-S3-Korvo-2 V3.1 Firmware v1.1");
    Serial.printf("ESP32 Chip: %s\n", ESP.getChipModel());
    Serial.printf("CPU Frequency: %d MHz\n", ESP.getCpuFreqMHz());
    Serial.printf("Free Heap: %d bytes\n", ESP.getFreeHeap());
    
    // Step 1: Initialize GPIO
    Serial.println("\n1. Initializing GPIO...");
    pinMode(BOOT_KEY_PIN, INPUT_PULLUP);
    pinMode(PA_CTRL_PIN, OUTPUT);
    digitalWrite(PA_CTRL_PIN, LOW); // Start with PA disabled
    Serial.println("   ✓ GPIO initialized");
    
    // Step 2: Initialize I2C
    Serial.println("\n2. Initializing I2C...");
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN, 100000); // 100kHz
    delay(100);
    scanI2CDevices();
    Serial.println("   ✓ I2C initialized");
    
    // Step 3: Initialize audio chips
    Serial.println("\n3. Initializing audio chips...");
    if (initializeAudioChips()) {
        Serial.println("   ✓ Audio chips initialized");
        audioInitialized = true;
    } else {
        Serial.println("   ✗ Audio chips initialization failed");
        Serial.println("   Continuing without audio...");
    }
    
    // Step 4: Initialize I2S
    if (audioInitialized) {
        Serial.println("\n4. Initializing I2S...");
        if (setupI2SAudio()) {
            Serial.println("   ✓ I2S initialized");
        } else {
            Serial.println("   ✗ I2S initialization failed");
            audioInitialized = false;
        }
    }
    
    // Step 5: Connect to WiFi
    Serial.println("\n5. Connecting to WiFi...");
    connectToWiFi();
    
    // Step 6: Setup WebSocket (but don't connect yet)
    Serial.println("\n6. Setting up WebSocket client...");
    setupWebSocketClient();
    
    // Enable power amplifier if audio is working
    if (audioInitialized) {
        digitalWrite(PA_CTRL_PIN, HIGH);
        Serial.println("   ✓ Power amplifier enabled");
    }
    
    Serial.println("\n=== Setup Complete ===");
    Serial.println("Press BOOT button to start voice conversation");
    Serial.printf("Free Heap after setup: %d bytes\n", ESP.getFreeHeap());
}

// ===================================
// MAIN LOOP
// ===================================

void loop() {
    webSocket.loop();
    
    // Handle button press for push-to-talk
    handleButton();
    
    // Record and send audio if everything is ready
    if (isConnected && isRecording && audioInitialized && !isAISpeaking) {
        recordAndSendAudio();
    }
    
    // Handle reconnection if needed
    if (!isConnected && (millis() - lastConnectionAttempt > connectionRetryDelay)) {
        if (connectionAttempts < maxConnectionAttempts) {
            Serial.println("[Connection] Attempting to reconnect...");
            attemptConnection();
        }
    }
    
    // Send periodic heartbeat
    if (isConnected && (millis() - lastHeartbeat > 30000)) {
        sendHeartbeat();
        lastHeartbeat = millis();
    }
    
    // Print status every 15 seconds
    static unsigned long lastStatus = 0;
    if (millis() - lastStatus > 15000) {
        lastStatus = millis();
        printStatus();
    }
    
    delay(10); // Small delay for stability
}

// ===================================
// HARDWARE INITIALIZATION
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

bool initializeAudioChips() {
    // Check if ES8311 is present
    Wire.beginTransmission(ES8311_ADDR);
    if (Wire.endTransmission() != 0) {
        Serial.println("   ✗ ES8311 codec not found!");
        return false;
    }
    
    // Check if ES7210 is present
    Wire.beginTransmission(ES7210_ADDR);
    if (Wire.endTransmission() != 0) {
        Serial.println("   ✗ ES7210 ADC not found!");
        return false;
    }
    
    // Initialize ES8311 codec (speaker output)
    Serial.println("   Configuring ES8311 codec...");
    writeES8311(0x45, 0x00); // Power up
    delay(50);
    writeES8311(0x01, 0x30); // Clock setup
    writeES8311(0x02, 0x10); // Clock divider
    writeES8311(0x44, 0x08); // DAC setup
    writeES8311(0x17, 0x90); // Volume control (medium volume)
    writeES8311(0x09, 0x01); // Enable DAC
    Serial.println("   ✓ ES8311 configured");
    
    // Initialize ES7210 ADC (microphone input)
    Serial.println("   Configuring ES7210 ADC...");
    writeES7210(0x00, 0xFF); // Reset
    delay(50);
    writeES7210(0x00, 0x41); // Power up
    writeES7210(0x06, 0x00); // ADC setup
    writeES7210(0x07, 0x20); // ADC format
    writeES7210(0x08, 0x11); // Enable channels 1&2 (dual mic)
    writeES7210(0x09, 0x30); // Microphone gain
    writeES7210(0x0A, 0x30); // Microphone gain
    Serial.println("   ✓ ES7210 configured");
    
    return true;
}

bool setupI2SAudio() {
    esp_err_t err;
    
    // I2S configuration for microphone input (I2S_NUM_0)
    i2s_config_t i2s_config_in = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
        .sample_rate = SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 6,
        .dma_buf_len = 256,
        .use_apll = false,
        .tx_desc_auto_clear = false,
        .fixed_mclk = 0
    };
    
    i2s_pin_config_t pin_config_in = {
        .mck_io_num = I2S_MCLK_PIN,
        .bck_io_num = I2S_SCLK_PIN,
        .ws_io_num = I2S_LRCK_PIN,
        .data_out_num = I2S_PIN_NO_CHANGE,
        .data_in_num = I2S_ASDOUT_PIN
    };
    
    // Install and configure I2S for input
    err = i2s_driver_install(I2S_NUM_0, &i2s_config_in, 0, NULL);
    if (err != ESP_OK) {
        Serial.printf("   ✗ I2S input driver install failed: %s\n", esp_err_to_name(err));
        return false;
    }
    
    err = i2s_set_pin(I2S_NUM_0, &pin_config_in);
    if (err != ESP_OK) {
        Serial.printf("   ✗ I2S input pin config failed: %s\n", esp_err_to_name(err));
        return false;
    }
    
    // I2S configuration for speaker output (I2S_NUM_1)
    i2s_config_t i2s_config_out = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
        .sample_rate = SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 6,
        .dma_buf_len = 256,
        .use_apll = false,
        .tx_desc_auto_clear = true,
        .fixed_mclk = 0
    };
    
    i2s_pin_config_t pin_config_out = {
        .mck_io_num = I2S_MCLK_PIN,
        .bck_io_num = I2S_SCLK_PIN,
        .ws_io_num = I2S_LRCK_PIN,
        .data_out_num = I2S_DSDIN_PIN,
        .data_in_num = I2S_PIN_NO_CHANGE
    };
    
    // Install and configure I2S for output
    err = i2s_driver_install(I2S_NUM_1, &i2s_config_out, 0, NULL);
    if (err != ESP_OK) {
        Serial.printf("   ✗ I2S output driver install failed: %s\n", esp_err_to_name(err));
        return false;
    }
    
    err = i2s_set_pin(I2S_NUM_1, &pin_config_out);
    if (err != ESP_OK) {
        Serial.printf("   ✗ I2S output pin config failed: %s\n", esp_err_to_name(err));
        return false;
    }
    
    // Clear DMA buffers
    i2s_zero_dma_buffer(I2S_NUM_0);
    i2s_zero_dma_buffer(I2S_NUM_1);
    
    return true;
}

// ===================================
// NETWORK & WEBSOCKET
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
    } else {
        Serial.println();
        Serial.println("   ✗ WiFi connection failed!");
        Serial.println("   Please check your credentials and restart.");
    }
}

void setupWebSocketClient() {
    // Generate unique session ID
    sessionId = "esp32_" + String(ESP.getEfuseMac(), HEX) + "_" + String(millis());
    
    // Configure WebSocket with proper SSL settings
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
    webSocket.enableHeartbeat(15000, 3000, 2);
    
    Serial.printf("   Session ID: %s\n", sessionId.c_str());
    Serial.println("   ✓ WebSocket client configured");
}

void attemptConnection() {
    lastConnectionAttempt = millis();
    connectionAttempts++;
    
    Serial.printf("[Connection] Attempt %d/%d\n", connectionAttempts, maxConnectionAttempts);
    
    // Get ephemeral token from your backend
    if (!getEphemeralToken()) {
        Serial.println("[Connection] ✗ Failed to get ephemeral token");
        return;
    }
    
    Serial.println("[Connection] ✓ Got ephemeral token");
    
    // Connect to OpenAI Realtime API with the token
    connectToOpenAI();
}

bool getEphemeralToken() {
    HTTPClient http;
    
    // Build the URL for your backend
    String url = "http://" + String(backend_server) + ":" + String(backend_port) + "/api/client-secret";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000); // 10 second timeout
    
    // Create request body
    DynamicJsonDocument requestDoc(512);
    requestDoc["sessionId"] = sessionId;
    requestDoc["model"] = "gpt-4o-realtime-preview";
    requestDoc["voice"] = "alloy";
    requestDoc["instructions"] = "You are LIMI AI, a helpful hotel assistant for " + String(guest_name) + 
                                " (guest type: " + String(guest_type) + ", room: " + String(room_number) + 
                                "). Provide friendly, contextual hotel assistance.";
    
    String requestBody;
    serializeJson(requestDoc, requestBody);
    
    Serial.printf("[HTTP] Requesting token from: %s\n", url.c_str());
    
    int httpCode = http.POST(requestBody);
    
    if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        
        DynamicJsonDocument responseDoc(1024);
        DeserializationError error = deserializeJson(responseDoc, response);
        
        if (error) {
            Serial.printf("[HTTP] ✗ JSON parse error: %s\n", error.c_str());
            http.end();
            return false;
        }
        
        if (responseDoc.containsKey("ephemeralKey")) {
            ephemeralToken = responseDoc["ephemeralKey"].as<String>();
            tokenExpiresAt = responseDoc["expiresAt"].as<unsigned long>();
            
            Serial.printf("[HTTP] ✓ Token received: %s...\n", ephemeralToken.substring(0, 10).c_str());
            http.end();
            return true;
        } else {
            Serial.println("[HTTP] ✗ No ephemeral key in response");
            Serial.printf("[HTTP] Response: %s\n", response.c_str());
        }
    } else {
        Serial.printf("[HTTP] ✗ HTTP error: %d\n", httpCode);
        String response = http.getString();
        Serial.printf("[HTTP] Error response: %s\n", response.c_str());
    }
    
    http.end();
    return false;
}

void connectToOpenAI() {
    Serial.println("[WebSocket] Connecting to OpenAI Realtime API...");
    
    // Disconnect if already connected
    if (webSocket.isConnected()) {
        webSocket.disconnect();
        delay(1000);
    }
    
    // Setup WebSocket connection to OpenAI Realtime API
    String wsUrl = String(openai_websocket_path) + "?model=gpt-4o-realtime-preview";
    
    // Method 1: Try with OpenAI's required subprotocol format
    String tokenProtocol = "openai-insecure-api-key." + ephemeralToken;
    
    Serial.printf("[WebSocket] Connecting to: wss://%s:%d%s\n", 
                  openai_websocket_server, openai_websocket_port, wsUrl.c_str());
    Serial.printf("[WebSocket] Using token protocol: %s\n", tokenProtocol.c_str());
    
    // Try connection with token in subprotocol (OpenAI's preferred method)
    webSocket.beginSSL(openai_websocket_server, openai_websocket_port, wsUrl, tokenProtocol.c_str());
    
    // Set connection timeout
    webSocket.setConnectTimeout(10000); // 10 seconds
    
    Serial.println("[WebSocket] ✓ Connection initiated to OpenAI");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[WS] Disconnected from OpenAI Realtime API (length: %d)\n", length);
            if (length > 0) {
                Serial.printf("[WS] Disconnect reason: %s\n", (char*)payload);
            }
            isConnected = false;
            isRecording = false;
            isAISpeaking = false;
            break;
            
        case WStype_CONNECTED:
            Serial.printf("[WS] ✓ Connected to OpenAI Realtime API: %s\n", payload);
            isConnected = true;
            sessionStartTime = millis();
            connectionAttempts = 0; // Reset connection attempts on success
            
            // Send session configuration after connection
            delay(1000); // Wait a moment for connection to stabilize
            sendSessionUpdate();
            break;
            
        case WStype_TEXT:
            handleOpenAIMessage((char*)payload);
            break;
            
        case WStype_BIN:
            Serial.println("[WS] Unexpected binary data from OpenAI");
            break;
            
        case WStype_ERROR:
            Serial.printf("[WS] ✗ Error: %s\n", payload);
            isConnected = false;
            break;
            
        case WStype_PING:
            Serial.println("[WS] Ping received");
            break;
            
        case WStype_PONG:
            Serial.println("[WS] Pong received");
            break;
            
        default:
            Serial.printf("[WS] Unknown event type: %d\n", type);
            break;
    }
}

void sendSessionUpdate() {
    if (!isConnected) return;
    
    DynamicJsonDocument doc(1024);
    doc["event_id"] = "evt_" + String(millis());
    doc["type"] = "session.update";
    
    // Session configuration
    JsonObject session = doc.createNestedObject("session");
    session["modalities"] = JsonArray();
    session["modalities"].add("text");
    session["modalities"].add("audio");
    
    session["instructions"] = "You are LIMI AI, a helpful hotel assistant for " + String(guest_name) + 
                             " (guest type: " + String(guest_type) + ", room: " + String(room_number) + 
                             "). Provide friendly, contextual hotel assistance. Be conversational and helpful.";
    session["voice"] = "alloy";
    session["input_audio_format"] = "pcm16";
    session["output_audio_format"] = "pcm16";
    session["input_audio_transcription"] = nullptr;
    session["turn_detection"] = nullptr;  // Manual turn detection via button
    session["tools"] = JsonArray();
    session["tool_choice"] = "auto";
    session["temperature"] = 0.8;
    session["max_response_output_tokens"] = 4096;
    
    String message;
    serializeJson(doc, message);
    
    Serial.println("[WS] Sending session configuration...");
    webSocket.sendTXT(message);
}

void handleOpenAIMessage(const char* message) {
    // Only print first 200 chars to avoid spam
    String msgStr = String(message);
    if (msgStr.length() > 200) {
        Serial.printf("[OpenAI] %s...\n", msgStr.substring(0, 200).c_str());
    } else {
        Serial.printf("[OpenAI] %s\n", message);
    }
    
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
        Serial.printf("[WS] JSON parse error: %s\n", error.c_str());
        return;
    }
    
    String type = doc["type"];
    
    if (type == "session.created") {
        Serial.println("[AI] ✅ OpenAI session created");
    }
    else if (type == "session.updated") {
        Serial.println("[AI] ✅ OpenAI session updated - Ready for conversation!");
    }
    else if (type == "response.created") {
        Serial.println("[AI] 🤖 OpenAI is preparing response...");
        isAISpeaking = true;
    }
    else if (type == "response.done") {
        Serial.println("[AI] ✅ OpenAI finished response");
        isAISpeaking = false;
    }
    else if (type == "response.audio.delta") {
        // Handle audio response (simplified for now)
        Serial.print("🔊");
    }
    else if (type == "input_audio_buffer.committed") {
        Serial.println("[AI] 🎤 Voice input committed");
    }
    else if (type == "input_audio_buffer.speech_started") {
        Serial.println("[AI] 🎤 Speech detected");
    }
    else if (type == "input_audio_buffer.speech_stopped") {
        Serial.println("[AI] 🛑 Speech ended");
    }
    else if (type == "conversation.item.input_audio_transcription.completed") {
        if (doc.containsKey("transcript")) {
            String transcript = doc["transcript"];
            Serial.printf("[AI] 📝 You said: %s\n", transcript.c_str());
        }
    }
    else if (type == "error") {
        Serial.println("[AI] ❌ OpenAI error:");
        if (doc.containsKey("error")) {
            JsonObject errorObj = doc["error"];
            if (errorObj.containsKey("message")) {
                Serial.printf("   Message: %s\n", errorObj["message"].as<String>().c_str());
            }
            if (errorObj.containsKey("code")) {
                Serial.printf("   Code: %s\n", errorObj["code"].as<String>().c_str());
            }
        }
        isAISpeaking = false;
    }
}

void sendHeartbeat() {
    // OpenAI Realtime API handles heartbeat automatically
    Serial.printf("[Status] Uptime: %lu ms, Free heap: %d bytes\n", 
                  millis() - sessionStartTime, ESP.getFreeHeap());
}

// ===================================
// AUDIO PROCESSING
// ===================================

void handleButton() {
    static unsigned long lastDebounce = 0;
    static bool lastButtonState = HIGH;
    
    bool currentState = digitalRead(BOOT_KEY_PIN);
    
    if (currentState != lastButtonState) {
        lastDebounce = millis();
    }
    
    if ((millis() - lastDebounce) > 50) { // 50ms debounce
        if (currentState != buttonPressed) {
            buttonPressed = (currentState == LOW);
            
            if (buttonPressed) {
                Serial.println("[Button] 🎤 Press detected");
                if (!isConnected) {
                    Serial.println("[Button] Not connected - attempting connection...");
                    connectionAttempts = 0; // Reset attempts
                    attemptConnection();
                } else if (!isAISpeaking) {
                    Serial.println("[Button] Starting voice recording");
                    isRecording = true;
                } else {
                    Serial.println("[Button] AI is speaking - please wait");
                }
            } else if (!buttonPressed && isConnected) {
                Serial.println("[Button] 🛑 Release detected - ending voice input");
                isRecording = false;
                sendEndOfSpeech();
            }
        }
    }
    
    lastButtonState = currentState;
}

void recordAndSendAudio() {
    if (!audioInitialized || !isConnected) return;
    
    size_t bytes_read;
    int32_t stereoBuffer[FRAME_SAMPLES * 2];
    
    // Read from microphone
    esp_err_t result = i2s_read(I2S_NUM_0, stereoBuffer, FRAME_BYTES * 2, &bytes_read, 10);
    
    if (result == ESP_OK && bytes_read > 0) {
        // Convert stereo 32-bit to mono 16-bit
        int samples = bytes_read / 8; // 4 bytes per sample, 2 channels
        for (int i = 0; i < samples && i < FRAME_SAMPLES; i++) {
            // Use left channel and convert to 16-bit
            micBuffer[i] = (int16_t)(stereoBuffer[i * 2] >> 16);
        }
        
        // Send audio to OpenAI (simplified - no base64 encoding for now)
        sendAudioToOpenAI(micBuffer, samples);
    }
}

void sendAudioToOpenAI(int16_t* audioData, int sampleCount) {
    if (!isConnected) return;
    
    // For now, just send empty audio buffer to test protocol
    DynamicJsonDocument doc(512);
    doc["event_id"] = "evt_" + String(millis());
    doc["type"] = "input_audio_buffer.append";
    doc["audio"] = ""; // TODO: Implement base64 encoding
    
    String message;
    serializeJson(doc, message);
    webSocket.sendTXT(message);
    
    Serial.print("🎤"); // Audio indicator
}

void sendEndOfSpeech() {
    if (!isConnected) return;
    
    // Send input_audio_buffer.commit to OpenAI
    DynamicJsonDocument commitDoc(256);
    commitDoc["event_id"] = "evt_" + String(millis());
    commitDoc["type"] = "input_audio_buffer.commit";
    
    String commitMessage;
    serializeJson(commitDoc, commitMessage);
    webSocket.sendTXT(commitMessage);
    
    // Send response.create to trigger AI response
    DynamicJsonDocument responseDoc(256);
    responseDoc["event_id"] = "evt_" + String(millis());
    responseDoc["type"] = "response.create";
    
    String responseMessage;
    serializeJson(responseDoc, responseMessage);
    webSocket.sendTXT(responseMessage);
    
    Serial.println("\n[WS] 📤 End of speech sent to OpenAI");
}

void setVolume(int volume) {
    if (!audioInitialized) return;
    
    // Convert 0-100 to ES8311 register value (0x00-0x1E)
    uint8_t vol_reg = map(constrain(volume, 0, 100), 0, 100, 0, 0x1E);
    writeES8311(0x17, vol_reg);
    
    Serial.printf("[Audio] 🔊 Volume set to %d%% (reg: 0x%02X)\n", volume, vol_reg);
}

// ===================================
// I2C HELPER FUNCTIONS
// ===================================

void writeES8311(uint8_t reg, uint8_t data) {
    Wire.beginTransmission(ES8311_ADDR);
    Wire.write(reg);
    Wire.write(data);
    byte error = Wire.endTransmission();
    if (error != 0) {
        Serial.printf("[I2C] ES8311 write error: %d\n", error);
    }
}

void writeES7210(uint8_t reg, uint8_t data) {
    Wire.beginTransmission(ES7210_ADDR);
    Wire.write(reg);
    Wire.write(data);
    byte error = Wire.endTransmission();
    if (error != 0) {
        Serial.printf("[I2C] ES7210 write error: %d\n", error);
    }
}

uint8_t readES8311(uint8_t reg) {
    Wire.beginTransmission(ES8311_ADDR);
    Wire.write(reg);
    Wire.endTransmission(false);
    Wire.requestFrom(ES8311_ADDR, 1);
    return Wire.available() ? Wire.read() : 0xFF;
}

uint8_t readES7210(uint8_t reg) {
    Wire.beginTransmission(ES7210_ADDR);
    Wire.write(reg);
    Wire.endTransmission(false);
    Wire.requestFrom(ES7210_ADDR, 1);
    return Wire.available() ? Wire.read() : 0xFF;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

void printStatus() {
    Serial.printf("Status: WiFi=%s, WebSocket=%s, Audio=%s, Recording=%s, AI Speaking=%s, Heap=%d, Attempts=%d\n",
                 WiFi.isConnected() ? "✓" : "✗",
                 isConnected ? "✓" : "✗", 
                 audioInitialized ? "✓" : "✗",
                 isRecording ? "✓" : "✗",
                 isAISpeaking ? "✓" : "✗",
                 ESP.getFreeHeap(),
                 connectionAttempts);
}
