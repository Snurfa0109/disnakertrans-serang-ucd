"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, Calendar, Clock, Search, X, RefreshCw, Pencil,
  ImagePlus, Save, Link2, Check, AlertCircle, Newspaper, Filter,
  ChevronLeft, ChevronRight, Tag,
} from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  description: string;
  content: string | null;
  category: string | null;
  thumbnail: string | null;
  source_name: string | null;
  link_url: string | null;
  date: string;
}

const CATEGORIES = [
  "Umum",
  "Sekretariat",
  "Bidang Binapenta",
  "Bidang HI & Jamsostek",
  "Bidang Lattas",
  "Bidang Transmigrasi",
  "Informasi Lowongan Pekerjaan",
];

const CAT_COLORS: Record<string, string> = {
  "Umum": "bg-gray-100 text-gray-700",
  "Sekretariat": "bg-blue-100 text-blue-700",
  "Bidang Binapenta": "bg-cyan-100 text-cyan-700",
  "Bidang HI & Jamsostek": "bg-rose-100 text-rose-700",
  "Bidang Lattas": "bg-purple-100 text-purple-700",
  "Bidang Transmigrasi": "bg-green-100 text-green-700",
  "Informasi Lowongan Pekerjaan": "bg-amber-100 text-amber-700",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  thumbnail: "",
  category: "Umum",
  date: new Date().toISOString().slice(0, 16),
  link_url: "",
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const perPage = 10;

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), perPage: perPage.toString() });
      if (searchQuery) params.set("search", searchQuery);
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      setNews(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }, [page, searchQuery, categoryFilter]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const openCreate = () => {
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview("");
    setShowModal(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content || "",
      thumbnail: item.thumbnail || "",
      category: item.category || "Umum",
      date: item.date ? new Date(item.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      link_url: (item as any).link_url || "",
    });
    setPhotoFile(null);
    setPhotoPreview("");
    setShowModal(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFormData(f => ({ ...f, thumbnail: "" })); // clear URL if file selected
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let thumbnailUrl = formData.thumbnail;
      if (photoFile) thumbnailUrl = await fileToBase64(photoFile);

      const payload = { ...formData, thumbnail: thumbnailUrl, date: new Date(formData.date).toISOString() };

      const res = editItem
        ? await fetch(`/api/news/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      if (!res.ok) {
        const d = await res.json();
        showToast("error", d.message || "Gagal menyimpan berita");
      } else {
        showToast("success", editItem ? "Berita berhasil diperbarui" : "Berita berhasil ditambahkan");
        setShowModal(false);
        setPage(1);
        fetchNews();
      }
    } catch {
      showToast("error", "Terjadi kesalahan, coba lagi");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus berita ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await fetch(`/api/news/${id}`, { method: "DELETE" });
      showToast("success", "Berita berhasil dihapus");
      fetchNews();
    } catch {
      showToast("error", "Gagal menghapus berita");
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch("/api/scraper/run?pages=3", { method: "POST" });
      const data = await res.json();
      const count = data.data?.newArticles || 0;
      setScrapeResult(`✓ Selesai — ${count} berita baru ditambahkan`);
      if (count > 0) fetchNews();
    } catch {
      setScrapeResult("✗ Gagal menjalankan scraper");
    }
    setScraping(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#1E3A8A]" /> Kelola Berita
          </h2>
          <p className="text-sm text-gray-500 mt-1">Kelola semua berita dan artikel website Disnakertrans.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${scraping ? "animate-spin" : ""}`} />
            {scraping ? "Scraping..." : "Tarik dari Website"}
          </button>
          <button
            onClick={openCreate}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#172554] transition-colors text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Berita
          </button>
        </div>
      </div>

      {scrapeResult && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between ${scrapeResult.startsWith("✓") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          <span>{scrapeResult}</span>
          <button onClick={() => setScrapeResult(null)} className="hover:opacity-70 ml-3"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search + Category Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau deskripsi berita..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10"
            />
          </div>
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">Cari</button>
        </form>
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30 bg-white"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(searchQuery || categoryFilter) && (
          <button
            onClick={() => { setSearchQuery(""); setCategoryFilter(""); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setCategoryFilter(""); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!categoryFilter ? "bg-[#0A192F] text-white border-[#0A192F]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
        >
          Semua ({total})
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setCategoryFilter(cat); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${categoryFilter === cat ? "bg-[#0A192F] text-white border-[#0A192F]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold text-gray-900">{news.length}</span> dari{" "}
            <span className="font-semibold text-gray-900">{total}</span> berita
            {categoryFilter && <span className="ml-1 text-[#1E3A8A] font-semibold">· {categoryFilter}</span>}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3.5 font-semibold">Berita</th>
                  <th className="px-6 py-3.5 font-semibold w-44">Kategori</th>
                  <th className="px-6 py-3.5 font-semibold w-36">Tanggal</th>
                  <th className="px-6 py-3.5 font-semibold w-28">Sumber</th>
                  <th className="px-6 py-3.5 font-semibold w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    <Newspaper className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    {categoryFilter ? `Belum ada berita kategori "${categoryFilter}"` : "Belum ada berita."}
                  </td></tr>
                ) : (
                  news.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Newspaper className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-md">{item.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-sm mt-0.5">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${CAT_COLORS[item.category || "Umum"] || "bg-gray-100 text-gray-700"}`}>
                          {item.category || "Umum"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock className="w-3 h-3 shrink-0" />
                            {new Date(item.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">{item.source_name || "Manual"}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Edit berita">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Hapus berita">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL: Create / Edit ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                {editItem ? <Pencil className="w-4 h-4 text-[#1E3A8A]" /> : <Plus className="w-4 h-4 text-[#1E3A8A]" />}
                {editItem ? "Edit Berita" : "Tambah Berita Baru"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Title + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Berita *</label>
                  <input
                    required type="text" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10"
                    placeholder="Masukkan judul berita"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    <Tag className="w-3 h-3 inline mr-1" />Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10 bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    <Clock className="w-3 h-3 inline mr-1" />Tanggal & Waktu Publish
                  </label>
                  <input
                    type="datetime-local" value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Singkat *</label>
                <textarea
                  required rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10 resize-none"
                  placeholder="Ringkasan singkat berita (tampil di daftar berita)..."
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Foto Berita</label>
                <div className="flex items-start gap-4">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#1E3A8A]/40 transition-colors bg-gray-50 overflow-hidden shrink-0">
                    {photoPreview || formData.thumbnail ? (
                      <img src={photoPreview || formData.thumbnail} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <>
                        <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-400 font-medium">Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] text-gray-500 font-medium">Atau masukkan URL gambar</p>
                    <input
                      type="url" value={formData.thumbnail}
                      onChange={(e) => { setFormData({ ...formData, thumbnail: e.target.value }); setPhotoFile(null); setPhotoPreview(""); }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30"
                      placeholder="https://example.com/image.jpg"
                    />
                    {(photoPreview || formData.thumbnail) && (
                      <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(""); setFormData(f => ({ ...f, thumbnail: "" })); }}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                        <X className="w-3 h-3" /> Hapus gambar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Konten Berita *</label>
                <textarea
                  required rows={7}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10 resize-y"
                  placeholder="Tulis isi berita lengkap di sini..."
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Link Terkait (opsional)</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url" value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10"
                    placeholder="https://bit.ly/contoh"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Link ditampilkan sebagai tombol di halaman detail berita.</p>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 disabled:opacity-50">
                  {saving ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4" /> {editItem ? "Simpan Perubahan" : "Terbitkan Berita"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
