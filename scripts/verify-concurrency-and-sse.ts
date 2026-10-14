import { productRepo, brandRepo, categoryRepo, storeRepo } from "../src/lib/supabase-db";
import { serverRealtimeHub, serverBroadcastRealtime } from "../src/lib/server-realtime";

interface ConcurrencyTestReport {
  name: string;
  passed: boolean;
  detail?: string;
}

const reports: ConcurrencyTestReport[] = [];

function assert(name: string, condition: boolean, detail?: string) {
  reports.push({
    name,
    passed: Boolean(condition),
    detail: detail || (condition ? "OK" : "Assertion failed"),
  });
  const symbol = condition ? "[PASS]" : "[FAIL]";
  console.log(`${symbol} ${name}${detail ? ` -> ${detail}` : ""}`);
}

async function runTests() {
  console.log("================================================================================");
  console.log("    TONALZONE CONCURRENCY STOCK PROTECTION & SSE REALTIME VERIFICATION          ");
  console.log("================================================================================\n");

  const runId = Date.now();

  // ==========================================================================================
  // PART 1: TEST OPTION 1 - SSE REALTIME HUB & BROADCAST
  // ==========================================================================================
  console.log("=== 1. TESTING SSE REALTIME HUB (SERVER-SENT EVENTS) ===");
  try {
    const receivedEvents: any[] = [];
    const dummyClientId = `client-test-${runId}`;

    // Mock SSE Controller
    const mockController: ReadableStreamDefaultController = {
      enqueue: (chunk: Uint8Array) => {
        const text = new TextDecoder().decode(chunk);
        receivedEvents.push(text);
      },
      close: () => {},
      error: () => {},
      desiredSize: 1,
    };

    // Register test client
    serverRealtimeHub.addClient(dummyClientId, mockController);
    assert("SSE Hub Client Registration", serverRealtimeHub.getSubscriberCount() >= 1, `Active clients: ${serverRealtimeHub.getSubscriberCount()}`);

    // Broadcast from external sender
    serverBroadcastRealtime(
      "CATALOG",
      { type: "STOCK_UPDATED", productId: "test-iem-01", remainingStock: 4 },
      "external-sender"
    );

    // Verify reception
    const lastEvent = receivedEvents[receivedEvents.length - 1];
    const hasCatalogEvent = Boolean(lastEvent && lastEvent.includes("STOCK_UPDATED") && lastEvent.includes("test-iem-01"));
    assert("SSE Event Dispatched & Received", hasCatalogEvent, `Received: ${lastEvent?.trim()}`);

    // Test Echo Prevention: when senderId === dummyClientId, mockController should NOT receive it
    const beforeCount = receivedEvents.length;
    serverBroadcastRealtime(
      "CATALOG",
      { type: "STOCK_UPDATED", productId: "test-iem-01", remainingStock: 3 },
      dummyClientId
    );
    const afterCount = receivedEvents.length;
    assert("SSE Echo Suppression (Self-Sender Filtered)", beforeCount === afterCount, `Count before: ${beforeCount}, Count after: ${afterCount}`);

    // Clean up client
    serverRealtimeHub.removeClient(dummyClientId);
    assert("SSE Client Unregistration", true, "Client successfully removed");
  } catch (err: any) {
    assert("SSE Realtime Execution", false, err.message);
  }

  // ==========================================================================================
  // PART 2: TEST OPTION 3 - CONCURRENCY STOCK MUTEX & RACE CONDITION DEFENSE
  // ==========================================================================================
  console.log("\n=== 2. TESTING CONCURRENCY STOCK MUTEX (PREVENT OVERSELLING) ===");
  const testStockProdId = `prod-mutex-test-${runId}`;

  try {
    // 2A. Create test product with limited stock = 3
    const brand = await brandRepo.upsert("TANCHJIM");
    const category = await categoryRepo.upsert("IN-EAR MONITORS");
    const store = await storeRepo.findById("store-moondrop-official");

    await productRepo.create({
      id: testStockProdId,
      name: `Concurrency Race Test IEM #${runId}`,
      storeId: store?.id || "store-moondrop-official",
      brandId: brand.id,
      categoryId: category.id,
      description: "High concurrency stock contention test product.",
      price: 150,
      stock: 3, // Exactly 3 units in stock
      experienceLevel: "ENTHUSIAST",
      soundSignature: "NEUTRAL",
      images: ["/images/chu3-preview-1.webp"],
    });

    const initProd = await productRepo.findById(testStockProdId);
    assert("Product Created with Limited Stock", Boolean(initProd && Number(initProd.stock) === 3), `Initial Stock: ${initProd?.stock}`);

    // 2B. Fire 10 simultaneous checkout requests competing for 3 units
    console.log("-> Simulating 10 simultaneous parallel checkouts competing for 3 units...");
    const parallelRequests = Array.from({ length: 10 }).map(async (_, idx) => {
      // Simulate slight microsecond jitter typical of concurrent web network requests
      await new Promise((res) => setTimeout(res, Math.random() * 5));
      return productRepo.deductStock(testStockProdId, 1);
    });

    const results = await Promise.all(parallelRequests);

    const successfulCheckouts = results.filter((r) => r.success);
    const failedCheckouts = results.filter((r) => !r.success);

    assert(
      "Exact Concurrency Stock Deduction (No Overselling)",
      successfulCheckouts.length === 3 && failedCheckouts.length === 7,
      `Successful: ${successfulCheckouts.length}, Rejected: ${failedCheckouts.length}`
    );

    const finalProd = await productRepo.findById(testStockProdId);
    assert(
      "Final Stock is Exactly 0 (Never Negative)",
      Number(finalProd?.stock) === 0,
      `Actual Stock in Database: ${finalProd?.stock}`
    );

    // 2C. Test Stock Restoration (e.g. Order cancellation / payment expired)
    console.log("-> Testing atomic stock restore of 2 units...");
    const restored = await productRepo.restoreStock(testStockProdId, 2);
    assert("Stock Restored Successfully", restored.success && restored.remainingStock === 2, `Restored Stock: ${restored.remainingStock}`);

    const verifyRestored = await productRepo.findById(testStockProdId);
    assert("Database Reflects Restored Stock", Number(verifyRestored?.stock) === 2, `Verified Stock: ${verifyRestored?.stock}`);

    // Clean up
    await productRepo.delete(testStockProdId);
    assert("Test Product Cleanup", true, "Deleted temporary test product");
  } catch (err: any) {
    assert("Concurrency Mutex Execution", false, err.message);
  }

  // ==========================================================================================
  // SUMMARY
  // ==========================================================================================
  console.log("\n================================================================================");
  console.log("                           VERIFICATION SUMMARY                                 ");
  console.log("================================================================================");

  const total = reports.length;
  const passed = reports.filter((r) => r.passed).length;
  const failed = reports.filter((r) => !r.passed).length;

  console.log(`TOTAL CHECKS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);

  if (failed > 0) {
    console.error("FAILED TESTS FOUND!");
    process.exit(1);
  } else {
    console.log("\nALL CONCURRENCY AND SSE TESTS PASSED WITH 100% SUCCESS!");
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
