"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

// Dummy data for notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "order",
    title: "Order Shipped",
    message: "Your order #TZ-9923 for Tangzu Wukong has been shipped via JNE.",
    time: "2 hours ago",
    unread: true,
    actionLink: "/orders",
  },
  {
    id: 2,
    type: "system",
    title: "Account Security",
    message: "A new login was detected from a new device in Jakarta.",
    time: "1 day ago",
    unread: true,
    actionLink: "/settings",
  },
  {
    id: 3,
    type: "promo",
    title: "Flash Sale Alert!",
    message: "Enjoy up to 50% off on selected IEMs this weekend only.",
    time: "3 days ago",
    unread: false,
    actionLink: "/collection",
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  useEffect(() => {
    // Auth Check
    const stored = localStorage.getItem("tonalzone_user");
    if (!stored) {
      router.replace("/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#D4FF00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e0e] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e]">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Header - F-Pattern Top Left & Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-4xl uppercase tracking-tight text-[#FAF9F6]">
              Notifications
            </h1>
            <p className="text-sm font-mono text-white/50 uppercase tracking-widest mt-2">
              You have {unreadCount} unread message{unreadCount !== 1 && "s"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-mono uppercase tracking-widest text-[#D4FF00] hover:text-white transition-colors duration-200 touch-manipulation self-start sm:self-center"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List - F-Pattern Scanning */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-20 border border-white/10 bg-[#111] rounded-xl">
              <p className="font-mono text-white/50 uppercase tracking-widest text-sm">
                No notifications yet.
              </p>
            </div>
          ) : (
            notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`flex flex-col sm:flex-row gap-4 sm:items-start p-5 rounded-xl border transition-colors duration-300 ${
                  notif.unread
                    ? "bg-[#111] border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.03)]"
                    : "bg-[#0e0e0e] border-white/5 opacity-70"
                }`}
              >
                {/* Icon (Left) */}
                <div className="shrink-0 pt-1">
                  {notif.type === "order" && (
                    <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#2E2E2E] text-white flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </div>
                  )}
                  {notif.type === "system" && (
                    <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#2E2E2E] text-white flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                  )}
                  {notif.type === "promo" && (
                    <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#2E2E2E] text-white flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                  )}
                </div>

                {/* Main Content (Middle/Left) */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-base font-bold ${notif.unread ? "text-white" : "text-white/80"}`}>
                      {notif.title}
                    </h3>
                    {notif.unread && (
                      <span className="w-2 h-2 rounded-full bg-[#D4FF00]"></span>
                    )}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-3">
                    {notif.message}
                  </p>
                  
                  {/* Actions (Right/Bottom) */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      {notif.time}
                    </span>
                    <div className="flex items-center gap-4">
                      {notif.unread && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-xs font-medium text-white/50 hover:text-white transition-colors duration-200 touch-manipulation"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => router.push(notif.actionLink)}
                        className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4FF00] hover:text-[#c2eb00] transition-colors duration-200 touch-manipulation"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
