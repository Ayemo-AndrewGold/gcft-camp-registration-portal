"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Edit2, Trash2, User, Phone, Home, Layers, CheckCircle, XCircle, RefreshCw, Calendar } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";
const BATCH_SIZE = 50;

// ── Module-level cache — survives navigation, cleared only on manual refresh ──
let _cachedUsers: UserData[] | null = null;
let _isFetchingInBackground = false;

interface UserData {
  id?: number;
  first_name?: string;
  phone_number: string;
  category?: string;
  category_id?: number | null;
  hall_name?: string;
  floor?: number | string;
  bed_number?: number;
  gender?: string;
  age?: number;
  marital_status?: string;
  country?: string;
  state?: string;
  local_assembly?: string;
  is_active?: boolean;
  arrival_date?: string;
}

const AllCampers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editData, setEditData] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [deletingUsers, setDeletingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(!_cachedUsers);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getValue = (u: UserData, ...keys: string[]): string => {
    for (let k of keys) {
      const value = u[k as keyof UserData];
      if (value !== undefined && value !== null && value !== "") {
        let stringValue = String(value);
        if (k === 'floor' && stringValue.startsWith('Floor ')) {
          stringValue = stringValue.replace('Floor ', '');
        }
        return stringValue;
      }
    }
    return "—";
  };

  const formatArrivalDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUsers = async (showRefreshing = false) => {
    // ✅ If cached and not a manual refresh — show instantly, no loading at all
    if (_cachedUsers && !showRefreshing) {
      setUsers(_cachedUsers);
      setFilteredUsers(_cachedUsers);
      setLoading(false);
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
      _cachedUsers = null; // clear cache on manual refresh
    } else {
      setLoading(true);
    }

    try {
      const [firstBatch, activeUsersRes] = await Promise.all([
        fetch(`${API_BASE}/users?skip=0&limit=${BATCH_SIZE}`, { headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`${API_BASE}/active-users`, { headers: { 'Cache-Control': 'no-cache' } }),
      ]);

      if (!firstBatch.ok) throw new Error(`HTTP error! status: ${firstBatch.status}`);

      const firstData: UserData[] = await firstBatch.json();
      const activeUsers = activeUsersRes.ok ? await activeUsersRes.json() : [];
      const activePhones = new Set(activeUsers.map((u: any) => u.phone_number));

      const withStatus = (batch: any[]) =>
        batch.map(u => ({ ...u, is_active: activePhones.has(u.phone_number) }));

      // Show first batch immediately
      const initial = withStatus(firstData);
      _cachedUsers = initial;
      setUsers(initial);
      setFilteredUsers(initial);
      setLoading(false);
      setRefreshing(false);

      if (firstData.length < BATCH_SIZE) return;

      // 🔄 Stream the rest in the background
      if (_isFetchingInBackground) return; // prevent duplicate background fetches
      _isFetchingInBackground = true;
      setLoadingMore(true);
      let skip = BATCH_SIZE;
      let allRaw = [...firstData];

      while (true) {
        setFetchProgress(`Loading more... ${allRaw.length} users so far`);
        const res = await fetch(`${API_BASE}/users?skip=${skip}&limit=${BATCH_SIZE}`, { headers: { 'Cache-Control': 'no-cache' } });
        if (!res.ok) break;
        const batch: UserData[] = await res.json();
        if (!Array.isArray(batch) || batch.length === 0) break;
        allRaw = [...allRaw, ...batch];
        const updated = withStatus(allRaw);
        _cachedUsers = updated; // keep cache up to date as batches arrive
        setUsers(updated);
        setFilteredUsers(prev => searchTerm ? prev : updated);
        if (batch.length < BATCH_SIZE) break;
        skip += BATCH_SIZE;
      }
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      showToast("Failed to fetch users.", 'error');
      setLoading(false);
      setRefreshing(false);
    } finally {
      _isFetchingInBackground = false;
      setLoadingMore(false);
      setFetchProgress("");
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const verifiedCount = users.filter(u => u.is_active === true).length;
  const notVerifiedCount = users.filter(u => !u.is_active).length;

  const handleUserClick = (user: UserData) => {
    setSelectedUser(user);
    setEditData({ ...user });
  };

  const handleChange = (field: keyof UserData, value: string | number) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!selectedUser || !editData) return;
    try {
      const res = await fetch(`${API_BASE}/user/${selectedUser.phone_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      showToast("✅ User updated successfully!", 'success');
      const updatedUser = { ...editData };
      setUsers(prev => prev.map(u => u.phone_number === selectedUser.phone_number ? updatedUser : u));
      setFilteredUsers(prev => prev.map(u => u.phone_number === selectedUser.phone_number ? updatedUser : u));
      setSelectedUser(null);
      setEditData(null);
    } catch (err: any) {
      console.error("Update error:", err.message);
      showToast("❌ Failed to update user.", 'error');
    }
  };

  const handleDeleteCategory = async (user: UserData) => {
    if (!user.category_id) {
      showToast("This user has no category to delete.", 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the category "${user.category}" for ${user.first_name || user.phone_number}?`)) return;

    setDeletingUsers(prev => [...prev, user.phone_number]);
    try {
      const response = await fetch(`${API_BASE}/category/${user.category_id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      showToast("✅ Category deleted successfully!", 'success');
      const updatedUser = { ...user, category: undefined, category_id: null };
      setUsers(prev => prev.map(u => u.phone_number === user.phone_number ? updatedUser : u));
      setFilteredUsers(prev => prev.map(u => u.phone_number === user.phone_number ? updatedUser : u));
    } catch (err: any) {
      if (err.message.includes('404')) {
        showToast("❌ Category not found. It may have already been deleted.", 'error');
      } else if (err.message.includes('403')) {
        showToast("❌ You don't have permission to delete this category.", 'error');
      } else if (err.message.includes('500')) {
        showToast("❌ Server error. Please try again later.", 'error');
      } else {
        showToast(`❌ Failed to delete category: ${err.message}`, 'error');
      }
    } finally {
      setDeletingUsers(prev => prev.filter(id => id !== user.phone_number));
    }
  };

  if (loading) {
    return (
      <div className="bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading users...</p>
            {fetchProgress && (
              <p className="text-green-600 text-sm mt-2 font-medium">{fetchProgress}</p>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full rounded-lg shadow-md">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <section className="bg-white min-h-screen rounded-lg shadow-md p-2 sm:p-3 lg:p-3">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[1.8rem] sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Registered Campers
              </h1>
              <p className="text-gray-600">All registered users for Easter Camp Meeting 2026</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => fetchUsers(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? `${fetchProgress || 'Refreshing...'}` : 'Refresh'}
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-green-600">{users.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-green-700">{verifiedCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Not Verified</p>
                <p className="text-2xl font-bold text-orange-600">{notVerifiedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, category, hall..."
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
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600 flex items-center gap-3">
          <span>Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users</span>
          {loadingMore && (
            <span className="flex items-center gap-2 text-green-600 font-medium">
              <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              {fetchProgress || "Loading more..."}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">Arrival Date</th>
                <th className="p-4 text-left font-semibold">Category</th>
                <th className="p-4 text-left font-semibold">Hall</th>
                <th className="p-4 text-left font-semibold">Floor</th>
                <th className="p-4 text-left font-semibold">Bed</th>
                <th className="p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, idx) => (
                  <tr
                    key={user.phone_number || user.id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition-colors border-b border-gray-200`}
                  >
                    <td className="p-4">
                      {user.is_active ? (
                        <span className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                          <XCircle className="w-4 h-4" /> Not Verified
                        </span>
                      )}
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
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{formatArrivalDate(user.arrival_date)}</span>
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
                    <td className="p-4 text-gray-700">{getValue(user, "bed_number")}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUserClick(user)}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-sm"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(user)}
                          disabled={deletingUsers.includes(user.phone_number) || !user.category_id}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!user.category_id ? "No category to delete" : "Delete Category"}
                        >
                          {deletingUsers.includes(user.phone_number) ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <User className="w-16 h-16 mb-4" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
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
            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Next
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        {selectedUser && editData && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Edit User</h2>
                    <p className="text-green-100 text-sm mt-1">Update user information</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/20 rounded-lg transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name",    field: "first_name",  placeholder: "Enter full name" },
                    { label: "Phone Number", field: "phone_number", placeholder: "Enter phone number" },
                    { label: "Category",     field: "category",    placeholder: "Enter category" },
                    { label: "Hall Name",    field: "hall_name",   placeholder: "Enter hall name" },
                    { label: "Floor",        field: "floor",       placeholder: "Enter floor number" },
                    { label: "Bed Number",   field: "bed_number",  placeholder: "Enter bed number" },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                      <input
                        type="text"
                        value={(editData[field as keyof UserData] as string) || ""}
                        onChange={(e) => handleChange(field as keyof UserData, e.target.value)}
                        className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AllCampers;