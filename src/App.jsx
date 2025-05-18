import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WeatherPage from "./pages/WeatherPage";
import Cities from './pages/Cities';
import Sidebar from "./Components/Sidebar";
import MapPage from './pages/MapPage';
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import SettingsPage from "./pages/SettingsPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import About from "./pages/About";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/" />;
};

function AppLayout({ activePage, setActivePage }) {
  return (
    <div className="flex min-h-screen bg-[#101820]">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function AppContent() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState(() => {
  const savedCity = localStorage.getItem('selectedCity');
    return savedCity ? savedCity.replace(/"/g, '') : 'Delhi';
  });;
  const [activePage, setActivePage] = useState("Weather");
  const [savedCities, setSavedCities] = useState([]);
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const cities = JSON.parse(localStorage.getItem('savedCities')) || [];
    setSavedCities(cities);
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedCity', city);
  }, [city]);

  useEffect(() => {
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
  }, [savedCities]);

  const addToSavedCities = (cityData) => {
    // Prevent duplicates
    if (savedCities.some(city => city.name === cityData.name)) {
      return;
    }

    const handleSearch = (cityName) => {
      setCity(cityName);
      fetchWeatherData(cityName);
    };
    const updatedCities = savedCities.length >= 5
      ? [...savedCities.slice(1), cityData]
      : [...savedCities, cityData];

    setSavedCities(updatedCities);
    setSelectedCityIndex(updatedCities.length - 1);
  };

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      // Remove any quotes from the city name
      const cleanCityName = cityName.replace(/"/g, '');

      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanCityName)}&units=metric&appid=${API_KEY}`
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
    setCity(cityName);
    fetchWeatherData(cityName);
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, []);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout activePage={activePage} setActivePage={setActivePage} />}>
          <Route path="/weather" element={
            <WeatherPage
              weatherData={weatherData}
              forecast={forecast}
              loading={loading}
              error={error}
              onSearch={handleSearch}
            />
          } />
          <Route path="/cities" element={
            <Cities
              savedCities={savedCities}
              selectedIndex={selectedCityIndex}
              onSelectCity={setSelectedCityIndex}
              onAddCity={addToSavedCities}
            />
          } />
          <Route path="/map" element={<MapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
