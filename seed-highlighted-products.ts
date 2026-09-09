import { config } from "dotenv";
import { userRepo, storeRepo, brandRepo, categoryRepo, productRepo } from "./src/lib/supabase-db";

config({ path: ".env.local" });
config({ path: ".env" });

const PRODUCTS_TO_SEED = [
  {
    id: "prod-chu3",
    name: "Moondrop CHU III High-Performance Dynamic In-Ear Monitor",
    brand: "MOONDROP",
    category: "IN-EAR MONITORS",
    storeName: "Moondrop Official Store",
    storeCity: "Jakarta Pusat",
    price: 24.99,
    stock: 120,
    experienceLevel: "BEGINNER",
    soundSignature: "NEUTRAL",
    images: [
      "/images/chu3-preview-1.webp",
      "/images/chu3-preview-2.webp",
      "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp",
      "/images/Headphone-Zone-Moondrop-Chu-II-01.jpg",
    ],
    description:
      "Engineered with a high-performance 10mm dynamic driver featuring an Aluminum-Magnesium alloy dome composite diaphragm and brass CNC acoustic nozzle, delivering pure acoustic clarity and neutral reference sound.",
  },
  {
    id: "prod-dusk",
    name: "Moondrop x Crinacle Dusk Tribrid In-Ear Monitor",
    brand: "MOONDROP",
    category: "IN-EAR MONITORS",
    storeName: "Moondrop Official Store",
    storeCity: "Jakarta Pusat",
    price: 359,
    stock: 45,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    images: [
      "/figma/dusk-iem.png",
      "/figma/dusk-blueprint.png",
      "/figma/iem-extracted.png",
    ],
    description:
      "Two Dynamic Drivers + Two Balanced Armatures + Two Planar Drivers + Triplicate Hybrid Three-Way Frequency Crossover. Building on Blessing 3's split-composite physical frequency separation framework, DUSK optimizes treble definition and planar timbre through Crinacle collaborative tuning.",
  },
  {
    id: "prod-mimisbrunnr",
    name: "Mimisbrunnr Flagship Electrostatic Hybrid IEM",
    brand: "MIMISBRUNNR",
    category: "IN-EAR MONITORS",
    storeName: "Audiophile Lab Surabaya",
    storeCity: "Surabaya",
    price: 899,
    stock: 15,
    experienceLevel: "FLAGSHIP",
    soundSignature: "NEUTRAL",
    images: ["/figma/prod-mimisbrunnr.png"],
    description:
      "Ultra-high-end flagship acoustic monitor named after the mythical well of wisdom. Multi-driver electrostatic hybrid architecture in an artisan resin cavity for transcendent resolution, expansive 3D stage depth, and sublime tonal neutrality.",
  },
  {
    id: "prod-epz-g30",
    name: "EPZ G30 Gaming & Studio In-Ear Monitor",
    brand: "EPZ",
    category: "IN-EAR MONITORS",
    storeName: "EPZ Official Store",
    storeCity: "Surabaya",
    price: 92,
    stock: 60,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "V_SHAPE",
    images: ["/figma/prod-epz-g30.png"],
    description:
      "Engineered specifically for competitive esports positioning and high-impact dynamic audio with dual-cavity composite dynamic driver and balanced armature setup for pinpoint tactical soundscapes.",
  },
  {
    id: "prod-wukong",
    name: "Tangzu WuKong Flagship Multi-Driver IEM",
    brand: "TANGZU",
    category: "IN-EAR MONITORS",
    storeName: "Tangzu Official Store",
    storeCity: "Yogyakarta",
    price: 2150,
    stock: 8,
    experienceLevel: "FLAGSHIP",
    soundSignature: "WARM",
    images: ["/figma/prod-wukong.png"],
    description:
      "Tangzu's pinnacle acoustic creation inspired by the legendary Sun Wukong. 1DD + 6BA + 2EST tribrid architecture in hand-carved gold-leaf artisan housing, offering regal midrange richness and effortless treble extension.",
  },
  {
    id: "prod-momentum4",
    name: "Sennheiser Momentum 4 Wireless Audiophile Headphones",
    brand: "SENNHEISER",
    category: "HEADPHONES",
    storeName: "Sennheiser Official Store",
    storeCity: "Jakarta Selatan",
    price: 349.95,
    stock: 35,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "WARM",
    images: ["/figma/sennheiser-sec.png"],
    description:
      "Signature Sennheiser audiophile transducer system with adaptive hybrid noise cancellation, crystal-clear calls, 60-hour battery life, and high-resolution sound with aptX Adaptive codec support.",
  },
  {
    id: "prod-hd600",
    name: "Sennheiser HD 600 Audiophile Classic Open-Back Headphones",
    brand: "SENNHEISER",
    category: "HEADPHONES",
    storeName: "Sennheiser Official Store",
    storeCity: "Jakarta Selatan",
    price: 449.95,
    stock: 25,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    images: ["/figma/sennheiser-main.png"],
    description:
      "The legendary benchmark of acoustic fidelity and midrange neutrality for mastering studios and discerning audiophiles worldwide. Open-back circumaural design with acoustically transparent metal mesh.",
  },
  {
    id: "prod-blessing3",
    name: "Moondrop Blessing 3 Hybrid 2DD+4BA In-Ear Monitor",
    brand: "MOONDROP",
    category: "IN-EAR MONITORS",
    storeName: "Moondrop Official Store",
    storeCity: "Bandung",
    price: 319.99,
    stock: 30,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    images: [
      "/figma/hero-bg.png",
      "/hero-blessing-3.jpg",
      "/hero-blessing-3-right.jpg",
    ],
    description:
      "Horizontally opposed 2DD module (H.O.D.D.D.U.S) with 4 custom balanced armatures for clinical vocal reproduction, razor-sharp transient response, and expansive spatial imaging.",
  },
];

async function seed() {
  console.log("Starting seed of highlighted authentic products to Supabase...");
  const storeCache = new Map<string, any>();

  for (const item of PRODUCTS_TO_SEED) {
    // 1. Store & Seller User
    let store = storeCache.get(item.storeName);
    if (!store) {
      store = await storeRepo.findByName(item.storeName);
      if (!store) {
        const slug = item.storeName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const userEmail = `${slug}@tonalzone.id`;
        let storeUser = await userRepo.findByEmail(userEmail);
        if (!storeUser) {
          storeUser = await userRepo.upsert({
            email: userEmail,
            name: item.storeName,
            role: "SELLER",
            location: item.storeCity,
            language: "id",
          });
        }
        store = storeUser.store || (await storeRepo.findByUserId(storeUser.id));
        if (!store) {
          store = await storeRepo.create({
            userId: storeUser.id,
            storeName: item.storeName,
            description: `Official audiophile retailer operating from ${item.storeCity}.`,
            address: item.storeCity,
            status: "APPROVED",
          });
        }
      }
      storeCache.set(item.storeName, store);
    }

    // 2. Category
    const category = await categoryRepo.upsert(item.category);

    // 3. Brand
    const brand = await brandRepo.upsert(item.brand, store?.id);

    // 4. Upsert Product with explicit ID
    const saved = await productRepo.upsert({
      id: item.id,
      name: item.name,
      storeId: store.id,
      brandId: brand.id,
      categoryId: category.id,
      description: item.description,
      price: item.price,
      stock: item.stock,
      experienceLevel: item.experienceLevel,
      soundSignature: item.soundSignature,
      images: item.images,
    });

    if (saved) {
      console.log(`[✓ UPSERTED] ${item.id} -> ${item.name} (${item.brand}) in Supabase`);
    } else {
      console.error(`[✗ FAILED] ${item.id}`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
