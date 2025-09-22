'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Thermometer } from 'lucide-react';

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

interface RoomControlsProps {
  selectedGuest: GuestProfile;
  onAddMessage: (content: string, role: 'user' | 'ai') => void;
}

export function RoomControls({ selectedGuest, onAddMessage }: RoomControlsProps) {
  if (selectedGuest.status !== 'inRoom') return null;

  // Get guest-specific lighting effects based on type and preferences
  const getGuestLightingEffects = () => {
    const { guestType, profile } = selectedGuest;
    
    // VIP/Suite guests get full premium lighting options
    if (guestType === 'vip' || guestType === 'suite') {
      return [
        { name: 'Royal Ambiance', command: 'FX=88', description: 'Exclusive warm candle effect', category: 'premium', icon: '👑' },
        { name: 'Diamond Sparkle', command: 'FX=80', description: 'Luxury twinkling stars', category: 'premium', icon: '💎' },
        { name: 'Ocean Meditation', command: 'FX=101', description: 'Calming wave patterns', category: 'relaxing', icon: '🌊' },
        { name: 'Pure Platinum', command: '#FFFFFF', description: 'Premium white light', category: 'professional', icon: '⚪' },
        { name: 'Theater Mode', command: 'FX=13', description: 'Classic marquee chase', category: 'entertainment', icon: '🎭' },
        { name: 'Lightning Show', command: 'FX=57', description: 'Dramatic energy bursts', category: 'energetic', icon: '⚡' }
      ];
    }
    
    // Business guests get efficiency-focused lighting
    if (profile.occupation.includes('Business') || guestType === 'platinum') {
      return [
        { name: 'Work Mode', command: '#FFFFFF', description: 'Pure white for productivity', category: 'professional', icon: '💼' },
        { name: 'Meeting Light', command: '#FFF8DC', description: 'Warm white for video calls', category: 'professional', icon: '📹' },
        { name: 'Focus Blue', command: '#0000FF', description: 'Cool blue for concentration', category: 'professional', icon: '🔵' },
        { name: 'Relaxation', command: 'FX=2', description: 'Breathing effect for breaks', category: 'relaxing', icon: '🫁' },
        { name: 'Power Off', command: 'OFF', description: 'Turn off all lights', category: 'basic', icon: '⚫' }
      ];
    }
    
    // Leisure guests get mood and ambiance options
    if (profile.occupation.includes('Leisure') || selectedGuest.status === 'bookedOffsite') {
      return [
        { name: 'Romantic Dinner', command: 'FX=88', description: 'Perfect for intimate moments', category: 'romantic', icon: '🌹' },
        { name: 'Sunset Vibes', command: '#FF4500', description: 'Warm orange ambiance', category: 'warm', icon: '🌅' },
        { name: 'Ocean Dreams', command: 'FX=101', description: 'Relaxing blue waves', category: 'relaxing', icon: '🌊' },
        { name: 'Party Mode', command: 'FX=89', description: 'Colorful fireworks effect', category: 'energetic', icon: '🎆' },
        { name: 'Rainbow Magic', command: 'FX=9', description: 'Beautiful spectrum display', category: 'colorful', icon: '🌈' },
        { name: 'Gentle Stars', command: 'FX=80', description: 'Soft romantic sparkles', category: 'romantic', icon: '✨' }
      ];
    }
    
    // Default guest lighting options
    return [
      { name: 'Turn On', command: 'ON', description: 'Turn room lights on', category: 'basic', icon: '💡' },
      { name: 'Turn Off', command: 'OFF', description: 'Turn room lights off', category: 'basic', icon: '⚫' },
      { name: 'Romantic', command: 'FX=88', description: 'Warm candle effect', category: 'romantic', icon: '🕯️' },
      { name: 'Work Light', command: '#FFFFFF', description: 'Pure white for reading', category: 'professional', icon: '⚪' },
      { name: 'Relaxing', command: 'FX=2', description: 'Breathing effect', category: 'relaxing', icon: '🫁' }
    ];
  };

  const lightingEffects = getGuestLightingEffects();
  const { guestType } = selectedGuest;

  // Get guest-specific room environment controls
  const getRoomEnvironmentControls = () => {
    if (guestType === 'vip' || guestType === 'suite') {
      return [
        { icon: '🌡️', label: 'Climate Control', action: 'I can adjust temperature, humidity, and air circulation to your preference' },
        { icon: '🎵', label: 'Audio System', action: 'I can control room audio, music, and sound settings' },
        { icon: '🔇', label: 'Privacy Mode', action: 'Activating VIP privacy mode with do not disturb' },
        { icon: '🛏️', label: 'Sleep Settings', action: 'I can optimize room environment for rest' }
      ];
    }
    
    if (selectedGuest.profile.occupation.includes('Business')) {
      return [
        { icon: '🌡️', label: 'Temperature', action: 'What temperature would you prefer for productivity?' },
        { icon: '💨', label: 'Air Quality', action: 'I can optimize air circulation for focus' },
        { icon: '🔇', label: 'Do Not Disturb', action: 'Setting work mode - no interruptions' },
        { icon: '📱', label: 'Device Sync', action: 'I can help sync your devices with room systems' }
      ];
    }
    
    return [
      { icon: '🌡️', label: 'Adjust Temperature', action: 'What temperature would you prefer?' },
      { icon: '💨', label: 'Air Circulation', action: 'I can adjust the air circulation for you' },
      { icon: '🔇', label: 'Do Not Disturb', action: 'Setting do not disturb mode' }
    ];
  };

  const environmentControls = getRoomEnvironmentControls();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Guest-specific lighting controls */}
      <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
        <h3 className="text-[#f3ebe2] font-semibold mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
          {guestType === 'vip' || guestType === 'suite' ? 'Premium' : 
           selectedGuest.profile.occupation.includes('Business') ? 'Professional' : 
           'Room'} Lighting Controls
        </h3>
        
        {/* Quick preset buttons - different for each guest type */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {lightingEffects.slice(0, 2).map((effect) => (
            <button
              key={effect.command}
              onClick={async () => {
                onAddMessage(`Set ${effect.name.toLowerCase()}`, 'user');
                try {
                  await fetch('/api/control-lighting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      room: selectedGuest.stayInfo?.room, 
                      command: effect.command, 
                      userId: selectedGuest.id 
                    })
                  });
                  onAddMessage(`✅ ${effect.name} activated - ${effect.description}`, 'ai');
                } catch (error) {
                  onAddMessage('❌ Lighting control error', 'ai');
                }
              }}
              className={`p-4 rounded-xl text-[#f3ebe2] transition-all hover:scale-105 ${
                effect.category === 'premium' ? 'bg-gradient-to-br from-purple-500/20 to-gold-500/20 border border-purple-500/30' :
                effect.category === 'professional' ? 'bg-gradient-to-br from-blue-500/20 to-gray-500/20 border border-blue-500/30' :
                'bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/30'
              }`}
            >
              <div className="text-2xl mb-2">{effect.icon}</div>
              <div className="font-medium">{effect.name}</div>
              <div className="text-xs opacity-70">{effect.description}</div>
            </button>
          ))}
        </div>

        {/* All lighting effects organized by category */}
        <div className="space-y-3">
          {lightingEffects.slice(2).map((effect) => (
            <button
              key={effect.command}
              onClick={async () => {
                onAddMessage(`Set ${effect.name.toLowerCase()}`, 'user');
                try {
                  const response = await fetch('/api/control-lighting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      room: selectedGuest.stayInfo?.room,
                      command: effect.command,
                      userId: selectedGuest.id
                    })
                  });
                  const result = await response.json();
                  onAddMessage(
                    result.success ? 
                      `✅ ${effect.name} activated - ${effect.description}` : 
                      `❌ Failed: ${result.error}`, 
                    'ai'
                  );
                } catch (error) {
                  onAddMessage('❌ Lighting control error', 'ai');
                }
              }}
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all hover:scale-102 bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <span className="text-xl">{effect.icon}</span>
              <div className="flex-1">
                <div className="text-[#f3ebe2] text-sm font-medium">{effect.name}</div>
                <div className="text-[#f3ebe2]/60 text-xs">{effect.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Guest-specific environment controls */}
      <div className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4">
        <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
          <Thermometer className="w-4 h-4 mr-2 text-blue-400" />
          {guestType === 'vip' || guestType === 'suite' ? 'Suite Environment' : 'Room Environment'}
        </h4>
        
        {/* Dynamic environment display based on guest type */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-[#f3ebe2] text-lg font-bold">
              {guestType === 'vip' ? '24°C' : guestType === 'suite' ? '23°C' : '22°C'}
            </div>
            <div className="text-[#f3ebe2]/60 text-xs">Temperature</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-[#f3ebe2] text-lg font-bold">
              {guestType === 'vip' || guestType === 'suite' ? 'Excellent' : 'Good'}
            </div>
            <div className="text-[#f3ebe2]/60 text-xs">Air Quality</div>
          </div>
        </div>
        
        {/* Guest-specific environment actions */}
        <div className="space-y-2">
          {environmentControls.map((control) => (
            <button
              key={control.label}
              onClick={() => {
                onAddMessage(control.label, 'user');
                onAddMessage(control.action, 'ai');
              }}
              className="w-full flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <span className="text-lg">{control.icon}</span>
              <span className="text-[#f3ebe2] text-sm">{control.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
