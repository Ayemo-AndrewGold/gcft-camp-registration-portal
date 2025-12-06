"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type YearImage = { src: string; caption: string };

const galleryByYear: Record<string, YearImage[]> = {
      "2021": [
      { src: "/images/img2021camp1.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp2.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp3.jpg", caption: "2021 Camp Meeting - Pastor Billy Joseph" },
      { src: "/images/img2021camp4.jpg", caption: "2021 Camp Meeting - Pastor Billy Ministering" },
      { src: "/images/img2021camp5.jpg", caption: "2021 Camp Meeting - Pastor Richard" },
      { src: "/images/img2021camp6.jpg", caption: "2021 Camp Meeting - Prayer session" },
      { src: "/images/img2021camp7.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp8.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp9.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp10.jpg", caption: "2021 Camp Meeting - Pastor Richard" },
      { src: "/images/img2021camp11.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp12.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp13.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp14.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp15.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp16.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp17.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp18.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp19.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp20.jpg", caption: "2021 Camp Meeting - Song Service" },
      { src: "/images/img2021camp21.jpg", caption: "2021 Camp  - Song Service" },
      { src: "/images/img2021camp22.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp23.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp24.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp25.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp26.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp27.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp28.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp29.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp30.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp31.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp32.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp33.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp34.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp35.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp36.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp37.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp38.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp39.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp40.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp41.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp42.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp43.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp44.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp45.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp46.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp47.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp48.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp49.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp50.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp51.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp52.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp53.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp54.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp55.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp56.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp57.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp58.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp59.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp60.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp61.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp62.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp63.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp64.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp65.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp66.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp67.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp68.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp69.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp70.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp71.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp72.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp73.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp74.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp75.jpg", caption: "2021 Camp Meeting" },
      { src: "/images/img2021camp76.jpg", caption: "2021 Camp Meeting" },
      // add more...
    ],
  "2023": [
    { src: "/images/img1.jpg", caption: "Camp 2023 – Opening Ceremony" },
    { src: "/images/img2.jpg", caption: "Youth Fellowship Worship Night" },
    { src: "/images/img3.jpg", caption: "Campfire Testimony Session" },
    // add more...
  ],
  "2024": [
    { src: "/images/2024-img1.jpg", caption: "Camp 2024 – Arrival & Registration" },
    { src: "/images/2024-img2.jpg", caption: "Praise Night 2024" },
    // add more...
  ],
  "2025": [
    { src: "/images/2025-img1.jpg", caption: "Camp 2025 – Worship Session" },
    // add more...
  ],
};

const PastMoment = () => {
  const years = Object.keys(galleryByYear);
  const [selectedYear, setSelectedYear] = useState("2023");
  const images = galleryByYear[selectedYear];

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const [loadingImage, setLoadingImage] = useState(true);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLoadingImage(true);
  };

  const closeLightbox = () => setCurrentIndex(null);

  const showPrev = () => {
    if (currentIndex === null) return;
    setDirection(-1);
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
    setLoadingImage(true);
  };

  const showNext = () => {
    if (currentIndex === null) return;
    setDirection(1);
    setCurrentIndex((currentIndex + 1) % images.length);
    setLoadingImage(true);
  };

  // keyboard navigation
  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      transition: { duration: 0.4 },
    }),
  };

  return (
    <section className="w-full bg-white font-[lexend] bg-white dark:white text-[#0E0E1D] dark:text-[#0E0E1D]">
      <div className="sm:px-10 lg:px-20 px-5 pt-25">
        <Header />

        {/* Title */}
        <div className="max-w-[1440px] mx-auto text-center mb-10">
          <h1 className="text-3xl font-bold bg-linear-to-r from-green-700 to-lime-400 bg-clip-text text-transparent">
            Past Camp Moment
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A collection of special memories from past camp meetings.
          </p>
        </div>

        {/* YEAR FILTER */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-full border transition-all duration-300 
              ${
                selectedYear === year
                  ? "bg-green-700 text-white border-green-700 shadow-md"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <motion.div className="columns-1 sm:columns-2 md:columns-3 gap-6">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              className="mb-6 break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition"
              onClick={() => openLightbox(idx)}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={img.src}
                alt={img.caption}
                width={400}
                height={300}
                className="w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105"
                blurDataURL="/images/placeholder.jpg"
                placeholder="blur"
                loading="lazy"
                quality={70}
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <p className="text-white text-lg font-medium px-3 text-center">
                  {img.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lightbox */}
        {currentIndex !== null && (
          <div className="fixed inset-0 bg-black/90 flex flex-col justify-center items-center z-50 p-6">
            <button
              className="absolute top-6 right-6 text-white text-3xl font-bold"
              onClick={closeLightbox}
            >
              &times;
            </button>

            <button
              className="absolute left-6 text-white text-4xl font-bold"
              onClick={showPrev}
            >
              &#10094;
            </button>

            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={images[currentIndex].src}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex justify-center items-center"
              >
                {loadingImage && (
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                )}

                <Image
                  src={images[currentIndex].src}
                  alt={images[currentIndex].caption}
                  width={800}
                  height={600}
                  onLoadingComplete={() => setLoadingImage(false)}
                  blurDataURL="/images/placeholder.jpg"
                  placeholder="blur"
                  loading="lazy"
                  quality={70}
                  className={`max-h-[70vh] max-w-[90vw] rounded-lg shadow-lg mb-4 transition-opacity duration-300 ${
                    loadingImage ? "opacity-0" : "opacity-100"
                  }`}
                />
              </motion.div>
            </AnimatePresence>

            <p className="text-white text-lg text-center max-w-2xl">
              {images[currentIndex].caption}
            </p>

            <button
              className="absolute right-6 text-white text-4xl font-bold"
              onClick={showNext}
            >
              &#10095;
            </button>
          </div>
        )}
      </div>

      <Footer />
    </section>
  );
};

export default PastMoment;
