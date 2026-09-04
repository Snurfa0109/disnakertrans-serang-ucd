"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Pencil, X, Save, Search, Check, AlertCircle,
  Briefcase, Building2, MapPin, GraduationCap, Calendar, ExternalLink,
  ToggleLeft, ToggleRight, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";

interface Lowongan {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  education: string;
  deadline: string;
  salary: string;
  category: string;
  logo_url: string;
  source_url: string;
  is_active: number;
  created_at: string;
}

const EMPTY_FORM = {
  title: "", company: "", location: "Kabupaten Serang", job_type: "Full time",
  education: "SMA/SMK", deadline: "", salary: "", category: "Dalam Negeri",
  logo_url: "", source_url: "",
};

const JOB_TYPES = ["Full time", "Part time", "Kontrak", "Magang", "Freelance"];
const EDUCATIONS = ["SMA/SMK", "D1/D2", "D3", "S1", "S2", "Semua Jenjang"];
const CATEGORIES = ["Dalam Negeri", "Luar Negeri", "BUMN", "Pemerintah", "Swasta"];

export default function AdminLowonganPage() {
  const [data, setData] = useState<Lowongan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/lowongan?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.meta?.total || 0);
    } catch { showToast("error", "Gagal memuat data"); }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, debouncedSearch]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleOpenAdd = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const handleOpenEdit = (item: Lowongan) => {
    setEditId(item.id);
    setForm({
      title: item.title, company: item.company, location: item.location,
      job_type: item.job_type, education: item.education, deadline: item.deadline || "",
      salary: item.salary || "", category: item.category || "Dalam Negeri",
      logo_url: item.logo_url || "", source_url: item.source_url || "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company) return showToast("error", "Judul dan perusahaan wajib diisi");
    setSaving(true);
    try {
      const url = editId ? `/api/admin/lowongan/${editId}` : "/api/admin/lowongan";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        showToast("success", editId ? "Lowongan berhasil diperbarui" : "Lowongan berhasil ditambahkan");
        setShowForm(false);
        fetchData();
      } else {
        showToast("error", json.error || "Terjadi kesalahan");
      }
    } catch { showToast("error", "Terjadi kesalahan"); }
    setSaving(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus lowongan "${title}"?`)) return;
    const res = await fetch(`/api/admin/lowongan/${id}`, { method: "DELETE" });
    if ((await res.json()).success) { showToast("success", "Lowongan dihapus"); fetchData(); }
    else showToast("error", "Gagal menghapus");
  };

  const handleToggleActive = async (item: Lowongan) => {
    await fetch(`/api/admin/lowongan/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, is_active: item.is_active ? 0 : 1 }),
    });
    fetchData();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#1E3A8A]" /> Kelola Lowongan Kerja
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} lowongan tersedia di database</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Lowongan
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari berdasarkan judul atau perusahaan..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E3A8A]/40 bg-white"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editId ? "Edit Lowongan" : "Tambah Lowongan Baru"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Judul Posisi *</label>
                  <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                    placeholder="Operator Produksi, Staff Admin, dll." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nama Perusahaan *</label>
                  <input required type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                    placeholder="PT. Contoh Indonesia" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Lokasi</label>
                  <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                    placeholder="Kabupaten Serang" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tipe Pekerjaan</label>
                  <select value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40 bg-white">
                    {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Pendidikan Min.</label>
                  <select value={form.education} onChange={e => setForm({ ...form, education: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40 bg-white">
                    {EDUCATIONS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40 bg-white">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Deadline Lamaran</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Gaji / Tunjangan</label>
                  <input type="text" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                    placeholder="Rp 3.500.000 - Rp 5.000.000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">URL Logo Perusahaan</label>
                  <input type="url" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                    placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Link Sumber / Daftar</label>
                  <input type="url" value={form.source_url} onChange={e => setForm({ ...form, source_url: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                    placeholder="https://karirhub.kemnaker.go.id/..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-xl">Batal</button>
                <button type="submit" disabled={saving}
                  className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">Tidak ada data lowongan</p>
            <p className="text-xs mt-1">Tambah lowongan baru atau gunakan scraper untuk import data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Posisi / Perusahaan</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Lokasi</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tipe</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Deadline</th>
                  <th className="text-center px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.logo_url ? (
                          <img src={item.logo_url} alt={item.company} className="w-8 h-8 rounded-lg object-contain border border-gray-100 shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#1E3A8A]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[200px]">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-gray-600 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" /> {item.location}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{item.job_type}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">{item.category}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {item.deadline ? new Date(item.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => handleToggleActive(item)} title={item.is_active ? "Nonaktifkan" : "Aktifkan"} className="transition-colors">
                        {item.is_active ? (
                          <ToggleRight className="w-6 h-6 text-green-500 hover:text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.source_url && (
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Sumber">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">{total} total lowongan</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700">Hal {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
