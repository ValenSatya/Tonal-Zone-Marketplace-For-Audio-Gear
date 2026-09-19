import { userRepo, globalUserAddressCache, parseUserAddresses, DbUserAddress } from "../src/lib/supabase-db";

async function runAddressProfileSuite() {
  console.log("==========================================================");
  console.log("  TONALZONE AUTO-FILL ADDRESS BOOK & PROFILE SYNC SUITE  ");
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

  const testEmail = `test-buyer-${Date.now()}@audiophile.io`;

  // 1. Testing Address Parsing Helper
  console.log("--- 1. Testing Address Parsing Helper ---");
  const emptyParsed = parseUserAddresses(null);
  assert(
    Array.isArray(emptyParsed) && emptyParsed.length === 0,
    "parseUserAddresses handles null gracefully"
  );

  const plainStringParsed = parseUserAddresses("Indonesia");
  assert(
    Array.isArray(plainStringParsed) && plainStringParsed.length === 0,
    "parseUserAddresses handles plain string location gracefully"
  );

  const sampleList: DbUserAddress[] = [
    {
      id: "addr-test-1",
      label: "Rumah Utama",
      recipientName: "Test Buyer",
      phone: "+62 812-3344-5566",
      street: "Jl. Senopati No. 88",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12190",
      country: "Indonesia",
      isDefault: true,
    },
  ];
  const jsonParsed = parseUserAddresses(JSON.stringify(sampleList));
  assert(
    jsonParsed.length === 1 && jsonParsed[0].recipientName === "Test Buyer",
    "parseUserAddresses parses JSON array of DbUserAddress correctly"
  );

  // 2. Initial Empty State for New User
  console.log("\n--- 2. Testing Initial Empty State for New User ---");
  const initialAddresses = await userRepo.getAddresses(testEmail);
  assert(
    Array.isArray(initialAddresses) && initialAddresses.length === 0,
    "New user starts with zero dummy addresses (Zero Dummy Policy)",
    `Addresses count: ${initialAddresses.length}`
  );

  const initialDefault = await userRepo.getDefaultAddress(testEmail);
  assert(
    initialDefault === null,
    "Initial getDefaultAddress returns null for new user"
  );

  // 3. Saving First Address (Auto Default)
  console.log("\n--- 3. Testing Saving First Address (Auto-Default) ---");
  const saved1 = await userRepo.saveAddress(testEmail, {
    label: "Rumah Utama",
    recipientName: "Valen Audiophile",
    phone: "+62 812-1111-2222",
    street: "Jl. Sudirman No. 10, Senayan",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    postalCode: "10270",
    country: "Indonesia",
  });

  assert(
    saved1.isDefault === true,
    "First saved address is automatically marked as default",
    `Address ID: ${saved1.id}, isDefault: ${saved1.isDefault}`
  );

  const addressesAfter1 = await userRepo.getAddresses(testEmail);
  assert(
    addressesAfter1.length === 1 && addressesAfter1[0].street.includes("Sudirman"),
    "userRepo.getAddresses returns 1 address persisted in cache/DB",
    `Street: ${addressesAfter1[0].street}`
  );

  const defaultAfter1 = await userRepo.getDefaultAddress(testEmail);
  assert(
    defaultAfter1 !== null && defaultAfter1.id === saved1.id,
    "userRepo.getDefaultAddress returns the saved default address"
  );

  // 4. Adding Second Address (Non-default by default)
  console.log("\n--- 4. Testing Adding Second Address ---");
  const saved2 = await userRepo.saveAddress(testEmail, {
    label: "Studio Rekaman",
    recipientName: "Valen (Studio)",
    phone: "+62 811-9988-7766",
    street: "Gedung Akustik Lt. 3, Jl. Gatot Subroto",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12930",
    country: "Indonesia",
    isDefault: false,
  });

  assert(
    saved2.isDefault === false,
    "Second address with isDefault: false is not default",
    `Address ID: ${saved2.id}`
  );

  const addressesAfter2 = await userRepo.getAddresses(testEmail);
  assert(
    addressesAfter2.length === 2,
    "userRepo.getAddresses returns 2 addresses",
    `Total addresses: ${addressesAfter2.length}`
  );

  // 5. Switching Default Address
  console.log("\n--- 5. Testing Switching Default Address ---");
  const setDefaultOk = await userRepo.setDefaultAddress(testEmail, saved2.id);
  assert(setDefaultOk === true, "userRepo.setDefaultAddress returned true");

  const newDefault = await userRepo.getDefaultAddress(testEmail);
  assert(
    newDefault !== null && newDefault.id === saved2.id,
    "Default address successfully changed to the second address",
    `Current default: ${newDefault?.label}`
  );

  const addressesAfterSwitch = await userRepo.getAddresses(testEmail);
  const oldDefault = addressesAfterSwitch.find((a) => a.id === saved1.id);
  assert(
    oldDefault?.isDefault === false,
    "Previous default address is no longer default"
  );

  // 6. Updating Existing Address
  console.log("\n--- 6. Testing Updating Existing Address ---");
  const updated1 = await userRepo.saveAddress(testEmail, {
    id: saved1.id,
    label: "Rumah Utama (Updated)",
    recipientName: "Valen Audiophile Pro",
    phone: "+62 812-9999-0000",
    street: "Jl. Sudirman No. 10B, Senayan Suite",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    postalCode: "10270",
  });

  assert(
    updated1.recipientName === "Valen Audiophile Pro" && updated1.street.includes("Suite"),
    "Existing address updated successfully without creating duplicate",
    `New street: ${updated1.street}`
  );

  const addressesAfterUpdate = await userRepo.getAddresses(testEmail);
  assert(
    addressesAfterUpdate.length === 2,
    "Address count remains 2 after update"
  );

  // 7. Deleting Address and Maintaining Default Fallback
  console.log("\n--- 7. Testing Deleting Address ---");
  // Delete current default (saved2)
  const deleteOk = await userRepo.deleteAddress(testEmail, saved2.id);
  assert(deleteOk === true, "userRepo.deleteAddress returned true");

  const addressesAfterDelete = await userRepo.getAddresses(testEmail);
  assert(
    addressesAfterDelete.length === 1 && addressesAfterDelete[0].id === saved1.id,
    "Address successfully removed, 1 address remaining",
    `Remaining: ${addressesAfterDelete[0].label}`
  );

  const fallbackDefault = await userRepo.getDefaultAddress(testEmail);
  assert(
    fallbackDefault !== null && fallbackDefault.id === saved1.id && fallbackDefault.isDefault === true,
    "Remaining address automatically promoted to default when previous default was deleted"
  );

  // 8. Delete Last Address -> Clean Empty State
  console.log("\n--- 8. Testing Deleting Last Address ---");
  const deleteLastOk = await userRepo.deleteAddress(testEmail, saved1.id);
  assert(deleteLastOk === true, "Deleted last remaining address");

  const finalAddresses = await userRepo.getAddresses(testEmail);
  assert(
    finalAddresses.length === 0,
    "User address book is now completely empty"
  );

  const finalDefault = await userRepo.getDefaultAddress(testEmail);
  assert(finalDefault === null, "getDefaultAddress returns null when all addresses are deleted");

  console.log("\n==========================================================");
  console.log(`  RESULT: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log("==========================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runAddressProfileSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
