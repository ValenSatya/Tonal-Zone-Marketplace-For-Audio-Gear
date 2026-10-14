import { RealtimeTopic, RealtimeMessage } from "./realtime-bus";

/**
 * TONALZONE SERVER-SENT EVENTS (SSE) REALTIME HUB
 * 
 * Manages active HTTP SSE subscriber streams across different browsers and devices.
 * Enables live multi-device push updates for Orders, Notifications, Chat, Wallet, and Catalog.
 */

interface SSEClient {
  id: string;
  controller: ReadableStreamDefaultController;
  connectedAt: number;
}

// Module-level / globalThis singleton to persist subscribers across hot reloads in dev
const GLOBAL_HUB_KEY = Symbol.for("tonalzone_server_realtime_hub");

class ServerRealtimeHub {
  private clients = new Map<string, SSEClient>();
  private heartbeatTimer: NodeJS.Timeout | null = null;

  public addClient(id: string, controller: ReadableStreamDefaultController): void {
    this.clients.set(id, {
      id,
      controller,
      connectedAt: Date.now(),
    });

    // Send immediate SSE comment handshake (does not trigger client domain listeners)
    try {
      const textEncoder = new TextEncoder();
      controller.enqueue(textEncoder.encode(`: connected - ${id}\n\n`));
    } catch {}

    // Ensure singleton heartbeat is running if we have clients
    if (!this.heartbeatTimer) {
      this.heartbeatTimer = setInterval(() => {
        this.sendHeartbeat();
      }, 25000);
    }
  }

  public removeClient(id: string): void {
    this.clients.delete(id);
    if (this.clients.size === 0 && this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public getSubscriberCount(): number {
    return this.clients.size;
  }

  public broadcast<T = any>(
    topic: RealtimeTopic,
    payload?: T,
    senderId?: string
  ): void {
    const message: RealtimeMessage<T> & { senderId?: string } = {
      topic,
      payload,
      timestamp: Date.now(),
      senderId,
    };

    const staleIds: string[] = [];

    this.clients.forEach((client, id) => {
      // Do not echo back to the originating client if senderId is specified
      if (senderId && client.id === senderId) return;

      try {
        this.sendToClient(client.controller, message);
      } catch (err) {
        // Stream closed or broken pipe
        staleIds.push(id);
      }
    });

    for (const deadId of staleIds) {
      this.clients.delete(deadId);
    }
  }

  private sendToClient(
    controller: ReadableStreamDefaultController,
    data: any
  ): void {
    const textEncoder = new TextEncoder();
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(textEncoder.encode(payload));
  }

  public sendHeartbeat(): void {
    const textEncoder = new TextEncoder();
    const ping = `: ping - ${Date.now()}\n\n`;
    const staleIds: string[] = [];

    this.clients.forEach((client, id) => {
      try {
        client.controller.enqueue(textEncoder.encode(ping));
      } catch {
        staleIds.push(id);
      }
    });

    for (const deadId of staleIds) {
      this.clients.delete(deadId);
    }
  }
}

// Ensure singleton instance in Node.js runtime
const globalScope = globalThis as unknown as { [GLOBAL_HUB_KEY]?: ServerRealtimeHub };

export const serverRealtimeHub: ServerRealtimeHub =
  globalScope[GLOBAL_HUB_KEY] || (globalScope[GLOBAL_HUB_KEY] = new ServerRealtimeHub());

/**
 * Server-side helper to broadcast real-time events to all connected browsers/devices.
 * Usable directly inside Server Actions and Route Handlers.
 */
export function serverBroadcastRealtime<T = any>(
  topic: RealtimeTopic,
  payload?: T,
  senderId?: string
): void {
  serverRealtimeHub.broadcast(topic, payload, senderId);
}
