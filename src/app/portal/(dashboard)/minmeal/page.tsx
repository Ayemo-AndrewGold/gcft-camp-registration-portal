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

const mealOptions: { value: MealType; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { value: "breakfast", label: "Breakfast", icon: <Coffee className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-300" },
  { value: "lunch",     label: "Lunch",     icon: <Sun     className="w-4 h-4" />, color: "text-green-600", bg: "bg-green-50 border-green-300" },
  { value: "dinner",    label: "Dinner",    icon: <Moon    className="w-4 h-4" />, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-300" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const MealBadge = ({ meal }: { meal: MealType }) => {
  const opt = mealOptions.find((m) => m.value === meal)!;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${opt.bg} ${opt.color}`}>
      {opt.icon} {opt.label}
    </span>
  );
};

const MinisterCard = ({ minister }: { minister: Minister }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
    {minister.profile_picture_url ? (
      <img
        src={minister.profile_picture_url}
        alt={minister.first_name}
        className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
      />
    ) : (
      <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
        <User className="w-6 h-6 text-green-600" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-800 truncate">
        {minister.first_name} {minister.last_name}
      </p>
      <p className="text-xs text-gray-500">
        {minister.category} {minister.room_number ? `· Room ${minister.room_number}` : ""}
      </p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-xs text-gray-400">Meal No.</p>
      <p className="font-bold text-green-700 text-sm">#{minister.identification_meal_number}</p>
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

const MarkMealTab = ({ showToast }: { showToast: (m: string, t: "success" | "error" | "info") => void }) => {
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
      // Build payload — date is handled server-side, do NOT send it
      const payload: any = {
        meal_type: mealType,
      };
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
        // Try to get detailed error from response
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

  return (
    <div className="space-y-6">
      {/* Meal Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Meal Type</label>
        <div className="grid grid-cols-3 gap-3">
          {mealOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMealType(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                mealType === opt.value
                  ? `${opt.bg} ${opt.color} border-current shadow-sm`
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 08012345678"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Meal ID Number</label>
          <input
            type="number"
            value={mealNumber}
            onChange={(e) => setMealNumber(e.target.value)}
            placeholder="e.g. 42"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 -mt-3">Fill in at least one of the fields above. Date is recorded automatically by the server.</p>

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
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800 text-sm">Meal Recorded</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <span>Date: <strong>{lastResult.date}</strong></span>
            <span>Meal: <strong className="capitalize">{lastResult.meal_type}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Tab 2: Minister Status ───────────────────────────────────────────────────

const StatusTab = ({ showToast }: { showToast: (m: string, t: "success" | "error" | "info") => void }) => {
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">Minister's Phone Number</label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. 08012345678"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
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
          {/* Minister card */}
          <MinisterCard minister={result.minister} />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{result.total_meals_taken}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">Total Meals Taken</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-700">{result.meal_dates.length}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Days Eaten</p>
            </div>
          </div>

          {/* Meal dates */}
          {result.meal_dates.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" /> Meal Dates
              </p>
              <div className="flex flex-wrap gap-2">
                {result.meal_dates.map((d) => (
                  <span key={d} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.meal_dates.length === 0 && (
            <div className="text-center py-6 text-gray-400">
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

const PendingTab = ({ showToast }: { showToast: (m: string, t: "success" | "error" | "info") => void }) => {
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
      {/* Controls */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Select Meal to Check</label>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {mealOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMealType(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                mealType === opt.value
                  ? `${opt.bg} ${opt.color} border-current shadow-sm`
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

      {/* Results */}
      {searched && ministers !== null && (
        <div>
          {ministers.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  {ministers.length} minister{ministers.length !== 1 ? "s" : ""} yet to have{" "}
                  <MealBadge meal={mealType} />
                </p>
              </div>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {ministers.map((m) => (
                  <MinisterCard key={m.id} minister={m} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-700">All ministers have had {mealType} today!</p>
              <p className="text-xs text-green-500 mt-1">No pending ministers found.</p>
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

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "mark",    label: "Mark Meal",   icon: <Utensils className="w-4 h-4" /> },
    { key: "status",  label: "Check Status", icon: <Search   className="w-4 h-4" /> },
    { key: "pending", label: "Pending",      icon: <Users    className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full rounded-lg shadow-md">
      <Toast toast={toast} />

      <section className="bg-white min-h-screen rounded-lg shadow-md p-2 lg:p-6">
        {/* Header */}
        <div className="mb-6 pb-5 border-b-2 border-green-500">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-1 flex items-center gap-3">
            <Utensils className="w-8 h-8 text-green-600" />
            Minister Meal Tracker
          </h1>
          <p className="text-gray-500 text-sm">Track and manage meal distribution for ministers</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white text-green-700 shadow-sm border border-green-100"
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
          {activeTab === "mark"    && <MarkMealTab  showToast={showToast} />}
          {activeTab === "status"  && <StatusTab    showToast={showToast} />}
          {activeTab === "pending" && <PendingTab   showToast={showToast} />}
        </div>
      </section>
    </div>
  );
};

export default MinisterMealTracker;