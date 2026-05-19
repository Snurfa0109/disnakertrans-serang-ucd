"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ArrowRight, FileText, Briefcase, MapPin, Users, Scale, GraduationCap, Building2, Megaphone } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "@/components/DarkModeToggle";

const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Profil", href: "/profil" },
    { name: "Informasi Publik", href: "/informasi-publik" },
    { name: "Layanan Publik", href: "/layanan-publik" },
    { name: "Pengaduan", href: "/pengaduan" },
];

interface SearchItem {
    title: string;
    description: string;
    href: string;
    category: string;
    icon: React.ElementType;
    tags: string[];
}

const searchableItems: SearchItem[] = [
    // Layanan
    { title: "Kartu Kuning (AK-1) Online", description: "Pendaftaran pencari kerja secara online melalui aplikasi Serang Bahagia", href: "/layanan-publik#tutorial-ak1", category: "Layanan", icon: FileText, tags: ["kartu kuning", "ak1", "ak-1", "pencari kerja", "daftar", "pendaftaran", "serang bahagia"] },
    { title: "KarirHub Kemnaker", description: "Platform lowongan kerja dan pelatihan dari Kementerian Ketenagakerjaan", href: "/layanan-publik", category: "Layanan", icon: Briefcase, tags: ["lowongan", "kerja", "karir", "karirhub", "lamaran", "pekerjaan"] },
    { title: "E-SAKIP", description: "Sistem Akuntabilitas Kinerja Instansi Pemerintah", href: "/layanan-publik", category: "Layanan", icon: Building2, tags: ["e-sakip", "sakip", "kinerja", "akuntabilitas", "laporan"] },
    { title: "OSS RBA", description: "Online Single Submission — Perizinan Berusaha Berbasis Risiko", href: "/layanan-publik", category: "Layanan", icon: FileText, tags: ["oss", "perizinan", "izin usaha", "nib", "berusaha"] },
    { title: "Tutorial Pembuatan AK-1", description: "Panduan langkah demi langkah pembuatan Kartu Kuning secara online", href: "/layanan-publik/tutorial-ak1", category: "Layanan", icon: GraduationCap, tags: ["tutorial", "panduan", "cara", "buat", "ak-1", "kartu kuning"] },

    // Informasi
    { title: "Berita & Warta Ketenagakerjaan", description: "Update terkini kebijakan, event, dan capaian kinerja Disnakertrans", href: "/informasi-publik", category: "Informasi", icon: FileText, tags: ["berita", "warta", "informasi", "update", "kebijakan", "event"] },
    { title: "Statistik & Data Kinerja", description: "Data pencari kerja terdaftar, peserta pelatihan, dan indeks kepuasan", href: "/informasi-publik", category: "Informasi", icon: Users, tags: ["statistik", "data", "kinerja", "pencari kerja", "kepuasan"] },
    { title: "Peta Kecamatan Kabupaten Serang", description: "Peta interaktif 29 kecamatan dan 326 desa di Kabupaten Serang", href: "/informasi-publik#peta-kecamatan", category: "Informasi", icon: MapPin, tags: ["peta", "kecamatan", "desa", "wilayah", "serang", "map"] },
    { title: "Jadwal Pelatihan Aktif", description: "Jadwal pelatihan teknis dan vokasi yang sedang berlangsung", href: "/informasi-publik", category: "Informasi", icon: GraduationCap, tags: ["jadwal", "pelatihan", "training", "sertifikasi", "blk"] },

    // Profil
    { title: "Profil Disnakertrans", description: "Visi, misi, sejarah, dan struktur organisasi dinas", href: "/profil", category: "Profil", icon: Building2, tags: ["profil", "visi", "misi", "sejarah", "struktur", "organisasi", "tentang"] },
    { title: "Bidang & Unit Kerja", description: "Informasi bidang-bidang kerja di Disnakertrans Kabupaten Serang", href: "/bidang", category: "Profil", icon: Users, tags: ["bidang", "unit", "divisi", "sekretariat", "pelatihan", "penempatan", "hubungan industrial"] },

    // Pengaduan
    { title: "Pengaduan Masyarakat", description: "Sampaikan keluhan, saran, atau laporan terkait pelayanan ketenagakerjaan", href: "/pengaduan", category: "Pengaduan", icon: Megaphone, tags: ["pengaduan", "lapor", "keluhan", "saran", "aduan", "komplain", "laporan"] },

    // Hubungan Industrial
    { title: "Hubungan Industrial", description: "Konsultasi dan mediasi perselisihan ketenagakerjaan", href: "/layanan/hubungan-industrial", category: "Layanan", icon: Scale, tags: ["hubungan industrial", "mediasi", "perselisihan", "konsultasi", "buruh", "pekerja", "upah"] },

    // Lowongan
    { title: "Info Lowongan Kerja", description: "Lowongan kerja terbaru di wilayah Kabupaten Serang", href: "/informasi-publik", category: "Informasi", icon: Briefcase, tags: ["lowongan", "kerja", "info loker", "pekerjaan", "rekrutmen", "hiring"] },
];

