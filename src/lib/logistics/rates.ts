import { IndonesianZone, ServiceTier, CourierOptionQuote, InsuranceBreakdown } from "./types";
import { BASELINE_RATES } from "@/lib/currency";

const IDR_RATE = BASELINE_RATES.IDR || 16000;

/**
 * Maps Indonesian cities / regions to shipping logistic zones
 */
export function resolveCityZone(cityOrRegion: string): IndonesianZone {
  const norm = (cityOrRegion || "").toLowerCase().trim();

  if (
    norm.includes("jakarta") ||
    norm.includes("bogor") ||
    norm.includes("depok") ||
    norm.includes("tangerang") ||
    norm.includes("bekasi") ||
    norm.includes("jabodetabek")
  ) {
    return "JABODETABEK";
  }

  if (
    norm.includes("surabaya") ||
    norm.includes("bandung") ||
    norm.includes("semarang") ||
    norm.includes("yogyakarta") ||
    norm.includes("jogja") ||
    norm.includes("solo") ||
    norm.includes("malang")
  ) {
    return "JAVA_MAJOR_CITY";
  }

  if (
    norm.includes("jawa") ||
    norm.includes("banten") ||
    norm.includes("cirebon") ||
    norm.includes("sukabumi") ||
    norm.includes("tasikmalaya") ||
    norm.includes("purwokerto") ||
    norm.includes("kediri") ||
    norm.includes("jember") ||
    norm.includes("banyuwangi")
  ) {
    return "JAVA_INNER";
  }

  if (
    norm.includes("bali") ||
    norm.includes("denpasar") ||
    norm.includes("badung") ||
    norm.includes("lombok") ||
    norm.includes("mataram")
  ) {
    return "BALI_LOMBOK";
  }

  if (
    norm.includes("medan") ||
    norm.includes("palembang") ||
    norm.includes("padang") ||
    norm.includes("pekanbaru") ||
    norm.includes("batam") ||
    norm.includes("lampung") ||
    norm.includes("jambi") ||
    norm.includes("bengkulu") ||
    norm.includes("aceh") ||
    norm.includes("sumatera") ||
    norm.includes("sumatra")
  ) {
    return "SUMATRA";
  }

  if (
    norm.includes("balikpapan") ||
    norm.includes("samarinda") ||
    norm.includes("banjarmasin") ||
    norm.includes("pontianak") ||
    norm.includes("palangkaraya") ||
    norm.includes("kalimantan")
  ) {
    return "KALIMANTAN";
  }

  if (
    norm.includes("makassar") ||
    norm.includes("manado") ||
    norm.includes("palu") ||
    norm.includes("kendari") ||
    norm.includes("gorontalo") ||
    norm.includes("sulawesi")
  ) {
    return "SULAWESI";
  }

  if (
    norm.includes("papua") ||
    norm.includes("jayapura") ||
    norm.includes("ambon") ||
    norm.includes("maluku") ||
    norm.includes("sorong") ||
    norm.includes("timika") ||
    norm.includes("merauke")
  ) {
    return "MALUKU_PAPUA";
  }

  return "JAVA_MAJOR_CITY"; // Default fallback
}

/**
 * Base rate in IDR per 1 kg based on Origin Zone -> Destination Zone
 */
