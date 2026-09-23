import { NextResponse } from "next/server";
import { voucherRepo } from "@/lib/supabase-db";

export async function GET() {
  try {
    const vouchers = await voucherRepo.getAll();
    return NextResponse.json({
      success: true,
      count: vouchers.length,
      vouchers,
    });
  } catch (error: any) {
    console.error("[Admin Vouchers API] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat data voucher." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      title,
      description,
      discountType = "PERCENTAGE",
      discountValue,
      minSpend = 0,
      maxDiscount,
      quota = 100,
      startDate,
      expiryDate,
      isActive = true,
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Kode voucher wajib diisi." },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Judul voucher wajib diisi." },
        { status: 400 }
      );
    }

    if (discountValue === undefined || Number(discountValue) < 0) {
      return NextResponse.json(
        { success: false, error: "Nilai diskon harus berupa angka valid >= 0." },
        { status: 400 }
      );
    }

    const created = await voucherRepo.create({
      code: String(code).trim().toUpperCase(),
      title: String(title).trim(),
      description: description ? String(description).trim() : undefined,
      discountType,
      discountValue: Number(discountValue),
      minSpend: Number(minSpend) || 0,
      maxDiscount: maxDiscount !== undefined && maxDiscount !== "" ? Number(maxDiscount) : undefined,
      quota: Number(quota) || 100,
      startDate: startDate || undefined,
      expiryDate: expiryDate || undefined,
      isActive: Boolean(isActive),
    });

    return NextResponse.json({
      success: true,
      message: "Voucher / kode redeem berhasil dibuat.",
      voucher: created,
    });
  } catch (error: any) {
    console.error("[Admin Vouchers API] POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat voucher." },
      { status: 400 }
    );
  }
}
