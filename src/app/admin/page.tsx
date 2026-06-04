"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper, MessageSquareWarning, Clock, CheckCircle2, TrendingUp,
  Users, HelpCircle, BookOpen, Image, ClipboardList, Bot, Shield,
  AlertCircle, ArrowRight, Calendar, BarChart3, FileText, Activity,
  Pencil, Trash2, LogIn, LogOut, Upload,
} from "lucide-react";

type AdminRole = "superadmin" | "website" | "sekretariat" | "lattas" | "binapenta" | "hijamsostek";

interface DashboardData {
  newsTotal: number; complaintsTotal: number; complaintsBaru: number;
  complaintsSelesai: number; complaintsDisproses: number; visitorToday: number;
  role: AdminRole; name: string;
}

interface RecentActivity {
  id: number;
  actor_name: string;
  actor_role: string;
  action: string;
  module: string;
  target_description: string | null;
  created_at: string;
}

interface QuickAction { label: string; href: string; icon: React.ComponentType<{className?: string}>; color: string; roles: AdminRole[] | "all"; desc: string; }

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Kelola Berita", href: "/admin/news", icon: Newspaper, color: "bg-blue-50 text-blue-600 hover:bg-blue-100", roles: ["superadmin","website","lattas","binapenta","hijamsostek"], desc: "Tambah & edit berita" },
  { label: "Pengaduan Baru", href: "/admin/complaints", icon: MessageSquareWarning, color: "bg-red-50 text-red-600 hover:bg-red-100", roles: ["superadmin","sekretariat","hijamsostek"], desc: "Lihat pengaduan masuk" },
  { label: "Kelola FAQ", href: "/admin/faq", icon: HelpCircle, color: "bg-purple-50 text-purple-600 hover:bg-purple-100", roles: ["superadmin","website","lattas","binapenta","hijamsostek"], desc: "Edit pertanyaan umum" },
  { label: "Tutorial Layanan", href: "/admin/tutorials", icon: BookOpen, color: "bg-green-50 text-green-600 hover:bg-green-100", roles: ["superadmin","website"], desc: "Panduan layanan publik" },
  { label: "Konten Website", href: "/admin/content", icon: FileText, color: "bg-amber-50 text-amber-600 hover:bg-amber-100", roles: ["superadmin","website"], desc: "Edit hero & sambutan" },
  { label: "Media Manager", href: "/admin/media", icon: Image, color: "bg-pink-50 text-pink-600 hover:bg-pink-100", roles: ["superadmin","website","sekretariat"], desc: "Upload gambar & PDF" },
  { label: "Manage Users", href: "/admin/users", icon: Users, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100", roles: ["superadmin"], desc: "Kelola akun admin" },
  { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList, color: "bg-gray-50 text-gray-600 hover:bg-gray-100", roles: ["superadmin"], desc: "Rekam jejak aktivitas" },
  { label: "Chatbot Monitor", href: "/admin/chatbot", icon: Bot, color: "bg-teal-50 text-teal-600 hover:bg-teal-100", roles: ["superadmin","website"], desc: "Pantau performa chatbot" },
  { label: "Statistik", href: "/admin/analytics", icon: BarChart3, color: "bg-orange-50 text-orange-600 hover:bg-orange-100", roles: ["superadmin","website"], desc: "Data pengunjung website" },
];

const ROLE_GREETINGS: Record<AdminRole, string> = {
  superadmin: "Anda memiliki akses penuh ke seluruh sistem.",
  website: "Kelola konten, FAQ, tutorial, dan media website.",
  sekretariat: "Kelola pengaduan umum dan konten publik.",
  lattas: "Kelola berita, FAQ, dan jadwal pelatihan.",
  binapenta: "Kelola berita, FAQ, dan informasi lowongan kerja.",
  hijamsostek: "Kelola pengaduan hubungan industrial dan berita.",
};

