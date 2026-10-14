import {
  userRepo,
  storeRepo,
  brandRepo,
  categoryRepo,
  productRepo,
  orderRepo,
  returnRepo,
  payoutRepo,
  reviewRepo,
  voucherRepo,
  notificationRepo,
  chatRepo,
} from "../src/lib/supabase-db";
import { fetchProductByIdFromDb } from "../src/lib/products-db";

interface TestReport {
  domain: string;
  name: string;
  passed: boolean;
  detail?: string;
}

const reports: TestReport[] = [];

function assert(domain: string, name: string, condition: boolean, detail?: string) {
  reports.push({
    domain,
    name,
    passed: Boolean(condition),
    detail: detail || (condition ? "OK" : "Assertion failed"),
  });
  const symbol = condition ? "[PASS]" : "[FAIL]";
  console.log(`${symbol} [${domain}] ${name}${detail ? ` -> ${detail}` : ""}`);
}

async function runComprehensiveCrudCheck() {
  console.log("================================================================================");
  console.log("    TONALZONE COMPREHENSIVE END-TO-END CRUD & DATA VERIFICATION SUITE           ");
  console.log("================================================================================\n");

  const runId = Date.now();

  // ==========================================================================================
  // 1. PRODUCT CRUD (Supabase database with Foreign Key validation)
  // ==========================================================================================
  console.log("=== 1. TESTING PRODUCT CRUD ===");
  const testProdId = `prod-crud-${runId}`;
  let createdProduct: any = null;

  try {
    // Ensure valid Brand and Category records exist in Supabase
    const brand = await brandRepo.upsert("MOONDROP");
    const category = await categoryRepo.upsert("IN-EAR MONITORS");
    const store = await storeRepo.findById("store-moondrop-official");

    // 1A. CREATE PRODUCT
    createdProduct = await productRepo.create({
      id: testProdId,
      name: `Moondrop Test IEM MK-${runId.toString().slice(-4)}`,
      storeId: store?.id || "store-moondrop-official",
      brandId: brand.id,
      categoryId: category.id,
      description: "<!--TZ_SPECS:{\"driverType\":\"1DD+2BA\",\"impedance\":\"16Ω\"}-->\n\nHigh fidelity in-ear monitor for acoustic testing.",
      price: 99.5,
      stock: 25,
      experienceLevel: "ENTHUSIAST",
      soundSignature: "NEUTRAL",
      images: ["/images/chu3-preview-1.webp"],
    });

    assert("PRODUCT", "Create Product in Database", Boolean(createdProduct && createdProduct.id === testProdId), `Created ID: ${createdProduct?.id}`);

    // 1B. READ PRODUCT (Single & Catalog)
    const readProd = await productRepo.findById(testProdId);
    assert("PRODUCT", "Read Product by ID via Repo", Boolean(readProd && readProd.name.includes("Moondrop Test IEM")), `Found: ${readProd?.name}`);

    const catalogProd = await fetchProductByIdFromDb(testProdId, true);
    assert("PRODUCT", "Read Product via Storefront Catalog Engine", Boolean(catalogProd && Number(catalogProd.price) === 99.5), `Catalog Price: $${catalogProd?.price}, Stock: ${catalogProd?.stock}`);

    // 1C. UPDATE PRODUCT (Price & Stock & Name)
    const updatedProd = await productRepo.update(testProdId, {
      price: 89.0,
      stock: 20,
      name: `Updated Moondrop Test IEM MK-${runId.toString().slice(-4)}`,
    });
    assert("PRODUCT", "Update Product (Price & Stock & Name)", Boolean(updatedProd && Number(updatedProd.price) === 89.0 && Number(updatedProd.stock) === 20), `New Price: $${updatedProd?.price}, New Stock: ${updatedProd?.stock}`);

    // 1D. DELETE PRODUCT
    const deleteSuccess = await productRepo.delete(testProdId);
    assert("PRODUCT", "Delete Product from Database", Boolean(deleteSuccess), `Delete result: ${deleteSuccess}`);

    const verifyDeleted = await productRepo.findById(testProdId);
    assert("PRODUCT", "Verify Product is Deleted (404/null)", verifyDeleted === null, `Expected null, got: ${verifyDeleted?.id || "null"}`);
  } catch (err: any) {
    assert("PRODUCT", "Product CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 2. USER ADDRESS CRUD
  // ==========================================================================================
  console.log("\n=== 2. TESTING USER ADDRESS CRUD ===");
  const testUserEmail = `user.test.${runId}@tonalzone.id`;
  let addr1Id = "";
  let addr2Id = "";

  try {
    // 2A. CREATE FIRST ADDRESS (Auto-Default)
    const addr1 = await userRepo.saveAddress(testUserEmail, {
      recipientName: "Test User",
      phone: "081234567890",
      street: "Jl. Sudirman 100",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12190",
      country: "Indonesia",
      isDefault: true,
      label: "Kantor",
    });
    addr1Id = addr1.id;
    assert("ADDRESS", "Create Address (Auto-Default)", Boolean(addr1 && addr1.isDefault === true), `ID: ${addr1.id}, Default: ${addr1.isDefault}`);

    // 2B. CREATE SECOND ADDRESS
    const addr2 = await userRepo.saveAddress(testUserEmail, {
      recipientName: "Test User Home",
      phone: "081234567891",
      street: "Jl. Gatot Subroto 50",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12930",
      country: "Indonesia",
      isDefault: false,
      label: "Rumah",
    });
    addr2Id = addr2.id;
    assert("ADDRESS", "Create Second Address (Non-Default)", Boolean(addr2 && addr2.isDefault === false), `ID: ${addr2.id}`);

    // 2C. READ ADDRESSES
    const addresses = await userRepo.getAddresses(testUserEmail);
    assert("ADDRESS", "Read Addresses List", addresses.length === 2, `Total addresses: ${addresses.length}`);

    // 2D. UPDATE ADDRESS & SET DEFAULT
    await userRepo.saveAddress(testUserEmail, {
      id: addr2Id,
      recipientName: "Test User Home",
      phone: "081234567891",
      city: "Jakarta Selatan",
      postalCode: "12930",
      street: "Jl. Gatot Subroto 52 (Updated)",
    });
    await userRepo.setDefaultAddress(testUserEmail, addr2Id);

    const defaultAddr = await userRepo.getDefaultAddress(testUserEmail);
    assert("ADDRESS", "Update & Set Default Address", Boolean(defaultAddr && defaultAddr.id === addr2Id && defaultAddr.street.includes("Updated")), `Current default: ${defaultAddr?.label} - ${defaultAddr?.street}`);

    // 2E. DELETE ADDRESS
    await userRepo.deleteAddress(testUserEmail, addr1Id);
    const remainingAddrs = await userRepo.getAddresses(testUserEmail);
    assert("ADDRESS", "Delete Address", remainingAddrs.length === 1 && remainingAddrs[0].id === addr2Id, `Remaining count: ${remainingAddrs.length}`);
  } catch (err: any) {
    assert("ADDRESS", "Address CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 3. STORE PROFILE & SELLER SETTINGS CRUD
  // ==========================================================================================
  console.log("\n=== 3. TESTING STORE PROFILE CRUD ===");
  try {
    const moondropStore = await storeRepo.findById("store-moondrop-official");
    assert("STORE", "Read Store Profile", Boolean(moondropStore && moondropStore.storeName.includes("MOONDROP")), `Store: ${moondropStore?.storeName}, Type: ${moondropStore?.storeType}`);

    // Update store description
    const originalDesc = moondropStore?.description || "";
    const updatedStore = await storeRepo.update("store-moondrop-official", {
      description: `${originalDesc} [Audit Verified ${runId}]`,
    });
    assert("STORE", "Update Store Profile", Boolean(updatedStore && updatedStore.description?.includes(String(runId))), `Description updated with timestamp`);

    // Restore original description
    await storeRepo.update("store-moondrop-official", { description: originalDesc });
  } catch (err: any) {
    assert("STORE", "Store CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 4. ORDER CRUD & ESCROW LIFECYCLE
  // ==========================================================================================
  console.log("\n=== 4. TESTING ORDER CRUD & ESCROW LIFECYCLE ===");
  const testOrderId = `ORD-CRUD-${runId}`;
  const testOrderBuyerEmail = `buyer.crud.${runId}@audiophile.net`;

  try {
    // 4A. CREATE ORDER
    const createdOrder = await orderRepo.create({
      id: testOrderId,
      buyerId: `usr-${runId}`,
      buyerName: "Audit Test Buyer",
      buyerEmail: testOrderBuyerEmail,
      buyerPhone: "081299998888",
      destinationAddress: "Jl. Jenderal Sudirman No. 1",
      destinationCity: "Jakarta Pusat",
      destinationPostalCode: "10220",
      storeId: "store-moondrop-official",
      storeName: "MOONDROP Official Flagship Store",
      items: [
        {
          id: `item-${runId}`,
          orderId: testOrderId,
          productId: "prod-chu3",
          productName: "Moondrop CHU III",
          brand: "MOONDROP",
          category: "IN-EAR MONITORS",
          price: 24.99,
          quantity: 1,
          selectedVariant: "3.5mm Standard",
          image: "/images/chu3-preview-1.webp",
          itemTotal: 24.99,
        },
      ],
      itemsSubtotal: 24.99,
      shippingFee: 2.0,
      insuranceFee: 0.5,
      totalAmount: 27.49,
      courierCode: "JNE",
      serviceTier: "REG",
      paymentMethod: "MIDTRANS_QRIS",
      paymentStatus: "PENDING",
      escrowStatus: "PAYMENT_PENDING",
    });

    assert("ORDER", "Create Order in Database", Boolean(createdOrder && createdOrder.id === testOrderId), `Order ID: ${createdOrder?.id}`);

    // 4B. READ ORDER (By ID, Buyer, and Store)
    const readOrder = await orderRepo.findById(testOrderId);
    assert("ORDER", "Read Order by ID", Boolean(readOrder && readOrder.totalAmount === 27.49), `Total: $${readOrder?.totalAmount}`);

    const buyerOrders = await orderRepo.findByBuyerEmail(testOrderBuyerEmail);
    assert("ORDER", "Read Orders by Buyer Email (Strict Isolation)", buyerOrders.length === 1 && buyerOrders[0].id === testOrderId, `Found: ${buyerOrders.length}`);

    // 4C. UPDATE ORDER STATUS (Payment -> Packing -> In Transit -> Delivered -> Released)
    // Step i: Verify Payment
    await orderRepo.markAsPaid(testOrderId);
    const paidOrder = await orderRepo.findById(testOrderId);
    assert("ORDER", "Update Order: Confirm Payment (HELD_IN_ESCROW)", Boolean(paidOrder && paidOrder.paymentStatus === "PAID" && paidOrder.escrowStatus === "HELD_IN_ESCROW"), `Payment: ${paidOrder?.paymentStatus}, Escrow: ${paidOrder?.escrowStatus}`);

    // Step ii: Ship / Dispatch
    await orderRepo.updateShipment(testOrderId, `JNE-${runId}`, "JNE Express");
    const shippedOrder = await orderRepo.findById(testOrderId);
    assert("ORDER", "Update Order: Enter Waybill / In Transit", Boolean(shippedOrder && shippedOrder.escrowStatus === "IN_TRANSIT" && shippedOrder.waybillNumber === `JNE-${runId}`), `Escrow: ${shippedOrder?.escrowStatus}, Waybill: ${shippedOrder?.waybillNumber}`);

    // Step iii: Confirm Delivery & Release Funds
    await orderRepo.confirmDeliveryAndReleaseFunds(testOrderId);
    const settledOrder = await orderRepo.findById(testOrderId);
    assert("ORDER", "Update Order: Release Escrow Funds to Seller", Boolean(settledOrder && settledOrder.escrowStatus === "FUNDS_RELEASED_TO_SELLER"), `Escrow: ${settledOrder?.escrowStatus}`);

    // 4D. CANCEL / REFUND ORDER TEST
    const cancelTestOrderId = `ORD-CANCEL-${runId}`;
    await orderRepo.create({
      id: cancelTestOrderId,
      buyerId: `usr-${runId}-2`,
      buyerName: "Cancel Tester",
      buyerEmail: `cancel.${runId}@test.com`,
      buyerPhone: "0812333444",
      destinationAddress: "Jl. Thamrin",
      destinationCity: "Jakarta Pusat",
      destinationPostalCode: "10310",
      storeId: "store-moondrop-official",
      storeName: "MOONDROP Official Flagship Store",
      items: [
        {
          id: `item-c-${runId}`,
          orderId: cancelTestOrderId,
          productId: "prod-chu3",
          productName: "Moondrop CHU III",
          brand: "MOONDROP",
          category: "IN-EAR MONITORS",
          price: 24.99,
          quantity: 1,
          selectedVariant: "3.5mm Standard",
          image: "/images/chu3-preview-1.webp",
          itemTotal: 24.99,
        },
      ],
      itemsSubtotal: 24.99,
      shippingFee: 2.0,
      insuranceFee: 0.5,
      totalAmount: 27.49,
      courierCode: "JNE",
      serviceTier: "REG",
      paymentMethod: "MIDTRANS_QRIS",
      paymentStatus: "PENDING",
      escrowStatus: "PAYMENT_PENDING",
    });

    const cancelResult = await orderRepo.cancelOrder(cancelTestOrderId, "Ingin mengubah alamat pengiriman", "BUYER");
    const cancelledOrder = await orderRepo.findById(cancelTestOrderId);
    assert("ORDER", "Cancel Order (Status -> REFUNDED / CANCELLED)", Boolean(cancelResult.success && (cancelledOrder?.escrowStatus === "REFUNDED" || cancelledOrder?.paymentStatus === "FAILED")), `Status: ${cancelledOrder?.escrowStatus}, Reason: ${cancelledOrder?.cancelReason}`);
  } catch (err: any) {
    assert("ORDER", "Order CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 5. RETURN & REFUND CRUD
  // ==========================================================================================
  console.log("\n=== 5. TESTING RETURN & REFUND CRUD ===");
  try {
    // 5A. CREATE RETURN REQUEST
    const createdReturn = await returnRepo.create({
      orderId: testOrderId,
      buyerId: `usr-${runId}`,
      buyerEmail: testOrderBuyerEmail,
      buyerName: "Audit Test Buyer",
      storeId: "store-moondrop-official",
      storeName: "MOONDROP Official Flagship Store",
      productId: "prod-chu3",
      productName: "Moondrop CHU III",
      productImage: "/images/chu3-preview-1.webp",
      productPrice: 24.99,
      quantity: 1,
      selectedVariant: "3.5mm Standard",
      reason: "DRIVER_IMBALANCE",
      description: "Channel kanan lebih pelan 6dB dibandingkan channel kiri",
      evidenceImages: ["/images/chu3-preview-1.webp"],
      unboxingVideoUrl: "https://example.com/unboxing.mp4",
      unboxingVideoType: "upload",
      refundAmount: 24.99,
      requestedSolution: "REFUND",
      shippingFeeBearer: "SELLER",
      qcStage: "STAGE_1_INITIAL_REVIEW",
      qcStatus: "PENDING",
      returnShippingCost: 0,
    });

    const realReturnId = createdReturn.id;
    assert("RETURN", "Create Return Request", Boolean(createdReturn && realReturnId && createdReturn.status === "REQUESTED"), `Return ID: ${realReturnId}, Status: ${createdReturn?.status}`);

    // 5B. READ RETURN
    const readReturn = await returnRepo.findById(realReturnId);
    assert("RETURN", "Read Return by ID", Boolean(readReturn && readReturn.reason === "DRIVER_IMBALANCE"), `Reason: ${readReturn?.reason}`);

    // 5C. UPDATE RETURN (Seller Approves Return)
    const approvedReturn = await returnRepo.approveBySeller(realReturnId, "Pusat Retur Moondrop Official, Gedung Harmoni Lt 2, Jakarta");
    assert("RETURN", "Update Return: Seller Approves (Waiting Buyer Shipment)", Boolean(approvedReturn && approvedReturn.status === "APPROVED_WAITING_SHIPMENT"), `Status: ${approvedReturn?.status}`);

    // 5D. BUYER SHIPS RETURN
    const shippedReturn = await returnRepo.submitReturnShipment(realReturnId, `JNE-RET-${runId}`, "JNE Express");
    assert("RETURN", "Update Return: Buyer Ships Item Back", Boolean(shippedReturn && shippedReturn.status === "IN_TRANSIT_TO_SELLER"), `Status: ${shippedReturn?.status}, Resi: ${shippedReturn?.returnWaybillNumber}`);

    // 5E. SELLER RECEIVES FOR QC INSPECTION
    const inspectingReturn = await returnRepo.confirmReceipt(realReturnId);
    assert("RETURN", "Update Return: Item Received for Acoustic Lab QC", Boolean(inspectingReturn && inspectingReturn.status === "RECEIVED_INSPECTING"), `Status: ${inspectingReturn?.status}`);

    // 5F. QC INSPECTION PASS & ISSUE REFUND
    await returnRepo.submitQcInspection(realReturnId, true, "Driver imbalance confirmed (-5.8dB at 1kHz)", {
      channelBalancePassed: false,
      frequencyResponsePassed: false,
      shellIntegrityPassed: true,
      inspectorName: "Acoustic QC Lab",
    });
    const refundedReturn = await returnRepo.issueRefund(realReturnId);
    assert("RETURN", "Resolve Return: Issue Refund to Buyer", Boolean(refundedReturn && refundedReturn.status === "REFUNDED"), `Final Status: ${refundedReturn?.status}`);
  } catch (err: any) {
    assert("RETURN", "Return CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 6. SELLER WALLET & PAYOUT CRUD
  // ==========================================================================================
  console.log("\n=== 6. TESTING SELLER PAYOUT CRUD ===");
  try {
    // 6A. CREATE PAYOUT REQUEST
    const createdPayout = await payoutRepo.recordWithdrawal({
      storeId: "store-moondrop-official",
      amountUSD: 50.0,
      bankName: "BCA",
      bankAccount: "9876543210",
      accountHolder: "MOONDROP Official Store",
    });
    assert("PAYOUT", "Create Payout Request", Boolean(createdPayout && createdPayout.amountUSD === 50.0 && createdPayout.status === "PROCESSING"), `Payout ID: ${createdPayout.id}, Status: ${createdPayout.status}`);

    // 6B. READ PAYOUTS
    const payouts = await payoutRepo.getWithdrawals("store-moondrop-official");
    assert("PAYOUT", "Read Payouts by Store ID", payouts.some((p) => p.id === createdPayout.id), `Found in ledger: ${payouts.length} payout(s)`);
  } catch (err: any) {
    assert("PAYOUT", "Payout CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 7. REVIEW & RATING CRUD
  // ==========================================================================================
  console.log("\n=== 7. TESTING REVIEW & RATING CRUD ===");
  try {
    // 7A. CREATE REVIEW
    const createdRev = await reviewRepo.create({
      orderId: testOrderId,
      productId: "prod-chu3",
      productName: "Moondrop CHU III",
      productImage: "/images/chu3-preview-1.webp",
      variant: "3.5mm Standard",
      rating: 5,
      comment: "Suara jernih sekali, staging luas, kabel lentur. Sangat memuaskan!",
      tags: ["Vokal Jernih & Detail", "Build Quality Solid"],
      buyerName: "Audit Test Buyer",
      isAnonymous: false,
      storeId: "store-moondrop-official",
      storeName: "MOONDROP Official Flagship Store",
    });
    assert("REVIEW", "Create Review for Product", Boolean(createdRev && createdRev.rating === 5), `Review ID: ${createdRev.id}, Rating: ${createdRev.rating}`);

    // 7B. READ REVIEWS
    const reviews = await reviewRepo.findByProductId("prod-chu3");
    assert("REVIEW", "Read Reviews by Product ID", reviews.some((r) => r.id === createdRev.id), `Total reviews: ${reviews.length}`);

    // 7C. MARK ORDER AS REVIEWED
    const reviewedOrder = await orderRepo.markAsReviewed(testOrderId);
    assert("REVIEW", "Update Order: markAsReviewed", Boolean(reviewedOrder && reviewedOrder.hasReviewed === true), `Order hasReviewed: ${reviewedOrder?.hasReviewed}`);
  } catch (err: any) {
    assert("REVIEW", "Review CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 8. VOUCHER CRUD
  // ==========================================================================================
  console.log("\n=== 8. TESTING VOUCHER CRUD ===");
  const testVoucherCode = `VOUCH-TEST-${runId.toString().slice(-5)}`;
  try {
    // 8A. CREATE VOUCHER
    const createdVoucher = await voucherRepo.create({
      code: testVoucherCode,
      title: "Voucher Diskon Test",
      description: "Diskon 10% untuk testing sistem TonalZone",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minSpend: 20,
      maxDiscount: 5,
      quota: 100,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      isActive: true,
    });
    assert("VOUCHER", "Create Voucher", Boolean(createdVoucher && createdVoucher.code === testVoucherCode), `Code: ${createdVoucher.code}`);

    // 8B. READ & VALIDATE VOUCHER
    const readVoucher = await voucherRepo.getByCode(testVoucherCode);
    assert("VOUCHER", "Read Voucher by Code", Boolean(readVoucher && readVoucher.discountValue === 10), `Title: ${readVoucher?.title}`);

    const validationSuccess = await voucherRepo.validate(testVoucherCode, 30);
    assert("VOUCHER", "Validate Voucher (Valid Spend)", validationSuccess.valid === true && validationSuccess.discountUSD === 3, `Discount calculated: $${validationSuccess.discountUSD}`);

    const validationFail = await voucherRepo.validate(testVoucherCode, 10);
    assert("VOUCHER", "Validate Voucher (Below Min Spend)", validationFail.valid === false, `Validation message: ${validationFail.message}`);

    // 8C. UPDATE VOUCHER
    const updatedVoucher = await voucherRepo.update(createdVoucher.id, {
      title: "Voucher Diskon Test (Updated)",
      discountValue: 15,
    });
    assert("VOUCHER", "Update Voucher", Boolean(updatedVoucher && updatedVoucher.discountValue === 15), `New discount: ${updatedVoucher?.discountValue}%`);

    // 8D. DELETE VOUCHER
    const deleteVoucherResult = await voucherRepo.delete(createdVoucher.id);
    assert("VOUCHER", "Delete Voucher", deleteVoucherResult === true, `Deleted: ${deleteVoucherResult}`);

    const verifyDeletedVoucher = await voucherRepo.getByCode(testVoucherCode);
    assert("VOUCHER", "Verify Voucher is Deleted", verifyDeletedVoucher === null, `Expected null, got: ${verifyDeletedVoucher?.code || "null"}`);
  } catch (err: any) {
    assert("VOUCHER", "Voucher CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 9. NOTIFICATION CRUD
  // ==========================================================================================
  console.log("\n=== 9. TESTING NOTIFICATION CRUD ===");
  const testNotifRecipient = `user.notif.${runId}@test.id`;
  try {
    // 9A. CREATE NOTIFICATION
    const createdNotif = await notificationRepo.create({
      recipientEmail: testNotifRecipient,
      type: "order",
      title: "Pesanan Dikirim",
      message: "Paket Anda sedang dalam perjalanan.",
      actionLink: "/orders",
      unread: true,
    });
    assert("NOTIF", "Create Notification", Boolean(createdNotif && createdNotif.id), `Notif ID: ${createdNotif.id}`);

    // 9B. READ NOTIFICATIONS
    const notifs = await notificationRepo.getByRecipient(testNotifRecipient);
    assert("NOTIF", "Read Notifications for Recipient", notifs.length === 1, `Count: ${notifs.length}`);

    // 9C. UPDATE NOTIFICATION (Mark Read)
    await notificationRepo.markAsRead(createdNotif.id);
    const unreadCount = (await notificationRepo.getByRecipient(testNotifRecipient)).filter((n) => n.unread).length;
    assert("NOTIF", "Update Notification: Mark as Read", unreadCount === 0, `Unread count: ${unreadCount}`);

    // 9D. DELETE NOTIFICATIONS (Clear All)
    await notificationRepo.clearAll(testNotifRecipient);
    const clearedNotifs = await notificationRepo.getByRecipient(testNotifRecipient);
    assert("NOTIF", "Delete / Clear All Notifications", clearedNotifs.length === 0, `Remaining: ${clearedNotifs.length}`);
  } catch (err: any) {
    assert("NOTIF", "Notification CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // 10. CHAT & MESSAGING CRUD
  // ==========================================================================================
  console.log("\n=== 10. TESTING CHAT & MESSAGING CRUD ===");
  const testChatBuyerEmail = `buyer.chat.${runId}@test.id`;
  try {
    // 10A. CREATE CONVERSATION
    const conv = await chatRepo.findOrCreateConversation({
      buyerEmail: testChatBuyerEmail,
      buyerName: "Chat Tester",
      storeId: "store-moondrop-official",
      storeName: "MOONDROP Official Flagship Store",
    });
    assert("CHAT", "Create Conversation", Boolean(conv && conv.id), `Conv ID: ${conv.id}`);

    // 10B. SEND MESSAGE
    const msg = await chatRepo.sendMessage({
      conversationId: conv.id,
      senderRole: "buyer",
      senderName: "Chat Tester",
      senderEmail: testChatBuyerEmail,
      text: "Apakah produk Chu III ready stock?",
    });
    assert("CHAT", "Send Message", Boolean(msg && msg.id), `Msg ID: ${msg.id}`);

    // 10C. READ MESSAGES
    const messages = await chatRepo.getMessages(conv.id);
    assert("CHAT", "Read Messages in Conversation", messages.length === 1 && messages[0].text.includes("ready stock"), `Count: ${messages.length}`);

    // 10D. MARK AS READ
    await chatRepo.markAsRead(conv.id, "buyer");
    const buyerConvs = await chatRepo.getConversations(testChatBuyerEmail);
    assert("CHAT", "Update Conversation: Mark as Read", Boolean(buyerConvs && buyerConvs[0]?.unreadBuyer === 0), `Unread buyer: ${buyerConvs[0]?.unreadBuyer}`);
  } catch (err: any) {
    assert("CHAT", "Chat CRUD Execution", false, err.message);
  }

  // ==========================================================================================
  // SUMMARY REPORT
  // ==========================================================================================
  console.log("\n================================================================================");
  console.log("                           FINAL VERIFICATION SUMMARY                           ");
  console.log("================================================================================");

  const total = reports.length;
  const passed = reports.filter((r) => r.passed).length;
  const failed = reports.filter((r) => !r.passed).length;

  console.log(`TOTAL TESTS EXECUTED: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${Math.round((passed / total) * 100)}%\n`);

  if (failed > 0) {
    console.log("FAILED TESTS:");
    reports
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.error(`- [${r.domain}] ${r.name}: ${r.detail}`);
      });
    process.exit(1);
  } else {
    console.log("ALL 10 CRUD DOMAINS & DATA PERSISTENCE CHECKS PASSED WITH 100% SUCCESS!");
    process.exit(0);
  }
}

runComprehensiveCrudCheck().catch((e) => {
  console.error("Unhandled fatal exception:", e);
  process.exit(1);
});
