"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Clock, CheckCircle2, Mail, ChevronDown, ChevronUp, Filter, User, Send,
  MessageSquareReply, Loader2, Trash2, ShieldAlert, ShieldCheck, FileImage,
  FileVideo, FileText, Paperclip, X, Download, Search, UserCheck, Pencil, AlertCircle, Check,
  Building2, Sparkles, Share2, ExternalLink, Copy,
} from "lucide-react";

type ComplaintStatus = "Baru" | "Diproses" | "Menunggu Tindak Lanjut" | "Selesai" | "Ditolak";
const STATUSES: ComplaintStatus[] = ["Baru", "Diproses", "Menunggu Tindak Lanjut", "Selesai", "Ditolak"];

export const BIDANG_LIST = [
  { id: "Bidang Hubungan Industrial (HI)", name: "🏛️ Bidang Hubungan Industrial (HI)", short: "Bidang HI", desc: "Sengketa kerja, PHK, upah, pesangon, bipartit" },
  { id: "Bidang Penempatan Tenaga Kerja (Penta)", name: "💼 Bidang Penempatan Tenaga Kerja (Penta)", short: "Bidang Penta", desc: "Lowongan, kartu kuning (AK-1), PMI/TKI" },
  { id: "Bidang Pelatihan Kerja (Lattas/BLK)", name: "🛠️ Bidang Pelatihan Kerja (Lattas/BLK)", short: "Bidang Lattas", desc: "Pelatihan BLK, sertifikasi kompetensi, magang" },
  { id: "Bidang Transmigrasi", name: "🌾 Bidang Transmigrasi", short: "Transmigrasi", desc: "Program dan bantuan transmigrasi" },
  { id: "Sekretariat & Pengawasan", name: "📋 Sekretariat & Pengawasan", short: "Sekretariat", desc: "Administrasi umum dan pengawasan regulasi" },
];

export const OFFICIAL_TEMPLATES = [
  {
    name: "✉️ Undangan Klarifikasi Bipartit / Mediasi",
    title: "Undangan Klarifikasi dan Mediasi Hubungan Industrial di Kantor Disnakertrans",
    status: "Diproses" as ComplaintStatus,
    text: `Menindaklanjuti laporan pengaduan Saudara/i terkait perselisihan ketenagakerjaan, dengan ini kami mengundang Saudara/i beserta pihak manajemen perusahaan terlapor untuk hadir dalam agenda klarifikasi/mediasi resmi pada:\n\nHari/Tanggal : [Tentukan Hari & Tanggal]\nWaktu        : 09.00 WIB s/d Selesai\nTempat       : Ruang Mediasi Disnakertrans Kab. Serang\n               Jl. Raya Serang - Jakarta KM. 4, Kalodran, Serang\n\nMohon membawa dokumen pendukung lengkap (Perjanjian Kerja/PKWT, Slip Gaji, Kartu Karyawan, dan bukti perundingan sebelumnya). Kehadiran kedua belah pihak sangat penting demi penyelesaian secara mufakat.`,
  },
  {
    name: "📑 Permintaan Kelengkapan Berkas Bukti",
    title: "Permintaan Kelengkapan Berkas dan Dokumen Bukti Pengaduan",
    status: "Menunggu Tindak Lanjut" as ComplaintStatus,
    text: `Pengaduan Saudara/i telah ditelaah awal oleh tim verifikator Disnakertrans Kab. Serang. Untuk dapat memproses pemeriksaan lapangan atau mediasi lebih lanjut, mohon melengkapi bukti dokumen pendukung:\n\n1. Salinan/Foto Perjanjian Kerja (PKWT/PKWTT) atau Surat Keputusan Pengangkatan\n2. Bukti slip pembayaran upah/gaji terakhir atau rekening koran\n3. Kronologis singkat tertulis upaya perundingan internal yang telah dilakukan\n\nDokumen dapat diserahkan langsung ke Loket Pengaduan Disnakertrans Kab. Serang pada hari kerja (Senin–Jumat, 08.00–15.30 WIB) atau konfirmasi melalui nomor resmi dinas.`,
  },
  {
    name: "✅ Rekomendasi & Hasil Pengawasan Normatif",
    title: "Penyampaian Hasil Tindak Lanjut dan Rekomendasi Resmi Disnakertrans",
    status: "Selesai" as ComplaintStatus,
    text: `Disnakertrans Kabupaten Serang melalui Pengawas Ketenagakerjaan telah melakukan pemanggilan klarifikasi dan pembinaan terhadap pihak manajemen perusahaan terlapor.\n\nPihak perusahaan telah memberikan komitmen tertulis untuk menunaikan hak-hak normatif pekerja sesuai dengan ketentuan perundang-undangan ketenagakerjaan yang berlaku. Berdasarkan hasil pembinaan tersebut, laporan pengaduan ini dinyatakan SELESAI dan akan tetap dipantau secara berkala.\n\nTerima kasih atas kepedulian Saudara/i dalam mewujudkan iklim ketenagakerjaan yang kondusif di Kabupaten Serang.`,
  },
  {
    name: "ℹ️ Prosedur Kartu AK-1 & Pelatihan BLK",
    title: "Petunjuk Prosedur Pembuatan Kartu Kuning (AK-1) dan Pelatihan Kerja BLK",
    status: "Selesai" as ComplaintStatus,
    text: `Terkait permohonan informasi Saudara/i mengenai layanan ketenagakerjaan:\n\n1. Pembuatan Kartu Pencari Kerja (AK-1 / Kartu Kuning) dapat diproses online melalui portal SiapKerja Kemnaker atau datang langsung ke Loket Pelayanan Terpadu Disnakertrans Kab. Serang dengan membawa fotokopi KTP dan ijazah terakhir.\n2. Pendaftaran pelatihan kerja vokasi di UPTD BLK Disnakertrans dibuka secara berkala melalui menu Pelatihan di website ini.\n\nSeluruh pelayanan publik di Disnakertrans Kabupaten Serang adalah GRATIS (tidak dipungut biaya apapun).`,
  },
];

