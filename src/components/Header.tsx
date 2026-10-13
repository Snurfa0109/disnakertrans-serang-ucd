"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    Search, Menu, X, ArrowRight, FileText, Briefcase, MapPin, 
    Users, Scale, GraduationCap, Building2, Megaphone,
    Calendar, Sparkles, Newspaper, ExternalLink, Loader2 
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "@/components/DarkModeToggle";

const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Profil", href: "/profil" },
    { name: "Peluang & Agenda", href: "/peluang" },
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
    // Peluang & Agenda (Utama)
    { 
        title: "Peluang & Agenda Ketenagakerjaan", 
        description: "Pusat info peluang karir, lowongan kerja, agenda event, dan jadwal pelatihan kerja gratis", 
        href: "/peluang", 
        category: "Peluang & Agenda", 
        icon: Sparkles, 
        tags: ["peluang", "agenda", "loker", "lowongan", "pelatihan", "job fair", "event", "karir", "kegiatan", "jadwal", "kesempatan kerja", "kerja", "bursa kerja"] 
    },
    { 
        title: "Agenda Event & Job Fair", 
        description: "Jadwal pameran bursa kerja (Job Fair), rekrutmen alumni, dan agenda resmi ketenagakerjaan", 
        href: "/peluang#agenda", 
        category: "Peluang & Agenda", 
        icon: Calendar, 
        tags: ["agenda", "event", "job fair", "kegiatan", "acara", "jadwal", "pameran kerja", "bursa kerja", "jadwal agenda", "peluang"] 
    },
    { 
        title: "Info Lowongan Kerja & Peluang Karir", 
        description: "Daftar lowongan kerja terverifikasi dan peluang karir di wilayah Kabupaten Serang", 
        href: "/peluang#lowongan", 
        category: "Lowongan", 
        icon: Briefcase, 
        tags: ["lowongan", "peluang", "kerja", "karir", "loker", "pekerjaan", "rekrutmen", "hiring", "kesempatan", "cari kerja", "info loker"] 
    },
    { 
        title: "Jadwal Pelatihan Kerja (BLK)", 
        description: "Program pelatihan vokasi gratis, sertifikasi teknis, dan peningkatan keterampilan kerja", 
        href: "/pelatihan", 
        category: "Pelatihan", 
        icon: GraduationCap, 
        tags: ["pelatihan", "agenda", "jadwal", "blk", "diklat", "training", "vokasi", "kursus", "keterampilan", "las", "otomotif", "jahit", "komputer", "sertifikasi", "balai latihan kerja", "peluang"] 
    },

    // Layanan
    { 
        title: "Kartu Kuning (AK-1) Online", 
        description: "Pendaftaran pencari kerja secara online melalui aplikasi Serang Bahagia", 
        href: "/layanan-publik#tutorial-ak1", 
        category: "Layanan", 
        icon: FileText, 
        tags: ["kartu kuning", "ak1", "ak-1", "pencari kerja", "daftar", "pendaftaran", "serang bahagia", "peluang", "syarat kerja"] 
    },
    { 
        title: "Tutorial Pembuatan AK-1", 
        description: "Panduan langkah demi langkah pembuatan Kartu Kuning secara online", 
        href: "/layanan-publik/tutorial-ak1", 
        category: "Layanan", 
        icon: GraduationCap, 
        tags: ["tutorial", "panduan", "cara", "buat", "ak-1", "kartu kuning", "syarat", "langkah"] 
    },
    { 
        title: "KarirHub Kemnaker", 
        description: "Platform lowongan kerja dan pelatihan nasional dari Kementerian Ketenagakerjaan", 
        href: "https://karirhub.kemnaker.go.id/", 
        category: "Layanan", 
        icon: Briefcase, 
        tags: ["lowongan", "kerja", "karir", "karirhub", "lamaran", "pekerjaan", "kemnaker", "peluang", "siapkerja", "agenda"] 
    },
    { 
        title: "Konsultasi & Mediasi Hubungan Industrial", 
        description: "Layanan konsultasi sengketa ketenagakerjaan, mediasi PHK, pengupahan, dan BPJS Ketenagakerjaan", 
        href: "/layanan/hubungan-industrial", 
        category: "Layanan", 
        icon: Scale, 
        tags: ["hubungan industrial", "mediasi", "perselisihan", "konsultasi", "buruh", "pekerja", "upah", "umk", "phk", "pesangon", "serikat buruh", "jamsostek"] 
    },
    { 
        title: "E-SAKIP Disnakertrans", 
        description: "Sistem Akuntabilitas Kinerja Instansi Pemerintah Kabupaten Serang", 
        href: "/layanan-publik", 
        category: "Layanan", 
        icon: Building2, 
        tags: ["e-sakip", "sakip", "kinerja", "akuntabilitas", "laporan", "evaluasi"] 
    },
    { 
        title: "OSS RBA Perizinan Berusaha", 
        description: "Online Single Submission Risk Based Approach untuk perizinan ketenagakerjaan", 
        href: "/layanan-publik", 
        category: "Layanan", 
        icon: FileText, 
        tags: ["oss", "perizinan", "izin usaha", "nib", "berusaha", "legalitas"] 
    },

    // Informasi & Berita
    { 
        title: "Berita & Warta Ketenagakerjaan", 
        description: "Update terkini kebijakan, program, event, dan capaian kinerja Disnakertrans Serang", 
        href: "/berita", 
        category: "Berita", 
        icon: Newspaper, 
        tags: ["berita", "warta", "informasi", "update", "kebijakan", "event", "artikel", "kabar", "agenda"] 
    },
    { 
        title: "Dokumen Publik & Laporan Kinerja", 
        description: "Unduh Renstra, LAKIP, Rencana Kerja, Perda, dan dokumen publik resmi", 
        href: "/dokumen", 
        category: "Dokumen", 
        icon: FileText, 
        tags: ["dokumen", "laporan", "lakip", "renstra", "perda", "publikasi", "unduh", "pdf", "transparansi", "sakip", "kinerja"] 
    },
    { 
        title: "Statistik Ketenagakerjaan & UMK 2026", 
        description: "Data UMK Kab. Serang Rp 5.178.521, pencari kerja terdaftar, dan data perusahaan", 
        href: "/informasi-publik", 
        category: "Informasi", 
        icon: Users, 
        tags: ["statistik", "data", "kinerja", "pencari kerja", "kepuasan", "umk", "upah", "gaji", "tren"] 
    },
    { 
        title: "Peta Kecamatan Kabupaten Serang", 
        description: "Peta interaktif 29 kecamatan dan 326 desa di Kabupaten Serang", 
        href: "/informasi-publik#peta-kecamatan", 
        category: "Informasi", 
        icon: MapPin, 
        tags: ["peta", "kecamatan", "desa", "wilayah", "serang", "map", "geografis", "lokasi"] 
    },

    // Profil & Pengaduan
    { 
        title: "Profil & Struktur Organisasi", 
        description: "Visi, misi, sejarah, tugas pokok, fungsi, dan susunan kepemimpinan dinas", 
        href: "/profil", 
        category: "Profil", 
        icon: Building2, 
        tags: ["profil", "visi", "misi", "sejarah", "struktur", "organisasi", "tentang", "kepala dinas", "pimpinan"] 
    },
    { 
        title: "Bidang & Unit Kerja Teknis", 
        description: "Sekretariat, Bidang Pelatihan (Lattas), Penempatan Tenaga Kerja (Binapenta), Hubungan Industrial (HI)", 
        href: "/bidang", 
        category: "Profil", 
        icon: Users, 
        tags: ["bidang", "unit", "divisi", "sekretariat", "pelatihan", "penempatan", "hubungan industrial", "lattas", "binapenta", "tusi"] 
    },
    { 
        title: "Layanan Pengaduan Online", 
        description: "Sampaikan keluhan, aspirasi, saran, atau laporan terkait ketenagakerjaan secara online", 
        href: "/pengaduan", 
        category: "Pengaduan", 
        icon: Megaphone, 
        tags: ["pengaduan", "lapor", "keluhan", "saran", "aduan", "komplain", "laporan", "aspirasi", "sengketa", "hak pekerja"] 
    },
];

