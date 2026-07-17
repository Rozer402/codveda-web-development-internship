import React from 'react';

/**
 * LoadingSpinner Component
 * Displays a micro-animated loading indicator while fetching weather data.
 */
const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container" role="status" aria-live="polite">
      <div className="loading-spinner"></div>
      <span className="sr-only">Loading weather data...</span>
    </div>
  );
};

export default LoadingSpinner;
