"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, Eye, TrendingUp, Globe, Monitor, Smartphone, Tablet,
  RefreshCw, Download, Calendar, ChevronLeft, ChevronRight, ChevronDown,
  Search, Activity, FileSpreadsheet, FileText,
} from "lucide-react";

type Analytics = {
  overview: { totalVisitors: number; uniqueVisitors: number; todayVisitors: number; weeklyVisitors: number; monthlyVisitors: number; activeUsers: number };
  dailyTraffic: { date: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  sourceBreakdown: { referrer: string; count: number }[];
  osBreakdown: { os: string; count: number }[];
  topPages: { page_path: string; views: number; unique_visitors: number }[];
  logs: { data: any[]; total: number; page: number; limit: number; totalPages: number };
};

const RANGES = [
  { label: "Hari Ini", value: "1" },
  { label: "7 Hari", value: "7" },
  { label: "30 Hari", value: "30" },
  { label: "90 Hari", value: "90" },
];

const DEVICE_ICONS: Record<string, any> = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };
const BROWSER_COLORS: Record<string, string> = { Chrome: "#4285F4", Edge: "#0078D7", Firefox: "#FF7139", Safari: "#006CFF", Opera: "#FF1B2D", Other: "#6B7280" };
const SOURCE_COLORS: Record<string, string> = { Direct: "#FBBF24", "Google Search": "#34A853", "Social Media": "#E1306C", WhatsApp: "#25D366", Referral: "#6366F1", Other: "#9CA3AF" };

const PAGE_NAMES: Record<string, string> = {
  "/": "Beranda", "/profil": "Profil", "/informasi-publik": "Informasi Publik",
  "/layanan-publik": "Layanan Publik", "/pengaduan": "Pengaduan", "/bidang": "Bidang",
  "/berita": "Berita",
};

