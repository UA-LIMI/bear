import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for hotel operations. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message to conversation
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      // Call our Vercel AI SDK endpoint
      const response = await fetch('/api/dashboard-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...conversation.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: query
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      // Read the streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let aiResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        aiResponse += chunk;
      }

      setConversation(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error processing AI request:', error);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex items-center">
        <Bot className="w-6 h-6 text-blue-400 mr-3" />
        <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <Bot className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0" />
            )}
            <div
              className={`p-3 rounded-lg max-w-[70%] ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs text-white/70 mt-1 block text-right">
                {formatTime(msg.timestamp)}
              </span>
            </div>
            {msg.role === 'user' && (
              <User className="w-6 h-6 text-gray-400 ml-3 flex-shrink-0" />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start justify-start">
            <Bot className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 animate-pulse" />
            <div className="p-3 rounded-lg bg-gray-700 text-white">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about hotel operations, guest requests, or room status..."
            className="flex-1 bg-gray-700 backdrop-blur-sm border border-white/10 rounded-l-xl py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-r-xl px-4 py-2 text-white flex items-center disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};