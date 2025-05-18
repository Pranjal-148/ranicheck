import React from "react";
import {
  WiDaySunny, WiNightClear,
  WiCloudy, WiDayCloudy, WiNightAltCloudy,
  WiRain, WiNightAltRain, WiDayRain,
  WiThunderstorm, WiDayThunderstorm, WiNightAltThunderstorm,
  WiSnow, WiDaySnow, WiNightAltSnow,
  WiFog, WiDayFog, WiNightFog
} from "react-icons/wi";

export default function WeekForecast({ forecast }) {
  if (!forecast || !forecast.list || forecast.list.length === 0) return null;

  function getWeatherIcon(condition, iconCode, size = 44) {
    const isDay = iconCode ? iconCode.endsWith('d') : true;
    const cond = condition ? condition.toLowerCase() : "";
    
    if (cond.includes("clear")) {
      return isDay ? 
        <WiDaySunny size={size} className="text-yellow-300" /> : 
        <WiNightClear size={size} className="text-blue-200" />;
    } else if (cond.includes("cloud")) {
      if (cond.includes("few") || cond.includes("scattered")) {
        return isDay ? 
          <WiDayCloudy size={size} className="text-gray-300" /> : 
          <WiNightAltCloudy size={size} className="text-gray-400" />;
      }
      return <WiCloudy size={size} className="text-gray-400" />;
    } else if (cond.includes("rain") || cond.includes("drizzle")) {
      return isDay ? 
        <WiDayRain size={size} className="text-blue-400" /> : 
        <WiNightAltRain size={size} className="text-blue-300" />;
    } else if (cond.includes("thunderstorm")) {
      return isDay ? 
        <WiDayThunderstorm size={size} className="text-purple-400" /> : 
        <WiNightAltThunderstorm size={size} className="text-purple-300" />;
    } else if (cond.includes("snow")) {
      return isDay ? 
        <WiDaySnow size={size} className="text-blue-100" /> : 
        <WiNightAltSnow size={size} className="text-blue-100" />;
    } else if (
      cond.includes("mist") || 
      cond.includes("fog") || 
      cond.includes("haze") || 
      cond.includes("smoke") || 
      cond.includes("dust")
    ) {
      return isDay ? 
        <WiDayFog size={size} className="text-gray-300" /> : 
        <WiNightFog size={size} className="text-gray-400" />;
    }
    
    return isDay ? 
      <WiDaySunny size={size} className="text-yellow-300" /> : 
      <WiNightClear size={size} className="text-blue-200" />;
  }

  const dailyForecasts = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!dailyForecasts[day]) {
      dailyForecasts[day] = {
        date: date,
        day: day,
        temps: [],
        icons: [],
        descriptions: []
      };
    }
    
    dailyForecasts[day].temps.push(item.main.temp);
    dailyForecasts[day].icons.push(item.weather[0].icon);
    dailyForecasts[day].descriptions.push(item.weather[0].description);
  });

  const processedForecasts = Object.values(dailyForecasts).map(day => {
    const minTemp = Math.round(Math.min(...day.temps));
    const maxTemp = Math.round(Math.max(...day.temps));
    
    const counts = {};
    day.descriptions.forEach(desc => {
      counts[desc] = (counts[desc] || 0) + 1;
    });
    const mostFrequentDesc = Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );
    
    // Get corresponding icon (preferably a daytime icon)
    const dayIcons = day.icons.filter(icon => icon.includes('d'));
    const icon = dayIcons.length > 0 ? 
      dayIcons[0] : 
      day.icons[Math.floor(day.icons.length / 2)];
    
    return {
      date: day.date,
      day: day.day,
      minTemp,
      maxTemp,
      description: mostFrequentDesc,
      icon
    };
  });

  processedForecasts.sort((a, b) => a.date - b.date);

  const next7Days = processedForecasts.slice(0, 7);

  return (
    <>
      {next7Days.map((day, index) => (
        <div 
          key={index} 
          className="bg-blue-800/40 backdrop-blur-md rounded-xl p-4 flex flex-col items-center shadow-md shadow-blue-900/50 border border-blue-800/30 hover:shadow-lg hover:scale-[1.05] transition-all"
        >
          <div className="text-sm font-medium mb-2">
            {index === 0 ? 'Today' : day.day}
          </div>
          <div className="my-2 bg-blue-700/30 rounded-full p-1">
            {getWeatherIcon(day.description, day.icon)}
          </div>
          <div className="text-sm capitalize mb-2">{day.description}</div>
          <div className="flex justify-between w-full">
            <span className="font-bold">{day.maxTemp}°</span>
            <span className="text-gray-400">{day.minTemp}°</span>
          </div>
        </div>
      ))}
    </>
  );
}