function BarChart({ data, colorMap, labelKey, valueKey }: { data: any[]; colorMap?: Record<string, string>; labelKey: string; valueKey: string }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const total = data.reduce((s, d) => s + d[valueKey], 0);
  return (
    <div className="space-y-2.5">
      {data.slice(0, 6).map((d, i) => {
        const pct = total > 0 ? ((d[valueKey] / total) * 100).toFixed(1) : "0";
        const color = colorMap?.[d[labelKey]] || ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899"][i % 6];
        return (
          <div key={d[labelKey]} className="group">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700 font-medium">{d[labelKey]}</span>
              <span className="text-gray-500">{d[valueKey].toLocaleString()} ({pct}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d[valueKey] / max) * 100}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniLineChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length < 2) return <p className="text-xs text-gray-400 text-center py-8">Data belum tersedia</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  const min = Math.min(...data.map(d => d.count));
  const w = 100, h = 40, pad = 2;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.count - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  });
  const areaPoints = `${pad},${h - pad} ` + points.join(" ") + ` ${w - pad},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
      <polygon points={areaPoints} fill="url(#grad)" opacity="0.3" />
      <polyline points={points.join(" ")} fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" />
      <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#3B82F600" /></linearGradient></defs>
    </svg>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [range, setRange] = useState("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [logSearch, setLogSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/analytics?range=${range}&page=${logPage}&limit=15`;
      if (isCustomRange && customFrom && customTo) {
        const days = Math.max(1, Math.ceil((new Date(customTo).getTime() - new Date(customFrom).getTime()) / 86400000));
        url = `/api/admin/analytics?range=${days}&page=${logPage}&limit=15&from=${customFrom}&to=${customTo}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch { /* ignore */ }
    setLoading(false);
  }, [range, logPage, isCustomRange, customFrom, customTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleQuickFilter = (val: string) => {
    setRange(val);
    setIsCustomRange(false);
    setLogPage(1);
  };

  const handleApplyCustomRange = () => {
    if (customFrom && customTo) {
      setIsCustomRange(true);
      setLogPage(1);
    }
  };

  // ─── EXPORT HELPERS ─────────────────────────────────
  const getExportRows = () => {
    if (!data) return [];
    return data.logs.data.map(l => ({
      Timestamp: l.created_at,
      "Session ID": l.visitor_id,
      "IP Address": l.ip_address,
      Device: l.device,
      Browser: l.browser,
      OS: l.os,
      Page: l.page_path,
      Referrer: l.referrer,
    }));
  };

  const exportCSV = () => {
    const rows = getExportRows();
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${(r as any)[h] || ""}"`).join(","))].join("\n");
    downloadBlob(csv, "text/csv", `analytics_${range}d.csv`);
    setExportOpen(false);
  };

  const exportExcel = () => {
    // Tab-separated values as .xls — opens in Excel
    const rows = getExportRows();
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const tsv = [headers.join("\t"), ...rows.map(r => headers.map(h => (r as any)[h] || "").join("\t"))].join("\n");
    const html = `<html><head><meta charset="UTF-8"></head><body><table><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${headers.map(h => `<td>${(r as any)[h] || ""}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
    downloadBlob(html, "application/vnd.ms-excel", `analytics_${range}d.xls`);
    setExportOpen(false);
  };

  const exportPDF = () => {
    // Print-based PDF export
    const rows = getExportRows();
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Laporan Statistik Pengunjung</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;font-size:11px}h1{font-size:16px;color:#0A192F;margin-bottom:4px}
    p{color:#666;margin-bottom:16px;font-size:11px}table{width:100%;border-collapse:collapse}
    th{background:#0A192F;color:#fff;padding:6px 8px;text-align:left;font-size:10px;text-transform:uppercase}
    td{padding:5px 8px;border-bottom:1px solid #eee;font-size:10px}tr:nth-child(even){background:#f9fafb}</style></head>
    <body><h1>Laporan Statistik Pengunjung</h1><p>Periode: ${range} hari terakhir — Diekspor: ${new Date().toLocaleString("id-ID")}</p>
    <table><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${headers.map(h => `<td>${(r as any)[h] || ""}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(htmlContent); win.document.close(); setTimeout(() => { win.print(); }, 500); }
    setExportOpen(false);
  };

  const downloadBlob = (content: string, type: string, filename: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const ov = data?.overview;
  const overviewCards = [
    { label: "Total Kunjungan", value: ov?.totalVisitors || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pengunjung Unik", value: ov?.uniqueVisitors || 0, icon: Globe, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Kunjungan Hari Ini", value: ov?.todayVisitors || 0, icon: Eye, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Kunjungan Minggu Ini", value: ov?.weeklyVisitors || 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Kunjungan Bulan Ini", value: ov?.monthlyVisitors || 0, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Pengunjung Aktif", value: ov?.activeUsers || 0, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", pulse: true },
  ];

  const filteredLogs = data?.logs.data.filter(l => {
    if (!logSearch) return true;
    const q = logSearch.toLowerCase();
    return l.page_path?.toLowerCase().includes(q) || l.browser?.toLowerCase().includes(q) || l.device?.toLowerCase().includes(q) || l.visitor_id?.toLowerCase().includes(q);
  }) || [];

  const activeRangeLabel = isCustomRange ? "Custom" : RANGES.find(r => r.value === range)?.label || "";

  return (
    <div className="space-y-6">
      {/* ═══ TOOLBAR ═══ */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        {/* Row 1: Title + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Statistik Pengunjung</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Monitoring trafik website
              {lastUpdated && <span> · Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-xs font-medium text-gray-600"
              title="Refresh data">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            {/* Export Dropdown */}
            <div className="relative" ref={exportRef}>
              <button onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#0A192F] text-white text-xs font-medium rounded-lg hover:bg-[#0A192F]/90 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in">
                  <button onClick={exportCSV} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" /> Export CSV
                  </button>
                  <button onClick={exportExcel} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" /> Export Excel
                  </button>
                  <div className="h-px bg-gray-100 mx-2 my-0.5" />
                  <button onClick={exportPDF} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <FileText className="w-3.5 h-3.5 text-red-600" /> Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-gray-100">
          {/* Quick Filters */}
          <div className="flex bg-gray-50 rounded-lg p-0.5 gap-0.5">
            {RANGES.map(r => (
              <button key={r.value} onClick={() => handleQuickFilter(r.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  !isCustomRange && range === r.value
                    ? "bg-[#0A192F] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white"
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          {/* Custom Date Range */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Rentang:</span>
            </div>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors" />
            <span className="text-xs text-gray-400">—</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors" />
            <button onClick={handleApplyCustomRange} disabled={!customFrom || !customTo}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                customFrom && customTo
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}>
              Terapkan
            </button>
          </div>

          {/* Active filter badge */}
          {isCustomRange && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md">
                <Calendar className="w-3 h-3" />
                {customFrom} — {customTo}
                <button onClick={() => { setIsCustomRange(false); setRange("30"); }} className="ml-1 hover:text-blue-900">✕</button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {overviewCards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              {c.pulse && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Traffic Chart + Device/Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Traffic Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Tren Trafik Harian</h3>
          <p className="text-xs text-gray-400 mb-4">{range} hari terakhir</p>
          <MiniLineChart data={data?.dailyTraffic || []} />
          {data?.dailyTraffic && data.dailyTraffic.length > 0 && (
            <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
              <span>{data.dailyTraffic[0]?.date}</span>
              <span>{data.dailyTraffic[data.dailyTraffic.length - 1]?.date}</span>
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Perangkat</h3>
          {(data?.deviceBreakdown?.length || 0) > 0 ? (
            <div className="space-y-4">
              {data!.deviceBreakdown.map(d => {
                const Icon = DEVICE_ICONS[d.device] || Monitor;
                const total = data!.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : "0";
                return (
                  <div key={d.device} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{d.device}</span>
                        <span className="text-gray-500">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-xs text-gray-400 text-center py-6">Belum ada data</p>}
        </div>
      </div>

      {/* Browser, Source, OS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Browser</h3>
          {(data?.browserBreakdown?.length || 0) > 0
            ? <BarChart data={data!.browserBreakdown} colorMap={BROWSER_COLORS} labelKey="browser" valueKey="count" />
            : <p className="text-xs text-gray-400 text-center py-6">Belum ada data</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Sumber Trafik</h3>
          {(data?.sourceBreakdown?.length || 0) > 0
            ? <BarChart data={data!.sourceBreakdown} colorMap={SOURCE_COLORS} labelKey="referrer" valueKey="count" />
            : <p className="text-xs text-gray-400 text-center py-6">Belum ada data</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Sistem Operasi</h3>
          {(data?.osBreakdown?.length || 0) > 0
            ? <BarChart data={data!.osBreakdown} labelKey="os" valueKey="count" />
            : <p className="text-xs text-gray-400 text-center py-6">Belum ada data</p>}
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Halaman Terpopuler</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Halaman</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Path</th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unik</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topPages || []).map((p, i) => (
                <tr key={p.page_path} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 flex items-center justify-center">{i + 1}</span>
                      {PAGE_NAMES[p.page_path] || p.page_path.split("/").pop() || p.page_path}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 font-mono text-xs">{p.page_path}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-gray-900">{p.views.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-gray-500">{p.unique_visitors.toLocaleString()}</td>
                </tr>
              ))}
              {(!data?.topPages || data.topPages.length === 0) && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-xs">Belum ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-gray-900">Log Kunjungan</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari log..." value={logSearch} onChange={e => setLogSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Waktu","Session ID","IP Address","Perangkat","Browser","OS","Halaman","Sumber"].map(h => (
                  <th key={h} className="text-left py-2.5 px-2.5 font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(l => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2 px-2.5 text-gray-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="py-2 px-2.5 font-mono text-gray-600">{l.visitor_id?.substring(0, 12)}...</td>
                  <td className="py-2 px-2.5 text-gray-500">{l.ip_address}</td>
                  <td className="py-2 px-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${l.device === "Mobile" ? "bg-green-50 text-green-700" : l.device === "Tablet" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>{l.device}</span></td>
                  <td className="py-2 px-2.5 text-gray-600">{l.browser}</td>
                  <td className="py-2 px-2.5 text-gray-500">{l.os}</td>
                  <td className="py-2 px-2.5 text-gray-700 font-medium max-w-[150px] truncate">{l.page_path}</td>
                  <td className="py-2 px-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${l.referrer === "Direct" ? "bg-amber-50 text-amber-700" : l.referrer === "Google Search" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{l.referrer}</span></td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Belum ada log kunjungan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.logs.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Halaman {data.logs.page} dari {data.logs.totalPages} ({data.logs.total} total)</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setLogPage(Math.max(1, logPage - 1))} disabled={logPage <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button onClick={() => setLogPage(Math.min(data.logs.totalPages, logPage + 1))} disabled={logPage >= data.logs.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
