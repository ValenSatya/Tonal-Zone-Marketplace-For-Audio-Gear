import { orderRepo, payoutRepo, storeRepo } from "../src/lib/supabase-db";

async function runEscrowAndPayoutVerification() {
  console.log("==================================================");
  console.log("  TONAL ZONE ESCROW & PAYOUT VERIFICATION SUITE   ");
  console.log("==================================================\n");

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

  // --- 1. Verify Multi-Tenant Order Scoping & Isolation ---
  console.log("--- 1. Testing Multi-Tenant Order Isolation ---");
  const emptyStoreOrders = await orderRepo.findByStoreId("store-non-existent-12345");
  assert(
    Array.isArray(emptyStoreOrders) && emptyStoreOrders.length === 0,
    "Empty or new store returns 0 orders (No cross-store data leakage)",
    `Count: ${emptyStoreOrders.length}`
  );

  const emptyStoreWithdrawals = await payoutRepo.getWithdrawals("store-non-existent-12345");
  assert(
    Array.isArray(emptyStoreWithdrawals) && emptyStoreWithdrawals.length === 0,
    "Empty or new store returns 0 withdrawals",
    `Count: ${emptyStoreWithdrawals.length}`
  );

  // --- 2. Verify Official Moondrop Store Orders & Ledger ---
  console.log("\n--- 2. Testing Official Moondrop Flagship Store Data ---");
  const moondropStore = await storeRepo.findById("store-moondrop-official");
  assert(
    moondropStore !== null && moondropStore.storeType === "OFFICIAL_BRAND",
    "Moondrop store exists and is OFFICIAL_BRAND",
    moondropStore?.storeName
  );

  const moondropOrders = await orderRepo.findByStoreId("store-moondrop-official");
  assert(
    moondropOrders.length >= 6,
    "Moondrop store has authentic seeded orders across lifecycle states",
    `Total: ${moondropOrders.length} orders`
  );

  const hasToShip = moondropOrders.some((o) => o.escrowStatus === "HELD_IN_ESCROW");
  const hasInTransit = moondropOrders.some((o) => o.escrowStatus === "IN_TRANSIT");
  const hasCompleted = moondropOrders.some((o) => o.escrowStatus === "FUNDS_RELEASED_TO_SELLER");

  assert(hasToShip, "Moondrop has pending orders ready to ship (HELD_IN_ESCROW)");
  assert(hasInTransit, "Moondrop has dispatched orders in delivery (IN_TRANSIT)");
  assert(hasCompleted, "Moondrop has completed orders with funds released (FUNDS_RELEASED_TO_SELLER)");

  // --- 3. Testing Dynamic Wallet Calculation & Balance Precision ---
  console.log("\n--- 3. Testing Dynamic Wallet Calculations ---");
  const initialWithdrawals = await payoutRepo.getWithdrawals("store-moondrop-official");
  assert(
    initialWithdrawals.length >= 2,
    "Moondrop has initial bank withdrawal history in ledger",
    `Count: ${initialWithdrawals.length}`
  );

  let initialSettledUSD = 0;
  let initialEscrowUSD = 0;
  for (const o of moondropOrders) {
    if (o.escrowStatus === "FUNDS_RELEASED_TO_SELLER") {
      initialSettledUSD += o.totalAmount;
    } else if (o.escrowStatus === "HELD_IN_ESCROW" || o.escrowStatus === "IN_TRANSIT" || o.escrowStatus === "DELIVERED") {
      initialEscrowUSD += o.totalAmount;
    }
  }

  let initialWithdrawnUSD = 0;
  for (const w of initialWithdrawals) {
    initialWithdrawnUSD += w.amountUSD;
  }

  const initialAvailableUSD = Math.round((initialSettledUSD - initialWithdrawnUSD) * 100) / 100;
  assert(
    initialAvailableUSD === 4320,
    "Calculated available balance matches expected $4,320 exactly",
    `Settled: $${initialSettledUSD}, Withdrawn: $${initialWithdrawnUSD}, Available: $${initialAvailableUSD}`
  );
  assert(
    initialWithdrawnUSD === 4300,
    "Calculated lifetime payouts matches expected $4,300 exactly",
    `Withdrawn: $${initialWithdrawnUSD}`
  );

  // --- 4. Testing End-to-End Escrow Order Lifecycle ---
  console.log("\n--- 4. Testing Live End-to-End Escrow Lifecycle ---");
  const testOrderId = `ORD-TEST-ESCROW-${Date.now()}`;
  const testOrderPrice = 25; // Moondrop CHU III price

  // Step A: Order Created & Payment Held in Escrow
  const createdOrder = await orderRepo.create({
    id: testOrderId,
    buyerId: "usr-audiophile-test",
    buyerName: "Test Audiophile Buyer",
    buyerEmail: "buyer.test@tonalzone.com",
    destinationAddress: "Jl. Sudirman Kav 52",
    destinationCity: "Jakarta Selatan",
    destinationPostalCode: "12190",
    storeId: "store-moondrop-official",
    storeName: "MOONDROP Official Flagship Store",
    items: [
      {
        id: `item-test-${Date.now()}`,
        orderId: testOrderId,
        productId: "prod-chu3",
        productName: "Moondrop CHU III",
        brand: "MOONDROP",
        category: "IN-EAR MONITORS",
        price: testOrderPrice,
        quantity: 1,
        selectedVariant: "3.5mm SE Standard",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
        itemTotal: testOrderPrice,
      },
    ],
    itemsSubtotal: testOrderPrice,
    shippingFee: 0,
    insuranceFee: 0,
    totalAmount: testOrderPrice,
    courierCode: "J&T Express",
    serviceTier: "EZ",
    paymentMethod: "MIDTRANS_QRIS",
    paymentStatus: "PAID",
    escrowStatus: "HELD_IN_ESCROW",
  });

  assert(
    createdOrder.id === testOrderId && createdOrder.escrowStatus === "HELD_IN_ESCROW",
    "Step A: Order created and funds securely locked in TonalZone Escrow",
    `Order ID: ${createdOrder.id}`
  );

  // Step B: Seller Dispatches with Waybill
  const waybillNumber = "JNT-TEST-99882211";
  const shippedOrder = await orderRepo.updateShipment(testOrderId, waybillNumber, "J&T Express");
  assert(
    shippedOrder !== null &&
      shippedOrder.escrowStatus === "IN_TRANSIT" &&
      shippedOrder.waybillNumber === waybillNumber,
    "Step B: Seller dispatches package, enters waybill, order transitions to IN_TRANSIT",
    `Waybill: ${shippedOrder?.waybillNumber}, Escrow: ${shippedOrder?.escrowStatus}`
  );

  // Step C: Buyer Confirms Delivery & Escrow Auto-Release
  const acceptedOrder = await orderRepo.confirmDeliveryAndReleaseFunds(testOrderId);
  assert(
    acceptedOrder !== null && acceptedOrder.escrowStatus === "FUNDS_RELEASED_TO_SELLER",
    "Step C: Buyer confirms receipt, escrow funds immediately release to seller",
    `Escrow: ${acceptedOrder?.escrowStatus}`
  );

  // Step D: Verify Seller Available Balance Increased
  const updatedOrders = await orderRepo.findByStoreId("store-moondrop-official");
  let newSettledUSD = 0;
  for (const o of updatedOrders) {
    if (o.escrowStatus === "FUNDS_RELEASED_TO_SELLER") {
      newSettledUSD += o.totalAmount;
    }
  }
  const newAvailableUSD = Math.round((newSettledUSD - initialWithdrawnUSD) * 100) / 100;
  assert(
    newAvailableUSD === initialAvailableUSD + testOrderPrice,
    "Step D: Seller Available Balance increased by exact order price ($4,320 + $25 = $4,345)",
    `New Balance: $${newAvailableUSD}`
  );

  // Step E: Seller Submits Withdrawal Request to BCA
  console.log("\n--- 5. Testing Bank Withdrawal Processing & Audit Trail ---");
  const withdrawalAmount = 45;
  const withdrawalRecord = await payoutRepo.recordWithdrawal({
    storeId: "store-moondrop-official",
    amountUSD: withdrawalAmount,
    bankName: "BCA",
    bankAccount: "0123456789",
    accountHolder: "MOONDROP Official Indonesia",
  });

  assert(
    withdrawalRecord.amountUSD === withdrawalAmount &&
      withdrawalRecord.status === "PROCESSING" &&
      withdrawalRecord.bankName === "BCA",
    "Step E: Withdrawal request successfully created with status PROCESSING",
    `ID: ${withdrawalRecord.id}, Amount: $${withdrawalRecord.amountUSD}`
  );

  const postWithdrawalRecords = await payoutRepo.getWithdrawals("store-moondrop-official");
  let totalWithdrawnNow = 0;
  for (const w of postWithdrawalRecords) {
    totalWithdrawnNow += w.amountUSD;
  }
  const finalAvailableUSD = Math.round((newSettledUSD - totalWithdrawnNow) * 100) / 100;

  assert(
    finalAvailableUSD === newAvailableUSD - withdrawalAmount,
    "Step F: Available balance deducted by withdrawal amount ($4,345 - $45 = $4,300)",
    `Final Available: $${finalAvailableUSD}`
  );

  assert(
    totalWithdrawnNow === initialWithdrawnUSD + withdrawalAmount,
    "Step G: Lifetime payouts correctly reflects newly disbursed funds ($4,300 + $45 = $4,345)",
    `Lifetime Payouts: $${totalWithdrawnNow}`
  );

  console.log("\n==================================================");
  console.log(`  FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================");
}

runEscrowAndPayoutVerification().catch((err) => {
  console.error("Verification failed with exception:", err);
  process.exit(1);
});
