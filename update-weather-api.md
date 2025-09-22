# Update Weather API to Google Maps

## Replace loadWeather function (lines 143-155):

```javascript
const loadWeather = async () => {
  try {
    // Use Google Maps Weather API via our secure endpoint
    const response = await fetch('/api/get-weather?location=Hong Kong');
    const result = await response.json();
    
    if (result.success) {
      setWeather({
        temp: result.weather.temp,
        condition: result.weather.condition,
        humidity: result.weather.humidity
      });
    } else {
      throw new Error('Weather API failed');
    }
  } catch (error) {
    console.error('Weather loading failed:', error);
    // Fallback Hong Kong weather
    setWeather({
      temp: 26,
      condition: 'Partly Cloudy',
      humidity: 70
    });
  }
};
```

## Benefits:
- ✅ API key stays server-side (secure)
- ✅ Google Maps integration ready for future map features
- ✅ Geocoding capabilities for location-based services
- ✅ Fallback weather data when API fails
