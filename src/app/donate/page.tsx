"use client";

import Header from "@/components/Header";
import React, { useState } from "react";
// import { PaystackButton } from "react-paystack";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface DonateProps {
  campBg?: string; // Optional background image path
}

const Donate: React.FC<DonateProps> = ({ campBg = "/images/campBg.jpg" }) => {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_0b1ea391835b7d2ad1127c37a2720efa5f7fef02";

  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string | number>("");
  const [email, setEmail] = useState("");

  const quickAmounts = [50000, 100000, 300000];

  const isDisabled = !name || !email || !amount || Number(amount) <= 0;

  const handleSuccess = () => {
    toast.success(`🎉 Thank you, ${name || "Donor"}! Your support means a lot.`);
    setAmount("");
    setEmail("");
    setName("");
  };

  const handleClose = () => {
    toast.info("❌ Transaction cancelled");
  };

  const componentProps = {
    email,
    amount: Number(amount) * 100, // Paystack expects kobo
    publicKey,
    text: "Donate Now",
    onSuccess: handleSuccess,
    onClose: handleClose,
    channels: ["card", "bank", "ussd", "mobile_money"],
    metadata: {
      custom_fields: [
        {
          display_name: "Donor Name",
          variable_name: "donor_name",
          value: name,
        },
      ],
    },
  };

  return (
    <section
      className="w-full py-16 px-6 sm:px-10 lg:px-20 relative min-h-screen flex items-center justify-center font-[lexend] bg-cover bg-center"
      style={{ backgroundImage: `url(${campBg})` }}
    >
      <Header />
      {/* Green overlay */}
      <div className="absolute inset-0 bg-green-800/60"></div>

      {/* Card */}
      <div className="relative z-10 bg-white/30 backdrop-blur-md mt-10 p-8 sm:p-12 rounded-3xl shadow-2xl text-gray-800 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Support Our Campers 🙌
        </h1>
        <p className="text-gray-700 text-center mb-6">
          Your donation helps us provide resources and opportunities for campers. Every contribution makes a difference. 💙
        </p>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="mb-4">
          <p className="text-gray-700 font-medium mb-2">Quick Donate</p>
          <div className="flex gap-3 flex-wrap">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`px-4 py-2 rounded-lg border font-semibold transition ${
                  Number(amount) === amt
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Custom Amount (₦)</label>
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Paystack Button */}
        {/* <PaystackButton
          {...componentProps}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition duration-300 ${
            isDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          disabled={isDisabled}
        /> */}

        {/* Note */}
        <p className="text-sm text-center text-gray-600 mt-3">
          💡 You can pay with Card, Bank Transfer, USSD, or wallets like Opay & Moniepoint.
        </p>

        {/* Toast Container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </section>
  );
};

export default Donate;