const STATUS_META: Record<ComplaintStatus, { color: string; bg: string; icon: React.ComponentType<{className?: string}> }> = {
  "Baru":                    { color: "text-blue-600",  bg: "bg-blue-50",   icon: AlertCircle },
  "Diproses":                { color: "text-amber-600", bg: "bg-amber-50",  icon: Clock },
  "Menunggu Tindak Lanjut":  { color: "text-purple-600",bg: "bg-purple-50", icon: Clock },
  "Selesai":                 { color: "text-green-600", bg: "bg-green-50",  icon: CheckCircle2 },
  "Ditolak":                 { color: "text-red-600",   bg: "bg-red-50",    icon: X },
};

interface Complaint {
  id: number; name: string; email: string; phone?: string; nik?: string; subject: string; message: string;
  status: ComplaintStatus; type: string; ticket_number: string;
  assigned_to: number | null; internal_notes: string; attachments: string;
  is_confidential?: number | boolean;
  disposisi_bidang?: string | null;
  disposisi_at?: string | null;
  admin_reply?: string | null; admin_reply_title?: string | null;
  admin_reply_at?: string | null; admin_reply_by?: string | null;
  is_spam: number; date: string;
}
interface Stats { total: number; baru: number; diproses: number; menunggu: number; selesai: number; ditolak: number; }

export default function AdminComplaintsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
      </div>
    }>
      <AdminComplaintsInner />
    </Suspense>
  );
}

