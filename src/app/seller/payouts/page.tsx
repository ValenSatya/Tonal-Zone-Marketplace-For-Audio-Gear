"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

export interface PayoutTransaction {
  id: string;
  date: string;
  type: "ORDER_SETTLEMENT" | "BANK_WITHDRAWAL" | "FEE_ADJUSTMENT";
  description: string;
  amountUSD: number;
  bankAccount?: string;
  status: "COMPLETED" | "PROCESSING" | "ESCROW_HELD";
}

const INITIAL_TRANSACTIONS: PayoutTransaction[] = [
  {
    id: "TX-8841",
    date: "2026-08-16 16:00",
    type: "ORDER_SETTLEMENT",
    description: "Escrow Release: Order #ORD-9935 (Moondrop Blessing 3)",
    amountUSD: 319,
    status: "COMPLETED",
  },
  {
    id: "TX-8839",
    date: "2026-08-15 11:30",
    type: "ORDER_SETTLEMENT",
    description: "Escrow Release: Order #ORD-9930 (Effect Audio Ares S)",
    amountUSD: 249,
    status: "COMPLETED",
  },
  {
    id: "PO-4091",
    date: "2026-08-12 14:15",
    type: "BANK_WITHDRAWAL",
    description: "Payout to BCA (0123456789 - Alexander Rivera)",
    amountUSD: -2500,
    bankAccount: "BCA •••• 6789",
    status: "COMPLETED",
  },
  {
    id: "PO-4090",
    date: "2026-08-01 10:00",
    type: "BANK_WITHDRAWAL",
    description: "Payout to Bank Mandiri (140001928371)",
    amountUSD: -1800,
    bankAccount: "Mandiri •••• 8371",
    status: "COMPLETED",
  },
];

