"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Calendar, Clock, Save, Pencil, X, MapPin, BarChart3, AlertCircle, Check,
} from "lucide-react";

interface JadwalItem {
  id: number;
  title: string;
  location: string;
  date: string;
  time_start: string;
  time_end: string;
  color: string;
  is_active: number;
}

interface StatItem {
  id: number;
  key: string;
  label: string;
  value: string;
  description: string;
  sort_order: number;
}

const STAT_COLORS = [
  { label: "Hijau", value: "bg-green-500" },
  { label: "Biru", value: "bg-blue-500" },
  { label: "Kuning", value: "bg-[#B45309]" },
  { label: "Navy", value: "bg-[#0A192F]" },
  { label: "Merah", value: "bg-red-500" },
  { label: "Ungu", value: "bg-purple-500" },
];

const EMPTY_STAT = { label: "", value: "", description: "" };

export default function AdminDataPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isAddingJadwal, setIsAddingJadwal] = useState(false);
  const [editingJadwalId, setEditingJadwalId] = useState<number | null>(null);
  const [editJadwal, setEditJadwal] = useState<Partial<JadwalItem>>({});
  const [savingStats, setSavingStats] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // New stat form
  const [showAddStat, setShowAddStat] = useState(false);
  const [newStat, setNewStat] = useState(EMPTY_STAT);
  const [addingStatLoading, setAddingStatLoading] = useState(false);

  const [jadwalForm, setJadwalForm] = useState({
    title: "", location: "", date: "", time_start: "08:00", time_end: "Selesai", color: "bg-green-500",
  });

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJadwal = async () => {
    try {
      const res = await fetch("/api/jadwal-pelatihan");
      const data = await res.json();
      setJadwal(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/statistik");
      const data = await res.json();
      setStats(data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchJadwal(); fetchStats(); }, []);

  // ── Jadwal CRUD ──────────────────────────────────────────
  const handleAddJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/jadwal-pelatihan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jadwalForm),
      });
      if (res.ok) {
        setIsAddingJadwal(false);
        setJadwalForm({ title: "", location: "", date: "", time_start: "08:00", time_end: "Selesai", color: "bg-green-500" });
        fetchJadwal();
        showToast("success", "Jadwal berhasil ditambahkan");
      } else {
        showToast("error", "Gagal menambahkan jadwal");
      }
    } catch { showToast("error", "Terjadi kesalahan"); }
  };

  const handleDeleteJadwal = async (id: number) => {
    if (!confirm("Hapus jadwal ini?")) return;
    await fetch(`/api/jadwal-pelatihan/${id}`, { method: "DELETE" });
    fetchJadwal();
    showToast("success", "Jadwal dihapus");
  };

  const startEditJadwal = (item: JadwalItem) => {
    setEditingJadwalId(item.id);
    setEditJadwal({ ...item });
  };

  const handleSaveEditJadwal = async () => {
    if (!editingJadwalId) return;
    const res = await fetch(`/api/jadwal-pelatihan/${editingJadwalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editJadwal),
    });
    if (res.ok) { showToast("success", "Jadwal berhasil diperbarui"); }
    else { showToast("error", "Gagal memperbarui jadwal"); }
    setEditingJadwalId(null);
    fetchJadwal();
  };

  // ── Statistik CRUD ───────────────────────────────────────
  const handleSaveStats = async () => {
    setSavingStats(true);
    try {
      const res = await fetch("/api/statistik", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: stats }),
      });
      if (res.ok) showToast("success", "Data statistik berhasil disimpan");
      else showToast("error", "Gagal menyimpan statistik");
    } catch { showToast("error", "Terjadi kesalahan"); }
    setSavingStats(false);
  };

  const updateStat = (id: number, field: string, value: string) => {
    setStats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStat.label || !newStat.value) return;
    setAddingStatLoading(true);
    try {
      // Auto-generate key from label
      const key = newStat.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + Date.now();
      const res = await fetch("/api/statistik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, label: newStat.label, value: newStat.value, description: newStat.description }),
      });
      if (res.ok) {
        showToast("success", "Statistik baru ditambahkan");
        setNewStat(EMPTY_STAT);
        setShowAddStat(false);
        fetchStats();
      } else {
        const d = await res.json();
        showToast("error", d.error || "Gagal menambahkan");
      }
    } catch { showToast("error", "Terjadi kesalahan"); }
    setAddingStatLoading(false);
  };

  const handleDeleteStat = async (id: number, label: string) => {
    if (!confirm(`Hapus statistik "${label}"? Data ini tidak dapat dikembalikan.`)) return;
    const res = await fetch(`/api/statistik?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast("success", "Statistik dihapus"); fetchStats(); }
    else showToast("error", "Gagal menghapus statistik");
  };

  const isDatePast = (dateStr: string) => {
    try { return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0)); } catch { return false; }
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ─── STATISTIK SECTION ─── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#1E3A8A]" /> Data Statistik
            </h2>
            <p className="text-xs text-gray-500 mt-1">Ubah data statistik yang tampil di halaman Informasi Publik.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddStat(!showAddStat)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
            <button
              onClick={handleSaveStats}
              disabled={savingStats}
              className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {savingStats ? "Menyimpan..." : "Simpan Semua"}
            </button>
          </div>
        </div>

        {/* Add new stat form */}
        {showAddStat && (
          <form onSubmit={handleAddStat} className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5 space-y-4">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Tambah Statistik Baru
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Label *</label>
                <input
                  required type="text" value={newStat.label}
                  onChange={e => setNewStat({ ...newStat, label: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30"
                  placeholder="Contoh: TKA Terdaftar"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nilai *</label>
                <input
                  required type="text" value={newStat.value}
                  onChange={e => setNewStat({ ...newStat, value: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-[#1E3A8A]/30"
                  placeholder="Contoh: 5.178.521 atau Rp 5,1 Juta"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Keterangan</label>
                <input
                  type="text" value={newStat.description}
                  onChange={e => setNewStat({ ...newStat, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30"
                  placeholder="Sub-teks/keterangan singkat"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowAddStat(false); setNewStat(EMPTY_STAT); }}
                className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg">Batal</button>
              <button type="submit" disabled={addingStatLoading}
                className="bg-[#1E3A8A] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#172554] disabled:opacity-50 flex items-center gap-2">
                {addingStatLoading ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Menambahkan...</> : <><Check className="w-3.5 h-3.5" />Tambahkan</>}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {stats.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Belum ada data statistik.</p>
          ) : (
            stats.map(s => (
              <div key={s.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Label</label>
                  <input
                    type="text" value={s.label}
                    onChange={e => updateStat(s.id, "label", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nilai</label>
                  <input
                    type="text" value={s.value}
                    onChange={e => updateStat(s.id, "value", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30 font-bold"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Keterangan</label>
                    <input
                      type="text" value={s.description}
                      onChange={e => updateStat(s.id, "description", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30"
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <button
                      onClick={() => handleDeleteStat(s.id, s.label)}
                      title="Hapus statistik ini"
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── JADWAL PELATIHAN SECTION ─── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1E3A8A]" /> Jadwal Pelatihan
            </h2>
            <p className="text-xs text-gray-500 mt-1">Kelola jadwal pelatihan yang tampil di halaman Informasi Publik.</p>
          </div>
          <button
            onClick={() => setIsAddingJadwal(!isAddingJadwal)}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Jadwal
          </button>
        </div>

        {/* Add Form */}
        {isAddingJadwal && (
          <form onSubmit={handleAddJadwal} className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Jadwal Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Pelatihan *</label>
                <input required type="text" value={jadwalForm.title}
                  onChange={e => setJadwalForm({ ...jadwalForm, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30"
                  placeholder="Teknik Las SMAW 3G" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lokasi *</label>
                <input required type="text" value={jadwalForm.location}
                  onChange={e => setJadwalForm({ ...jadwalForm, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30"
                  placeholder="BLK Kab. Serang" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal *</label>
                <input required type="date" value={jadwalForm.date}
                  onChange={e => setJadwalForm({ ...jadwalForm, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Waktu Mulai</label>
                <input type="time" value={jadwalForm.time_start}
                  onChange={e => setJadwalForm({ ...jadwalForm, time_start: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Waktu Selesai</label>
                <input type="text" value={jadwalForm.time_end}
                  onChange={e => setJadwalForm({ ...jadwalForm, time_end: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30"
                  placeholder="Selesai / 15:00" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Warna Indikator</label>
              <div className="flex gap-2 flex-wrap">
                {STAT_COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setJadwalForm({ ...jadwalForm, color: c.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${jadwalForm.color === c.value ? "border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20 bg-[#EFF6FF]" : "border-gray-200 hover:border-gray-300"}`}>
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${c.value}`} />{c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAddingJadwal(false)} className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl">Batal</button>
              <button type="submit" className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554]">Simpan</button>
            </div>
          </form>
        )}

        {/* Edit Form */}
        {editingJadwalId && (
          <div className="bg-blue-50 p-5 rounded-xl border-2 border-[#1E3A8A]/20 mb-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Pencil className="w-3.5 h-3.5" /> Edit Jadwal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Pelatihan</label>
                <input type="text" value={editJadwal.title || ""} onChange={e => setEditJadwal({ ...editJadwal, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lokasi</label>
                <input type="text" value={editJadwal.location || ""} onChange={e => setEditJadwal({ ...editJadwal, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal</label>
                <input type="date" value={editJadwal.date || ""} onChange={e => setEditJadwal({ ...editJadwal, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Waktu Mulai</label>
                <input type="time" value={editJadwal.time_start || ""} onChange={e => setEditJadwal({ ...editJadwal, time_start: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Waktu Selesai</label>
                <input type="text" value={editJadwal.time_end || ""} onChange={e => setEditJadwal({ ...editJadwal, time_end: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditingJadwalId(null)} className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl">Batal</button>
              <button onClick={handleSaveEditJadwal} className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] flex items-center gap-2">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        )}

        {/* Jadwal List */}
        <div className="space-y-3">
          {jadwal.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              Belum ada jadwal pelatihan. Klik &quot;Tambah Jadwal&quot; untuk menambahkan.
            </div>
          ) : (
            jadwal.map(j => (
              <div key={j.id} className={`flex items-center gap-4 p-4 rounded-xl border group transition-all ${isDatePast(j.date) ? "bg-gray-50/60 border-gray-100 opacity-70" : "bg-gray-50 border-gray-100"}`}>
                <div className="bg-white border border-gray-200 rounded-lg p-2 text-center min-w-[52px] shrink-0">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {(() => { try { return new Date(j.date).toLocaleDateString("id-ID", { month: "short" }).toUpperCase(); } catch { return ""; } })()}
                  </p>
                  <p className="text-lg font-bold text-gray-900 -mt-0.5">
                    {(() => { try { return new Date(j.date).getDate(); } catch { return ""; } })()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{j.title}</h4>
                    {isDatePast(j.date) && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 shrink-0">LEWAT</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${j.color}`} />
                    <MapPin className="w-3 h-3 shrink-0" /> {j.location} • {j.time_start} - {j.time_end}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditJadwal(j)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteJadwal(j.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
