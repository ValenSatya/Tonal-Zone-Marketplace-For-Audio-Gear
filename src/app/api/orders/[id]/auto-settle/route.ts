import { NextResponse } from "next/server";
import { orderRepo } from "@/lib/supabase-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await orderRepo.simulateAutoSettle(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Pesanan #${id} tidak ditemukan atau belum dalam status DELIVERED.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `[Auto-Settle Sukses] Batas waktu inspeksi 48 jam berakhir. Dana escrow pesanan #${id} otomatis dicairkan ke dompet seller (${order.storeName}).`,
      order,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal memproses auto-settle";
    console.error("[Auto-Settle API] Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
