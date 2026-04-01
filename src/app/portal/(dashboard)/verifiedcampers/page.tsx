"use client";

import React, { useState, useEffect } from "react";
import { Search, CheckCircle, User, Phone, Home, Layers, RefreshCw } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";
const BATCH_SIZE = 50;

let _cachedVerified: UserData[] | null = null;
let _isFetchingVerified = false;

interface UserData {
  id?: number;
  first_name?: string;
  phone_number: string;
  category?: string;
  hall_name?: string;
  floor?: number | string;
  bed_number?: number;
  gender?: string;
  country?: string;
  state?: string;
  local_assembly?: string;
  arrival_date?: string;
  is_active?: boolean;
}

const VerifiedCampers: React.FC = () => {
  const [users, setUsers]               = useState<UserData[]>(_cachedVerified || []);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>(_cachedVerified || []);
  const [searchTerm, setSearchTerm]     = useState<string>("");
  const [currentPage, setCurrentPage]   = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [loading, setLoading]           = useState<boolean>(!_cachedVerified);
  const [refreshing, setRefreshing]     = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<string>("");
  const [loadingMore, setLoadingMore]   = useState(false);
  const [isDarkMode, setIsDarkMode]     = useState(false);

  // Dark mode listener
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isDarkMode: boolean }>;
      setIsDarkMode(customEvent.detail.isDarkMode);
    };
    window.addEventListener('themeToggle', handleThemeChange);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') setIsDarkMode(true);
    }
    return () => window.removeEventListener('themeToggle', handleThemeChange);
  }, []);

  const fetchVerifiedUsers = async (showRefreshing = false) => {
    if (_cachedVerified && !showRefreshing) {
      setUsers(_cachedVerified);
      setFilteredUsers(_cachedVerified);
      setLoading(false);
      return;
    }
    if (showRefreshing) {
      setRefreshing(true);
      _cachedVerified = null;
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`${API_BASE}/active-users?skip=0&limit=${BATCH_SIZE}`, { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const firstData: UserData[] = await res.json();
      _cachedVerified = firstData;
      setUsers(firstData);
      setFilteredUsers(firstData);
      setCurrentPage(1);
      setLoading(false);
      setRefreshing(false);

      if (firstData.length < BATCH_SIZE) return;
      if (_isFetchingVerified) return;
      _isFetchingVerified = true;
      setLoadingMore(true);
      let skip = BATCH_SIZE;
      let all = [...firstData];

      while (true) {
        setFetchProgress(`Loading more... ${all.length} users so far`);
        const r = await fetch(`${API_BASE}/active-users?skip=${skip}&limit=${BATCH_SIZE}`, { headers: { "Cache-Control": "no-cache" } });
        if (!r.ok) break;
        const batch: UserData[] = await r.json();
        if (!Array.isArray(batch) || batch.length === 0) break;
        all = [...all, ...batch];
        _cachedVerified = all;
        setUsers(all);
        setFilteredUsers(prev => searchTerm ? prev : all);
        if (batch.length < BATCH_SIZE) break;
        skip += BATCH_SIZE;
      }
    } catch (err: any) {
      console.error("Error fetching verified users:", err.message);
      setLoading(false);
      setRefreshing(false);
    } finally {
      _isFetchingVerified = false;
      setLoadingMore(false);
      setFetchProgress("");
    }
  };

  const getValue = (u: UserData, ...keys: string[]): string => {
    for (let k of keys) {
      const value = u[k as keyof UserData];
      if (value !== undefined && value !== null && value !== "") {
        let stringValue = String(value);
        if (k === "floor" && stringValue.startsWith("Floor ")) {
          stringValue = stringValue.replace("Floor ", "");
        }
        return stringValue;
      }
    }
    return "—";
  };

  useEffect(() => { fetchVerifiedUsers(); }, []);

  useEffect(() => {
    const results = users.filter((u) =>
      Object.values(u).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(results);
    setCurrentPage(1);
  }, [searchTerm, users]);

  const indexOfLast  = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages   = Math.ceil(filteredUsers.length / entriesPerPage);

  // ── Loading screen ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`font-[lexend] w-full mt-4 p-3 rounded-lg shadow-md transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-t from-green-100 via-white to-green-200'
      }`}>
        <section className={`min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading verified campers...
            </p>
            {fetchProgress && (
              <p className="text-green-500 text-sm mt-2 font-medium">{fetchProgress}</p>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`font-[lexend] w-full rounded-lg shadow-md transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-linear-to-t from-green-100 via-white to-green-200'
    }`}>
      <section className={`min-h-screen rounded-lg shadow-md p-6 lg:p-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>

        {/* Header */}
        <div className={`mb-8 pb-6 border-b-2 ${isDarkMode ? 'border-green-700' : 'border-green-500'}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className={`text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                <CheckCircle className="w-10 h-10 text-green-500" />
                Verified Campers
              </h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                All activated and verified users for Easter Camp Meeting 2026
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchVerifiedUsers(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? (fetchProgress || "Refreshing...") : "Refresh"}
              </button>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Verified Users</p>
                <p className="text-2xl font-bold text-green-500">{users.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & entries per page */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search verified campers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Show:</label>
            <select
              value={entriesPerPage}
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className={`border-2 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Results info */}
        <div className={`mb-4 text-sm flex items-center gap-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <span>
            Showing {filteredUsers.length === 0 ? 0 : indexOfFirst + 1} to{' '}
            {Math.min(indexOfLast, filteredUsers.length)} of {filteredUsers.length} verified users
          </span>
          {loadingMore && (
            <span className="flex items-center gap-2 text-green-500 font-medium">
              <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              {fetchProgress || "Loading more..."}
            </span>
          )}
        </div>

        {/* Table */}
        <div className={`overflow-x-auto rounded-lg border-2 shadow-sm ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">Category</th>
                <th className="p-4 text-left font-semibold">Hall</th>
                <th className="p-4 text-left font-semibold">Floor</th>
                <th className="p-4 text-left font-semibold">Bed</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, idx) => (
                  <tr
                    key={user.phone_number || user.id}
                    className={`transition-colors border-b ${
                      isDarkMode
                        ? `${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} hover:bg-gray-700 border-gray-700`
                        : `${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 border-gray-200`
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-700' : 'bg-green-100'
                        }`}>
                          <User className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            {getValue(user, "first_name")}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getValue(user, "gender")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Phone className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        {getValue(user, "phone_number")}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-800'
                      }`}>
                        {getValue(user, "category")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Home className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        {getValue(user, "hall_name")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Layers className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        {getValue(user, "floor")}
                      </div>
                    </td>
                    <td className={`p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {getValue(user, "bed_number")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-8">
                    <div className={`flex flex-col items-center justify-center ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <CheckCircle className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-green-700' : 'text-green-300'}`} />
                      <p className="text-lg font-medium">No verified campers found</p>
                      <p className="text-sm">Users need to be activated first</p>
                      <button
                        onClick={() => fetchVerifiedUsers(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" /> Refresh List
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages || 1}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Next
            </button>
          </div>
        </div>

      </section>
    </div>
  );
};

export default VerifiedCampers;