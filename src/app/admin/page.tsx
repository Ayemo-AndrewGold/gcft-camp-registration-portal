"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Building2, Bed, TrendingUp, UserCheck, Layers, AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#a855f7", "#3b82f6", "#14b8a6"];

interface HallData {
  name: string;
  value: number;
  total: number;
  percentage: string;
  color: string;
}

interface Category {
  beds_allocated?: number;
  category_name?: string;
}

interface HallResponse {
  hall_name: string;
  total_beds?: number;
  categories: Category[];
}

interface UserData {
  gender?: string;
  category?: string;
  marital_status?: string;
  country?: string;
  is_active?: boolean;
}

const AdminDashboard: React.FC = () => {
  const [hallData, setHallData] = useState<HallData[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<{
    halls: string;
    totalUsers: string;
    allUsers: string;
  }>({
    halls: 'pending',
    totalUsers: 'pending',
    allUsers: 'pending'
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setErrors([]);
    const errorList: string[] = [];

    try {
      // Fetch halls data
      console.log("Fetching halls data...");
      setApiStatus(prev => ({ ...prev, halls: 'loading' }));
      try {
        const hallsRes = await fetch(`${API_BASE}/analytics/halls`);
        console.log("Halls response status:", hallsRes.status);
        
        if (!hallsRes.ok) {
          throw new Error(`Halls API failed with status ${hallsRes.status}`);
        }
        
        const hallsData = await hallsRes.json();
        console.log("Halls data received:", hallsData);

        const transformedHalls: HallData[] = hallsData.map((hall: HallResponse, idx: number) => {
          const occupied = hall.categories.reduce(
            (sum, c) => sum + (c.beds_allocated || 0),
            0
          );
          const total = hall.total_beds || 0;

          return {
            name: hall.hall_name,
            value: occupied,
            total,
            percentage: total > 0 ? ((occupied / total) * 100).toFixed(1) : "0",
            color: COLORS[idx % COLORS.length],
          };
        });

        setHallData(transformedHalls);
        setApiStatus(prev => ({ ...prev, halls: 'success' }));
      } catch (err: any) {
        console.error("Halls fetch error:", err);
        errorList.push(`Halls API: ${err.message}`);
        setApiStatus(prev => ({ ...prev, halls: 'error' }));
      }

      // Fetch total users
      console.log("Fetching total users...");
      setApiStatus(prev => ({ ...prev, totalUsers: 'loading' }));
      try {
        const usersRes = await fetch(`${API_BASE}/analytics/total-users`);
        console.log("Total users response status:", usersRes.status);
        
        if (!usersRes.ok) {
          throw new Error(`Total users API failed with status ${usersRes.status}`);
        }
        
        const usersData = await usersRes.json();
        console.log("Total users data received:", usersData);
        
        setTotalUsers(usersData.total_users || 0);
        setApiStatus(prev => ({ ...prev, totalUsers: 'success' }));
      } catch (err: any) {
        console.error("Total users fetch error:", err);
        errorList.push(`Total Users API: ${err.message}`);
        setApiStatus(prev => ({ ...prev, totalUsers: 'error' }));
      }

      // Fetch all users
      console.log("Fetching all users...");
      setApiStatus(prev => ({ ...prev, allUsers: 'loading' }));
      try {
        const allUsersRes = await fetch(`${API_BASE}/users`);
        console.log("All users response status:", allUsersRes.status);
        
        if (!allUsersRes.ok) {
          throw new Error(`All users API failed with status ${allUsersRes.status}`);
        }
        
        const allUsersData = await allUsersRes.json();
        console.log("All users data received:", allUsersData);
        console.log("Number of users:", allUsersData.length);
        
        if (!Array.isArray(allUsersData)) {
          throw new Error("All users data is not an array");
        }
        
        setAllUsers(allUsersData);
        setApiStatus(prev => ({ ...prev, allUsers: 'success' }));
      } catch (err: any) {
        console.error("All users fetch error:", err);
        errorList.push(`All Users API: ${err.message}`);
        setApiStatus(prev => ({ ...prev, allUsers: 'error' }));
      }

      setErrors(errorList);
      setLastUpdated(new Date().toLocaleString());
    } catch (err: any) {
      console.error("General error:", err);
      setErrors([...errorList, `General error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Calculate statistics
  const totalBedspace = hallData.reduce((acc, hall) => acc + hall.total, 0);
  const totalOccupied = hallData.reduce((acc, hall) => acc + hall.value, 0);
  const availableBeds = totalBedspace - totalOccupied;
  const overallPercentage = totalBedspace > 0 
    ? ((totalOccupied / totalBedspace) * 100).toFixed(1) 
    : "0";

  // Gender statistics
  const maleCount = allUsers.filter(u => u.gender?.toLowerCase() === 'male').length;
  const femaleCount = allUsers.filter(u => u.gender?.toLowerCase() === 'female').length;
  
  // Active/Pending users
  const activeUsers = allUsers.filter(u => u.is_active === true).length;
  const pendingUsers = allUsers.filter(u => !u.is_active).length;

  // Category statistics
  const categoryStats = allUsers.reduce((acc, user) => {
    const cat = user.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
  }));

  // Marital status statistics
  const maritalStats = allUsers.reduce((acc, user) => {
    const status = user.marital_status || 'Not Specified';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top countries
  const countryStats = allUsers.reduce((acc, user) => {
    const country = user.country || 'Not Specified';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg mb-4">Loading analytics...</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Halls: <span className={`font-semibold ${apiStatus.halls === 'success' ? 'text-green-600' : apiStatus.halls === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>{apiStatus.halls}</span></p>
              <p>Total Users: <span className={`font-semibold ${apiStatus.totalUsers === 'success' ? 'text-green-600' : apiStatus.totalUsers === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>{apiStatus.totalUsers}</span></p>
              <p>All Users: <span className={`font-semibold ${apiStatus.allUsers === 'success' ? 'text-green-600' : apiStatus.allUsers === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>{apiStatus.allUsers}</span></p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
      <section className="bg-white min-h-screen rounded-lg shadow-md p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                📊 Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Easter Camp Meeting 2026 - Complete Analytics Overview
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Last updated: {lastUpdated}</span>
              </div>
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-2">API Errors Detected</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Debug Information</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• API Base URL: {API_BASE}</p>
            <p>• Total Users Fetched: {allUsers.length}</p>
            <p>• Total Halls: {hallData.length}</p>
            <p>• Active Users: {activeUsers}</p>
            <p>• Pending Users: {pendingUsers}</p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Total Bedspace</h4>
              <Building2 className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold">{totalBedspace}</p>
            <p className="text-xs mt-2 opacity-90">Total available beds</p>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Registered Users</h4>
              <UserCheck className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold">{totalUsers}</p>
            <p className="text-xs mt-2 opacity-90">Total registrations</p>
          </div>

          <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Occupancy Rate</h4>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold">{overallPercentage}%</p>
            <p className="text-xs mt-2 opacity-90">{totalOccupied} of {totalBedspace} beds</p>
          </div>

          <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Available Beds</h4>
              <Bed className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold">{availableBeds}</p>
            <p className="text-xs mt-2 opacity-90">Unoccupied bedspace</p>
          </div>
        </div>

        {/* Demographics Overview */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Demographics Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gender Distribution */}
            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-6">
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Gender Distribution</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Male</span>
                    <span className="text-sm font-bold text-blue-600">{maleCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalUsers > 0 ? (maleCount / totalUsers * 100).toFixed(1) : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Female</span>
                    <span className="text-sm font-bold text-pink-600">{femaleCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalUsers > 0 ? (femaleCount / totalUsers * 100).toFixed(1) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-6">
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Verification Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Verified</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{pendingUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${allUsers.length > 0 ? (activeUsers / allUsers.length * 100).toFixed(1) : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {allUsers.length > 0 ? ((activeUsers / allUsers.length * 100).toFixed(1)) : 0}% Verified
                </p>
              </div>
            </div>

            {/* Marital Status */}
            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-6">
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Marital Status</h4>
              <div className="space-y-2">
                {Object.entries(maritalStats).slice(0, 4).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{status}</span>
                    <span className="text-sm font-bold text-purple-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-6">
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Top Countries</h4>
              <div className="space-y-2">
                {topCountries.map(([country, count]) => (
                  <div key={country} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 truncate">{country}</span>
                    <span className="text-sm font-bold text-green-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Hall Occupancy Chart */}
          <div className="bg-linear-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Hall Occupancy Distribution
            </h3>
            {hallData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hallData}
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={(props: any) => `${props.percent ? (props.percent * 100).toFixed(1) : 0}%`}
                    >
                      {hallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <p>No hall data available</p>
              </div>
            )}
          </div>

          {/* Category Chart */}
          <div className="bg-linear-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Category Distribution
            </h3>
            {categoryData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;