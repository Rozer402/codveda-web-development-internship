import React from 'react';

/**
 * Footer Component
 * Standard layout footer for authorship info and status.
 */
export function Footer() {
  return (
    <footer className="app-footer">
      <div className="container footer-container">
        <p>&copy; {new Date().getFullYear()} TaskFlow Pro. All rights reserved.</p>
        <p className="footer-meta">Task Manager CRUD Application</p>
      </div>
    </footer>
  );
}

export default Footer;
