"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchProductsFromDb, CatalogProduct } from "@/lib/products-db";
import { supabase } from "@/lib/supabase";
import {
  getStoreSlug,
  getStoreMetadata,
  StoreMetadata,
  getProductRetailOffers,
  RETAIL_SELLERS,
} from "@/lib/store-utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Clock,
  MessageSquare,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Package,
  Award,
  ChevronRight
} from "lucide-react";

export default function StoreProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string) || "";
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();

  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "about" | "reviews">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSignature, setSelectedSignature] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"relevant" | "price_asc" | "price_desc" | "rating">("relevant");
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [storeAvatar, setStoreAvatar] = useState<string>("");
  const [storeBanner, setStoreBanner] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Fetch live products
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const prods = await fetchProductsFromDb();
        if (isMounted) {
          setAllProducts(prods);
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Failed to load store products:", e);
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products for this store (primary store items + retail multi-seller offers)
  const storeProducts = useMemo(() => {
    if (!decodedSlug) return [];

    return allProducts
      .filter((p) => {
        // 1. Direct primary store match
        const pSlug = getStoreSlug(p.storeName);
        const directMatch = pSlug === decodedSlug || (p.storeId && p.storeId.toLowerCase() === decodedSlug);
        const nameMatch =
          p.storeName.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(decodedSlug) ||
          decodedSlug.includes(pSlug);
        if (directMatch || nameMatch) return true;

        // 2. Retail multi-seller offer match
        const offers = getProductRetailOffers(p);
        const hasOffer = offers.some((offer) => {
          const offerSlug = getStoreSlug(offer.sellerName);
          return (
            offerSlug === decodedSlug ||
            offer.sellerName.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(decodedSlug)
          );
        });

        return hasOffer;
      })
      .map((p) => {
        // If this store sells via an extra retail offer, display that offer's price!
        const offers = getProductRetailOffers(p);
        const matchingOffer = offers.find((o) => {
          const offerSlug = getStoreSlug(o.sellerName);
          return (
            offerSlug === decodedSlug ||
            o.sellerName.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(decodedSlug)
          );
        });

        if (matchingOffer && matchingOffer.id !== "off-1") {
          return {
            ...p,
            price: matchingOffer.price,
            storeName: matchingOffer.sellerName,
          };
        }
        return p;
      });
  }, [allProducts, decodedSlug]);

  // Derived store metadata
  const resolvedStoreName = useMemo(() => {
    // Check known retail sellers
    const matchedRetailer = RETAIL_SELLERS.find(
      (r) => getStoreSlug(r.name) === decodedSlug || decodedSlug.includes(getStoreSlug(r.name))
    );
    if (matchedRetailer) return matchedRetailer.name;

    // Check direct primary product match
    const directProd = storeProducts.find((p) => getStoreSlug(p.storeName) === decodedSlug);
    if (directProd) return directProd.storeName;

    return decodedSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [decodedSlug, storeProducts]);

  const storeCity = useMemo(() => {
    if (decodedSlug.includes("csi-zone")) return "Surabaya";
    if (decodedSlug.includes("bass-audio")) return "Jakarta Barat";
    if (decodedSlug.includes("headphone-zone")) return "Tangerang";
    return storeProducts[0]?.storeCity || "Jakarta Pusat";
  }, [decodedSlug, storeProducts]);

  const metadata: StoreMetadata = useMemo(() => {
    return getStoreMetadata(resolvedStoreName, storeCity);
  }, [resolvedStoreName, storeCity]);

  // Fetch verified store profile (avatar & banner) from Supabase and localStorage
  useEffect(() => {
    let isMounted = true;

    // 1. Check local storage if current logged-in seller is the store owner
    try {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        const u = JSON.parse(stored);
        const uSlug = getStoreSlug(u.storeName || "");
        if (
          uSlug === decodedSlug ||
          decodedSlug.includes(uSlug) ||
          uSlug.includes(decodedSlug) ||
          u.storeId === decodedSlug
        ) {
          if (u.storeAvatar) setStoreAvatar(u.storeAvatar);
          if (u.storeBanner) setStoreBanner(u.storeBanner);
        }
      }
    } catch (e) {}

    // 2. Fetch from Supabase Store table
    const fetchStoreProfile = async () => {
      try {
        const { data } = await supabase
          .from("Store")
          .select("id, storeName, logo, banner, avatarUrl, bannerUrl");

        if (data && isMounted) {
          const found = data.find((s: any) => {
            const sSlug = getStoreSlug(s.storeName || "");
            return (
              s.id === decodedSlug ||
              sSlug === decodedSlug ||
              sSlug.includes(decodedSlug) ||
              decodedSlug.includes(sSlug) ||
              (s.storeName && s.storeName.toLowerCase() === resolvedStoreName.toLowerCase())
            );
          });

          if (found) {
            const logo = found.logo || found.avatarUrl;
            const banner = found.banner || found.bannerUrl;
            if (logo) setStoreAvatar(logo);
            if (banner) setStoreBanner(banner);
          }
        }
      } catch (err) {
        console.warn("Could not query store profile:", err);
      }
    };

    fetchStoreProfile();

    return () => {
      isMounted = false;
    };
  }, [decodedSlug, resolvedStoreName]);

  // Also sync from products if products loaded with storeLogo/storeBanner
  useEffect(() => {
    if (storeProducts.length > 0) {
      const prodWithLogo = storeProducts.find((p) => p.storeLogo || p.storeAvatar);
      if (prodWithLogo && (prodWithLogo.storeLogo || prodWithLogo.storeAvatar)) {
        setStoreAvatar((prev) => prev || prodWithLogo.storeLogo || prodWithLogo.storeAvatar || "");
      }
      const prodWithBanner = storeProducts.find((p) => p.storeBanner);
      if (prodWithBanner && prodWithBanner.storeBanner) {
        setStoreBanner((prev) => prev || prodWithBanner.storeBanner || "");
      }
    }
  }, [storeProducts]);

  const resolvedBanner = storeBanner || metadata.bannerUrl;
  const resolvedAvatar = storeAvatar || metadata.avatarUrl;

  // Check following state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tonalzone_followed_stores");
      if (stored) {
        const list: string[] = JSON.parse(stored);
        if (list.includes(metadata.slug)) {
          setIsFollowing(true);
        }
      }
    } catch {}
  }, [metadata.slug]);

  const toggleFollow = () => {
    try {
      const stored = localStorage.getItem("tonalzone_followed_stores");
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (isFollowing) {
        list = list.filter((s) => s !== metadata.slug);
        setIsFollowing(false);
        showToast(`Berhenti mengikuti ${metadata.name}`);
      } else {
        list.push(metadata.slug);
        setIsFollowing(true);
        showToast(`Berhasil mengikuti ${metadata.name}! Anda akan menerima info produk terbaru.`);
      }
      localStorage.setItem("tonalzone_followed_stores", JSON.stringify(list));
    } catch {}
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link profil toko berhasil disalin!");
    }
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return storeProducts
      .filter((p) => {
        if (selectedSignature !== "ALL") {
          if (p.soundSignature !== selectedSignature) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchDesc = (p.description || "").toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [storeProducts, selectedSignature, searchQuery, sortBy]);

  const soundSignatures = [
    { id: "ALL", label: "Semua Suara" },
    { id: "NEUTRAL", label: "Neutral" },
    { id: "WARM", label: "Warm" },
    { id: "V_SHAPE", label: "V-Shape" },
    { id: "BRIGHT", label: "Bright" },
    { id: "BASSHEAD", label: "Basshead" },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans selection:bg-white selection:text-black flex flex-col">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#141414] text-white px-5 py-3.5 shadow-2xl flex items-center gap-3 text-xs font-mono rounded-2xl">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-grow pt-24 pb-20 max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#71717A] mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collection" className="hover:text-white transition-colors">Katalog</Link>
          <span>/</span>
          <span className="text-[#D4D4D8]">Toko</span>
          <span>/</span>
          <span className="text-white font-medium truncate max-w-xs">{metadata.name}</span>
        </nav>

        {/* ========================================================================= */}
        {/* STORE HEADER BANNER CARD (Zero-Stroke Modern Dark)                      */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden bg-[#0A0A0A] mb-8">
          {/* Top Banner Image with gradient scrim */}
          <div className="relative h-44 sm:h-56 w-full bg-[#121212] overflow-hidden">
            <img
              src={resolvedBanner}
              alt={metadata.name}
              className="w-full h-full object-cover opacity-50 filter blur-[0.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
          </div>

          {/* Store Profile Info Body */}
          <div className="relative px-6 sm:px-10 pb-8 -mt-16 sm:-mt-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              {/* Left: Avatar + Identity */}
              <div className="flex items-start sm:items-end gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#141414] p-1 shrink-0 shadow-2xl flex items-center justify-center overflow-hidden">
                  {resolvedAvatar ? (
                    <img
                      src={resolvedAvatar}
                      alt={metadata.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#0E0E0E] flex items-center justify-center font-heading font-black text-2xl sm:text-3xl text-white tracking-wider">
                      {metadata.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {metadata.badge === "OFFICIAL_STORE" && (
                    <div
                      className="absolute -bottom-2 -right-2 bg-white text-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      title="Mitra Resmi TonalZone Terverifikasi"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                <div className="pt-2 sm:pt-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-tight">
                      {metadata.name}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase bg-[#181818] text-zinc-300 border border-white/10">
                      <Award className="w-3 h-3 text-zinc-400" />
                      {metadata.badge === "OFFICIAL_STORE" ? "Official Store" : "Star Seller"}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-[#8E8E93] flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[#A1A1AA]">
                      <MapPin className="w-3.5 h-3.5" />
                      {metadata.city}
                    </span>
                    <span>•</span>
                    <span className="text-[#A1A1AA]">Mitra sejak {metadata.joinYear}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[#A1A1AA]">
                      <span className="text-[#fbbf24]">★</span>
                      <span className="text-white font-medium">{metadata.rating.toFixed(1)}</span>
                      <span>({metadata.totalReviews} ulasan)</span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Right: Actions (Follow, Chat, Share) */}
              <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
                <button
                  type="button"
                  onClick={toggleFollow}
                  className={`px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                    isFollowing
                      ? "bg-[#181818] text-[#A1A1AA] hover:bg-[#222222] hover:text-white border border-[#2a2a2a]"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {isFollowing ? "✓ Mengikuti" : "+ Ikuti Toko"}
                </button>

                <Link
                  href={`/messages?seller=${encodeURIComponent(metadata.name)}`}
                  className="px-5 py-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2 border border-white/5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span>Chat Toko</span>
                </Link>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-[#A1A1AA] hover:text-white transition-all cursor-pointer flex items-center justify-center border border-white/5"
                  title="Bagikan Link Toko"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/5">
              <div className="p-3.5 rounded-2xl bg-[#121212]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block mb-1">
                  Total Produk
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-white">
                  {storeProducts.length} IEM Aktif
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121212]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block mb-1">
                  Kecepatan Balas
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-white">
                  {metadata.responseTime}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121212]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block mb-1">
                  Performa Chat
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-white">
                  {metadata.responseRate}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121212]">
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block mb-1">
                  Jaminan Pembelian
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Escrow
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB SELECTOR                                                          */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 mb-8 border-b border-white/5 pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: "products", label: `Produk (${storeProducts.length})` },
            { id: "about", label: "Tentang & Kebijakan Toko" },
            { id: "reviews", label: `Ulasan Pembeli (${metadata.totalReviews})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer select-none shrink-0 ${
                activeTab === tab.id
                  ? "bg-white text-black font-bold shadow-md"
                  : "bg-[#101010] hover:bg-[#181818] text-[#8E8E93] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: STORE PRODUCTS                                                 */}
        {/* ========================================================================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Search & Sound Signature Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Internal Store Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Cari IEM di ${metadata.name}...`}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#121212] hover:bg-[#161616] focus:bg-[#181818] text-white text-xs font-mono placeholder:text-[#666666] outline-none focus:ring-1 focus:ring-white/20 transition-all shadow-inner border border-white/5"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2.5 self-end md:self-auto">
                <span className="text-[11px] font-mono text-[#71717A] uppercase">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#121212] hover:bg-[#161616] text-white text-xs font-mono py-2 px-3.5 rounded-full outline-none focus:ring-1 focus:ring-white/20 cursor-pointer transition-colors border border-white/5"
                >
                  <option value="relevant">Paling Sesuai</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
              </div>
            </div>

            {/* Sound Signature Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {soundSignatures.map((sig) => (
                <button
                  key={sig.id}
                  onClick={() => setSelectedSignature(sig.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer shrink-0 ${
                    selectedSignature === sig.id
                      ? "bg-white text-black font-bold shadow-sm"
                      : "bg-[#101010] text-[#71717A] hover:text-white hover:bg-[#181818]"
                  }`}
                >
                  {sig.label}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="p-16 text-center bg-[#0A0A0A] rounded-2xl font-mono text-xs text-[#71717A]">
                Memuat katalog produk toko...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-[#0A0A0A] rounded-2xl space-y-3">
                <Package className="w-10 h-10 text-[#52525B] mx-auto" />
                <p className="text-xs font-mono text-[#71717A] uppercase tracking-widest">
                  Tidak ada produk yang cocok dengan pencarian di toko ini.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSignature("ALL");
                    }}
                    className="mt-2 text-xs font-mono text-zinc-400 hover:text-white hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ABOUT & STORE POLICIES                                         */}
        {/* ========================================================================= */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0A0A0A] space-y-4">
                <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-white">
                  Profil & Deskripsi Toko
                </h3>
                <p className="text-sm text-[#D4D4D8] font-sans leading-relaxed">
                  {metadata.description}
                </p>
              </div>

              {/* Shipping & Return Policy */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0A0A0A] space-y-5">
                <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-white">
                  Kebijakan Pengiriman & Garansi Unit
                </h3>

                <div className="space-y-4 text-xs font-sans text-[#A1A1AA] leading-relaxed">
                  <div className="p-4 rounded-xl bg-[#121212] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white shrink-0">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span className="font-mono font-bold text-white block">
                        Garansi Keaslian & Unit Baru
                      </span>
                    </div>
                    <p>
                      Seluruh unit in-ear monitor yang dijual di toko ini dijamin 100% original, bukan clone/replika, dan berasal langsung dari jalur distributor resmi.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121212] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white shrink-0">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                      <span className="font-mono font-bold text-white block">
                        Standar Packing Audiophile
                      </span>
                    </div>
                    <p>
                      Pesanan dikemas menggunakan bubble wrap multi-layer dan hard box pelindung agar housing IEM serta kabel tidak mengalami benturan fisik selama perjalanan kurir.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121212] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white shrink-0">
                        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                        <path d="M7 21h10" />
                        <path d="M12 3v18" />
                        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                      </svg>
                      <span className="font-mono font-bold text-white block">
                        Kebijakan Retur & Mediasi Escrow
                      </span>
                    </div>
                    <p>
                      Jika unit cacat pabrik atau audio unbalance, pembeli dapat mengajukan retur dalam 2x24 jam sejak paket berstatus diterima dengan menyertakan video unboxing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Info Sidebar */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0A0A0A] space-y-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-[#71717A]">
                  Informasi Operasional
                </h4>

                <div className="space-y-3.5 text-xs font-mono">
                  <div>
                    <span className="text-[#71717A] block mb-0.5">Lokasi Pengiriman</span>
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {metadata.city}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#71717A] block mb-0.5">Jam Operasional</span>
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {metadata.operationalHours}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#71717A] block mb-0.5">Proteksi Transaksi</span>
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Rekening Bersama TonalZone
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STORE REVIEWS                                                   */}
        {/* ========================================================================= */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Rating Summary Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest block mb-1">
                  Kepuasan Pembeli Toko
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-heading font-bold text-white">
                    {metadata.rating.toFixed(1)}
                  </span>
                  <span className="text-sm font-mono text-[#71717A]">/ 5.0</span>
                  <div className="flex text-[#fbbf24] text-base ml-1">
                    {"★".repeat(Math.floor(metadata.rating))}
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-[#A1A1AA]">
                Berdasarkan <span className="text-white font-bold">{metadata.totalReviews} ulasan</span> terverifikasi dari pembeli TonalZone.
              </div>
            </div>

            {/* Customer Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "rev-1",
                  buyer: "Dimas S.",
                  date: "3 hari yang lalu",
                  product: storeProducts[0]?.name || "Audiophile IEM",
                  rating: 5,
                  comment: "Pelayanan toko sangat responsif! IEM original bergaransi resmi, staging lebar dan tuning suara sesuai ekspektasi. Packing tebal dan aman!",
                },
                {
                  id: "rev-2",
                  buyer: "Budi Santoso",
                  date: "1 minggu yang lalu",
                  product: storeProducts[1]?.name || storeProducts[0]?.name || "Audiophile IEM",
                  rating: 5,
                  comment: "Pengiriman kilat via JNE Express, resi terbit cepat. Barang mulus segel box resmi. Rekomendasi belanja IEM di toko ini!",
                },
                {
                  id: "rev-3",
                  buyer: "Kevin W.",
                  date: "2 minggu yang lalu",
                  product: storeProducts[2]?.name || storeProducts[0]?.name || "Audiophile IEM",
                  rating: 5,
                  comment: "Seller informatif saat ditanya beda tuning dan sinergi DAC dongle. Sangat membantu untuk audiophile pemula.",
                },
                {
                  id: "rev-4",
                  buyer: "Fajar Pratama",
                  date: "1 bulan yang lalu",
                  product: storeProducts[0]?.name || "Audiophile IEM",
                  rating: 4,
                  comment: "Barang ori 100%, kabel lentur tidak microphonic. Suara vocal intimate dan bass punchy. Mantap!",
                },
              ].map((rev) => (
                <div key={rev.id} className="p-6 rounded-2xl bg-[#0A0A0A] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-white block">
                        {rev.buyer}
                      </span>
                      <span className="text-[10px] font-mono text-[#71717A]">
                        Membeli: <span className="text-[#A1A1AA]">{rev.product}</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#71717A]">{rev.date}</span>
                  </div>

                  <div className="flex text-xs text-[#fbbf24]">
                    {"★".repeat(rev.rating)}
                  </div>

                  <p className="text-xs font-sans text-[#D4D4D8] leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
