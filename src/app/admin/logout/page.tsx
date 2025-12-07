"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const AdminLogout = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleConfirm = () => {
    // Clear admin auth if you store any token (optional)
    localStorage.removeItem("admin_token");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="bg-linear-to-t font-[lexend] from-green-100 via-white to-green-200 w-full mt-4 p-3 rounded-lg shadow-md">
      <section className="bg-white h-screen rounded-lg shadow-md p-5 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Logout</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-red-700 transition-all"
        >
          Logout
        </button>
      </section>

      {/* 🔥 Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-[90%] max-w-md shadow-xl text-center animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You will need to log in again to access the admin panel.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Small fade-in animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogout;
