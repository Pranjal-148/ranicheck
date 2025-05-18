import React, { useEffect, useState } from "react";
import SearchBar from "../Components/SearchBar";
import WeatherMainCard from "../Components/WeatherMainCard";
import WeatherHighlights from "../Components/WeatherHighlights";
import TodayForecast from "../Components/TodayForecast";
import WeekForecast from "../Components/WeekForecast";
import { useAuth } from "../context/AuthContext";
import AQICard from '../Components/AQICard'

const REVERSE_GEOCODE_API_KEY = import.meta.env.VITE_REVERSE_GEOCODE_API_KEY;
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function WeatherPage({ weatherData: initialWeatherData, forecast: initialForecast, onSearch }) {
  const [active, setActive] = useState("Weather");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [weatherData, setWeatherData] = useState(initialWeatherData);
  const [forecast, setForecast] = useState(initialForecast);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loading: authLoading } = useAuth();

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      if (!weatherRes.ok) throw new Error("City not found");
      const weather = await weatherRes.json();
      setWeatherData(weather);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      if (!forecastRes.ok) throw new Error("Forecast data not available");
      const forecastData = await forecastRes.json();
      setForecast(forecastData);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (cityName) => {
    fetchWeatherData(cityName);
    if (onSearch) onSearch(cityName);
  };

  useEffect(() => {
    if (initialWeatherData) {
      setWeatherData(initialWeatherData);
    }
    if (initialForecast) {
      setForecast(initialForecast);
    }
  }, [initialWeatherData, initialForecast]);

  useEffect(() => {
    if (!weatherData) {
      setLoadingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${REVERSE_GEOCODE_API_KEY}`;
            try {
              const res = await fetch(url);
              const data = await res.json();
              if (data && data[0] && data[0].name) {
                handleSearch(data[0].name);
              }
            } catch (e) {
              setLoadingLocation(false);
            }
          },
          (error) => {
            setLoadingLocation(false);
          }
        );
      } else {
        setLoadingLocation(false);
      }
    }
  }, [weatherData]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-gray-900 text-white p-4 md:p-6 lg:p-8">
      {/* Search Section */}
      <div className="mb-6 max-w-md mx-auto">
        <SearchBar onSearch={handleSearch} />
      </div>

      {(loadingLocation || loading) && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto mb-6 bg-red-500/20 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Weather Card - Takes full width on mobile, 1/3 on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-blue-900/20 backdrop-blur-md rounded-xl p-4 shadow-lg shadow-blue-900/50 border border-blue-800/30 h-full">
              <WeatherMainCard weather={weatherData} />
            </div>
          </div>

          {/* Right Side Content - Takes full width on mobile, 2/3 on large screens */}
          <div className="lg:col-span-2">
            {/* Weather Highlights */}
            <div className="mb-6 bg-blue-800/20 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-blue-900/50 border border-blue-800/30">
              <h2 className="text-xl font-semibold mb-4">Today's Highlights</h2>
              <WeatherHighlights weather={weatherData} />
            </div>

            {/* Today's Forecast */}
            <div className="mb-6 bg-blue-800/30 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-blue-900/50 border border-blue-800/30">
              <div className="overflow-x-auto">
                <div className="inline-flex space-x-4 pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TodayForecast forecast={forecast} />
                    <AQICard
                      city={weatherData?.name}
                      lat={weatherData?.coord?.lat}
                      lon={weatherData?.coord?.lon}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Forecast */}
            <div className="bg-blue-900/20 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-blue-900/50 border border-blue-800/30">
              <h2 className="text-xl font-semibold mb-4">7-Day Forecast</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <WeekForecast forecast={forecast} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
