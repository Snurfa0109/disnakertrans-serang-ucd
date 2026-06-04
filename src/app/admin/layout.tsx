"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Newspaper, MessageSquareWarning, BarChart3, RefreshCw, LogOut, Shield,
  Menu, X, ChevronRight, Home, Database, TrendingUp, Users, HelpCircle,
  BookOpen, Layout, Image, FileText, Bot, ClipboardList, Settings,
  ChevronDown, Building2,
} from "lucide-react";

type AdminRole = "superadmin" | "website" | "sekretariat" | "lattas" | "binapenta" | "hijamsostek";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AdminRole[] | "all";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Super Admin",
  website: "Admin Website",
  sekretariat: "Admin Sekretariat",
  lattas: "Admin Lattas",
  binapenta: "Admin Binapenta",
  hijamsostek: "Admin HI Jamsostek",
};

const ROLE_COLORS: Record<AdminRole, string> = {
  superadmin: "bg-amber-500/20 text-amber-300",
  website: "bg-blue-500/20 text-blue-300",
  sekretariat: "bg-green-500/20 text-green-300",
  lattas: "bg-purple-500/20 text-purple-300",
  binapenta: "bg-cyan-500/20 text-cyan-300",
  hijamsostek: "bg-rose-500/20 text-rose-300",
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Umum",
    items: [
      { label: "Dashboard", href: "/admin", icon: BarChart3, roles: "all" },
    ],
  },
  {
    title: "Konten Website",
    items: [
      { label: "Kelola Berita", href: "/admin/news", icon: Newspaper, roles: ["superadmin", "website", "lattas", "binapenta", "hijamsostek"] },
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle, roles: ["superadmin", "website", "lattas", "binapenta", "hijamsostek"] },
      { label: "Tutorial Layanan", href: "/admin/tutorials", icon: BookOpen, roles: ["superadmin", "website"] },
      { label: "Konten Website", href: "/admin/content", icon: Layout, roles: ["superadmin", "website"] },
      { label: "Media Manager", href: "/admin/media", icon: Image, roles: ["superadmin", "website", "sekretariat"] },
    ],
  },
  {
    title: "Operasional",
    items: [
      { label: "Pengaduan", href: "/admin/complaints", icon: MessageSquareWarning, roles: ["superadmin", "sekretariat", "hijamsostek"] },
      { label: "Kelola Data", href: "/admin/data", icon: Database, roles: ["superadmin", "lattas", "binapenta"] },
      { label: "Informasi Publik", href: "/admin/data", icon: FileText, roles: ["superadmin", "sekretariat"] },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Manage Users", href: "/admin/users", icon: Users, roles: ["superadmin"] },
      { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList, roles: ["superadmin"] },
      { label: "Chatbot Monitor", href: "/admin/chatbot", icon: Bot, roles: ["superadmin", "website"] },
      { label: "Statistik Pengunjung", href: "/admin/analytics", icon: TrendingUp, roles: ["superadmin", "website"] },
      { label: "Scraper Berita", href: "/admin/scraper", icon: RefreshCw, roles: ["superadmin"] },
    ],
  },
];

function canAccess(item: NavItem, role: AdminRole | null): boolean {
  if (!role) return false;
  if (item.roles === "all") return true;
  return item.roles.includes(role);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: AdminRole } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Umum": true, "Konten Website": true, "Operasional": true, "Sistem": true,
  });

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) { setIsAuthenticated(true); return; }

    fetch("/api/auth/check")
      .then((res) => { if (!res.ok) throw new Error("Not authenticated"); return res.json(); })
      .then((data) => {
        setIsAuthenticated(true);
        if (data.data?.user) setUserInfo(data.data.user);
      })
      .catch(() => { setIsAuthenticated(false); router.push("/admin/login"); });
  }, [pathname, isLoginPage, router]);

  // Force light mode on admin pages
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    if (wasDark) html.classList.remove("dark");
    return () => {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        html.classList.add("dark");
      }
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="w-8 h-8 rounded-full border-3 border-[#FBBF24] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;
  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const role = userInfo?.role ?? null;

  const currentPageLabel = (() => {
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) {
          return item.label;
        }
      }
    }
    return "Dashboard";
  })();

  return (
    <div className="min-h-screen bg-[#F1F5F9] force-light">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0A192F] text-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FBBF24]/20 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-4.5 h-4.5 text-[#FBBF24]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-white leading-tight truncate">Admin Panel</h2>
              <p className="text-[10px] text-white/50 truncate">Disnakertrans Kab. Serang</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 lg:hidden text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {userInfo && (
          <div className="px-5 py-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FBBF24]/30 to-[#FBBF24]/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-[#FBBF24] font-bold text-xs">{userInfo.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate">{userInfo.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${ROLE_COLORS[userInfo.role] || "bg-white/10 text-white/60"}`}>
                  {ROLE_LABELS[userInfo.role] || userInfo.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => canAccess(item, role));
            if (visibleItems.length === 0) return null;

            const isExpanded = expandedSections[section.title] !== false;

            // Deduplicate href (e.g. "Informasi Publik" shares /admin/data with "Kelola Data")
            const dedupedItems = visibleItems.filter((item, idx, arr) =>
              arr.findIndex(i => i.href === item.href && i.label === item.label) === idx
            );

            return (
              <div key={section.title} className="px-3">
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, [section.title]: !isExpanded }))}
                  className="flex items-center justify-between w-full px-2 py-1.5 mb-1"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{section.title}</span>
                  <ChevronDown className={`w-3 h-3 text-white/20 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                </button>

                {isExpanded && (
                  <div className="space-y-0.5">
                    {dedupedItems.map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={`${item.href}-${item.label}`}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                            isActive
                              ? "bg-[#FBBF24]/15 text-[#FBBF24]"
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#FBBF24]" : ""}`} />
                          <span className="flex-1 text-sm">{item.label}</span>
                          {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-white/10 pt-3 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900 p-1">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Building2 className="w-4 h-4 text-[#1E3A8A] shrink-0 hidden sm:block" />
            <h1 className="text-sm font-bold text-gray-900 truncate">{currentPageLabel}</h1>
          </div>

          <div className="flex items-center gap-3">
            {userInfo && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-lg font-semibold ${ROLE_COLORS[userInfo.role] || "bg-gray-100 text-gray-600"}`}>
                  {ROLE_LABELS[userInfo.role]}
                </span>
                <span className="text-gray-700 font-medium">{userInfo.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
