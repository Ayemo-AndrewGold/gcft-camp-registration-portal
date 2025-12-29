// app/admin/(dashboard)/layout.tsx
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
