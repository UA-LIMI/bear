import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Mail, Phone, Users, UserCog, Star, Award } from 'lucide-react';
import { StaffProfileDetail } from './StaffProfileDetail';

interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  photo: string;
  status: 'active' | 'inactive' | 'on-leave';
  hireDate: string;
  skills: Array<{
    name: string;
    level: number;
  }>;
  recentFeedback: Array<{
    guestName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  schedule: Array<{
    day: string;
    working: boolean;
    startTime: string;
    endTime: string;
  }>;
  currentAssignments: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed';
  }>;
  metrics: {
    totalGuests: number;
    averageRating: number;
    responseTime: number;
    ratings: number[];
  };
}

// Mock data for demonstration
const mockStaffProfiles: StaffMember[] = [
  {
    id: 'staff-001',
    name: 'Sarah Johnson',
    position: 'Senior Concierge',
    department: 'Concierge',
    email: 'sarah.johnson@hotel.com',
    phone: '+1 (555) 123-4567',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?w=200&h=200&fit=crop&crop=faces',
    status: 'active',
    hireDate: '2020-03-15',
    skills: [
      { name: 'Customer Service', level: 95 },
      { name: 'Problem Solving', level: 88 },
      { name: 'Multilingual', level: 92 },
      { name: 'Event Planning', level: 85 }
    ],
    recentFeedback: [
      {
        guestName: 'John Smith',
        rating: 5,
        comment: 'Excellent service, went above and beyond!',
        date: '2023-11-10'
      },
      {
        guestName: 'Maria Garcia',
        rating: 4,
        comment: 'Very helpful and professional.',
        date: '2023-11-08'
      }
    ],
    schedule: [
      { day: 'Monday', working: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', working: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', working: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', working: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', working: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Saturday', working: false, startTime: '', endTime: '' },
      { day: 'Sunday', working: false, startTime: '', endTime: '' }
    ],
    currentAssignments: [
      {
        id: 'task-001',
        title: 'VIP Guest Arrival',
        description: 'Prepare welcome package for VIP guest arriving at 3 PM',
        priority: 'high',
        dueDate: '2023-11-15',
        status: 'pending'
      }
    ],
    metrics: {
      totalGuests: 1250,
      averageRating: 4.8,
      responseTime: 2,
      ratings: [5, 12, 8, 3, 1]
    }
  },
  {
    id: 'staff-002',
    name: 'Michael Chen',
    position: 'Front Desk Manager',
    department: 'Front Desk',
    email: 'michael.chen@hotel.com',
    phone: '+1 (555) 987-6543',
    photo: 'https://images.unsplash.com/photo-1507003211169-e69fe1c5a39d?w=200&h=200&fit=crop&crop=faces',
    status: 'active',
    hireDate: '2019-08-20',
    skills: [
      { name: 'Management', level: 90 },
      { name: 'Customer Service', level: 85 },
      { name: 'Problem Solving', level: 88 },
      { name: 'Team Leadership', level: 92 }
    ],
    recentFeedback: [
      {
        guestName: 'Emily White',
        rating: 5,
        comment: 'Outstanding management and service!',
        date: '2023-11-09'
      }
    ],
    schedule: [
      { day: 'Monday', working: true, startTime: '08:00', endTime: '16:00' },
      { day: 'Tuesday', working: true, startTime: '08:00', endTime: '16:00' },
      { day: 'Wednesday', working: true, startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', working: true, startTime: '08:00', endTime: '16:00' },
      { day: 'Friday', working: true, startTime: '08:00', endTime: '16:00' },
      { day: 'Saturday', working: false, startTime: '', endTime: '' },
      { day: 'Sunday', working: false, startTime: '', endTime: '' }
    ],
    currentAssignments: [],
    metrics: {
      totalGuests: 2100,
      averageRating: 4.6,
      responseTime: 3,
      ratings: [8, 15, 12, 5, 2]
    }
  },
  {
    id: 'staff-003',
    name: 'Lisa Rodriguez',
    position: 'Housekeeping Supervisor',
    department: 'Housekeeping',
    email: 'lisa.rodriguez@hotel.com',
    phone: '+1 (555) 456-7890',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
    status: 'active',
    hireDate: '2021-01-10',
    skills: [
      { name: 'Quality Control', level: 95 },
      { name: 'Team Management', level: 88 },
      { name: 'Attention to Detail', level: 98 },
      { name: 'Time Management', level: 90 }
    ],
    recentFeedback: [
      {
        guestName: 'David Green',
        rating: 5,
        comment: 'Room was spotless and beautifully prepared.',
        date: '2023-11-07'
      }
    ],
    schedule: [
      { day: 'Monday', working: true, startTime: '07:00', endTime: '15:00' },
      { day: 'Tuesday', working: true, startTime: '07:00', endTime: '15:00' },
      { day: 'Wednesday', working: true, startTime: '07:00', endTime: '15:00' },
      { day: 'Thursday', working: true, startTime: '07:00', endTime: '15:00' },
      { day: 'Friday', working: true, startTime: '07:00', endTime: '15:00' },
      { day: 'Saturday', working: false, startTime: '', endTime: '' },
      { day: 'Sunday', working: false, startTime: '', endTime: '' }
    ],
    currentAssignments: [
      {
        id: 'task-002',
        title: 'Room Inspection',
        description: 'Inspect all VIP rooms before guest arrival',
        priority: 'high',
        dueDate: '2023-11-15',
        status: 'in-progress'
      }
    ],
    metrics: {
      totalGuests: 1800,
      averageRating: 4.9,
      responseTime: 1,
      ratings: [2, 5, 8, 12, 15]
    }
  }
];

export const StaffProfilesPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredStaff = mockStaffProfiles.filter(staff => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      staff.department.toLowerCase() === departmentFilter.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentColor = (department: string): string => {
    switch (department.toLowerCase()) {
      case 'concierge':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'front desk':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'housekeeping':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'maintenance':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400';
      case 'food & beverage':
        return 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      case 'on-leave':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const departments = ['all', ...new Set(mockStaffProfiles.map(staff => staff.department))];

  return (
    <div className="p-6 bg-gray-900 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Staff Profiles</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
          <UserCog className="w-5 h-5 mr-2" />
          Add New Staff
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or position..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            className="w-full sm:w-48 pl-10 pr-4 py-2 bg-gray-800 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map(department => (
              <option key={department} value={department}>
                {department.charAt(0).toUpperCase() + department.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className={`p-4 rounded-lg cursor-pointer transition-all border ${
                selectedStaff && selectedStaff.id === staff.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedStaff(staff)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <img
                    src={staff.photo}
                    alt={staff.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-lg font-semibold text-white">
                    {staff.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {staff.position}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(staff.department)}`}>
                      {staff.department}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                      {staff.status}
                    </span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    <Star className="w-4 h-4 mr-1" />
                    <span>{staff.metrics.averageRating.toFixed(1)}</span>
                    <span className="ml-2">•</span>
                    <span className="ml-2">{staff.metrics.totalGuests} guests</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
          {filteredStaff.length === 0 && (
            <p className="text-gray-400 text-center py-8">
              No staff found matching your criteria.
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedStaff ? (
            <StaffProfileDetail staff={selectedStaff} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-800 rounded-xl text-gray-500">
              <Users className="w-16 h-16 mb-4" />
              <p className="text-lg">Select a staff member to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};