export default function SellerPayoutsPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const [sellerMode, setSellerMode] = useState<"RETAIL_MERCHANT" | "OFFICIAL_BRAND">("RETAIL_MERCHANT");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [lifetimePayouts, setLifetimePayouts] = useState(0);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);

  // Sync mode & currency
  useEffect(() => {
    const loadState = async () => {
      const savedMode = (localStorage.getItem("tonalzone_seller_mode") as "RETAIL_MERCHANT" | "OFFICIAL_BRAND" | null) || "RETAIL_MERCHANT";
      setSellerMode(savedMode);

      const savedCurrency = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
      if (savedCurrency) {
        setCurrency(savedCurrency);
      } else {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            if (u.storeCurrency) setCurrency(u.storeCurrency);
            else setCurrency("IDR");
          } catch (e) {
            setCurrency("IDR");
          }
        } else {
          setCurrency("IDR");
        }
      }

      // Fetch dynamic wallet from backend API
      try {
        let storeIdParam = "";
        let emailParam = "";
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            if (u.storeId) storeIdParam = u.storeId;
            if (u.email) emailParam = u.email;
          } catch (e) {}
        }
        if (!storeIdParam) {
          if (emailParam.includes("bass") || (stored && stored.toLowerCase().includes("bass audio"))) {
            storeIdParam = "04595ba3-8657-4aa6-95da-941f6e1717f8";
          } else if (emailParam.includes("csi") || (stored && stored.toLowerCase().includes("csi zone"))) {
            storeIdParam = "store-csi-zone";
          } else if (savedMode === "OFFICIAL_BRAND") {
            storeIdParam = "store-moondrop-official";
          }
        }
        const query = new URLSearchParams();
        if (storeIdParam) query.set("storeId", storeIdParam);
        if (emailParam) query.set("email", emailParam);

        const res = await fetch(`/api/seller/payouts${query.toString() ? `?${query.toString()}` : ""}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            setAvailableBalance(data.availableUSD || 0);
            setEscrowBalance(data.inEscrowUSD || 0);
            setLifetimePayouts(data.lifetimeUSD || 0);
            if (Array.isArray(data.transactions)) {
              setTransactions(data.transactions);
            }
            localStorage.setItem(
              "tonalzone_seller_balance",
              JSON.stringify({
                available: data.availableUSD || 0,
                escrow: data.inEscrowUSD || 0,
                withdrawn: data.lifetimeUSD || 0,
                totalRevenue: (data.availableUSD || 0) + (data.lifetimeUSD || 0),
              })
            );
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load /api/seller/payouts:", e);
      }

      if (savedMode === "OFFICIAL_BRAND") {
        setAvailableBalance(4320);
        setEscrowBalance(1250);
        setLifetimePayouts(4300);
        setTransactions(INITIAL_TRANSACTIONS);
      } else {
        const savedBal = localStorage.getItem("tonalzone_seller_balance");
        if (savedBal) {
          try {
            const balObj = JSON.parse(savedBal);
            setAvailableBalance(balObj.available ?? 1850);
            setEscrowBalance(balObj.escrow ?? 420);
            setLifetimePayouts(balObj.withdrawn ?? 2100);
          } catch (e) {}
        } else {
          setAvailableBalance(1850);
          setEscrowBalance(420);
          setLifetimePayouts(2100);
          localStorage.setItem(
            "tonalzone_seller_balance",
            JSON.stringify({
              available: 1850,
              escrow: 420,
              withdrawn: 2100,
              totalRevenue: 3950,
            })
          );
        }

        const localTx = localStorage.getItem("tonalzone_seller_transactions");
        if (localTx) {
          try {
            const parsed = JSON.parse(localTx);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTransactions(parsed);
              return;
            }
          } catch (e) {}
        }
        const defaultRetailTx: PayoutTransaction[] = [
          {
            id: "TX-7712",
            date: "2026-09-20 14:30",
            type: "ORDER_SETTLEMENT",
            description: "Pelepasan Escrow: Pesanan #ORD-8102 (Truthear Nova)",
            amountUSD: 149,
            status: "COMPLETED",
          },
          {
            id: "TX-7708",
            date: "2026-09-18 10:15",
            type: "ORDER_SETTLEMENT",
            description: "Pelepasan Escrow: Pesanan #ORD-8094 (Tangzu Wan'er SG)",
            amountUSD: 24,
            status: "COMPLETED",
          },
          {
            id: "PO-3120",
            date: "2026-09-10 16:00",
            type: "BANK_WITHDRAWAL",
            description: "Penarikan Dana ke Bank BCA (•••• 8912)",
            amountUSD: -450,
            bankAccount: "BCA •••• 8912",
            status: "COMPLETED",
          },
        ];
        setTransactions(defaultRetailTx);
        localStorage.setItem("tonalzone_seller_transactions", JSON.stringify(defaultRetailTx));
      }
    };

    loadState();
    window.addEventListener("storage", loadState);
    return () => window.removeEventListener("storage", loadState);
  }, []);

  const formatAmount = (usd: number) => {
    if (currency === "IDR") {
      const isNeg = usd < 0;
      const absVal = Math.abs(usd);
      return `${isNeg ? "-" : ""}Rp ${Math.round(absVal * 15500).toLocaleString("id-ID")}`;
    }
    const isNeg = usd < 0;
    const absVal = Math.abs(usd);
    return `${isNeg ? "-$" : "$"}${absVal.toLocaleString()}`;
  };

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawInput, setWithdrawInput] = useState("");
  const [selectedBank, setSelectedBank] = useState("BCA - 0123456789 (Alexander Rivera)");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const availableFormatted = formatAmount(availableBalance);
  const escrowFormatted = formatAmount(escrowBalance);
  const lifetimePayoutsFormatted = formatAmount(lifetimePayouts);

  const handleConfirmWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseFloat(withdrawInput) || 0;
    const amountInUSD = currency === "IDR" ? rawVal / 15500 : rawVal;

    if (amountInUSD > 0 && amountInUSD <= availableBalance + 0.01) {
      const actualUSD = Math.min(amountInUSD, availableBalance);
      
      const bankParts = selectedBank.split(" - ");
      const bankName = bankParts[0]?.trim() || "BCA";
      const bankAccount = bankParts[1]?.replace(/[()]/g, "")?.trim() || "0123456789";

      try {
        let storeIdParam = "";
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            if (u.storeId) storeIdParam = u.storeId;
          } catch (e) {}
        }
        if (!storeIdParam) {
          if ((stored && stored.toLowerCase().includes("bass audio"))) {
            storeIdParam = "04595ba3-8657-4aa6-95da-941f6e1717f8";
          } else if ((stored && stored.toLowerCase().includes("csi zone"))) {
            storeIdParam = "store-csi-zone";
          } else if (sellerMode === "OFFICIAL_BRAND") {
            storeIdParam = "store-moondrop-official";
          }
        }

        await fetch(`/api/seller/payouts${storeIdParam ? `?storeId=${encodeURIComponent(storeIdParam)}` : ""}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUSD: actualUSD,
            bankName,
            bankAccount,
          }),
        });
      } catch (err) {
        console.error("Error submitting withdrawal to API:", err);
      }

      const updatedAvail = Math.max(0, availableBalance - actualUSD);
      const updatedLifetime = lifetimePayouts + actualUSD;
      setAvailableBalance(updatedAvail);
      setLifetimePayouts(updatedLifetime);

      const newTx: PayoutTransaction = {
        id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        type: "BANK_WITHDRAWAL",
        description: `Penarikan Dana ke ${selectedBank.split(" - ")[0]} (${currency})`,
        amountUSD: -actualUSD,
        bankAccount: selectedBank.split(" - ")[0],
        status: "PROCESSING",
      };

      setTransactions((prev) => {
        const next = [newTx, ...prev];
        localStorage.setItem("tonalzone_seller_transactions", JSON.stringify(next));
        return next;
      });

      localStorage.setItem(
        "tonalzone_seller_balance",
        JSON.stringify({
          available: updatedAvail,
          escrow: escrowBalance,
          withdrawn: updatedLifetime,
          totalRevenue: updatedAvail + updatedLifetime,
        })
      );

      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setIsWithdrawModalOpen(false);
        setWithdrawInput("");
      }, 1200);
    }
  };

  const handleMaxAll = () => {
    if (currency === "IDR") {
      setWithdrawInput((availableBalance * 15500).toString());
    } else {
      setWithdrawInput(availableBalance.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Financials & Wallet Payouts" : "Dompet Toko & Penarikan Saldo"}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#121212] text-[#BFDD25]">
              {currency} {isEn ? "Active Ledger" : "Buku Kas"}
            </span>
          </div>
          <p className="text-xs font-mono text-[#8E8E93] mt-1">
            {isEn
              ? "Track available balance, pending settlements, and instant bank withdrawals."
              : "Pantau saldo aktif toko, transaksi yang sedang berjalan, dan penarikan ke rekening bank."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWithdrawModalOpen(true)}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-5 py-2.5 rounded-full text-xs font-sans font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {isEn ? "Withdraw to Bank" : "Tarik Saldo ke Rekening"}
        </button>
      </div>

      {/* 3 KPI Balance Telemetry Cards (Zero-Stroke Modern Elevation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Available Balance */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Available Balance" : "Saldo Tersedia (Bisa Ditarik)"}
            </span>
          </div>
          <div className="my-4">
            <div className="text-2xl font-bold font-mono text-[#BFDD25]">{availableFormatted}</div>
            <p className="text-[11px] font-mono text-[#888] mt-1">
              {isEn ? "Ready for instant bank disbursement" : "Siap dicairkan ke rekening bank terdaftar"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full py-2.5 bg-[#141414] hover:bg-[#1E1E1E] text-white text-xs font-sans font-medium rounded-full transition-colors inline-flex items-center justify-center gap-1.5 group cursor-pointer"
          >
            <span>{isEn ? "Withdraw Funds" : "Tarik Dana"}</span>
            <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 2: In-Escrow Holding */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Pending Settlement" : "Saldo Tertahan (Pesanan Berjalan)"}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          </div>
          <div className="my-4">
            <div className="text-2xl font-bold font-mono text-amber-400">{escrowFormatted}</div>
            <p className="text-[11px] font-mono text-[#888] mt-1">
              {isEn ? "Pending buyer delivery confirmation" : "Menunggu barang sampai dan diselesaikan pembeli"}
            </p>
          </div>
          <div className="text-[11px] font-mono text-[#8E8E93] bg-[#121212] p-2.5 rounded-xl text-center">
            {isEn ? "Releases immediately upon order completion" : "Masuk ke saldo aktif setelah pesanan selesai"}
          </div>
        </div>

        {/* Card 3: Total Lifetime Payouts */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Total Lifetime Payouts" : "Total Penarikan Sukses"}
            </span>
            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
          </div>
          <div className="my-4">
            <div className="text-2xl font-bold font-mono text-white">{lifetimePayoutsFormatted}</div>
            <p className="text-[11px] font-mono text-[#888] mt-1">
              {isEn ? "Disbursed to BCA & Mandiri accounts" : "Telah ditransfer ke rekening bank Anda"}
            </p>
          </div>
          <div className="text-[11px] font-mono text-[#A1A1AA] bg-[#121212] p-2.5 rounded-xl text-center">
            {isEn ? "100% On-Time Settlement Rate" : "Tingkat Keberhasilan Transfer 100%"}
          </div>
        </div>
      </div>

      {/* Transaction History Ledger Table (Zero-Stroke Card) */}
      <div className="bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 bg-[#0A0A0A] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            {isEn ? "Wallet & Settlement History" : "Riwayat Mutasi & Transaksi Dompet"}
          </h3>
          <span className="text-xs font-mono text-[#888] px-3 py-1 bg-[#121212] rounded-full">{transactions.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-[#0E0E0E] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Type & Description</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#121212]/60 transition-colors font-mono">
                    <td className="px-5 py-3.5 font-bold text-white text-xs">{tx.id}</td>
                    <td className="px-5 py-3.5 text-xs text-[#888]">{tx.date}</td>
                    <td className="px-5 py-3.5 font-sans">
                      <span className="text-white block font-medium">{tx.description}</span>
                      {tx.bankAccount && <span className="text-[10px] text-[#777] font-mono">{tx.bankAccount}</span>}
                    </td>
                    <td className={`px-5 py-3.5 text-right font-bold text-xs ${tx.amountUSD >= 0 ? "text-[#BFDD25]" : "text-rose-400"}`}>
                      {tx.amountUSD >= 0 ? `+${formatAmount(tx.amountUSD)}` : formatAmount(tx.amountUSD)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-[#121212] text-[#D4D4D8]">
                        <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "COMPLETED" ? "bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.7)]" : "bg-amber-400"}`} />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#121212] flex items-center justify-center text-[#71717A]">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20M6 15h.01M10 15h.01" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white font-sans">
                          {isEn ? "No Transactions Recorded" : "Belum Ada Riwayat Transaksi"}
                        </h3>
                        <p className="text-xs font-mono text-[#8E8E93] mt-1">
                          {isEn
                            ? "Earnings from completed orders and payout disbursements will be recorded here automatically."
                            : "Penghasilan dari pesanan yang selesai dan riwayat penarikan dana akan tercatat otomatis di sini."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WITHDRAWAL MODAL (Zero-Stroke Elevation) */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWithdrawModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0A0A0A] rounded-2xl shadow-2xl p-6 sm:p-7 font-sans z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-bold text-white">
                  {isEn ? "Withdraw to Bank Account" : "Pencairan Dana ke Rekening Bank"}
                </h3>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="p-1.5 rounded-full text-[#888] hover:text-white hover:bg-[#1A1A1A] transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {withdrawSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#BFDD25]/10 text-[#BFDD25] flex items-center justify-center mx-auto text-xl font-bold shadow-[0_0_12px_rgba(191,221,37,0.2)]">
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h4 className="text-sm font-bold text-white">{isEn ? "Disbursement Requested!" : "Permintaan Pencairan Berhasil!"}</h4>
                  <p className="text-xs text-[#888] font-mono">
                    {isEn ? "Funds will arrive in your bank within 1-2 hours." : "Dana akan ditransfer dalam 1-2 jam ke rekening tujuan."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmWithdraw} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                      {isEn ? "Select Destination Bank Account" : "Rekening Bank Tujuan"}
                    </label>
                    <CustomSelect
                      value={selectedBank}
                      onChange={(val) => setSelectedBank(val)}
                      options={[
                        { label: "BCA - 0123456789 (Alexander Rivera)", value: "BCA - 0123456789 (Alexander Rivera)" },
                        { label: "Bank Mandiri - 140001928371 (Alexander Rivera)", value: "Bank Mandiri - 140001928371 (Alexander Rivera)" },
                        { label: "Bank Jago - 501928374829 (Alexander Rivera)", value: "Bank Jago - 501928374829 (Alexander Rivera)" },
                      ]}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-[#888] uppercase">
                        {isEn ? `Withdrawal Amount (${currency})` : `Nominal Penarikan (${currency})`}
                      </label>
                      <button
                        type="button"
                        onClick={handleMaxAll}
                        className="text-[10px] font-mono text-[#BFDD25] hover:underline font-bold cursor-pointer"
                      >
                        {isEn ? "Max All" : "Tarik Semua"} ({availableFormatted})
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BFDD25] font-mono font-bold text-sm">
                        {currency === "IDR" ? "Rp" : "$"}
                      </span>
                      <input
                        type="number"
                        required
                        value={withdrawInput}
                        onChange={(e) => setWithdrawInput(e.target.value)}
                        placeholder={currency === "IDR" ? "e.g. 5000000" : "e.g. 500"}
                        className="w-full bg-[#121212] rounded-xl pl-9 pr-3 py-3 text-sm font-mono font-bold text-white outline-none border-0 focus:ring-1 focus:ring-white/20"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121212] space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-[#888]">
                      <span>Disbursement Fee:</span>
                      <span className="text-[#BFDD25] font-bold">{currency === "IDR" ? "Rp 0 (Bebas Biaya)" : "$0.00 (Free)"}</span>
                    </div>
                    <div className="flex justify-between text-white font-medium pt-1">
                      <span>Estimated Arrival:</span>
                      <span>1-2 Business Hours</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="px-5 py-2.5 bg-[#141414] hover:bg-[#1E1E1E] text-white text-xs font-mono rounded-full transition-colors cursor-pointer"
                    >
                      {isEn ? "Cancel" : "Batal"}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 font-bold text-xs font-sans rounded-full transition-colors cursor-pointer shadow-sm"
                    >
                      {isEn ? "Confirm Withdrawal" : "Konfirmasi Penarikan"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
