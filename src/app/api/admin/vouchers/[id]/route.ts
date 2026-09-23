import { NextResponse } from "next/server";
import { voucherRepo } from "@/lib/supabase-db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await voucherRepo.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Voucher tidak ditemukan." },
        { status: 404 }
      );
    }

    const payload: Record<string, any> = {};
    if (body.code !== undefined) payload.code = String(body.code).trim().toUpperCase();
    if (body.title !== undefined) payload.title = String(body.title).trim();
    if (body.description !== undefined) payload.description = String(body.description).trim();
    if (body.discountType !== undefined) payload.discountType = body.discountType;
    if (body.discountValue !== undefined) payload.discountValue = Number(body.discountValue);
    if (body.minSpend !== undefined) payload.minSpend = Number(body.minSpend);
    if (body.maxDiscount !== undefined) {
      payload.maxDiscount = body.maxDiscount === "" || body.maxDiscount === null ? undefined : Number(body.maxDiscount);
    }
    if (body.quota !== undefined) payload.quota = Number(body.quota);
    if (body.startDate !== undefined) payload.startDate = body.startDate || undefined;
    if (body.expiryDate !== undefined) payload.expiryDate = body.expiryDate || undefined;
    if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);

    const updated = await voucherRepo.update(id, payload);

    return NextResponse.json({
      success: true,
      message: "Voucher berhasil diperbarui.",
      voucher: updated,
    });
  } catch (error: any) {
    console.error("[Admin Voucher ID API] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui voucher." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await voucherRepo.delete(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Voucher tidak ditemukan atau sudah terhapus." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Voucher berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("[Admin Voucher ID API] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus voucher." },
      { status: 500 }
    );
  }
}
