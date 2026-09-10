import { NextResponse } from "next/server";
import { productRepo } from "@/lib/supabase-db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/seller/products/[id]
 * Fetch single product detail.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    const product = await productRepo.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Produk tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("[API /api/seller/products/[id] GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/seller/products/[id]
 * Quick update product details (Price, Stock, Status, Name, Images).
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const existing = await productRepo.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Produk tidak ditemukan di database." }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (body.priceUSD !== undefined || body.price !== undefined) {
      const p = Number(body.priceUSD ?? body.price);
      if (!isNaN(p) && p >= 0) updates.price = p;
    }

    if (body.stock !== undefined) {
      const s = Number(body.stock);
      if (!isNaN(s) && s >= 0) updates.stock = s;
    }

    if (body.name && typeof body.name === "string" && body.name.trim().length > 0) {
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description;
    }

    if (body.status && ["APPROVED", "PENDING", "REJECTED", "SUSPENDED"].includes(body.status)) {
      updates.status = body.status;
    }

    if (Array.isArray(body.images) && body.images.length > 0) {
      updates.images = body.images;
    }

    const updated = await productRepo.update(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Gagal memperbarui produk di database." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Perubahan produk berhasil disimpan!",
      product: updated,
    });
  } catch (error: any) {
    console.error("[API /api/seller/products/[id] PATCH] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/seller/products/[id]
 * Delete a product from seller's catalog in Supabase.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    const existing = await productRepo.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Produk tidak ditemukan." }, { status: 404 });
    }

    const deleted = await productRepo.delete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Gagal menghapus produk dari database." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus dari etalase toko.",
      id,
    });
  } catch (error: any) {
    console.error("[API /api/seller/products/[id] DELETE] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
