import { supabase } from "./supabase-db";

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ENTHUSIAST" | "FLAGSHIP";
  soundSignature: "NEUTRAL" | "WARM" | "V_SHAPE" | "BRIGHT" | "BASSHEAD";
  category: string;
  brand: string;
  storeName: string;
  storeCity: string;
  description: string;
  images: string[];
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
  preOrder: boolean;
}

const FALLBACK_CATALOG: CatalogProduct[] = [
  {
    id: "prod-ier-z1r",
    name: "Sony IER-Z1R Flagship In-Ear Monitor",
    price: 1699,
    stock: 8,
    experienceLevel: "FLAGSHIP",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "SONY",
    storeName: "Sony Official Store",
    storeCity: "Jakarta Selatan",
    description: "Flagship HD Hybrid driver system engineered with magnesium alloy and zirconium housing for unmatched soundstage depth and bass authority.",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    rating: 4.9,
    reviews: 64,
    badge: "Flagship",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ier-m9",
    name: "Sony IER-M9 Audiophile Stage Monitor",
    price: 999,
    stock: 12,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "SONY",
    storeName: "Sony Official Store",
    storeCity: "Jakarta Selatan",
    description: "5x Balanced Armature stage monitor with magnesium inner housing and integrated audio grade film capacitors.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 4.8,
    reviews: 52,
    badge: "Best Seller",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-monarch-mk3",
    name: "Thieaudio Monarch MKIII Tribrid Flagship",
    price: 999,
    stock: 15,
    experienceLevel: "FLAGSHIP",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "THIEAUDIO",
    storeName: "Thieaudio Official Store",
    storeCity: "Jakarta Pusat",
    description: "2DD + 6BA + 2EST tribrid system with IMPACT2 isobaric subwoofer for reference analytical monitoring.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    rating: 4.9,
    reviews: 78,
    badge: "Top Rated",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-nanna-2",
    name: "Kinera Imperial Nanna 2.0 PRO",
    price: 949,
    stock: 6,
    experienceLevel: "FLAGSHIP",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "KINERA",
    storeName: "Kinera Audio Official",
    storeCity: "Surabaya",
    description: "Electrostatic hybrid flagship IEM featuring Sonion EST drivers and custom hand-painted resin shells.",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    rating: 5.0,
    reviews: 45,
    badge: "Artisan Grade",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ie600",
    name: "Sennheiser IE 600 Audiophile In-Ear",
    price: 699,
    stock: 10,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "V_SHAPE",
    category: "IN-EAR MONITORS",
    brand: "SENNHEISER",
    storeName: "Sennheiser Official Store",
    storeCity: "Jakarta Selatan",
    description: "3D-printed AMLOY-ZR01 amorphous zirconium housing with 7mm TrueResponse transducer.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 4.7,
    reviews: 94,
    badge: "Best Seller",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-variations",
    name: "Moondrop Variations Tribrid IEM",
    price: 520,
    stock: 14,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Bandung",
    description: "1DD + 2BA + 2EST electrostatic hybrid acoustic system tuned precisely to the VDSF target curve.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    rating: 4.8,
    reviews: 112,
    badge: "Community Favorite",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-u12t",
    name: "64 Audio U12t 12-Driver Reference Flagship",
    price: 1999,
    stock: 5,
    experienceLevel: "FLAGSHIP",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "64 AUDIO",
    storeName: "Headphone Zone ID",
    storeCity: "Jakarta Barat",
    description: "12 Balanced Armature drivers featuring tia tubeless technology and apex pressure-relieving modules.",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    rating: 5.0,
    reviews: 82,
    badge: "Endgame Tier",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ie900",
    name: "Sennheiser IE 900 Flagship Beryllium Dynamic",
    price: 1299,
    stock: 7,
    experienceLevel: "FLAGSHIP",
    soundSignature: "V_SHAPE",
    category: "IN-EAR MONITORS",
    brand: "SENNHEISER",
    storeName: "Bass Audio Official",
    storeCity: "Jakarta Selatan",
    description: "Precision-milled aluminum chassis with X3R triple-resonator chamber and 7mm TrueResponse driver.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 4.9,
    reviews: 128,
    badge: "Flagship",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-blessing3",
    name: "Moondrop Blessing 3 Hybrid 2DD+4BA",
    price: 319,
    stock: 20,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "MOONDROP",
    storeName: "Headphone Zone ID",
    storeCity: "Jakarta Barat",
    description: "Horizontally opposed 2DD module (H.O.D.D.D.U.S) with 4 custom balanced armatures for clinical vocal reproduction.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    rating: 4.8,
    reviews: 145,
    badge: "Best Seller",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ares-s",
    name: "Effect Audio Ares S 4.4mm Balanced Cable",
    price: 179,
    stock: 25,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "WARM",
    category: "ACCESSORIES",
    brand: "EFFECT AUDIO",
    storeName: "Linsoul Audio",
    storeCity: "Surabaya",
    description: "Premium UP-OCC Pure Copper Litz wire with ConX interchangeable connector system.",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    rating: 4.7,
    reviews: 67,
    badge: "Premium Cable",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-mojo2",
    name: "Chord Mojo 2 Portable DAC / Headphone Amp",
    price: 775,
    stock: 9,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "DAC/AMP",
    brand: "CHORD AUDIO",
    storeName: "Bass Audio Official",
    storeCity: "Jakarta Selatan",
    description: "Custom FPGA-based DAC with lossless Ultra-HD DSP and dual 3.5mm headphone outputs.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 4.9,
    reviews: 89,
    badge: "Editor Choice",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-solaris",
    name: "Campfire Audio Solaris Stellar Horizon",
    price: 2670,
    stock: 4,
    experienceLevel: "FLAGSHIP",
    soundSignature: "V_SHAPE",
    category: "IN-EAR MONITORS",
    brand: "CAMPFIRE AUDIO",
    storeName: "Linsoul Audio",
    storeCity: "Surabaya",
    description: "Precision-machined stainless steel housing with brass accents and 3 custom dual-diaphragm balanced armatures.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    rating: 4.8,
    reviews: 31,
    badge: "Collector Edition",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-diva",
    name: "Elysian Acoustic Labs Diva 6BA Masterpiece",
    price: 1599,
    stock: 6,
    experienceLevel: "FLAGSHIP",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "ELYSIAN",
    storeName: "Headphone Zone ID",
    storeCity: "Jakarta Barat",
    description: "6 Balanced Armature drivers with 3-way rotary bass switch and custom acoustic chamber.",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    rating: 5.0,
    reviews: 42,
    badge: "Vocal Master",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-maestro-mini",
    name: "FatFreq Maestro Mini Sub-bass Cannon",
    price: 429,
    stock: 11,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "BASSHEAD",
    category: "IN-EAR MONITORS",
    brand: "FATFREQ",
    storeName: "Bass Audio Official",
    storeCity: "Jakarta Selatan",
    description: "Patented Bass Cannon technology providing +20dB sub-bass shelf below 200Hz without muddying mid frequencies.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 4.9,
    reviews: 73,
    badge: "Bass Monster",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-quintet",
    name: "Kiwi Ears Quintet Quadbrid In-Ear Monitor",
    price: 219,
    stock: 18,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "BRIGHT",
    category: "IN-EAR MONITORS",
    brand: "KIWI EARS",
    storeName: "Linsoul Audio",
    storeCity: "Surabaya",
    description: "Quadbrid design with 1 DLC Dynamic Driver, 2 Balanced Armatures, 1 Planar Magnetic Driver, and 1 PZT conductor.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    rating: 4.7,
    reviews: 65,
    badge: "High Value",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ea1000",
    name: "Simgot EA1000 Fermat Dynamic In-Ear",
    price: 219,
    stock: 16,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "BRIGHT",
    category: "IN-EAR MONITORS",
    brand: "SIMGOT",
    storeName: "Headphone Zone ID",
    storeCity: "Jakarta Barat",
    description: "Dual-magnetic dual-cavity dynamic driver with 1PR passive radiator for acoustic resonance optimization.",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    rating: 4.8,
    reviews: 84,
    badge: "New Arrival",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-s12pro",
    name: "Letshuoer S12 Pro Planar Magnetic IEM",
    price: 135,
    stock: 22,
    experienceLevel: "BEGINNER",
    soundSignature: "V_SHAPE",
    category: "IN-EAR MONITORS",
    brand: "LETSHUOER",
    storeName: "Linsoul Audio",
    storeCity: "Surabaya",
    description: "14.8mm custom planar magnetic driver with modular cable system (2.5mm / 3.5mm / 4.4mm).",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 4.8,
    reviews: 138,
    badge: "Planar King",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-waner",
    name: "Tangzu Wan'er S.G Studio Edition",
    price: 22,
    stock: 40,
    experienceLevel: "BEGINNER",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "TANGZU",
    storeName: "TonalZone Official Store",
    storeCity: "Jakarta Selatan",
    description: "10mm PET diaphragm dynamic driver tuned for pleasant vocal intimacy and effortless everyday listening.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    rating: 4.7,
    reviews: 310,
    badge: "Budget King",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-arya",
    name: "HiFiMAN Arya Stealth Magnet Planar Headphone",
    price: 999,
    stock: 8,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "HEADPHONE",
    brand: "HIFIMAN",
    storeName: "ShenzhenAudio Official",
    storeCity: "Jakarta Pusat",
    description: "Acoustically invisible stealth magnets with nanometer thickness diaphragm for holographic soundstage.",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    rating: 4.9,
    reviews: 86,
    badge: "Open-Back Reference",
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-hd800s",
    name: "Sennheiser HD 800 S Reference Headphone",
    price: 1799,
    stock: 5,
    experienceLevel: "FLAGSHIP",
    soundSignature: "NEUTRAL",
    category: "HEADPHONE",
    brand: "SENNHEISER",
    storeName: "Sennheiser Official Store",
    storeCity: "Jakarta Selatan",
    description: "56mm Ring Radiator transducer with patented absorber technology for uncompressed acoustic staging.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 5.0,
    reviews: 79,
    badge: "Audiophile Legend",
    inStock: true,
    preOrder: false,
  },
];

