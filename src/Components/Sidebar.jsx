import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  WiDaySunny,
} from "react-icons/wi";
import { IoLocationOutline, IoSettingsOutline } from "react-icons/io5";
import { FiMap, FiUser, FiChevronDown, FiX, FiLogOut, FiInfo, FiMenu, FiSettings } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      label: "Weather",
      icon: <WiDaySunny size={24} />,
      path: "/weather"
    },
    {
      label: "Cities",
      icon: <IoLocationOutline size={20} />,
      path: "/cities"
    },
    {
      label: "Map",
      icon: <FiMap size={20} />,
      path: "/map"
    },
    {
      label: "Settings",
      icon: <IoSettingsOutline size={20} />,
      path: "/settings"
    },
    {
      label: "About",
      icon: <FiInfo size={20} />,
      path: "/about"
    }
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false); 
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "G";
    
    const username = user.email.split('@')[0];
    return username.charAt(0).toUpperCase();
  };

  return (
    <>
      {/*Mobile Menu Button*/}
      <button 
        onClick={toggleSidebar} 
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-800/50 backdrop-blur-md p-2 rounded-full text-white"
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white transition-all duration-300 z-40 
          ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-20 lg:w-64'} 
          md:sticky md:top-0 md:h-screen md:flex-shrink-0 overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* App Logo/Title */}
          <div className="p-4 border-b border-blue-800">
            <h1 className={`text-xl font-bold ${!isOpen && 'md:hidden lg:block'}`}>RainCheck</h1>
            <div className={`text-sm text-blue-300 ${!isOpen && 'md:hidden lg:block'}`}>Stay updated</div>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul>
              {navItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center p-3 hover:bg-blue-800/50 transition-colors
                      ${!isOpen ? 'md:justify-center lg:justify-start' : ''}`}
                  >
                    <span className="text-blue-300">{item.icon}</span>
                    <span className={`ml-3 ${!isOpen && 'md:hidden lg:block'}`}>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User Profile Section */}
          <div className="border-t border-blue-800 p-4 mt-auto" ref={userMenuRef}>
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center ${!isOpen ? 'md:justify-center lg:justify-between' : 'justify-between'}`}
              >
                <div className={`flex items-center ${!isOpen && 'md:flex-col lg:flex-row'}`}>
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-medium">{getUserInitials()}</span>
                  </div>
                  <div className={`${!isOpen && 'md:hidden lg:block'} ml-2`}>
                    <div className="font-medium truncate max-w-[120px]">
                      {user?.email ? user.email.split('@')[0] : 'Guest'}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-[120px]">
                      {user?.email || 'Not signed in'}
                    </div>
                  </div>
                </div>
                <FiChevronDown className={`transition-transform ${showUserMenu ? 'rotate-180' : ''} ${!isOpen && 'md:hidden lg:block'} text-gray-400`} />
              </button>
              
              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 w-full bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden mb-2 border border-gray-700">
                  <button 
                    onClick={() => {
                      handleNavigation('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center p-3 hover:bg-blue-800/50 transition-colors"
                  >
                    <FiSettings className="mr-2 text-gray-400" />
                    <span>Settings</span>
                  </button>
                  
                  <div className="border-t border-gray-700"></div>
                  
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center p-3 hover:bg-blue-800/50 transition-colors text-red-400"
                  >
                    <FiLogOut className="mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
