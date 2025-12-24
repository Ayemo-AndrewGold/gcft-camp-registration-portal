// app/admin/(dashboard)/layout.tsx
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import { ReactNode } from "react";
import DarkModeProvider from "@/components/DarkModeProvider"; // make sure provider is client
import ClientLayout from "@/components/ClientLayout"; // wrapper for client components

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DarkModeProvider>
      <ClientLayout>{children}</ClientLayout>
    </DarkModeProvider>
  );
}
