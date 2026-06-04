"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, Check, X, Eye, EyeOff, Clock, AlertCircle, Link2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";

const CATEGORIES = ["AK1", "Pengaduan", "Pelatihan", "Lowongan Kerja", "Hubungan Industrial", "Umum"] as const;
type Category = typeof CATEGORIES[number];

interface TutorialStep { title: string; content: string; }
interface Tutorial {
  id: number; title: string; slug: string; category: string;
  thumbnail: string | null; steps: string; estimated_duration: string;
  cta_link: string | null; cta_text: string; status: "published" | "draft";
  created_at: string; updated_at: string;
}

const EMPTY_FORM = {
  title: "", slug: "", category: "Umum" as Category, thumbnail: "",
  steps: [{ title: "", content: "" }] as TutorialStep[],
  estimated_duration: "10 menit", cta_link: "", cta_text: "Mulai Sekarang", status: "draft" as "published" | "draft",
};

const CAT_COLORS: Record<string, string> = {
  "AK1": "bg-blue-100 text-blue-700", "Pengaduan": "bg-rose-100 text-rose-700",
  "Pelatihan": "bg-purple-100 text-purple-700", "Lowongan Kerja": "bg-green-100 text-green-700",
  "Hubungan Industrial": "bg-orange-100 text-orange-700", "Umum": "bg-gray-100 text-gray-700",
};

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editTutorial, setEditTutorial] = useState<Tutorial | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const perPage = 12;

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3000);
  };

  const fetchTutorials = async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (catFilter) params.set("category", catFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/tutorials?${params}`);
    const data = await res.json();
    setTutorials(data.data || []);
    setTotal(data.meta?.total || 0);
    setIsLoading(false);
  };

  useEffect(() => { fetchTutorials(); }, [page, catFilter, statusFilter]);

  const openCreate = () => { setEditTutorial(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (t: Tutorial) => {
    setEditTutorial(t);
    let parsedSteps: TutorialStep[] = [];
    try { parsedSteps = JSON.parse(t.steps); } catch { parsedSteps = []; }
    setForm({ title: t.title, slug: t.slug, category: t.category as Category, thumbnail: t.thumbnail || "", steps: parsedSteps.length > 0 ? parsedSteps : [{ title: "", content: "" }], estimated_duration: t.estimated_duration, cta_link: t.cta_link || "", cta_text: t.cta_text, status: t.status });
    setShowForm(true);
  };

  const autoSlug = (title: string) => title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, steps: form.steps.filter(s => s.title || s.content) };
      const url = editTutorial ? `/api/admin/tutorials/${editTutorial.id}` : "/api/admin/tutorials";
      const method = editTutorial ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); showToast("error", d.message || "Gagal"); }
      else { showToast("success", editTutorial ? "Tutorial diperbarui" : "Tutorial ditambahkan"); setShowForm(false); fetchTutorials(); }
    } catch { showToast("error", "Terjadi kesalahan"); }
    setSaving(false);
  };

  const handleDelete = async (t: Tutorial) => {
    if (!confirm(`Hapus tutorial "${t.title}"?`)) return;
    const res = await fetch(`/api/admin/tutorials/${t.id}`, { method: "DELETE" });
    if (res.ok) { showToast("success", "Tutorial dihapus"); fetchTutorials(); }
    else showToast("error", "Gagal menghapus");
  };

  const handleToggleStatus = async (t: Tutorial) => {
    const newStatus = t.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/admin/tutorials/${t.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) { showToast("success", newStatus === "published" ? "Tutorial dipublish" : "Dijadikan draft"); fetchTutorials(); }
  };

  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, { title: "", content: "" }] }));
  const removeStep = (i: number) => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  const updateStep = (i: number, field: "title" | "content", val: string) =>
    setForm(f => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));
  const moveStep = (i: number, dir: "up" | "down") =>
    setForm(f => {
      const steps = [...f.steps];
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= steps.length) return f;
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...f, steps };
    });

  const parseSteps = (s: string): TutorialStep[] => { try { return JSON.parse(s); } catch { return []; } };

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
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><BookOpen className="w-6 h-6 text-[#1E3A8A]" />Tutorial Layanan</h2>
          <p className="text-sm text-gray-500 mt-1">Panduan langkah demi langkah untuk layanan Disnakertrans.</p>
        </div>
        <button onClick={openCreate} className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />Tambah Tutorial
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30 flex-1">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
          <option value="">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" /></div>
      ) : tutorials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
          Belum ada tutorial. Klik "Tambah Tutorial" untuk membuat panduan pertama.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutorials.map(t => {
            const steps = parseSteps(t.steps);
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                {t.thumbnail ? (
                  <div className="h-36 overflow-hidden bg-gray-100">
                    <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-[#0A192F] to-[#1E3A8A] flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-white/20" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CAT_COLORS[t.category] || "bg-gray-100 text-gray-700"}`}>{t.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {t.status === "published" ? "✓ Live" : "Draft"}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{t.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.estimated_duration}</span>
                    <span>{steps.length} langkah</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => openEdit(t)} className="flex-1 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Pencil className="w-3 h-3" />Edit
                    </button>
                    <button onClick={() => handleToggleStatus(t)} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${t.status === "published" ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                      {t.status === "published" ? <><EyeOff className="w-3 h-3" />Draft</> : <><Eye className="w-3 h-3" />Publish</>}
                    </button>
                    <button onClick={() => handleDelete(t)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tutorial Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900 text-lg">{editTutorial ? "Edit Tutorial" : "Tutorial Baru"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Tutorial *</label>
                  <input required type="text" value={form.title}
                    onChange={e => setForm({...form, title: e.target.value, slug: autoSlug(e.target.value)})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10"
                    placeholder="Cara Membuat Kartu AK1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Slug (URL)</label>
                  <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30 font-mono text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value as Category})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estimasi Waktu</label>
                  <input type="text" value={form.estimated_duration} onChange={e => setForm({...form, estimated_duration: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30"
                    placeholder="15 menit" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as "published" | "draft"})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Thumbnail (gambar)</label>
                  <input type="text" value={form.thumbnail} onChange={e => setForm({...form, thumbnail: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30"
                    placeholder="https://... atau /uploads/..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">CTA Link</label>
                  <input type="text" value={form.cta_link} onChange={e => setForm({...form, cta_link: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30"
                    placeholder="/pengaduan" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Teks Tombol CTA</label>
                  <input type="text" value={form.cta_text} onChange={e => setForm({...form, cta_text: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30"
                    placeholder="Mulai Sekarang" />
                </div>
              </div>

              {/* Steps Editor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-gray-700">Langkah-Langkah *</label>
                  <button type="button" onClick={addStep} className="text-xs text-[#1E3A8A] font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Plus className="w-3 h-3" />Tambah Langkah
                  </button>
                </div>
                <div className="space-y-3">
                  {form.steps.map((step, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                        <input type="text" value={step.title} onChange={e => updateStep(i, "title", e.target.value)}
                          placeholder="Judul langkah..."
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30 bg-white" />
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => moveStep(i, "up")} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => moveStep(i, "down")} disabled={i === form.steps.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => removeStep(i)} disabled={form.steps.length === 1} className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <textarea rows={3} value={step.content} onChange={e => updateStep(i, "content", e.target.value)}
                        placeholder="Deskripsi langkah ini..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30 resize-none bg-white" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</> : <><Check className="w-4 h-4" />{editTutorial ? "Simpan" : "Buat Tutorial"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
