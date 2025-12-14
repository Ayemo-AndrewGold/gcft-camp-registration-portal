"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, User, Phone, Home, Calendar } from "lucide-react";

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
  local_assembly: string;
  hall_name?: string;
  floor?: string;
  bed_number?: string;
  is_active?: boolean;
}

const Portal: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const router = useRouter();
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://gcft-camp.onrender.com/api/v1";

  const isValidPhoneNumber = (phone: string) => {
    const cleaned = phone.trim().replace(/\s+/g, "");
    const nigeriaRegex = /^(0|\+234)[789][01]\d{8}$/;
    const intlRegex = /^\+[\d]{10,15}$/;
    return nigeriaRegex.test(cleaned) || intlRegex.test(cleaned);
  };

  const handleCheckStatus = async () => {
    const cleanedPhone = phone.trim().replace(/\s+/g, "");
    if (!isValidPhoneNumber(cleanedPhone)) {
      toast.error("Please enter a valid phone number");
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
        setUserData(data);

        if (data?.hall_name) {
          toast.success("✅ User registration found!");
        } else {
          toast.error("⚠️ Registration incomplete - no bed allocation yet");
        }
      } else {
        toast.error("❌ No registration found for this number");
        setUserData(null);
      }
    } catch (error) {
      console.error("Status check error:", error);
      toast.error("Error checking status. Please try again.");
      setUserData(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleActivateUser = async () => {
    if (!userData) return;

    const cleanedPhone = phone.trim().replace(/\s+/g, "");
    setActivating(true);

    try {
      const res = await fetch(
        `${BASE_URL}/activate-user/${encodeURIComponent(cleanedPhone)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const activatedUser: UserData = await res.json();
        setUserData(activatedUser);
        toast.success("🎉 User activated successfully!");
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || "Failed to activate user");
      }
    } catch (error) {
      console.error("Activation error:", error);
      toast.error("Error activating user. Please try again.");
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
      className="w-full min-h-screen py-16 px-6 sm:px-10 lg:px-20 relative flex flex-col items-center justify-center bg-cover bg-center font-[lexend]"
      style={{ backgroundImage: `url('/images/campBg.jpg')` }}
    >
      <div className="absolute inset-0 bg-green-800/70"></div>

      <h1 className="text-[1.4rem] sm:text-3xl relative font-bold text-white mb-6">
        VERIFY REGISTRANT
      </h1>

      <div className="relative bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl p-10 sm:p-12 w-full max-w-2xl text-center space-y-6">
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

        {/* User Details Card */}
        {userData && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
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
                  <p className="font-semibold text-gray-800">{userData.state}, {userData.country}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-gray-500 mt-1 flex items-center justify-center">
                  <span className="text-sm">⛪</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assembly</p>
                  <p className="font-semibold text-gray-800">{userData.local_assembly}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {userData.hall_name && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={handleActivateUser}
                  disabled={activating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activating ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Activating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Activate User
                    </>
                  )}
                </button>

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