import React from 'react';

/**
 * Footer Component
 * Renders copyright and application meta details.
 */
const Footer = () => {
  return (
    <footer className="app-footer">
      <p className="footer-copyright">&copy; {new Date().getFullYear()} WeatherNow. All rights reserved.</p>
      <p className="footer-built-with">
        Built with React and OpenWeatherMap API
      </p>
    </footer>
  );
};

export default Footer;