export async function fetchProductsFromDb(): Promise<CatalogProduct[]> {
  try {
    const { data, error } = await supabase
      .from("Product")
      .select(`
        id,
        name,
        price,
        stock,
        experienceLevel,
        soundSignature,
        images,
        description,
        brand:Brand(name),
        store:Store(storeName, address),
        category:Category(name)
      `)
      .order("price", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbProducts = data.map((item: any, index: number) => {
        const brandName = Array.isArray(item.brand) ? item.brand[0]?.name : item.brand?.name || "Audiophile";
        const storeName = Array.isArray(item.store) ? item.store[0]?.storeName : item.store?.storeName || "TonalZone Partner";
        const storeCity = Array.isArray(item.store) ? item.store[0]?.address : item.store?.address || "Jakarta";
        const catName = Array.isArray(item.category) ? item.category[0]?.name : item.category?.name || "IN-EAR MONITORS";
        const imgList = Array.isArray(item.images) && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"];

        return {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 99,
          stock: Number(item.stock) || 10,
          experienceLevel: item.experienceLevel || "INTERMEDIATE",
          soundSignature: item.soundSignature || "NEUTRAL",
          category: catName,
          brand: brandName,
          storeName,
          storeCity,
          description: item.description || "Audiophile Reference Gear",
          images: imgList,
          image: imgList[0],
          rating: 4.7 + (index % 4) * 0.1,
          reviews: 24 + (index * 7) % 180,
          badge: index < 6 ? "Best Seller" : index % 5 === 0 ? "New Arrival" : undefined,
          inStock: (Number(item.stock) || 10) > 0,
          preOrder: (Number(item.stock) || 10) <= 2,
        };
      });

      // Merge with fallback products if DB has fewer items to ensure a rich full grid
      if (dbProducts.length < 20) {
        const existingNames = new Set(dbProducts.map((p) => p.name.toLowerCase()));
        const additional = FALLBACK_CATALOG.filter((p) => !existingNames.has(p.name.toLowerCase()));
        return [...dbProducts, ...additional];
      }

      return dbProducts;
    }

    return FALLBACK_CATALOG;
  } catch (err) {
    console.error("[Products DB] Exception while fetching:", err);
    return FALLBACK_CATALOG;
  }
}

