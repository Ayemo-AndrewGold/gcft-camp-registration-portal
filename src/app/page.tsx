"use client";

import CampLocation from "@/components/CampLocation";
import Countdown from "@/components/Countdown";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HeroSlider from "@/components/HeroSlider";
import PreviousCamp from "@/components/PreviousCamp";
import RegisteredCampersCount from "@/components/RegisteredCampers";


export default function Home() {
  return (
    <div className="min-h-screen items-center justify-center bg-white font-[lexend] dark:bg-white text-[#0E0E1D] dark:text-[#0E0E1D]">
      <Header />
      <Hero />
      <HeroSlider />
      <Countdown targetDate="2026-04-02T09:00:00" />
      <RegisteredCampersCount />
      <PreviousCamp />
      <CampLocation />
      {/* Footer */}
      <Footer />
    </div>
  );
}
