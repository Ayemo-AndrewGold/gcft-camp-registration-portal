"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, User, Phone, Home, Calendar, AlertCircle, Heart } from "lucide-react";

interface UserData {
  id: number;
  first_name: string;
  phone_number: string;
  category: string;
  age_range: string;
  marital_status: string;
  country: string;
  state: string;
  arrival_date: string;
  local_assembly: string | null;
  local_assembly_address?: string | null;
  hall_name?: string;
  floor?: string;
  bed_number?: string;
  extra_beds?: number[];
  is_active?: boolean;
  profile_picture_url?: string;
  medical_issues?: string | null;
}

const Portal: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const router = useRouter();
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://gcft-camp.onrender.com/api/v1";

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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isValidPhoneNumber = (phone: string) => {
    const cleaned = phone.trim().replace(/\s+/g, "");
    const nigeriaRegex = /^(0|\+234)[789][01]\d{8}$/;
    const intlRegex = /^\+[\d]{10,15}$/;
    return nigeriaRegex.test(cleaned) || intlRegex.test(cleaned);
  };

  const handleCheckStatus = async () => {
    const cleanedPhone = phone.trim().replace(/\s+/g, "");
    if (!isValidPhoneNumber(cleanedPhone)) {
      showToast("Please enter a valid phone number", 'error');
      return;
    }

    setStatusLoading(true);
    setUserData(null);

    try {
      const res = await fetch(
        `${BASE_URL}/user/${encodeURIComponent(cleanedPhone)}`
      );

      if (res.ok) {
        const data: UserData = await res.json();

        if (!Array.isArray(data.extra_beds)) {
          data.extra_beds = [];
        }

        console.log("User data fetched:", data);
        console.log("Extra beds:", data.extra_beds);

        try {
          const activeUsersRes = await fetch(`${BASE_URL}/active-users`);
          if (activeUsersRes.ok) {
            const activeUsers = await activeUsersRes.json();
            const isVerified = activeUsers.some(
              (u: any) => u.phone_number === cleanedPhone
            );
            data.is_active = isVerified;
          }
        } catch (err) {
          console.error("Error checking verification status:", err);
          data.is_active = false;
        }

        setUserData(data);

        if (data?.hall_name) {
          if (data.is_active) {
            showToast("✅ User is registered and verified!", 'success');
          } else {
            showToast("✅ User registered but not yet verified", 'success');
          }
        } else {
          showToast("⚠️ Registration incomplete - no bed allocation yet", 'error');
        }
      } else {
        showToast("❌ No registration found for this number", 'error');
        setUserData(null);
      }
    } catch (error) {
      console.error("Status check error:", error);
      showToast("Error checking status. Please try again.", 'error');
      setUserData(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleActivateUser = async () => {
    if (!userData) return;

    const cleanedPhone = userData.phone_number.trim().replace(/\s+/g, "");
    setActivating(true);

    try {
      const res = await fetch(
        `${BASE_URL}/activate-user/${encodeURIComponent(cleanedPhone)}?number=${encodeURIComponent(cleanedPhone)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const activatedUser: UserData = await res.json();
        setUserData({
          ...userData,
          is_active: true,
          ...activatedUser,
          extra_beds: Array.isArray(activatedUser.extra_beds) ? activatedUser.extra_beds : userData.extra_beds
        });

        showToast("🎉 User verified successfully!", 'success');
      } else {
        const errorText = await res.text();
        let errorMessage = "Failed to verify user";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        showToast(`❌ ${errorMessage}`, 'error');
      }
    } catch (error: any) {
      showToast(`❌ ${error.message || "Error verifying user. Please try again."}`, 'error');
    } finally {
      setActivating(false);
    }
  };

  const handleViewTicket = () => {
    if (userData?.phone_number) {
      router.push(`/successfulreg?phone=${encodeURIComponent(userData.phone_number)}`);
    }
  };

  return (
    <section
      className="w-full min-h-screen py-16 px-3 sm:px-10 lg:px-20 relative flex flex-col items-center justify-center bg-cover bg-center font-[lexend]"
      style={{ backgroundImage: `url('/images/campBg.jpg')` }}
    >
      <div className="absolute inset-0 bg-green-800/70"></div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <h1 className="text-[1.4rem] sm:text-3xl relative font-bold text-white mb-6">
        VERIFY REGISTRANT
      </h1>

      <div className="relative bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl py-5 px-2 sm:p-12 w-full max-w-2xl text-center space-y-6">
        <input
          type="tel"
          placeholder="e.g 08012345678 or +447911123456"
          className="w-full bg-white/80 text-black rounded-full px-6 py-3 outline-none placeholder:text-gray-700 border border-gray-300 focus:ring-2 focus:ring-green-400"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCheckStatus();
            }
          }}
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            className="flex items-center justify-center gap-2 py-3 px-6 text-sm w-full sm:w-auto bg-green-600 ring-1 ring-white text-white rounded-lg font-semibold hover:opacity-80 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCheckStatus}
            disabled={statusLoading || !phone}
          >
            {statusLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Checking...
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                Check Status
              </>
            )}
          </button>
        </div>

        {userData && (
          <div className={`mt-3 sm:mt-8 rounded-2xl shadow-xl p-6 text-left space-y-4 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}>
            {/* Profile Picture */}
            <div className="flex justify-center mb-5">
              {userData.profile_picture_url ? (
                <button
                  onClick={() => window.open(userData.profile_picture_url, "_blank")}
                  className="sm:w-52 w-32 h-32 sm:h-52 rounded-full overflow-hidden text-black bg-green-200 border-4 border-green-600 shadow-xl hover:opacity-90 transition group relative"
                >
                  <img
                    src={userData.profile_picture_url}
                    alt={userData.first_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/campBg.jpg";
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-sm font-medium">Click to view photo</span>
                  </div>
                </button>
              ) : (
                <div className={`sm:w-52 w-32 h-32 sm:h-52 rounded-full border-4 border-green-600 flex items-center justify-center shadow-xl ${isDarkMode ? "bg-green-900/40" : "bg-green-200"}`}>
                  <User className={`sm:w-28 w-16 sm:h-28 h-16 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                </div>
              )}
            </div>

            {/* Header row */}
            <div className={`flex items-center justify-between border-b pb-4 ${isDarkMode ? "border-gray-700" : ""}`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>User Details</h2>
              <div className="flex flex-col items-end gap-1">
                {userData.hall_name ? (
                  <span className="flex items-center gap-2 text-green-500 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Registered
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-orange-500 font-semibold">
                    <XCircle className="w-5 h-5" />
                    Incomplete
                  </span>
                )}
                {userData.is_active ? (
                  <span className="flex items-center gap-1 text-blue-400 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-500 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <User className="w-5 h-5" />, label: "Name", value: userData.first_name },
                { icon: <Phone className="w-5 h-5" />, label: "Phone", value: userData.phone_number },
                { icon: <span className="text-sm">📋</span>, label: "Category", value: userData.category },
                { icon: <Calendar className="w-5 h-5" />, label: "Arrival Date", value: userData.arrival_date },
                { icon: <span className="text-sm">🩺</span>, label: "Medical Issues", value: userData.medical_issues || "None" },
                ...(userData.hall_name ? [
                  { icon: <Home className="w-5 h-5" />, label: "Hall", value: userData.hall_name },
                  { icon: <span className="text-sm">🛏️</span>, label: "Bed", value: `Floor ${userData.floor} - Bed ${userData.bed_number}` },
                ] : []),
                { icon: <span className="text-sm">🌍</span>, label: "Location", value: `${userData.state || "N/A"}, ${userData.country}` },
                { icon: <span className="text-sm">⛪</span>, label: "Assembly", value: userData.local_assembly || "N/A" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={`w-5 h-5 mt-1 flex items-center justify-center shrink-0 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {icon}
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
                    <p className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Extra Beds */}
            {userData.extra_beds && userData.extra_beds.length > 0 && (
              <div className={`border-2 rounded-lg p-4 mt-4 ${isDarkMode ? "bg-purple-900/20 border-purple-700" : "bg-purple-50 border-purple-200"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🛏️</span>
                  <h3 className={`font-semibold ${isDarkMode ? "text-purple-300" : "text-purple-900"}`}>Extra Beds Assigned</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userData.extra_beds.map((bed, idx) => (
                    <span
                      key={idx}
                      className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm ${
                        isDarkMode ? "bg-purple-800/50 text-purple-300" : "bg-purple-200 text-purple-800"
                      }`}
                    >
                      Bed {bed}
                    </span>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${isDarkMode ? "text-purple-400" : "text-purple-700"}`}>
                  This user has been allocated {userData.extra_beds.length} additional bed{userData.extra_beds.length > 1 ? 's' : ''} for nursing mother requirements.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {userData.hall_name && (
              <div className={`flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t ${isDarkMode ? "border-gray-700" : ""}`}>
                {!userData.is_active ? (
                  <button
                    onClick={handleActivateUser}
                    disabled={activating}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {activating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Verify User
                      </>
                    )}
                  </button>
                ) : (
                  <div className={`flex-1 border-2 border-green-500 rounded-lg p-3 flex items-center justify-center gap-2 ${isDarkMode ? "bg-green-900/20" : "bg-green-50"}`}>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className={`font-semibold ${isDarkMode ? "text-green-400" : "text-green-800"}`}>User Already Verified</span>
                  </div>
                )}

                <button
                  onClick={handleViewTicket}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  <span>🎫</span>
                  View Ticket
                </button>
              </div>
            )}

            {!userData.hall_name && (
              <div className={`border-l-4 border-orange-500 p-4 rounded mt-4 ${isDarkMode ? "bg-orange-900/20" : "bg-orange-50"}`}>
                <p className={`text-sm ${isDarkMode ? "text-orange-300" : "text-orange-800"}`}>
                  <strong>Note:</strong> This user hasn't completed registration yet. No bed has been allocated.
                </p>
              </div>
            )}

            {userData.hall_name && !userData.is_active && (
              <div className={`border-l-4 border-blue-500 p-4 rounded mt-4 ${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
                <p className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}>
                  <strong>Action Required:</strong> Click "Verify User" to activate this registration and allow the user to access their ticket.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-sm relative text-white mt-4">
        All attendees must be verified
      </p>
    </section>
  );
};

export default Portal;