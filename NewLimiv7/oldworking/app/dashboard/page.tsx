'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import UserLocationDisplay from '../../components/UserLocationDisplay';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  guest_type: string;
  room_number: string;
  current_location_address: string;
  current_location_city: string;
  loyalty_points: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightingStatus, setLightingStatus] = useState<string>('unknown');

  useEffect(() => {
    // For demo, auto-login as Umer Asif
    loadUserProfile('a397a03b-f65e-42c1-a8ed-6bebb7c6751b');
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setUser(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const controlLighting = async (command: string) => {
    if (!user) return;
    
    try {
      setLightingStatus('sending...');
      
      const response = await fetch('/api/control-lighting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: user.room_number,
          command,
          userId: user.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setLightingStatus(`✅ ${command} sent successfully`);
      } else {
        setLightingStatus(`❌ Failed: ${result.error}`);
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setLightingStatus('ready'), 3000);
      
    } catch (error) {
      setLightingStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setLightingStatus('ready'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load user profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">The Peninsula Hong Kong</h1>
              <p className="text-gray-600">Hotel Guest Dashboard</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Guest Type</div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {user.guest_type.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Guest Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Profile Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Guest Profile
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{user.display_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Username</div>
                <div className="font-medium">@{user.username}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Room Number</div>
                <div className="font-medium text-blue-600">{user.room_number}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Loyalty Points</div>
                <div className="font-medium text-green-600">{user.loyalty_points.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Current Location
            </h2>
            <UserLocationDisplay userId={user.id} />
          </div>
        </div>

        {/* Room Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <svg className="h-5 w-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {user.room_number} Lighting Control
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            
            {/* Basic Controls */}
            <button
              onClick={() => controlLighting('ON')}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Turn ON
            </button>
            
            <button
              onClick={() => controlLighting('OFF')}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Turn OFF
            </button>
            
            {/* Effect Controls */}
            <button
              onClick={() => controlLighting('FX=88')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              🕯️ Romantic (Candle)
            </button>
            
            <button
              onClick={() => controlLighting('FX=101')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              🌊 Relaxing (Pacifica)
            </button>
          </div>

          {/* More Effects */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => controlLighting('FX=57')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-3 rounded transition-colors text-sm"
            >
              ⚡ Lightning
            </button>
            
            <button
              onClick={() => controlLighting('FX=97')}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-3 rounded transition-colors text-sm"
            >
              🌈 Colorful
            </button>
            
            <button
              onClick={() => controlLighting('FX=80')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-3 rounded transition-colors text-sm"
            >
              ✨ Twinkle
            </button>
          </div>

          {/* Color Controls */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => controlLighting('#FF0000')}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded transition-colors text-sm"
            >
              Red
            </button>
            <button
              onClick={() => controlLighting('#00FF00')}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded transition-colors text-sm"
            >
              Green
            </button>
            <button
              onClick={() => controlLighting('#0000FF')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded transition-colors text-sm"
            >
              Blue
            </button>
            <button
              onClick={() => controlLighting('#FFFFFF')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded transition-colors text-sm"
            >
              White
            </button>
          </div>

          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Lighting Status:</div>
            <div className="font-medium">{lightingStatus}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <button
              onClick={() => {
                controlLighting('ON');
                setTimeout(() => controlLighting('FX=88'), 1000);
              }}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-medium py-3 px-4 rounded-lg transition-all"
            >
              🌅 Evening Ambiance
            </button>
            
            <button
              onClick={() => {
                controlLighting('ON');
                setTimeout(() => controlLighting('#FFFFFF'), 1000);
              }}
              className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
            >
              💼 Work Mode
            </button>
            
            <button
              onClick={() => controlLighting('OFF')}
              className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
            >
              😴 Sleep Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
