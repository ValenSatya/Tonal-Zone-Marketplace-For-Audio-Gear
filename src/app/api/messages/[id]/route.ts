import { NextResponse } from "next/server";
import { chatRepo } from "@/lib/supabase-db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/messages/[id]
 * Fetch all messages for a specific conversation
 */
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const conversationId = id?.trim();

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "Conversation ID is required." },
        { status: 400 }
      );
    }

    const conversation = await chatRepo.getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found." },
        { status: 404 }
      );
    }

    const messages = await chatRepo.getMessages(conversationId);

    return NextResponse.json({
      success: true,
      conversation,
      count: messages.length,
      messages,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to load messages";
    console.error("[Messages ID API] Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/messages/[id]
 * Mark conversation messages as read
 * Body: { role: "buyer" | "seller" }
 */
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const conversationId = id?.trim();
    const body = await request.json().catch(() => ({}));
    const role = (body.role as "buyer" | "seller") || "buyer";

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "Conversation ID is required." },
        { status: 400 }
      );
    }

    await chatRepo.markAsRead(conversationId, role);
    const conversation = await chatRepo.getConversationById(conversationId);

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to update read status";
    console.error("[Messages ID PATCH API] Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
