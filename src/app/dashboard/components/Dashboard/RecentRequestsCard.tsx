import React from 'react';
import { Clock, Coffee, Bed, Car, ShowerHead, Utensils, AlertCircle, Users } from 'lucide-react';
interface RecentRequestsCardProps {
  requests: any[];
  onRequestClick?: (requestId: string) => void;
}
export const RecentRequestsCard: React.FC<RecentRequestsCardProps> = ({
  requests,
  onRequestClick
}) => {
  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Coffee className="w-4 h-4" />;
      case 'housekeeping':
        return <Bed className="w-4 h-4" />;
      case 'transportation':
        return <Car className="w-4 h-4" />;
      case 'amenities':
        return <ShowerHead className="w-4 h-4" />;
      case 'room-service':
        return <Utensils className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'in-progress':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'completed':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  };
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="space-y-4">
      {requests.length > 0 ? requests.map(request => <div key={request.id} className={`flex items-start space-x-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${onRequestClick ? 'cursor-pointer' : ''}`} onClick={onRequestClick ? () => onRequestClick(request.id) : undefined}>
            <div className={`p-2 rounded-full ${getStatusColor(request.status)}`}>
              {getRequestIcon(request.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Room {request.roomNumber} - {request.guestName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {request.message}
              </p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatTime(request.timestamp)}</span>
                </div>
                {request.assignedStaff && <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                    <Users className="w-3 h-3 mr-1" />
                    <span>{request.assignedStaff}</span>
                  </div>}
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>) : <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No recent requests
        </div>}
    </div>;
};