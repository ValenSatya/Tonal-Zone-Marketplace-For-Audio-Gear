"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Search,
  User,
  ShieldCheck,
  Package,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Mail,
  ChevronRight,
  Plus,
  Inbox,
} from "lucide-react";

interface SupportMessage {
  id: string;
  sender: "customer" | "admin";
  text: string;
  time: string;
  senderName: string;
}

interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  topic: string;
  orderNumber?: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  unread: boolean;
  updatedAt: string;
  messages: SupportMessage[];
}

interface DbUserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

const CANNED_RESPONSES = [
  "Halo, terima kasih telah menghubungi Customer Service TonalZone. Kami siap membantu keluhan dan kendala Anda.",
  "Pesanan Anda sedang kami koordinasikan langsung dengan pihak logistik kurir untuk percepatan pengiriman resi.",
  "Dana transaksi Anda aman 100% di TonalZone Rekber Escrow hingga paket Anda terima dan lolos uji dengar 2x24 jam.",
  "Silakan lampirkan foto kendala beserta video unboxing tanpa jeda agar proses klaim garansi dapat segera kami setujui.",
  "Baik kak, kendala ini telah kami tindak lanjuti ke penjual resmi dan status tiket telah kami perbarui.",
];

export default function AdminSupportPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED">("ALL");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New ticket modal
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [realUsers, setRealUsers] = useState<DbUserOption[]>([]);
  const [newTicketData, setNewTicketData] = useState({
    userEmail: "",
    topic: "Layanan Pelanggan & Kendala Transaksi",
    initialMessage: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real tickets and real users from database
  const fetchTicketsFromDb = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/support");
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
      }
    } catch (err) {
      console.warn("Could not fetch support tickets from database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsFromDb();

    // Fetch real users from DB for ticket creation
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.users)) {
          setRealUsers(
            data.users.map((u: any) => ({
              id: u.id,
              name: u.name || u.email.split("@")[0],
              email: u.email,
              role: u.role,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Default selected ticket
  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicketId, tickets]);

  const selectedTicket = useMemo(() => {
    return tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;
  }, [tickets, selectedTicketId]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tickets.filter((t) => {
      const matchQuery =
        !q ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.topic.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  // Send Admin Reply
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      senderName: "Admin CS TonalZone",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setIsSending(true);

    // Optimistically update UI
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: t.status === "OPEN" ? "IN_PROGRESS" : t.status,
            unread: false,
            updatedAt: "Baru saja",
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    const sentText = replyText.trim();
    setReplyText("");

    try {
      await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedTicket.id,
          buyerEmail: selectedTicket.customerEmail,
          buyerName: selectedTicket.customerName,
          text: sentText,
          status: selectedTicket.status === "OPEN" ? "IN_PROGRESS" : selectedTicket.status,
        }),
      });
    } catch (err) {
      console.warn("Could not save CS reply to database:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Toggle ticket status
  const handleToggleStatus = (newStatus: SupportTicket["status"]) => {
    if (!selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus } : t))
    );

    fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selectedTicket.id,
        buyerEmail: selectedTicket.customerEmail,
        status: newStatus,
      }),
    }).catch(() => {});
  };

  // Create New Ticket with real database user
  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketData.userEmail || !newTicketData.initialMessage.trim()) return;

    const targetUser = realUsers.find((u) => u.email === newTicketData.userEmail);
    const buyerName = targetUser ? targetUser.name : newTicketData.userEmail.split("@")[0];

    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerEmail: newTicketData.userEmail,
          buyerName,
          text: newTicketData.initialMessage.trim(),
          status: "OPEN",
        }),
      });

      const data = await res.json();
      if (data && data.success && data.ticket) {
        setTickets((prev) => [data.ticket, ...prev.filter((t) => t.id !== data.ticket.id)]);
        setSelectedTicketId(data.ticket.id);
      }
    } catch (err) {
      console.warn("Error creating support ticket:", err);
    }

    setIsNewTicketModalOpen(false);
    setNewTicketData({
      userEmail: "",
      topic: "Layanan Pelanggan & Kendala Transaksi",
      initialMessage: "",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out text-[#FAF9F6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#181818] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold bg-[#141414] text-[#BFDD25] px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              {isEn ? "Customer Support Desk" : "Meja Layanan Bantuan CS"}
            </span>
            <span className="text-[11px] font-mono text-[#777]">
              {isEn ? "Direct Database Connection" : "Terhubung Database Nyata"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-3">
            {isEn ? "Customer Service Desk" : "Layanan Pelanggan (CS)"}
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#141414] text-[#BFDD25]">
              {tickets.filter((t) => t.status === "OPEN").length} {isEn ? "Need Reply" : "Menunggu Respon"}
            </span>
          </h1>
          <p className="text-xs text-[#888] font-sans mt-1">
            {isEn
              ? "Respond to real customer inquiries and provide instant assistance connected to database."
              : "Jawab pertanyaan pembeli nyata langsung dari database, beri solusi rekber, dan pantau tiket."}
          </p>
        </div>

        {/* Action & Status Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-4 py-2 bg-[#BFDD25] hover:bg-[#aecd20] text-black text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shadow-[0_0_12px_rgba(191,221,37,0.25)] cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEn ? "New Support Ticket" : "Buka Tiket CS"}</span>
          </button>
          <button
            onClick={fetchTicketsFromDb}
            title="Refresh database"
            className="p-2 bg-[#141414] hover:bg-[#202020] text-[#888] hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#BFDD25]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-4 bg-[#0A0A0A] border border-[#181818] rounded-2xl flex flex-col overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-[#181818] space-y-3 bg-[#0D0D0D]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#777] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search customer or ticket..." : "Cari pelanggan atau tiket..."}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#BFDD25]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === st
                      ? "bg-[#BFDD25] text-black font-bold"
                      : "bg-[#141414] text-[#888] hover:text-white"
                  }`}
                >
                  {st === "ALL" ? (isEn ? "All" : "Semua") : st}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#141414] max-h-[560px]">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#666] font-mono flex flex-col items-center justify-center">
                <Inbox className="w-10 h-10 text-[#222] mb-3 stroke-[1.5]" />
                <p className="font-bold text-[#888]">
                  {isEn ? "No support inquiries yet" : "Belum ada tiket bantuan masuk"}
                </p>
                <p className="text-[11px] text-[#555] mt-1 max-w-xs">
                  {isEn
                    ? "Inquiries from customers contacting support or chat will appear here live."
                    : "Pesan dari pembeli yang menghubungi CS atau bantuan akan muncul di sini secara langsung dari database."}
                </p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const lastMsg = t.messages[t.messages.length - 1];

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      setTickets((prev) =>
                        prev.map((item) => (item.id === t.id ? { ...item, unread: false } : item))
                      );
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#141414] border-l-2 border-[#BFDD25]"
                        : "hover:bg-[#0E0E0E]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-tight">{t.customerName}</span>
                        {t.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#666] shrink-0">{t.updatedAt}</span>
                    </div>

                    <p className="text-[11px] font-semibold text-[#BFDD25] truncate mb-1">
                      {t.topic}
                    </p>

                    <p className="text-xs text-[#888] line-clamp-2 leading-relaxed">
                      {lastMsg?.text || "Tidak ada pesan"}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1 font-mono text-[10px]">
                      <span className="text-[#666]">{t.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          t.status === "OPEN"
                            ? "bg-amber-400/10 text-amber-400"
                            : t.status === "IN_PROGRESS"
                            ? "bg-blue-400/10 text-blue-400"
                            : "bg-[#BFDD25]/10 text-[#BFDD25]"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation & Response Box */}
        <div className="lg:col-span-8 bg-[#0A0A0A] border border-[#181818] rounded-2xl flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-[#181818] bg-[#0D0D0D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white font-sans">{selectedTicket.customerName}</h2>
                    <span className="text-[11px] font-mono text-[#888]">({selectedTicket.customerEmail})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#BFDD25] font-medium">{selectedTicket.topic}</span>
                    {selectedTicket.orderNumber && (
                      <span className="text-[10px] font-mono bg-[#141414] text-[#888] px-2 py-0.5 rounded">
                        No. Pesanan: {selectedTicket.orderNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#777]">Status Tiket:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleToggleStatus(e.target.value as any)}
                    className="bg-[#141414] border border-[#262626] text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#BFDD25]"
                  >
                    <option value="OPEN">OPEN (Menunggu Balasan)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Sedang Ditangani)</option>
                    <option value="RESOLVED">RESOLVED (Selesai)</option>
                  </select>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[380px] min-h-[300px]">
                {selectedTicket.messages.map((m) => {
                  const isAdmin = m.sender === "admin";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-mono text-[#777]">{m.senderName}</span>
                        <span className="text-[10px] font-mono text-[#555]">{m.time}</span>
                      </div>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                          isAdmin
                            ? "bg-[#BFDD25] text-black font-medium shadow-[0_2px_12px_rgba(191,221,37,0.15)] rounded-tr-none"
                            : "bg-[#141414] border border-[#222] text-white rounded-tl-none"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Canned Responses Bar */}
              <div className="px-4 py-2 border-t border-[#181818] bg-[#0C0C0C] flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-mono text-[#777] shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#BFDD25]" />
                  {isEn ? "Quick Reply:" : "Templat Balasan:"}
                </span>
                {CANNED_RESPONSES.map((cr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(cr)}
                    className="text-[11px] font-sans px-3 py-1 bg-[#141414] hover:bg-[#1E1E1E] text-[#AAA] hover:text-white rounded-full whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                  >
                    {cr.slice(0, 35)}...
                  </button>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-[#181818] bg-[#0A0A0A] flex gap-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  rows={2}
                  placeholder={
                    isEn
                      ? "Write a reply to the customer (Press Enter to send)..."
                      : "Tulis balasan untuk menjawab customer service (Tekan Enter untuk kirim)..."
                  }
                  className="flex-1 bg-[#121212] border border-[#262626] rounded-xl p-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BFDD25] resize-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-5 bg-[#BFDD25] hover:bg-[#aecd20] disabled:opacity-40 text-black text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-[0_0_12px_rgba(191,221,37,0.3)]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEn ? "Send" : "Balas"}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#666]">
              <MessageSquare className="w-12 h-12 stroke-[1.5] mb-3 text-[#333]" />
              <p className="text-sm font-sans font-medium text-[#888]">
                {isEn ? "Select an active ticket to reply" : "Pilih tiket customer untuk menjawab"}
              </p>
              <p className="text-xs text-[#555] mt-1 max-w-sm">
                {isEn
                  ? "You can also initiate assistance for any registered user from the database."
                  : "Anda juga dapat membuka tiket bantuan baru untuk pengguna terdaftar dari database."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Ticket for Real User */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-md p-6 shadow-2xl text-white font-sans space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#BFDD25]" />
              <span>{isEn ? "Open Support Ticket" : "Buka Tiket Bantuan Pelanggan"}</span>
            </h3>
            <p className="text-xs text-[#888]">
              {isEn
                ? "Send a direct message or response to a customer registered in database."
                : "Pilih pengguna nyata dari database Supabase untuk memulai bantuan atau investigasi pesanan."}
            </p>

            <form onSubmit={handleCreateNewTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#888] mb-1">
                  {isEn ? "Select Registered User" : "Pilih Pengguna Terdaftar"}
                </label>
                <select
                  value={newTicketData.userEmail}
                  onChange={(e) => setNewTicketData({ ...newTicketData, userEmail: e.target.value })}
                  required
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BFDD25]"
                >
                  <option value="">-- Pilih Akun Pembeli / Penjual --</option>
                  {realUsers.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#888] mb-1">
                  {isEn ? "Inquiry Topic" : "Topik / Subjek Bantuan"}
                </label>
                <input
                  type="text"
                  value={newTicketData.topic}
                  onChange={(e) => setNewTicketData({ ...newTicketData, topic: e.target.value })}
                  required
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BFDD25]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#888] mb-1">
                  {isEn ? "Initial Message" : "Pesan Pembuka / Respon"}
                </label>
                <textarea
                  value={newTicketData.initialMessage}
                  onChange={(e) => setNewTicketData({ ...newTicketData, initialMessage: e.target.value })}
                  required
                  rows={3}
                  placeholder="Tulis pesan bantuan atau klarifikasi untuk pengguna..."
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#BFDD25] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 bg-[#141414] hover:bg-[#202020] text-xs font-mono rounded-xl cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#BFDD25] hover:bg-[#aecd20] text-black text-xs font-mono font-bold rounded-xl cursor-pointer shadow-[0_0_12px_rgba(191,221,37,0.3)]"
                >
                  {isEn ? "Create Ticket" : "Kirim Bantuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
