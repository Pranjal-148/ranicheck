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

// Keep the list for reference but we won't use it for preloading
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
  const [videoKey, setVideoKey] = useState(0);
  const [videoSrc, setVideoSrc] = useState("");
  const [videoError, setVideoError] = useState(false);
  const [localTime, setLocalTime] = useState(null);

  // REMOVED: The preloading effect that was causing performance issues
  // This is the main change to improve INP

  useEffect(() => {
    if (!weather?.weather?.[0]) {
      setVideoSrc("");
      setLocalTime(null);
      return;
    }

    const cityLocalTime = getLocalTime(weather.timezone);
    setLocalTime(cityLocalTime);

    const weatherMain = weather.weather[0].main;
    const weatherDesc = weather.weather[0].description;
    const videoFileName = getWeatherTimeVideo(weatherMain, weatherDesc, weather.timezone);
    
    // MODIFIED: Removed timestamp query parameter to enable browser caching
    const newVideoSrc = `/videos/${videoFileName}`;
    
    // REMOVED: Preloading code that created unnecessary video elements
    
    setVideoLoaded(false);
    setVideoError(false);
    setVideoKey(prev => prev + 1);

    // Keep your existing video element cleanup
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }

    setVideoSrc(newVideoSrc);
  }, [weather]);

  // ADDED: New effect for lazy loading with Intersection Observer
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Only set the src when the video is visible
            video.src = videoSrc;
            video.load();
            observer.unobserve(video);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);

    return () => {
      if (video) observer.unobserve(video);
    };
  }, [videoSrc]);

  const handleVideoPlay = () => {
    if (!videoRef.current) return;
    videoRef.current.play().catch(error => {
      document.addEventListener('click', function clickHandler() {
        videoRef.current?.play().catch(() => {});
        document.removeEventListener('click', clickHandler);
      });
    });
  };

  const handleVideoError = () => {
    setVideoError(true);
    const cityTime = getLocalTime(weather?.timezone || 0);
    const fallbackVideo = cityTime.isDay ? "/videos/Day-Clear.mp4" : "/videos/Night-Clear.mp4";

    if (!videoSrc.includes(fallbackVideo)) {
      // MODIFIED: Removed timestamp to enable caching
      setVideoSrc(fallbackVideo);
      setVideoKey(prev => prev + 1);
    }
  };

  function getLocalTime(timezoneOffset) {
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
  }

  function getWeatherTimeVideo(main, description, timezone) {
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
  }

  function getWeatherIcon(condition, iconCode, size = 70) {
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
  }

  if (!weather) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-800/20 backdrop-blur-md h-full">
      <div className="absolute inset-0 overflow-hidden">
        {videoSrc && !videoError && (
          <video
            key={videoKey}
            ref={videoRef}
            src={videoSrc}
            className={`object-cover w-full h-full transition-opacity duration-500 ${videoLoaded ? 'opacity-60' : 'opacity-0'}`}
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={() => {
              setVideoLoaded(true);
              handleVideoPlay();
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