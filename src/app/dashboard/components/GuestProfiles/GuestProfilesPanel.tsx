import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, User, Users, Loader2 } from 'lucide-react';
import { getGuestProfiles, DashboardGuestProfile } from '../../services/guestProfileService';
import { GuestProfileDetail } from './GuestProfileDetail';

export const GuestProfilesPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<DashboardGuestProfile | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [guestProfiles, setGuestProfiles] = useState<DashboardGuestProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load guest profiles from database
  useEffect(() => {
    const loadGuestProfiles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profiles = await getGuestProfiles();
        setGuestProfiles(profiles);
      } catch (err) {
        console.error('Failed to load guest profiles:', err);
        setError('Failed to load guest profiles. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGuestProfiles();
  }, []);

  const filteredGuests = guestProfiles.filter(guest => {
    const matchesSearch = 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.currentRoom && guest.currentRoom.includes(searchTerm));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'checked-in' && guest.currentRoom) || 
      (statusFilter === 'vip' && (guest.vipStatus === 'Gold' || guest.vipStatus === 'Platinum'));
    
    return matchesSearch && matchesStatus;
  });

  const getVipStatusColor = (status: string): string => {
    switch (status) {
      case 'Platinum':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'Gold':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400';
      case 'Silver':
        return 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-900 rounded-xl shadow-lg h-full flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-4" />
        <p className="text-white">Loading guest profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 rounded-xl shadow-lg h-full flex flex-col items-center justify-center">
        <div className="text-red-400 mb-4">⚠️</div>
        <p className="text-white mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Guest Profiles</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
          <User className="w-5 h-5 mr-2" />
          Add New Guest
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search guests by name, email, or room..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            className="w-full sm:w-48 pl-10 pr-4 py-2 bg-gray-800 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Guests</option>
            <option value="checked-in">Checked In</option>
            <option value="vip">VIP Guests</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className={`p-4 rounded-lg cursor-pointer transition-all border ${
                selectedGuest && selectedGuest.id === guest.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedGuest(guest)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <img
                    src={guest.photo}
                    alt={guest.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-lg font-semibold text-white">
                    {guest.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Room {guest.currentRoom || 'N/A'}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getVipStatusColor(guest.vipStatus)}`}>
                    {guest.vipStatus}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
          {filteredGuests.length === 0 && !isLoading && (
            <p className="text-gray-400 text-center py-8">
              No guests found matching your criteria.
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedGuest ? (
            <GuestProfileDetail guest={selectedGuest} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-800 rounded-xl text-gray-500">
              <Users className="w-16 h-16 mb-4" />
              <p className="text-lg">Select a guest to view details</p>
              <p className="text-sm text-gray-400 mt-2">
                {guestProfiles.length} guests loaded from database
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};