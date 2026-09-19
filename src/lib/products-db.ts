import { supabase } from "./supabase";

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ENTHUSIAST" | "FLAGSHIP";
  soundSignature: "NEUTRAL" | "WARM" | "V_SHAPE" | "BRIGHT" | "BASSHEAD";
  category: string;
  brand: string;
  storeId?: string;
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
  driverType?: string;
  material?: string;
  tuning?: string;
  impedance?: string;
  sensitivity?: string;
  frequencyResponse?: string;
  cableTermination?: string;
  squiglinkUrl?: string;
  variants?: any;
  colors?: any;
}

export const PRODUCT_SPECS_MAP: Record<string, Partial<CatalogProduct>> = {
  "prod-waner-sg2": {
    driverType: "10mm PET Diaphragm Dual-Cavity Dynamic Driver with N52 Neodymium Magnets",
    material: "Acoustic Resin Housing with Fish-Scale Geometric Wave Faceplate",
    tuning: "Tangzu Balanced-Linear Target Curve",
    impedance: "16Ω (@1kHz)",
    sensitivity: "107dB/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Silver-Plated OFC Cable",
    squiglinkUrl: "https://squig.link/?share=Tangzu_Waner",
  },
  "prod-waner-redlion": {
    driverType: "10mm PET Diaphragm Dual-Cavity Dynamic Driver with Cultural Resonance Chamber",
    material: "Ruby Red Translucent Acoustic Resin with 3D Sculpted Lion Relief & CNC Gold Brass Nozzle",
    tuning: "Tangzu Warm-Musical Target with Expressive Vocal Presence",
    impedance: "16Ω (@1kHz)",
    sensitivity: "107dB/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin High-Purity OFC Detachable Cable",
    squiglinkUrl: "https://squig.link/?share=Tangzu_Waner",
  },
  "prod-tanchjim-nora": {
    driverType: "DMT5-Architecture Dual-Magnetic Dual-Cavity Dynamic Driver with DLC Dome",
    material: "High-Transparency Medical Resin Cavity with Aerospace Metal Frame & Sapphire Glass",
    tuning: "Tanchjim Reference Hi-Fi Studio Monitoring Curve",
    impedance: "16Ω (±5% @1kHz)",
    sensitivity: "125dB/Vrms",
    frequencyResponse: "2Hz – 48kHz",
    cableTermination: "Modular 3.5mm SE & 4.4mm BAL / 0.78mm 2-Pin Silver-Plated Cable",
    squiglinkUrl: "https://squig.link/?share=Tanchjim_Nora",
  },
  "prod-tanchjim-bunny": {
    driverType: "DMT 4 Ultra Dual-Chamber Dynamic Driver with Titanium Dome Composite Diaphragm",
    material: "Ultra-Lightweight Transparent Medical-Grade PC Cavity with Stainless Steel Faceplate",
    tuning: "Harman-Inspired Warm-Balanced Vocal Curve with Ultra-Low THD (<0.05%)",
    impedance: "30Ω (±10% @1kHz)",
    sensitivity: "123dB/Vrms",
    frequencyResponse: "8Hz – 48kHz",
    cableTermination: "3.5mm SE / Type-C DSP with Built-in DAC (0.78mm 2-Pin Detachable)",
    squiglinkUrl: "https://squig.link/?share=Tanchjim_Bunny",
  },
  "prod-kiwi-cadenza": {
    driverType: "10mm Beryllium-Coated Diaphragm Dynamic Driver",
    material: "Medical-Grade 3D-Printed Resin Acoustic Housing",
    tuning: "Harman-Inspired Warm-Balanced Audiophile Curve",
    impedance: "32Ω (@1kHz)",
    sensitivity: "110dB SPL/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Braided Copper",
    squiglinkUrl: "https://squig.link/?share=Kiwi_Ears_Cadenza",
  },
  "prod-earfun-air-pro-4": {
    driverType: "10mm Composite Dynamic Driver with Qualcomm QCC3091 SoC",
    material: "Ergonomic Matte Finish Shell (IPX5 Water Resistant)",
    tuning: "Snapdragon Sound Audiophile Warm-Balanced Curve",
    impedance: "32Ω (@1kHz)",
    sensitivity: "105dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (LDAC Hi-Res Audio)",
    cableTermination: "Bluetooth 5.4 / aptX Lossless / LDAC / LC3 / Auracast",
    squiglinkUrl: "https://squig.link",
  },
  "prod-earfun-free-pro-3": {
    driverType: "7mm Wool Composite Dynamic Driver with Qualcomm QCC3072",
    material: "Lightweight Ergonomic Shell with Silicone Ear Hooks (IPX5)",
    tuning: "Snapdragon Sound Warm-Punchy Target",
    impedance: "16Ω (@1kHz)",
    sensitivity: "102dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (aptX Adaptive 96kHz)",
    cableTermination: "Bluetooth 5.3 / aptX Adaptive / LC3 / AAC / Wireless Qi",
    squiglinkUrl: "https://squig.link",
  },
  "prod-redmi-buds-5-pro": {
    driverType: "Coaxial Dual Driver (11mm Titanium Dynamic + 10mm Ceramic Piezo Tweeter)",
    material: "High-Gloss Polycarbonate with Vegan Leather Texture Case (IP54)",
    tuning: "Hi-Res Audio Wireless Coaxial Hybrid Target",
    impedance: "16Ω (@1kHz)",
    sensitivity: "108dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (LDAC 24-bit/96kHz)",
    cableTermination: "Bluetooth 5.3 / LDAC / AAC / SBC Wireless",
    squiglinkUrl: "https://squig.link",
  },
  "prod-space-travel": {
    driverType: "13mm Enhanced Titanium-Dome Composite Dynamic Driver",
    material: "Transparent Sci-Fi Open-Cradle Shell Design",
    tuning: "VDSF (Virtual Diffuse Sound Field) Target Curve",
    impedance: "32Ω (@1kHz)",
    sensitivity: "106dB/Vrms",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "Bluetooth 5.3 / AAC / SBC Wireless",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Space_Travel",
  },
  "prod-golden-ages": {
    driverType: "13mm Super Linear Full-Frequency Annular Planar Magnetic Driver",
    material: "Custom Retrospective Cassette-Player Aesthetic Shell",
    tuning: "Bionic Acoustic VDSF Reference Planar Target",
    impedance: "16Ω (@1kHz)",
    sensitivity: "110dB SPL/mW",
    frequencyResponse: "10Hz – 45kHz",
    cableTermination: "Bluetooth 5.3 / LDAC / LC3 / AAC Wireless",
    squiglinkUrl: "https://squig.link",
  },
  "prod-wf1000xm5": {
    driverType: "8.4mm Dynamic Driver X Transducer",
    material: "Aerodynamic Polyurethane Resin with Noise Isolation Foam Tips (IPX4)",
    tuning: "Sony Audiophile Master Tuning with High-Res Audio Wireless",
    impedance: "16Ω (@1kHz)",
    sensitivity: "108dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (LDAC 990kbps)",
    cableTermination: "Bluetooth 5.3 / LDAC / LC3 / AAC / Qi Wireless Charging",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=WF-1000XM5",
  },
  "prod-airpods-pro2": {
    driverType: "Custom High-Excursion Apple Dynamic Driver with Custom High Dynamic Range Amplifier",
    material: "Precision Molded Gloss Polycarbonate (IP54 Dust & Water Resistant)",
    tuning: "Apple Computational Acoustic In-Ear Target",
    impedance: "24Ω (@1kHz)",
    sensitivity: "109dB SPL/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "Bluetooth 5.3 / Apple H2 Chip / MagSafe USB-C Wireless Qi",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=AirPods_Pro_2",
  },
  "prod-galaxy-buds2-pro": {
    driverType: "Coaxial 2-Way Custom Speaker (10mm Woofer + 5.3mm Tweeter)",
    material: "Soft-Touch Matte Aerodynamic Finish with IPX7 Water Resistance",
    tuning: "Harman Target In-Ear Precision Tuning (AKG Acoustics)",
    impedance: "16Ω (@1kHz)",
    sensitivity: "107dB SPL/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "Bluetooth 5.3 / SSC (Samsung Seamless Codec) / AAC / SBC / Wireless Qi",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Buds2_Pro",
  },
  "prod-redmi-buds-4-pro": {
    driverType: "Dual Dynamic (10mm Aluminum Woofer + 6mm Titanium Tweeter)",
    material: "Ergonomic Gloss Streamlined Housing (IP54)",
    tuning: "Xiaomi Sound Lab Hi-Res Acoustic Tuning",
    impedance: "24Ω (@1kHz)",
    sensitivity: "106dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (LDAC Hi-Res)",
    cableTermination: "Bluetooth 5.3 / LDAC / AAC / SBC Wireless",
    squiglinkUrl: "https://squig.link",
  },
  "prod-moondrop-ultrasonic": {
    driverType: "13mm Sapphire Dynamic + FRA Balanced Armature Hybrid",
    material: "Precision Acoustic Cavity with Cyberpunk Charging Cradle",
    tuning: "VDSF Target Hybrid Reference Curve",
    impedance: "32Ω (@1kHz)",
    sensitivity: "108dB/Vrms",
    frequencyResponse: "15Hz – 40kHz",
    cableTermination: "Bluetooth 5.3 / LDAC / LC3 / AAC Wireless",
    squiglinkUrl: "https://squig.link",
  },
  "prod-chu3": {
    driverType: "10mm Al-Mg Alloy Composite Diaphragm Dynamic Driver",
    material: "Zinc Alloy Die-Cast Cavity with Brass CNC Nozzle",
    tuning: "PopAvg-DF (JM-1) Harman Reference Curve",
    impedance: "16Ω ± 15% (@1kHz)",
    sensitivity: "119dB/Vrms (@1kHz)",
    frequencyResponse: "12Hz – 50kHz (Effective: 20Hz – 20kHz)",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Detachable",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Chu_II",
  },
  "prod-aria2": {
    driverType: "10mm TiN Ceramic-Coated Spherical Dome Composite Diaphragm Dynamic Driver",
    material: "CNC Zinc Alloy Housing with Replaceable Brass Acoustic Nozzle",
    tuning: "Moondrop VDSF Target (Warm-Neutral)",
    impedance: "33Ω ± 15% (@1kHz)",
    sensitivity: "122dB/Vrms (@1kHz)",
    frequencyResponse: "16Hz – 22kHz (Effective: 20Hz – 20kHz)",
    cableTermination: "Modular 3.5mm SE & 4.4mm Balanced / 0.78mm 2-Pin",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=IEF_Neutral_Target,Aria_2",
  },
  "prod-dusk": {
    driverType: "10mm TiN Ceramic-Coated Spherical Dome Composite Diaphragm Dynamic Driver",
    material: "CNC Zinc Alloy Housing with Replaceable Brass Acoustic Nozzle",
    tuning: "Moondrop VDSF Target (Warm-Neutral)",
    impedance: "33Ω ± 15% (@1kHz)",
    sensitivity: "122dB/Vrms (@1kHz)",
    frequencyResponse: "16Hz – 22kHz (Effective: 20Hz – 20kHz)",
    cableTermination: "Modular 3.5mm SE & 4.4mm Balanced / 0.78mm 2-Pin",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=IEF_Neutral_Target,Aria_2",
  },
  "prod-sparxie": {
    driverType: "10mm Wood Dome Diaphragm Dynamic Driver (Variable-Impedance Damping)",
    material: "Lightweight Bean-Shaped Ergonomic Housing + Acrylic Stand & Accessories",
    tuning: "Moondrop VDSF Target Curve with 10-Band Online Interactive DSP",
    impedance: "32Ω ± 15%",
    sensitivity: "120dB/Vrms",
    frequencyResponse: "15Hz – 25kHz",
    cableTermination: "Bluetooth 6.0 (LHDC-V / LC3 / AAC / SBC Wireless)",
    squiglinkUrl: "https://shenzhenaudio.com/products/honkai-star-rail-x-moondrop-sparxie-rt-adaptive-anc-mini-hi-fi-tws",
  },
  "prod-mimisbrunnr": {
    driverType: "1 Dynamic Driver + 4 Balanced Armatures + 2 Sonion EST Tribrid",
    material: "German Medical-Grade 3D Resin with Stabilized Nebula Faceplate",
    tuning: "Reference Studio Mastering Neutral Curve",
    impedance: "22Ω (@1kHz)",
    sensitivity: "112dB/mW",
    frequencyResponse: "8Hz – 45kHz",
    cableTermination: "4.4mm Balanced 8-Core OCC Silver / 0.78mm 2-Pin",
    squiglinkUrl: "https://squig.link",
  },
  "prod-epz-g30": {
    driverType: "10mm Dual-Cavity Dynamic + 1 Custom Balanced Armature",
    material: "Ergonomic 3D Resin Shell with Shock-Absorbing Inner Chamber",
    tuning: "Tactical Audio Spatial V-Shape Curve",
    impedance: "16Ω (@1kHz)",
    sensitivity: "115dB/Vrms (@1kHz)",
    frequencyResponse: "20Hz – 28kHz",
    cableTermination: "3.5mm SE with HD Detachable Boom Mic / 0.78mm 2-Pin",
    squiglinkUrl: "https://squig.link",
  },
  "prod-wukong": {
    driverType: "1 LCP Dynamic Subwoofer + 6 Knowles/Sonion BA + 2 Sonion EST",
    material: "Hand-Crafted Gold-Leaf Inlay Resin with Titanium Acoustic Nozzle",
    tuning: "Mythic Reference Warm-Neutral Curve",
    impedance: "18Ω (@1kHz)",
    sensitivity: "110dB/mW",
    frequencyResponse: "5Hz – 50kHz",
    cableTermination: "Modular 3.5mm/4.4mm 8-Core Gold-Silver Alloy / 0.78mm 2-Pin",
    squiglinkUrl: "https://squig.link",
  },
  "prod-blessing3": {
    driverType: "2DD (Horizontally Opposed 10mm) + 4 Custom Balanced Armatures",
    material: "HeyGears DLP 3D Medical Resin with CNC Stainless Steel Faceplate",
    tuning: "VDSF Target Reference Harman-Neutral",
    impedance: "14.8Ω ± 15% (@1kHz)",
    sensitivity: "120dB/Vrms (@1kHz)",
    frequencyResponse: "10Hz – 30kHz (Effective: 20Hz – 20kHz)",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Detachable",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Blessing_3",
  },
  "prod-momentum4": {
    driverType: "42mm Audiophile-Inspired Dynamic Transducer",
    material: "Premium Fabric Headband with Ultra-Soft Memory Foam Cushions",
    tuning: "Sennheiser Signature Audiophile Warm Curve",
    impedance: "Active: 470Ω / Passive: 60Ω",
    sensitivity: "106dB SPL (1kHz / 0 dB FS)",
    frequencyResponse: "6Hz – 22kHz",
    cableTermination: "Bluetooth 5.2 aptX Adaptive / 3.5mm Analog / USB-C Digital",
    squiglinkUrl: "https://squig.link",
  },
  "prod-hd600": {
    driverType: "Acoustically Optimized Dynamic Transducer with Aluminum Voice Coils",
    material: "Marble-Pattern Resilient Chassis with Velvet Ear Cushions",
    tuning: "Diffuse-Field Linear Reference Target",
    impedance: "300Ω",
    sensitivity: "97dB/1Vrms",
    frequencyResponse: "12Hz – 40.5kHz",
    cableTermination: "3.5mm SE with 6.35mm Screw-On Adapter / Dual 2-Pin",
    squiglinkUrl: "https://squig.link",
  },
  "prod-ier-z1r": {
    driverType: "HD Hybrid Driver System (12mm Dynamic + 5mm Super Tweeter + 1 BA)",
    material: "Zirconium Alloy Housing with Perlage-Finished Faceplate",
    tuning: "Sony Signature Atmospheric Deep Warm V-Shape",
    impedance: "40Ω (@1kHz)",
    sensitivity: "103dB/mW",
    frequencyResponse: "3Hz – 100kHz",
    cableTermination: "Modular 3.5mm & 4.4mm Balanced Silver-Coated OFC",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=IER-Z1R",
  },
  "prod-ier-m9": {
    driverType: "5 Balanced Armature System with Magnesium Inner Housing",
    material: "Magnesium Alloy Inner Housing with Carbon Fiber Faceplates",
    tuning: "Clinical Soundstage Monitoring Target",
    impedance: "20Ω (@1kHz)",
    sensitivity: "103dB/mW",
    frequencyResponse: "5Hz – 40kHz",
    cableTermination: "3.5mm SE & 4.4mm Balanced Silver-Coated OFC",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=IER-M9",
  },
  "prod-monarch-mk3": {
    driverType: "2DD (IMPACT2 Isobaric Subwoofer) + 6 BA + 2 Sonion EST Tribrid",
    material: "Handmade Medical-Grade Resin with Chameleon Galaxy Faceplate",
    tuning: "Monarch Reference Studio Audiophile Target",
    impedance: "20Ω (@1kHz)",
    sensitivity: "99dB/mW",
    frequencyResponse: "20Hz – 40kHz",
    cableTermination: "Modular Smart-Switch 3.5mm/4.4mm Silver-Plated Cable",
    squiglinkUrl: "https://squig.link/?share=Monarch_MKIII",
  },
  "prod-ie600": {
    driverType: "7mm TrueResponse Dynamic Transducer with D2CA Dual Resonators",
    material: "3D-Printed AMLOY-ZR01 Amorphous Zirconium Metal",
    tuning: "Sennheiser Holographic Detail V-Shape",
    impedance: "18Ω",
    sensitivity: "118dB SPL (1kHz, 1Vrms)",
    frequencyResponse: "7Hz – 48kHz",
    cableTermination: "Para-aramid Reinforced Cable with MMCX Gold Plated",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=IE600",
  },
  "prod-variations": {
    driverType: "1DD (10mm LCP) + 2 Softears BA + 2 Sonion EST Tribrid",
    material: "HeyGears DLP Medical Resin with Matte Stainless Steel Faceplate",
    tuning: "VDSF Target 2020 Harman-Neutral Target",
    impedance: "15.2Ω ± 15% (@1kHz)",
    sensitivity: "118dB/Vrms (@1kHz)",
    frequencyResponse: "9Hz – 35kHz",
    cableTermination: "Modular 3.5mm/4.4mm 6N OCC Single Crystal Copper",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Variations",
  },
  "prod-waner": {
    driverType: "10mm High-Performance PET Diaphragm Dynamic Driver",
    material: "Acoustic Polycarbonate Cavity with Traditional Chinese Pattern Faceplate",
    tuning: "Smooth Warm-Neutral Vocal Target",
    impedance: "20Ω (@1kHz)",
    sensitivity: "107dB (@1kHz)",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "0.78mm 2-Pin 4-Core OFC Oxygen-Free Copper",
    squiglinkUrl: "https://squig.link/?share=Tangzu_Waner",
  },
  "prod-zero-red": {
    driverType: "Dual Dynamic Driver (10mm Subwoofer + 7.8mm Tweeter/Midrange)",
    material: "HeyGears DLP 3D Medical Resin with Anodized Aluminum Faceplate",
    tuning: "Crinacle Target with 10Ω Bass Impedance Adapter",
    impedance: "17.5Ω ± 15% (@1kHz)",
    sensitivity: "117.5dB/Vrms (@1kHz)",
    frequencyResponse: "20Hz – 20.5kHz",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Silver-Plated Cable",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Zero_Red",
  },
};


