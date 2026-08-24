import { NextResponse } from "next/server";
import { orderRepo } from "@/lib/supabase-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updated = await orderRepo.confirmDeliveryAndReleaseFunds(id);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order #${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Konfirmasi berhasil! Dana escrow pesanan #${id} sebesar $${updated.totalAmount} telah dicairkan ke saldo penjual (${updated.storeName}).`,
      order: updated,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to confirm delivery and release funds";
    console.error("[Orders API] Error releasing escrow funds:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
