import { NextResponse } from "next/server";
import {
  chatRepo,
  chatSettingsRepo,
  notificationRepo,
  DbChatConversation,
  DbChatMessage,
} from "@/lib/supabase-db";

/**
 * GET /api/messages
 * Query parameters:
 *  - email: Buyer email to fetch conversations for
 *  - storeId: Store ID to fetch conversations for
 *  - storeName: Store Name to fetch conversations for
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const storeId = searchParams.get("storeId");
    const storeName = searchParams.get("storeName");

    const conversations = await chatRepo.getConversations(
      email || undefined,
      storeId || undefined,
      storeName || undefined
    );

    return NextResponse.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch conversations";
    console.error("[Messages API] Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Body:
 *  - conversationId?: string (if message is in an existing conversation)
 *  - buyerEmail: string
 *  - buyerName?: string
 *  - storeId?: string
 *  - storeName?: string
 *  - storeType?: string
 *  - text?: string
 *  - senderRole?: "buyer" | "seller"
 *  - senderName?: string
 *  - productCard?: any
 *  - orderCard?: any
 *  - autoReply?: boolean (generate seller auto-acknowledgment)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      conversationId,
      buyerEmail,
      buyerName = "Audiophile Buyer",
      storeId = "store-official",
      storeName = "Official Store",
      storeType,
      text = "",
      senderRole = "buyer",
      senderName,
      productCard,
      orderCard,
      autoReply = true,
    } = body;

    if (!buyerEmail && !conversationId) {
      return NextResponse.json(
        { success: false, error: "Buyer email or conversation ID is required." },
        { status: 400 }
      );
    }

    // 1. Resolve or create conversation
    let conversation: DbChatConversation | null = null;
    if (conversationId) {
      conversation = await chatRepo.getConversationById(conversationId);
    }

    if (!conversation && buyerEmail) {
      conversation = await chatRepo.findOrCreateConversation({
        buyerEmail,
        buyerName,
        storeId,
        storeName,
        storeType,
      });
    }

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation could not be found or created." },
        { status: 404 }
      );
    }

    // If request was only to initiate/get conversation without sending message:
    if (!text.trim() && !productCard && !orderCard) {
      return NextResponse.json({
        success: true,
        conversation,
        message: null,
      });
    }

    // 2. Persist sender's message
    const resolvedSenderName =
      senderName ||
      (senderRole === "buyer" ? conversation.buyerName : conversation.storeName);

    const createdMessage = await chatRepo.sendMessage({
      conversationId: conversation.id,
      senderRole,
      senderName: resolvedSenderName,
      senderEmail: senderRole === "buyer" ? conversation.buyerEmail : undefined,
      text: text.trim(),
      productCard,
      orderCard,
    });

    let replyMessage: DbChatMessage | null = null;

    // 3. Routing notifications & auto-replies based on senderRole
    if (senderRole === "seller") {
      // Seller sent a message -> Notify the buyer
      notificationRepo.create({
        recipientEmail: conversation.buyerEmail,
        recipientRole: "buyer",
        type: "chat",
        title: `Pesan Baru dari ${conversation.storeName}`,
        message: text.trim().substring(0, 100),
        actionLink: `/messages?seller=${encodeURIComponent(conversation.storeName)}`,
        unread: true,
      }).catch(() => {});
    } else {
      // Buyer sent a message -> Notify the seller
      notificationRepo.create({
        recipientEmail: "seller",
        recipientRole: "seller",
        storeId: conversation.storeId,
        type: "chat",
        title: `Pesan Baru dari ${conversation.buyerName}`,
        message: text.trim() || (productCard ? `Menanyakan produk: ${productCard.name}` : "Mengirim lampiran"),
        actionLink: `/seller/chat?id=${conversation.id}`,
        unread: true,
      }).catch(() => {});

      // Check Operating Hours & Auto-Reply Rules
      if (autoReply) {
        const storeStatus = await chatSettingsRepo.isStoreOpen(conversation.storeId);
        const settings = await chatSettingsRepo.getSettings(conversation.storeId);

        // Scenario A: Store is CLOSED and Out-of-Hours Auto-Reply is enabled
        if (!storeStatus.isOpen && settings.autoReplyOutOfHours) {
          const autoReplyText =
            settings.outOfHoursMessage ||
            `Halo kak! Terima kasih sudah menghubungi kami. Saat ini toko sedang di luar jam operasional (${storeStatus.scheduleText}). Pesan Anda akan kami balas secepatnya saat toko kembali aktif.`;

          replyMessage = await chatRepo.sendMessage({
            conversationId: conversation.id,
            senderRole: "seller",
            senderName: conversation.storeName,
            text: autoReplyText,
          });

          notificationRepo.create({
            recipientEmail: conversation.buyerEmail,
            recipientRole: "buyer",
            type: "chat",
            title: `Balasan Otomatis dari ${conversation.storeName}`,
            message: autoReplyText.substring(0, 100),
            actionLink: `/messages?seller=${encodeURIComponent(conversation.storeName)}`,
            unread: true,
          }).catch(() => {});
        }
        // Scenario B: Welcome greeting for brand new conversations (if enabled)
        else if (storeStatus.isOpen && settings.welcomeMessageEnabled) {
          const existingMessages = await chatRepo.getMessages(conversation.id);
          // Only trigger if this is the very first inquiry in the conversation
          if (existingMessages.length <= 1) {
            const welcomeText =
              settings.welcomeMessage ||
              `Halo! Selamat datang di ${conversation.storeName}. Ada yang bisa kami bantu seputar produk atau pemesanan?`;

            replyMessage = await chatRepo.sendMessage({
              conversationId: conversation.id,
              senderRole: "seller",
              senderName: conversation.storeName,
              text: welcomeText,
            });
          }
        }
      }
    }

    // Refresh conversation state
    const updatedConversation = await chatRepo.getConversationById(conversation.id);

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
      message: createdMessage,
      replyMessage,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to send message";
    console.error("[Messages API] Error posting message:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
