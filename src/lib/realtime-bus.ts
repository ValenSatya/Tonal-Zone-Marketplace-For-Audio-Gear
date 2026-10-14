/**
 * TONALZONE UNIVERSAL CROSS-TAB & CROSS-DEVICE REALTIME BUS
 * 
 * Provides instantaneous, bidirectional synchronization across multiple browser tabs
 * and different devices using modern BroadcastChannel + Server-Sent Events (SSE) relay.
 * 
 * Topics covered:
 * - "CATALOG": Product creation, updates, deletes, and stock claims
 * - "CART": Add to cart, quantity changes, item removal, cart checkout clearing
 * - "ORDERS": Order placement, payment confirmation, shipping waybill dispatch, auto-settle, delivery acceptance
 * - "WALLET": Escrow payout releases, seller balance updates, payout requests
 * - "REVIEWS": Product rating and review submissions
 * - "NOTIFICATIONS": Bell notifications, unread count badge
 * - "AUTH": Cross-tab and cross-device logout synchronization
 */

export type RealtimeTopic =
  | "CATALOG"
  | "CART"
  | "ORDERS"
  | "WALLET"
  | "REVIEWS"
  | "NOTIFICATIONS"
  | "AUTH";

const TOPIC_CHANNELS: Record<RealtimeTopic, string> = {
  CATALOG: "tonalzone_catalog_sync",
  CART: "tonalzone_cart_sync",
  ORDERS: "tonalzone_orders_sync",
  WALLET: "tonalzone_wallet_sync",
  REVIEWS: "tonalzone_reviews_sync",
  NOTIFICATIONS: "tonalzone_notifications_sync",
  AUTH: "tonalzone_auth_sync",
};

export interface RealtimeMessage<T = any> {
  topic: RealtimeTopic;
  payload?: T;
  timestamp: number;
  senderId?: string;
}

let currentClientId = "";
export function getClientId(): string {
  if (typeof window === "undefined") return "server";
  if (!currentClientId) {
    currentClientId = "cli_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
  }
  return currentClientId;
}

// Global SSE connection manager for cross-browser & cross-device synchronization
let globalEventSource: EventSource | null = null;
let isConnectingSSE = false;

function ensureSSEConnection(): void {
  if (typeof window === "undefined" || typeof EventSource === "undefined") return;
  if (globalEventSource || isConnectingSSE) return;

  isConnectingSSE = true;
  try {
    const clientId = getClientId();
    const es = new EventSource(`/api/realtime/stream?clientId=${encodeURIComponent(clientId)}`);

    es.onopen = () => {
      isConnectingSSE = false;
      globalEventSource = es;
    };

    es.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);
        if (!message || !message.topic) return;

        // Ignore echo events sent by this exact tab/browser instance
        if (message.senderId && message.senderId === clientId) return;

        const channelName = TOPIC_CHANNELS[message.topic];
        if (channelName) {
          // Dispatch in local window so all active listeners on this device/browser react immediately
          window.dispatchEvent(new CustomEvent(channelName, { detail: message.payload }));
        }
      } catch {}
    };

    es.onerror = () => {
      try {
        es.close();
      } catch {}
      globalEventSource = null;
      isConnectingSSE = false;
      // Reconnect with backoff to prevent throttling
      setTimeout(() => {
        ensureSSEConnection();
      }, 5000);
    };
  } catch {
    isConnectingSSE = false;
  }
}

/**
 * Broadcasts an event to all open browser tabs and all connected devices via SSE.
 */
export function broadcastRealtime<T = any>(topic: RealtimeTopic, payload?: T): void {
  if (typeof window === "undefined") return;

  const channelName = TOPIC_CHANNELS[topic];
  const senderId = getClientId();
  const message: RealtimeMessage<T> = {
    topic,
    payload,
    timestamp: Date.now(),
    senderId,
  };

  // 1. BroadcastChannel: Instant sub-millisecond delivery across OTHER browser tabs in same browser
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel(channelName);
      bc.postMessage(message);
      setTimeout(() => {
        try {
          bc.close();
        } catch {}
      }, 100);
    }
  } catch (err) {
    console.warn(`[RealtimeBus] BroadcastChannel failed for ${topic}:`, err);
  }

  // 2. localStorage Event: Universally fires window.onstorage in all OTHER open tabs in same browser
  try {
    const storageKey = `${channelName}_event`;
    localStorage.setItem(storageKey, JSON.stringify(message));
  } catch {}

  // NOTE: We deliberately DO NOT dispatch CustomEvent to the local window here.
  // The local component initiating the broadcast already updated its local React state.
  // Echoing back locally causes infinite state recursion and React fiber unmount crashes.

  // 3. Server-Sent Events (SSE) Relay: Broadcast to all OTHER browsers and devices
  try {
    fetch("/api/realtime/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        payload,
        senderId,
        timestamp: Date.now(),
      }),
    }).catch(() => {
      // Graceful offline fallback
    });
  } catch {}
}

/**
 * Subscribes to real-time events on a specific topic across all browser tabs and external devices.
 * Returns an unsubscription cleanup function.
 */
export function subscribeRealtime<T = any>(
  topic: RealtimeTopic,
  callback: (payload?: T) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  // Ensure persistent SSE stream connection is active to receive cross-device events
  ensureSSEConnection();

  const channelName = TOPIC_CHANNELS[topic];
  const myClientId = getClientId();
  let bc: BroadcastChannel | null = null;

  // 1. Listen via BroadcastChannel
  try {
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel(channelName);
      bc.onmessage = (event: MessageEvent<RealtimeMessage<T>>) => {
        if (!event.data || event.data.topic !== topic) return;
        // Ignore echo messages sent by this exact tab/client
        if (event.data.senderId && event.data.senderId === myClientId) return;
        callback(event.data.payload);
      };
    }
  } catch (err) {
    console.warn(`[RealtimeBus] Failed to initialize BroadcastChannel for ${topic}:`, err);
  }

  // 2. Listen via native cross-tab window storage event
  const storageHandler = (e: StorageEvent) => {
    if (e.key === `${channelName}_event` && e.newValue) {
      try {
        const parsed: RealtimeMessage<T> = JSON.parse(e.newValue);
        if (parsed && parsed.topic === topic) {
          // Ignore echo messages sent by this exact tab/client
          if (parsed.senderId && parsed.senderId === myClientId) return;
          callback(parsed.payload);
        }
      } catch {
        callback();
      }
    }
  };

  // 3. Listen via local in-window CustomEvent (only triggered when remote SSE message arrives from another device)
  const localHandler = (e: Event) => {
    const customEvt = e as CustomEvent<T>;
    callback(customEvt.detail);
  };

  window.addEventListener("storage", storageHandler);
  window.addEventListener(channelName, localHandler);

  return () => {
    if (bc) {
      try {
        bc.close();
      } catch {}
    }
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(channelName, localHandler);
  };
}
