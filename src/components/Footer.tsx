"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, ExternalLink, Users, Eye } from "lucide-react";

export default function Footer() {
    const [stats, setStats] = useState({ total: 0, today: 0 });

    useEffect(() => {
        // Only fetch stats (tracking is handled by VisitorTracker)
        fetch("/api/visitors")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(() => {});
    }, []);

    return (
        <footer className="bg-[#071B3A] text-white mt-auto">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 xl:px-12 pt-14 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

                    {/* Column 1: Brand */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 shrink-0">
                                <img src="/images/logokabserang.png" alt="Logo Kab Serang" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-px h-9 bg-white/15 mx-0.5"></div>
                            <div className="flex flex-col">
                                <span className="text-white font-extrabold text-[13px] tracking-tight leading-[1.15]">
                                    Dinas Tenaga Kerja <br />
                                    &amp; Transmigrasi
                                </span>
                                <span className="text-white/40 text-[10px] font-medium tracking-wide mt-0.5">Pemerintah Kabupaten Serang</span>
                            </div>
                        </div>
                        <p className="text-white/40 text-[13px] leading-relaxed max-w-[260px]">
                            Melayani dengan integritas untuk kesejahteraan masyarakat Kabupaten Serang.
                        </p>
                        {/* Social Icons */}
                        <div className="flex items-center gap-2">
                            <a href="https://www.facebook.com/DisnakertransKab.Srg/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.07] text-white/50 flex items-center justify-center hover:bg-[#FBBF24]/15 hover:text-[#FBBF24] transition-all" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/disnakertrans.kabserang?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.07] text-white/50 flex items-center justify-center hover:bg-[#FBBF24]/15 hover:text-[#FBBF24] transition-all" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a href="https://www.threads.com/@disnakertrans.kabserang" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.07] text-white/50 flex items-center justify-center hover:bg-[#FBBF24]/15 hover:text-[#FBBF24] transition-all" aria-label="Threads">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.698 6.542 2.717 2.227-.017 4.08-.625 5.51-1.807 1.573-1.3 2.394-3.045 2.439-5.183.026-1.177-.24-2.126-.79-2.823-.524-.665-1.27-1.058-2.22-1.169a7.5 7.5 0 0 1-.093 1.596c-.259 1.4-.837 2.542-1.717 3.395-.896.869-2.02 1.353-3.34 1.44-1.07.07-2.09-.18-2.95-.721-.91-.573-1.54-1.42-1.82-2.453-.32-1.17-.18-2.378.39-3.39.55-.977 1.44-1.69 2.58-2.06.92-.3 1.91-.4 2.92-.3.06-.53.08-1.07.06-1.61l2.12.03c.03.72 0 1.43-.1 2.12 1.16.28 2.1.86 2.77 1.73.78.98 1.18 2.275 1.15 3.85-.05 2.63-1.1 4.82-3.12 6.49-1.81 1.5-4.08 2.27-6.74 2.29zm-.49-7.94c.86-.05 1.57-.36 2.13-.93.58-.58.98-1.39 1.18-2.42.12-.65.15-1.3.09-1.93-.7-.08-1.41-.04-2.13.13-.8.24-1.41.67-1.76 1.28-.35.62-.44 1.33-.26 2 .17.63.55 1.11 1.08 1.39.33.19.71.34 1.15.42.15.03.31.05.47.06z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Contact */}
                    <div>
                        <h4 className="text-[10px] font-bold mb-6 text-[#FBBF24]/70 tracking-[0.2em] uppercase">Hubungi Kami</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-md bg-[#FBBF24]/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#FBBF24]" />
                                </div>
                                <span className="text-white/50 text-[13px] leading-relaxed">Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kab. Serang</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-md bg-[#FBBF24]/10 flex items-center justify-center shrink-0">
                                    <Phone className="w-3.5 h-3.5 text-[#FBBF24]" />
                                </div>
                                <span className="text-white/50 text-[13px]">(0254) 200234</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-md bg-[#FBBF24]/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-3.5 h-3.5 text-[#FBBF24]" />
                                </div>
                                <a href="mailto:disnakertrans@serangkab.go.id" className="text-white/50 text-[13px] hover:text-white transition-colors">
                                    disnakertrans@serangkab.go.id
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Location */}
                    <div>
                        <h4 className="text-[10px] font-bold mb-6 text-[#FBBF24]/70 tracking-[0.2em] uppercase">Lokasi Kantor</h4>
                        <p className="text-white/50 text-[13px] leading-relaxed mb-5">
                            Kawasan Pusat Pemerintahan Kabupaten Serang, Provinsi Banten.
                        </p>
                        <a
                            href="https://maps.app.goo.gl/wTa7unGsbCJjCZdb8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white/[0.07] hover:bg-[#FBBF24]/15 text-white/60 hover:text-[#FBBF24] text-xs font-semibold px-4 py-2.5 rounded-lg transition-all border border-white/[0.07] hover:border-[#FBBF24]/20"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Lihat di Google Maps
                        </a>
                    </div>

                    {/* Column 4: Visitor Stats */}
                    <div>
                        <h4 className="text-[10px] font-bold mb-6 text-[#FBBF24]/70 tracking-[0.2em] uppercase">Statistik Pengunjung</h4>
                        <div className="bg-white/[0.04] rounded-xl border border-white/[0.08] p-5 space-y-4">
                            {/* Total Visitors */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4 text-[#FBBF24]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-white/35 font-medium tracking-wider uppercase">Total Kunjungan</p>
                                    <p className="text-xl font-extrabold text-[#FBBF24] tracking-tight leading-tight">
                                        {stats.total.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            {/* Divider */}
                            <div className="h-px bg-white/[0.06]"></div>
                            {/* Today Visitors */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                                    <Eye className="w-4 h-4 text-white/40" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-white/35 font-medium tracking-wider uppercase">Kunjungan Hari Ini</p>
                                    <p className="text-xl font-extrabold text-white/80 tracking-tight leading-tight">
                                        {stats.today.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-white/[0.06]">
                <div className="container mx-auto px-4 xl:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-[11px] text-white/25">
                        © {new Date().getFullYear()} Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang. Hak Cipta Dilindungi.
                    </p>
                    <a
                        href="/admin/login"
                        className="text-[10px] text-white/10 hover:text-white/25 transition-colors"
                        title="Panel Administrator"
                    >
                        Admin
                    </a>
                </div>
            </div>
        </footer>
    );
}
