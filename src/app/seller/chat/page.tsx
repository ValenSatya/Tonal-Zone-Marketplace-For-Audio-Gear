"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Clock,
  Settings,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  X,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  Copy,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { triggerAppNotification } from "@/context/NotificationContext";

interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: "buyer" | "seller";
  senderName: string;
  senderEmail?: string;
  text: string;
  createdAt: string;
  productCard?: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    soundSignature?: string;
    category?: string;
  };
  orderCard?: {
    orderNumber: string;
    productName: string;
    brand?: string;
    price: number;
    status: string;
    waybillNumber?: string;
    courierCode?: string;
    image?: string;
  };
}

interface Conversation {
  id: string;
  buyerEmail: string;
  buyerName: string;
  storeId: string;
  storeName: string;
  storeType: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadBuyer: number;
  unreadSeller: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatTemplate {
  id: string;
  title: string;
  content: string;
  shortcut?: string;
  category?: string;
}

interface OperatingSchedule {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface StoreChatSettings {
  storeId: string;
  templates: ChatTemplate[];
  operatingHours: {
    enabled: boolean;
    timezone: string;
    schedule: OperatingSchedule[];
  };
  autoReplyOutOfHours: boolean;
  outOfHoursMessage: string;
  welcomeMessageEnabled: boolean;
  welcomeMessage: string;
}

function getBuyerInitials(name: string): string {
  if (!name) return "CS";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function SellerChatContent() {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("id") || "";
  const { formatPrice } = useLocation();

  const [storeId, setStoreId] = useState("store-official");
  const [storeName, setStoreName] = useState("MOONDROP Official Flagship Store");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(initialConvId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Settings & Templates
  const [chatSettings, setChatSettings] = useState<StoreChatSettings | null>(null);
  const [liveStatus, setLiveStatus] = useState<{ isOpen: boolean; scheduleText: string; reason?: string }>({
    isOpen: true,
    scheduleText: "09:00 - 18:00 WIB",
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"templates" | "hours">("templates");

  // New Template form state
  const [newTplTitle, setNewTplTitle] = useState("");
  const [newTplContent, setNewTplContent] = useState("");
  const [newTplShortcut, setNewTplShortcut] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState("");

  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [hasNewUnseen, setHasNewUnseen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Identify Store Data from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.storeId) setStoreId(u.storeId);
        if (u.storeName) setStoreName(u.storeName);
      }
    } catch (e) {}
  }, []);

  // 2. Fetch Store Chat Settings & Operating Hours
  const loadChatSettings = async () => {
    try {
      const res = await fetch(`/api/seller/chat-settings?storeId=${encodeURIComponent(storeId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatSettings(data.settings);
          if (data.liveStatus) setLiveStatus(data.liveStatus);
        }
      }
    } catch (e) {
      console.error("Failed to load chat settings:", e);
    }
  };

  useEffect(() => {
    loadChatSettings();
  }, [storeId]);

  // 3. Fetch Conversations for this Store
  const loadConversations = async (silent = false) => {
    if (!silent) setIsLoadingConversations(true);
    try {
      const res = await fetch(
        `/api/messages?storeId=${encodeURIComponent(storeId)}&storeName=${encodeURIComponent(storeName)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);

          // If no active conversation selected yet, pick first
          if (!activeConvId && data.conversations.length > 0) {
            setActiveConvId(data.conversations[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      if (!silent) setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => loadConversations(true), 4000);
    return () => clearInterval(interval);
  }, [storeId, storeName]);

  // 4. Fetch Messages for Active Conversation
  const loadActiveMessages = async (silent = false) => {
    if (!activeConvId) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${activeConvId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (
              prev.length === data.messages.length &&
              prev.length > 0 &&
              prev[prev.length - 1]?.id === data.messages[data.messages.length - 1]?.id &&
              prev[prev.length - 1]?.text === data.messages[data.messages.length - 1]?.text
            ) {
              return prev;
            }

            if (data.messages.length > prev.length) {
              if (isUserScrolledUp) {
                setHasNewUnseen(true);
              } else {
                setTimeout(() => scrollToBottom("smooth"), 50);
              }
            }
            return data.messages;
          });

          // Mark as read by seller in background
          fetch(`/api/messages/${activeConvId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "seller" }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadActiveMessages();
    const interval = setInterval(() => loadActiveMessages(true), 1500);
    return () => clearInterval(interval);
  }, [activeConvId, isUserScrolledUp]);

  // Real-time Instant Cross-Tab Sync via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("tonalzone_chat_realtime");

    const onChannelMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "NEW_MESSAGE" && data.message) {
        if (data.conversationId === activeConvId) {
          setMessages((prev) => {
            if (prev.some((x) => x.id === data.message.id || (x.text === data.message.text && x.senderRole === data.message.senderRole))) {
              return prev;
            }
            if (isUserScrolledUp) {
              setHasNewUnseen(true);
            } else {
              setTimeout(() => scrollToBottom("smooth"), 50);
            }
            return [...prev, data.message];
          });
        }

        // Always update sidebar preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === data.conversationId
              ? {
                  ...c,
                  lastMessage: data.message.text || "Lampiran",
                  lastMessageAt: data.message.createdAt || new Date().toISOString(),
                  unreadSeller: c.id === activeConvId ? 0 : c.unreadSeller + 1,
                }
              : c
          )
        );
      }
    };

    channel.addEventListener("message", onChannelMessage);
    return () => {
      channel.removeEventListener("message", onChannelMessage);
      channel.close();
    };
  }, [activeConvId, isUserScrolledUp]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setIsUserScrolledUp(false);
    setHasNewUnseen(false);
  };

  const handleChatScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isUp = distanceToBottom > 120;
    setIsUserScrolledUp(isUp);
    if (!isUp) {
      setHasNewUnseen(false);
    }
  };

  // Scroll to bottom when selecting a different conversation
  useEffect(() => {
    if (activeConvId) {
      setTimeout(() => scrollToBottom("auto"), 50);
    }
  }, [activeConvId]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId);
  }, [conversations, activeConvId]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.buyerName.toLowerCase().includes(q) ||
        c.buyerEmail.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Handle Send Message as Seller
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : messageInput).trim();
    if (!text || !activeConvId || !activeConversation) return;

    setIsSending(true);
    const tempId = `msg-temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      conversationId: activeConvId,
      senderRole: "seller",
      senderName: storeName,
      text,
      createdAt: new Date().toISOString(),
    };

    // Optimistic append
    setMessages((prev) => [...prev, tempMsg]);
    setMessageInput("");
    setTimeout(() => scrollToBottom("smooth"), 30);

    // Broadcast immediately across tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("tonalzone_chat_realtime");
        bc.postMessage({
          type: "NEW_MESSAGE",
          conversationId: activeConvId,
          message: tempMsg,
        });
        bc.close();
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          buyerEmail: activeConversation.buyerEmail,
          storeId,
          storeName,
          text,
          senderRole: "seller",
          senderName: storeName,
          autoReply: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.message : m))
          );
          // Update conversation last message in list
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvId
                ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
                : c
            )
          );

