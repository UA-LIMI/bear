import React, { useState } from 'react';
import { Search, Filter, User, Calendar, Clock, Award, Shield, Briefcase } from 'lucide-react';
import { StaffProfileDetail } from './StaffProfileDetail';
import { mockStaffProfiles } from '../../services/mockData';
export const StaffProfilesPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const filteredStaff = mockStaffProfiles.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || staff.position.toLowerCase().includes(searchTerm.toLowerCase()) || staff.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || staff.department.toLowerCase() === departmentFilter.toLowerCase();
    return matchesSearch && matchesDepartment;
  });
  const getDepartmentColor = department => {
    switch (department.toLowerCase()) {
      case 'concierge':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'housekeeping':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'front desk':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400';
      case 'food & beverage':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'maintenance':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };
  const getStatusIndicator = status => {
    switch (status) {
      case 'on duty':
        return 'bg-green-500';
      case 'off duty':
        return 'bg-gray-400';
      case 'on break':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };
  return <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Staff Management
        </h1>
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Search staff" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="all">All Departments</option>
            <option value="concierge">Concierge</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="front desk">Front Desk</option>
            <option value="food & beverage">Food & Beverage</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          {filteredStaff.map(staff => <div key={staff.id} className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedStaff && selectedStaff.id === staff.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => setSelectedStaff(staff)}>
              <div className="flex items-start">
                <div className="flex-shrink-0 relative">
                  <img src={staff.photo} alt={staff.name} className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-700 ${getStatusIndicator(staff.status)}`}></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {staff.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDepartmentColor(staff.department)}`}>
                      {staff.department}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span>{staff.position}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{staff.shift}</span>
                    </div>
                    <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                      <Award className="w-3 h-3 mr-1" />
                      <span>{staff.performance}% rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
        <div className="lg:col-span-2 overflow-y-auto">
          {selectedStaff ? <StaffProfileDetail staff={selectedStaff} /> : <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <User className="w-12 h-12 mb-2" />
              <p>Select a staff member to view their profile</p>
            </div>}
        </div>
      </div>
    </div>;
};