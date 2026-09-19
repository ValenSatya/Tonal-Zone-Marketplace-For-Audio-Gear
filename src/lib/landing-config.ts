import { supabase } from "./supabase";

export interface HeroConfig {
  productId?: string;
  productName: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

export interface CollaborationConfig {
  productId?: string;
  title: string;
  description: string;
  bgImage: string;
  productImage1: string;
  productImage2: string;
  features: string[];
  price?: string;
  badge?: string;
  ctaLink?: string;
}

export interface BestSellerItem {
  id: string;
  brand: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface StartJourneyItem {
  id: string;
  name: string;
  fallbackPrice: number;
  image: string;
  layout: "landscape" | "square" | "tall";
}

export interface NewArrivalsConfig {
  earphones: string[];
  tws: string[];
  cable: string[];
  headphones: string[];
}

export interface LandingConfig {
  hero: HeroConfig;
  collaboration: CollaborationConfig;
  new_arrivals?: NewArrivalsConfig;
  best_sellers?: BestSellerItem[];
  start_journey?: StartJourneyItem[];
  updated_at?: string;
}

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  hero: {
    productId: "prod-chu3",
    productName: "CHU III",
    description:
      "Engineered with a high-performance 10mm dynamic driver featuring an Aluminum-Magnesium alloy dome composite diaphragm and brass CNC acoustic nozzle, delivering pure acoustic clarity and neutral reference sound.",
    imageUrl: "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp",
    ctaText: "SHOP NOW",
    ctaLink: "/product/prod-chu3",
  },
  collaboration: {
    productId: "prod-sparxie",
    title: "Moondrop X HSR Sparxie TWS",
    description:
      "Kolaborasi resmi HoYoverse Honkai: Star Rail bersama Moondrop menghadirkan TWS audiophile edisi karakter Sparkle. Ditenagai RT-Adaptive ANC, driver wood-dome 10mm, dan suara pemandu eksklusif Sparkle.",
    bgImage: "/images/collab-hsr-moondrop-bg.png",
    productImage1: "/images/collab-sparxie-case.png",
    productImage2: "/images/collab-sparxie-earbuds.png",
    features: ["RT-Adaptive ANC", "Wood Dome 10mm", "VDSF Target DSP"],
    price: "RP 1.400.000",
    badge: "Official Collab",
    ctaLink: "/product/prod-sparxie",
  },
  new_arrivals: {
    earphones: ["prod-mimisbrunnr", "prod-epz-g30", "prod-wukong", "prod-chu3"],
    tws: ["prod-sparxie", "prod-space-travel", "prod-1787470518714-cj4rsl"],
    cable: ["prod-1787470526368-n80zbk"],
    headphones: [],
  },
  best_sellers: [
    {
      id: "prod-waner-sg2",
      brand: "TANGZU",
      title: "TANGZU WAN'ER SG 2",
      description:
        "The highly anticipated successor featuring a dual-cavity dynamic driver and artisan Red Lion faceplate, delivering lush musical warmth and smooth vocal presence.",
      image: "/images/tangzu-waner-redlion-official.webp",
      href: "/product/prod-waner-sg2",
    },
    {
      id: "prod-chu3",
      brand: "MOONDROP",
      title: "MOONDROP CHU III",
      description:
        "Next-generation 10mm high-performance composite diaphragm dynamic driver with alloy casting acoustic cavity, brass CNC acoustic nozzle, and pure reference clarity.",
      image: "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp",
      href: "/product/prod-chu3",
    },
    {
      id: "prod-tanchjim-nora",
      brand: "TANCHJIM",
      title: "TANCHJIM NORA",
      description:
        "Dual-magnetic dynamic driver architecture powered by Tanchjim's patented DMT acoustic cavity, reproducing pristine instrumental separation and transparent vocal clarity.",
      image: "/images/tanchjim-nora-showcase.webp",
      href: "/product/prod-tanchjim-nora",
    },
    {
      id: "prod-kiwi-cadenza",
      brand: "KIWI EARS",
      title: "KIWI EARS CADENZA",
      description:
        "Acclaimed 10mm beryllium-coated dynamic driver housed in an artisan medical-grade 3D printed resin shell, celebrated for punchy bass authority and natural musical timbre.",
      image: "/images/kiwi-ears-cadenza-gallery.webp",
      href: "/product/prod-kiwi-cadenza",
    },
  ],
  start_journey: [
    {
      id: "prod-chu3",
      name: "Moondrop CHU III",
      fallbackPrice: 24.99,
      image: "/images/transparent/chu3-transparent.png",
      layout: "landscape",
    },
    {
      id: "prod-kiwi-cadenza",
      name: "Kiwi Ears Cadenza",
      fallbackPrice: 35.0,
      image: "/images/transparent/cadenza-transparent.png",
      layout: "landscape",
    },
    {
      id: "prod-waner-redlion",
      name: "Tangzu Wan'er SG 2 Red Lion",
      fallbackPrice: 23.0,
      image: "/images/transparent/waner-redlion-transparent.png",
      layout: "square",
    },
    {
      id: "prod-7hz-zero",
      name: "7Hz Salnotes Zero",
      fallbackPrice: 20.0,
      image: "/images/transparent/7hz-zero-transparent.png",
      layout: "square",
    },
    {
      id: "prod-waner",
      name: "Tangzu Wan'er S.G",
      fallbackPrice: 22.0,
      image: "/images/transparent/waner-sg-transparent.png",
      layout: "square",
    },
    {
      id: "prod-space-travel",
      name: "Moondrop Space Travel",
      fallbackPrice: 25.0,
      image: "/images/transparent/space-travel-transparent.png",
      layout: "tall",
    },
  ],
};

export async function fetchLandingConfigFromDb(): Promise<LandingConfig> {
  try {
    const { data, error } = await supabase
      .from("LandingConfig")
      .select("*")
      .eq("id", "current")
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_LANDING_CONFIG;
    }

    return {
      hero: data.hero || DEFAULT_LANDING_CONFIG.hero,
      collaboration: data.collaboration || DEFAULT_LANDING_CONFIG.collaboration,
      new_arrivals: data.new_arrivals || DEFAULT_LANDING_CONFIG.new_arrivals,
      best_sellers: data.best_sellers || DEFAULT_LANDING_CONFIG.best_sellers,
      start_journey: data.start_journey || DEFAULT_LANDING_CONFIG.start_journey,
      updated_at: data.updated_at,
    };
  } catch (err) {
    return DEFAULT_LANDING_CONFIG;
  }
}

export async function saveLandingConfigToDb(config: Partial<LandingConfig>): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: "current",
      hero: config.hero || DEFAULT_LANDING_CONFIG.hero,
      collaboration: config.collaboration || DEFAULT_LANDING_CONFIG.collaboration,
      new_arrivals: config.new_arrivals || DEFAULT_LANDING_CONFIG.new_arrivals,
      best_sellers: config.best_sellers || DEFAULT_LANDING_CONFIG.best_sellers,
      start_journey: config.start_journey || DEFAULT_LANDING_CONFIG.start_journey,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("LandingConfig")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("[LandingConfig] Upsert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save configuration" };
  }
}
