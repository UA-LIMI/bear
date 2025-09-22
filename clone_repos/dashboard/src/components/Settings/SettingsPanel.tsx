import React, { useEffect, useState } from 'react';
import { Save, Key, Server, Radio, AlertTriangle, CheckCircle } from 'lucide-react';
import { setApiKey } from '../../services/openaiService';
import { setMqttConfig } from '../../services/mqttService';
interface SettingsPanelProps {
  initialSettings?: {
    openaiApiKey?: string;
    mqttServer?: string;
    mqttUsername?: string;
    mqttPassword?: string;
    mqttBaseTopic?: string;
  };
}
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialSettings = {}
}) => {
  const [openaiApiKey, setOpenaiApiKey] = useState(initialSettings.openaiApiKey || '');
  const [mqttServer, setMqttServer] = useState(initialSettings.mqttServer || 'wss://test.mosquitto.org:8081');
  const [mqttUsername, setMqttUsername] = useState(initialSettings.mqttUsername || '');
  const [mqttPassword, setMqttPassword] = useState(initialSettings.mqttPassword || '');
  const [mqttBaseTopic, setMqttBaseTopic] = useState(initialSettings.mqttBaseTopic || 'hotel/rooms');
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [roomMqttTopics, setRoomMqttTopics] = useState([{
    roomNumber: '2104',
    lightTopic: 'hotel/rooms/2104/lights',
    acTopic: 'hotel/rooms/2104/ac',
    curtainsTopic: 'hotel/rooms/2104/curtains',
    dndTopic: 'hotel/rooms/2104/dnd'
  }, {
    roomNumber: '1802',
    lightTopic: 'hotel/rooms/1802/lights',
    acTopic: 'hotel/rooms/1802/ac',
    curtainsTopic: 'hotel/rooms/1802/curtains',
    dndTopic: 'hotel/rooms/1802/dnd'
  }, {
    roomNumber: '1506',
    lightTopic: 'hotel/rooms/1506/lights',
    acTopic: 'hotel/rooms/1506/ac',
    curtainsTopic: 'hotel/rooms/1506/curtains',
    dndTopic: 'hotel/rooms/1506/dnd'
  }]);
  const [activeTab, setActiveTab] = useState('general');
  const handleSaveOpenAI = () => {
    setApiKey(openaiApiKey);
    showNotification('success', 'OpenAI API key saved successfully');
  };
  const handleSaveMqtt = () => {
    setMqttConfig({
      brokerUrl: mqttServer,
      username: mqttUsername,
      password: mqttPassword,
      baseTopic: mqttBaseTopic
    });
    showNotification('success', 'MQTT settings saved successfully');
  };
  const handleSaveRoomTopics = () => {
    // In a real app, this would save to a database or configuration
    showNotification('success', 'Room MQTT topics saved successfully');
  };
  const updateRoomTopic = (index, field, value) => {
    const updatedTopics = [...roomMqttTopics];
    updatedTopics[index][field] = value;
    setRoomMqttTopics(updatedTopics);
  };
  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });
    setTimeout(() => {
      setNotification({
        show: false,
        type: '',
        message: ''
      });
    }, 3000);
  };
  return <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Settings
        </h1>
      </div>
      {notification.show && <div className={`mb-6 p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
          {notification.message}
        </div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'general' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`} onClick={() => setActiveTab('general')}>
            General
          </button>
          <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'mqtt' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`} onClick={() => setActiveTab('mqtt')}>
            MQTT
          </button>
          <button className={`px-6 py-3 font-medium text-sm ${activeTab === 'rooms' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`} onClick={() => setActiveTab('rooms')}>
            Room Topics
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'general' && <div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                OpenAI API Settings
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="password" value={openaiApiKey} onChange={e => setOpenaiApiKey(e.target.value)} className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="sk-..." />
                  </div>
                  <button onClick={handleSaveOpenAI} className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Your OpenAI API key is required for AI-powered responses to
                  guest requests.
                </p>
              </div>
            </div>}
          {activeTab === 'mqtt' && <div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                MQTT Connection Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    MQTT Server
                  </label>
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-gray-400 mr-2" />
                    <input type="text" value={mqttServer} onChange={e => setMqttServer(e.target.value)} className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="wss://example.com:8081" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username (if required)
                  </label>
                  <input type="text" value={mqttUsername} onChange={e => setMqttUsername(e.target.value)} className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Username" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password (if required)
                  </label>
                  <input type="password" value={mqttPassword} onChange={e => setMqttPassword(e.target.value)} className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base Topic
                  </label>
                  <div className="flex items-center">
                    <Radio className="h-5 w-5 text-gray-400 mr-2" />
                    <input type="text" value={mqttBaseTopic} onChange={e => setMqttBaseTopic(e.target.value)} className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="hotel/rooms" />
                  </div>
                </div>
                <div className="pt-4">
                  <button onClick={handleSaveMqtt} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <Save className="w-4 h-4 mr-2" />
                    Save MQTT Settings
                  </button>
                </div>
              </div>
            </div>}
          {activeTab === 'rooms' && <div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Room MQTT Topics
              </h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Configure specific MQTT topics for each room's devices
              </p>
              <div className="space-y-6">
                {roomMqttTopics.map((room, index) => <div key={room.roomNumber} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                      Room {room.roomNumber}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Lights Topic
                        </label>
                        <input type="text" value={room.lightTopic} onChange={e => updateRoomTopic(index, 'lightTopic', e.target.value)} className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          AC Topic
                        </label>
                        <input type="text" value={room.acTopic} onChange={e => updateRoomTopic(index, 'acTopic', e.target.value)} className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Curtains Topic
                        </label>
                        <input type="text" value={room.curtainsTopic} onChange={e => updateRoomTopic(index, 'curtainsTopic', e.target.value)} className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Do Not Disturb Topic
                        </label>
                        <input type="text" value={room.dndTopic} onChange={e => updateRoomTopic(index, 'dndTopic', e.target.value)} className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                      </div>
                    </div>
                  </div>)}
                <div className="pt-2">
                  <button onClick={handleSaveRoomTopics} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <Save className="w-4 h-4 mr-2" />
                    Save Room Topics
                  </button>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};