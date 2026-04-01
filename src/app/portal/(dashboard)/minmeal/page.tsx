"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Clock,
  Utensils,
  Users,
  Coffee,
  Sun,
  Moon,
  RefreshCw,
  User,
} from "lucide-react";

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Minister {
  phone_number: string;
  first_name: string;
  last_name: string;
  room_number: string;
  category: string;
  id: number;
  identification_meal_number: number;
  profile_picture_url: string;
  created_at: string;
}

interface MealStatusResponse {
  minister: Minister;
  total_meals_taken: number;
  meal_dates: string[];
}

type MealType = "breakfast" | "lunch" | "dinner";
type Tab = "mark" | "status" | "pending";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayDate = () => new Date().toISOString().split("T")[0];

const mealOptions: { value: MealType; label: string; icon: React.ReactNode; color: string; bg: string; darkBg: string; darkColor: string }[] = [
  { value: "breakfast", label: "Breakfast", icon: <Coffee className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-300", darkBg: "bg-amber-900/30 border-amber-600", darkColor: "text-amber-400" },
  { value: "lunch",     label: "Lunch",     icon: <Sun     className="w-4 h-4" />, color: "text-green-600", bg: "bg-green-50 border-green-300", darkBg: "bg-green-900/30 border-green-600", darkColor: "text-green-400" },
  { value: "dinner",    label: "Dinner",    icon: <Moon    className="w-4 h-4" />, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-300", darkBg: "bg-indigo-900/30 border-indigo-600", darkColor: "text-indigo-400" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const MealBadge = ({ meal, isDarkMode }: { meal: MealType; isDarkMode: boolean }) => {
  const opt = mealOptions.find((m) => m.value === meal)!;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${isDarkMode ? `${opt.darkBg} ${opt.darkColor}` : `${opt.bg} ${opt.color}`}`}>
      {opt.icon} {opt.label}
    </span>
  );
};

const MinisterCard = ({ minister, isDarkMode }: { minister: Minister; isDarkMode: boolean }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
    {minister.profile_picture_url ? (
      <img
        src={minister.profile_picture_url}
        alt={minister.first_name}
        className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
      />
    ) : (
      <div className={`w-12 h-12 rounded-full border-2 border-green-400 flex items-center justify-center ${isDarkMode ? "bg-green-900/40" : "bg-green-100"}`}>
        <User className="w-6 h-6 text-green-500" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className={`font-semibold truncate ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
        {minister.first_name} {minister.last_name}
      </p>
      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
        {minister.category} {minister.room_number ? `· Room ${minister.room_number}` : ""}
      </p>
    </div>
    <div className="text-right shrink-0">
      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>Meal No.</p>
      <p className="font-bold text-green-500 text-sm">#{minister.identification_meal_number}</p>
    </div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({ toast }: { toast: { message: string; type: "success" | "error" | "info" } | null }) => {
  if (!toast) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90vw] max-w-lg">
      <div
        className={`flex items-start gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-medium border-2 ${
          toast.type === "success"
            ? "bg-green-600 border-green-400"
            : toast.type === "error"
            ? "bg-red-600 border-red-400"
            : "bg-green-800 border-green-600"
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {toast.type === "success" ? <CheckCircle className="w-6 h-6" /> :
           toast.type === "error"   ? <XCircle     className="w-6 h-6" /> :
                                      <AlertCircle  className="w-6 h-6" />}
        </div>
        <span className="text-sm leading-relaxed break-words">{toast.message}</span>
      </div>
    </div>
  );
};

// ─── Tab 1: Mark Meal ────────────────────────────────────────────────────────

const MarkMealTab = ({ showToast, isDarkMode }: { showToast: (m: string, t: "success" | "error" | "info") => void; isDarkMode: boolean }) => {
  const [phoneNumber, setPhoneNumber]   = useState("");
  const [mealNumber,  setMealNumber]    = useState("");
  const [mealType,    setMealType]      = useState<MealType>("breakfast");
  const [processing,  setProcessing]    = useState(false);
  const [lastResult,  setLastResult]    = useState<any>(null);

  const handleSubmit = async () => {
    if (!phoneNumber && !mealNumber) {
      showToast("Enter a phone number or meal ID number", "error");
      return;
    }

    setProcessing(true);
    setLastResult(null);

    try {
      const payload: any = { meal_type: mealType };
      if (phoneNumber.trim()) payload.phone_number = phoneNumber.trim();
      if (mealNumber.trim())  payload.identification_meal_number = parseInt(mealNumber.trim(), 10);

      console.log("📤 Sending payload:", JSON.stringify(payload));

      const res = await fetch(`${API_BASE}/ticketing/meals/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", res.status);

      if (!res.ok) {
        const rawText = await res.text();
        console.error("❌ Error response body:", rawText);
        let detail = `Server error: ${res.status}`;
        try {
          const errJson = JSON.parse(rawText);
          detail = errJson.detail || JSON.stringify(errJson);
        } catch {}
        throw new Error(detail);
      }

      const result = await res.json();
      console.log("✅ Success:", result);
      setLastResult(result);
      showToast(`Meal marked successfully! (${mealType})`, "success");
      setPhoneNumber("");
      setMealNumber("");
    } catch (err: any) {
      console.error("Registration error:", err);
      showToast(err.message || "Failed to mark meal. Check console for details.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const inputClass = `w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
    isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  return (
    <div className="space-y-6">
      {/* Meal Type Selector */}
      <div>
        <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Meal Type</label>
        <div className="grid grid-cols-3 gap-3">
          {mealOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMealType(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                mealType === opt.value
                  ? isDarkMode
                    ? `${opt.darkBg} ${opt.darkColor} border-current shadow-sm`
                    : `${opt.bg} ${opt.color} border-current shadow-sm`
                  : isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Identifier inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 08012345678"
            className={inputClass}
          />
        </div>
        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Meal ID Number</label>
          <input
            type="number"
            value={mealNumber}
            onChange={(e) => setMealNumber(e.target.value)}
            placeholder="e.g. 42"
            className={inputClass}
          />
        </div>
      </div>

      <p className={`text-xs -mt-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Fill in at least one of the fields above. Date is recorded automatically by the server.</p>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={processing}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Marking meal...
          </>
        ) : (
          <>
            <Utensils className="w-5 h-5" />
            Mark as Fed
          </>
        )}
      </button>

      {/* Result Card */}
      {lastResult && (
        <div className={`border rounded-xl p-4 ${isDarkMode ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className={`font-semibold text-sm ${isDarkMode ? "text-green-400" : "text-green-800"}`}>Meal Recorded</span>
          </div>
          <div className={`grid grid-cols-2 gap-2 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            <span>Date: <strong className={isDarkMode ? "text-gray-200" : ""}>{lastResult.date}</strong></span>
            <span>Meal: <strong className={`capitalize ${isDarkMode ? "text-gray-200" : ""}`}>{lastResult.meal_type}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Tab 2: Minister Status ───────────────────────────────────────────────────

const StatusTab = ({ showToast, isDarkMode }: { showToast: (m: string, t: "success" | "error" | "info") => void; isDarkMode: boolean }) => {
  const [phone,    setPhone]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<MealStatusResponse | null>(null);

  const handleSearch = async () => {
    if (!phone || phone.length < 7) {
      showToast("Enter a valid phone number", "error");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/ticketing/meals/status/${phone}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Not found" }));
        throw new Error(err.detail || `Error: ${res.status}`);
      }
      setResult(await res.json());
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Minister's Phone Number</label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. 08012345678"
            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <MinisterCard minister={result.minister} isDarkMode={isDarkMode} />

          <div className="grid grid-cols-2 gap-3">
            <div className={`border rounded-xl p-4 text-center ${isDarkMode ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"}`}>
              <p className={`text-3xl font-bold ${isDarkMode ? "text-green-400" : "text-green-700"}`}>{result.total_meals_taken}</p>
              <p className={`text-xs mt-1 font-medium ${isDarkMode ? "text-green-500" : "text-green-600"}`}>Total Meals Taken</p>
            </div>
            <div className={`border rounded-xl p-4 text-center ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
              <p className={`text-3xl font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{result.meal_dates.length}</p>
              <p className={`text-xs mt-1 font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Days Eaten</p>
            </div>
          </div>

          {result.meal_dates.length > 0 && (
            <div>
              <p className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                <Clock className="w-4 h-4 text-green-500" /> Meal Dates
              </p>
              <div className="flex flex-wrap gap-2">
                {result.meal_dates.map((d) => (
                  <span key={d} className={`px-3 py-1 text-xs font-semibold rounded-full border ${isDarkMode ? "bg-green-900/40 text-green-400 border-green-700" : "bg-green-100 text-green-700 border-green-200"}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.meal_dates.length === 0 && (
            <div className={`text-center py-6 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No meals recorded yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Tab 3: Pending Ministers ─────────────────────────────────────────────────

const PendingTab = ({ showToast, isDarkMode }: { showToast: (m: string, t: "success" | "error" | "info") => void; isDarkMode: boolean }) => {
  const [mealType,  setMealType]  = useState<MealType>("breakfast");
  const [loading,   setLoading]   = useState(false);
  const [ministers, setMinisters] = useState<Minister[] | null>(null);
  const [searched,  setSearched]  = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    setMinisters(null);
    setSearched(false);
    try {
      const res = await fetch(`${API_BASE}/ticketing/meals/pending?meal_type=${mealType}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Error fetching data" }));
        throw new Error(err.detail || `Error: ${res.status}`);
      }
      const data: Minister[] = await res.json();
      setMinisters(data);
      setSearched(true);
      if (data.length === 0) showToast(`All ministers have had ${mealType} today! 🎉`, "info");
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Select Meal to Check</label>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {mealOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMealType(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                mealType === opt.value
                  ? isDarkMode
                    ? `${opt.darkBg} ${opt.darkColor} border-current shadow-sm`
                    : `${opt.bg} ${opt.color} border-current shadow-sm`
                  : isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchPending}
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {loading ? "Loading..." : `Fetch Pending (${mealType})`}
        </button>
      </div>

      {searched && ministers !== null && (
        <div>
          {ministers.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <Users className="w-4 h-4 text-green-500" />
                  {ministers.length} minister{ministers.length !== 1 ? "s" : ""} yet to have{" "}
                  <MealBadge meal={mealType} isDarkMode={isDarkMode} />
                </p>
              </div>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {ministers.map((m) => (
                  <MinisterCard key={m.id} minister={m} isDarkMode={isDarkMode} />
                ))}
              </div>
            </>
          ) : (
            <div className={`text-center py-10 rounded-xl border ${isDarkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-100"}`}>
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className={`font-semibold ${isDarkMode ? "text-green-400" : "text-green-700"}`}>All ministers have had {mealType} today!</p>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-green-600" : "text-green-500"}`}>No pending ministers found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MinisterMealTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("mark");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "mark",    label: "Mark Meal",    icon: <Utensils className="w-4 h-4" /> },
    { key: "status",  label: "Check Status", icon: <Search   className="w-4 h-4" /> },
    { key: "pending", label: "Pending",       icon: <Users    className="w-4 h-4" /> },
  ];

  return (
    <div className={`bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full rounded-lg shadow-md ${isDarkMode ? "bg-gray-900" : ""}`}>
      <Toast toast={toast} />

      <section className={`min-h-screen rounded-lg shadow-md p-2 lg:p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* Header */}
        <div className={`mb-6 pb-5 border-b-2 ${isDarkMode ? "border-green-700" : "border-green-500"}`}>
          <h1 className={`text-3xl lg:text-4xl font-bold mb-1 flex items-center gap-3 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
            <Utensils className="w-8 h-8 text-green-500" />
            Minister Meal Tracker
          </h1>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Track and manage meal distribution for ministers</p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 rounded-xl p-1 mb-6 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? isDarkMode
                    ? "bg-gray-600 text-green-400 shadow-sm border border-green-800"
                    : "bg-white text-green-700 shadow-sm border border-green-100"
                  : isDarkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-2xl mx-auto">
          {activeTab === "mark"    && <MarkMealTab  showToast={showToast} isDarkMode={isDarkMode} />}
          {activeTab === "status"  && <StatusTab    showToast={showToast} isDarkMode={isDarkMode} />}
          {activeTab === "pending" && <PendingTab   showToast={showToast} isDarkMode={isDarkMode} />}
        </div>
      </section>
    </div>
  );
};

export default MinisterMealTracker;