export function getBaseRatePerKg(
  origin: IndonesianZone,
  dest: IndonesianZone,
  tier: ServiceTier
): { ratePerKgIDR: number; etaDays: string } {
  // Same Zone Local
  if (origin === dest) {
    if (tier === "SAME_DAY") return { ratePerKgIDR: 25000, etaDays: "6-8 Hours" };
    if (tier === "NEXT_DAY") return { ratePerKgIDR: 18000, etaDays: "1 Day (Next Day)" };
    if (tier === "CARGO") return { ratePerKgIDR: 6000, etaDays: "2-3 Days" };
    return { ratePerKgIDR: 11000, etaDays: "1-2 Days" }; // REGULAR
  }

  // Cross Java / Jabodetabek
  const isOriginJava = origin === "JABODETABEK" || origin === "JAVA_MAJOR_CITY" || origin === "JAVA_INNER";
  const isDestJava = dest === "JABODETABEK" || dest === "JAVA_MAJOR_CITY" || dest === "JAVA_INNER";

  if (isOriginJava && isDestJava) {
    if (tier === "NEXT_DAY") return { ratePerKgIDR: 24000, etaDays: "1 Day (Next Day)" };
    if (tier === "CARGO") return { ratePerKgIDR: 8000, etaDays: "3-4 Days" };
    return { ratePerKgIDR: 16000, etaDays: "2-3 Days" }; // REGULAR
  }

  // Java <-> Bali / Lombok
  const isJavaToBali = (isOriginJava && dest === "BALI_LOMBOK") || (origin === "BALI_LOMBOK" && isDestJava);
  if (isJavaToBali) {
    if (tier === "NEXT_DAY") return { ratePerKgIDR: 35000, etaDays: "1-2 Days" };
    if (tier === "CARGO") return { ratePerKgIDR: 12000, etaDays: "4-5 Days" };
    return { ratePerKgIDR: 22000, etaDays: "2-3 Days" };
  }

  // Java <-> Sumatra / Kalimantan / Sulawesi
  const isMajorOuterIsland =
    dest === "SUMATRA" ||
    dest === "KALIMANTAN" ||
    dest === "SULAWESI" ||
    origin === "SUMATRA" ||
    origin === "KALIMANTAN" ||
    origin === "SULAWESI";

  if (isMajorOuterIsland) {
    if (tier === "NEXT_DAY") return { ratePerKgIDR: 52000, etaDays: "1-2 Days" };
    if (tier === "CARGO") return { ratePerKgIDR: 18000, etaDays: "5-7 Days" };
    return { ratePerKgIDR: 34000, etaDays: "3-4 Days" };
  }

  // Maluku / Papua
  if (dest === "MALUKU_PAPUA" || origin === "MALUKU_PAPUA") {
    if (tier === "NEXT_DAY") return { ratePerKgIDR: 110000, etaDays: "2-3 Days" };
    if (tier === "CARGO") return { ratePerKgIDR: 45000, etaDays: "7-10 Days" };
    return { ratePerKgIDR: 78000, etaDays: "4-6 Days" };
  }

  // Fallback
  return { ratePerKgIDR: 28000, etaDays: "3-4 Days" };
}

/**
 * Builds list of all available courier carrier choices with rates and estimated SLAs
 */
