import { NextResponse } from "next/server";
import { serverRealtimeHub } from "@/lib/server-realtime";
import { RealtimeTopic } from "@/lib/realtime-bus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, payload, senderId } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    serverRealtimeHub.broadcast(topic as RealtimeTopic, payload, senderId);

    return NextResponse.json({
      success: true,
      deliveredTo: serverRealtimeHub.getSubscriberCount(),
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to broadcast message" },
      { status: 500 }
    );
  }
}
