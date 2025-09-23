import React, { useState } from 'react';
import { RequestCard } from './RequestCard';
import { RequestDetail } from './RequestDetail';
import { Clock, Filter, RefreshCw, Coffee, Bed, Car, ShowerHead, Utensils, MapPin, AlertCircle } from 'lucide-react';

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

interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: string;
}

interface RequestsPanelProps {
  requests: GuestRequest[];
  onRequestClick?: (requestId: string) => void;
  onUpdateRequest?: (id: string, update: Partial<GuestRequest>) => void;
  knowledgeBase?: KnowledgeBaseItem[];
}

export const RequestsPanel: React.FC<RequestsPanelProps> = ({
  requests,
  onRequestClick,
  onUpdateRequest,
  knowledgeBase = []
}) => {
  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const requestTypes = [
    { id: 'all', label: 'All Types', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'food', label: 'Food & Dining', icon: <Coffee className="w-4 h-4" /> },
    { id: 'housekeeping', label: 'Housekeeping', icon: <Bed className="w-4 h-4" /> },
    { id: 'transportation', label: 'Transportation', icon: <Car className="w-4 h-4" /> },
    { id: 'room-service', label: 'Room Service', icon: <Utensils className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <ShowerHead className="w-4 h-4" /> },
    { id: 'concierge', label: 'Concierge', icon: <MapPin className="w-4 h-4" /> }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const handleRequestClick = (request: GuestRequest): void => {
    setSelectedRequest(request);
    if (onRequestClick) {
      onRequestClick(request.id);
    }
  };

  const handleUpdateRequest = (id: string, update: Partial<GuestRequest>): void => {
    if (onUpdateRequest) {
      onUpdateRequest(id, update);
    }
    // Update local state
    setSelectedRequest(prev => prev && prev.id === id ? { ...prev, ...update } : prev);
  };

  const getRequestTypeIcon = (type: string): JSX.Element => {
    const requestType = requestTypes.find(rt => rt.id === type);
    return requestType ? requestType.icon : <AlertCircle className="w-4 h-4" />;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Guest Requests</h2>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            className="w-full pl-10 pr-4 py-2 bg-gray-800 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            className="w-full sm:w-48 pl-10 pr-4 py-2 bg-gray-800 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {requestTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Request List */}
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedRequest && selectedRequest.id === request.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleRequestClick(request)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-blue-500 dark:text-blue-400 mr-3">
                    {getRequestTypeIcon(request.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {request.guestName} - Room {request.roomNumber}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {request.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatTime(request.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">No requests found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Request Detail */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <RequestDetail
              request={selectedRequest}
              onUpdateRequest={handleUpdateRequest}
              knowledgeBase={knowledgeBase}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-16 h-16 mb-4" />
              <p className="text-lg">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};