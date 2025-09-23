import React from 'react';
import { MetricsCard } from './MetricsCard';
import { StatusCard } from './StatusCard';
import { RecentRequestsCard } from './RecentRequestsCard';
import { RoomStatusOverview } from './RoomStatusOverview';
import { AIAssistant } from './AIAssistant';

interface GuestRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  type: string;
  message: string;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  aiSuggestion?: string;
}

interface Room {
  roomNumber: string;
  status: 'occupied' | 'available' | 'maintenance';
  guestName?: string;
  temperature: number;
  lights: boolean;
  maintenanceNeeded: boolean;
}

interface DashboardProps {
  requests: GuestRequest[];
  rooms: Room[];
  onRequestClick: (requestId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  requests,
  rooms,
  onRequestClick
}) => {
  // Calculate metrics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const completedRequests = requests.filter(req => req.status === 'completed').length;
  const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  const totalRooms = rooms.length;
  const maintenanceNeeded = rooms.filter(room => room.maintenanceNeeded).length;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Requests"
          value={totalRequests.toString()}
          change="+12% from last week"
          changeType="increase"
          icon={<div className="w-6 h-6 bg-purple-500 rounded-full" />}
          color="purple"
        />
        <MetricsCard
          title="Pending Requests"
          value={pendingRequests.toString()}
          change="-5% from yesterday"
          changeType="decrease"
          icon={<div className="w-6 h-6 bg-blue-500 rounded-full" />}
          color="blue"
        />
        <MetricsCard
          title="Completed Today"
          value={completedRequests.toString()}
          change="+8% from yesterday"
          changeType="increase"
          icon={<div className="w-6 h-6 bg-green-500 rounded-full" />}
          color="green"
        />
        <MetricsCard
          title="Room Occupancy"
          value={`${Math.round((occupiedRooms / totalRooms) * 100)}%`}
          change="+3% from last week"
          changeType="increase"
          icon={<div className="w-6 h-6 bg-amber-500 rounded-full" />}
          color="amber"
        />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          icon={<div className="w-6 h-6 bg-blue-500 rounded-full" />}
          title="Active Rooms"
          value={occupiedRooms}
          color="blue"
        />
        <StatusCard
          icon={<div className="w-6 h-6 bg-green-500 rounded-full" />}
          title="Available Rooms"
          value={totalRooms - occupiedRooms}
          color="green"
        />
        <StatusCard
          icon={<div className="w-6 h-6 bg-yellow-500 rounded-full" />}
          title="Maintenance"
          value={maintenanceNeeded}
          color="amber"
        />
        <StatusCard
          icon={<div className="w-6 h-6 bg-purple-500 rounded-full" />}
          title="VIP Guests"
          value={3}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <RecentRequestsCard
            requests={requests}
            onRequestClick={onRequestClick}
          />
        </div>

        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <AIAssistant />
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomStatusOverview rooms={rooms} />
        
        {/* Additional dashboard content can go here */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              View All Requests
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Room Status
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Guest Profiles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
