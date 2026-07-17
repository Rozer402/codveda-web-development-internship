import React from 'react';
import ThemeToggle from './ThemeToggle';

/**
 * Header Component
 * Renders the brand logo and the theme toggle control.
 */
const Header = () => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <i className="fa-solid fa-cloud-sun-rain brand-icon"></i>
        <h1 className="brand-name">WeatherNow</h1>
      </div>
      <div className="header-actions">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