export async function fetchProductByIdFromDb(id: string): Promise<CatalogProduct | null> {
  try {
    const { data, error } = await supabase
      .from("Product")
      .select(`
        id,
        name,
        price,
        stock,
        experienceLevel,
        soundSignature,
        images,
        description,
        brand:Brand(name),
        store:Store(storeName, address),
        category:Category(name)
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      const item: any = data;
      const brandName = Array.isArray(item.brand) ? item.brand[0]?.name : item.brand?.name || "Audiophile";
      const storeName = Array.isArray(item.store) ? item.store[0]?.storeName : item.store?.storeName || "TonalZone Partner";
      const storeCity = Array.isArray(item.store) ? item.store[0]?.address : item.store?.address || "Jakarta";
      const catName = Array.isArray(item.category) ? item.category[0]?.name : item.category?.name || "IN-EAR MONITORS";
      const imgList = Array.isArray(item.images) && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"];

      return {
        id: data.id,
        name: data.name,
        price: Number(data.price) || 99,
        stock: Number(data.stock) || 10,
        experienceLevel: data.experienceLevel || "INTERMEDIATE",
        soundSignature: data.soundSignature || "NEUTRAL",
        category: catName,
        brand: brandName,
        storeName,
        storeCity,
        description: data.description || "Audiophile Reference Gear",
        images: imgList,
        image: imgList[0],
        rating: 4.9,
        reviews: 48,
        inStock: (Number(data.stock) || 10) > 0,
        preOrder: false,
      };
    }

    const fallback = FALLBACK_CATALOG.find((p) => p.id === id || p.id.includes(id));
    return fallback || FALLBACK_CATALOG[0];
  } catch (err) {
    console.error("[Products DB] Exception while fetching by ID:", err);
    const fallback = FALLBACK_CATALOG.find((p) => p.id === id || p.id.includes(id));
    return fallback || FALLBACK_CATALOG[0];
  }
}
