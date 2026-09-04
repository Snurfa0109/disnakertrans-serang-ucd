"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, ExternalLink, Users, Eye, TrendingUp } from "lucide-react";

interface ContactInfo {
    address: string;
    phone: string;
    email: string;
    facebook: string;
    instagram: string;
    threads: string;
    playstore: string;
    maps_url: string;
}

const DEFAULTS: ContactInfo = {
    address: "Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kab. Serang",
    phone: "(0254) 200234",
    email: "disnakertrans@serangkab.go.id",
    facebook: "https://www.facebook.com/DisnakertransKab.Srg/",
    instagram: "https://www.instagram.com/disnakertrans.kabserang",
    threads: "https://www.threads.com/@disnakertrans.kabserang",
    playstore: "https://play.google.com/store/apps/details?id=id.citigov.serangkab",
    maps_url: "https://maps.app.goo.gl/wTa7unGsbCJjCZdb8",
};

export default function Footer() {
    const [stats, setStats] = useState({ total: 0, today: 0 });
    const [contact, setContact] = useState<ContactInfo>(DEFAULTS);

    useEffect(() => {
        // Fetch visitor stats
        fetch("/api/visitors")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(() => {});

        // Fetch contact info from CMS
        const applyContent = (items: { key: string; value: string }[]) => {
            const map: Record<string, string> = {};
            items.forEach((item) => { map[item.key] = item.value; });
            setContact((prev) => ({
                address:   map['contact_address']   || prev.address,
                phone:     map['contact_phone']     || prev.phone,
                email:     map['contact_email']     || prev.email,
                facebook:  map['social_facebook']   || map['contact_facebook']  || prev.facebook,
                instagram: map['social_instagram']  || map['contact_instagram'] || prev.instagram,
                threads:   map['social_threads']    || map['contact_threads']   || prev.threads,
                playstore: map['social_playstore']  || map['contact_playstore'] || prev.playstore,
                maps_url:  map['contact_maps_url']  || prev.maps_url,
            }));
        };

        Promise.all([
            fetch("/api/admin/content?section=contact").then((r) => r.json()),
            fetch("/api/admin/content?section=social").then((r) => r.json()),
        ]).then(([contactData, socialData]) => {
            const items = [
                ...(Array.isArray(contactData.data) ? contactData.data : []),
                ...(Array.isArray(socialData.data) ? socialData.data : []),
            ];
            if (items.length > 0) applyContent(items);
        }).catch(() => {});
    }, []);

    return (
        <footer className="bg-[#071B3A] text-white mt-auto">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 xl:px-12 pt-14 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">

                    {/* Column 1: Brand + Social + Compact Visitor Stats */}
                    <div className="space-y-4">
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
                        <p className="text-white/40 text-[13px] leading-relaxed max-w-[280px]">
                            Melayani dengan integritas untuk kesejahteraan masyarakat Kabupaten Serang.
                        </p>
                        {/* Social Icons */}
                        <div className="flex items-center gap-2">
                            <a href={contact.facebook} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-white/[0.07] text-white/50 flex items-center justify-center hover:bg-[#FBBF24]/15 hover:text-[#FBBF24] transition-all" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a href={contact.instagram} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-white/[0.07] text-white/50 flex items-center justify-center hover:bg-[#FBBF24]/15 hover:text-[#FBBF24] transition-all" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a href={contact.threads} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-white/[0.07] text-white/50 flex items-center justify-center hover:bg-[#FBBF24]/15 hover:text-[#FBBF24] transition-all" aria-label="Threads">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.698 6.542 2.717 2.227-.017 4.08-.625 5.51-1.807 1.573-1.3 2.394-3.045 2.439-5.183.026-1.177-.24-2.126-.79-2.823-.524-.665-1.27-1.058-2.22-1.169a7.5 7.5 0 0 1-.093 1.596c-.259 1.4-.837 2.542-1.717 3.395-.896.869-2.02 1.353-3.34 1.44-1.07.07-2.09-.18-2.95-.721-.91-.573-1.54-1.42-1.82-2.453-.32-1.17-.18-2.378.39-3.39.55-.977 1.44-1.69 2.58-2.06.92-.3 1.91-.4 2.92-.3.06-.53.08-1.07.06-1.61l2.12.03c.03.72 0 1.43-.1 2.12 1.16.28 2.1.86 2.77 1.73.78.98 1.18 2.275 1.15 3.85-.05 2.63-1.1 4.82-3.12 6.49-1.81 1.5-4.08 2.27-6.74 2.29zm-.49-7.94c.86-.05 1.57-.36 2.13-.93.58-.58.98-1.39 1.18-2.42.12-.65.15-1.3.09-1.93-.7-.08-1.41-.04-2.13.13-.8.24-1.41.67-1.76 1.28-.35.62-.44 1.33-.26 2 .17.63.55 1.11 1.08 1.39.33.19.71.34 1.15.42.15.03.31.05.47.06z"/>
                                </svg>
                            </a>
                            <a href={contact.playstore} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-white/[0.07] text-white/50 flex items-center justify-center hover:bg-[#FBBF24]/15 hover:text-[#FBBF24] transition-all" aria-label="Google Play Store" title="Aplikasi Serang Bahagia di Play Store">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 0 1-.61-1.586V3.4a2.37 2.37 0 0 1 .609-1.586zm11.6 11.6l2.366 2.366-10.457 6.037 8.091-8.403zm0-2.828L7.118 2.183l10.457 6.037-2.366 2.366zm1.414 1.414l3.826 2.21a1.2 1.2 0 0 1 0 2.078l-3.826 2.21-2.42-2.42 2.42-2.078z"/>
                                </svg>
                            </a>
                        </div>

                        {/* Visitor Statistics (Horizontal Side-by-Side Card) */}
                        <div className="pt-2 border-t border-white/[0.08] mt-3">
                            <h4 className="text-[10px] font-bold mb-2 text-[#FBBF24]/70 tracking-[0.15em] uppercase">Statistik Pengunjung</h4>
                            <div className="bg-white/[0.04] rounded-xl border border-white/[0.08] p-3 flex items-center gap-3">
                                {/* Total Kunjungan */}
                                <div className="flex-1 flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center shrink-0">
                                        <Users className="w-3.5 h-3.5 text-[#FBBF24]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] text-white/35 font-bold tracking-wider uppercase leading-none">Total Kunjungan</p>
                                        <p className="text-sm font-extrabold text-[#FBBF24] tracking-tight leading-tight mt-0.5">
                                            {stats.total.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>

                                {/* Vertical Divider */}
                                <div className="w-px h-7 bg-white/[0.08] shrink-0"></div>

                                {/* Kunjungan Hari Ini */}
                                <div className="flex-1 flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                                        <Eye className="w-3.5 h-3.5 text-white/40" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] text-white/35 font-bold tracking-wider uppercase leading-none">Kunjungan Hari Ini</p>
                                        <p className="text-sm font-extrabold text-white/80 tracking-tight leading-tight mt-0.5">
                                            {stats.today.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>
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
                                <span className="text-white/50 text-[13px] leading-relaxed">{contact.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-md bg-[#FBBF24]/10 flex items-center justify-center shrink-0">
                                    <Phone className="w-3.5 h-3.5 text-[#FBBF24]" />
                                </div>
                                <span className="text-white/50 text-[13px]">{contact.phone}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-md bg-[#FBBF24]/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-3.5 h-3.5 text-[#FBBF24]" />
                                </div>
                                <a href={`mailto:${contact.email}`} className="text-white/50 text-[13px] hover:text-white transition-colors">
                                    {contact.email}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Location */}
                    <div>
                        <h4 className="text-[10px] font-bold mb-6 text-[#FBBF24]/70 tracking-[0.2em] uppercase">Lokasi Kantor</h4>
                        <p className="text-white/50 text-[13px] leading-relaxed mb-4">
                            Kawasan Pusat Pemerintahan Kabupaten Serang, Provinsi Banten.
                        </p>
                        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 shadow-inner group">
                            <iframe
                                title="Lokasi Disnakertrans Kabupaten Serang"
                                src="https://maps.google.com/maps?q=Dinas+Tenaga+Kerja+Dan+Transmigrasi+Kabupaten+Serang&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                className="w-full h-full border-0 grayscale-[20%] opacity-90 group-hover:opacity-100 transition-opacity"
                                loading="lazy"
                                allowFullScreen
                            ></iframe>
                            <a
                                href={contact.maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-2 right-2 bg-[#071B3A]/90 hover:bg-[#071B3A] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5 backdrop-blur-sm shadow-md transition-all hover:border-[#FBBF24]/40 hover:text-[#FBBF24]"
                            >
                                <MapPin className="w-3 h-3 text-[#FBBF24]" />
                                Perbesar Peta <ExternalLink className="w-2.5 h-2.5" />
                            </a>
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
