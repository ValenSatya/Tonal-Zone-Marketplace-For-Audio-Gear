import { NextResponse } from "next/server";
import { notificationRepo, DbNotification } from "@/lib/supabase-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || undefined;
    const storeId = searchParams.get("storeId") || undefined;

    const notifications = await notificationRepo.getByRecipient(email, storeId);
    const unreadCount = notifications.filter((n) => n.unread).length;

    return NextResponse.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal mengambil daftar notifikasi.";
    console.error("[Notifications API] GET Error:", error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipientEmail = "all",
      recipientRole,
      storeId,
      type = "system",
      title,
      message,
      actionLink = "/orders",
      meta,
      unread = true,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Judul (title) dan pesan (message) notifikasi wajib diisi." },
        { status: 400 }
      );
    }

    const created = await notificationRepo.create({
      recipientEmail,
      recipientRole,
      storeId,
      type,
      title,
      message,
      unread,
      actionLink,
      meta,
    });

    return NextResponse.json({
      success: true,
      notification: created,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal membuat notifikasi.";
    console.error("[Notifications API] POST Error:", error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, id, email, storeId } = body;

    if (action === "markAsRead" && id) {
      const success = await notificationRepo.markAsRead(id);
      return NextResponse.json({ success });
    }

    if (action === "markAllAsRead") {
      const updatedCount = await notificationRepo.markAllAsRead(email, storeId);
      return NextResponse.json({ success: true, updatedCount });
    }

    return NextResponse.json(
      { success: false, error: "Aksi (action) tidak valid. Gunakan 'markAsRead' atau 'markAllAsRead'." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal memperbarui status notifikasi.";
    console.error("[Notifications API] PATCH Error:", error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const actionParam = searchParams.get("action");
    const emailParam = searchParams.get("email") || undefined;
    const storeIdParam = searchParams.get("storeId") || undefined;

    // Also support JSON body if sent
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const id = idParam || body.id;
    const action = actionParam || body.action || (id ? "delete" : "clearAll");
    const email = emailParam || body.email;
    const storeId = storeIdParam || body.storeId;

    if (action === "delete" && id) {
      const success = await notificationRepo.delete(id);
      return NextResponse.json({ success });
    }

    if (action === "clearAll") {
      const deletedCount = await notificationRepo.clearAll(email, storeId);
      return NextResponse.json({ success: true, deletedCount });
    }

    return NextResponse.json(
      { success: false, error: "Aksi (action) tidak valid atau ID notifikasi tidak disertakan." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal menghapus notifikasi.";
    console.error("[Notifications API] DELETE Error:", error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
