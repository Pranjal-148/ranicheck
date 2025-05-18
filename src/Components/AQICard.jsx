import React, { useEffect, useState } from "react";
import { BsWind } from "react-icons/bs";

const WAQI_API_TOKEN = import.meta.env.VITE_WAQI_API_TOKEN;

const AQI_LEVELS = [
  { max: 50, label: "Good", color: "text-green-400", bgColor: "bg-green-400/20" },
  { max: 100, label: "Moderate", color: "text-yellow-300", bgColor: "bg-yellow-300/20" },
  { max: 150, label: "Unhealthy for Sensitive Groups", color: "text-orange-400", bgColor: "bg-orange-400/20" },
  { max: 200, label: "Unhealthy", color: "text-red-400", bgColor: "bg-red-400/20" },
  { max: 300, label: "Very Unhealthy", color: "text-purple-400", bgColor: "bg-purple-400/20" },
  { max: 500, label: "Hazardous", color: "text-rose-500", bgColor: "bg-rose-500/20" },
];

function getAqiLevel(aqi) {
  return AQI_LEVELS.find((level) => aqi <= level.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

export default function AQICard({ city, lat, lon }) {
  const [aqi, setAqi] = useState(null);
  const [pollutants, setPollutants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city && (lat == null || lon == null)) return;
    setLoading(true);
    setError(null);

    const url =
      lat != null && lon != null
        ? `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_API_TOKEN}`
        : `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${WAQI_API_TOKEN}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setAqi(data.data.aqi);
          setPollutants(data.data.iaqi || {});
        } else {
          setError("AQI data not available for this city.");
        }
      })
      .catch(() => setError("Failed to fetch AQI data."))
      .finally(() => setLoading(false));
  }, [city, lat, lon]);

  if (loading) {
    return (
      <div className="w-full bg-blue-800/30 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-blue-900/50 border border-blue-800/30 flex items-center justify-center min-h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-blue-800/30 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-blue-900/50 border border-blue-800/30 flex items-center justify-center min-h-60">
        <span className="text-red-400">{error}</span>
      </div>
    );
  }

  const level = getAqiLevel(aqi);
  
  const displayPollutants = [
    { key: "pm25", label: "Pm25" },
    { key: "pm10", label: "Pm10" },
    { key: "o3", label: "O3" },
    { key: "no2", label: "No2" }
  ];

  return (
    <div className="w-full bg-blue-800/30 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-blue-900/50 border border-blue-800/30">
      <h2 className="text-xl font-semibold mb-4">Air Quality Index</h2>
      <div className={`flex flex-col items-center bg-white/5 rounded-lg p-4 ${level.bgColor}`}>
        <div className="flex items-center gap-2 mb-2">
          <BsWind className="text-xl text-blue-200" />
          <span className={`text-lg font-semibold ${level.color}`}>{level.label}</span>
        </div>
        
        <div className={`text-5xl font-bold mb-4 ${level.color}`}>{aqi}</div>
        
        <div className="w-full grid grid-cols-2 gap-2">
          {displayPollutants.map(item => (
            pollutants[item.key] && (
              <React.Fragment key={item.key}>
                <span className="text-xs text-blue-200">{item.label}</span>
                <span className="text-xs text-white font-mono text-right">{pollutants[item.key].v}</span>
              </React.Fragment>
            )
          ))}
        </div>
      </div>
    </div>
  );
}