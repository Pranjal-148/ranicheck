import React, { useEffect, useState, useRef } from "react";
import {
  WiDaySunny, WiNightClear,
  WiDayCloudy, WiNightAltCloudy,
  WiCloudy,
  WiDayRain, WiNightAltRain,
  WiDayShowers, WiNightAltShowers,
  WiDayThunderstorm, WiNightAltThunderstorm,
  WiDaySnow, WiNightAltSnow,
  WiDayFog, WiNightFog
} from "react-icons/wi";

const preloadVideos = [
  "Day-Clear.mp4",
  "Night-Clear.mp4",
  "Cloudy-day.mp4",
  "Cloudy-night.mp4",
  "Rain-day.mp4",
  "Rain-night.mp4",
  "Thunderstorm-day.mp4",
  "Thunderstorm-night.mp4",
  "Snow-day.mp4",
  "Snow-night.mp4",
  "Haze-day.mp4",
  "Haze-night.mp4",
  "Partly-cloudy-day.mp4"
];

export default function WeatherMainCard({ weather }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [videoError, setVideoError] = useState(false);
  const [localTime, setLocalTime] = useState(null);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.pathname.endsWith('/') 
        ? window.location.pathname 
        : window.location.pathname + '/';
    }
    return "/";
  };

  useEffect(() => {
    if (!weather || !weather.weather || !weather.weather[0]) {
      setVideoSrc("");
      setLocalTime(null);
      return;
    }

    try {
      const cityLocalTime = getLocalTime(weather.timezone);
      setLocalTime(cityLocalTime);

      const weatherMain = weather.weather[0].main;
      const weatherDesc = weather.weather[0].description;
      const videoFileName = getWeatherTimeVideo(weatherMain, weatherDesc, weather.timezone);

      const baseUrl = getBaseUrl();
      const newVideoSrc = `${baseUrl}videos/${videoFileName}`;
      
      setVideoLoaded(false);
      setVideoError(false);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }

      setVideoSrc(newVideoSrc);
    } catch (error) {
      console.error("Error setting up weather video:", error);
      setVideoError(true);
    }
  }, [weather]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const handleVideoLoad = () => {
      video.play().catch(error => {
        console.log("Video play prevented:", error);
      });
    };

    video.src = videoSrc;
    video.load();
    
    video.addEventListener('loadeddata', handleVideoLoad);
    
    return () => {
      video.removeEventListener('loadeddata', handleVideoLoad);
    };
  }, [videoSrc]);

  useEffect(() => {
    const criticalVideos = ["Day-Clear.mp4", "Night-Clear.mp4"];
    
    criticalVideos.forEach(videoName => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = `${getBaseUrl()}videos/${videoName}`;
      preloadLink.as = 'video';
      document.head.appendChild(preloadLink);
    });
    
    return () => {
      document.querySelectorAll('link[rel="preload"][as="video"]').forEach(link => {
        document.head.removeChild(link);
      });
    };
  }, []);

  const handleVideoError = () => {
    console.error(`Video error for: ${videoSrc}`);
    setVideoError(true);
    
    try {
      setVideoLoaded(true); 
    } catch (err) {
      console.error("Error in video error handler:", err);
    }
  };

  function getLocalTime(timezoneOffset) {
    try {
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const cityTime = new Date(utcTime + timezoneOffset * 1000);

      const hours = cityTime.getHours();
      const isDay = hours >= 6 && hours < 18;

      return {
        time: cityTime,
        formattedTime: cityTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        formattedDate: cityTime.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }),
        isDay
      };
    } catch (error) {
      console.error("Error calculating local time:", error);
      return {
        time: new Date(),
        formattedTime: "12:00 PM",
        formattedDate: "Monday, January 1",
        isDay: true
      };
    }
  }

  function getWeatherTimeVideo(main, description, timezone) {
    try {
      const { isDay } = getLocalTime(timezone);
      const timeSuffix = isDay ? "day" : "night";
      const timePrefix = isDay ? "Day" : "Night";

      const desc = description.toLowerCase();
      const mainLower = main.toLowerCase();

      if (mainLower.includes("clear")) {
        return isDay ? "Day-Clear.mp4" : "Night-Clear.mp4";
      } else if (mainLower.includes("cloud")) {
        if (isDay) {
          if (desc.includes("few") || desc.includes("scattered")) {
            return "Partly-cloudy-day.mp4";
          }
          return "Cloudy-day.mp4";
        } else {
          return "Cloudy-night.mp4";
        }
      } else if (mainLower.includes("rain") || mainLower.includes("drizzle")) {
        return `Rain-${timeSuffix}.mp4`;
      } else if (mainLower.includes("thunderstorm")) {
        return `Thunderstorm-${timeSuffix}.mp4`;
      } else if (mainLower.includes("snow")) {
        return `Snow-${timeSuffix}.mp4`;
      } else if (
        mainLower.includes("mist") ||
        mainLower.includes("fog") ||
        mainLower.includes("haze")
      ) {
        return `Haze-${timeSuffix}.mp4`;
      }

      return isDay ? "Day-Clear.mp4" : "Night-Clear.mp4";
    } catch (error) {
      console.error("Error determining weather video:", error);
      return "Day-Clear.mp4"; 
    }
  }

  function getWeatherIcon(condition, iconCode, size = 70) {
    try {
      const isDay = iconCode ? iconCode.includes('d') : true;
      const cond = condition ? condition.toLowerCase() : "";

      if (cond.includes("clear")) {
        return isDay ? <WiDaySunny size={size} /> : <WiNightClear size={size} />;
      } else if (cond.includes("cloud")) {
        if (cond.includes("few") || cond.includes("scattered")) {
          return isDay ? <WiDayCloudy size={size} /> : <WiNightAltCloudy size={size} />;
        }
        return <WiCloudy size={size} />;
      } else if (cond.includes("rain") || cond.includes("drizzle")) {
        if (cond.includes("light") || cond.includes("moderate")) {
          return isDay ? <WiDayShowers size={size} /> : <WiNightAltShowers size={size} />;
        }
        return isDay ? <WiDayRain size={size} /> : <WiNightAltRain size={size} />;
      } else if (cond.includes("thunderstorm")) {
        return isDay ? <WiDayThunderstorm size={size} /> : <WiNightAltThunderstorm size={size} />;
      } else if (cond.includes("snow")) {
        return isDay ? <WiDaySnow size={size} /> : <WiNightAltSnow size={size} />;
      } else if (cond.includes("mist") || cond.includes("fog") || cond.includes("haze")) {
        return isDay ? <WiDayFog size={size} /> : <WiNightFog size={size} />;
      }

      return isDay ? <WiDaySunny size={size} /> : <WiNightClear size={size} />;
    } catch (error) {
      console.error("Error determining weather icon:", error);
      return <WiDaySunny size={size} />; 
    }
  }

  if (!weather || !weather.weather || !weather.weather[0]) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-800/20 backdrop-blur-md h-full">
      <div className="absolute inset-0 overflow-hidden">
        {videoSrc && !videoError && (
          <video
            ref={videoRef}
            className={`object-cover w-full h-full transition-opacity duration-500 ${videoLoaded ? 'opacity-60' : 'opacity-0'}`}
            muted
            loop
            playsInline
            onCanPlay={() => {
              setVideoLoaded(true);
            }}
            onError={handleVideoError}
          />
        )}
      </div>

      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">{weather.name}, {weather.sys.country}</h2>
          {localTime && (
            <div className="text-sm text-gray-300">
              {localTime.formattedDate} | {localTime.formattedTime}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-6xl font-bold">
            {Math.round(weather.main.temp)}°C
          </div>
          <div className="text-white">
            {getWeatherIcon(weather.weather[0].description, weather.weather[0].icon)}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xl capitalize">{weather.weather[0].description}</div>
          <div className="text-sm text-gray-300">
            Feels like {Math.round(weather.main.feels_like)}°C
          </div>
        </div>

        {/* Enhanced Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4 mt-auto pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Humidity</span>
            <span className="font-medium">{weather.main.humidity}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Wind</span>
            <span className="font-medium">{Math.round(weather.wind.speed)} m/s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Pressure</span>
            <span className="font-medium">{weather.main.pressure} hPa</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Visibility</span>
            <span className="font-medium">{Math.round(weather.visibility / 1000)} km</span>
          </div>
        </div>
      </div>
    </div>
  );
}