const filterCategories = [
    { label: "Semua", value: "all" },
    { label: "Layanan", value: "Layanan" },
    { label: "Informasi", value: "Informasi" },
    { label: "Profil", value: "Profil" },
    { label: "Pengaduan", value: "Pengaduan" },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Keyboard shortcut: Ctrl+K or Cmd+K to open search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when search opens
    useEffect(() => {
        if (isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            setSearchQuery("");
            setActiveFilter("all");
        }
    }, [isSearchOpen]);

    // Lock body scroll when search is open
    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isSearchOpen]);

    const filteredResults = searchableItems.filter(item => {
        const matchesFilter = activeFilter === "all" || item.category === activeFilter;
        if (!searchQuery.trim()) return matchesFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.tags.some(tag => tag.includes(q));
        return matchesFilter && matchesSearch;
    });

    const handleResultClick = useCallback((href: string) => {
        setIsSearchOpen(false);
        router.push(href);
    }, [router]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Layanan": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Informasi": return "bg-amber-50 text-amber-700 border-amber-200";
            case "Profil": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Pengaduan": return "bg-rose-50 text-rose-700 border-rose-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <>
            <header
                className={clsx(
                    "fixed top-0 w-full z-50 transition-all duration-300",
                    scrolled
                        ? "bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md shadow-md py-3"
                        : "bg-white dark:bg-[#0F172A] py-4 border-b border-gray-100 dark:border-gray-800"
                )}
            >
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex items-center justify-between">
                        {/* LEFT: Logo & Text */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center shrink-0">
                                <img src="/images/logokabserang.png" alt="Logo Kabupaten Serang" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="w-0.5 h-10 bg-gray-300 mx-1"></div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-[#1E3A8A] dark:text-white text-xs lg:text-[15px] tracking-tight leading-[1.1]">
                                    Dinas Tenaga Kerja <br className="hidden sm:block" />
                                    & Transmigrasi
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-[9px] lg:text-[11px] tracking-wide mt-0.5">Pemerintah Kabupaten Serang</span>
                            </div>
                        </Link>

                        {/* CENTER: Navigation Menu (Desktop) */}
                        <nav className="hidden xl:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={clsx(
                                        "text-sm font-semibold transition-all relative py-2",
                                        pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/")
                                            ? "text-[#1E3A8A] dark:text-[#93C5FD]"
                                            : "text-gray-600 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-white"
                                    )}
                                >
                                    {link.name}
                                    {pathname === link.href && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FBBF24]"
                                        />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* RIGHT: Search + Dark Mode */}
                        <div className="hidden xl:flex items-center gap-1">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="flex items-center gap-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-3 py-2 text-gray-500 dark:text-gray-400 transition-colors group"
                            >
                                <Search className="w-4 h-4" />
                                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-500">Cari...</span>
                                <kbd className="hidden lg:inline-flex items-center gap-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-400 shadow-sm">
                                    Ctrl K
                                </kbd>
                            </button>
                            <DarkModeToggle />
                        </div>

                        {/* Mobile: Search + Dark Mode + Menu */}
                        <div className="flex xl:hidden items-center gap-1">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <DarkModeToggle />
                            <button
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle Menu"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="xl:hidden bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden mt-4 absolute left-0 w-full"
                        >
                            <nav className="flex flex-col container mx-auto px-4 py-4 gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={clsx(
                                            "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                                            pathname === link.href
                                                ? "bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 text-[#1E3A8A] dark:text-[#93C5FD]"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                        {/* Search Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari layanan, informasi, atau halaman..."
                                    className="flex-1 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none bg-transparent"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200"
                                >
                                    ESC
                                </button>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                {filterCategories.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setActiveFilter(f.value)}
                                        className={clsx(
                                            "text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap border",
                                            activeFilter === f.value
                                                ? "bg-[#0A192F] dark:bg-[#FBBF24] text-white dark:text-[#0A192F] border-[#0A192F] dark:border-[#FBBF24] shadow-sm"
                                                : "bg-white dark:bg-[#0F172A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Results */}
                            <div className="max-h-[50vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                {filteredResults.length > 0 ? (
                                    <div className="py-2">
                                        {filteredResults.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleResultClick(item.href)}
                                                className="w-full flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors text-left group"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#0F172A] group-hover:bg-[#EFF6FF] dark:group-hover:bg-[#1E3A8A]/20 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                                                    <item.icon className="w-4 h-4 text-gray-500 group-hover:text-[#1E3A8A] transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className={clsx("text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0", getCategoryColor(item.category))}>
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1E3A8A] shrink-0 mt-2.5 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-gray-400">Tidak ditemukan</p>
                                        <p className="text-xs text-gray-300 mt-1">Coba kata kunci lain atau ubah filter</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-[#0F172A]">
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {filteredResults.length} hasil ditemukan
                                </span>
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-white border border-gray-200 rounded px-1 py-0.5 font-mono shadow-sm">↑↓</kbd> navigasi
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-white border border-gray-200 rounded px-1 py-0.5 font-mono shadow-sm">↵</kbd> buka
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
