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
} from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

  // Initial load and when hall changes
  useEffect(() => {
    fetchData(selectedHall);
  }, [selectedHall]);

  const occupancyRate =
    data && data.total_beds > 0
      ? ((data.current_user_count / data.total_beds) * 100).toFixed(1)
      : 0;

  // Chart Data
  const doughnutData = {
    labels: ["Occupied", "Available"],
    datasets: [
      {
        data: [data?.current_user_count || 0, data?.remaining_space || 0],
        backgroundColor: ["#10b981", "#e0f2fe"],
        borderColor: ["#059669", "#0ea5e9"],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw} beds` } },
    },
    cutout: "70%",
  };

  const barData = {
    labels: data?.floors.map((f) => f.floor_no) || [],
    datasets: [
      {
        label: "Occupancy %",
        data:
          data?.floors.map((f) =>
            f.no_beds > 0 ? ((f.active_users_count / f.no_beds) * 100).toFixed(1) : 0
          ) || [],
        backgroundColor: "#10b981",
        borderColor: "#059669",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.raw}% occupied` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value: any) => `${value}%` },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Hall Selector */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-8 py-10 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-4">
                  <Building2 className="w-10 h-10" />
                  Hall Analytics Dashboard
                </h1>
                <p className="text-xl mt-2 opacity-90">
                  Real-time accommodation statistics
                </p>
              </div>

              {/* Hall Selector Dropdown */}
              <div className="relative w-full lg:w-96">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all px-6 py-4 rounded-xl text-lg font-medium"
                >
                  <span className="truncate">{selectedHall}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10">
                    {HALLS.map((hall) => (
                      <button
                        key={hall}
                        onClick={() => {
                          setSelectedHall(hall);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 text-gray-800 hover:bg-emerald-50 transition-colors ${
                          selectedHall === hall ? "bg-emerald-100 font-semibold" : ""
                        }`}
                      >
                        {hall}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchData(selectedHall, true)}
                disabled={refreshing}
                className="flex items-center gap-3 px-6 py-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 disabled:opacity-70"
              >
                <RefreshCw className={`w-6 h-6 ${refreshing ? "animate-spin" : ""}`} />
                <span className="font-medium text-lg">Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && !loading && (
            <div className="px-8 pt-4">
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()} on{" "}
                {lastUpdated.toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && !refreshing && (
            <div className="p-20 text-center">
              <div className="inline-flex items-center gap-4 text-gray-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
                <span className="text-xl font-medium">
                  Loading {selectedHall} analytics...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mx-8 mt-6 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4 text-red-700">
              <AlertCircle className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="font-semibold">Error Loading Data</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Main Analytics Content */}
          {!loading && !error && data && (
            <div className="p-8 space-y-10">
              {/* Current Hall Title */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">{data.hall_name}</h2>
                <p className="text-gray-600 mt-2">
                  {data.no_floors} Floor{data.no_floors > 1 ? "s" : ""} •{" "}
                  {data.total_beds} Total Beds
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  icon={<Bed className="w-8 h-8" />}
                  title="Total Beds"
                  value={data.total_beds}
                  color="emerald"
                />
                <MetricCard
                  icon={<Users className="w-8 h-8" />}
                  title="Current Occupants"
                  value={data.current_user_count}
                  subtitle={`${occupancyRate}% occupancy`}
                  color="blue"
                />
                <MetricCard
                  icon={<UserCheck className="w-8 h-8" />}
                  title="Verified Users"
                  value={data.verified_user_count}
                  color="purple"
                />
                <MetricCard
                  icon={<Building2 className="w-8 h-8" />}
                  title="Available Space"
                  value={data.remaining_space}
                  color="green"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 shadow-inner">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                    Overall Occupancy
                  </h3>
                  <div className="max-w-sm mx-auto">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="text-center mt-6">
                      <p className="text-5xl font-bold text-emerald-700">{occupancyRate}%</p>
                      <p className="text-lg text-gray-600 mt-2">Currently Occupied</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 shadow-inner">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                    Occupancy by Floor
                  </h3>
                  <div className="h-80">
                    <Bar data={barData} options={barOptions} />
                  </div>
                </div>
              </div>

              {/* Floor Table */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                  Floor-wise Breakdown
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-gray-600 text-sm uppercase tracking-wider">
                        <th className="pb-4">Floor</th>
                        <th className="pb-4 text-center">Total Beds</th>
                        <th className="pb-4 text-center">Registered</th>
                        <th className="pb-4 text-center">Active Users</th>
                        <th className="pb-4 text-center">Occupancy Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.floors.map((floor) => {
                        const floorOccupancy =
                          floor.no_beds > 0
                            ? ((floor.active_users_count / floor.no_beds) * 100).toFixed(1)
                            : "0";
                        return (
                          <tr
                            key={floor.floor_no}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all"
                          >
                            <td className="px-8 py-6 rounded-l-xl font-semibold text-gray-900">
                              {floor.floor_no}
                            </td>
                            <td className="px-8 py-6 text-center text-gray-700">
                              {floor.no_beds}
                            </td>
                            <td className="px-8 py-6 text-center text-gray-700">
                              {floor.all_users_count}
                            </td>
                            <td className="px-8 py-6 text-center font-bold text-emerald-700">
                              {floor.active_users_count}
                            </td>
                            <td className="px-8 py-6 rounded-r-xl text-center">
                              <span
                                className={`inline-flex px-5 py-2 rounded-full text-base font-bold ${
                                  parseFloat(floorOccupancy) > 70
                                    ? "bg-red-100 text-red-800"
                                    : parseFloat(floorOccupancy) > 40
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {floorOccupancy}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
  color: "emerald" | "blue" | "purple" | "green";
}) {
  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>{icon}</div>
      </div>
      <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      <p className="text-4xl font-bold text-gray-900 mt-3">{value}</p>
      {subtitle && <p className="text-base text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}