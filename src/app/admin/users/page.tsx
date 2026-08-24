"use client";

import React, { useState, useMemo, useRef, useDeferredValue } from "react";
import { useAdminData, AdminUser, parseCSV } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import CustomSelect from "@/components/ui/custom-select";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    bulkUpdateUserStatus,
    importUsers,
    exportToCSV,
  } = useAdminData();

  const { language } = useLanguage();
  const isEn = language === "English";

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting State
  const [sortField, setSortField] = useState<"name" | "email" | "role" | "status" | "joined" | "location">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Multi-select State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // Import State
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Buyer" as AdminUser["role"],
    status: "Active" as AdminUser["status"],
    location: "Indonesia",
    tuningPreference: "Reference / Neutral",
  });

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const filtered = users.filter((u) => {
      const matchSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.id.toLowerCase().includes(query) ||
        (u.location && u.location.toLowerCase().includes(query));

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });

    return filtered.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, deferredSearchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  // Paginated users
  const totalPages = Math.max(1, Math.ceil(processedUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedUsers.slice(start, start + PAGE_SIZE);
  }, [processedUsers, currentPage]);

  // Handle Sort Toggle
  const handleSortToggle = (field: "name" | "email" | "role" | "status" | "joined" | "location") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Select all / Deselect all
  const isAllSelected = processedUsers.length > 0 && selectedIds.length === processedUsers.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < processedUsers.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedUsers.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      role: "Buyer",
      status: "Active",
      location: "Indonesia",
      tuningPreference: "Reference / Neutral",
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      location: user.location || "Indonesia",
      tuningPreference: user.tuningPreference || "Reference / Neutral",
    });
  };

  // Submit Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    addUser(formData);
    setIsAddModalOpen(false);
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, formData);
    setEditingUser(null);
  };

  // Delete User Confirmation
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id);
    setSelectedIds((prev) => prev.filter((id) => id !== deletingUser.id));
    setDeletingUser(null);
  };

  // Bulk Actions
  const handleBulkStatus = (status: AdminUser["status"]) => {
    if (!selectedIds.length) return;
    bulkUpdateUserStatus(selectedIds, status);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    if (confirm(`Hapus ${selectedIds.length} user yang dipilih?`)) {
      bulkDeleteUsers(selectedIds);
      setSelectedIds([]);
    }
  };

  // Handle CSV Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    setImportError("");
    if (!importText.trim()) {
      setImportError("Silakan upload file CSV atau tempel isi teks CSV.");
      return;
    }
    const rows = parseCSV(importText);
    if (!rows.length) {
      setImportError("Format CSV tidak valid atau data kosong.");
      return;
    }

    const parsedUsers: Omit<AdminUser, "id" | "joined">[] = rows.map((r) => ({
      name: r.Name || r.name || r.Nama || "User Import",
      email: r.Email || r.email || `import_${Date.now()}@tonalzone.id`,
      role: (r.Role || r.role || "Buyer") as AdminUser["role"],
      status: (r.Status || r.status || "Active") as AdminUser["status"],
      location: r.Location || r.location || "Indonesia",
      tuningPreference: r.TuningPreference || r.tuningPreference || "Reference / Neutral",
    }));

    importUsers(parsedUsers);
    setIsImportModalOpen(false);
    setImportText("");
  };

  // Export to CSV
  const handleExport = () => {
    const dataToExport = processedUsers.map((u) => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      Location: u.location || "",
      TuningPreference: u.tuningPreference || "",
      JoinedDate: u.joined,
    }));
    exportToCSV("tonalzone_users", dataToExport);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "User Management" : "Daftar Pengguna"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Account Database & Roles" : "Database Akun Pengguna"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Marketplace User Directory" : "Daftar Pengguna Marketplace"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Manage buyer accounts, authorized seller stores, and marketplace administration personnel."
              : "Kelola data akun pembeli, toko penjual resmi, dan staf admin marketplace."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import CSV */}
          <button
            onClick={() => {
              setImportText("");
              setImportError("");
              setIsImportModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#141414] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono font-bold text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            title={isEn ? "Import users from CSV" : "Import data pengguna dari CSV"}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{isEn ? "Import CSV" : "Import CSV"}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-[#141414] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono font-bold text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            title={isEn ? "Export CSV" : "Unduh CSV"}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{isEn ? "Export CSV" : "Unduh CSV"}</span>
          </button>

          {/* Add User */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#222222] hover:bg-[#333333] border border-[#3E3E3E] text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{isEn ? "Add User" : "Tambah Pengguna"}</span>
          </button>
        </div>
      </div>

      {/* User Metrics Overview with Micro-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Active Users */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Active Users" : "Pengguna Aktif"}
              </p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {users.filter((u) => u.status === "Active").length} {isEn ? "Users" : "Pengguna"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart
                data={[
                  { date: new Date("2026-08-10"), val: 8 },
                  { date: new Date("2026-08-11"), val: 9 },
                  { date: new Date("2026-08-12"), val: 9 },
                  { date: new Date("2026-08-13"), val: 11 },
                  { date: new Date("2026-08-14"), val: 11 },
                  { date: new Date("2026-08-15"), val: 12 },
                  { date: new Date("2026-08-16"), val: users.filter((u) => u.status === "Active").length },
                ]}
                aspectRatio="2 / 1"
                className="w-full h-full"
              >
                <Area dataKey="val" stroke="#10b981" fill="#10b981" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isEn ? "Active shoppers & logged-in accounts" : "Pengguna aktif bertransaksi & login"}</span>
          </div>
        </div>

        {/* Card 2: Total Sellers */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Merchant Stores" : "Toko Penjual"}
              </p>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {users.filter((u) => u.role === "Seller").length} {isEn ? "Stores" : "Toko"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart
                data={[
                  { date: new Date("2026-08-10"), val: 3 },
                  { date: new Date("2026-08-11"), val: 3 },
                  { date: new Date("2026-08-12"), val: 4 },
                  { date: new Date("2026-08-13"), val: 4 },
                  { date: new Date("2026-08-14"), val: 5 },
                  { date: new Date("2026-08-15"), val: 5 },
                  { date: new Date("2026-08-16"), val: users.filter((u) => u.role === "Seller").length },
                ]}
                aspectRatio="2 / 1"
                className="w-full h-full"
              >
                <Area dataKey="val" stroke="#ffffff" fill="#ffffff" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span>{isEn ? "Verified catalog sellers" : "Penjual terverifikasi di katalog"}</span>
          </div>
        </div>

        {/* Card 3: Suspended Users */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Suspended Accounts" : "Akun Ditangguhkan"}
              </p>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {users.filter((u) => u.status === "Suspended").length} {isEn ? "Accounts" : "Akun"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart
                data={[
                  { date: new Date("2026-08-10"), val: 0 },
                  { date: new Date("2026-08-11"), val: 1 },
                  { date: new Date("2026-08-12"), val: 1 },
                  { date: new Date("2026-08-13"), val: 1 },
                  { date: new Date("2026-08-14"), val: 2 },
                  { date: new Date("2026-08-15"), val: 2 },
                  { date: new Date("2026-08-16"), val: users.filter((u) => u.status === "Suspended").length },
                ]}
                aspectRatio="2 / 1"
                className="w-full h-full"
              >
                <Area dataKey="val" stroke="#f43f5e" fill="#f43f5e" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>{isEn ? "Policy-violating / locked accounts" : "Akun dinonaktifkan / melanggar aturan"}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Filter, Search & Sort Bar */}
        <div className="p-4 sm:p-5 border-b border-[#222] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#141414]">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search user, email, location, ID..." : "Cari user, email, lokasi, ID..."}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-10 pr-8 py-2 text-xs font-sans text-white placeholder:text-[#666] focus:outline-none focus:border-white/40 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center bg-[#161616] rounded-lg p-1 border border-[#262626] text-xs">
              <span className="text-[10px] uppercase font-mono text-[#777] px-2">{isEn ? "Sort:" : "Urutkan:"}</span>
              <CustomSelect
                variant="compact"
                value={`${sortField}-${sortDirection}`}
                onChange={(val) => {
                  const [field, dir] = val.split("-") as [typeof sortField, typeof sortDirection];
                  setSortField(field);
                  setSortDirection(dir);
                }}
                options={[
                  { label: isEn ? "Name (A-Z)" : "Nama (A-Z)", value: "name-asc" },
                  { label: isEn ? "Name (Z-A)" : "Nama (Z-A)", value: "name-desc" },
                  { label: isEn ? "Newest" : "Terbaru", value: "joined-desc" },
                  { label: isEn ? "Oldest" : "Terlama", value: "joined-asc" },
                  { label: isEn ? "Role" : "Peran", value: "role-asc" },
                  { label: "Status", value: "status-asc" },
                ]}
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center bg-[#161616] rounded-lg p-1 border border-[#262626] text-xs">
              <span className="text-[10px] uppercase font-mono text-[#71717A] px-2">{isEn ? "Role:" : "Peran:"}</span>
              {[
                { id: "ALL", label: isEn ? "All" : "Semua" },
                { id: "Buyer", label: isEn ? "Buyer" : "Pembeli" },
                { id: "Seller", label: isEn ? "Seller" : "Penjual" },
                { id: "Admin", label: "Admin" },
                { id: "Super Admin", label: "Super Admin" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-medium transition-all cursor-pointer border ${
                    roleFilter === r.id
                      ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-[#161616] rounded-lg p-1 border border-[#262626] text-xs">
              <span className="text-[10px] uppercase font-mono text-[#71717A] px-2">Status:</span>
              {[
                { id: "ALL", label: isEn ? "All" : "Semua" },
                { id: "Active", label: isEn ? "Active" : "Aktif" },
                { id: "Suspended", label: isEn ? "Suspended" : "Ditangguhkan" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-medium transition-all cursor-pointer border ${
                    statusFilter === s.id
                      ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Select Floating Bulk Action Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#181818] text-[#FAF9F6] px-6 py-3 flex flex-wrap items-center justify-between gap-3 font-sans border-b border-[#2a2a2a] overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono bg-[#282828] text-white border border-[#3a3a3a] px-2 py-0.5 rounded">
                  {isEn ? `${selectedIds.length} selected` : `${selectedIds.length} terpilih`}
                </span>
                <span className="text-xs text-[#888]">{isEn ? "Bulk Actions:" : "Aksi Masal:"}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatus("Active")}
                  className="px-3 py-1.5 bg-[#242424] hover:bg-[#333] border border-[#383838] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {isEn ? "Activate All" : "Aktifkan Semua"}
                </button>
                <button
                  onClick={() => handleBulkStatus("Suspended")}
                  className="px-3 py-1.5 bg-[#181818] hover:bg-[#242424] text-[#ccc] text-xs font-medium rounded-lg transition-colors border border-[#333] cursor-pointer"
                >
                  {isEn ? "Suspend All" : "Tangguhkan (Suspend)"}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#262626] text-white text-xs font-medium rounded-lg transition-colors border border-[#2E2E2E] cursor-pointer"
                >
                  {isEn ? `Delete (${selectedIds.length})` : `Hapus (${selectedIds.length})`}
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-2 py-1 text-white/50 hover:text-white text-xs font-medium cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#141414] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                <th className="w-12 px-6 py-4">
                  <div
                    onClick={handleSelectAll}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                      isAllSelected
                        ? "bg-[#242424] border-[#4A4A4A] text-white shadow-sm"
                        : isIndeterminate
                        ? "bg-[#1E1E1E] border-[#444] text-white"
                        : "bg-[#141414] border-[#2A2A2A] hover:border-[#444]"
                    }`}
                  >
                    {isAllSelected && (
                      <svg className="w-2.5 h-2.5 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isIndeterminate && !isAllSelected && (
                      <div className="w-2 h-0.5 bg-white rounded"></div>
                    )}
                  </div>
                </th>

                {/* Clickable Sort Headers */}
                <th
                  onClick={() => handleSortToggle("name")}
                  className="px-6 py-4 text-[10px] font-sans font-bold text-[#777] uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isEn ? "User & Email" : "Pengguna & Email"}</span>
                    {sortField === "name" && (
                      <span className="text-white font-mono">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSortToggle("role")}
                  className="px-6 py-4 text-[10px] font-sans font-bold text-[#777] uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isEn ? "Role" : "Peran (Role)"}</span>
                    {sortField === "role" && (
                      <span className="text-white font-mono">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSortToggle("status")}
                  className="px-6 py-4 text-[10px] font-sans font-bold text-[#777] uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === "status" && (
                      <span className="text-white font-mono">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSortToggle("location")}
                  className="px-6 py-4 text-[10px] font-sans font-bold text-[#777] uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isEn ? "Location" : "Lokasi"}</span>
                    {sortField === "location" && (
                      <span className="text-white font-mono">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th className="px-6 py-4 text-[10px] font-sans font-bold text-[#777] uppercase tracking-widest whitespace-nowrap">
                  {isEn ? "Acoustic Tuning Preference" : "Preferensi Suara"}
                </th>

                <th
                  onClick={() => handleSortToggle("joined")}
                  className="px-6 py-4 text-[10px] font-sans font-bold text-[#777] uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isEn ? "Joined Date" : "Tgl Bergabung"}</span>
                    {sortField === "joined" && (
                      <span className="text-white font-mono">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>

                <th className="px-6 py-4 text-[10px] font-sans font-bold text-[#777] uppercase tracking-widest whitespace-nowrap text-right">
                  {isEn ? "Actions" : "Aksi"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans text-xs">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isSelected ? "bg-white/[0.04]" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <div
                          onClick={() => handleToggleSelect(user.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#242424] border-[#4A4A4A] text-white shadow-sm"
                              : "bg-[#141414] border-[#2A2A2A] hover:border-[#444]"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white/70 shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-white truncate">{user.name}</span>
                            <span className="text-[11px] text-white/40 truncate">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                          {user.role}
                        </span>
                      </td>

                      {/* Location & Tuning */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-[11px]">
                          <span className="text-white/80">{user.location || "—"}</span>
                          <span className="text-white/40 font-mono text-[10px]">{user.tuningPreference || "Neutral"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === "Active" ? "bg-emerald-400" : user.status === "Suspended" ? "bg-rose-400" : "bg-[#666]"
                          }`} />
                          {user.status}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-white/40 font-mono text-[11px]">
                        {user.joined}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            {isEn ? "Edit" : "Edit"}
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-[#262626] text-white/40 hover:text-white border border-white/10 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            {isEn ? "Delete" : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    {isEn ? "No users matching the filter criteria or search query." : "Tidak ada pengguna yang cocok dengan filter atau pencarian."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 font-mono gap-3">
          <div className="flex items-center gap-2">
            <span>
              {isEn
                ? `Showing ${processedUsers.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-${Math.min(currentPage * PAGE_SIZE, processedUsers.length)} of ${processedUsers.length} users`
                : `Menampilkan ${processedUsers.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-${Math.min(currentPage * PAGE_SIZE, processedUsers.length)} dari ${processedUsers.length} pengguna`}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Previous" : "Sebelumnya"}
              </button>
              <span className="px-2 text-white/60 font-mono text-xs">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Next" : "Selanjutnya"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Import CSV Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">
                    {isEn ? "Import Users from CSV" : "Import Pengguna dari CSV"}
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    {isEn ? "Upload a CSV file or paste raw text rows directly." : "Unggah berkas CSV atau tempel teks data langsung."}
                  </p>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4 font-sans text-xs">
                {/* Upload box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 hover:border-white/40 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/[0.02]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <svg className="w-8 h-8 mx-auto mb-2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="font-semibold text-white">
                    {isEn ? "Click to browse and upload .csv file" : "Klik untuk memilih berkas .csv"}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">Header: Name, Email, Role, Status, Location, TuningPreference</p>
                </div>

                {/* Text area fallback */}
                <div>
                  <label className="block text-white/70 font-medium mb-1">
                    {isEn ? "Or Paste Raw CSV Data" : "Atau Tempel Teks CSV"}
                  </label>
                  <textarea
                    rows={4}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Name,Email,Role,Status,Location,TuningPreference&#10;Budi Santoso,budi@audio.id,Buyer,Active,Surabaya,Warm"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white font-mono text-xs placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none"
                  />
                </div>

                {importError && (
                  <p className="text-red-400 font-mono text-[11px]">{importError}</p>
                )}

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    className="px-4 py-2 bg-white hover:bg-[#e0e0e0] text-black font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    {isEn ? "Process Import" : "Proses Import"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit User Modal */}
      <AnimatePresence>
        {(isAddModalOpen || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white text-base">
                  {editingUser
                    ? (isEn ? "Edit User Profile" : "Edit Profil Pengguna")
                    : (isEn ? "Add New User" : "Tambah Pengguna Baru")}
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingUser ? handleSaveEdit : handleSaveAdd} className="p-6 space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-white/70 font-medium mb-1">
                    {isEn ? "Full Name" : "Nama Lengkap"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isEn ? "e.g. John Doe" : "Contoh: Budi Santoso"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1">
                    {isEn ? "Email Address" : "Alamat Email"}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={isEn ? "e.g. john@audiophile.com" : "Contoh: budi@audiophile.id"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 font-medium mb-1">
                      {isEn ? "Account Role" : "Role Akun"}
                    </label>
                    <CustomSelect
                      value={formData.role}
                      onChange={(val) => setFormData({ ...formData, role: val as AdminUser["role"] })}
                      options={["Buyer", "Seller", "Admin", "Super Admin"]}
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-medium mb-1">Status</label>
                    <CustomSelect
                      value={formData.status}
                      onChange={(val) => setFormData({ ...formData, status: val as AdminUser["status"] })}
                      options={["Active", "Suspended"]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1">
                    {isEn ? "Location / City" : "Lokasi Domisili"}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={isEn ? "e.g. Jakarta, ID" : "Contoh: Jakarta, ID"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1">
                    {isEn ? "Tuning Sound Preference" : "Preferensi Tuning Suara"}
                  </label>
                  <input
                    type="text"
                    value={formData.tuningPreference}
                    onChange={(e) => setFormData({ ...formData, tuningPreference: e.target.value })}
                    placeholder={isEn ? "e.g. Warm & Musical, Harman Target" : "Contoh: Warm & Musical, Harman Target"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white hover:bg-[#e0e0e0] text-black font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    {editingUser
                      ? (isEn ? "Save Changes" : "Simpan Perubahan")
                      : (isEn ? "Add User" : "Tambah Pengguna")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2E2E2E] text-white flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2.25 2.25 0 0116.138 21H7.862a2.25 2.25 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-base mb-1">
                {isEn ? "Delete User?" : "Hapus Pengguna?"}
              </h3>
              <p className="text-xs text-white/50 mb-6">
                {isEn
                  ? `Are you sure you want to delete ${deletingUser.name} (${deletingUser.email})? This action cannot be undone.`
                  : `Apakah Anda yakin ingin menghapus ${deletingUser.name} (${deletingUser.email})? Tindakan ini tidak dapat dibatalkan.`}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {isEn ? "Delete Permanently" : "Hapus Permanen"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
