"use client";

import { useEffect, useState } from "react";
import {
  Users, Plus, Pencil, Trash2, Search, Filter, ShieldCheck, ShieldOff,
  RotateCcw, X, Eye, EyeOff, UserPlus, Check, AlertCircle,
} from "lucide-react";

type Role = "superadmin" | "website" | "sekretariat" | "lattas" | "binapenta" | "hijamsostek";

interface AdminUser {
  id: number; name: string; email: string; role: Role;
  is_active: number; last_login: string | null; created_at: string;
}

const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super Admin", website: "Admin Website", sekretariat: "Admin Sekretariat",
  lattas: "Admin Lattas", binapenta: "Admin Binapenta", hijamsostek: "Admin HI Jamsostek",
};
const ROLE_COLORS: Record<Role, string> = {
  superadmin: "bg-amber-100 text-amber-700", website: "bg-blue-100 text-blue-700",
  sekretariat: "bg-green-100 text-green-700", lattas: "bg-purple-100 text-purple-700",
  binapenta: "bg-cyan-100 text-cyan-700", hijamsostek: "bg-rose-100 text-rose-700",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "website" as Role };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const perPage = 15;

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.data || []);
    setTotal(data.meta?.total || 0);
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const openCreate = () => { setEditUser(null); setForm(EMPTY_FORM); setShowModal(true); setShowPw(false); };
  const openEdit = (u: AdminUser) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: "", role: u.role }); setShowModal(true); setShowPw(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        const body: any = { name: form.name, email: form.email, role: form.role };
        if (form.password) body.password = form.password;
        const res = await fetch(`/api/admin/users/${editUser.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json(); showToast("error", d.message || "Gagal"); }
        else { showToast("success", "Admin berhasil diperbarui"); setShowModal(false); fetchUsers(); }
      } else {
        const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json(); showToast("error", d.message || "Gagal"); }
        else { showToast("success", "Admin baru berhasil dibuat"); setShowModal(false); fetchUsers(); }
      }
    } catch { showToast("error", "Terjadi kesalahan"); }
    setSaving(false);
  };

  const handleToggleActive = async (u: AdminUser) => {
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: u.is_active ? 0 : 1 }) });
    if (res.ok) { showToast("success", u.is_active ? "Akun dinonaktifkan" : "Akun diaktifkan"); fetchUsers(); }
    else { const d = await res.json(); showToast("error", d.message || "Gagal"); }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Hapus akun ${u.name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (res.ok) { showToast("success", "Admin dihapus"); fetchUsers(); }
    else { const d = await res.json(); showToast("error", d.message || "Gagal"); }
  };

  const handleResetPassword = (u: AdminUser) => { openEdit(u); setShowPw(true); };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1E3A8A]" /> Manage Users
          </h2>
          <p className="text-sm text-gray-500 mt-1">Kelola akun admin dan hak akses sistem.</p>
        </div>
        <button onClick={openCreate} className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 shadow-sm">
          <UserPlus className="w-4 h-4" /> Tambah Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([role, label]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className={`rounded-xl p-3 border ${ROLE_COLORS[role]} border-current/20`}>
              <p className="text-lg font-extrabold">{count}</p>
              <p className="text-[11px] font-medium opacity-80">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Cari nama atau email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10"
          />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
          <option value="">Semua Role</option>
          {Object.entries(ROLE_LABELS).map(([r, l]) => <option key={r} value={r}>{l}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{total}</span> admin terdaftar</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" /></div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Tidak ada admin ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Nama & Email", "Role", "Status", "Last Login", "Aksi"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${!u.is_active ? "opacity-60" : ""}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${ROLE_COLORS[u.role]}`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {u.last_login ? new Date(u.last_login).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Belum pernah"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleResetPassword(u)} title="Reset Password" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleToggleActive(u)} title={u.is_active ? "Nonaktifkan" : "Aktifkan"} className={`p-1.5 rounded-lg transition-colors ${u.is_active ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}>
                          {u.is_active ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleDelete(u)} title="Hapus" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editUser ? "Edit Admin" : "Tambah Admin Baru"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap *</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10"
                  placeholder="Nama lengkap admin" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10"
                  placeholder="email@disnakertrans.go.id" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {editUser ? "Password Baru (kosongkan jika tidak diubah)" : "Password *"}
                </label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required={!editUser}
                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10"
                    placeholder={editUser ? "Kosongkan jika tidak diubah" : "Min. 8 karakter"} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role *</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value as Role})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
                  {Object.entries(ROLE_LABELS).map(([r, l]) => <option key={r} value={r}>{l}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] disabled:opacity-50 flex items-center gap-2 transition-colors">
                  {saving ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</> : <><Check className="w-4 h-4" />{editUser ? "Simpan" : "Buat Admin"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
