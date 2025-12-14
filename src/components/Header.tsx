'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const Header = () => {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/register', label: 'Register' },
    { href: '/donate', label: 'Donate' },
    { href: '/contactus', label: 'Contact Us' }
  ];

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const toggleProfile = () => setProfileOpen((prev) => !prev);

  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md font-[lexend]">
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-16 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/gcftLogo.svg"
            alt="gcft Logo"
            width={60}
            height={60}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex gap-10 items-center">
          {navLinks.map(({ href, label }) => (
            <li key={label}>
              <Link
                href={href}
                className={`text-base font-medium transition duration-300 ${
                  pathname === href
                    ? 'text-[#85C061]'
                    : 'text-[#0E0E1D] hover:text-[#85C061]'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              className="text-sm font-semibold text-[#0E0E1D] hover:text-[#85C061]"
            >
              Profile ▼
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-2 space-y-2 z-50 font-[lexend]">
                <Link
                  href="/register"
                  className="block text-sm text-[#0E0E1D] hover:text-[#85C061]"
                >
                  Check Status
                </Link>
                <Link
                  href="/register"
                  className="block text-sm text-[#0E0E1D] hover:text-[#85C061]"
                >
                  Book Space
                </Link>
              </div>
            )}
          </div>
        </ul>

        {/* Hamburger Icon */}
        <div className="lg:hidden z-50">
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="flex flex-col gap-[5px] w-8 h-8 items-center justify-center"
          >
            <span
              className={`h-0.5 w-6 bg-black transition-transform duration-300 ${
                menuOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-black transition-opacity duration-300 ${
                menuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-black transition-transform duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Slide-in Nav */}
      {menuOpen && (
        <div className="fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white z-40 shadow-lg p-6 pt-24 flex flex-col gap-6 font-[lexend]">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={closeMenu}
              className={`text-base font-medium ${
                pathname === href
                  ? 'text-[#85C061]'
                  : 'text-[#0E0E1D] hover:text-[#85C061]'
              }`}
            >
              {label}
            </Link>
          ))}
          <hr className="border-gray-300" />
          <Link
            href="/register"
            onClick={closeMenu}
            className="text-base font-medium text-[#0E0E1D] hover:text-[#85C061]"
          >
            Check Status
          </Link>
          <Link
            href="/register"
            onClick={closeMenu}
            className="text-base font-medium text-[#0E0E1D] hover:text-[#85C061]"
          >
            Book Space
          </Link>
        </div>
      )}

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={closeMenu}
        />
      )}
    </header>
  );
};

export default Header;
