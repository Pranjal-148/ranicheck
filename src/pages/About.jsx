import React from "react";
import { FiGithub, FiInstagram, FiMail } from "react-icons/fi";
import { WiDaySunny, WiRain, WiCloudy, WiThermometer } from "react-icons/wi";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 text-white p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">About RainCheck</h1>
        <p className="text-blue-300">The story behind RainCheck</p>
      </div>

      {/* About Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator Info */}
        <div className="lg:col-span-1">
          <div className="bg-blue-800/30 backdrop-blur-md rounded-xl p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <WiDaySunny size={48} className="text-white" />
              </div>
              <h5 className="text-xl font-semibold">Pranjal Kumar</h5>
              <p className="text-center text-gray-300 mt-2">BTech Student at DTU</p>
            </div>

            <div className="border-t border-blue-700/50 pt-4">
              <h3 className="font-medium mb-3">Connect With Me</h3>

              <div className="space-y-3">
                <a
                  href="https://github.com/Pranjal-148"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 hover:bg-blue-700/30 rounded-lg transition-colors"
                >
                  <FiGithub className="mr-3 text-gray-300" />
                  <span>GitHub</span>
                </a>

                <a
                  href="https://www.instagram.com/k_pran_jal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 hover:bg-blue-700/30 rounded-lg transition-colors"
                >
                  <FiInstagram className="mr-3 text-gray-300" />
                  <span>Instagram</span>
                </a>

                <a
                  href="mailto:pranjal14805@gmail.com"
                  className="flex items-center p-2 hover:bg-blue-700/30 rounded-lg transition-colors"
                >
                  <FiMail className="mr-3 text-gray-300" />
                  <span>Email Me</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* About Text */}
        <div className="lg:col-span-2">
          <div className="bg-blue-800/30 backdrop-blur-md rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <WiRain size={32} className="text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold">The Story</h2>
            </div>

            <div className="space-y-4 text-gray-100">
              <p>
                Namaste! I'm that BTech student from DTU who decided making a weather app was somehow easier than explaining to my parents why "Computer Science" doesn't mean I can fix their printer.
              </p>

              <p>
                When I'm not debugging code at 3 AM or questioning my life choices during exam week, I'm building apps that actually solve real problems – like the existential crisis of not knowing whether to wear a jacket tomorrow.
              </p>

              <p>
                RainCheck was born during mid-sem week when I should have been studying, but instead thought, "Delhi's weather is more unpredictable than my future – there should be an app for that."
              </p>

              <p>
                What started as "I should probably check the weather" evolved into "I should probably build an entire weather platform because that's clearly a better use of my time than studying."
              </p>
            </div>
          </div>

          <div className="bg-blue-800/30 backdrop-blur-md rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <WiCloudy size={32} className="text-gray-300 mr-2" />
              <h2 className="text-xl font-semibold">The Tech</h2>
            </div>

            <div className="space-y-4 text-gray-100">
              <p>
                RainCheck is built with a modern tech stack that brings you accurate weather data with a sleek, responsive interface.
              </p>

              <p>
                The frontend is crafted with React.js for a smooth user experience and styled with Tailwind CSS for that clean, responsive design that works on all your devices. The backend runs on Node.js, with MongoDB handling all the data storage needs.
              </p>

              <p>
                Weather data comes directly from the OpenWeatherMap API, providing reliable forecasts and current conditions for locations worldwide. The entire application is deployed on Vercel for lightning-fast performance.
              </p>

              <p>
                If RainCheck ever acts weird or goofy, don't panic. It's most likely a bug, just shoot me a message and I'll get to squashing it faster than your crush ghosted you after one dry text.
              </p>

              <p>
                Bonus points if your bug report includes screenshots and memes. Minus points if it starts with "bro your app is broken lol".
              </p>
            </div>
          </div>

          <div className="bg-blue-800/30 backdrop-blur-md rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <WiThermometer size={32} className="text-red-300 mr-2" />
              <h2 className="text-xl font-semibold">Limitations</h2>
            </div>

            <div className="space-y-4 text-gray-100">
              <p>
                RainCheck relies on the free OpenWeatherMap API, which comes with some limitations you should be aware of:
              </p>

              <p>
                The API provides weather data at the city level, which means we can't search for specific areas within cities. For large metropolitan areas, this could result in weather readings that don't precisely match your exact location.
              </p>

              <p>
                If you're in a large city like Delhi, Mumbai, or Bangalore, the weather conditions may vary significantly across different neighborhoods or areas. RainCheck will show the overall weather for the city center, which might differ from what you're experiencing in your specific location.
              </p>

              <p>
                For the most accurate hyperlocal weather, you might need to search for nearby smaller towns or districts instead of the main city name if you're experiencing different conditions than what's shown.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-600/20 backdrop-blur-md rounded-xl p-4 text-center">
            <p className="text-lg">
              Thanks for checking out RainCheck! Hope it helps you stay dry (or get wet, if that's your thing).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}