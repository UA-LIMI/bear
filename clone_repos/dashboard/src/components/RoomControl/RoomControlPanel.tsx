import React, { useEffect, useState } from 'react';
import { RoomCard } from './RoomCard';
import { RoomDetail } from './RoomDetail';
import { Search, Activity, AlertTriangle } from 'lucide-react';
import { connectMqtt, subscribeToRoomStatus } from '../../services/mqttService';
interface RoomControlPanelProps {
  rooms: any[];
  onUpdateRoom: (roomNumber: string, update: any) => void;
}
export const RoomControlPanel: React.FC<RoomControlPanelProps> = ({
  rooms,
  onUpdateRoom
}) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mqttConnected, setMqttConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  useEffect(() => {
    // Connect to MQTT broker
    const connectToMqtt = async () => {
      try {
        // In a real app, this would be an environment variable or configuration
        const brokerUrl = 'wss://test.mosquitto.org:8081';
        const connected = await connectMqtt(brokerUrl);
        setMqttConnected(connected);
        if (!connected) {
          setConnectionError('Unable to connect to MQTT broker. Room controls will operate in offline mode.');
        }
      } catch (error) {
        console.error('MQTT connection error:', error);
        setConnectionError('Error connecting to MQTT broker. Room controls will operate in offline mode.');
        setMqttConnected(false);
      }
    };
    connectToMqtt();
  }, []);
  useEffect(() => {
    // Subscribe to room status updates for each room
    if (mqttConnected && rooms.length > 0) {
      rooms.forEach(room => {
        subscribeToRoomStatus(room.roomNumber, status => {
          // Update room status when we receive MQTT updates
          onUpdateRoom(room.roomNumber, status);
        });
      });
    }
  }, [mqttConnected, rooms, onUpdateRoom]);
  const filteredRooms = rooms.filter(room => room.roomNumber.toString().includes(searchTerm) || room.guestName.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Room Control
        </h1>
        <div className="flex items-center space-x-3">
          <span className={`flex items-center text-sm px-3 py-1 rounded-full ${mqttConnected ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
            <Activity className="w-4 h-4 mr-1" />
            {mqttConnected ? 'Connected' : 'Offline Mode'}
          </span>
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Search rooms or guests" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>
      {connectionError && <div className="mb-6 p-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-md flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {connectionError}
        </div>}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          {filteredRooms.map(room => <RoomCard key={room.roomNumber} room={room} isSelected={selectedRoom && selectedRoom.roomNumber === room.roomNumber} onClick={() => setSelectedRoom(room)} />)}
        </div>
        <div className="lg:col-span-3 overflow-y-auto">
          {selectedRoom ? <RoomDetail room={selectedRoom} onUpdateRoom={onUpdateRoom} mqttConnected={mqttConnected} /> : <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>Select a room to view controls</p>
            </div>}
        </div>
      </div>
    </div>;
};