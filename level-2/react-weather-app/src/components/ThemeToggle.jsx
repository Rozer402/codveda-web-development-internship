import React, { useState, useEffect } from 'react';

/**
 * ThemeToggle Component
 * Self-contained toggle component syncing with localStorage and DOM documentElement.
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('weather_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('weather_theme', theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={handleToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} aria-hidden="true"></i>
    </button>
  );
};

export default ThemeToggle;
