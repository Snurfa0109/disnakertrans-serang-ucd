"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Briefcase, GraduationCap, MapPin, ArrowRight, ExternalLink, Clock, Building2, Layers } from 'lucide-react';
import { PelatihanItem, LowonganItem, EventItem } from '@/components/AgendaHub';

interface PeluangSummaryProps {
  pelatihanList: PelatihanItem[];
  lowonganList: LowonganItem[];
  eventList?: EventItem[];
}

export default function PeluangSummary({ pelatihanList = [], lowonganList = [], eventList = [] }: PeluangSummaryProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  // Take 1 item from each category
  const topJob = lowonganList[0] || null;
  const topPelatihan = pelatihanList[0] || null;
  const topEvent = (eventList.length > 0 ? eventList : [
    {
      id: 101,
      title: 'Job Fair Terpadu Kabupaten Serang 2026',
      location: 'Alun-alun Puspemkab Serang, Ciruas',
      date: '2026-09-15',
      organizer: 'Disnakertrans Kab. Serang',
    }
  ])[0];

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full">
      {/* ── Section Header ── */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" />
          Agenda & Peluang Terkini
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          Agenda & Peluang Ketenagakerjaan
        </h2>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed">
          Update informasi lowongan pekerjaan resmi, program pelatihan vokasi gratis, dan agenda kegiatan di Kabupaten Serang.
        </p>
      </div>

      {/* ── 3 Clean & Balanced Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-stretch">

        {/* CARD 1: LOWONGAN KERJA */}
        {topJob ? (
          <div className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-sm h-full">
            <div>
              {/* Header Icon + Badge + Company */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 overflow-hidden">
                  {topJob.logo_url && !logoFailed ? (
                    <img
                      src={topJob.logo_url}
                      alt={topJob.company}
                      className="w-full h-full object-contain p-1"
                      onError={() => setLogoFailed(true)}
                    />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-semibold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded mb-1">
                    {topJob.category === 'Luar Negeri' ? 'Luar Negeri' : 'Lowongan Kerja'}
                  </span>
                  <p className="text-xs text-slate-300 font-medium truncate">{topJob.company}</p>
                </div>
              </div>

              {/* Title with fixed min-height for baseline alignment */}
              <h4 className="text-base font-bold text-white mb-4 leading-snug line-clamp-2 min-h-[44px]">
                {topJob.title}
              </h4>

              {/* Metadata */}
              <div className="space-y-2 text-xs text-slate-300 mb-6 pt-3 border-t border-slate-700/60">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{topJob.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{topJob.job_type} • {topJob.education}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Batas: {topJob.deadline || 'Sesuai Ketentuan'}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href={topJob.source_url || "https://karirhub.kemnaker.go.id/lowongan-dalam-negeri/lowongan"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-blue-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-blue-600"
            >
              Lihat Detail Lowongan <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 text-center text-slate-400 flex items-center justify-center text-xs h-full min-h-[260px]">
            Belum ada data lowongan.
          </div>
        )}

        {/* CARD 2: PELATIHAN KERJA */}
        {topPelatihan ? (
          <div className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-sm h-full">
            <div>
              {/* Header Icon + Badge + Source */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded mb-1">
                    Pelatihan Vokasi Gratis
                  </span>
                  <p className="text-xs text-slate-300 font-medium">BBPVP / Disnakertrans</p>
                </div>
              </div>

              {/* Title with fixed min-height for baseline alignment */}
              <h4 className="text-base font-bold text-white mb-4 leading-snug line-clamp-2 min-h-[44px]">
                {topPelatihan.title}
              </h4>

              {/* Metadata */}
              <div className="space-y-2 text-xs text-slate-300 mb-6 pt-3 border-t border-slate-700/60">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{topPelatihan.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{topPelatihan.time_start || '08:00'} - {topPelatihan.time_end || '15:00'} WIB</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Mulai: {formatDate(topPelatihan.date)}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="/pelatihan"
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-emerald-600"
            >
              Detail Pelatihan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 text-center text-slate-400 flex items-center justify-center text-xs h-full min-h-[260px]">
            Belum ada jadwal pelatihan.
          </div>
        )}

        {/* CARD 3: EVENT / JOB FAIR */}
        {topEvent && (
          <div className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-sm h-full">
            <div>
              {/* Header Icon + Badge + Type */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded mb-1">
                    Agenda Event
                  </span>
                  <p className="text-xs text-slate-300 font-medium">Kegiatan Publik</p>
                </div>
              </div>

              {/* Title with fixed min-height for baseline alignment */}
              <h4 className="text-base font-bold text-white mb-4 leading-snug line-clamp-2 min-h-[44px]">
                {topEvent.title}
              </h4>

              {/* Metadata */}
              <div className="space-y-2 text-xs text-slate-300 mb-6 pt-3 border-t border-slate-700/60">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{topEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Tanggal: {formatDate(topEvent.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Oleh: {topEvent.organizer}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="/peluang"
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-indigo-600"
            >
              Info Event <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Main Action Button: Lihat Semua Peluang ── */}
      <div className="text-center">
        <Link
          href="/peluang"
          className="inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0A192F] font-bold py-2.5 px-6 rounded-xl transition-colors text-xs sm:text-sm shadow-md"
        >
          Lihat Semua Agenda & Peluang <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
