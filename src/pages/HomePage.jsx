import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WiDayRain, WiDaySunny, WiCloudy } from "react-icons/wi";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/weather");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
              RainCheck
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Real-time weather updates and forecasts for any location around the world
          </p>
        </div>

        {/* Weather Icons Animation */}
        <div className="relative w-full max-w-3xl h-64 mb-12">
          <div className="absolute top-0 left-1/4 animate-float">
            <WiDaySunny size={80} className="text-yellow-400" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float-delayed">
            <WiCloudy size={70} className="text-gray-300" />
          </div>
          <div className="absolute bottom-0 left-1/3 animate-float-slow">
            <WiDayRain size={90} className="text-blue-400" />
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-8 rounded-full transition-colors shadow-lg"
        >
          {user ? "View Weather" : "Get Started"}
        </button>
      </div>
    </div>
  );
}
