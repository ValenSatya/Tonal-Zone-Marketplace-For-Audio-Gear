import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { userRepo, storeRepo, brandRepo, categoryRepo, productRepo } from "./src/lib/supabase-db";

config({ path: ".env.local" });
config({ path: ".env" });

async function importDatasetToDatabase(filePath: string = "tonalzone_master_products_template.xlsx") {
  const fullPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`\n[Error] File not found: ${fullPath}\n`);
    return;
  }

  let rows: any[] = [];

  if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls")) {
    const workbook = XLSX.readFile(fullPath);
    const sheetName = workbook.SheetNames[0];
    rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } else {
    const csvContent = fs.readFileSync(fullPath, "utf-8");
    const workbook = XLSX.read(csvContent, { type: "string" });
    const sheetName = workbook.SheetNames[0];
    rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  }

  if (!rows || rows.length === 0) {
    console.error("[Error] File is empty or no valid rows found.");
    return;
  }

  console.log(`\n============================================================`);
  console.log(`[Import] Processing dataset from: ${path.basename(filePath)} (Pure Supabase)`);
  console.log(`[Import] Detected ${rows.length} product records...`);
  console.log(`============================================================\n`);

  // Clean old products to ensure clean sync with master dataset
  try {
    await productRepo.deleteMany();
    console.log(`[Import] Previous product entries cleaned for fresh sync.`);
  } catch (e: any) {
    console.log(`[Notice] Clean skipped:`, e.message);
  }

  let importedCount = 0;
  const storeCache = new Map<string, any>();

  for (const row of rows) {
    const getField = (keyName: string): any => {
      const target = keyName.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const k of Object.keys(row)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === target) {
          return row[k];
        }
      }
      return undefined;
    };

    const storeName = getField("storename") || "TonalZone Official Store";
    const storeCity = getField("storecity") || "Jakarta Selatan";
    const productName = getField("productname") || getField("name") || "Universal Audio Product";
    const brandName = getField("brand") || "Generic Audio";
    const categoryName = (getField("category") || "IN-EAR MONITORS").toString().toUpperCase().trim();
    const specsSummary = getField("specssummary") || "";
    const description = getField("description") || specsSummary || "Audiophile High Fidelity Acoustic Equipment";
    const priceUSD = parseFloat(String(getField("priceusd") || getField("price") || 99).replace(/[^0-9.]/g, "")) || 99;
    const stock = parseInt(String(getField("stock") || 10).replace(/[^0-9]/g, ""), 10) || 10;
    const expLevelStr = (getField("experiencelevel") || "INTERMEDIATE").toString().toUpperCase().trim();
    const soundSigStr = (getField("soundsignature") || "NEUTRAL").toString().toUpperCase().trim();
    const imagesVal = getField("images") || "";

    const images = typeof imagesVal === "string" && imagesVal.length > 0
      ? imagesVal.split(";").map((u: string) => u.trim()).filter(Boolean)
      : ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"];

    // 1. Ensure Store & Merchant User exist
    let store = storeCache.get(storeName);
    if (!store) {
      store = await storeRepo.findByName(storeName);
      if (!store) {
        const slug = storeName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const userEmail = `${slug || "seller"}@tonalzone.id`;
        
        let storeUser = await userRepo.findByEmail(userEmail);
        if (!storeUser) {
          storeUser = await userRepo.upsert({
            email: userEmail,
            name: storeName,
            role: "SELLER",
            location: storeCity,
            language: "id",
          });
        }

        store = storeUser.store || (await storeRepo.findByUserId(storeUser.id));

        if (!store) {
          store = await storeRepo.create({
            userId: storeUser.id,
            storeName,
            description: `Official audiophile retailer operating from ${storeCity}.`,
            address: storeCity,
            status: "APPROVED",
          });
        }
      }
      storeCache.set(storeName, store);
    }

    // 2. Ensure Category exists
    const category = await categoryRepo.upsert(categoryName);

    // 3. Ensure Brand exists
    const brand = await brandRepo.upsert(brandName, store?.id);

    // 4. Create Product
    const created = await productRepo.create({
      storeId: store.id,
      brandId: brand.id,
      categoryId: category.id,
      name: productName,
      description,
      price: priceUSD,
      stock,
      experienceLevel: expLevelStr as any,
      soundSignature: soundSigStr as any,
      images,
    });

    if (created) {
      importedCount++;
      console.log(`[✓ ${importedCount}/${rows.length}] ${productName} | ${brandName} | ${storeName} ($${priceUSD})`);
    }
  }

  console.log(`\n============================================================`);
  console.log(`🎉 SUCCESS! Successfully imported ${importedCount} products into Supabase.`);
  console.log(`============================================================\n`);
}

const targetFile = process.argv[2] || "tonalzone_master_products_template.xlsx";
importDatasetToDatabase(targetFile).catch((err) => {
  console.error("Import failed:", err);
});
