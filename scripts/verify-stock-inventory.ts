import { productRepo, orderRepo } from "../src/lib/supabase-db";
import { fetchProductsFromDb, fetchProductByIdFromDb } from "../src/lib/products-db";

async function runStockInventorySuite() {
  console.log("==========================================================");
  console.log("  TONALZONE REAL-TIME STOCK & INVENTORY ENGINE SUITE     ");
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

  const testProductId = "prod-waner-sg2";

  // 1. Initial Stock Reading
  console.log("--- 1. Testing Initial Stock Reading ---");
  const initialStock = await productRepo.getStock(testProductId);
  assert(
    typeof initialStock === "number" && initialStock > 0,
    "Initial stock successfully read from database/catalog",
    `Product: ${testProductId}, Stock: ${initialStock}`
  );

  // 2. Atomic Stock Deduction
  console.log("\n--- 2. Testing Atomic Stock Deduction ---");
  const deductQty = 4;
  const deductResult = await productRepo.deductStock(testProductId, deductQty);
  assert(
    deductResult.success === true && deductResult.remainingStock === initialStock - deductQty,
    "Stock successfully deducted atomically",
    `Deducted: ${deductQty}, Remaining: ${deductResult.remainingStock}`
  );

  const stockAfterDeduct = await productRepo.getStock(testProductId);
  assert(
    stockAfterDeduct === initialStock - deductQty,
    "productRepo.getStock returns exact remaining stock",
    `Expected: ${initialStock - deductQty}, Actual: ${stockAfterDeduct}`
  );

  // 3. Live Catalog & Detail Reflection
  console.log("\n--- 3. Testing Live Catalog & Product Detail Reflection ---");
  const productDetail = await fetchProductByIdFromDb(testProductId);
  assert(
    productDetail !== null && productDetail.stock === stockAfterDeduct,
    "fetchProductByIdFromDb reflects live deducted stock",
    `Detail stock: ${productDetail?.stock}`
  );

  const allProducts = await fetchProductsFromDb();
  const matchedCatalogItem = allProducts.find((p) => p.id === testProductId);
  assert(
    matchedCatalogItem !== undefined && matchedCatalogItem.stock === stockAfterDeduct,
    "fetchProductsFromDb reflects live deducted stock across catalog",
    `Catalog stock: ${matchedCatalogItem?.stock}`
  );

  // 4. Over-Purchasing Prevention (Reject when stock < requested)
  console.log("\n--- 4. Testing Over-Purchasing Prevention ---");
  const excessiveQty = stockAfterDeduct + 500;
  const overDeductResult = await productRepo.deductStock(testProductId, excessiveQty);
  assert(
    overDeductResult.success === false && !!overDeductResult.error,
    "Over-purchasing rejected with detailed validation error",
    overDeductResult.error
  );

  const stockAfterFailedAttempt = await productRepo.getStock(testProductId);
  assert(
    stockAfterFailedAttempt === stockAfterDeduct,
    "Stock count remains unchanged after rejected over-purchase",
    `Stock: ${stockAfterFailedAttempt}`
  );

  // 5. Order Creation & Auto-Restock on Cancellation
  console.log("\n--- 5. Testing Order Lifecycle & Auto-Restock ---");
  const orderQty = 2;
  const preOrderStock = await productRepo.getStock(testProductId);

  // Simulate checkout deduction
  const checkoutDeduct = await productRepo.deductStock(testProductId, orderQty);
  assert(checkoutDeduct.success, "Checkout deducted stock for new order", `Remaining: ${checkoutDeduct.remainingStock}`);

  const testOrderId = `ORD-STOCK-${Date.now()}`;
  const createdOrder = await orderRepo.create({
    id: testOrderId,
    buyerId: "usr-stock-tester",
    buyerName: "Stock Tester",
    buyerEmail: "stocktester@tonalzone.com",
    destinationAddress: "Jl. Gatot Subroto No. 88",
    destinationCity: "Jakarta",
    destinationPostalCode: "12930",
    storeId: "store-moondrop-official",
    storeName: "Moondrop Official",
    items: [
      {
        id: `item-${Date.now()}`,
        orderId: testOrderId,
        productId: testProductId,
        productName: "Tangzu Wan'er S.G II",
        brand: "Tangzu",
        price: 24.99,
        quantity: orderQty,
        itemTotal: 49.98,
      },
    ],
    itemsSubtotal: 49.98,
    shippingFee: 5,
    insuranceFee: 1,
    totalAmount: 55.98,
    courierCode: "JNE",
    serviceTier: "REG",
    paymentMethod: "BCA_VA",
    paymentStatus: "PENDING",
    escrowStatus: "PAYMENT_PENDING",
  });

  assert(!!createdOrder, "Test order created with stock-deducted items", createdOrder.id);

  // Cancel order -> auto-restock triggered
  const cancelResult = await orderRepo.cancelOrder(createdOrder.id, "Pembeli membatalkan pesanan sebelum bayar");
  assert(
    cancelResult.success && cancelResult.order?.escrowStatus === "REFUNDED",
    "Order successfully marked REFUNDED upon cancellation",
    cancelResult.order?.escrowStatus
  );

  const postCancelStock = await productRepo.getStock(testProductId);
  assert(
    postCancelStock === preOrderStock,
    "Auto-restock restored exact quantity back to inventory upon order cancellation",
    `Before: ${preOrderStock}, After Restock: ${postCancelStock}`
  );

  // 6. Out-of-Stock State & Zero Handling
  console.log("\n--- 6. Testing Out-of-Stock (Zero Stock) State ---");
  const tempZeroProduct = "prod-temp-zero-test";
  await productRepo.updateStock(tempZeroProduct, 0);

  const zeroStock = await productRepo.getStock(tempZeroProduct);
  assert(zeroStock === 0, "Product stock updated to 0", `Stock: ${zeroStock}`);

  const zeroDeductAttempt = await productRepo.deductStock(tempZeroProduct, 1);
  assert(
    zeroDeductAttempt.success === false,
    "Purchasing 1 unit from zero-stock product strictly rejected",
    zeroDeductAttempt.error
  );

  // 7. Seller Manual Stock Update
  console.log("\n--- 7. Testing Seller Manual Stock Update ---");
  await productRepo.updateStock(testProductId, initialStock);
  const restoredToOriginal = await productRepo.getStock(testProductId);
  assert(
    restoredToOriginal === initialStock,
    "Seller updateStock restored product inventory back to baseline",
    `Final Stock: ${restoredToOriginal}`
  );

  console.log("\n==========================================================");
  console.log(`  VERIFICATION RESULTS: ${passed}/${total} TESTS PASSED  `);
  console.log("==========================================================");

  if (passed === total) {
    console.log("ALL REAL-TIME STOCK INVENTORY ENGINE TESTS PASSED!\n");
  } else {
    process.exit(1);
  }
}

runStockInventorySuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
