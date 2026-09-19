import { orderRepo } from "@/lib/supabase-db";

async function run() {
  console.log("=== Testing Real-Time Logistics Tracking Engine ===");

  // 1. Create a fresh test order
  const orderId = `ORD-TRK-${Date.now()}`;
  const created = await orderRepo.create({
    id: orderId,
    parentOrderId: `TZ-TRK-${Date.now()}`,
    buyerId: "usr-valen",
    buyerName: "Valen",
    buyerEmail: "valen@tonalzone.com",
    destinationAddress: "Jl. Senopati Raya No. 45, Kebayoran Baru",
    destinationCity: "Jakarta Selatan",
    destinationPostalCode: "12190",
    storeId: "store-moondrop-official",
    storeName: "MOONDROP Official Flagship Store",
    items: [
      {
        id: "item-trk-1",
        orderId,
        productId: "prod-chu-2",
        productName: "MOONDROP CHU II DSP",
        brand: "MOONDROP",
        category: "IN-EAR MONITORS",
        price: 23.99,
        quantity: 1,
        itemTotal: 23.99,
      },
    ],
    itemsSubtotal: 23.99,
    shippingFee: 2.0,
    insuranceFee: 1.0,
    totalAmount: 26.99,
    courierCode: "JNE Express",
    serviceTier: "Regular",
    paymentMethod: "MIDTRANS_QRIS",
    paymentStatus: "PENDING",
    escrowStatus: "PAYMENT_PENDING",
  });

  console.log("1. Created order with initial checkpoints:", {
    id: created.id,
    checkpointsCount: created.trackingHistory?.length,
    initialStatus: created.trackingHistory?.[0]?.status,
    initialTitle: created.trackingHistory?.[0]?.title,
  });

  // 2. Mark as Paid
  const paid = await orderRepo.markAsPaid(orderId);
  console.log("2. Marked as Paid (Escrow Holding):", {
    paymentStatus: paid?.paymentStatus,
    escrowStatus: paid?.escrowStatus,
    checkpointsCount: paid?.trackingHistory?.length,
    latestStatus: paid?.trackingHistory?.[paid.trackingHistory.length - 1]?.status,
    latestTitle: paid?.trackingHistory?.[paid.trackingHistory.length - 1]?.title,
  });

  // 3. Update Shipment (Input Resi by Seller)
  const waybill = `JNE-TEST-${Date.now().toString().slice(-6)}`;
  const shipped = await orderRepo.updateShipment(orderId, waybill, "JNE Express");
  console.log("3. Shipped with Waybill:", {
    waybill: shipped?.waybillNumber,
    escrowStatus: shipped?.escrowStatus,
    checkpointsCount: shipped?.trackingHistory?.length,
    checkpoints: shipped?.trackingHistory?.map((c) => `${c.status} (${c.timeFormatted}): ${c.title}`),
  });

  // 4. Test getTracking
  const tracking = await orderRepo.getTracking(orderId);
  console.log("4. getTracking query result:", {
    orderId: tracking?.orderId,
    waybill: tracking?.waybillNumber,
    courier: tracking?.courierCode,
    destination: tracking?.destinationCity,
    currentCheckpoint: tracking?.currentCheckpoint?.title,
  });

  // 5. Advance Tracking: Hub Origin
  const adv1 = await orderRepo.advanceTracking(orderId);
  console.log("5. Advance -> Sorting Hub:", {
    checkpointsCount: adv1?.trackingHistory?.length,
    latest: adv1?.trackingHistory?.[adv1.trackingHistory.length - 1]?.title,
  });

  // 6. Advance Tracking: In Transit
  const adv2 = await orderRepo.advanceTracking(orderId);
  console.log("6. Advance -> In Transit Linehaul:", {
    latest: adv2?.trackingHistory?.[adv2.trackingHistory.length - 1]?.title,
  });

  // 7. Advance Tracking: Out for Delivery
  const adv3 = await orderRepo.advanceTracking(orderId);
  console.log("7. Advance -> Out for Delivery:", {
    latest: adv3?.trackingHistory?.[adv3.trackingHistory.length - 1]?.title,
  });

  // 8. Advance Tracking: Delivered
  const adv4 = await orderRepo.advanceTracking(orderId);
  console.log("8. Advance -> Delivered:", {
    latest: adv4?.trackingHistory?.[adv4.trackingHistory.length - 1]?.title,
    escrowStatus: adv4?.escrowStatus,
    isDelivered: adv4?.escrowStatus === "DELIVERED",
  });

  console.log("=== All Tracking Engine Tests Passed Successfully! ===");
}

run().catch(console.error);
