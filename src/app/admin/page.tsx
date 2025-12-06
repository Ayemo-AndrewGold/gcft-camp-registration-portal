"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend as RechartsLegend } from "recharts";
import { Users, Building2, Bed, TrendingUp, UserCheck, UserX, Layers, AlertCircle, CheckCircle, Clock, Calendar } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#a855f7", "#3b82f6", "#14b8a6"];

interface HallData {
  name: string;
  value: number;
  total: number;
  percentage: string;
  color: string;
  [key: string]: string | number;
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
}

const AdminDashboard: React.FC = () => {
  const [hallData, setHallData] = useState<HallData[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [hallsRes, usersRes, allUsersRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/halls`),
          fetch(`${API_BASE}/analytics/total-users`),
          fetch(`${API_BASE}/users`),
        ]);

        const hallsData = await hallsRes.json();
        const usersData = await usersRes.json();
        const allUsersData = await allUsersRes.json();

        // Transform halls data
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
        setTotalUsers(usersData.total_users);
        setAllUsers(allUsersData);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

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
            <p className="text-gray-600 text-lg">Loading analytics...</p>
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
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Bedspace */}
          <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Total Bedspace</h4>
              <Building2 className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold">{totalBedspace}</p>
            <p className="text-xs mt-2 opacity-90">Total available beds</p>
          </div>

          {/* Total Registered */}
          <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Registered Users</h4>
              <UserCheck className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold">{totalUsers}</p>
            <p className="text-xs mt-2 opacity-90">Total registrations</p>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Occupancy Rate</h4>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold">{overallPercentage}%</p>
            <p className="text-xs mt-2 opacity-90">{totalOccupied} of {totalBedspace} beds</p>
          </div>

          {/* Available Beds */}
          <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
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

            {/* System Status */}
            <div className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl shadow-sm p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">System Status</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">All Systems Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">{hallData.length} Halls Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-700">{categoryData.length} Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  {parseFloat(overallPercentage) < 100 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    {parseFloat(overallPercentage) < 100 ? 'Space Available' : 'Fully Booked'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hall Statistics */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Hall Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hallData.map((hall, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">{hall.name}</h4>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: hall.color }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-semibold text-gray-800">{hall.value}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-gray-800">{hall.total - hall.value}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-800">{hall.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${hall.percentage}%`,
                        backgroundColor: hall.color,
                      }}
                    ></div>
                  </div>
                  <p className="text-right text-sm font-semibold" style={{ color: hall.color }}>
                    {hall.percentage}% Full
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Hall Occupancy Donut Chart */}
          <div className="bg-linear-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Hall Occupancy Distribution
            </h3>
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
                    labelLine={false}
                  >
                    {hallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [`${val} beds`, 'Occupied']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Bar Chart */}
          <div className="bg-linear-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Category Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Hall Legend & Detailed Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-linear-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Hall Details</h3>
            <div className="space-y-3">
              {hallData.map((hall, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-6 h-6 rounded-md shrink-0"
                      style={{ backgroundColor: hall.color }}
                    ></span>
                    <div>
                      <span className="font-semibold text-gray-800 block">
                        {hall.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {hall.value} / {hall.total} beds occupied
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-lg font-bold"
                    style={{ color: hall.color }}
                  >
                    {hall.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions / Alerts */}
          <div className="bg-linear-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">System Insights</h3>
            <div className="space-y-4">
              {/* Capacity Alert */}
              {parseFloat(overallPercentage) > 90 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-800">High Occupancy Alert</h4>
                      <p className="text-xs text-red-700 mt-1">
                        Hall capacity is at {overallPercentage}%. Consider preparing overflow arrangements.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Low Occupancy */}
              {parseFloat(overallPercentage) < 50 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800">Registration Ongoing</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        {availableBeds} beds still available. Continue registration campaigns.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gender Balance Info */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-purple-800">Gender Distribution</h4>
                    <p className="text-xs text-purple-700 mt-1">
                      Male: {maleCount} ({totalUsers > 0 ? ((maleCount/totalUsers)*100).toFixed(1) : 0}%) | 
                      Female: {femaleCount} ({totalUsers > 0 ? ((femaleCount/totalUsers)*100).toFixed(1) : 0}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-800">Registration Summary</h4>
                    <p className="text-xs text-green-700 mt-1">
                      {totalUsers} registered participants across {categoryData.length} categories and {hallData.length} halls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;