import { NextResponse } from "next/server";
import { chatRepo, supabase } from "@/lib/supabase-db";

export async function GET() {
  try {
    // 1. Fetch real chat conversations from chat repository
    const conversations = await chatRepo.getConversations();

    // 2. Map conversations into Support Tickets with real messages
    const tickets = await Promise.all(
      conversations.map(async (c) => {
        const rawMsgs = await chatRepo.getMessages(c.id);
        const msgs = rawMsgs.map((m: any) => ({
          id: m.id,
          sender: m.senderRole === "buyer" ? "customer" : "admin",
          senderName: m.senderName || (m.senderRole === "buyer" ? c.buyerName : "Admin CS TonalZone"),
          text: m.text || "",
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));

        return {
          id: c.id,
          customerName: c.buyerName || c.buyerEmail.split("@")[0],
          customerEmail: c.buyerEmail,
          topic: c.storeName ? `Inquiry: ${c.storeName}` : "Layanan Bantuan Pembeli TonalZone",
          status: (c.unreadBuyer > 0 ? "IN_PROGRESS" : c.unreadSeller > 0 ? "OPEN" : "RESOLVED") as "OPEN" | "IN_PROGRESS" | "RESOLVED",
          unread: c.unreadSeller > 0,
          updatedAt: new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          messages: msgs,
        };
      })
    );

    return NextResponse.json({
      success: true,
      tickets,
      totalCount: tickets.length,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch support tickets";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, buyerEmail, buyerName, text, status } = body;

    if (!buyerEmail && !conversationId) {
      return NextResponse.json({ success: false, error: "Buyer email atau conversationId wajib diisi" }, { status: 400 });
    }

    // 1. Find or create conversation with TonalZone Customer Support
    let conversation = conversationId ? await chatRepo.getConversationById(conversationId) : null;
    if (!conversation && buyerEmail) {
      conversation = await chatRepo.findOrCreateConversation({
        buyerEmail,
        buyerName: buyerName || buyerEmail.split("@")[0],
        storeId: "store-tonalzone-cs",
        storeName: "TonalZone Customer Support",
        storeType: "OFFICIAL_BRAND",
      });
    }

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Gagal menemukan atau membuat percakapan CS" }, { status: 404 });
    }

    // 2. Persist admin CS reply message
    if (text && text.trim()) {
      await chatRepo.sendMessage({
        conversationId: conversation.id,
        senderRole: "seller",
        senderName: "Admin CS TonalZone",
        senderEmail: "support@tonalzone.id",
        text: text.trim(),
      });
    }

    const updated = await chatRepo.getConversationById(conversation.id);
    const rawMsgs = updated ? await chatRepo.getMessages(updated.id) : [];

    return NextResponse.json({
      success: true,
      ticket: {
        id: updated?.id,
        customerName: updated?.buyerName,
        customerEmail: updated?.buyerEmail,
        topic: "Layanan Bantuan Pembeli TonalZone",
        status: status || "IN_PROGRESS",
        unread: false,
        updatedAt: "Baru saja",
        messages: rawMsgs.map((m: any) => ({
          id: m.id,
          sender: m.senderRole === "buyer" ? "customer" : "admin",
          senderName: m.senderName || "Admin CS TonalZone",
          text: m.text || "",
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to process CS response";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
