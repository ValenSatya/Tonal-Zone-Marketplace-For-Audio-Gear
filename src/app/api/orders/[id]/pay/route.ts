import { NextResponse } from "next/server";
import { orderRepo } from "@/lib/supabase-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const updated = await orderRepo.markAsPaid(id);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order #${id} could not be updated.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment successful. Funds for order #${id} are securely held in TonalZone Escrow.`,
      order: updated,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to process order payment";
    console.error("[Orders API] Error processing payment:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
