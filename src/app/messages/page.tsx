"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@/context/LocationContext";
import { fetchProductsFromDb, fetchProductByIdFromDb, CatalogProduct } from "@/lib/products-db";
import { triggerAppNotification } from "@/context/NotificationContext";

export interface AttachedProductData {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  soundSignature?: string;
  category?: string;
}

export interface AttachedOrderData {
  orderNumber: string;
  productName: string;
  brand?: string;
  price: number;
  status: string;
  waybillNumber?: string;
  courierCode?: string;
  image?: string;
}

export interface MessageItem {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  productCard?: AttachedProductData;
  orderCard?: AttachedOrderData;
}

export interface ContactItem {
  id: string;
  name: string;
  type: "Official Store" | "Authorized Dealer" | "Verified Merchant";
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: "seller-csi",
    name: "CSI Zone Official Store",
    type: "Official Store",
    avatar: "CZ",
    lastMessage: "Halo kak! Unit ready stock, siap kirim dengan garansi distributor resmi.",
    time: "10:23 AM",
    unread: 1,
    online: true,
  },
  {
    id: "seller-bass-audio",
    name: "Bass Audio Official",
    type: "Official Store",
    avatar: "BA",
    lastMessage: "Bisa kirim dengan kurir instant atau same day hari ini kak.",
    time: "Kemarin",
    unread: 0,
    online: true,
  },
  {
    id: "seller-headphone-zone",
    name: "Headphone Zone ID",
    type: "Authorized Dealer",
    avatar: "HZ",
    lastMessage: "Unit mulus segel box BNIB bergaransi resmi 12 bulan.",
    time: "2 hari lalu",
    unread: 0,
    online: false,
  },
];

const INITIAL_CHAT_DATA: Record<string, MessageItem[]> = {
  "seller-csi": [
    {
      id: "m-csi-1",
      sender: "me",
      text: "Halo min, apakah produk ini ready stock dan bisa langsung dikirim?",
      time: "10:20 AM",
    },
    {
      id: "m-csi-2",
      sender: "them",
      text: "Halo kak! Unit ready stock 100% original bergaransi resmi 1 tahun. Checkout sebelum jam 16.00 WIB langsung kami serahkan ke kurir hari ini.",
      time: "10:23 AM",
    },
  ],
  "seller-bass-audio": [
    {
      id: "m-ba-1",
      sender: "me",
      text: "Siang kak, apakah unit di Bass Audio bergaransi distributor resmi?",
      time: "14:15",
    },
    {
      id: "m-ba-2",
      sender: "them",
      text: "Siang kak! Betul sekali, unit bergaransi distributor resmi 12 bulan dan dapat klaim langsung melalui kartu garansi di dalam paket.",
      time: "14:18",
    },
  ],
  "seller-headphone-zone": [
    {
      id: "m-hz-1",
      sender: "me",
      text: "Apakah kabel bawaan 3.5mm atau 4.4mm balanced?",
      time: "16:02",
    },
    {
      id: "m-hz-2",
      sender: "them",
      text: "Unit ini sudah include kabel modular dengan jack 3.5mm dan 4.4mm di dalam box bawaan kak.",
      time: "16:05",
    },
  ],
};

