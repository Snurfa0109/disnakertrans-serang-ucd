"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Plus, Pencil, Trash2, Check, X, Search, Filter, Eye, EyeOff, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIES = ["AK1", "Pengaduan", "Pelatihan", "Lowongan Kerja", "Hubungan Industrial", "Umum"] as const;
type Category = typeof CATEGORIES[number];

interface FAQ {
  id: number; question: string; answer: string; category: Category;
  status: "published" | "draft"; sort_order: number; created_at: string; updated_at: string;
}

const CAT_COLORS: Record<Category, string> = {
  "AK1": "bg-blue-100 text-blue-700",
  "Pengaduan": "bg-rose-100 text-rose-700",
  "Pelatihan": "bg-purple-100 text-purple-700",
  "Lowongan Kerja": "bg-green-100 text-green-700",
  "Hubungan Industrial": "bg-orange-100 text-orange-700",
  "Umum": "bg-gray-100 text-gray-700",
};

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editFaq, setEditFaq] = useState<FAQ | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ question: "", answer: "", category: "Umum" as Category, status: "draft" as "published" | "draft", sort_order: 0 });
  const perPage = 15;

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFaqs = async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (catFilter) params.set("category", catFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/faq?${params}`);
    const data = await res.json();
    let items: FAQ[] = data.data || [];
    if (search) items = items.filter(f => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()));
    setFaqs(items);
    setTotal(data.meta?.total || 0);
    setIsLoading(false);
  };

  useEffect(() => { fetchFaqs(); }, [page, catFilter, statusFilter]);
  useEffect(() => { const t = setTimeout(fetchFaqs, 300); return () => clearTimeout(t); }, [search]);

  const openCreate = () => { setEditFaq(null); setForm({ question: "", answer: "", category: "Umum", status: "draft", sort_order: 0 }); setShowForm(true); };
  const openEdit = (f: FAQ) => { setEditFaq(f); setForm({ question: f.question, answer: f.answer, category: f.category as Category, status: f.status, sort_order: f.sort_order }); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = editFaq ? `/api/admin/faq/${editFaq.id}` : "/api/admin/faq";
      const method = editFaq ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); showToast("error", d.message || "Gagal"); }
      else { showToast("success", editFaq ? "FAQ diperbarui" : "FAQ ditambahkan"); setShowForm(false); fetchFaqs(); }
    } catch { showToast("error", "Terjadi kesalahan"); }
    setSaving(false);
  };

  const handleDelete = async (f: FAQ) => {
    if (!confirm(`Hapus FAQ ini?`)) return;
    const res = await fetch(`/api/admin/faq/${f.id}`, { method: "DELETE" });
    if (res.ok) { showToast("success", "FAQ dihapus"); fetchFaqs(); }
    else showToast("error", "Gagal menghapus");
  };

  const handleToggleStatus = async (f: FAQ) => {
    const newStatus = f.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/admin/faq/${f.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) { showToast("success", newStatus === "published" ? "FAQ dipublish" : "FAQ dijadikan draft"); fetchFaqs(); }
  };

  const publishedCount = faqs.filter(f => f.status === "published").length;
  const draftCount = faqs.filter(f => f.status === "draft").length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><HelpCircle className="w-6 h-6 text-[#1E3A8A]" />Manajemen FAQ</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola pertanyaan & jawaban untuk halaman publik.</p>
        </div>
        <button onClick={openCreate} className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />Tambah FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><p className="text-2xl font-extrabold text-gray-900">{total}</p><p className="text-xs text-gray-500 mt-0.5">Total FAQ</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm border-l-4 border-l-green-500"><p className="text-2xl font-extrabold text-gray-900">{publishedCount}</p><p className="text-xs text-green-600 font-semibold mt-0.5">Published</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm border-l-4 border-l-amber-400"><p className="text-2xl font-extrabold text-gray-900">{draftCount}</p><p className="text-xs text-amber-600 font-semibold mt-0.5">Draft</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm border-l-4 border-l-blue-500"><p className="text-2xl font-extrabold text-gray-900">{CATEGORIES.length}</p><p className="text-xs text-blue-600 font-semibold mt-0.5">Kategori</p></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari pertanyaan..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
          <option value="">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" /></div>
        ) : faqs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Belum ada FAQ. Klik "Tambah FAQ" untuk menambahkan.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {faqs.map(f => {
              const isExpanded = expandedId === f.id;
              return (
                <div key={f.id} className="group">
                  <div className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : f.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CAT_COLORS[f.category as Category] || "bg-gray-100 text-gray-700"}`}>{f.category}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${f.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {f.status === "published" ? "✓ Published" : "Draft"}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{f.question}</p>
                      {!isExpanded && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{f.answer}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={e => { e.stopPropagation(); openEdit(f); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={e => { e.stopPropagation(); handleToggleStatus(f); }} className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${f.status === "published" ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                        {f.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(f); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-4 ml-0">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Jawaban</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{f.answer}</p>
                        <p className="text-[10px] text-gray-400 mt-3">Diperbarui: {new Date(f.updated_at).toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {Math.ceil(total / perPage) > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">← Sebelumnya</button>
            <span className="text-sm text-gray-500">Halaman {page} dari {Math.ceil(total / perPage)}</span>
            <button onClick={() => setPage(p => Math.min(Math.ceil(total / perPage), p + 1))} disabled={page >= Math.ceil(total / perPage)} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">Selanjutnya →</button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">{editFaq ? "Edit FAQ" : "Tambah FAQ Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pertanyaan *</label>
                <input required type="text" value={form.question} onChange={e => setForm({...form, question: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10"
                  placeholder="Tulis pertanyaan..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jawaban *</label>
                <textarea required rows={5} value={form.answer} onChange={e => setForm({...form, answer: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10 resize-none"
                  placeholder="Tulis jawaban lengkap..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value as Category})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as "published" | "draft"})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</> : <><Check className="w-4 h-4" />{editFaq ? "Simpan Perubahan" : "Tambah FAQ"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
