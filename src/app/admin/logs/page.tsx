"use client";

import React, { useState, useMemo } from "react";
import { useAdminData } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLogsPage() {
  const { auditLogs } = useAdminData();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(
      (log) =>
        log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [auditLogs, searchQuery]);

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-medium bg-[#141414] text-[#A1A1AA] border border-[#27272A] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "System Audit Trail" : "Log Aktivitas Sistem"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Administrative Event Logs" : "Riwayat Aktivitas & Keputusan Admin"}
          </h1>
          <p className="text-xs text-[#71717A] font-sans mt-0.5">
            {isEn
              ? "Immutable audit trail of seller approvals, product moderations, and dispute settlements."
              : "Catatan riwayat verifikasi toko, persetujuan produk, dan pencairan dana rekber oleh admin."}
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={isEn ? "Search audit logs..." : "Cari riwayat log..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-sans text-white placeholder:text-[#666] outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E] bg-[#0E0E0E] text-[10px] font-mono uppercase text-[#71717A] tracking-wider">
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Admin Actor</th>
                <th className="px-5 py-3.5">Action Executed</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#161616] transition-colors font-mono">
                    <td className="px-5 py-3.5 text-[#71717A] text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="px-5 py-3.5 font-sans font-medium text-white">
                      {log.adminName}
                    </td>

                    <td className="px-5 py-3.5 text-[#D4D4D8]">
                      {log.action}
                    </td>

                    <td className="px-5 py-3.5 text-[#A1A1AA]">
                      {log.target}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs font-mono text-[#71717A]">
                    {isEn ? "No audit logs matching query." : "Tidak ada catatan riwayat yang cocok."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
