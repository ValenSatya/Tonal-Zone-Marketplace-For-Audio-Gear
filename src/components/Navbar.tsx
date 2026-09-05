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
import { useNotifications, formatRelativeTime } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthSession, signOutUser } from "@/app/actions/auth";
import { fetchProductsFromDb, CatalogProduct, FALLBACK_CATALOG } from "@/lib/products-db";

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
  const { formatPrice, currency, setCurrency } = useLocation();
  const { isCartOpen, setIsCartOpen, totalCount } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [userSession, setUserSession] = useState<{ name: string; email: string; avatar?: string; role?: string; isSeller?: boolean; sellerStatus?: string; tuning?: string } | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dbProducts, setDbProducts] = useState<CatalogProduct[]>(FALLBACK_CATALOG);

  React.useEffect(() => {
    async function loadLiveProducts() {
      try {
        const live = await fetchProductsFromDb();
        if (live && live.length > 0) {
          setDbProducts(live);
        }
      } catch (e) {
        console.error("Failed to load live products for navbar:", e);
      }
    }
    loadLiveProducts();
  }, []);

  React.useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      try {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          setUserSession(JSON.parse(stored));
          return;
        }

        // Fallback: Fetch active server session via server action
        const sessionRes = await getAuthSession();
        if (sessionRes.success && sessionRes.user) {
          localStorage.setItem("tonalzone_user", JSON.stringify(sessionRes.user));
          setUserSession(sessionRes.user);
          return;
        }

        setUserSession(null);
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

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutUser();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    localStorage.removeItem("tonalzone_user");
    setUserSession(null);
    window.dispatchEvent(new Event("userLoginChange"));
    setIsLoggingOut(false);
    setIsLogoutModalOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isHomePage = pathname === "/";
  const isDarkNav = true;

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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const searchData = useMemo(() => {
    const allProducts = dbProducts && dbProducts.length > 0 ? dbProducts : FALLBACK_CATALOG;
    if (!searchQuery.trim()) {
      return {
        isSearching: false,
        products: allProducts.slice(0, 4),
        suggestedLinks: [
          { label: "Tangzu Wan'er Studio Edition", href: "/product/prod-waner-se", brand: "TANGZU" },
          { label: "Moondrop Blessing 3 Hybrid", href: "/product/prod-blessing-3", brand: "MOONDROP" },
          { label: "Sony WF-1000XM5 True Wireless", href: "/product/prod-wf1000xm5", brand: "SONY" },
          { label: "Sennheiser HD 560S Reference", href: "/product/prod-hd560s", brand: "SENNHEISER" },
          { label: "FiiO BTR7 Balanced DAC Amp", href: "/product/prod-fiio-btr7", brand: "FIIO" },
        ],
        suggestedSearches: [
          "In-Ear Monitors",
          "TWS Noise Canceling",
          "DAC Amp Dongle",
          "Kabel 4.4mm Balanced",
          "Open-Back Headphones",
        ],
      };
    }

    const q = searchQuery.toLowerCase().trim();
    const matches = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.soundSignature.toLowerCase().includes(q)
    );

    const directLinks = matches.slice(0, 4).map((p) => ({
      label: p.name,
      href: `/product/${p.id}`,
      brand: p.brand,
    }));

    const dynamicKeywords = [
      `${searchQuery} in-ear monitor`,
      `${searchQuery} wireless TWS`,
      `${searchQuery} frekuensi grafik`,
      `${searchQuery} kabel upgrade 4.4mm`,
      `${searchQuery} tuning filter`,
    ];

    return {
      isSearching: true,
      products: matches.slice(0, 4),
      suggestedLinks: directLinks,
      suggestedSearches: dynamicKeywords,
    };
  }, [searchQuery]);

  const filteredSearchProducts = searchData.products;

  const getNavClass = (isActive: boolean) => {
    if (isActive) {
      return "text-[#D4FF00] border-b-2 border-[#D4FF00]";
    }
    return "text-white hover:text-[#D4FF00] border-b-2 border-transparent";
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
          isScrolled
            ? "bg-[#090808]/95 backdrop-blur-md border-b border-[#2b2b2b] shadow-lg"
            : "bg-transparent backdrop-blur-none border-b border-transparent shadow-none"
        } ${isHidden && !isSearchOpen ? "-translate-y-full" : "translate-y-0"}`}
      >
      <div className="flex h-20 items-center justify-between px-6 sm:px-10 lg:px-16 max-w-[1500px] mx-auto">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Tonal Zone Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain group-hover:rotate-180 transition-all duration-700 ease-in-out"
            />
          </div>
          <span className="hidden sm:inline font-heading text-2xl font-bold tracking-tight mt-0.5 text-white transition-colors duration-300">
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

          {/* Chat / Inbox & Notifications (Desktop Only - Mobile accesses via Drawer) */}
          {mounted && userSession && (
            <div className="hidden md:flex items-center gap-6 h-full">
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
                {/* Click outside overlay */}
                {isNotifOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsNotifOpen(false)}
                  />
                )}

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
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#D4FF00] text-[9px] font-bold text-black border border-[#0e0e0e] animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Container */}
                <div 
                  className={`absolute top-full right-0 mt-4 w-[380px] bg-[#141414] border border-[#2b2b2b] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 z-50 origin-top-right ${
                    isNotifOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {/* Header */}
                  <div className="px-5 py-3.5 border-b border-[#242424] flex items-center justify-between bg-[#111111]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-medium text-sm text-[#FAF9F6] tracking-wide">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] font-mono text-[#D4FF00] hover:underline cursor-pointer transition-colors"
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-[#1e1e1e]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-[#777] text-xs font-mono">
                        Tidak ada notifikasi saat ini
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsNotifOpen(false);
                            router.push(notif.actionLink);
                          }}
                          className={`flex gap-3 px-4 py-3.5 hover:bg-[#1a1a1a] transition-colors cursor-pointer relative group ${
                            notif.unread ? "bg-[#161616]" : "bg-transparent opacity-80 hover:opacity-100"
                          }`}
                        >
                          {notif.unread && (
                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                          )}

                          {/* Icon based on type */}
                          <div className="w-9 h-9 rounded-full bg-[#202020] border border-[#333] shrink-0 overflow-hidden flex items-center justify-center text-white">
                            {notif.type === "order" && (
                              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                            )}
                            {notif.type === "chat" && (
                              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            )}
                            {notif.type === "system" && (
                              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            )}
                            {notif.type === "promo" && (
                              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-semibold leading-snug truncate ${notif.unread ? "text-white" : "text-[#ddd]"}`}>
                              {notif.title}
                            </h4>
                            <p className="text-[11px] text-[#888] leading-relaxed line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-mono text-[#666] mt-1 block">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-3 border-t border-[#242424] bg-[#111111] text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-mono font-bold uppercase tracking-wider text-[#FAF9F6] hover:text-[#D4FF00] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Lihat Semua Notifikasi</span>
                      <span>({notifications.length})</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
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
                        onClick={() => setIsLogoutModalOpen(true)}
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
    </header>

      {/* 3. Apple-Style Dynamic Search Overlay Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[#0a0a0a]/98 backdrop-blur-3xl overflow-y-auto flex flex-col text-[#FAF9F6]"
          >
            {/* Top Search Input Bar */}
            <div className="w-full border-b border-[#1c1c1c] sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-10">
              <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-6 flex items-center justify-between gap-6">
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-4">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="text-[#71717A] shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari IEM, DAC, headphone, kabel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-xl md:text-3xl font-light text-[#FAF9F6] placeholder-[#444444] outline-none tracking-tight"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-xs font-mono text-[#8E8E93] hover:text-white px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#262626] border border-[#2B2B2B] transition-colors cursor-pointer shrink-0"
                    >
                      Batal
                    </button>
                  )}
                </form>

                {/* Close Button */}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-xs font-mono text-[#8E8E93] hover:text-white border border-[#222222] hover:border-white px-4 py-2 transition-all cursor-pointer shrink-0 uppercase tracking-widest"
                >
                  Tutup [ESC]
                </button>
              </div>
            </div>

            {/* Modal Body: Dynamic Suggestions & Results */}
            <div className="max-w-[1200px] w-full mx-auto px-6 lg:px-12 py-12 flex-1 flex flex-col gap-12">
              
              {/* Dynamic State 1: When User is Typing (Apple Reference Experience) */}
              {searchData.isSearching ? (
                <div className="space-y-12 animate-in fade-in duration-200">
                  
                  {/* Suggested Links (Direct Product Navigation) */}
                  <div>
                    <span className="text-xs font-mono text-[#71717A] tracking-[0.2em] uppercase block mb-4">
                      Suggested Links
                    </span>
                    {searchData.suggestedLinks.length > 0 ? (
                      <div className="space-y-1">
                        {searchData.suggestedLinks.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-3 py-2.5 px-3 -mx-3 hover:bg-[#141414] text-[#FAF9F6] text-base md:text-lg font-light tracking-tight transition-colors group cursor-pointer"
                          >
                            <span className="text-[#555555] group-hover:text-white transition-colors">→</span>
                            <span className="group-hover:translate-x-1 transition-transform">
                              <span className="text-xs font-mono text-[#888888] mr-2">{link.brand}</span>
                              <span className="text-[#FAF9F6]">{link.label}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-sans text-[#666666]">Tidak ada tautan langsung yang cocok.</p>
                    )}
                  </div>

                  {/* Suggested Searches (Live Keyword Queries) */}
                  <div>
                    <span className="text-xs font-mono text-[#71717A] tracking-[0.2em] uppercase block mb-4">
                      Suggested Searches
                    </span>
                    <div className="space-y-1">
                      {searchData.suggestedSearches.map((queryText, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsSearchOpen(false);
                            router.push(`/search?q=${encodeURIComponent(queryText)}`);
                          }}
                          className="w-full flex items-center gap-3 py-2.5 px-3 -mx-3 hover:bg-[#141414] text-[#A1A1AA] hover:text-white text-sm md:text-base font-light tracking-tight transition-colors text-left group cursor-pointer"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            viewBox="0 0 24 24"
                            className="text-[#555555] group-hover:text-[#FAF9F6] transition-colors shrink-0"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <span className="group-hover:translate-x-1 transition-transform">
                            {queryText}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Matched Products Preview */}
                  {searchData.products.length > 0 && (
                    <div className="pt-8 border-t border-[#1a1a1a]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono text-[#71717A] tracking-[0.2em] uppercase">
                          Hasil Produk ({searchData.products.length})
                        </span>
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="text-xs font-mono text-[#FAF9F6] hover:text-white border-b border-[#FAF9F6] pb-0.5"
                        >
                          Lihat semua hasil →
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {searchData.products.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/product/${prod.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="group flex flex-col bg-[#0e0e0e] border border-[#1a1a1a] hover:border-[#444444] transition-all p-2.5 cursor-pointer"
                          >
                            <div className="relative w-full aspect-square bg-[#141414] overflow-hidden mb-2.5">
                              <Image
                                src={prod.image || prod.images[0]}
                                alt={prod.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-xs font-sans font-medium text-[#FAF9F6] group-hover:text-white line-clamp-1 mb-1">
                                {prod.name}
                              </h4>
                              <span className="text-xs font-mono font-bold text-[#FAF9F6]">
                                {formatPrice(prod.price)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* Dynamic State 2: When Query is Empty (Quick Links & Categories) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in duration-200">
                  
                  {/* Left: Quick Links / Trending */}
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-xs font-mono text-[#71717A] tracking-[0.2em] uppercase block mb-4">
                      Quick Links
                    </span>
                    <div className="space-y-1">
                      {searchData.suggestedLinks.map((link, idx) => (
                        <Link
                          key={idx}
                          href={link.href}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 py-2 px-3 -mx-3 hover:bg-[#141414] text-[#A1A1AA] hover:text-[#FAF9F6] text-base font-light tracking-tight transition-colors group cursor-pointer"
                        >
                          <span className="text-[#555555] group-hover:text-white transition-colors">→</span>
                          <span className="group-hover:translate-x-1 transition-transform">
                            {link.label}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* Popular Categories */}
                    <div className="pt-8 border-t border-[#1a1a1a]">
                      <span className="text-xs font-mono text-[#71717A] tracking-[0.2em] uppercase block mb-4">
                        Kategori Populer
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {SEARCH_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setIsSearchOpen(false);
                              router.push(`/collection?category=${encodeURIComponent(cat)}`);
                            }}
                            className="px-3 py-1.5 bg-[#121212] hover:bg-[#202020] border border-[#222] text-xs font-mono text-[#8E8E93] hover:text-white transition-colors cursor-pointer uppercase"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Recommended Benchmark Models */}
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs font-mono text-[#71717A] tracking-[0.2em] uppercase block">
                      Model Rekomendasi
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {searchData.products.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="group flex flex-col bg-[#0e0e0e] border border-[#1a1a1a] hover:border-[#444444] transition-all p-2.5 cursor-pointer"
                        >
                          <div className="relative w-full aspect-square bg-[#141414] overflow-hidden mb-2.5">
                            <Image
                              src={prod.image || prod.images[0]}
                              alt={prod.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-xs font-sans font-medium text-[#FAF9F6] group-hover:text-white line-clamp-1 mb-1">
                              {prod.name}
                            </h4>
                            <span className="text-xs font-mono font-bold text-[#FAF9F6]">
                              {formatPrice(prod.price)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between text-sm font-mono uppercase tracking-widest text-white/70 hover:text-white">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#D4FF00] text-[9px] font-bold text-black">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-mono uppercase tracking-widest text-white/70 hover:text-white">{t("nav.orders")}</Link>
                    
                    {(userSession.isSeller || userSession.sellerStatus === "APPROVED") ? (
                      <Link href="/seller" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-mono uppercase tracking-widest text-emerald-400 hover:text-emerald-300">{t("nav.sellerVault")}</Link>
                    ) : (
                      <Link href="/sell" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-mono uppercase tracking-widest text-purple-400 hover:text-purple-300">{t("nav.openStore")}</Link>
                    )}
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLogoutModalOpen(true);
                      }} 
                      className="text-sm font-mono uppercase tracking-widest text-red-400 hover:text-red-300 text-left mt-2 cursor-pointer"
                    >
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

      {!isHomePage && <div className="h-20 w-full shrink-0 pointer-events-none" />}
      
      {/* 4. Off-Canvas Slide-over Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* 5. Sleek Minimalist Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setIsLogoutModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-[420px] bg-[#121212] border border-[#262626] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] z-10 font-sans"
            >
              {/* Header Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-[#FAF9F6]">
                    Konfirmasi Keluar
                  </h3>
                  <p className="text-xs text-[#FAF9F6]/60 leading-relaxed mt-2">
                    Apakah Anda yakin ingin keluar dari akun Tonalzone? Anda perlu masuk kembali untuk mengakses keranjang belanja, wishlist, dan riwayat pesanan Anda.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#FAF9F6]/70 hover:text-white hover:bg-[#1f1f1f] border border-[#333] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-black bg-red-500 hover:bg-red-400 font-bold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Keluar...</span>
                    </>
                  ) : (
                    <span>Ya, Keluar</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
