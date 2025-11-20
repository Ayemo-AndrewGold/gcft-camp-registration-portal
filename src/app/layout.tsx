import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GCFT CAMP PORTAL",
  description: "Comprehensive digital platform for managing online camp registration.",
  icons: {
    icon: "/icons/logo.svg",
  },
  metadataBase: new URL("https://gcftcampregistrationportal.com"),
  openGraph: {
    title: "GCFT CAMP PORTAL",
    description: "Comprehensive digital platform for managing online camp registration.",
    url: "https://gcftcampregistrationportal.com",
    siteName: "GCFT CAMP PORTAL",
    images: [
      {
        url: "/icons/logo.svg", 
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
    images: ["/icon/gcftLogo.svg"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
