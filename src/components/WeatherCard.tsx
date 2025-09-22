'use client';

import { Sun, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  source?: string;
  isLive?: boolean;
  lastUpdated?: string;
  error?: string;
}

interface WeatherCardProps {
  weather: WeatherData;
  uiTextContent: Record<string, string>;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function WeatherCard({ weather, uiTextContent, onRefresh, refreshing }: WeatherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm p-4"
    >
      <h4 className="text-[#f3ebe2] font-medium mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <Sun className="w-4 h-4 mr-2 text-yellow-400" />
          {uiTextContent.weather_title || 'Hong Kong Weather'}
        </div>
        <div className="flex items-center space-x-2">
          {/* Weather API Status Indicator */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${weather.isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs ${weather.isLive ? 'text-green-300' : 'text-red-300'}`}>
              {weather.isLive ? 'Live' : 'Offline'}
            </span>
          </div>
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-1 rounded hover:bg-white/10 transition-all"
              title="Refresh weather data"
            >
              <RefreshCw className={`w-3 h-3 text-[#f3ebe2]/60 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[#f3ebe2]/70 text-sm">Temperature</span>
          <span className="text-[#f3ebe2] font-bold">{weather.temp}°C</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#f3ebe2]/70 text-sm">Condition</span>
          <span className="text-[#f3ebe2]">{weather.condition}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#f3ebe2]/70 text-sm">Humidity</span>
          <span className="text-[#f3ebe2]">{weather.humidity}%</span>
        </div>
      </div>
      
      {/* Weather Status Info */}
      <div className="mt-3 p-2 bg-white/5 rounded-lg">
        <p className="text-[#f3ebe2]/60 text-xs">
          {weather.temp > 25 ? 'Perfect for exploring Hong Kong or rooftop activities' : 'Great for indoor activities or spa services'}
        </p>
        {!weather.isLive && (
          <div className="mt-2 p-1 bg-red-500/10 border border-red-500/20 rounded text-xs">
            <span className="text-red-300">⚠️ Using fallback data - {weather.source}</span>
            {weather.error && <div className="text-red-400 mt-1">{weather.error}</div>}
          </div>
        )}
        {weather.isLive && (
          <div className="mt-2 text-xs text-green-300">
            ✅ Live from {weather.source} • Updated {new Date(weather.lastUpdated || '').toLocaleTimeString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
