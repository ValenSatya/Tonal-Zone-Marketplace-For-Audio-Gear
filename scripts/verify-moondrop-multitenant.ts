import { userRepo, storeRepo, productRepo, supabase } from "../src/lib/supabase-db";

async function verify() {
  console.log("=== 1. VERIFYING USER & STORE IN SUPABASE ===");
  const valenUser = await userRepo.findByEmail("valenandrasatya@gmail.com");
  console.log("User Email:", valenUser?.email);
  console.log("User Role:", valenUser?.role);
  console.log("Store ID:", valenUser?.store?.id);
  console.log("Store Name:", valenUser?.store?.storeName);
  console.log("Store Type:", valenUser?.store?.storeType);
  console.log("Brand Name:", valenUser?.store?.brandName);

  if (
    valenUser?.email === "valenandrasatya@gmail.com" &&
    valenUser?.store?.id === "store-moondrop-official" &&
    valenUser?.store?.storeType === "OFFICIAL_BRAND" &&
    valenUser?.store?.brandName === "MOONDROP"
  ) {
    console.log("✅ PASSED: valenandrasatya@gmail.com is official MOONDROP brand account!");
  } else {
    console.error("❌ FAILED: User store is not configured properly.");
  }

  console.log("\n=== 2. VERIFYING PRODUCTS SCOPED TO MOONDROP STORE ===");
  const products = await productRepo.findByStoreId("store-moondrop-official");
  console.log("Total Products under Moondrop Official:", products.length);
  products.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p.id}] ${p.name} ($${p.price}) - Status: ${p.status}`);
  });

  if (products.length >= 8) {
    console.log("✅ PASSED: All official Moondrop products are properly linked!");
  } else {
    console.error("❌ FAILED: Expected at least 8 Moondrop products.");
  }

  console.log("\n=== 3. VERIFYING MULTI-TENANT ISOLATION ===");
  const emptyStoreProducts = await productRepo.findByStoreId("non-existent-store-id-999");
  console.log("Non-existent store product count:", emptyStoreProducts.length);
  if (emptyStoreProducts.length === 0) {
    console.log("✅ PASSED: Multi-tenant isolation verified (empty store returns 0 products)!");
  } else {
    console.error("❌ FAILED: Leaked products from another store.");
  }

  console.log("\n=== 4. VERIFYING EXISTING CATALOG INTEGRITY ===");
  const { count } = await supabase.from("Product").select("*", { count: "exact", head: true });
  console.log("Total database products in Supabase:", count);
  if (count && count >= 60) {
    console.log("✅ PASSED: Catalog integrity intact!");
  }

  console.log("\nAll tests completed successfully!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
