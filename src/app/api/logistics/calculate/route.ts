import { NextResponse } from "next/server";
import { calculateStoreShipping, calculateMultiVendorShipping, AudioItemForLogistics } from "@/lib/logistics";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destinationCity, destinationCountry, storeOrders, singleStoreOrder } = body;

    if (!destinationCity) {
      return NextResponse.json(
        { success: false, error: "destinationCity is required" },
        { status: 400 }
      );
    }

    // Mode A: Multi-Vendor Split-Shipment Request
    if (storeOrders && Array.isArray(storeOrders) && storeOrders.length > 0) {
      const result = calculateMultiVendorShipping({
        destinationCity,
        destinationCountry: destinationCountry || "Indonesia",
        storeOrders,
      });

      return NextResponse.json({
        success: true,
        mode: "MULTI_VENDOR",
        data: result,
      });
    }

    // Mode B: Single Store Shipping Request
    if (singleStoreOrder) {
      const { storeId, storeName, originCity, items, forceWoodPacking } = singleStoreOrder;
      if (!originCity || !items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { success: false, error: "originCity and items array are required for single store order" },
          { status: 400 }
        );
      }

      const result = calculateStoreShipping({
        storeId,
        storeName,
        originCity,
        destinationCity,
        items: items as AudioItemForLogistics[],
        forceWoodPacking: Boolean(forceWoodPacking),
      });

      return NextResponse.json({
        success: true,
        mode: "SINGLE_STORE",
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: "Provide either 'storeOrders' array or 'singleStoreOrder' object." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal logistics calculation error";
    console.error("Logistics calculation error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
