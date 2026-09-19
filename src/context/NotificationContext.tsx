"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface NotificationItem {
  id: string;
  recipientEmail?: string;
  recipientRole?: "buyer" | "seller" | "admin" | "all";
  storeId?: string;
  type: "order" | "chat" | "system" | "promo";
  title: string;
  message: string;
  createdAt: number | string;
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
  isLoading: boolean;
  addNotification: (
    item: Omit<NotificationItem, "id" | "createdAt" | "unread"> & {
      unread?: boolean;
      recipientEmail?: string;
      recipientRole?: "buyer" | "seller" | "admin" | "all";
      storeId?: string;
    }
  ) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  refreshNotifications: () => Promise<void>;
}

const STORAGE_KEY = "tonalzone_notifications";

export const formatRelativeTime = (timestamp: number | string): string => {
  const time = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const diff = Date.now() - (isNaN(time) ? Date.now() : time);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return new Date(time).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from real backend API for current logged-in user
  const refreshNotifications = useCallback(async () => {
    try {
      let email = "all";
      let storeId: string | undefined = undefined;

      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("tonalzone_user");
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            if (u?.email) email = u.email;
            if (u?.store?.id || u?.storeId) storeId = u?.store?.id || u?.storeId;
          } catch {}
        }
      }

      const params = new URLSearchParams({ email });
      if (storeId) params.set("storeId", storeId);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.notifications));
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch live notifications from database:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch {}

    refreshNotifications();
  }, [refreshNotifications]);

  // Listen for updates from external triggers or other tabs
  useEffect(() => {
    const handleExternalUpdate = () => {
      refreshNotifications();
    };

    window.addEventListener("tonalzone_notifications_external_trigger", handleExternalUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "tonalzone_user" || e.key === STORAGE_KEY) {
        refreshNotifications();
      }
    });

    return () => {
      window.removeEventListener("tonalzone_notifications_external_trigger", handleExternalUpdate);
      window.removeEventListener("storage", handleExternalUpdate);
    };
  }, [refreshNotifications]);

  const addNotification = useCallback(
    (
      item: Omit<NotificationItem, "id" | "createdAt" | "unread"> & {
        unread?: boolean;
        recipientEmail?: string;
        recipientRole?: "buyer" | "seller" | "admin" | "all";
        storeId?: string;
      }
    ): string => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newNotif: NotificationItem = {
        id,
        createdAt: Date.now(),
        unread: item.unread !== undefined ? item.unread : true,
        ...item,
      };

      // Optimistic state
      setNotifications((prev) => [newNotif, ...prev]);

      // Fire asynchronous database persistence
      let email = item.recipientEmail;
      if (!email && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("tonalzone_user");
          if (stored) {
            const u = JSON.parse(stored);
            if (u?.email) email = u.email;
          }
        } catch {}
      }

      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          recipientEmail: email || "all",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.notification) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? data.notification : n))
            );
          }
        })
        .catch((e) => console.error("Error creating notification in DB:", e));

      return id;
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAsRead", id }),
    }).catch((e) => console.error("Error marking notification read in DB:", e));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

    let email = "all";
    let storeId: string | undefined = undefined;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.email) email = u.email;
          if (u?.store?.id || u?.storeId) storeId = u?.store?.id || u?.storeId;
        }
      } catch {}
    }

    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllAsRead", email, storeId }),
    }).catch((e) => console.error("Error marking all read in DB:", e));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    fetch(`/api/notifications?id=${encodeURIComponent(id)}&action=delete`, {
      method: "DELETE",
    }).catch((e) => console.error("Error deleting notification in DB:", e));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);

    let email = "all";
    let storeId: string | undefined = undefined;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.email) email = u.email;
          if (u?.store?.id || u?.storeId) storeId = u?.store?.id || u?.storeId;
        }
      } catch {}
    }

    const params = new URLSearchParams({ action: "clearAll", email });
    if (storeId) params.set("storeId", storeId);

    fetch(`/api/notifications?${params.toString()}`, {
      method: "DELETE",
    }).catch((e) => console.error("Error clearing notifications in DB:", e));
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        refreshNotifications,
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

// Standalone global trigger helper (usable anywhere in the app)
export async function triggerAppNotification(
  item: Omit<NotificationItem, "id" | "createdAt" | "unread"> & {
    unread?: boolean;
    recipientEmail?: string;
    recipientRole?: "buyer" | "seller" | "admin" | "all";
    storeId?: string;
  }
): Promise<string> {
  if (typeof window === "undefined") return "";

  let email = item.recipientEmail;
  if (!email) {
    try {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.email) email = u.email;
      }
    } catch {}
  }
  if (!email) email = "all";

  try {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...item,
        recipientEmail: email,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.notification) {
        window.dispatchEvent(
          new CustomEvent("tonalzone_notifications_external_trigger", {
            detail: data.notification,
          })
        );
        return data.notification.id;
      }
    }
  } catch (err) {
    console.error("Error triggering notification to backend DB:", err);
  }

  // Fallback
  const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const list: NotificationItem[] = saved ? JSON.parse(saved) : [];
    const newNotif: NotificationItem = {
      id,
      createdAt: Date.now(),
      unread: item.unread !== undefined ? item.unread : true,
      recipientEmail: email,
      ...item,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newNotif, ...list]));
    window.dispatchEvent(new Event("tonalzone_notifications_external_trigger"));
  } catch {}
  return id;
}