function AdminComplaintsInner() {
  const searchParams = useSearchParams();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  // Initialize from URL param on mount
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") || "");
  const [typeFilter, setTypeFilter] = useState("");
  const [bidangFilter, setBidangFilter] = useState("");
  const [confidentialFilter, setConfidentialFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyTitle, setReplyTitle] = useState("");
  const [replyStatus, setReplyStatus] = useState<ComplaintStatus>("Selesai");
  const [replySending, setReplySending] = useState(false);
  const [replyResult, setReplyResult] = useState<{ id: number; type: "success" | "error"; message: string } | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: number; notes: string } | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const perPage = 10;

  // Sync URL param → filter on navigation
  useEffect(() => {
    const s = searchParams.get("status") || "";
    setStatusFilter(s);
    setPage(1);
  }, [searchParams]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3000);
  };

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (bidangFilter) params.set("disposisi_bidang", bidangFilter);
    if (confidentialFilter) params.set("is_confidential", confidentialFilter);
    if (search) params.set("search", search);
    const [listRes, statsRes] = await Promise.all([
      fetch(`/api/admin/complaints?${params}`),
      fetch("/api/complaints/stats"),
    ]);
    const listData = await listRes.json();
    const statsData = await statsRes.json();
    setComplaints(listData.data || []);
    setTotal(listData.meta?.total || 0);
    setStats(statsData.data || null);
    setIsLoading(false);
  }, [page, statusFilter, typeFilter, bidangFilter, confidentialFilter, search]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleStatusUpdate = async (id: number, status: ComplaintStatus) => {
    setUpdating(id);
    await fetch(`/api/admin/complaints`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchComplaints();
    setUpdating(null);
  };

  const handleDisposisi = async (id: number, bidang: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, disposisi_bidang: bidang }),
      });
      if (res.ok) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, disposisi_bidang: bidang } : c));
        showToast("success", bidang ? `Berhasil didisposisikan ke ${bidang}` : "Disposisi dibatalkan");
      } else {
        showToast("error", "Gagal memperbarui disposisi bidang");
      }
    } catch {
      showToast("error", "Gagal menghubungi server");
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!editingNotes) return;
    await fetch(`/api/admin/complaints`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingNotes.id, internal_notes: editingNotes.notes }),
    });
    showToast("success", "Catatan internal disimpan");
    setEditingNotes(null);
    fetchComplaints();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus pengaduan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    await fetch(`/api/admin/complaints?id=${id}`, { method: "DELETE" });
    showToast("success", "Pengaduan dihapus");
    fetchComplaints();
  };

  const handleSpamToggle = async (id: number, is: number) => {
    await fetch(`/api/admin/complaints`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_spam: is ? 0 : 1 }),
    });
    fetchComplaints();
  };

  const handleSendReply = async (id: number) => {
    if (!replyText.trim()) return;
    setReplySending(true); setReplyResult(null);
    const res = await fetch(`/api/complaints/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        replyMessage: replyText,
        replyTitle: replyTitle.trim() || undefined,
        status: replyStatus,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("success", "Balasan tersimpan & terhubung ke pelacak!");
      setReplyResult({
        id,
        type: "success",
        message: "✓ Balasan berhasil disimpan di database dan tersinkronisasi ke portal pelacak publik" + (data.data?.emailSent ? " serta dikirimkan ke email pengadu." : "."),
      });
      setReplyText(""); setReplyTitle(""); setReplyingId(null); fetchComplaints();
    } else {
      setReplyResult({ id, type: "error", message: data.message || "Gagal menyimpan balasan" });
    }
    setReplySending(false);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (bidangFilter) params.set("disposisi_bidang", bidangFilter);
    if (confidentialFilter) params.set("is_confidential", confidentialFilter);
    if (search) params.set("search", search);
    window.open(`/api/admin/complaints/export?${params.toString()}`, "_blank");
  };

  const buildWhatsAppMessageText = (item: Complaint) => {
    const ticketNum = item.ticket_number || `PKD-${String(item.id).padStart(5, "0")}`;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://disnakertrans.serangkab.go.id";
    const trackingUrl = `${baseUrl}/pengaduan?tab=tracking&ticket=${ticketNum}`;

    let replySnippet = "";
    if (item.admin_reply) {
      replySnippet = `\n💬 *Catatan/Tanggapan Resmi Petugas:*\n"${item.admin_reply.slice(0, 180)}${item.admin_reply.length > 180 ? '...' : ''}"\n`;
    }

    return `Halo Bapak/Ibu *${item.name}*,\n\nKami dari *Dinas Tenaga Kerja dan Transmigrasi (Disnakertrans) Kabupaten Serang* menginformasikan pembaruan status laporan pengaduan Anda:\n\n📋 *Nomor Registrasi:* ${ticketNum}\n🏷️ *Kategori / Subjek:* ${item.subject || item.type}\n📌 *Status Saat Ini:* ${item.status}\n🏛️ *Bidang Penanganan:* ${item.disposisi_bidang || 'Disnakertrans Kab. Serang'}\n${replySnippet}\nUntuk memantau riwayat lengkap atau mencetak Dokumen Tanda Terima Resmi ber-QR Code, silakan buka tautan pelacakan berikut:\n${trackingUrl}\n\nTerima kasih.\n_Pemerintah Kabupaten Serang_`;
  };

  const getWhatsAppUrl = (item: Complaint) => {
    const cleanPhone = (item.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "62");
    if (!cleanPhone) return "#";
    const msg = buildWhatsAppMessageText(item);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
  };

  const parseAttachments = (s: string) => { try { return JSON.parse(s); } catch { return []; } };
  const totalPages = Math.ceil(total / perPage);

  const hasActiveFilters = Boolean(statusFilter || typeFilter || bidangFilter || confidentialFilter || search);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {previewImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-3xl max-h-[80vh]">
            <button onClick={() => setPreviewImg(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300"><X className="w-6 h-6" /></button>
            <img src={previewImg} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Manajemen Pengaduan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola laporan masyarakat, disposisi bidang SOTK, tanggapan resmi, dan notifikasi pelapor.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow"
          title="Ekspor seluruh pengaduan sesuai filter aktif ke berkas CSV / Excel"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Rekap (Excel/CSV)</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total", value: stats.total, color: "border-l-gray-400" },
            { label: "Baru", value: stats.baru, color: "border-l-blue-500" },
            { label: "Diproses", value: stats.diproses, color: "border-l-amber-500" },
            { label: "Menunggu", value: stats.menunggu, color: "border-l-purple-500" },
            { label: "Selesai", value: stats.selesai, color: "border-l-green-500" },
            { label: "Ditolak", value: stats.ditolak, color: "border-l-red-500" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm border-l-4 ${s.color}`}>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters Bar (Advanced UCD Filters) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, nomor tiket, nomor HP, atau NIK..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#1E3A8A]/30 bg-white"
            >
              <option value="">Semua Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#1E3A8A]/30 bg-white"
            >
              <option value="">Semua Kategori</option>
              <option value="umum">Pengaduan Umum</option>
              <option value="hubungan_industrial">Hubungan Industrial</option>
            </select>

            <select
              value={bidangFilter}
              onChange={e => { setBidangFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#1E3A8A]/30 bg-white"
            >
              <option value="">Semua Bidang SOTK</option>
              {BIDANG_LIST.map(b => (
                <option key={b.id} value={b.id}>{b.short}</option>
              ))}
            </select>

            <select
              value={confidentialFilter}
              onChange={e => { setConfidentialFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#1E3A8A]/30 bg-white"
            >
              <option value="">Semua Mode</option>
              <option value="1">🛡️ Mode Rahasia Saja</option>
              <option value="0">Reguler Saja</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setTypeFilter("");
                  setBidangFilter("");
                  setConfidentialFilter("");
                  setSearch("");
                  setPage(1);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" /> Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Complaint List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">Menampilkan <span className="font-semibold text-gray-900">{complaints.length}</span> dari <span className="font-semibold text-gray-900">{total}</span> pengaduan</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" /></div>
        ) : complaints.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">Tidak ada pengaduan{statusFilter ? ` dengan status "${statusFilter}"` : ""}.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {complaints.map(item => {
              const isExpanded = expandedId === item.id;
              const ticketNum = item.ticket_number || `PKD-${String(item.id).padStart(5, "0")}`;
              const attachments = parseAttachments(item.attachments);
              const statusMeta = STATUS_META[item.status] || STATUS_META["Baru"];
              const StatusIcon = statusMeta.icon;

              return (
                <div key={item.id} className={`hover:bg-gray-50/50 transition-colors ${item.is_spam ? "bg-red-50/30" : ""}`}>
                  <div className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 cursor-pointer"
                    onClick={() => { setExpandedId(isExpanded ? null : item.id); setReplyingId(null); setReplyText(""); setReplyTitle(""); setReplyResult(null); }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.is_spam ? "bg-red-50 text-red-500" : `${statusMeta.bg} ${statusMeta.color}`}`}>
                      {item.is_spam ? <ShieldAlert className="w-5 h-5" /> : <StatusIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold bg-[#0A192F] text-[#FBBF24] px-2 py-0.5 rounded">{ticketNum}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMeta.bg} ${statusMeta.color}`}>{item.status}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.type === "hubungan_industrial" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                          {item.type === "hubungan_industrial" ? "HI" : "Umum"}
                        </span>
                        {Boolean(item.is_confidential) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                            🛡️ RAHASIA (Whistleblower)
                          </span>
                        )}
                        {item.disposisi_bidang && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1 border border-indigo-200">
                            <Building2 className="w-3 h-3 text-indigo-600" /> {BIDANG_LIST.find(b => b.id === item.disposisi_bidang)?.short || item.disposisi_bidang}
                          </span>
                        )}
                        {item.admin_reply ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            ✓ Dibalas
                          </span>
                        ) : null}
                        {item.is_spam ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">SPAM</span> : null}
                        {attachments.length > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Paperclip className="w-3 h-3" />{attachments.length}</span>}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.subject || "Tanpa Subjek"}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.name}</span>
                        <span className="flex items-center gap-1 hidden sm:flex"><Mail className="w-3 h-3" />{item.email}</span>
                        {item.phone && <span className="flex items-center gap-1 font-mono text-gray-500">📱 {item.phone}</span>}
                        {item.nik && <span className="flex items-center gap-1 font-mono text-gray-500">🪪 NIK: {item.nik}</span>}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 text-right shrink-0 hidden sm:block">
                      {new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </div>

                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-5 sm:pl-20">
                      <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100 space-y-4">
                        {/* Whistleblower Protection Notice */}
                        {Boolean(item.is_confidential) && (
                          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-emerald-900 space-y-1">
                              <p className="font-bold text-emerald-800 text-sm">
                                🛡️ PERLINDUNGAN IDENTITAS WHISTLEBLOWER AKTIF (UU No. 27/2022)
                              </p>
                              <p className="leading-relaxed">
                                Pelapor memilih <strong>Mode Rahasia</strong>. Identitas (Nama, NIK, No. HP) ini hanya untuk arsip verifikasi internal Disnakertrans. <strong>DILARANG KERAS</strong> membuka identitas pelapor kepada pihak perusahaan/terlapor selama mediasi atau klarifikasi lapangan.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Disposisi Bidang Penanganan SOTK Disnakertrans */}
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">Disposisi Penanganan Bidang (SOTK)</p>
                              <p className="text-[11px] text-gray-500">
                                {item.disposisi_bidang ? `Telah didisposisikan ke ${item.disposisi_bidang}` : "Belum didisposisikan ke bidang teknis operasional"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={item.disposisi_bidang || ""}
                              onChange={(e) => handleDisposisi(item.id, e.target.value)}
                              disabled={updating === item.id}
                              className="text-xs font-semibold rounded-lg px-3 py-1.5 border border-indigo-200 bg-indigo-50/50 text-indigo-900 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
                            >
                              <option value="">-- Pilih Bidang Penanganan --</option>
                              {BIDANG_LIST.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Data Kontak & Pelapor */}
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Nama & Email</span>
                            <p className="font-bold text-gray-800">{item.name}</p>
                            <p className="text-gray-500 text-[11px] truncate">{item.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">No. Telepon / WhatsApp</span>
                            {item.phone ? (
                              <div className="flex flex-col gap-1.5 mt-1">
                                <span className="font-mono font-semibold text-gray-800 text-xs">{item.phone}</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <a
                                    href={getWhatsAppUrl(item)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs transition-colors"
                                    title="Kirim notifikasi pesan WhatsApp resmi berisi nomor tiket & tautan pelacakan ke pelapor"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Kirim Notifikasi WA</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(buildWhatsAppMessageText(item));
                                      showToast("success", "Teks notifikasi WhatsApp berhasil disalin!");
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-medium transition-colors border border-gray-200"
                                    title="Salin isi teks template pesan WhatsApp"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                    <span>Salin Teks</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Tidak dicantumkan</span>
                            )}
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">NIK KTP</span>
                            <p className="font-mono font-semibold text-gray-800">{item.nik || <span className="text-gray-400 italic font-sans font-normal">Tidak dicantumkan</span>}</p>
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Isi Pengaduan</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-3.5 rounded-xl border border-gray-200">{item.message}</p>
                        </div>

                        {/* Balasan Resmi yang sudah ada & tampil di tracking */}
                        {item.admin_reply && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Balasan Resmi Terhubung ke Portal Tracking
                              </span>
                              {item.admin_reply_at && (
                                <span className="text-[11px] text-emerald-600 font-medium">
                                  {new Date(item.admin_reply_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                                </span>
                              )}
                            </div>
                            {item.admin_reply_title && (
                              <p className="text-xs font-bold text-gray-900 mb-1">{item.admin_reply_title}</p>
                            )}
                            <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                              {item.admin_reply}
                            </p>
                            <div className="text-[10px] text-emerald-700 mt-2 flex items-center justify-between">
                              <span>Ditanggapi oleh: <strong>{item.admin_reply_by || "Petugas Disnakertrans"}</strong></span>
                              <span>Tampil aktif di pelacak masyarakat</span>
                            </div>
                          </div>
                        )}

                        {/* Internal Notes */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Catatan Internal Petugas</p>
                            {editingNotes?.id !== item.id && (
                              <button onClick={() => setEditingNotes({ id: item.id, notes: item.internal_notes || "" })}
                                className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                <Pencil className="w-3 h-3" />Edit
                              </button>
                            )}
                          </div>
                          {editingNotes?.id === item.id ? (
                            <div className="space-y-2">
                              <textarea rows={3} value={editingNotes.notes} onChange={e => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30 resize-none bg-white"
                                placeholder="Tambah catatan internal..." />
                              <div className="flex gap-2">
                                <button onClick={handleSaveNotes} className="bg-[#1E3A8A] text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"><Check className="w-3 h-3" />Simpan</button>
                                <button onClick={() => setEditingNotes(null)} className="text-gray-500 text-xs font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg">Batal</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 italic bg-white p-3 rounded-xl border border-gray-200">{item.internal_notes || "Belum ada catatan internal."}</p>
                          )}
                        </div>

                        {/* Attachments */}
                        {attachments.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Lampiran ({attachments.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {attachments.map((att: any, idx: number) => (
                                att.type?.startsWith("image/") ? (
                                  <button key={idx} onClick={() => setPreviewImg(att.data)} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#1E3A8A]/40">
                                    <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                                  </button>
                                ) : (
                                  <div key={idx} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-xs border border-gray-200">
                                    <FileText className="w-4 h-4 text-gray-400" />{att.name}
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reply result */}
                        {replyResult?.id === item.id && (
                          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${replyResult.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            {replyResult.message}
                          </div>
                        )}

                        {/* Reply form */}
                        {replyingId === item.id && (
                          <div className="space-y-3 bg-white p-4 rounded-xl border-2 border-[#1E3A8A]/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageSquareReply className="w-4 h-4 text-[#1E3A8A]" />
                                <p className="text-xs font-bold text-[#1E3A8A]">Kirim Balasan Resmi (Otomatis Masuk ke Tracker Pelapor)</p>
                              </div>
                              <span className="text-[10px] text-gray-400">Penerima: {item.email}</span>
                            </div>

                            {/* Template Jawaban Cepat Birokrasi (UCD Efficiency & Heuristic #7) */}
                            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#1E3A8A] flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  Gunakan Template Draf Balasan Resmi Dinas:
                                </span>
                                <span className="text-[10px] text-gray-500">Klik untuk isi otomatis</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {OFFICIAL_TEMPLATES.map((tmpl, tIdx) => (
                                  <button
                                    key={tIdx}
                                    type="button"
                                    onClick={() => {
                                      setReplyTitle(tmpl.title);
                                      setReplyText(tmpl.text);
                                      setReplyStatus(tmpl.status);
                                    }}
                                    className="text-left text-[11px] font-medium bg-white hover:bg-blue-100/80 border border-blue-200 text-gray-800 p-2 rounded-lg transition-all shadow-2xs hover:border-blue-400 flex items-center justify-between gap-2"
                                  >
                                    <span className="truncate">{tmpl.name}</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                                      {tmpl.status}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <input
                              type="text"
                              value={replyTitle}
                              onChange={e => setReplyTitle(e.target.value)}
                              placeholder="Judul balasan resmi (misal: Tindak Lanjut Pengaduan Disnakertrans)"
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40 bg-white"
                            />

                            <textarea
                              rows={5}
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Tuliskan isi balasan, verifikasi, atau solusi yang akan terbaca di tracking pengaduan..."
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/40 resize-none bg-white"
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600 font-semibold">Ubah status jadi:</label>
                                <select
                                  value={replyStatus}
                                  onChange={e => setReplyStatus(e.target.value as ComplaintStatus)}
                                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white font-semibold outline-none"
                                >
                                  <option value="Selesai">Selesai (Ditutup & Selesai)</option>
                                  <option value="Diproses">Diproses (Sedang Ditinjau)</option>
                                  <option value="Menunggu Tindak Lanjut">Menunggu Tindak Lanjut</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSendReply(item.id)}
                                  disabled={replySending || !replyText.trim()}
                                  className="bg-[#1E3A8A] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#172554] flex items-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                  {replySending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Menyimpan...</> : <><Send className="w-3.5 h-3.5" />Simpan & Hubungkan ke Tracking</>}
                                </button>
                                <button
                                  onClick={() => { setReplyingId(null); setReplyText(""); }}
                                  className="text-gray-500 hover:text-gray-700 text-xs font-medium px-3 py-2"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-200">
                          {replyingId !== item.id && (
                            <button onClick={e => { e.stopPropagation(); setReplyingId(item.id); setReplyText(item.admin_reply || ""); setReplyTitle(item.admin_reply_title || ""); setReplyResult(null); }}
                              className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#172554] flex items-center gap-2 shadow-sm">
                              <MessageSquareReply className="w-3.5 h-3.5" />
                              {item.admin_reply ? "Edit Balasan" : "Kirim Balasan"}
                            </button>
                          )}

                          {/* Status dropdown */}
                          <div className="relative group">
                            <button disabled={updating === item.id}
                              className="px-4 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors">
                              {updating === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                              Ubah Status: <strong>{item.status}</strong> ▾
                            </button>
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[200px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                              {STATUSES.map(s => (
                                <button key={s} onClick={e => { e.stopPropagation(); handleStatusUpdate(item.id, s); }}
                                  className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 ${item.status === s ? "font-bold text-[#1E3A8A] bg-blue-50/50" : "text-gray-700"}`}>
                                  {item.status === s && <Check className="w-3 h-3 text-[#1E3A8A]" />}{s}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button onClick={e => { e.stopPropagation(); handleSpamToggle(item.id, item.is_spam); }}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${item.is_spam ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}>
                            {item.is_spam ? <><ShieldCheck className="w-3.5 h-3.5" />Bukan Spam</> : <><ShieldAlert className="w-3.5 h-3.5" />Spam</>}
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" />Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">← Sebelumnya</button>
            <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">Selanjutnya →</button>
          </div>
        )}
      </div>
    </div>
  );
}
