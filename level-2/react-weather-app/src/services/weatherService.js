/**
 * Weather Service API Provider
 * Consolidates geocoding and forecast data using the Open-Meteo API (Free, no API key required).
 */

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// WMO Weather interpretation codes
const weatherCodes = {
  0: { desc: 'clear sky', icon: 'fa-sun' },
  1: { desc: 'mainly clear', icon: 'fa-cloud-sun' },
  2: { desc: 'partly cloudy', icon: 'fa-cloud-sun' },
  3: { desc: 'overcast', icon: 'fa-cloud' },
  45: { desc: 'fog', icon: 'fa-smog' },
  48: { desc: 'depositing rime fog', icon: 'fa-smog' },
  51: { desc: 'light drizzle', icon: 'fa-cloud-rain' },
  53: { desc: 'moderate drizzle', icon: 'fa-cloud-rain' },
  55: { desc: 'dense drizzle', icon: 'fa-cloud-rain' },
  56: { desc: 'light freezing drizzle', icon: 'fa-cloud-rain' },
  57: { desc: 'dense freezing drizzle', icon: 'fa-cloud-rain' },
  61: { desc: 'slight rain', icon: 'fa-cloud-showers-heavy' },
  63: { desc: 'moderate rain', icon: 'fa-cloud-showers-heavy' },
  65: { desc: 'heavy rain', icon: 'fa-cloud-showers-heavy' },
  66: { desc: 'light freezing rain', icon: 'fa-cloud-showers-heavy' },
  67: { desc: 'heavy freezing rain', icon: 'fa-cloud-showers-heavy' },
  71: { desc: 'slight snow fall', icon: 'fa-snowflake' },
  73: { desc: 'moderate snow fall', icon: 'fa-snowflake' },
  75: { desc: 'heavy snow fall', icon: 'fa-snowflake' },
  77: { desc: 'snow grains', icon: 'fa-snowflake' },
  80: { desc: 'slight rain showers', icon: 'fa-cloud-sun-rain' },
  81: { desc: 'moderate rain showers', icon: 'fa-cloud-sun-rain' },
  82: { desc: 'violent rain showers', icon: 'fa-cloud-showers-water' },
  85: { desc: 'slight snow showers', icon: 'fa-snowflake' },
  86: { desc: 'heavy snow showers', icon: 'fa-snowflake' },
  95: { desc: 'thunderstorm', icon: 'fa-cloud-bolt' },
  96: { desc: 'thunderstorm with slight hail', icon: 'fa-cloud-bolt' },
  99: { desc: 'thunderstorm with heavy hail', icon: 'fa-cloud-bolt' },
};

function getWeatherInfo(code) {
  return weatherCodes[code] || { desc: 'unknown weather', icon: 'fa-cloud' };
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getDayName(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { weekday: 'short' });
}

export const WeatherService = {
  /**
   * Resolves a city name to latitude and longitude.
   * @param {string} city - Target city name
   */
  async geocodeCity(city) {
    const response = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!response.ok) {
      throw new Error('Failed to search for the city location.');
    }
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error(`City "${city}" not found. Please try another city.`);
    }
    return data.results[0]; // { name, latitude, longitude, country, country_code }
  },

  /**
   * Retrieves current weather and forecast for given coordinates.
   */
  async getWeatherData(city) {
    if (!city || !city.trim()) {
      throw new Error('City name is required.');
    }

    // Resolve location
    const location = await this.geocodeCity(city);
    const { latitude, longitude, name, country } = location;

    // Fetch forecast & current details
    const response = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
    );

    if (!response.ok) {
      throw new Error('Failed to retrieve weather details from server.');
    }

    const data = await response.json();

    const currentInfo = getWeatherInfo(data.current.weather_code);
    
    // Parse 5-day forecast (excluding current day if needed, or taking first 5 days)
    const forecastDays = [];
    const dailyData = data.daily;
    const count = Math.min(dailyData.time.length, 5);

    for (let i = 0; i < count; i++) {
      const info = getWeatherInfo(dailyData.weather_code[i]);
      forecastDays.push({
        date: getDayName(dailyData.time[i]),
        tempMax: Math.round(dailyData.temperature_2m_max[i]),
        tempMin: Math.round(dailyData.temperature_2m_min[i]),
        weatherIcon: info.icon,
        weatherDesc: info.desc,
      });
    }

    return {
      city: name,
      country: country || '',
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      weatherIcon: currentInfo.icon,
      weatherDesc: currentInfo.desc,
      sunrise: formatTime(dailyData.sunrise[0]),
      sunset: formatTime(dailyData.sunset[0]),
      forecast: forecastDays,
    };
  }
};
