"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Briefcase, GraduationCap, FileText, AlertCircle, Sparkles, CheckCircle2, MessageSquareText } from "lucide-react";

interface HeroSectionProps {
  heroSubtitle?: string | null;
  heroCtaText?: string | null;
  heroCtaLink?: string | null;
}

export default function HeroSection({ heroSubtitle, heroCtaText, heroCtaLink }: HeroSectionProps) {
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-search-modal", { detail: { query: trimmed } }));
    }
  };

  const handleQuickTask = (keyword: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-search-modal", { detail: { query: keyword } }));
    }
  };

  const openChatbot = () => {
    if (typeof window !== "undefined") {
      const chatBtn = document.querySelector('button[aria-label*="Kang SATRIA"]') as HTMLButtonElement | null;
      if (chatBtn) {
        chatBtn.click();
      }
    }
  };

  return (
    <>
      {/* ─── UCD CITIZEN-CENTRIC HERO SECTION DENGAN VIDEO BACKGROUND ─── */}
      <section className="relative w-full overflow-hidden bg-[#0A192F] text-white pt-[104px] pb-10 sm:pt-28 sm:pb-14 md:pt-32 md:pb-18 border-b border-white/10">
        {/* Background Video Looping & Scrim */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-65 filter brightness-95 contrast-105"
          >
            <source src="/videos/beranda.mp4" type="video/mp4" />
          </video>

          {/* Scrim Overlay untuk menjaga kontras teks dan kolom pencarian tanpa menenggelamkan video */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/70 via-[#0A192F]/45 to-[#0A192F]/90" />

          {/* Ambient Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-blue-600/20 blur-[130px] rounded-full" />
          <div className="absolute top-1/4 -right-24 w-80 h-80 bg-[#FBBF24]/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-indigo-600/15 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 xl:px-12 relative z-10 max-w-5xl text-center">
          {/* Top Pill / Badge (Kompak di HP, tidak wrap berantakan) */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white/90 tracking-wide uppercase mb-3 sm:mb-5 bg-white/10 backdrop-blur-md shadow-sm whitespace-nowrap">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Pemkab Serang • Disnakertrans</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.18] text-white mb-2.5 sm:mb-4">
            Layanan Ketenagakerjaan Terpadu <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-[#FBBF24]">
              Kabupaten Serang
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-5 sm:mb-8 leading-relaxed font-normal">
            {heroSubtitle ||
              "Portal resmi pelayanan publik untuk pembuatan Kartu AK-1, informasi bursa lowongan kerja terverifikasi, pelatihan vokasi BLK, dan pengaduan ketenagakerjaan."}
          </p>

          {/* ── SMART SEARCH BOX (UCD Centerpiece) ── */}
          <div className="max-w-2xl mx-auto mb-4 sm:mb-6">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white dark:bg-[#1E293B] rounded-xl sm:rounded-2xl shadow-2xl p-1.5 sm:p-2.5 border border-white/20 transition-all focus-within:ring-4 focus-within:ring-[#FBBF24]/30"
              style={{
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="pl-2.5 sm:pl-4 text-gray-400">
                <Search className="w-4 h-4 sm:w-6 sm:h-6 text-[#1E3A8A] dark:text-[#93C5FD]" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari layanan, info loker, pelatihan BLK..."
                className="w-full bg-transparent px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="bg-[#FBBF24] hover:bg-[#FCD34D] text-[#1E3A8A] font-extrabold px-4 sm:px-7 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Cari</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </form>
          </div>

          {/* ── POPULAR TASK PILLS ── */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-3xl mx-auto text-[11px] sm:text-xs">
            <span className="text-white/60 font-medium mr-1 hidden sm:inline">Paling sering dicari:</span>
            
            <button
              type="button"
              onClick={() => handleQuickTask("Kartu AK-1")}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/15 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FBBF24]" />
              <span>Kartu AK-1 (Kuning)</span>
            </button>

            <Link
              href="/peluang"
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/15 backdrop-blur-xs transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-400" />
              <span>Bursa Lowongan Kerja</span>
            </Link>

            <Link
              href="/pelatihan"
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/15 backdrop-blur-xs transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pelatihan Kerja BLK</span>
            </Link>

            <Link
              href="/pengaduan"
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/15 backdrop-blur-xs transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Pengaduan Online</span>
            </Link>

            <button
              type="button"
              onClick={openChatbot}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#FBBF24]/20 hover:bg-[#FBBF24]/30 text-[#FCD34D] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#FBBF24]/30 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-[#FCD34D]" />
              <span>Butuh Bantuan?</span>
            </button>
          </div>

          {/* ── 3 QUICK STATS / TRUST PILLARS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-8 pt-6 sm:mt-12 sm:pt-8 border-t border-white/10 max-w-4xl mx-auto text-left">
            <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">Jangkauan Wilayah</p>
                <p className="text-sm font-bold text-white">29 Kecamatan Serang</p>
              </div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <div>
                <p className="text-xs text-white/60">Vokasi & Sertifikasi</p>
                <p className="text-sm font-bold text-white">Pelatihan BLK Gratis</p>
              </div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">Pelayanan Cepat</p>
                <p className="text-sm font-bold text-white">AK-1 & Aduan Terpadu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KOMITMEN PIMPINAN DAERAH (RESPONSIF DESKTOP & MOBILE) ─── */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-white to-[#F8FAFC] dark:from-[#0B1120] dark:to-[#0F172A] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 xl:px-12">
          <div className="bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#EFF6FF] dark:from-[#1E293B] dark:via-[#131F37] dark:to-[#0F172A] rounded-3xl p-6 sm:p-8 lg:p-10 border border-blue-100 dark:border-gray-700/80 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Foto Pimpinan Daerah */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[360px] rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-700 bg-white dark:bg-[#1E293B]">
                  <img
                    src="/images/bupati-mobile.png"
                    alt="Bupati Hj. Ratu Rachmatuzakiyah dan Wakil Bupati Muhammad Najib Hamas"
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-3 bg-[#0A192F] text-center text-white border-t border-white/10">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#FBBF24]">
                      Pimpinan Pemerintah Kabupaten Serang
                    </p>
                    <p className="text-[10px] text-white/70">Masa Jabatan 2025 – 2030</p>
                  </div>
                </div>
              </div>

              {/* Kutipan & Komitmen Visi */}
              <div className="lg:col-span-7 text-left space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1E3A8A]/10 dark:bg-white/10 px-3.5 py-1 text-[11px] font-bold text-[#1E3A8A] dark:text-[#93C5FD] tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] dark:bg-[#93C5FD]" />
                  Komitmen Pimpinan Daerah
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  Mewujudkan Tenaga Kerja Kabupaten Serang yang Unggul, Berdaya Saing & Bahagia
                </h2>

                <blockquote className="border-l-4 border-[#FBBF24] pl-4 py-1 text-sm sm:text-base text-gray-700 dark:text-gray-100 italic leading-relaxed font-medium">
                  &ldquo;Optimalisasi penyerapan tenaga kerja lokal, penguatan kompetensi vokasi berbasis industri, serta pelayanan perizinan dan hubungan industrial yang harmonis adalah prioritas kami untuk kemakmuran wargi Kabupaten Serang.&rdquo;
                </blockquote>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700/60">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <p className="font-bold text-gray-900 dark:text-white">Hj. Ratu Rachmatuzakiyah, S.Pd., M.M.</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Bupati Serang bersama Wakil Bupati Muhammad Najib Hamas, S.E., M.M.</p>
                  </div>

                  <Link
                    href="/profil"
                    className="inline-flex items-center gap-2 text-[#1E3A8A] dark:text-[#93C5FD] font-bold text-xs hover:underline shrink-0"
                  >
                    <span>Visi & Misi Selengkapnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
