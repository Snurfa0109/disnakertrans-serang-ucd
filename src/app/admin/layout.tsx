"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Newspaper,
  MessageSquareWarning,
  BarChart3,
  RefreshCw,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
  Home,
  Database,
  TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Kelola Berita", href: "/admin/news", icon: Newspaper },
  { label: "Kelola Data", href: "/admin/data", icon: Database },
  { label: "Pengaduan", href: "/admin/complaints", icon: MessageSquareWarning },
  { label: "Scraper", href: "/admin/scraper", icon: RefreshCw },
  { label: "Statistik Pengunjung", href: "/admin/analytics", icon: TrendingUp },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true); // Let login page render
      return;
    }

    fetch("/api/auth/check")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        setIsAuthenticated(false);
        router.push("/admin/login");
      });
  }, [pathname, isLoginPage, router]);

  // Force light mode on admin pages
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    if (wasDark) {
      html.classList.remove('dark');
    }
    return () => {
      // Restore dark mode when leaving admin
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
      }
    };
  }, []);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="w-8 h-8 rounded-full border-3 border-[#FBBF24] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Login page — render without admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Not authenticated — redirecting
  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };


  return (
    <div className="min-h-screen bg-[#F1F5F9] force-light">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed full height on desktop */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0A192F] text-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FBBF24]/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#FBBF24]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white leading-tight">Admin Panel</h2>
              <p className="text-[10px] text-white/50">Disnakertrans Serang</p>
            </div>
          </div>
          {/* Close button (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-5 right-4 lg:hidden text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-[#FBBF24]/15 text-[#FBBF24]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#FBBF24]' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <Home className="w-[18px] h-[18px]" />
            <span>Kembali ke Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content - offset by sidebar width on desktop */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900 p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">
              {NAV_ITEMS.find(
                (n) =>
                  pathname === n.href ||
                  (n.href !== "/admin" && pathname.startsWith(n.href))
              )?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
