import { NextResponse } from "next/server";
import { splitOrderForCheckout, createMidtransSnapTransaction, CartItemCheckoutInput, PaymentMethod } from "@/lib/escrow";
import { orderRepo } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      destinationAddress,
      destinationCity,
      destinationPostalCode,
      paymentMethod = "MIDTRANS_QRIS" as PaymentMethod,
      cartItems,
      storeCourierSelections,
    } = body;

    // Validation
    if (!buyerEmail || !destinationAddress || !destinationCity) {
      return NextResponse.json(
        { success: false, error: "Buyer email, shipping address, and city are required." },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty. Please select products to checkout." },
        { status: 400 }
      );
    }

    // 1. Split order by Store & compute shipping + platform escrow fees
    const parentOrder = splitOrderForCheckout({
      buyerId: buyerId || `usr-${Date.now()}`,
      buyerName: buyerName || "Audiophile Collector",
      buyerEmail,
      buyerPhone: buyerPhone || "08123456789",
      destinationAddress,
      destinationCity,
      destinationPostalCode: destinationPostalCode || "12190",
      paymentMethod,
      cartItems: cartItems as CartItemCheckoutInput[],
      storeCourierSelections,
    });

    const isDemoPromo = Boolean(body.isDemoRp1) || ["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(String(body.promoCode || "").toUpperCase());
    if (isDemoPromo) {
      parentOrder.totalGrossAmountIDR = 1;
      parentOrder.totalGrossAmountUSD = 0.0000625;
      for (const sub of parentOrder.subOrders) {
        sub.grossAmountIDR = 1;
        sub.grossAmountUSD = 0.0000625;
      }
    }

    // 2. Persist each subOrder in orderRepo
    for (const sub of parentOrder.subOrders) {
      await orderRepo.create({
        id: sub.id,
        buyerId: parentOrder.buyerId,
        buyerName: parentOrder.buyerName,
        buyerEmail: parentOrder.buyerEmail,
        buyerPhone: parentOrder.buyerPhone,
        destinationAddress: parentOrder.destinationAddress,
        destinationCity: parentOrder.destinationCity,
        destinationPostalCode: parentOrder.destinationPostalCode,
        storeId: sub.storeId,
        storeName: sub.storeName,
        items: sub.items.map((it) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          orderId: sub.id,
          productId: it.productId,
          productName: it.productName,
          brand: it.brand,
          category: it.category,
          price: it.priceUSD,
          quantity: it.quantity,
          selectedVariant: it.selectedVariant,
          image: it.image,
          itemTotal: it.itemTotalUSD,
        })),
        itemsSubtotal: sub.itemsSubtotalUSD,
        shippingFee: sub.shippingFeeUSD,
        insuranceFee: sub.insuranceFeeUSD,
        totalAmount: sub.grossAmountUSD,
        courierCode: sub.courierCode,
        serviceTier: sub.serviceTier,
        paymentMethod: parentOrder.paymentMethod,
        paymentStatus: "PENDING",
        escrowStatus: "PAYMENT_PENDING",
      });
    }

    // 3. Generate Midtrans Snap Token
    const snapResult = await createMidtransSnapTransaction(parentOrder);
    parentOrder.midtransSnapToken = snapResult.snapToken;
    parentOrder.midtransRedirectUrl = snapResult.redirectUrl;

    return NextResponse.json({
      success: true,
      message: `Order created successfully! Split into ${parentOrder.subOrders.length} merchant package(s).`,
      order: parentOrder,
      orderId: parentOrder.subOrders[0]?.id || parentOrder.id,
      snapToken: snapResult.snapToken,
      redirectUrl: snapResult.redirectUrl,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to initiate multi-vendor checkout.";
    console.error("Create order checkout error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
