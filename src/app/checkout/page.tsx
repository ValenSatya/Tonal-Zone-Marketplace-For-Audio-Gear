"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { useAdminData } from "@/context/AdminDataContext";
import { triggerAppNotification } from "@/context/NotificationContext";
import type { DbUserAddress } from "@/lib/supabase-db";
import {
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Package,
  Sparkles,
  MapPin,
  CreditCard,
  ChevronDown,
} from "lucide-react";

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
    Bali: [
      "Badung (Canggu, Seminyak, Kuta, Nusa Dua)",
      "Denpasar (Renon, Sanur)",
      "Gianyar (Ubud)",
    ],
  },
  "United States": {
    California: ["Los Angeles", "San Francisco", "San Diego"],
    "New York": ["New York City (Manhattan)", "Brooklyn"],
  },
  Singapore: {
    "Central Region": ["Orchard / River Valley", "Marina Bay / CBD"],
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
};

const PROMO_PRESETS = [
  { code: "TONAL10", label: "Diskon 10%", desc: "Voucher Pelanggan Baru" },
  { code: "AUDIOPHILE", label: "Diskon 15%", desc: "Spesial Komunitas IEM" },
  { code: "TONAL50", label: "Diskon 50%", desc: "Promo Mega Clearance" },
  { code: "DEMO1RP", label: "Demo Rp 1", desc: "Uji Transaksi Kilat" },
];

