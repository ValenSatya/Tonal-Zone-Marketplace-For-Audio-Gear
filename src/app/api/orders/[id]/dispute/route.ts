import { NextResponse } from "next/server";
import { orderRepo } from "@/lib/supabase-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason = "Audio Defect / Channel Imbalance" } = body;

    const updated = await orderRepo.disputeOrder(id, reason);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order #${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Komplain pesanan #${id} telah diajukan. Dana escrow sebesar $${updated.totalAmount} DIBEKUKAN sementara tim teknisi TonalZone melakukan mediasi akustik.`,
      order: updated,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to submit order dispute";
    console.error("[Orders API] Error submitting dispute:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
