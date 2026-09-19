import { orderRepo, reviewRepo } from "../src/lib/supabase-db";
import { recordProductReviewScore, fetchProductByIdFromDb, FALLBACK_CATALOG } from "../src/lib/products-db";

async function runReviewAndRatingVerification() {
  console.log("==================================================");
  console.log("  TONAL ZONE REVIEW & RATING VERIFICATION SUITE   ");
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

  // --- 1. Review Repository & Zero-Dummy Data Policy ---
  console.log("--- 1. Testing Review Repository & Zero-Dummy Data Policy ---");
  const initialReviews = await reviewRepo.getAll();
  assert(
    Array.isArray(initialReviews) && initialReviews.length === 0,
    "reviewRepo initializes strictly with 0 dummy or static reviews",
    `Initial count: ${initialReviews.length}`
  );

  const initialChu3 = await fetchProductByIdFromDb("prod-chu3");
  assert(
    initialChu3 !== null && initialChu3.reviews === 0 && initialChu3.rating === 0,
    "Products start with 0 reviews and 0 rating when unreviewed",
    `Reviews: ${initialChu3?.reviews}, Rating: ${initialChu3?.rating}`
  );

  // --- 2. Live Review Creation & Persistence ---
  console.log("\n--- 2. Testing Review Creation & Persistence ---");
  const testOrderId = "ORD-TEST-REV-8821";
  const testProductId = "prod-chu3";
  const testRating = 5;

  const createdReview = await reviewRepo.create({
    orderId: testOrderId,
    productId: testProductId,
    productName: "Moondrop CHU III",
    productImage: "/images/chu3-preview-1.webp",
    variant: "3.5mm SE Standard",
    rating: testRating,
    comment: "Fitting sangat nyaman, kabel detachable lentur, vokal dan separasi akustik sangat jernih.",
    tags: ["Vokal Jernih & Detail", "Build Quality Solid", "Fitting Nyaman di Telinga"],
    buyerName: "Valen Audiophile",
    isAnonymous: false,
    storeId: "store-moondrop-official",
    storeName: "MOONDROP Official Flagship Store",
  });

  assert(
    createdReview !== null && createdReview.id.startsWith("rev-"),
    "New review successfully generated with unique ID",
    createdReview.id
  );
  assert(
    createdReview.rating === 5 && createdReview.tags?.length === 3,
    "Review rating and tags correctly preserved",
    `Rating: ${createdReview.rating}, Tags: ${createdReview.tags?.join(", ")}`
  );

  const queriedByProd = await reviewRepo.findByProductId(testProductId);
  const containsCreated = queriedByProd.some((r) => r.id === createdReview.id);
  assert(
    containsCreated,
    "Newly created review is immediately queryable by productId",
    `Total reviews for ${testProductId}: ${queriedByProd.length}`
  );

  // --- 3. Dynamic Rating Calculation & Catalog Sync (From 0 to Live Scores) ---
  console.log("\n--- 3. Testing Dynamic Rating Aggregation & Catalog Update ---");
  const firstScoreResult = recordProductReviewScore("prod-chu3", 5);
  assert(
    firstScoreResult.reviews === 1 && firstScoreResult.rating === 5,
    "First review updates reviews count to 1 and rating to 5",
    `Reviews: ${firstScoreResult.reviews}, Rating: ${firstScoreResult.rating}`
  );

  const secondScoreResult = recordProductReviewScore("prod-chu3", 4);
  assert(
    secondScoreResult.reviews === 2 && secondScoreResult.rating === 4.5,
    "Second review calculates exact average (5 + 4) / 2 = 4.5",
    `Reviews: ${secondScoreResult.reviews}, Rating: ${secondScoreResult.rating}`
  );

  const liveProduct = await fetchProductByIdFromDb("prod-chu3");
  assert(
    liveProduct !== null && liveProduct.reviews === 2,
    "fetchProductByIdFromDb reflects live updated reviews count",
    `Reviews: ${liveProduct?.reviews}`
  );
  assert(
    liveProduct !== null && liveProduct.rating === 4.5,
    "fetchProductByIdFromDb reflects live updated rating score",
    `Rating: ${liveProduct?.rating}`
  );

  // --- 4. Testing Order Status & Reviewed Flag ---
  console.log("\n--- 4. Testing Order hasReviewed Transition ---");
  const updatedOrder = await orderRepo.markAsReviewed("ORD-9935");
  assert(
    updatedOrder !== null && updatedOrder.hasReviewed === true,
    "orderRepo.markAsReviewed successfully sets hasReviewed: true",
    `Order #ORD-9935 hasReviewed: ${updatedOrder?.hasReviewed}`
  );

  const reloadedOrder = await orderRepo.findById("ORD-9935");
  assert(
    reloadedOrder?.hasReviewed === true,
    "Order hasReviewed flag is persisted across queries",
    `Order #ORD-9935 hasReviewed: ${reloadedOrder?.hasReviewed}`
  );

  // --- 5. Testing Anonymous Review Privacy ---
  console.log("\n--- 5. Testing Anonymous Review Privacy ---");
  const anonReview = await reviewRepo.create({
    orderId: "ORD-ANON-9912",
    productId: "prod-dusk",
    productName: "Moondrop x Crinacle Dusk",
    rating: 5,
    comment: "BASS & DSP mantap!",
    buyerName: "Pengguna Anonim",
    isAnonymous: true,
  });

  assert(
    anonReview.isAnonymous === true && anonReview.buyerName === "Pengguna Anonim",
    "Anonymous review hides buyer identity properly",
    `Buyer: ${anonReview.buyerName}`
  );

  console.log("\n==================================================");
  console.log(`  FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================");
}

runReviewAndRatingVerification().catch((err) => {
  console.error("Verification failed with exception:", err);
  process.exit(1);
});
