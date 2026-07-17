import React, { useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useWeather } from '../hooks/useWeather';

/**
 * Home Page (Weather Dashboard View)
 * Coordinates inputs, API state triggers, and card rendering lists.
 */
const Home = () => {
  const { loading, error, weatherData, fetchWeather } = useWeather();

  // Load a default city on mount so the dashboard starts populated
  useEffect(() => {
    fetchWeather('London');
  }, [fetchWeather]);

  return (
    <div className="home-page-layout">
      <Header />
      
      <main className="dashboard-content">
        <section className="search-section">
          <h2 className="search-title">Search Weather Conditions</h2>
          <SearchBar onSearch={fetchWeather} />
        </section>

        {loading && (
          <section className="loading-section">
            <LoadingSpinner />
          </section>
        )}

        {error && !loading && (
          <section className="error-section">
            <ErrorMessage message={error} />
          </section>
        )}

        {weatherData && !loading && (
          <div className="weather-grid">
            <section className="current-weather-view">
              <WeatherCard data={weatherData} />
            </section>

            <section className="forecast-view">
              <h3 className="forecast-title">5-Day Forecast</h3>
              <div className="forecast-cards-container">
                {weatherData.forecast && weatherData.forecast.map((day, idx) => (
                  <ForecastCard key={idx} dayData={day} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
