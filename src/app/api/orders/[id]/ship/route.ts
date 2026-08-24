import { NextResponse } from "next/server";
import { orderRepo } from "@/lib/supabase-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { waybillNumber, courierCode } = body;

    if (!waybillNumber || !waybillNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "Nomor resi pengiriman (Waybill / Tracking Number) wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await orderRepo.updateShipment(id, waybillNumber, courierCode);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order #${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Resi ${waybillNumber} berhasil diinput. Status pesanan #${id} kini DALAM PENGIRIMAN (IN TRANSIT).`,
      order: updated,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to update shipping waybill";
    console.error("[Orders API] Error updating waybill:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
