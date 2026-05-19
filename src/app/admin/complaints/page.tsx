"use client";

import { useEffect, useState } from "react";
import {
  Clock, CheckCircle2, Mail, ChevronDown, ChevronUp, Filter, User, Send,
  MessageSquareReply, Loader2, Trash2, ShieldAlert, ShieldCheck, FileImage,
  FileVideo, FileText, Paperclip, X,
} from "lucide-react";

interface Complaint {
  id: number; name: string; email: string; subject: string; message: string;
  status: "pending" | "processed"; type: string; attachments: string;
  is_spam: number; date: string;
}
interface Stats { total: number; pending: number; processed: number; }

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyTitle, setReplyTitle] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyResult, setReplyResult] = useState<{ id: number; type: "success" | "error"; message: string } | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const perPage = 10;

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), perPage: perPage.toString() });
      if (statusFilter) params.set("status", statusFilter);
      const [listRes, statsRes] = await Promise.all([
        fetch(`/api/complaints?${params}`), fetch("/api/complaints/stats"),
      ]);
      const listData = await listRes.json();
      const statsData = await statsRes.json();
      setComplaints(listData.data || []);
      setTotal(listData.meta?.total || 0);
      setStats(statsData.data || null);
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => { fetchComplaints(); }, [page, statusFilter]);

  const handleStatusUpdate = async (id: number, newStatus: "pending" | "processed") => {
    setUpdating(id);
    try {
      await fetch(`/api/complaints/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      fetchComplaints();
    } catch (error) { console.error(error); }
    setUpdating(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengaduan ini?")) return;
    try { await fetch(`/api/complaints/${id}`, { method: "DELETE" }); fetchComplaints(); } catch (e) { console.error(e); }
  };

  const handleSpamToggle = async (id: number, currentSpam: number) => {
    try {
      await fetch(`/api/complaints/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_spam: !currentSpam }) });
      fetchComplaints();
    } catch (e) { console.error(e); }
  };

  const handleSendReply = async (id: number) => {
    if (!replyText.trim()) return;
    setReplySending(true); setReplyResult(null);
    try {
      const res = await fetch(`/api/complaints/${id}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyMessage: replyText, replyTitle: replyTitle.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplyResult({ id, type: "success", message: data.data?.emailSent ? "✓ Balasan berhasil dikirim ke email pengadu" : "✓ Status diperbarui (email belum dikonfigurasi)" });
        setReplyText(""); setReplyTitle(""); setReplyingId(null); fetchComplaints();
      } else {
        setReplyResult({ id, type: "error", message: data.message || "Gagal mengirim balasan" });
      }
    } catch { setReplyResult({ id, type: "error", message: "Gagal mengirim balasan." }); }
    setReplySending(false);
  };

  const parseAttachments = (attachStr: string) => {
    try { const parsed = JSON.parse(attachStr); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-500" />;
    if (type?.startsWith('video/')) return <FileVideo className="w-4 h-4 text-purple-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-3xl max-h-[80vh]">
            <button onClick={() => setPreviewImg(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300"><X className="w-6 h-6" /></button>
            <img src={previewImg} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Pengaduan</p>
            <p className="text-3xl font-extrabold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm border-l-4 border-l-amber-400">
            <p className="text-xs font-semibold text-amber-600 mb-1">Menunggu Proses</p>
            <p className="text-3xl font-extrabold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm border-l-4 border-l-green-500">
            <p className="text-xs font-semibold text-green-600 mb-1">Sudah Diproses</p>
            <p className="text-3xl font-extrabold text-gray-900">{stats.processed}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {["", "pending", "processed"].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${statusFilter === s ? "bg-[#1E3A8A] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            {s === "" ? "Semua" : s === "pending" ? "⏳ Pending" : "✅ Processed"}
          </button>
        ))}
      </div>

      {/* Complaints List */}
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
            {complaints.map((item) => {
              const isExpanded = expandedId === item.id;
              const ticketNumber = `#PKD-${String(item.id).padStart(5, "0")}`;
              const attachmentList = parseAttachments(item.attachments);
              return (
                <div key={item.id} className={`hover:bg-gray-50/50 transition-colors ${item.is_spam ? 'bg-red-50/30' : ''}`}>
                  <div className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 cursor-pointer"
                    onClick={() => { setExpandedId(isExpanded ? null : item.id); setReplyingId(null); setReplyText(""); setReplyTitle(""); setReplyResult(null); }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.is_spam ? 'bg-red-50 text-red-500' : item.status === "pending" ? "bg-amber-50 text-amber-500" : "bg-green-50 text-green-500"}`}>
                      {item.is_spam ? <ShieldAlert className="w-5 h-5" /> : item.status === "pending" ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-400">{ticketNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          {item.status === "pending" ? "PENDING" : "PROCESSED"}
                        </span>
                        {item.is_spam ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">SPAM</span> : null}
                        {attachmentList.length > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Paperclip className="w-3 h-3" />{attachmentList.length}</span>}
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
                      <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Isi Pengaduan</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                        </div>

                        {/* Attachments */}
                        {attachmentList.length > 0 && (
                          <div className="mb-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Lampiran ({attachmentList.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {attachmentList.map((att: any, idx: number) => (
                                <div key={idx} className="group">
                                  {att.type?.startsWith('image/') ? (
                                    <button onClick={() => setPreviewImg(att.data)} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#1E3A8A]/40 transition-colors">
                                      <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                                    </button>
                                  ) : att.type?.startsWith('video/') ? (
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                                      <FileVideo className="w-6 h-6 text-purple-400" />
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-xs border border-gray-200">
                                      {getFileIcon(att.type)} <span className="truncate max-w-[120px]">{att.name}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reply Result */}
                        {replyResult && replyResult.id === item.id && (
                          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${replyResult.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            {replyResult.message}
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingId === item.id && (
                          <div className="mb-4 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquareReply className="w-4 h-4 text-[#1E3A8A]" />
                              <p className="text-xs font-bold text-[#1E3A8A]">Balas ke: {item.email}</p>
                            </div>
                            <input type="text" value={replyTitle} onChange={(e) => setReplyTitle(e.target.value)}
                              placeholder="Judul balasan (opsional)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40 focus:ring-2 focus:ring-[#1E3A8A]/10 bg-white" />
                            <textarea rows={5} value={replyText} onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Tulis isi balasan resmi Disnakertrans..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/40 focus:ring-2 focus:ring-[#1E3A8A]/10 resize-none bg-white" />
                            <div className="flex items-center gap-3 flex-wrap">
                              <button onClick={() => handleSendReply(item.id)} disabled={replySending || !replyText.trim()}
                                className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#172554] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {replySending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Mengirim...</> : <><Send className="w-3.5 h-3.5" />Kirim Balasan ke Email</>}
                              </button>
                              <button onClick={() => { setReplyingId(null); setReplyText(""); setReplyTitle(""); }} className="text-gray-500 hover:text-gray-700 text-xs font-medium px-3 py-2.5">Batal</button>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {replyingId !== item.id && (
                            <button onClick={(e) => { e.stopPropagation(); setReplyingId(item.id); setReplyText(""); setReplyTitle(""); setReplyResult(null); }}
                              className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#172554] transition-colors flex items-center gap-2">
                              <MessageSquareReply className="w-3.5 h-3.5" /> Balas
                            </button>
                          )}
                          {item.status === "pending" ? (
                            <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, "processed"); }} disabled={updating === item.id}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {updating === item.id ? "..." : "Proses"}
                            </button>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, "pending"); }} disabled={updating === item.id}
                              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleSpamToggle(item.id, item.is_spam); }}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${item.is_spam ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
                            {item.is_spam ? <><ShieldCheck className="w-3.5 h-3.5" /> Bukan Spam</> : <><ShieldAlert className="w-3.5 h-3.5" /> Tandai Spam</>}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
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
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">← Sebelumnya</button>
            <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">Selanjutnya →</button>
          </div>
        )}
      </div>
    </div>
  );
}
