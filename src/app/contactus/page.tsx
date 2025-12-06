"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const ContactUs = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // Here you can add API submission logic
    console.log(formData);
    router.push("/bio-data"); // Redirect after submit
  };

  return (
    <>
      {/* Contact Form Section */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-16 py-20 flex flex-col md:flex-row justify-between gap-10 bg-white dark:bg-white text-[#0E0E1D] dark:text-[#0E0E1D]">
        <Header />
        {/* Left Side - Form */}
        <div className="flex-1 mt-8 space-y-8">
          <h1 className="text-3xl sm:text-4xl font-bold w-full sm:w-[70%] text-[#0E0E1D]">
            We’re Here to Help You Move Forward
          </h1>

          <div className="space-y-6 mt-6">
            <h2 className="text-2xl mb-4 font-semibold text-green-700">Send a Message</h2>

            <div className="flex flex-col sm:flex-row gap-6 w-full">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="flex-1 border-b border-[#0E0E1D] outline-none bg-transparent py-2 text-[#0E0E1D]"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="flex-1 border-b border-[#0E0E1D] outline-none bg-transparent py-2 text-[#0E0E1D]"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <textarea
              name="message"
              placeholder="Write your message..."
              className="w-full border-b border-[#0E0E1D] outline-none bg-transparent py-2 text-[#0E0E1D]"
              rows={4}
              value={formData.message}
              onChange={handleChange}
            />

            <button
              aria-label="Submit"
              className="mt-4 sm:py-4 py-3 px-5 sm:px-10 w-[210px] sm:w-[250px] lg:w-40 text-lg sm:text-base bg-black text-white rounded-lg hover:opacity-90 transition"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Right Side - Contact Info */}
        <div className="flex flex-col justify-start items-start md:items-start pt-2 sm:pt-20 flex-1 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0E0E1D]">Get In Touch</h2>
          <p className="text-[#0E0E1D] text-lg">info@gcft.com</p>
          <p className="text-[#0E0E1D] text-lg">08169159291</p>
        </div>
      </section>

      {/* Camp Venue Section */}
      <section className="w-full px-6 sm:px-10 lg:px-16 py-12 bg-white font-[lexend]">
        <h2 className="text-2xl sm:text-3xl text-center text-[#0E0E1D] mb-4">
          📍 Camp Venue Location
        </h2>

        <p className="text-center text-[#6D6D6D] text-base sm:text-lg mb-2">
          Glorious Christian Fellowship Tabernacle Campground, Ijoko, Ogun State
        </p>

        <p className="text-center text-[#6D6D6D] text-base sm:text-lg mb-8">
          <b>Address</b>: 1, Salvation Avenue, Off Onipetesi Road, Behind Ijoko Market,<br />
          Ijoko, Sango Ota, Ogun State, Nigeria
        </p>

        <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
          <iframe
            title="Camp Location Map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15850.9424251566!2d3.2741551!3d6.6905446!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b98cbdded3f11%3A0x4602a86fa4495a92!2sP7R9%2BXC7%2C%20Ijoko%20112105%2C%20Ogun%20State!5e0!3m2!1sen!2sng!4v1720251475391!5m2!1sen!2sng"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-[1440px] mx-auto px-4 sm:px-16 py-6 flex justify-between text-sm text-[#0E0E1D] font-[lexend] bg-white dark:bg-white text-[#0E0E1D] dark:text-[#0E0E1D]">
        <h2>2025 Where the truth still exists.</h2>
        <h2>Privacy</h2>
      </footer>
    </>
  );
};

export default ContactUs;
