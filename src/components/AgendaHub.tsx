"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Briefcase, GraduationCap, MapPin, ArrowRight, ExternalLink, Clock, Building2, BookOpen, Globe2, Banknote, Layers, Sparkles, Zap, Wrench, Laptop, Scissors, Coffee } from 'lucide-react';

export interface PelatihanItem {
  id: number;
  title: string;
  location: string;
  date: string;
  time_start: string;
  time_end: string;
  color?: string;
  cover_image?: string;
  source_url?: string;
}

export interface LowonganItem {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  education: string;
  deadline: string;
  salary?: string;
  category?: string;
  logo_url: string;
  source_url?: string;
}

export interface EventItem {
  id: number;
  title: string;
  location: string;
  date: string;
  organizer: string;
  link_url?: string;
}

interface AgendaHubProps {
  pelatihanList: PelatihanItem[];
  lowonganList: LowonganItem[];
  eventList?: EventItem[];
}

function CompanyLogo({ url, name }: { url?: string; name: string }) {
  const [error, setError] = useState(false);
  if (!url || error) {
    return <Building2 className="w-5 h-5 text-gray-400" />;
  }
  return (
    <img
      src={url}
      alt={name}
      className="w-full h-full object-contain"
      onError={() => setError(true)}
    />
  );
}

