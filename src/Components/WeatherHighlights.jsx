import {
  WiDaySunny,
  WiStrongWind,
  WiHumidity,
  WiFog,
  WiThermometer,
  WiRain,
  WiBarometer,
  WiSunset,
} from "react-icons/wi";
import { FiArrowUp } from "react-icons/fi";

export default function WeatherHighlights({ weather }) {
  if (!weather) return null;

  const feelsLike = Math.round(weather.main.feels_like);
  const wind = weather.wind.speed;
  const humidity = weather.main.humidity;
  const visibility = (weather.visibility / 1000).toFixed(0); // km
  const pressure = weather.main.pressure;
  const sunset = weather.sys.sunset
    ? new Date(weather.sys.sunset * 1000).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";
  const chanceOfRain = weather.rain ? Math.round((weather.rain["1h"] || 0) * 100) : 0;
  const uvIndex =
    weather.clouds?.all > 80
      ? 1
      : weather.clouds?.all > 60
      ? 2
      : weather.clouds?.all > 30
      ? 3
      : 4;

  // New calculations
  const windDirection = weather.wind.deg || 0;
  const uvIntensity = [
    { level: "Low", color: "from-green-400 to-green-600" },
    { level: "Moderate", color: "from-yellow-400 to-yellow-600" },
    { level: "High", color: "from-orange-400 to-orange-600" },
    { level: "Very High", color: "from-red-400 to-red-600" },
  ][uvIndex - 1];

  const icons = {
    feelsLike: <WiThermometer size={24} className="text-orange-400" />,
    wind: <WiStrongWind size={24} className="text-blue-400" />,
    humidity: <WiHumidity size={24} className="text-blue-300" />,
    visibility: <WiFog size={24} className="text-gray-300" />,
    pressure: <WiBarometer size={24} className="text-purple-400" />,
    sunset: <WiSunset size={24} className="text-amber-400" />,
    rain: <WiRain size={24} className="text-blue-500" />,
    uv: <WiDaySunny size={24} className="text-yellow-400" />,
  };

  const CardWrapper = ({ children, title, icon }) => (
    <div className="bg-blue-800/30 backdrop-blur-md rounded-xl p-4 shadow-md shadow-blue-900/50 border border-blue-800/30 hover:shadow-lg hover:scale-[1.02] transition-all group relative overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-300">{title}</span>
        <div className="bg-blue-700/30 rounded-full p-1 hover:rotate-12 transition-transform">
          {icon}
        </div>
      </div>
      {children}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Feels Like */}
      <CardWrapper title="Feels Like" icon={icons.feelsLike}>
        <div className="text-2xl font-bold mb-1">{feelsLike}°C</div>
        <div className="h-1 bg-blue-900/30 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((feelsLike/50)*100, 100)}%` }}
          ></div>
        </div>
      </CardWrapper>

      {/* Wind */}
      <CardWrapper title="Wind" icon={icons.wind}>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl font-bold">{wind} km/h</div>
          <div className="relative">
            <FiArrowUp 
              size={20} 
              className="text-blue-400 transition-transform"
              style={{ transform: `rotate(${windDirection}deg)` }}
            />
          </div>
        </div>
        <div className="text-xs text-blue-300/80">
          Direction: {["N","NE","E","SE","S","SW","W","NW"][Math.round(windDirection/45) % 8]}
        </div>
      </CardWrapper>

      {/* Humidity */}
      <CardWrapper title="Humidity" icon={icons.humidity}>
        <div className="text-2xl font-bold mb-1">{humidity}%</div>
        <div className="h-1 bg-blue-900/30 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-300 to-blue-500 rounded-full" 
            style={{ width: `${humidity}%` }}
          ></div>
        </div>
      </CardWrapper>

      {/* Visibility */}
      <CardWrapper title="Visibility" icon={icons.visibility}>
        <div className="text-2xl font-bold mb-1">{visibility} km</div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="h-1 flex-1 bg-blue-900/30 rounded-full"
            >
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((visibility/10)*100, 100)}%` }}
              ></div>
            </div>
          ))}
        </div>
      </CardWrapper>

      {/* Pressure */}
      <CardWrapper title="Pressure" icon={icons.pressure}>
        <div className="text-2xl font-bold">{pressure} hPa</div>
        <div className="mt-2 flex gap-2 text-xs text-blue-300/80">
          <span className="bg-blue-900/30 px-2 py-1 rounded-full">
            {pressure >= 1013 ? 'High' : 'Low'}
          </span>
        </div>
      </CardWrapper>

      {/* Sunset */}
      <CardWrapper title="Sunset" icon={icons.sunset}>
        <div className="text-2xl font-bold mb-1">{sunset}</div>
        <div className="h-1 bg-blue-900/30 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-purple-500 rounded-full" 
            style={{ width: `${(new Date().getHours()/24)*100}%` }}
          ></div>
        </div>
      </CardWrapper>

      {/* Chance of Rain */}
      <CardWrapper title="Chance of Rain" icon={icons.rain}>
        <div className="text-2xl font-bold mb-1">{chanceOfRain}%</div>
        <div className="h-1 bg-blue-900/30 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-400 rounded-full" 
            style={{ width: `${chanceOfRain}%` }}
          ></div>
        </div>
      </CardWrapper>

      {/* UV Index */}
      <CardWrapper title="UV Index" icon={icons.uv}>
        <div className="text-2xl font-bold mb-1">{uvIndex}</div>
        <div className="h-1 bg-blue-900/30 rounded-full">
          <div 
            className={`h-full bg-gradient-to-r ${uvIntensity.color} rounded-full`}
            style={{ width: `${(uvIndex/4)*100}%` }}
          ></div>
        </div>
        <div className="text-xs mt-1 text-blue-300/80">{uvIntensity.level}</div>
      </CardWrapper>
    </div>
  );
}