import React from 'react';
import {
  WiDaySunny, WiNightClear,
  WiDayCloudy, WiNightAltCloudy,
  WiCloudy,
  WiDayRain, WiNightAltRain,
  WiDayShowers, WiNightAltShowers,
  WiDayThunderstorm, WiNightAltThunderstorm,
  WiDaySnow, WiNightAltSnow,
  WiDayFog, WiNightFog
} from 'react-icons/wi';

export default function TodayForecast({ forecast }) {
  if (!forecast || !forecast.list) return null;
  
  const today = forecast.list.slice(0, 3);

  const getISTTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWeatherIcon = (condition, iconCode) => {
    const isDay = iconCode?.endsWith('d');
    const size = 56;
    const color = '#ffffff';
    switch(condition.toLowerCase()) {
      case 'clear':
        return isDay ? <WiDaySunny size={size} color={color} /> : <WiNightClear size={size} color={color} />;
      case 'clouds':
        return isDay ? <WiDayCloudy size={size} color={color} /> : <WiNightAltCloudy size={size} color={color} />;
      case 'rain':
        return isDay ? <WiDayRain size={size} color={color} /> : <WiNightAltRain size={size} color={color} />;
      case 'thunderstorm':
        return isDay ? <WiDayThunderstorm size={size} color={color} /> : <WiNightAltThunderstorm size={size} color={color} />;
      case 'snow':
        return isDay ? <WiDaySnow size={size} color={color} /> : <WiNightAltSnow size={size} color={color} />;
      case 'mist':
      case 'fog':
      case 'haze':
        return isDay ? <WiDayFog size={size} color={color} /> : <WiNightFog size={size} color={color} />;
      default:
        return isDay ? <WiDaySunny size={size} color={color} /> : <WiNightClear size={size} color={color} />;
    }
  };

  return (
    <div className="w-full bg-blue-800/30 backdrop-blur-md rounded-xl p-6 shadow-lg shadow-blue-900/50 border border-blue-800/30">
      <h2 className="text-xl font-semibold mb-4">Today's Forecast</h2>
      <div className="grid grid-cols-3 gap-4">
        {today.map(item => (
          <div 
            key={item.dt} 
            className="flex flex-col items-center bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
          >
            <span className="text-xs text-blue-200 mb-2 font-medium">
              {getISTTime(item.dt)} IST
            </span>
            <div className="mb-2">
              {getWeatherIcon(item.weather[0].main, item.weather[0].icon)}
            </div>
            <div className="text-2xl text-white font-bold">
              {Math.round(item.main.temp)}°
            </div>
            <div className="text-xs text-blue-100 mt-1 capitalize">
              {item.weather[0].description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}