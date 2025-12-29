"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, AlertCircle, CheckCircle, XCircle, RefreshCw, Calendar, Clock, Link as LinkIcon, Upload, X, Camera } from "lucide-react";
import Webcam from "react-webcam";

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
  no_children?: number;
  names_children?: string;
  country: string;
  state: string;
  arrival_date: string;
  medical_issues?: string;
  local_assembly: string;
  local_assembly_address: string;
  gender: string;
}

const ManualPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [reallocateMode, setReallocateMode] = useState<'reassign' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [newUserPhone, setNewUserPhone] = useState<string>("");
  const [newUserData, setNewUserData] = useState<Partial<NewUserRegistration>>({});
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  const countriesList = [
      { value: "Nigeria", label: "Nigeria" },
      { value: "Ghana", label: "Ghana" },
      { value: "South Africa", label: "South Africa" },
      { value: "Kenya", label: "Kenya" },
      { value: "USA", label: "United States" },
      { value: "UK", label: "United Kingdom" },
      { value: "Canada", label: "Canada" },
      { value: "India", label: "India" },
      { value: "Australia", label: "Australia" },
      { value: "Germany", label: "Germany" },
      { value: "France", label: "France" },
      { value: "Italy", label: "Italy" },
      { value: "Spain", label: "Spain" },
      { value: "Brazil", label: "Brazil" },
      { value: "Mexico", label: "Mexico" },
      { value: "China", label: "China" },
      { value: "Japan", label: "Japan" },
      { value: "South Korea", label: "South Korea" },
      { value: "Singapore", label: "Singapore" },
      { value: "United Arab Emirates", label: "United Arab Emirates" },
      { value: "Saudi Arabia", label: "Saudi Arabia" },
      { value: "Egypt", label: "Egypt" },
      { value: "Morocco", label: "Morocco" },
      { value: "Algeria", label: "Algeria" },
      { value: "Tunisia", label: "Tunisia" },
      { value: "Ethiopia", label: "Ethiopia" },
      { value: "Uganda", label: "Uganda" },
      { value: "Tanzania", label: "Tanzania" },
      { value: "Rwanda", label: "Rwanda" },
      { value: "Zambia", label: "Zambia" },
      { value: "Zimbabwe", label: "Zimbabwe" },
      { value: "Botswana", label: "Botswana" },
      { value: "Namibia", label: "Namibia" },
      { value: "Cameroon", label: "Cameroon" },
      { value: "Senegal", label: "Senegal" },
      { value: "Ivory Coast", label: "Ivory Coast" },
      { value: "Benin", label: "Benin" },
      { value: "Togo", label: "Togo" },
      { value: "Burkina Faso", label: "Burkina Faso" },
      { value: "Mali", label: "Mali" },
      { value: "Niger", label: "Niger" },
      { value: "Chad", label: "Chad" },
      { value: "Liberia", label: "Liberia" },
      { value: "Sierra Leone", label: "Sierra Leone" },
      { value: "Guinea", label: "Guinea" },
      { value: "Gambia", label: "Gambia" },
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

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      showToast('Failed to capture photo. Please try again.', 'error');
      return;
    }

    fetch(screenshot)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "captured-profile-photo.jpg", { type: "image/jpeg" });
        setProfilePicture(file);
        setPreviewUrl(screenshot);
        setIsCameraOpen(false);
        showToast('Photo captured successfully!', 'success');
      })
      .catch(err => {
        console.error('Error processing captured photo:', err);
        showToast('Failed to process captured photo', 'error');
      });
  }, []);

  const openCamera = () => setIsCameraOpen(true);
  const openFilePicker = () => fileInputRef.current?.click();

  const removePhoto = () => {
    setProfilePicture(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/category`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((c: any) => ({
          value: c.category_name,
          label: c.category_name,
        }));
        setCategories(formatted);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    const results = users.filter((u) =>
      Object.values(u).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleReassignToNewUser = (user: UserData) => {
    if (!user.hall_name || !user.floor || !user.bed_number) {
      showToast("This user has no bed allocation to reassign.", 'error');
      return;
    }
    setSelectedUser(user);
    setReallocateMode('reassign');
    setNewUserPhone("");
    setProfilePicture(null);
    setPreviewUrl("");
    setNewUserData({ 
      category: user.category || "",
      gender: user.gender || "",
      arrival_date: "2026-04-02"
    });
  };

    const handleNewUserFieldChange = (field: string, value: string | number) => {
      let updatedData = { ...newUserData, [field]: value };

      if (field === "category") {
        let autoGender = "";
        let autoMaritalStatus = "";
        let autoAgeRange = "";
        let autoCountry = "Nigeria";  // ← Default to Nigeria for all categories

        const categoryMap: Record<string, { gender: string; marital: string; ageRange?: string }> = {
          "Young Brothers": { gender: "Male", marital: "Single", ageRange: "18-25" },
          "Married (male)": { gender: "Male", marital: "Married", ageRange: "36-45" },
          "Teens Below 18 (male)": { gender: "Male", marital: "Single", ageRange: "10-17" },
          "Young Sisters": { gender: "Female", marital: "Single", ageRange: "18-25" },
          "Married (female)": { gender: "Female", marital: "Married", ageRange: "36-45" },
          "Teens Below 18 (female)": { gender: "Female", marital: "Single", ageRange: "10-17" },
          "Nursing Mothers": { gender: "Female", marital: "Married", ageRange: "26-35" },
          "Elderly Sisters (56 & Above)": { gender: "Female", marital: "Married", ageRange: "56-65" },
          "Elderly Brothers (56 & Above)": { gender: "Male", marital: "Married", ageRange: "56-65" },
        };
        
        if (categoryMap[value as string]) {
          autoGender = categoryMap[value as string].gender;
          autoMaritalStatus = categoryMap[value as string].marital;
          autoAgeRange = categoryMap[value as string].ageRange || "";
        }
        
        updatedData = { 
          ...updatedData, 
          gender: autoGender,
          marital_status: autoMaritalStatus,
          age_range: autoAgeRange,
          country: autoCountry  // ← Always set to Nigeria
        };
      }

      if (field === "country") {
        updatedData = {
          ...updatedData,
          state: ""  // Reset state when country changes
        };
      }

      setNewUserData(updatedData);
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const showChildrenFields = newUserData.category === "Nursing Mothers";

  const handleCompleteReassignment = async () => {
    if (!newUserPhone || newUserPhone.length < 10) {
      showToast("Please enter a valid phone number (minimum 10 digits)", 'error');
      return;
    }

    const requiredFields = ['first_name', 'category', 'age_range', 'country', 'state', 'arrival_date', 'local_assembly', 'local_assembly_address'];
    const missingFields = requiredFields.filter(field => !newUserData[field as keyof NewUserRegistration]);
    
    if (missingFields.length > 0) {
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return;
    }

    if (!profilePicture) {
      showToast('Please upload a profile picture', 'error');
      return;
    }

    if (!newUserData.marital_status) {
      showToast('Please select marital status', 'error');
      return;
    }

    if (showChildrenFields) {
      if (!newUserData.no_children || Number(newUserData.no_children) <= 0) {  // ← Convert to number
        showToast('Please enter number of children (must be greater than 0)', 'error');
        return;
      }
      if (!newUserData.names_children?.trim()) {
        showToast('Please enter names of children', 'error');
        return;
      }
    }

    setProcessing(true);
    try {
      const formDataToSend = new FormData();

      let fileToUpload = profilePicture;
      if (!fileToUpload.name || fileToUpload.name.trim() === "" || fileToUpload.name === "blob") {
        fileToUpload = new File([fileToUpload], "profile-picture.jpg", {
          type: fileToUpload.type || "image/jpeg",
        });
      }
      formDataToSend.append('file', fileToUpload);
        
      formDataToSend.append('category', newUserData.category || '');
      formDataToSend.append('first_name', newUserData.first_name || '');
      formDataToSend.append('age_range', newUserData.age_range || '');
      formDataToSend.append('marital_status', newUserData.marital_status || '');
      formDataToSend.append('country', newUserData.country || '');
      formDataToSend.append('state', newUserData.state || '');
      formDataToSend.append('arrival_date', newUserData.arrival_date || '');
      formDataToSend.append('local_assembly', newUserData.local_assembly || '');
      formDataToSend.append('local_assembly_address', newUserData.local_assembly_address || '');

      if (newUserData.no_children) {
        formDataToSend.append('no_children', String(newUserData.no_children));
      }
      if (newUserData.names_children) {
        formDataToSend.append('names_children', newUserData.names_children);
      }
      if (newUserData.medical_issues) {
        formDataToSend.append('medical_issues', newUserData.medical_issues);
      }

      const response = await fetch(
        `${API_BASE}/register-user-manual/${newUserPhone}?number_late_comer=${selectedUser?.phone_number}`,
        {
          method: 'POST',
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `Registration failed with status ${response.status}`);
      }

      const result = await response.json();
      
      showToast(
        `✅ Bed reassigned to ${newUserData.first_name}! Hall: ${result.hall_name}, Floor: ${result.floor}, Bed: ${result.bed_number}`,
        'success'
      );
      
      await fetchUsers(true);
      
      setSelectedUser(null);
      setReallocateMode(null);
      setNewUserPhone("");
      setNewUserData({});
      setProfilePicture(null);
      setPreviewUrl("");
    } catch (err: any) {
      console.error('Registration error:', err);
      showToast(`❌ ${err.message}`, 'error');
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
  const overdueUsers = users.filter(u => isArrivalDatePassed(u.arrival_date));

  if (loading) {
    return (
      <div className="bg-gradient-to-t from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
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
    <div className="bg-gradient-to-b from-green-50 via-white to-green-100 w-full mt-2 p-1 sm:p-3 rounded-lg shadow-md">
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

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-2xl w-full">
            <button
              onClick={() => setIsCameraOpen(false)}
              className="absolute top-4 right-4 z-10 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-red-700"
            >
              ×
            </button>

            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Capture Photo</h3>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user", width: 1280, height: 720 }}
                className="w-full rounded-lg"
              />
            </div>

            <div className="p-6 bg-gray-100 flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </button>
              <button
                onClick={() => setIsCameraOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg"
              >
                Cancel
              </button>
            </div>
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
                <strong>🔗 Reassign to Walk-In:</strong> Register a new user and automatically transfer bed allocation
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
                          <button
                            onClick={() => handleReassignToNewUser(user)}
                            disabled={processing}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-sm disabled:opacity-50"
                            title="Reassign to Walk-In"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
                        ) : null}
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

        {selectedUser && reallocateMode === 'reassign' && (
          // <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 overflow-y-auto bg-green-800/50">
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 overflow-y-auto bg-green-800/50">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 max-h-[100vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Reassign Bed to Walk-In</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Transferring: {selectedUser?.hall_name} | Floor {selectedUser?.floor} | Bed {selectedUser?.bed_number}
                    </p>
                    <p className="text-blue-100 text-xs mt-1">
                      From: {selectedUser?.first_name || selectedUser?.phone_number}
                    </p>
                  </div>
                  <button 
                    onClick={() => { 
                      setSelectedUser(null); 
                      setReallocateMode(null);
                      setNewUserPhone("");
                      setNewUserData({});
                      setProfilePicture(null);
                      setPreviewUrl("");
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New User Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Picture <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="flex justify-center mb-4">
                    {previewUrl ? (
                      <div className="relative">
                        <img 
                          src={previewUrl} 
                          alt="Profile preview" 
                          className="w-48 h-48 object-cover rounded-full border-4 border-green-500 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                        <p className="text-gray-500 text-center px-4 text-sm">No photo yet</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={openCamera}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                    >
                      <Camera className="w-5 h-5" />
                      Take Photo
                    </button>

                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Photo
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUserData.first_name || ""}
                    onChange={(e) => handleNewUserFieldChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserData.category || ""}
                    onChange={(e) => handleNewUserFieldChange('category', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age Range <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserData.age_range || ""}
                    onChange={(e) => handleNewUserFieldChange('age_range', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select age range</option>
                    <option value="10-17">10-17</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="56-65">56-65</option>
                    <option value="66-70">66-70</option>
                    <option value="71+">71+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marital Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserData.marital_status || ""}
                    onChange={(e) => handleNewUserFieldChange('marital_status', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select marital status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                {showChildrenFields && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Children <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newUserData.no_children || ""}
                        onChange={(e) => handleNewUserFieldChange('no_children', e.target.value)}
                        placeholder="Enter number of children"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Names of Children <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={newUserData.names_children || ""}
                        onChange={(e) => handleNewUserFieldChange('names_children', e.target.value)}
                        placeholder="Enter names of children"
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserData.country || ""}
                    onChange={(e) => handleNewUserFieldChange('country', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select country</option>
                    {countriesList.map((country) => (
                      <option key={country.value} value={country.value}>{country.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserData.state || ""}
                    onChange={(e) => handleNewUserFieldChange('state', e.target.value)}
                    disabled={!newUserData.country}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">Select state</option>
                    {newUserData.country && countryStates[newUserData.country]?.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Arrival Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newUserData.arrival_date || ""}
                    onChange={(e) => handleNewUserFieldChange('arrival_date', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Local Assembly <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUserData.local_assembly || ""}
                    onChange={(e) => handleNewUserFieldChange('local_assembly', e.target.value)}
                    placeholder="Enter local assembly"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Local Assembly Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newUserData.local_assembly_address || ""}
                    onChange={(e) => handleNewUserFieldChange('local_assembly_address', e.target.value)}
                    placeholder="Enter local assembly address"
                    rows={1}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medical Issues (Optional)
                  </label>
                  <textarea
                    value={newUserData.medical_issues || ""}
                    onChange={(e) => handleNewUserFieldChange('medical_issues', e.target.value)}
                    placeholder="Enter any medical issues; blood pressure concerns etc."
                    rows={1}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleCompleteReassignment}
                    disabled={processing}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Complete Reassignment'
                    )}
                  </button>
                  <button
                    onClick={() => { 
                      setSelectedUser(null); 
                      setReallocateMode(null);
                      setNewUserPhone("");
                      setNewUserData({});
                      setProfilePicture(null);
                      setPreviewUrl("");
                    }}
                    disabled={processing}
                    className="px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManualPage;