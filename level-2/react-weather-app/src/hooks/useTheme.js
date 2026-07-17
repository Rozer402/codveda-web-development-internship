import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage light and dark theme mode preferences.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('weather_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('weather_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
};
