"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#a855f7", "#3b82f6", "#14b8a6"];

const HALLS = [
  "Jerusalem Hall",
  "William Branham Hall",
  "Elizabeth Billy Hall",
];

interface HallData {
  name: string;
  value: number;
  total: number;
  percentage: string;
  color: string;
}

interface HallStats {
  hall_name: string;
  no_floors: number;
  total_beds: number;
  current_user_count: number;
  verified_user_count: number;
  remaining_space: number;
}

const AdminDashboard: React.FC = () => {
  const [allHallsData, setAllHallsData] = useState<HallData[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setError("");
        
        // Fetch statistics for all halls
        const hallsPromises = HALLS.map(hall =>
          fetch(`${API_BASE}/analytics/${encodeURIComponent(hall.toLowerCase().replace(/\s+/g, " "))}/hall-statistics`)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch ${hall}`);
              return res.json();
            })
            .catch(err => {
              console.error(`Error fetching ${hall}:`, err);
              return null;
            })
        );

        const hallsResults = await Promise.all(hallsPromises);
        
        // Fetch total users
        const usersRes = await fetch(`${API_BASE}/users`);
        const usersData = usersRes.ok ? await usersRes.json() : [];

        console.log("Halls data:", hallsResults);
        console.log("Users data:", usersData);

        // Transform halls data
        const transformedHalls: HallData[] = hallsResults
          .filter(hall => hall !== null)
          .map((hall: HallStats, idx) => {
            const occupied = hall.verified_user_count || 0;
            const total = hall.total_beds || 0;

            return {
              name: hall.hall_name,
              value: occupied,
              total,
              percentage: total > 0 ? ((occupied / total) * 100).toFixed(1) : "0",
              color: COLORS[idx % COLORS.length],
            };
          });

        setAllHallsData(transformedHalls);
        setTotalUsers(Array.isArray(usersData) ? usersData.length : 0);
        setLastUpdated(new Date());
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalBedspace = allHallsData.reduce((acc, hall) => acc + hall.total, 0);
  const totalOccupied = allHallsData.reduce((acc, hall) => acc + hall.value, 0);
  const overallPercentage = totalBedspace > 0 
    ? ((totalOccupied / totalBedspace) * 100).toFixed(1) 
    : "0";

  // Prepare data for bar chart
  const barChartData = allHallsData.map(hall => ({
    name: hall.name.replace(' Hall', ''),
    Occupied: hall.value,
    Available: hall.total - hall.value,
    Total: hall.total,
  }));

  if (loading) {
    return (
      <div className="bg-gradient-to-t from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading analytics...</p>
            <p className="text-gray-500 text-sm mt-2">Fetching data from all halls...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-t from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold mb-2">Error Loading Data</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (allHallsData.length === 0) {
    return (
      <div className="bg-gradient-to-t from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg">No hall data available</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-6 lg:p-8 bg-gradient-to-t from-green-100 via-white to-green-200 w-full sm:mt-2 rounded-lg shadow-md">
      <section className="bg-white min-h-screen rounded-lg shadow-md p-2 sm:p-3 lg:p-3">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Easter Camp Meeting 2026 - Analytics Overview
          </p>
          {lastUpdated && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated: {lastUpdated.toLocaleTimeString()} • {lastUpdated.toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Bedspace */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Total Bedspace</h4>
              <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{totalBedspace}</p>
            <p className="text-xs mt-2 opacity-90">Across {allHallsData.length} halls</p>
          </div>

          {/* Total Registered */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Registered Users</h4>
              <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{totalUsers}</p>
            <p className="text-xs mt-2 opacity-90">Total registrations</p>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Occupancy Rate</h4>
              <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{overallPercentage}%</p>
            <p className="text-xs mt-2 opacity-90">{totalOccupied} of {totalBedspace} beds</p>
          </div>

          {/* Available Beds */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">Available Beds</h4>
              <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{totalBedspace - totalOccupied}</p>
            <p className="text-xs mt-2 opacity-90">Unoccupied bedspace</p>
          </div>
        </div>

        {/* Hall Statistics */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hall Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allHallsData.map((hall, idx) => (
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
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-semibold text-gray-800">{hall.value}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Beds:</span>
                    <span className="font-semibold text-gray-800">{hall.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-gray-800">{hall.total - hall.value}</span>
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

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Donut Chart */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Overall Occupancy Distribution
            </h3>
            <div className="h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allHallsData}
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name.split(' ')[0]}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {allHallsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [`${val} beds`, 'Verified']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-5xl font-bold text-gray-800">{overallPercentage}%</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">Overall</p>
              </div>
            </div>
          </div>

          {/* Legend & Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Hall Legend</h3>
            <div className="space-y-3">
              {allHallsData.map((hall, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-6 h-6 rounded-md flex-shrink-0"
                      style={{ backgroundColor: hall.color }}
                    ></span>
                    <div>
                      <span className="font-semibold text-gray-800 block">
                        {hall.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {hall.value} verified / {hall.total} beds
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

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-700">{totalOccupied}</p>
                  <p className="text-xs text-gray-600 mt-1">Verified</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-orange-700">{totalBedspace - totalOccupied}</p>
                  <p className="text-xs text-gray-600 mt-1">Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart - Hall Comparison */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Hall Capacity Comparison
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar dataKey="Occupied" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Available" fill="#e5e7eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold opacity-90">High Occupancy</h4>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-2">
              {allHallsData.filter(h => parseFloat(h.percentage) > 70).length}
            </p>
            <p className="text-green-100 text-sm">Halls above 70% capacity</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold opacity-90">Total Capacity</h4>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-2">{totalBedspace}</p>
            <p className="text-blue-100 text-sm">Total beds across all halls</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold opacity-90">Avg Occupancy</h4>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-2">{overallPercentage}%</p>
            <p className="text-purple-100 text-sm">Average across all halls</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;