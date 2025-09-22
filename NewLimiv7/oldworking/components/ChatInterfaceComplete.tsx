'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, MessageSquare, Loader2, Zap, Lightbulb, MapPin,
  User, Phone, Utensils, Car, Shield
} from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface GuestProfile {
  id: string;
  name: string;
  status: 'inRoom' | 'bookedOffsite' | 'notLinked';
  membershipTier: string;
  profile: { occupation: string; aiPrompt: string; };
  stayInfo?: { hotel: string; room?: string; location?: string; };
  loyaltyPoints?: number;
  guestType?: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  source?: string;
  isLive?: boolean;
  lastUpdated?: string;
  error?: string;
}

interface ChatInterfaceCompleteProps {
  selectedGuest: GuestProfile;
  weather: WeatherData;
  uiTextContent: Record<string, string>;
  onAddMessage?: (content: string, role: 'user' | 'ai') => void;
}

export function ChatInterfaceComplete({ selectedGuest, weather, uiTextContent, onAddMessage }: ChatInterfaceCompleteProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (content: string, role: 'user' | 'ai') => {
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    onAddMessage?.(content, role);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Enhanced text chat with complete context (maintaining original requirements)
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    addMessage(userMessage, 'user');
    setInputText('');
    setIsLoading(true);

    try {
      // Build comprehensive context for AI (original requirements)
      const fullContext = {
        guestName: selectedGuest.name,
        roomNumber: selectedGuest.stayInfo?.room,
        membershipTier: selectedGuest.membershipTier,
        loyaltyPoints: selectedGuest.loyaltyPoints,
        occupation: selectedGuest.profile.occupation,
        guestType: selectedGuest.guestType,
        location: selectedGuest.stayInfo?.location,
        weather: {
          temp: weather.temp,
          condition: weather.condition,
          humidity: weather.humidity,
          isLive: weather.isLive,
          source: weather.source
        },
        hotelInfo: {
          name: 'The Peninsula Hong Kong',
          location: 'Tsim Sha Tsui, Hong Kong'
        },
        roomCapabilities: {
          lighting: 'WLED system with 20+ effects',
          temperature: 'Smart climate control',
          privacy: 'Do not disturb system',
          entertainment: selectedGuest.guestType === 'vip' ? 'Premium audio/video system' : 'Standard entertainment'
        },
        serviceLevel: selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'premium' :
                     selectedGuest.profile.occupation.includes('Business') ? 'business' : 'standard'
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          guestContext: fullContext
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      // Handle streaming response properly
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      let aiResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        aiResponse += chunk;
      }

      addMessage(aiResponse.trim(), 'ai');
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Enhanced fallback response with full context
      const fallbackResponse = generateContextualResponse(userMessage);
      addMessage(fallbackResponse, 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced contextual responses for fallback (maintaining original logic)
  const generateContextualResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    const guestName = selectedGuest.name;
    const roomNumber = selectedGuest.stayInfo?.room || '';
    const membershipTier = selectedGuest.membershipTier;
    const weatherContext = `${weather.temp}°C ${weather.condition}${weather.isLive ? ' (live data)' : ' (fallback)'}`;
    
    if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
      return `I can help adjust temperature in Room ${roomNumber}, ${guestName}. As a ${membershipTier} member, you have access to premium climate control. What temperature would you prefer?`;
    }
    
    if (lowerMessage.includes('lights') || lowerMessage.includes('lighting')) {
      const lightingOptions = selectedGuest.guestType === 'vip' ? 'royal ambiance, diamond sparkle, pure platinum' :
                             selectedGuest.profile.occupation.includes('Business') ? 'work mode, meeting light, focus blue' :
                             'romantic candle, ocean waves, rainbow magic';
      return `I can control Room ${roomNumber} lighting, ${guestName}. Available options include ${lightingOptions}. Which would you prefer?`;
    }
    
    if (lowerMessage.includes('weather')) {
      const recommendations = weather.temp > 25 ? 'Perfect weather for exploring Victoria Peak, taking the Star Ferry, or visiting rooftop facilities' :
                             weather.temp < 18 ? 'Great weather for indoor activities like shopping, museums, or spa services' :
                             'Pleasant weather suitable for both indoor and outdoor activities';
      return `Current Hong Kong weather: ${weatherContext}. ${recommendations}. Would you like specific recommendations?`;
    }
    
    if (lowerMessage.includes('room service') || lowerMessage.includes('food')) {
      return `I'll be happy to help with room service for Room ${roomNumber}, ${guestName}. As a ${membershipTier} member, you have access to our ${selectedGuest.guestType === 'vip' ? 'private chef services and exclusive menu' : 'full room service menu'}. What would you like to order?`;
    }
    
    if (lowerMessage.includes('concierge') || lowerMessage.includes('help')) {
      return `I can connect you with our ${selectedGuest.guestType === 'vip' ? 'VIP concierge team' : 'concierge services'}, ${guestName}. They can assist with restaurant reservations, transportation, attractions, and any special requests. What would you like help with?`;
    }
    
    // Default response with full context
    return `Hello ${guestName}! I'm your AI assistant for The Peninsula Hong Kong. I can help with Room ${roomNumber} controls (lighting, temperature), Hong Kong recommendations (current weather: ${weatherContext}), hotel services, or answer questions about your ${membershipTier} benefits. How may I assist you today?`;
  };

  // Get guest-specific quick actions
  const getQuickActions = () => {
    const { guestType, profile } = selectedGuest;
    
    if (guestType === 'vip' || guestType === 'suite') {
      return [
        { 
          icon: '👑', 
          label: 'VIP Services', 
          message: 'What VIP services are available?',
          response: `As a ${selectedGuest.membershipTier} member, you have access to our exclusive VIP services including private dining, luxury transportation, personal concierge, and exclusive facility access. What would you like to experience?`
        },
        { 
          icon: '🌹', 
          label: 'Royal Ambiance', 
          message: 'Set royal ambiance lighting',
          response: 'Activating royal ambiance lighting with warm candle effects for an elegant atmosphere.'
        },
        { 
          icon: '🍾', 
          label: 'Premium Dining', 
          message: 'Arrange premium dining experience',
          response: 'I can arrange our signature dining experiences including private chef service, wine pairings, and exclusive restaurant reservations. What type of dining experience interests you?'
        }
      ];
    }
    
    if (profile.occupation.includes('Business')) {
      return [
        { 
          icon: '💼', 
          label: 'Business Setup', 
          message: 'Set up room for business',
          response: 'Setting up your room for business: pure white lighting for productivity, optimal temperature at 22°C, and do not disturb mode activated.'
        },
        { 
          icon: '📹', 
          label: 'Meeting Ready', 
          message: 'Prepare room for video calls',
          response: 'Optimizing room for video calls: adjusting lighting for best camera appearance, ensuring quiet environment, and checking connectivity.'
        },
        { 
          icon: '🚗', 
          label: 'Airport Transfer', 
          message: 'Arrange airport transportation',
          response: 'I can arrange efficient airport transportation with our business express service. What time do you need to depart?'
        }
      ];
    }
    
    return [
      { 
        icon: '🌤️', 
        label: 'Weather & Activities', 
        message: 'Tell me about Hong Kong weather and activities',
        response: `Current Hong Kong weather is ${weather.temp}°C and ${weather.condition}. ${weather.temp > 25 ? 'Perfect weather for exploring the city, visiting rooftop facilities, or taking the Star Ferry!' : 'Great weather for indoor activities like our spa services, shopping in nearby malls, or enjoying afternoon tea.'} Would you like specific recommendations?`
      },
      { 
        icon: '🌹', 
        label: 'Romantic Mode', 
        message: 'Set romantic ambiance',
        response: 'Creating romantic ambiance with warm candle lighting and optimal temperature for a perfect intimate setting.'
      },
      { 
        icon: '💬', 
        label: 'Get Help', 
        message: 'What can you help me with?',
        response: `Hello ${selectedGuest.name}! I can control your Room ${selectedGuest.stayInfo?.room} lighting, provide Hong Kong recommendations, assist with hotel services, or answer any questions about your stay. What would you like help with?`
      }
    ];
  };

  const quickActions = getQuickActions();

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 h-full flex flex-col">
      {/* Enhanced chat header with guest context */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
              selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'from-purple-500 to-pink-500' :
              selectedGuest.profile.occupation.includes('Business') ? 'from-blue-500 to-indigo-500' :
              'from-green-500 to-emerald-500'
            } flex items-center justify-center`}>
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{uiTextContent.ai_assistant_name || 'LIMI AI Assistant'}</h3>
              <p className="text-gray-300 text-sm">
                The Peninsula Hong Kong • Room {selectedGuest.stayInfo?.room} • {selectedGuest.membershipTier}
              </p>
            </div>
          </div>
          
          {/* Context indicators */}
          <div className="text-right text-xs">
            <div className="flex items-center space-x-2 text-gray-300">
              <div className={`w-2 h-2 rounded-full ${weather.isLive ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
              <span>Weather: {weather.isLive ? 'Live' : 'Fallback'}</span>
            </div>
            <div className="text-gray-400 mt-1">
              Context: Guest + Weather + Room
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'from-purple-500 to-pink-500' :
                selectedGuest.profile.occupation.includes('Business') ? 'from-blue-500 to-indigo-500' :
                'from-green-500 to-emerald-500'
              } flex items-center justify-center mx-auto`}>
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-white font-bold text-2xl mb-2">
                  {uiTextContent.welcome_title || `Welcome ${selectedGuest.name}`}
                </h3>
                <p className="text-gray-300 max-w-md mx-auto leading-relaxed">
                  {selectedGuest.status === 'inRoom' && 
                    `Hello ${selectedGuest.name}! I can control your Room ${selectedGuest.stayInfo?.room} lighting, provide Hong Kong recommendations, and assist with all hotel services.`
                  }
                  {selectedGuest.status === 'bookedOffsite' && 
                    `Welcome ${selectedGuest.name}! I can help prepare for your arrival, make reservations, and plan your Hong Kong experience.`
                  }
                  {selectedGuest.status === 'notLinked' && 
                    `Hello ${selectedGuest.name}! I can help explore Hong Kong, find accommodations, and discover local attractions.`
                  }
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Real-time AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Room Controls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Hong Kong Guide</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Message history with enhanced styling */}
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              message.role === 'user'
                ? `bg-gradient-to-br ${
                    selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'from-purple-500 to-pink-500' :
                    selectedGuest.profile.occupation.includes('Business') ? 'from-blue-500 to-indigo-500' :
                    'from-green-500 to-emerald-500'
                  } text-white`
                : 'bg-white/10 text-white border border-white/20 backdrop-blur'
            }`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        
        {/* Enhanced loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className={`w-2 h-2 rounded-full ${
                        selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'bg-purple-400' :
                        selectedGuest.profile.occupation.includes('Business') ? 'bg-blue-400' :
                        'bg-green-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/70">
                  {uiTextContent.processing_message || 'LIMI AI is thinking...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick action buttons - guest specific */}
      <div className="p-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                addMessage(action.message, 'user');
                addMessage(action.response, 'ai');
              }}
              className="flex flex-col items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
            >
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-white text-xs text-center">{action.label}</span>
            </button>
          ))}
        </div>
        
        {/* Text input area with enhanced styling */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputText)}
            placeholder={`Message LIMI AI for Room ${selectedGuest.stayInfo?.room}...`}
            className="flex-1 p-4 rounded-xl bg-white/10 backdrop-blur text-white placeholder-gray-400 border border-white/20 focus:border-white/40 focus:outline-none transition-all"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
              selectedGuest.profile.occupation.includes('Business') ? 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' :
              'bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
