import { fetchProductByIdFromDb, fetchProductsFromDb, searchCatalog, FALLBACK_CATALOG } from "./src/lib/products-db";

async function runComprehensiveVerification() {
  console.log("==================================================");
  console.log("  TONAL ZONE DEEP VERIFICATION SUITE");
  console.log("==================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] ${testName}${detail ? ` (${detail})` : ""}`);
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` (${detail})` : ""}`);
    }
  }

  // ----------------------------------------------------
  // 1. DUPLICATE ID CHECK
  // ----------------------------------------------------
  console.log("--- 1. Checking Catalog Integrity & Duplicate IDs ---");
  const catalogIds = FALLBACK_CATALOG.map((p) => p.id);
  const dupes = catalogIds.filter((id, idx) => catalogIds.indexOf(id) !== idx);
  assert(dupes.length === 0, "FALLBACK_CATALOG has 0 duplicate IDs", `Found: ${dupes.join(", ") || "none"}`);

  // ----------------------------------------------------
  // 2. FETCH ALL PRODUCTS FROM DB
  // ----------------------------------------------------
  console.log("\n--- 2. Fetching Catalog Products from Database ---");
  const allProducts = await fetchProductsFromDb();
  assert(allProducts.length >= 60, "fetchProductsFromDb returns rich catalog", `Total: ${allProducts.length}`);

  // ----------------------------------------------------
  // 3. PRODUCT DETAIL LOOKUP & ALIAS RESOLUTION
  // ----------------------------------------------------
  console.log("\n--- 3. Testing Product ID & URL Alias Resolution ---");
  const aliasTests: Array<{ input: string; expectedId: string; expectedNamePart: string }> = [
    { input: "prod-chu3", expectedId: "prod-chu3", expectedNamePart: "CHU III" },
    { input: "chu3", expectedId: "prod-chu3", expectedNamePart: "CHU III" },
    { input: "chu-3", expectedId: "prod-chu3", expectedNamePart: "CHU III" },
    { input: "chu-iii", expectedId: "prod-chu3", expectedNamePart: "CHU III" },
    { input: "prod-chu-iii", expectedId: "prod-chu3", expectedNamePart: "CHU III" },
    { input: "moondrop-chu-3", expectedId: "prod-chu3", expectedNamePart: "CHU III" },
    { input: "prod-dusk", expectedId: "prod-dusk", expectedNamePart: "Dusk" },
    { input: "dusk", expectedId: "prod-dusk", expectedNamePart: "Dusk" },
    { input: "crinacle-dusk", expectedId: "prod-dusk", expectedNamePart: "Dusk" },
    { input: "moondrop-dusk", expectedId: "prod-dusk", expectedNamePart: "Dusk" },
    { input: "prod-blessing3", expectedId: "prod-blessing3", expectedNamePart: "Blessing 3" },
    { input: "blessing-3", expectedId: "prod-blessing3", expectedNamePart: "Blessing 3" },
    { input: "blessing3", expectedId: "prod-blessing3", expectedNamePart: "Blessing 3" },
    { input: "sennheiser-sec", expectedId: "prod-momentum4", expectedNamePart: "Momentum 4" },
    { input: "sennheiser-main", expectedId: "prod-hd600", expectedNamePart: "HD 600" },
    { input: "hd600", expectedId: "prod-hd600", expectedNamePart: "HD 600" },
    { input: "prod-mimisbrunnr", expectedId: "prod-mimisbrunnr", expectedNamePart: "Mimisbrunnr" },
    { input: "mimisbrunnr", expectedId: "prod-mimisbrunnr", expectedNamePart: "Mimisbrunnr" },
    { input: "prod-epz-g30", expectedId: "prod-epz-g30", expectedNamePart: "EPZ G30" },
    { input: "epz-g30", expectedId: "prod-epz-g30", expectedNamePart: "EPZ G30" },
    { input: "prod-wukong", expectedId: "prod-wukong", expectedNamePart: "WuKong" },
    { input: "wukong", expectedId: "prod-wukong", expectedNamePart: "WuKong" },
    { input: "earfun-air-pro-4", expectedId: "prod-earfun-air-pro-4", expectedNamePart: "Air Pro 4" },
    { input: "earfun-free-pro-3", expectedId: "prod-earfun-free-pro-3", expectedNamePart: "Free Pro 3" },
    { input: "redmi-buds-5-pro", expectedId: "prod-redmi-buds-5-pro", expectedNamePart: "Buds 5 Pro" },
    { input: "redmi-buds-4-pro", expectedId: "prod-redmi-buds-4-pro", expectedNamePart: "Buds 4 Pro" },
    { input: "space-travel", expectedId: "prod-space-travel", expectedNamePart: "Space Travel" },
    { input: "golden-ages", expectedId: "prod-golden-ages", expectedNamePart: "Golden Ages" },
    { input: "ultrasonic", expectedId: "prod-moondrop-ultrasonic", expectedNamePart: "Ultrasonic" },
    { input: "wf-1000xm5", expectedId: "prod-wf1000xm5", expectedNamePart: "WF-1000XM5" },
    { input: "airpods-pro-2", expectedId: "prod-airpods-pro2", expectedNamePart: "AirPods Pro 2" },
    { input: "galaxy-buds2-pro", expectedId: "prod-galaxy-buds2-pro", expectedNamePart: "Galaxy Buds2 Pro" },
  ];

  for (const { input, expectedId, expectedNamePart } of aliasTests) {
    const product = await fetchProductByIdFromDb(input);
    const ok = !!product && product.id === expectedId && product.name.includes(expectedNamePart);
    assert(ok, `Lookup "${input}" -> ${expectedId}`, product ? product.name : "null");
  }

  // ----------------------------------------------------
  // 4. ACOUSTIC SPECIFICATIONS & SQUIGLINK LINKS
  // ----------------------------------------------------
  console.log("\n--- 4. Verifying Authentic Audiophile Specs & Squiglink Links ---");
  const chu3 = await fetchProductByIdFromDb("prod-chu3");
  assert(
    !!chu3?.driverType?.includes("Al-Mg"),
    "Moondrop Chu 3 has authentic Al-Mg driver specs",
    chu3?.driverType
  );
  assert(
    !!chu3?.squiglinkUrl?.includes("crinacle.com"),
    "Moondrop Chu 3 has authentic Crinacle/Squiglink frequency graph link",
    chu3?.squiglinkUrl
  );
  assert(
    Array.isArray(chu3?.images) && chu3.images.length >= 3,
    "Moondrop Chu 3 has rich multi-image gallery",
    `${chu3?.images?.length} images`
  );

  const dusk = await fetchProductByIdFromDb("prod-dusk");
  assert(
    !!dusk?.driverType?.includes("HODDDUS") && !!dusk?.driverType?.includes("Planar"),
    "Moondrop x Crinacle Dusk has HODDDUS + Planar driver configuration",
    dusk?.driverType
  );
  assert(
    !!dusk?.squiglinkUrl?.includes("crinacle.com") && dusk.squiglinkUrl.includes("Dusk"),
    "Moondrop x Crinacle Dusk has authentic Crinacle Dusk graph URL",
    dusk?.squiglinkUrl
  );
  assert(
    Array.isArray(dusk?.images) && dusk.images.length >= 2,
    "Moondrop Dusk has rich multi-image gallery",
    `${dusk?.images?.length} images`
  );

  // ----------------------------------------------------
  // 5. AUDIOPHILE SEARCH ENGINE VERIFICATION
  // ----------------------------------------------------
  console.log("\n--- 5. Testing Audiophile-Grade Search Functionality ---");
  const searchQueries: Array<{ query: string; expectedIds: string[]; minCount: number }> = [
    { query: "chu 3", expectedIds: ["prod-chu3"], minCount: 1 },
    { query: "chu iii", expectedIds: ["prod-chu3"], minCount: 1 },
    { query: "dusk", expectedIds: ["prod-dusk"], minCount: 1 },
    { query: "crinacle", expectedIds: ["prod-dusk"], minCount: 1 },
    { query: "hodddus", expectedIds: ["prod-dusk"], minCount: 1 },
    { query: "planar", expectedIds: ["prod-dusk"], minCount: 1 },
    { query: "al-mg", expectedIds: ["prod-chu3"], minCount: 1 },
    { query: "mimisbrunnr", expectedIds: ["prod-mimisbrunnr"], minCount: 1 },
    { query: "sonion", expectedIds: ["prod-mimisbrunnr"], minCount: 1 },
  ];

  for (const { query, expectedIds, minCount } of searchQueries) {
    const results = searchCatalog(allProducts, query);
    const hasExpected = expectedIds.every((id) => results.some((r) => r.id === id));
    assert(
      results.length >= minCount && hasExpected,
      `Search "${query}"`,
      `Found ${results.length} matches: ${results.slice(0, 3).map((r) => r.name).join("; ")}`
    );
  }

  // ----------------------------------------------------
  // 6. COLLECTION CATEGORY MATCHING (NO MISSING ITEMS)
  // ----------------------------------------------------
  console.log("\n--- 6. Verifying Collection Category Filtering ---");
  const headphoneMatches = allProducts.filter((item) => (item.category || "").toUpperCase().includes("HEADPHONE"));
  assert(headphoneMatches.length >= 12, "All headphones matched without exclusion", `Count: ${headphoneMatches.length}`);

  const cableMatches = allProducts.filter(
    (item) => (item.category || "").toUpperCase().includes("ACCESSORIES") || (item.category || "").toUpperCase().includes("CABLE")
  );
  assert(cableMatches.length >= 4, "All cables & accessories matched without exclusion", `Count: ${cableMatches.length}`);

  // ----------------------------------------------------
  // 7. CURATED METADATA PRESERVATION
  // ----------------------------------------------------
  console.log("\n--- 7. Verifying Authentic Curated Metadata Preservation ---");
  assert(
    chu3?.badge === "New Arrival",
    "Moondrop Chu 3 has 'New Arrival' badge preserved from catalog",
    chu3?.badge
  );
  assert(
    (chu3?.reviews || 0) >= 100,
    "Moondrop Chu 3 has authentic review count preserved",
    `${chu3?.reviews} reviews`
  );
  assert(
    dusk?.badge === "Hype Audiophile",
    "Moondrop Dusk has 'Hype Audiophile' badge preserved from catalog",
    dusk?.badge
  );
  assert(
    (dusk?.rating || 0) === 5.0,
    "Moondrop Dusk has 5.0 rating preserved from catalog",
    `${dusk?.rating}`
  );

  // ----------------------------------------------------
  // 8. COLLECTION CONNECTIVITY FILTERING VERIFICATION
  // ----------------------------------------------------
  console.log("\n--- 8. Verifying Collection Connectivity Filtering ---");
  const wired35Matches = allProducts.filter((item) => {
    const termUpper = (item.cableTermination || "").toUpperCase();
    const catUpper = (item.category || "").toUpperCase();
    return termUpper.includes("3.5") || termUpper.includes("SE") || termUpper.includes("SINGLE-ENDED");
  });
  assert(wired35Matches.length >= 10, "3.5mm SE filter matches wired products", `Count: ${wired35Matches.length}`);

  const bal44Matches = allProducts.filter((item) => {
    const termUpper = (item.cableTermination || "").toUpperCase();
    return termUpper.includes("4.4") || termUpper.includes("BAL");
  });
  assert(bal44Matches.length >= 6, "4.4mm BAL filter matches balanced products", `Count: ${bal44Matches.length}`);

  const wirelessMatches = allProducts.filter((item) => {
    const termUpper = (item.cableTermination || "").toUpperCase();
    const catUpper = (item.category || "").toUpperCase();
    return termUpper.includes("BLUETOOTH") || termUpper.includes("WIRELESS") || catUpper.includes("TWS");
  });
  assert(wirelessMatches.length >= 2, "Wireless filter matches Bluetooth and TWS gear", `Count: ${wirelessMatches.length}`);

  // ----------------------------------------------------
  // 9. GRAPH COMPARATOR AUDIOPHILE DATA
  // ----------------------------------------------------
  console.log("\n--- 9. Verifying Interactive Graph Comparator Data ---");
  const { COMPARATOR_IEMS } = await import("./src/components/GraphComparator");
  const hasChu3Graph = COMPARATOR_IEMS.some((i) => i.id === "prod-chu3" && i.points.length >= 10);
  const hasDuskGraph = COMPARATOR_IEMS.some((i) => i.id === "prod-dusk" && i.points.length >= 10);
  assert(hasChu3Graph, "Graph Comparator includes Moondrop CHU III frequency curve", `${COMPARATOR_IEMS.length} curves`);
  assert(hasDuskGraph, "Graph Comparator includes Moondrop Dusk frequency curve", `${COMPARATOR_IEMS.length} curves`);

  console.log("\n==================================================");
  console.log(`  FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runComprehensiveVerification().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
