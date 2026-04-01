"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, AlertCircle, CheckCircle, XCircle, RefreshCw, Calendar, Clock, Link as LinkIcon, Upload, X, Camera, User } from "lucide-react";
import Webcam from "react-webcam";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";
const BATCH_SIZE = 50;

let _cachedManual: UserData[] | null = null;
let _isFetchingManual = false;

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
  const [users, setUsers] = useState<UserData[]>(_cachedManual || []);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>(_cachedManual || []);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [reallocateMode, setReallocateMode] = useState<'reassign' | null>(null);
  const [loading, setLoading] = useState<boolean>(!_cachedManual);
  const [processing, setProcessing] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

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
    { value: "Ethiopia", label: "Ethiopia" },
    { value: "Uganda", label: "Uganda" },
    { value: "Tanzania", label: "Tanzania" },
    { value: "Rwanda", label: "Rwanda" },
    { value: "Zambia", label: "Zambia" },
    { value: "Zimbabwe", label: "Zimbabwe" },
    { value: "Cameroon", label: "Cameroon" },
    { value: "Senegal", label: "Senegal" },
    { value: "Ivory Coast", label: "Ivory Coast" },
    { value: "Benin", label: "Benin" },
    { value: "Togo", label: "Togo" },
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

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) { showToast('Failed to capture photo.', 'error'); return; }
    fetch(screenshot)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "captured-profile-photo.jpg", { type: "image/jpeg" });
        setProfilePicture(file);
        setPreviewUrl(URL.createObjectURL(file));
        setIsCameraOpen(false);
        showToast('Photo captured successfully!', 'success');
      })
      .catch(() => showToast('Failed to process captured photo', 'error'));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { showToast('File size must be less than 5MB', 'error'); return; }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setProfilePicture(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUsers = async (showRefreshing = false) => {
    if (_cachedManual && !showRefreshing) {
      setUsers(_cachedManual);
      setFilteredUsers(_cachedManual);
      setLoading(false);
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
      _cachedManual = null;
    } else {
      setLoading(true);
    }

    try {
      const [firstRes, activeUsersRes] = await Promise.all([
        fetch(`${API_BASE}/users?skip=0&limit=${BATCH_SIZE}`, { headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`${API_BASE}/active-users`, { headers: { 'Cache-Control': 'no-cache' } }),
      ]);

      if (!firstRes.ok) throw new Error(`HTTP error! status: ${firstRes.status}`);

      const firstData: UserData[] = await firstRes.json();
      const activeUsers = activeUsersRes.ok ? await activeUsersRes.json() : [];
      const activePhones = new Set(activeUsers.map((u: any) => u.phone_number));

      const toUnverified = (batch: any[]) =>
        batch.filter((u: any) => !activePhones.has(u.phone_number)).map((u: any) => ({ ...u, is_active: false }));

      const firstUnverified = toUnverified(firstData);
      _cachedManual = firstUnverified;
      setUsers(firstUnverified);
      setFilteredUsers(firstUnverified);
      setCurrentPage(1);
      setLoading(false);
      setRefreshing(false);

      if (firstData.length < BATCH_SIZE) return;

      if (_isFetchingManual) return;
      _isFetchingManual = true;
      setLoadingMore(true);
      let skip = BATCH_SIZE;
      let allRaw = [...firstData];

      while (true) {
        setFetchProgress(`Loading more... ${allRaw.length} users so far`);
        const r = await fetch(`${API_BASE}/users?skip=${skip}&limit=${BATCH_SIZE}`, { headers: { 'Cache-Control': 'no-cache' } });
        if (!r.ok) break;
        const batch: UserData[] = await r.json();
        if (!Array.isArray(batch) || batch.length === 0) break;
        allRaw = [...allRaw, ...batch];
        const allUnverified = toUnverified(allRaw);
        _cachedManual = allUnverified;
        setUsers(allUnverified);
        setFilteredUsers(prev => searchTerm ? prev : allUnverified);
        if (batch.length < BATCH_SIZE) break;
        skip += BATCH_SIZE;
      }
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      showToast("Failed to fetch users.", 'error');
      setLoading(false);
      setRefreshing(false);
    } finally {
      _isFetchingManual = false;
      setLoadingMore(false);
      setFetchProgress("");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/category`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.map((c: any) => ({ value: c.category_name, label: c.category_name })));
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => { fetchUsers(); fetchCategories(); }, []);

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

  const getAutoFilledDataForCategory = (category: string) => {
    const categoryMap: Record<string, { gender: string; marital: string; ageRange?: string }> = {
      "Young Brothers":             { gender: "Male",   marital: "Single",  ageRange: "18-25" },
      "Married (male)":             { gender: "Male",   marital: "Married", ageRange: "36-45" },
      "Teens Below 18 (male)":      { gender: "Male",   marital: "Single",  ageRange: "10-17" },
      "Young Sisters":              { gender: "Female", marital: "Single",  ageRange: "18-25" },
      "Married (female)":           { gender: "Female", marital: "Married", ageRange: "36-45" },
      "Teens Below 18 (female)":    { gender: "Female", marital: "Single",  ageRange: "10-17" },
      "Nursing Mothers":            { gender: "Female", marital: "Married", ageRange: "26-35" },
      "Elderly Sisters (56 & Above)": { gender: "Female", marital: "Married", ageRange: "56-65" },
      "Elderly Brothers (56 & Above)": { gender: "Male", marital: "Married", ageRange: "56-65" },
    };
    const m = categoryMap[category];
    return m
      ? { gender: m.gender, marital_status: m.marital, age_range: m.ageRange || "", country: "Nigeria" }
      : { gender: "", marital_status: "", age_range: "", country: "Nigeria" };
  };

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
      ...getAutoFilledDataForCategory(user.category || ""),
      arrival_date: "2026-04-02",
    });
  };

  const handleNewUserFieldChange = (field: string, value: string | number) => {
    let updated = { ...newUserData, [field]: value };
    if (field === "category") updated = { ...updated, ...getAutoFilledDataForCategory(value as string) };
    if (field === "country")  updated = { ...updated, state: "" };
    setNewUserData(updated);
  };

  const showChildrenFields = newUserData.category === "Nursing Mothers";

  const closeModal = () => {
    setSelectedUser(null);
    setReallocateMode(null);
    setNewUserPhone("");
    setNewUserData({});
    setProfilePicture(null);
    setPreviewUrl("");
  };

  const handleCompleteReassignment = async () => {
    if (!newUserPhone || newUserPhone.length !== 11) {
      showToast("Please enter a valid phone number (11 digits)", 'error');
      return;
    }
    const required = ['first_name', 'category', 'age_range', 'country', 'state', 'arrival_date', 'local_assembly', 'local_assembly_address'];
    const missing  = required.filter(f => !newUserData[f as keyof NewUserRegistration]);
    if (missing.length > 0) { showToast(`Please fill in: ${missing.join(', ')}`, 'error'); return; }
    if (!profilePicture)     { showToast('Please upload a profile picture', 'error'); return; }
    if (!newUserData.marital_status) { showToast('Please select marital status', 'error'); return; }

    setProcessing(true);
    try {
      const fd = new FormData();
      let file = profilePicture;
      if (!file.name || file.name === "blob") {
        file = new File([file], "profile-picture.jpg", { type: file.type || "image/jpeg" });
      }
      fd.append('file', file);
      fd.append('category',               newUserData.category || '');
      fd.append('first_name',             newUserData.first_name || '');
      fd.append('age_range',              newUserData.age_range || '');
      fd.append('marital_status',         newUserData.marital_status || '');
      fd.append('country',                newUserData.country || '');
      fd.append('state',                  newUserData.state || '');
      fd.append('arrival_date',           newUserData.arrival_date || '');
      fd.append('local_assembly',         newUserData.local_assembly || '');
      fd.append('local_assembly_address', newUserData.local_assembly_address || '');
      if (newUserData.no_children)    fd.append('no_children',    String(newUserData.no_children));
      if (newUserData.names_children) fd.append('names_children', newUserData.names_children);
      if (newUserData.medical_issues) fd.append('medical_issues', newUserData.medical_issues);

      const res = await fetch(
        `${API_BASE}/register-user-manual/${newUserPhone}?number_late_comer=${selectedUser?.phone_number}`,
        { method: 'POST', body: fd }
      );

      if (!res.ok) {
        const rawText = await res.text();
        let detail = `Server error: ${res.status}`;
        try { detail = JSON.parse(rawText).detail || detail; } catch {}
        throw new Error(detail);
      }

      const result = await res.json();
      showToast(
        `✅ Bed reassigned to ${newUserData.first_name}! Hall: ${result.hall_name}, Floor: ${result.floor}, Bed: ${result.bed_number}`,
        'success'
      );
      await fetchUsers(true);
      closeModal();
    } catch (err: any) {
      console.error('Reassignment error:', err);
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatArrivalDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return dateString; }
  };

  const isArrivalDatePassed = (dateString?: string) => {
    if (!dateString) return false;
    try {
      const d = new Date(dateString); const t = new Date(); t.setHours(0,0,0,0); return d < t;
    } catch { return false; }
  };

  const allocatedUsers = users.filter(u => u.hall_name && u.bed_number);
  const overdueUsers   = users.filter(u => isArrivalDatePassed(u.arrival_date));

  // ── Shared input class ───────────────────────────────────────────────────────
  const inputClass = `w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
    isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  const selectClass = `w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer ${
    isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`;

  if (loading) {
    return (
      <div className={`bg-gradient-to-t from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md ${isDarkMode ? "bg-gray-900" : ""}`}>
        <section className={`min-h-screen rounded-lg shadow-md p-5 flex items-center justify-center ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Loading unverified users...</p>
            {fetchProgress && <p className="text-green-500 text-sm mt-2 font-medium">{fetchProgress}</p>}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full rounded-lg shadow-md ${isDarkMode ? "bg-gray-900" : ""}`}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90vw] max-w-lg">
          <div className={`flex items-start gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white border-2 font-medium ${
            toast.type === 'success' ? 'bg-green-600 border-green-400' :
            toast.type === 'error'   ? 'bg-red-600 border-red-400' :
                                       'bg-green-800 border-green-600'
          }`}>
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? <CheckCircle className="w-6 h-6" /> :
               toast.type === 'error'   ? <XCircle     className="w-6 h-6" /> :
                                          <AlertCircle  className="w-6 h-6" />}
            </div>
            <span className="text-sm leading-relaxed break-words">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-3">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-[25rem] w-full">
            <button onClick={() => setIsCameraOpen(false)}
              className="absolute top-2 right-4 z-10 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-red-700">
              ×
            </button>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", width: 1280, height: 720 }} className="w-full" />
            <div className="p-2 bg-gray-100 flex justify-center">
              <button onClick={capturePhoto}
                className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-8 py-3 rounded-full text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" /> Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <section className={`min-h-screen rounded-lg shadow-md p-2 sm:p-3 lg:p-3 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* Header */}
        <div className={`mb-8 pb-6 border-b-2 ${isDarkMode ? "border-green-700" : "border-green-500"}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Manual Bed Reallocation</h1>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Manage unverified registrations and reassign bedspaces</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={() => fetchUsers(true)} disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? (fetchProgress || 'Refreshing...') : 'Refresh'}
              </button>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Unverified</p>
                <p className="text-2xl font-bold text-orange-500">{users.length}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Allocated</p>
                <p className="text-2xl font-bold text-green-500">{allocatedUsers.length}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Overdue</p>
                <p className="text-2xl font-bold text-red-500">{overdueUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className={`mb-6 border-l-4 border-green-500 p-4 rounded ${isDarkMode ? "bg-green-900/20" : "bg-green-50"}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? "text-green-400" : "text-green-800"}`}>Reallocation Workflow</h4>
              <p className={`text-xs ${isDarkMode ? "text-green-500" : "text-green-700"}`}>
                <strong>🔗 Reassign to Walk-In:</strong> Register a new user and automatically transfer bed allocation
              </p>
            </div>
          </div>
        </div>

        {/* Search + entries per page */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by name, phone, hall..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  : "border-gray-300 text-gray-900"
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Show:</label>
            <select value={entriesPerPage}
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className={`border-2 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isDarkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300 text-gray-900"
              }`}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Results info */}
        <div className={`mb-4 text-sm flex items-center gap-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          <span>Showing {filteredUsers.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, filteredUsers.length)} of {filteredUsers.length} users</span>
          {loadingMore && (
            <span className="flex items-center gap-2 text-green-500 font-medium">
              <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              {fetchProgress || "Loading more..."}
            </span>
          )}
        </div>

        {/* Table */}
        <div className={`overflow-x-auto rounded-lg border-2 shadow-sm ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
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
              {currentUsers.length > 0 ? (
                currentUsers.map((user, idx) => (
                  <tr key={user.phone_number || user.id}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? isArrivalDatePassed(user.arrival_date)
                          ? "bg-red-900/20 hover:bg-green-900/20 border-gray-700"
                          : idx % 2 === 0
                          ? "bg-gray-800 hover:bg-green-900/20 border-gray-700"
                          : "bg-gray-750 hover:bg-green-900/20 border-gray-700"
                        : isArrivalDatePassed(user.arrival_date)
                        ? "bg-red-50 hover:bg-green-50 border-gray-200"
                        : idx % 2 === 0
                        ? "bg-white hover:bg-green-50 border-gray-200"
                        : "bg-gray-50 hover:bg-green-50 border-gray-200"
                    }`}>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-orange-500 font-semibold text-sm">
                        <XCircle className="w-4 h-4" /> Not Verified
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? "bg-green-900/40" : "bg-green-100"}`}>
                          <User className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{user.first_name || "N/A"}</p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{user.gender || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{user.phone_number}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isArrivalDatePassed(user.arrival_date)
                          ? <Clock    className="w-4 h-4 text-red-400" />
                          : <Calendar className="w-4 h-4 text-gray-400" />}
                        <span className={`text-sm ${isArrivalDatePassed(user.arrival_date) ? 'text-red-400 font-semibold' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatArrivalDate(user.arrival_date)}
                        </span>
                      </div>
                      {isArrivalDatePassed(user.arrival_date) && (
                        <p className="text-xs text-red-400 mt-1">⚠ Overdue</p>
                      )}
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>{user.hall_name || <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>Not Allocated</span>}</td>
                    <td className={`p-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>{user.floor  || <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>—</span>}</td>
                    <td className={`p-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>{user.bed_number || <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>—</span>}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        {user.hall_name && user.bed_number && (
                          <button onClick={() => handleReassignToNewUser(user)} disabled={processing}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all hover:scale-105 shadow-sm disabled:opacity-50"
                            title="Reassign to Walk-In">
                            <LinkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-8">
                    <div className="flex flex-col items-center text-gray-400">
                      <CheckCircle className="w-16 h-16 mb-4 text-green-400" />
                      <p className={`text-lg font-medium ${isDarkMode ? "text-gray-300" : ""}`}>All users verified! 🎉</p>
                      <p className="text-sm">No unverified registrations at this time</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages || 1}</span>
          </p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
              className={`px-4 py-2 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
              }`}>
              Previous
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
              Next
            </button>
          </div>
        </div>

        {/* Reassign Modal */}
        {selectedUser && reallocateMode === 'reassign' && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 overflow-y-auto bg-green-800/50">
            <div className={`relative rounded-2xl shadow-2xl w-full max-w-4xl my-8 max-h-[100vh] overflow-y-auto ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Reassign Bed to Walk-In</h2>
                    <p className="text-green-100 text-sm mt-1">
                      Transferring: {selectedUser?.hall_name} | Floor {selectedUser?.floor} | Bed {selectedUser?.bed_number}
                    </p>
                    <p className="text-green-100 text-xs mt-1">From: {selectedUser?.first_name || selectedUser?.phone_number}</p>
                  </div>
                  <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-all">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Phone */}
                <div>
                  <label className={labelClass}>New User Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="Enter 11-digit phone number" className={inputClass} />
                </div>

                {/* Profile Picture */}
                <div>
                  <label className={labelClass}>Profile Picture <span className="text-red-500">*</span></label>
                  <div className="flex justify-center mb-4">
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="w-48 h-48 object-cover rounded-full border-4 border-green-500 shadow-lg" />
                        <button onClick={removePhoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className={`w-48 h-48 border-4 border-dashed rounded-full flex items-center justify-center ${isDarkMode ? "bg-gray-700 border-gray-500" : "bg-gray-200 border-gray-400"}`}>
                        <p className={`text-center px-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>No photo yet</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-4">
                    <button type="button" onClick={() => setIsCameraOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg shadow-md">
                      <Camera className="w-5 h-5" /> Take Photo
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md">
                      <Upload className="w-5 h-5" /> Upload Photo
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                {/* First Name */}
                <div>
                  <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={newUserData.first_name || ""} onChange={(e) => handleNewUserFieldChange('first_name', e.target.value)}
                    placeholder="Enter first name" className={inputClass} />
                </div>

                {/* Category */}
                <div>
                  <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                  <select value={newUserData.category || ""} onChange={(e) => handleNewUserFieldChange('category', e.target.value)} className={selectClass}>
                    <option value="">Select category</option>
                    {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>

                {/* Age Range */}
                <div>
                  <label className={labelClass}>Age Range <span className="text-red-500">*</span></label>
                  <select value={newUserData.age_range || ""} onChange={(e) => handleNewUserFieldChange('age_range', e.target.value)} className={selectClass}>
                    <option value="">Select age range</option>
                    {["10-17","18-25","26-35","36-45","46-55","56-65","66-70","71+"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Marital Status */}
                <div>
                  <label className={labelClass}>Marital Status <span className="text-red-500">*</span></label>
                  <select value={newUserData.marital_status || ""} onChange={(e) => handleNewUserFieldChange('marital_status', e.target.value)} className={selectClass}>
                    <option value="">Select marital status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                {/* Children fields */}
                {showChildrenFields && (
                  <>
                    <div>
                      <label className={labelClass}>Number of Children</label>
                      <input type="number" min="1" value={newUserData.no_children || ""}
                        onChange={(e) => handleNewUserFieldChange('no_children', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Names of Children</label>
                      <textarea value={newUserData.names_children || ""} rows={3}
                        onChange={(e) => handleNewUserFieldChange('names_children', e.target.value)} className={inputClass} />
                    </div>
                  </>
                )}

                {/* Country */}
                <div>
                  <label className={labelClass}>Country <span className="text-red-500">*</span></label>
                  <select value={newUserData.country || ""} onChange={(e) => handleNewUserFieldChange('country', e.target.value)} className={selectClass}>
                    <option value="">Select country</option>
                    {countriesList.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className={labelClass}>State <span className="text-red-500">*</span></label>
                  <select value={newUserData.state || ""} onChange={(e) => handleNewUserFieldChange('state', e.target.value)}
                    disabled={!newUserData.country}
                    className={`${selectClass} disabled:opacity-50 ${isDarkMode ? "disabled:bg-gray-600" : "disabled:bg-gray-100"}`}>
                    <option value="">Select state</option>
                    {newUserData.country && countryStates[newUserData.country]?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Arrival Date */}
                <div>
                  <label className={labelClass}>Arrival Date <span className="text-red-500">*</span></label>
                  <input type="date" value={newUserData.arrival_date || ""}
                    onChange={(e) => handleNewUserFieldChange('arrival_date', e.target.value)} className={inputClass} />
                </div>

                {/* Local Assembly */}
                <div>
                  <label className={labelClass}>Local Assembly <span className="text-red-500">*</span></label>
                  <input type="text" value={newUserData.local_assembly || ""}
                    onChange={(e) => handleNewUserFieldChange('local_assembly', e.target.value)}
                    placeholder="Enter local assembly" className={inputClass} />
                </div>

                {/* Local Assembly Address */}
                <div>
                  <label className={labelClass}>Local Assembly Address <span className="text-red-500">*</span></label>
                  <textarea value={newUserData.local_assembly_address || ""} rows={1}
                    onChange={(e) => handleNewUserFieldChange('local_assembly_address', e.target.value)}
                    placeholder="Enter local assembly address" className={inputClass} />
                </div>

                {/* Medical Issues */}
                <div>
                  <label className={labelClass}>Medical Issues (Optional)</label>
                  <textarea value={newUserData.medical_issues || ""} rows={1}
                    onChange={(e) => handleNewUserFieldChange('medical_issues', e.target.value)}
                    placeholder="Enter any medical issues; blood pressure concerns etc." className={inputClass} />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button onClick={handleCompleteReassignment} disabled={processing}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg disabled:opacity-50">
                    {processing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : 'Complete Reassignment'}
                  </button>
                  <button onClick={closeModal} disabled={processing}
                    className={`px-6 py-4 font-semibold rounded-lg disabled:opacity-50 ${
                      isDarkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}>
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