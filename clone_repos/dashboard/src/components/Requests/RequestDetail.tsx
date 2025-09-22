import React, { useEffect, useState } from 'react';
import { Clock, User, CheckCircle, XCircle, Send, Calendar, Users, Zap } from 'lucide-react';
import { generateStaffResponse } from '../../services/openaiService';
import { mockStaffProfiles } from '../../services/mockData';
import { agentRegistry } from '../../services/agents/agentRegistry';
interface RequestDetailProps {
  request: any;
  onUpdateRequest: (id: string, update: any) => void;
  knowledgeBase: any[];
}
export const RequestDetail: React.FC<RequestDetailProps> = ({
  request,
  onUpdateRequest,
  knowledgeBase
}) => {
  const [reply, setReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showStaffAssignment, setShowStaffAssignment] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(request.assignedStaff || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  // Filter staff by department relevant to the request type
  const getRelevantDepartment = type => {
    switch (type) {
      case 'food':
      case 'room-service':
        return 'Food & Beverage';
      case 'housekeeping':
      case 'amenities':
        return 'Housekeeping';
      case 'transportation':
      case 'concierge':
        return 'Concierge';
      default:
        return null;
    }
  };
  const relevantDepartment = getRelevantDepartment(request.type);
  const availableStaff = mockStaffProfiles.filter(staff => staff.status === 'on duty' && (!relevantDepartment || staff.department === relevantDepartment));
  useEffect(() => {
    // Reset state when a new request is selected
    setReply('');
    setAiSuggestion('');
    setSelectedStaff(request.assignedStaff || null);
  }, [request?.id, request?.assignedStaff]);
  const formatDateTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const handleStatusChange = status => {
    onUpdateRequest(request.id, {
      status
    });
  };
  const handleSendReply = () => {
    if (!reply.trim()) return;
    onUpdateRequest(request.id, {
      status: 'in-progress',
      conversation: [...request.conversation, {
        sender: 'staff',
        message: reply,
        timestamp: new Date().toISOString()
      }]
    });
    setReply('');
    setAiSuggestion('');
  };
  const handleGenerateResponse = async () => {
    setIsGenerating(true);
    try {
      const suggestion = await generateStaffResponse(request.message, knowledgeBase);
      setAiSuggestion(suggestion);
      setReply(suggestion);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleUseAiSuggestion = () => {
    setReply(aiSuggestion);
  };
  const handleAssignStaff = () => {
    if (selectedStaff) {
      onUpdateRequest(request.id, {
        assignedStaff: selectedStaff
      });
      setShowStaffAssignment(false);
    }
  };
  const handleAnalyzeRequest = async () => {
    setIsAnalyzing(true);
    try {
      const response = await agentRegistry.executeAgent('request-handling-agent', request);
      if (response && response.result) {
        setAiAnalysis(response.result);
        // Auto-update request with AI suggestions if confidence is high
        if (response.confidence > 0.8) {
          onUpdateRequest(request.id, {
            type: response.result.category,
            priority: response.result.priority.level,
            aiSuggestion: response.result.suggestedResponse
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing request:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  return <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Request #{request.id.slice(-4)}
            </h2>
            <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatDateTime(request.timestamp)}</span>
              {request.scheduled && <div className="ml-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Scheduled for {formatDateTime(request.scheduledFor)}
                  </span>
                </div>}
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => handleStatusChange('in-progress')} className={`px-3 py-1 text-sm rounded-md ${request.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
              In Progress
            </button>
            <button onClick={() => handleStatusChange('completed')} className={`px-3 py-1 text-sm rounded-md ${request.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/10'}`}>
              Complete
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Guest
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-2">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-gray-800 dark:text-white font-medium">
                  {request.guestName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Room {request.roomNumber}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
            <div className="flex justify-between">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Request Type
              </div>
              {request.assignedStaff ? <button onClick={() => setShowStaffAssignment(true)} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                  Change Assignment
                </button> : <button onClick={() => setShowStaffAssignment(true)} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                  Assign Staff
                </button>}
            </div>
            <div className="text-gray-800 dark:text-white font-medium capitalize">
              {request.type.replace('-', ' ')}
            </div>
            <div className="flex items-center justify-between mt-1">
              {request.priority === 'high' && <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  High Priority
                </span>}
              {request.assignedStaff && <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Assigned: {request.assignedStaff}</span>
                </div>}
            </div>
          </div>
        </div>
        {/* Staff Assignment Panel */}
        {showStaffAssignment && <div className="mt-4 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-blue-800 dark:text-blue-300">
                Assign Staff Member
              </h3>
              <button onClick={() => setShowStaffAssignment(false)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {availableStaff.map(staff => <div key={staff.id} onClick={() => setSelectedStaff(staff.name)} className={`p-2 rounded-lg border cursor-pointer ${selectedStaff === staff.name ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
                  <div className="flex items-center">
                    <img src={staff.photo} alt={staff.name} className="w-8 h-8 rounded-full object-cover mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {staff.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {staff.department}
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowStaffAssignment(false)} className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 mr-2">
                Cancel
              </button>
              <button onClick={handleAssignStaff} disabled={!selectedStaff} className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Assign
              </button>
            </div>
          </div>}
      </div>
      <div className="p-6 flex-grow overflow-y-auto">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Conversation
        </div>
        <div className="space-y-4">
          {request.conversation.map((message, index) => <div key={index} className={`flex ${message.sender === 'guest' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-3/4 rounded-lg p-3 ${message.sender === 'guest' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'}`}>
                <p className="text-sm">{message.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDateTime(message.timestamp)}
                </p>
              </div>
            </div>)}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {aiSuggestion && <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-md">
            <div className="flex items-start">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                  AI Suggested Response:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {aiSuggestion}
                </p>
                <div className="mt-2 flex justify-end">
                  <button onClick={handleUseAiSuggestion} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    Use This Response
                  </button>
                </div>
              </div>
            </div>
          </div>}
        <div className="flex flex-col space-y-2">
          <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." rows={3} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          <div className="flex justify-between">
            <button onClick={handleGenerateResponse} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Zap className="w-4 h-4 mr-1.5" />
              {isGenerating ? 'Generating...' : 'Generate AI Response'}
            </button>
            <button onClick={handleSendReply} disabled={!reply.trim()} className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-4 h-4 mr-1" />
              Send
            </button>
          </div>
        </div>
      </div>
      {/* Add AI Analysis Button */}
      <div className="px-6 mb-4">
        <button onClick={handleAnalyzeRequest} disabled={isAnalyzing} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-4 py-2 rounded-md flex items-center text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
          <Zap className="w-4 h-4 mr-1.5" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Request with AI'}
        </button>
      </div>
      {/* Display AI Analysis Results */}
      {aiAnalysis && <div className="px-6 mb-4">
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
            <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-1.5" />
              AI Request Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Category:
                </p>
                <p className="text-gray-800 dark:text-white font-medium capitalize">
                  {aiAnalysis.category.replace('-', ' ')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Priority:
                </p>
                <div className="flex items-center">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${aiAnalysis.priority.level === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : aiAnalysis.priority.level === 'normal' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                    {aiAnalysis.priority.level}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {aiAnalysis.priority.explanation}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Recommended Department:
                </p>
                <p className="text-gray-800 dark:text-white font-medium">
                  {aiAnalysis.staffDepartment}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Estimated Time:
                </p>
                <p className="text-gray-800 dark:text-white font-medium">
                  {aiAnalysis.estimatedTime}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Suggested Response:
              </p>
              <p className="text-gray-800 dark:text-white text-sm bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                {aiAnalysis.suggestedResponse}
              </p>
              <div className="mt-2 flex justify-end">
                <button onClick={() => setReply(aiAnalysis.suggestedResponse)} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                  Use This Response
                </button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};