          try {
            if (typeof window !== "undefined" && "BroadcastChannel" in window) {
              const bc = new BroadcastChannel("tonalzone_chat_realtime");
              bc.postMessage({
                type: "NEW_MESSAGE",
                conversationId: activeConvId,
                message: data.message,
              });
              bc.close();
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error("Failed to send seller reply:", e);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  // Click Quick Reply Template
  const handleApplyTemplate = (tpl: ChatTemplate) => {
    setMessageInput(tpl.content);
    textareaRef.current?.focus();
  };

  // Add New Template
  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle.trim() || !newTplContent.trim() || !chatSettings) return;

    setIsSavingSettings(true);
    const newTpl: ChatTemplate = {
      id: `tpl-${Date.now()}`,
      title: newTplTitle.trim(),
      content: newTplContent.trim(),
      shortcut: newTplShortcut.trim() ? newTplShortcut.trim() : undefined,
    };

    const updatedTemplates = [...chatSettings.templates, newTpl];

    try {
      const res = await fetch("/api/seller/chat-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          templates: updatedTemplates,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatSettings(data.settings);
          setNewTplTitle("");
          setNewTplContent("");
          setNewTplShortcut("");
          setSettingsSuccessMessage("Template pesan cepat berhasil ditambahkan!");
          setTimeout(() => setSettingsSuccessMessage(""), 3000);
        }
      }
    } catch (err) {
      console.error("Error adding template:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (tplId: string) => {
    if (!chatSettings) return;
    setIsSavingSettings(true);
    const updated = chatSettings.templates.filter((t) => t.id !== tplId);

    try {
      const res = await fetch("/api/seller/chat-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          templates: updated,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatSettings(data.settings);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Save Operating Hours Settings
  const handleSaveOperatingHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatSettings) return;
    setIsSavingSettings(true);

    try {
      const res = await fetch("/api/seller/chat-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          operatingHours: chatSettings.operatingHours,
          autoReplyOutOfHours: chatSettings.autoReplyOutOfHours,
          outOfHoursMessage: chatSettings.outOfHoursMessage,
          welcomeMessageEnabled: chatSettings.welcomeMessageEnabled,
          welcomeMessage: chatSettings.welcomeMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatSettings(data.settings);
          if (data.liveStatus) setLiveStatus(data.liveStatus);
          setSettingsSuccessMessage("Pengaturan jam operasional & balasan otomatis tersimpan!");
          setTimeout(() => setSettingsSuccessMessage(""), 3000);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2e2e2e] text-white text-[11px] font-bold uppercase tracking-wider">
              Seller Chat Portal
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium ${
                liveStatus.isOpen
                  ? "bg-[#112416] text-[#4ADE80]"
                  : "bg-[#271414] text-[#F87171]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  liveStatus.isOpen ? "bg-[#4ADE80]" : "bg-[#F87171]"
                }`}
              />
              {liveStatus.isOpen ? "Toko Sedang Buka" : "Di Luar Jam Kerja"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">
            Pesan & Chat Pembeli
          </h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Komunikasi langsung dengan calon pembeli dan pelanggan toko {storeName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            target="_blank"
            className="px-4 py-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-all flex items-center gap-2"
          >
            <span>Buka Tampilan Pembeli</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#BFDD25] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan Chat</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane Chat Container */}
      <div className="rounded-2xl bg-[#0E0E0E] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[680px]">
        {/* Left Pane: Conversation List */}
        <div className="md:col-span-4 lg:col-span-4 border-r border-[#181818] flex flex-col bg-[#0A0A0A]">
          {/* Search Bar */}
          <div className="p-4 border-b border-[#181818]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pembeli atau pesan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25]"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#141414]">
            {isLoadingConversations && conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#71717A]">
                Memuat percakapan...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#3F3F46] mx-auto" />
                <p className="text-xs text-[#71717A]">Belum ada pesan dari pembeli.</p>
                <p className="text-[11px] text-[#52525B]">
                  Pesan yang dikirim pembeli dari halaman toko atau produk akan otomatis masuk ke sini.
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConvId;
                const hasUnread = c.unreadSeller > 0;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#161616]"
                        : "hover:bg-[#121212]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#242424] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 relative">
                      {getBuyerInitials(c.buyerName)}
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#ef4444] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-sm">
                          {c.unreadSeller}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {c.buyerName}
                        </span>
                        <span className="text-[10px] font-mono text-[#71717A] shrink-0">
                          {c.lastMessageAt
                            ? new Date(c.lastMessageAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>

                      <p
                        className={`text-xs truncate ${
                          hasUnread ? "text-white font-medium" : "text-[#8E8E93]"
                        }`}
                      >
                        {c.lastMessage || "Mulai obrolan baru"}
                      </p>

                      <span className="text-[10px] font-mono text-[#52525B] block truncate mt-0.5">
                        {c.buyerEmail}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col bg-[#0E0E0E]">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 sm:p-5 border-b border-[#181818] flex items-center justify-between gap-4 bg-[#101010]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#242424] text-white font-mono font-bold text-xs flex items-center justify-center">
                    {getBuyerInitials(activeConversation.buyerName)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {activeConversation.buyerName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-[#71717A]">
                        {activeConversation.buyerEmail}
                      </span>
                      <span className="text-[#3F3F46]">•</span>
                      <span className="text-[10px] font-mono text-[#BFDD25]">
                        Pelanggan Terverifikasi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating hours quick notice */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] text-[11px] font-mono text-[#A1A1AA]">
                  <Clock className="w-3.5 h-3.5 text-[#BFDD25]" />
                  <span>{liveStatus.scheduleText}</span>
                </div>
              </div>

              {/* Chat Messages Scroll Container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleChatScroll}
                className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[440px] max-h-[540px] relative"
              >
                {isLoadingMessages && messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#71717A]">
                    Memuat riwayat chat...
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderRole === "seller";

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[10px] font-mono text-[#71717A]">
                            {isMe ? storeName : m.senderName || "Pembeli"}
                          </span>
                          <span className="text-[10px] font-mono text-[#52525B]">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`max-w-md sm:max-w-lg p-3.5 sm:p-4 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-[#1E2718] text-[#E4F5D8] rounded-tr-none"
                              : "bg-[#181818] text-[#E4E4E7] rounded-tl-none"
                          }`}
                        >
                          {/* Attached Product Card */}
                          {m.productCard && (
                            <div className="mb-3 p-3 rounded-xl bg-black/40 flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/60 shrink-0">
                                <Image
                                  src={m.productCard.image || "/model-iem-untuk-hero.webp"}
                                  alt={m.productCard.name}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-mono uppercase text-[#BFDD25] block truncate">
                                  Menanyakan Produk
                                </span>
                                <h5 className="text-xs font-semibold text-white truncate">
                                  {m.productCard.name}
                                </h5>
                                <span className="text-xs font-mono font-bold text-white block mt-0.5">
                                  {formatPrice(m.productCard.price)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Attached Order Card */}
                          {m.orderCard && (
                            <div className="mb-3 p-3 rounded-xl bg-black/40 space-y-1">
                              <div className="flex items-center gap-1.5 text-[#38BDF8] text-[10px] font-mono uppercase">
                                <Package className="w-3.5 h-3.5" />
                                <span>Terkait Pesanan #{m.orderCard.orderNumber}</span>
                              </div>
                              <h5 className="text-xs font-semibold text-white">
                                {m.orderCard.productName}
                              </h5>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
                                <span>Status: {m.orderCard.status}</span>
                                {m.orderCard.waybillNumber && (
                                  <span>• Resi: {m.orderCard.waybillNumber}</span>
                                )}
                              </div>
                            </div>
                          )}

                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                {/* Floating New Messages Alert when seller is scrolled up */}
                {hasNewUnseen && isUserScrolledUp && (
                  <div className="sticky bottom-3 flex justify-center z-20 pointer-events-none">
                    <button
                      type="button"
                      onClick={() => scrollToBottom("smooth")}
                      className="pointer-events-auto bg-[#181818] hover:bg-white text-zinc-300 hover:text-black border border-[#2e2e2e] hover:border-white text-[11px] font-mono px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer select-none"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span>Pesan baru di bawah</span>
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bilah Template Pesan Cepat (Quick Reply Bar) */}
              {chatSettings && chatSettings.templates.length > 0 && (
                <div className="px-4 py-2.5 bg-[#0A0A0A] border-t border-[#181818] flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#BFDD25]" />
                    <span>Pesan Cepat:</span>
                  </span>

                  {chatSettings.templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-medium text-[#D4D4D8] hover:text-white transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer border border-[#222222]"
                      title={tpl.content}
                    >
                      <span>{tpl.title}</span>
                      {tpl.shortcut && (
                        <span className="text-[10px] font-mono text-[#71717A]">
                          {tpl.shortcut}
                        </span>
                      )}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSettingsTab("templates");
                      setIsSettingsModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-[11px] font-mono text-[#BFDD25] transition-colors shrink-0 cursor-pointer"
                  >
                    + Kelola
                  </button>
                </div>
              )}

              {/* Message Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-4 border-t border-[#181818] bg-[#101010]"
              >
                <div className="flex gap-3">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Ketik pesan balasan untuk ${activeConversation.buyerName}... (Tekan Enter untuk kirim)`}
                    className="flex-1 p-3 rounded-xl bg-[#181818] text-xs text-white placeholder:text-[#52525B] leading-relaxed outline-none border-0 focus:ring-1 focus:ring-[#BFDD25] resize-none"
                  />

                  <button
                    type="submit"
                    disabled={isSending || !messageInput.trim()}
                    className="px-6 rounded-xl bg-[#BFDD25] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-[#2E2E2E]" />
              <h4 className="text-base font-semibold text-white font-heading">
                Pilih Percakapan Pembeli
              </h4>
              <p className="text-xs text-[#71717A] max-w-sm">
                Pilih salah satu pembeli di kolom sebelah kiri untuk melihat pesan dan membalas pertanyaan mereka secara langsung.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: PENGATURAN TEMPLATE CHAT & JAM OPERASIONAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#181818]">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2e2e2e] text-white text-[11px] font-bold uppercase tracking-wider mb-1">
                  Pengaturan Chat Toko
                </span>
                <h3 className="text-lg font-bold text-white font-heading">
                  Template Pesan & Jam Operasional
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#242424] text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {settingsSuccessMessage && (
              <div className="p-3 rounded-xl bg-[#112416] text-[#4ADE80] text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSuccessMessage}</span>
              </div>
            )}

            {/* Modal Tab Switcher */}
            <div className="flex rounded-xl bg-[#141414] p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveSettingsTab("templates")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSettingsTab === "templates"
                    ? "bg-[#242424] text-white"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                Template Pesan Cepat ({chatSettings?.templates.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab("hours")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSettingsTab === "hours"
                    ? "bg-[#242424] text-white"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                Jam Operasional & Auto-Reply
              </button>
            </div>

            {/* TAB 1: TEMPLATES MANAGER */}
            {activeSettingsTab === "templates" && (
              <div className="space-y-6">
                {/* Add New Template Form */}
                <form
                  onSubmit={handleAddTemplate}
                  className="p-5 rounded-2xl bg-[#141414] space-y-4"
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#BFDD25]" />
                    <span>Tambah Template Pesan Baru</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                        Judul Template *
                      </label>
                      <input
                        type="text"
                        value={newTplTitle}
                        onChange={(e) => setNewTplTitle(e.target.value)}
                        placeholder="Contoh: Stok Ready & Packing"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C1C] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                        Shortcut / Kode Cepat
                      </label>
                      <input
                        type="text"
                        value={newTplShortcut}
                        onChange={(e) => setNewTplShortcut(e.target.value)}
                        placeholder="Contoh: /ready"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C1C] text-xs font-mono text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                      Isi Pesan Template *
                    </label>
                    <textarea
                      rows={3}
                      value={newTplContent}
                      onChange={(e) => setNewTplContent(e.target.value)}
                      placeholder="Tulis kalimat balasan yang lengkap dan jelas..."
                      className="w-full p-3 rounded-xl bg-[#1C1C1C] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25] leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSavingSettings || !newTplTitle.trim() || !newTplContent.trim()}
                      className="px-5 py-2.5 rounded-full bg-[#BFDD25] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {isSavingSettings ? "Menyimpan..." : "Simpan Template"}
                    </button>
                  </div>
                </form>

                {/* Existing Templates List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">
                    Daftar Template Tersimpan
                  </h4>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {chatSettings?.templates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-3.5 rounded-xl bg-[#141414] flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {tpl.title}
                            </span>
                            {tpl.shortcut && (
                              <span className="px-2 py-0.5 rounded-md bg-[#1E1E1E] text-[10px] font-mono text-[#BFDD25]">
                                {tpl.shortcut}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#8E8E93] leading-relaxed line-clamp-2">
                            {tpl.content}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="w-7 h-7 rounded-lg bg-[#1E1E1E] hover:bg-red-900/50 text-[#71717A] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Hapus template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OPERATING HOURS & AUTO REPLY */}
            {activeSettingsTab === "hours" && chatSettings && (
              <form onSubmit={handleSaveOperatingHours} className="space-y-6">
                {/* Operating Hours Toggle & Schedule */}
                <div className="p-5 rounded-2xl bg-[#141414] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Jadwal Jam Operasional Toko
                      </h4>
                      <p className="text-[11px] text-[#8E8E93] mt-0.5">
                        Tentukan jam buka toko Anda agar pembeli mengetahui kapan pesan mereka akan direspons.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chatSettings.operatingHours.enabled}
                        onChange={(e) =>
                          setChatSettings({
                            ...chatSettings,
                            operatingHours: {
                              ...chatSettings.operatingHours,
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#242424] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BFDD25]"></div>
                    </label>
                  </div>

                  {chatSettings.operatingHours.enabled && (
                    <div className="space-y-2 pt-2 divide-y divide-[#1C1C1C]">
                      {chatSettings.operatingHours.schedule.map((sched, idx) => (
                        <div
                          key={sched.day}
                          className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-3 w-28">
                            <input
                              type="checkbox"
                              checked={sched.isOpen}
                              onChange={(e) => {
                                const copy = [...chatSettings.operatingHours.schedule];
                                copy[idx].isOpen = e.target.checked;
                                setChatSettings({
                                  ...chatSettings,
                                  operatingHours: {
                                    ...chatSettings.operatingHours,
                                    schedule: copy,
                                  },
                                });
                              }}
                              className="rounded accent-[#BFDD25] cursor-pointer"
                            />
                            <span
                              className={`text-xs font-semibold ${
                                sched.isOpen ? "text-white" : "text-[#71717A]"
                              }`}
                            >
                              {sched.day}
                            </span>
                          </div>

                          {sched.isOpen ? (
                            <div className="flex items-center gap-2 text-xs font-mono text-white">
                              <input
                                type="time"
                                value={sched.openTime}
                                onChange={(e) => {
                                  const copy = [...chatSettings.operatingHours.schedule];
                                  copy[idx].openTime = e.target.value;
                                  setChatSettings({
                                    ...chatSettings,
                                    operatingHours: {
                                      ...chatSettings.operatingHours,
                                      schedule: copy,
                                    },
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#1C1C1C] text-xs text-white border-0 outline-none"
                              />
                              <span className="text-[#71717A]">s/d</span>
                              <input
                                type="time"
                                value={sched.closeTime}
                                onChange={(e) => {
                                  const copy = [...chatSettings.operatingHours.schedule];
                                  copy[idx].closeTime = e.target.value;
                                  setChatSettings({
                                    ...chatSettings,
                                    operatingHours: {
                                      ...chatSettings.operatingHours,
                                      schedule: copy,
                                    },
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#1C1C1C] text-xs text-white border-0 outline-none"
                              />
                              <span className="text-[10px] text-[#71717A]">WIB</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#71717A] italic">Tutup / Libur</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auto-Reply Out of Hours */}
                <div className="p-5 rounded-2xl bg-[#141414] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Balas Otomatis di Luar Jam Operasional
                      </h4>
                      <p className="text-[11px] text-[#8E8E93] mt-0.5">
                        Kirimkan balasan otomatis saat pembeli mengirim pesan saat toko sedang tutup.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chatSettings.autoReplyOutOfHours}
                        onChange={(e) =>
                          setChatSettings({
                            ...chatSettings,
                            autoReplyOutOfHours: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#242424] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BFDD25]"></div>
                    </label>
                  </div>

                  {chatSettings.autoReplyOutOfHours && (
                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1.5">
                        Pesan Balasan di Luar Jam Kerja
                      </label>
                      <textarea
                        rows={3}
                        value={chatSettings.outOfHoursMessage}
                        onChange={(e) =>
                          setChatSettings({
                            ...chatSettings,
                            outOfHoursMessage: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl bg-[#1C1C1C] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25] leading-relaxed"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-6 py-2.5 rounded-full bg-[#BFDD25] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white text-xs font-mono">Memuat Chat...</div>}>
      <SellerChatContent />
    </Suspense>
  );
}

