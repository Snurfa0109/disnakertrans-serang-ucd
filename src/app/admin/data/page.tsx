"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, Clock, Save, Pencil, X, MapPin } from "lucide-react";

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

export default function AdminDataPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isAddingJadwal, setIsAddingJadwal] = useState(false);
  const [editingJadwalId, setEditingJadwalId] = useState<number | null>(null);
  const [editJadwal, setEditJadwal] = useState<Partial<JadwalItem>>({});
  const [savingStats, setSavingStats] = useState(false);
  const [jadwalForm, setJadwalForm] = useState({
    title: "", location: "", date: "", time_start: "08:00", time_end: "Selesai", color: "bg-green-500",
  });

  const colors = [
    { label: "Hijau", value: "bg-green-500" },
    { label: "Biru", value: "bg-blue-500" },
    { label: "Kuning", value: "bg-[#B45309]" },
    { label: "Navy", value: "bg-[#0A192F]" },
    { label: "Merah", value: "bg-red-500" },
    { label: "Ungu", value: "bg-purple-500" },
  ];

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

  const handleAddJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/jadwal-pelatihan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jadwalForm),
      });
      setIsAddingJadwal(false);
      setJadwalForm({ title: "", location: "", date: "", time_start: "08:00", time_end: "Selesai", color: "bg-green-500" });
      fetchJadwal();
    } catch (e) { console.error(e); }
  };

  const handleDeleteJadwal = async (id: number) => {
    if (!confirm("Hapus jadwal ini?")) return;
    await fetch(`/api/jadwal-pelatihan/${id}`, { method: "DELETE" });
    fetchJadwal();
  };

  const startEditJadwal = (item: JadwalItem) => {
    setEditingJadwalId(item.id);
    setEditJadwal({ ...item });
  };

  const handleSaveEditJadwal = async () => {
    if (!editingJadwalId) return;
    await fetch(`/api/jadwal-pelatihan/${editingJadwalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editJadwal),
    });
    setEditingJadwalId(null);
    fetchJadwal();
  };

  const handleSaveStats = async () => {
    setSavingStats(true);
    try {
      await fetch("/api/statistik", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: stats }),
      });
    } catch (e) { console.error(e); }
    setSavingStats(false);
  };

  const updateStat = (id: number, field: string, value: string) => {
    setStats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-8">
      {/* ─── STATISTIK SECTION ─── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📊 Data Statistik</h2>
            <p className="text-xs text-gray-500 mt-1">Ubah data statistik yang tampil di halaman Informasi Publik.</p>
          </div>
          <button
            onClick={handleSaveStats}
            disabled={savingStats}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {savingStats ? "Menyimpan..." : "Simpan Semua"}
          </button>
        </div>

        <div className="space-y-4">
          {stats.map(s => (
            <div key={s.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Label</label>
                <input
                  type="text"
                  value={s.label}
                  onChange={e => updateStat(s.id, "label", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nilai</label>
                <input
                  type="text"
                  value={s.value}
                  onChange={e => updateStat(s.id, "value", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Keterangan</label>
                <input
                  type="text"
                  value={s.description}
                  onChange={e => updateStat(s.id, "description", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A]/30"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── JADWAL PELATIHAN SECTION ─── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📅 Jadwal Pelatihan</h2>
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
                <input required type="text" value={jadwalForm.title} onChange={e => setJadwalForm({ ...jadwalForm, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" placeholder="Teknik Las SMAW 3G" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lokasi *</label>
                <input required type="text" value={jadwalForm.location} onChange={e => setJadwalForm({ ...jadwalForm, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" placeholder="BLK Kab. Serang" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal *</label>
                <input required type="date" value={jadwalForm.date} onChange={e => setJadwalForm({ ...jadwalForm, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Waktu Mulai</label>
                <input type="time" value={jadwalForm.time_start} onChange={e => setJadwalForm({ ...jadwalForm, time_start: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Waktu Selesai</label>
                <input type="text" value={jadwalForm.time_end} onChange={e => setJadwalForm({ ...jadwalForm, time_end: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" placeholder="Selesai / 15:00" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Warna Indikator</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
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
            <div className="text-center py-10 text-gray-400 text-sm">Belum ada jadwal pelatihan. Klik &quot;Tambah Jadwal&quot; untuk menambahkan.</div>
          ) : (
            jadwal.map(j => (
              <div key={j.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                <div className="bg-white border border-gray-200 rounded-lg p-2 text-center min-w-[52px] shrink-0">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {(() => { try { return new Date(j.date).toLocaleDateString("id-ID", { month: "short" }).toUpperCase(); } catch { return ""; } })()}
                  </p>
                  <p className="text-lg font-bold text-gray-900 -mt-0.5">
                    {(() => { try { return new Date(j.date).getDate(); } catch { return ""; } })()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{j.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${j.color}`} />
                    <MapPin className="w-3 h-3 shrink-0" /> {j.location} • {j.time_start} - {j.time_end}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditJadwal(j)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteJadwal(j.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