export const KNOWN_CLEAN_NAMES: Record<string, string> = {
  "prod-waner-sg2": "Tangzu Wan'er SG 2",
  "prod-waner-redlion": "Tangzu Wan'er SG 2 Red Lion",
  "prod-tanchjim-nora": "Tanchjim Nora",
  "prod-tanchjim-bunny": "Tanchjim Bunny",
  "prod-chu3": "Moondrop CHU III",
  "prod-aria2": "Moondrop Aria 2",
  "prod-dusk": "Moondrop Aria 2",
  "prod-sparxie": "Moondrop Sparxie TWS",
  "prod-mimisbrunnr": "Mimisbrunnr Flagship",
  "prod-epz-g30": "EPZ G30",
  "prod-wukong": "Tangzu WuKong",
  "prod-momentum4": "Sennheiser Momentum 4",
  "prod-hd600": "Sennheiser HD 600",
  "prod-blessing3": "Moondrop Blessing 3",
  "prod-ier-z1r": "Sony IER-Z1R",
  "prod-ier-m9": "Sony IER-M9",
  "prod-monarch-mk3": "Thieaudio Monarch MKIII",
  "prod-nanna-2": "Kinera Imperial Nanna",
  "prod-ie600": "Sennheiser IE 600",
  "prod-variations": "Moondrop Variations",
  "prod-u12t": "64 Audio U12t",
  "prod-ie900": "Sennheiser IE 900",
  "prod-ares-s": "Effect Audio Ares S",
  "prod-mojo2": "Chord Mojo 2",
  "prod-solaris": "Campfire Audio Solaris",
  "prod-diva": "Elysian Acoustic Diva",
  "prod-maestro-mini": "FatFreq Maestro Mini",
  "prod-quintet": "Kiwi Ears Quintet",
  "prod-ea1000": "Simgot EA1000 Fermat",
  "prod-s12pro": "Letshuoer S12 Pro",
  "prod-waner": "Tangzu Wan'er S.G",
  "prod-nezha": "Tangzu Nezha",
  "prod-zetian-wu": "Tangzu Zetian Wu",
  "prod-shimin-li": "Tangzu Shimin Li",
  "prod-arya": "HiFiMAN Arya Stealth",
  "prod-hd800s": "Sennheiser HD 800 S",
  "prod-wf1000xm5": "Sony WF-1000XM5",
  "prod-space-travel": "Moondrop Space Travel",
  "prod-airpods-pro2": "Apple AirPods Pro 2",
  "prod-eah-az80": "Technics EAH-AZ80",
  "prod-wh1000xm5": "Sony WH-1000XM5",
  "prod-focal-bathys": "Focal Bathys",
  "prod-m50x-bt2": "Audio-Technica M50xBT2",
  "prod-meze-109pro": "Meze 109 PRO",
  "prod-fiio-btr7": "FiiO BTR7",
  "prod-ifi-goblu": "iFi Audio GO blu",
  "prod-qudelix-5k": "Qudelix-5K DAC",
  "prod-dawn-pro": "Moondrop Dawn Pro",
  "prod-dx3-pro-plus": "Topping DX3 Pro+",
  "prod-zero-red": "Truthear Crinacle ZERO:RED",
  "prod-7hz-zero": "7Hz Salnotes Zero",
  "prod-kiwi-cadenza": "Kiwi Ears Cadenza",
  "prod-earfun-air-pro-4": "EarFun Air Pro 4",
  "prod-earfun-free-pro-3": "EarFun Free Pro 3",
  "prod-redmi-buds-5-pro": "Redmi Buds 5 Pro",
  "prod-redmi-buds-4-pro": "Redmi Buds 4 Pro",
  "prod-golden-ages": "Moondrop Golden Ages",
  "prod-moondrop-ultrasonic": "Moondrop Ultrasonic",
  "prod-galaxy-buds2-pro": "Samsung Galaxy Buds2 Pro",
};

/**
 * Ensures product name is clean and bounded to 2-4 words.
 * Strips verbose marketing/category suffixes ("High-Performance Dynamic In-Ear Monitor", etc.)
 */
export function cleanProductName(name: string, id?: string): string {
  if (id && KNOWN_CLEAN_NAMES[id]) {
    return KNOWN_CLEAN_NAMES[id];
  }

  if (id) {
    const canonicalId = ID_ALIASES[id.toLowerCase()];
    if (canonicalId && KNOWN_CLEAN_NAMES[canonicalId]) {
      return KNOWN_CLEAN_NAMES[canonicalId];
    }
  }

  if (!name) return "";

  // Check matching by ID in fallback catalog
  const fallback = FALLBACK_CATALOG?.find(
    (p) => (id && p.id === id) || p.name.toLowerCase() === name.toLowerCase()
  );
  if (fallback && fallback.name) {
    const fbWords = fallback.name.split(/\s+/).length;
    if (fbWords >= 2 && fbWords <= 4) {
      return fallback.name;
    }
  }

  let cleaned = name
    .trim()
    .replace(/\s*\([^)]*\)/g, "") // remove parenthetical specs like (USB-C)
    .replace(
      /\b(High-Performance|Dynamic In-Ear Monitor|In-Ear Monitor|Stage Monitor|Audiophile Headphones|Wireless Noise Canceling|True Wireless ANC|True Wireless|Open-Back|Closed-Back|Gaming & Studio|Gaming &|Multi-Driver|Beryllium Dynamic|Planar Magnetic|Tribrid|Quadbrid|Dual Dynamic|Single Dynamic|Sub-bass Cannon|Masterpiece|Reference Headphone|Reference Flagship|Reference|Headphones?|Earphones?|Earbuds?|IEM|TWS|ANC)\b/gi,
      ""
    )
    .replace(/[\s\-_&/]+$/g, "") // strip trailing dangling connectors
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(/\s+/);
  if (words.length > 4) {
    return words.slice(0, 4).join(" ");
  }
  return cleaned.length >= 2 ? cleaned : name;
}

export type AllowedBadge = "New Arrival" | "Best Seller" | "Top Rated";

/**
 * Strictly limits badges to only: "New Arrival", "Best Seller", "Top Rated".
 * All other tags (Legendary Classic, Flagship, etc.) are strictly stripped/deleted.
 */
export function normalizeAllowedBadge(badge?: string | null): AllowedBadge | undefined {
  if (!badge) return undefined;
  const b = badge.trim().toLowerCase().replace(/[\-_]/g, " ");
  if (b === "new arrival") return "New Arrival";
  if (b === "best seller" || b === "bestseller") return "Best Seller";
  if (b === "top rated" || b === "toprated") return "Top Rated";
  return undefined;
}

