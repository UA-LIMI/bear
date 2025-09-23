import React, { useEffect, useState, useRef } from 'react';
import { Zap, Send, Sparkles, User } from 'lucide-react';
export const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    role: string;
    content: string;
    timestamp: Date;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [conversation]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Add user message to conversation
    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);
    // Clear input and show loading state
    setQuery('');
    setIsLoading(true);
    try {
      // Simulate AI response
      setTimeout(() => {
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: "I'm your AI assistant. How can I help you with hotel operations today?",
          timestamp: new Date()
        }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="bg-gradient-to-r from-blue-gradient-start/10 to-blue-gradient-end/10 backdrop-blur-md backdrop-saturate-150 rounded-xl border border-white/20 flex flex-col h-[400px] shadow-glass">
      <div className="flex items-center p-4 border-b border-white/10">
        <Sparkles className="w-5 h-5 text-blue-gradient-end mr-2" />
        <h3 className="text-lg font-medium text-light-100">AI Assistant</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 ? <div className="text-center text-light-300/50 py-8">
            Ask about hotel operations, guest requests, or room status...
          </div> : <>
            {conversation.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3/4 rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-gradient-start/20 backdrop-blur-sm border border-blue-gradient-start/30 text-light-100' : 'bg-dark-100/60 backdrop-blur-sm border border-white/10 text-light-100'}`}>
                  <div className="flex items-center mb-1">
                    {message.role === 'assistant' ? <Zap className="w-4 h-4 mr-1 text-blue-gradient-end" /> : <User className="w-4 h-4 mr-1 text-light-300" />}
                    <span className="text-xs text-light-300/80">
                      {message.role === 'user' ? 'You' : 'AI Assistant'} •{' '}
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>)}
            <div ref={messagesEndRef} />
          </>}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex items-center">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask about hotel operations, guest requests, or room status..." className="flex-1 bg-dark-100/60 backdrop-blur-sm border border-white/10 rounded-l-xl py-2 px-4 text-light-100 placeholder-light-300/50 focus:outline-none focus:ring-1 focus:ring-blue-gradient-start" disabled={isLoading} />
          <button type="submit" disabled={isLoading || !query.trim()} className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-r-xl px-4 py-2 text-white flex items-center disabled:opacity-50">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>;
};