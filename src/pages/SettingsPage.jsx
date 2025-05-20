import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiTrash2, FiCheckCircle, FiAlertTriangle, FiLoader } from "react-icons/fi";
import { WiCloud } from "react-icons/wi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SettingsPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [savedCitiesCount, setSavedCitiesCount] = useState(0);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
      fetchSavedCitiesCount();
    }
  }, [user]);

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  const fetchSavedCitiesCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/cities`, {
        headers: { "x-auth-token": token }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedCitiesCount(data.cities?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update profile");

      login({ ...user, name: formData.name, email: formData.email });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update password");

      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      setMessage({ type: "success", text: "Password updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/users`, {
          method: "DELETE",
          headers: { "x-auth-token": token }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete account");
        }

        logout();
        navigate("/");
      } catch (error) {
        setMessage({ type: "error", text: error.message });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 text-white p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-blue-300">Manage your profile and preferences</p>
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Summary */}
        <div className="lg:col-span-1">
          <div className="bg-blue-800/30 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <FiUser size={32} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
                <p className="text-gray-300">{user?.email}</p>
              </div>
            </div>

            <div className="border-t border-blue-700/50 pt-4 mb-4">
              <div className="flex items-center mb-3">
                <WiCloud size={24} className="text-blue-300 mr-2" />
                <span>{savedCitiesCount} saved cities</span>
              </div>
              <div className="text-sm text-gray-300">
                Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="w-full mt-4 bg-red-600/30 hover:bg-red-600/50 text-red-200 py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <FiTrash2 className="mr-2" />
              Delete Account
            </button>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2">
          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === "success" ? "bg-green-600/30 text-green-200" : "bg-red-600/30 text-red-200"
              }`}>
              {message.type === "success" ? (
                <FiCheckCircle className="mr-2" />
              ) : (
                <FiAlertTriangle className="mr-2" />
              )}
              {message.text}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-blue-800/30 backdrop-blur-md rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-blue-900/50 text-white w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-blue-900/50 text-white w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center transition-colors"
              >
                {loading ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : (
                  <FiCheckCircle className="mr-2" />
                )}
                Update Profile
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-blue-800/30 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-gray-300 mb-2">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={passwordVisibility.currentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="bg-blue-900/50 text-white w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                  >
                    {passwordVisibility.currentPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={passwordVisibility.newPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="bg-blue-900/50 text-white w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {passwordVisibility.newPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-blue-900/50 text-white w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {passwordVisibility.confirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center transition-colors"
              >
                {loading ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : (
                  <FiCheckCircle className="mr-2" />
                )}
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
