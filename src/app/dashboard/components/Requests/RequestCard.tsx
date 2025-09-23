import React from 'react';
import { Clock, CheckCircle, AlertCircle, Coffee, Bed, Car, ShowerHead, Utensils } from 'lucide-react';
interface RequestCardProps {
  request: any;
  isSelected: boolean;
  onClick: () => void;
}
export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isSelected,
  onClick
}) => {
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
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };
  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Coffee className="w-5 h-5" />;
      case 'housekeeping':
        return <Bed className="w-5 h-5" />;
      case 'transportation':
        return <Car className="w-5 h-5" />;
      case 'amenities':
        return <ShowerHead className="w-5 h-5" />;
      case 'room-service':
        return <Utensils className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className={`p-4 rounded-lg cursor-pointer transition-all border ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={onClick}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${getStatusColor(request.status)}`}>
            {getRequestIcon(request.type)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Room {request.roomNumber}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {request.guestName}
            </p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
          {getStatusText(request.status)}
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
        {request.message}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>{formatTime(request.timestamp)}</span>
        </div>
        {request.scheduled && <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs">
            Scheduled
          </span>}
      </div>
    </div>;
};