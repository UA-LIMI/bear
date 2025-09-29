'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Thermometer, Wind, Volume2, Bed, Shield } from 'lucide-react';

import type { GuestProfile } from '@/types/guest';

interface RoomControlsCompleteProps {
  selectedGuest: GuestProfile;
  onAddMessage: (content: string, role: 'user' | 'ai') => void;
}

export function RoomControlsComplete({ selectedGuest, onAddMessage }: RoomControlsCompleteProps) {
  if (selectedGuest.status !== 'inRoom') return null;

  // Get guest-specific lighting effects based on type and preferences
  const getGuestLightingEffects = () => {
    const { guestType, profile } = selectedGuest;
    
    // VIP/Suite guests get full premium lighting options
    if (guestType === 'vip' || guestType === 'suite') {
      return [
        { name: 'Royal Ambiance', command: 'FX=88', description: 'Exclusive warm candle effect', category: 'premium', icon: '👑', rating: 5 },
        { name: 'Diamond Sparkle', command: 'FX=80', description: 'Luxury twinkling stars', category: 'premium', icon: '💎', rating: 5 },
        { name: 'Ocean Meditation', command: 'FX=101', description: 'Calming wave patterns', category: 'relaxing', icon: '🌊', rating: 4 },
        { name: 'Pure Platinum', command: '#FFFFFF', description: 'Premium white light', category: 'professional', icon: '⚪', rating: 5 },
        { name: 'Theater Mode', command: 'FX=13', description: 'Classic marquee chase', category: 'entertainment', icon: '🎭', rating: 4 },
        { name: 'Lightning Show', command: 'FX=57', description: 'Dramatic energy bursts', category: 'energetic', icon: '⚡', rating: 3 },
        { name: 'Royal Purple', command: '#800080', description: 'Elegant purple ambiance', category: 'elegant', icon: '🟣', rating: 4 },
        { name: 'Turn Off', command: 'OFF', description: 'Turn off all lights', category: 'basic', icon: '⚫', rating: 5 }
      ];
    }
    
    // Business guests get efficiency-focused lighting
    if (profile.occupation.includes('Business') || guestType === 'platinum') {
      return [
        { name: 'Work Mode', command: '#FFFFFF', description: 'Pure white for productivity', category: 'professional', icon: '💼', rating: 5 },
        { name: 'Meeting Light', command: '#FFF8DC', description: 'Warm white for video calls', category: 'professional', icon: '📹', rating: 4 },
        { name: 'Focus Blue', command: '#0000FF', description: 'Cool blue for concentration', category: 'professional', icon: '🔵', rating: 4 },
        { name: 'Relaxation', command: 'FX=2', description: 'Breathing effect for breaks', category: 'relaxing', icon: '🫁', rating: 4 },
        { name: 'Turn Off', command: 'OFF', description: 'Turn off all lights', category: 'basic', icon: '⚫', rating: 5 }
      ];
    }
    
    // Leisure guests get mood and ambiance options
    if (profile.occupation.includes('Leisure') || selectedGuest.status === 'bookedOffsite') {
      return [
        { name: 'Romantic Dinner', command: 'FX=88', description: 'Perfect for intimate moments', category: 'romantic', icon: '🌹', rating: 5 },
        { name: 'Sunset Vibes', command: '#FF4500', description: 'Warm orange ambiance', category: 'warm', icon: '🌅', rating: 4 },
        { name: 'Ocean Dreams', command: 'FX=101', description: 'Relaxing blue waves', category: 'relaxing', icon: '🌊', rating: 4 },
        { name: 'Party Mode', command: 'FX=89', description: 'Colorful fireworks effect', category: 'energetic', icon: '🎆', rating: 3 },
        { name: 'Rainbow Magic', command: 'FX=9', description: 'Beautiful spectrum display', category: 'colorful', icon: '🌈', rating: 3 },
        { name: 'Gentle Stars', command: 'FX=80', description: 'Soft romantic sparkles', category: 'romantic', icon: '✨', rating: 4 },
        { name: 'Turn Off', command: 'OFF', description: 'Turn off all lights', category: 'basic', icon: '⚫', rating: 5 }
      ];
    }
    
    // Default guest lighting options
    return [
      { name: 'Turn On', command: 'ON', description: 'Turn room lights on', category: 'basic', icon: '💡', rating: 5 },
      { name: 'Turn Off', command: 'OFF', description: 'Turn room lights off', category: 'basic', icon: '⚫', rating: 5 },
      { name: 'Romantic', command: 'FX=88', description: 'Warm candle effect', category: 'romantic', icon: '🕯️', rating: 4 },
      { name: 'Work Light', command: '#FFFFFF', description: 'Pure white for reading', category: 'professional', icon: '⚪', rating: 5 },
      { name: 'Relaxing', command: 'FX=2', description: 'Breathing effect', category: 'relaxing', icon: '🫁', rating: 4 }
    ];
  };

  // Get guest-specific room environment controls
  const getRoomEnvironmentControls = () => {
    const { guestType, profile } = selectedGuest;
    
    if (guestType === 'vip' || guestType === 'suite') {
      return [
        { icon: '🌡️', label: 'Climate Control', action: 'I can adjust temperature, humidity, and air circulation to your preference', category: 'environment' },
        { icon: '🎵', label: 'Audio System', action: 'I can control room audio, music, and sound settings', category: 'entertainment' },
        { icon: '🔇', label: 'Privacy Mode', action: 'Activating VIP privacy mode with do not disturb', category: 'privacy' },
        { icon: '🛏️', label: 'Sleep Settings', action: 'I can optimize room environment for rest', category: 'comfort' },
        { icon: '💨', label: 'Air Purification', action: 'Activating premium air purification system', category: 'environment' },
        { icon: '🌙', label: 'Night Mode', action: 'Setting up optimal sleep environment', category: 'comfort' }
      ];
    }
    
    if (profile.occupation.includes('Business')) {
      return [
        { icon: '🌡️', label: 'Temperature', action: 'What temperature would you prefer for productivity?', category: 'environment' },
        { icon: '💨', label: 'Air Quality', action: 'I can optimize air circulation for focus', category: 'environment' },
        { icon: '🔇', label: 'Do Not Disturb', action: 'Setting work mode - no interruptions', category: 'privacy' },
        { icon: '📱', label: 'Device Sync', action: 'I can help sync your devices with room systems', category: 'technology' },
        { icon: '💡', label: 'Desk Lighting', action: 'Optimizing lighting for work tasks', category: 'productivity' }
      ];
    }
    
    return [
      { icon: '🌡️', label: 'Adjust Temperature', action: 'What temperature would you prefer?', category: 'environment' },
      { icon: '💨', label: 'Air Circulation', action: 'I can adjust the air circulation for you', category: 'environment' },
      { icon: '🔇', label: 'Do Not Disturb', action: 'Setting do not disturb mode', category: 'privacy' },
      { icon: '🛏️', label: 'Comfort Settings', action: 'I can adjust room settings for comfort', category: 'comfort' }
    ];
  };

  const lightingEffects = getGuestLightingEffects();
  const environmentControls = getRoomEnvironmentControls();

  // Handle lighting control with proper MQTT integration
  const handleLightingControl = async (effect: any) => {
    onAddMessage(`Set ${effect.name.toLowerCase()}`, 'user');
    
    try {
      console.log(`🔗 MQTT: Sending lighting command to Room ${selectedGuest.stayInfo?.room}:`, effect.command);
      
      const response = await fetch('/api/control-lighting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: selectedGuest.stayInfo?.room,
          command: effect.command,
          userId: selectedGuest.id,
          guestType: selectedGuest.guestType,
          effectName: effect.name
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        onAddMessage(`✅ ${effect.name} activated - ${effect.description}`, 'ai');
        console.log(`✅ MQTT: Successfully sent to Room ${selectedGuest.stayInfo?.room}`);
      } else {
        onAddMessage(`❌ Failed to activate ${effect.name}: ${result.error}`, 'ai');
        console.error(`❌ MQTT: Failed for Room ${selectedGuest.stayInfo?.room}:`, result.error);
      }
    } catch (error) {
      onAddMessage(`❌ Lighting control error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'ai');
      console.error('❌ MQTT: Network error:', error);
    }
  };

  // Handle environment control
  const handleEnvironmentControl = (control: any) => {
    onAddMessage(control.label, 'user');
    onAddMessage(control.action, 'ai');
    console.log(`🏠 Environment: ${control.label} requested for Room ${selectedGuest.stayInfo?.room}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Guest-specific lighting controls */}
      <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <Lightbulb className="w-6 h-6 mr-3 text-yellow-400" />
          {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'Premium' : 
           selectedGuest.profile.occupation.includes('Business') ? 'Professional' : 
           'Smart'} Lighting Controls
        </h3>
        
        <div className="text-sm text-gray-300 mb-4">
          Room {selectedGuest.stayInfo?.room} • WLED System • {lightingEffects.length} effects available
        </div>
        
        {/* Quick preset buttons - different for each guest type */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {lightingEffects.slice(0, 2).map((effect) => (
            <button
              key={effect.command}
              onClick={() => handleLightingControl(effect)}
              className={`p-4 rounded-xl text-white transition-all hover:scale-105 ${
                effect.category === 'premium' ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50' :
                effect.category === 'professional' ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/50' :
                effect.category === 'romantic' ? 'bg-gradient-to-br from-pink-500/30 to-red-500/30 border border-pink-500/50' :
                'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/50'
              }`}
            >
              <div className="text-3xl mb-2">{effect.icon}</div>
              <div className="font-medium">{effect.name}</div>
              <div className="text-xs opacity-80 mt-1">{effect.description}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-60">{effect.command}</span>
                <span className="text-xs">{'⭐'.repeat(effect.rating)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* All lighting effects organized by category */}
        <div className="space-y-4">
          <h4 className="text-white/80 text-sm font-medium">All Effects</h4>
          <div className="grid grid-cols-1 gap-2">
            {lightingEffects.slice(2).map((effect) => (
              <button
                key={effect.command}
                onClick={() => handleLightingControl(effect)}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all hover:scale-[1.02] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
              >
                <span className="text-2xl">{effect.icon}</span>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{effect.name}</div>
                  <div className="text-gray-300 text-xs">{effect.description}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-400 text-xs">{effect.command}</span>
                    <span className="text-xs">{'⭐'.repeat(effect.rating)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guest-specific environment controls */}
      <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Thermometer className="w-5 h-5 mr-3 text-blue-400" />
          {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'Suite Environment' : 'Room Environment'}
        </h4>
        
        {/* Dynamic environment display based on guest type */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-white text-lg font-bold">
              {selectedGuest.guestType === 'vip' ? '24°C' : 
               selectedGuest.guestType === 'suite' ? '23°C' : '22°C'}
            </div>
            <div className="text-gray-300 text-xs">Temperature</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-white text-lg font-bold">
              {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'Excellent' : 'Good'}
            </div>
            <div className="text-gray-300 text-xs">Air Quality</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-white text-lg font-bold">
              {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? '45%' : '55%'}
            </div>
            <div className="text-gray-300 text-xs">Humidity</div>
          </div>
        </div>
        
        {/* Guest-specific environment actions */}
        <div className="space-y-2">
          {environmentControls.map((control) => (
            <button
              key={control.label}
              onClick={() => handleEnvironmentControl(control)}
              className="w-full flex items-center space-x-3 p-3 hover:bg-white/5 rounded-lg transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{control.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-medium">{control.label}</div>
                <div className="text-gray-400 text-xs">{control.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick action presets */}
      <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-3 text-green-400" />
          Quick Presets
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {[
            { 
              name: selectedGuest.guestType === 'vip' ? 'VIP Arrival' : selectedGuest.profile.occupation.includes('Business') ? 'Business Setup' : 'Welcome Setup',
              description: selectedGuest.guestType === 'vip' ? 'Royal ambiance + 24°C + privacy mode' : 
                          selectedGuest.profile.occupation.includes('Business') ? 'Work lighting + 22°C + do not disturb' :
                          'Romantic lighting + 23°C + comfort mode',
              icon: selectedGuest.guestType === 'vip' ? '👑' : selectedGuest.profile.occupation.includes('Business') ? '💼' : '🏨',
              actions: selectedGuest.guestType === 'vip' ? ['FX=88', 'TEMP=24', 'PRIVACY=ON'] :
                      selectedGuest.profile.occupation.includes('Business') ? ['#FFFFFF', 'TEMP=22', 'DND=ON'] :
                      ['FX=88', 'TEMP=23', 'COMFORT=ON']
            },
            {
              name: 'Sleep Mode',
              description: 'Dim lighting + optimal temperature + quiet mode',
              icon: '🌙',
              actions: ['FX=2', 'TEMP=20', 'QUIET=ON']
            },
            {
              name: 'Reset Room',
              description: 'Return all settings to default state',
              icon: '🔄',
              actions: ['OFF', 'TEMP=22', 'RESET=ALL']
            }
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={async () => {
                onAddMessage(`Activate ${preset.name}`, 'user');
                
                // Execute multiple commands for preset
                for (const action of preset.actions) {
                  try {
                    await fetch('/api/control-lighting', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        room: selectedGuest.stayInfo?.room,
                        command: action,
                        userId: selectedGuest.id,
                        preset: preset.name
                      })
                    });
                  } catch (error) {
                    console.error(`❌ Preset action failed: ${action}`, error);
                  }
                }
                
                onAddMessage(`✅ ${preset.name} activated - ${preset.description}`, 'ai');
              }}
              className="w-full flex items-center space-x-4 p-4 hover:bg-white/5 rounded-xl transition-all group border border-white/10 hover:border-white/20"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{preset.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-medium">{preset.name}</div>
                <div className="text-gray-300 text-xs">{preset.description}</div>
                <div className="text-gray-400 text-xs mt-1">
                  {preset.actions.length} actions: {preset.actions.join(', ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
