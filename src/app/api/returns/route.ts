import { NextResponse } from "next/server";
import { returnRepo, orderRepo } from "@/lib/supabase-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const orderId = searchParams.get("orderId");

    if (orderId) {
      const returnReq = await returnRepo.findByOrderId(orderId);
      return NextResponse.json({ success: true, returnRequest: returnReq });
    }

    if (email) {
      const returns = await returnRepo.findByBuyerEmail(email);
      return NextResponse.json({ success: true, returns });
    }

    const all = await returnRepo.getAll();
    return NextResponse.json({ success: true, returns: all });
  } catch (error: any) {
    console.error("Error fetching returns:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch returns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      buyerEmail,
      buyerName,
      buyerPhone,
      reason,
      description,
      evidenceImages,
      unboxingVideoUrl,
      unboxingVideoType,
      requestedSolution,
      shippingFeeBearer,
    } = body;

    if (!orderId || !reason || !description) {
      return NextResponse.json(
        { success: false, error: "orderId, reason, dan description wajib diisi." },
        { status: 400 }
      );
    }

    if (!unboxingVideoUrl || !String(unboxingVideoUrl).trim()) {
      return NextResponse.json(
        { success: false, error: "Wajib menyertakan video unboxing (unggah file atau tautan) untuk validasi garansi IEM." },
        { status: 400 }
      );
    }

    // Check if return already exists for this order
    const existing = await returnRepo.findByOrderId(orderId);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Pengajuan retur untuk pesanan ini sudah pernah dibuat.", returnRequest: existing },
        { status: 409 }
      );
    }

    // Fetch order details
    const order = await orderRepo.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    const firstItem = order.items?.[0];
    const newReturn = await returnRepo.create({
      orderId: order.id,
      buyerId: order.buyerId || "usr-buyer",
      buyerName: buyerName || order.buyerName || "Pembeli",
      buyerEmail: buyerEmail || order.buyerEmail || "buyer@tonalzone.com",
      buyerPhone: buyerPhone || order.buyerPhone || "",
      storeId: order.storeId,
      storeName: order.storeName,
      productId: firstItem?.productId || "prod-generic",
      productName: firstItem?.productName || "Audiophile IEM",
      productImage: firstItem?.image || "/hero-blessing-3.jpg",
      productPrice: firstItem?.price || order.totalAmount,
      quantity: firstItem?.quantity || 1,
      selectedVariant: firstItem?.selectedVariant || "Standard",
      reason,
      description,
      evidenceImages: Array.isArray(evidenceImages) && evidenceImages.length > 0 ? evidenceImages : ["/hero-blessing-3.jpg"],
      unboxingVideoUrl: String(unboxingVideoUrl).trim(),
      unboxingVideoType: unboxingVideoType || "upload",
      requestedSolution: requestedSolution === "REPLACEMENT" ? "REPLACEMENT" : "REFUND",
      shippingFeeBearer: shippingFeeBearer === "BUYER" ? "BUYER" : "SELLER",
      refundAmount: order.totalAmount,
    });

    return NextResponse.json({
      success: true,
      message: "Pengajuan retur berhasil dibuat.",
      returnRequest: newReturn,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating return request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat pengajuan retur." },
      { status: 500 }
    );
  }
}
