import { NextResponse } from "next/server";
import { orderRepo } from "@/lib/supabase-db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await orderRepo.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order #${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch order details";
    console.error("[Orders API] Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
