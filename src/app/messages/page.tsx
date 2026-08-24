"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@/context/LocationContext";

export interface MessageItem {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  productCard?: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
  };
  attachment?: string;
}

export interface ContactItem {
  id: string;
  name: string;
  type: "Official" | "Authorized" | "Individual";
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const DEFAULT_PRODUCTS: Record<string, { id: string; name: string; brand: string; price: number; image: string }> = {
  "prod-1": {
    id: "prod-1",
    name: "SENNHEISER IE 900",
    brand: "SENNHEISER",
    price: 1299,
    image: "/placeholder.svg",
  },
  "prod-2": {
    id: "prod-2",
    name: "MOONDROP BLESSING 3",
    brand: "MOONDROP",
    price: 319,
    image: "/model-iem-untuk-hero.webp",
  },
  "prod-3": {
    id: "prod-3",
    name: "CHORD MOJO 2 DAC",
    brand: "CHORD AUDIO",
    price: 899,
    image: "/placeholder.svg",
  },
  "prod-4": {
    id: "prod-4",
    name: "EFFECT AUDIO ARES S",
    brand: "EFFECT AUDIO",
    price: 249,
    image: "/placeholder.svg",
  },
  "prod-5": {
    id: "prod-5",
    name: "64 AUDIO U12T REFERENCE",
    brand: "64 AUDIO",
    price: 2499,
    image: "/model-iem-untuk-hero.webp",
  },
  "prod-6": {
    id: "prod-6",
    name: "SONY IER-Z1R SIGNATURE",
    brand: "SONY",
    price: 1599,
    image: "/placeholder.svg",
  },
  "prod-7": {
    id: "prod-7",
    name: "FATFREQ MAESTRO MINI",
    brand: "FATFREQ",
    price: 450,
    image: "/placeholder.svg",
  },
};

const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: "seller-1",
    name: "CSI-ZONE Official Store",
    type: "Official",
    avatar: "CZ",
    lastMessage: "Halo kak! Ready dong, stock aman dan siap kirim.",
    time: "10:23 AM",
    unread: 1,
    online: true,
  },
  {
    id: "seller-2",
    name: "Bass Audio Official",
    type: "Authorized",
    avatar: "BA",
    lastMessage: "Bisa kirim pakai Instant Courier hari ini kak.",
    time: "Yesterday",
    unread: 0,
    online: true,
  },
  {
    id: "seller-3",
    name: "Audiophile_JKT Garage",
    type: "Individual",
    avatar: "AJ",
    lastMessage: "Unit mulus 99% like new, box dan kabel lengkap.",
    time: "Monday",
    unread: 0,
    online: false,
  },
];

const INITIAL_CHAT_DATA: Record<string, MessageItem[]> = {
  "seller-1": [
    { id: "m1", sender: "me", text: "Halo min, untuk produk ini apakah ready stock?", time: "10:20 AM" },
    { id: "m2", sender: "them", text: "Halo kak! Ready dong, stock aman dan bergaransi resmi 1 tahun.", time: "10:21 AM" },
    { id: "m3", sender: "me", text: "Bisa kirim pakai kurir Express / Instant hari ini?", time: "10:22 AM" },
    { id: "m4", sender: "them", text: "Bisa banget kak! Maksimal checkout jam 4 sore ya agar langsung dipickup hari ini.", time: "10:23 AM" },
  ],
  "seller-2": [
    { id: "m201", sender: "me", text: "Siang kak, garansi Bass Audio berapa lama ya?", time: "Yesterday" },
    { id: "m202", sender: "them", text: "Siang kak! Garansi distributor resmi 12 bulan ya.", time: "Yesterday" },
  ],
  "seller-3": [
    { id: "m301", sender: "me", text: "Kondisi kelengkapan gimana kak?", time: "Monday" },
    { id: "m302", sender: "them", text: "Unit mulus 99% like new, box dan kabel lengkap.", time: "Monday" },
  ],
};

