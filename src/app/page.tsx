import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FigmaHero from "@/components/landing/FigmaHero";
import FigmaNewArrival from "@/components/landing/FigmaNewArrival";
import FigmaBestSellers from "@/components/landing/FigmaBestSellers";
import FigmaStartJourney from "@/components/landing/FigmaStartJourney";
import FigmaCollaboration from "@/components/landing/FigmaCollaboration";
import FigmaAuthorizedPartners from "@/components/landing/FigmaAuthorizedPartners";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-clip bg-[#030303] text-[#FAF9F6] font-sans selection:bg-[#BFDD25] selection:text-[#030303]">
      {/* 1. Global Navbar (Preserved from Project) */}
      <Navbar />

      <main className="relative w-full flex flex-col gap-16 lg:gap-24">
        {/* 2. Hero Section: BLESSING 3 + Moondrop Watermark (Figma Frame 17) */}
        <FigmaHero />

        {/* 3. New Arrival Section: Category Tabs + Product Grid (Figma Frame 17) */}
        <FigmaNewArrival />

        {/* 4. Best Sellers Section: Sennheiser Editorial Showcase (Figma Frame 17) */}
        <FigmaBestSellers />

        {/* 5. Start Your Journey Here: Bento Grid for Beginners (Figma Frame 125) */}
        <FigmaStartJourney />

        {/* 6. Collaboration Showcase: Honkai Star Rail x Moondrop Sparxie TWS (Figma Frame 121) */}
        <FigmaCollaboration />

        {/* 7. Authorized Partners: OUR AUTHORIZED PARTNERS (Figma Frame 17) */}
        <FigmaAuthorizedPartners />
      </main>

      {/* 8. Global Footer (Preserved from Project) */}
      <Footer />
    </div>
  );
}
