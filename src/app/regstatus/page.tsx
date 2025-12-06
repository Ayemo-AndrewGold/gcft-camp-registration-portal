"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

const CheckStatus = () => {
  const [phone, setPhone] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://gcft-camp.onrender.com/api/v1";

  const handleCheck = async () => {
    if (!phone.trim()) {
      toast.error("Enter a valid phone number");
      return;
    }

    setLoading(true);
    setUserData(null);

    try {
      const res = await fetch(
        `${BASE_URL}/user/${encodeURIComponent(phone.trim())}`
      );

      if (res.ok) {
        const data = await res.json();
        setUserData(data); // store backend response
      } else {
        toast.error("No registration found for that phone number.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to check status. Try again.");
    }

    setLoading(false);
  };

  return (
    <section className="w-full py-16 px-6 sm:px-10 lg:px-20 bg-[#F5F5F5] font-[lexend]">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Check Registration Status</h2>

        <input
          type="text"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
        />

        <button
          onClick={handleCheck}
          disabled={loading}
          className="px-6 py-2 text-sm bg-[#85C061] text-white rounded-lg"
        >
          {loading ? "Checking..." : "Check Status"}
        </button>

        {/* Success result */}
        {userData && (
          <div className="mt-6 text-left bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2 text-green-700">
              ✅ Registration Found
            </h3>

            <p><strong>Name:</strong> {userData.first_name}</p>
            <p><strong>Hall:</strong> {userData.hall_name}</p>
            <p><strong>Floor:</strong> {userData.display_floor}</p>
            <p><strong>Bed:</strong> {userData.bed_number}</p>
            <p><strong>Extra Beds:</strong> {userData.extra_beds?.join(", ") || 0}</p>
            <p><strong>Phone:</strong> {userData.phone_number}</p>
          </div>
        )}

        {/* Not found message handled by toast */}
      </div>
    </section>
  );
};

export default CheckStatus;