function PelatihanCover({ title, imageUrl, date }: { title: string; imageUrl?: string; date?: string }) {
  const [imgError, setImgError] = useState(false);

  const getVocationalTheme = (t: string) => {
    const lower = (t || '').toLowerCase();
    if (lower.includes('las') || lower.includes('welding')) {
      return {
        bg: 'from-amber-700 via-orange-800 to-slate-900',
        label: 'Teknik Pengelasan (Las)',
        icon: Sparkles
      };
    }
    if (lower.includes('listrik') || lower.includes('elektro') || lower.includes('tenaga') || lower.includes('panel')) {
      return {
        bg: 'from-blue-700 via-indigo-800 to-slate-900',
        label: 'Teknik Listrik & Tenaga',
        icon: Zap
      };
    }
    if (lower.includes('otomotif') || lower.includes('motor') || lower.includes('mobil') || lower.includes('mesin') || lower.includes('bubut') || lower.includes('cnc')) {
      return {
        bg: 'from-rose-700 via-red-900 to-slate-900',
        label: 'Teknik Otomotif & Mesin',
        icon: Wrench
      };
    }
    if (lower.includes('komputer') || lower.includes('it') || lower.includes('web') || lower.includes('digital') || lower.includes('software') || lower.includes('desain')) {
      return {
        bg: 'from-cyan-700 via-sky-800 to-slate-900',
        label: 'Teknologi Informasi & Digital',
        icon: Laptop
      };
    }
    if (lower.includes('jahit') || lower.includes('garmen') || lower.includes('busana') || lower.includes('fashion') || lower.includes('pola')) {
      return {
        bg: 'from-purple-700 via-fuchsia-900 to-slate-900',
        label: 'Garmen & Tata Busana',
        icon: Scissors
      };
    }
    if (lower.includes('barista') || lower.includes('boga') || lower.includes('kuliner') || lower.includes('makanan') || lower.includes('roti')) {
      return {
        bg: 'from-amber-800 via-yellow-900 to-stone-900',
        label: 'Tata Boga & Barista',
        icon: Coffee
      };
    }
    return {
      bg: 'from-[#0A192F] via-[#1E3A8A] to-slate-900',
      label: 'Pelatihan Vokasi Kerja',
      icon: GraduationCap
    };
  };

  const theme = getVocationalTheme(title);
  const IconComponent = theme.icon;

  if (imageUrl && !imgError) {
    return (
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        {date && (
          <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-0.5 rounded">
            {date}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative h-44 w-full bg-gradient-to-br ${theme.bg} p-4 flex flex-col justify-between overflow-hidden text-white shadow-inner`}>
      <div className="flex items-center justify-between z-10">
        <span className="text-[10px] font-bold tracking-wider uppercase bg-white/15 px-2.5 py-1 rounded backdrop-blur-sm border border-white/10 text-white">
          {theme.label}
        </span>
        {date && (
          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-0.5 rounded border border-white/10">
            {date}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between z-10">
        <IconComponent className="w-11 h-11 text-white/50" />
        <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded">
          BBPVP / DISNAKERTRANS
        </span>
      </div>
    </div>
  );
}

export default function AgendaHub({ pelatihanList = [], lowonganList = [], eventList = [] }: AgendaHubProps) {
  const [activeTab, setActiveTab] = useState<'semua' | 'pelatihan' | 'lowongan' | 'event'>('semua');
  const [lokerCategory, setLokerCategory] = useState<'semua' | 'dalam_negeri' | 'luar_negeri'>('semua');

  // Listen to URL query params and hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'pelatihan' || tab === 'lowongan' || tab === 'event') {
        setActiveTab(tab);
      }
      const hash = window.location.hash.replace('#', '');
      if (hash === 'pelatihan' || hash === 'lowongan' || hash === 'event') {
        setActiveTab(hash as any);
      }
    }
  }, []);

  const defaultEvents: EventItem[] = eventList.length > 0 ? eventList : [
    {
      id: 101,
      title: 'Job Fair Kemnaker RI Terpadu 2026',
      location: 'KOTA ADM. JAKARTA PUSAT, DKI JAKARTA',
      date: '2026-08-26',
      organizer: 'Kementerian Ketenagakerjaan RI',
      link_url: 'https://jobfair.kemnaker.go.id/web/events',
    },
  ];

  const filteredLowongan = lowonganList.filter((j) => {
    if (lokerCategory === 'dalam_negeri') return j.category !== 'Luar Negeri';
    if (lokerCategory === 'luar_negeri') return j.category === 'Luar Negeri';
    return true;
  });

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
      {/* ── Section Header & Filter Tabs ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-5 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Pusat Informasi & Layanan Karir
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 max-w-2xl">
            Pilih kategori untuk memfilter data pelatihan kerja vokasi, lowongan kerja terverifikasi, atau agenda event.
          </p>
        </div>

        {/* ── Clean Tab Filter Buttons ── */}
        <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200 dark:border-slate-700/60 overflow-x-auto self-start lg:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('semua')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'semua'
                ? 'bg-white dark:bg-slate-700 text-[#0A192F] dark:text-white shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Semua
          </button>
          <button
            onClick={() => setActiveTab('pelatihan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pelatihan'
                ? 'bg-white dark:bg-slate-700 text-[#0A192F] dark:text-white shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Pelatihan ({pelatihanList.length})
          </button>
          <button
            onClick={() => setActiveTab('lowongan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'lowongan'
                ? 'bg-white dark:bg-slate-700 text-[#0A192F] dark:text-white shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Lowongan Kerja ({lowonganList.length})
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'event'
                ? 'bg-white dark:bg-slate-700 text-[#0A192F] dark:text-white shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Agenda Event ({defaultEvents.length})
          </button>
        </div>
      </div>

      {/* ── Lowongan Sub-Filter (Dalam Negeri vs Luar Negeri) ── */}
      {activeTab === 'lowongan' && (
        <div className="flex flex-wrap items-center gap-1.5 mb-6 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 w-fit">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2.5">Wilayah:</span>
          <button
            onClick={() => setLokerCategory('semua')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              lokerCategory === 'semua'
                ? 'bg-[#0A192F] text-white font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            Semua ({lowonganList.length})
          </button>
          <button
            onClick={() => setLokerCategory('dalam_negeri')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              lokerCategory === 'dalam_negeri'
                ? 'bg-[#0A192F] text-white font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            Dalam Negeri
          </button>
          <button
            onClick={() => setLokerCategory('luar_negeri')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              lokerCategory === 'luar_negeri'
                ? 'bg-[#0A192F] text-white font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            Luar Negeri ({lowonganList.filter((j) => j.category === 'Luar Negeri').length})
          </button>
        </div>
      )}

      {/* ── Content Display Grid ── */}

      {/* 1. TAB SEMUA / MIXED */}
      {activeTab === 'semua' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lowongan Cards */}
          {lowonganList.slice(0, 2).map((job) => (
            <div
              key={`mix-job-${job.id}`}
              className="bg-white dark:bg-[#1E293B] rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="w-11 h-11 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                    <CompanyLogo url={job.logo_url} name={job.company} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 mb-1">
                      {job.category === 'Luar Negeri' ? 'Luar Negeri' : 'Lowongan Kerja'}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug">
                      {job.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{job.company}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-5 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{job.job_type} • {job.education}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                      <Banknote className="w-3.5 h-3.5 shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Batas: {job.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              <a
                href={job.source_url || "https://karirhub.kemnaker.go.id/lowongan-dalam-negeri/lowongan"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 hover:bg-[#0A192F] hover:text-white dark:hover:bg-blue-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200 dark:border-slate-700"
              >
                Detail Lowongan <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}

          {/* Pelatihan Cards */}
          {pelatihanList.slice(0, 3).map((p) => (
            <div
              key={`mix-pelatihan-${p.id}`}
              className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <PelatihanCover title={p.title} imageUrl={p.cover_image} date={p.date} />

                <div className="p-5">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 inline-block mb-2">
                    Pelatihan Vokasi Gratis
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-3">
                    {p.title}
                  </h4>

                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>
                    {p.time_start && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.time_start} - {p.time_end} WIB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a
                  href={p.source_url || "https://skillhub.kemnaker.go.id/pelatihan?filters=locations:3165c146-2174-4ab7-91e9-948fc4ef97ea%23BANTEN%2Bprovince%7C"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  Daftar di Skillhub <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}

          {/* Event Card */}
          {defaultEvents.slice(0, 1).map((ev) => (
            <div
              key={`mix-event-${ev.id}`}
              className="bg-white dark:bg-[#1E293B] rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="w-11 h-11 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 inline-block mb-1">
                      Agenda Event
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                      {ev.title}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-5 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{formatDate(ev.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ev.organizer}</span>
                  </div>
                </div>
              </div>

              <a
                href={ev.link_url || "https://jobfair.kemnaker.go.id/web/events"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 hover:bg-[#0A192F] hover:text-white dark:hover:bg-indigo-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200 dark:border-slate-700"
              >
                Detail Event Job Fair <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}

          {/* Quick links to full categories */}
          <div className="col-span-full flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-200 dark:border-slate-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menampilkan ikhtisar peluang teratas. Pilih tab di atas untuk melihat seluruh daftar.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('pelatihan')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Semua Pelatihan ({pelatihanList.length}) →
              </button>
              <button
                onClick={() => setActiveTab('lowongan')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Semua Lowongan ({lowonganList.length}) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB PELATIHAN ONLY */}
      {activeTab === 'pelatihan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pelatihanList.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#1E293B] rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700 max-w-md mx-auto">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Belum ada jadwal pelatihan</h3>
              <p className="text-gray-500 text-xs">Jadwal pelatihan vokasi terbaru akan tampil di sini.</p>
            </div>
          ) : (
            pelatihanList.map((p) => (
              <div
                key={`pelatihan-tab-${p.id}`}
                className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <PelatihanCover title={p.title} imageUrl={p.cover_image} date={p.date} />

                  <div className="p-5">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 inline-block mb-2">
                      Program Pelatihan Kerja
                    </span>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-3 line-clamp-2">
                      {p.title}
                    </h4>

                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.time_start} - {p.time_end} WIB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <a
                    href={p.source_url || "https://skillhub.kemnaker.go.id/pelatihan?filters=locations:3165c146-2174-4ab7-91e9-948fc4ef97ea%23BANTEN%2Bprovince%7C"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    Daftar di Skillhub Kemnaker <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. TAB LOWONGAN ONLY */}
      {activeTab === 'lowongan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLowongan.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#1E293B] rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700 max-w-md mx-auto">
              <Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Belum ada lowongan</h3>
              <p className="text-gray-500 text-xs">Lowongan kerja untuk kategori ini belum tersedia saat ini.</p>
            </div>
          ) : (
            filteredLowongan.map((job) => (
              <div
                key={`loker-tab-${job.id}`}
                className="bg-white dark:bg-[#1E293B] rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="w-11 h-11 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                      <CompanyLogo url={job.logo_url} name={job.company} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 mb-1">
                        {job.category === 'Luar Negeri' ? 'Luar Negeri' : 'Dalam Negeri'}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {job.title}
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-300 font-medium truncate mt-0.5">{job.company}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-5 pt-2 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{job.job_type} • Syarat: {job.education}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                        <Banknote className="w-3.5 h-3.5 shrink-0" />
                        <span>Gaji: {job.salary}</span>
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Deadline: {job.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href={job.source_url || "https://karirhub.kemnaker.go.id/lowongan-dalam-negeri/lowongan"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 hover:bg-[#0A192F] hover:text-white dark:hover:bg-blue-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200 dark:border-slate-700"
                >
                  Detail Lowongan <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. TAB EVENT ONLY */}
      {activeTab === 'event' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defaultEvents.map((ev) => (
            <div
              key={`event-tab-${ev.id}`}
              className="bg-white dark:bg-[#1E293B] rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="w-11 h-11 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 inline-block mb-1">
                      Agenda Kegiatan
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                      {ev.title}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-5 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Tanggal: {formatDate(ev.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ev.organizer}</span>
                  </div>
                </div>
              </div>

              <a
                href={ev.link_url || "https://jobfair.kemnaker.go.id/web/events"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 hover:bg-[#0A192F] hover:text-white dark:hover:bg-indigo-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200 dark:border-slate-700"
              >
                Detail Event Job Fair <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer Navigation Action Bar ── */}
      <div className="mt-10 p-5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Data terintegrasi: <span className="text-gray-800 dark:text-white font-medium">Disnakertrans Kab. Serang</span> & <span className="text-blue-700 dark:text-blue-400 font-medium">KarirHub / SIAPkerja Kemnaker RI</span>
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/pelatihan"
            className="inline-flex items-center gap-1.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white font-medium py-2 px-4 rounded-lg transition-colors text-xs"
          >
            <GraduationCap className="w-3.5 h-3.5" /> Semua Pelatihan <ArrowRight className="w-3 h-3" />
          </Link>
          <a
            href="https://karirhub.kemnaker.go.id/lowongan-dalam-negeri/lowongan?locations[0][id]=3165c146-2174-4ab7-91e9-948fc4ef97ea&locations[0][label]=Banten&locations[0][type]=province"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors text-xs border border-gray-200 dark:border-slate-700"
          >
            <Globe2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Portal KarirHub Kemnaker <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
