import { NextResponse } from "next/server";
import { voucherRepo } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal = 0 } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, message: "Silakan masukkan kode voucher." },
        { status: 400 }
      );
    }

    const result = await voucherRepo.validate(code, Number(subtotal) || 0);

    return NextResponse.json({
      success: result.valid,
      ...result,
    });
  } catch (error: any) {
    console.error("[Validate Voucher API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: error.message || "Gagal memvalidasi kode voucher.",
      },
      { status: 500 }
    );
  }
}
