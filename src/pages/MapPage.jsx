import React, { useState, useEffect, useRef } from "react";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiHumidity,
  WiStrongWind,
  WiTime4,
  WiSnow,
  WiThunderstorm,
  WiDayHaze,
} from "react-icons/wi";
import { FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";
import Overlay from "ol/Overlay";
import { useAuth } from "../context/AuthContext";
import XYZ from "ol/source/XYZ";


const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const parseCoordinate = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

export default function MapPage() {
  const { user } = useAuth();
  const localStorageKey = `mapCities_${user?.uid || "guest"}`;
  const sessionStorageKey = `mapSession_${user?.uid || "guest"}`;


  const getSavedCities = () => {
    try {
      const sessionData = sessionStorage.getItem(sessionStorageKey);
      if (sessionData) {
        return JSON.parse(sessionData).map((city) => ({
          ...city,
          lat: parseCoordinate(city.lat),
          lng: parseCoordinate(city.lng),
        }));
      }

      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        return JSON.parse(saved).map((city) => ({
          ...city,
          lat: parseCoordinate(city.lat),
          lng: parseCoordinate(city.lng),
        }));
      }
    } catch (e) {
      console.error("Failed to parse saved cities from storage", e);
    }
    return [];
  };


  const [cities, setCities] = useState(getSavedCities);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [mapCenter, setMapCenter] = useState(() => {
    const saved = getSavedCities();
    if (saved.length > 0) {
      const lastCity = saved[saved.length - 1];
      return { lat: lastCity.lat, lng: lastCity.lng };
    }
    return { lat: 40.416, lng: -3.703 };
  });
  const [zoom, setZoom] = useState(6);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const overlayRef = useRef(null);
  const singleClickHandlerRef = useRef(null);

  useEffect(() => {
    if (cities.length > 0) {
      const lastCity = cities[cities.length - 1];
      setMapCenter({ lat: lastCity.lat, lng: lastCity.lng });
      setZoom(10);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setZoom(10);
        },
        () => toast.error("Location access denied - using default map")
      );
    }
  }, []);

  useEffect(() => {
    const validatedCities = cities.map((city) => ({
      ...city,
      lat: parseCoordinate(city.lat),
      lng: parseCoordinate(city.lng),
    }));

    sessionStorage.setItem(sessionStorageKey, JSON.stringify(validatedCities));

    localStorage.setItem(localStorageKey, JSON.stringify(validatedCities));
  }, [cities, sessionStorageKey, localStorageKey]);

  useEffect(() => {
    if (mapRef.current) return;

    const tileLayer = new TileLayer({
      source: new XYZ({
        url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors, © CartoDB',
      }),
    });
    const vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const view = new View({
      center: fromLonLat([mapCenter.lng, mapCenter.lat]),
      zoom: zoom,
    });

    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: { duration: 250 },
    });
    overlayRef.current = overlay;

    const map = new Map({
      target: "ol-map",
      layers: [tileLayer, vectorLayer],
      view: view,
      overlays: [overlay],
    });
    mapRef.current = map;

    map.on("moveend", () => {
      const center = toLonLat(view.getCenter());
      setMapCenter({ lat: center[1], lng: center[0] });
      setZoom(view.getZoom());
    });

    setMapLoaded(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const vectorLayer = map.getLayers().getArray().find((l) => l instanceof VectorLayer);
    const vectorSource = vectorLayer.getSource();
    vectorSource.clear();

    cities.forEach((city) => {
      const marker = new Feature({
        geometry: new Point(fromLonLat([city.lng, city.lat])),
        city: city,
      });
      marker.setStyle(
        new Style({
          image: new Icon({
            src: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
            scale: 0.05,
          }),
        })
      );
      vectorSource.addFeature(marker);
    });

    const singleClickHandler = (evt) => {
      let found = false;
      map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        const city = feature.get("city");
        setSelectedCity(city);
        overlayRef.current.setPosition(evt.coordinate);
        found = true;
      });
      if (!found) {
        setSelectedCity(null);
        overlayRef.current.setPosition(undefined);
      }
    };

    if (singleClickHandlerRef.current) {
      map.un("singleclick", singleClickHandlerRef.current);
    }
    map.on("singleclick", singleClickHandler);
    singleClickHandlerRef.current = singleClickHandler;

    return () => {
      if (singleClickHandlerRef.current) {
        map.un("singleclick", singleClickHandlerRef.current);
        singleClickHandlerRef.current = null;
      }
    };
  }, [cities]);

  useEffect(() => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.setCenter(fromLonLat([mapCenter.lng, mapCenter.lat]));
    view.setZoom(zoom);
  }, [mapCenter, zoom]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim() || loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${search}&units=metric&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error("City not found");
      const data = await response.json();
      const newCity = {
        name: data.name,
        lat: parseCoordinate(data.coord.lat),
        lng: parseCoordinate(data.coord.lon),
        temp: Math.round(data.main.temp),
        weather: data.weather[0].main,
        humidity: data.main.humidity,
        wind: data.wind.speed,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        icon: data.weather[0].icon,
      };
      setCities((prev) => {
        const exists = prev.some((city) => city.name === newCity.name);
        return exists ? prev : [...prev, newCity];
      });
      setMapCenter({
        lat: newCity.lat,
        lng: newCity.lng,
      });
      setZoom(10);
      setSearch("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weather, size = 32) => {
    const iconProps = { size, className: "text-white" };
    switch (weather?.toLowerCase()) {
      case "rain":
      case "drizzle":
        return <WiRain {...iconProps} className="text-blue-400" />;
      case "clouds":
        return <WiCloudy {...iconProps} className="text-gray-400" />;
      case "snow":
        return <WiSnow {...iconProps} className="text-blue-200" />;
      case "thunderstorm":
        return <WiThunderstorm {...iconProps} className="text-purple-400" />;
      case "mist":
      case "fog":
      case "haze":
      case "dust":
        return <WiDayHaze {...iconProps} className="text-gray-300" />;
      case "clear":
      default:
        return <WiDaySunny {...iconProps} className="text-yellow-400" />;
    }
  };

  const removeCity = (cityName) => {
    setCities((prev) => prev.filter((city) => city.name !== cityName));
    if (selectedCity?.name === cityName) {
      setSelectedCity(null);
      if (overlayRef.current) overlayRef.current.setPosition(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 text-white p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Weather Map</h1>
        <p className="text-blue-300">Explore weather conditions around the world</p>
      </div>

      {/* Search and City List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Search Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a city..."
                className="w-full bg-blue-800/30 backdrop-blur-md text-white rounded-full py-3 px-5 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300"
                aria-label="Search"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-300 rounded-full border-t-transparent"></div>
                ) : (
                  <FiSearch size={20} />
                )}
              </button>
            </div>
          </form>

          {/* Saved Cities List */}
          <div className="bg-blue-800/30 backdrop-blur-md rounded-xl overflow-hidden">
            <div className="p-4 border-b border-blue-700/50">
              <h2 className="font-semibold">Saved Locations</h2>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {cities.length === 0 ? (
                <div className="text-center p-4 text-gray-400">
                  <p>No saved locations</p>
                  <p className="text-sm">Search for a city to add it to the map</p>
                </div>
              ) : (
                cities.map((city) => (
                  <div
                    key={city.name}
                    className="p-3 hover:bg-blue-700/50 rounded-lg mb-1 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedCity(city);
                      setMapCenter({ lat: city.lat, lng: city.lng });
                      setZoom(10);
                      if (overlayRef.current && mapRef.current) {
                        const coord = fromLonLat([city.lng, city.lat]);
                        overlayRef.current.setPosition(coord);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {getWeatherIcon(city.weather, 24)}
                        <span className="ml-2 font-medium">{city.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">{city.temp}°C</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCity(city.name);
                          }}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          aria-label={`Remove ${city.name}`}
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-2 bg-blue-800/30 backdrop-blur-md rounded-xl overflow-hidden h-[500px] md:h-[600px] relative">
          <div
            id="ol-map"
            className="w-full h-full"
            style={{ height: "100%", width: "100%" }}
          />
          {/* Popup overlay */}
          <div
            ref={popupRef}
            className="ol-popup"
            style={{
              position: "absolute",
              background: "rgba(30,41,59,0.95)",
              color: "#fff",
              borderRadius: 12,
              padding: 16,
              minWidth: 200,
              pointerEvents: "auto",
              display: selectedCity ? "block" : "none",
              zIndex: 1000,
            }}
          >
            {selectedCity && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{selectedCity.name}</h3>
                  {getWeatherIcon(selectedCity.weather)}
                </div>
                <div className="text-2xl font-bold mb-2">{selectedCity.temp}°C</div>
                <div className="text-sm capitalize mb-3">{selectedCity.weather}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <WiHumidity size={20} className="mr-1 text-blue-300" />
                    <span>{selectedCity.humidity}%</span>
                  </div>
                  <div className="flex items-center">
                    <WiStrongWind size={20} className="mr-1 text-blue-300" />
                    <span>{selectedCity.wind} km/h</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <WiTime4 size={20} className="mr-1 text-blue-300" />
                    <span>Updated: {selectedCity.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCity(null);
                    if (overlayRef.current) overlayRef.current.setPosition(undefined);
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          {!mapLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <p className="text-white text-lg">Loading map...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
