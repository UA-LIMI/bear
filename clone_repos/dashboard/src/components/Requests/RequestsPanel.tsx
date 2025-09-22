import React, { useState } from 'react';
import { RequestCard } from './RequestCard';
import { RequestDetail } from './RequestDetail';
import { Clock, Filter, RefreshCw, Coffee, Bed, Car, ShowerHead, Utensils, MapPin, AlertCircle } from 'lucide-react';
interface RequestsPanelProps {
  requests: any[];
  onUpdateRequest: (id: string, update: any) => void;
  knowledgeBase: any[];
}
export const RequestsPanel: React.FC<RequestsPanelProps> = ({
  requests,
  onUpdateRequest,
  knowledgeBase
}) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
  const [typeFilter, setTypeFilter] = useState('all'); // all, food, housekeeping, etc.
  const requestTypes = [{
    id: 'all',
    label: 'All Types'
  }, {
    id: 'room-service',
    label: 'Room Service',
    icon: <Utensils className="w-4 h-4" />
  }, {
    id: 'food',
    label: 'Food & Dining',
    icon: <Coffee className="w-4 h-4" />
  }, {
    id: 'housekeeping',
    label: 'Housekeeping',
    icon: <Bed className="w-4 h-4" />
  }, {
    id: 'transportation',
    label: 'Transportation',
    icon: <Car className="w-4 h-4" />
  }, {
    id: 'amenities',
    label: 'Amenities',
    icon: <ShowerHead className="w-4 h-4" />
  }, {
    id: 'concierge',
    label: 'Concierge',
    icon: <MapPin className="w-4 h-4" />
  }, {
    id: 'other',
    label: 'Other',
    icon: <AlertCircle className="w-4 h-4" />
  }];
  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    return matchesStatus && matchesType;
  });
  return <div className="h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Guest Requests
        </h1>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <div className="relative">
            <select className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {requestTypes.map(type => <option key={type.id} value={type.id}>
                  {type.label}
                </option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <button className="p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4 border-r border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 mb-4">
            {requestTypes.slice(1).map(type => <button key={type.id} onClick={() => setTypeFilter(type.id === typeFilter ? 'all' : type.id)} className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${typeFilter === type.id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </button>)}
          </div>
          {filteredRequests.length > 0 ? filteredRequests.map(request => <RequestCard key={request.id} request={request} isSelected={selectedRequest && selectedRequest.id === request.id} onClick={() => setSelectedRequest(request)} />) : <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mb-2" />
              <p>No requests found</p>
            </div>}
        </div>
        <div className="lg:col-span-2 overflow-y-auto">
          {selectedRequest ? <RequestDetail request={selectedRequest} onUpdateRequest={onUpdateRequest} knowledgeBase={knowledgeBase} /> : <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>Select a request to view details</p>
            </div>}
        </div>
      </div>
    </div>;
};