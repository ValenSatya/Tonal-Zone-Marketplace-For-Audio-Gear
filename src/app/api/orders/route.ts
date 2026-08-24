import { NextResponse } from "next/server";
import { orderRepo } from "@/lib/supabase-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const storeId = searchParams.get("storeId");

    let orders;
    if (storeId) {
      orders = await orderRepo.findByStoreId(storeId);
    } else if (email) {
      orders = await orderRepo.findByBuyerEmail(email);
    } else {
      orders = await orderRepo.getAll();
    }

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch orders";
    console.error("[Orders API] Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
