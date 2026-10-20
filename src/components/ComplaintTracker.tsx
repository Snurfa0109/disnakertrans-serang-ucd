"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle2, Clock, AlertCircle, Shield, FileText,
  Phone, User, ArrowRight, Copy, Check, Printer, ExternalLink,
  MessageSquareReply, Calendar, ChevronRight, X, Building2, HelpCircle
} from "lucide-react";

interface TimelineEvent {
  status: string;
  title: string;
  note: string;
  time: string;
}

interface TrackedComplaint {
  id: number;
  ticket_number: string;
  name_masked: string;
  email_masked: string;
  phone_masked: string;
  nik_masked: string;
  type: string;
  subject: string;
  message: string;
  status: "Baru" | "Diproses" | "Menunggu Tindak Lanjut" | "Selesai" | "Ditolak" | string;
  is_confidential?: boolean;
  disposisi_bidang?: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  admin_reply: string | null;
  admin_reply_title: string | null;
  admin_reply_at: string | null;
  admin_reply_by: string | null;
  timeline: TimelineEvent[];
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; bg: string; text: string; border: string }> = {
  "Baru": {
    label: "Baru Diterima",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  "Diproses": {
    label: "Sedang Ditinjau",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  "Menunggu Tindak Lanjut": {
    label: "Menunggu Tindak Lanjut",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    bg: "bg-purple-50/50 dark:bg-purple-950/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  "Selesai": {
    label: "Selesai & Dibalas",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  "Ditolak": {
    label: "Ditolak / Selesai",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    bg: "bg-red-50/50 dark:bg-red-950/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

export default function ComplaintTracker({ initialQuery = "", onSwitchToForm }: { initialQuery?: string; onSwitchToForm?: () => void }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || searchParams.get("ticket") || searchParams.get("q") || "");
  const [filterType, setFilterType] = useState<"all" | "ticket" | "phone" | "nik">("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrackedComplaint[] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);
  const [receiptModal, setReceiptModal] = useState<TrackedComplaint | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (receiptModal) {
      document.body.classList.add("printing-receipt-mode");
    } else {
      document.body.classList.remove("printing-receipt-mode");
    }
    return () => {
      document.body.classList.remove("printing-receipt-mode");
    };
  }, [receiptModal]);

  const handleSearch = useCallback(async (searchKey?: string) => {
    const q = (searchKey !== undefined ? searchKey : query).trim();
    if (!q) {
      setErrorMsg("Silakan masukkan nomor pengaduan, nomor HP/WhatsApp, atau NIK Anda.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`/api/complaints/track?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Gagal melakukan pelacakan");
      }

      setResults(data.data || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat melacak data pengaduan.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Auto-search if URL has ?ticket= or ?q=
  useEffect(() => {
    const param = searchParams.get("ticket") || searchParams.get("q");
    if (param) {
      setQuery(param);
      handleSearch(param);
    }
  }, [searchParams, handleSearch]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTicket(text);
    setTimeout(() => setCopiedTicket(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-8">
      {/* Box Pencarian Utama */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-[#93C5FD] text-xs font-bold uppercase tracking-wider mb-3">
            <Search className="w-3.5 h-3.5" />
            Portal Pelacak Mandiri
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] dark:text-white mb-2">
            Lacak Status Pengaduan & Surat
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
            Ketahui perkembangan laporan Anda secara realtime. Cukup masukkan salah satu data: <strong>Nomor Tiket</strong>, <strong>Nomor HP/WhatsApp</strong>, atau <strong>NIK</strong> yang didaftarkan.
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-2.5 bg-gray-50 dark:bg-[#0F172A] p-2 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus-within:border-[#1E3A8A] dark:focus-within:border-[#3B82F6] transition-all">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: PKD-00001, 08123456789, atau 360401..."
                className="w-full bg-transparent px-3 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setResults(null); }}
                  className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0A192F] hover:bg-black dark:bg-[#3B82F6] dark:hover:bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Melacak...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Lacak Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Filter Hints */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Mendukung pencarian via:</span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
              🎫 Nomor Tiket (PKD-00001)
            </span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
              📱 No. Telepon / WhatsApp
            </span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
              🪪 NIK KTP (16 Digit)
            </span>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </form>
      </div>

      {/* Hasil Pelacakan */}
      <AnimatePresence mode="wait">
        {loading && (
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-800 dark:text-gray-200 font-bold text-sm">Menghubungkan ke Server Pelacakan...</p>
            <p className="text-gray-400 text-xs mt-1">Mencari status dan balasan resmi pengaduan Anda</p>
          </div>
        )}

        {!loading && results !== null && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto shadow-sm"
          >
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Pengaduan Tidak Ditemukan
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
              Tidak ada data pengaduan yang cocok dengan kata kunci &quot;<strong className="text-gray-800 dark:text-gray-200">{query}</strong>&quot;.
              Pastikan Anda memasukkan nomor tiket, nomor telepon, atau NIK yang sama persis saat pengajuan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setQuery("")}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Coba Kata Kunci Lain
              </button>
              {onSwitchToForm && (
                <button
                  onClick={onSwitchToForm}
                  className="px-5 py-2.5 rounded-xl bg-[#0A192F] hover:bg-black text-white font-semibold text-xs transition-colors"
                >
                  Ajukan Pengaduan Baru
                </button>
              )}
            </div>
          </motion.div>
        )}

        {!loading && results !== null && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
              <span>Ditemukan <strong className="text-gray-900 dark:text-white">{results.length}</strong> pengaduan terkait:</span>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-[#1E3A8A] dark:text-[#93C5FD] font-bold hover:underline"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Bukti Pelacakan
              </button>
            </div>

            {results.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG["Baru"];
              const isReviewed = item.status === "Diproses";
              const isFinished = item.status === "Selesai" || Boolean(item.admin_reply);

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  {/* Header Kartu */}
                  <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-white dark:from-[#0F172A] dark:to-[#1E293B] border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nomor Tiket</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {item.type.replace(/_/g, " ")}
                          </span>
                          {item.is_confidential && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <Shield className="w-3 h-3 text-emerald-600" /> Mode Rahasia
                            </span>
                          )}
                          {item.disposisi_bidang && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                              <Building2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> {item.disposisi_bidang}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0A192F] dark:text-white tracking-wider">
                            {item.ticket_number}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => copyToClipboard(item.ticket_number)}
                              title="Salin Nomor Tiket"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copiedTicket === item.ticket_number ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setReceiptModal(item)}
                              title="Cetak Tanda Terima Pengaduan Resmi"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-900 transition-all shadow-xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak Tanda Terima</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge & SLA */}
                      <div className="flex flex-col sm:items-end justify-between gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${statusCfg.badge}`}>
                          {item.status === "Diproses" && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          )}
                          {item.status === "Selesai" && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {statusCfg.label}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                          <span>Diajukan: {new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900/40">
                          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>SLA Pelayanan: Maksimal 3 Hari Kerja</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-8">
                    {/* Data Pelapor & Ringkasan Laporan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/70 dark:bg-gray-900/40 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Data Pelapor (Disamarkan)
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-800">
                            <span className="text-gray-500">Nama Pelapor:</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{item.name_masked}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-800">
                            <span className="text-gray-500">No. WhatsApp / HP:</span>
                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{item.phone_masked}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-800">
                            <span className="text-gray-500">NIK KTP:</span>
                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{item.nik_masked}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{item.email_masked}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Informasi Pengaduan
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-gray-500 block text-[11px]">Subjek / Masalah:</span>
                            <span className="font-bold text-gray-900 dark:text-white text-sm">{item.subject}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[11px] mb-1">Isi Laporan:</span>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800/60 p-3 rounded-lg border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SEKSI BALASAN RESMI DISNAKERTRANS (Paling Penting!) */}
                    {item.admin_reply ? (
                      <div className="bg-gradient-to-br from-emerald-50 via-green-50/70 to-emerald-100/40 dark:from-emerald-950/40 dark:via-gray-900 dark:to-emerald-900/20 border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <MessageSquareReply className="w-6 h-6" />
                          </div>

                          <div className="space-y-3 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md mb-1">
                                  Tanggapan & Balasan Resmi
                                </span>
                                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                  {item.admin_reply_title || "Tindak Lanjut & Balasan Disnakertrans Kab. Serang"}
                                </h4>
                              </div>
                              {item.admin_reply_at && (
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0">
                                  📅 {new Date(item.admin_reply_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                                </span>
                              )}
                            </div>

                            <div className="bg-white/90 dark:bg-[#0B1120]/80 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50">
                              <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
                                {item.admin_reply}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                              <span className="flex items-center gap-1 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Ditanggapi oleh: <strong className="text-gray-700 dark:text-gray-300">{item.admin_reply_by || "Disnakertrans Kab. Serang"}</strong>
                              </span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Terverifikasi Resmi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : isReviewed ? (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-3.5">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-amber-900 dark:text-amber-200">
                            Pengaduan Sedang Dalam Tahap Peninjauan & Verifikasi
                          </p>
                          <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                            Petugas bidang terkait sedang menelaah kelengkapan data dan substansi laporan Anda. Balasan dan rekomendasi resmi akan segera ditampilkan pada halaman tracking ini begitu selesai diproses.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex items-start gap-3.5">
                        <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-blue-900 dark:text-blue-200">
                            Pengaduan Baru Masuk Antrean
                          </p>
                          <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                            Laporan Anda telah berhasil dicatat oleh sistem dan menunggu penugasan kepada tim verifikator (maksimal 3×24 jam hari kerja). Silakan periksa kembali halaman ini secara berkala.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Timeline / Riwayat Tahapan Pengaduan */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#1E3A8A] dark:text-[#93C5FD]" />
                        Riwayat & Jejak Penanganan (Timeline)
                      </h4>

                      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                        {item.timeline && item.timeline.length > 0 ? (
                          item.timeline.map((event, idx) => (
                            <div key={idx} className="relative group">
                              {/* Dot */}
                              <div className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 border-white dark:border-[#1E293B] flex items-center justify-center ${
                                idx === item.timeline.length - 1
                                  ? "bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 text-white"
                                  : "bg-blue-600 text-white"
                              }`}>
                                <Check className="w-3 h-3" />
                              </div>

                              <div className="bg-gray-50/80 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                  <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                    {event.title}
                                  </h5>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {event.time ? new Date(event.time).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {event.note}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 py-2">
                            Belum ada riwayat aktivitas penanganan.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Kartu & Tombol Aksi */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        Ada kendala pada laporan Anda? Hubungi Layanan Disnakertrans di <strong>(0254) 200234</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/pengaduan?tab=tracking&ticket=${item.ticket_number}`)}
                          className="px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Tautan Tracking</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Empty state bila belum pernah search */}
        {!loading && results === null && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Clock,
                title: "Pemantauan Realtime",
                desc: "Ketahui setiap kali status laporan berubah, mulai dari diajukan, ditinjau, hingga selesai.",
              },
              {
                icon: MessageSquareReply,
                title: "Balasan Resmi Petugas",
                desc: "Respon dan solusi tertulis dari Disnakertrans terhubung langsung ke halaman pelacakan ini.",
              },
              {
                icon: Shield,
                title: "Privasi Terlindungi",
                desc: "Pelacakan aman dengan penyensoran data pribadi NIK dan nomor kontak secara otomatis.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0A192F]/5 dark:bg-blue-500/10 text-[#0A192F] dark:text-[#93C5FD] flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{feature.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CETAK TANDA TERIMA PENGADUAN DIGITAL (RESMI DISNAKERTRANS) */}
      {mounted && receiptModal && typeof document !== 'undefined' && createPortal(
        <div id="receipt-portal-root">
          <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-hidden print:p-0 print:bg-white print:static print:block">
                <motion.div
                  id="printable-receipt"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-white text-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-300 flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden my-auto print:max-h-none print:m-0 print:border-none print:shadow-none print:w-full print:block"
                >
                  {/* Receipt Header (Kop Surat Pemkab Serang) */}
                  <div className="shrink-0 p-4 sm:p-5 border-b-2 border-gray-800 bg-white relative">
                    <button
                      type="button"
                      onClick={() => setReceiptModal(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors print:hidden"
                      title="Tutup Modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-300 gap-3 pr-8 sm:pr-0">
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/logo-serang.png"
                          alt="Logo Pemkab Serang"
                          className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                        <div>
                          <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-600">PEMERINTAH KABUPATEN SERANG</h4>
                          <h2 className="text-sm sm:text-lg font-extrabold text-gray-900 tracking-tight leading-tight">
                            DINAS TENAGA KERJA DAN TRANSMIGRASI
                          </h2>
                          <p className="text-[9px] sm:text-[10px] text-gray-500">
                            Jl. Raya Serang - Jakarta KM. 4, Serang, Banten 42183 • Telp: (0254) 200234
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 hidden sm:block">
                        <span className="text-[10px] font-mono font-bold bg-gray-100 px-2.5 py-1 rounded border border-gray-300">
                          SIPKO DIGITAL
                        </span>
                      </div>
                    </div>

                    <div className="text-center pt-3">
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-gray-900">
                        TANDA TERIMA PENGADUAN ELEKTRONIK
                      </h3>
                      <p className="text-[11px] text-gray-500 font-mono">
                        Nomor Registrasi: <strong className="text-gray-900 font-bold">{receiptModal.ticket_number}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Receipt Content Body (Scrollable inside modal) */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white text-xs print:overflow-visible print:p-2">
                    {/* Status & Privacy Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-600">Status Saat Ini:</span>
                        <span className="font-extrabold text-[#1E3A8A] bg-blue-100 px-2 py-0.5 rounded">
                          {receiptModal.status}
                        </span>
                      </div>
                      {receiptModal.is_confidential && (
                        <div className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Mode Rahasia (Whistleblower Dilindungi UU PDP)</span>
                        </div>
                      )}
                    </div>

                    {/* Table Details */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          <tr className="border-b border-gray-200 bg-gray-50/50">
                            <td className="p-2.5 font-bold text-gray-600 w-1/3">Tanggal & Waktu Masuk</td>
                            <td className="p-2.5 text-gray-900 font-medium">
                              {new Date(receiptModal.date).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "medium" })}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="p-2.5 font-bold text-gray-600">Jenis Layanan / Kategori</td>
                            <td className="p-2.5 text-gray-900 capitalize font-medium">
                              {receiptModal.type.replace(/_/g, " ")}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200 bg-gray-50/50">
                            <td className="p-2.5 font-bold text-gray-600">Nama Pelapor</td>
                            <td className="p-2.5 text-gray-900 font-medium">
                              {receiptModal.is_confidential ? "Terlindungi (Mode Rahasia)" : receiptModal.name_masked}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="p-2.5 font-bold text-gray-600">Nomor WhatsApp / HP</td>
                            <td className="p-2.5 text-gray-900 font-mono font-medium">{receiptModal.phone_masked}</td>
                          </tr>
                          <tr className="border-b border-gray-200 bg-gray-50/50">
                            <td className="p-2.5 font-bold text-gray-600">NIK KTP</td>
                            <td className="p-2.5 text-gray-900 font-mono font-medium">{receiptModal.nik_masked}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="p-2.5 font-bold text-gray-600">Subjek Pengaduan</td>
                            <td className="p-2.5 text-gray-900 font-bold">{receiptModal.subject}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-gray-600 align-top">Ringkasan Masalah</td>
                            <td className="p-2.5 text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {receiptModal.message}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* QR Code & Digital Verification Notice */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border border-gray-200 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/pengaduan?tab=tracking&ticket=${receiptModal.ticket_number}` : `https://disnakertrans.serangkab.go.id/tracking?ticket=${receiptModal.ticket_number}`)}`}
                          alt="QR Code Verifikasi"
                          className="w-16 h-16 sm:w-20 sm:h-20 border border-gray-300 rounded-lg p-1 bg-white shrink-0"
                        />
                        <div className="text-[11px] text-gray-600 space-y-0.5">
                          <p className="font-bold text-gray-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Dokumen Sah Tervalidasi Sistem
                          </p>
                          <p className="text-[10px] sm:text-[11px]">
                            Pindai QR Code di atas dengan ponsel untuk memantau status langsung.
                          </p>
                          <p className="font-mono text-[10px] text-gray-500">
                            Standar Layanan: Maksimal 3 Hari Kerja
                          </p>
                        </div>
                      </div>

                      <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                        <p className="text-[9px] text-gray-500">Diterbitkan oleh:</p>
                        <p className="font-bold text-gray-900 text-[11px] sm:text-xs">Disnakertrans Kab. Serang</p>
                        <div className="mt-1.5 inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-bold text-[9px] sm:text-[10px]">
                          TERDAFTAR RESMI
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 italic text-center">
                      *Simpan bukti tanda terima ini sebagai nomor referensi saat melakukan koordinasi atau mediasi di Kantor Disnakertrans Kabupaten Serang.
                    </p>
                  </div>

                  {/* Action Buttons Footer (Always visible, fixed at bottom of modal dialog) */}
                  <div className="shrink-0 p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 print:hidden z-10">
                    <span className="text-[11px] text-gray-500 hidden sm:inline font-mono">
                      No: <strong className="text-gray-800 font-bold">{receiptModal.ticket_number}</strong>
                    </span>
                    <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setReceiptModal(null)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Tutup
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Printer className="w-4 h-4" />
                        Cetak / Simpan PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
}
