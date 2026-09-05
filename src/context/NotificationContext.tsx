"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface NotificationItem {
  id: string;
  type: "order" | "chat" | "system" | "promo";
  title: string;
  message: string;
  createdAt: number;
  unread: boolean;
  actionLink: string;
  meta?: {
    orderId?: string;
    productName?: string;
    storeName?: string;
    image?: string;
  };
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (
    item: Omit<NotificationItem, "id" | "createdAt" | "unread"> & {
      unread?: boolean;
    }
  ) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const STORAGE_KEY = "tonalzone_notifications";

export const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
};

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-init-1",
    type: "order",
    title: "Pesanan Sedang Dikirim",
    message: "Pesanan #TZ-92841 (MOONDROP BLESSING 3) sedang dalam perjalanan menuju alamat Anda via JNE Express.",
    createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    unread: true,
    actionLink: "/orders",
    meta: {
      orderId: "TZ-92841",
      productName: "MOONDROP BLESSING 3 Hybrid",
      storeName: "Moondrop Official",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    },
  },
  {
    id: "notif-init-2",
    type: "chat",
    title: "Pesan Baru dari Moondrop Official",
    message: "Halo kak! Unit pesanan Anda sudah kami packing kayu dengan bubble tebal, resi sudah diupdate ya.",
    createdAt: Date.now() - 1000 * 60 * 120, // 2 hours ago
    unread: true,
    actionLink: "/messages?seller=Moondrop%20Official",
    meta: {
      storeName: "Moondrop Official",
    },
  },
  {
    id: "notif-init-3",
    type: "system",
    title: "Proteksi Escrow Aktif",
    message: "Selamat datang di TonalZone! Seluruh transaksi Anda terlindungi 100% oleh sistem Rekening Bersama Escrow.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    unread: false,
    actionLink: "/orders",
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
          setIsInitialized(true);
          return;
        }
      }
      // Set defaults if empty
      setNotifications(DEFAULT_NOTIFICATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications(DEFAULT_NOTIFICATIONS);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync state to localStorage whenever notifications change (after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.error("Failed to persist notifications:", err);
    }
  }, [notifications, isInitialized]);

  // Listen for updates from external triggers or other tabs
  useEffect(() => {
    const handleExternalUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setNotifications((current) => {
              if (current.length === parsed.length && current[0]?.id === parsed[0]?.id) {
                return current;
              }
              return parsed;
            });
          }
        }
      } catch (err) {}
    };

    window.addEventListener("tonalzone_notifications_external_trigger", handleExternalUpdate);
    window.addEventListener("storage", handleExternalUpdate);

    return () => {
      window.removeEventListener("tonalzone_notifications_external_trigger", handleExternalUpdate);
      window.removeEventListener("storage", handleExternalUpdate);
    };
  }, []);

  const addNotification = useCallback(
    (
      item: Omit<NotificationItem, "id" | "createdAt" | "unread"> & {
        unread?: boolean;
      }
    ): string => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newNotif: NotificationItem = {
        id,
        createdAt: Date.now(),
        unread: item.unread !== undefined ? item.unread : true,
        ...item,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      return id;
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// Standalone global trigger helper (usable even without React context hook)
export function triggerAppNotification(
  item: Omit<NotificationItem, "id" | "createdAt" | "unread"> & {
    unread?: boolean;
  }
) {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const list: NotificationItem[] = saved ? JSON.parse(saved) : [];
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      unread: item.unread !== undefined ? item.unread : true,
      ...item,
    };
    const updated = [newNotif, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("tonalzone_notifications_external_trigger"));
  } catch (e) {
    console.error("Error triggering app notification:", e);
  }
}
