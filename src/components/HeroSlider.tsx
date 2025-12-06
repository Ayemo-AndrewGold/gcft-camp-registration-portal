"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselImages = [
    { imgURL: '/images/img1.jpg'},
    { imgURL: '/images/img2.jpg', },
    { imgURL: '/images/img3.jpg', },
    { imgURL: '/images/img4.jpg', },
  ]

  // Auto slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full flex flex-col justify-center items-center relative  border-transparent overflow-hidden bg-white dark:bg-white text-[#0E0E1D] dark:text-[#0E0E1D]">
      <div
        className="relative w-full h-[50vh] md:h-[80vh]  flex items-center justify-center text-white"
        style={{
          backgroundImage: `url(${carouselImages[currentSlide].imgURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        {/* Navigation buttons - hide on small screens */}
        <button
          className="hidden md:block absolute left-4 z-10"
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
            )
          }
        >
          <Image
            src='/images/arrowLeft.svg'
            alt="Previous"
            height={30}
            width={30}
            className="bg-[#85C061] border rounded-full"
          />
        </button>
        <button
          className="hidden md:block absolute right-4 z-10"
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
          }
        >
          <Image
            src='/images/arrowRight.svg'
            alt="Next"
            height={30}
            width={30}
            className="bg-[#85C061] border rounded-full"
          />
        </button>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#000000ab] bg-opacity-50 z-0" />

        {/* Text on top of background */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-[montserrat] mb-4">
            The Awaiting Moment
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Prepare your heart and register early for the upcoming camp meeting.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row mt-5 sm:mt-0 gap-8 justify-center items-center">
            <button
              className="bg-[#85C061] text-white py-5 px-10 sm:mt-30 text-center text-[1.5rem]  sm:text-[1.5rem] font-semibold rounded-lg hover:bg-[#6fa045] transition duration-300"
              onClick={() => window.location.href = '/register'}
            >
              Click Here To Register
            </button>
          </div>
      
    </section>
  );
};

export default HeroSlider;
