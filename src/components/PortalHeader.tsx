'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bell, Moon, Search, Sun, X } from 'lucide-react';

export default function PortalHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New camper registered', time: '5 min ago', unread: true },
    { id: 2, message: 'Bed allocation updated', time: '1 hour ago', unread: true },
    { id: 3, message: 'User verified successfully', time: '2 hours ago', unread: false },
    { id: 4, message: 'System maintenance scheduled', time: '5 hours ago', unread: false }
  ]);
  const [unreadCount, setUnreadCount] = useState(2);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);

    // Check initial state
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved) {
        setSidebarCollapsed(JSON.parse(saved));
      }
    }

    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
      // Broadcast theme change
      window.dispatchEvent(new CustomEvent('themeToggle', { detail: { isDarkMode: !isDarkMode } }));
    }
  };

  // Load theme preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
    }
  }, []);

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search logic here
      setShowSearch(false);
    }
  };

  // Handle Enter key for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Mark notifications as read
  const markAsRead = () => {
    setUnreadCount(0);
    setShowNotifications(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <>
      <header 
        className={`fixed top-0 right-0 h-16 border-b border-gray-200 shadow-md z-40 font-[lexend] transition-all duration-300 ease-in-out
          ${isDarkMode 
            ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800' 
            : 'bg-gradient-to-r from-blue-100 via-white to-purple-200'
          }
          left-0 pl-16
          lg:pl-0
          ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-65'}
        `}
      >
        <div className='h-full px-3 sm:px-4 md:px-6 flex items-center justify-between'>
          {/* Left Section */}
          <div className='flex items-center gap-2 sm:gap-3 md:gap-5 flex-1 min-w-0'>
            <h1 className={`font-semibold text-sm sm:text-base md:text-lg lg:text-xl truncate ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <span className='hidden md:inline'>Welcome to GCFT Portal 👋</span>
              <span className='md:hidden'>GCFT Portal 👋</span>
            </h1>
            
            {/* Desktop Search Bar */}
            <div className='hidden lg:block relative flex-shrink-0'>
              <div className={`flex items-center px-4 py-2 rounded-full border focus-within:ring-2 focus-within:border-transparent transition-all duration-200 shadow-sm hover:shadow-md ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 focus-within:ring-blue-500'
                  : 'bg-white border-gray-300 focus-within:ring-blue-400'
              }`}>
                <input
                  type='text'
                  placeholder='Search...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-48 xl:w-64 focus:outline-none bg-transparent ${
                    isDarkMode 
                      ? 'text-white placeholder-gray-400' 
                      : 'text-gray-700 placeholder-gray-400'
                  }`}
                />
                <button onClick={handleSearch} aria-label='Search'>
                  <Search className={`transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-blue-400' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`} size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`lg:hidden p-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-white hover:bg-gray-100'
              }`}
              aria-label='Toggle search'
            >
              <Search size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
            </button>

            {/* Notifications */}
            <div className='relative'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className={`relative p-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-white hover:bg-gray-100'
                }`}
                aria-label='Notifications'
              >
                <Bell size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
                {unreadCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center'>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl border py-2 z-50 max-h-[80vh] overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className={`flex items-center justify-between px-4 py-2 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Notifications
                    </h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className='max-h-96 overflow-y-auto'>
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          notif.unread 
                            ? isDarkMode 
                              ? 'bg-gray-700/50' 
                              : 'bg-blue-50' 
                            : ''
                        } ${
                          isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <p className={`text-sm ${
                          notif.unread 
                            ? isDarkMode ? 'font-semibold text-white' : 'font-semibold text-gray-800'
                            : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {notif.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className={`px-4 py-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={markAsRead}
                      className={`text-sm font-medium ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`relative flex items-center p-0.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
                  : 'bg-gradient-to-r from-gray-200 to-gray-300'
              }`}
              aria-label='Toggle dark mode'
            >
              <div
                className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
              <Sun
                size={20}
                className={`p-0.5 z-10 transition-colors duration-300 ${
                  !isDarkMode ? 'text-yellow-500' : 'text-gray-400'
                }`}
              />
              <Moon
                size={20}
                className={`p-0.5 z-10 transition-colors duration-300 ${
                  isDarkMode ? 'text-indigo-400' : 'text-gray-400'
                }`}
              />
            </button>

            {/* User Profile - Hidden on smallest screens */}
            <div className={`hidden sm:flex items-center gap-2 cursor-pointer px-2 md:px-3 py-1 rounded-full transition-all duration-200 ${
              isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-white/50'
            }`}>
              <Image
                src='/images/gcftLogo.png'
                alt='Portal Profile'
                width={40}
                height={40}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 ring-2 ${
                  isDarkMode ? 'ring-gray-600' : 'ring-blue-200'
                }`}
                priority
              />
              <div className='hidden md:block'>
                <h2 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  GCFT Portal
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className='lg:hidden absolute top-16 left-0 right-0 shadow-md p-3 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95'>
            <div className={`flex items-center px-4 py-2 rounded-full border focus-within:ring-2 focus-within:border-transparent transition-all duration-200 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 focus-within:ring-blue-500'
                : 'bg-gray-50 border-gray-300 focus-within:ring-blue-400'
            }`}>
              <input
                type='text'
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 focus:outline-none bg-transparent ${
                  isDarkMode 
                    ? 'text-white placeholder-gray-400' 
                    : 'text-gray-700 placeholder-gray-400'
                }`}
                autoFocus
              />
              <button onClick={handleSearch} aria-label='Search' className='mr-2'>
                <Search className={`transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-blue-400' 
                    : 'text-gray-500 hover:text-blue-600'
                }`} size={20} />
              </button>
              <button onClick={() => setShowSearch(false)} aria-label='Close search'>
                <X className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}