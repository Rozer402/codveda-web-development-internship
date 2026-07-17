import React from 'react';

/**
 * ForecastCard Component
 * Displays forecast values for a single day.
 * @param {Object} props - Component props
 * @param {Object} props.dayData - Forecast data for the day
 */
const ForecastCard = ({ dayData }) => {
  if (!dayData) return null;

  const { date, tempMax, tempMin, weatherIcon, weatherDesc } = dayData;

  return (
    <article className="forecast-card" title={weatherDesc}>
      <span className="forecast-day">{date}</span>
      <i className={`fa-solid ${weatherIcon} forecast-icon`} aria-hidden="true"></i>
      <span className="forecast-desc-label">{weatherDesc}</span>
      <div className="forecast-temp-range">
        <span className="temp-max">{tempMax}°C</span>
        <span className="temp-min">{tempMin}°C</span>
      </div>
    </article>
  );
};

export default ForecastCard;