// In-memory live store for recalculated ratings from authentic buyer reviews (starts at 0)
const productRatingOverrides: Map<string, { rating: number; reviews: number }> = new Map();

/**
 * Record a new authentic buyer review score for a product and recalculate dynamic rating average
 */
export function recordProductReviewScore(
  productId: string,
  newRating: number
): { rating: number; reviews: number } {
  const cleanId = (productId || "").trim().toLowerCase();

  const existing = productRatingOverrides.get(cleanId);
  const currentRating = existing ? existing.rating : 0;
  const currentReviews = existing ? existing.reviews : 0;

  const updatedReviews = currentReviews + 1;
  const updatedRating =
    currentReviews === 0
      ? newRating
      : Math.round(((currentRating * currentReviews + newRating) / updatedReviews) * 10) / 10;

  const result = { rating: updatedRating, reviews: updatedReviews };
  productRatingOverrides.set(cleanId, result);
  return result;
}

export function getProductRatingScore(
  productId: string
): { rating: number; reviews: number } | null {
  return productRatingOverrides.get((productId || "").trim().toLowerCase()) || null;
}

export function enhanceProductWithSpecs(product: CatalogProduct): CatalogProduct {
  const norm = product.id.toLowerCase().replace(/[^a-z0-9]/g, "");
  const norm3 = norm.replace(/iii/g, "3").replace(/ii/g, "2");
  let matchedSpecs = PRODUCT_SPECS_MAP[product.id];

  if (!matchedSpecs) {
    const key = Object.keys(PRODUCT_SPECS_MAP).find((k) => {
      const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      const kNorm3 = kNorm.replace(/iii/g, "3").replace(/ii/g, "2");
      const kWords = k.replace("prod-", "").replace(/-/g, " ");
      const pNameNorm = product.name.toLowerCase().replace(/\biii\b/g, "3").replace(/\bii\b/g, "2");
      return (
        k === product.id ||
        norm === kNorm ||
        norm3 === kNorm3 ||
        norm3.includes(kNorm3) ||
        kNorm3.includes(norm3) ||
        product.name.toLowerCase().includes(kWords) ||
        pNameNorm.includes(kWords)
      );
    });
    if (key) matchedSpecs = PRODUCT_SPECS_MAP[key];
  }

  // Fallback defaults based on acoustics
  const isWirelessProduct =
    product.category.includes("WIRELESS") ||
    product.category.includes("TWS") ||
    (product.name && product.name.toLowerCase().includes("tws")) ||
    (product.name && product.name.toLowerCase().includes("buds")) ||
    (product.cableTermination && (product.cableTermination.toLowerCase().includes("bluetooth") || product.cableTermination.toLowerCase().includes("wireless")));

  const defaultDriver = isWirelessProduct
    ? "High-Resolution Composite Dynamic Transducer"
    : product.category.includes("HEADPHONE")
    ? "Acoustically Optimized Dynamic Transducer"
    : product.category.includes("CABLE")
    ? "High-Purity Single-Crystal OCC Upgrade Cable"
    : product.category.includes("DAC")
    ? "Dual High-Performance Audio DAC Architecture"
    : "10mm High-Performance Dynamic Acoustic Driver";

  const defaultMaterial = isWirelessProduct
    ? "Ergonomic Acoustic Polymer (IPX4/IPX5 Water Resistant)"
    : product.category.includes("HEADPHONE")
    ? "Aircraft-Grade Aluminum & Memory Foam"
    : product.category.includes("CABLE")
    ? "Ultra-Flexible Braided PVC & Metal Splitter"
    : "Medical-Grade 3D Printed Resin / Anodized Aluminum";

  const defaultCableTermination = isWirelessProduct
    ? "Bluetooth 5.3 / AAC / SBC / LDAC Wireless"
    : product.category.includes("DAC")
    ? "USB Type-C Digital / 3.5mm SE & 4.4mm Balanced"
    : product.category.includes("HEADPHONE")
    ? "3.5mm SE with 6.35mm Adapter / Detachable Cable"
    : "3.5mm Single-Ended / 0.78mm 2-Pin";

  const defaultSquiglink = product.squiglinkUrl || (product.category.includes("IN-EAR") ? `https://squig.link/?share=${encodeURIComponent(product.name.replace(/\s+/g, "_"))}` : "https://squig.link");

  // Find fallback match if available to preserve badge, ratings, and gallery images
  const fallbackMatch = typeof findFallbackMatch === "function"
    ? findFallbackMatch(product.id, product.name)
    : FALLBACK_CATALOG?.find(
        (p) => p.id === product.id || p.name.toLowerCase() === product.name.toLowerCase()
      );

  const cleanedTitle = cleanProductName(product.name, product.id);
  const ratingOverride = productRatingOverrides.get(product.id.toLowerCase());
  const liveReviews = ratingOverride ? ratingOverride.reviews : 0;
  const liveRating = ratingOverride ? ratingOverride.rating : 0;

  // Build robust deduplicated multi-image list
  let productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image].filter(Boolean);
  productImages = Array.from(new Set(productImages.filter((img) => typeof img === "string" && img.trim().length > 0)));

  if (productImages.length < 3 && fallbackMatch?.images) {
    for (const fImg of fallbackMatch.images) {
      if (!productImages.includes(fImg)) {
        productImages.push(fImg);
      }
      if (productImages.length >= 3) break;
    }
  }

  // If still less than 3, add high-quality category specific angles
  if (productImages.length < 3) {
    const categoryFallbacks = isWirelessProduct
      ? [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80",
        ]
      : product.category?.includes("HEADPHONE")
      ? [
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        ]
      : [
          "/images/Headphone-Zone-Moondrop-Chu-II-02.jpg",
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
        ];
    for (const fb of categoryFallbacks) {
      if (!productImages.includes(fb)) {
        productImages.push(fb);
      }
      if (productImages.length >= 3) break;
    }
  }

  // Ensure wireless products NEVER have cable terminations
  const finalCableTermination = isWirelessProduct
    ? (matchedSpecs?.cableTermination || (product.cableTermination && !product.cableTermination.toLowerCase().includes("pin") && !product.cableTermination.toLowerCase().includes("3.5mm") ? product.cableTermination : defaultCableTermination))
    : (product.cableTermination || matchedSpecs?.cableTermination || defaultCableTermination);

  return {
    ...product,
    name: cleanedTitle,
    images: productImages,
    image: productImages[0] || product.image,
    badge: normalizeAllowedBadge(product.badge || fallbackMatch?.badge),
    rating: liveRating,
    reviews: liveReviews,
    driverType: product.driverType || matchedSpecs?.driverType || defaultDriver,
    material: product.material || matchedSpecs?.material || defaultMaterial,
    tuning: product.tuning || matchedSpecs?.tuning || `${product.soundSignature ? product.soundSignature.replace(/_/g, " ") : "NEUTRAL"} Audiophile Target Curve`,
    impedance: product.impedance || matchedSpecs?.impedance || "16Ω - 32Ω (@1kHz)",
    sensitivity: product.sensitivity || matchedSpecs?.sensitivity || "108dB - 119dB SPL/mW",
    frequencyResponse: product.frequencyResponse || matchedSpecs?.frequencyResponse || "20Hz – 20kHz",
    cableTermination: finalCableTermination,
    squiglinkUrl: product.squiglinkUrl || matchedSpecs?.squiglinkUrl || defaultSquiglink,
  };
}

