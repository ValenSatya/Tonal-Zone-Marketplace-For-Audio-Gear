import { NextResponse } from "next/server";
import { orderRepo, TrackingStatusCode } from "@/lib/supabase-db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tracking = await orderRepo.getTracking(id);

    if (!tracking) {
      return NextResponse.json(
        { success: false, error: `Pelacakan untuk pesanan #${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tracking,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal mengambil data pelacakan pengiriman.";
    console.error("[Tracking API] GET Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action, status } = body;

    let targetStatus: TrackingStatusCode | undefined = undefined;
    if (action === "deliver" || status === "DELIVERED") {
      targetStatus = "DELIVERED";
    } else if (status) {
      targetStatus = status as TrackingStatusCode;
    }

    const updated = await orderRepo.advanceTracking(id, targetStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Pesanan #${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    const tracking = await orderRepo.getTracking(id);

    return NextResponse.json({
      success: true,
      message: `Status pelacakan resi #${updated.waybillNumber || id} berhasil diperbarui.`,
      order: updated,
      tracking,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal memperbarui status pelacakan resi.";
    console.error("[Tracking API] POST Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
