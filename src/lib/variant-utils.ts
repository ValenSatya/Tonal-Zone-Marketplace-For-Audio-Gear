/**
 * Utility to parse dynamic product variants & colors from Supabase or product data.
 * Supports:
 * 1. Column `variants` / `colors` (JSON array, comma-separated string, or array of objects)
 * 2. Embedded in `description` via `[VARIANTS: 3,5mm, 4,4mm]` or `[COLORS: White, Black]`
 * 3. Returns empty arrays [] if no variants exist (so UI stays clean with no dummy pills)
 */

export function parseProductVariants(product: any): { variants: string[]; colors: string[] } {
  if (!product) return { variants: [], colors: [] };

  let rawVariants = product.variants || product.variantOptions || product.variant_options;
  let rawColors = product.colors || product.colorOptions || product.color_options;

  // 1. If variants is an object containing both (e.g. {"variants": [...], "colors": [...]})
  if (typeof rawVariants === "object" && rawVariants !== null && !Array.isArray(rawVariants)) {
    if (rawVariants.colors && !rawColors) rawColors = rawVariants.colors;
    if (rawVariants.variants) rawVariants = rawVariants.variants;
    else if (rawVariants.options) rawVariants = rawVariants.options;
  }

  const extractList = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (typeof item === "object" && item !== null) {
            return (item.name || item.title || item.label || item.value || item.sku || "").trim();
          }
          return String(item).trim();
        })
        .filter(Boolean);
    }
    if (typeof input === "string") {
      const str = input.trim();
      if (!str) return [];
      // Try parsing JSON if wrapped in brackets or braces
      if ((str.startsWith("[") && str.endsWith("]")) || (str.startsWith("{") && str.endsWith("}"))) {
        try {
          const parsed = JSON.parse(str);
          return extractList(parsed);
        } catch {}
      }
      // Comma, pipe, semicolon, or newline separated (smart about decimal commas like 3,5mm or 4,4mm)
      return str
        .split(/(?:\r?\n)+|[|;]+|,\s+|(?<=[^\d]),|,(?!\d)/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  let variantsList = extractList(rawVariants);
  let colorsList = extractList(rawColors);

  // 2. Fallback check: Embedded tags in product description e.g. [VARIANTS: 3,5mm, 4,4mm] [COLORS: White, Black]
  if ((variantsList.length === 0 || colorsList.length === 0) && typeof product.description === "string") {
    const desc = product.description;

    if (variantsList.length === 0) {
      const vMatch = desc.match(/\[VARIANTS?:\s*([^\]]+)\]/i) || desc.match(/(?:^|\n)Variants?:\s*([^\n]+)/i);
      if (vMatch && vMatch[1]) {
        variantsList = extractList(vMatch[1]);
      }
    }

    if (colorsList.length === 0) {
      const cMatch = desc.match(/\[COLORS?:\s*([^\]]+)\]/i) || desc.match(/(?:^|\n)Colors?:\s*([^\n]+)/i);
      if (cMatch && cMatch[1]) {
        colorsList = extractList(cMatch[1]);
      }
    }
  }

  // 3. Fallback check: localStorage custom products added by seller in demo
  if (typeof window !== "undefined" && (variantsList.length === 0 || colorsList.length === 0)) {
    try {
      const custom = localStorage.getItem("tonalzone_custom_products");
      if (custom) {
        const list = JSON.parse(custom);
        const found = list.find((it: any) => it.id === product.id || it.name === product.name);
        if (found?.variants && variantsList.length === 0) {
          variantsList = extractList(found.variants);
        }
        if (found?.colors && colorsList.length === 0) {
          colorsList = extractList(found.colors);
        }
      }
    } catch {}
  }

  return {
    variants: variantsList,
    colors: colorsList,
  };
}
