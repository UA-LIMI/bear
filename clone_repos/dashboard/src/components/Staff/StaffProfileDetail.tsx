import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Clock, CheckCircle, Award, TrendingUp, TrendingDown, Star, AlertTriangle, MessageSquare, Briefcase, Users, ChevronRight, Zap, Lightbulb, Activity, Heart } from 'lucide-react';
interface StaffProfileDetailProps {
  staff: any;
}
export const StaffProfileDetail: React.FC<StaffProfileDetailProps> = ({
  staff
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const renderProgressBar = (value, color = 'purple') => {
    const colorClasses = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      green: 'bg-green-500',
      red: 'bg-red-500'
    };
    return <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`${colorClasses[color]} h-2 rounded-full`} style={{
        width: `${value}%`
      }}></div>
      </div>;
  };
  const renderStarRating = rating => {
    return <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} />)}
      </div>;
  };
  const getTrendIcon = trend => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };
  return <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="flex-shrink-0 relative">
            <img src={staff.photo} alt={staff.name} className="h-20 w-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-sm" />
            <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-gray-700 ${staff.status === 'on duty' ? 'bg-green-500' : staff.status === 'on break' ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
          </div>
          <div className="ml-6 flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {staff.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {staff.position} • {staff.department}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center">
                <span className={`px-3 py-1 text-xs rounded-full ${staff.status === 'on duty' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : staff.status === 'on break' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'}`}>
                  {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{staff.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Joined {formatDate(staff.joinDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Overview
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeTab === 'schedule' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Schedule
          </button>
          <button onClick={() => setActiveTab('tasks')} className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeTab === 'tasks' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Current Tasks
          </button>
          <button onClick={() => setActiveTab('performance')} className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeTab === 'performance' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Performance
          </button>
          <button onClick={() => setActiveTab('ai')} className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeTab === 'ai' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            AI Insights
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Skills & Expertise
              </h3>
              <div className="space-y-4">
                {staff.skills.map(skill => <div key={skill.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {skill.level}%
                      </span>
                    </div>
                    {renderProgressBar(skill.level)}
                  </div>)}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Notes
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {staff.notes}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Recent Feedback
              </h3>
              <div className="space-y-4">
                {staff.recentFeedback?.map((feedback, index) => <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {feedback.guestName}
                      </span>
                      <div className="flex items-center">
                        {renderStarRating(feedback.rating)}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      "{feedback.comment}"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatDate(feedback.date)}
                    </p>
                  </div>)}
              </div>
            </div>
          </div>}

        {activeTab === 'schedule' && <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Weekly Schedule
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Day
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {staff.schedule.map(day => <tr key={day.day}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {day.day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {day.working ? <span className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Working
                          </span> : <span className="text-gray-500 dark:text-gray-400">
                            Off
                          </span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {day.hours || '-'}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}

        {activeTab === 'tasks' && <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Current Assignments
            </h3>
            <div className="space-y-4">
              {staff.currentAssignments?.map(task => <div key={task.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {task.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : task.status === 'in progress' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400`}>
                          {task.type}
                        </span>
                        {task.guest && <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {task.guest}
                          </span>}
                        {task.room && <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            Room {task.room}
                          </span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Due: {formatDate(task.dueDate)}
                      </div>
                    </div>
                  </div>
                  {task.aiGuidance && <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded text-sm text-purple-700 dark:text-purple-300">
                      <div className="flex items-start">
                        <Lightbulb className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <p>{task.aiGuidance}</p>
                      </div>
                    </div>}
                </div>)}
              {(!staff.currentAssignments || staff.currentAssignments.length === 0) && <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No current assignments
                </div>}
            </div>
          </div>}

        {activeTab === 'performance' && <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Guest Satisfaction
                  </h4>
                  {getTrendIcon(staff.metrics.guestSatisfactionTrend)}
                </div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {staff.metrics.guestSatisfaction}%
                  </p>
                </div>
                {renderProgressBar(staff.metrics.guestSatisfaction, 'green')}
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Task Efficiency
                  </h4>
                  {getTrendIcon(staff.metrics.taskEfficiencyTrend)}
                </div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {staff.metrics.taskEfficiency}%
                  </p>
                </div>
                {renderProgressBar(staff.metrics.taskEfficiency, 'blue')}
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Response Rate
                  </h4>
                </div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {staff.metrics.responseRate}%
                  </p>
                </div>
                {renderProgressBar(staff.metrics.responseRate, 'purple')}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                  Task Completion
                </h4>
                <div className="flex items-center justify-center space-x-8">
                  <div className="flex flex-col items-center">
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {staff.metrics.tasksOnTime}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      On Time
                    </p>
                  </div>
                  <div className="h-12 border-l border-gray-200 dark:border-gray-600"></div>
                  <div className="flex flex-col items-center">
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {staff.metrics.totalTasks}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                  Average Resolution Time
                </h4>
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline">
                      <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {staff.metrics.avgResolutionTime}
                      </p>
                      <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                        minutes
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Per Task
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                Rating Distribution
              </h4>
              <div className="space-y-2">
                {staff.metrics.ratings.map((count, index) => <div key={index} className="flex items-center">
                    <div className="w-8 text-sm text-gray-600 dark:text-gray-400">
                      {5 - index} ★
                    </div>
                    <div className="flex-1 ml-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{
                    width: `${count / staff.metrics.ratings.reduce((a, b) => a + b, 0) * 100}%`
                  }}></div>
                      </div>
                    </div>
                    <div className="w-8 text-right text-sm text-gray-600 dark:text-gray-400">
                      {count}
                    </div>
                  </div>)}
              </div>
            </div>
          </div>}

        {activeTab === 'ai' && <div>
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    AI Performance Analysis
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {staff.aiInsights.performance}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-500" />
                  Key Strengths
                </h3>
                <ul className="space-y-2">
                  {staff.aiInsights.strengths.map((strength, index) => <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-amber-500" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {staff.aiInsights.improvementAreas.map((area, index) => <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{area}</span>
                    </li>)}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-500" />
                AI Recommendations
              </h3>
              <div className="space-y-4">
                {staff.aiRecommendations.map((recommendation, index) => <div key={index} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {recommendation.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${recommendation.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : recommendation.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'}`}>
                        {recommendation.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {recommendation.description}
                    </p>
                  </div>)}
              </div>
            </div>
          </div>}
      </div>
    </div>;
};