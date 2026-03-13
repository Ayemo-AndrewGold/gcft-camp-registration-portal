import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ChatWidget from "@/components/ChatWidget";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";

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
        <Toaster position="top-right" reverseOrder={false} containerStyle={{ zIndex: 2147483647 }}/>
        <ChatWidget />

        {/* Facebook Pixel Code */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2278068076054716');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
            src="https://www.facebook.com/tr?id=2278068076054716&ev=PageView&noscript=1"
          />
        </noscript>
      </body>
    </html>
  );
}