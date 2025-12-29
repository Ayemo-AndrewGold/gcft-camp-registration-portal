

import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ChatWidget from "@/components/ChatWidget";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "GCFT CAMP PORTAL",
  description: "Comprehensive digital platform for managing online camp registration.",
  icons: {
    icon: "/images/gcftLogo.svg",
  },
  metadataBase: new URL("https://gcft-camp-registration-portal.vercel.app/"),
  openGraph: {
    title: "GCFT CAMP PORTAL",
    description: "Comprehensive digital platform for managing online camp registration.",
    url: "https://gcft-camp-registration-portal.vercel.app/",
    siteName: "GCFT CAMP PORTAL",
    images: [
      {
        url: "/images/gcftLogo.svg",
        width: 1200,
        height: 630,
        alt: "GCFT CAMP PORTAL",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GCFT CAMP PORTAL",
    description: "Comprehensive digital platform for managing online camp registration.",
    images: ["/images/gcftLogo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} antialiased`}
      >
        {children}
        {/* Safe Toaster */}
        <Toaster position="top-right" reverseOrder={false} />
        <ChatWidget />
      </body>
    </html>
  );
}
