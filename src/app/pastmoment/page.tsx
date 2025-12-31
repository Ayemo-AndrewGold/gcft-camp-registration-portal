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





// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Footer from "@/components/Footer";

// const API_BASE = "https://gcft-camp.onrender.com/api/v1";

// interface Category {
//   id: number;
//   category_name: string;
// }

// interface ImageItem {
//   id: number;
//   image_name: string;
//   image_url: string;
//   category_id: number;
//   status: string;
// }

// const PastMoment = () => {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const [images, setImages] = useState<ImageItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState<number | null>(null);
//   const [direction, setDirection] = useState(0);
//   const [loadingImage, setLoadingImage] = useState(true);

//   // Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/categories/`);
//         if (res.ok) {
//           const data = await res.json();
//           setCategories(data);
//           if (data.length > 0) {
//             setSelectedCategory(data[0].id);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCategories();
//   }, []);

//   // Fetch images when category changes
//   useEffect(() => {
//     if (selectedCategory) {
//       const fetchImages = async () => {
//         setLoading(true);
//         try {
//           const res = await fetch(`${API_BASE}/${selectedCategory}/images/`);
//           if (res.ok) {
//             const data = await res.json();
//             console.log('Fetched images:', data); // Debug log
//             // Show images with status 'active' or 'in-use'
//             const visibleImages = data.filter((img: ImageItem) => 
//               img.status === 'active' || img.status === 'in-use'
//             );
//             setImages(visibleImages);
//           }
//         } catch (error) {
//           console.error('Error fetching images:', error);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchImages();
//     }
//   }, [selectedCategory]);

//   const openLightbox = (index: number) => {
//     setCurrentIndex(index);
//     setLoadingImage(true);
//   };

//   const closeLightbox = () => setCurrentIndex(null);

//   const showPrev = () => {
//     if (currentIndex === null) return;
//     setDirection(-1);
//     setCurrentIndex((currentIndex - 1 + images.length) % images.length);
//     setLoadingImage(true);
//   };

//   const showNext = () => {
//     if (currentIndex === null) return;
//     setDirection(1);
//     setCurrentIndex((currentIndex + 1) % images.length);
//     setLoadingImage(true);
//   };

//   // Keyboard navigation
//   useEffect(() => {
//     if (currentIndex === null) return;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "ArrowLeft") showPrev();
//       if (e.key === "ArrowRight") showNext();
//       if (e.key === "Escape") closeLightbox();
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [currentIndex]);

//   const variants = {
//     enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
//     center: { x: 0, opacity: 1, transition: { duration: 0.4 } },
//     exit: (dir: number) => ({
//       x: dir > 0 ? -200 : 200,
//       opacity: 0,
//       transition: { duration: 0.4 },
//     }),
//   };

//   return (
//     <section className="w-full bg-white font-sans">
//       <div className="sm:px-10 lg:px-20 px-5 py-20">
//         {/* Title */}
//         <div className="max-w-[1440px] mx-auto text-center mb-12">
//           <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent mb-4">
//             Camp Meeting Gallery
//           </h1>
//           <p className="text-gray-600 max-w-2xl mx-auto text-lg">
//             Relive the special moments from our Easter Camp meetings through these beautiful memories.
//           </p>
//         </div>

