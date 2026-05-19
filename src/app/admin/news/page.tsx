"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, Clock, Search, X, RefreshCw, Pencil, ImagePlus, Save, Link2 } from "lucide-react";

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

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<NewsItem>>({});
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    thumbnail: "",
    category: "Umum",
    date: new Date().toISOString().slice(0, 16),
    link_url: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string>("");

  const perPage = 10;

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), perPage: perPage.toString() });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      setNews(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => { fetchNews(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchNews(); };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (isEdit) { setEditPhotoFile(file); setEditPhotoPreview(url); }
    else { setPhotoFile(file); setPhotoPreview(url); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let thumbnailUrl = formData.thumbnail;
      if (photoFile) {
        thumbnailUrl = await fileToBase64(photoFile);
      }
      await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, thumbnail: thumbnailUrl, date: new Date(formData.date).toISOString() }),
      });
      setIsAdding(false);
      setFormData({ title: "", description: "", content: "", thumbnail: "", category: "Umum", date: new Date().toISOString().slice(0, 16), link_url: "" });
      setPhotoFile(null); setPhotoPreview("");
      fetchNews();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus berita ini?")) return;
    try { await fetch(`/api/news/${id}`, { method: "DELETE" }); fetchNews(); } catch (e) { console.error(e); }
  };

  const handleScrape = async () => {
    setScraping(true); setScrapeResult(null);
    try {
      const res = await fetch("/api/scraper/run?pages=3", { method: "POST" });
      const data = await res.json();
      setScrapeResult(`✓ Selesai — ${data.data?.newArticles || 0} berita baru ditambahkan`);
      fetchNews();
    } catch { setScrapeResult("✗ Gagal menjalankan scraper"); }
    setScraping(false);
  };

  const startEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setEditData({ title: item.title, description: item.description, content: item.content || "", category: item.category || "Umum", thumbnail: item.thumbnail || "", date: item.date ? new Date(item.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16), link_url: (item as any).link_url || "" });
    setEditPhotoFile(null); setEditPhotoPreview("");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      let thumbnailUrl = editData.thumbnail;
      if (editPhotoFile) { thumbnailUrl = await fileToBase64(editPhotoFile); }
      await fetch(`/api/news/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editData, thumbnail: thumbnailUrl, date: editData.date ? new Date(editData.date).toISOString() : undefined }),
      });
      setEditingId(null); setEditData({}); setEditPhotoFile(null); setEditPhotoPreview("");
      fetchNews();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const totalPages = Math.ceil(total / perPage);
  const categories = ["Umum","Sekretariat","Bidang Binapenta","Bidang HI & Jamsostek","Bidang Lattas","Bidang Transmigrasi","Informasi Lowongan Pekerjaan"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAdding(!isAdding)} className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#172554] transition-colors text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Tambah Berita
          </button>
          <button onClick={handleScrape} disabled={scraping} className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 shadow-sm">
            <RefreshCw className={`w-4 h-4 ${scraping ? "animate-spin" : ""}`} />
            {scraping ? "Scraping..." : "Tarik dari Website"}
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari berita..." className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-64 outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10" />
          </div>
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Cari</button>
        </form>
      </div>

      {scrapeResult && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between ${scrapeResult.startsWith("✓") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          <span>{scrapeResult}</span>
          <button onClick={() => setScrapeResult(null)} className="hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Tulis Berita Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Berita *</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10" placeholder="Masukkan judul berita" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10 bg-white">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Singkat *</label>
              <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10 resize-y" placeholder="Ringkasan singkat berita..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal & Waktu Publish</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10" />
              </div>
            </div>
            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Foto Berita</label>
              <div className="flex items-start gap-4">
                <label className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#1E3A8A]/30 transition-colors bg-gray-50 overflow-hidden shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-400 font-medium">Upload Foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e)} className="hidden" />
                </label>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Atau masukkan URL gambar</label>
                  <input type="url" value={formData.thumbnail} onChange={(e) => { setFormData({ ...formData, thumbnail: e.target.value }); setPhotoFile(null); setPhotoPreview(""); }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10" placeholder="https://example.com/image.jpg" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Konten Berita *</label>
              <textarea required rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10 resize-none" placeholder="Tulis isi berita lengkap di sini..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Link Terkait</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="url" value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10" placeholder="https://bit.ly/contoh atau https://example.com" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Opsional. Link ini akan ditampilkan sebagai tombol di halaman berita.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors">Batal</button>
              <button type="submit" className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors">Simpan & Terbitkan</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-[#1E3A8A]/20">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Pencil className="w-4 h-4" /> Edit Berita</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul</label>
                <input type="text" value={editData.title || ""} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori</label>
                <select value={editData.category || "Umum"} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10 bg-white">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi</label>
              <textarea rows={4} value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10 resize-y" placeholder="Deskripsi berita..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal & Waktu Publish</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="datetime-local" value={editData.date || ""} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Foto</label>
              <div className="flex items-start gap-4">
                <label className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#1E3A8A]/30 transition-colors bg-gray-50 overflow-hidden shrink-0">
                  {(editPhotoPreview || editData.thumbnail) ? (
                    <img src={editPhotoPreview || editData.thumbnail || ""} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <><ImagePlus className="w-6 h-6 text-gray-400 mb-1" /><span className="text-[10px] text-gray-400">Upload</span></>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, true)} className="hidden" />
                </label>
                <div className="flex-1">
                  <input type="url" value={editData.thumbnail || ""} onChange={(e) => { setEditData({ ...editData, thumbnail: e.target.value }); setEditPhotoFile(null); setEditPhotoPreview(""); }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30" placeholder="URL gambar" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Konten</label>
              <textarea rows={8} value={editData.content || ""} onChange={(e) => setEditData({ ...editData, content: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Link Terkait</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="url" value={(editData as any).link_url || ""} onChange={(e) => setEditData({ ...editData, link_url: e.target.value } as any)} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-1 focus:ring-[#1E3A8A]/10" placeholder="https://bit.ly/contoh atau https://example.com" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Opsional. Link ini akan ditampilkan sebagai tombol di halaman berita.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setEditingId(null); setEditData({}); }} className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl">Batal</button>
              <button onClick={handleSaveEdit} disabled={saving} className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Menampilkan <span className="font-semibold text-gray-900">{news.length}</span> dari <span className="font-semibold text-gray-900">{total}</span> berita</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3.5 font-semibold">Berita</th>
                  <th className="px-6 py-3.5 font-semibold w-36">Kategori</th>
                  <th className="px-6 py-3.5 font-semibold w-36">Tanggal</th>
                  <th className="px-6 py-3.5 font-semibold w-32">Sumber</th>
                  <th className="px-6 py-3.5 font-semibold w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">Belum ada berita.</td></tr>
                ) : (
                  news.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.thumbnail && <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-md">{item.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-sm mt-0.5">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="inline-block bg-gray-100 text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-full">{item.category || "Umum"}</span></td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400"><Clock className="w-3 h-3" />{new Date(item.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">{item.source_name || "Manual"}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => startEdit(item)} className="text-blue-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Edit berita"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Hapus berita"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">← Sebelumnya</button>
            <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">Selanjutnya →</button>
          </div>
        )}
      </div>
    </div>
  );
}
