import { NextResponse } from "next/server";
import { splitOrderForCheckout, createMidtransSnapTransaction, CartItemCheckoutInput, PaymentMethod } from "@/lib/escrow";
import { orderRepo, productRepo, voucherRepo } from "@/lib/supabase-db";

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

    // --- REAL-TIME INVENTORY & STOCK VALIDATION ---
    for (const item of cartItems) {
      const pId = item.productId || item.id;
      const requestedQty = Number(item.quantity) || 1;
      const availableStock = await productRepo.getStock(pId);

      if (availableStock < requestedQty) {
        const prodName = item.name || item.productName || "Produk pilihan";
        return NextResponse.json(
          {
            success: false,
            error: `Stok produk "${prodName}" tidak mencukupi. Tersedia: ${availableStock} unit, diminta: ${requestedQty} unit.`,
          },
          { status: 400 }
        );
      }
    }

    // --- ATOMIC STOCK DEDUCTION WITH ROLLBACK ---
    const deductedItems: { productId: string; quantity: number }[] = [];
    for (const item of cartItems) {
      const pId = item.productId || item.id;
      const requestedQty = Number(item.quantity) || 1;
      const deductRes = await productRepo.deductStock(pId, requestedQty);
      if (!deductRes.success) {
        // Rollback all items previously deducted in this transaction
        for (const prev of deductedItems) {
          await productRepo.restoreStock(prev.productId, prev.quantity);
        }
        return NextResponse.json(
          { success: false, error: deductRes.error || "Gagal mengalokasikan stok barang." },
          { status: 400 }
        );
      }
      deductedItems.push({ productId: pId, quantity: requestedQty });
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

    if (body.promoCode) {
      voucherRepo.incrementUsage(String(body.promoCode)).catch(() => {});
    }

    // 2. Persist each subOrder in orderRepo
    for (const sub of parentOrder.subOrders) {
      await orderRepo.create({
        id: sub.id,
        parentOrderId: parentOrder.id,
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
        shippingFee: Number(body.shippingFee) >= 0 ? Number(body.shippingFee) : sub.shippingFeeUSD,
        insuranceFee: body.isInsured === false ? 0 : (Number(body.insuranceFee) || sub.insuranceFeeUSD),
        isInsured: body.isInsured !== false && (Boolean(body.isInsured) || sub.insuranceFeeUSD > 0),
        platformFee: Number(body.platformFee) || 0.1,
        platformCommissionRate: 0.03,
        platformCommissionFee: Math.round(sub.itemsSubtotalUSD * 0.03 * 100) / 100,
        netSellerPayout: Math.round((sub.grossAmountUSD - (sub.itemsSubtotalUSD * 0.03)) * 100) / 100,
        totalAmount: isDemoPromo ? 0.0000625 : Math.max(0, sub.itemsSubtotalUSD + (Number(body.shippingFee) >= 0 ? Number(body.shippingFee) : sub.shippingFeeUSD) + (body.isInsured === false ? 0 : (Number(body.insuranceFee) || sub.insuranceFeeUSD)) + (Number(body.platformFee) || 0.1)),
        courierCode: body.courierName || body.courierCode || sub.courierCode || "JNE Express",
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
      orderId: parentOrder.id,
      subOrderId: parentOrder.subOrders[0]?.id || parentOrder.id,
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
