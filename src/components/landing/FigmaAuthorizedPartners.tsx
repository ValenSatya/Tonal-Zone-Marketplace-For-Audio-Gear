import React from "react";
import Link from "next/link";

const PARTNERS = [
  "SENNHEISER",
  "SONY",
  "MOONDROP",
  "TANGZU",
  "FIIO",
  "64 AUDIO",
  "EPZ",
  "THIEAUDIO",
];

export default function FigmaAuthorizedPartners() {
  return (
    <section className="w-full bg-[#090808] py-36 lg:py-48">
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 text-center">
        
        {/* Title: "OUR AUTHORIZED PARTNERS" - General Sans */}
        <div className="max-w-[845px] mx-auto mb-20">
          <h2 className="font-sans font-bold text-4xl sm:text-6xl lg:text-[64px] leading-[78px] tracking-[2.2px] text-white uppercase text-center">
            OUR AUTHORIZED PARTNERS
          </h2>
        </div>

        {/* Partners Grid - General Sans */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {PARTNERS.map((partner) => (
            <Link
              key={partner}
              href={`/collection?search=${encodeURIComponent(partner)}`}
              className="h-[100px] border border-[#2b2b2b] hover:border-[#d4ff00] bg-[#141414] flex items-center justify-center p-6 transition-colors group cursor-pointer"
            >
              <span className="font-sans font-bold text-lg text-[#c4c7c8] group-hover:text-white transition-colors tracking-widest uppercase">
                {partner}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
