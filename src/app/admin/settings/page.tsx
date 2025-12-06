"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield
} from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface EventSettings {
  eventName: string;
  eventDate: string;
  location: string;
  maxCapacity: number;
  registrationOpen: boolean;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "event" | "notifications" | "security" | "data">("profile");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Profile Settings
  const [profile, setProfile] = useState<AdminProfile>({
    name: "Admin User",
    email: "admin@gcftcamp.com",
    phone: "+234 800 000 0000",
    role: "Super Administrator"
  });

  // Event Settings
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    eventName: "Easter Camp Meeting 2026",
    eventDate: "2026-04-10",
    location: "Camp Ground, Lagos",
    maxCapacity: 5000,
    registrationOpen: true
  });

  // Security Settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newRegistrations: true,
    systemAlerts: true,
    weeklyReports: true,
    dailyDigest: false
  });

  // Data Management
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("csv");

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Update Profile
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast("✅ Profile updated successfully!", 'success');
    } catch (error) {
      showToast("❌ Failed to update profile", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update Event Settings
  const handleUpdateEventSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast("✅ Event settings updated successfully!", 'success');
    } catch (error) {
      showToast("❌ Failed to update event settings", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast("❌ Passwords do not match!", 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast("❌ Password must be at least 8 characters", 'error');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast("✅ Password changed successfully!", 'success');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showToast("❌ Failed to change password", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update Notifications
  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast("✅ Notification preferences updated!", 'success');
    } catch (error) {
      showToast("❌ Failed to update notifications", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export Data
  const handleExportData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`);
      const users = await res.json();
      
      // Convert to CSV
      const headers = Object.keys(users[0] || {}).join(',');
      const rows = users.map((user: any) => 
        Object.values(user).map(val => `"${val}"`).join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      showToast("✅ Data exported successfully!", 'success');
    } catch (error) {
      showToast("❌ Failed to export data", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear Cache
  const handleClearCache = async () => {
    if (!window.confirm("Are you sure you want to clear the cache? This will refresh all data.")) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast("✅ Cache cleared successfully!", 'success');
    } catch (error) {
      showToast("❌ Failed to clear cache", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <section className="bg-white min-h-screen rounded-lg shadow-md p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                Admin Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your system preferences and configurations
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b-2 border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "event", label: "Event Settings", icon: Calendar },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Security", icon: Shield },
            { id: "data", label: "Data Management", icon: Database }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 font-semibold transition-all relative flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Administrator Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full pl-10 border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full pl-10 border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* Event Settings */}
        {activeTab === "event" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Event Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={eventSettings.eventName}
                    onChange={(e) => setEventSettings({ ...eventSettings, eventName: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventSettings.eventDate}
                    onChange={(e) => setEventSettings({ ...eventSettings, eventDate: e.target.value })}
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={eventSettings.location}
                      onChange={(e) => setEventSettings({ ...eventSettings, location: e.target.value })}
                      className="w-full pl-10 border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Capacity
                  </label>
                  <input
                    type="number"
                    value={eventSettings.maxCapacity}
                    onChange={(e) => setEventSettings({ ...eventSettings, maxCapacity: Number(e.target.value) })}
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Registration Toggle */}
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">Registration Status</h4>
                    <p className="text-sm text-gray-600">
                      {eventSettings.registrationOpen ? "Accepting new registrations" : "Registration closed"}
                    </p>
                  </div>
                  <button
                    onClick={() => setEventSettings({ ...eventSettings, registrationOpen: !eventSettings.registrationOpen })}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      eventSettings.registrationOpen ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        eventSettings.registrationOpen ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpdateEventSettings}
                disabled={loading}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Update Event Settings
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
                  { key: "smsNotifications", label: "SMS Notifications", desc: "Receive notifications via SMS" },
                  { key: "newRegistrations", label: "New Registration Alerts", desc: "Get notified when someone registers" },
                  { key: "systemAlerts", label: "System Alerts", desc: "Critical system notifications" },
                  { key: "weeklyReports", label: "Weekly Reports", desc: "Receive weekly summary reports" },
                  { key: "dailyDigest", label: "Daily Digest", desc: "Daily summary of activities" }
                ].map((item) => (
                  <div key={item.key} className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{item.label}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            notifications[item.key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpdateNotifications}
                disabled={loading}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-10 border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Password Requirements */}
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    At least 8 characters long
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Contains uppercase and lowercase letters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Contains at least one number
                  </li>
                </ul>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                Change Password
              </button>
            </div>
          </div>
        )}

        {/* Data Management */}
        {activeTab === "data" && (
          <div className="space-y-6">
            {/* Export Data */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Export Data
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Download all registered users and system data in your preferred format
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="csv">CSV Format</option>
                  <option value="excel">Excel Format</option>
                  <option value="pdf">PDF Format</option>
                </select>
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  Export Data
                </button>
              </div>
            </div>

            {/* Clear Cache */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-yellow-600" />
                Clear Cache
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Clear system cache to refresh all data. This may improve performance if the system feels slow.
              </p>
              <button
                onClick={handleClearCache}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all shadow-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                Clear Cache
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-300">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-red-800 mb-2">Danger Zone</h2>
                  <p className="text-sm text-red-700">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border-2 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">Reset All Data</h4>
                      <p className="text-sm text-gray-600">Delete all users, halls, and categories</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm("⚠️ This will delete ALL data permanently. Are you absolutely sure?")) {
                          showToast("This feature is disabled in demo mode", 'error');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm"
                    >
                      Reset System
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Settings;