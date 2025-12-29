'use client';

import React from 'react'
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const ConditionalSIdebarHeader = () => {
  const pathname = usePathname();
  const hideAdminHeaderOn = ['/admin/login']
  const hideAdminSidebarOn = ['/admin/login']
  const showAdminHeader = !hideAdminHeaderOn.some(path => pathname.startsWith(path));
  const showAdminSidebar = !hideAdminSidebarOn.some(path => pathname.startsWith(path));

  return (
    <div>
      {showAdminHeader ? <AdminHeader /> : null}
      {showAdminSidebar ? <AdminSidebar /> : null}
    </div>
  )
}

export default ConditionalSIdebarHeader;