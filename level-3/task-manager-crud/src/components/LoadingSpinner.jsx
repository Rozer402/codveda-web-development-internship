import React from 'react';

/**
 * LoadingSpinner Component
 * Simple CSS-based circular loader for async operations.
 */
export function LoadingSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
      <p>Loading tasks...</p>
    </div>
  );
}

export default LoadingSpinner;
