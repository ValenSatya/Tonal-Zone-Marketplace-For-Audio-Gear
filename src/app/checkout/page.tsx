"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionButton from "@/components/MotionButton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import CustomSelect from "@/components/ui/custom-select";

// Smart address data for dropdowns
const ADDRESS_DATA: Record<string, Record<string, string[]>> = {
  Indonesia: {
    "DKI Jakarta": [
      "Jakarta Selatan (Kebayoran, Senopati, SCBD)",
      "Jakarta Pusat (Menteng, Thamrin, Sudirman)",
      "Jakarta Barat (Puri Indah, Kebon Jeruk)",
      "Jakarta Utara (PIK, Kelapa Gading, Pluit)",
      "Jakarta Timur (Rawamangun, Duren Sawit)",
    ],
    "Jawa Barat": [
      "Bandung (Dago, Ciumbuleuit, Buahbatu)",
      "Bekasi (Summarecon, Harapan Indah)",
      "Depok (Margonda, Cinere)",
      "Bogor (Sentul, Pajajaran)",
    ],
    "Jawa Timur": [
      "Surabaya (Gubeng, Wonokromo, Pakuwon)",
      "Malang (Klojen, Lowokwaru)",
      "Sidoarjo",
    ],
    "Bali": [
      "Badung (Canggu, Seminyak, Kuta, Nusa Dua)",
      "Denpasar (Renon, Sanur)",
      "Gianyar (Ubud)",
    ],
  },
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose"],
    "New York": ["New York City (Manhattan)", "Brooklyn", "Queens"],
    "Texas": ["Austin", "Houston", "Dallas"],
    "Washington": ["Seattle", "Bellevue"],
  },
  "Singapore": {
    "Central Region": ["Orchard / River Valley", "Marina Bay / CBD", "Novena / Newton"],
    "East Region": ["Tampines", "Bedok", "Marine Parade"],
    "West Region": ["Jurong East", "Clementi"],
  },
  "Japan": {
    "Tokyo": ["Shibuya-ku", "Shinjuku-ku", "Minato-ku (Roppongi)", "Chiyoda-ku (Akihabara)"],
    "Osaka": ["Kita-ku (Umeda)", "Chuo-ku (Shinsaibashi, Namba)"],
  },
};

