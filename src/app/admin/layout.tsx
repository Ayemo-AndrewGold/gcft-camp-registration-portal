import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AdminHeader />
      <AdminSidebar />
      <main className="ml-65 pt-16 p-2 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}