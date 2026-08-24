"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";

export interface ProductVariant {
  id: string;
  name: string;
  priceUSD: number;
  stock: number;
  sku?: string;
}

export interface SellerProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  specsSummary: string;
  priceUSD: number;
  stock: number;
  condition: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  createdAt: string;
  image?: string;
  images?: string[];
  variants?: ProductVariant[];
}

const INITIAL_PRODUCTS: SellerProductItem[] = [
  {
    id: "PRD-901",
    name: "Sennheiser IE 900 Flagship",
    brand: "Sennheiser",
    category: "IN-EAR MONITORS",
    specsSummary: "7mm TrueResponse Dynamic Driver • 16Ω",
    priceUSD: 1299,
    stock: 8,
    condition: "Brand New Sealed",
    status: "APPROVED",
    createdAt: "2026-08-10",
    images: ["/placeholder.svg", "/model-iem-untuk-hero.webp"],
    variants: [
      { id: "var-1", name: "Anodized Aluminum (Standard 3.5mm)", priceUSD: 1299, stock: 5, sku: "IE900-35" },
      { id: "var-2", name: "Anodized Aluminum (Balanced 4.4mm)", priceUSD: 1299, stock: 3, sku: "IE900-44" },
    ],
  },
  {
    id: "PRD-902",
    name: "Sennheiser HD 660S2 Open-Back",
    brand: "Sennheiser",
    category: "HEADPHONES",
    specsSummary: "38mm Dynamic Transducer • 300Ω Open-Back",
    priceUSD: 599,
    stock: 5,
    condition: "Brand New Sealed",
    status: "APPROVED",
    createdAt: "2026-08-11",
    images: ["/placeholder.svg"],
    variants: [
      { id: "var-3", name: "Matte Black (Standard 6.35mm)", priceUSD: 599, stock: 3, sku: "HD660S2-635" },
      { id: "var-4", name: "Matte Black (4.4mm Pentaconn Cable)", priceUSD: 649, stock: 2, sku: "HD660S2-44" },
    ],
  },
  {
    id: "PRD-903",
    name: "64 Audio U12t Reference",
    brand: "64 Audio",
    category: "IN-EAR MONITORS",
    specsSummary: "12 Balanced Armatures with tia Tech • 12.6Ω",
    priceUSD: 2499,
    stock: 3,
    condition: "Brand New Sealed",
    status: "APPROVED",
    createdAt: "2026-08-08",
    images: ["/placeholder.svg", "/model-iem-untuk-hero.webp"],
    variants: [
      { id: "var-5", name: "Universal Ergonomic Shell (3.5mm)", priceUSD: 2499, stock: 2, sku: "U12T-35" },
      { id: "var-6", name: "Universal Ergonomic Shell (4.4mm Bal)", priceUSD: 2499, stock: 1, sku: "U12T-44" },
    ],
  },
  {
    id: "PRD-904",
    name: "Topping DX3 Pro+ DAC/AMP",
    brand: "Topping",
    category: "DAC/AMP",
    specsSummary: "ES9038Q2M • 1800mWx2 @ 32Ω • Bluetooth LDAC",
    priceUSD: 199,
    stock: 12,
    condition: "Brand New Sealed",
    status: "APPROVED",
    createdAt: "2026-08-13",
    images: ["/placeholder.svg"],
    variants: [
      { id: "var-7", name: "Obsidian Black Edition", priceUSD: 199, stock: 8, sku: "DX3P-BLK" },
      { id: "var-8", name: "Anodized Silver Edition", priceUSD: 199, stock: 4, sku: "DX3P-SLV" },
    ],
  },
  {
    id: "PRD-905",
    name: "FiiO M15S Flagship Android DAP",
    brand: "FiiO",
    category: "DIGITAL AUDIO PLAYERS",
    specsSummary: "Dual ES9038PRO • Snapdragon 660 • 64GB ROM",
    priceUSD: 999,
    stock: 4,
    condition: "Brand New Sealed",
    status: "APPROVED",
    createdAt: "2026-08-09",
    images: ["/placeholder.svg"],
  },
  {
    id: "PRD-906",
    name: "Effect Audio Ares S 8-Wire",
    brand: "Effect Audio",
    category: "CABLES & ADAPTERS",
    specsSummary: "UP-OCC Pure Copper • 0.78mm 2-Pin to 4.4mm Bal",
    priceUSD: 279,
    stock: 6,
    condition: "Brand New Sealed",
    status: "PENDING",
    createdAt: "2026-08-16",
    images: ["/placeholder.svg"],
    variants: [
      { id: "var-9", name: "0.78mm 2-Pin / 4.4mm Balanced", priceUSD: 279, stock: 4, sku: "ARES-2P-44" },
      { id: "var-10", name: "MMCX / 4.4mm Balanced", priceUSD: 279, stock: 2, sku: "ARES-MMCX-44" },
    ],
  },
  {
    id: "PRD-907",
    name: "Genelec 8010A Active Studio Monitors",
    brand: "Genelec",
    category: "SPEAKERS & MONITORS",
    specsSummary: "3-inch Woofer + 3/4-inch Tweeter • 50W Bi-Amp",
    priceUSD: 790,
    stock: 2,
    condition: "Brand New Sealed",
    status: "APPROVED",
    createdAt: "2026-08-04",
    images: ["/placeholder.svg"],
    variants: [
      { id: "var-11", name: "Dark Gray Textured (Pair)", priceUSD: 790, stock: 2, sku: "GEN-8010-GRY" },
    ],
  },
];

