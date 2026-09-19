import { notificationRepo, orderRepo, DbNotification } from "../src/lib/supabase-db";

async function runNotificationSuite() {
  console.log("==========================================================");
  console.log("   TONALZONE NOTIFICATION DATABASE & LIFECYCLE SUITE      ");
  console.log("==========================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}${detail ? ` -> ${detail}` : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` -> Detail: ${detail}` : ""}`);
      process.exitCode = 1;
    }
  }

  const testBuyerEmail = `tester-${Date.now()}@tonalzone.com`;
  const testSellerStoreId = `store-test-${Date.now()}`;
  const testSellerEmail = `seller-${Date.now()}@tonalzone.com`;

  // 1. Zero Dummy Data / Empty State
  console.log("--- 1. Testing Zero Dummy Data & Recipient Isolation ---");
  const initialBuyerNotifs = await notificationRepo.getByRecipient(testBuyerEmail);
  assert(
    initialBuyerNotifs.length === 0,
    "New user account has strictly 0 notifications (No static mock leaks)",
    `Count: ${initialBuyerNotifs.length}`
  );

  const initialSellerNotifs = await notificationRepo.getByRecipient(testSellerEmail, testSellerStoreId);
  assert(
    initialSellerNotifs.length === 0,
    "New seller store has strictly 0 notifications",
    `Count: ${initialSellerNotifs.length}`
  );

  // 2. Direct Notification Creation & Retrieval
  console.log("\n--- 2. Testing Direct Notification Creation & Retrieval ---");
  const testSystemNotif = await notificationRepo.create({
    recipientEmail: testBuyerEmail,
    recipientRole: "buyer",
    type: "system",
    title: "Akun Terverifikasi",
    message: "Selamat datang di TonalZone! Akun Anda telah aktif sepenuhnya.",
    unread: true,
    actionLink: "/profile",
  });

  assert(
    !!testSystemNotif.id && testSystemNotif.title === "Akun Terverifikasi",
    "Notification successfully created in database repository",
    `ID: ${testSystemNotif.id}`
  );

  const buyerNotifsAfterCreation = await notificationRepo.getByRecipient(testBuyerEmail);
  assert(
    buyerNotifsAfterCreation.length === 1 && buyerNotifsAfterCreation[0].id === testSystemNotif.id,
    "Notification correctly retrieved for recipient",
    `Count: ${buyerNotifsAfterCreation.length}, Title: ${buyerNotifsAfterCreation[0].title}`
  );

  // 3. Mark as Read & Mark All as Read
  console.log("\n--- 3. Testing Mark as Read & Mark All as Read ---");
  const markReadSuccess = await notificationRepo.markAsRead(testSystemNotif.id);
  assert(markReadSuccess, "markAsRead returns true for valid notification ID");

  const buyerNotifsAfterRead = await notificationRepo.getByRecipient(testBuyerEmail);
  assert(
    buyerNotifsAfterRead[0].unread === false,
    "Notification status updated to unread: false in repository"
  );

  // Add 2 more unread notifications
  await notificationRepo.create({
    recipientEmail: testBuyerEmail,
    type: "chat",
    title: "Pesan Baru Toko",
    message: "Halo kak, pesanan ready.",
    unread: true,
    actionLink: "/messages",
  });
  await notificationRepo.create({
    recipientEmail: testBuyerEmail,
    type: "promo",
    title: "Voucher Baru",
    message: "Diskon 10% audio.",
    unread: true,
    actionLink: "/promo",
  });

  const updatedAllCount = await notificationRepo.markAllAsRead(testBuyerEmail);
  assert(
    updatedAllCount === 2,
    "markAllAsRead successfully marks all unread notifications for recipient",
    `Marked read: ${updatedAllCount}`
  );

  const buyerNotifsAllRead = await notificationRepo.getByRecipient(testBuyerEmail);
  const remainingUnread = buyerNotifsAllRead.filter((n) => n.unread).length;
  assert(
    remainingUnread === 0,
    "All recipient notifications are now read",
    `Unread count: ${remainingUnread}`
  );

  // 4. Order Lifecycle Trigger Verification
  console.log("\n--- 4. Testing Automatic Order Lifecycle Triggers ---");
  const testOrderId = `ORD-TEST-${Date.now()}`;
  const createdOrder = await orderRepo.create({
    id: testOrderId,
    buyerId: "usr-test-lifecycle",
    buyerName: "Tester Audiophile",
    buyerEmail: testBuyerEmail,
    buyerPhone: "081299998888",
    destinationAddress: "Jl. Sudirman No. 1, Jakarta",
    destinationCity: "Jakarta",
    destinationPostalCode: "12190",
    storeId: testSellerStoreId,
    storeName: "Test Acoustic Labs",
    items: [
      {
        id: "item-test-1",
        orderId: testOrderId,
        productId: "test-iem-1",
        productName: "Tonal Zone IEM Pro",
        brand: "Tonal Zone Labs",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
        price: 1500000,
        quantity: 1,
        itemTotal: 1500000,
      },
    ],
    itemsSubtotal: 1500000,
    shippingFee: 20000,
    insuranceFee: 5000,
    totalAmount: 1525000,
    courierCode: "JNE",
    serviceTier: "YES (Yakin Esok Sampai)",
    paymentMethod: "BCA_VA",
    paymentStatus: "PENDING",
    escrowStatus: "PAYMENT_PENDING",
  });

  assert(!!createdOrder && !!createdOrder.id, "Test order created", createdOrder.id);

  // Verify Checkout Notifications (Buyer + Seller)
  const buyerNotifsPostCheckout = await notificationRepo.getByRecipient(testBuyerEmail);
  const buyerCheckoutNotif = buyerNotifsPostCheckout.find((n) => n.title.includes("Pesanan Berhasil Dibuat"));
  assert(
    !!buyerCheckoutNotif,
    "Buyer received automatic notification on order creation",
    buyerCheckoutNotif?.title
  );

  const sellerNotifsPostCheckout = await notificationRepo.getByRecipient(undefined, testSellerStoreId);
  const sellerOrderNotif = sellerNotifsPostCheckout.find((n) => n.title.includes("Pesanan Baru Masuk"));
  assert(
    !!sellerOrderNotif,
    "Seller received automatic notification on new incoming order",
    sellerOrderNotif?.title
  );

  // Step 4b: Payment Verified (Escrow Holding)
  await orderRepo.markAsPaid(createdOrder.id);
  const buyerNotifsPostPaid = await notificationRepo.getByRecipient(testBuyerEmail);
  const buyerPaidNotif = buyerNotifsPostPaid.find((n) => n.title.includes("Pembayaran Terverifikasi (Escrow Holding)"));
  assert(
    !!buyerPaidNotif,
    "Buyer received payment verification notification with escrow guarantee info",
    buyerPaidNotif?.title
  );

  const sellerNotifsPostPaid = await notificationRepo.getByRecipient(undefined, testSellerStoreId);
  const sellerPaidNotif = sellerNotifsPostPaid.find((n) => n.title.includes("Pesanan Siap Dikirim"));
  assert(
    !!sellerPaidNotif,
    "Seller received notification that payment is locked in escrow & ready to pack",
    sellerPaidNotif?.title
  );

  // Step 4c: Shipment Dispatched (Waybill & Courier)
  await orderRepo.updateShipment(createdOrder.id, "TZ-JNE-99881122", "JNE Express");
  const buyerNotifsPostShip = await notificationRepo.getByRecipient(testBuyerEmail);
  const buyerShipNotif = buyerNotifsPostShip.find((n) => n.title.includes("Pesanan Sedang Dikirim"));
  assert(
    !!buyerShipNotif && buyerShipNotif.message.includes("TZ-JNE-99881122"),
    "Buyer received dispatch notification with real waybill tracking number",
    buyerShipNotif?.message
  );

  // Step 4d: Package Delivered
  await orderRepo.advanceTracking(createdOrder.id, "DELIVERED");
  const buyerNotifsPostDelivered = await notificationRepo.getByRecipient(testBuyerEmail);
  const buyerDeliveredNotif = buyerNotifsPostDelivered.find((n) => n.title.includes("Paket Telah Tiba di Tujuan"));
  assert(
    !!buyerDeliveredNotif,
    "Buyer received package arrival notification prompting inspection",
    buyerDeliveredNotif?.title
  );

  // Step 4e: Confirm Delivery & Escrow Payout Released
  await orderRepo.confirmDeliveryAndReleaseFunds(createdOrder.id);
  const sellerNotifsPostRelease = await notificationRepo.getByRecipient(undefined, testSellerStoreId);
  const sellerReleaseNotif = sellerNotifsPostRelease.find((n) => n.title.includes("Dana Escrow Berhasil Dicairkan"));
  assert(
    !!sellerReleaseNotif,
    "Seller received escrow payout release notification into store balance",
    sellerReleaseNotif?.title
  );

  // 5. Delete & Clear All Notifications
  console.log("\n--- 5. Testing Delete and Clear All ---");
  const buyerListBeforeClear = await notificationRepo.getByRecipient(testBuyerEmail);
  const singleToDelete = buyerListBeforeClear[0];
  const deleteSingleSuccess = await notificationRepo.delete(singleToDelete.id);
  assert(deleteSingleSuccess, "Single notification deleted by ID");

  const clearedCount = await notificationRepo.clearAll(testBuyerEmail);
  assert(clearedCount >= 1, "clearAll removed remaining notifications for user", `Cleared: ${clearedCount}`);

  const buyerListAfterClear = await notificationRepo.getByRecipient(testBuyerEmail);
  assert(
    buyerListAfterClear.length === 0,
    "User notifications list is completely empty after clearAll",
    `Remaining: ${buyerListAfterClear.length}`
  );

  console.log("\n==========================================================");
  console.log(`  VERIFICATION RESULTS: ${passed}/${total} TESTS PASSED  `);
  console.log("==========================================================");

  if (passed === total) {
    console.log("ALL REAL DATABASE NOTIFICATION ENGINE TESTS PASSED!\n");
  } else {
    process.exit(1);
  }
}

runNotificationSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
