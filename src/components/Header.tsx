"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Profil", href: "/profil" },
    { name: "Informasi Publik", href: "/informasi-publik" },
    { name: "Layanan Publik", href: "/layanan-publik" },
    { name: "Pengaduan", href: "/pengaduan" },
];

export default function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={clsx(
                "fixed top-0 w-full z-50 transition-all duration-300",
                scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-md py-3"
                    : "bg-white py-4 border-b border-gray-100"
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
                            <span className="font-extrabold text-[#1E3A8A] text-xs lg:text-[15px] tracking-tight leading-[1.1]">
                                Dinas Tenaga Kerja <br className="hidden sm:block" />
                                & Transmigrasi
                            </span>
                            <span className="text-gray-500 text-[9px] lg:text-[11px] tracking-wide mt-0.5">Pemerintah Kabupaten Serang</span>
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
                                        ? "text-[#1E3A8A]"
                                        : "text-gray-600 hover:text-[#1E3A8A]"
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

                    {/* RIGHT: Search Button */}
                    <div className="hidden xl:flex items-center">
                        <button className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="xl:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="xl:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden mt-4 absolute left-0 w-full"
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
                                            ? "bg-[#EFF6FF] text-[#1E3A8A]"
                                            : "text-gray-700 hover:bg-gray-50"
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
    );
}
