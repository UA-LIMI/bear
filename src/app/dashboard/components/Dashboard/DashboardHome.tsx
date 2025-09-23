import React, { useEffect, useState } from 'react';
import { Users, Home, MessageSquare, AlertTriangle, Calendar, Clock, TrendingUp, Activity, Coffee, Thermometer, Zap, Bell } from 'lucide-react';
import { StatusCard } from './StatusCard';
import { RecentRequestsCard } from './RecentRequestsCard';
import { RoomStatusOverview } from './RoomStatusOverview';
import { MetricsCard } from './MetricsCard';
import { AIAssistant } from './AIAssistant';
import { connectMqtt } from '../../services/mqttService';
interface DashboardHomeProps {
  requests: any[];
  rooms: any[];
  setActiveTab: (tab: string) => void;
  onSelectRequest?: (requestId: string) => void;
}
export const DashboardHome: React.FC<DashboardHomeProps> = ({
  requests,
  rooms,
  setActiveTab,
  onSelectRequest
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  useEffect(() => {
    // Connect to MQTT broker
    const connectToMqtt = async () => {
      try {
        // In a real app, this would be an environment variable or configuration
        const brokerUrl = 'wss://test.mosquitto.org:8081';
        const connected = await connectMqtt(brokerUrl);
        setIsConnected(connected);
        if (!connected) {
          setConnectionError('Unable to connect to MQTT broker. Some features may be limited.');
        }
      } catch (error) {
        console.error('MQTT connection error:', error);
        setConnectionError('Error connecting to MQTT broker. Some features may be limited.');
        setIsConnected(false);
      }
    };
    connectToMqtt();
  }, []);
  // Calculate dashboard metrics
  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  const maintenanceNeeded = rooms.filter(room => room.maintenanceNeeded).length;
  const upcomingCheckouts = rooms.filter(room => {
    if (!room.checkOut) return false;
    const checkoutDate = new Date(room.checkOut);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return checkoutDate <= tomorrow && room.status === 'occupied';
  }).length;
  return <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-light-100">Dashboard</h1>
        <div className="flex items-center">
          <span className={`flex items-center text-sm px-3 py-1 rounded-full ${isConnected ? 'bg-dark-100 text-green-400 border border-green-500/30' : 'bg-dark-100 text-red-400 border border-red-500/30'}`}>
            <Activity className="w-4 h-4 mr-1" />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      {connectionError && <div className="mb-6 p-3 bg-dark-100 border border-orange-gradient-start/30 text-orange-gradient-start rounded-xl flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {connectionError}
        </div>}
      <div className="mb-6">
        <AIAssistant />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatusCard title="Pending Requests" value={pendingRequests} icon={<MessageSquare className="w-5 h-5 text-white" />} color="purple" onClick={() => setActiveTab('requests')} />
        <StatusCard title="Occupied Rooms" value={occupiedRooms} total={rooms.length} icon={<Home className="w-5 h-5 text-white" />} color="blue" onClick={() => setActiveTab('rooms')} />
        <StatusCard title="Maintenance Issues" value={maintenanceNeeded} icon={<AlertTriangle className="w-5 h-5 text-white" />} color="amber" onClick={() => setActiveTab('rooms')} />
        <StatusCard title="Upcoming Checkouts" value={upcomingCheckouts} icon={<Calendar className="w-5 h-5 text-white" />} color="green" onClick={() => setActiveTab('rooms')} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-dark-200 rounded-xl shadow-md border border-dark-100 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-light-100">
                Room Status Overview
              </h2>
              <button onClick={() => setActiveTab('rooms')} className="text-sm text-blue-gradient-end hover:text-blue-gradient-start">
                View All
              </button>
            </div>
            <RoomStatusOverview rooms={rooms} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-dark-200 rounded-xl shadow-md border border-dark-100 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-light-100">
                Recent Requests
              </h2>
              <button onClick={() => setActiveTab('requests')} className="text-sm text-blue-gradient-end hover:text-blue-gradient-start">
                View All
              </button>
            </div>
            <RecentRequestsCard requests={requests.slice(0, 4)} onRequestClick={onSelectRequest ? requestId => {
            setActiveTab('requests');
            onSelectRequest(requestId);
          } : undefined} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <MetricsCard title="Energy Usage" value="23.4 kWh" change="-5.2%" changeType="decrease" icon={<Zap className="w-5 h-5" />} color="amber" />
        <MetricsCard title="Avg. Room Temp" value="22.5°C" change="+0.3°C" changeType="increase" icon={<Thermometer className="w-5 h-5" />} color="blue" />
        <MetricsCard title="F&B Orders" value="42" change="+12%" changeType="increase" icon={<Coffee className="w-5 h-5" />} color="green" />
      </div>
    </div>;
};