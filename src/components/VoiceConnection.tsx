/**
 * OpenAI Voice Connection Component - Premium Animated UI
 * 
 * Research Reference: .taskmaster/docs/research/voice-agents-quickstart.md:50-85
 * UI Research: .taskmaster/docs/research/2025-09-15_research-latest-best-practices-for-voice-ai-fronte.md
 * Implementation Guide: .taskmaster/docs/research/CODE_TEMPLATES.md:100-200
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Loader2, AlertCircle, Volume2, Zap, Brain, Waves, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RealtimeSession } from '@openai/agents-realtime';

interface VoiceConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'failed';
  error?: string;
  sessionId?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
}

export function VoiceConnection() {
  const [state, setState] = useState<VoiceConnectionState>({ 
    status: 'disconnected' 
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [config, setConfig] = useState({
    model: 'gpt-4o-realtime-preview',
    voice: 'alloy',
    instructions: 'You are a helpful voice assistant for Limi AI. Be friendly and conversational.'
  });
  const [showConfig, setShowConfig] = useState(false);
  const audioVisualizationRef = useRef<number | null>(null);

  // Available options based on OpenAI API research
  const modelOptions = [
    { value: 'gpt-4o-realtime-preview', label: 'GPT-4o Realtime (Recommended)' },
    { value: 'gpt-realtime', label: 'GPT Realtime (Faster)' }
  ];

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'ash', label: 'Ash (Smooth)' },
    { value: 'ballad', label: 'Ballad (Musical)' },
    { value: 'coral', label: 'Coral (Warm)' },
    { value: 'echo', label: 'Echo (Expressive)' },
    { value: 'sage', label: 'Sage (Wise)' },
    { value: 'shimmer', label: 'Shimmer (Gentle)' },
    { value: 'verse', label: 'Verse (Poetic)' },
    { value: 'marin', label: 'Marin (Clear)' },
    { value: 'cedar', label: 'Cedar (Rich)' }
  ];

  /**
   * Get ephemeral key from our backend
   * Research Reference: .taskmaster/docs/research/IMPLEMENTATION_GUIDE.md:80-100
   */
  const getEphemeralKey = async (): Promise<string> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/client-secret`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: `frontend_${Date.now()}`,
          model: config.model,
          voice: config.voice,
          instructions: config.instructions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend error: ${errorData.message} (${errorData.code})`);
      }

      const data = await response.json();
      
      // Validate ephemeral key format (research requirement)
      if (!data.ephemeralKey || !data.ephemeralKey.startsWith('ek_')) {
        throw new Error('Invalid ephemeral key format received from backend');
      }

      return data.ephemeralKey;

    } catch (error) {
      console.error('🔑 Failed to get ephemeral key:', error);
      throw new Error(`Token acquisition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Connect to OpenAI Realtime API
   * Research Reference: .taskmaster/docs/research/voice-agents-quickstart.md:70-85
   */
  const connect = async () => {
    try {
      setIsConnecting(true);
      setState(prev => ({ ...prev, status: 'connecting', error: undefined }));

      // Dynamic import to avoid SSR issues
      const { RealtimeAgent, RealtimeSession } = await import('@openai/agents-realtime');

      // Create agent (research-backed configuration)
      const agent = new RealtimeAgent({
        name: 'Limi AI Assistant',
        instructions: config.instructions,
      });

      // Create session (research-backed configuration)
      const voiceSession = new RealtimeSession(agent);

      // Get ephemeral key from our backend
      const ephemeralKey = await getEphemeralKey();

      // Connect using ephemeral key (research pattern)
      await voiceSession.connect({ 
        apiKey: ephemeralKey 
      });

      // Store session for disconnect functionality
      setSession(voiceSession);

      setState({
        status: 'connected',
        error: undefined,
        sessionId: `session_${Date.now()}`
      });

      console.log('✅ Voice assistant connected!');

    } catch (error) {
      console.error('💥 Connection failed:', error);
      setState({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Connection failed',
        sessionId: undefined
      });
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect from voice service
   */
  const disconnect = async () => {
    try {
      if (session) {
        await session.close();
        setSession(null);
        console.log('🔌 Voice assistant disconnected');
      }

      setState({
        status: 'disconnected',
        error: undefined,
        sessionId: undefined
      });

    } catch (error) {
      console.error('Disconnect error:', error);
      // Force disconnect even if session.disconnect() fails
      setSession(null);
      setState({
        status: 'disconnected',
        error: undefined,
        sessionId: undefined
      });
    }
  };

  /**
   * Handle connect/disconnect button click
   */
  const handleConnectionToggle = async () => {
    if (state.status === 'connected') {
      await disconnect();
    } else {
      await connect();
    }
  };

  /**
   * Get status badge with animations
   */
  const getStatusBadge = () => {
    const badgeVariants = {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 }
    };

    switch (state.status) {
      case 'connected':
        return (
          <motion.div variants={badgeVariants} initial="initial" animate="animate">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-lg">
              ✨ Connected & Ready
            </Badge>
          </motion.div>
        );
      case 'listening':
        return (
          <motion.div 
            variants={badgeVariants} 
            initial="initial" 
            animate="animate"
            className="animate-pulse"
          >
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-400 shadow-lg">
              🎤 Listening...
            </Badge>
          </motion.div>
        );
      case 'processing':
        return (
          <motion.div variants={badgeVariants} initial="initial" animate="animate">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-lg">
              🧠 Processing...
            </Badge>
          </motion.div>
        );
      case 'speaking':
        return (
          <motion.div variants={badgeVariants} initial="initial" animate="animate">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-lg">
              🗣️ AI Speaking...
            </Badge>
          </motion.div>
        );
      case 'connecting':
        return (
          <motion.div variants={badgeVariants} initial="initial" animate="animate">
            <Badge variant="secondary" className="animate-pulse shadow-lg">
              ⚡ Connecting...
            </Badge>
          </motion.div>
        );
      case 'failed':
        return (
          <motion.div variants={badgeVariants} initial="initial" animate="animate">
            <Badge variant="destructive" className="shadow-lg">
              ❌ Connection Failed
            </Badge>
          </motion.div>
        );
      default:
        return (
          <motion.div variants={badgeVariants} initial="initial" animate="animate">
            <Badge variant="outline" className="shadow-lg">
              💤 Disconnected
            </Badge>
          </motion.div>
        );
    }
  };

  /**
   * Get appropriate icon with animations
   */
  const getConnectionIcon = () => {
    if (isConnecting || state.status === 'connecting') {
      return <Loader2 className="h-8 w-8 animate-spin text-white" />;
    }
    
    switch (state.status) {
      case 'connected':
      case 'listening':
        return <Mic className="h-8 w-8 text-white" />;
      case 'processing':
        return <Brain className="h-8 w-8 text-white" />;
      case 'speaking':
        return <Volume2 className="h-8 w-8 text-white" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-white" />;
      default:
        return <MicOff className="h-8 w-8 text-white" />;
    }
  };

  // Audio visualization effect
  useEffect(() => {
    if (state.status === 'connected' || state.status === 'listening') {
      const animate = () => {
        setAudioLevel(Math.random() * 100);
        audioVisualizationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (audioVisualizationRef.current) {
        cancelAnimationFrame(audioVisualizationRef.current);
      }
      setAudioLevel(0);
    }

    return () => {
      if (audioVisualizationRef.current) {
        cancelAnimationFrame(audioVisualizationRef.current);
      }
    };
  }, [state.status]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-3xl blur-3xl -z-10" />
      
      <div className="relative flex flex-col items-center space-y-8 p-12 border border-white/20 rounded-3xl bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-2xl min-w-[400px]">
        
        {/* Animated Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="flex items-center justify-center space-x-3 mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={{ 
                rotate: state.status === 'connected' ? 360 : 0,
                scale: state.status === 'connected' ? 1.1 : 1
              }}
              transition={{ duration: 2, repeat: state.status === 'connected' ? Infinity : 0, ease: "linear" }}
            >
              <Brain className="h-8 w-8 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Limi AI Voice
            </h2>
          </motion.div>
          <p className="text-muted-foreground">
            Next-generation real-time voice AI assistant
          </p>
        </motion.div>

        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md"
        >
          <motion.button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center justify-between w-full p-3 rounded-xl border border-white/20 bg-white/50 dark:bg-black/50 hover:bg-white/70 dark:hover:bg-black/70 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="font-medium">AI Configuration</span>
            </div>
            <motion.div
              animate={{ rotate: showConfig ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-6 rounded-xl border border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm space-y-4"
              >
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model-select" className="text-sm font-medium">
                    AI Model
                  </Label>
                  <Select
                    value={config.model}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
                    disabled={state.status === 'connected'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label htmlFor="voice-select" className="text-sm font-medium">
                    Voice Style
                  </Label>
                  <Select
                    value={config.voice}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, voice: value }))}
                    disabled={state.status === 'connected'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Instructions/Context */}
                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-sm font-medium">
                    AI Instructions & Context
                  </Label>
                  <Textarea
                    id="instructions"
                    value={config.instructions}
                    onChange={(e) => setConfig(prev => ({ ...prev, instructions: e.target.value }))}
                    disabled={state.status === 'connected'}
                    placeholder="Enter instructions for the AI assistant..."
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This context will be sent to the AI model before starting the conversation.
                  </p>
                </div>

                {state.status === 'connected' && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 p-2 rounded bg-amber-50 dark:bg-amber-950/20">
                    ⚠️ Configuration locked while connected. Disconnect to make changes.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Central Voice Interface */}
        <div className="relative flex flex-col items-center space-y-6">
          
          {/* Animated Status Ring */}
          <div className="relative">
            {/* Outer pulsing ring */}
            <AnimatePresence>
              {(state.status === 'connected' || state.status === 'listening') && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-lg"
                  style={{ width: '140px', height: '140px', left: '-20px', top: '-20px' }}
                />
              )}
            </AnimatePresence>

            {/* Main Voice Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                onClick={handleConnectionToggle}
                disabled={isConnecting}
                size="lg"
                className={`
                  relative w-24 h-24 rounded-full border-4 transition-all duration-500 overflow-hidden
                  ${state.status === 'connected' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 shadow-green-500/50' 
                    : state.status === 'connecting'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 shadow-blue-500/50'
                    : state.status === 'failed'
                    ? 'bg-gradient-to-br from-red-500 to-pink-600 border-red-400 shadow-red-500/50'
                    : 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 hover:from-blue-600 hover:to-purple-700 hover:border-blue-400'
                  } shadow-2xl hover:shadow-3xl
                `}
              >
                {/* Animated Background Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  animate={{ 
                    x: state.status === 'connected' ? ['-100%', '100%'] : '-100%',
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: state.status === 'connected' ? Infinity : 0,
                    ease: "easeInOut" 
                  }}
                />
                
                {/* Icon with animation */}
                <motion.div
                  animate={{ 
                    scale: state.status === 'listening' ? [1, 1.2, 1] : 1,
                    rotate: isConnecting ? 360 : 0
                  }}
                  transition={{ 
                    scale: { duration: 1, repeat: state.status === 'listening' ? Infinity : 0 },
                    rotate: { duration: 2, repeat: isConnecting ? Infinity : 0, ease: "linear" }
                  }}
                >
                  {getConnectionIcon()}
                </motion.div>
              </Button>
            </motion.div>

            {/* Audio Visualization Rings */}
            <AnimatePresence>
              {(state.status === 'connected' || state.status === 'listening') && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.5 + i * 0.3], 
                        opacity: [0.6, 0] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        left: '-2px', 
                        top: '-2px',
                        transform: `scale(${1 + audioLevel / 100})` 
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Animated Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {getStatusBadge()}
          </motion.div>

          {/* Connection Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-2"
          >
            <p className="text-lg font-medium">
              {state.status === 'disconnected' && 'Ready to connect'}
              {state.status === 'connecting' && 'Establishing connection...'}
              {state.status === 'connected' && 'Voice assistant active'}
              {state.status === 'listening' && 'Listening...'}
              {state.status === 'processing' && 'Processing your request...'}
              {state.status === 'speaking' && 'AI is responding...'}
              {state.status === 'failed' && 'Connection failed'}
            </p>
            
            <motion.p 
              className="text-sm text-muted-foreground max-w-sm"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {state.status === 'disconnected' && 'Click the microphone to start your AI conversation'}
              {state.status === 'connecting' && 'Securing connection to OpenAI Realtime API...'}
              {state.status === 'connected' && 'Start speaking - I\'m listening in real-time'}
              {state.status === 'failed' && 'Please check your connection and try again'}
            </motion.p>
          </motion.div>
        </div>

        {/* Waveform Visualization */}
        <AnimatePresence>
          {(state.status === 'connected' || state.status === 'listening') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md"
            >
              <div className="flex items-center justify-center space-x-1 h-16">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-full w-1"
                    animate={{
                      height: [
                        Math.random() * 20 + 10,
                        Math.random() * 40 + 20,
                        Math.random() * 20 + 10
                      ]
                    }}
                    transition={{
                      duration: 0.5 + Math.random(),
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                🎵 Audio visualization
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display with Animation */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="w-full max-w-md"
            >
              <div className="text-sm text-center p-6 border border-red-200 dark:border-red-800 rounded-2xl bg-red-50 dark:bg-red-950/20 backdrop-blur-sm">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-center space-x-2 mb-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="font-semibold text-red-700 dark:text-red-400">Connection Error</span>
                </motion.div>
                <p className="text-red-600 dark:text-red-300 mb-3">{state.error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setState(prev => ({ ...prev, error: undefined }))}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Dismiss
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Status Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ 
                scale: state.status === 'connected' ? [1, 1.2, 1] : 1,
                opacity: state.status === 'connected' ? 1 : 0.5
              }}
              transition={{ duration: 1, repeat: state.status === 'connected' ? Infinity : 0 }}
            >
              <Zap className="h-4 w-4" />
            </motion.div>
            <span>Real-time</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ 
                rotate: state.status === 'processing' ? 360 : 0,
                opacity: state.status === 'processing' ? 1 : 0.5
              }}
              transition={{ duration: 1, repeat: state.status === 'processing' ? Infinity : 0, ease: "linear" }}
            >
              <Brain className="h-4 w-4" />
            </motion.div>
            <span>AI Processing</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ 
                scale: state.status === 'speaking' ? [1, 1.3, 1] : 1,
                opacity: state.status === 'speaking' ? 1 : 0.5
              }}
              transition={{ duration: 0.8, repeat: state.status === 'speaking' ? Infinity : 0 }}
            >
              <Waves className="h-4 w-4" />
            </motion.div>
            <span>Voice Output</span>
          </div>
        </motion.div>

        {/* Technical Info (Development) with Animation */}
        <AnimatePresence>
          {process.env.NODE_ENV === 'development' && state.sessionId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-muted-foreground border-t border-white/20 pt-4 w-full text-center space-y-1"
            >
              <p>🔗 Session: {state.sessionId}</p>
              <p>🔧 Backend: http://localhost:3001</p>
              <p>📡 Model: {config.model}</p>
              <p>🗣️ Voice: {config.voice}</p>
              <p>💭 Context: {config.instructions.slice(0, 50)}...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
