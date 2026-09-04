"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Pencil, X, Save, Search, Check, AlertCircle,
  CalendarDays, MapPin, Clock, ExternalLink, RefreshCw,
  ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Users,
} from "lucide-react";

interface Event {
  id: number;
  title: string;
  location: string;
  date: string;
  time_start: string;
  time_end: string;
  organizer: string;
  link_url: string;
  is_active: number;
  created_at: string;
}

const EMPTY_FORM = {
  title: "", location: "", date: "", time_start: "08:00",
  time_end: "Selesai", organizer: "Disnakertrans Kab. Serang", link_url: "",
};

export default function AdminEventsPage() {
  const [data, setData] = useState<Event[]>([]);
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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/events?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.meta?.total || 0);
    } catch { showToast("error", "Gagal memuat data"); }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, debouncedSearch]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleOpenAdd = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const handleOpenEdit = (item: Event) => {
    setEditId(item.id);
    setForm({
      title: item.title, location: item.location, date: item.date,
      time_start: item.time_start || "08:00", time_end: item.time_end || "Selesai",
      organizer: item.organizer || "Disnakertrans Kab. Serang", link_url: item.link_url || "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.date) return showToast("error", "Judul, lokasi, dan tanggal wajib diisi");
    setSaving(true);
    try {
      const url = editId ? `/api/admin/events/${editId}` : "/api/admin/events";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) {
        showToast("success", editId ? "Event berhasil diperbarui" : "Event berhasil ditambahkan");
        setShowForm(false);
        fetchData();
      } else {
        showToast("error", json.error || "Terjadi kesalahan");
      }
    } catch { showToast("error", "Terjadi kesalahan"); }
    setSaving(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus event "${title}"?`)) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if ((await res.json()).success) { showToast("success", "Event dihapus"); fetchData(); }
    else showToast("error", "Gagal menghapus");
  };

  const handleToggleActive = async (item: Event) => {
    await fetch(`/api/admin/events/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, is_active: item.is_active ? 0 : 1 }),
    });
    fetchData();
  };

  const isDatePast = (dateStr: string) => {
    try { return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0)); } catch { return false; }
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
            <CalendarDays className="w-6 h-6 text-[#1E3A8A]" /> Kelola Event & Agenda
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} event tersedia di database</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={handleOpenAdd}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Event
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari berdasarkan judul atau lokasi..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E3A8A]/40 bg-white" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editId ? "Edit Event" : "Tambah Event Baru"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nama Event *</label>
                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                  placeholder="Job Fair Serang 2026, Sosialisasi UMK, dll." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tanggal *</label>
                  <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Lokasi *</label>
                  <input required type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                    placeholder="GOR Serang, BLK, dll." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Waktu Mulai</label>
                  <input type="time" value={form.time_start} onChange={e => setForm({ ...form, time_start: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Waktu Selesai</label>
                  <input type="text" value={form.time_end} onChange={e => setForm({ ...form, time_end: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                    placeholder="16:00 / Selesai" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Penyelenggara</label>
                <input type="text" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                  placeholder="Disnakertrans Kab. Serang" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Link Info / Pendaftaran</label>
                <input type="url" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/40"
                  placeholder="https://..." />
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
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">Tidak ada event / agenda</p>
            <p className="text-xs mt-1">Klik "Tambah Event" untuk menambahkan agenda baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Tanggal & Waktu</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Penyelenggara</th>
                  <th className="text-center px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(item => (
                  <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors group ${isDatePast(item.date) ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#EFF6FF] border border-blue-100 rounded-lg p-2 text-center min-w-[44px] shrink-0">
                          <p className="text-[9px] font-bold text-blue-400 uppercase">
                            {(() => { try { return new Date(item.date).toLocaleDateString("id-ID", { month: "short" }).toUpperCase(); } catch { return ""; } })()}
                          </p>
                          <p className="text-base font-bold text-[#1E3A8A] -mt-0.5">
                            {(() => { try { return new Date(item.date).getDate(); } catch { return ""; } })()}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate max-w-[240px]">{item.title}</p>
                            {isDatePast(item.date) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 shrink-0">SELESAI</span>}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" /> {item.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-gray-700 font-medium">
                        {(() => { try { return new Date(item.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" }); } catch { return item.date; } })()}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {item.time_start} — {item.time_end}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3 h-3 shrink-0" /> {item.organizer}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => handleToggleActive(item)} title={item.is_active ? "Nonaktifkan" : "Aktifkan"}>
                        {item.is_active ? (
                          <ToggleRight className="w-6 h-6 text-green-500 hover:text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.link_url && (
                          <a href={item.link_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
            <span className="text-xs text-gray-500">{total} total event</span>
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