//         {/* Category Filter */}
//         <div className="flex justify-center gap-3 sm:gap-4 mb-10 flex-wrap max-w-4xl mx-auto">
//           {categories.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => setSelectedCategory(category.id)}
//               className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base
//               ${
//                 selectedCategory === category.id
//                   ? "bg-green-600 text-white shadow-lg scale-105"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
//               }`}
//             >
//               {category.category_name}
//             </button>
//           ))}
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="flex justify-center items-center py-20">
//             <div className="flex flex-col items-center gap-4">
//               <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
//               <p className="text-gray-600 font-medium">Loading gallery...</p>
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && images.length === 0 && (
//           <div className="text-center py-20">
//             <div className="text-8xl mb-6">📷</div>
//             <h3 className="text-2xl font-bold text-gray-800 mb-3">No Images Yet</h3>
//             <p className="text-gray-600 max-w-md mx-auto">
//               Images for this category will be added soon. Check back later!
//             </p>
//           </div>
//         )}

//         {/* Masonry Grid */}
//         {!loading && images.length > 0 && (
//           <motion.div 
//             className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             {images.map((img, idx) => (
//               <motion.div
//                 key={img.id}
//                 className="mb-4 sm:mb-6 break-inside-avoid relative group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
//                 onClick={() => openLightbox(idx)}
//                 initial={{ opacity: 0, y: 50, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ duration: 0.5, delay: idx * 0.05 }}
//                 whileHover={{ y: -8 }}
//               >
//                 <img
//                   src={img.image_url}
//                   alt={img.image_name}
//                   className="w-full rounded-xl sm:rounded-2xl object-cover transition-transform duration-500 group-hover:scale-110"
//                   loading="lazy"
//                 />

//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                   <p className="text-white text-base sm:text-lg font-semibold px-4 pb-4 sm:pb-6 text-center w-full">
//                     {img.image_name}
//                   </p>
//                 </div>

//                 {/* View Icon */}
//                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
//                   <svg 
//                     className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" 
//                     fill="none" 
//                     stroke="currentColor" 
//                     viewBox="0 0 24 24"
//                   >
//                     <path 
//                       strokeLinecap="round" 
//                       strokeLinejoin="round" 
//                       strokeWidth={2} 
//                       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
//                     />
//                   </svg>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}

//         {/* Lightbox */}
//         {currentIndex !== null && images[currentIndex] && (
//           <div className="fixed inset-0 bg-black/95 flex flex-col justify-center items-center z-50 p-4 sm:p-6">
//             {/* Close Button */}
//             <button
//               className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white hover:text-gray-300 transition-colors z-10"
//               onClick={closeLightbox}
//               aria-label="Close"
//             >
//               <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>

//             {/* Previous Button */}
//             <button
//               className="absolute left-2 sm:left-6 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3"
//               onClick={showPrev}
//               aria-label="Previous"
//             >
//               <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>

//             {/* Image Container */}
//             <AnimatePresence custom={direction} initial={false}>
//               <motion.div
//                 key={images[currentIndex].id}
//                 custom={direction}
//                 variants={variants}
//                 initial="enter"
//                 animate="center"
//                 exit="exit"
//                 className="flex flex-col justify-center items-center max-w-7xl w-full"
//               >
//                 {loadingImage && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
//                   </div>
//                 )}

//                 <img
//                   src={images[currentIndex].image_url}
//                   alt={images[currentIndex].image_name}
//                   onLoad={() => setLoadingImage(false)}
//                   className={`max-h-[60vh] sm:max-h-[75vh] max-w-[90vw] sm:max-w-full rounded-lg shadow-2xl mb-4 sm:mb-6 transition-opacity duration-300 object-contain ${
//                     loadingImage ? "opacity-0" : "opacity-100"
//                   }`}
//                 />

//                 {/* Caption */}
//                 <div className="bg-white/10 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-lg max-w-2xl">
//                   <p className="text-white text-base sm:text-lg font-semibold text-center">
//                     {images[currentIndex].image_name}
//                   </p>
//                 </div>

//                 {/* Image Counter */}
//                 <p className="text-white/70 text-sm mt-3">
//                   {currentIndex + 1} / {images.length}
//                 </p>
//               </motion.div>
//             </AnimatePresence>

//             {/* Next Button */}
//             <button
//               className="absolute right-2 sm:right-6 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3"
//               onClick={showNext}
//               aria-label="Next"
//             >
//               <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </button>
//           </div>
//         )}
//       </div>
//       <Footer />
//     </section>
//   );
// };

// export default PastMoment;