const ROLE_BADGE_COLORS: Record<AdminRole, string> = {
  superadmin: "bg-amber-100 text-amber-700", website: "bg-blue-100 text-blue-700",
  sekretariat: "bg-green-100 text-green-700", lattas: "bg-purple-100 text-purple-700",
  binapenta: "bg-cyan-100 text-cyan-700", hijamsostek: "bg-rose-100 text-rose-700",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [newsRes, complaintRes, authRes, visitorRes] = await Promise.all([
          fetch("/api/news?perPage=1"),
          fetch("/api/complaints/stats"),
          fetch("/api/auth/check"),
          fetch("/api/visitors"),
        ]);
        const [newsData, complaintData, authData, visitorData] = await Promise.all([
          newsRes.json(), complaintRes.json(), authRes.json(), visitorRes.json(),
        ]);

        setData({
          newsTotal: newsData.meta?.total || 0,
          complaintsTotal: complaintData.data?.total || 0,
          complaintsBaru: complaintData.data?.baru || complaintData.data?.pending || 0,
          complaintsSelesai: complaintData.data?.selesai || complaintData.data?.processed || 0,
          complaintsDisproses: complaintData.data?.diproses || 0,
          visitorToday: visitorData.data?.today || 0,
          role: authData.data?.user?.role || "website",
          name: authData.data?.user?.name || "Admin",
        });

        // Fetch recent activity (only for superadmin — API checks internally)
        try {
          const activityRes = await fetch("/api/admin/audit-log?perPage=5");
          if (activityRes.ok) {
            const activityData = await activityRes.json();
            setRecentActivity(activityData.data?.slice(0, 5) || []);
          }
        } catch { /* not superadmin — skip */ }
      } catch { /* ignore */ }
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" />
      </div>
    );
  }

  const role = (data?.role || "website") as AdminRole;
  const accessibleActions = QUICK_ACTIONS.filter(a => a.roles === "all" || a.roles.includes(role));

  const summaryCards = [
    { label: "Total Berita", value: data?.newsTotal || 0, icon: Newspaper, accent: "border-l-blue-500", color: "bg-blue-50 text-blue-600", href: "/admin/news" },
    { label: "Pengaduan Baru", value: data?.complaintsBaru || 0, icon: AlertCircle, accent: "border-l-red-500", color: "bg-red-50 text-red-600", href: "/admin/complaints?status=Baru" },
    { label: "Sedang Diproses", value: data?.complaintsDisproses || 0, icon: Clock, accent: "border-l-amber-500", color: "bg-amber-50 text-amber-600", href: "/admin/complaints?status=Diproses" },
    { label: "Pengaduan Selesai", value: data?.complaintsSelesai || 0, icon: CheckCircle2, accent: "border-l-green-500", color: "bg-green-50 text-green-600", href: "/admin/complaints?status=Selesai" },
    { label: "Pengunjung Hari Ini", value: data?.visitorToday || 0, icon: TrendingUp, accent: "border-l-purple-500", color: "bg-purple-50 text-purple-600", href: "/admin/analytics" },
  ];

  // Role-filtered cards
  const visibleCards = summaryCards.filter(c => {
    if (role === "superadmin") return true;
    if (c.href.includes("complaints") && !["sekretariat","hijamsostek"].includes(role)) return false;
    if (c.href.includes("analytics") && !["website","superadmin"].includes(role)) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F2645] to-[#1E3A8A] rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#FBBF24]" />
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${ROLE_BADGE_COLORS[role]}`}>
              {role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1.5">Selamat datang, {data?.name?.split(" ")[0] || "Admin"}! 👋</h2>
          <p className="text-white/60 text-sm">{ROLE_GREETINGS[role]}</p>
          <div className="flex items-center gap-2 mt-4 text-white/40 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {visibleCards.map(c => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}
              className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 ${c.accent} hover:shadow-md transition-all group`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-1 group-hover:text-[#1E3A8A] transition-colors">{c.value}</h3>
              <p className="text-xs font-medium text-gray-500">{c.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Aksi Cepat</h3>
          <span className="text-xs text-gray-400">{accessibleActions.length} menu tersedia untuk role Anda</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {accessibleActions.map(action => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}
                className={`flex flex-col items-start p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all group cursor-pointer ${action.color}`}>
                <Icon className="w-6 h-6 mb-3" />
                <p className="text-sm font-bold text-gray-900 leading-tight mb-0.5">{action.label}</p>
                <p className="text-[11px] text-gray-500">{action.desc}</p>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all mt-auto ml-auto" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Role Permission Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-[#1E3A8A]" />
          <h3 className="text-sm font-bold text-gray-900">Hak Akses Anda</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Role <span className={`font-bold px-1.5 py-0.5 rounded-md ${ROLE_BADGE_COLORS[role]}`}>{role}</span> — {ROLE_GREETINGS[role]}</p>
        <div className="flex flex-wrap gap-2">
          {accessibleActions.map(a => (
            <span key={a.href} className="text-[10px] font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{a.label}</span>
          ))}
        </div>
      </div>

      {/* Recent Activity (superadmin only) */}
      {role === "superadmin" && recentActivity.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1E3A8A]" />
              <h3 className="text-sm font-bold text-gray-900">Aktivitas Terbaru</h3>
            </div>
            <Link href="/admin/audit-log" className="text-xs text-[#1E3A8A] font-semibold hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map(log => {
              const ACTION_ICONS: Record<string, any> = {
                login: LogIn, logout: LogOut, create: Pencil, update: Pencil,
                delete: Trash2, upload: Upload, export: FileText, status_change: AlertCircle,
              };
              const ACTION_COLORS: Record<string, string> = {
                login: "text-blue-600 bg-blue-50", logout: "text-gray-500 bg-gray-100",
                create: "text-green-600 bg-green-50", update: "text-amber-600 bg-amber-50",
                delete: "text-red-500 bg-red-50", upload: "text-purple-600 bg-purple-50",
                export: "text-cyan-600 bg-cyan-50", status_change: "text-orange-600 bg-orange-50",
              };
              const Icon = ACTION_ICONS[log.action] || AlertCircle;
              const colorClass = ACTION_COLORS[log.action] || "text-gray-500 bg-gray-100";
              return (
                <div key={log.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{log.actor_name}</span>
                      {" "}
                      <span className="text-gray-500">{log.action === "create" ? "menambahkan" : log.action === "update" ? "mengubah" : log.action === "delete" ? "menghapus" : log.action === "login" ? "login" : log.action === "logout" ? "logout" : log.action} </span>
                      <span className="text-gray-700">{log.target_description || log.module}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(log.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