function formatStoreName(raw: string): string {
  if (!raw) return "Tonal Zone Official";
  const decoded = decodeURIComponent(raw).trim();
  if (decoded.toLowerCase().includes("official")) return decoded;
  return decoded
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getStoreInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "TZ";
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerQuery = searchParams?.get("seller") || searchParams?.get("store");
  const productQuery = searchParams?.get("product");
  const orderQuery = searchParams?.get("orderId") || searchParams?.get("orderNumber");
  const { formatPrice } = useLocation();

  const [contacts, setContacts] = useState<ContactItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tonalzone_chat_contacts");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_CONTACTS;
  });

  const [chatMessages, setChatMessages] = useState<Record<string, MessageItem[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tonalzone_chat_messages");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CHAT_DATA;
  });

  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || "seller-csi");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Active Context Attachments (Shopee style floating dock)
  const [attachedProduct, setAttachedProduct] = useState<AttachedProductData | null>(null);
  const [attachedOrder, setAttachedOrder] = useState<AttachedOrderData | null>(null);

  // Product Picker Modal (+ Produk)
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load catalog products for the "+ Produk" picker
  useEffect(() => {
    async function loadCatalog() {
      try {
        const items = await fetchProductsFromDb();
        setCatalogProducts(items);
      } catch (e) {}
    }
    loadCatalog();
  }, []);

  // Authentication Route Guard
  useEffect(() => {
    try {
      const user = localStorage.getItem("tonalzone_user");
      if (!user) {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    } catch (e) {}
  }, [router]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tonalzone_chat_contacts", JSON.stringify(contacts));
    } catch (e) {}
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem("tonalzone_chat_messages", JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  // Load Real Product Data from Database
  useEffect(() => {
    if (!productQuery) return;

    async function loadProduct() {
      try {
        const direct = await fetchProductByIdFromDb(productQuery!);
        if (direct) {
          setAttachedProduct({
            id: direct.id,
            name: direct.name,
            brand: direct.brand,
            price: direct.price,
            image: direct.image,
            soundSignature: direct.soundSignature,
            category: direct.category,
          });
          return;
        }

        const all = await fetchProductsFromDb();
        const found = all.find(
          (p) =>
            p.id.toLowerCase() === productQuery!.toLowerCase() ||
            p.name.toLowerCase().includes(productQuery!.toLowerCase())
        );
        if (found) {
          setAttachedProduct({
            id: found.id,
            name: found.name,
            brand: found.brand,
            price: found.price,
            image: found.image,
            soundSignature: found.soundSignature,
            category: found.category,
          });
        }
      } catch (err) {
        console.error("Gagal memuat produk untuk lampiran chat:", err);
      }
    }

    loadProduct();
  }, [productQuery]);

  // Load Real Order Data
  useEffect(() => {
    if (!orderQuery) return;

    async function loadOrder() {
      let resolvedOrder: AttachedOrderData | null = null;

      try {
        const stored = localStorage.getItem("tonalzone_orders");
        if (stored) {
          const parsed = JSON.parse(stored);
          const match = parsed.find(
            (o: any) => o.orderNumber === orderQuery || o.id === orderQuery
          );
          if (match) {
            resolvedOrder = {
              orderNumber: match.orderNumber || match.id,
              productName: match.productName || "Audiophile Gear",
              brand: match.brand || "Tonal Zone",
              price: match.price || 0,
              status: match.status || "IN_TRANSIT",
              waybillNumber: match.waybillNumber,
              courierCode: match.courierCode || "JNE Express",
              image: match.image,
            };
          }
        }

        if (!resolvedOrder) {
          const res = await fetch("/api/orders");
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.orders)) {
              const match = json.orders.find((o: any) => o.id === orderQuery);
              if (match) {
                resolvedOrder = {
                  orderNumber: match.id,
                  productName: match.items?.[0]?.productName || "Audiophile Gear",
                  brand: match.items?.[0]?.brand || "Tonal Zone",
                  price: match.totalAmount || 0,
                  status: match.escrowStatus || "IN_TRANSIT",
                  waybillNumber: match.waybillNumber || "JNE882914029",
                  courierCode: match.courierCode || "JNE Express",
                  image: match.items?.[0]?.image,
                };
              }
            }
          }
        }
      } catch (e) {}

      if (!resolvedOrder) {
        resolvedOrder = {
          orderNumber: orderQuery!,
          productName: "Pesanan Audiophile Tonal Zone",
          price: 249.0,
          status: "IN_TRANSIT",
          waybillNumber: "JNE882914029",
          courierCode: "JNE Express",
        };
      }

      setAttachedOrder(resolvedOrder);
    }

    loadOrder();
  }, [orderQuery]);

  // Select or Create Contact based on sellerQuery
  useEffect(() => {
    if (!sellerQuery) return;

    const formattedName = formatStoreName(sellerQuery);
    const sellerId = "seller-" + formattedName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    setContacts((prev) => {
      const existing = prev.find(
        (c) => c.id === sellerId || c.name.toLowerCase() === formattedName.toLowerCase()
      );
      if (existing) {
        setSelectedContactId(existing.id);
        return prev;
      }

      const isOfficial = formattedName.toLowerCase().includes("official");
      const newContact: ContactItem = {
        id: sellerId,
        name: formattedName,
        type: isOfficial ? "Official Store" : "Authorized Dealer",
        avatar: getStoreInitials(formattedName),
        lastMessage: "Memulai percakapan dengan penjual...",
        time: "Baru saja",
        unread: 0,
        online: true,
      };

      setSelectedContactId(newContact.id);
      return [newContact, ...prev];
    });

    setIsMobileListVisible(false);
  }, [sellerQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedContactId, chatMessages, isTyping]);

  const activeContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || contacts[0];
  }, [contacts, selectedContactId]);

  const currentMessages = useMemo(() => {
    return chatMessages[selectedContactId] || [];
  }, [chatMessages, selectedContactId]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const filteredCatalog = useMemo(() => {
    if (!pickerSearch.trim()) return catalogProducts.slice(0, 12);
    return catalogProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
          p.brand.toLowerCase().includes(pickerSearch.toLowerCase())
      )
      .slice(0, 12);
  }, [catalogProducts, pickerSearch]);

  const handleSelectContact = (contact: ContactItem) => {
    setSelectedContactId(contact.id);
    setIsMobileListVisible(false);
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c))
    );
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Shopee-style Send Message: Attaches product card directly to the inquiry message
  const sendMessage = (
    text: string,
    options?: { withProductCard?: boolean; withOrderCard?: boolean }
  ) => {
    const trimmed = text.trim();
    const attachProd = options?.withProductCard && attachedProduct ? attachedProduct : undefined;
    const attachOrd = options?.withOrderCard && attachedOrder ? attachedOrder : undefined;

    if (!trimmed && !attachProd && !attachOrd) return;

    const time = getCurrentTime();
    const newMsg: MessageItem = {
      id: `m-${Date.now()}`,
      sender: "me",
      text: trimmed,
      time,
      productCard: attachProd,
      orderCard: attachOrd,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMsg],
    }));

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? {
              ...c,
              lastMessage:
                trimmed ||
                (attachProd ? `Menanyakan: ${attachProd.name}` : "") ||
                (attachOrd ? `Pesanan #${attachOrd.orderNumber}` : ""),
              time,
            }
          : c
      )
    );

    setMessageInput("");

    // Once a product/order card has been sent into the conversation, dismiss the dock
    if (attachProd) {
      setAttachedProduct(null);
    }
    if (attachOrd) {
      setAttachedOrder(null);
    }

    // Contextual Store Reply Simulation
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyTime = getCurrentTime();

      let replyText = `Halo kak! Terima kasih sudah menghubungi ${activeContact.name}. Ada yang bisa kami bantu?`;

      const lower = trimmed.toLowerCase();

      if (attachProd) {
        if (lower.includes("ready") || lower.includes("stok") || lower.includes("tersedia") || !trimmed) {
          replyText = `Halo kak! Untuk ${attachProd.name} di ${activeContact.name} ready stock 100% original BNIB. Siap diproses dan kirim hari ini ya kak!`;
        } else if (lower.includes("garansi") || lower.includes("resmi") || lower.includes("asli")) {
          replyText = `Tentu kak! ${attachProd.name} bergaransi distributor resmi 1 tahun. Kartu garansi dan nomor seri resmi disertakan lengkap di dalam box.`;
        } else if (lower.includes("kirim") || lower.includes("instant") || lower.includes("express")) {
          replyText = `Bisa banget kak! Pesanan untuk ${attachProd.name} sebelum pukul 16:00 WIB langsung kami serahkan ke kurir hari ini.`;
        } else {
          replyText = `Halo kak! Unit ${attachProd.name} ready stock. Silakan langsung checkout via sistem Tonal Zone Escrow agar kami amankan stoknya.`;
        }
      } else if (attachOrd) {
        if (lower.includes("resi") || lower.includes("status") || lower.includes("sampai") || lower.includes("kirim") || !trimmed) {
          replyText = `Halo kak! Untuk pesanan #${attachOrd.orderNumber} dengan resi ${attachOrd.waybillNumber || "JNE882914029"} saat ini sedang dalam perjalanan kurir ${attachOrd.courierCode || "JNE Express"} menuju alamat Anda.`;
        } else {
          replyText = `Halo kak! Mengenai pesanan #${attachOrd.orderNumber}, transaksi dilindungi sepenuhnya oleh rekening bersama Tonal Zone Escrow.`;
        }
      } else {
        if (lower.includes("ready") || lower.includes("stok")) {
          replyText = `Halo kak! Sebagian besar produk kami ready stock siap kirim. Kakak tertarik dengan model yang mana?`;
        } else if (lower.includes("garansi")) {
          replyText = `Semua produk di ${activeContact.name} bergaransi resmi distributor dan dilindungi sistem Tonal Zone Escrow.`;
        }
      }

      const sellerMsg: MessageItem = {
        id: `m-reply-${Date.now()}`,
        sender: "them",
        text: replyText,
        time: replyTime,
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] || []), sellerMsg],
      }));

      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContactId
            ? { ...c, lastMessage: replyText, time: replyTime }
            : c
        )
      );

      triggerAppNotification({
        type: "chat",
        title: `Pesan Baru dari ${activeContact.name}`,
        message: replyText,
        actionLink: `/messages?seller=${encodeURIComponent(activeContact.name)}`,
        meta: {
          storeName: activeContact.name,
        },
      });
    }, 1100);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(messageInput, {
      withProductCard: !!attachedProduct,
      withOrderCard: !!attachedOrder,
    });
  };

  return (
    <div className="flex flex-col h-[100svh] bg-[#090909] text-[#FAF9F6] font-sans overflow-hidden selection:bg-[#D4FF00] selection:text-[#080808]">
      <main className="flex-1 flex overflow-hidden">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: SHOPEE-STYLE CONVERSATIONS LIST */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-[320px] lg:w-[360px] border-r border-[#1c1c1c] flex flex-col bg-[#0c0c0c] shrink-0 transition-transform duration-200 ${
            !isMobileListVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-[#1c1c1c] flex items-center justify-between shrink-0 bg-[#080808]">
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="text-[#888888] hover:text-white p-1 border border-transparent hover:border-[#262626] transition-colors"
                title="Kembali ke Beranda"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="font-heading font-bold text-sm tracking-wider uppercase text-white">
                  CHAT PENJUAL
                </h1>
                <span className="text-[10px] font-mono text-[#666666]">Tonal Zone Messenger</span>
              </div>
            </div>

            <Link
              href="/collection"
              className="px-2.5 py-1 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-[10px] font-mono text-[#CCCCCC] hover:text-white uppercase tracking-wider transition-colors"
            >
              KATALOG
            </Link>
          </div>

          {/* Search Contacts Bar */}
          <div className="p-2.5 border-b border-[#1c1c1c] bg-[#0a0a0a]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari toko atau chat..."
                className="w-full bg-[#141414] border border-[#222222] focus:border-[#444444] rounded-none pl-8 pr-6 py-2 text-xs text-white placeholder:text-[#555555] font-mono outline-none transition-colors"
              />
              <svg
                className="absolute left-2.5 top-2.5 text-[#555555] w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-xs text-[#777777] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-[#141414]">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => {
                const isSelected = selectedContactId === contact.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className={`w-full text-left px-3.5 py-3 flex items-center gap-3 hover:bg-[#121212] transition-colors cursor-pointer border-l-2 ${
                      isSelected
                        ? "bg-[#141414] border-l-[#D4FF00]"
                        : "border-l-transparent bg-transparent"
                    }`}
                  >
                    {/* Store Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 flex items-center justify-center text-xs font-mono font-bold tracking-wider border ${
                          isSelected
                            ? "bg-[#1f1f1f] border-white text-white"
                            : "bg-[#141414] border-[#222222] text-[#CCCCCC]"
                        }`}
                      >
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#D4FF00] border border-[#080808]"></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`text-xs font-sans font-semibold truncate ${isSelected ? "text-white" : "text-[#D1D1D6]"}`}>
                          {contact.name}
                        </h3>
                        <span className="text-[10px] font-mono text-[#666666] shrink-0 ml-1">{contact.time}</span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <p className={`text-[11px] truncate leading-tight ${contact.unread > 0 ? "text-white font-medium" : "text-[#777777]"}`}>
                          {contact.lastMessage}
                        </p>
                        {contact.unread > 0 && (
                          <span className="h-4 min-w-[16px] px-1 bg-[#D4FF00] text-black text-[9px] font-bold font-mono flex items-center justify-center shrink-0">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#666666] font-mono uppercase tracking-wider">
                Tidak ada obrolan.
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: ACTIVE CHAT CONVERSATION (SHOPEE STYLE) */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex flex-col bg-[#080808] relative ${
            isMobileListVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {activeContact ? (
            <>
              {/* Header Bar */}
              <div className="px-4 py-3 border-b border-[#1c1c1c] bg-[#0c0c0c] flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileListVisible(true)}
                    className="md:hidden text-[#888888] hover:text-white p-1 border border-[#262626]"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="w-9 h-9 bg-[#141414] border border-[#222222] flex items-center justify-center text-[#D4FF00] text-xs font-mono font-bold shrink-0">
                    {activeContact.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-sans font-bold text-sm text-white">{activeContact.name}</h2>
                      <span className="text-[8px] font-mono uppercase px-1.5 py-0.2 bg-[#181818] border border-[#262626] text-[#AAAAAA]">
                        {activeContact.type}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#777777]">
                      {activeContact.online ? (
                        <span className="text-[#D4FF00]">Online</span>
                      ) : (
                        <span>Aktif 1 jam lalu</span>
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  href="/collection"
                  className="px-3 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#262626] text-xs font-mono text-[#CCCCCC] hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <span>Kunjungi Toko</span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>

              {/* Chat Thread Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 no-scrollbar bg-[#080808]">
                
                {/* Security Trust Note */}
                <div className="text-center my-2">
                  <span className="text-[10px] font-mono text-[#555555] tracking-wider uppercase bg-[#0f0f0f] px-3 py-1 border border-[#1a1a1a] inline-block">
                    Percakapan Dilindungi Sistem Rekening Bersama Tonal Zone Escrow
                  </span>
                </div>

                {currentMessages.map((msg) => {
                  const isMe = msg.sender === "me";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      {/* ========================================================= */}
                      {/* SHOPEE-STYLE UNIFIED PRODUCT MENTION BUBBLE */}
                      {/* ========================================================= */}
                      {msg.productCard ? (
                        <div className="max-w-[340px] sm:max-w-[380px] bg-[#121212] border border-[#2a2a2a] p-3 text-left">
                          {/* Inner Product Card with Clear Image (Shopee Style) */}
                          <div className="flex gap-3 items-center bg-[#0a0a0a] border border-[#1c1c1c] p-2.5 mb-2.5">
                            <div className="w-16 h-16 bg-[#141414] border border-[#262626] shrink-0 relative overflow-hidden">
                              <Image
                                src={msg.productCard.image || "/placeholder.svg"}
                                alt={msg.productCard.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-mono text-[#777777] uppercase block truncate font-medium">
                                {msg.productCard.brand}
                              </span>
                              <h4 className="font-sans text-xs font-semibold text-white truncate leading-snug">
                                {msg.productCard.name}
                              </h4>
                              <p className="font-mono text-xs font-bold text-[#D4FF00] mt-1">
                                {formatPrice(msg.productCard.price)}
                              </p>
                            </div>
                          </div>

                          {/* Inquiry text attached by buyer */}
                          {msg.text && (
                            <p className="text-xs sm:text-[13px] text-white leading-relaxed mb-2.5">
                              {msg.text}
                            </p>
                          )}

                          {/* Action Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#1c1c1c]">
                            <Link
                              href={`/product/${msg.productCard.id}`}
                              className="text-[10px] font-mono text-[#D4FF00] hover:underline uppercase tracking-wider font-bold"
                            >
                              Lihat Produk →
                            </Link>
                            <span className="text-[9px] font-mono text-[#666666]">
                              {msg.time} {isMe && "✓✓"}
                            </span>
                          </div>
                        </div>
                      ) : msg.orderCard ? (
                        /* ========================================================= */
                        /* UNIFIED ORDER MENTION BUBBLE */
                        /* ========================================================= */
                        <div className="max-w-[340px] sm:max-w-[380px] bg-[#121212] border border-[#2a2a2a] p-3 text-left">
                          <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-2.5 mb-2.5">
                            <div className="flex justify-between items-center pb-1 mb-1 border-b border-[#1c1c1c]">
                              <span className="text-[10px] font-mono text-[#D4FF00] font-bold">
                                PESANAN #{msg.orderCard.orderNumber}
                              </span>
                              <span className="text-[8px] font-mono uppercase text-white bg-[#1a1a1a] px-1 py-0.5">
                                {msg.orderCard.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <p className="text-xs text-white font-medium truncate">{msg.orderCard.productName}</p>
                            <div className="flex justify-between text-[11px] font-mono text-[#888888] mt-1">
                              <span>Total: <strong className="text-white">{formatPrice(msg.orderCard.price)}</strong></span>
                              {msg.orderCard.waybillNumber && (
                                <span>Resi: <strong className="text-[#D4FF00]">{msg.orderCard.waybillNumber}</strong></span>
                              )}
                            </div>
                          </div>

                          {msg.text && (
                            <p className="text-xs sm:text-[13px] text-white leading-relaxed mb-2.5">
                              {msg.text}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-[#1c1c1c]">
                            <Link
                              href="/orders"
                              className="text-[10px] font-mono text-[#D4FF00] hover:underline uppercase tracking-wider font-bold"
                            >
                              Detail Pesanan →
                            </Link>
                            <span className="text-[9px] font-mono text-[#666666]">
                              {msg.time} {isMe && "✓✓"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* ========================================================= */
                        /* STANDARD TEXT CHAT BUBBLE */
                        /* ========================================================= */
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed break-words border ${
                            isMe
                              ? "bg-[#181818] text-white border-[#2e2e2e]"
                              : "bg-[#101010] border-[#1a1a1a] text-[#E5E5EA]"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div className="text-right mt-1">
                            <span className="text-[9px] font-mono text-[#666666]">
                              {msg.time} {isMe && "✓✓"}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Seller Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-[#777777] font-mono pl-1"
                  >
                    <div className="flex gap-1 items-center bg-[#121212] border border-[#222222] px-2.5 py-1.5">
                      <span className="w-1.5 h-1.5 bg-[#888888] animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-[#888888] animate-pulse [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#888888] animate-pulse [animation-delay:0.4s]"></span>
                    </div>
                    <span className="text-[10px] text-[#666666] uppercase tracking-wider">
                      {activeContact.name} sedang mengetik...
                    </span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ========================================================= */}
              {/* SHOPEE-STYLE FLOATING PRODUCT INQUIRY DOCK */}
              {/* ========================================================= */}
              {attachedProduct && (
                <div className="p-3 bg-[#111111] border-t border-[#1c1c1c] shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-[#080808] border border-[#222222] shrink-0 relative overflow-hidden">
                        <Image
                          src={attachedProduct.image || "/placeholder.svg"}
                          alt={attachedProduct.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-[#D4FF00] uppercase font-bold tracking-wider block">
                          PRODUK YANG INGIN DITANYAKAN
                        </span>
                        <h5 className="text-xs font-semibold text-white truncate max-w-md">
                          {attachedProduct.name}
                        </h5>
                        <span className="text-xs font-mono font-bold text-white">
                          {formatPrice(attachedProduct.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Shopee-style "Kirim Produk" Button */}
                      <button
                        type="button"
                        onClick={() =>
                          sendMessage("Halo kak, saya tertarik dengan produk ini.", {
                            withProductCard: true,
                          })
                        }
                        className="px-3.5 py-2 bg-[#D4FF00] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Kirim Produk
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachedProduct(null)}
                        className="p-2 text-[#777777] hover:text-white border border-[#222222] hover:border-[#444444] transition-colors cursor-pointer"
                        title="Tutup lampiran"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Quick Chips (Shopee Style) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        sendMessage("Halo kak, apakah produk ini ready stock?", {
                          withProductCard: true,
                        })
                      }
                      className="px-2.5 py-1 bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[11px] font-sans text-[#CCCCCC] hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                    >
                      Apakah ready stock?
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        sendMessage("Apakah unit ini bergaransi resmi distributor?", {
                          withProductCard: true,
                        })
                      }
                      className="px-2.5 py-1 bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[11px] font-sans text-[#CCCCCC] hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                    >
                      Garansi resmi?
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        sendMessage("Bisa kirim hari ini pakai Instant / Express?", {
                          withProductCard: true,
                        })
                      }
                      className="px-2.5 py-1 bg-[#181818] hover:bg-[#222222] border border-[#262626] text-[11px] font-sans text-[#CCCCCC] hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                    >
                      Bisa kirim hari ini?
                    </button>
                  </div>
                </div>
              )}

              {/* FLOATING ORDER DOCK */}
              {attachedOrder && (
                <div className="p-3 bg-[#111111] border-t border-[#1c1c1c] shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-[#D4FF00] uppercase font-bold tracking-wider block">
                        LAMPIRAN PESANAN
                      </span>
                      <h5 className="text-xs font-semibold text-white truncate">
                        Pesanan #{attachedOrder.orderNumber} • {attachedOrder.productName}
                      </h5>
                      <span className="text-[10px] font-mono text-[#8E8E93]">
                        Resi: {attachedOrder.waybillNumber || "-"} ({attachedOrder.courierCode || "JNE"})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          sendMessage(
                            `Halo kak, mau konfirmasi pengiriman pesanan #${attachedOrder.orderNumber}.`,
                            { withOrderCard: true }
                          )
                        }
                        className="px-3.5 py-2 bg-[#D4FF00] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Kirim Info Pesanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachedOrder(null)}
                        className="p-2 text-[#777777] hover:text-white border border-[#222222] hover:border-[#444444] transition-colors cursor-pointer"
                        title="Tutup lampiran"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SHOPEE-STYLE INPUT AREA WITH + PRODUK BUTTON */}
              {/* ========================================================= */}
              <div className="p-3 bg-[#0c0c0c] border-t border-[#1c1c1c] shrink-0">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                  {/* + Produk Button (Allows mentioning any product from catalog) */}
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(true)}
                    className="px-3 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] text-[#CCCCCC] hover:text-white border border-[#262626] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                    title="Pilih dan mention produk dari katalog"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>Produk</span>
                  </button>

                  <div className="flex-1 bg-[#141414] border border-[#262626] focus-within:border-white flex items-center px-3 py-2 transition-colors">
                    <input
                      ref={textareaRef as any}
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Tulis pesan ke penjual..."
                      className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-[#555555] font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!messageInput.trim() && !attachedProduct && !attachedOrder}
                    className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                      messageInput.trim() || attachedProduct || attachedOrder
                        ? "bg-[#D4FF00] hover:bg-white text-black border-[#D4FF00]"
                        : "bg-[#141414] text-[#555555] border-[#222222] cursor-not-allowed"
                    }`}
                  >
                    <span>Kirim</span>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#080808]">
              <div className="w-16 h-16 bg-[#141414] border border-[#222222] flex items-center justify-center text-[#555555] mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white mb-1 uppercase tracking-wider font-heading">
                PILIH PERCAKAPAN
              </h2>
              <p className="text-xs text-[#777777] max-w-xs font-mono">
                Pilih salah satu toko di panel sebelah kiri untuk mulai berkirim pesan.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* PRODUCT PICKER MODAL (ATTACH ANY IEM TO CHAT) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isProductPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-lg bg-[#111111] border border-[#262626] p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <div>
                  <span className="text-[10px] font-mono text-[#D4FF00] uppercase font-bold tracking-wider block">
                    KATALOG TONAL ZONE
                  </span>
                  <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">
                    Pilih Produk untuk Ditanyakan
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(false)}
                  className="p-1.5 text-[#777777] hover:text-white border border-[#222222] hover:border-[#444444]"
                >
                  ✕
                </button>
              </div>

              {/* Search in Modal */}
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Ketik nama IEM / DAC (misal: Blessing 3, IE 900)..."
                className="w-full bg-[#161616] border border-[#2a2a2a] px-3 py-2 text-xs font-mono text-white placeholder:text-[#555555] outline-none"
              />

              {/* Product Grid */}
              <div className="max-h-[340px] overflow-y-auto no-scrollbar space-y-2 divide-y divide-[#181818]">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="pt-2 flex items-center justify-between gap-3 hover:bg-[#161616] p-2 transition-colors cursor-pointer"
                    onClick={() => {
                      setAttachedProduct({
                        id: item.id,
                        name: item.name,
                        brand: item.brand,
                        price: item.price,
                        image: item.image,
                        soundSignature: item.soundSignature,
                        category: item.category,
                      });
                      setIsProductPickerOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-[#0a0a0a] border border-[#222222] shrink-0 relative overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-[#777777] uppercase block">{item.brand}</span>
                        <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                        <span className="text-xs font-mono text-[#D4FF00] font-bold">{formatPrice(item.price)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#D4FF00] text-[#CCCCCC] hover:text-black border border-[#2a2a2a] text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 transition-colors"
                    >
                      Pilih
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white font-mono text-xs">
          MEMUAT PERCAKAPAN...
        </div>
      }
    >
      <MessagesContent />
    </React.Suspense>
  );
}