export default function SellerProductsPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [products, setProducts] = useState<SellerProductItem[]>(INITIAL_PRODUCTS);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "APPROVED" | "PENDING" | "OUT_OF_STOCK">("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [expandedVariants, setExpandedVariants] = useState<Record<string, boolean>>({});

  // Sync currency from localStorage
  useEffect(() => {
    const loadCurrency = () => {
      const saved = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
      if (saved) {
        setCurrency(saved);
      } else {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            if (u.storeCurrency) setCurrency(u.storeCurrency);
            else if (u.location === "Indonesia") setCurrency("IDR");
          } catch (e) {}
        }
      }
    };

    loadCurrency();
    window.addEventListener("storage", loadCurrency);
    return () => window.removeEventListener("storage", loadCurrency);
  }, []);

  const formatPrice = (usd: number) => {
    if (currency === "IDR") {
      return `Rp ${Math.round(usd * 15500).toLocaleString("id-ID")}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  // CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedCsvData, setParsedCsvData] = useState<Partial<SellerProductItem>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Edit Modal State
  const [editProduct, setEditProduct] = useState<SellerProductItem | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<SellerProductItem | null>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  // Toggle variant dropdown expansion in table
  const toggleExpandVariants = (id: string) => {
    setExpandedVariants((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tab filter
      if (activeTab === "APPROVED" && p.status !== "APPROVED") return false;
      if (activeTab === "PENDING" && p.status !== "PENDING") return false;
      if (activeTab === "OUT_OF_STOCK" && p.stock > 0) return false;

      // Category filter
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSpecs = p.specsSummary.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        return matchesName || matchesBrand || matchesSpecs || matchesCat || matchesId;
      }
      return true;
    });
  }, [products, activeTab, selectedCategory, searchQuery]);

  // Handle CSV file upload & parse
  const handleFileUpload = (file: File) => {
    setCsvFile(file);
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setImportErrors([isEn ? "CSV file is empty or missing data rows." : "File CSV kosong atau tidak memiliki baris data."]);
          return;
        }

        const parsed: Partial<SellerProductItem>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          if (cols.length >= 4) {
            parsed.push({
              id: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
              name: cols[0] || "Universal Audio Product",
              brand: cols[1] || "Generic",
              category: cols[2] || "IN-EAR MONITORS",
              specsSummary: cols[3] || "Audiophile Acoustic Specs",
              priceUSD: parseFloat(cols[4]) || 99,
              stock: parseInt(cols[5], 10) || 10,
              condition: cols[6] || "Brand New Sealed",
              status: "PENDING",
              createdAt: new Date().toISOString().split("T")[0],
              images: [],
            });
          }
        }

        setParsedCsvData(parsed);
      } catch (err) {
        setImportErrors([isEn ? "Failed to parse CSV file format." : "Gagal memproses format file CSV."]);
      }
    };
    reader.readAsText(file);
  };

  // Submit CSV Import
  const handleConfirmImport = () => {
    if (parsedCsvData.length > 0) {
      setProducts((prev) => [...(parsedCsvData as SellerProductItem[]), ...prev]);
      setIsImportModalOpen(false);
      setCsvFile(null);
      setParsedCsvData([]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const header = "ID,Name,Brand,Category,SpecsSummary,PriceUSD,Stock,Condition,Status,CreatedAt\n";
    const rows = products
      .map(
        (p) =>
          `"${p.id}","${p.name}","${p.brand}","${p.category}","${p.specsSummary}",${p.priceUSD},${p.stock},"${p.condition}","${p.status}","${p.createdAt}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tonalzone_catalog_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const template =
      "Name,Brand,Category,SpecsSummary,PriceUSD,Stock,Condition\n" +
      '"Moondrop Blessing 3","Moondrop","IN-EAR MONITORS","2DD+4BA Hybrid Structure",319,15,"Brand New Sealed"\n' +
      '"Sennheiser HD 660S2","Sennheiser","HEADPHONES","300Ω Open-Back Dynamic",599,8,"Brand New Sealed"\n' +
      '"Topping DX3 Pro+","Topping","DAC/AMP","ES9038Q2M Bluetooth LDAC",199,20,"Brand New Sealed"\n' +
      '"FiiO M15S Flagship DAP","FiiO","DIGITAL AUDIO PLAYERS","Dual ES9038PRO Android 12",999,5,"Brand New Sealed"\n' +
      '"Effect Audio Ares S","Effect Audio","CABLES & ADAPTERS","UP-OCC Pure Copper 4.4mm",279,10,"Brand New Sealed"\n';

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tonalzone_universal_product_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Multiple image upload in Quick Edit
  const handleEditMultipleImageUpload = (files: FileList) => {
    if (!editProduct) return;
    const existingImages = editProduct.images || (editProduct.image ? [editProduct.image] : []);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setEditProduct((prev) => {
            if (!prev) return null;
            const updated = [...(prev.images || (prev.image ? [prev.image] : [])), result];
            return { ...prev, images: updated, image: updated[0] };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Set primary cover image in Quick Edit
  const handleSetPrimaryImageInEdit = (index: number) => {
    if (!editProduct) return;
    const currentImages = editProduct.images || (editProduct.image ? [editProduct.image] : []);
    if (index >= currentImages.length || index === 0) return;

    const selected = currentImages[index];
    const remaining = currentImages.filter((_, i) => i !== index);
    const newImages = [selected, ...remaining];
    setEditProduct({
      ...editProduct,
      images: newImages,
      image: newImages[0],
    });
  };

  // Remove single image in Quick Edit
  const handleRemoveImageInEdit = (index: number) => {
    if (!editProduct) return;
    const currentImages = editProduct.images || (editProduct.image ? [editProduct.image] : []);
    const newImages = currentImages.filter((_, i) => i !== index);
    setEditProduct({
      ...editProduct,
      images: newImages,
      image: newImages.length > 0 ? newImages[0] : "",
    });
  };

  // Add Variant in Quick Edit
  const handleAddVariantInEdit = () => {
    if (!editProduct) return;
    const currentVariants = editProduct.variants || [];
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      name: isEn ? `Option ${currentVariants.length + 1}` : `Varian ${currentVariants.length + 1}`,
      priceUSD: editProduct.priceUSD,
      stock: 5,
      sku: `${editProduct.id}-V${currentVariants.length + 1}`,
    };
    setEditProduct({
      ...editProduct,
      variants: [...currentVariants, newVariant],
    });
  };

  // Remove Variant in Quick Edit
  const handleRemoveVariantInEdit = (varId: string) => {
    if (!editProduct || !editProduct.variants) return;
    setEditProduct({
      ...editProduct,
      variants: editProduct.variants.filter((v) => v.id !== varId),
    });
  };

  // Update Variant field in Quick Edit
  const handleUpdateVariantInEdit = (varId: string, field: keyof ProductVariant, value: any) => {
    if (!editProduct || !editProduct.variants) return;
    setEditProduct({
      ...editProduct,
      variants: editProduct.variants.map((v) => (v.id === varId ? { ...v, [field]: value } : v)),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Store Product Catalog & Inventory" : "Katalog Produk & Inventaris Toko"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1A1A1A] text-[#FAF9F6] border border-[#2E2E2E]">
              {products.length} {isEn ? "Total SKUs" : "Total Produk"}
            </span>
          </div>
          <p className="text-xs font-mono text-[#8E8E93] mt-1">
            {isEn
              ? "Universal store inventory: IEMs, Headphones, DAC/AMPs, DAPs, Custom Cables, Speakers & Studio Gear."
              : "Kelola seluruh katalog audio toko: IEM, Headphone, DAC/AMP, DAP, Kabel Custom, Speaker & Aksesoris."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-[#FAF9F6] border border-[#262626] hover:border-[#3E3E3E] px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isEn ? "Export CSV" : "Export CSV"}
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-white border border-[#2E2E2E] hover:border-white px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {isEn ? "Import from CSV" : "Import dari CSV"}
          </button>

          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-1.5 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold transition-all shadow-sm cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isEn ? "Add Product" : "Tambah Produk"}
          </Link>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar: Search, Filters & Tabs */}
        <div className="p-4 border-b border-[#1E1E1E] bg-[#141414] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: "ALL", label: isEn ? "All Products" : "Semua Produk", count: products.length },
              { id: "APPROVED", label: isEn ? "Approved & Active" : "Disetujui & Aktif", count: products.filter((p) => p.status === "APPROVED").length },
              { id: "PENDING", label: isEn ? "Pending QC" : "Menunggu QC", count: products.filter((p) => p.status === "PENDING").length },
              { id: "OUT_OF_STOCK", label: isEn ? "Out of Stock" : "Stok Habis", count: products.filter((p) => p.stock === 0).length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer whitespace-nowrap border ${
                  activeTab === tab.id
                    ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                    : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-[10px] font-mono text-[#777]">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2.5">
            <div className="w-44">
              <CustomSelect
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                options={[
                  { label: isEn ? "All Categories" : "Semua Kategori", value: "ALL" },
                  { label: "IEMs", value: "IN-EAR MONITORS" },
                  { label: "Headphones", value: "HEADPHONES" },
                  { label: "DAC / AMP", value: "DAC/AMP" },
                  { label: "DAP Players", value: "DIGITAL AUDIO PLAYERS" },
                  { label: "Cables", value: "CABLES & ADAPTERS" },
                  { label: "Speakers", value: "SPEAKERS & MONITORS" },
                ]}
              />
            </div>

            <div className="relative w-full sm:w-64">
              <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search model, brand, specs..." : "Cari produk, brand, spek..."}
                className="w-full bg-[#111] border border-[#2A2A2A] rounded-lg pl-9 pr-8 py-1.5 text-xs font-sans text-white placeholder:text-[#666] focus:outline-none focus:border-[#555] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E] bg-[#0E0E0E] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                <th className="px-5 py-3.5">{isEn ? "Product & Gallery" : "Produk & Galeri"}</th>
                <th className="px-5 py-3.5">{isEn ? "Brand / Category" : "Brand / Kategori"}</th>
                <th className="px-5 py-3.5 text-right">{isEn ? "Price" : "Harga Jual"}</th>
                <th className="px-5 py-3.5 text-right">{isEn ? "Stock" : "Stok"}</th>
                <th className="px-5 py-3.5 text-center">{isEn ? "QC Status" : "Status QC"}</th>
                <th className="px-5 py-3.5 text-right">{isEn ? "Actions" : "Aksi"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => {
                  const hasVariants = prod.variants && prod.variants.length > 0;
                  const isExpanded = !!expandedVariants[prod.id];
                  const totalStock = hasVariants
                    ? prod.variants!.reduce((sum, v) => sum + v.stock, 0)
                    : prod.stock;

                  const allImages = prod.images && prod.images.length > 0
                    ? prod.images
                    : prod.image
                    ? [prod.image]
                    : [];
                  const coverImage = allImages.length > 0 ? allImages[0] : "";

                  return (
                    <React.Fragment key={prod.id}>
                      <tr className="hover:bg-[#161616] transition-colors">
                        {/* Product Thumbnail & Name & Specs */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {/* Product Image / Placeholder Graphic with Photo Count Pill */}
                            <div className="w-12 h-12 rounded-lg bg-[#181818] border border-[#2A2A2A] overflow-hidden flex items-center justify-center text-[#777] shrink-0 relative group shadow-inner">
                              {coverImage ? (
                                <img src={coverImage} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-center p-1">
                                  {prod.category === "IN-EAR MONITORS" ? (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                                    </svg>
                                  ) : prod.category === "HEADPHONES" ? (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                    </svg>
                                  ) : prod.category === "DAC/AMP" ? (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                      <rect width="18" height="12" x="3" y="6" rx="2" />
                                      <circle cx="8" cy="12" r="2" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 12h4" />
                                    </svg>
                                  ) : (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                  )}
                                </div>
                              )}

                              {allImages.length > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-mono text-white px-1 rounded">
                                  +{allImages.length}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white truncate max-w-xs">{prod.name}</span>
                                {hasVariants && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandVariants(prod.id)}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#222] hover:bg-[#2A2A2A] text-[#AAA] border border-[#333] transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <span>{prod.variants!.length} {isEn ? "Variants" : "Varian"}</span>
                                    <svg
                                      width="10"
                                      height="10"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                      className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <span className="text-[11px] text-[#888] truncate mt-0.5">{prod.specsSummary}</span>
                              <span className="text-[10px] font-mono text-[#666]">{prod.condition}</span>
                            </div>
                          </div>
                        </td>

                        {/* Brand & Category (Subtle Gray Visual Hierarchy) */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-white text-xs">{prod.brand}</span>
                            <span className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider mt-0.5">
                              {prod.category}
                            </span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono font-bold text-white text-xs">
                          {formatPrice(prod.priceUSD)}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono text-xs">
                          <span
                            className={`font-bold ${
                              totalStock === 0 ? "text-rose-400" : totalStock <= 3 ? "text-amber-400" : "text-white"
                            }`}
                          >
                            {totalStock} {isEn ? "units" : "unit"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                prod.status === "APPROVED"
                                  ? "bg-emerald-400"
                                  : prod.status === "PENDING"
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                              }`}
                            />
                            {prod.status === "APPROVED"
                              ? isEn ? "Approved" : "Disetujui"
                              : prod.status === "PENDING"
                              ? isEn ? "In QC Review" : "Antrean QC"
                              : isEn ? "Rejected" : "Ditolak"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditProduct(prod)}
                              className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#262626] border border-[#2E2E2E] text-white text-[11px] font-mono rounded transition-colors cursor-pointer"
                            >
                              {isEn ? "Quick Edit" : "Edit Cepat"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteProduct(prod)}
                              className="p-1 bg-[#1A1A1A] hover:bg-[#262626] border border-[#2E2E2E] hover:border-white text-[#888] hover:text-white rounded transition-colors cursor-pointer"
                              title={isEn ? "Delete Product" : "Hapus Produk"}
                            >
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED VARIANTS SUB-ROWS */}
                      {hasVariants && isExpanded && (
                        <tr className="bg-[#0C0C0C]">
                          <td colSpan={6} className="px-5 py-3 border-y border-[#1A1A1A]">
                            <div className="space-y-2 pl-14">
                              <span className="text-[10px] font-mono uppercase text-[#777] tracking-wider block">
                                {isEn ? "Product Variants & Option Breakdown:" : "Rincian Varian & Opsi Produk:"}
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {prod.variants!.map((v) => (
                                  <div
                                    key={v.id}
                                    className="p-2.5 rounded-lg bg-[#141414] border border-[#222] flex items-center justify-between text-xs font-mono"
                                  >
                                    <div>
                                      <p className="text-white font-medium text-[11px]">{v.name}</p>
                                      {v.sku && <p className="text-[9px] text-[#666]">{v.sku}</p>}
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-emerald-400">{formatPrice(v.priceUSD)}</p>
                                      <p className="text-[10px] text-[#888]">{v.stock} {isEn ? "units" : "unit"}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-mono text-[#888]">
                    {isEn ? "No products found matching filters." : "Tidak ada produk yang cocok dengan pencarian."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: IMPORT FROM CSV */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 font-sans z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#222]">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isEn ? "Import Universal Audio Products from CSV" : "Import Produk Audio dari File CSV"}
                  </h3>
                  <p className="text-xs text-[#888] font-mono mt-0.5">
                    {isEn
                      ? "Upload bulk CSV file containing audio gear, categories, technical specs, and prices."
                      : "Unggah file CSV berisi daftar produk audio, kategori, spesifikasi, dan harga."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 rounded text-[#777] hover:text-white"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="mt-5 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#333] hover:border-[#555] bg-[#141414] hover:bg-[#181818] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-[#1E1E1E] border border-[#333] flex items-center justify-center text-emerald-400 mb-3">
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {csvFile ? csvFile.name : isEn ? "Click or drag CSV file here to upload" : "Klik atau seret file CSV ke sini"}
                  </p>
                  <p className="text-[10px] font-mono text-[#777] mt-1">
                    {isEn ? "Supported format: UTF-8 encoded .CSV" : "Format yang didukung: .CSV (UTF-8)"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#777]">{isEn ? "Need the universal template?" : "Butuh template CSV universal?"}</span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    {isEn ? "Download Sample Template (.CSV)" : "Unduh Template Universal (.CSV)"}
                  </button>
                </div>

                {/* Parsed Data Preview Table */}
                {parsedCsvData.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#222]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">
                        {isEn ? `Preview: ${parsedCsvData.length} Items Found` : `Pratinjau: ${parsedCsvData.length} Produk Terbaca`}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {isEn ? "Ready to import" : "Siap diimport"}
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-[#2A2A2A] rounded-lg bg-[#0E0E0E]">
                      <table className="w-full text-left text-[11px] font-sans">
                        <thead className="bg-[#181818] border-b border-[#2A2A2A] font-mono text-[9px] uppercase text-[#777]">
                          <tr>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Brand</th>
                            <th className="px-3 py-2">Category</th>
                            <th className="px-3 py-2 text-right">Price</th>
                            <th className="px-3 py-2 text-right">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E1E1E]">
                          {parsedCsvData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[#141414]">
                              <td className="px-3 py-2 text-white font-medium">{item.name}</td>
                              <td className="px-3 py-2 text-[#AAA]">{item.brand}</td>
                              <td className="px-3 py-2 text-[#888] font-mono text-[10px]">{item.category}</td>
                              <td className="px-3 py-2 text-right font-mono text-emerald-400">${item.priceUSD}</td>
                              <td className="px-3 py-2 text-right font-mono text-white">{item.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  disabled={parsedCsvData.length === 0}
                  onClick={handleConfirmImport}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:pointer-events-none text-black font-bold text-xs font-sans rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {isEn ? `Import ${parsedCsvData.length} Products` : `Import ${parsedCsvData.length} Produk`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: QUICK EDIT (MULTI-IMAGE GALLERY, PRICE, STOCK & VARIANTS) */}
      <AnimatePresence>
        {editProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 font-sans z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#222]">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isEn ? "Quick Edit Product & Gallery" : "Edit Cepat Produk & Galeri Foto"}
                  </h3>
                  <p className="text-[10px] font-mono text-[#888]">{editProduct.brand} • {editProduct.name}</p>
                </div>
                <button onClick={() => setEditProduct(null)} className="text-[#888] hover:text-white">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Multi-Image Gallery Manager in Quick Edit */}
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {isEn ? "Product Photo Gallery" : "Galeri Foto Produk"}
                    </h4>
                    <p className="text-[10px] font-mono text-[#777]">
                      {isEn ? "Upload multiple angle shots, packaging & accessories" : "Unggah foto dari berbagai sudut, box, & aksesoris"}
                    </p>
                  </div>
                  <input
                    ref={editImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleEditMultipleImageUpload(e.target.files);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => editImageInputRef.current?.click()}
                    className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#2E2E2E] hover:border-white text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {isEn ? "+ Add Photos" : "+ Tambah Foto"}
                  </button>
                </div>

                {/* Gallery Grid */}
                {editProduct.images && editProduct.images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {editProduct.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-lg overflow-hidden border h-20 bg-[#141414] group ${
                          idx === 0 ? "border-white/50" : "border-[#262626]"
                        }`}
                      >
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-black/90 text-white text-[8px] font-mono px-1 rounded border border-[#333]">
                            Cover
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImageInEdit(idx)}
                              className="w-full py-0.5 bg-[#2A2A2A] hover:bg-[#383838] text-white text-[8px] font-mono rounded border border-[#444]"
                              title="Set as Main Cover"
                            >
                              {isEn ? "Set Main" : "Utama"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImageInEdit(idx)}
                            className="w-full py-0.5 bg-[#1C1C1C] hover:bg-[#282828] text-white text-[8px] font-mono rounded border border-[#2E2E2E]"
                          >
                            {isEn ? "Delete" : "Hapus"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : editProduct.image ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#333]">
                      <img src={editProduct.image} alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => editImageInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#222] hover:bg-[#2A2A2A] text-white text-xs font-mono rounded-lg border border-[#333]"
                    >
                      {isEn ? "Upload More Images" : "Tambah Foto Lagi"}
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => editImageInputRef.current?.click()}
                    className="p-4 rounded-lg border border-dashed border-[#333] hover:border-[#555] bg-[#121212] text-center cursor-pointer"
                  >
                    <p className="text-xs text-[#888]">{isEn ? "Click to upload product gallery images" : "Klik untuk unggah foto galeri produk"}</p>
                  </div>
                )}
              </div>

              {/* Base Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                    {currency === "IDR" ? (isEn ? "Base Price (USD)" : "Harga Dasar (USD)") : (isEn ? "Base Price (USD)" : "Harga Dasar (USD)")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-mono font-bold">$</span>
                    <input
                      type="number"
                      value={editProduct.priceUSD}
                      onChange={(e) => setEditProduct({ ...editProduct, priceUSD: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-white outline-none focus:border-white font-bold text-emerald-400"
                    />
                  </div>
                  {currency === "IDR" && (
                    <p className="text-[10px] font-mono text-[#888] mt-1">
                      ≈ Rp {Math.round(editProduct.priceUSD * 15500).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Base Stock Count" : "Jumlah Stok Utama"}
                  </label>
                  <div className="flex items-center bg-[#161616] border border-[#2A2A2A] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setEditProduct({ ...editProduct, stock: Math.max(0, editProduct.stock - 1) })}
                      className="px-3 py-2 text-[#888] hover:text-white hover:bg-[#222] transition-colors font-mono"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={editProduct.stock}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-transparent text-xs font-mono text-white outline-none text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setEditProduct({ ...editProduct, stock: editProduct.stock + 1 })}
                      className="px-3 py-2 text-[#888] hover:text-white hover:bg-[#222] transition-colors font-mono"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Variants Section */}
              <div className="space-y-3 pt-2 border-t border-[#222]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {isEn ? "Product Variants & Options" : "Varian & Pilihan Opsi Produk"}
                    </h4>
                    <p className="text-[10px] font-mono text-[#777]">
                      {isEn ? "e.g. Color, Cable Jack, Impedance editions" : "Contoh: Pilihan warna, jack 4.4mm/3.5mm, impedansi"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantInEdit}
                    className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#2E2E2E] hover:border-white text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {isEn ? "Add Variant" : "Tambah Varian"}
                  </button>
                </div>

                {/* Variant List Table */}
                {editProduct.variants && editProduct.variants.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {editProduct.variants.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-lg bg-[#161616] border border-[#2A2A2A] flex items-center gap-2 text-xs font-mono"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => handleUpdateVariantInEdit(v.id, "name", e.target.value)}
                            placeholder="Variant Name"
                            className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-[11px] text-white outline-none focus:border-white"
                          />
                        </div>
                        <div className="w-24 relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-400 text-[10px]">$</span>
                          <input
                            type="number"
                            value={v.priceUSD}
                            onChange={(e) => handleUpdateVariantInEdit(v.id, "priceUSD", parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                            className="w-full bg-[#111] border border-[#333] rounded pl-5 pr-2 py-1 text-[11px] text-emerald-400 font-bold outline-none focus:border-white text-right"
                          />
                        </div>
                        <div className="w-24 flex items-center bg-[#111] border border-[#333] rounded overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateVariantInEdit(v.id, "stock", Math.max(0, (v.stock || 0) - 1))}
                            className="px-1.5 py-1 text-[#888] hover:text-white hover:bg-[#222] transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariantInEdit(v.id, "stock", parseInt(e.target.value, 10) || 0)}
                            placeholder="Stock"
                            className="w-full bg-transparent text-[11px] text-white outline-none text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateVariantInEdit(v.id, "stock", (v.stock || 0) + 1)}
                            className="px-1.5 py-1 text-[#888] hover:text-white hover:bg-[#222] transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantInEdit(v.id)}
                          className="p-1 text-[#666] hover:text-rose-400 transition-colors"
                          title="Delete variant"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#141414] border border-[#222] text-center text-[11px] font-mono text-[#666]">
                    {isEn ? "No variants added yet. Click '+ Add Variant' above." : "Belum ada varian. Klik '+ Tambah Varian' di atas."}
                  </div>
                )}
              </div>

              {/* Modal Save/Cancel */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? editProduct : p)));
                    setEditProduct(null);
                  }}
                  className="px-3.5 py-1.5 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Save Changes" : "Simpan Perubahan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-[#2E2E2E] rounded-2xl shadow-2xl p-6 font-sans z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center text-white shrink-0">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{isEn ? "Delete Product Listing?" : "Hapus Produk Ini?"}</h3>
                  <p className="text-xs text-[#888] mt-0.5">{deleteProduct.name}</p>
                </div>
              </div>

              <p className="text-xs text-[#AAA] leading-relaxed">
                {isEn
                  ? "Are you sure you want to permanently remove this audio product from your store catalog? This action cannot be undone."
                  : "Apakah Anda yakin ingin menghapus produk audio ini dari katalog toko Anda secara permanen? Tindakan ini tidak dapat dibatalkan."}
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setDeleteProduct(null)}
                  className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
                    setDeleteProduct(null);
                  }}
                  className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs font-sans rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {isEn ? "Delete Product" : "Hapus Produk"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