export function buildCourierQuotes(
  originZone: IndonesianZone,
  destinationZone: IndonesianZone,
  billableWeightKg: number,
  insurance: InsuranceBreakdown
): CourierOptionQuote[] {
  const options: CourierOptionQuote[] = [];

  // 1. JNE REGULAR (JNE REG)
  const jneReg = getBaseRatePerKg(originZone, destinationZone, "REGULAR");
  const jneRegFeeIDR = jneReg.ratePerKgIDR * billableWeightKg;
  const jneRegFeeUSD = Math.round((jneRegFeeIDR / IDR_RATE) * 100) / 100;
  options.push({
    courierCode: "JNE",
    courierName: "JNE Express",
    serviceTier: "REGULAR",
    serviceName: "JNE REG (Regular Delivery)",
    estimatedDays: jneReg.etaDays,
    shippingFeeUSD: jneRegFeeUSD,
    shippingFeeIDR: jneRegFeeIDR,
    insuranceBreakdown: insurance,
    totalWithInsuranceUSD: Math.round((jneRegFeeUSD + insurance.totalProtectionUSD) * 100) / 100,
    totalWithInsuranceIDR: jneRegFeeIDR + insurance.totalProtectionIDR,
    trackingSupported: true,
  });

  // 2. JNE YES (Yakin Esok Sampai / Next Day)
  const jneYes = getBaseRatePerKg(originZone, destinationZone, "NEXT_DAY");
  const jneYesFeeIDR = jneYes.ratePerKgIDR * billableWeightKg;
  const jneYesFeeUSD = Math.round((jneYesFeeIDR / IDR_RATE) * 100) / 100;
  options.push({
    courierCode: "JNE",
    courierName: "JNE Express",
    serviceTier: "NEXT_DAY",
    serviceName: "JNE YES (Priority Next Day Air)",
    estimatedDays: jneYes.etaDays,
    shippingFeeUSD: jneYesFeeUSD,
    shippingFeeIDR: jneYesFeeIDR,
    insuranceBreakdown: insurance,
    totalWithInsuranceUSD: Math.round((jneYesFeeUSD + insurance.totalProtectionUSD) * 100) / 100,
    totalWithInsuranceIDR: jneYesFeeIDR + insurance.totalProtectionIDR,
    trackingSupported: true,
  });

  // 3. SICEPAT BEST (Besok Sampai Tujuan)
  const sicepatBest = getBaseRatePerKg(originZone, destinationZone, "NEXT_DAY");
  const sicepatBestFeeIDR = Math.round(sicepatBest.ratePerKgIDR * 0.95 * billableWeightKg); // 5% promo margin
  const sicepatBestFeeUSD = Math.round((sicepatBestFeeIDR / IDR_RATE) * 100) / 100;
  options.push({
    courierCode: "SICEPAT",
    courierName: "SiCepat Ekspres",
    serviceTier: "NEXT_DAY",
    serviceName: "SiCepat BEST (Audiophile Fastline)",
    estimatedDays: sicepatBest.etaDays,
    shippingFeeUSD: sicepatBestFeeUSD,
    shippingFeeIDR: sicepatBestFeeIDR,
    insuranceBreakdown: insurance,
    totalWithInsuranceUSD: Math.round((sicepatBestFeeUSD + insurance.totalProtectionUSD) * 100) / 100,
    totalWithInsuranceIDR: sicepatBestFeeIDR + insurance.totalProtectionIDR,
    trackingSupported: true,
  });

  // 4. J&T Express (J&T EZ)
  const jntEz = getBaseRatePerKg(originZone, destinationZone, "REGULAR");
  const jntEzFeeIDR = Math.round(jntEz.ratePerKgIDR * 0.98 * billableWeightKg);
  const jntEzFeeUSD = Math.round((jntEzFeeIDR / IDR_RATE) * 100) / 100;
  options.push({
    courierCode: "JNT",
    courierName: "J&T Express",
    serviceTier: "REGULAR",
    serviceName: "J&T Super (Dedicated Handling)",
    estimatedDays: jntEz.etaDays,
    shippingFeeUSD: jntEzFeeUSD,
    shippingFeeIDR: jntEzFeeIDR,
    insuranceBreakdown: insurance,
    totalWithInsuranceUSD: Math.round((jntEzFeeUSD + insurance.totalProtectionUSD) * 100) / 100,
    totalWithInsuranceIDR: jntEzFeeIDR + insurance.totalProtectionIDR,
    trackingSupported: true,
  });

  // 5. Heavy Cargo Option if Weight >= 3kg (JNE JTR / SiCepat GOKIL)
  if (billableWeightKg >= 3) {
    const cargoRate = getBaseRatePerKg(originZone, destinationZone, "CARGO");
    const cargoFeeIDR = cargoRate.ratePerKgIDR * billableWeightKg;
    const cargoFeeUSD = Math.round((cargoFeeIDR / IDR_RATE) * 100) / 100;
    options.push({
      courierCode: "JNE",
      courierName: "JNE Trucking",
      serviceTier: "CARGO",
      serviceName: "JNE JTR (Heavy Desktop Audio Cargo)",
      estimatedDays: cargoRate.etaDays,
      shippingFeeUSD: cargoFeeUSD,
      shippingFeeIDR: cargoFeeIDR,
      insuranceBreakdown: insurance,
      totalWithInsuranceUSD: Math.round((cargoFeeUSD + insurance.totalProtectionUSD) * 100) / 100,
      totalWithInsuranceIDR: cargoFeeIDR + insurance.totalProtectionIDR,
      trackingSupported: true,
    });
  }

  return options;
}
