import { NextResponse } from "next/server";
import { returnRepo } from "@/lib/supabase-db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let returnReq = await returnRepo.findById(id);

    // If not found by return ID, attempt finding by order ID
    if (!returnReq) {
      returnReq = await returnRepo.findByOrderId(id);
    }

    if (!returnReq) {
      return NextResponse.json(
        { success: false, error: "Pengajuan retur tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, returnRequest: returnReq });
  } catch (error: any) {
    console.error("Error fetching return request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data retur." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { returnWaybillNumber, returnCourier } = body;

    if (!returnWaybillNumber || !returnCourier) {
      return NextResponse.json(
        { success: false, error: "Nomor resi dan kurir pengembalian wajib diisi." },
        { status: 400 }
      );
    }

    let returnReq = await returnRepo.findById(id);
    if (!returnReq) {
      returnReq = await returnRepo.findByOrderId(id);
    }

    if (!returnReq) {
      return NextResponse.json(
        { success: false, error: "Pengajuan retur tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await returnRepo.submitReturnShipment(
      returnReq.id,
      returnWaybillNumber,
      returnCourier
    );

    return NextResponse.json({
      success: true,
      message: "Resi pengiriman retur berhasil disimpan.",
      returnRequest: updated,
    });
  } catch (error: any) {
    console.error("Error updating return shipment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui pengiriman retur." },
      { status: 500 }
    );
  }
}
