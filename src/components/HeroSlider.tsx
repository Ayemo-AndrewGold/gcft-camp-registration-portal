"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaFacebook, FaLinkedin, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaInstagram, FaX } from 'react-icons/fa6';
import toast from "react-hot-toast";

const HeroSlider = () => {
  const handleClick = () => {
    toast.error(
      "Registration has closed. Please come to the camp ground for manual registration."
    );
  };
  return (
    <section className="relative flex items-center justify-center min-h-screen md:pt-[6rem] bg-black overflow-hidden">
      {/* Background Video or Image */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover opacity-70"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/heroBg.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Sticky Social Icons */}
      {/* <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
        {[
          { icon: <FaFacebook size={15} />, href: '#' },
          { icon: <FaX size={15} className='text-black' />, href: '#' },
          { icon: <FaInstagram size={15} />, href: '#' },
          { icon: <FaYoutube size={15} />, href: '#' },
          { icon: <FaLinkedinIn size={16} />, href: '#' },
        ].map((item, i) => (
          <a
            key={i}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white p-[7px] rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
          >
            {item.icon}
          </a>
        ))}
      </div> */}

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl px-6 md:px-12 text-white">
        <h1
          className="text-4xl md:text-6xl font-extrabold leading-tight"
        >
          The Harvest
          <span className="text-green-200"> Is </span> 
          <span className="text-green-500">Ready!!</span>
        </h1>

        <p
          className="mt-6 text-lg text-gray-200 max-w-xl"
        >
          The seed has been planted, It was watered, It grew quietly. This is the moment we’ve been building toward. The time for preparation has passed, it’s time to gather.
        </p>

        <div >
          <button
            onClick={handleClick}
            className="
              mt-6 sm:mt-8
              bg-green-500 text-white font-semibold
              text-base sm:text-lg md:text-xl lg:text-2xl
              py-3 px-6 sm:py-4 sm:px-8 md:py-5 md:px-10
              w-full sm:w-auto
              rounded-lg shadow-lg
              hover:shadow-green-600/50
              transition
              cursor-not-allowed
            "
          >
            Registration has closed
          </button>
          <p
            className="
              flex items-start sm:items-center gap-2 sm:gap-3
              rounded-lg border border-red-500 bg-red-50
              px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4
              text-red-700 font-semibold
              text-sm sm:text-base md:text-lg
              animate-pulse mt-2
            "
          >
            <span className="inline-flex h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-red-500 shrink-0 mt-1 sm:mt-0" />
            
            <span className="leading-snug sm:leading-normal">
              ⚠️ All further registration will now take place at the camp ground.
            </span>
        </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;



