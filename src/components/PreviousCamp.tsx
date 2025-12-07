'use client';

import Image from "next/image";
import Link from "next/link";

const PreviousCamp = () => {
  // Array of images for the grid gallery (Card 1) - 9 images for 3x3 grid
  const galleryImages = [
    '/images/img2021camp10.jpg',
    '/images/img2021camp11.jpg',
    '/images/img2021camp12.jpg',
    '/images/img2021camp13.jpg',
    '/images/img2021camp14.jpg',
    '/images/img2021camp15.jpg',
    '/images/img2021camp16.jpg',
    '/images/img2021camp17.jpg',
    '/images/img2021camp18.jpg',
  ];

  // Array of images for thumbnail strip at bottom - 5 images
  const thumbnailImages = [
    '/images/img2021camp62.jpg',
    '/images/img2021camp60.jpg',
    '/images/img2021camp67.jpg',
    '/images/img2021camp68.jpg',
    '/images/img2021camp70.jpg',
  ];

  // Fixed heights for waveform pattern (no Math.random to avoid hydration mismatch)
  const waveformHeights = [
    '69%', '52%', '23%', '42%', '66%', '64%', '70%', '78%', 
    '45%', '76%', '67%', '46%', '47%', '64%', '34%', '75%',
    '54%', '62%', '42%', '74%'
  ];

  return (
    <section className="w-full bg-gradient-to-br from-[#F4FFED] to-[#E8F5E0] font-[lexend] py-8 px-4 mt-10 sm:px-16">
      <div className="max-w-[1440px] mx-auto">
        {/* Heading with subtitle */}
        <div className="text-center mb-12">
          <h1 className="text-[#000000] text-[1.8rem] sm:text-4xl font-bold mb-3">
            Previous Camp Meetings
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Relive the powerful moments and access recordings from our past camp services
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto">

          {/* Card 1 - Past Moments Gallery */}
          <Link 
            href="/pastmoment"
            className="group relative bg-white w-full lg:flex-1 min-h-[320px] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
          >
            {/* Background Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#85C061]/20 to-[#85C061]/90 z-[2]"></div>
            
            {/* Grid of actual camp images */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#85C061] to-[#6BA850]">
              <div className="absolute inset-0 opacity-30">
                <div className="grid grid-cols-3 grid-rows-3 h-full gap-2 p-4">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="relative bg-white/30 rounded overflow-hidden"> 
                      <Image 
                        src={img}
                        alt={`Camp moment ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col mt-12 sm:mt-0 justify-end p-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 group-hover:bg-white transition-colors duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-[#85C061] p-3 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                    </svg>
                  </div>
                  <h2 className="text-[#000000] text-xl sm:text-2xl font-bold">
                    Photo Gallery
                  </h2>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-2">
                  Browse through memorable moments captured during our camp meetings
                </p>
                <div className="flex items-center text-[#85C061] font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                  <span>View Photos</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#85C061] z-20">
              📸 Images
            </div>
          </Link>

          {/* Card 2 - Download Services */}
          <Link
            href="/previouscampservice"
            className="group relative bg-white w-full lg:flex-1 min-h-[320px] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#85C061]/20 to-[#85C061]/90 z-[2]"></div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-[#6BA850] to-[#85C061]">
              {/* Waveform pattern to suggest audio/video */}
              <div className="absolute inset-0 opacity-20 flex items-center justify-center gap-1 px-8">
                {waveformHeights.map((height, i) => (
                  <div 
                    key={i} 
                    className="bg-white/40 w-2 rounded-full"
                    style={{ height }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end mt-12 sm:mt-0 p-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 group-hover:bg-white transition-colors duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-[#85C061] p-3 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h2 className="text-[#000000] text-xl sm:text-2xl font-bold">
                    Service Archives
                  </h2>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-2">
                  Explore past camp service audio and video archives. catch up on messages
                </p>
                <div className="flex items-center text-[#85C061] font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                  <span>View Now</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#85C061] z-20">
              🎥 Media
            </div>
          </Link>

        </div>

        {/* Thumbnail preview strip with different images */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">Recent Uploads</p>
          <div className="flex justify-center gap-2 flex-wrap max-w-3xl mx-auto">
            {thumbnailImages.map((img, i) => (
              <div 
                key={i} 
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Image 
                  src={img}
                  alt={`Recent upload ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviousCamp;