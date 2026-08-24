"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";

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
  const [availableBalance, setAvailableBalance] = useState(4320);
  const [escrowBalance, setEscrowBalance] = useState(1250);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>(INITIAL_TRANSACTIONS);

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
  const lifetimePayoutsFormatted = formatAmount(4300);

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseFloat(withdrawInput) || 0;
    const amountInUSD = currency === "IDR" ? rawVal / 15500 : rawVal;

    if (amountInUSD > 0 && amountInUSD <= availableBalance + 0.01) {
      const actualUSD = Math.min(amountInUSD, availableBalance);
      setAvailableBalance((prev) => Math.max(0, prev - actualUSD));
      const newTx: PayoutTransaction = {
        id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        type: "BANK_WITHDRAWAL",
        description: `Payout to ${selectedBank.split(" - ")[0]} (${currency})`,
        amountUSD: -actualUSD,
        bankAccount: selectedBank.split(" - ")[0],
        status: "PROCESSING",
      };
      setTransactions((prev) => [newTx, ...prev]);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Financials & Wallet Payouts" : "Dompet Toko & Penarikan Saldo"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#1A1A1A] text-[#FAF9F6] border border-[#2E2E2E]">
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
          className="inline-flex items-center gap-1.5 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] px-4 py-2 rounded-lg text-xs font-sans font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {isEn ? "Withdraw to Bank" : "Tarik Saldo ke Rekening"}
        </button>
      </div>

      {/* 3 KPI Balance Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Available Balance */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
            <span className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Available Balance" : "Saldo Tersedia (Bisa Ditarik)"}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-emerald-400">{availableFormatted}</div>
            <p className="text-[10px] font-mono text-[#888] mt-1">
              {isEn ? "Ready for instant bank disbursement" : "Siap dicairkan ke rekening bank terdaftar"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full py-1.5 bg-[#181818] hover:bg-[#202020] text-white text-xs font-mono rounded border border-[#2A2A2A] transition-colors"
          >
            {isEn ? "Withdraw Funds →" : "Tarik Dana →"}
          </button>
        </div>

        {/* Card 2: In-Escrow Holding */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
            <span className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Pending Settlement" : "Saldo Tertahan (Pesanan Berjalan)"}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-amber-400">{escrowFormatted}</div>
            <p className="text-[10px] font-mono text-[#888] mt-1">
              {isEn ? "Pending buyer delivery confirmation" : "Menunggu barang sampai dan diselesaikan pembeli"}
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#777] bg-[#141414] p-1.5 rounded border border-[#222] text-center">
            {isEn ? "Releases immediately upon order completion" : "Masuk ke saldo aktif setelah pesanan selesai"}
          </div>
        </div>

        {/* Card 3: Total Lifetime Payouts */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
            <span className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Total Lifetime Payouts" : "Total Penarikan Sukses"}
            </span>
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-white">{lifetimePayoutsFormatted}</div>
            <p className="text-[10px] font-mono text-[#888] mt-1">
              {isEn ? "Disbursed to BCA & Mandiri accounts" : "Telah ditransfer ke rekening bank Anda"}
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#A1A1AA] bg-[#141414] p-1.5 rounded border border-[#222222] text-center">
            {isEn ? "100% On-Time Settlement Rate" : "Tingkat Keberhasilan Transfer 100%"}
          </div>
        </div>
      </div>

      {/* Transaction History Ledger Table */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1E1E1E] bg-[#141414] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            {isEn ? "Wallet & Settlement History" : "Riwayat Mutasi & Transaksi Dompet"}
          </h3>
          <span className="text-xs font-mono text-[#888]">{transactions.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E] bg-[#0E0E0E] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Type & Description</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#161616] transition-colors font-mono">
                  <td className="px-5 py-3.5 font-bold text-white text-xs">{tx.id}</td>
                  <td className="px-5 py-3.5 text-xs text-[#888]">{tx.date}</td>
                  <td className="px-5 py-3.5 font-sans">
                    <span className="text-white block font-medium">{tx.description}</span>
                    {tx.bankAccount && <span className="text-[10px] text-[#777] font-mono">{tx.bankAccount}</span>}
                  </td>
                  <td className={`px-5 py-3.5 text-right font-bold text-xs ${tx.amountUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {tx.amountUSD >= 0 ? `+${formatAmount(tx.amountUSD)}` : formatAmount(tx.amountUSD)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                      <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "COMPLETED" ? "bg-emerald-400" : "bg-amber-400"}`} />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
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
              className="relative w-full max-w-md bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 font-sans z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#222]">
                <h3 className="text-sm font-bold text-white">
                  {isEn ? "Withdraw to Bank Account" : "Pencairan Dana ke Rekening Bank"}
                </h3>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-[#888] hover:text-white">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {withdrawSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2E2E2E] text-white flex items-center justify-center mx-auto text-xl font-bold">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
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
                        className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                      >
                        {isEn ? "Max All" : "Tarik Semua"} ({availableFormatted})
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-bold text-sm">
                        {currency === "IDR" ? "Rp" : "$"}
                      </span>
                      <input
                        type="number"
                        required
                        value={withdrawInput}
                        onChange={(e) => setWithdrawInput(e.target.value)}
                        placeholder={currency === "IDR" ? "e.g. 5000000" : "e.g. 500"}
                        className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2 text-sm font-mono font-bold text-white outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#161616] border border-[#262626] space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-[#888]">
                      <span>Disbursement Fee:</span>
                      <span className="text-emerald-400 font-bold">$0.00 (Free)</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-1 border-t border-[#222]">
                      <span>Estimated Arrival:</span>
                      <span>1-2 Business Hours</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                    >
                      {isEn ? "Cancel" : "Batal"}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs font-sans rounded-lg transition-colors cursor-pointer shadow-sm"
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
