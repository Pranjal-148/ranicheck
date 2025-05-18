import React, { useState, useEffect } from "react";
import {
  WiDaySunny, WiNightClear,
  WiDayCloudy, WiNightAltCloudy,
  WiCloudy,
  WiDayRain, WiNightAltRain,
  WiDayThunderstorm, WiNightAltThunderstorm,
  WiDaySnow, WiNightAltSnow,
  WiSunrise, WiSunset
} from "react-icons/wi";
import { FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Cities() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const localStorageKey = `savedCities_${user?.uid || "guest"}`;

  const getSavedCities = () => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse saved cities from localStorage", e);
    }
    return [];
  };

  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [savedCities, setSavedCities] = useState(getSavedCities);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cityWeather, setCityWeather] = useState({});
  const [cityForecast, setCityForecast] = useState({});
  const [loading, setLoading] = useState(true);
  const [serverCities, setServerCities] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      setLoading(true);
      try {
        if (user && token) {
          const response = await fetch(`${API_URL}/api/cities`, {
            headers: { "x-auth-token": token }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.cities?.length > 0) {
              setServerCities(data.cities);

              const formattedCities = data.cities.map(cityName => ({ name: cityName }));
              setSavedCities(formattedCities);
              setSelectedIndex(0);
              localStorage.setItem(localStorageKey, JSON.stringify(formattedCities));

              for (let i = 0; i < formattedCities.length; i++) {
                await fetchWeatherAndUpdateCity(formattedCities[i].name, i);
              }

              setLoading(false);
              setInitialized(true);
              return;
            }
          }
        }

        const saved = getSavedCities();
        setSavedCities(saved);
        if (saved.length > 0) {
          setSelectedIndex(0);
          for (let i = 0; i < saved.length; i++) {
            const cityName = typeof saved[i] === 'string' ? saved[i] : saved[i].name;
            await fetchWeatherAndUpdateCity(cityName, i);
          }
        }
        setInitialized(true);
      } catch (error) {
        console.error("Error loading cities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, [user, token]);

  const fetchWeatherAndUpdateCity = async (cityName, index) => {
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      if (!weatherRes.ok) throw new Error("City not found");
      const weather = await weatherRes.json();

      setSavedCities(prev => {
        const updated = [...prev];
        updated[index] = {
          name: weather.name,
          temp: Math.round(weather.main.temp),
          weather: weather.weather[0].main,
          icon: weather.weather[0].icon,
          timezone: weather.timezone,
          sys: weather.sys
        };
        localStorage.setItem(localStorageKey, JSON.stringify(updated));
        return updated;
      });

      return weather;
    } catch (err) {
      console.error(`Error fetching weather for ${cityName}:`, err);
      return null;
    }
  };

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(savedCities));
  }, [savedCities, localStorageKey]);

  useEffect(() => {
    if (!initialized || !user || !token || !savedCities.length) return;

    const syncCitiesToServer = async () => {
      try {
        for (const city of savedCities) {
          const cityName = typeof city === 'string' ? city : city.name;

          if (serverCities.includes(cityName.toLowerCase())) {
            continue;
          }

          const response = await fetch(`${API_URL}/api/cities`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token
            },
            body: JSON.stringify({ city: cityName })
          });

          if (response.ok) {
            setServerCities(prev => [...prev, cityName.toLowerCase()]);
          } else {
            const errorData = await response.json();
            console.error(`Note: ${errorData.message} for ${cityName}`);
          }
        }
      } catch (error) {
        console.error("Error saving cities to server:", error);
      }
    };

    syncCitiesToServer();
  }, [initialized, savedCities, user, token, serverCities]);

  useEffect(() => {
    if (!savedCities[selectedIndex]) return;
    const cityName = typeof savedCities[selectedIndex] === 'string'
      ? savedCities[selectedIndex]
      : savedCities[selectedIndex].name;
    fetchWeatherAndForecast(cityName);
  }, [selectedIndex, savedCities]);

  const fetchWeatherAndForecast = async (cityName) => {
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      if (!weatherRes.ok) throw new Error("City not found");
      const weather = await weatherRes.json();
      setCityWeather(weather);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      if (!forecastRes.ok) throw new Error("Forecast not found");
      const forecast = await forecastRes.json();
      setCityForecast(forecast);
    } catch (err) {
      setSearchError(err.message);
      setCityWeather({});
      setCityForecast({});
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError("");
    if (!search.trim()) return;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${search}&units=metric&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();

      const cityExists = savedCities.some(city => {
        if (typeof city === 'string') return city.toLowerCase() === data.name.toLowerCase();
        return city?.name?.toLowerCase() === data.name.toLowerCase();
      });

      if (cityExists) {
        setSearchError("City already saved.");
        return;
      }

      if (savedCities.length >= 10) {
        setSearchError("You can only save up to 10 cities.");
        return;
      }

      const newCity = {
        name: data.name,
        temp: Math.round(data.main.temp),
        weather: data.weather[0].main,
        icon: data.weather[0].icon,
        timezone: data.timezone,
        sys: data.sys
      };

      setSavedCities([...savedCities, newCity]);
      setSelectedIndex(savedCities.length);
      setSearch("");
    } catch (err) {
      setSearchError(err.message);
    }
  };

  const handleRemoveCity = async (idx) => {
    const cityToRemove = savedCities[idx];
    const cityName = typeof cityToRemove === 'string' ? cityToRemove : cityToRemove.name;

    if (user && token) {
      try {
        await fetch(`${API_URL}/api/cities/${encodeURIComponent(cityName)}`, {
          method: "DELETE",
          headers: { "x-auth-token": token }
        });

        setServerCities(prev => prev.filter(city => city !== cityName.toLowerCase()));
      } catch (error) {
        console.error("Error removing city from server:", error);
      }
    }

    const updated = savedCities.filter((_, i) => i !== idx);
    setSavedCities(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(updated.length - 1 >= 0 ? updated.length - 1 : 0);
    }
  };

  const handleCityClick = (idx) => setSelectedIndex(idx);

  const getCityPeriod = (nowUTC, sunrise, sunset) => {
    if (!sunrise || !sunset) return "day";
    if (nowUTC >= sunrise - 1800 && nowUTC < sunrise + 1800) return "sunrise";
    if (nowUTC >= sunset - 1800 && nowUTC < sunset + 1800) return "sunset";
    if (nowUTC >= sunrise + 1800 && nowUTC < sunset - 1800) return "day";
    return "night";
  };

  const getWeatherIcon = (condition, period, size = 48) => {
    const c = condition ? condition.toLowerCase() : "";

    if (period === "sunrise") return <WiSunrise size={size} className="text-orange-400" />;
    if (period === "sunset") return <WiSunset size={size} className="text-amber-500" />;

    if (c.includes("clear")) {
      return period === "day"
        ? <WiDaySunny size={size} className="text-yellow-400" />
        : <WiNightClear size={size} className="text-blue-200" />;
    } else if (c.includes("cloud")) {
      if (c.includes("few") || c.includes("scattered")) {
        return period === "day"
          ? <WiDayCloudy size={size} className="text-gray-400" />
          : <WiNightAltCloudy size={size} className="text-gray-500" />;
      }
      return <WiCloudy size={size} className="text-gray-500" />;
    } else if (c.includes("rain") || c.includes("drizzle")) {
      return period === "day"
        ? <WiDayRain size={size} className="text-blue-400" />
        : <WiNightAltRain size={size} className="text-blue-300" />;
    } else if (c.includes("thunderstorm")) {
      return period === "day"
        ? <WiDayThunderstorm size={size} className="text-purple-400" />
        : <WiNightAltThunderstorm size={size} className="text-purple-300" />;
    } else if (c.includes("snow")) {
      return period === "day"
        ? <WiDaySnow size={size} className="text-blue-100" />
        : <WiNightAltSnow size={size} className="text-blue-100" />;
    }
    return period === "day"
      ? <WiDaySunny size={size} className="text-yellow-400" />
      : <WiNightClear size={size} className="text-blue-200" />;
  };

  const nowUTC = Math.floor(Date.now() / 1000);
  const hourlyForecast = cityForecast.list?.slice(0, 3).map(item => ({
    icon: getWeatherIcon(item.weather[0].main,
      getCityPeriod(nowUTC, cityWeather.sys?.sunrise, cityWeather.sys?.sunset), 36),
    temp: Math.round(item.main.temp),
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  })) || [];

  const dailyForecast = [0, 8, 16].map(offset => {
    const item = cityForecast.list?.[offset];
    return item ? {
      icon: getWeatherIcon(item.weather[0].main,
        getCityPeriod(nowUTC, cityWeather.sys?.sunrise, cityWeather.sys?.sunset), 32),
      desc: item.weather[0].main,
      high: Math.round(item.main.temp_max),
      low: Math.round(item.main.temp_min),
      date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    } : null;
  }).filter(Boolean);

  return (
    <div className="flex flex-1 bg-gradient-to-br from-blue-950 p-4 md:p-8 min-h-screen">
      {/* Left: City List */}
      <div className="w-full md:w-1/3 lg:w-1/4 pr-0 md:pr-6">
        <form onSubmit={handleSearch} className="mb-6 relative group">
          <div className="relative">
            <input
              type="text"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 pl-12 rounded-xl bg-blue-800/30 backdrop-blur-md border border-white/10 text-white placeholder:text-blue-200/60 outline-none focus:border-blue-400 transition-all duration-300 shadow-lg"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300/80" size={20} />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiPlus size={18} className="stroke-[3]" />
            </button>
          </div>
        </form>

        {searchError && (
          <div className="mb-4 p-3 bg-red-900/30 backdrop-blur-md rounded-lg border border-red-400/30 text-red-200 text-sm">
            {searchError}
          </div>
        )}

        {savedCities.length > 0 && (
          <div className="mb-4 text-blue-300/80 text-sm font-medium px-2 flex justify-between">
            <span>Saved Cities</span>
            <span>{savedCities.length}/10</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
            {savedCities.map((city, idx) => {
              const cityName = typeof city === 'string' ? city : city.name;
              const cityTemp = city.temp ?? (cityWeather.name === cityName ? Math.round(cityWeather.main?.temp) : null);
              const period = getCityPeriod(nowUTC, city.sys?.sunrise, city.sys?.sunset);

              return (
                <div
                  key={cityName + idx}
                  onClick={() => handleCityClick(idx)}
                  className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${selectedIndex === idx
                    ? "bg-gradient-to-r from-blue-600/30 to-blue-700/30 border-2 border-blue-400/50 shadow-xl"
                    : "bg-blue-800/20 hover:bg-blue-800/30 border border-white/5 hover:border-white/10 shadow-md hover:shadow-lg"
                    }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="shrink-0">
                      {getWeatherIcon(city.weather, period, 44)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-white truncate">
                        {cityName}
                      </div>
                      <div className="text-sm text-blue-200/80 capitalize">
                        {city.weather?.toLowerCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {cityTemp !== null && (
                      <div className="text-2xl font-bold text-white/90">{cityTemp}°</div>
                    )}
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-600/30 text-red-200/80 hover:text-white transition-all duration-200"
                      onClick={(e) => { e.stopPropagation(); handleRemoveCity(idx); }}
                    >
                      <FiTrash2 size={20} className="stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
            {savedCities.length === 0 && (
              <div className="bg-blue-900/30 backdrop-blur-md rounded-xl p-6 text-center border border-dashed border-white/10">
                <WiDayCloudy className="inline-block text-4xl text-blue-200/80 mb-3" />
                <h2 className="text-lg font-semibold text-white mb-1">No Cities Added</h2>
                <p className="text-sm text-blue-200/60">Search above to add cities</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Weather Details */}
      <div className="hidden md:flex flex-1 bg-blue-900/30 backdrop-blur-md rounded-2xl p-8 flex-col border border-white/10 shadow-2xl ml-6">
        {cityWeather.name ? (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">{cityWeather.name}</h1>
                <div className="text-lg text-blue-200/80 mb-4">
                  {cityWeather.weather?.[0]?.description}
                </div>
                <div className="text-7xl font-extrabold text-white drop-shadow-xl">
                  {Math.round(cityWeather.main?.temp)}°
                </div>
              </div>
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-xl">
                {getWeatherIcon(
                  cityWeather.weather?.[0]?.main,
                  getCityPeriod(nowUTC, cityWeather.sys?.sunrise, cityWeather.sys?.sunset),
                  96
                )}
              </div>
            </div>

            {/*Weather Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-sm text-blue-200/60 mb-1">Feels Like</div>
                <div className="text-2xl font-bold text-white">{Math.round(cityWeather.main?.feels_like)}°</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-sm text-blue-200/60 mb-1">Humidity</div>
                <div className="text-2xl font-bold text-white">{cityWeather.main?.humidity}%</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-sm text-blue-200/60 mb-1">Wind</div>
                <div className="text-2xl font-bold text-white">{Math.round(cityWeather.wind?.speed)} m/s</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-sm text-blue-200/60 mb-1">Pressure</div>
                <div className="text-2xl font-bold text-white">{cityWeather.main?.pressure} hPa</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-sm text-blue-200/60 mb-1">Visibility</div>
                <div className="text-2xl font-bold text-white">
                  {(cityWeather.visibility / 1000).toFixed(1)} km
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-sm text-blue-200/60 mb-1">Cloud Cover</div>
                <div className="text-2xl font-bold text-white">{cityWeather.clouds?.all}%</div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">6-Hour Forecast</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {cityForecast.list?.slice(0, 6).map((item, index) => {
                  const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10">
                      <div className="text-sm text-blue-200/60 mb-2">{time}</div>
                      <div className="flex items-center gap-3">
                        {getWeatherIcon(
                          item.weather[0].main,
                          getCityPeriod(nowUTC, cityWeather.sys?.sunrise, cityWeather.sys?.sunset),
                          36
                        )}
                        <div className="text-2xl font-bold text-white">{Math.round(item.main.temp)}°</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sunrise/Sunset Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Sun & Moon</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                  <WiSunrise className="text-4xl text-orange-400" />
                  <div>
                    <div className="text-sm text-blue-200/60">Sunrise</div>
                    <div className="text-xl font-bold text-white">
                      {new Date(cityWeather.sys?.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                  <WiSunset className="text-4xl text-amber-500" />
                  <div>
                    <div className="text-sm text-blue-200/60">Sunset</div>
                    <div className="text-xl font-bold text-white">
                      {new Date(cityWeather.sys?.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Day Forecast */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">3-Day Forecast</h3>
              <div className="space-y-3">
                {dailyForecast.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <span className="shrink-0">{item.icon}</span>
                      <div>
                        <div className="font-medium text-white">{item.date}</div>
                        <div className="text-sm text-blue-200/60 capitalize">{item.desc}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {item.high}° <span className="text-blue-200/60 font-normal">{item.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <WiDayCloudy className="text-6xl text-blue-200/60 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {savedCities.length === 0 ? "Add a city to get started" : "Select a city"}
            </h3>
            <p className="text-blue-200/60">Detailed weather information will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}