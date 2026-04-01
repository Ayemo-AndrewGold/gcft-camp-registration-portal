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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const API_BASE = "https://gcft-camp.onrender.com/api/v1/analytics";

  // ── Dark mode listener ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isDarkMode: boolean }>;
      setIsDarkMode(customEvent.detail.isDarkMode);
    };
    window.addEventListener("themeToggle", handleThemeChange);
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") setIsDarkMode(true);
    }
    return () => window.removeEventListener("themeToggle", handleThemeChange);
  }, []);

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

  // ── Chart colors adapt to dark mode ─────────────────────────────────────────
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDarkMode ? '#9ca3af' : '#374151';
  const legendColor = isDarkMode ? '#d1d5db' : '#374151';
  const tooltipBg = 'rgba(0,0,0,0.85)';

  const doughnutData = {
    labels: ["Occupied Beds (Verified)", "Available Beds", "Unverified"],
    datasets: [
      {
        data: [
          data?.verified_user_count || 0,
          data?.remaining_space || 0,
          (data?.current_user_count || 0) - (data?.verified_user_count || 0),
        ],
        backgroundColor: ["#10b981", isDarkMode ? "#374151" : "#e5e7eb", "#f59e0b"],
        borderColor: ["#059669", isDarkMode ? "#4b5563" : "#d1d5db", "#d97706"],
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
          color: legendColor,
          font: { size: 13, weight: 'bold' as const },
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.label}: ${ctx.raw} beds (${((ctx.raw / (data?.total_beds || 1)) * 100).toFixed(1)}%)`,
        },
        backgroundColor: tooltipBg,
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
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
        backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
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
          color: legendColor,
          font: { size: 13, weight: 'bold' as const },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: tickColor, font: { size: 12, weight: 'bold' as const } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { size: 12 } },
      },
    },
  };

  const lineData = {
    labels: data?.floors.map((f) => f.floor_no.replace('Floor ', 'F')) || [],
    datasets: [
      {
        label: "Occupancy Rate (%)",
        data: data?.floors.map((f) =>
          f.no_beds > 0 ? ((f.active_users_count / f.no_beds) * 100).toFixed(1) : 0
        ) || [],
        borderColor: "#3b82f6",
        backgroundColor: isDarkMode ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: isDarkMode ? "#1f2937" : "#fff",
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
        backgroundColor: tooltipBg,
        padding: 12,
        callbacks: { label: (ctx: any) => `Occupancy: ${ctx.raw}%` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          callback: (value: any) => `${value}%`,
          font: { size: 12 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: tickColor, font: { size: 12, weight: 'bold' as const } },
      },
    },
  };

  // ── Convenience classes ──────────────────────────────────────────────────────
  const card = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200";
  const cardText = isDarkMode ? "text-gray-100" : "text-slate-800";
  const subText = isDarkMode ? "text-gray-400" : "text-slate-600";
  const divider = isDarkMode ? "border-gray-700" : "border-slate-200";
  const rowAlt = isDarkMode ? "bg-gray-750" : "bg-slate-50";
  const rowHover = isDarkMode ? "hover:bg-green-900/20" : "hover:bg-emerald-50";

  return (
    <div className={`font-[lexend] w-full rounded-lg shadow-md ${isDarkMode ? "bg-gray-900" : "bg-linear-to-t from-green-100 via-white to-green-200"}`}>
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className={`rounded-2xl shadow-lg overflow-hidden mb-6 border ${card}`}>
          <div className="bg-linear-to-r from-emerald-600 via-green-600 to-teal-600 px-6 sm:px-8 py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">Hall Analytics Dashboard</h1>
                  <p className="text-emerald-100 mt-2 text-base sm:text-lg">Real-time accommodation & occupancy insights</p>
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
                    <ChevronDown className={`w-5 h-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className={`absolute top-full mt-2 w-full rounded-xl shadow-2xl border overflow-hidden z-50 ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-slate-200"}`}>
                      {HALLS.map((hall) => (
                        <button
                          key={hall}
                          onClick={() => { setSelectedHall(hall); setDropdownOpen(false); }}
                          className={`w-full text-left px-5 py-3.5 transition-colors border-b last:border-0 ${
                            isDarkMode ? "border-gray-700 text-gray-200 hover:bg-green-900/30" : "border-slate-100 text-slate-800 hover:bg-emerald-50"
                          } ${selectedHall === hall ? isDarkMode ? "bg-green-900/40 font-semibold text-green-400" : "bg-emerald-100 font-semibold text-emerald-700" : ""}`}
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

            {lastUpdated && !loading && (
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-emerald-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()} • {lastUpdated.toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className={`border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-slate-50 border-slate-200"}`}>
            <div className="flex gap-1 px-6 sm:px-8">
              {(['overview', 'floors', 'analytics'] as const).map((tab) => {
                const icons = { overview: <Activity className="w-4 h-4" />, floors: <Building2 className="w-4 h-4" />, analytics: <PieChart className="w-4 h-4" /> };
                const labels = { overview: 'Overview', floors: 'Floor Details', analytics: 'Analytics' };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-semibold transition-all relative ${
                      activeTab === tab
                        ? isDarkMode ? 'text-green-400 bg-gray-800' : 'text-emerald-600 bg-white'
                        : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">{icons[tab]}{labels[tab]}</div>
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && !refreshing && (
          <div className={`rounded-2xl shadow-lg p-20 text-center border ${card}`}>
            <div className={`inline-flex flex-col items-center gap-4 ${subText}`}>
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600"></div>
                <Building2 className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" />
              </div>
              <div>
                <span className={`text-xl font-semibold block ${cardText}`}>Loading Analytics</span>
                <span className={`text-sm mt-1 block ${subText}`}>{selectedHall}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`rounded-2xl shadow-lg p-6 border border-red-300 ${isDarkMode ? "bg-red-900/20" : "bg-white"}`}>
            <div className="flex items-start gap-4 text-red-500">
              <div className={`p-3 rounded-xl ${isDarkMode ? "bg-red-900/40" : "bg-red-100"}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Error Loading Data</p>
                <p className={`mt-1 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
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
            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard icon={<Bed className="w-7 h-7" />} title="Total Bed Capacity" value={data.total_beds} trend={{ value: 0, isPositive: true }} color="blue" isDarkMode={isDarkMode} />
                  <MetricCard icon={<Users className="w-7 h-7" />} title="Current Occupants" value={data.current_user_count} subtitle={`${occupancyRate}% occupancy`} trend={{ value: 12, isPositive: true }} color="emerald" isDarkMode={isDarkMode} />
                  <MetricCard icon={<UserCheck className="w-7 h-7" />} title="Verified Campers" value={data.verified_user_count} subtitle={`${verificationRate}% verified`} trend={{ value: 8, isPositive: true }} color="purple" isDarkMode={isDarkMode} />
                  <MetricCard icon={<Building2 className="w-7 h-7" />} title="Available Space" value={data.remaining_space} subtitle={`${data.no_floors} floors`} trend={{ value: 5, isPositive: false }} color="amber" isDarkMode={isDarkMode} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`rounded-2xl shadow-lg p-6 border ${card}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-bold flex items-center gap-2 ${cardText}`}>
                        <PieChart className="w-5 h-5 text-emerald-500" />
                        Bed Distribution
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>Live Data</span>
                    </div>
                    <div className="h-80 relative">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className={`text-5xl font-bold ${cardText}`}>{occupancyRate}%</p>
                        <p className={`text-sm mt-1 font-medium ${subText}`}>Occupied</p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-2xl shadow-lg p-6 border ${card}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-bold flex items-center gap-2 ${cardText}`}>
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Occupancy Trend by Floor
                      </h3>
                    </div>
                    <div className="h-80">
                      <Line data={lineData} options={lineOptions} />
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl shadow-lg p-6 border ${card}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold flex items-center gap-2 ${cardText}`}>
                      <BarChart3 className="w-5 h-5 text-emerald-500" />
                      Floor Capacity Analysis
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                      {data.no_floors} Floors
                    </span>
                  </div>
                  <div className="h-96">
                    <Bar data={barData} options={barOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Floor Details Tab ── */}
            {activeTab === 'floors' && (
              <div className={`rounded-2xl shadow-lg overflow-hidden border ${card}`}>
                <div className={`p-6 border-b ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
                  <h2 className={`text-2xl font-bold flex items-center gap-3 ${cardText}`}>
                    <Building2 className="w-6 h-6 text-emerald-500" />
                    Floor-wise Breakdown
                  </h2>
                  <p className={subText}>Detailed occupancy statistics for each floor</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
                        {["Floor","Total Beds","Registered","Verified","Available","Occupancy"].map((h, i) => (
                          <th key={h} className={`px-6 py-4 text-sm font-bold uppercase tracking-wider ${i === 0 ? "text-left" : "text-center"} ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-slate-200"}`}>
                      {data.floors.map((floor, idx) => {
                        const floorOccupancy = floor.no_beds > 0
                          ? ((floor.active_users_count / floor.no_beds) * 100).toFixed(1)
                          : "0";
                        const available = floor.no_beds - floor.all_users_count;

                        return (
                          <tr
                            key={floor.floor_no}
                            className={`transition-colors ${rowHover} ${idx % 2 === 0 ? (isDarkMode ? "bg-gray-800" : "bg-white") : (isDarkMode ? "bg-gray-750 bg-opacity-50" : "bg-slate-50")}`}
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                  {idx + 1}
                                </div>
                                <span className={`font-bold text-base ${cardText}`}>{floor.floor_no}</span>
                              </div>
                            </td>
                            <td className={`px-6 py-5 text-center font-semibold text-base ${cardText}`}>{floor.no_beds}</td>
                            <td className="px-6 py-5 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${isDarkMode ? "bg-amber-900/40 text-amber-400" : "bg-amber-100 text-amber-700"}`}>{floor.all_users_count}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>{floor.active_users_count}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                                available === 0
                                  ? isDarkMode ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-700"
                                  : available < 5
                                  ? isDarkMode ? "bg-yellow-900/40 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                                  : isDarkMode ? "bg-green-900/40 text-green-400" : "bg-green-100 text-green-700"
                              }`}>{available}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-3">
                                <span className={`inline-flex px-4 py-2 rounded-lg text-base font-bold ${
                                  parseFloat(floorOccupancy) > 80
                                    ? isDarkMode ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-700"
                                    : parseFloat(floorOccupancy) > 50
                                    ? isDarkMode ? "bg-yellow-900/40 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                                    : isDarkMode ? "bg-green-900/40 text-green-400" : "bg-green-100 text-green-700"
                                }`}>
                                  {floorOccupancy}%
                                </span>
                                <div className={`w-24 rounded-full h-2 overflow-hidden ${isDarkMode ? "bg-gray-600" : "bg-slate-200"}`}>
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      parseFloat(floorOccupancy) > 80 ? "bg-red-500"
                                      : parseFloat(floorOccupancy) > 50 ? "bg-yellow-500"
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

            {/* ── Analytics Tab ── */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Summary Cards — these use gradient bg so they look fine in both modes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold opacity-90">Hall Efficiency</h3>
                      <TrendingUp className="w-6 h-6 opacity-75" />
                    </div>
                    <p className="text-4xl font-bold mb-2">{occupancyRate}%</p>
                    <p className="text-emerald-100 text-sm">Overall occupancy rate</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-90">Target: 85%</span>
                        <span className="font-semibold">{parseFloat(occupancyRate) >= 85 ? '✓ Achieved' : 'In Progress'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold opacity-90">Verification Rate</h3>
                      <UserCheck className="w-6 h-6 opacity-75" />
                    </div>
                    <p className="text-4xl font-bold mb-2">{verificationRate}%</p>
                    <p className="text-blue-100 text-sm">Campers checked in</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-90">Pending</span>
                        <span className="font-semibold">{data.current_user_count - data.verified_user_count} users</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold opacity-90">Space Utilization</h3>
                      <Building2 className="w-6 h-6 opacity-75" />
                    </div>
                    <p className="text-4xl font-bold mb-2">{data.no_floors}</p>
                    <p className="text-purple-100 text-sm">Active floors in use</p>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-90">Avg per floor</span>
                        <span className="font-semibold">{(data.verified_user_count / data.no_floors).toFixed(0)} users</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <div className={`rounded-2xl shadow-lg p-6 border ${card}`}>
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${cardText}`}>
                      <Activity className="w-5 h-5 text-emerald-500" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: "Bed Utilization", value: occupancyRate, bar: "from-emerald-500 to-teal-500" },
                        { label: "Verification Progress", value: verificationRate, bar: "from-blue-500 to-indigo-500" },
                        { label: "Space Availability", value: ((data.remaining_space / data.total_beds) * 100).toFixed(1), bar: "from-amber-500 to-orange-500" },
                      ].map(({ label, value, bar }) => (
                        <div key={label}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-medium ${subText}`}>{label}</span>
                            <span className={`font-bold ${cardText}`}>{value}%</span>
                          </div>
                          <div className={`w-full rounded-full h-3 overflow-hidden ${isDarkMode ? "bg-gray-600" : "bg-slate-200"}`}>
                            <div className={`h-full bg-linear-to-r ${bar} rounded-full transition-all`} style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-6 pt-6 border-t grid grid-cols-2 gap-4 ${divider}`}>
                      <div className={`text-center p-4 rounded-xl ${isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50"}`}>
                        <p className={`text-2xl font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>{data.verified_user_count}</p>
                        <p className={`text-xs mt-1 font-medium ${subText}`}>Verified Users</p>
                      </div>
                      <div className={`text-center p-4 rounded-xl ${isDarkMode ? "bg-amber-900/30" : "bg-amber-50"}`}>
                        <p className={`text-2xl font-bold ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>{data.current_user_count - data.verified_user_count}</p>
                        <p className={`text-xs mt-1 font-medium ${subText}`}>Pending</p>
                      </div>
                    </div>
                  </div>

                  {/* Floor Rankings */}
                  <div className={`rounded-2xl shadow-lg p-6 border ${card}`}>
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${cardText}`}>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      Floor Performance Rankings
                    </h3>
                    <div className="space-y-3">
                      {data.floors
                        .map((floor, idx) => ({
                          ...floor,
                          occupancy: floor.no_beds > 0
                            ? ((floor.active_users_count / floor.no_beds) * 100).toFixed(1)
                            : "0",
                          originalIndex: idx,
                        }))
                        .sort((a, b) => parseFloat(b.occupancy) - parseFloat(a.occupancy))
                        .map((floor, rank) => (
                          <div
                            key={floor.floor_no}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-colors border ${
                              isDarkMode
                                ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                              rank === 0 ? 'bg-linear-to-br from-yellow-400 to-yellow-600' :
                              rank === 1 ? 'bg-linear-to-br from-slate-400 to-slate-600' :
                              rank === 2 ? 'bg-linear-to-br from-orange-400 to-orange-600' :
                              'bg-linear-to-br from-emerald-500 to-teal-600'
                            }`}>
                              {rank + 1}
                            </div>
                            <div className="flex-1">
                              <p className={`font-bold ${cardText}`}>{floor.floor_no}</p>
                              <p className={`text-xs mt-0.5 ${subText}`}>{floor.active_users_count} / {floor.no_beds} beds occupied</p>
                            </div>
                            <p className={`text-2xl font-bold ${
                              parseFloat(floor.occupancy) > 80
                                ? 'text-red-500'
                                : parseFloat(floor.occupancy) > 50
                                ? 'text-amber-500'
                                : 'text-emerald-500'
                            }`}>
                              {floor.occupancy}%
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Capacity Insights */}
                <div className={`rounded-2xl shadow-lg p-6 border ${card}`}>
                  <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${cardText}`}>
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    Capacity Insights & Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: <TrendingUp className="w-5 h-5 text-white" />,
                        bg: "bg-emerald-500",
                        card: isDarkMode ? "bg-emerald-900/20 border-emerald-700" : "bg-linear-to-br from-emerald-50 to-teal-50 border-emerald-200",
                        title: "High Occupancy",
                        value: data.floors.filter(f => (f.active_users_count / f.no_beds) > 0.8).length,
                        valueColor: isDarkMode ? "text-emerald-400" : "text-emerald-700",
                        desc: "Floors above 80% capacity",
                      },
                      {
                        icon: <AlertCircle className="w-5 h-5 text-white" />,
                        bg: "bg-amber-500",
                        card: isDarkMode ? "bg-amber-900/20 border-amber-700" : "bg-linear-to-br from-amber-50 to-orange-50 border-amber-200",
                        title: "Medium Occupancy",
                        value: data.floors.filter(f => { const o = f.active_users_count / f.no_beds; return o > 0.5 && o <= 0.8; }).length,
                        valueColor: isDarkMode ? "text-amber-400" : "text-amber-700",
                        desc: "Floors at 50-80% capacity",
                      },
                      {
                        icon: <TrendingDown className="w-5 h-5 text-white" />,
                        bg: "bg-blue-500",
                        card: isDarkMode ? "bg-blue-900/20 border-blue-700" : "bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200",
                        title: "Low Occupancy",
                        value: data.floors.filter(f => (f.active_users_count / f.no_beds) <= 0.5).length,
                        valueColor: isDarkMode ? "text-blue-400" : "text-blue-700",
                        desc: "Floors below 50% capacity",
                      },
                    ].map(({ icon, bg, card: c, title, value, valueColor, desc }) => (
                      <div key={title} className={`p-5 rounded-xl border ${c}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
                          <h4 className={`font-bold ${cardText}`}>{title}</h4>
                        </div>
                        <p className={`text-3xl font-bold mb-2 ${valueColor}`}>{value}</p>
                        <p className={`text-sm ${subText}`}>{desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className={`mt-6 p-5 rounded-xl border ${isDarkMode ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"}`}>
                    <h4 className={`font-bold mb-3 flex items-center gap-2 ${cardText}`}>
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                      System Recommendations
                    </h4>
                    <ul className={`space-y-2 text-sm ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}>
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

// ── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({
  icon, title, value, subtitle, trend, color, isDarkMode,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  color: "blue" | "emerald" | "purple" | "amber";
  isDarkMode: boolean;
}) {
  const colorClasses = {
    blue:    { bg: "from-blue-500 to-indigo-600",   icon: isDarkMode ? "bg-blue-900/40 text-blue-400"    : "bg-blue-100 text-blue-700",    trend: isDarkMode ? "bg-blue-900/40 text-blue-400"    : "bg-blue-50 text-blue-700" },
    emerald: { bg: "from-emerald-500 to-teal-600",  icon: isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-700", trend: isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-700" },
    purple:  { bg: "from-purple-500 to-pink-600",   icon: isDarkMode ? "bg-purple-900/40 text-purple-400" : "bg-purple-100 text-purple-700", trend: isDarkMode ? "bg-purple-900/40 text-purple-400" : "bg-purple-50 text-purple-700" },
    amber:   { bg: "from-amber-500 to-orange-600",  icon: isDarkMode ? "bg-amber-900/40 text-amber-400"   : "bg-amber-100 text-amber-700",   trend: isDarkMode ? "bg-amber-900/40 text-amber-400"   : "bg-amber-50 text-amber-700" },
  };

  return (
    <div className={`rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden group ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
      <div className={`h-1 bg-linear-to-r ${colorClasses[color].bg}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color].icon} group-hover:scale-110 transition-transform`}>{icon}</div>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${colorClasses[color].trend}`}>
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>{title}</h3>
        <p className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-gray-100" : "text-slate-800"}`}>{value.toLocaleString()}</p>
        {subtitle && <p className={`text-sm font-medium ${isDarkMode ? "text-gray-500" : "text-slate-500"}`}>{subtitle}</p>}
      </div>
    </div>
  );
}