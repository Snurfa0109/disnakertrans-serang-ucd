'use client';

import { useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, MapPin, Search, X } from 'lucide-react';
import { kecamatanData, KABUPATEN_SERANG_INFO } from './kecamatanMapData';

// Dynamic import Leaflet client component with SSR disabled
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] sm:h-[500px] lg:h-[540px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex flex-col items-center justify-center gap-3">
      <div className="w-9 h-9 border-3 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Memuat Peta Interaktif Leaflet...</span>
    </div>
  ),
});

export default function KecamatanMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [desaSearch, setDesaSearch] = useState('');
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Sorted kecamatans for navigation tabs
  const sortedKecamatans = useMemo(() => {
    return [...kecamatanData].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedKecamatan = useMemo(() => {
    if (!selectedId || selectedId === 'kab-serang') return null;
    return kecamatanData.find((k) => k.id === selectedId) || null;
  }, [selectedId]);

  const handleSelectTab = (id: string | null) => {
    setSelectedId(id);
    setDesaSearch('');
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      tabsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filtered desas for the selected kecamatan
  const filteredDesas = useMemo(() => {
    if (!selectedKecamatan) return [];
    if (!desaSearch.trim()) return selectedKecamatan.desa;
    return selectedKecamatan.desa.filter((d) =>
      d.toLowerCase().includes(desaSearch.toLowerCase().trim())
    );
  }, [selectedKecamatan, desaSearch]);

  return (
    <div className="w-full">
      {/* Top Section Header - Exact layout matching user's reference image */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#0b5c7e] dark:text-[#38bdf8]">
            DATA KABUPATEN SERANG
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
            Serang dalam Angka
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Data dan informasi pembangunan wilayah serta ketenagakerjaan dalam satu visualisasi.
          </p>
        </div>

        <Link
          href="#statistik"
          className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-full border border-[#0b5c7e] dark:border-[#38bdf8] text-[#0b5c7e] dark:text-[#38bdf8] hover:bg-[#0b5c7e] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-gray-900 transition-all font-bold text-xs md:text-sm group shadow-sm shrink-0"
        >
          <span>Lihat detail data</span>
          <div className="w-5 h-5 rounded-full bg-[#0b5c7e]/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5 text-[#0b5c7e] dark:text-[#38bdf8] group-hover:text-white dark:group-hover:text-gray-900 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* Main Card Container */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl md:rounded-3xl border border-gray-200/90 dark:border-gray-700/80 shadow-md p-4 sm:p-6 md:p-7 transition-all relative isolate z-0">
        {/* Horizontal Navigation Filter Tabs (Pills) */}
        <div className="relative mb-5 flex items-center">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollTabs('left')}
            aria-label="Scroll tabs left"
            className="hidden sm:flex shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 items-center justify-center text-gray-600 dark:text-gray-300 mr-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tabs Wrapper */}
          <div
            ref={tabsScrollRef}
            className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* 1. All Kabupaten Serang Tab */}
            <button
              onClick={() => handleSelectTab(null)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 border ${
                selectedId === null || selectedId === 'kab-serang'
                  ? 'bg-[#0b5c7e] text-white border-[#0b5c7e] shadow-sm'
                  : 'bg-white dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              Kabupaten Serang
            </button>

            {/* 2. All 29 Kecamatan Tabs */}
            {sortedKecamatans.map((k) => {
              const isActive = selectedId === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => handleSelectTab(k.id)}
                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold tracking-tight whitespace-nowrap transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#0b5c7e] text-white border-[#0b5c7e] shadow-sm'
                      : 'bg-white dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  {k.name}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollTabs('right')}
            aria-label="Scroll tabs right"
            className="hidden sm:flex shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 items-center justify-center text-gray-600 dark:text-gray-300 ml-2 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout: Map Left + Info Panel Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: Leaflet Map Container (lg: 7 cols, xl: 8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner relative flex flex-col">
            <LeafletMapInner
              selectedId={selectedId}
              onSelectKecamatan={(id) => handleSelectTab(id)}
            />
          </div>

          {/* RIGHT: Detail Information Panel (lg: 5 cols, xl: 4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-gray-50/70 dark:bg-[#0F172A]/70 rounded-xl border border-gray-200/80 dark:border-gray-700 p-5 md:p-6 flex flex-col justify-between">
            <div>
              {/* Header Badge & Name */}
              <div className="mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0b5c7e] dark:text-[#38bdf8] block">
                  WILAYAH TERPILIH
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
                  {selectedKecamatan ? selectedKecamatan.name : KABUPATEN_SERANG_INFO.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  {selectedKecamatan ? selectedKecamatan.deskripsi : KABUPATEN_SERANG_INFO.subtitle}
                </p>
              </div>

              {/* Horizontal Divider */}
              <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-5" />

              {/* 4-Stat Box Grid - Matching screenshot format */}
              <div className="grid grid-cols-2 gap-4">
                {/* 1. Penduduk */}
                <div className="bg-white dark:bg-[#1E293B] p-3.5 rounded-xl border border-gray-200/70 dark:border-gray-700/70 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Jumlah Penduduk</p>
                  <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {selectedKecamatan ? selectedKecamatan.penduduk : KABUPATEN_SERANG_INFO.penduduk}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Semester I 2026</p>
                </div>

                {/* 2. Kelurahan / Desa */}
                <div className="bg-white dark:bg-[#1E293B] p-3.5 rounded-xl border border-gray-200/70 dark:border-gray-700/70 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Kelurahan / Desa</p>
                  <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {selectedKecamatan ? selectedKecamatan.jumlahDesa : KABUPATEN_SERANG_INFO.jumlahDesa}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Wilayah Desa Terdaftar</p>
                </div>

                {/* 3. Luas Wilayah */}
                <div className="bg-white dark:bg-[#1E293B] p-3.5 rounded-xl border border-gray-200/70 dark:border-gray-700/70 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Luas Wilayah</p>
                  <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white mt-1">
                    {selectedKecamatan ? selectedKecamatan.luas : KABUPATEN_SERANG_INFO.luas}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Geospasial BIG</p>
                </div>

                {/* 4. Kecamatan / Sektor */}
                <div className="bg-white dark:bg-[#1E293B] p-3.5 rounded-xl border border-gray-200/70 dark:border-gray-700/70 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    {selectedKecamatan ? 'Sektor Utama' : 'Kecamatan'}
                  </p>
                  <p className="text-base md:text-lg font-black text-gray-900 dark:text-white mt-1 truncate" title={selectedKecamatan ? selectedKecamatan.sektor : '29 Kecamatan'}>
                    {selectedKecamatan ? selectedKecamatan.sektor : KABUPATEN_SERANG_INFO.jumlahKecamatan}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {selectedKecamatan ? 'Potensi Wilayah' : 'Kecamatan Terpadu'}
                  </p>
                </div>
              </div>

              {/* Desa List (When a kecamatan is selected) */}
              {selectedKecamatan && (
                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Daftar Desa ({selectedKecamatan.desa.length})
                    </span>
                    <div className="relative w-36">
                      <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari desa..."
                        value={desaSearch}
                        onChange={(e) => setDesaSearch(e.target.value)}
                        className="w-full text-[11px] pl-6 pr-2 py-1 rounded-md bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 p-1">
                    {filteredDesas.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                        {d}
                      </span>
                    ))}
                    {filteredDesas.length === 0 && (
                      <span className="text-xs text-gray-400 italic py-2">Desa tidak ditemukan</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer Information */}
            <div className="mt-6 pt-4 border-t border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Data: <strong>BPS & Disnakertrans</strong></span>
              <a
                href="https://sinar.serangkab.go.id"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#0b5c7e] dark:hover:text-[#38bdf8] font-medium transition-colors"
              >
                <span>Batas: BIG via GeoIT</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