const POSTAL_CODES: Record<string, string> = {
  "Jakarta Selatan (Kebayoran, Senopati, SCBD)": "12190",
  "Jakarta Pusat (Menteng, Thamrin, Sudirman)": "10310",
  "Jakarta Barat (Puri Indah, Kebon Jeruk)": "11610",
  "Jakarta Utara (PIK, Kelapa Gading, Pluit)": "14470",
  "Bandung (Dago, Ciumbuleuit, Buahbatu)": "40132",
  "Surabaya (Gubeng, Wonokromo, Pakuwon)": "60281",
  "Badung (Canggu, Seminyak, Kuta, Nusa Dua)": "80361",
  "New York City (Manhattan)": "10001",
  "Los Angeles": "90001",
  "Orchard / River Valley": "238801",
  "Shibuya-ku": "150-0002",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const { items, subtotal: cartSubtotal } = useCart();
  const [country, setCountry] = useState("Indonesia");
  const [province, setProvince] = useState("DKI Jakarta");
  const [city, setCity] = useState("Jakarta Selatan (Kebayoran, Senopati, SCBD)");
  const [postalCode, setPostalCode] = useState("12190");
  const [street, setStreet] = useState("");
  const [courier, setCourier] = useState("express");
  const [paymentMethod, setPaymentMethod] = useState("qr");

  // Promo code & voucher state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Auth state
  const [userSession, setUserSession] = useState<{ name: string; email: string } | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        setUserSession(JSON.parse(stored));
      }
      const savedPromo = localStorage.getItem("tonalzone_applied_promo");
      if (savedPromo) {
        setAppliedPromo(savedPromo);
        setPromoCodeInput(savedPromo);
        if (["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(savedPromo.toUpperCase())) {
          setPromoMessage("[BERHASIL] VOUCHER DEMO AKTIF: TOTAL JADI RP 1!");
        } else {
          setPromoMessage("[BERHASIL] KODE PROMO AKTIF");
        }
      }
    } catch (e) {}
    setIsAuthChecked(true);
  }, []);

  const isDemoRp1 = ["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(appliedPromo.toUpperCase());

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(cleanCode)) {
      setAppliedPromo(cleanCode);
      setPromoMessage("[BERHASIL] VOUCHER DEMO AKTIF: TOTAL JADI RP 1!");
      try { localStorage.setItem("tonalzone_applied_promo", cleanCode); } catch (e) {}
    } else if (cleanCode === "TONAL10" || cleanCode === "AUDIOPHILE") {
      setAppliedPromo(cleanCode);
      setPromoMessage("[BERHASIL] PROMO DITERAPKAN: DISKON 10%");
      try { localStorage.setItem("tonalzone_applied_promo", cleanCode); } catch (e) {}
    } else if (cleanCode === "TONAL50") {
      setAppliedPromo(cleanCode);
      setPromoMessage("[BERHASIL] PROMO DITERAPKAN: DISKON 50%");
      try { localStorage.setItem("tonalzone_applied_promo", cleanCode); } catch (e) {}
    } else if (cleanCode !== "") {
      setAppliedPromo(cleanCode);
      setPromoMessage("[BERHASIL] BONUS MEMBER: DISKON 5%");
      try { localStorage.setItem("tonalzone_applied_promo", cleanCode); } catch (e) {}
    } else {
      setAppliedPromo("");
      setPromoMessage("[GAGAL] KODE TIDAK VALID");
      try { localStorage.removeItem("tonalzone_applied_promo"); } catch (e) {}
    }
  };

  // Update province and city when country changes
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const provinces = Object.keys(ADDRESS_DATA[newCountry] || {});
    const firstProv = provinces[0] || "";
    setProvince(firstProv);
    const cities = (ADDRESS_DATA[newCountry]?.[firstProv] || []) as string[];
    const firstCity = cities[0] || "";
    setCity(firstCity);
    setPostalCode(POSTAL_CODES[firstCity] || "10000");
  };

  // Update city when province changes
  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const cities = (ADDRESS_DATA[country]?.[newProv] || []) as string[];
    const firstCity = cities[0] || "";
    setCity(firstCity);
    setPostalCode(POSTAL_CODES[firstCity] || "10000");
  };

  // Update postal code when city changes
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setPostalCode(POSTAL_CODES[newCity] || "10000");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = isDemoRp1 ? 0 : courier === "instant" ? 12 : courier === "express" ? 15 : 0;
  const subtotal = items.length > 0 ? cartSubtotal : 1448;
  const discountRate = isDemoRp1 ? 0 : appliedPromo === "TONAL50" ? 0.5 : appliedPromo === "TONAL10" ? 0.1 : 0.1;
  const discountAmount = isDemoRp1 ? subtotal - 0.0000625 : subtotal * discountRate;
  const total = isDemoRp1 ? 0.0000625 : Math.max(0, subtotal - discountAmount + shippingFee);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const checkoutItems = (items.length > 0 ? items : [
        {
          id: "prod-ie900",
          name: "Sennheiser IE 900 Flagship",
          brand: "Sennheiser",
          price: 1299.00,
          image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
          variant: "4.4mm Pentaconn",
          quantity: 1,
          storeId: "store-bass-audio",
          storeName: "Bass Audio Official",
        },
      ]).map((it: any) => ({
        productId: it.productId || it.id || "prod-default",
        productName: it.name,
        brand: it.brand || "Audiophile",
        category: it.category || "IN-EAR MONITORS",
        priceUSD: it.price,
        quantity: it.quantity || 1,
        selectedVariant: it.variant || "Standard",
        image: it.image || "/placeholder.svg",
        storeId: it.storeId || "store-bass-audio",
        storeName: it.storeName || it.sellerName || "Bass Audio Official",
        storeCity: "Jakarta Selatan",
      }));

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: userSession?.email || "usr-valen",
          buyerName: userSession?.name || "Valen",
          buyerEmail: userSession?.email || "valen@tonalzone.com",
          buyerPhone: "08123456789",
          destinationAddress: street || "Jl. Senopati No. 45, Kebayoran Baru",
          destinationCity: city,
          destinationPostalCode: postalCode,
          paymentMethod: paymentMethod === "qr" ? "MIDTRANS_QRIS" : paymentMethod === "va" ? "BCA_VA" : "CREDIT_CARD",
          cartItems: checkoutItems,
          promoCode: appliedPromo,
          isDemoRp1,
        }),
      });

      const data = await res.json();
      const finalOrderId = (data.success && data.orderId) ? data.orderId : `TZ-${Date.now().toString().slice(-4)}`;
      const demoParam = isDemoRp1 ? "&isDemo=1" : "";
      const snapParam = data.snapToken ? `&snapToken=${encodeURIComponent(data.snapToken)}` : "";
      router.push(`/checkout/payment?orderId=${finalOrderId}&method=${paymentMethod}${demoParam}${snapParam}`);
    } catch (err) {
      console.error("Error creating order:", err);
      const demoParam = isDemoRp1 ? "&isDemo=1" : "";
      router.push(`/checkout/payment?orderId=TZ-${Date.now().toString().slice(-4)}&method=${paymentMethod}${demoParam}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e] flex flex-col relative">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Header */}
        <div className="mb-8 border-b border-[#1c1c1c] pb-5">
          <button onClick={() => router.back()} className="text-xs font-mono text-[#777777] hover:text-white uppercase transition-colors inline-block mb-1 cursor-pointer">
            ← KEMBALI
          </button>
          <h1 className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-tight text-white">
            {t("checkout.title")}
          </h1>
        </div>

        {/* Login Reminder Alert for Guests / Unauthenticated Users */}
        {isAuthChecked && !userSession && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Alert className="bg-[#141414] border-[#2a2a2a] text-[#FAF9F6] p-4 sm:p-5 shadow-sm flex items-start gap-3.5">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <AlertDescription className="text-xs sm:text-[13px] text-[#A0A0A5] font-sans leading-relaxed">
                Silakan{" "}
                <Link href="/login?redirect=/checkout" className="underline font-bold text-white hover:text-[#D4FF00] transition-colors underline-offset-2">
                  Masuk (Login)
                </Link>{" "}
                ke akun Anda untuk menyimpan riwayat transaksi dan melacak nomor resi paket Anda secara otomatis.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT AREA: CLEAN FORM (7 COLS) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Shipping Address Section */}
            <div className="space-y-4">
              <div className="border-b border-[#1c1c1c] pb-2">
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#888888]">
                  1. ALAMAT PENGIRIMAN
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-30">
                <CustomSelect
                  label={t("checkout.country")}
                  value={country}
                  options={Object.keys(ADDRESS_DATA)}
                  onChange={handleCountryChange}
                />

                <CustomSelect
                  label={t("checkout.province")}
                  value={province}
                  options={Object.keys(ADDRESS_DATA[country] || {})}
                  onChange={handleProvinceChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-20">
                <div className="sm:col-span-2">
                  <CustomSelect
                    label={t("checkout.city")}
                    value={city}
                    options={(ADDRESS_DATA[country]?.[province] || []) as string[]}
                    onChange={handleCityChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-[#888888] uppercase font-bold">
                    {t("checkout.postalCode")}
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-[#111111] border border-[#222222] focus:border-white px-3.5 py-2.5 text-xs font-mono font-bold text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1 relative z-10">
                <label className="block text-[11px] font-mono text-[#888888] uppercase font-bold">
                  {t("checkout.street")}
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Nama jalan, nomor rumah / gedung, RT/RW, kelurahan"
                  className="w-full bg-[#111111] border border-[#222222] focus:border-white px-3.5 py-2.5 text-xs font-sans text-white placeholder:text-[#555555] outline-none transition-colors"
                />
              </div>
            </div>

            {/* 2. Courier / Shipping Service Selector */}
            <div className="space-y-4">
              <div className="border-b border-[#1c1c1c] pb-2">
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#888888]">
                  2. LAYANAN PENGIRIMAN
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "regular", name: "Reguler (3-5 Hari)", time: "JNE / SiCepat REG", price: "GRATIS" },
                  { id: "express", name: "Express (1-2 Hari)", time: "JNE YES / SiCepat BEST", price: "$15.00" },
                  { id: "instant", name: "Same Day / Instant", time: "Kurir Instant Khusus", price: "$12.00" },
                ].map((srv) => {
                  const isSelected = courier === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setCourier(srv.id)}
                      className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#141414] border-white text-white shadow-sm"
                          : "bg-[#0e0e0e] border-[#1c1c1c] text-[#888888] hover:border-[#333333]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-sans text-xs font-bold text-white">{srv.name}</span>
                          <span className={`w-3.5 h-3.5 border flex items-center justify-center text-[9px] ${
                            isSelected ? "border-white bg-white text-black font-bold" : "border-[#444444]"
                          }`}>
                            {isSelected ? "✓" : null}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-[#666666]">{srv.time}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#1c1c1c] font-mono text-xs font-bold text-white">
                        {srv.price}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Payment Method Selection */}
            <div className="space-y-4">
              <div className="border-b border-[#1c1c1c] pb-2">
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#888888]">
                  3. METODE PEMBAYARAN
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "qr", name: "QRIS Instant", desc: "BCA, GoPay, OVO, Dana, ShopeePay" },
                  { id: "va", name: "Virtual Account", desc: "BCA, Mandiri, BNI, BRI Transfer" },
                  { id: "card", name: "Kartu Kredit / Debit", desc: "Visa, Mastercard, JCB" },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#141414] border-white text-white shadow-sm"
                          : "bg-[#0e0e0e] border-[#1c1c1c] text-[#888888] hover:border-[#333333]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-sans text-xs font-bold text-white">{pm.name}</span>
                        <span className={`w-3.5 h-3.5 border flex items-center justify-center text-[9px] shrink-0 ml-2 ${
                          isSelected ? "border-white bg-white text-black font-bold" : "border-[#444444]"
                        }`}>
                          {isSelected ? "✓" : null}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#666666]">{pm.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT AREA: CLEAN ORDER SUMMARY (5 COLS) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0e0e0e] border border-[#1c1c1c] p-6 lg:p-8 sticky top-28 space-y-5">
              <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white border-b border-[#1c1c1c] pb-3">
                {t("checkout.summary")}
              </h3>

              {/* Cart Items Preview */}
              <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                {(items.length > 0 ? items : [
                  { id: "mock-1", name: "Sennheiser IE 900", brand: "SENNHEISER", price: 1299.00, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800", variant: "4.4mm Pentaconn", quantity: 1 },
                ]).map((item, idx) => (
                  <div key={item.id || idx} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 bg-[#141414] border border-[#222222] overflow-hidden shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="text-[9px] font-mono text-[#666666] block uppercase">{item.brand}</span>
                      <h4 className="font-sans text-xs font-semibold text-white truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#666666]">
                        <span className="truncate">{item.variant}</span>
                        {item.quantity > 1 && <span className="text-white font-bold">×{item.quantity}</span>}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-white shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Box in Checkout */}
              <div className="border-t border-[#1c1c1c] pt-4 space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#888888] font-bold">
                  Kode Promo / Voucher Demo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Contoh: DEMO1RP atau TONAL10"
                    className="bg-[#141414] border border-[#262626] focus:border-white text-xs font-mono text-white uppercase px-3 py-2 flex-1 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#2a2a2a] text-xs font-mono font-bold uppercase px-3.5 py-2 transition-colors cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-[10px] font-mono ${promoMessage.includes("BERHASIL") ? "text-emerald-400" : "text-red-400"}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-[#1c1c1c] pt-4 font-mono text-xs text-[#888888]">
                <div className="flex justify-between">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                </div>

                {isDemoRp1 ? (
                  <div className="flex justify-between text-emerald-400">
                    <span>Voucher Demo Khusus</span>
                    <span className="font-bold">Potongan Sisa Jadi Rp 1</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-400">
                    <span>Diskon Member ({discountRate * 100}%)</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Ongkos Kirim ({courier.toUpperCase()})</span>
                  <span className="font-semibold text-white">{shippingFee === 0 ? "GRATIS" : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#1c1c1c] pt-3 text-sm font-sans">
                  <span className="font-bold text-white uppercase">{t("cart.total")}</span>
                  <span className="font-mono text-xl font-bold text-[#D4FF00]">
                    {isDemoRp1 ? "Rp 1" : formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* CTA Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#D4FF00] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "MEMPROSES TRANSAKSI..." : isDemoRp1 ? "BAYAR RP 1 SEKARANG →" : "BAYAR SEKARANG →"}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
