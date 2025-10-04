'use client';

import { motion } from 'framer-motion';
import { WeatherCard } from '../WeatherCard';
import {
  Award,
  Briefcase,
  Calendar,
  Car,
  ConciergeBell,
  Crown,
  MapPin,
  Shield,
  Star,
  User,
  UtensilsCrossed,
} from 'lucide-react';

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

interface HotelEvent {
  time: string;
  event: string;
  description?: string;
  type?: string;
}

interface GuestInfoPanelProps {
  selectedGuest: GuestProfile;
  weather: WeatherData;
  hotelEvents: HotelEvent[];
  uiTextContent: Record<string, string>;
  onAddMessage: (content: string, role: 'user' | 'ai') => void;
  onRefreshWeather?: () => void;
}

export function GuestInfoPanel({ 
  selectedGuest, 
  weather, 
  hotelEvents, 
  uiTextContent, 
  onAddMessage,
  onRefreshWeather 
}: GuestInfoPanelProps) {
  
  // Get guest-specific services based on type and preferences
  const getGuestServices = () => {
    const { guestType, profile } = selectedGuest;
    
    if (guestType === 'vip' || guestType === 'suite') {
      return [
        { icon: ConciergeBell, label: 'Concierge Plus', action: 'Connecting you with your dedicated VIP concierge.' },
        { icon: Car, label: 'Luxury Transport', action: 'Arranging Rolls Royce or helicopter transfer services.' },
        { icon: UtensilsCrossed, label: 'Private Dining', action: 'Securing a private chef and curated menu.' },
        { icon: Award, label: 'Exclusive Access', action: 'Coordinating access to private facilities and experiences.' },
      ];
    }
    
    // Business guests get efficiency services
    if (profile.occupation.includes('Business') || guestType === 'platinum') {
      return [
        { icon: Briefcase, label: 'Business Center', action: 'Booking meeting rooms and business amenities.' },
        { icon: ConciergeBell, label: 'Priority Concierge', action: 'Connecting you with a business concierge.' },
        { icon: Car, label: 'Executive Transport', action: 'Arranging punctual airport or meeting transfers.' },
        { icon: Shield, label: 'Technology Support', action: 'Coordinating IT assistance and device setup.' },
      ];
    }
    
    // Leisure guests get experience services
    if (profile.occupation.includes('Leisure') || selectedGuest.status === 'bookedOffsite') {
      return [
        { icon: Star, label: 'Experience Concierge', action: 'Planning curated Hong Kong experiences.' },
        { icon: UtensilsCrossed, label: 'Dining Reservations', action: 'Reserving tables at signature restaurants.' },
        { icon: Car, label: 'Sightseeing Tours', action: 'Arranging guided tours and transportation.' },
        { icon: Award, label: 'Local Highlights', action: 'Showcasing exceptional cultural moments.' },
      ];
    }

    return [
      { icon: UtensilsCrossed, label: 'Room Service', action: 'Coordinating in-room dining and amenities.' },
      { icon: ConciergeBell, label: 'Concierge Desk', action: 'Connecting you with concierge assistance.' },
      { icon: Car, label: 'Transportation', action: 'Arranging transfers or private cars.' },
      { icon: Shield, label: 'Do Not Disturb', action: 'Updating room status to do not disturb.' },
    ];
  };

  // Get guest-specific events (filter based on interests)
  const getRelevantEvents = () => {
    const { guestType, profile } = selectedGuest;

    return hotelEvents
      .filter((event) => {
        const eventLower = event.event.toLowerCase();
        const descLower = (event.description || '').toLowerCase();

        if (guestType === 'vip' || guestType === 'suite') {
          return (
            event.type === 'exclusive' ||
            event.type === 'vip' ||
            eventLower.includes('private') ||
            eventLower.includes('exclusive') ||
            descLower.includes('private') ||
            descLower.includes('exclusive')
          );
        }

        if (profile.occupation.includes('Business')) {
          return (
            event.type === 'business' ||
            event.type === 'networking' ||
            eventLower.includes('meeting') ||
            eventLower.includes('conference') ||
            descLower.includes('meeting') ||
            descLower.includes('conference')
          );
        }

        if (profile.occupation.includes('Leisure')) {
          return (
            event.type === 'entertainment' ||
            event.type === 'cultural' ||
            eventLower.includes('tour') ||
            eventLower.includes('show') ||
            descLower.includes('tour') ||
            descLower.includes('show')
          );
        }

        return event.type !== 'exclusive' && event.type !== 'vip';
      })
      .slice(0, 5);
  };

  const services = getGuestServices();
  const relevantEvents = getRelevantEvents();

  return (
    <div className="space-y-4">
      {/* Weather Card */}
      <WeatherCard 
        weather={weather} 
        uiTextContent={uiTextContent}
        onRefresh={onRefreshWeather}
      />

      {/* Guest Profile - different display based on tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4"
      >
        <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
          <User className="w-4 h-4 mr-2 text-purple-400" />
          {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'VIP Profile' : 'Guest Profile'}
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#f3ebe2]/70 text-sm">Name</span>
            <span className="text-[#f3ebe2] font-medium">{selectedGuest.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#f3ebe2]/70 text-sm">Occupation</span>
            <span className="text-[#f3ebe2] font-medium">{selectedGuest.profile.occupation}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#f3ebe2]/70 text-sm">Membership</span>
            <span className={`font-medium ${
              selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'text-purple-300' : 
              selectedGuest.guestType === 'platinum' ? 'text-blue-300' : 'text-green-300'
            }`}>{selectedGuest.membershipTier}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#f3ebe2]/70 text-sm">Loyalty Points</span>
            <span className="text-green-300 font-bold">{selectedGuest.loyaltyPoints?.toLocaleString()}</span>
          </div>
          
          {/* Guest type specific info */}
          {(selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite') && (
            <div className="mt-3 flex items-center gap-2 rounded border border-purple-500/20 bg-purple-500/10 p-2 text-purple-200">
              <Crown className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Premium privileges enabled</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Relevant Events - filtered by guest type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4"
      >
        <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-green-400" />
          {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'Exclusive Events' :
           selectedGuest.profile.occupation.includes('Business') ? 'Business Events' :
           'Today\'s Events'}
        </h4>
        <div className="space-y-3">
          {relevantEvents.length > 0 ? relevantEvents.map((event, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-[#f3ebe2] text-sm font-medium">{event.event}</div>
                {event.description && (
                  <div className="text-[#f3ebe2]/60 text-xs mt-1">{event.description}</div>
                )}
                {event.type && (
                  <div className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                    event.type === 'exclusive' || event.type === 'vip' ? 'bg-purple-500/20 text-purple-300' :
                    event.type === 'business' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {event.type}
                  </div>
                )}
              </div>
              <div className="text-[#f3ebe2]/70 text-xs ml-3">{event.time}</div>
            </div>
          )) : (
            <div className="text-[#f3ebe2]/60 text-sm">
              No {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'exclusive' : 
                  selectedGuest.profile.occupation.includes('Business') ? 'business' : ''} events today
            </div>
          )}
        </div>
      </motion.div>

      {/* Guest-specific quick services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4"
      >
        <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
          <ConciergeBell className="w-4 h-4 mr-2 text-gray-400" />
          {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'Premium Services' :
           selectedGuest.profile.occupation.includes('Business') ? 'Business Services' :
           'Quick Services'}
        </h4>
        <div className="space-y-2">
          {services.map((service) => (
            <button
              key={service.label}
              onClick={() => {
                onAddMessage(service.action, 'user');
                onAddMessage(`I\'ll organise ${service.label.toLowerCase()} for you right away, ${selectedGuest.name}.`, 'ai');
              }}
              className="w-full flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <service.icon className="w-4 h-4 text-[#93cfa2]" />
              <span className="text-[#f3ebe2] text-sm">{service.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Location info with guest-specific recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4"
      >
        <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-red-400" />
          {uiTextContent.location_title || 'Current Location'}
        </h4>
        <div className="space-y-2">
          <div className="text-[#f3ebe2] text-sm">{selectedGuest.stayInfo?.location}</div>
          <div className="text-[#f3ebe2]/60 text-xs">
            {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 
              'Premium location with exclusive access to VIP facilities and private areas' :
              selectedGuest.profile.occupation.includes('Business') ?
              'Strategic location with easy access to business district and meeting venues' :
              'Perfect location in Tsim Sha Tsui with access to shopping, dining, and attractions'
            }
          </div>
        </div>
        <button 
          onClick={() => {
            const recommendationType = selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'exclusive experiences and VIP access' :
                                    selectedGuest.profile.occupation.includes('Business') ? 'business facilities and meeting venues' :
                                    'attractions and local experiences';
            onAddMessage('Tell me about nearby attractions', 'user');
            onAddMessage(`Based on your location and ${selectedGuest.membershipTier} status, I can refine recommendations for ${recommendationType}. Would tailored suggestions be helpful?`, 'ai');
          }}
          className="w-full mt-3 p-2 bg-[#54bb74]/20 hover:bg-[#54bb74]/30 text-[#54bb74] text-sm rounded-lg transition-all"
        >
          Get {selectedGuest.guestType === 'vip' || selectedGuest.guestType === 'suite' ? 'VIP' : 
               selectedGuest.profile.occupation.includes('Business') ? 'Business' : 'Local'} Recommendations
        </button>
      </motion.div>
    </div>
  );
}
