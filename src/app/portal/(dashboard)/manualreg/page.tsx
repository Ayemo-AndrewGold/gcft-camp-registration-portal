"use client";

import React, { useState, useEffect } from "react";
import { Search, UserX, UserPlus, Bed, Home, AlertCircle, CheckCircle, XCircle, RefreshCw, Calendar, Clock, Link as LinkIcon } from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface UserData {
  id?: number;
  first_name?: string;
  phone_number: string;
  category?: string;
  category_id?: number | null;
  hall_name?: string;
  floor?: number | string;
  bed_number?: number | string;
  gender?: string;
  is_active?: boolean;
  arrival_date?: string;
}

interface NewUserRegistration {
  phone_number: string;
  first_name: string;
  category: string;
  age_range: string;
  marital_status: string;
  no_children: number;
  names_children: string;
  country: string;
  state: string;
  arrival_date: string;
  medical_issues: string;
  local_assembly: string;
  local_assembly_address: string;
  gender: string;
}

const ManualPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [reallocateMode, setReallocateMode] = useState<'release' | 'assign' | 'reassign' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // New allocation data
  const [newHall, setNewHall] = useState<string>("");
  const [newFloor, setNewFloor] = useState<string>("");
  const [newBed, setNewBed] = useState<string>("");

  // New user registration data
  const [newUserPhone, setNewUserPhone] = useState<string>("");
  const [newUserData, setNewUserData] = useState<Partial<NewUserRegistration>>({});
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  const countriesList = [
    { value: "Nigeria", label: "Nigeria" },
    { value: "Ghana", label: "Ghana" },
    { value: "USA", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
  ];

  const countryStates: Record<string, string[]> = {
    Nigeria: [
      "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
      "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
      "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
      "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
      "Yobe","Zamfara"
    ],
    USA: ["California","Texas","New York","Florida"],
    Canada: ["Ontario","Quebec","British Columbia","Alberta"],
    Ghana: ["Greater Accra","Ashanti","Central","Eastern"],
    UK: ["England","Scotland","Wales","Northern Ireland"],
  };
  const [registrationStep, setRegistrationStep] = useState<'phone' | 'details' | 'confirm'>('phone');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Unexpected response format");

      const activeUsersRes = await fetch(`${API_BASE}/active-users`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const activeUsers = activeUsersRes.ok ? await activeUsersRes.json() : [];
      const activePhones = new Set(activeUsers.map((u: any) => u.phone_number));

      const unverifiedUsers = data
        .filter((user: any) => !activePhones.has(user.phone_number))
        .map((user: any) => ({
          ...user,
          is_active: false
        }));

      setUsers(unverifiedUsers);
      setFilteredUsers(unverifiedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      showToast("Failed to fetch users.", 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter((u) =>
      Object.values(u).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleReleaseBed = async (user: UserData) => {
    if (!user.category_id) {
      showToast("This user has no allocation to release.", 'error');
      return;
    }

    if (!window.confirm(
      `Release bedspace for ${user.first_name || user.phone_number}?\n\n` +
      `Hall: ${user.hall_name}\nFloor: ${user.floor}\nBed: ${user.bed_number}\n\n` +
      `This will free up the bed for manual reallocation.`
    )) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/category/${user.category_id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error(`Failed to release bed: ${response.status}`);
      
      showToast(`✅ Bedspace released for ${user.first_name}!`, 'success');
      
      setUsers((prev) =>
        prev.map((u) =>
          u.phone_number === user.phone_number 
            ? { ...u, hall_name: undefined, floor: undefined, bed_number: undefined, category_id: null }
            : u
        )
      );
      
      setFilteredUsers((prev) =>
        prev.map((u) =>
          u.phone_number === user.phone_number 
            ? { ...u, hall_name: undefined, floor: undefined, bed_number: undefined, category_id: null }
            : u
        )
      );
    } catch (err: any) {
      showToast(`❌ Failed to release bed: ${err.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReassignToNewUser = (user: UserData) => {
    if (!user.hall_name || !user.floor || !user.bed_number) {
      showToast("This user has no bed allocation to reassign.", 'error');
      return;
    }
    setSelectedUser(user);
    setReallocateMode('reassign');
    setRegistrationStep('phone');
    setNewUserPhone("");
    setNewUserData({});
  };

  const handleRegisterPhoneNumber = async () => {
    if (!newUserPhone || newUserPhone.length < 10) {
      showToast("Please enter a valid phone number", 'error');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/register-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: newUserPhone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Phone number registration failed');
      }

      showToast('✅ Phone number verified! Enter user details.', 'success');
      setRegistrationStep('details');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteReassignment = async () => {
    if (!selectedUser || !newUserData.first_name || !newUserData.gender) {
      showToast("Please fill in all required fields", 'error');
      return;
    }

    setProcessing(true);
    try {
      // Register new user with old user's bed allocation
      const registrationPayload = {
        ...newUserData,
        phone_number: newUserPhone,
        hall_name: selectedUser.hall_name,
        floor: selectedUser.floor,
        bed_number: selectedUser.bed_number,
      };

      const response = await fetch(`${API_BASE}/register-user/${newUserPhone}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'User registration failed');
      }

      // Delete old user's category to release the bed from them
      if (selectedUser.category_id) {
        await fetch(`${API_BASE}/category/${selectedUser.category_id}`, {
          method: 'DELETE',
        });
      }

      showToast(`✅ Bed reassigned to ${newUserData.first_name}!`, 'success');
      
      // Refresh users list
      await fetchUsers(true);
      
      // Close modal
      setSelectedUser(null);
      setReallocateMode(null);
      setNewUserPhone("");
      setNewUserData({});
      setRegistrationStep('phone');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignBed = (user: UserData) => {
    setSelectedUser(user);
    setReallocateMode('assign');
    setNewHall(user.hall_name || "");
    setNewFloor(user.floor?.toString() || "");
    setNewBed(user.bed_number?.toString() || "");
  };

  const handleSaveAllocation = async () => {
    if (!selectedUser || !newHall || !newFloor || !newBed) {
      showToast("Please fill in all fields (Hall, Floor, Bed)", 'error');
      return;
    }

    setProcessing(true);
    try {
      const updateData = {
        ...selectedUser,
        hall_name: newHall,
        floor: newFloor,
        bed_number: newBed,
      };

      const res = await fetch(`${API_BASE}/user/${selectedUser.phone_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      showToast(`✅ Bed allocated to ${selectedUser.first_name}!`, 'success');

      setUsers((prev) =>
        prev.map((u) =>
          u.phone_number === selectedUser.phone_number ? updateData : u
        )
      );
      
      setFilteredUsers((prev) =>
        prev.map((u) =>
          u.phone_number === selectedUser.phone_number ? updateData : u
        )
      );

      setSelectedUser(null);
      setReallocateMode(null);
    } catch (err: any) {
      showToast(`❌ Failed to allocate bed: ${err.message}`, 'error');
    } finally {
      setProcessing(false);
    }
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

  const isArrivalDatePassed = (dateString?: string) => {
    if (!dateString) return false;
    try {
      const arrivalDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return arrivalDate < today;
    } catch {
      return false;
    }
  };

  const allocatedUsers = users.filter(u => u.hall_name && u.bed_number);
  const unallocatedUsers = users.filter(u => !u.hall_name || !u.bed_number);
  const overdueUsers = users.filter(u => isArrivalDatePassed(u.arrival_date));

  if (loading) {
    return (
      <div className="bg-gradient-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
        <section className="bg-white min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading unverified users...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-2 p-1 sm:p-3 rounded-lg shadow-md">
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             toast.type === 'error' ? <XCircle className="w-5 h-5" /> :
             <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <section className="bg-white min-h-screen rounded-lg shadow-md p-2 lg:p-3">
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Manual Bed Reallocation
              </h1>
              <p className="text-gray-600">
                Manage unverified registrations and reassign bedspaces
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchUsers(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Unverified</p>
                <p className="text-2xl font-bold text-orange-600">{users.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Allocated</p>
                <p className="text-2xl font-bold text-green-600">{allocatedUsers.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Reallocation Workflow</h4>
              <p className="text-xs text-blue-700">
                <strong>🔗 Reassign to Walk-In:</strong> Register a new user and automatically transfer bed allocation • 
                <strong>🗑️ Release Bed:</strong> Free up bedspace without immediate reassignment • 
                <strong>✏️ Assign Bed:</strong> Manually update bed details for existing user
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, hall..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border-2 border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Phone</th>
                <th className="p-4 text-left font-semibold">Arrival Date</th>
                <th className="p-4 text-left font-semibold">Hall</th>
                <th className="p-4 text-left font-semibold">Floor</th>
                <th className="p-4 text-left font-semibold">Bed</th>
                <th className="p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <tr 
                    key={user.phone_number || user.id} 
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-green-50 transition-colors border-b border-gray-200 ${
                      isArrivalDatePassed(user.arrival_date) ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                        <XCircle className="w-4 h-4" />
                        Not Verified
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{user.first_name || "N/A"}</p>
                      <p className="text-xs text-gray-500">{user.gender || "N/A"}</p>
                    </td>
                    <td className="p-4 text-gray-700">{user.phone_number}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isArrivalDatePassed(user.arrival_date) ? (
                          <Clock className="w-4 h-4 text-red-500" />
                        ) : (
                          <Calendar className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${
                          isArrivalDatePassed(user.arrival_date) 
                            ? 'text-red-600 font-semibold' 
                            : 'text-gray-700'
                        }`}>
                          {formatArrivalDate(user.arrival_date)}
                        </span>
                      </div>
                      {isArrivalDatePassed(user.arrival_date) && (
                        <p className="text-xs text-red-500 mt-1">⚠ Overdue</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${user.hall_name ? 'text-gray-800' : 'text-gray-400'}`}>
                        {user.hall_name || "Not Allocated"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${user.floor ? 'text-gray-800' : 'text-gray-400'}`}>
                        {user.floor || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${user.bed_number ? 'text-gray-800' : 'text-gray-400'}`}>
                        {user.bed_number || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {user.hall_name && user.bed_number ? (
                          <>
                            <button
                              onClick={() => handleReassignToNewUser(user)}
                              disabled={processing}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-sm disabled:opacity-50"
                              title="Reassign to Walk-In"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReleaseBed(user)}
                              disabled={processing}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-sm disabled:opacity-50"
                              title="Release Bed Only"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </>
                        ) : null}
                        <button
                          onClick={() => handleAssignBed(user)}
                          disabled={processing}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-sm disabled:opacity-50"
                          title="Assign/Update Bed"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CheckCircle className="w-16 h-16 mb-4 text-green-400" />
                      <p className="text-lg font-medium">All users verified! 🎉</p>
                      <p className="text-sm">No unverified registrations at this time</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Reassignment Modal */}
        {selectedUser && reallocateMode === 'reassign' && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Reassign Bed to Walk-In</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Transferring: {selectedUser.hall_name} | Floor {selectedUser.floor} | Bed {selectedUser.bed_number}
                    </p>
                    <p className="text-blue-100 text-xs mt-1">
                      From: {selectedUser.first_name || selectedUser.phone_number}
                    </p>
                  </div>
                  <button 
                    onClick={() => { 
                      setSelectedUser(null); 
                      setReallocateMode(null);
                      setNewUserPhone("");
                      setNewUserData({});
                      setRegistrationStep('phone');
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Phone Number */}
                {registrationStep === 'phone' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Step 1:</strong> Enter walk-in camper's phone number to start registration
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., +2348012345678"
                      />
                    </div>
                    <button
                      onClick={handleRegisterPhoneNumber}
                      disabled={processing || !newUserPhone}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg disabled:opacity-50"
                    >
                      {processing ? "Verifying..." : "Verify Phone Number →"}
                    </button>
                  </div>
                )}

                {/* Step 2: User Details */}
                {registrationStep === 'details' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
                      <p className="text-sm text-green-800">
                        <strong>Step 2:</strong> Fill in camper details (Phone: {newUserPhone})
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={newUserData.first_name || ""}
                          onChange={(e) => setNewUserData({...newUserData, first_name: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="John"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          value={newUserData.gender || ""}
                          onChange={(e) => setNewUserData({...newUserData, gender: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <input
                          type="text"
                          value={newUserData.category || ""}
                          onChange={(e) => setNewUserData({...newUserData, category: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., Adult, Youth"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age Range
                        </label>
                        <select
                          value={newUserData.age_range || ""}
                          onChange={(e) => setNewUserData({...newUserData, age_range: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Age Range</option>
                          <option value="10-17">10-17</option>
                          <option value="18-25">18-25</option>
                          <option value="26-35">26-35</option>
                          <option value="36-50">36-50</option>
                          <option value="51+">51+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marital Status
                        </label>
                        <select
                          value={newUserData.marital_status || ""}
                          onChange={(e) => setNewUserData({...newUserData, marital_status: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={newUserData.country || ""}
                          onChange={(e) => setNewUserData({...newUserData, country: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Nigeria"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={newUserData.state || ""}
                          onChange={(e) => setNewUserData({...newUserData, state: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Lagos"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arrival Date *
                        </label>
                        <input
                          type="date"
                          value={newUserData.arrival_date || ""}
                          onChange={(e) => setNewUserData({...newUserData, arrival_date: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Local Assembly
                        </label>
                        <input
                          type="text"
                          value={newUserData.local_assembly || ""}
                          onChange={(e) => setNewUserData({...newUserData, local_assembly: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Your local assembly"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical Issues (Optional)
                        </label>
                        <textarea
                          value={newUserData.medical_issues || ""}
                          onChange={(e) => setNewUserData({...newUserData, medical_issues: e.target.value})}
                          className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
                          rows={2}
                          placeholder="Any medical conditions..."
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">📍 Assigned Bed (Auto-filled)</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Hall</p>
                          <p className="font-semibold text-gray-800">{selectedUser.hall_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Floor</p>
                          <p className="font-semibold text-gray-800">{selectedUser.floor}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Bed</p>
                          <p className="font-semibold text-gray-800">{selectedUser.bed_number}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setRegistrationStep('phone')}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all font-medium"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleCompleteReassignment}
                        disabled={processing || !newUserData.first_name || !newUserData.gender}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-lg disabled:opacity-50"
                      >
                        {processing ? "Registering & Reassigning..." : "Complete Reassignment ✓"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {selectedUser && reallocateMode === 'assign' && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Assign Bedspace</h2>
                    <p className="text-green-100 text-sm mt-1">{selectedUser.first_name || selectedUser.phone_number}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedUser(null); setReallocateMode(null); }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hall Name *
                  </label>
                  <input
                    type="text"
                    value={newHall}
                    onChange={(e) => setNewHall(e.target.value)}
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., William Braham Hall"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor *
                  </label>
                  <input
                    type="text"
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 1, 2, 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bed Number *
                  </label>
                  <input
                    type="text"
                    value={newBed}
                    onChange={(e) => setNewBed(e.target.value)}
                    className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 12a, 15b"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => { setSelectedUser(null); setReallocateMode(null); }}
                  className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAllocation}
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-lg disabled:opacity-50"
                >
                  {processing ? "Assigning..." : "Assign Bed"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManualPage;