"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Header from "@/components/Header";

const Register: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

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

  const handleRegister = async () => {
    const cleanedPhone = phone.trim().replace(/\s+/g, "");
    if (!isValidPhoneNumber(cleanedPhone)) {
      toast.error("Enter a valid Nigerian or international phone number");
      return;
    }

    setLoading(true);
    try {
      // Only check if user exists - DO NOT create new record here
      const checkRes = await fetch(
        `${BASE_URL}/user/${encodeURIComponent(cleanedPhone)}`
      );

      if (checkRes.ok) {
        const existingUser = await checkRes.json();
        
        if (existingUser?.id && existingUser?.hall_name) {
          // Fully registered → go to successfulreg
          toast.success("🎉 Phone number already registered!");
          setTimeout(() => {
            router.push(`/successfulreg?phone=${encodeURIComponent(cleanedPhone)}`);
          }, 500);
          return;
        } else if (existingUser?.id && !existingUser?.hall_name) {
          // Registration incomplete → go to registration2
          toast("⚠️ Registration incomplete. Continuing registration...");
          setTimeout(() => {
            router.push(`/registeration2?phone=${encodeURIComponent(cleanedPhone)}`);
          }, 500);
          return;
        }
      }

      // User doesn't exist (404 or other error) - proceed to registration2 WITHOUT saving
      // The actual registration will happen on registration2 page
      toast.success("Let's get you registered!");
      setTimeout(() => {
        router.push(`/registeration2?phone=${encodeURIComponent(cleanedPhone)}`);
      }, 500);

    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    const cleanedPhone = phone.trim().replace(/\s+/g, "");
    if (!isValidPhoneNumber(cleanedPhone)) {
      toast.error("Please enter a valid phone number to check status");
      return;
    }

    setStatusLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/user/${encodeURIComponent(cleanedPhone)}`
      );

      if (res.ok) {
        const userData = await res.json();

        if (userData?.id && userData?.hall_name) {
          // Fully registered
          toast.success("Registration found!");
          router.push(`/successfulreg?phone=${encodeURIComponent(cleanedPhone)}`);
        } else if (userData?.id && !userData?.hall_name) {
          // Incomplete registration
          toast("⚠️ Registration incomplete. Continuing registration...");
          router.push(`/registeration2?phone=${encodeURIComponent(cleanedPhone)}`);
        } else {
          toast.error("No registration found for this number.");
        }
      } else {
        toast.error("No registration found for this number.");
      }
    } catch (error) {
      console.error("Status check error:", error);
      toast.error("Error checking status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <section
      className="w-full min-h-screen py-16 px-6 sm:px-10 lg:px-20 relative flex flex-col items-center justify-center bg-cover bg-center font-[lexend]"
      style={{ backgroundImage: `url('/images/campBg.jpg')` }}
    >
      <Header />
      <div className="absolute inset-0 bg-green-800/70"></div>

      <h1 className="text-[1.4rem] sm:text-3xl relative font-bold text-white mb-6">
        Get Your Hostel and Bedspace
      </h1>

      <div className="relative bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl p-10 sm:p-12 w-full max-w-md text-center space-y-6">
        <input
          type="tel"
          placeholder="e.g 08012345678 or +447911123456"
          className="w-full bg-white/80 text-black rounded-full px-6 py-3 outline-none placeholder:text-gray-700 border border-gray-300 focus:ring-2 focus:ring-green-400"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            className="flex flex-col items-center py-3 px-6 text-sm w-full sm:w-auto bg-green-600 ring-1 ring-white text-white rounded-lg font-semibold hover:opacity-80 transition-all duration-300 ease-in-out"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              "Register"
            )}
          </button>

          <button
            className="flex flex-col items-center py-3 px-6 text-sm w-full sm:w-auto bg-green-600 ring-1 ring-white text-white rounded-lg font-semibold hover:opacity-80 transition-all duration-300 ease-in-out"
            onClick={handleCheckStatus}
            disabled={statusLoading}
          >
            {statusLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Checking...
              </span>
            ) : (
              "Check Status"
            )}
          </button>
        </div>
      </div>

      <p className="text-sm relative text-white mt-4">
        Welcome to the 2026 Easter Camp Meeting!
      </p>
    </section>
  );
};

export default Register;