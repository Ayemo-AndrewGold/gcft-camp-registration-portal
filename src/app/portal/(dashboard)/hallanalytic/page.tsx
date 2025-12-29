"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bed,
  Users,
  UserCheck,
  Building2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Activity,
  Home,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface Floor {
  floor_no: string;
  no_beds: number;
  active_users_count: number;
  all_users_count: number;
}

interface HallStats {
  hall_name: string;
  no_floors: number;
  total_beds: number;
  current_user_count: number;
  verified_user_count: number;
  remaining_space: number;
  floors: Floor[];
}

const HALLS = [
  "Jerusalem Hall",
  "William Branham Hall",
  "Elizabeth Billy Hall",
];

export default function HallAnalytics() {
  const [data, setData] = useState<HallStats | null>(null);
  const [selectedHall, setSelectedHall] = useState<string>(HALLS[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'floors' | 'analytics'>('overview');

  const API_BASE = "https://gcft-camp.onrender.com/api/v1/analytics";

  const fetchData = async (hall: string, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE}/${encodeURIComponent(hall.toLowerCase().replace(/\s+/g, " "))}/hall-statistics`
      );

      setData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          `Failed to load data for ${hall}. Please try again.`
      );
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(selectedHall);
  }, [selectedHall]);

  const occupancyRate =
    data && data.total_beds > 0
      ? ((data.current_user_count / data.total_beds) * 100).toFixed(1)
      : "0";

  const verificationRate = 
    data && data.current_user_count > 0
      ? ((data.verified_user_count / data.current_user_count) * 100).toFixed(1)
      : "0";

  // Enhanced Chart Data
  const doughnutData = {
    labels: ["Occupied Beds", "Available Beds", "Reserved"],
    datasets: [
      {
        data: [
          data?.verified_user_count || 0,
          data?.remaining_space || 0,
          (data?.current_user_count || 0) - (data?.verified_user_count || 0)
        ],
        backgroundColor: ["#10b981", "#e5e7eb", "#f59e0b"],
        borderColor: ["#059669", "#d1d5db", "#d97706"],
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: { size: 13, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: { 
        callbacks: { 
          label: (ctx: any) => `${ctx.label}: ${ctx.raw} beds (${((ctx.raw / (data?.total_beds || 1)) * 100).toFixed(1)}%)`
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    cutout: "75%",
  };

  const barData = {
    labels: data?.floors.map((f) => f.floor_no.replace('Floor ', 'F')) || [],
    datasets: [
      {
        label: "Verified",
        data: data?.floors.map((f) => f.active_users_count) || [],
        backgroundColor: "#10b981",
        borderRadius: 8,
        barThickness: 40,
      },
      {
        label: "Registered",
        data: data?.floors.map((f) => f.all_users_count - f.active_users_count) || [],
        backgroundColor: "#f59e0b",
        borderRadius: 8,
        barThickness: 40,
      },
      {
        label: "Available",
        data: data?.floors.map((f) => f.no_beds - f.all_users_count) || [],
        backgroundColor: "#e5e7eb",
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" as const,
        labels: {
          padding: 15,
          font: { size: 13, weight: '600' },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 12, weight: '600' } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 12 } },
      },
    },
  };

  // Line chart for occupancy trend
  const lineData = {
    labels: data?.floors.map((f) => f.floor_no.replace('Floor ', 'F')) || [],
    datasets: [
      {
        label: "Occupancy Rate (%)",
        data: data?.floors.map((f) => 
          f.no_beds > 0 ? ((f.active_users_count / f.no_beds) * 100).toFixed(1) : 0
        ) || [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: { 
          label: (ctx: any) => `Occupancy: ${ctx.raw}%`
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          callback: (value: any) => `${value}%`,
          font: { size: 12 }
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: '600' } },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-6 px-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 border border-slate-200">
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-6 sm:px-8 py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    Hall Analytics Dashboard
                  </h1>
                  <p className="text-emerald-100 mt-2 text-base sm:text-lg">
                    Real-time accommodation & occupancy insights
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Hall Selector */}
                <div className="relative w-full sm:w-72">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all px-5 py-3.5 rounded-xl text-base font-semibold border border-white/30"
                  >
                    <span className="truncate flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      {selectedHall}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                      {HALLS.map((hall) => (
                        <button
                          key={hall}
                          onClick={() => {
                            setSelectedHall(hall);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3.5 text-slate-800 hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-0 ${
                            selectedHall === hall ? "bg-emerald-100 font-semibold text-emerald-700" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4" />
                            {hall}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={() => fetchData(selectedHall, true)}
                  disabled={refreshing}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 disabled:opacity-70 font-semibold border border-white/30"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Last Updated */}
            {lastUpdated && !loading && (
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-emerald-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()} • {lastUpdated.toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1 px-6 sm:px-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold transition-all relative ${
                  activeTab === 'overview'
                    ? 'text-emerald-600 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Overview
                </div>
                {activeTab === 'overview' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('floors')}
                className={`px-6 py-4 font-semibold transition-all relative ${
                  activeTab === 'floors'
                    ? 'text-emerald-600 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Floor Details
                </div>
                {activeTab === 'floors' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 font-semibold transition-all relative ${
                  activeTab === 'analytics'
                    ? 'text-emerald-600 bg-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Analytics
                </div>
                {activeTab === 'analytics' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && !refreshing && (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center border border-slate-200">
            <div className="inline-flex flex-col items-center gap-4 text-slate-600">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600"></div>
                <Building2 className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" />
              </div>
              <div>
                <span className="text-xl font-semibold block">Loading Analytics</span>
                <span className="text-sm text-slate-500 mt-1 block">{selectedHall}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
            <div className="flex items-start gap-4 text-red-700">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Error Loading Data</p>
                <p className="text-red-600 mt-1">{error}</p>
                <button
                  onClick={() => fetchData(selectedHall)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && data && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    icon={<Bed className="w-7 h-7" />}
                    title="Total Bed Capacity"
                    value={data.total_beds}
                    trend={{ value: 0, isPositive: true }}
                    color="blue"
                  />
                  <MetricCard
                    icon={<Users className="w-7 h-7" />}
                    title="Current Occupants"
                    value={data.current_user_count}
                    subtitle={`${occupancyRate}% occupancy`}
                    trend={{ value: 12, isPositive: true }}
                    color="emerald"
                  />
                  <MetricCard
                    icon={<UserCheck className="w-7 h-7" />}
                    title="Verified Campers"
                    value={data.verified_user_count}
                    subtitle={`${verificationRate}% verified`}
                    trend={{ value: 8, isPositive: true }}
                    color="purple"
                  />
                  <MetricCard
                    icon={<Building2 className="w-7 h-7" />}
                    title="Available Space"
                    value={data.remaining_space}
                    subtitle={`${data.no_floors} floors`}
                    trend={{ value: 5, isPositive: false }}
                    color="amber"
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Doughnut Chart */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-emerald-600" />
                        Bed Distribution
                      </h3>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                        Live Data
                      </span>
                    </div>
                    <div className="h-80 relative">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-5xl font-bold text-slate-800">{occupancyRate}%</p>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Occupied</p>
                      </div>
                    </div>
                  </div>

                  {/* Line Chart */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Occupancy Trend by Floor
                      </h3>
                    </div>
                    <div className="h-80">
                      <Line data={lineData} options={lineOptions} />
                    </div>
                  </div>
                </div>

                {/* Bar Chart - Full Width */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                      Floor Capacity Analysis
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                        {data.no_floors} Floors
                      </span>
                    </div>
                  </div>
                  <div className="h-96">
                    <Bar data={barData} options={barOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* Floor Details Tab */}
            {activeTab === 'floors' && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                    Floor-wise Breakdown
                  </h2>
                  <p className="text-slate-600 mt-1">Detailed occupancy statistics for each floor</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Floor
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Total Beds
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Registered
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Verified
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Available
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Occupancy
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.floors.map((floor, idx) => {
                        const floorOccupancy = floor.no_beds > 0
                          ? ((floor.active_users_count / floor.no_beds) * 100).toFixed(1)
                          : "0";
                        const available = floor.no_beds - floor.all_users_count;
                        
                        return (
                          <tr
                            key={floor.floor_no}
                            className={`${
                              idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            } hover:bg-emerald-50 transition-colors`}
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                  {idx + 1}
                                </div>
                                <span className="font-bold text-slate-800 text-base">
                                  {floor.floor_no}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="text-slate-700 font-semibold text-base">
                                {floor.no_beds}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-flex px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                                {floor.all_users_count}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                                {floor.active_users_count}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                                available === 0 
                                  ? 'bg-red-100 text-red-700'
                                  : available < 5
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {available}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-3">
                                <span
                                  className={`inline-flex px-4 py-2 rounded-lg text-base font-bold ${
                                    parseFloat(floorOccupancy) > 80
                                      ? "bg-red-100 text-red-700"
                                      : parseFloat(floorOccupancy) > 50
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {floorOccupancy}%
                                </span>
                                <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      parseFloat(floorOccupancy) > 80
                                        ? "bg-red-500"
                                        : parseFloat(floorOccupancy) > 50
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                    }`}
                                    style={{ width: `${floorOccupancy}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold opacity-90">Hall Efficiency</h3>
                      <TrendingUp className="w-6 h-6 opacity-75" />
                    </div>
                    <p className="text-4xl font-bold mb-2">{occupancyRate}%</p>
                    <p className="text-emerald-100 text-sm">Overall occupancy rate</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-90">Target: 85%</span>
                        <span className="font-semibold">
                          {parseFloat(occupancyRate) >= 85 ? '✓ Achieved' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold opacity-90">Verification Rate</h3>
                      <UserCheck className="w-6 h-6 opacity-75" />
                    </div>
                    <p className="text-4xl font-bold mb-2">{verificationRate}%</p>
                    <p className="text-blue-100 text-sm">Campers checked in</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-90">Pending</span>
                        <span className="font-semibold">
                          {data.current_user_count - data.verified_user_count} users
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold opacity-90">Space Utilization</h3>
                      <Building2 className="w-6 h-6 opacity-75" />
                    </div>
                    <p className="text-4xl font-bold mb-2">{data.no_floors}</p>
                    <p className="text-purple-100 text-sm">Active floors in use</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-90">Avg per floor</span>
                        <span className="font-semibold">
                          {(data.verified_user_count / data.no_floors).toFixed(0)} users
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600 font-medium">Bed Utilization</span>
                          <span className="text-slate-800 font-bold">{occupancyRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                            style={{ width: `${occupancyRate}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600 font-medium">Verification Progress</span>
                          <span className="text-slate-800 font-bold">{verificationRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${verificationRate}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600 font-medium">Space Availability</span>
                          <span className="text-slate-800 font-bold">
                            {((data.remaining_space / data.total_beds) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                            style={{ width: `${((data.remaining_space / data.total_beds) * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <p className="text-2xl font-bold text-emerald-700">{data.verified_user_count}</p>
                        <p className="text-xs text-slate-600 mt-1 font-medium">Verified Users</p>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-xl">
                        <p className="text-2xl font-bold text-amber-700">{data.current_user_count - data.verified_user_count}</p>
                        <p className="text-xs text-slate-600 mt-1 font-medium">Pending</p>
                      </div>
                    </div>
                  </div>

                  {/* Floor Rankings */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Floor Performance Rankings
                    </h3>
                    <div className="space-y-3">
                      {data.floors
                        .map((floor, idx) => ({
                          ...floor,
                          occupancy: floor.no_beds > 0 
                            ? ((floor.active_users_count / floor.no_beds) * 100).toFixed(1)
                            : "0",
                          originalIndex: idx
                        }))
                        .sort((a, b) => parseFloat(b.occupancy) - parseFloat(a.occupancy))
                        .map((floor, rank) => (
                          <div 
                            key={floor.floor_no}
                            className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                              rank === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                              rank === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                              rank === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                              'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}>
                              {rank + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800">{floor.floor_no}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {floor.active_users_count} / {floor.no_beds} beds occupied
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${
                                parseFloat(floor.occupancy) > 80 ? 'text-red-600' :
                                parseFloat(floor.occupancy) > 50 ? 'text-amber-600' :
                                'text-emerald-600'
                              }`}>
                                {floor.occupancy}%
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Capacity Insights */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Capacity Insights & Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-slate-800">High Occupancy</h4>
                      </div>
                      <p className="text-3xl font-bold text-emerald-700 mb-2">
                        {data.floors.filter(f => (f.active_users_count / f.no_beds) > 0.8).length}
                      </p>
                      <p className="text-sm text-slate-600">Floors above 80% capacity</p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-slate-800">Medium Occupancy</h4>
                      </div>
                      <p className="text-3xl font-bold text-amber-700 mb-2">
                        {data.floors.filter(f => {
                          const occ = f.active_users_count / f.no_beds;
                          return occ > 0.5 && occ <= 0.8;
                        }).length}
                      </p>
                      <p className="text-sm text-slate-600">Floors at 50-80% capacity</p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-slate-800">Low Occupancy</h4>
                      </div>
                      <p className="text-3xl font-bold text-blue-700 mb-2">
                        {data.floors.filter(f => (f.active_users_count / f.no_beds) <= 0.5).length}
                      </p>
                      <p className="text-sm text-slate-600">Floors below 50% capacity</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      System Recommendations
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {parseFloat(occupancyRate) > 90 && (
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span><strong>Critical:</strong> Hall is near full capacity. Consider opening additional spaces.</span>
                        </li>
                      )}
                      {data.current_user_count - data.verified_user_count > 10 && (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span><strong>Action Required:</strong> {data.current_user_count - data.verified_user_count} users pending verification. Prioritize check-in process.</span>
                        </li>
                      )}
                      {parseFloat(occupancyRate) < 50 && (
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span><strong>Info:</strong> Hall has significant capacity available. Good for walk-in registrations.</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span><strong>Performance:</strong> System is operating normally. All metrics within expected range.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Enhanced Metric Card Component
function MetricCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  color: "blue" | "emerald" | "purple" | "amber";
}) {
  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-indigo-600",
      icon: "bg-blue-100 text-blue-700",
      trend: "bg-blue-50 text-blue-700"
    },
    emerald: {
      bg: "from-emerald-500 to-teal-600",
      icon: "bg-emerald-100 text-emerald-700",
      trend: "bg-emerald-50 text-emerald-700"
    },
    purple: {
      bg: "from-purple-500 to-pink-600",
      icon: "bg-purple-100 text-purple-700",
      trend: "bg-purple-50 text-purple-700"
    },
    amber: {
      bg: "from-amber-500 to-orange-600",
      icon: "bg-amber-100 text-amber-700",
      trend: "bg-amber-50 text-amber-700"
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className={`h-1 bg-gradient-to-r ${colorClasses[color].bg}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color].icon} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${colorClasses[color].trend}`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2">{title}</h3>
        <p className="text-4xl font-bold text-slate-800 mb-2">{value.toLocaleString()}</p>
        {subtitle && (
          <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}