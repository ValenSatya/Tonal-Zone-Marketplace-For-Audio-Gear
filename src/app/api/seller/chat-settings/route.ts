import { NextResponse } from "next/server";
import { chatSettingsRepo } from "@/lib/supabase-db";

/**
 * GET /api/seller/chat-settings
 * Query parameters:
 *  - storeId: string (or default to current logged-in store)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId") || "store-official";

    const settings = await chatSettingsRepo.getSettings(storeId);
    const liveStatus = await chatSettingsRepo.isStoreOpen(storeId);

    return NextResponse.json({
      success: true,
      settings,
      liveStatus,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch chat settings";
    console.error("[Seller Chat Settings API] Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

/**
 * POST / PUT /api/seller/chat-settings
 * Body:
 *  - storeId: string
 *  - templates?: DbChatTemplate[]
 *  - operatingHours?: { enabled: boolean; timezone: string; schedule: DbOperatingHoursSchedule[] }
 *  - autoReplyOutOfHours?: boolean
 *  - outOfHoursMessage?: string
 *  - welcomeMessageEnabled?: boolean
 *  - welcomeMessage?: string
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId = "store-official", ...updates } = body;

    const updated = await chatSettingsRepo.updateSettings(storeId, updates);
    const liveStatus = await chatSettingsRepo.isStoreOpen(storeId);

    return NextResponse.json({
      success: true,
      message: "Pengaturan chat dan jam operasional berhasil diperbarui.",
      settings: updated,
      liveStatus,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to save chat settings";
    console.error("[Seller Chat Settings API] Error saving settings:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