const QUICK_REPLIES = [
  "Apakah barang ini ready stock?",
  "Bisa kirim hari ini pakai Instant / Express?",
  "Apakah ada garansi resmi?",
  "Bisa minta foto asli unit fisiknya?",
];

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerQuery = searchParams?.get("seller");
  const productQuery = searchParams?.get("product");
  const { formatPrice } = useLocation();

  const deduplicateContacts = (list: ContactItem[]) => {
    const seen = new Set<string>();
    return list.filter((item) => {
      const idStr = String(item.id);
      if (seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
  };

  const [contacts, setContacts] = useState<ContactItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tonalzone_chat_contacts");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const seen = new Set<string>();
            return parsed.filter((item: ContactItem) => {
              const idStr = String(item.id);
              if (seen.has(idStr)) return false;
              seen.add(idStr);
              return true;
            });
          }
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

  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || "seller-1");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedProduct, setAttachedProduct] = useState<{ id: string; name: string; brand: string; price: number; image: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Handle Query Parameters (coming from ?seller=...&product=...)
  useEffect(() => {
    if (productQuery) {
      const prod = DEFAULT_PRODUCTS[productQuery] || {
        id: productQuery,
        name: `Audio Gear #${productQuery.toUpperCase()}`,
        brand: "AUDIOPHILE GEAR",
        price: 899,
        image: "/placeholder.svg",
      };
      setAttachedProduct(prod);
    }

    if (sellerQuery) {
      const sellerIdStr = String(sellerQuery);
      setContacts((prev) => {
        const existing = prev.find((c) => String(c.id) === sellerIdStr);
        if (existing) {
          setSelectedContactId(existing.id);
          return prev;
        }
        const newContact: ContactItem = {
          id: sellerIdStr,
          name: sellerIdStr.startsWith("off-") ? "Official Store Distributor" : sellerIdStr.replace(/-/g, " ").toUpperCase(),
          type: "Official",
          avatar: "TZ",
          lastMessage: "Start a conversation...",
          time: "Just now",
          unread: 0,
          online: true,
        };
        setSelectedContactId(newContact.id);
        const seen = new Set<string>();
        return [newContact, ...prev].filter((item) => {
          const id = String(item.id);
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      });
      setIsMobileListVisible(false);
    }
  }, [sellerQuery, productQuery]);

  // Auto scroll to bottom
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
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  // Mark unread as 0 when selecting contact
  const handleSelectContact = (contact: ContactItem) => {
    setSelectedContactId(contact.id);
    setIsMobileListVisible(false);
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c))
    );
  };

  // Helper to format current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Send message function
  const sendMessage = (text: string, withProductCard = false) => {
    if (!text.trim() && !withProductCard) return;

    const time = getCurrentTime();
    const newMsg: MessageItem = {
      id: `m-${Date.now()}`,
      sender: "me",
      text: text.trim(),
      time,
      productCard: withProductCard && attachedProduct ? attachedProduct : undefined,
    };

    // Update conversation
    setChatMessages((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMsg],
    }));

    // Update last message in contact list
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, lastMessage: text.trim() || (withProductCard ? `[Produk: ${attachedProduct?.name}]` : ""), time }
          : c
      )
    );

    setMessageInput("");
    if (withProductCard) {
      setAttachedProduct(null);
    }

    // Trigger Smart Seller Auto-Reply Simulation after 1.5s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyTime = getCurrentTime();
      let replyText = "Halo kak! Terima kasih sudah menghubungi kami. Barang ini ready stock 100% original bergaransi resmi, siap langsung dikirim ya kak!";

      if (text.toLowerCase().includes("ready") || text.toLowerCase().includes("stok")) {
        replyText = "Halo kak! Barang ready stock ya, unit siap di-packing dan dikirim hari ini!";
      } else if (text.toLowerCase().includes("kirim") || text.toLowerCase().includes("instant") || text.toLowerCase().includes("gosend") || text.toLowerCase().includes("express")) {
        replyText = "Bisa kak! Pesanan sebelum jam 16:00 WIB akan langsung kami proses dan serahkan ke kurir di hari yang sama.";
      } else if (text.toLowerCase().includes("garansi")) {
        replyText = "Tentu kak, semua unit di toko kami bergaransi resmi 1 tahun dari distributor utama Tonal Zone.";
      } else if (text.toLowerCase().includes("nego") || text.toLowerCase().includes("harga") || text.toLowerCase().includes("diskon")) {
        replyText = "Harga di etalase sudah harga net terbaik kak, tapi kakak bisa gunakan kode promo 'TONAL10' saat checkout untuk diskon ekstra 10% ya!";
      } else if (text.toLowerCase().includes("foto") || text.toLowerCase().includes("fisik")) {
        replyText = "Unit masih segel utuh BNIB (Brand New In Box) kak, foto etalase 100% sesuai dengan fisik aslinya.";
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
    }, 1400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(messageInput, !!attachedProduct);
  };

  return (
    <div className="flex flex-col h-[100svh] bg-[#080808] text-[#FAF9F6] font-sans overflow-hidden selection:bg-white selection:text-black">
      <main className="flex-1 flex overflow-hidden">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Contacts List */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-[320px] lg:w-[380px] border-r border-[#1a1a1a] flex flex-col bg-[#0b0b0b] shrink-0 transition-transform duration-300 ${
            !isMobileListVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between shrink-0 bg-[#080808]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="text-[#888] hover:text-[#FAF9F6] transition-colors p-1.5 -ml-1 rounded-lg hover:bg-[#141414] cursor-pointer"
                title="Kembali ke Beranda"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="font-heading font-bold text-base tracking-wider uppercase text-[#FAF9F6] flex items-center gap-2">
                  Chat Penjual
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                </h1>
                <p className="text-[10px] font-mono text-[#666]">Direct Messenger</p>
              </div>
            </div>

            <Link
              href="/collection"
              className="p-2 text-[#777] hover:text-white hover:bg-[#161616] rounded-lg transition-colors"
              title="Cari Toko Baru"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>

          {/* Search Contacts */}
          <div className="p-3 border-b border-[#181818] bg-[#0b0b0b]">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari toko atau percakapan..."
                className="w-full bg-[#141414] border border-[#222] focus:border-[#444] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#FAF9F6] focus:outline-none transition-colors placeholder:text-[#555]"
              />
              <svg
                className="absolute left-3 top-3 text-[#555] group-focus-within:text-[#888] w-3.5 h-3.5 transition-colors"
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
                  className="absolute right-3 top-2.5 text-xs text-[#666] hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-[#121212]">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, idx) => {
                const isSelected = selectedContactId === contact.id;
                return (
                  <button
                    key={`${contact.id}-${idx}`}
                    onClick={() => handleSelectContact(contact)}
                    className={`w-full text-left px-4 py-3.5 flex items-start gap-3.5 hover:bg-[#121212] transition-colors cursor-pointer relative ${
                      isSelected ? "bg-[#141414] border-l-2 border-l-white" : "border-l-2 border-l-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold tracking-wider border ${
                          isSelected
                            ? "bg-[#1c1c1c] border-white/40 text-white"
                            : "bg-[#161616] border-[#262626] text-[#FAF9F6]"
                        }`}
                      >
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080808]"></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="flex items-center gap-1.5 truncate pr-1">
                          <h3 className={`text-xs font-semibold truncate ${isSelected ? "text-[#FAF9F6]" : "text-[#ddd]"}`}>
                            {contact.name}
                          </h3>
                          {contact.type === "Official" && (
                            <span className="text-[8px] font-mono font-bold bg-[#FAF9F6] text-black px-1.5 py-0.2 rounded-sm shrink-0 uppercase">
                              Official
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#666] shrink-0">{contact.time}</span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <p className={`text-[11.5px] truncate leading-relaxed ${contact.unread > 0 ? "text-white font-medium" : "text-[#777]"}`}>
                          {contact.lastMessage}
                        </p>
                        {contact.unread > 0 && (
                          <span className="h-4 min-w-[16px] px-1 bg-white text-black text-[9px] font-bold font-mono rounded-full flex items-center justify-center shrink-0">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#666] font-mono">
                Tidak ada percakapan ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Active Chat Box */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex flex-col bg-[#0e0e0e] relative ${
            isMobileListVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-[#1a1a1a] bg-[#0c0c0c] flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3.5">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileListVisible(true)}
                    className="md:hidden text-[#888] hover:text-[#FAF9F6] p-1.5 -ml-1.5 rounded-lg hover:bg-[#161616] transition-colors"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#282828] flex items-center justify-center text-[#D4FF00] text-xs font-mono font-bold">
                      {activeContact.avatar}
                    </div>
                    {activeContact.online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#D4FF00] rounded-full border-2 border-[#0c0c0c]"></div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-sm text-[#FAF9F6] tracking-wide">{activeContact.name}</h2>
                      {activeContact.type === "Official" && (
                        <span className="text-[8px] font-mono font-bold bg-[#FAF9F6] text-black px-1.5 py-0.2 rounded-sm uppercase">
                          Official Store
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-[#777] mt-0.5">
                      {activeContact.online ? (
                        <span className="text-emerald-400 font-medium">● Online sekarang</span>
                      ) : (
                        "○ Offline (Aktif 2 jam lalu)"
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick Store Link */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/collection"
                    className="px-3 py-1.5 bg-[#161616] hover:bg-[#202020] border border-[#2a2a2a] text-xs font-mono text-[#ccc] hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Kunjungi Toko</span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
                <div className="text-center my-3">
                  <span className="text-[10px] font-mono text-[#555] tracking-widest uppercase bg-[#141414] px-3 py-1 rounded-full border border-[#222]">
                    Percakapan Diamankan dengan Enkripsi Tonal Zone
                  </span>
                </div>

                {currentMessages.map((msg) => {
                  const isMe = msg.sender === "me";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      {/* Product Card Attachment in Chat Bubble */}
                      {msg.productCard && (
                        <div className="mb-2 max-w-[290px] sm:max-w-xs bg-[#161616] border border-[#2a2a2a] rounded-2xl p-3.5 shadow-xl text-left">
                          <span className="text-[9px] font-mono text-[#D4FF00] uppercase tracking-wider block mb-1.5 font-bold">
                            Menanyakan Produk
                          </span>
                          <div className="flex gap-3 items-center">
                            <div className="w-14 h-14 bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden shrink-0 relative">
                              <Image
                                src={msg.productCard.image || "/placeholder.svg"}
                                alt={msg.productCard.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-mono text-[#777] uppercase block truncate">{msg.productCard.brand}</span>
                              <h4 className="font-sans text-xs font-semibold text-white truncate">{msg.productCard.name}</h4>
                              <p className="font-mono text-xs font-bold text-[#D4FF00] mt-0.5">{formatPrice(msg.productCard.price)}</p>
                            </div>
                          </div>
                          <Link
                            href={`/product/${msg.productCard.id}`}
                            className="mt-2.5 block w-full text-center py-1.5 bg-[#222] hover:bg-[#333] text-[10px] font-mono font-bold text-white rounded-lg transition-colors uppercase tracking-wider"
                          >
                            Lihat Detail Produk
                          </Link>
                        </div>
                      )}

                      {/* Text Bubble */}
                      {msg.text && (
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm break-words ${
                            isMe
                              ? "bg-white text-black rounded-br-none font-medium"
                              : "bg-[#161616] border border-[#262626] text-[#FAF9F6] rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}

                      <span className="text-[9px] font-mono text-[#555] px-1 mt-1">
                        {msg.time} {isMe && "✓✓"}
                      </span>
                    </motion.div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-[#777] font-mono pl-1"
                  >
                    <div className="flex gap-1 items-center bg-[#161616] border border-[#262626] px-3 py-2 rounded-2xl rounded-bl-none">
                      <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#888] rounded-full animate-bounce"></span>
                    </div>
                    <span className="text-[10px] text-[#666]">{activeContact.name} sedang mengetik...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Pills */}
              <div className="px-4 py-2 bg-[#0c0c0c] border-t border-[#181818] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-mono text-[#666] uppercase shrink-0">Pintasan:</span>
                {QUICK_REPLIES.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(pill, !!attachedProduct)}
                    className="px-3 py-1.5 bg-[#141414] hover:bg-[#202020] border border-[#262626] hover:border-white/40 text-[11px] font-sans text-[#aaa] hover:text-white rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Message Input & Attachment Preview Area */}
              <div className="p-4 bg-[#0c0c0c] border-t border-[#1a1a1a] flex flex-col gap-2 shrink-0">
                
                {/* Active Attached Product Bar (Shopee Style) */}
                {attachedProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-[#141414] border border-[#282828] rounded-xl p-2.5 px-3 mb-1"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#080808] border border-[#222] rounded-lg overflow-hidden shrink-0 relative">
                        <Image src={attachedProduct.image || "/placeholder.svg"} alt={attachedProduct.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-white/80 uppercase block">Produk Terkait</span>
                        <h5 className="text-xs font-semibold text-white truncate">{attachedProduct.name}</h5>
                        <p className="text-[11px] font-mono text-[#aaa]">{formatPrice(attachedProduct.price)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachedProduct(null)}
                      className="p-1 text-[#666] hover:text-red-400 transition-colors ml-2"
                      title="Batal Lampirkan Produk"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                )}

                <form onSubmit={handleFormSubmit} className="flex items-end gap-2.5">
                  <div className="flex-1 bg-[#141414] border border-[#282828] focus-within:border-[#444] rounded-2xl flex items-end px-3.5 py-2 transition-colors">
                    <textarea
                      ref={textareaRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Tulis pesan ke penjual..."
                      rows={1}
                      className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#FAF9F6] resize-none max-h-24 custom-scrollbar py-1 placeholder:text-[#555]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleFormSubmit(e);
                        }
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!messageInput.trim() && !attachedProduct}
                    className={`p-3 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                      messageInput.trim() || attachedProduct
                        ? "bg-white hover:bg-[#e0e0e0] text-black shadow-md"
                        : "bg-[#181818] text-[#444] cursor-not-allowed"
                    }`}
                    title="Kirim Pesan"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#222] flex items-center justify-center text-[#555] mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white mb-1">Pilih Percakapan</h2>
              <p className="text-xs text-[#666] max-w-xs">Pilih salah satu toko di panel sebelah kiri untuk mulai berkirim pesan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center text-white font-mono text-xs">Loading Messages...</div>}>
      <MessagesContent />
    </React.Suspense>
  );
}
