import { orderRepo, reviewRepo, chatRepo } from "../src/lib/supabase-db";
import { fetchProductByIdFromDb } from "../src/lib/products-db";

async function runPureDatabaseVerification() {
  console.log("==================================================================");
  console.log("  TONAL ZONE PURE DATABASE & ZERO-DUMMY ARCHITECTURE TEST SUITE   ");
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}${detail ? ` (${detail})` : ""}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - Detail: ${detail}` : ""}`);
      process.exitCode = 1;
    }
  }

  // =========================================================================
  // 1. REVIEWS: ZERO DUMMY DATA VERIFICATION
  // =========================================================================
  console.log("--- 1. Testing Zero-Dummy Reviews Architecture ---");
  const initialReviews = await reviewRepo.getAll();
  assert(
    Array.isArray(initialReviews) && initialReviews.length === 0,
    "reviewRepo initializes strictly with 0 dummy or static reviews",
    `Count: ${initialReviews.length}`
  );

  const testProduct = await fetchProductByIdFromDb("prod-chu3");
  assert(
    testProduct !== null && testProduct.reviews === 0 && testProduct.rating === 0,
    "Products without buyer reviews strictly start at 0 reviews and 0.0 rating",
    `Reviews: ${testProduct?.reviews}, Rating: ${testProduct?.rating}`
  );

  // =========================================================================
  // 2. ORDERS: PURE DATABASE & BUYER ISOLATION
  // =========================================================================
  console.log("\n--- 2. Testing Pure Database Orders & Buyer Isolation ---");
  const nonExistentBuyerEmail = "new_buyer_" + Date.now() + "@audiophile.id";
  const emptyBuyerOrders = await orderRepo.findByBuyerEmail(nonExistentBuyerEmail);
  assert(
    Array.isArray(emptyBuyerOrders) && emptyBuyerOrders.length === 0,
    "New buyer has 0 orders (strictly NO fallback to all orders or cross-buyer leakage)",
    `Orders found: ${emptyBuyerOrders.length}`
  );

  const testBuyerEmail = "valen.test.buyer@audiophile.test";
  const testOrderId = `ORD-TEST-${Date.now()}`;
  const createdOrder = await orderRepo.create({
    id: testOrderId,
    buyerId: "usr-valen-test",
    buyerName: "Valen Test Buyer",
    buyerEmail: testBuyerEmail,
    buyerPhone: "081234567890",
    destinationAddress: "Jl. Sudirman Kav 21",
    destinationCity: "Jakarta Selatan",
    destinationPostalCode: "12190",
    storeId: "store-moondrop-official",
    storeName: "MOONDROP Official Flagship Store",
    items: [
      {
        id: `item-${Date.now()}`,
        orderId: testOrderId,
        productId: "prod-chu3",
        productName: "Moondrop CHU III",
        brand: "MOONDROP",
        category: "IN-EAR MONITORS",
        price: 32,
        quantity: 1,
        selectedVariant: "3.5mm Standard",
        image: "/images/chu3-preview-1.webp",
        itemTotal: 32,
      },
    ],
    itemsSubtotal: 32,
    shippingFee: 2,
    insuranceFee: 0.5,
    totalAmount: 34.5,
    courierCode: "JNE",
    serviceTier: "REG",
    paymentMethod: "MIDTRANS_QRIS",
    paymentStatus: "PAID",
    escrowStatus: "IN_TRANSIT",
    waybillNumber: "JNE-881920391",
  });

  assert(
    createdOrder.id === testOrderId && createdOrder.buyerEmail === testBuyerEmail,
    "orderRepo.create successfully persists real order in database",
    createdOrder.id
  );

  const fetchedBuyerOrders = await orderRepo.findByBuyerEmail(testBuyerEmail);
  assert(
    fetchedBuyerOrders.length === 1 && fetchedBuyerOrders[0].id === testOrderId,
    "orderRepo.findByBuyerEmail retrieves strictly the buyer's real order",
    `Found ${fetchedBuyerOrders.length} order(s)`
  );

  const otherBuyerOrders = await orderRepo.findByBuyerEmail("different.user@tonalzone.com");
  assert(
    otherBuyerOrders.length === 0,
    "Other buyer emails do not see testBuyer's order",
    `Count: ${otherBuyerOrders.length}`
  );

  // =========================================================================
  // 3. SELLER CHAT: ZERO DUMMY DATA & PURE DATABASE REPOSITORY
  // =========================================================================
  console.log("\n--- 3. Testing Pure Database Seller Chat (Zero Dummy Contacts) ---");
  const initialBuyerConversations = await chatRepo.getConversations(testBuyerEmail);
  assert(
    Array.isArray(initialBuyerConversations) && initialBuyerConversations.length === 0,
    "chatRepo initializes with 0 conversations for new buyer (Zero dummy contacts like CSI Zone/Bass Audio)",
    `Conversations: ${initialBuyerConversations.length}`
  );

  // Buyer initiates chat with Moondrop Official
  const newConversation = await chatRepo.findOrCreateConversation({
    buyerEmail: testBuyerEmail,
    buyerName: "Valen Test Buyer",
    storeId: "store-moondrop-official",
    storeName: "MOONDROP Official Flagship Store",
    storeType: "Official Store",
  });

  assert(
    newConversation !== null && newConversation.storeName === "MOONDROP Official Flagship Store",
    "chatRepo.findOrCreateConversation successfully creates conversation in database",
    newConversation.id
  );

  const buyerConvsAfterCreate = await chatRepo.getConversations(testBuyerEmail);
  assert(
    buyerConvsAfterCreate.length === 1 && buyerConvsAfterCreate[0].id === newConversation.id,
    "Buyer's conversation list dynamically updates in database",
    `Count: ${buyerConvsAfterCreate.length}`
  );

  // Test sending message with product card
  const buyerMessage = await chatRepo.sendMessage({
    conversationId: newConversation.id,
    senderRole: "buyer",
    senderName: "Valen Test Buyer",
    senderEmail: testBuyerEmail,
    text: "Halo min, apakah Moondrop CHU III ready stock dan bergaransi resmi?",
    productCard: {
      id: "prod-chu3",
      name: "Moondrop CHU III",
      brand: "MOONDROP",
      price: 32,
      image: "/images/chu3-preview-1.webp",
    },
  });

  assert(
    buyerMessage.id.startsWith("msg-") && buyerMessage.senderRole === "buyer",
    "chatRepo.sendMessage persists buyer message with product attachment",
    buyerMessage.id
  );

  // Test seller reply
  const sellerReply = await chatRepo.sendMessage({
    conversationId: newConversation.id,
    senderRole: "seller",
    senderName: "MOONDROP Official Flagship Store",
    text: "Halo kak! Untuk Moondrop CHU III unit ready stock 100% original BNIB bergaransi resmi 1 tahun.",
  });

  assert(
    sellerReply.senderRole === "seller" && sellerReply.text.includes("ready stock"),
    "chatRepo.sendMessage persists seller reply in database",
    sellerReply.id
  );

  // Verify message thread
  const threadMessages = await chatRepo.getMessages(newConversation.id);
  assert(
    threadMessages.length === 2 &&
      threadMessages[0].senderRole === "buyer" &&
      threadMessages[1].senderRole === "seller",
    "chatRepo.getMessages retrieves complete persistent message thread in chronological order",
    `Messages: ${threadMessages.length}`
  );

  // Test mark as read
  await chatRepo.markAsRead(newConversation.id, "buyer");
  const updatedConv = await chatRepo.getConversationById(newConversation.id);
  assert(
    updatedConv !== null && updatedConv.unreadBuyer === 0,
    "chatRepo.markAsRead properly updates unread status in database",
    `unreadBuyer: ${updatedConv?.unreadBuyer}`
  );

  // Test isolation: different buyer has 0 conversations
  const unrelatedConvs = await chatRepo.getConversations("stranger@audiophile.test");
  assert(
    unrelatedConvs.length === 0,
    "Conversations are strictly isolated by buyer email (no leakage to other accounts)",
    `Count: ${unrelatedConvs.length}`
  );

  console.log("\n==================================================================");
  console.log(`  VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("\nSUCCESS: All Zero-Dummy Data & Pure Database Architecture checks PASSED! 100% database-driven.");
  } else {
    process.exit(1);
  }
}

runPureDatabaseVerification().catch((err) => {
  console.error("Verification suite failed with unhandled error:", err);
  process.exit(1);
});
