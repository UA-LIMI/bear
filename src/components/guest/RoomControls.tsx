'use client';

import { motion } from 'framer-motion';
import {
  AirVent,
  BedDouble,
  Briefcase,
  Circle,
  Clapperboard,
  Crown,
  Gem,
  Heart,
  Laptop,
  Lightbulb,
  MoonStar,
  Music2,
  Power,
  Rainbow,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Sunset,
  Target,
  Thermometer,
  Video,
  Waves,
  Wine,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

type LightingEffect = {
  name: string;
  command: string;
  description: string;
  category: 'premium' | 'professional' | 'relaxing' | 'entertainment' | 'energetic' | 'romantic' | 'warm' | 'colorful' | 'basic';
  icon: LucideIcon;
};

type EnvironmentControl = {
  icon: LucideIcon;
  label: string;
  action: string;
};

export function RoomControls({ selectedGuest, onAddMessage }: RoomControlsProps) {
  if (selectedGuest.status !== 'inRoom') return null;

  const categoryStyles: Record<LightingEffect['category'], string> = {
    premium: 'bg-gradient-to-br from-purple-500/20 to-amber-500/20 border border-purple-500/30',
    professional: 'bg-gradient-to-br from-blue-500/20 to-slate-500/20 border border-blue-500/30',
    relaxing: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30',
    entertainment: 'bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30',
    energetic: 'bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30',
    romantic: 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30',
    warm: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30',
    colorful: 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30',
    basic: 'bg-gradient-to-br from-slate-600/20 to-slate-700/20 border border-slate-600/30',
  };

  const getGuestLightingEffects = (): LightingEffect[] => {
    const { guestType, profile } = selectedGuest;

    if (guestType === 'vip' || guestType === 'suite') {
      return [
        { name: 'Royal Ambiance', command: 'FX=88', description: 'Exclusive warm candle effect', category: 'premium', icon: Crown },
        { name: 'Diamond Sparkle', command: 'FX=80', description: 'Luxury twinkling stars', category: 'premium', icon: Gem },
        { name: 'Ocean Meditation', command: 'FX=101', description: 'Calming wave patterns', category: 'relaxing', icon: Waves },
        { name: 'Pure Platinum', command: '#FFFFFF', description: 'Premium white light', category: 'professional', icon: Circle },
        { name: 'Theater Mode', command: 'FX=13', description: 'Classic marquee chase', category: 'entertainment', icon: Clapperboard },
        { name: 'Lightning Show', command: 'FX=57', description: 'Dramatic energy bursts', category: 'energetic', icon: Sparkles },
      ];
    }

    if (profile.occupation.includes('Business') || guestType === 'platinum') {
      return [
        { name: 'Work Mode', command: '#FFFFFF', description: 'Pure white for productivity', category: 'professional', icon: Briefcase },
        { name: 'Meeting Light', command: '#FFF8DC', description: 'Warm white for video calls', category: 'professional', icon: Video },
        { name: 'Focus Blue', command: '#0000FF', description: 'Cool blue for concentration', category: 'professional', icon: Target },
        { name: 'Relaxation', command: 'FX=2', description: 'Breathing effect for breaks', category: 'relaxing', icon: Wind },
        { name: 'Power Off', command: 'OFF', description: 'Turn off all lights', category: 'basic', icon: Power },
      ];
    }

    if (profile.occupation.includes('Leisure') || selectedGuest.status === 'bookedOffsite') {
      return [
        { name: 'Romantic Dinner', command: 'FX=88', description: 'Perfect for intimate moments', category: 'romantic', icon: Wine },
        { name: 'Sunset Vibes', command: '#FF4500', description: 'Warm orange ambiance', category: 'warm', icon: Sunset },
        { name: 'Ocean Dreams', command: 'FX=101', description: 'Relaxing blue waves', category: 'relaxing', icon: Waves },
        { name: 'Party Mode', command: 'FX=89', description: 'Colorful fireworks effect', category: 'energetic', icon: Sparkles },
        { name: 'Rainbow Magic', command: 'FX=9', description: 'Spectrum display', category: 'colorful', icon: Rainbow },
        { name: 'Gentle Stars', command: 'FX=80', description: 'Soft atmospheric shimmer', category: 'romantic', icon: Star },
      ];
    }

    return [
      { name: 'Turn On', command: 'ON', description: 'Illuminate the room', category: 'basic', icon: Lightbulb },
      { name: 'Turn Off', command: 'OFF', description: 'Turn off all lighting', category: 'basic', icon: Power },
      { name: 'Romantic', command: 'FX=88', description: 'Warm candlelight ambience', category: 'romantic', icon: Heart },
      { name: 'Work Light', command: '#FFFFFF', description: 'Bright white for reading', category: 'professional', icon: Laptop },
      { name: 'Relaxing', command: 'FX=2', description: 'Gentle breathing effect', category: 'relaxing', icon: Wind },
    ];
  };

  const lightingEffects = getGuestLightingEffects();
  const { guestType } = selectedGuest;

  const getRoomEnvironmentControls = (): EnvironmentControl[] => {
    if (guestType === 'vip' || guestType === 'suite') {
      return [
        { icon: Thermometer, label: 'Climate Control', action: 'I can adjust temperature, humidity, and air circulation to your preference.' },
        { icon: Music2, label: 'Audio System', action: 'I can control room audio, music, and sound settings.' },
        { icon: Shield, label: 'Privacy Mode', action: 'Activating VIP privacy mode with do not disturb.' },
        { icon: BedDouble, label: 'Sleep Settings', action: 'I can optimise the suite for rest.' },
      ];
    }

    if (selectedGuest.profile.occupation.includes('Business')) {
      return [
        { icon: Thermometer, label: 'Temperature', action: 'What temperature would you prefer for productivity?' },
        { icon: AirVent, label: 'Air Quality', action: 'I can optimise air circulation for focus.' },
        { icon: Shield, label: 'Do Not Disturb', action: 'Setting work mode to minimise interruptions.' },
        { icon: Smartphone, label: 'Device Sync', action: 'I can help sync your devices with room systems.' },
      ];
    }

    return [
      { icon: Thermometer, label: 'Adjust Temperature', action: 'What temperature would you prefer?' },
      { icon: AirVent, label: 'Air Circulation', action: 'I can adjust the air circulation for you.' },
      { icon: MoonStar, label: 'Do Not Disturb', action: 'Setting do not disturb mode.' },
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
          {lightingEffects.slice(0, 2).map((effect) => {
            const Icon = effect.icon;
            return (
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
                        userId: selectedGuest.id,
                      }),
                    });
                    onAddMessage(`${effect.name} activated – ${effect.description}`, 'ai');
                  } catch (error) {
                    onAddMessage('Lighting control error. Please try again.', 'ai');
                  }
                }}
                className={`p-4 rounded-xl text-[#f3ebe2] transition-all hover:scale-105 ${categoryStyles[effect.category]}`}
              >
                <Icon className="mb-3 h-6 w-6 text-white" />
                <div className="font-medium">{effect.name}</div>
                <div className="text-xs opacity-70">{effect.description}</div>
              </button>
            );
          })}
        </div>

        {/* All lighting effects organized by category */}
        <div className="space-y-3">
          {lightingEffects.slice(2).map((effect) => {
            const Icon = effect.icon;
            return (
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
                        userId: selectedGuest.id,
                      }),
                    });
                    const result = await response.json();
                    onAddMessage(
                      result.success
                        ? `${effect.name} activated – ${effect.description}`
                        : `Unable to activate ${effect.name}: ${result.error}`,
                      'ai'
                    );
                  } catch (error) {
                    onAddMessage('Lighting control error. Please try again.', 'ai');
                  }
                }}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all hover:scale-102 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <Icon className="h-5 w-5 text-[#f3ebe2]" />
                <div className="flex-1">
                  <div className="text-[#f3ebe2] text-sm font-medium">{effect.name}</div>
                  <div className="text-[#f3ebe2]/60 text-xs">{effect.description}</div>
                </div>
              </button>
            );
          })}
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
          {environmentControls.map((control) => {
            const Icon = control.icon;
            return (
              <button
                key={control.label}
                onClick={() => {
                  onAddMessage(control.label, 'user');
                  onAddMessage(control.action, 'ai');
                }}
                className="w-full flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <Icon className="h-5 w-5 text-[#f3ebe2]" />
                <span className="text-[#f3ebe2] text-sm">{control.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
