'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiOutlineDashboard } from 'react-icons/ai';
import { FiMenu, FiX } from 'react-icons/fi';
import { Hotel, User, LogOut} from "lucide-react";
import Image from 'next/image';
import { useRouter } from "next/navigation";


export default function PortalSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  

  const router = useRouter();

    const handleLogout = async () => {
      await fetch("/api/portal/logout", {
        method: "POST",
    });

      router.replace("/portal/login");
    };

  const links = [
    {href: '/portal/dashboard', label: 'Verify Campers', icon: AiOutlineDashboard},
    {href: '/portal/verifiedcampers', label: 'Verified Campers', icon: User},
    {href: '/portal/allcampers', label: 'All Campers', icon: Hotel},
    {href: '/portal/manualreg', label: 'Manual Reallocation', icon: User},
    {href: '/portal/backupreg', label: ' Backup Registration', icon: User},
  ];

  const pathname = usePathname();

  // Broadcast sidebar state changes to other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed } }));
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Load saved state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved) {
        setIsCollapsed(JSON.parse(saved));
      }
    }
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isDarkMode: boolean }>;
      setIsDarkMode(customEvent.detail.isDarkMode);
    };

    window.addEventListener('themeToggle', handleThemeChange);

    // Check initial theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
    }

    return () => {
      window.removeEventListener('themeToggle', handleThemeChange);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Hamburger Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`fixed top-4 left-4 z-[60] lg:hidden p-1 rounded-lg shadow-lg transition-all duration-200 ${
          isDarkMode
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-800'
        }`}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-whhite bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          ${isCollapsed ? 'lg:w-20' : 'lg:w-65'}
          fixed left-0 top-0 h-screen shadow-md p-4 font-[lexend] transition-all duration-300 ease-in-out z-50
          ${isDarkMode
            ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 border-gray-700'
            : 'bg-gradient-to-b from-blue-100 via-white to-green-300'
          }
          w-72 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header with Logo and Toggle Button */}
        <div className='flex items-center justify-between mb-6'>
          <div className={`flex items-center font-semibold text-[1.2rem] gap-1 overflow-hidden transition-all duration-300 ${isCollapsed && 'lg:opacity-0 lg:w-0'}`}>
            <Image
              src='/images/gcftLogo.svg'
              alt='GCFT Logo'
              height={60}
              width={60}
              priority
              className='bg-white p-1 rounded-full'
            />
            <h2 className={isDarkMode ? 'text-blue-400' : 'text-green-600'}>
              GCFT PORTAL
            </h2>
          </div>
          
          {/* Collapsed Logo - Desktop only */}
          {isCollapsed && (
            <div className='hidden lg:flex justify-center w-full'>
              <Image
                src='/images/gcftLogo.svg'
                alt='GCFT Logo'
                height={40}
                width={40}
                priority
                className='bg-white p-1 rounded-full'
              />
            </div>
          )}
        </div>

        {/* Desktop Toggle Button - Hidden on mobile */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='hidden lg:block absolute -right-3 top-8 bg-gradient-to-l from-blue-300 to-green-500 text-white p-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10'
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiMenu size={13} /> : <FiX size={20} />}
        </button>

        {/* Navigation */}
        <nav className='flex flex-col gap-2 mt-4'>
          {!isCollapsed && (
            <p className={`font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              General
            </p>
          )}
          
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={`${label}-${href}`}
              href={href}
              className={`flex items-center gap-3 p-2 transition-all duration-200 group relative ${
                pathname === href
                  ? 'text-pink-100 bg-gradient-to-l from-green-600 via-green-400 to-green-600 font-bold rounded-[2rem]'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gradient-to-l from-gray-700 via-gray-800 to-gray-700 hover:rounded-[2rem] hover:font-semibold'
                  : 'text-gray-900 hover:bg-gradient-to-l from-blue-200 via-white to-purple-300 hover:rounded-[2rem] hover:font-semibold'
              } ${isCollapsed ? 'lg:justify-center' : ''}`}
              title={isCollapsed ? label : ''}
            >
              <span className={`border rounded-full text-gray-800 p-[0.3rem] transition-all duration-200 ${
                pathname === href 
                  ? 'text-white bg-white rounded-[2rem]' 
                  : isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                <Icon 
                  size={20} 
                  className={
                    pathname === href 
                      ? 'text-green-600' 
                      : isDarkMode 
                      ? 'text-gray-300 group-hover:text-blue-400' 
                      : 'group-hover:text-indigo-600'
                  } 
                />
              </span>
              
              <span className={`whitespace-nowrap transition-all duration-300 ${
                isCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'
              }`}>
                {label}
              </span>

              {/* Tooltip for collapsed state - Desktop only */}
              {isCollapsed && (
                <span className='hidden lg:block absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg'>
                  {label}
                </span>
              )}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 p-2 mt-20 transition-all duration-200 group ${
              isDarkMode
                ? "text-gray-300 hover:bg-gradient-to-l from-gray-700 via-gray-800 to-gray-700 hover:rounded-[2rem]"
                : "text-gray-900 hover:bg-gradient-to-l from-blue-200 via-white to-purple-300 hover:rounded-[2rem]"
            } ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <span className={`border rounded-full p-[0.3rem] ${
              isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
            }`}>
              <LogOut size={20} />
            </span>

            <span
              className={`whitespace-nowrap transition-all duration-300 ${
                isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"
              }`}
            >
              Logout
            </span>
          </button>

        </nav>

        {/* Mobile: Logout/Close button at bottom */}
        <div className="absolute bottom-4 left-4 right-4 lg:hidden">
          <button
            onClick={() => setIsMobileOpen(false)}
            className={`w-full p-3 rounded-lg font-semibold transition-all ${
              isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Close Menu
          </button>
        </div>
      </aside>
    </>
  );
}