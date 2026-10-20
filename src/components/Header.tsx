"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    Search, Menu, X, ArrowRight, FileText, Briefcase, MapPin, 
    Users, Scale, GraduationCap, Building2, Megaphone,
    Calendar, Sparkles, Newspaper, ExternalLink, Loader2,
    Mic, MicOff, HelpCircle, Phone, MessageSquare
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    // Lacak Status Pengaduan
    { 
        title: "Lacak Status Pengaduan & Surat", 
        description: "Pantau perkembangan dan balasan resmi pengaduan Anda menggunakan Nomor Tiket, No HP/WhatsApp, atau NIK", 
        href: "/tracking", 
        category: "Layanan", 
        icon: Search, 
        tags: ["lacak", "tracking", "status", "cek status", "pengaduan", "surat", "tiket", "nomor tiket", "nomor telepon", "nik", "balasan", "pantau"] 
    },
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
    const [isListening, setIsListening] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    // Voice search (Web Speech API)
    const toggleListening = () => {
        setSpeechError(null);
        if (typeof window === "undefined") return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechError("Pencarian suara belum didukung di peramban ini. Silakan ketik kata kunci Anda.");
            setTimeout(() => setSpeechError(null), 4000);
            return;
        }

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = "id-ID";
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results?.[0]?.[0]?.transcript;
                if (transcript) {
                    setSearchQuery(transcript);
                }
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                if (event.error !== "no-speech") {
                    setSpeechError("Suara tidak terdengar jelas, silakan klik lagi dan bicara lebih dekat.");
                    setTimeout(() => setSpeechError(null), 3500);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.warn("[Voice Search Exception]:", err);
            setIsListening(false);
        }
    };

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
            setSelectedIndex(0);
        } else {
            setSearchQuery("");
            setActiveFilter("all");
            setApiResults([]);
            setIsListening(false);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch {}
            }
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

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery, activeFilter]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (combinedResults.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % combinedResults.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + combinedResults.length) % combinedResults.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (combinedResults[selectedIndex]) {
                handleResultClick(combinedResults[selectedIndex].href);
            }
        }
    };

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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
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
                            className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[92vh] my-auto"
                        >
                            {/* Search Input Bar */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 shrink-0">
                                {isLoadingApi ? (
                                    <Loader2 className="w-5 h-5 text-[#1E3A8A] dark:text-[#93C5FD] animate-spin shrink-0" />
                                ) : (
                                    <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                                )}
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder="Cari layanan, peluang karir, agenda, berita, dokumen..."
                                    className="flex-1 text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 font-medium focus:outline-none bg-transparent"
                                />
                                {searchQuery && (
                                    <button 
                                        type="button" 
                                        onClick={() => setSearchQuery("")} 
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                                        title="Hapus pencarian"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                {/* Voice Search Button */}
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={clsx(
                                        "p-2 rounded-xl transition-all relative flex items-center justify-center shrink-0",
                                        isListening
                                            ? "bg-red-500 text-white animate-pulse ring-4 ring-red-300 dark:ring-red-900"
                                            : "text-gray-500 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#FBBF24] hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                    title={isListening ? "Sedang mendengarkan... Bicara sekarang" : "Pencarian Suara (Bicara)"}
                                    aria-label="Pencarian Suara"
                                >
                                    {isListening ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-[10px] font-bold text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-700"
                                >
                                    ESC
                                </button>
                            </div>

                            {/* Voice Search Listening / Error Banner */}
                            {isListening && (
                                <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 px-5 py-2.5 flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <p className="text-xs font-semibold text-red-700 dark:text-red-300 flex-1">
                                        Mendengarkan suara Anda... Silakan sebutkan kata kunci (contoh: <em>&quot;Kartu Kuning&quot;</em> atau <em>&quot;Pelatihan BLK&quot;</em>)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        className="text-xs font-bold text-red-700 dark:text-red-300 underline hover:no-underline"
                                    >
                                        Batal
                                    </button>
                                </div>
                            )}

                            {speechError && (
                                <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-5 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                        <span>{speechError}</span>
                                    </div>
                                    <button type="button" onClick={() => setSpeechError(null)} className="font-bold text-amber-700 ml-2">×</button>
                                </div>
                            )}

                            {/* Goal-Oriented Quick Task Shortcuts (Empty State UCD) */}
                            {!searchQuery.trim() && activeFilter === "all" && (
                                <div className="px-5 pt-3.5 pb-4 border-b border-gray-100 dark:border-gray-700/60 bg-blue-50/30 dark:bg-blue-950/20 shrink-0">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] dark:text-[#93C5FD] flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                            Kebutuhan Cepat Warga (Paling Sering Dicari)
                                        </span>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:inline">Pilih langsung tanpa mengetik</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleResultClick('/layanan-publik#tutorial-ak1')}
                                            className="p-3 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-white dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all text-left flex items-start gap-3 group shadow-xs"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#1E3A8A] dark:text-[#93C5FD] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD]">Buat Kartu Kuning (AK-1)</span>
                                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">Utama</span>
                                                </div>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug mt-0.5">Syarat & daftar online via Serang Bahagia</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleResultClick('/peluang#lowongan')}
                                            className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-white dark:bg-[#0F172A] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 transition-all text-left flex items-start gap-3 group shadow-xs"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">Cari Loker Pabrik / Industri</span>
                                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded">Terbaru</span>
                                                </div>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug mt-0.5">Loker terverifikasi kawasan industri Serang</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleResultClick('/pelatihan')}
                                            className="p-3 rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-white dark:bg-[#0F172A] hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-300 transition-all text-left flex items-start gap-3 group shadow-xs"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                                <GraduationCap className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300">Daftar Pelatihan BLK Gratis</span>
                                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-200 rounded">100% Gratis</span>
                                                </div>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug mt-0.5">Kursus las, otomotif, jahit bersertifikat BNSP</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleResultClick('/pengaduan')}
                                            className="p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-white dark:bg-[#0F172A] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-all text-left flex items-start gap-3 group shadow-xs"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                                                <Scale className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-300">Lapor Sengketa Gaji / PHK</span>
                                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 rounded">Rahasia</span>
                                                </div>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug mt-0.5">Mediasi hubungan industrial & hak pesangon</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 dark:border-gray-700 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
                                {filterCategories.map(f => (
                                    <button
                                        key={f.value}
                                        type="button"
                                        onClick={() => setActiveFilter(f.value)}
                                        className={clsx(
                                            "text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap border",
                                            activeFilter === f.value
                                                ? "bg-[#0A192F] dark:bg-[#FBBF24] text-white dark:text-[#0A192F] border-[#0A192F] dark:border-[#FBBF24] shadow-xs"
                                                : "bg-white dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Results */}
                            <div className="flex-1 min-h-[120px] max-h-[32vh] sm:max-h-[38vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                {combinedResults.length > 0 ? (
                                    <div className="py-2">
                                        {combinedResults.map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleResultClick(item.href)}
                                                className={clsx(
                                                    "w-full flex items-start gap-4 px-5 py-3 transition-colors text-left group border-l-4",
                                                    selectedIndex === idx
                                                        ? "bg-blue-50/90 dark:bg-[#0F172A] border-l-[#1E3A8A] dark:border-l-[#FBBF24]"
                                                        : "hover:bg-gray-50 dark:hover:bg-[#0F172A]/70 border-l-transparent"
                                                )}
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#0F172A] group-hover:bg-[#EFF6FF] dark:group-hover:bg-[#1E3A8A]/20 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                                                    <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className={clsx("text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0", getCategoryColor(item.category))}>
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{item.description}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] shrink-0 mt-2.5 opacity-60 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center px-4">
                                        <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-base font-bold text-gray-800 dark:text-gray-200">Tidak ada hasil ditemukan</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Coba gunakan kata kunci umum seperti &quot;loker&quot;, &quot;kartu kuning&quot;, &quot;pelatihan&quot;, atau klik tombol mikrofon untuk bicara.</p>
                                    </div>
                                )}
                            </div>

                            {/* Safety Net Helpdesk Banner */}
                            <div className="px-5 py-2.5 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-[#1E3A8A] dark:bg-[#FBBF24] text-white dark:text-[#0A192F] flex items-center justify-center shrink-0 shadow-xs">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">Masih bingung mencari layanan?</p>
                                        <p className="text-[11px] text-gray-600 dark:text-gray-300">Konsultasi interaktif via Live Chat Petugas (Jam Kerja) atau buat pengaduan resmi</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Link
                                        href="/livechat"
                                        onClick={() => setIsSearchOpen(false)}
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors shadow-xs"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Live Chat Petugas
                                    </Link>
                                    <Link
                                        href="/pengaduan"
                                        onClick={() => setIsSearchOpen(false)}
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A8A] text-white text-xs font-bold hover:bg-[#1e40af] transition-colors shadow-xs"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5" />
                                        Pusat Pengaduan
                                    </Link>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-2.5 flex items-center justify-between bg-gray-50/70 dark:bg-[#0F172A] text-[11px] text-gray-500 dark:text-gray-400 shrink-0">
                                <span>
                                    {combinedResults.length} pilihan tersedia {isLoadingApi && "(memuat data terkini...)"}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="hidden sm:inline-flex items-center gap-1">
                                        <kbd className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 font-mono shadow-xs text-[10px]">↑↓</kbd> geser
                                    </span>
                                    <span className="hidden sm:inline-flex items-center gap-1">
                                        <kbd className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 font-mono shadow-xs text-[10px]">Enter</kbd> buka
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <kbd className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 font-mono shadow-xs text-[10px]">Esc</kbd> tutup
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
