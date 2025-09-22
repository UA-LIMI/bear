'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

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
}

interface GuestLayoutProps {
  selectedGuest: GuestProfile;
  weather: WeatherData;
  children: ReactNode;
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  bottomPanel?: ReactNode;
}

export function GuestLayout({ 
  selectedGuest, 
  weather, 
  children, 
  leftPanel, 
  rightPanel, 
  bottomPanel 
}: GuestLayoutProps) {
  
  // Dynamic layout based on guest type and membership
  const getLayoutConfig = () => {
    const { guestType, membershipTier, status } = selectedGuest;
    
    // VIP/Suite guests get full-width layouts with priority panels
    if (guestType === 'vip' || guestType === 'suite') {
      return {
        gridCols: 'grid-cols-1 xl:grid-cols-4',
        leftSpan: 'xl:col-span-1',
        centerSpan: 'xl:col-span-2', 
        rightSpan: 'xl:col-span-1',
        showAllPanels: true,
        headerStyle: 'bg-gradient-to-r from-purple-500/20 to-gold-500/20',
        accentColor: 'purple'
      };
    }
    
    // Business guests get efficiency-focused layouts
    if (selectedGuest.profile.occupation.includes('Business') || guestType === 'platinum') {
      return {
        gridCols: 'grid-cols-1 lg:grid-cols-3',
        leftSpan: 'lg:col-span-1',
        centerSpan: 'lg:col-span-2',
        rightSpan: 'hidden', // Hide right panel for focus
        showAllPanels: false,
        headerStyle: 'bg-gradient-to-r from-blue-500/20 to-gray-500/20',
        accentColor: 'blue'
      };
    }
    
    // Leisure guests get visual-rich layouts
    if (selectedGuest.profile.occupation.includes('Leisure') || status === 'bookedOffsite') {
      return {
        gridCols: 'grid-cols-1 lg:grid-cols-5',
        leftSpan: 'lg:col-span-1',
        centerSpan: 'lg:col-span-2',
        rightSpan: 'lg:col-span-2', // Larger right panel for attractions/events
        showAllPanels: true,
        headerStyle: 'bg-gradient-to-r from-green-500/20 to-blue-500/20',
        accentColor: 'green'
      };
    }
    
    // Default layout for standard guests
    return {
      gridCols: 'grid-cols-1 lg:grid-cols-3',
      leftSpan: 'lg:col-span-1',
      centerSpan: 'lg:col-span-1',
      rightSpan: 'lg:col-span-1',
      showAllPanels: true,
      headerStyle: 'bg-gradient-to-r from-[#54bb74]/20 to-[#93cfa2]/20',
      accentColor: 'green'
    };
  };

  const layout = getLayoutConfig();

  return (
    <div className="min-h-screen bg-[#292929] flex flex-col">
      {/* Dynamic header based on guest type */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 ${layout.headerStyle} border-b border-white/10`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${
              layout.accentColor === 'purple' ? 'from-purple-500 to-gold-500' :
              layout.accentColor === 'blue' ? 'from-blue-500 to-gray-500' :
              'from-green-500 to-blue-500'
            } rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">
                {selectedGuest.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-[#f3ebe2] font-bold text-xl">{selectedGuest.name}</h2>
              <div className="flex items-center space-x-3 text-sm">
                <span className={`${
                  layout.accentColor === 'purple' ? 'text-purple-200' :
                  layout.accentColor === 'blue' ? 'text-blue-200' :
                  'text-green-200'
                }`}>{selectedGuest.membershipTier}</span>
                <span className="text-gray-300">•</span>
                <span className="text-green-200">Room {selectedGuest.stayInfo?.room}</span>
                <span className="text-gray-300">•</span>
                <span className="text-yellow-200">{selectedGuest.profile.occupation}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[#f3ebe2] text-sm font-medium">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${weather.isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-blue-200 text-xs">{weather.temp}°C • {weather.condition}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dynamic main content layout */}
      <div className={`flex-1 ${layout.gridCols} gap-4 p-4`}>
        {/* Left panel - conditional based on guest type */}
        {leftPanel && layout.showAllPanels && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={layout.leftSpan}
          >
            {leftPanel}
          </motion.div>
        )}
        
        {/* Center panel - main content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={layout.centerSpan}
        >
          {children}
        </motion.div>
        
        {/* Right panel - conditional based on guest type */}
        {rightPanel && layout.rightSpan !== 'hidden' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={layout.rightSpan}
          >
            {rightPanel}
          </motion.div>
        )}
      </div>

      {/* Bottom panel - voice controls, etc. */}
      {bottomPanel && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {bottomPanel}
        </motion.div>
      )}
    </div>
  );
}
