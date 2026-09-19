"use client";

import React, { useState } from "react";
import { useAdminData } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import CustomSelect from "@/components/ui/custom-select";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

export default function AdminReportsPage() {
  const { orders, stores, products, exportToCSV } = useAdminData();
  const { language } = useLanguage();
  const { formatPrice } = useLocation();
  const isEn = language === "English";

  const [reportType, setReportType] = useState("SALES_GMV");
  const [dateRange, setDateRange] = useState("30D");

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleExportReport = () => {
    if (reportType === "SALES_GMV") {
      const data = orders.map((o) => ({
        OrderID: o.orderNumber,
        Date: o.createdAt,
        Buyer: o.buyerName,
        Store: o.sellerName,
        Item: o.itemSummary,
        AmountUSD: o.totalAmount,
        Courier: o.courier,
        Status: o.status,
      }));
      exportToCSV("tonalzone_gmv_sales_report", data);
    } else if (reportType === "MERCHANT_AUDIT") {
      const data = stores.map((s) => ({
        StoreID: s.id,
        StoreName: s.storeName,
        OwnerName: s.ownerName,
        Email: s.email,
        NIK: s.nik,
        Bank: s.bankName,
        Account: s.bankAccount,
        Status: s.status,
        JoinedDate: s.submittedAt,
      }));
      exportToCSV("tonalzone_merchant_audit_report", data);
    } else {
      const data = products.map((p) => ({
        ProductID: p.id,
        Name: p.name,
        Brand: p.brand,
        Category: p.category,
        PriceUSD: p.price,
        Stock: p.stock,
        Store: p.storeName,
        Status: p.status,
      }));
      exportToCSV("tonalzone_catalog_inventory_report", data);
    }
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-[#BFDD25] selection:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold bg-[#141414] text-[#BFDD25] px-3 py-1 rounded-full uppercase tracking-wider">
              {isEn ? "Audit & Compliance" : "Audit & Kepatuhan"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Financial & Operational Reports" : "Laporan Keuangan & Operasional"}
          </h1>
          <p className="text-xs text-[#71717A] font-sans mt-1">
            {isEn
              ? "Generate auditable marketplace transaction ledgers, seller KYC archives, and catalog inventory reports."
              : "Unduh pembukuan transaksi rekber, arsip data pendaftaran toko, dan rekapitulasi inventaris produk."}
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#BFDD25] hover:bg-white text-black text-xs font-sans font-bold rounded-full transition-all shadow-[0_0_12px_rgba(191,221,37,0.4)] cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {isEn ? "Export CSV Report" : "Unduh Laporan (.CSV)"}
        </button>
      </div>

      {/* 3 Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#0A0A0A] p-5 rounded-2xl space-y-1.5">
          <span className="text-[10px] text-[#71717A] uppercase tracking-wider">Total GMV Volume</span>
          <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
          <p className="text-[10px] text-[#52525B]">{orders.length} transactions audited</p>
        </div>

        <div className="bg-[#0A0A0A] p-5 rounded-2xl space-y-1.5">
          <span className="text-[10px] text-[#71717A] uppercase tracking-wider">Active Merchants</span>
          <p className="text-2xl font-bold text-white">{stores.filter((s) => s.status === "APPROVED").length} <span className="text-xs text-[#BFDD25] font-normal">Verified</span></p>
          <p className="text-[10px] text-[#52525B]">{stores.length} total applications</p>
        </div>

        <div className="bg-[#0A0A0A] p-5 rounded-2xl space-y-1.5">
          <span className="text-[10px] text-[#71717A] uppercase tracking-wider">Catalog Inventory</span>
          <p className="text-2xl font-bold text-white">{products.length} <span className="text-xs text-[#888] font-normal">SKUs</span></p>
          <p className="text-[10px] text-[#52525B]">QC moderation verified</p>
        </div>
      </div>

      {/* Export Configuration Card */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 space-y-5 font-sans text-xs">
        <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
          {isEn ? "Configure Export Parameters" : "Parameter Pembuatan Laporan"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1.5">
              {isEn ? "Report Dataset Category" : "Kategori Laporan"}
            </label>
            <CustomSelect
              value={reportType}
              onChange={(val) => setReportType(val)}
              options={[
                { label: isEn ? "Sales & Escrow Transaction Ledger (GMV)" : "Laporan Penjualan & Transaksi Rekber (GMV)", value: "SALES_GMV" },
                { label: isEn ? "Merchant Store KYC & Bank Registry" : "Data Verifikasi Toko & Rekening Penjual", value: "MERCHANT_AUDIT" },
                { label: isEn ? "Product Catalog & Inventory Stocks" : "Katalog Produk & Status Stok Gudang", value: "CATALOG_STOCK" },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1.5">
              {isEn ? "Reporting Window" : "Rentang Waktu"}
            </label>
            <CustomSelect
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              options={[
                { label: isEn ? "Last 7 Days" : "7 Hari Terakhir", value: "7D" },
                { label: isEn ? "Last 30 Days" : "30 Hari Terakhir", value: "30D" },
                { label: isEn ? "Year to Date (2026)" : "Tahun Berjalan (2026)", value: "YTD" },
                { label: isEn ? "All Recorded History" : "Semua Riwayat Tercatat", value: "ALL" },
              ]}
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-between text-xs font-mono text-[#71717A]">
          <span>Format: UTF-8 Encoded RFC-4180 CSV</span>
          <button
            type="button"
            onClick={handleExportReport}
            className="text-[#BFDD25] font-bold hover:underline cursor-pointer inline-flex items-center gap-1 group"
          >
            <span>{isEn ? "Download Now" : "Unduh Sekarang"}</span>
            <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
