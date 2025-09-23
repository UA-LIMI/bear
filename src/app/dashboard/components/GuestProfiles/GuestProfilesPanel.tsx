import React, { useState } from 'react';
import { Search, Filter, User, Globe, Coffee, Clock, MessageSquare, Heart, AlertCircle } from 'lucide-react';
import { GuestProfileDetail } from './GuestProfileDetail';
// Mock guest profile data - in a real app, this would come from a database
const mockGuestProfiles = [{
  id: 'guest-001',
  name: 'James Wilson',
  email: 'james.wilson@example.com',
  phone: '+1 (555) 123-4567',
  nationality: 'United States',
  language: 'English',
  vipStatus: 'Gold',
  visitCount: 5,
  lastVisit: '2023-08-15',
  roomPreferences: 'High floor, away from elevator, extra pillows',
  dietaryRestrictions: 'No shellfish, prefers low-carb options',
  allergies: 'Shellfish',
  specialOccasions: 'Anniversary on September 12',
  notes: 'Prefers sparkling water in room. Enjoys the spa facilities.',
  photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
  currentRoom: '2104',
  checkIn: '2023-11-10',
  checkOut: '2023-11-15',
  requestHistory: [{
    id: 'req-001',
    type: 'room-service',
    timestamp: '2023-11-11T09:15:00Z',
    message: 'Could I get some extra towels and toiletries delivered to my room?',
    status: 'completed'
  }, {
    id: 'req-002',
    type: 'concierge',
    timestamp: '2023-11-10T18:30:00Z',
    message: 'I need a dinner reservation at Le Bistro for tonight at 8pm if possible.',
    status: 'completed'
  }],
  preferences: {
    dining: ['Fine dining', 'Italian cuisine', 'Wine pairing'],
    activities: ['Spa', 'Golf', 'Business center'],
    roomService: ['Breakfast', 'Evening turndown service']
  }
}, {
  id: 'guest-002',
  name: 'Emma Thompson',
  email: 'emma.t@example.com',
  phone: '+1 (555) 987-6543',
  nationality: 'United Kingdom',
  language: 'English',
  vipStatus: 'Platinum',
  visitCount: 12,
  lastVisit: '2023-10-05',
  roomPreferences: 'Quiet room with city view, extra blankets',
  dietaryRestrictions: 'Vegetarian',
  allergies: 'Nuts, dairy',
  specialOccasions: 'Birthday on March 15',
  notes: 'Prefers herbal tea. Interested in cultural activities and art exhibitions.',
  photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
  currentRoom: '1802',
  checkIn: '2023-11-09',
  checkOut: '2023-11-14',
  requestHistory: [{
    id: 'req-003',
    type: 'food',
    timestamp: '2023-11-10T07:45:00Z',
    message: 'I would like to order breakfast for tomorrow morning at 8am. Can I get the avocado toast and a cappuccino?',
    status: 'completed'
  }, {
    id: 'req-004',
    type: 'concierge',
    timestamp: '2023-11-09T14:20:00Z',
    message: 'Could you recommend some art galleries within walking distance?',
    status: 'completed'
  }],
  preferences: {
    dining: ['Vegetarian cuisine', 'Afternoon tea', 'Organic options'],
    activities: ['Art galleries', 'Yoga', 'Reading'],
    roomService: ['Herbal tea selection', 'Extra pillows']
  }
}, {
  id: 'guest-003',
  name: 'Michael Chen',
  email: 'michael.chen@example.com',
  phone: '+1 (555) 456-7890',
  nationality: 'Canada',
  language: 'English, Mandarin',
  vipStatus: 'Silver',
  visitCount: 3,
  lastVisit: '2023-09-20',
  roomPreferences: 'Business suite with desk, near elevator',
  dietaryRestrictions: 'None',
  allergies: 'None',
  specialOccasions: 'None',
  notes: 'Business traveler. Prefers quick check-in/out. Uses gym facilities regularly.',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  currentRoom: '1506',
  checkIn: '2023-11-07',
  checkOut: '2023-11-12',
  requestHistory: [{
    id: 'req-005',
    type: 'transportation',
    timestamp: '2023-11-08T16:45:00Z',
    message: 'Can you arrange a taxi to take me to the airport tomorrow at 10am?',
    status: 'completed'
  }, {
    id: 'req-006',
    type: 'housekeeping',
    timestamp: '2023-11-07T20:10:00Z',
    message: 'Could I get an extra power adapter for my laptop?',
    status: 'completed'
  }],
  preferences: {
    dining: ['Business lunch', 'Room service', 'Quick breakfast'],
    activities: ['Gym', 'Business center', 'Express checkout'],
    roomService: ['Early morning coffee', 'Late night snacks']
  }
}, {
  id: 'guest-004',
  name: 'Sophia Rodriguez',
  email: 'sophia.r@example.com',
  phone: '+1 (555) 234-5678',
  nationality: 'Spain',
  language: 'Spanish, English',
  vipStatus: 'Gold',
  visitCount: 7,
  lastVisit: '2023-07-12',
  roomPreferences: 'Suite with balcony, bathtub, city view',
  dietaryRestrictions: 'Gluten-free',
  allergies: 'Gluten, penicillin',
  specialOccasions: 'Wedding anniversary on July 24',
  notes: 'Enjoys the spa and pool. Prefers Spanish-speaking staff when available.',
  photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
  currentRoom: '2301',
  checkIn: '2023-11-09',
  checkOut: '2023-11-13',
  requestHistory: [{
    id: 'req-007',
    type: 'housekeeping',
    timestamp: '2023-11-10T14:30:00Z',
    message: 'The AC in my room seems to be not working properly. Can someone take a look?',
    status: 'pending'
  }, {
    id: 'req-008',
    type: 'spa',
    timestamp: '2023-11-09T10:15:00Z',
    message: 'I would like to book a couples massage for tomorrow afternoon.',
    status: 'completed'
  }],
  preferences: {
    dining: ['Spanish cuisine', 'Gluten-free options', 'Fine wines'],
    activities: ['Spa', 'Swimming', 'City tours'],
    roomService: ['Afternoon refreshments', 'Evening turndown with chocolates']
  }
}, {
  id: 'guest-005',
  name: 'David Johnson',
  email: 'david.j@example.com',
  phone: '+1 (555) 876-5432',
  nationality: 'Australia',
  language: 'English',
  vipStatus: 'Standard',
  visitCount: 1,
  lastVisit: 'First visit',
  roomPreferences: 'King bed, fitness equipment if possible',
  dietaryRestrictions: 'High-protein diet',
  allergies: 'None',
  specialOccasions: 'None',
  notes: 'Fitness enthusiast. First time in the city, interested in local attractions.',
  photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=faces',
  currentRoom: '1904',
  checkIn: '2023-11-08',
  checkOut: '2023-11-11',
  requestHistory: [{
    id: 'req-009',
    type: 'amenities',
    timestamp: '2023-11-09T06:20:00Z',
    message: "Could you recommend some good running routes near the hotel? I'd like to go for a morning run tomorrow.",
    status: 'pending'
  }, {
    id: 'req-010',
    type: 'concierge',
    timestamp: '2023-11-08T19:45:00Z',
    message: 'What are the best local attractions to visit during my stay?',
    status: 'completed'
  }],
  preferences: {
    dining: ['High-protein meals', 'Sports nutrition', 'Healthy options'],
    activities: ['Fitness center', 'Running', 'Local sightseeing'],
    roomService: ['Protein shakes', 'Early breakfast']
  }
}];
export const GuestProfilesPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const filteredGuests = mockGuestProfiles.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || guest.email.toLowerCase().includes(searchTerm.toLowerCase()) || guest.currentRoom.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || statusFilter === 'checked-in' && guest.currentRoom || statusFilter === 'vip' && (guest.vipStatus === 'Gold' || guest.vipStatus === 'Platinum');
    return matchesSearch && matchesStatus;
  });
  const getVipStatusColor = (status: string) => {
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
  return <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Guest Profiles
        </h1>
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Search guests or rooms" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Guests</option>
            <option value="checked-in">Currently Checked In</option>
            <option value="vip">VIP Guests</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          {filteredGuests.map((guest: any) => <div key={guest.id} className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedGuest && selectedGuest.id === guest.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setSelectedGuest(guest)}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <img src={guest.photo} alt={guest.name} className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {guest.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getVipStatusColor(guest.vipStatus)}`}>
                      {guest.vipStatus}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4 mr-1" />
                    <span>Room {guest.currentRoom}</span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Globe className="w-4 h-4 mr-1" />
                    <span>{guest.language}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                        Check out:{' '}
                        {new Date(guest.checkOut).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      <span>{guest.requestHistory.length} requests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
        <div className="lg:col-span-2 overflow-y-auto">
          {selectedGuest ? <GuestProfileDetail guest={selectedGuest} /> : <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <User className="w-12 h-12 mb-2" />
              <p>Select a guest to view their profile</p>
            </div>}
        </div>
      </div>
    </div>;
};