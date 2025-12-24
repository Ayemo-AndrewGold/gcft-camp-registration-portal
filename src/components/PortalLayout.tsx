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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
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
          <div className="bg-white/50 backdrop-blur-sm p-2 sm:p-2 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-7rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}