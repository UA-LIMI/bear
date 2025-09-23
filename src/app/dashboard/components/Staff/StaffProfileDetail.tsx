import React, { useState } from 'react';
import { Star, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Calendar, Phone, Mail, MapPin, Award, Users, Activity } from 'lucide-react';

interface StaffProfileDetailProps {
  staff: {
    id: string;
    name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    photo: string;
    hireDate: string;
    status: 'active' | 'inactive' | 'on-leave';
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
  };
}

export const StaffProfileDetail: React.FC<StaffProfileDetailProps> = ({
  staff
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderProgressBar = (value: number, color: string = 'purple'): JSX.Element => {
    const colorClasses: Record<string, string> = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      green: 'bg-green-500',
      red: 'bg-red-500'
    };
    
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`${colorClasses[color] || colorClasses.purple} h-2 rounded-full`} 
          style={{ width: `${value}%` }}
        />
      </div>
    );
  };

  const renderStarRating = (rating: number): JSX.Element => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300 dark:text-gray-600'
            }`} 
          />
        ))}
      </div>
    );
  };

  const getTrendIcon = (trend: string): JSX.Element | null => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
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

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-6">
        <img 
          src={staff.photo} 
          alt={staff.name} 
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md" 
        />
        <div className="ml-4">
          <h2 className="text-3xl font-bold text-white">{staff.name}</h2>
          <p className="text-blue-400 text-lg">{staff.position}</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(staff.status)}`}>
            {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'skills', 'schedule', 'tasks', 'metrics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-5 shadow-md">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-500" />
              Personal Information
            </h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                {staff.email}
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                {staff.phone}
              </p>
              <p className="flex items-center">
                <Award className="w-4 h-4 mr-2 text-gray-500" />
                {staff.department}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-5 shadow-md">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-teal-500" />
              Employment Details
            </h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <p className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Hired: {formatDate(staff.hireDate)}
              </p>
              <p className="flex items-center">
                <Activity className="w-4 h-4 mr-2 text-gray-500" />
                Status: {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-5 shadow-md md:col-span-2">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-orange-500" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{staff.metrics.totalGuests}</p>
                <p className="text-sm text-gray-400">Total Guests Served</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{staff.metrics.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-400">Average Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{staff.metrics.responseTime}min</p>
                <p className="text-sm text-gray-400">Avg Response Time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">
            Skills & Expertise
          </h3>
          <div className="space-y-4">
            {staff.skills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-300">
                    {skill.name}
                  </span>
                  <span className="text-sm text-gray-400">
                    {skill.level}%
                  </span>
                </div>
                {renderProgressBar(skill.level, 'blue')}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Recent Feedback
            </h3>
            <div className="space-y-4">
              {staff.recentFeedback.map((feedback, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">
                      {feedback.guestName}
                    </span>
                    <div className="flex items-center">
                      {renderStarRating(feedback.rating)}
                      <span className="ml-2 text-sm text-gray-400">
                        {formatDate(feedback.date)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    {feedback.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">
            Weekly Schedule
          </h3>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {staff.schedule.map((day, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {day.day}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {day.working ? (
                        <span className="flex items-center text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Working
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Off
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {day.working ? `${day.startTime} - ${day.endTime}` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">
            Current Assignments
          </h3>
          <div className="space-y-4">
            {staff.currentAssignments?.map((task) => (
              <div key={task.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-white">
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center text-sm text-gray-400">
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-4">
                Guest Satisfaction
              </h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {staff.metrics.averageRating.toFixed(1)}
                </div>
                {renderStarRating(Math.round(staff.metrics.averageRating))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-4">
                Response Time
              </h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {staff.metrics.responseTime}min
                </div>
                <p className="text-sm text-gray-400">Average</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-4">
                Total Guests
              </h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {staff.metrics.totalGuests}
                </div>
                <p className="text-sm text-gray-400">Served</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-4">
              Rating Distribution
            </h4>
            <div className="space-y-2">
              {staff.metrics.ratings.map((count, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 text-sm text-gray-400">
                    {5 - index} ★
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...staff.metrics.ratings)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-8 text-sm text-gray-400 text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};