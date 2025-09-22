// REAL Google Weather API integration
// Uses Google Weather API: https://weather.googleapis.com/v1/currentConditions:lookup

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'Hong Kong';
    
    // First get coordinates using Google Geocoding
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      throw new Error('Location not found via Google Maps');
    }
    
    const { lat, lng } = geocodeData.results[0].geometry.location;
    const formattedAddress = geocodeData.results[0].formatted_address;
    
    // Get REAL weather data from Google Weather API
    const weatherResponse = await fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`
    );
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Google Weather API error:', weatherResponse.status, errorText);
      throw new Error(`Google Weather API error: ${weatherResponse.status} - ${errorText}`);
    }
    
    const responseText = await weatherResponse.text();
    console.log('Google Weather API response:', responseText);
    
    let weatherData;
    try {
      weatherData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse weather response:', parseError, 'Response:', responseText);
      throw new Error(`Invalid JSON response from Google Weather API: ${responseText.slice(0, 100)}`);
    }
    
    return Response.json({
      success: true,
      weather: {
        temp: Math.round(weatherData.temperature.degrees),
        condition: weatherData.weatherCondition.description.text,
        humidity: weatherData.relativeHumidity,
        description: weatherData.weatherCondition.description.text.toLowerCase(),
        location: formattedAddress,
        coordinates: { lat, lng },
        windSpeed: Math.round(weatherData.wind?.speed?.value || 0),
        pressure: Math.round(weatherData.airPressure?.meanSeaLevelMillibars || 1013),
        uvIndex: weatherData.uvIndex || 0,
        feelsLike: Math.round(weatherData.feelsLikeTemperature.degrees),
        isDaytime: weatherData.isDaytime,
        visibility: weatherData.visibility?.distance || 10
      },
      source: 'google_weather_api',
      timestamp: new Date().toISOString(),
      raw: weatherData // Include full response for debugging
    });
    
  } catch (error) {
    console.error('Google Weather API error:', error);
    throw error; // Don't hide real API errors
  }
}

