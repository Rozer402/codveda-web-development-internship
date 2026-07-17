import React from 'react';
import Home from './pages/Home';
import './styles/main.css';

/**
 * Root App Component
 * Mounts the main Weather dashboard page.
 */
function App() {
  return (
    <div className="app-container">
      <Home />
    </div>
  );
}

export default App;
