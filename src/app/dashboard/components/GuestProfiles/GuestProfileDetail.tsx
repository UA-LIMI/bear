import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Clock, Globe, Heart, AlertCircle, MessageSquare, Coffee, Utensils, Activity, MapPin, Hotel, Tag, Star, Award, ChevronRight, Zap, Lightbulb, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { mockGuestAISummaries, mockRequests } from '../../services/mockData';
import { agentRegistry } from '../../services/agents/agentRegistry';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { DashboardGuestProfile } from '../../services/guestProfileService';

interface GuestProfileDetailProps {
  guest: DashboardGuestProfile;
}
export const GuestProfileDetail: React.FC<GuestProfileDetailProps> = ({
  guest
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const aiSummary = mockGuestAISummaries[guest.id as keyof typeof mockGuestAISummaries];
  const formatDate = (dateString: string) => {
    if (dateString === 'First visit') return dateString;
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Coffee className="w-4 h-4" />;
      case 'room-service':
        return <Utensils className="w-4 h-4" />;
      case 'concierge':
        return <MapPin className="w-4 h-4" />;
      case 'housekeeping':
        return <Hotel className="w-4 h-4" />;
      case 'spa':
        return <Heart className="w-4 h-4" />;
      case 'transportation':
        return <MapPin className="w-4 h-4" />;
      case 'amenities':
        return <Coffee className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };
  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };
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
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };
  const generateGuestInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const response = await agentRegistry.executeAgent('guest-insight-agent', guest.id);
      if (response && response.result) {
        setAiInsights(response.result);
      }
    } catch (error) {
      console.error('Error generating guest insights:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  return <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <img src={guest.photo} alt={guest.name} className="h-20 w-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-sm" />
          </div>
          <div className="ml-6 flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {guest.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Room {guest.currentRoom} • {guest.nationality}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center">
                <span className={`px-3 py-1 text-xs rounded-full ${getVipStatusColor(guest.vipStatus)}`}>
                  {guest.vipStatus} Member
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{guest.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>{guest.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4 mr-2" />
                <span>{guest.language}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Check-in: {guest.checkIn ? formatDate(guest.checkIn) : 'N/A'} • Check-out:{' '}
                  {guest.checkOut ? formatDate(guest.checkOut) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Activity className="w-4 h-4 mr-2" />
                <span>{guest.visitCount} Previous Visits</span>
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
          <button onClick={() => setActiveTab('preferences')} className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeTab === 'preferences' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Preferences
          </button>
          <button onClick={() => setActiveTab('requests')} className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeTab === 'requests' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Request History
          </button>
          <button onClick={() => setActiveTab('ai')} className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${activeTab === 'ai' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            AI Insights
          </button>
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Guest Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Visit
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {guest.lastVisit ? formatDate(guest.lastVisit) : 'First visit'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Special Occasions
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {guest.specialOccasions || 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dietary Restrictions
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {guest.dietaryRestrictions || 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Allergies
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {guest.allergies || 'None'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Room Preferences
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {guest.roomPreferences}
                </p>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 mt-6">
                  Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {guest.notes}
                </p>
              </div>
            </div>
            {aiSummary && <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      AI Guest Summary
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {aiSummary.overview}
                    </p>
                  </div>
                </div>
              </div>}
          </div>}
        {activeTab === 'preferences' && <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Utensils className="w-5 h-5 mr-2 text-amber-500" />
                  Dining Preferences
                </h3>
                <ul className="space-y-2">
                  {guest.preferences.dining.map((pref: string, index: number) => <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <ChevronRight className="w-4 h-4 text-amber-500 mr-2" />
                      {pref}
                    </li>)}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-500" />
                  Activity Preferences
                </h3>
                <ul className="space-y-2">
                  {guest.preferences.activities.map((pref: string, index: number) => <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <ChevronRight className="w-4 h-4 text-green-500 mr-2" />
                      {pref}
                    </li>)}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Hotel className="w-5 h-5 mr-2 text-blue-500" />
                  Room Service Preferences
                </h3>
                <ul className="space-y-2">
                  {guest.preferences.roomService.map((pref: string, index: number) => <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <ChevronRight className="w-4 h-4 text-blue-500 mr-2" />
                      {pref}
                    </li>)}
                </ul>
              </div>
            </div>
            {aiSummary && <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                  AI-Detected Preferences
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <ul className="space-y-2">
                    {aiSummary.preferences.map((pref, index) => <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                        <Star className="w-4 h-4 text-amber-500 mr-2 mt-1" />
                        {pref}
                      </li>)}
                  </ul>
                </div>
              </div>}
          </div>}
        {activeTab === 'requests' && <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Request History
            </h3>
            <div className="space-y-4">
              {mockRequests.filter(req => req.guestName === guest.name).map((request: any) => <div key={request.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
                        {getRequestTypeIcon(request.type)}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          {request.message}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            {new Date(request.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRequestStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>)}
              {mockRequests.filter(req => req.guestName === guest.name).length === 0 && <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No request history found
                </div>}
            </div>
          </div>}
        {activeTab === 'ai' && aiSummary && <div>
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    AI Guest Analysis
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {aiSummary.overview}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-blue-500" />
                  Spending Patterns
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {aiSummary.spendingPatterns}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-amber-500" />
                  Loyalty Insights
                </h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {aiSummary.loyaltyInsights}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-purple-500" />
                AI Recommendations
              </h3>
              <div className="space-y-4">
                {aiSummary.recommendations.map((recommendation, index) => <div key={index} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {recommendation.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(recommendation.impact)}`}>
                        {recommendation.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {recommendation.description}
                    </p>
                  </div>)}
              </div>
            </div>
          </div>}
        {/* AI Insights Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
              AI Guest Insights
            </h3>
            <button onClick={generateGuestInsights} disabled={isGeneratingInsights} className="px-3 py-1 text-sm rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center disabled:opacity-50">
              <Zap className="w-4 h-4 mr-1" />
              {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
            </button>
          </div>
          {aiInsights ? <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                  Guest Overview
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {aiInsights.overview}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                  Key Preferences
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {aiInsights.preferences.map((pref: string, index: number) => <li key={index} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-purple-500 mr-2">•</span>
                      {pref}
                    </li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                  Personalized Recommendations
                </h4>
                <div className="space-y-3">
                  {aiInsights.recommendations.map((rec: any, index: number) => <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-gray-800 dark:text-white">
                          {rec.title}
                        </h5>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {rec.description}
                      </p>
                    </div>)}
                </div>
              </div>
              {aiInsights.specialAttention && <div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />
                    Special Attention Points
                  </h4>
                  <ul className="space-y-1">
                    {aiInsights.specialAttention.map((point: string, index: number) => <li key={index} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-amber-500 mr-2">•</span>
                        {point}
                      </li>)}
                  </ul>
                </div>}
            </div> : <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Generate AI insights to see personalized recommendations and
              analysis for this guest.
            </div>}
        </div>
      </div>
    </div>;
};