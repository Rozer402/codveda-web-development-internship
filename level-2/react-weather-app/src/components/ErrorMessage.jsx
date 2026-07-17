import React from 'react';

/**
 * ErrorMessage Component
 * Renders errors like geocoding failures or invalid city name searches.
 * @param {Object} props - Component props
 * @param {string} [props.message] - Customized error details to display
 */
const ErrorMessage = ({ message }) => {
  return (
    <div className="error-message-container" role="alert">
      <i className="fa-solid fa-triangle-exclamation error-icon" aria-hidden="true"></i>
      <div className="error-details">
        <h3 className="error-heading">Search Error</h3>
        <p className="error-description">
          {message || 'Could not retrieve weather details. Please ensure the city name is spelled correctly.'}
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage;
