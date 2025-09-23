// Mock MQTT client implementation
// This replaces the actual MQTT client which requires the 'mqtt' package
// MQTT client instance (mock)
let isConnected = false;
let messageCallbacks: Record<string, ((message: string) => void)[]> = {};
// MQTT configuration
let mqttConfig = {
  brokerUrl: 'wss://test.mosquitto.org:8081',
  username: '',
  password: '',
  baseTopic: 'hotel/rooms'
};
// Base topic for the hotel
const getBaseTopic = () => mqttConfig.baseTopic || 'hotel/rooms';
// Set MQTT configuration
export const setMqttConfig = (config: {
  brokerUrl: string;
  username: string;
  password: string;
  baseTopic: string;
}): void => {
  mqttConfig = {
    ...config
  };
  console.log('MQTT configuration updated:', mqttConfig);
};
// Connect to the MQTT broker (mock implementation)
export const connectMqtt = (brokerUrl: string, options: any = {}): Promise<boolean> => {
  return new Promise(resolve => {
    // In this mock implementation, we always return false to indicate
    // that we're in offline mode
    console.log('Mock MQTT: Attempted to connect to ' + brokerUrl);
    mqttConfig.brokerUrl = brokerUrl;
    isConnected = false;
    resolve(false);
  });
};
// Disconnect from the MQTT broker (mock)
export const disconnectMqtt = (): void => {
  console.log('Mock MQTT: Disconnected');
  isConnected = false;
};
// Subscribe to a topic (mock)
export const subscribe = (topic: string, callback: (message: string) => void): void => {
  console.log(`Mock MQTT: Subscribed to ${topic}`);
  // Register callback
  if (!messageCallbacks[topic]) {
    messageCallbacks[topic] = [];
  }
  messageCallbacks[topic].push(callback);
};
// Unsubscribe from a topic (mock)
export const unsubscribe = (topic: string): void => {
  console.log(`Mock MQTT: Unsubscribed from ${topic}`);
  delete messageCallbacks[topic];
};
// Publish a message to a topic (mock)
export const publish = (topic: string, message: string): void => {
  console.log(`Mock MQTT: Published to ${topic}: ${message}`);
};
// Control room lights (mock)
export const controlRoomLights = (roomNumber: string, state: boolean): void => {
  const topic = `${getBaseTopic()}/${roomNumber}/lights`;
  publish(topic, state ? 'ON' : 'OFF');
};
// Control room temperature (mock)
export const controlRoomTemperature = (roomNumber: string, temperature: number): void => {
  const topic = `${getBaseTopic()}/${roomNumber}/temperature`;
  publish(topic, temperature.toString());
};
// Control room AC (mock)
export const controlRoomAC = (roomNumber: string, state: boolean): void => {
  const topic = `${getBaseTopic()}/${roomNumber}/ac`;
  publish(topic, state ? 'ON' : 'OFF');
};
// Control room curtains (mock)
export const controlRoomCurtains = (roomNumber: string, state: boolean): void => {
  const topic = `${getBaseTopic()}/${roomNumber}/curtains`;
  publish(topic, state ? 'OPEN' : 'CLOSED');
};
// Control room DND (Do Not Disturb) (mock)
export const controlRoomDND = (roomNumber: string, state: boolean): void => {
  const topic = `${getBaseTopic()}/${roomNumber}/dnd`;
  publish(topic, state ? 'ON' : 'OFF');
};
// Subscribe to room status updates (mock)
export const subscribeToRoomStatus = (roomNumber: string, callback: (status: any) => void): void => {
  const topic = `${getBaseTopic()}/${roomNumber}/status`;
  subscribe(topic, message => {
    try {
      const status = JSON.parse(message);
      callback(status);
    } catch (error) {
      console.error('Error parsing room status:', error);
    }
  });
};