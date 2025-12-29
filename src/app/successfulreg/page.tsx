
"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import Image from "next/image";


interface TicketData {
  id: number;
  first_name?: string;
  hall_name?: string;
  floor?: string;
  extra_beds?: number[];
  phone_number?: string;
  bed_number?: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://gcft-camp.onrender.com/api/v1";

const SuccessfulRegContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const ticketRef = useRef<HTMLDivElement>(null);

  const phone = searchParams.get("phone");

  useEffect(() => {
    if (!phone) {
      router.push("/register");
      return;
    }

    const fetchUser = async () => {
      const maxRetries = 3;
      let attempt = 0;
      
      while (attempt < maxRetries) {
        try {
          // Small delay between attempts (except first one)
          if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
            toast.loading(`Retrieving your ticket... (Attempt ${attempt + 1})`, { id: 'fetch' });
          }
          
          const res = await fetch(`${BASE_URL}/user/${encodeURIComponent(phone)}`);
          if (!res.ok) throw new Error("Failed to fetch user data");

          const user: TicketData = await res.json();
          if (!user?.id) throw new Error("User not found");

          setTicketData(user);
          toast.dismiss('fetch');
          setLoading(false);
          return; // Success, exit function
          
        } catch (err: unknown) {
          attempt++;
          console.error(`Fetch attempt ${attempt} failed:`, err);
          
          if (attempt >= maxRetries) {
            // All retries exhausted
            const msg = err instanceof Error ? err.message : "Error fetching user data";
            toast.error(msg, { id: 'fetch' });
            router.push("/register");
            setLoading(false);
          }
        }
      }
    };

    fetchUser();
  }, [phone, router]);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current || !ticketData) {
      toast.error("Ticket element not found!");
      return;
    }

    setDownloading(true);
    toast.loading("Preparing your ticket...", { id: "download" });

    try {
      // Create PDF directly without html2canvas
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;

      // Add header
      pdf.setFillColor(16, 185, 129); // Green color
      pdf.rect(margin, yPosition, contentWidth, 40, 'F');

      //logo
      const logo = "/images/gcftLogo.png"; // use PNG
      const logoWidth = 38;
      const logoHeight = 35;
      const x = (pageWidth - logoWidth) / 2;
      pdf.addImage(
        logo,
        "PNG",
        x,
        yPosition + 1,
        logoWidth,
        logoHeight,
      );

      
      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      const title = "Congratulations!";
      pdf.text(title, pageWidth / 2, yPosition + 15, { align: "center" });
      
      pdf.setFontSize(12);
      const subtitle = "Welcome to Glorious Christian Fellowship Tabernacle 2026 Easter Camp Meeting";
      pdf.text(subtitle, pageWidth / 2, yPosition + 28, { align: "center" });
      
      yPosition += 50;

      // Bedspace Details Box
      pdf.setFillColor(249, 250, 251); // Light gray
      pdf.rect(margin, yPosition, contentWidth, 80, 'F');
      pdf.setDrawColor(209, 213, 219);
      pdf.rect(margin, yPosition, contentWidth, 80, 'S');
      
      yPosition += 10;
      
      // Section Title
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont("helvetica", "bold");
      const sectionTitle = "Bedspace Details";
      pdf.text(sectionTitle, margin + 5, yPosition);
      
      yPosition += 10;
      
      // Details
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      const details = [
        { label: "Name:", value: ticketData.first_name || "N/A" },
        { label: "Hall:", value: ticketData.hall_name || "N/A" },
        { label: "Floor:", value: ticketData.floor || "N/A" },
        { label: "Bedspace:", value: ticketData.bed_number?.toString() || "N/A" },
        { label: "Phone:", value: ticketData.phone_number || "N/A" },
        { label: "Extra Beds:", value: ticketData.extra_beds?.join(", ") || "None" },
      ];

      details.forEach((detail) => {
        pdf.setTextColor(75, 85, 99);
        pdf.text(detail.label, margin + 5, yPosition);
        
        pdf.setTextColor(31, 41, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text(detail.value, margin + 40, yPosition);
        pdf.setFont("helvetica", "normal");
        
        yPosition += 8;
      });

      yPosition += 10;

      // Important Notice
      pdf.setFillColor(254, 243, 199); // Yellow background
      pdf.rect(margin, yPosition, contentWidth, 20, 'F');
      pdf.setDrawColor(251, 191, 36);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, margin, yPosition + 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(146, 64, 14);
      pdf.setFont("helvetica", "bold");
      const importantLabel = "Important:";
      pdf.text(importantLabel, margin + 5, yPosition + 8);
      pdf.setFont("helvetica", "normal");
      const importantText = "Please save this ticket. You will need it during the camp meeting.";
      pdf.text(importantText, margin + 5, yPosition + 15);

      // Save the PDF
      pdf.save(`Camp-Meeting-Ticket-${ticketData.first_name || 'Guest'}.pdf`);
      toast.success("🎉 Ticket downloaded successfully!", { id: "download" });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download ticket. Please try again.", { id: "download" });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-green-800">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticketData) return null;

  return (
    <section
      className="w-full min-h-screen flex flex-col items-center justify-center font-[lexend] px-4 py-6 bg-cover bg-center relative"
      style={{ backgroundImage: `url('/images/campBg.jpg')` }}
    >
      <div className="absolute inset-0 bg-green-800/70"></div>

      <div
        ref={ticketRef}
        className="relative bg-linear-to-br from-green-400 to-blue-500 rounded-3xl shadow-2xl w-full max-w-md flex flex-col items-center text-center p-8 space-y-6 z-10"
      >
        <Image
          src="/images/congratIcon.svg"
          alt="Congratulations"
          width={80}
          height={80}
          priority
          className="w-20 h-20 mb-2"
        />

        <h1 className="text-3xl font-bold text-white">Congratulations!</h1>
        <p className="text-white">
          Welcome to <span className="font-semibold">2026 Easter Camp Meeting</span>
        </p>

        <div className="bg-gray-50 border rounded-2xl shadow-inner w-full p-6 text-left space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Bedspace Details</h2>
            <Image
              src="/images/bookmark.svg"
              alt="Bedspace Icon"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Name:</span>
              <span className="text-gray-800 font-semibold">{ticketData.first_name}</span>
            </div>
            
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Hall:</span>
              <span className="text-gray-800 font-semibold">{ticketData.hall_name}</span>
            </div>
            
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Floor:</span>
              <span className="text-gray-800 font-semibold">{ticketData.floor}</span>
            </div>
            
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Bedspace:</span>
              <span className="text-gray-800 font-semibold">{ticketData.bed_number}</span>
            </div>
            
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 font-medium">Phone:</span>
              <span className="text-gray-800 font-semibold">{ticketData.phone_number}</span>
            </div>
            
            {ticketData.extra_beds && ticketData.extra_beds.length > 0 && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600 font-medium">Extra Beds:</span>
                <span className="text-gray-800 font-semibold">
                  {ticketData.extra_beds.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 w-full rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Please save this ticket. You will need it during the camp meeting.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 z-10">
        <button
          aria-label="Download Ticket"
          onClick={handleDownloadTicket}
          disabled={downloading}
          className={`px-8 py-3 text-white font-semibold rounded-lg shadow-lg transition ${
            downloading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {downloading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Downloading...
            </span>
          ) : (
            "📥 Download Ticket"
          )}
        </button>
        
        <button
          aria-label="Home"
          onClick={() => router.push("/")}
          className="px-8 py-3 text-white font-semibold bg-gray-700 rounded-lg hover:bg-gray-800 transition shadow-lg"
        >
          🏠 Home
        </button>
      </div>
    </section>
  );
};

const SuccessfulReg: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-green-800">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your ticket...</p>
        </div>
      </div>
    }>
      <SuccessfulRegContent />
    </Suspense>
  );
};

export default SuccessfulReg;