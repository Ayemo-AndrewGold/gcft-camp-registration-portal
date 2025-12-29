"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, User, Phone, Home, Calendar, AlertCircle } from "lucide-react";

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
}

const Portal: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const router = useRouter();
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://gcft-camp.onrender.com/api/v1";

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
        
        // Ensure extra_beds is always an array
        if (!Array.isArray(data.extra_beds)) {
          data.extra_beds = [];
        }
        
        console.log("User data fetched:", data);
        console.log("Extra beds:", data.extra_beds);
        
        // Check if user is verified
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
          <div className="mt-3 sm:mt-8 bg-white rounded-2xl shadow-xl p-6 text-left space-y-4">
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
                <div className="sm:w-52 w-32 h-32 sm:h-52 bg-green-200 rounded-full border-4 border-green-600 flex items-center justify-center shadow-xl">
                  <User className="sm:w-28 w-16 sm:h-28 h-16 text-gray-600" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
              <div className="flex flex-col items-end gap-1">
                {userData.hall_name ? (
                  <span className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Registered
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-orange-600 font-semibold">
                    <XCircle className="w-5 h-5" />
                    Incomplete
                  </span>
                )}
                {userData.is_active ? (
                  <span className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-800">{userData.first_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-800">{userData.phone_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-gray-500 mt-1 flex items-center justify-center">
                  <span className="text-sm">📋</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-semibold text-gray-800">{userData.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Arrival Date</p>
                  <p className="font-semibold text-gray-800">{userData.arrival_date}</p>
                </div>
              </div>

              {userData.hall_name && (
                <>
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Hall</p>
                      <p className="font-semibold text-gray-800">{userData.hall_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-gray-500 mt-1 flex items-center justify-center">
                      <span className="text-sm">🛏️</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bed</p>
                      <p className="font-semibold text-gray-800">
                        Floor {userData.floor} - Bed {userData.bed_number}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-gray-500 mt-1 flex items-center justify-center">
                  <span className="text-sm">🌍</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-gray-800">
                    {userData.state || "N/A"}, {userData.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-gray-500 mt-1 flex items-center justify-center">
                  <span className="text-sm">⛪</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assembly</p>
                  <p className="font-semibold text-gray-800">
                    {userData.local_assembly || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Extra Beds Section - NEW! */}
            {userData.extra_beds && userData.extra_beds.length > 0 && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 text-purple-600 flex items-center justify-center">
                    <span className="text-lg">🛏️</span>
                  </div>
                  <h3 className="font-semibold text-purple-900">Extra Beds Assigned</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userData.extra_beds.map((bed, idx) => (
                    <span 
                      key={idx} 
                      className="inline-block px-3 py-1.5 bg-purple-200 text-purple-800 rounded-lg text-sm font-medium shadow-sm"
                    >
                      Bed {bed}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  This user has been allocated {userData.extra_beds.length} additional bed{userData.extra_beds.length > 1 ? 's' : ''} for nursing mother requirements.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {userData.hall_name && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
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
                  <div className="flex-1 bg-green-50 border-2 border-green-500 rounded-lg p-3 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">User Already Verified</span>
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
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded mt-4">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> This user hasn't completed registration yet. No bed has been allocated.
                </p>
              </div>
            )}

            {userData.hall_name && !userData.is_active && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
                <p className="text-sm text-blue-800">
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