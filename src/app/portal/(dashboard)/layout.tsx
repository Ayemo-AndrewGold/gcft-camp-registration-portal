// app/admin/(dashboard)/layout.tsx
import { ReactNode } from "react";

import ClientLayout from "@/components/ClientLayout"; // wrapper for client components
import PortalLayout from "@/components/PortalLayout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    
      <PortalLayout>
        {children}
      </PortalLayout>
      
   
  );
}