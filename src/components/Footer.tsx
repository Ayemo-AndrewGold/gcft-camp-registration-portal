'use client';
import Image from 'next/image'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {

  return (
    <footer className="bg-[#F4FFED] dark:bg-[#F4FFED] text-[#0E0E1D] dark:text-[#0E0E1D] pt-10 px-6 sm:px-16 font-[lexend]">
      <div className="max-w-[1440px] mx-auto flex flex-wrap justify-between gap-10 pb-16">

        {/* Newsletter */}
        <div className="w-full lg:w-[40%] space-y-4">
          <h1 className="text-2xl font-semibold">Newsletter</h1>
          <p className="text-sm">
            Get transformation stories, testimonies, and exclusive content in your inbox.
          </p>
          <div className="flex w-full border border-[#85C061] rounded-full overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 text-sm bg-transparent outline-none text-[#0E0E1D] dark:text-[#0E0E1D]"
            />
            <button
              aria-label="Subscribe"
              className="bg-[#85C061] text-white rounded-none px-4 text-sm"
            >Subscribe</button>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h2 className="mb-3 font-semibold text-lg">Explore</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#">About GCFT Church</a></li>
            <li><a href="#">Visit our website</a></li>
            <li><a href="#">Register</a></li>
            <li><a href="#">Donate</a></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h2 className="mb-3 font-semibold text-lg">Help & Legal</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <button
            aria-label="Request a Call"
            className="bg-[#85C061] text-white py-3 px-5 text-sm"
          >
            Request a Call
          </button>
          <ul className="text-sm space-y-1">
            <li><a href="tel:08064389914">08064389914</a></li>
            <li><a href="mailto:christftchurchtv@gmail.com">christftchurchtv@gmail.com</a></li>
          </ul>
        </div>
      </div>

      {/* Social & address */}
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 py-6 border-t border-gray-300 dark:border-gray-300">
        <div className="flex items-center gap-4">
          <a href="#">
            <FaFacebookF  size={30} className='text-white bg-blue-500 p-1 rounded-full' />
          </a>
          <a href="#">
           <FaLinkedinIn className='text-white bg-blue-700 p-1 rounded-full' size={30} />
          </a>
          <a href="#">
           <FaTwitter size={30} className='text-white bg-black p-1 rounded-full' />
          </a>
          <a href="#">
          <FaInstagram size={30} className='text-white bg-red-500 p-1 rounded-full' />
          </a>
        </div>
        <div className="text-sm text-center lg:text-left">
          <p>📍 1 Salvation Avenue, Ijoko, Ogun State</p>
          <a href="#" className="text-[#85C061] hover:underline">Sermon Books & Resources</a>
        </div>
      </div>

      {/* Bottom message */}
      <div className="text-center text-sm text-white bg-[#85C061] py-6 mt-4">
        <h1 className="font-semibold text-lg">Malachi 4:5 - Where the truth still exists</h1>
        <p>© 2025 Glorious Christian Fellowship Tabernacle. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
