'use client';

import PortalHeader from "@/components/PortalHeader";
import PortalSidebar from "@/components/PortalSidebar";
import { ReactNode, useState, useEffect } from "react";

export default function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Listen for sidebar toggle events to adjust main content
  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);

    // Check initial state from localStorage
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

  // Listen for theme toggle events (same pattern as PortalSidebar)
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isDarkMode: boolean }>;
      setIsDarkMode(customEvent.detail.isDarkMode);
    };

    window.addEventListener('themeToggle', handleThemeChange);

    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') setIsDarkMode(true);
    }

    return () => window.removeEventListener('themeToggle', handleThemeChange);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <PortalHeader />
      
      {/* Sidebar */}
      <PortalSidebar />
      
      {/* Main Content Area */}
      <main 
        className={`
          ml-0
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-65'}
          pt-16
          min-h-screen 
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Content Container with Professional Styling */}
        <div className="max-w-[1600px] mx-auto px-2 sm:px-2">
          {/* Content wrapper with responsive padding */}
          <div className={`backdrop-blur-sm p-2 sm:p-2 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-7rem)] transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-900/60 shadow-gray-900/50'
              : 'bg-white/50'
          }`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}