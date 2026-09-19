"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@/context/LocationContext";
import { fetchProductsFromDb, fetchProductByIdFromDb, CatalogProduct } from "@/lib/products-db";
import { triggerAppNotification } from "@/context/NotificationContext";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

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
  storeId?: string;
}

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

  // Chat State (100% pure database driven, zero dummy contacts or messages)
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, MessageItem[]>>({});
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; avatar?: string } | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
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

  // Store Operating Hours & Seller status
  const [storeHoursStatus, setStoreHoursStatus] = useState<{ isOpen: boolean; scheduleText: string } | null>(null);
  const [isUserSeller, setIsUserSeller] = useState(false);

  // Scroll management & Realtime notification
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [hasNewUnseen, setHasNewUnseen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  const initiateSellerChat = async (
    buyerEmail: string,
    buyerName: string,
    targetStoreName: string
  ) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerEmail,
          buyerName,
          storeName: targetStoreName,
          storeId: "store-" + targetStoreName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          storeType: targetStoreName.toLowerCase().includes("official") ? "Official Store" : "Authorized Dealer",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.conversation) {
          const c = data.conversation;
          const newContact: ContactItem = {
            id: c.id,
            name: c.storeName,
            type: (c.storeType as any) || "Official Store",
            avatar: getStoreInitials(c.storeName),
            lastMessage: c.lastMessage || "Mulai obrolan...",
            time: "Baru",
            unread: 0,
            online: true,
            storeId: c.storeId,
          };
          setContacts((prev) => {
            const exists = prev.find((x) => x.id === newContact.id);
            return exists ? prev : [newContact, ...prev];
          });
          setSelectedContactId(newContact.id);
          setIsMobileListVisible(false);
        }
      }
    } catch (e) {
      console.error("Failed to initiate conversation with seller:", e);
    }
  };

  // Authentication & Fetch Conversations from Database
  useEffect(() => {
    let email = "";
    let name = "Audiophile Buyer";
    let avatar = "";
    try {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.email) {
          email = u.email;
          name = u.name || u.fullName || "Audiophile Buyer";
          avatar = u.avatar || u.image || "";
          setCurrentUser({ email, name, avatar });
        }
        if (u?.isSeller || u?.sellerStatus === "APPROVED" || u?.storeName) {
          setIsUserSeller(true);
        }
      }
    } catch (e) {}

    if (!email) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    async function loadConversations() {
      try {
        setIsLoadingContacts(true);
        const res = await fetch(`/api/messages?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.conversations)) {
            const mapped: ContactItem[] = data.conversations.map((c: any) => ({
              id: c.id,
              name: c.storeName,
              type: (c.storeType as any) || (c.storeName.toLowerCase().includes("official") ? "Official Store" : "Authorized Dealer"),
              avatar: getStoreInitials(c.storeName),
              lastMessage: c.lastMessage || "Mulai obrolan...",
              time: c.lastMessageAt
                ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Baru",
              unread: c.unreadBuyer || 0,
              online: true,
              storeId: c.storeId,
            }));
            setContacts(mapped);

            if (sellerQuery) {
              const formatted = formatStoreName(sellerQuery);
              const match = mapped.find((m) => m.name.toLowerCase() === formatted.toLowerCase());
              if (match) {
                setSelectedContactId(match.id);
                setIsMobileListVisible(false);
              } else {
                initiateSellerChat(email, name, formatted);
              }
            } else if (mapped.length > 0) {
              setSelectedContactId(mapped[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setIsLoadingContacts(false);
      }
    }

    loadConversations();
  }, [router, sellerQuery]);

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

  // Load Real Order Data (strictly database driven, zero dummy fallbacks)
  useEffect(() => {
    if (!orderQuery) return;

    async function loadOrder() {
      let resolvedOrder: AttachedOrderData | null = null;
      let userEmail = "";
      try {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.email) userEmail = u.email;
        }
      } catch (e) {}

      try {
        const url = userEmail ? `/api/orders?email=${encodeURIComponent(userEmail)}` : "/api/orders";
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.orders)) {
            const match = json.orders.find(
              (o: any) => o.id === orderQuery || o.orderNumber === orderQuery
            );
            if (match) {
              resolvedOrder = {
                orderNumber: match.id,
                productName: match.items?.[0]?.productName || "Audiophile Gear",
                brand: match.items?.[0]?.brand || "Tonal Zone",
                price: match.totalAmount || 0,
                status: match.escrowStatus || "IN_TRANSIT",
                waybillNumber: match.waybillNumber,
                courierCode: match.courierCode || "JNE Express",
                image: match.items?.[0]?.image,
              };
            }
          }
        }
      } catch (e) {
        console.error("Failed to load attached order:", e);
      }

      setAttachedOrder(resolvedOrder);
    }

    loadOrder();
  }, [orderQuery]);

  // Load Messages from Database for Selected Conversation with live polling
  useEffect(() => {
    if (!selectedContactId) return;

    async function fetchConversationMessages(silent = false) {
      try {
        if (!silent) setIsLoadingMessages(true);
        const res = await fetch(`/api/messages/${selectedContactId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages)) {
            const mapped: MessageItem[] = data.messages.map((m: any) => ({
              id: m.id,
              sender: m.senderRole === "buyer" ? "me" : "them",
              text: m.text,
              time: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Baru",
              productCard: m.productCard,
              orderCard: m.orderCard,
            }));

            setChatMessages((prev) => {
              const currentList = prev[selectedContactId] || [];
              if (
                currentList.length === mapped.length &&
                currentList.length > 0 &&
                currentList[currentList.length - 1]?.id === mapped[mapped.length - 1]?.id &&
                currentList[currentList.length - 1]?.text === mapped[mapped.length - 1]?.text
              ) {
                return prev;
              }

              if (mapped.length > currentList.length) {
                if (isUserScrolledUp) {
                  setHasNewUnseen(true);
                } else {
                  setTimeout(() => scrollToBottom("smooth"), 50);
                }
              }

              return {
                ...prev,
                [selectedContactId]: mapped,
              };
            });

            // Mark conversation as read in background
            fetch(`/api/messages/${selectedContactId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: "buyer" }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        if (!silent) setIsLoadingMessages(false);
      }
    }

    fetchConversationMessages(false);
    // 1.5s responsive background polling
    const pollInterval = setInterval(() => {
      fetchConversationMessages(true);
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [selectedContactId, isUserScrolledUp]);

  // Real-time Instant Cross-Tab Sync via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("tonalzone_chat_realtime");

    const onChannelMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "NEW_MESSAGE" && data.message && data.conversationId === selectedContactId) {
        const m = data.message;
        const newItem: MessageItem = {
          id: m.id,
          sender: m.senderRole === "buyer" ? "me" : "them",
          text: m.text,
          time: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Baru",
          productCard: m.productCard,
          orderCard: m.orderCard,
        };

        setChatMessages((prev) => {
          const list = prev[selectedContactId] || [];
          if (list.some((x) => x.id === newItem.id || (x.text === newItem.text && x.sender === newItem.sender))) {
            return prev;
          }
          if (isUserScrolledUp) {
            setHasNewUnseen(true);
          } else {
            setTimeout(() => scrollToBottom("smooth"), 50);
          }
          return {
            ...prev,
            [selectedContactId]: [...list, newItem],
          };
        });

        setContacts((prev) =>
          prev.map((c) =>
            c.id === selectedContactId
              ? { ...c, lastMessage: newItem.text, time: newItem.time }
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
  }, [selectedContactId, isUserScrolledUp]);

  const activeContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || contacts[0];
  }, [contacts, selectedContactId]);

  // Check store operating hours when activeContact changes
  useEffect(() => {
    if (!activeContact) return;
    const storeIdToFetch =
      activeContact.storeId ||
      "store-" + activeContact.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    async function checkStoreStatus() {
      try {
        const res = await fetch(
          `/api/seller/chat-settings?storeId=${encodeURIComponent(storeIdToFetch)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.liveStatus) {
            setStoreHoursStatus(data.liveStatus);
          }
        }
      } catch (e) {}
    }
    checkStoreStatus();
  }, [activeContact?.id, activeContact?.storeId, activeContact?.name]);

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

  // Scroll to bottom only when switching active conversation
  useEffect(() => {
    if (selectedContactId) {
      setTimeout(() => scrollToBottom("auto"), 50);
    }
  }, [selectedContactId]);

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
  // Database-Backed Send Message: Persists buyer message and store reply to repository
  const sendMessage = async (
    text: string,
    options?: { withProductCard?: boolean; withOrderCard?: boolean }
  ) => {
    const trimmed = text.trim();
    const attachProd = options?.withProductCard && attachedProduct ? attachedProduct : undefined;
    const attachOrd = options?.withOrderCard && attachedOrder ? attachedOrder : undefined;

    if (!trimmed && !attachProd && !attachOrd) return;
    if (!selectedContactId || !currentUser) return;

    const time = getCurrentTime();
    const tempId = `m-${Date.now()}`;
    const newMsg: MessageItem = {
      id: tempId,
      sender: "me",
      text: trimmed,
      time,
      productCard: attachProd,
      orderCard: attachOrd,
    };

    // Optimistic UI update
    setChatMessages((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMsg],
    }));
    setTimeout(() => scrollToBottom("smooth"), 30);

    // Instant cross-tab broadcast
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("tonalzone_chat_realtime");
        bc.postMessage({
          type: "NEW_MESSAGE",
          conversationId: selectedContactId,
          message: {
            id: tempId,
            conversationId: selectedContactId,
            senderRole: "buyer",
            senderName: currentUser.name,
            text: trimmed,
            createdAt: new Date().toISOString(),
            productCard: attachProd,
            orderCard: attachOrd,
          },
        });
        bc.close();
      } catch (e) {}
    }

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? {
              ...c,
              lastMessage:
                trimmed ||
                (attachProd ? `Menanyakan: ${attachProd.name}` : "") ||
                (attachOrd ? `Pesanan #${attachOrd.orderNumber}` : "Lampiran"),
              time,
            }
          : c
      )
    );

    setMessageInput("");
    if (attachProd) setAttachedProduct(null);
    if (attachOrd) setAttachedOrder(null);

    setIsTyping(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedContactId,
          buyerEmail: currentUser.email,
          buyerName: currentUser.name,
          text: trimmed,
          senderRole: "buyer",
          senderName: currentUser.name,
          productCard: attachProd,
          orderCard: attachOrd,
          autoReply: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          const sentMessageItem: MessageItem = {
            id: data.message.id,
            sender: "me",
            text: data.message.text,
            time,
            productCard: data.message.productCard,
            orderCard: data.message.orderCard,
          };

          if (data.replyMessage) {
            const reply: MessageItem = {
              id: data.replyMessage.id,
              sender: "them",
              text: data.replyMessage.text,
              time: new Date(data.replyMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            setChatMessages((prev) => ({
              ...prev,
              [selectedContactId]: [
                ...(prev[selectedContactId] || []).filter((m) => m.id !== tempId),
                sentMessageItem,
                reply,
              ],
            }));

            setContacts((prev) =>
              prev.map((c) =>
                c.id === selectedContactId
                  ? { ...c, lastMessage: reply.text, time: reply.time }
                  : c
              )
            );

            triggerAppNotification({
              type: "chat",
              title: `Pesan Baru dari ${activeContact?.name || "Penjual"}`,
              message: reply.text,
              actionLink: `/messages?seller=${encodeURIComponent(activeContact?.name || "")}`,
              meta: {
                storeName: activeContact?.name || "",
              },
            });
          } else {
            // Real seller 2-way chat: message sent to seller queue
            setChatMessages((prev) => ({
              ...prev,
              [selectedContactId]: [
                ...(prev[selectedContactId] || []).filter((m) => m.id !== tempId),
                sentMessageItem,
              ],
            }));

            setContacts((prev) =>
              prev.map((c) =>
                c.id === selectedContactId
                  ? { ...c, lastMessage: sentMessageItem.text, time: sentMessageItem.time }
                  : c
              )
            );
          }
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(messageInput, {
      withProductCard: !!attachedProduct,
      withOrderCard: !!attachedOrder,
    });
  };

  return (
    <div className="flex flex-col h-[100svh] bg-[#030303] text-[#FAF9F6] font-sans overflow-hidden selection:bg-white selection:text-black">
      <main className="flex-1 flex overflow-hidden">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: CONVERSATIONS LIST */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-[320px] lg:w-[360px] border-r border-[#141414] flex flex-col bg-[#080808] shrink-0 transition-transform duration-200 ${
            !isMobileListVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-[#141414] flex items-center justify-between shrink-0 bg-[#080808]">
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="w-8 h-8 rounded-full bg-[#141414] hover:bg-[#1f1f1f] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title="Kembali ke Beranda"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="font-heading font-bold text-sm tracking-wider uppercase text-white">
                  CHAT PENJUAL
                </h1>
                <span className="text-[10px] font-mono text-zinc-400">Tonal Zone Messenger</span>
              </div>
            </div>

            <Link
              href="/collection"
              className="px-3.5 py-1.5 rounded-full bg-[#141414] hover:bg-[#1f1f1f] text-[11px] font-mono text-zinc-300 hover:text-white uppercase tracking-wider transition-colors"
            >
              KATALOG
            </Link>
          </div>

          {/* Search Contacts Bar */}
          <div className="p-3 bg-[#080808]">
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 text-zinc-400 w-4 h-4 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari toko atau chat..."
                className="w-full bg-[#141414] rounded-full pl-10 pr-9 py-2 text-xs text-white placeholder:text-zinc-400 font-sans outline-none focus:bg-[#1a1a1a] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 w-5 h-5 rounded-full bg-[#222222] hover:bg-[#333333] text-zinc-400 hover:text-white flex items-center justify-center text-[10px] transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 custom-scrollbar">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => {
                const isSelected = selectedContactId === contact.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className={`w-full text-left p-2.5 rounded-[12px] flex items-center gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#181818] text-white"
                        : "hover:bg-[#121212] text-zinc-300"
                    }`}
                  >
                    {/* Store Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold tracking-wider ${
                          isSelected
                            ? "bg-white text-black"
                            : "bg-[#1e1e1e] text-zinc-200"
                        }`}
                      >
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080808]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-zinc-200"}`}>
                          {contact.name}
                        </h3>
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-1">{contact.time}</span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <p className={`text-[11px] truncate leading-tight ${contact.unread > 0 ? "text-white font-medium" : "text-zinc-400"}`}>
                          {contact.lastMessage}
                        </p>
                        {contact.unread > 0 && (
                          <span className="h-4 min-w-[18px] px-1.5 rounded-full bg-[#ef4444] text-white text-[9px] font-bold font-mono flex items-center justify-center shrink-0 shadow-sm">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : isLoadingContacts ? (
              <div className="p-8 text-center text-xs text-zinc-400 font-mono">
                Memuat obrolan...
              </div>
            ) : (
              <div className="p-6 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-[#141414] rounded-full flex items-center justify-center text-zinc-400 mb-3">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-1">
                  Belum Ada Obrolan
                </p>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-4">
                  Buka produk atau pesanan lalu klik &quot;Chat Penjual&quot; untuk memulai.
                </p>
                <Link
                  href="/collection"
                  className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-sans font-medium uppercase tracking-wider rounded-full transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span>Katalog IEM</span>
                  <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: ACTIVE CHAT CONVERSATION */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex flex-col bg-[#030303] relative ${
            isMobileListVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {activeContact ? (
            <>
              {/* Header Bar */}
              <div className="px-5 py-3.5 bg-[#080808] border-b border-[#141414] flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileListVisible(true)}
                    className="md:hidden w-8 h-8 rounded-full bg-[#141414] hover:bg-[#1f1f1f] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="w-10 h-10 rounded-full bg-[#181818] flex items-center justify-center text-white text-xs font-mono font-bold shrink-0">
                    {activeContact.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-sans font-bold text-sm text-white">{activeContact.name}</h2>
                      <span className="text-[9px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#141414] text-zinc-400">
                        {activeContact.type}
                      </span>
                    </div>
                    <div className="text-[11px] font-sans flex items-center gap-2 mt-0.5 text-zinc-400">
                      <span>{activeContact.online ? "Online" : "Aktif 1 jam lalu"}</span>
                      {storeHoursStatus && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className={storeHoursStatus.isOpen ? "text-zinc-300" : "text-zinc-500"}>
                            {storeHoursStatus.isOpen
                              ? `Jam Ops: ${storeHoursStatus.scheduleText}`
                              : `Toko Tutup • Buka ${storeHoursStatus.scheduleText}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isUserSeller && (
                    <Link
                      href="/seller/chat"
                      className="px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#242424] border border-[#2a2a2a] text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
                      title="Buka Chat Penjual"
                    >
                      <span>Mode Seller</span>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  )}
                  <Link
                    href="/collection"
                    className="px-4 py-2 rounded-full bg-[#141414] hover:bg-[#1e1e1e] text-xs font-medium text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>Kunjungi Toko</span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Chat Thread Messages Area */}
              <div
                ref={scrollContainerRef}
                onScroll={handleChatScroll}
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar bg-[#030303] relative"
              >
                
                {/* Security Trust Note */}
                <div className="text-center my-2">
                  <span className="text-[11px] font-sans text-zinc-400 bg-[#0f0f0f] px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Percakapan Dilindungi Sistem Escrow Tonal Zone
                  </span>
                </div>

                {currentMessages.length === 0 && !isLoadingMessages && (
                  <div className="py-12 text-center">
                    <div className="inline-block p-5 bg-[#0e0e0e] rounded-[20px] max-w-md text-left">
                      <p className="text-xs font-semibold text-white mb-1.5">
                        Memulai percakapan dengan {activeContact.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Kirimkan pertanyaan seputar ketersediaan stok, garansi distributor resmi, atau konsultasi impresi suara. Seluruh transaksi dilindungi rekening bersama Tonal Zone Escrow.
                      </p>
                    </div>
                  </div>
                )}

                {isLoadingMessages && (
                  <div className="py-8 text-center text-xs font-mono text-zinc-400">
                    Memuat riwayat pesan...
                  </div>
                )}

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
                      {/* PRODUCT MENTION BUBBLE (CONCENTRIC NESTED FORMULA) */}
                      {/* R_outer = 20px, P = 12px -> R_inner = 8px; Image = 4px */}
                      {/* ========================================================= */}
                      {msg.productCard ? (
                        <div className={`flex items-end gap-2 max-w-[360px] sm:max-w-[400px] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-[#181818] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mb-1">
                              {activeContact.avatar}
                            </div>
                          )}
                          <div className={`p-3 rounded-[20px] ${isMe ? "rounded-br-[4px] bg-[#1a1a1a] text-white" : "rounded-bl-[4px] bg-[#141414] text-white"}`}>
                            {/* Inner Product Card: R_inner = 20 - 12 = 8px */}
                            <div className="flex gap-3 items-center bg-[#222222] p-2.5 rounded-[8px] mb-2.5">
                              {/* Product Thumbnail: STRICTLY 4px */}
                              <div className="w-16 h-16 rounded-[4px] bg-[#2a2a2a] shrink-0 relative overflow-hidden">
                                <Image
                                  src={msg.productCard.image || "/placeholder.svg"}
                                  alt={msg.productCard.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-mono text-zinc-400 uppercase block truncate font-medium">
                                  {msg.productCard.brand}
                                </span>
                                <h4 className="font-sans text-xs font-semibold text-white truncate leading-snug">
                                  {msg.productCard.name}
                                </h4>
                                <p className="font-mono text-xs font-bold text-white mt-1">
                                  {formatPrice(msg.productCard.price)}
                                </p>
                              </div>
                            </div>

                            {/* Inquiry text attached by buyer */}
                            {msg.text && (
                              <p className="text-xs sm:text-[13px] text-zinc-100 leading-relaxed mb-2.5">
                                {msg.text}
                              </p>
                            )}

                            {/* Action Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <Link
                                href={`/product/${msg.productCard.id}`}
                                className="px-3 py-1 rounded-full bg-[#2a2a2a] hover:bg-[#383838] text-[11px] font-medium text-white transition-colors inline-flex items-center gap-1 group"
                              >
                                <span>Lihat Produk</span>
                                <KeyboardArrowRight className="w-3 h-3 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {msg.time} {isMe && "✓✓"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : msg.orderCard ? (
                        /* ========================================================= */
                        /* ORDER MENTION BUBBLE (CONCENTRIC NESTED FORMULA) */
                        /* R_outer = 20px, P = 12px -> R_inner = 8px; Image = 4px */
                        /* ========================================================= */
                        <div className={`flex items-end gap-2 max-w-[360px] sm:max-w-[400px] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-[#181818] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mb-1">
                              {activeContact.avatar}
                            </div>
                          )}
                          <div className={`p-3 rounded-[20px] ${isMe ? "rounded-br-[4px] bg-[#1a1a1a] text-white" : "rounded-bl-[4px] bg-[#141414] text-white"}`}>
                            {/* Inner Order Card: R_inner = 20 - 12 = 8px */}
                            <div className="bg-[#222222] p-2.5 rounded-[8px] mb-2.5">
                              <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-white/5">
                                <span className="text-[10px] font-mono text-white font-bold">
                                  PESANAN #{msg.orderCard.orderNumber}
                                </span>
                                <span className="text-[9px] font-mono uppercase text-zinc-300 bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                                  {msg.orderCard.status.replace(/_/g, " ")}
                                </span>
                              </div>
                              <p className="text-xs text-white font-medium truncate">{msg.orderCard.productName}</p>
                              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mt-1">
                                <span>Total: <strong className="text-white">{formatPrice(msg.orderCard.price)}</strong></span>
                                {msg.orderCard.waybillNumber && (
                                  <span>Resi: <strong className="text-white">{msg.orderCard.waybillNumber}</strong></span>
                                )}
                              </div>
                            </div>

                            {msg.text && (
                              <p className="text-xs sm:text-[13px] text-zinc-100 leading-relaxed mb-2.5">
                                {msg.text}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <Link
                                href="/orders"
                                className="px-3 py-1 rounded-full bg-[#2a2a2a] hover:bg-[#383838] text-[11px] font-medium text-white transition-colors inline-flex items-center gap-1 group"
                              >
                                <span>Detail Pesanan</span>
                                <KeyboardArrowRight className="w-3 h-3 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {msg.time} {isMe && "✓✓"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* ========================================================= */
                        /* STANDARD TEXT CHAT BUBBLE */
                        /* ========================================================= */
                        <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-[#181818] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mb-1">
                              {activeContact.avatar}
                            </div>
                          )}
                          <div
                            className={`px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed break-words ${
                              isMe
                                ? "bg-white text-zinc-950 rounded-[20px] rounded-br-[4px] shadow-sm font-sans"
                                : "bg-[#161616] text-[#FAF9F6] rounded-[20px] rounded-bl-[4px] font-sans"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <div className="text-right mt-1">
                              <span className={`text-[10px] font-mono ${isMe ? "text-zinc-500" : "text-zinc-400"}`}>
                                {msg.time} {isMe && "✓✓"}
                              </span>
                            </div>
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
                    className="flex items-center gap-2 text-xs text-zinc-400 pl-1"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#181818] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {activeContact.avatar}
                    </div>
                    <div className="flex gap-1.5 items-center bg-[#161616] rounded-full px-3 py-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-sans">
                      {activeContact.name} sedang mengetik...
                    </span>
                  </motion.div>
                )}

                {/* Floating New Messages Alert when user scrolled up reading history */}
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

              {/* ========================================================= */}
              {/* FLOATING PRODUCT INQUIRY DOCK */}
              {/* ========================================================= */}
              {attachedProduct && (
                <div className="mx-3 mb-2 p-3.5 bg-[#121212] rounded-[20px] shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Product Thumbnail: STRICTLY 4px */}
                      <div className="w-12 h-12 rounded-[4px] bg-[#1a1a1a] shrink-0 relative overflow-hidden">
                        <Image
                          src={attachedProduct.image || "/placeholder.svg"}
                          alt={attachedProduct.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase font-medium tracking-wider block">
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
                      <button
                        type="button"
                        onClick={() =>
                          sendMessage("Halo kak, saya tertarik dengan produk ini.", {
                            withProductCard: true,
                          })
                        }
                        className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-sans text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Kirim Produk
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachedProduct(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1c1c1c] hover:bg-[#282828] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Tutup lampiran"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        sendMessage("Halo kak, apakah produk ini ready stock?", {
                          withProductCard: true,
                        })
                      }
                      className="px-3.5 py-1.5 rounded-full bg-[#1c1c1c] hover:bg-[#282828] text-xs font-sans text-zinc-200 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
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
                      className="px-3.5 py-1.5 rounded-full bg-[#1c1c1c] hover:bg-[#282828] text-xs font-sans text-zinc-200 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
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
                      className="px-3.5 py-1.5 rounded-full bg-[#1c1c1c] hover:bg-[#282828] text-xs font-sans text-zinc-200 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                    >
                      Bisa kirim hari ini?
                    </button>
                  </div>
                </div>
              )}

              {/* FLOATING ORDER DOCK */}
              {attachedOrder && (
                <div className="mx-3 mb-2 p-3.5 bg-[#121212] rounded-[20px] shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase font-medium tracking-wider block">
                        LAMPIRAN PESANAN
                      </span>
                      <h5 className="text-xs font-semibold text-white truncate">
                        Pesanan #{attachedOrder.orderNumber} • {attachedOrder.productName}
                      </h5>
                      <span className="text-[11px] font-sans text-zinc-400">
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
                        className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-sans text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Kirim Info Pesanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachedOrder(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1c1c1c] hover:bg-[#282828] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Tutup lampiran"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* COMPOSER / INPUT AREA WITH + PRODUK BUTTON */}
              {/* ========================================================= */}
              <div className="p-3 bg-[#080808] border-t border-[#141414] shrink-0">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                  {/* + Produk Button */}
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(true)}
                    className="px-4 py-2.5 rounded-full bg-[#141414] hover:bg-[#1e1e1e] text-zinc-200 hover:text-white font-sans text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                    title="Pilih dan mention produk dari katalog"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>Produk</span>
                  </button>

                  <div className="flex-1 bg-[#141414] focus-within:bg-[#1a1a1a] rounded-full flex items-center px-4 py-2.5 transition-colors">
                    <input
                      ref={textareaRef as any}
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Tulis pesan ke penjual..."
                      className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-zinc-400 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!messageInput.trim() && !attachedProduct && !attachedOrder}
                    className={`px-5 py-2.5 rounded-full font-sans text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      messageInput.trim() || attachedProduct || attachedOrder
                        ? "bg-white hover:bg-zinc-200 text-black shadow-sm"
                        : "bg-[#141414] text-zinc-600 cursor-not-allowed"
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#030303]">
              <div className="w-16 h-16 bg-[#121212] rounded-full flex items-center justify-center text-zinc-400 mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white mb-2 uppercase tracking-wider font-heading">
                {contacts.length === 0 ? "BELUM ADA PERCAKAPAN AKTIF" : "PILIH PERCAKAPAN"}
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm font-sans leading-relaxed mb-6">
                {contacts.length === 0
                  ? "Mulai percakapan langsung dengan toko penjual resmi melalui tombol 'Chat Penjual' di halaman katalog produk atau pesanan Anda."
                  : "Pilih salah satu toko di panel sebelah kiri untuk mulai berkirim pesan."}
              </p>
              {contacts.length === 0 && (
                <div className="flex items-center gap-3">
                  <Link
                    href="/collection"
                    className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-sans font-medium text-xs uppercase tracking-wider rounded-full transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span>Buka Katalog IEM</span>
                    <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/orders"
                    className="px-5 py-2.5 bg-[#141414] hover:bg-[#1e1e1e] text-zinc-200 hover:text-white font-sans font-medium text-xs uppercase tracking-wider rounded-full transition-colors"
                  >
                    Riwayat Pesanan
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* PRODUCT PICKER MODAL (CONCENTRIC NESTED FORMULA) */}
      {/* R_outer = 24px, P = 16px -> R_inner = 8px; Image = 4px */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isProductPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-lg bg-[#121212] rounded-[24px] p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider block">
                    KATALOG TONAL ZONE
                  </span>
                  <h3 className="font-heading text-base font-bold text-white uppercase tracking-wider">
                    Pilih Produk untuk Ditanyakan
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#1c1c1c] hover:bg-[#282828] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search in Modal */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Ketik nama IEM / DAC (misal: Blessing 3, IE 900)..."
                  className="w-full bg-[#181818] rounded-full px-4 py-2.5 text-xs font-sans text-white placeholder:text-zinc-400 outline-none focus:bg-[#202020] transition-colors"
                />
              </div>

              {/* Product Grid: R_outer = 24, P = 16, R_inner = 8px */}
              <div className="max-h-[340px] overflow-y-auto custom-scrollbar space-y-1.5 p-1">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 hover:bg-[#181818] p-2.5 rounded-[8px] transition-colors cursor-pointer"
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
                      {/* Thumbnail: STRICTLY 4px */}
                      <div className="w-12 h-12 rounded-[4px] bg-[#1e1e1e] shrink-0 relative overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">{item.brand}</span>
                        <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                        <span className="text-xs font-mono font-bold text-white">{formatPrice(item.price)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-sans font-medium uppercase tracking-wider rounded-full shrink-0 transition-colors"
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
        <div className="min-h-screen bg-[#030303] flex items-center justify-center text-white font-mono text-xs">
          MEMUAT PERCAKAPAN...
        </div>
      }
    >
      <MessagesContent />
    </React.Suspense>
  );
}