const filterCategories = [
    { label: "Semua", value: "all" },
    { label: "Peluang & Agenda", value: "Peluang & Agenda" },
    { label: "Lowongan", value: "Lowongan" },
    { label: "Pelatihan", value: "Pelatihan" },
    { label: "Berita", value: "Berita" },
    { label: "Layanan", value: "Layanan" },
    { label: "Dokumen", value: "Dokumen" },
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
    const [apiResults, setApiResults] = useState<SearchItem[]>([]);
    const [isLoadingApi, setIsLoadingApi] = useState(false);
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
            setApiResults([]);
        }
    }, [isSearchOpen]);

    // Live search query to /api/search with debounce
    useEffect(() => {
        const query = searchQuery.trim();
        if (query.length < 2) {
            setApiResults([]);
            setIsLoadingApi(false);
            return;
        }

        setIsLoadingApi(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.results && Array.isArray(data.results)) {
                        const mapped: SearchItem[] = data.results.map((r: any) => {
                            let icon: React.ElementType = FileText;
                            if (r.category === 'Berita') icon = Newspaper;
                            else if (r.category === 'Lowongan') icon = Briefcase;
                            else if (r.category === 'Agenda') icon = Calendar;
                            else if (r.category === 'Pelatihan') icon = GraduationCap;
                            else if (r.category === 'Dokumen') icon = FileText;
                            else if (r.category === 'Peluang' || r.category === 'Peluang & Agenda') icon = Sparkles;
                            else if (r.category === 'Profil') icon = Building2;
                            else if (r.category === 'Pengaduan') icon = Megaphone;

                            return {
                                title: r.title,
                                description: r.description,
                                href: r.href,
                                category: r.category,
                                icon,
                                tags: r.tags || [],
                            };
                        });
                        setApiResults(mapped);
                    }
                }
            } catch (err) {
                console.error('[Header] Search API fetch error:', err);
            } finally {
                setIsLoadingApi(false);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Lock body scroll when search is open
    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isSearchOpen]);

    // Combine local static catalog and live API results
    const combinedResults = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();

        // Filter local items
        const localMatches = searchableItems.filter(item => {
            if (!q) return true;
            return (
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.tags.some(tag => tag.includes(q))
            );
        });

        const seenKeys = new Set<string>();
        const merged: SearchItem[] = [];

        for (const item of localMatches) {
            const key = `${item.title}-${item.href}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                merged.push(item);
            }
        }

        for (const item of apiResults) {
            const key = `${item.title}-${item.href}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                merged.push(item);
            }
        }

        // Apply category filter
        if (activeFilter === "all") return merged;

        return merged.filter(item => {
            if (activeFilter === "Peluang & Agenda") {
                return item.category === "Peluang & Agenda" || item.category === "Lowongan" || item.category === "Agenda" || item.category === "Pelatihan";
            }
            if (activeFilter === "Lowongan") {
                return item.category === "Lowongan" || item.category === "Peluang & Agenda";
            }
            if (activeFilter === "Agenda") {
                return item.category === "Agenda" || item.category === "Pelatihan" || item.category === "Peluang & Agenda";
            }
            if (activeFilter === "Pelatihan") {
                return item.category === "Pelatihan" || item.category === "Agenda";
            }
            return item.category === activeFilter;
        });
    }, [searchQuery, apiResults, activeFilter]);

    const handleResultClick = useCallback((href: string) => {
        setIsSearchOpen(false);
        if (href.startsWith('http')) {
            window.open(href, '_blank', 'noopener,noreferrer');
        } else {
            router.push(href);
        }
    }, [router]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Peluang & Agenda": return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
            case "Lowongan": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
            case "Agenda": return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
            case "Pelatihan": return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800";
            case "Berita": return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
            case "Dokumen": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
            case "Layanan": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
            case "Informasi": return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800";
            case "Profil": return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700";
            case "Pengaduan": return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
            default: return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
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
                                {isLoadingApi ? (
                                    <Loader2 className="w-5 h-5 text-[#1E3A8A] dark:text-[#93C5FD] animate-spin shrink-0" />
                                ) : (
                                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                                )}
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari layanan, peluang karir, agenda, berita, dokumen..."
                                    className="flex-1 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none bg-transparent"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700"
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
                                {combinedResults.length > 0 ? (
                                    <div className="py-2">
                                        {combinedResults.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleResultClick(item.href)}
                                                className="w-full flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors text-left group"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#0F172A] group-hover:bg-[#EFF6FF] dark:group-hover:bg-[#1E3A8A]/20 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                                                    <item.icon className="w-4 h-4 text-gray-500 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors" />
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
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] shrink-0 mt-2.5 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Search className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">Tidak ada hasil ditemukan</p>
                                        <p className="text-xs text-gray-400/80 dark:text-gray-600 mt-1">Coba kata kunci seperti &quot;peluang&quot;, &quot;agenda&quot;, &quot;pelatihan&quot;, atau &quot;loker&quot;</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-[#0F172A]">
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {combinedResults.length} hasil ditemukan {isLoadingApi && "(memuat data terkini...)"}
                                </span>
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 font-mono shadow-sm">Esc</kbd> tutup
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
