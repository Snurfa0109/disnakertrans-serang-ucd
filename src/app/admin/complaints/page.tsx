"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Clock, CheckCircle2, Mail, ChevronDown, ChevronUp, Filter, User, Send,
  MessageSquareReply, Loader2, Trash2, ShieldAlert, ShieldCheck, FileImage,
  FileVideo, FileText, Paperclip, X, Download, Search, UserCheck, Pencil, AlertCircle, Check,
} from "lucide-react";

type ComplaintStatus = "Baru" | "Diproses" | "Menunggu Tindak Lanjut" | "Selesai" | "Ditolak";
const STATUSES: ComplaintStatus[] = ["Baru", "Diproses", "Menunggu Tindak Lanjut", "Selesai", "Ditolak"];

const STATUS_META: Record<ComplaintStatus, { color: string; bg: string; icon: React.ComponentType<{className?: string}> }> = {
  "Baru":                    { color: "text-blue-600",  bg: "bg-blue-50",   icon: AlertCircle },
  "Diproses":                { color: "text-amber-600", bg: "bg-amber-50",  icon: Clock },
  "Menunggu Tindak Lanjut":  { color: "text-purple-600",bg: "bg-purple-50", icon: Clock },
  "Selesai":                 { color: "text-green-600", bg: "bg-green-50",  icon: CheckCircle2 },
  "Ditolak":                 { color: "text-red-600",   bg: "bg-red-50",    icon: X },
};

interface Complaint {
  id: number; name: string; email: string; subject: string; message: string;
  status: ComplaintStatus; type: string; ticket_number: string;
  assigned_to: number | null; internal_notes: string; attachments: string;
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
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyTitle, setReplyTitle] = useState("");
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
  }, [page, statusFilter, typeFilter, search]);

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
    const res = await fetch(`/api/complaints/${id}/reply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ replyMessage: replyText, replyTitle: replyTitle.trim() || undefined }) });
    const data = await res.json();
    if (res.ok) {
      setReplyResult({ id, type: "success", message: data.data?.emailSent ? "✓ Balasan dikirim ke email pengadu" : "✓ Status diperbarui" });
      setReplyText(""); setReplyTitle(""); setReplyingId(null); fetchComplaints();
    } else setReplyResult({ id, type: "error", message: data.message || "Gagal" });
    setReplySending(false);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    window.open(`/api/admin/complaints/export?${params}`, "_blank");
  };

  const parseAttachments = (s: string) => { try { return JSON.parse(s); } catch { return []; } };
  const totalPages = Math.ceil(total / perPage);

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
          <p className="text-sm text-gray-500 mt-1">Kelola laporan dan pengaduan masyarakat.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm">
          <Download className="w-4 h-4" />Export CSV
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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari nama, email, tiket..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10" />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
          <option value="">Semua Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
          <option value="">Semua Jenis</option>
          <option value="umum">Pengaduan Umum</option>
          <option value="hubungan_industrial">Hubungan Industrial</option>
        </select>
        {(statusFilter || typeFilter || search) && (
          <button
            onClick={() => { setStatusFilter(""); setTypeFilter(""); setSearch(""); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        )}
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
                        {item.is_spam ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">SPAM</span> : null}
                        {attachments.length > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Paperclip className="w-3 h-3" />{attachments.length}</span>}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.subject || "Tanpa Subjek"}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.name}</span>
                        <span className="flex items-center gap-1 hidden sm:flex"><Mail className="w-3 h-3" />{item.email}</span>
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
                        {/* Message */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Isi Pengaduan</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                        </div>

                        {/* Internal Notes */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Catatan Internal</p>
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
                            <p className="text-sm text-gray-600 italic">{item.internal_notes || "Belum ada catatan internal."}</p>
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
                          <div className="space-y-3">
                            <div className="flex items-center gap-2"><MessageSquareReply className="w-4 h-4 text-[#1E3A8A]" /><p className="text-xs font-bold text-[#1E3A8A]">Balas ke: {item.email}</p></div>
                            <input type="text" value={replyTitle} onChange={e => setReplyTitle(e.target.value)} placeholder="Judul balasan (opsional)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40 bg-white" />
                            <textarea rows={5} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Tulis isi balasan resmi..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/40 resize-none bg-white" />
                            <div className="flex items-center gap-3">
                              <button onClick={() => handleSendReply(item.id)} disabled={replySending || !replyText.trim()}
                                className="bg-[#1E3A8A] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#172554] flex items-center gap-2 disabled:opacity-50">
                                {replySending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Mengirim...</> : <><Send className="w-3.5 h-3.5" />Kirim Balasan</>}
                              </button>
                              <button onClick={() => { setReplyingId(null); setReplyText(""); }} className="text-gray-500 hover:text-gray-700 text-xs font-medium px-3 py-2">Batal</button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
                          {replyingId !== item.id && (
                            <button onClick={e => { e.stopPropagation(); setReplyingId(item.id); setReplyText(""); setReplyTitle(""); setReplyResult(null); }}
                              className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#172554] flex items-center gap-2">
                              <MessageSquareReply className="w-3.5 h-3.5" />Balas
                            </button>
                          )}

                          {/* Status dropdown */}
                          <div className="relative group">
                            <button disabled={updating === item.id}
                              className="px-4 py-2 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                              {updating === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                              Ubah Status ▾
                            </button>
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[180px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                              {STATUSES.map(s => (
                                <button key={s} onClick={e => { e.stopPropagation(); handleStatusUpdate(item.id, s); }}
                                  className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 ${item.status === s ? "font-bold text-[#1E3A8A]" : "text-gray-700"}`}>
                                  {item.status === s && <Check className="w-3 h-3" />}{s}
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
