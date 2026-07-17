import React from 'react';

/**
 * WeatherCard Component
 * Displays current weather details for the searched city.
 * @param {Object} props - Component props
 * @param {Object} props.data - Current weather data
 */
const WeatherCard = ({ data }) => {
  if (!data) return null;

  const {
    city,
    country,
    temp,
    feelsLike,
    humidity,
    windSpeed,
    weatherIcon,
    weatherDesc,
    sunrise,
    sunset,
  } = data;

  const currentDate = new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="weather-card">
      <div className="weather-card-header">
        <div className="location-info">
          <h2 className="city-name">
            {city}
            {country && <span className="country-badge">, {country}</span>}
          </h2>
          <span className="weather-date">{currentDate}</span>
        </div>
        <div className="weather-badge">{weatherDesc}</div>
      </div>

      <div className="weather-card-body">
        <div className="weather-main-info">
          <i className={`fa-solid ${weatherIcon} weather-icon`} aria-hidden="true"></i>
          <span className="temperature">{temp}°C</span>
        </div>
      </div>

      <div className="weather-card-details">
        <div className="details-grid">
          <div className="detail-stat">
            <i className="fa-solid fa-temperature-half detail-icon" aria-hidden="true"></i>
            <div className="stat-info">
              <span className="stat-label">Feels Like</span>
              <span className="stat-value">{feelsLike}°C</span>
            </div>
          </div>
          <div className="detail-stat">
            <i className="fa-solid fa-droplet detail-icon" aria-hidden="true"></i>
            <div className="stat-info">
              <span className="stat-label">Humidity</span>
              <span className="stat-value">{humidity}%</span>
            </div>
          </div>
          <div className="detail-stat">
            <i className="fa-solid fa-wind detail-icon" aria-hidden="true"></i>
            <div className="stat-info">
              <span className="stat-label">Wind Speed</span>
              <span className="stat-value">{windSpeed} km/h</span>
            </div>
          </div>
          <div className="detail-stat">
            <i className="fa-solid fa-sun-rising detail-icon fa-sun" aria-hidden="true"></i>
            <div className="stat-info">
              <span className="stat-label">Sunrise</span>
              <span className="stat-value">{sunrise}</span>
            </div>
          </div>
          <div className="detail-stat">
            <i className="fa-solid fa-moon-set detail-icon fa-moon" aria-hidden="true"></i>
            <div className="stat-info">
              <span className="stat-label">Sunset</span>
              <span className="stat-value">{sunset}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default WeatherCard;
