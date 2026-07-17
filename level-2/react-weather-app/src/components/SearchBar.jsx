import React, { useState } from 'react';

/**
 * SearchBar Component
 * Renders the city search input field and calls the onSearch handler on submit.
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Event handler when a city is searched
 */
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-bar-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <i className="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
          <input
            type="search"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for cities (e.g., London, New York)..."
            aria-label="Search for cities"
            required
          />
        </div>
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
