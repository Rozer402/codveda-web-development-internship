import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Header Component
 * Contains the branding navigation bar.
 */
export function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="app-header glass-panel">
      <div className="container header-container">
        <h1 className="gradient-text">TaskFlow Pro</h1>
        <nav className="header-nav">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Welcome, {user.name}</span>
              <button onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>Logout</button>
            </div>
          ) : (
            <span className="badge">Pro Edition</span>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
