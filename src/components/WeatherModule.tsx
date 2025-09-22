'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Cloud, CloudRain, CloudSnow, MapPin, RefreshCw, 
  Search, Thermometer, Droplets, Wind, Eye, Loader2,
  CheckCircle, AlertCircle
} from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed?: number;
  pressure?: number;
  uvIndex?: number;
  feelsLike?: number;
  visibility?: number;
  source?: string;
  isLive?: boolean;
  lastUpdated?: string;
  error?: string;
  location?: string;
  coordinates?: { lat: number; lng: number; };
}

interface WeatherModuleProps {
  initialLocation?: string;
  className?: string;
}

export function WeatherModule({ initialLocation = 'Hong Kong', className }: WeatherModuleProps) {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    condition: '',
    humidity: 0,
    isLive: false,
    source: 'loading'
  });
  
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState(initialLocation);
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadWeather(initialLocation);
  }, []);

  const loadWeather = async (location: string) => {
    setLoading(true);
    try {
      console.log(`🌤️ Weather Module: Loading weather for ${location}...`);
      
      const response = await fetch(`/api/get-weather?location=${encodeURIComponent(location)}`);
      const result = await response.json();
      
      if (result?.success && result.weather) {
        setWeather({
          temp: Math.round(result.weather.temp),
          condition: result.weather.condition,
          humidity: result.weather.humidity,
          windSpeed: result.weather.windSpeed,
          pressure: result.weather.pressure,
          uvIndex: result.weather.uvIndex,
          feelsLike: result.weather.feelsLike,
          visibility: result.weather.visibility,
          isLive: true,
          source: result.source,
          lastUpdated: new Date().toISOString(),
          error: undefined,
          location: result.weather.location,
          coordinates: result.weather.coordinates
        });
        setCurrentLocation(location);
        console.log(`✅ Weather Module: Live data loaded for ${location} -`, result.source, `${result.weather.temp}°C`);
      } else {
        console.warn(`⚠️ Weather Module: API error for ${location} -`, result.error);
        setWeather({
          temp: result.weather?.temp || 20,
          condition: result.weather?.condition || 'Unknown',
          humidity: result.weather?.humidity || 50,
          isLive: false,
          source: result.source || 'api_error',
          error: result.error || 'Weather API failed',
          lastUpdated: new Date().toISOString(),
          location: location
        });
      }
    } catch (error) {
      console.error(`❌ Weather Module: Network error for ${location} -`, error);
      setWeather({
        temp: 20,
        condition: 'Unknown',
        humidity: 50,
        isLive: false,
        source: 'network_error',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`,
        lastUpdated: new Date().toISOString(),
        location: location
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchLocation.trim() && searchLocation !== currentLocation) {
      loadWeather(searchLocation.trim());
    }
  };

  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) return Sun;
    if (condition.includes('rain') || condition.includes('shower')) return CloudRain;
    if (condition.includes('snow')) return CloudSnow;
    if (condition.includes('cloud')) return Cloud;
    return Sun;
  };

  const WeatherIcon = getWeatherIcon();

  return (
    <div className={`bg-white/5 backdrop-blur rounded-2xl border border-white/10 ${className}`}>
      {/* Weather Module Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl flex items-center">
            <WeatherIcon className="w-6 h-6 mr-3 text-yellow-400" />
            Live Weather
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${weather.isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs font-medium ${weather.isLive ? 'text-green-300' : 'text-red-300'}`}>
              {weather.isLive ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Location Search */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter any location worldwide..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-white/40 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchLocation.trim()}
            className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={() => loadWeather(currentLocation)}
            disabled={loading}
            className="p-3 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Refresh weather"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Weather Data Display */}
      <div className="p-6">
        {/* Current Location */}
        <div className="mb-6">
          <h3 className="text-white font-semibold text-lg mb-2">{weather.location || currentLocation}</h3>
          <div className="text-gray-400 text-sm">
            {weather.coordinates && `${weather.coordinates.lat.toFixed(4)}, ${weather.coordinates.lng.toFixed(4)}`}
          </div>
        </div>

        {/* Main Weather Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">{weather.temp}°C</div>
            <div className="text-gray-300 text-lg">{weather.condition}</div>
            {weather.feelsLike && (
              <div className="text-gray-400 text-sm mt-1">Feels like {weather.feelsLike}°C</div>
            )}
          </div>
          
          <div className="flex items-center justify-center">
            <WeatherIcon className="w-24 h-24 text-yellow-400" />
          </div>
        </div>

        {/* Detailed Weather Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-semibold">{weather.humidity}%</div>
            <div className="text-gray-400 text-xs">Humidity</div>
          </div>
          
          {weather.windSpeed !== undefined && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Wind className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <div className="text-white font-semibold">{weather.windSpeed} km/h</div>
              <div className="text-gray-400 text-xs">Wind Speed</div>
            </div>
          )}
          
          {weather.pressure !== undefined && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Thermometer className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <div className="text-white font-semibold">{weather.pressure} mb</div>
              <div className="text-gray-400 text-xs">Pressure</div>
            </div>
          )}
          
          {weather.visibility !== undefined && (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Eye className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <div className="text-white font-semibold">{weather.visibility} km</div>
              <div className="text-gray-400 text-xs">Visibility</div>
            </div>
          )}
        </div>

        {/* Map Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowMap(!showMap)}
            className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>{showMap ? 'Hide' : 'Show'} Map</span>
          </button>
        </div>

        {/* Map Display */}
        {showMap && weather.coordinates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/5 rounded-xl border border-white/10 p-4"
          >
            <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <div className="text-white font-medium">{weather.location}</div>
                <div className="text-gray-400 text-sm">
                  {weather.coordinates.lat.toFixed(4)}, {weather.coordinates.lng.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Map integration coming soon
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status and Error Info */}
        <div className="mt-4 space-y-3">
          {/* Data Source Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Source: {weather.source} • Updated: {weather.lastUpdated ? new Date(weather.lastUpdated).toLocaleTimeString() : 'Never'}
            </span>
            <div className="flex items-center space-x-1">
              {weather.isLive ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-400" />
              )}
              <span className={weather.isLive ? 'text-green-400' : 'text-red-400'}>
                {weather.isLive ? 'Live Google Weather API' : 'Fallback Data'}
              </span>
            </div>
          </div>

          {/* Error Display */}
          {!weather.isLive && weather.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-red-300 text-sm font-medium mb-1">Weather API Error</div>
              <div className="text-red-400 text-xs">{weather.error}</div>
              {weather.error.includes('403') && (
                <div className="mt-2 text-xs text-gray-400">
                  💡 Enable Google Weather API in Google Cloud Console to get live data
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
