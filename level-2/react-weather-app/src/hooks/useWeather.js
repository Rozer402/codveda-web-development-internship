import { useState, useCallback } from 'react';
import { WeatherService } from '../services/weatherService';

/**
 * Custom hook to manage weather search state (loading, error, weather details).
 */
export const useWeather = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeather = useCallback(async (city) => {
    if (!city || !city.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await WeatherService.getWeatherData(city);
      setWeatherData(data);
    } catch (err) {
      setError(err.message || 'Something went wrong while retrieving weather data.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    weatherData,
    fetchWeather,
  };
};
