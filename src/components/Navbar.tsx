"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import MotionButton from "./MotionButton";
import CartDrawer from "./CartDrawer";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const SEARCH_CATALOG = [
  { id: "s1", name: "Moondrop Blessing 3", category: "IN-EAR MONITORS", price: 319.99, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800", href: "/collection" },
  { id: "s2", name: "Simgot EA1000 Fermat", category: "IN-EAR MONITORS", price: 219.99, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800", href: "/collection" },
  { id: "s3", name: "Kiwi Ears Orchestra Lite", category: "IN-EAR MONITORS", price: 249, image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800", href: "/collection" },
  { id: "s4", name: "Sennheiser HD 560S Reference", category: "HEADPHONE", price: 199, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800", href: "/collection" },
  { id: "s5", name: "FiiO K7 Balanced DAC/AMP", category: "DAC/AMP", price: 199.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", href: "/collection" },
  { id: "s6", name: "Sony NW-A306 Android Walkman DAP", category: "PORTABLE AUDIO", price: 349.99, image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800", href: "/collection" },
  { id: "s7", name: "Thieaudio Monarch MKIII Flagship", category: "IN-EAR MONITORS", price: 999, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800", href: "/collection" },
  { id: "s8", name: "Tangzu Nezha Flagship Tribrid", category: "IN-EAR MONITORS", price: 399, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", href: "/collection" },
];

const SEARCH_CATEGORIES = [
  "IN-EAR MONITORS",
  "TWS",
  "HEADPHONE",
  "DAC/AMP",
  "ACCESSORIES",
  "FLAGSHIP MODELS",
  "PORTABLE AUDIO",
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { formatPrice } = useLocation();
  const { isCartOpen, setIsCartOpen, totalCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [userSession, setUserSession] = useState<{ name: string; email: string; avatar?: string; isSeller?: boolean; sellerStatus?: string } | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const checkUser = () => {
      try {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          setUserSession(JSON.parse(stored));
        } else {
          setUserSession(null);
        }
      } catch (e) {
        setUserSession(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("userLoginChange", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("userLoginChange", checkUser);
    };
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isHomePage = pathname === "/";
  const isDarkNav = !isHomePage || isScrolled;

  React.useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 50);
          
          if (currentScrollY > lastScrollY && currentScrollY > 200) {
            setIsHidden(true);
          } else {
            setIsHidden(false);
          }
          
          lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredSearchProducts = useMemo(() => {
    if (!searchQuery.trim()) return SEARCH_CATALOG.slice(0, 4);
    const q = searchQuery.toLowerCase();
    return SEARCH_CATALOG.filter(
      (item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const getNavClass = (isActive: boolean) => {
    if (isActive) {
      return isDarkNav 
        ? "text-[#D4FF00] border-b-2 border-[#D4FF00]" 
        : "text-[#0e0e0e] border-b-2 border-[#0e0e0e]";
    }
    return isDarkNav
      ? "text-[#FAF9F6] hover:text-[#D4FF00] border-b-2 border-transparent"
      : "text-[#0e0e0e]/70 hover:text-[#0e0e0e] border-b-2 border-transparent";
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
          isDarkNav
            ? "bg-[#0e0e0e]/90 backdrop-blur-md border-b border-[#444748] shadow-lg"
            : "bg-transparent backdrop-blur-none border-b border-transparent shadow-none"
        } ${isHidden && !isSearchOpen ? "-translate-y-full" : "translate-y-0"}`}
      >
      <div className="flex h-20 items-center justify-between px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Tonal Zone Logo"
              width={40}
              height={40}
              className={`w-full h-full object-contain group-hover:rotate-180 transition-all duration-700 ease-in-out ${!isDarkNav ? 'brightness-0' : ''}`}
            />
          </div>
          <span className={`font-heading text-2xl font-bold tracking-tight mt-0.5 transition-colors duration-300 ${
            isDarkNav ? "text-[#FAF9F6]" : "text-[#0e0e0e]"
          }`}>
            Tonalzone
          </span>
        </Link>

        {/* Center Navigation Capsule */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {/* HOME Dropdown */}
          <div className="relative group h-full flex items-center">
            <Link
              href="/"
              className={`relative text-[10px] uppercase tracking-[0.2em] font-extrabold py-1 transition-colors ${getNavClass(pathname === "/")}`}
            >
              {t("nav.home")}
            </Link>

            {/* Dropdown Box */}
            <div className="absolute top-full left-0 pt-4 w-[540px] opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
              <div className="grid grid-cols-2 bg-[#161616] border border-[#2b2b2b] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
                <Link
                  href="/#bestseller"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item border-r border-b border-[#262626]"
                >
                  <h4 className="text-sm font-heading font-bold text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">{t("nav.homeBestSellers")}</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">{t("nav.homeBestSellersDesc")}</p>
                </Link>

                <Link
                  href="/#collab"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item border-b border-[#262626]"
                >
                  <h4 className="text-sm font-heading font-bold text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">{t("nav.homeCollab")}</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">{t("nav.homeCollabDesc")}</p>
                </Link>

                <Link
                  href="/#new-arrival"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item col-span-2"
                >
                  <h4 className="text-sm font-heading font-bold text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">{t("nav.homeNewArrivals")}</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">{t("nav.homeNewArrivalsDesc")}</p>
                </Link>
              </div>
            </div>
          </div>

          {/* COLLECTION Mega Menu */}
          <div className="relative group h-full flex items-center">
            <Link
              href="/collection"
              className={`relative text-[10px] uppercase tracking-[0.2em] font-extrabold py-1 transition-colors ${getNavClass(pathname.startsWith("/collection"))}`}
            >
              {t("nav.collection")}
            </Link>

            {/* Full-Width Mega Menu Box */}
            <div className="fixed top-[80px] left-0 w-full bg-[#0e0e0e]/95 backdrop-blur-2xl border-b border-[#222] opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-40 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
              <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 flex gap-16">
                
                {/* Column 1: Categories */}
                <div className="w-[250px] shrink-0 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-[#D4FF00] uppercase tracking-widest pb-3 border-b border-[#222] mb-5 font-bold flex items-center justify-between">
                      <span>{t("nav.categories")}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse"></span>
                    </div>
                    <div className="space-y-2">
                      <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-[#D4FF00] transition-colors">{t("nav.allProducts")}</Link>
                      <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-[#D4FF00] transition-colors">{t("nav.inEarMonitors")}</Link>
                      <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-[#D4FF00] transition-colors">{t("nav.dacAmps")}</Link>
                      <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-[#D4FF00] transition-colors">{t("nav.accessories")}</Link>
                      <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-[#D4FF00] transition-colors">Cables & Adapters</Link>
                      <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-[#D4FF00] transition-colors">Merchandise</Link>
                    </div>
                  </div>
                  <Link href="/collection" className="mt-8 text-[11px] font-mono text-[#D4FF00] hover:underline flex items-center justify-between font-bold group/link">
                    <span>{t("nav.exploreCatalog")}</span>
                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                {/* Column 2: Popular Brands */}
                <div className="w-[250px] shrink-0 border-l border-[#222] pl-16">
                  <div className="text-[10px] font-mono text-[#FAF9F6]/50 uppercase tracking-widest pb-3 border-b border-[#222] mb-5 font-bold">
                    <span>Popular Brands</span>
                  </div>
                  <div className="space-y-2">
                    <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-white transition-colors">Sennheiser</Link>
                    <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-white transition-colors">64 Audio</Link>
                    <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-white transition-colors">Campfire Audio</Link>
                    <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-white transition-colors">Chord Electronics</Link>
                    <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-white transition-colors">ThieAudio</Link>
                    <Link href="/collection" className="block text-xs font-medium text-[#FAF9F6]/70 hover:text-white transition-colors">Moondrop</Link>
                  </div>
                </div>

                {/* Column 3 & 4: Featured Showcases */}
                <div className="flex-1 border-l border-[#222] pl-16">
                  <div className="text-[10px] font-mono text-[#FAF9F6]/50 uppercase tracking-widest pb-3 border-b border-[#222] mb-6 font-bold flex items-center justify-between">
                    <span>{t("nav.featuredModels")}</span>
                    <span className="text-[#D4FF00]">{t("nav.topRated")}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    {/* Featured 1 */}
                    <Link href="/collection" className="group/prod block">
                      <div className="relative w-full aspect-[16/9] bg-[#111] rounded-lg overflow-hidden mb-4 border border-[#222] group-hover/prod:border-[#D4FF00] transition-colors">
                        <Image src="/model-iem-untuk-hero.webp" alt="64 Audio U12t" fill className="object-cover group-hover/prod:scale-105 transition-transform duration-700 opacity-80 group-hover/prod:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                           <span className="px-2 py-1 bg-[#D4FF00] text-black text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm">EDITOR'S CHOICE</span>
                        </div>
                      </div>
                      <h5 className="font-sans text-lg font-normal tracking-wide text-[#FAF9F6] group-hover/prod:text-[#D4FF00] transition-colors">64 Audio U12t Reference</h5>
                      <p className="text-xs text-[#FAF9F6]/50 mt-1 mb-2 line-clamp-1">Industry standard 12-driver in-ear monitor.</p>
                      <span className="font-mono text-sm font-bold tracking-wider text-[#D4FF00]">{formatPrice(2499)}</span>
                    </Link>

                    {/* Featured 2 */}
                    <Link href="/collection" className="group/prod block">
                      <div className="relative w-full aspect-[16/9] bg-[#111] rounded-lg overflow-hidden mb-4 border border-[#222] group-hover/prod:border-[#D4FF00] transition-colors">
                        <Image src="/placeholder.svg" alt="Chord Mojo 2" fill className="object-cover group-hover/prod:scale-105 transition-transform duration-700 opacity-80 group-hover/prod:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                           <span className="px-2 py-1 bg-white text-black text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm">BEST SELLER</span>
                        </div>
                      </div>
                      <h5 className="font-sans text-lg font-normal tracking-wide text-[#FAF9F6] group-hover/prod:text-[#D4FF00] transition-colors">Chord Mojo 2 DAC</h5>
                      <p className="text-xs text-[#FAF9F6]/50 mt-1 mb-2 line-clamp-1">Portable DAC/Headphone Amplifier with lossless DSP.</p>
                      <span className="font-mono text-sm font-bold tracking-wider text-[#D4FF00]">{formatPrice(899)}</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* GRAPH Dropdown */}
          <div className="relative group h-full flex items-center">
            <Link
              href="/graph"
              className={`relative text-[10px] uppercase tracking-[0.2em] font-extrabold py-1 transition-colors ${getNavClass(pathname.startsWith("/graph"))}`}
            >
              {t("nav.graph")}
            </Link>

            {/* Dropdown Box */}
            <div className="absolute top-full left-0 pt-4 w-[520px] opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
              <div className="grid grid-cols-2 bg-[#161616] border border-[#2b2b2b] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
                <Link
                  href="/graph"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item border-r border-b border-[#262626]"
                >
                  <h4 className="text-sm font-heading font-medium tracking-wider text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">How To Read Graph</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">Learn the basics of reading frequency response curves.</p>
                </Link>

                <Link
                  href="/graph"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item border-b border-[#262626]"
                >
                  <h4 className="text-sm font-heading font-medium tracking-wider text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">IEM Signature</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">Discover V-Shape, Neutral, and other sound profiles.</p>
                </Link>

                <Link
                  href="/graph"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item border-r border-[#262626]"
                >
                  <h4 className="text-sm font-heading font-medium tracking-wider text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">Find Your Signature</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">Select a musical genre to reveal the ideal tuning profile.</p>
                </Link>

                <Link
                  href="/graph"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item"
                >
                  <h4 className="text-sm font-heading font-medium tracking-wider text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">Try Squiglink</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">Compare frequency responses using our interactive database.</p>
                </Link>
              </div>
            </div>
          </div>

          {/* SUPPORT Dropdown */}
          <div className="relative group h-full flex items-center">
            <Link
              href="/support"
              className={`relative text-[10px] uppercase tracking-[0.2em] font-extrabold py-1 transition-colors ${getNavClass(pathname.startsWith("/support"))}`}
            >
              {t("nav.support")}
            </Link>

            {/* Dropdown Box */}
            <div className="absolute top-full right-0 pt-4 w-[520px] opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
              <div className="grid grid-cols-2 bg-[#161616] border border-[#2b2b2b] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
                <Link
                  href="/support#faq"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item border-r border-b border-[#262626]"
                >
                  <h4 className="text-sm font-heading font-medium tracking-wider text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">General FAQ</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">Common questions about products and accounts.</p>
                </Link>

                <Link
                  href="/support#shipping"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item border-b border-[#262626]"
                >
                  <h4 className="text-sm font-heading font-medium tracking-wider text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">Shipping & Returns</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">Delivery times, tracking, and return policy.</p>
                </Link>

                <Link
                  href="/support#warranty"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item border-r border-[#262626]"
                >
                  <h4 className="text-sm font-heading font-medium tracking-wider text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">Warranty Claims</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">Process for repairs and defective units.</p>
                </Link>

                <Link
                  href="/support#contact"
                  className="flex flex-col justify-center p-5 hover:bg-[#202020] transition-colors group/item"
                >
                  <h4 className="text-sm font-heading font-medium tracking-wider text-[#FAF9F6] group-hover/item:text-[#D4FF00] transition-colors">Contact Us</h4>
                  <p className="text-[11px] font-sans text-[#FAF9F6]/50 leading-relaxed mt-1 group-hover/item:text-[#FAF9F6]/80 transition-colors">Get in touch with our audio specialists.</p>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer ${
              isSearchOpen ? "text-[#D4FF00] scale-110" : isDarkNav ? "text-[#FAF9F6] hover:text-[#D4FF00]" : "text-[#0e0e0e] hover:text-[#D4FF00]"
            }`}
          >
            <span className="sr-only">Search</span>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>

          {/* Chat / Inbox & Notifications (Only visible when logged in) */}
          {mounted && userSession && (
            <>
              <Link
                href="/messages"
                className={`hover:scale-110 active:scale-95 transition-all duration-300 relative cursor-pointer flex items-center ${
                  isDarkNav ? "text-[#FAF9F6] hover:text-[#D4FF00]" : "text-[#0e0e0e] hover:text-[#D4FF00]"
                }`}
              >
                <span className="sr-only">Messages</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4FF00] text-[9px] font-bold text-black border border-[#0e0e0e]">
                  1
                </span>
              </Link>
              {/* Notifications Dropdown Toggle */}
              <div className="relative flex items-center h-full">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`hover:scale-110 active:scale-95 transition-all duration-300 relative cursor-pointer flex items-center ${
                    isDarkNav ? "text-[#FAF9F6] hover:text-[#D4FF00]" : "text-[#0e0e0e] hover:text-[#D4FF00]"
                  }`}
                >
                  <span className="sr-only">Notifications</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4FF00] text-[9px] font-bold text-black border border-[#0e0e0e]">
                    2
                  </span>
                </button>

                {/* Notification Dropdown Container */}
                <div 
                  className={`absolute top-full right-0 mt-4 w-[380px] bg-[#161616] border border-[#2b2b2b] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 z-50 origin-top-right ${
                    isNotifOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between">
                    <h3 className="font-heading font-medium text-[15px] text-[#FAF9F6] tracking-wide">Notifikasi</h3>
                    <span className="text-[#888] hover:text-[#FAF9F6] transition-colors cursor-pointer">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </span>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    
                    {/* Important Section */}
                    <div className="px-5 py-3">
                      <span className="text-[12px] font-semibold text-[#FAF9F6]">Penting</span>
                    </div>

                    <Link href="/messages?seller=101" onClick={() => setIsNotifOpen(false)} className="flex gap-3 px-5 py-3 hover:bg-[#1f1f1f] transition-colors relative group">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></div>
                      <div className="w-10 h-10 rounded-full bg-[#222] shrink-0 overflow-hidden flex items-center justify-center text-[#FAF9F6] text-xs font-mono">
                        CZ
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#FAF9F6] leading-snug line-clamp-3">
                          <span className="font-semibold">CSI-ZONE Store</span> mengirim pesan: "Halo kak, untuk pengiriman gosend bisa hari ini ya."
                        </p>
                        <span className="text-[11px] text-[#888] mt-1 block">3 jam yang lalu</span>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 p-1 text-[#888] hover:text-[#FAF9F6] self-center transition-all shrink-0">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                      </span>
                    </Link>

                    <Link href="/seller" onClick={() => setIsNotifOpen(false)} className="flex gap-3 px-5 py-3 hover:bg-[#1f1f1f] transition-colors relative group">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></div>
                      <div className="w-10 h-10 rounded-full bg-[#111] shrink-0 overflow-hidden border border-[#D4FF00]/30 flex items-center justify-center text-[#D4FF00]">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#FAF9F6] leading-snug line-clamp-3">
                          <span className="font-semibold">Tonal Zone Admin:</span> Verifikasi toko Anda telah disetujui. Silakan unggah produk pertama Anda.
                        </p>
                        <span className="text-[11px] text-[#888] mt-1 block">5 jam yang lalu</span>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 p-1 text-[#888] hover:text-[#FAF9F6] self-center transition-all shrink-0">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                      </span>
                    </Link>

                    <div className="w-full h-px bg-[#262626] my-1"></div>
                    
                    {/* Others Section */}
                    <div className="px-5 py-3">
                      <span className="text-[12px] font-semibold text-[#FAF9F6]">Notifikasi lainnya</span>
                    </div>

                    <Link href="/user/orders" onClick={() => setIsNotifOpen(false)} className="flex gap-3 px-5 py-3 hover:bg-[#1f1f1f] transition-colors relative group opacity-70 hover:opacity-100">
                      <div className="w-10 h-10 rounded-full bg-[#222] shrink-0 overflow-hidden flex items-center justify-center text-[#888]">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                      </div>
                      <div className="flex-1 min-w-0 flex gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-[#FAF9F6] leading-snug line-clamp-3">
                            Pesanan Anda (INV/2026/08/14/001) telah dikirim oleh <span className="font-semibold">Soundstage ID</span>.
                          </p>
                          <span className="text-[11px] text-[#888] mt-1 block">Kemarin</span>
                        </div>
                        <div className="w-20 h-12 bg-[#222] shrink-0 overflow-hidden rounded relative">
                           <img src="/placeholder.svg" alt="Order" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 p-1 text-[#888] hover:text-[#FAF9F6] self-center transition-all shrink-0">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                      </span>
                    </Link>

                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className={`hover:scale-110 active:scale-95 transition-all duration-300 relative cursor-pointer ${
              isDarkNav ? "text-[#FAF9F6] hover:text-[#D4FF00]" : "text-[#0e0e0e] hover:text-[#D4FF00]"
            }`}
          >
            <span className="sr-only">Cart</span>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            {totalCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4FF00] text-[9px] font-bold text-black border border-[#0e0e0e]">
                {totalCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D4FF00]/50 rounded-full"></span>
            )}
          </button>
          <div className="hidden md:block">
            {!mounted ? (
              <div className="w-24 h-8 bg-[#161616] border border-[#222] rounded-full animate-pulse ml-3" />
            ) : userSession ? (
              <div className="relative group/user ml-3 py-2">
                {/* Trigger Button */}
                <div className="flex items-center gap-2.5 cursor-pointer bg-[#141414] hover:bg-[#1c1c1c] border border-[#262626] hover:border-[#3e3e3e] p-1.5 px-3 rounded-full transition-all duration-200 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[#bbb] shrink-0 overflow-hidden">
                    {userSession.avatar && userSession.avatar !== "/placeholder.svg" ? (
                      <img src={userSession.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-xs font-medium text-white max-w-[100px] truncate">
                      {(userSession.name || userSession.email || "User").split(" ")[0]}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#888] group-hover/user:rotate-180 transition-transform duration-200"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>

                {/* Authentic Shadcn UI Dropdown Menu */}
                <div className="absolute top-full right-0 pt-1.5 w-64 opacity-0 translate-y-1 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-150 z-50">
                  <div className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-[#262626] rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] p-1.5 text-left overflow-hidden ring-1 ring-white/5">
                    
                    {/* DropdownMenuLabel */}
                    <div className="px-3.5 py-3 mb-1 bg-white/[0.02] rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] overflow-hidden shrink-0 flex items-center justify-center text-xs font-mono text-white">
                          {userSession.avatar && userSession.avatar !== "/placeholder.svg" ? (
                            <img src={userSession.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (userSession.name || userSession.email || "U").substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans text-xs font-semibold text-white truncate">{userSession.name || userSession.email || "User"}</span>
                            <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-white bg-[#222] border border-[#333] px-1.5 py-0.2 rounded shrink-0">
                              {userSession.isSeller || userSession.sellerStatus === "APPROVED" || (userSession as any).role === "SELLER" || (userSession as any).role === "seller" ? t("common.seller") : t("common.buyer")}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-[#888] truncate">{userSession.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-[#222222] my-1" />

                    {/* DropdownMenuItems */}
                    <div className="space-y-0.5 py-0.5">
                      <Link
                        href="/settings"
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#FAF9F6]/80 hover:text-white hover:bg-[#1f1f1f] transition-all duration-150 group/item"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" className="text-[#FAF9F6]/50 group-hover/item:text-white transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <span>{t("nav.settings")}</span>
                        </div>
                      </Link>

                      {/* SELLER STATE MENU ITEM */}
                      {userSession.isSeller || userSession.sellerStatus === "APPROVED" ? (
                        <Link
                          href="/seller"
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-[#1f1f1f] transition-all duration-150 group/item"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            <span>{t("nav.sellerVault")}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400/80 tracking-widest font-semibold">{t("common.seller")}</span>
                        </Link>
                      ) : userSession.sellerStatus === "PENDING_APPROVAL" || userSession.sellerStatus === "PENDING" ? (
                        <Link
                          href="/seller"
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-amber-400 hover:bg-[#1f1f1f] transition-all duration-150 group/item"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <span>{t("nav.storeReview")}</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400/80 tracking-widest font-semibold">{t("nav.wait")}</span>
                        </Link>
                      ) : (
                        <Link
                          href="/sell"
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-purple-400 hover:bg-[#1f1f1f] transition-all duration-150 group/item"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/></svg>
                            <span>{t("nav.openStore")}</span>
                          </div>
                          <span className="text-[10px] font-mono text-purple-400/80 tracking-widest font-semibold">{t("nav.new")}</span>
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#FAF9F6]/80 hover:text-white hover:bg-[#1f1f1f] transition-all duration-150 group/item"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" className="text-[#FAF9F6]/50 group-hover/item:text-white transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                          <span>{t("nav.orders")}</span>
                        </div>
                      </Link>
                    </div>

                    <div className="h-px bg-[#222222] my-1" />

                    {/* DropdownMenuItem - Logout */}
                    <div className="py-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem("tonalzone_user");
                          setUserSession(null);
                          window.dispatchEvent(new Event("userLoginChange"));
                          router.push("/");
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-all duration-150 cursor-pointer text-left group/logout"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" className="text-[#71717A] group-hover/logout:text-white transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                          <span>{t("nav.logout")}</span>
                        </div>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <MotionButton 
                href={pathname === "/signup" ? "/login" : "/signup"} 
                variant={isDarkNav ? "neon" : "neon-dark"} 
                className="px-6 py-2.5 ml-2"
              >
                {pathname === "/signup" ? (language === "id" ? "MASUK" : "SIGN IN") : t("nav.signUp")}
              </MotionButton>
            )}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 -mr-2 transition-colors cursor-pointer ${isDarkNav ? "text-[#FAF9F6] hover:text-[#D4FF00]" : "text-[#0e0e0e] hover:text-[#D4FF00]"}`}
          >
            <span className="sr-only">Toggle Menu</span>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 3. Search Bar & Mega Menu (Outside/Below Navbar) */}
      {isSearchOpen && (
        <div className="w-full bg-[#111111] border-b border-[#262626] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Top Search Bar */}
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-5 border-b border-[#222]">
            <div className="flex items-center justify-between gap-6">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-4 bg-[#161616] border border-[#2e2e2e] focus-within:border-white px-5 py-3.5 rounded-xl transition-colors">
                <span className="text-[#FAF9F6]/50 font-mono font-bold text-xs uppercase tracking-widest">{t("nav.searchLabel")}</span>
                <input
                  type="text"
                  placeholder={t("nav.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-[#FAF9F6] placeholder-[#FAF9F6]/40 font-sans text-sm outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[10px] font-mono text-[#FAF9F6]/60 hover:text-white font-bold px-2.5 py-1 bg-[#222] hover:bg-[#333] rounded cursor-pointer transition-colors"
                  >
                    {t("nav.clear")}
                  </button>
                )}
              </form>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="px-5 py-3.5 bg-[#161616] border border-[#2e2e2e] hover:border-white text-[#FAF9F6]/80 hover:text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 uppercase tracking-wider"
              >
                [ {t("cart.close")} ]
              </button>
            </div>
          </div>

          {/* Search Mega Menu Content */}
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 flex flex-col lg:flex-row gap-10">
            {/* Left Column: Categories & Recommendations (Width 1/3) */}
            <div className="w-full lg:w-1/3 pr-0 lg:pr-8 lg:border-r border-[#222] flex flex-col justify-between gap-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FAF9F6]/40 uppercase tracking-[0.25em] block mb-4">
                  {t("nav.searchCategories")}
                </span>
                <div className="space-y-1">
                  {SEARCH_CATEGORIES.map((cat) => {
                    let catLabel = cat;
                    if (cat === "IN-EAR MONITORS") catLabel = t("nav.catIEM");
                    if (cat === "TWS") catLabel = t("nav.catTws");
                    if (cat === "HEADPHONE") catLabel = t("nav.catHeadphone");
                    if (cat === "DAC/AMP") catLabel = t("nav.catDac");
                    if (cat === "ACCESSORIES") catLabel = t("nav.catAcc");
                    if (cat === "FLAGSHIP MODELS") catLabel = t("nav.catFlagship");
                    if (cat === "PORTABLE AUDIO") catLabel = t("nav.catPortable");
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/search?q=${encodeURIComponent(cat)}`);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-[#FAF9F6]/70 hover:text-white hover:bg-[#1e1e1e] rounded-lg transition-all uppercase block cursor-pointer"
                      >
                        {catLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 bg-[#141414] border border-[#222] rounded-xl">
                <span className="text-[10px] font-mono text-[#FAF9F6] font-bold uppercase tracking-wider block mb-1.5">
                  {t("nav.needAdvanced")}
                </span>
                <p className="text-xs text-[#FAF9F6]/60 mb-4 font-sans leading-relaxed">
                  {t("nav.needAdvancedDesc")}
                </p>
                <MotionButton
                  href="/collection"
                  variant="dark"
                  onClick={() => setIsSearchOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-mono font-bold"
                >
                  {t("search.viewFullCollection")}
                </MotionButton>
              </div>
            </div>

            {/* Right Column: Dynamic Results / Recommended (Width 2/3) */}
            <div className="w-full lg:w-2/3">
              <div className="flex items-center justify-between pb-3 border-b border-[#222] mb-5">
                <span className="text-[10px] font-mono text-[#FAF9F6]/40 uppercase tracking-widest font-bold">
                  {searchQuery.trim() ? `${t("nav.searchResults")} (${filteredSearchProducts.length})` : t("nav.recommendedModels")}
                </span>
                <span className="text-[10px] font-mono text-[#FAF9F6]/40 font-bold tracking-wider">
                  {t("nav.topRatedGear")}
                </span>
              </div>

              {filteredSearchProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredSearchProducts.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/search?q=${encodeURIComponent(prod.name)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="group bg-transparent hover:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden flex flex-col cursor-pointer relative rounded-xl"
                    >
                      {/* Top Image Box */}
                      <div className="relative w-full aspect-square bg-[#0a0a0a] overflow-hidden flex items-center justify-center rounded-t-xl group-hover:bg-[#111111] transition-colors">
                        <div className="relative w-full h-full flex items-center justify-center bg-transparent transition-transform duration-500 ease-out group-hover:scale-105 transform-gpu">
                          {prod.image === "/placeholder.svg" ? (
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#FAF9F6]/30 text-center px-2">
                              {prod.category}
                            </span>
                          ) : (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </div>

                      {/* Bottom Text Area */}
                      <div className="p-3 flex flex-col flex-1 bg-transparent">
                        <h3 className="font-sans text-[13px] font-normal tracking-wide text-[#FAF9F6] group-hover:translate-x-1 transition-transform duration-300 mb-1 leading-relaxed truncate">
                          {prod.name}
                        </h3>
                        <p className="font-mono text-xs font-bold tracking-wide text-[#D4FF00] group-hover:translate-x-1 transition-transform duration-300">
                          {formatPrice(prod.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-[#161616] rounded-xl border border-[#222] flex flex-col items-center justify-center">
                  <span className="text-sm font-mono uppercase text-[#FAF9F6]/50 font-bold block mb-3">
                    {t("nav.noResults")} &quot;{searchQuery}&quot;
                  </span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-mono text-[#FAF9F6] bg-[#222] border border-[#333] hover:border-white hover:bg-white hover:text-[#0e0e0e] px-4 py-2 rounded-lg font-bold cursor-pointer uppercase transition-all"
                  >
                    {t("nav.resetQuery")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3.5 Mobile Full-Screen Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[80px] left-0 w-full h-[calc(100vh-80px)] z-40 bg-[#0e0e0e] border-t border-[#222] flex flex-col p-6 overflow-y-auto shadow-2xl"
          >
            <div className="flex flex-col gap-6 w-full pb-20">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-white uppercase tracking-widest border-b border-[#222] pb-4">
                {t("nav.home")}
              </Link>
              <Link href="/collection" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-white uppercase tracking-widest border-b border-[#222] pb-4">
                {t("nav.collection")}
              </Link>
              <Link href="/graph" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-white uppercase tracking-widest border-b border-[#222] pb-4">
                {t("nav.graph")}
              </Link>
              <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-white uppercase tracking-widest border-b border-[#222] pb-4">
                {t("nav.support")}
              </Link>

              {/* Mobile User Section */}
              <div className="mt-4 border-t border-[#222] pt-6 flex flex-col gap-4">
                {userSession ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[#bbb]">
                         <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-sans font-bold text-white">{userSession.name || userSession.email || "User"}</p>
                        <p className="text-xs font-mono text-[#888]">{userSession.email}</p>
                      </div>
                    </div>
                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-mono uppercase tracking-widest text-white/70 hover:text-white">{t("nav.settings")}</Link>
                    <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-white/70 hover:text-white">
                      Notifications
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#D4FF00] text-[9px] font-bold text-black">2</span>
                    </Link>
                    <Link href="/user/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-mono uppercase tracking-widest text-white/70 hover:text-white">{t("nav.orders")}</Link>
                    
                    {(userSession.isSeller || userSession.sellerStatus === "APPROVED") ? (
                      <Link href="/seller" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-mono uppercase tracking-widest text-emerald-400 hover:text-emerald-300">{t("nav.sellerVault")}</Link>
                    ) : (
                      <Link href="/seller/onboarding" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-mono uppercase tracking-widest text-purple-400 hover:text-purple-300">{t("nav.openStore")}</Link>
                    )}
                    
                    <button onClick={() => {
                      localStorage.removeItem("tonalzone_user");
                      setUserSession(null);
                      window.dispatchEvent(new Event("userLoginChange"));
                      setIsMobileMenuOpen(false);
                      router.push("/");
                    }} className="text-sm font-mono uppercase tracking-widest text-red-400 hover:text-red-300 text-left mt-2">
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <MotionButton href="/signup" variant="neon" className="w-full text-center py-3">
                    {t("nav.signUp")}
                  </MotionButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </header>
      {!isHomePage && <div className="h-20 w-full shrink-0 pointer-events-none" />}
      
      {/* 4. Off-Canvas Slide-over Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
