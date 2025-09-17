'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LocationData {
  current_location_address: string | null;
  current_location_city: string | null;
  current_location_country: string | null;
  location_updated_at: string | null;
  location_source: string | null;
}

interface UserLocationDisplayProps {
  userId?: string;
  className?: string;
}

export default function UserLocationDisplay({ userId, className = '' }: UserLocationDisplayProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserLocation();
  }, [userId]);

  const fetchUserLocation = async () => {
    if (!userId) {
      // Try to get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      userId = user.id;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('current_location_address, current_location_city, current_location_country, location_updated_at, location_source')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setLocation(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching location:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch location');
    } finally {
      setLoading(false);
    }
  };

  const formatLocationDisplay = (location: LocationData) => {
    if (!location.current_location_address && !location.current_location_city) {
      return 'Location not set';
    }

    let display = '';
    if (location.current_location_address) {
      display = location.current_location_address;
    } else {
      if (location.current_location_city) display += location.current_location_city;
      if (location.current_location_country) {
        display += display ? `, ${location.current_location_country}` : location.current_location_country;
      }
    }

    return display || 'Location not set';
  };

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return 'Never updated';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Location Display */}
      <div className="flex items-start space-x-2">
        <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div className="flex-1">
          <div className="font-medium text-gray-900">
            {location ? formatLocationDisplay(location) : 'Location not available'}
          </div>
          {location && (
            <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
              <span>
                Updated {formatLastUpdated(location.location_updated_at)}
              </span>
              {location.location_source && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {location.location_source.replace('_', ' ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchUserLocation}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Refresh location</span>
      </button>
    </div>
  );
}