const PAYMENT_METHODS = [
  {
    id: "MIDTRANS_QRIS",
    title: "QRIS Standar Nasional",
    badge: "OTOMATIS",
    desc: "GoPay, OVO, DANA, ShopeePay & Semua m-Banking",
    logos: ["/images/payments/qris.svg", "/images/payments/gopay.svg"],
  },
  {
    id: "MIDTRANS_BCA_VA",
    title: "BCA Virtual Account",
    badge: "INSTAN",
    desc: "Verifikasi otomatis 24 jam via BCA Mobile, myBCA, KlikBCA",
    logos: ["/images/payments/bca.svg"],
  },
  {
    id: "MIDTRANS_MANDIRI_VA",
    title: "Mandiri Virtual Account",
    badge: "INSTAN",
    desc: "Transfer via Livin' by Mandiri atau ATM Mandiri",
    logos: ["/images/payments/mandiri.svg"],
  },
  {
    id: "MIDTRANS_BNI_VA",
    title: "BNI / BRI Virtual Account",
    badge: "INSTAN",
    desc: "Transfer instan via BNI Mobile, BRImo, atau ATM",
    logos: ["/images/payments/bni.svg"],
  },
  {
    id: "MIDTRANS_CREDIT_CARD",
    title: "Kartu Kredit / Debit Online",
    badge: "3D SECURE",
    desc: "Visa, Mastercard, JCB dengan perlindungan anti-fraud",
    logos: ["/images/payments/visa.svg", "/images/payments/mastercard.svg"],
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const { items, selectedItems, subtotal: cartSubtotal, clearCart, clearSelectedFromCart } = useCart();
  const { couriers, systemSettings } = useAdminData();
  const escrowFeePercent = systemSettings?.escrowFeePercent ?? 1.5;
  const inspectionWindowHours = systemSettings?.inspectionWindowHours ?? 48;

  const [country, setCountry] = useState("Indonesia");
  const [province, setProvince] = useState("DKI Jakarta");
  const [city, setCity] = useState("Jakarta Selatan (Kebayoran, Senopati, SCBD)");
  const [postalCode, setPostalCode] = useState("12190");
  const [street, setStreet] = useState("Jl. Senopati Raya No. 45, Kebayoran Baru");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [isInsuranceSelected, setIsInsuranceSelected] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("MIDTRANS_QRIS");
  const [isPaymentExpanded, setIsPaymentExpanded] = useState<boolean>(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("TONAL10");
  const [promoMessage, setPromoMessage] = useState<string | null>("VOUCHER AKTIF: DISKON 10%");

  // Session & UI
  const [userSession, setUserSession] = useState<{ name: string; email: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserSession(parsed);
        if (parsed.name) setRecipientName(parsed.name);
        if (parsed.phone) setRecipientPhone(parsed.phone);
      }
    } catch (e) {}
  }, []);

  const isDemoRp1 = ["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(appliedPromo.toUpperCase());

  const handleApplyPromo = (codeToApply?: string) => {
    const cleanCode = (codeToApply || promoCodeInput).trim().toUpperCase();
    if (!cleanCode) {
      setAppliedPromo("");
      setPromoMessage(null);
      return;
    }

    if (["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(cleanCode)) {
      setAppliedPromo(cleanCode);
      setPromoMessage("VOUCHER DEMO AKTIF: TOTAL JADI RP 1!");
    } else if (cleanCode === "TONAL10") {
      setAppliedPromo(cleanCode);
      setPromoMessage("PROMO DITERAPKAN: DISKON 10%");
    } else if (cleanCode === "AUDIOPHILE") {
      setAppliedPromo(cleanCode);
      setPromoMessage("PROMO AUDIOPHILE: DISKON 15%");
    } else if (cleanCode === "TONAL50") {
      setAppliedPromo(cleanCode);
      setPromoMessage("PROMO CLEARANCE: DISKON 50%");
    } else {
      setAppliedPromo(cleanCode);
      setPromoMessage(`KODE ${cleanCode} AKTIF: DISKON 5%`);
    }
  };

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

  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const cities = (ADDRESS_DATA[country]?.[newProv] || []) as string[];
    const firstCity = cities[0] || "";
    setCity(firstCity);
    setPostalCode(POSTAL_CODES[firstCity] || "10000");
  };

  // Logistics: Filter active couriers from Admin Data based on destination
  const availableCouriers = useMemo(() => {
    if (!couriers || couriers.length === 0) return [];
    const activeList = couriers.filter((c) => c.active);
    if (country !== "Indonesia") {
      const intl = activeList.filter((c) => c.type.includes("International"));
      return intl.length > 0 ? intl : activeList;
    }
    const dom = activeList.filter((c) => !c.type.includes("International"));
    return dom.length > 0 ? dom : activeList;
  }, [couriers, country]);

  useEffect(() => {
    if (availableCouriers.length > 0 && (!selectedCourierId || !availableCouriers.some((c) => c.id === selectedCourierId))) {
      setSelectedCourierId(availableCouriers[0].id);
    }
  }, [availableCouriers, selectedCourierId]);

  const selectedCourier = availableCouriers.find((c) => c.id === selectedCourierId) || availableCouriers[0];

  // Pricing calculations: prioritize selectedItems from multi-select
  const effectiveItems = selectedItems.length > 0
    ? selectedItems
    : items.length > 0
    ? items
    : [
        {
          id: "prod-blessing3",
          productId: "prod-blessing3",
          name: "MOONDROP BLESSING 3 Hybrid",
          brand: "MOONDROP",
          category: "IN-EAR MONITORS",
          price: 319,
          variant: "3.5mm SE",
          quantity: 1,
          image: "/hero-blessing-3.jpg",
          sellerName: "MOONDROP Official Flagship Store",
          sellerId: "store-moondrop-official",
        },
      ];

  const subtotal = effectiveItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const discountRate = isDemoRp1
    ? 0
    : appliedPromo === "TONAL50"
    ? 0.5
    : appliedPromo === "AUDIOPHILE"
    ? 0.15
    : appliedPromo === "TONAL10"
    ? 0.1
    : appliedPromo
    ? 0.05
    : 0;

  const discountAmount = isDemoRp1 ? subtotal - 0.0000625 : subtotal * discountRate;
  const shippingFee = isDemoRp1 ? 0 : (selectedCourier?.baseRateUSD ?? 3);
  // 0.2% of declared value + $0.35 policy fee
  const calculatedInsuranceFee = Math.round((subtotal * 0.002 + 0.35) * 100) / 100;
  const insuranceFee = (!isDemoRp1 && isInsuranceSelected) ? calculatedInsuranceFee : 0;
  // Dynamic platform & escrow service fee based on admin systemSettings.escrowFeePercent (default 1.5%)
  const calculatedPlatformFee = Math.round((subtotal * (escrowFeePercent / 100)) * 100) / 100;
  const platformFee = isDemoRp1 ? 0 : calculatedPlatformFee;
  const grandTotal = isDemoRp1 ? 0.0000625 : Math.max(0, subtotal - discountAmount + shippingFee + insuranceFee + platformFee);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const checkoutItems = effectiveItems.map((it: any) => {
        const isMoondrop =
          (it.brand || "").toUpperCase().includes("MOONDROP") ||
          (it.name || "").toUpperCase().includes("MOONDROP");
        const resolvedStoreId = isMoondrop
          ? "store-moondrop-official"
          : it.sellerId || it.storeId || "store-moondrop-official";
        const resolvedStoreName = isMoondrop
          ? "MOONDROP Official Flagship Store"
          : it.sellerName || it.storeName || "MOONDROP Official Flagship Store";

        return {
          productId: it.productId || it.id || "prod-default",
          productName: it.name,
          brand: isMoondrop ? "MOONDROP" : it.brand || "MOONDROP",
          category: it.category || "IN-EAR MONITORS",
          priceUSD: it.price,
          quantity: it.quantity || 1,
          selectedVariant: it.variant || "Standard",
          image: it.image || "/hero-blessing-3.jpg",
          storeId: resolvedStoreId,
          storeName: resolvedStoreName,
          storeCity: "Jakarta Selatan",
        };
      });

      // 1. Create order in orderRepo
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: userSession?.email || "usr-valen",
          buyerName: recipientName || userSession?.name || "Valen",
          buyerEmail: userSession?.email || "valen@tonalzone.com",
          buyerPhone: recipientPhone || "08123456789",
          destinationAddress: street,
          destinationCity: city,
          destinationPostalCode: postalCode,
          paymentMethod: selectedPaymentMethod,
          cartItems: checkoutItems,
          promoCode: appliedPromo,
          isDemoRp1,
          courierCode: selectedCourier?.code || "JNE",
          courierName: selectedCourier?.name || "JNE Express",
          shippingFee: shippingFee,
          isInsured: isInsuranceSelected,
          insuranceFee: insuranceFee,
          platformFee: platformFee,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

      const finalOrderId = data.orderId || data.subOrderId || `ORD-${Date.now().toString().slice(-5)}`;

      // Store backup order data for resilient payment page hydration
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "tonalzone_pending_order",
            JSON.stringify({
              orderId: finalOrderId,
              parentOrderId: data.orderId || finalOrderId,
              paymentMethod: selectedPaymentMethod,
              courierCode: selectedCourier?.code || "JNE",
              courierName: selectedCourier?.name || "JNE Express",
              shippingFee: shippingFee,
              items: checkoutItems.map((it: any) => ({
                id: it.productId,
                productName: it.productName,
                selectedVariant: it.selectedVariant || "Standard",
                quantity: it.quantity || 1,
                price: it.priceUSD,
                image: it.image || "/hero-blessing-3.jpg",
                storeName: it.storeName,
              })),
              totalAmount: grandTotal,
              isDemo: isDemoRp1,
              promoCode: appliedPromo,
              createdAt: new Date().toISOString(),
            })
          );
        }
      } catch (storageErr) {
        console.warn("Could not save pending order backup:", storageErr);
      }

      // Clear checked out items from cart
      if (selectedItems.length > 0) {
        clearSelectedFromCart();
      } else {
        clearCart();
      }

      // Redirect to dedicated payment instruction page
      router.push(`/checkout/payment?orderId=${finalOrderId}&method=${selectedPaymentMethod}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses pesanan.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans selection:bg-[#BFDD25] selection:text-[#030303] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-6xl mx-auto px-5 sm:px-8 w-full">
        {/* Header (Zero Border, Rounded-2xl max 16px) */}
        <div className="mb-6 rounded-2xl bg-[#0A0A0A] p-6 sm:p-7 border-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
              TonalZone Escrow Secure Checkout
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
              100% Buyer Protection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-heading">
            Penyelesaian Pesanan
          </h1>
          <p className="text-xs text-[#8E8E93] font-sans mt-1">
            Dana transaksi Anda dijamin aman di rekening bersama TonalZone Escrow dan baru diteruskan ke toko setelah barang Anda terima dalam kondisi sempurna.
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-xl bg-[#261212] text-[#FCA5A5] text-xs font-sans flex items-center gap-3 border-0"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-28 lg:pb-0">
          {/* Left Column: Address, Courier, Promo (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Shipping Address Card (Rounded-2xl, Zero Border) */}
            <div className="rounded-2xl bg-[#0A0A0A] p-5 sm:p-7 space-y-4 sm:space-y-5 border-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span>Alamat Pengiriman</span>
                </h3>
                <span className="text-[10px] font-mono text-[#71717A] uppercase">
                  Langkah 1 dari 3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold mb-2">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Contoh: Valen Satya"
                    className="w-full px-4 py-3 rounded-xl bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] text-xs text-white placeholder:text-[#666666] outline-none transition-all shadow-inner border-0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold mb-2">
                    Nomor WhatsApp / Telepon *
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-4 py-3 rounded-xl bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] text-xs text-white placeholder:text-[#666666] outline-none transition-all shadow-inner border-0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold mb-2">
                    Negara
                  </label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] text-xs text-white outline-none cursor-pointer transition-all shadow-inner border-0"
                  >
                    {Object.keys(ADDRESS_DATA).map((c) => (
                      <option key={c} value={c} className="bg-[#181818] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold mb-2">
                    Provinsi
                  </label>
                  <select
                    value={province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] text-xs text-white outline-none cursor-pointer transition-all shadow-inner border-0"
                  >
                    {Object.keys(ADDRESS_DATA[country] || {}).map((p) => (
                      <option key={p} value={p} className="bg-[#181818] text-white">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold mb-2">
                    Kota / Wilayah
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] text-xs text-white outline-none cursor-pointer transition-all shadow-inner border-0"
                  >
                    {((ADDRESS_DATA[country]?.[province] as string[]) || []).map((ct) => (
                      <option key={ct} value={ct} className="bg-[#181818] text-white">
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold mb-2">
                  Alamat Lengkap & Patokan *
                </label>
                <textarea
                  rows={2}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Jl. Senopati Raya No. 45, RT 02/RW 04, Kebayoran Baru"
                  className="w-full p-4 rounded-xl bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] text-xs text-white placeholder:text-[#666666] leading-relaxed outline-none transition-all shadow-inner border-0"
                  required
                />
              </div>
            </div>

            {/* Courier Selection Card (Dynamically Connected to Admin Courier Data) */}
            <div className="rounded-2xl bg-[#0A0A0A] p-5 sm:p-7 space-y-3.5 sm:space-y-4 border-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Truck className="w-4 h-4 text-white" />
                  <span>Opsi Kurir Pengiriman ({availableCouriers.length} Layanan Aktif)</span>
                </h3>
                <span className="text-[10px] font-mono text-[#71717A] uppercase">
                  Langkah 2 dari 3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableCouriers.map((c) => {
                  const isSelected = selectedCourierId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCourierId(c.id)}
                      className={`p-4 rounded-xl text-left transition-all cursor-pointer border-0 relative ${
                        isSelected
                          ? "bg-[#181818] ring-1 ring-white/30 shadow-md"
                          : "bg-[#121212] hover:bg-[#161616]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate">{c.name}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] shrink-0" />
                            )}
                          </div>
                          <span className={`text-[10px] font-mono block mt-0.5 font-medium ${
                            isSelected ? "text-zinc-200" : "text-zinc-400"
                          }`}>
                            {c.type} • Estimasi {c.estimatedDays}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white shrink-0">
                          {c.baseRateUSD === 0 ? "GRATIS" : formatPrice(c.baseRateUSD)}
                        </span>
                      </div>
                      {c.notes && (
                        <p className="text-[11px] text-[#71717A] mt-2 line-clamp-1 leading-snug">{c.notes}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* High-Value Audio Insurance Protection Card */}
            <div
              onClick={() => setIsInsuranceSelected(!isInsuranceSelected)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border-0 flex items-start gap-3.5 ${
                isInsuranceSelected
                  ? "bg-[#141414] ring-1 ring-white/20 shadow-lg"
                  : "bg-[#0c0c0c] hover:bg-[#121212] opacity-75"
              }`}
            >
              <input
                type="checkbox"
                checked={isInsuranceSelected}
                onChange={() => {}}
                className="mt-1 w-4 h-4 rounded accent-white cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span className="text-xs font-semibold text-white uppercase font-mono tracking-wide">
                      Proteksi Asuransi Audio Bernilai Tinggi
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    +{formatPrice(calculatedInsuranceFee)}
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-1.5">
                  Menjamin penggantian 100% nilai penuh jika IEM, DAP, atau Headphone mengalami kehilangan atau kerusakan driver akustik akibat benturan kurir selama pengiriman.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-mono font-medium">
                    ✓ Garansi Unit Baru
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 font-mono">
                    Klaim Cepat 1x24 Jam
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection Card (Langkah 3 dari 3) */}
            <div className="rounded-2xl bg-[#0A0A0A] p-5 sm:p-7 space-y-4 border-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Metode Pembayaran</span>
                </h3>
                <span className="text-[10px] font-mono text-[#71717A] uppercase">
                  Langkah 3 dari 3
                </span>
              </div>

              <div className="space-y-2.5">
                {/* 1. Top 3 Payment Methods (Always Visible) */}
                {PAYMENT_METHODS.slice(0, 3).map((pm) => {
                  const isSelected = selectedPaymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(pm.id)}
                      className={`w-full p-3.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 sm:gap-4 border ${
                        isSelected
                          ? "bg-[#181818] border-white/50 shadow-md ring-1 ring-white/20"
                          : "bg-[#111111] border-transparent hover:bg-[#151515]"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        {/* Radio Dot */}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "border-white bg-white"
                              : "border-zinc-600 bg-transparent"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate">{pm.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white font-mono uppercase shrink-0">
                              {pm.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#71717A] mt-0.5 truncate">{pm.desc}</p>
                        </div>
                      </div>

                      {/* Method Logos */}
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {pm.logos.map((logo, lIdx) => (
                          <div
                            key={lIdx}
                            className="h-5 sm:h-6 w-10 sm:w-11 bg-white rounded px-1.5 py-0.5 flex items-center justify-center shrink-0 shadow-sm border border-white/20"
                          >
                            <img
                              src={logo}
                              alt="payment logo"
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}

                {/* 2. Dropdown for Additional Payment Methods (Animated Accordion) */}
                <AnimatePresence initial={false}>
                  {isPaymentExpanded && (
                    <motion.div
                      key="extra-payment-methods"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="space-y-2.5 overflow-hidden pt-0.5"
                    >
                      {PAYMENT_METHODS.slice(3).map((pm) => {
                        const isSelected = selectedPaymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setSelectedPaymentMethod(pm.id)}
                            className={`w-full p-3.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 sm:gap-4 border ${
                              isSelected
                                ? "bg-[#181818] border-white/50 shadow-md ring-1 ring-white/20"
                                : "bg-[#111111] border-transparent hover:bg-[#151515]"
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? "border-white bg-white"
                                    : "border-zinc-600 bg-transparent"
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-white truncate">{pm.title}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white font-mono uppercase shrink-0">
                                    {pm.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#71717A] mt-0.5 truncate">{pm.desc}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                              {pm.logos.map((logo, lIdx) => (
                                <div
                                  key={lIdx}
                                  className="h-5 sm:h-6 w-10 sm:w-11 bg-white rounded px-1.5 py-0.5 flex items-center justify-center shrink-0 shadow-sm border border-white/20"
                                >
                                  <img
                                    src={logo}
                                    alt="payment logo"
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Info if Selected Method is in Collapsed List */}
                {!isPaymentExpanded && !PAYMENT_METHODS.slice(0, 3).some((m) => m.id === selectedPaymentMethod) && (
                  <div className="p-3 rounded-xl bg-[#161616] border border-white/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                      <span className="text-white font-medium truncate">
                        Terpilih: {PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPaymentExpanded(true)}
                      className="text-white text-[11px] font-mono hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Ubah
                    </button>
                  </div>
                )}

                {/* Dropdown Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsPaymentExpanded((prev) => !prev)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 text-xs font-mono text-[#D4D4D8] hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                >
                  <span>
                    {isPaymentExpanded
                      ? "Sembunyikan Metode Lain"
                      : `Lihat ${PAYMENT_METHODS.length - 3} Metode Pembayaran Lainnya`}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isPaymentExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Promo Code Card (Rounded-2xl, Zero Border) */}
            <div className="rounded-2xl bg-[#0A0A0A] p-5 sm:p-7 space-y-3.5 sm:space-y-4 border-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Tag className="w-4 h-4 text-white" />
                  <span>Kode Promo & Voucher Diskon</span>
                </h3>
                {appliedPromo && (
                  <span className="text-[11px] font-mono text-[#BFDD25] uppercase font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
                    {appliedPromo} Aktif
                  </span>
                )}
              </div>

              {/* Promo input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="Ketik kode (misal: TONAL10)"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] text-xs font-mono uppercase text-white placeholder:text-[#666666] outline-none transition-all shadow-inner border-0"
                />
                <button
                  type="button"
                  onClick={() => handleApplyPromo()}
                  className="px-6 py-3 rounded-xl bg-[#1C1C1C] hover:bg-white text-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border-0"
                >
                  Terapkan
                </button>
              </div>

              {promoMessage && (
                <div className="p-3 rounded-xl bg-[#161616] ring-1 ring-[#BFDD25]/20 text-[11px] font-mono text-[#BFDD25] flex items-center gap-2 border-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#BFDD25]" />
                  <span>{promoMessage}</span>
                </div>
              )}

              {/* Preset Promo Buttons */}
              <div className="pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block mb-2">
                  Voucher Rekomendasi Hari Ini
                </span>
                <div className="flex flex-wrap gap-2">
                  {PROMO_PRESETS.map((p) => {
                    const isCurrent = appliedPromo.toUpperCase() === p.code;
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          setPromoCodeInput(p.code);
                          handleApplyPromo(p.code);
                        }}
                        className={`px-3.5 py-2 rounded-full text-xs font-sans transition-all cursor-pointer flex items-center gap-2 border-0 ${
                          isCurrent
                            ? "bg-white text-black font-bold shadow-sm"
                            : "bg-[#161616] hover:bg-[#202020] ring-1 ring-white/10 text-[#D4D4D8]"
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{p.code}</span>
                        <span className="text-[10px] opacity-75">({p.label})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Instant Escrow Payment (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-[#0A0A0A] p-6 sm:p-7 space-y-6 sticky top-28 border-0">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Ringkasan Belanja & Escrow
              </h3>

              {/* Items List */}
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {effectiveItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl bg-[#141414] overflow-hidden shrink-0 border-0">
                      <Image
                        src={item.image || "/hero-blessing-3.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-[#71717A] font-mono mt-0.5">
                        {item.sellerName || "MOONDROP Official Flagship Store"}
                      </p>
                      <p className="text-xs font-mono font-bold text-white mt-1">
                        {item.quantity}x {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fee Breakdown (Zero border) */}
              <div className="pt-2 space-y-2.5 text-xs font-sans">
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Subtotal Produk</span>
                  <span className="font-mono text-white">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#BFDD25]">
                    <span>Potongan Kode Promo ({appliedPromo})</span>
                    <span className="font-mono font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Biaya Pengiriman</span>
                  <span className="font-mono text-white">
                    {shippingFee === 0 ? "GRATIS" : formatPrice(shippingFee)}
                  </span>
                </div>

                {isInsuranceSelected && insuranceFee > 0 && (
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span className="flex items-center gap-1.5">
                      <span>Asuransi Audio Premium</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-medium">
                        100% COVER
                      </span>
                    </span>
                    <span className="font-mono text-white">{formatPrice(insuranceFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5">
                    <span>Biaya Layanan Rekber Escrow ({escrowFeePercent}%)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#BFDD25]/10 text-[#BFDD25] font-mono font-medium">
                      ESCROW
                    </span>
                  </span>
                  <span className="font-mono text-white">
                    {isDemoRp1 ? "Rp 0" : formatPrice(platformFee)}
                  </span>
                </div>

                <div className="h-px bg-white/5 my-2" />
                <div className="pt-1 flex justify-between items-center text-sm">
                  <span className="font-semibold text-white">Total Pembayaran</span>
                  <span className="text-xl font-mono font-bold text-white">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Escrow Guarantee Notice (Rounded-xl) */}
              <div className="p-4 rounded-xl bg-[#121212] flex items-start gap-3 text-xs text-[#A1A1AA] border-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-white font-medium">Garansi Rekber Escrow ({inspectionWindowHours} Jam):</strong> Dana Anda ditahan aman. Toko penjual baru dapat mencairkan dana setelah Anda konfirmasi terima barang atau masa uji coba suara {inspectionWindowHours} jam selesai.
                </p>
              </div>

              {/* Instant One-Click Payment Button (High contrast Black & White with minimal green dot) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50 border-0 group"
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Buat Pesanan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#71717A] font-sans">
                Setelah pesanan dibuat, Anda akan diarahkan ke halaman instruksi pembayaran QRIS / Virtual Account.
              </p>
            </div>
          </div>
        </form>

        {/* Mobile Floating Sticky Checkout Bar (Tokopedia/Shopee style) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
                Total Tagihan
              </span>
              <span className="text-base font-mono font-bold text-white tracking-tight">
                {formatPrice(grandTotal)}
              </span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 border-0 shrink-0 group"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Bayar Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
