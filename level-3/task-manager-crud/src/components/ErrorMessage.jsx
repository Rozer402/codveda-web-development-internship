import React from 'react';

/**
 * ErrorMessage Component
 * Inline banner error component to display service exceptions.
 */
export function ErrorMessage({ message }) {
  return (
    <div className="error-message glass-panel">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4>Error Occurred</h4>
        <p>{message || 'An unexpected error occurred. Please try again.'}</p>
      </div>
    </div>
  );
}

export default ErrorMessage;
