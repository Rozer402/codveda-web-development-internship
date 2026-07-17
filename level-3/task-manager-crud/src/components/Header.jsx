import React from 'react';

/**
 * Header Component
 * Contains the branding navigation bar.
 */
export function Header() {
  return (
    <header className="app-header glass-panel">
      <div className="container header-container">
        <h1 className="gradient-text">TaskFlow Pro</h1>
        <nav className="header-nav">
          <span className="badge">Pro Edition</span>
        </nav>
      </div>
    </header>
  );
}

export default Header;
