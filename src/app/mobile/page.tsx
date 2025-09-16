'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  MessageSquare, 
  Bell, 
  User, 
  Mic, 
  MicOff, 
  Phone, 
  Send, 
  Sparkles, 
  Volume2, 
  MoreHorizontal,
  Settings
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface VoiceState {
  isVoiceLive: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  level: number;
  latency: number;
  isMuted: boolean;
}

interface User {
  firstName: string;
  plan: string;
  avatar: string;
  usageThisWeek: string;
  streak: number;
}

export default function MobileAI() {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'updates' | 'profile'>('home');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! Want to try live voice chat?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isVoiceLive: false,
    connectionState: 'disconnected',
    level: 0,
    latency: 0,
    isMuted: false
  });
  const [user] = useState<User>({
    firstName: 'Alex',
    plan: 'Pro',
    avatar: '/png/__Logo_Icon_Colored.png',
    usageThisWeek: '1h 23m',
    streak: 7
  });
  const [isStreaming, setIsStreaming] = useState(false);

  const connectVoice = async () => {
    setVoiceState(prev => ({ ...prev, connectionState: 'connecting' }));
    
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVoiceState(prev => ({ 
        ...prev, 
        connectionState: 'connected',
        isVoiceLive: true,
        latency: 45
      }));
      
      addMessage('Voice connection established! You can now speak.', 'system');
    } catch (error) {
      setVoiceState(prev => ({ ...prev, connectionState: 'error' }));
    }
  };

  const disconnectVoice = () => {
    setVoiceState({
      isVoiceLive: false,
      connectionState: 'disconnected',
      level: 0,
      latency: 0,
      isMuted: false
    });
    addMessage('Voice connection ended.', 'system');
  };

  const toggleMute = () => {
    setVoiceState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const addMessage = (content: string, role: 'user' | 'assistant' | 'system') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    addMessage(inputText, 'user');
    setInputText('');
    setIsStreaming(true);

    // Simulate AI response
    setTimeout(() => {
      addMessage(`I received: "${inputText}". This is a demo response with full chat functionality!`, 'assistant');
      setIsStreaming(false);
    }, 1500);
  };

  const renderWelcomeScreen = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 space-y-8"
    >
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#FF6A55] to-[#4DA3FF] p-1">
            <img 
              src="/png/__Logo_Icon_White.png" 
              alt="LIMI" 
              className="w-full h-full object-contain p-2"
            />
          </div>
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'conic-gradient(from 180deg at 50% 50%, rgba(255,106,85,0.6), rgba(77,163,255,0.6), rgba(139,92,246,0.6), rgba(255,106,85,0.6))',
              filter: 'blur(20px)',
              zIndex: -1
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-[#E7EBF5]">
          Welcome back, {user.firstName}
        </h1>
        <p className="text-[#A6B0C1] text-lg">
          Instant AI help via voice or text
        </p>
      </div>

      {/* Profile Summary */}
      <div 
        className="rounded-3xl p-6 backdrop-blur-[18px] border border-white/8"
        style={{
          background: 'radial-gradient(120% 120% at 100% 0%, rgba(77,163,255,0.35) 0%, rgba(255,106,85,0.35) 45%, rgba(10,13,21,0.0) 100%)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={user.avatar} 
            alt="Profile" 
            className="w-12 h-12 rounded-2xl ring-2 ring-[#4DA3FF]"
          />
          <div className="flex-1">
            <h3 className="text-[#E7EBF5] font-semibold">{user.firstName}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-[#FF6A55] to-[#4DA3FF] text-white font-medium">
              {user.plan}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[#E7EBF5] font-bold">{user.usageThisWeek}</p>
            <p className="text-[#A6B0C1] text-sm">This week</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-4">
        <motion.button
          onClick={() => setActiveTab('chat')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-3xl text-white font-bold text-lg"
          style={{
            background: 'linear-gradient(135deg, #FF6A55 0%, #4DA3FF 100%)',
            boxShadow: '0 0 40px rgba(77,163,255,0.45), 0 0 32px rgba(255,106,85,0.35)'
          }}
        >
          Start Chat
        </motion.button>
        
        <button
          onClick={() => setActiveTab('updates')}
          className="w-full py-4 rounded-3xl text-[#E7EBF5] font-semibold border border-white/8 bg-white/5 hover:bg-white/10 transition-all"
        >
          See Updates
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button 
          onClick={connectVoice}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/10 transition-all"
        >
          <Mic className="h-6 w-6 text-[#4DA3FF]" />
          <span className="text-[#A6B0C1] text-sm">Voice Call</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/10 transition-all"
        >
          <MessageSquare className="h-6 w-6 text-[#FF6A55]" />
          <span className="text-[#A6B0C1] text-sm">New Chat</span>
        </button>
        <button 
          onClick={() => setActiveTab('updates')}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/10 transition-all"
        >
          <Sparkles className="h-6 w-6 text-[#8B5CF6]" />
          <span className="text-[#A6B0C1] text-sm">Tips</span>
        </button>
      </div>
    </motion.div>
  );

  const renderChatScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 flex flex-col"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/8">
        <div>
          <h2 className="text-[#E7EBF5] font-semibold">Assistant</h2>
          <p className="text-[#A6B0C1] text-sm">
            {voiceState.isVoiceLive ? `Live • ${voiceState.latency}ms` : 'Text Chat'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={voiceState.isVoiceLive ? disconnectVoice : connectVoice}
            className={`p-2 rounded-xl transition-all ${
              voiceState.isVoiceLive 
                ? 'bg-[#00D692] text-white' 
                : 'bg-white/10 text-[#A6B0C1] hover:bg-white/20'
            }`}
          >
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-xl bg-white/10 text-[#A6B0C1] hover:bg-white/20">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs px-4 py-3 rounded-2xl backdrop-blur-[18px] ${
                message.role === 'user'
                  ? 'bg-[#4DA3FF]/20 text-[#E7EBF5] border border-[#4DA3FF]/30'
                  : message.role === 'system'
                  ? 'bg-[#8B5CF6]/20 text-[#A6B0C1] border border-[#8B5CF6]/30'
                  : 'bg-[#FF6A55]/20 text-[#E7EBF5] border border-[#FF6A55]/30'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[#FF6A55]/20 text-[#E7EBF5] border border-[#FF6A55]/30 px-4 py-3 rounded-2xl backdrop-blur-[18px]">
              <div className="flex gap-1">
                <motion.div 
                  className="w-2 h-2 bg-[#FF6A55] rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="w-2 h-2 bg-[#FF6A55] rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-2 h-2 bg-[#FF6A55] rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Voice Controls (when active) */}
      <AnimatePresence>
        {voiceState.isVoiceLive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 border-t border-white/8"
          >
            <div 
              className="rounded-2xl p-4 backdrop-blur-[18px] border border-white/8"
              style={{ background: 'rgba(77,163,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#E7EBF5] font-medium">Live Voice</span>
                <span className="text-[#00D692] text-sm">{voiceState.latency}ms</span>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-xl transition-all ${
                    voiceState.isMuted 
                      ? 'bg-[#FF5470] text-white' 
                      : 'bg-white/10 text-[#A6B0C1] hover:bg-white/20'
                  }`}
                >
                  {voiceState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={disconnectVoice}
                  className="p-3 rounded-xl bg-[#FF5470] text-white hover:bg-[#FF5470]/80 transition-all"
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-xl bg-white/10 text-[#A6B0C1] hover:bg-white/20 transition-all">
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Input */}
      <div className="p-4 border-t border-white/8">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message…"
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/8 text-[#E7EBF5] placeholder-[#A6B0C1] focus:outline-none focus:ring-2 focus:ring-[#4DA3FF]/50 backdrop-blur-[18px]"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-[#FF6A55] to-[#4DA3FF] text-white disabled:opacity-50 transition-all"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderUpdatesScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-[#E7EBF5]">Updates</h2>
      
      <div 
        className="rounded-3xl p-6 backdrop-blur-[18px] border border-white/8"
        style={{
          background: 'radial-gradient(120% 120% at 100% 0%, rgba(77,163,255,0.35) 0%, rgba(255,106,85,0.35) 45%, rgba(10,13,21,0.0) 100%)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2 py-1 rounded-full bg-[#00D692] text-white text-xs font-medium">New</span>
          <span className="text-[#A6B0C1] text-sm">March 1, 2025</span>
        </div>
        <h3 className="text-[#E7EBF5] font-semibold mb-2">Live Voice Chat</h3>
        <p className="text-[#A6B0C1] text-sm">Real-time voice conversations with AI are now available.</p>
      </div>
    </motion.div>
  );

  const renderProfileScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#E7EBF5]">Profile</h2>
        <button className="p-2 rounded-xl bg-white/10 text-[#A6B0C1] hover:bg-white/20">
          <Settings className="h-5 w-5" />
        </button>
      </div>
      
      <div 
        className="rounded-3xl p-6 backdrop-blur-[18px] border border-white/8 text-center"
        style={{
          background: 'radial-gradient(120% 120% at 100% 0%, rgba(77,163,255,0.35) 0%, rgba(255,106,85,0.35) 45%, rgba(10,13,21,0.0) 100%)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
        }}
      >
        <img 
          src={user.avatar} 
          alt="Profile" 
          className="w-20 h-20 rounded-3xl mx-auto mb-4 ring-2 ring-[#4DA3FF]"
        />
        <h3 className="text-[#E7EBF5] font-bold text-xl mb-1">{user.firstName}</h3>
        <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#FF6A55] to-[#4DA3FF] text-white text-sm font-medium mb-4">
          {user.plan} Plan
        </span>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-[#E7EBF5] font-bold text-lg">{user.usageThisWeek}</p>
            <p className="text-[#A6B0C1] text-sm">Usage</p>
          </div>
          <div>
            <p className="text-[#E7EBF5] font-bold text-lg">{user.streak} days</p>
            <p className="text-[#A6B0C1] text-sm">Streak</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div 
      className="h-screen flex flex-col"
      style={{ 
        backgroundColor: '#0B0F17',
        fontFamily: 'Archivo, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-white/8"
        style={{ backgroundColor: '#0F1523' }}
      >
        <div className="flex items-center gap-3">
          <img 
            src="/png/__Logo_Icon_Colored.png" 
            alt="LIMI" 
            className="w-8 h-8"
          />
          <span className="text-[#E7EBF5] font-bold text-lg">LIMI</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-white/10 text-[#A6B0C1] hover:bg-white/20">
            <Bell className="h-5 w-5" />
          </button>
          <img 
            src={user.avatar} 
            alt="Profile" 
            className="w-8 h-8 rounded-xl ring-1 ring-[#4DA3FF]"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && renderWelcomeScreen()}
        {activeTab === 'chat' && renderChatScreen()}
        {activeTab === 'updates' && renderUpdatesScreen()}
        {activeTab === 'profile' && renderProfileScreen()}
      </div>

      {/* Bottom Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-white/8"
        style={{ 
          backgroundColor: '#0F1523',
          backdropFilter: 'saturate(1.2) blur(18px)'
        }}
      >
        <div className="flex justify-around">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'updates', icon: Bell, label: 'Updates' },
            { id: 'profile', icon: User, label: 'Me' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'text-[#4DA3FF]'
                  : 'text-[#A6B0C1] hover:text-[#E7EBF5]'
              }`}
            >
              <tab.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
