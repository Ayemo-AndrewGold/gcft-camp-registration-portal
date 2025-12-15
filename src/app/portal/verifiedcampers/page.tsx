"use client";

import React, { useState, useEffect } from "react";
import { Search, CheckCircle, User, Phone, Home, Layers, RefreshCw } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

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
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const getValue = (u: UserData, ...keys: string[]): string => {
    for (let k of keys) {
      const value = u[k as keyof UserData];
      if (value !== undefined && value !== null && value !== "") {
        let stringValue = String(value);
        
        // Special handling for floor field - remove "Floor " prefix if present
        if (k === 'floor' && stringValue.startsWith('Floor ')) {
          stringValue = stringValue.replace('Floor ', '');
        }
        
        return stringValue;
      }
    }
    return "—";
  };

  // Fetch only activated/verified users
  const fetchVerifiedUsers = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Use the dedicated active-users endpoint
      const res = await fetch(`${API_BASE}/active-users`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format");
      }

      console.log("=== VERIFIED CAMPERS DEBUG ===");
      console.log("Total verified users fetched:", data.length);
      console.log("Verified users:", data.map((u: any) => `${u.first_name} (${u.phone_number})`));
      console.log("=== END DEBUG ===");
      
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      console.error("Error fetching verified users:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVerifiedUsers();
  }, []);

  // Search filter
  useEffect(() => {
    const results = users.filter((u) =>
      Object.values(u).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(results);
    setCurrentPage(1);
  }, [searchTerm, users]);

  // Pagination
  const indexOfLastUser = currentPage * entriesPerPage;
  const indexOfFirstUser = indexOfLastUser - entriesPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

  const handleRefresh = () => {
    fetchVerifiedUsers(true);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading verified campers...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
      <section className="bg-white min-h-screen rounded-lg shadow-md p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <CheckCircle className="w-10 h-10 text-green-600" />
                Verified Campers
              </h1>
              <p className="text-gray-600">
                All activated and verified users for Easter Camp Meeting 2026
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh verified users list"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Verified Users</p>
                <p className="text-2xl font-bold text-green-600">{users.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search verified campers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} verified users
        </div>

        {/* User Table */}
        <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">Category</th>
                <th className="p-4 text-left font-semibold">Hall</th>
                <th className="p-4 text-left font-semibold">Floor</th>
                <th className="p-4 text-left font-semibold">Bed</th>
                {/* <th className="p-4 text-left font-semibold">Assembly</th> */}
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, idx) => (
                  <tr 
                    key={user.phone_number || user.id} 
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-green-50 transition-colors border-b border-gray-200`}
                  >
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{getValue(user, "first_name")}</p>
                          <p className="text-xs text-gray-500">{getValue(user, "gender")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {getValue(user, "phone_number")}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {getValue(user, "category")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Home className="w-4 h-4 text-gray-400" />
                        {getValue(user, "hall_name")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Layers className="w-4 h-4 text-gray-400" />
                        {getValue(user, "floor")}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700 font-semibold">
                      {getValue(user, "bed_number")}
                    </td>
                    {/* <td className="p-4 text-gray-700 text-sm">
                      {getValue(user, "local_assembly")}
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CheckCircle className="w-16 h-16 mb-4" />
                      <p className="text-lg font-medium">No verified campers found</p>
                      <p className="text-sm">Users need to be activated first</p>
                      <button
                        onClick={handleRefresh}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh List
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
          <p className="text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages || 1}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
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