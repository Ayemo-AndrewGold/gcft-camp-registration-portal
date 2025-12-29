import React from 'react';

const CampLocation = () => {
  return (
    <section className="w-full px-6 sm:px-10 lg:px-16 py-12 bg-white dark:white font-[lexend]">
      <h2 className="text-2xl sm:text-3xl text-center text-[#0E0E1D] dark:[#0E0E1D] mb-4">
        📍 Camp Venue Location
      </h2>

      <p className="text-center text-[#6D6D6D] dark:text-[#0E0E1D] text-base sm:text-lg mb-2">
        Glorious Christian Fellowship Tabernacle Campground, Ijoko, Ogun State
      </p>

      <p className="text-center text-[#6D6D6D] dark:text-[#0E0E1D] text-base sm:text-lg mb-8">
        <b>Address</b>: 1, Salvation Avenue, Off Onipetesi Road, Behind Ijoko Market,<br />
        Ijoko, Sango Ota, Ogun State, Nigeria.
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
  );
};

export default CampLocation;