export const FALLBACK_CATALOG: CatalogProduct[] = [
  {
    id: "prod-chu3",
    name: "Moondrop CHU III",
    price: 24.99,
    stock: 120,
    experienceLevel: "BEGINNER",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Jakarta Pusat",
    description: "Next-generation 10mm high-performance composite diaphragm dynamic driver with alloy casting acoustic cavity, brass CNC acoustic nozzle, and interchangeable cable design. Delivers pure acoustic clarity and neutral reference sound.",
    images: [
      "/images/transparent/chu3-transparent.png",
      "/images/chu3-preview-1.webp",
      "/images/chu3-preview-2.webp",
      "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp",
      "/images/Headphone-Zone-Moondrop-Chu-II-01.jpg",
    ],
    image: "/images/transparent/chu3-transparent.png",
    rating: 4.9,
    reviews: 182,
    badge: "New Arrival",
    inStock: true,
    preOrder: false,
    driverType: "10mm Al-Mg Alloy Composite Diaphragm Dynamic Driver",
    material: "Zinc Alloy Die-Cast Cavity with Brass CNC Nozzle",
    tuning: "PopAvg-DF (JM-1) Harman Reference Curve",
    impedance: "16Ω ± 15% (@1kHz)",
    sensitivity: "119dB/Vrms (@1kHz)",
    frequencyResponse: "12Hz – 50kHz (Effective: 20Hz – 20kHz)",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Detachable",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Chu_II",
  },
  {
    id: "prod-aria2",
    name: "Moondrop Aria 2",
    price: 89.99,
    stock: 28,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Jakarta Pusat",
    description: "Generasi kedua dari seri legendaris Aria. Moondrop Aria 2 mengadopsi struktur dynamic driver paten terbaru dengan diafragma komposit kubah keramik TiN, housing CNC zinc alloy berkualiatas tinggi, nozzle kuningan yang dapat diganti, serta kabel hybrid modular 3.5mm dan 4.4mm seimbang bawaan.",
    images: [
      "https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-Moondrop-Aria2-Gallary-01.jpg",
      "https://cn.cdn.moondroplab.com/627128d862c9a44234848dda/6540a32b1b300656259455e3_ARIA2.jpg",
      "https://www.linsoul.com/cdn/shop/files/PHI_5184.jpg",
    ],
    image: "https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-Moondrop-Aria2-Gallary-01.jpg",
    rating: 4.9,
    reviews: 184,
    badge: "Popular",
    inStock: true,
    preOrder: false,
    driverType: "10mm TiN Ceramic-Coated Spherical Dome Composite Diaphragm Dynamic Driver",
    material: "CNC-Milled Zinc Alloy Cavity + Replaceable Brass Acoustic Nozzle",
    tuning: "Moondrop VDSF Target Response (Warm-Neutral)",
    impedance: "33Ω ± 15% (@1kHz)",
    sensitivity: "122dB/Vrms (@1kHz)",
    frequencyResponse: "16Hz – 22kHz (Effective: 20Hz – 20kHz)",
    cableTermination: "Modular 3.5mm Single-Ended & 4.4mm Balanced / 0.78mm 2-Pin",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=IEF_Neutral_Target,Aria_2",
  },
  {
    id: "prod-sparxie",
    name: "HONKAI: STAR RAIL × MOONDROP Sparxie RT-Adaptive ANC Mini Hi-Fi TWS",
    price: 89.99,
    stock: 45,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    category: "WIRELESS",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Jakarta Pusat",
    description: "Kolaborasi resmi HoYoverse Honkai: Star Rail bersama Moondrop menghadirkan TWS audiophile edisi karakter Sparkle. Ditenagai chip cerdas 22nm Moondrop TWS-2 dengan RT-Adaptive ANC, driver dinamis wood-dome 10mm bersuspensi redaman impedansi variabel, mode latensi rendah 60ms, DSP parametrik EQ 10-band, serta suara pemandu eksklusif karakter Sparkle.",
    images: [
      "https://cdn.shopify.com/s/files/1/0013/3896/6076/files/1_588ae6a9-9f9c-4160-8013-ec97beac8304.jpg?v=1788923488",
      "https://cdn.shopify.com/s/files/1/0013/3896/6076/files/2_1_7b581902-261e-4cca-bd6b-46748f5aeced.jpg?v=1788923488",
      "https://cdn.shopify.com/s/files/1/0013/3896/6076/files/3_62fecbd2-4dd0-484b-bd8c-b8ba823fddd4.png?v=1788945301",
      "https://cdn.shopify.com/s/files/1/0013/3896/6076/files/4_66b9f32c-4eab-4548-b25b-8023de73db1b.png?v=1788945301",
      "https://cdn.shopify.com/s/files/1/0013/3896/6076/files/3_1.jpg?v=1788944736",
      "https://cdn.shopify.com/s/files/1/0013/3896/6076/files/4_062093d4-8311-41b0-a342-e361763f6d48.jpg?v=1788944734",
      "https://cdn.shopify.com/s/files/1/0013/3896/6076/files/5_391b222b-4ca9-421f-8f9d-1812f65175c6.jpg?v=1788945301",
    ],
    image: "https://cdn.shopify.com/s/files/1/0013/3896/6076/files/1_588ae6a9-9f9c-4160-8013-ec97beac8304.jpg?v=1788923488",
    rating: 5.0,
    reviews: 148,
    inStock: true,
    preOrder: true,
    driverType: "10mm Wood Dome Diaphragm Dynamic Driver (Variable-Impedance Damping)",
    material: "Lightweight Bean-Shaped Ergonomic Housing + Acrylic Stand & Accessories",
    tuning: "Moondrop VDSF Target Curve with 10-Band Online Interactive DSP",
    impedance: "32Ω ± 15%",
    sensitivity: "120dB/Vrms",
    frequencyResponse: "15Hz – 25kHz",
    cableTermination: "Bluetooth 6.0 (LHDC-V / LC3 / AAC / SBC Wireless)",
    squiglinkUrl: "https://shenzhenaudio.com/products/honkai-star-rail-x-moondrop-sparxie-rt-adaptive-anc-mini-hi-fi-tws",
  },
  {
    id: "prod-mimisbrunnr",
    name: "Mimisbrunnr Flagship",
    price: 899,
    stock: 15,
    experienceLevel: "FLAGSHIP",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "MIMISBRUNNR",
    storeName: "CSI Zone",
    storeCity: "Surabaya",
    description: "Ultra-high-end flagship acoustic monitor named after the mythical well of wisdom. Multi-driver electrostatic hybrid architecture in an artisan resin cavity for transcendent resolution, expansive 3D stage depth, and sublime tonal neutrality.",
    images: ["/figma/prod-mimisbrunnr.png"],
    image: "/figma/prod-mimisbrunnr.png",
    rating: 5.0,
    reviews: 34,
    badge: "New Arrival",
    inStock: true,
    preOrder: false,
    driverType: "1 Dynamic Driver + 4 Balanced Armatures + 2 Sonion EST Tribrid",
    material: "German Medical-Grade 3D Resin with Stabilized Nebula Faceplate",
    tuning: "Reference Studio Mastering Neutral Curve",
    impedance: "22Ω (@1kHz)",
    sensitivity: "112dB/mW",
    frequencyResponse: "8Hz – 45kHz",
    cableTermination: "4.4mm Balanced 8-Core OCC Silver / 0.78mm 2-Pin",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-epz-g30",
    name: "EPZ G30",
    price: 92,
    stock: 60,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "V_SHAPE",
    category: "IN-EAR MONITORS",
    brand: "EPZ",
    storeName: "EPZ Official Store",
    storeCity: "Surabaya",
    description: "Engineered specifically for competitive esports positioning and high-impact dynamic audio with dual-cavity composite dynamic driver and balanced armature setup for pinpoint tactical soundscapes.",
    images: ["/figma/prod-epz-g30.png"],
    image: "/figma/prod-epz-g30.png",
    rating: 4.8,
    reviews: 86,
    inStock: true,
    preOrder: false,
    driverType: "10mm Dual-Cavity Dynamic + 1 Custom Balanced Armature",
    material: "Ergonomic 3D Resin Shell with Shock-Absorbing Inner Chamber",
    tuning: "Tactical Audio Spatial V-Shape Curve",
    impedance: "16Ω (@1kHz)",
    sensitivity: "115dB/Vrms (@1kHz)",
    frequencyResponse: "20Hz – 28kHz",
    cableTermination: "3.5mm SE with HD Detachable Boom Mic / 0.78mm 2-Pin",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-wukong",
    name: "Tangzu WuKong",
    price: 2150,
    stock: 8,
    experienceLevel: "FLAGSHIP",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "TANGZU",
    storeName: "TANGZU Audio Official Store",
    storeCity: "Yogyakarta",
    description: "Tangzu's pinnacle acoustic creation inspired by the legendary Sun Wukong. 1DD + 6BA + 2EST tribrid architecture in hand-carved gold-leaf artisan housing, offering regal midrange richness and effortless treble extension.",
    images: ["/figma/prod-wukong.png"],
    image: "/figma/prod-wukong.png",
    rating: 5.0,
    reviews: 29,
    inStock: true,
    preOrder: false,
    driverType: "1 LCP Dynamic Subwoofer + 6 Knowles/Sonion BA + 2 Sonion EST",
    material: "Hand-Crafted Gold-Leaf Inlay Resin with Titanium Acoustic Nozzle",
    tuning: "Mythic Reference Warm-Neutral Curve",
    impedance: "18Ω (@1kHz)",
    sensitivity: "110dB/mW",
    frequencyResponse: "5Hz – 50kHz",
    cableTermination: "Modular 3.5mm/4.4mm 8-Core Gold-Silver Alloy / 0.78mm 2-Pin",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-momentum4",
    name: "Sennheiser Momentum 4",
    price: 349.95,
    stock: 35,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "WARM",
    category: "HEADPHONES",
    brand: "SENNHEISER",
    storeName: "Sennheiser Official Store",
    storeCity: "Jakarta Selatan",
    description: "Signature Sennheiser audiophile transducer system with adaptive hybrid noise cancellation, crystal-clear calls, 60-hour battery life, and high-resolution sound with aptX Adaptive codec support.",
    images: ["/figma/sennheiser-sec.png"],
    image: "/figma/sennheiser-sec.png",
    rating: 4.8,
    reviews: 215,
    badge: "Best Seller",
    inStock: true,
    preOrder: false,
    driverType: "42mm Audiophile-Inspired Dynamic Transducer",
    material: "Premium Fabric Headband with Ultra-Soft Memory Foam Cushions",
    tuning: "Sennheiser Signature Audiophile Warm Curve",
    impedance: "Active: 470Ω / Passive: 60Ω",
    sensitivity: "106dB SPL (1kHz / 0 dB FS)",
    frequencyResponse: "6Hz – 22kHz",
    cableTermination: "Bluetooth 5.2 aptX Adaptive / 3.5mm Analog / USB-C Digital",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-hd600",
    name: "Sennheiser HD 600",
    price: 449.95,
    stock: 25,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "HEADPHONES",
    brand: "SENNHEISER",
    storeName: "Sennheiser Official Store",
    storeCity: "Jakarta Selatan",
    description: "The legendary benchmark of acoustic fidelity and midrange neutrality for mastering studios and discerning audiophiles worldwide. Open-back circumaural design with acoustically transparent metal mesh.",
    images: ["/figma/sennheiser-main.png"],
    image: "/figma/sennheiser-main.png",
    rating: 4.9,
    reviews: 340,
    badge: "Best Seller",
    inStock: true,
    preOrder: false,
    driverType: "Acoustically Optimized Dynamic Transducer with Aluminum Voice Coils",
    material: "Marble-Pattern Resilient Chassis with Velvet Ear Cushions",
    tuning: "Diffuse-Field Linear Reference Target",
    impedance: "300Ω",
    sensitivity: "97dB/1Vrms",
    frequencyResponse: "12Hz – 40.5kHz",
    cableTermination: "3.5mm SE with 6.35mm Screw-On Adapter / Dual 2-Pin",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-blessing3",
    name: "Moondrop Blessing 3",
    price: 319.99,
    stock: 30,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Bandung",
    description: "Horizontally opposed 2DD module (H.O.D.D.D.U.S) with 4 custom balanced armatures for clinical vocal reproduction, razor-sharp transient response, and expansive spatial imaging.",
    images: [
      "/figma/hero-bg.png",
      "/hero-blessing-3.jpg",
      "/hero-blessing-3-right.jpg",
    ],
    image: "/figma/hero-bg.png",
    rating: 4.9,
    reviews: 145,
    badge: "Best Seller",
    inStock: true,
    preOrder: false,
    driverType: "2DD (Horizontally Opposed 10mm) + 4 Custom Balanced Armatures",
    material: "HeyGears DLP 3D Medical Resin with CNC Stainless Steel Faceplate",
    tuning: "VDSF Target Reference Harman-Neutral",
    impedance: "14.8Ω ± 15% (@1kHz)",
    sensitivity: "120dB/Vrms (@1kHz)",
    frequencyResponse: "10Hz – 30kHz (Effective: 20Hz – 20kHz)",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Detachable",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Blessing_3",
  },
  {
    id: "prod-ier-z1r",
    name: "Sony IER-Z1R",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ier-m9",
    name: "Sony IER-M9",
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
    name: "Thieaudio Monarch MKIII",
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
    name: "Kinera Imperial Nanna",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ie600",
    name: "Sennheiser IE 600",
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
    name: "Moondrop Variations",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-u12t",
    name: "64 Audio U12t",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ie900",
    name: "Sennheiser IE 900",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ares-s",
    name: "Effect Audio Ares S",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-mojo2",
    name: "Chord Mojo 2",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-solaris",
    name: "Campfire Audio Solaris",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-diva",
    name: "Elysian Acoustic Diva",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-maestro-mini",
    name: "FatFreq Maestro Mini",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-quintet",
    name: "Kiwi Ears Quintet",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ea1000",
    name: "Simgot EA1000 Fermat",
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
    name: "Letshuoer S12 Pro",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-waner",
    name: "Tangzu Wan'er S.G",
    price: 22,
    stock: 40,
    experienceLevel: "BEGINNER",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "TANGZU",
    storeName: "TANGZU Audio Official Store",
    storeCity: "Jakarta Selatan",
    description: "10mm PET diaphragm dynamic driver tuned for pleasant vocal intimacy and effortless everyday listening.",
    images: ["/images/transparent/waner-sg-transparent.png"],
    image: "/images/transparent/waner-sg-transparent.png",
    rating: 4.7,
    reviews: 310,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-nezha",
    name: "Tangzu Nezha",
    price: 399,
    stock: 12,
    experienceLevel: "FLAGSHIP",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "TANGZU",
    storeName: "TANGZU Audio Official Store",
    storeCity: "Jakarta Selatan",
    description: "Tribrid architecture with electro-piezoelectric supertweeter and layered resin acoustic chamber.",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    rating: 4.9,
    reviews: 58,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-zetian-wu",
    name: "Tangzu Zetian Wu",
    price: 199,
    stock: 18,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "TANGZU",
    storeName: "TANGZU Audio Official Store",
    storeCity: "Jakarta Selatan",
    description: "14.5mm planar magnetic transducer in full CNC aluminum housing, tuned in collaboration with HBB.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    rating: 4.8,
    reviews: 142,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-shimin-li",
    name: "Tangzu Shimin Li",
    price: 35,
    stock: 25,
    experienceLevel: "BEGINNER",
    soundSignature: "V_SHAPE",
    category: "IN-EAR MONITORS",
    brand: "TANGZU",
    storeName: "TANGZU Audio Official Store",
    storeCity: "Jakarta Selatan",
    description: "10mm N52 dynamic driver with dual cavity acoustic tuning and aviation-grade zinc alloy faceplates.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-arya",
    name: "HiFiMAN Arya Stealth",
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
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-hd800s",
    name: "Sennheiser HD 800 S",
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
    inStock: true,
    preOrder: false,
  },
  // --- NEW 20 DIVERSE & TWS PRODUCTS ---
  {
    id: "prod-wf1000xm5",
    name: "Sony WF-1000XM5",
    price: 299,
    stock: 25,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "WARM",
    category: "TWS / WIRELESS",
    brand: "SONY",
    storeName: "Sony Official Store",
    storeCity: "Jakarta Selatan",
    description: "Equipped with Dynamic Driver X, dual proprietary processors V2/QN2e, LDAC Hi-Res Audio Wireless, and class-leading noise cancellation.",
    images: [
      "https://sony.scene7.com/is/image/sonyglobalsolutions/Primary_image_1200-1?$S7Product$&fmt=png-alpha",
      "https://sony.scene7.com/is/image/sonyglobalsolutions/Primary_image_black?$categorypdpnav$&fmt=png-alpha",
      "https://sony.scene7.com/is/image/sonyglobalsolutions/00-19?$large360ViewerImage$"
    ],
    image: "https://sony.scene7.com/is/image/sonyglobalsolutions/Primary_image_1200-1?$S7Product$&fmt=png-alpha",
    rating: 4.9,
    reviews: 180,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-space-travel",
    name: "Moondrop Space Travel",
    price: 25,
    stock: 45,
    experienceLevel: "BEGINNER",
    soundSignature: "NEUTRAL",
    category: "TWS / WIRELESS",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Bandung",
    description: "13mm Titanium dome dynamic driver with VDSF Target curve calibration, transparent mechanical case design, and 55ms low latency mode.",
    images: [
      "/images/transparent/space-travel-transparent.png",
      "https://cn.cdn.moondroplab.com/627128d862c9a44234848dda/67b84288d5945b9b15ec7746_64c1d6555e63a23d3f3b35da_SPACETRAVEL.jpeg",
      "https://cn.cdn.moondroplab.com/627128d862c9a44234848dda/6875c15aeaaf13e443d94f7a_SPACETRAVEL2.jpg"
    ],
    image: "/images/transparent/space-travel-transparent.png",
    rating: 4.7,
    reviews: 320,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-airpods-pro2",
    name: "Apple AirPods Pro 2",
    price: 249,
    stock: 30,
    experienceLevel: "BEGINNER",
    soundSignature: "NEUTRAL",
    category: "TWS / WIRELESS",
    brand: "APPLE",
    storeName: "CSI Zone",
    storeCity: "Surabaya",
    description: "Powered by Apple H2 headphone processor with 2x Active Noise Cancellation, Adaptive Transparency, and personalized Spatial Audio.",
    images: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3_AV1?wid=1144&hei=1144&fmt=jpeg&qlt=90",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3_AV2?wid=1144&hei=1144&fmt=jpeg&qlt=90"
    ],
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90",
    rating: 4.8,
    reviews: 420,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-eah-az80",
    name: "Technics EAH-AZ80",
    price: 299,
    stock: 14,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "WARM",
    category: "TWS / WIRELESS",
    brand: "TECHNICS",
    storeName: "Bass Audio Official",
    storeCity: "Jakarta Selatan",
    description: "10mm free-edge aluminum diaphragm with acoustic control chamber, industry-first 3-device multipoint pairing, and LDAC wireless audio.",
    images: ["https://images.unsplash.com/photo-1590658002970-d603a11dfb25?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1590658002970-d603a11dfb25?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 86,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-wh1000xm5",
    name: "Sony WH-1000XM5",
    price: 399,
    stock: 20,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "WARM",
    category: "HEADPHONE",
    brand: "SONY",
    storeName: "Sony Official Store",
    storeCity: "Jakarta Selatan",
    description: "Integrated Processor V1 and HD Noise Canceling Processor QN1 controlling 8 microphones with carbon fiber 30mm precision drivers.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 240,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-focal-bathys",
    name: "Focal Bathys",
    price: 699,
    stock: 7,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "HEADPHONE",
    brand: "FOCAL",
    storeName: "Headphone Zone ID",
    storeCity: "Jakarta Barat",
    description: "Made in France Aluminum/Magnesium M-dome speaker drivers with integrated USB-DAC mode supporting native 24-bit/192kHz high-resolution audio.",
    images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 62,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-m50x-bt2",
    name: "Audio-Technica M50xBT2",
    price: 199,
    stock: 22,
    experienceLevel: "BEGINNER",
    soundSignature: "V_SHAPE",
    category: "HEADPHONE",
    brand: "AUDIO-TECHNICA",
    storeName: "CSI Zone",
    storeCity: "Surabaya",
    description: "Legendary M50x sonic signature with 45mm large-aperture drivers, dedicated AK4331 audio DAC, low latency mode, and 50-hour battery life.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 175,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-meze-109pro",
    name: "Meze 109 PRO",
    price: 799,
    stock: 6,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "WARM",
    category: "HEADPHONE",
    brand: "MEZE AUDIO",
    storeName: "Linsoul Audio",
    storeCity: "Surabaya",
    description: "50mm dynamic driver with Beryllium-coated polymer dome and carbon fiber cellulose composite, housed in sustainably harvested Black Walnut earcups.",
    images: ["https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviews: 58,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-fiio-btr7",
    name: "FiiO BTR7",
    price: 199,
    stock: 20,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    category: "DAC/AMP",
    brand: "FIIO",
    storeName: "Bass Audio Official",
    storeCity: "Jakarta Selatan",
    description: "Dual ES9219C DACs with THX AAA-28 amplifier architecture, 3.5mm SE + 4.4mm balanced output, color IPS display, and Qi wireless charging.",
    images: ["https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 140,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-ifi-goblu",
    name: "iFi Audio GO blu",
    price: 199,
    stock: 16,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "WARM",
    category: "DAC/AMP",
    brand: "IFI AUDIO",
    storeName: "Headphone Zone ID",
    storeCity: "Jakarta Barat",
    description: "Cirrus Logic 32-bit DAC with DirectDrive analog circuitry, XBass and XSpace analog sound enhancement, and 4.4mm balanced output in a matchbox size.",
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 92,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-qudelix-5k",
    name: "Qudelix-5K DAC",
    price: 109,
    stock: 25,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    category: "DAC/AMP",
    brand: "QUDELIX",
    storeName: "CSI Zone",
    storeCity: "Surabaya",
    description: "Dual ES9218p Sabre DACs with full 20-band hardware Parametric EQ app integration, LDAC/aptX Adaptive, and 2.5mm balanced output.",
    images: ["https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 215,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-dawn-pro",
    name: "Moondrop Dawn Pro",
    price: 49,
    stock: 35,
    experienceLevel: "BEGINNER",
    soundSignature: "NEUTRAL",
    category: "DAC/AMP",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Bandung",
    description: "Dual Cirrus Logic CS43131 decoding chips in full CNC aluminum housing with 100-step hardware volume control and dual 3.5mm/4.4mm ports.",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 190,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-dx3-pro-plus",
    name: "Topping DX3 Pro+",
    price: 199,
    stock: 12,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    category: "DAC/AMP",
    brand: "TOPPING",
    storeName: "Linsoul Audio",
    storeCity: "Surabaya",
    description: "ESS ES9038Q2M DAC chip with NFCA headphone amplification, Bluetooth 5.0 LDAC receiver, USB/Optical/Coaxial inputs, and remote control.",
    images: ["https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 130,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-zero-red",
    name: "Truthear Crinacle ZERO:RED",
    price: 55,
    stock: 30,
    experienceLevel: "BEGINNER",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "TRUTHEAR",
    storeName: "ShenzhenAudio Official",
    storeCity: "Jakarta Pusat",
    description: "Dual dynamic driver (10mm + 7.8mm) with polyurethane suspension composite liquid crystal dome, tuned to the Crinacle Target with optional 10Ω bass adapter.",
    images: ["https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=800&q=80"],
    image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 350,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-7hz-zero",
    name: "7Hz Salnotes Zero",
    price: 20,
    stock: 50,
    experienceLevel: "BEGINNER",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "7HZ",
    storeName: "Linsoul Audio",
    storeCity: "Surabaya",
    description: "10mm dynamic driver with metal composite diaphragm, precision acoustic cavity, and detachable 0.78mm 2-pin silver-plated OFC cable.",
    images: ["/images/transparent/7hz-zero-transparent.png"],
    image: "/images/transparent/7hz-zero-transparent.png",
    rating: 4.7,
    reviews: 410,
    inStock: true,
    preOrder: false,
  },
  {
    id: "prod-kiwi-cadenza",
    name: "Kiwi Ears Cadenza",
    price: 35,
    stock: 28,
    experienceLevel: "BEGINNER",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "KIWI EARS",
    storeName: "Linsoul Audio",
    storeCity: "Surabaya",
    description: "Acclaimed 10mm beryllium-coated dynamic driver housed in an artisan medical-grade 3D printed resin shell, celebrated for punchy bass authority and natural musical timbre.",
    images: ["/images/transparent/cadenza-transparent.png", "/images/kiwi-ears-cadenza-gallery.webp"],
    image: "/images/transparent/cadenza-transparent.png",
    rating: 4.8,
    reviews: 260,
    inStock: true,
    preOrder: false,
    driverType: "10mm Beryllium-Coated Diaphragm Dynamic Driver",
    material: "Medical-Grade 3D-Printed Resin Acoustic Housing",
    tuning: "Harman-Inspired Warm-Balanced Audiophile Curve",
    impedance: "32Ω (@1kHz)",
    sensitivity: "110dB SPL/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Braided Copper",
    squiglinkUrl: "https://squig.link/?share=Kiwi_Ears_Cadenza",
  },
  {
    id: "prod-waner-sg2",
    name: "Tangzu Wan'er SG 2",
    price: 20,
    stock: 85,
    experienceLevel: "BEGINNER",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "TANGZU",
    storeName: "TANGZU Audio Official Store",
    storeCity: "Jakarta Pusat",
    description: "The official sequel to the legendary Wan'er S.G. Upgraded 10mm PET dual-cavity dynamic driver with redesigned acoustic airflow damping, modern fish-scale wave faceplate, and silver-plated OFC cable with Tang Sancai tips.",
    images: ["/images/official-waner-sg2.jpg", "/images/official-waner-sg2-render.png"],
    image: "/images/official-waner-sg2.jpg",
    rating: 4.8,
    reviews: 96,
    badge: "Best Seller",
    inStock: true,
    preOrder: false,
    driverType: "10mm PET Diaphragm Dual-Cavity Dynamic Driver with N52 Neodymium Magnets",
    material: "Acoustic Resin Housing with Fish-Scale Geometric Wave Faceplate",
    tuning: "Tangzu Balanced-Linear Target Curve",
    impedance: "16Ω (@1kHz)",
    sensitivity: "107dB/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin Silver-Plated OFC Cable",
    squiglinkUrl: "https://squig.link/?share=Tangzu_Waner",
  },
  {
    id: "prod-waner-redlion",
    name: "Tangzu Wan'er SG 2 Red Lion",
    price: 23,
    stock: 60,
    experienceLevel: "BEGINNER",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "TANGZU",
    storeName: "TANGZU Audio Official Store",
    storeCity: "Jakarta Pusat",
    description: "Special cultural edition built on the Wan'er SG 2 dynamic acoustic platform. Features a 3D sculptural artisan relief faceplate depicting the traditional Lion Dance (Barongsai), cast in translucent ruby-red resin with CNC gold-plated brass nozzles.",
    images: ["/images/transparent/waner-redlion-transparent.png", "/images/official-redlion.png"],
    image: "/images/transparent/waner-redlion-transparent.png",
    rating: 4.9,
    reviews: 142,
    badge: "Best Seller",
    inStock: true,
    preOrder: false,
    driverType: "10mm PET Diaphragm Dual-Cavity Dynamic Driver with Cultural Resonance Chamber",
    material: "Ruby Red Translucent Acoustic Resin with 3D Sculpted Lion Relief & CNC Gold Brass Nozzle",
    tuning: "Tangzu Warm-Musical Target with Expressive Vocal Presence",
    impedance: "16Ω (@1kHz)",
    sensitivity: "107dB/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "3.5mm SE / 0.78mm 2-Pin High-Purity OFC Detachable Cable",
    squiglinkUrl: "https://squig.link/?share=Tangzu_Waner",
  },
  {
    id: "prod-tanchjim-nora",
    name: "Tanchjim Nora",
    price: 109.99,
    stock: 45,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "IN-EAR MONITORS",
    brand: "TANCHJIM",
    storeName: "Tanchjim Official Store",
    storeCity: "Jakarta Utara",
    description: "Tanchjim Nora adalah IEM monitor studio Hi-Fi flagship yang dilengkapi DMT5 dual-magnetic dual-cavity dynamic driver dengan kubah DLC (Diamond-Like Carbon). Menghasilkan separasi instrumen yang luar biasa akurat, resolusi mikro detail tinggi, dan vokal natural yang jernih tanpa distorsi (THD <0.049%). Dilengkapi housing resin medis transparan berbalut sapphire glass dan modular plug 3.5mm/4.4mm balanced.",
    images: ["/images/tanchjim-nora-showcase.webp"],
    image: "/images/tanchjim-nora-showcase.webp",
    rating: 4.9,
    reviews: 94,
    badge: "Top Rated",
    inStock: true,
    preOrder: false,
    driverType: "DMT5-Architecture Dual-Magnetic Dual-Cavity Dynamic Driver with DLC Dome",
    material: "High-Transparency Medical Resin Cavity with Aerospace Metal Frame & Sapphire Glass",
    tuning: "Tanchjim Reference Hi-Fi Studio Monitoring Curve",
    impedance: "16Ω (±5% @1kHz)",
    sensitivity: "125dB/Vrms",
    frequencyResponse: "2Hz – 48kHz",
    cableTermination: "Modular 3.5mm SE & 4.4mm BAL / 0.78mm 2-Pin Silver-Plated Cable",
    squiglinkUrl: "https://squig.link/?share=Tanchjim_Nora",
  },
  {
    id: "prod-tanchjim-bunny",
    name: "Tanchjim Bunny",
    price: 21.99,
    stock: 65,
    experienceLevel: "BEGINNER",
    soundSignature: "WARM",
    category: "IN-EAR MONITORS",
    brand: "TANCHJIM",
    storeName: "Tanchjim Official Store",
    storeCity: "Jakarta Utara",
    description: "Tanchjim Bunny adalah in-ear monitor ultra-budget berdesain ergonomis compact dengan arsitektur DMT 4 Ultra dual-chamber dynamic driver. Mengusung diafragma komposit PU suspension dengan titanium dome, menghadirkan respon bass yang empuk bertenaga, vokal hangat intim, dan treble yang halus tanpa sibilance. Tersedia dalam varian 3.5mm SE dan Type-C DSP dengan built-in DAC/EQ.",
    images: ["/images/tanchjim-bunny.webp"],
    image: "/images/tanchjim-bunny.webp",
    rating: 4.8,
    reviews: 68,
    badge: "New Arrival",
    inStock: true,
    preOrder: false,
    driverType: "DMT 4 Ultra Dual-Chamber Dynamic Driver with Titanium Dome Composite Diaphragm",
    material: "Ultra-Lightweight Transparent Medical-Grade PC Cavity with Stainless Steel Faceplate",
    tuning: "Harman-Inspired Warm-Balanced Vocal Curve with Ultra-Low THD (<0.05%)",
    impedance: "30Ω (±10% @1kHz)",
    sensitivity: "123dB/Vrms",
    frequencyResponse: "8Hz – 48kHz",
    cableTermination: "3.5mm SE / Type-C DSP (0.78mm 2-Pin Detachable)",
    squiglinkUrl: "https://squig.link/?share=Tanchjim_Bunny",
  },
  {
    id: "prod-earfun-air-pro-4",
    name: "EarFun Air Pro 4",
    price: 89.99,
    stock: 45,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "WARM",
    category: "TRUE WIRELESS (TWS)",
    brand: "EARFUN",
    storeName: "EarFun Official Store",
    storeCity: "Jakarta Selatan",
    description: "EarFun flagship true wireless earphone featuring the Qualcomm QCC3091 SoC, aptX Lossless, LDAC Hi-Res Audio, and Snapdragon Sound certification. Equipped with QuietSmart 3.0 adaptive hybrid active noise cancellation up to -50dB and 52-hour combined battery endurance.",
    images: [
      "https://api.myearfun.com/image/product/0247bwk07mtkz0cjd4w.jpg",
      "https://api.myearfun.com/image/product/861padljs0ambbr52pd.jpg",
      "https://api.myearfun.com/image/product/808n42741rpoazs5gdu.png",
      "https://api.myearfun.com/image/product/361qt9inumh6ujgbegb.jpg"
    ],
    image: "https://api.myearfun.com/image/product/0247bwk07mtkz0cjd4w.jpg",
    rating: 4.9,
    reviews: 154,
    inStock: true,
    preOrder: false,
    driverType: "10mm Composite Dynamic Driver with Qualcomm QCC3091 SoC",
    material: "Ergonomic Matte Finish Shell with IPX5 Water Resistance",
    tuning: "Snapdragon Sound Audiophile Warm-Balanced Curve",
    impedance: "32Ω (@1kHz)",
    sensitivity: "105dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (LDAC Hi-Res Audio)",
    cableTermination: "Bluetooth 5.4 / aptX Lossless / LDAC / LC3 / Auracast",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-redmi-buds-5-pro",
    name: "Redmi Buds 5 Pro",
    price: 69.99,
    stock: 55,
    experienceLevel: "BEGINNER",
    soundSignature: "V_SHAPE",
    category: "TRUE WIRELESS (TWS)",
    brand: "REDMI",
    storeName: "Xiaomi Official Store",
    storeCity: "Jakarta Barat",
    description: "High-resolution coaxial dual-driver TWS featuring an 11mm titanium bass diaphragm and a 10mm piezoelectric ceramic tweeter. Boasts 52dB deep active noise reduction with an ultra-wide 4kHz frequency coverage and LDAC 24-bit/96kHz transmission.",
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-buds-5-pro/M/928cee5c075c4871cff505ab9e6774a9.jpg",
      "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-buds-5-pro/PC/d129b34af5f3bc641a22099949482ba4.png"
    ],
    image: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-buds-5-pro/M/928cee5c075c4871cff505ab9e6774a9.jpg",
    rating: 4.8,
    reviews: 210,
    inStock: true,
    preOrder: false,
    driverType: "Coaxial Dual Driver (11mm Titanium Dynamic + 10mm Ceramic Piezo Tweeter)",
    material: "High-Gloss Polycarbonate with Vegan Leather Texture Case (IP54)",
    tuning: "Hi-Res Audio Wireless Coaxial Hybrid Target",
    impedance: "16Ω (@1kHz)",
    sensitivity: "108dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (LDAC 24-bit/96kHz)",
    cableTermination: "Bluetooth 5.3 / LDAC / AAC / SBC Wireless",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-earfun-free-pro-3",
    name: "EarFun Free Pro 3",
    price: 69.99,
    stock: 40,
    experienceLevel: "BEGINNER",
    soundSignature: "WARM",
    category: "TRUE WIRELESS (TWS)",
    brand: "EARFUN",
    storeName: "EarFun Official Store",
    storeCity: "Jakarta Selatan",
    description: "Ultra-compact audiophile TWS featuring 7mm wool composite dynamic drivers and Qualcomm QCC3072 chipset with aptX Adaptive audio, Snapdragon Sound, and -43dB QuietSmart 2.0 active noise cancellation.",
    images: [
      "https://api.myearfun.com/image/product/001pcwya4axkjjojwfk.jpg",
      "https://api.myearfun.com/image/product/704u76q7zrelagjp3ao.jpg",
      "https://api.myearfun.com/image/product/439quaq11cxdbtkhbto.jpg"
    ],
    image: "https://api.myearfun.com/image/product/001pcwya4axkjjojwfk.jpg",
    rating: 4.8,
    reviews: 120,
    inStock: true,
    preOrder: false,
    driverType: "7mm Wool Composite Dynamic Driver with Qualcomm QCC3072",
    material: "Lightweight Ergonomic Shell with Silicone Ear Hooks (IPX5)",
    tuning: "Snapdragon Sound Warm-Punchy Target",
    impedance: "16Ω (@1kHz)",
    sensitivity: "102dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (aptX Adaptive 96kHz)",
    cableTermination: "Bluetooth 5.3 / aptX Adaptive / LC3 / AAC / Wireless Qi",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-golden-ages",
    name: "Moondrop Golden Ages",
    price: 79.99,
    stock: 30,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "TRUE WIRELESS (TWS)",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Jakarta Pusat",
    description: "Audiophile-grade true wireless planar earphones powered by Moondrop's patented 13mm full-frequency annular planar magnetic transducer. Features LDAC & LC3 high-resolution codecs, 44dB hybrid ANC, and customizable bass tuning presets in the Moondrop Link app.",
    images: [
      "https://cn.cdn.moondroplab.com/627128d862c9a44234848dda/67b84283f152cc7c471c94c2_6721a08cb9b2254e21f6cb9d_goldenage.jpeg",
      "https://cn.cdn.moondroplab.com/627128d862c9a44234848dda/6a2fb5f036590b1d78e2796f_GOLDENAGES2.jpg"
    ],
    image: "https://cn.cdn.moondroplab.com/627128d862c9a44234848dda/67b84283f152cc7c471c94c2_6721a08cb9b2254e21f6cb9d_goldenage.jpeg",
    rating: 5.0,
    reviews: 89,
    inStock: true,
    preOrder: false,
    driverType: "13mm Super Linear Full-Frequency Annular Planar Magnetic Driver",
    material: "Custom Retrospective Cassette-Player Aesthetic Shell",
    tuning: "Bionic Acoustic VDSF Reference Planar Target",
    impedance: "16Ω (@1kHz)",
    sensitivity: "110dB SPL/mW",
    frequencyResponse: "10Hz – 45kHz",
    cableTermination: "Bluetooth 5.3 / LDAC / LC3 / AAC Wireless",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-redmi-buds-4-pro",
    name: "Redmi Buds 4 Pro",
    price: 59.99,
    stock: 50,
    experienceLevel: "BEGINNER",
    soundSignature: "V_SHAPE",
    category: "TRUE WIRELESS (TWS)",
    brand: "REDMI",
    storeName: "Xiaomi Official Store",
    storeCity: "Jakarta Barat",
    description: "Certified Hi-Res Audio Wireless dual dynamic driver system featuring a 10mm aluminum alloy diaphragm woofer and a 6mm titanium diaphragm tweeter. Features 43dB hybrid ANC, 36-hour total battery, and LDAC support.",
    images: [
      "https://i02.appmifile.com/mi-com-product/fly-birds/m/redmi-buds-4-pro/f23f62fcc3e7651b9c8c930f2a693a6e.jpg"
    ],
    image: "https://i02.appmifile.com/mi-com-product/fly-birds/m/redmi-buds-4-pro/f23f62fcc3e7651b9c8c930f2a693a6e.jpg",
    rating: 4.7,
    reviews: 185,
    inStock: true,
    preOrder: false,
    driverType: "Dual Dynamic (10mm Aluminum Woofer + 6mm Titanium Tweeter)",
    material: "Ergonomic Gloss Streamlined Housing (IP54)",
    tuning: "Xiaomi Sound Lab Hi-Res Acoustic Tuning",
    impedance: "24Ω (@1kHz)",
    sensitivity: "106dB SPL/mW",
    frequencyResponse: "20Hz – 40kHz (LDAC Hi-Res)",
    cableTermination: "Bluetooth 5.3 / LDAC / AAC / SBC Wireless",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-moondrop-ultrasonic",
    name: "Moondrop Ultrasonic",
    price: 74.99,
    stock: 25,
    experienceLevel: "ENTHUSIAST",
    soundSignature: "NEUTRAL",
    category: "TRUE WIRELESS (TWS)",
    brand: "MOONDROP",
    storeName: "Moondrop Official Store",
    storeCity: "Jakarta Pusat",
    description: "Moondrop's reference hybrid TWS combining a 13mm sapphire-diaphragm dynamic driver with an FRA full-frequency balanced armature tweeter. Features LDAC & LC3 codec support, feedforward ANC, and Moondrop Link parametric EQ tuning.",
    images: [
      "https://cn.cdn.moondroplab.com/627128d862c9a44234848dda/67b842890eae0de15a81066e_66c2dc2333f582caed2b411c_ULTRASONIC.jpeg"
    ],
    image: "https://cn.cdn.moondroplab.com/627128d862c9a44234848dda/67b842890eae0de15a81066e_66c2dc2333f582caed2b411c_ULTRASONIC.jpeg",
    rating: 4.9,
    reviews: 62,
    inStock: true,
    preOrder: false,
    driverType: "13mm Sapphire Dynamic + FRA Balanced Armature Hybrid",
    material: "Precision Acoustic Cavity with Cyberpunk Charging Cradle",
    tuning: "VDSF Target Hybrid Reference Curve",
    impedance: "32Ω (@1kHz)",
    sensitivity: "108dB/Vrms",
    frequencyResponse: "15Hz – 40kHz",
    cableTermination: "Bluetooth 5.3 / LDAC / LC3 / AAC Wireless",
    squiglinkUrl: "https://squig.link",
  },
  {
    id: "prod-galaxy-buds2-pro",
    name: "Samsung Galaxy Buds2 Pro",
    price: 179.99,
    stock: 35,
    experienceLevel: "INTERMEDIATE",
    soundSignature: "NEUTRAL",
    category: "TRUE WIRELESS (TWS)",
    brand: "SAMSUNG",
    storeName: "Samsung Official Store",
    storeCity: "Surabaya",
    description: "Audiophile-tuned 2-way coaxial speaker setup delivering end-to-end 24-bit Hi-Fi audio via Samsung Seamless Codec. Features intelligent ANC with 3 high-SNR microphones that filter out ambient chatter, Voice Detect conversation mode, and 360 Audio with direct multi-channel support.",
    images: [
      "https://images.samsung.com/is/image/samsung/p6pim/id/2208/gallery/id-galaxy-buds2-pro-r510-sm-r510nzaaxse-533199915?$1164_776_PNG$",
      "https://images.samsung.com/is/image/samsung/p6pim/id/2208/gallery/id-galaxy-buds2-pro-r510-sm-r510nzaaxse-533199900?$1164_776_PNG$",
      "https://images.samsung.com/is/image/samsung/p6pim/id/2208/gallery/id-galaxy-buds2-pro-r510-sm-r510nzaaxse-533199901?$1164_776_PNG$",
      "https://images.samsung.com/id/galaxy-buds2-pro/feature/galaxy-buds2-pro-kv.jpg?imwidth=1080"
    ],
    image: "https://images.samsung.com/is/image/samsung/p6pim/id/2208/gallery/id-galaxy-buds2-pro-r510-sm-r510nzaaxse-533199915?$1164_776_PNG$",
    rating: 4.8,
    reviews: 275,
    inStock: true,
    preOrder: false,
    driverType: "Coaxial 2-Way Custom Speaker (10mm Woofer + 5.3mm Tweeter)",
    material: "Soft-Touch Matte Aerodynamic Finish with IPX7 Water Resistance",
    tuning: "Harman Target In-Ear Precision Tuning (AKG Acoustics)",
    impedance: "16Ω (@1kHz)",
    sensitivity: "107dB SPL/mW",
    frequencyResponse: "20Hz – 20kHz",
    cableTermination: "Bluetooth 5.3 / SSC (Samsung Seamless Codec) / AAC / SBC / Wireless Qi",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/?share=Buds2_Pro",
  },
];

export const ID_ALIASES: Record<string, string> = {
  "waner-redlion": "prod-waner-redlion",
  "tangzu-waner-redlion": "prod-waner-redlion",
  "tangzu-waner-sg-2-redlion": "prod-waner-redlion",
  "waner-sg-2-redlion": "prod-waner-redlion",
  "prod-waner-red-lion": "prod-waner-redlion",
  "tangzu-red-lion": "prod-waner-redlion",
  "tangzu-waner-sg-2": "prod-waner-sg2",
  "waner-2": "prod-waner-sg2",
  "waner2": "prod-waner-sg2",
  "tanchjim-nora": "prod-tanchjim-nora",
  "nora": "prod-tanchjim-nora",
  "tanchjim-bunny": "prod-tanchjim-bunny",
  "bunny": "prod-tanchjim-bunny",
  "prod-bunny": "prod-tanchjim-bunny",
  "kiwi-cadenza": "prod-kiwi-cadenza",
  "cadenza": "prod-kiwi-cadenza",
  // Moondrop Chu Series (Arabic & Roman numeral variants)
  "chu3": "prod-chu3",
  "chu-3": "prod-chu3",
  "chu-iii": "prod-chu3",
  "chuiii": "prod-chu3",
  "prod-chu-3": "prod-chu3",
  "prod-chu-iii": "prod-chu3",
  "prod-chuiii": "prod-chu3",
  "moondrop-chu-3": "prod-chu3",
  "moondrop-chu-iii": "prod-chu3",
  "moondrop-chu3": "prod-chu3",
  "chu": "prod-chu-2",
  "chu2": "prod-chu-2",
  "chu-2": "prod-chu-2",
  "chu-ii": "prod-chu-2",
  "prod-chu-2": "prod-chu-2",
  "prod-chu2": "prod-chu-2",

  // Moondrop Aria 2 & Legacy Aliases
  "aria-2": "prod-aria2",
  "aria2": "prod-aria2",
  "prod-aria2": "prod-aria2",
  "prod-aria-2": "prod-aria2",
  "moondrop-aria-2": "prod-aria2",
  "moondrop-aria2": "prod-aria2",
  "aria": "prod-aria2",
  "dusk": "prod-aria2",
  "prod-dusk": "prod-aria2",
  "prod-dusk-2": "prod-aria2",
  "prod-blessing-dusk": "prod-aria2",
  "crinacle-dusk": "prod-aria2",
  "moondrop-dusk": "prod-aria2",
  "moondrop-x-crinacle-dusk": "prod-aria2",
  "blessing-3": "prod-blessing3",
  "prod-blessing-3": "prod-blessing3",
  "blessing3": "prod-blessing3",
  "moondrop-blessing-3": "prod-blessing3",

  // Honkai Star Rail x Moondrop Sparxie Collab
  "prod-sparxie": "prod-sparxie",
  "sparxie": "prod-sparxie",
  "moondrop-sparxie": "prod-sparxie",
  "honkai-sparxie": "prod-sparxie",
  "honkai-star-rail-sparxie": "prod-sparxie",
  "sparkle": "prod-sparxie",
  "sparkle-tws": "prod-sparxie",
  "honkai-star-rail-x-moondrop-sparxie-rt-adaptive-anc-mini-hi-fi-tws": "prod-sparxie",

  // Sennheiser Audiophile Models
  "sennheiser-sec": "prod-momentum4",
  "prod-sennheiser-sec": "prod-momentum4",
  "momentum4": "prod-momentum4",
  "momentum-4": "prod-momentum4",
  "sennheiser-momentum-4": "prod-momentum4",
  "sennheiser-main": "prod-hd600",
  "prod-sennheiser-main": "prod-hd600",
  "hd600": "prod-hd600",
  "hd-600": "prod-hd600",
  "sennheiser-hd600": "prod-hd600",

  // Other IEMs & Figmas
  "prod-waner-se": "prod-waner",
  "prod-waner-sg": "prod-waner",
  "waner": "prod-waner",
  "tangzu-waner": "prod-waner",
  "mimisbrunnr": "prod-mimisbrunnr",
  "epz-g30": "prod-epz-g30",
  "wukong": "prod-wukong",
  "sennheiser-hd560s": "prod-hd600",
  "sony-ier-m9": "prod-ier-m9",
  "thieaudio-monarch-mk3": "prod-monarch-mk3",
  "simgot-ea1000": "prod-chu3",
  "kiwi-orchestra-lite": "prod-blessing3",

  // TWS & True Wireless
  "earfun-air-pro-4": "prod-earfun-air-pro-4",
  "air-pro-4": "prod-earfun-air-pro-4",
  "earfun-airpro4": "prod-earfun-air-pro-4",
  "prod-earfun-airpro4": "prod-earfun-air-pro-4",
  "redmi-buds-5-pro": "prod-redmi-buds-5-pro",
  "buds-5-pro": "prod-redmi-buds-5-pro",
  "redmi-buds5-pro": "prod-redmi-buds-5-pro",
  "space-travel": "prod-space-travel",
  "moondrop-space-travel": "prod-space-travel",
  "prod-moondrop-space-travel": "prod-space-travel",
  "golden-ages": "prod-golden-ages",
  "moondrop-golden-ages": "prod-golden-ages",
  "prod-moondrop-golden-ages": "prod-golden-ages",
  "wf-1000xm5": "prod-wf1000xm5",
  "sony-wf-1000xm5": "prod-wf1000xm5",
  "sony-wf1000xm5": "prod-wf1000xm5",
  "wf1000xm5": "prod-wf1000xm5",
  "airpods-pro-2": "prod-airpods-pro2",
  "apple-airpods-pro-2": "prod-airpods-pro2",
  "prod-apple-airpods-pro-2": "prod-airpods-pro2",
  "airpods-pro2": "prod-airpods-pro2",
  "galaxy-buds2-pro": "prod-galaxy-buds2-pro",
  "samsung-galaxy-buds2-pro": "prod-galaxy-buds2-pro",
  "buds2-pro": "prod-galaxy-buds2-pro",
  "earfun-free-pro-3": "prod-earfun-free-pro-3",
  "free-pro-3": "prod-earfun-free-pro-3",
  "earfun-freepro3": "prod-earfun-free-pro-3",
  "redmi-buds-4-pro": "prod-redmi-buds-4-pro",
  "buds-4-pro": "prod-redmi-buds-4-pro",
  "redmi-buds4-pro": "prod-redmi-buds-4-pro",
  "ultrasonic": "prod-moondrop-ultrasonic",
  "moondrop-ultrasonic": "prod-moondrop-ultrasonic",
  "prod-ultrasonic": "prod-moondrop-ultrasonic",
};

/**
 * Resolves the best matching reference product from FALLBACK_CATALOG.
 * Handles exact IDs, canonical ID aliases, clean title matching, and token overlap.
 */
export function findFallbackMatch(id?: string, name?: string): CatalogProduct | undefined {
  if (!id && !name) return undefined;
  const cleanId = (id || "").trim().toLowerCase();
  const resolvedId = ID_ALIASES[cleanId] || cleanId;

  // 1. Direct ID match
  let match = FALLBACK_CATALOG.find((p) => p.id === id || p.id === cleanId || p.id === resolvedId);
  if (match) return match;

  if (!name) return undefined;
  const targetClean = cleanProductName(name, id).toLowerCase().replace(/[^a-z0-9]/g, "");
  const targetNorm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const targetTokens = name.toLowerCase().split(/[\s\-_,()]+/).filter((t) => t.length > 2);

  // 2. Exact clean name match
  match = FALLBACK_CATALOG.find((p) => {
    const pClean = cleanProductName(p.name, p.id).toLowerCase().replace(/[^a-z0-9]/g, "");
    return pClean === targetClean;
  });
  if (match) return match;

  // 3. Substring inclusion
  match = FALLBACK_CATALOG.find((p) => {
    const pNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const pClean = cleanProductName(p.name, p.id).toLowerCase().replace(/[^a-z0-9]/g, "");
    return pNorm.includes(targetClean) || targetNorm.includes(pNorm) || targetClean.includes(pClean);
  });
  if (match) return match;

  // 4. Token overlap
  let bestItem: CatalogProduct | undefined = undefined;
  let bestScore = 0;
  for (const p of FALLBACK_CATALOG) {
    const pTokens = p.name.toLowerCase().split(/[\s\-_,()]+/).filter((t) => t.length > 2);
    const score = targetTokens.filter((t) => pTokens.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      bestItem = p;
    }
  }

  if (bestScore >= 2) return bestItem;
  return undefined;
}

// In-memory catalog cache with request deduplication
let cachedCatalog: CatalogProduct[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60s memory cache
let pendingCatalogPromise: Promise<CatalogProduct[]> | null = null;

export function invalidateCatalogCache(): void {
  cachedCatalog = null;
  cacheTimestamp = 0;
  pendingCatalogPromise = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("productsUpdated", () => invalidateCatalogCache());
}

export async function fetchProductsFromDb(): Promise<CatalogProduct[]> {
  const now = Date.now();
  if (cachedCatalog && now - cacheTimestamp < CACHE_TTL_MS) {
    return mergeWithAdminAndCustomProducts(cachedCatalog);
  }

  if (pendingCatalogPromise) {
    const prods = await pendingCatalogPromise;
    return mergeWithAdminAndCustomProducts(prods);
  }

  pendingCatalogPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("Product")
        .select(`
          *,
          brand:Brand(name),
          store:Store(storeName, address),
          category:Category(name)
        `)
        .order("price", { ascending: false });

      if (!error && data && data.length > 0) {
        const dbProducts = data.map((item: any, index: number) => {
          const brandName = Array.isArray(item.brand) ? item.brand[0]?.name : item.brand?.name || "Audiophile";
          const fallbackMatch = findFallbackMatch(item.id, item.name);
          const isMoondrop =
            brandName.toUpperCase().includes("MOONDROP") ||
            item.name.toUpperCase().includes("MOONDROP") ||
            (fallbackMatch?.brand || "").toUpperCase().includes("MOONDROP");

          const storeName = isMoondrop
            ? "MOONDROP Official Flagship Store"
            : Array.isArray(item.store)
            ? item.store[0]?.storeName
            : item.store?.storeName || "TonalZone Partner";
          const resolvedStoreId = isMoondrop ? "store-moondrop-official" : item.storeId || "store-bass-audio";
          const storeCity = Array.isArray(item.store) ? item.store[0]?.address : item.store?.address || "Jakarta";
          const catName = Array.isArray(item.category) ? item.category[0]?.name : item.category?.name || "IN-EAR MONITORS";
          const imgList = Array.isArray(item.images) && item.images.length >= 3
            ? item.images
            : (fallbackMatch?.images && fallbackMatch.images.length >= 3 ? fallbackMatch.images : Array.isArray(item.images) && item.images.length > 0 ? item.images : ["/images/chu3-preview-1.webp"]);

          const rawProduct: CatalogProduct = {
            ...item,
            id: item.id,
            name: item.name,
            price: Number(item.price) || fallbackMatch?.price || 99,
            stock: Number(item.stock) || fallbackMatch?.stock || 10,
            experienceLevel: item.experienceLevel || fallbackMatch?.experienceLevel || "INTERMEDIATE",
            soundSignature: item.soundSignature || fallbackMatch?.soundSignature || "NEUTRAL",
            category: catName,
            brand: isMoondrop ? "MOONDROP" : brandName,
            storeId: resolvedStoreId,
            storeName,
            storeCity,
            description: item.description || fallbackMatch?.description || "Audiophile Reference Gear",
            images: imgList,
            image: imgList[0],
            rating: fallbackMatch?.rating ?? (4.7 + (index % 4) * 0.1),
            reviews: fallbackMatch?.reviews ?? (24 + (index * 7) % 180),
            badge: fallbackMatch?.badge ?? (index < 6 ? "Best Seller" : index % 5 === 0 ? "New Arrival" : undefined),
            inStock: (Number(item.stock) || 10) > 0,
            preOrder: (Number(item.stock) || 10) <= 2,
            variants: item.variants || item.variantOptions || item.variant_options,
            colors: item.colors || item.colorOptions || item.color_options,
          };

          return enhanceProductWithSpecs(rawProduct);
        });

        cachedCatalog = dbProducts;
        cacheTimestamp = Date.now();
        return dbProducts;
      }

      const fallback = FALLBACK_CATALOG.map((p) => {
        const isMoondrop = (p.brand || "").toUpperCase().includes("MOONDROP") || (p.name || "").toUpperCase().includes("MOONDROP");
        return enhanceProductWithSpecs({
          ...p,
          storeId: isMoondrop ? "store-moondrop-official" : p.storeId || "store-bass-audio",
          storeName: isMoondrop ? "MOONDROP Official Flagship Store" : p.storeName,
        });
      });
      cachedCatalog = fallback;
      cacheTimestamp = Date.now();
      return fallback;
    } catch (err) {
      console.error("[Products DB] Exception while fetching:", err);
      const fallback = FALLBACK_CATALOG.map((p) => {
        const isMoondrop = (p.brand || "").toUpperCase().includes("MOONDROP") || (p.name || "").toUpperCase().includes("MOONDROP");
        return enhanceProductWithSpecs({
          ...p,
          storeId: isMoondrop ? "store-moondrop-official" : p.storeId || "store-bass-audio",
          storeName: isMoondrop ? "MOONDROP Official Flagship Store" : p.storeName,
        });
      });
      return fallback;
    } finally {
      pendingCatalogPromise = null;
    }
  })();

  const prods = await pendingCatalogPromise;
  return mergeWithAdminAndCustomProducts(prods);
}

/**
 * Synchronizes client catalog with admin approval status and custom seller inventory.
 */
export function mergeWithAdminAndCustomProducts(baseList: CatalogProduct[]): CatalogProduct[] {
  if (typeof window === "undefined") return baseList;

  let result = [...baseList];

  try {
    const adminRaw = localStorage.getItem("tonalzone_admin_products");
    const adminList: any[] = adminRaw ? JSON.parse(adminRaw) : [];

    const customRaw = localStorage.getItem("tonalzone_custom_products");
    const customList: any[] = customRaw ? JSON.parse(customRaw) : [];

    // 1. Process custom seller products
    customList.forEach((cp: any) => {
      const existingInDb = result.find((r) => r.id === cp.id);
      const adminOverride = adminList.find((ap: any) => ap.id === cp.id);
      const isOfficialBrand = (cp.brand || "").toUpperCase().includes("MOONDROP") || (cp.storeId === "store-moondrop-official");
      const effectiveStatus = adminOverride?.status || (isOfficialBrand ? "APPROVED" : (existingInDb ? "APPROVED" : cp.status)) || "APPROVED";

      // If APPROVED by admin or official brand, inject or ensure in storefront
      if (effectiveStatus === "APPROVED") {
        const existingIdx = result.findIndex((r) => r.id === cp.id);
        const mappedProd: CatalogProduct = {
          id: cp.id,
          name: adminOverride?.name || cp.name,
          price: Number(adminOverride?.price ?? cp.priceUSD ?? cp.price) || 99,
          stock: Number(adminOverride?.stock ?? cp.stock) || 10,
          experienceLevel: cp.experienceLevel || "INTERMEDIATE",
          soundSignature: ((cp.soundSignature || "NEUTRAL") as string).toUpperCase().replace("-", "_") as any,
          category: adminOverride?.category || cp.category || "IN-EAR MONITORS",
          brand: cp.brand || "Custom Brand",
          storeId: cp.storeId || "store-seller",
          storeName: cp.storeName || "Seller Store",
          storeCity: cp.storeCity || "Jakarta",
          description: cp.description || cp.specsSummary || "Audiophile Reference Gear",
          images: cp.images && cp.images.length > 0 ? cp.images : [cp.image || "/model-iem-untuk-hero.webp"],
          image: cp.image || cp.images?.[0] || "/model-iem-untuk-hero.webp",
          rating: 5.0,
          reviews: 1,
          inStock: (Number(adminOverride?.stock ?? cp.stock) || 10) > 0,
          preOrder: false,
          variants: cp.variants,
        };

        if (existingIdx >= 0) {
          result[existingIdx] = enhanceProductWithSpecs({ ...result[existingIdx], ...mappedProd });
        } else {
          result.unshift(enhanceProductWithSpecs(mappedProd));
        }
      } else {
        // If explicitly REJECTED by admin, ensure it is NOT visible in storefront
        if (adminOverride?.status === "REJECTED") {
          result = result.filter((r) => r.id !== cp.id);
        }
      }
    });

    // 2. Apply admin overrides (price, stock, rejection) to any catalog product
    adminList.forEach((ap: any) => {
      const idx = result.findIndex((r) => r.id === ap.id);
      if (idx >= 0) {
        if (ap.status === "REJECTED" || ap.status === "PENDING") {
          result.splice(idx, 1);
        } else {
          result[idx] = {
            ...result[idx],
            name: ap.name || result[idx].name,
            price: Number(ap.price) || result[idx].price,
            stock: Number(ap.stock) || result[idx].stock,
            category: ap.category || result[idx].category,
            inStock: (Number(ap.stock) || result[idx].stock) > 0,
          };
        }
      }
    });
  } catch (e) {
    console.warn("Error merging admin/custom products:", e);
  }

  return result;
}

export async function fetchProductByIdFromDb(id: string): Promise<CatalogProduct | null> {
  const cleanId = (id || "").trim().toLowerCase();
  const resolvedId = ID_ALIASES[cleanId] || cleanId;
  const norm = resolvedId.replace(/[^a-z0-9]/g, "");
  const norm3 = norm.replace(/iii/g, "3").replace(/ii/g, "2");

  // Check client custom / admin products first
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem("tonalzone_custom_products");
      const adminRaw = localStorage.getItem("tonalzone_admin_products");
      const customList: any[] = customRaw ? JSON.parse(customRaw) : [];
      const adminList: any[] = adminRaw ? JSON.parse(adminRaw) : [];

      const customMatch = customList.find((c) => c.id === resolvedId || c.id === cleanId);
      if (customMatch) {
        const adminOverride = adminList.find((a) => a.id === customMatch.id);
        const effectiveStatus = adminOverride?.status || customMatch.status || "PENDING";
        if (effectiveStatus === "APPROVED") {
          return enhanceProductWithSpecs({
            id: customMatch.id,
            name: adminOverride?.name || customMatch.name,
            price: Number(adminOverride?.price ?? customMatch.priceUSD ?? customMatch.price) || 99,
            stock: Number(adminOverride?.stock ?? customMatch.stock) || 10,
            experienceLevel: customMatch.experienceLevel || "INTERMEDIATE",
            soundSignature: ((customMatch.soundSignature || "NEUTRAL") as string).toUpperCase().replace("-", "_") as any,
            category: adminOverride?.category || customMatch.category || "IN-EAR MONITORS",
            brand: customMatch.brand || "Custom Brand",
            storeId: customMatch.storeId || "store-seller",
            storeName: customMatch.storeName || "Seller Store",
            storeCity: customMatch.storeCity || "Jakarta",
            description: customMatch.description || customMatch.specsSummary || "Audiophile Reference Gear",
            images: customMatch.images && customMatch.images.length > 0 ? customMatch.images : [customMatch.image || "/model-iem-untuk-hero.webp"],
            image: customMatch.image || customMatch.images?.[0] || "/model-iem-untuk-hero.webp",
            rating: 5.0,
            reviews: 1,
            inStock: (Number(adminOverride?.stock ?? customMatch.stock) || 10) > 0,
            preOrder: false,
            variants: customMatch.variants,
          });
        }
      }
    } catch (e) {}
  }

  // Fast-path: Check in-memory cache before hitting Supabase network roundtrip
  if (cachedCatalog && cachedCatalog.length > 0) {
    const cachedItem = cachedCatalog.find((p) => {
      const pNorm = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      const pNorm3 = pNorm.replace(/iii/g, "3").replace(/ii/g, "2");
      const pNameNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/iii/g, "3").replace(/ii/g, "2");
      const isSubMatch = norm3.length >= 3 && (pNorm3.includes(norm3) || norm3.includes(pNorm3) || pNameNorm.includes(norm3));
      return (
        p.id === resolvedId ||
        p.id === cleanId ||
        pNorm === norm ||
        pNorm3 === norm3 ||
        isSubMatch
      );
    });
    if (cachedItem) {
      return enhanceProductWithSpecs(cachedItem);
    }
  }

  try {
    // 1. Direct match by ID in Supabase
    const { data, error } = await supabase
      .from("Product")
      .select(`
        *,
        brand:Brand(name),
        store:Store(storeName, address),
        category:Category(name)
      `)
      .eq("id", resolvedId)
      .maybeSingle();

    if (!error && data) {
      const item: any = data;
      const brandName = Array.isArray(item.brand) ? item.brand[0]?.name : item.brand?.name || "Audiophile";
      const fallbackMatch = findFallbackMatch(data.id, data.name);
      const isMoondrop =
        brandName.toUpperCase().includes("MOONDROP") ||
        item.name.toUpperCase().includes("MOONDROP") ||
        (fallbackMatch?.brand || "").toUpperCase().includes("MOONDROP");

      const storeName = isMoondrop
        ? "MOONDROP Official Flagship Store"
        : Array.isArray(item.store)
        ? item.store[0]?.storeName
        : item.store?.storeName || "TonalZone Partner";
      const resolvedStoreId = isMoondrop ? "store-moondrop-official" : item.storeId || "store-bass-audio";
      const storeCity = Array.isArray(item.store) ? item.store[0]?.address : item.store?.address || "Jakarta";
      const catName = Array.isArray(item.category) ? item.category[0]?.name : item.category?.name || "IN-EAR MONITORS";
      const imgList = Array.isArray(item.images) && item.images.length >= 3
        ? item.images
        : (fallbackMatch?.images && fallbackMatch.images.length >= 3 ? fallbackMatch.images : Array.isArray(item.images) && item.images.length > 0 ? item.images : ["/images/chu3-preview-1.webp"]);

      const foundProduct: CatalogProduct = {
        ...data,
        id: data.id,
        name: data.name,
        price: Number(data.price) || fallbackMatch?.price || 99,
        stock: Number(data.stock) || fallbackMatch?.stock || 10,
        experienceLevel: data.experienceLevel || fallbackMatch?.experienceLevel || "INTERMEDIATE",
        soundSignature: data.soundSignature || fallbackMatch?.soundSignature || "NEUTRAL",
        category: catName,
        brand: isMoondrop ? "MOONDROP" : brandName,
        storeId: resolvedStoreId,
        storeName,
        storeCity,
        description: data.description || fallbackMatch?.description || "Audiophile Reference Gear",
        images: imgList,
        image: imgList[0],
        rating: fallbackMatch?.rating ?? 4.9,
        reviews: fallbackMatch?.reviews ?? 48,
        badge: fallbackMatch?.badge,
        inStock: (Number(data.stock) || 10) > 0,
        preOrder: false,
        variants: (data as any).variants || (data as any).variantOptions || (data as any).variant_options,
        colors: (data as any).colors || (data as any).colorOptions || (data as any).color_options,
      };

      return enhanceProductWithSpecs(foundProduct);
    }

    // 2. Query all products from DB to find loose/slug/Roman-numeral match
    const allDb = await fetchProductsFromDb();
    const dbFound = allDb.find((p) => {
      const pNorm = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      const pNorm3 = pNorm.replace(/iii/g, "3").replace(/ii/g, "2");
      const pNameNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/iii/g, "3").replace(/ii/g, "2");
      const isSubMatch = norm3.length >= 3 && (pNorm3.includes(norm3) || norm3.includes(pNorm3) || pNameNorm.includes(norm3));
      return (
        p.id === resolvedId ||
        pNorm === norm ||
        pNorm3 === norm3 ||
        isSubMatch
      );
    });
    if (dbFound) return enhanceProductWithSpecs(dbFound);

    // 3. Fallback to FALLBACK_CATALOG only if database is offline or empty
    if (!allDb || allDb.length === 0) {
      const fallback = FALLBACK_CATALOG.find((p) => {
        const pNorm = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
        const pNorm3 = pNorm.replace(/iii/g, "3").replace(/ii/g, "2");
        const pNameNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/iii/g, "3").replace(/ii/g, "2");
        const isSubMatch = norm3.length >= 3 && (pNorm3.includes(norm3) || norm3.includes(pNorm3) || pNameNorm.includes(norm3));
        return (
          p.id === resolvedId ||
          pNorm === norm ||
          pNorm3 === norm3 ||
          isSubMatch
        );
      });

      return fallback ? enhanceProductWithSpecs(fallback) : null;
    }

    return null;
  } catch (err) {
    console.error("[Products DB] Exception while fetching by ID:", err);
    const fallback = FALLBACK_CATALOG.find((p) => {
      const pNorm = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      const pNorm3 = pNorm.replace(/iii/g, "3").replace(/ii/g, "2");
      const pNameNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/iii/g, "3").replace(/ii/g, "2");
      const isSubMatch = norm3.length >= 3 && (pNorm3.includes(norm3) || norm3.includes(pNorm3) || pNameNorm.includes(norm3));
      return (
        p.id === resolvedId ||
        pNorm === norm ||
        pNorm3 === norm3 ||
        isSubMatch
      );
    });
    return fallback ? enhanceProductWithSpecs(fallback) : null;
  }
}

/**
 * Unified audiophile-grade product search across catalog.
 * Matches keywords across title, brand, category, driver configuration,
 * materials, sound signature, tuning target, and descriptions with
 * Roman-numeral transliteration support (e.g. 'Chu 3' <-> 'Chu III').
 */
export function searchCatalog(products: CatalogProduct[], query: string): CatalogProduct[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) return products;

  // Normalize Roman numerals: "iii" <-> "3", "ii" <-> "2", "iv" <-> "4"
  const qNormalized = q.replace(/\biii\b/g, "3").replace(/\bii\b/g, "2").replace(/\biv\b/g, "4");
  const qTerms = qNormalized.split(/\s+/).filter(Boolean);

  return products.filter((p) => {
    const pNameNorm = p.name.toLowerCase().replace(/\biii\b/g, "3").replace(/\bii\b/g, "2").replace(/\biv\b/g, "4");
    const searchableText = [
      p.id,
      p.name,
      pNameNorm,
      p.brand,
      p.category,
      p.storeName,
      p.soundSignature,
      p.description,
      p.driverType || "",
      p.material || "",
      p.tuning || "",
      p.badge || "",
    ].join(" ").toLowerCase();

    return qTerms.every((term) => searchableText.includes(term));
  });
}
