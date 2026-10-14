import { NextRequest } from "next/server";
import { serverRealtimeHub } from "@/lib/server-realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId") || `client_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const stream = new ReadableStream({
    start(controller) {
      serverRealtimeHub.addClient(clientId, controller);
    },
    cancel() {
      serverRealtimeHub.removeClient(clientId);
    },
  });

  // Handle client disconnect or abort
  request.signal.addEventListener("abort", () => {
    serverRealtimeHub.removeClient(clientId);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
