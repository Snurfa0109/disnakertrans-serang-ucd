"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardList, Search, Filter, RefreshCw, User, Clock, Shield, Pencil, Trash2, LogIn, LogOut, Upload, Download, Eye, X } from "lucide-react";

interface AuditLog {
  id: number; actor_id: number | null; actor_name: string; actor_role: string;
  action: string; module: string; target_id: string | null;
  target_description: string | null; ip_address: string; created_at: string;
}

const ACTION_META: Record<string, { label: string; color: string; icon: React.ComponentType<{className?: string}> }> = {
  login:         { label: "Login",          color: "bg-blue-100 text-blue-700",   icon: LogIn },
  logout:        { label: "Logout",         color: "bg-gray-100 text-gray-600",   icon: LogOut },
  create:        { label: "Buat",           color: "bg-green-100 text-green-700", icon: Pencil },
  update:        { label: "Update",         color: "bg-amber-100 text-amber-700", icon: Pencil },
  delete:        { label: "Hapus",          color: "bg-red-100 text-red-700",     icon: Trash2 },
  upload:        { label: "Upload",         color: "bg-purple-100 text-purple-700", icon: Upload },
  export:        { label: "Export",         color: "bg-cyan-100 text-cyan-700",   icon: Download },
  status_change: { label: "Ubah Status",   color: "bg-orange-100 text-orange-700", icon: Pencil },
  view:          { label: "Lihat",          color: "bg-gray-100 text-gray-500",   icon: Eye },
};

const MODULE_LABELS: Record<string, string> = {
  auth: "Autentikasi", users: "Manage Users", news: "Berita", complaints: "Pengaduan",
  faq: "FAQ", tutorials: "Tutorial", content: "Konten", media: "Media",
  jadwal: "Jadwal", statistik: "Statistik", scraper: "Scraper", analytics: "Analitik",
};

const ROLE_COLORS: Record<string, string> = {
  superadmin: "bg-amber-100 text-amber-700", website: "bg-blue-100 text-blue-700",
  sekretariat: "bg-green-100 text-green-700", lattas: "bg-purple-100 text-purple-700",
  binapenta: "bg-cyan-100 text-cyan-700", hijamsostek: "bg-rose-100 text-rose-700",
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const perPage = 20;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (actionFilter) params.set("action", actionFilter);
    if (moduleFilter) params.set("module", moduleFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const res = await fetch(`/api/admin/audit-log?${params}`);
    const d = await res.json();
    setLogs(d.data || []);
    setTotal(d.meta?.total || 0);
    setIsLoading(false);
  }, [page, actionFilter, moduleFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const header = ["ID", "Waktu", "Actor", "Role", "Aksi", "Modul", "Target", "IP Address"];
    const rows = logs.map(l => [
      l.id,
      new Date(l.created_at).toLocaleString("id-ID"),
      l.actor_name,
      l.actor_role,
      l.action,
      l.module,
      l.target_description || "-",
      l.ip_address || "-",
    ]);
    const csvContent = [header, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#1E3A8A]" />Audit Log
          </h2>
          <p className="text-sm text-gray-500 mt-1">Rekam jejak semua aktivitas admin sistem.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => fetchLogs()} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><p className="text-2xl font-extrabold text-gray-900">{total}</p><p className="text-xs text-gray-500">Total Log</p></div>
        {["login", "create", "update", "delete"].map(action => {
          const m = ACTION_META[action];
          const Icon = m.icon;
          return (
            <div key={action} className={`rounded-xl p-4 border ${m.color} border-current/20`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <p className="text-xs font-semibold">{m.label}</p>
              </div>
              <p className="text-xl font-extrabold">{logs.filter(l => l.action === action).length}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
          <option value="">Semua Aksi</option>
          {Object.entries(ACTION_META).map(([a, m]) => <option key={a} value={a}>{m.label}</option>)}
        </select>
        <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
          <option value="">Semua Modul</option>
          {Object.entries(MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" placeholder="Dari tanggal" />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30" placeholder="Sampai tanggal" />
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{total}</span> entri ditemukan</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" /></div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Belum ada aktivitas yang tercatat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Waktu", "Admin", "Role", "Aksi", "Modul", "Keterangan", "IP"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const actionMeta = ACTION_META[log.action] || { label: log.action, color: "bg-gray-100 text-gray-600", icon: Clock };
                  const ActionIcon = actionMeta.icon;
                  return (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {log.actor_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{log.actor_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${ROLE_COLORS[log.actor_role] || "bg-gray-100 text-gray-600"}`}>
                          {log.actor_role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap flex items-center gap-1 w-fit ${actionMeta.color}`}>
                          <ActionIcon className="w-2.5 h-2.5" />{actionMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-600 whitespace-nowrap">{MODULE_LABELS[log.module] || log.module}</span>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="text-xs text-gray-500 truncate" title={log.target_description || ""}>
                          {log.target_description || (log.target_id ? `ID: ${log.target_id}` : "—")}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-400">{log.ip_address || "—"}</td>
                    </tr>
                  );
                })}
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
    </div>
  );
}
