"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications, formatRelativeTime, NotificationItem } from "@/context/NotificationContext";

export default function NotificationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === "English";
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "ORDER" | "CHAT" | "SYSTEM">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Auth Check
    const stored = localStorage.getItem("tonalzone_user");
    if (!stored) {
      router.replace("/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Tab filter
      if (activeTab === "UNREAD" && !notif.unread) return false;
      if (activeTab === "ORDER" && notif.type !== "order") return false;
      if (activeTab === "CHAT" && notif.type !== "chat") return false;
      if (activeTab === "SYSTEM" && notif.type !== "system" && notif.type !== "promo") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = notif.title.toLowerCase().includes(q);
        const matchMessage = notif.message.toLowerCase().includes(q);
        return matchTitle || matchMessage;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleOpenNotification = (notif: NotificationItem) => {
    markAsRead(notif.id);
    router.push(notif.actionLink);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#080808]">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#1c1c1c] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
                {isEn ? "Notifications" : "Pusat Notifikasi"}
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#D4FF00] text-black">
                  {unreadCount} {isEn ? "new" : "baru"}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-[#888] mt-1.5">
              {isEn
                ? `You have ${unreadCount} unread update${unreadCount !== 1 ? "s" : ""} across orders, messages, and security.`
                : `Anda memiliki ${unreadCount} notifikasi belum dibaca seputar transaksi, chat toko, dan keamanan.`}
            </p>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-mono font-medium text-[#D4FF00] hover:text-white transition-colors cursor-pointer"
              >
                {isEn ? "Mark all as read" : "Tandai Semua Dibaca"}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(isEn ? "Clear all notifications?" : "Hapus seluruh riwayat notifikasi?")) {
                    clearAllNotifications();
                  }
                }}
                className="text-xs font-mono text-[#666] hover:text-red-400 transition-colors cursor-pointer"
              >
                {isEn ? "Clear all" : "Bersihkan Semua"}
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6 pb-2 border-b border-[#1c1c1c]">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "ALL", label: isEn ? "All" : "Semua", count: notifications.length },
              { id: "UNREAD", label: isEn ? "Unread" : "Belum Dibaca", count: unreadCount },
              { id: "ORDER", label: isEn ? "Orders" : "Pesanan", count: notifications.filter((n) => n.type === "order").length },
              { id: "CHAT", label: isEn ? "Chat" : "Pesan Chat", count: notifications.filter((n) => n.type === "chat").length },
              { id: "SYSTEM", label: isEn ? "System" : "Sistem", count: notifications.filter((n) => n.type === "system" || n.type === "promo").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[#1c1c1c] text-white font-semibold border border-[#333]"
                    : "text-[#888] hover:text-white hover:bg-[#121212]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#222] text-[#777]"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60 shrink-0">
            <svg
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search updates..." : "Cari notifikasi..."}
              className="w-full bg-[#111] border border-[#222] focus:border-[#444] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#666] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-20 border border-[#1c1c1c] bg-[#0c0c0c] rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center mx-auto mb-3 text-[#666]">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {isEn ? "No notifications match this filter" : "Tidak ada notifikasi pada kategori ini"}
                </h3>
                <p className="text-xs font-mono text-[#777] max-w-sm mx-auto">
                  {isEn
                    ? "New order status updates, store messages, and escrow releases will appear here in real-time."
                    : "Notifikasi pesanan, pesan toko, dan update rekening bersama akan langsung muncul di sini secara otomatis."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between group ${
                    notif.unread
                      ? "bg-[#141414] border-[#2c2c2c] hover:border-[#404040]"
                      : "bg-[#0b0b0b] border-[#1a1a1a] hover:border-[#262626] opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Left: Icon & Text Body */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Type Icon */}
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] shrink-0 flex items-center justify-center text-white mt-0.5">
                      {notif.type === "order" && (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      )}
                      {notif.type === "chat" && (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      )}
                      {notif.type === "system" && (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      )}
                      {notif.type === "promo" && (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#222] text-[#aaa]">
                          {notif.type === "order" ? "Pesanan" : notif.type === "chat" ? "Chat Toko" : notif.type === "system" ? "Sistem" : "Promo"}
                        </span>
                        <h3 className={`text-sm font-semibold truncate ${notif.unread ? "text-white" : "text-[#ddd]"}`}>
                          {notif.title}
                        </h3>
                        {notif.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#D4FF00] shrink-0" />
                        )}
                        <span className="text-[11px] font-mono text-[#666] ml-auto sm:ml-0">
                          • {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[#888] leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1c1c1c] justify-end">
                    {notif.unread && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-sans text-[#888] hover:text-white px-2.5 py-1 rounded hover:bg-[#202020] transition-colors cursor-pointer"
                      >
                        {isEn ? "Mark read" : "Tandai Dibaca"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenNotification(notif)}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#e0e0e0] text-black font-sans font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>{isEn ? "Open" : "Buka"}</span>
                      <span>→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteNotification(notif.id)}
                      title={isEn ? "Delete" : "Hapus notifikasi"}
                      className="p-1.5 text-[#555] hover:text-red-400 hover:bg-[#1f1f1f] rounded-lg transition-colors cursor-pointer"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

