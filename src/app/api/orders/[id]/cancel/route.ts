import { NextResponse } from "next/server";
import { orderRepo } from "@/lib/supabase-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason?.trim() || "Dibatalkan oleh pembeli";
    const cancelledBy = (body.cancelledBy === "SELLER" ? "SELLER" : "BUYER") as "BUYER" | "SELLER";

    const result = await orderRepo.cancelOrder(id, reason, cancelledBy);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal membatalkan pesanan." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pesanan #${id} berhasil dibatalkan. Dana escrow dikembalikan 100%.`,
      order: result.order,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Terjadi kesalahan server.";
    console.error("[Cancel Order API Error]:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
