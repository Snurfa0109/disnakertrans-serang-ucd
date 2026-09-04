'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Search, X, Users } from 'lucide-react';
import { kecamatanData } from './kecamatanMapData';

export default function KecamatanMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filtered = kecamatanData
    .filter(k => k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.desa.some(d => d.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSelect = (id: string) => {
    const newId = selected === id ? null : id;
    setSelected(newId);
    if (newId && isMobile) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
    if (newId) {
      setTimeout(() => {
        const el = accordionRefs.current[newId];
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  };

  const totalDesa = kecamatanData.reduce((sum, k) => sum + k.jumlahDesa, 0);

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* LEFT: Peta Kecamatan Image */}
      <div className="w-full xl:w-3/5 2xl:w-2/3">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 overflow-hidden">
          {/* Map Header */}
          <div className="mb-4">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">KABUPATEN SERANG</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">29 Kecamatan, {totalDesa} Desa</p>
          </div>

          {/* Map Image */}
          <div className="relative w-full overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/peta kecamatan kab serang.png"
              alt="Peta Kecamatan Kabupaten Serang"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: Accordion Panel */}
      <div ref={detailRef} className="w-full xl:w-2/5 2xl:w-1/3">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-28">
          {/* Panel Header */}
          <div className="bg-[#0A192F] p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#FBBF24]/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#FBBF24]" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Data Kecamatan dan Desa</h3>
                <p className="text-[10px] text-white/60 tracking-wider uppercase font-bold">Kabupaten Serang — {totalDesa} Desa</p>
              </div>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari kecamatan atau desa..."
                className="w-full bg-white/10 border border-white/10 rounded-lg pl-9 pr-8 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FBBF24]/50 focus:bg-white/15 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Accordion List */}
          <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700" style={{ scrollbarWidth: 'thin' }}>
            {filtered.map(k => {
              const isOpen = selected === k.id;
              const isSearchMatch = search.length > 0;
              const showContent = isSearchMatch || isOpen;
              const contentHeight = (Math.ceil(k.desa.length / 2) * 46) + 60;
              return (
                <div
                  key={k.id}
                  ref={el => { accordionRefs.current[k.id] = el; }}
                  className="border-b border-gray-50 last:border-b-0"
                >
                  <button
                    onClick={() => handleSelect(k.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors group ${isOpen ? 'bg-gray-50 dark:bg-[#0F172A]' : 'hover:bg-gray-50/60 dark:hover:bg-[#0F172A]/50'
                      }`}
                  >
                    <div
                      className="w-3 h-3 rounded-sm shrink-0 shadow-sm ring-1 ring-black/5"
                      style={{ backgroundColor: k.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold block truncate ${isOpen ? 'text-[#0A192F] dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                        {k.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 shrink-0">{k.jumlahDesa}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {/* Expandable Village List */}
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: showContent ? `${contentHeight}px` : '0px',
                      opacity: showContent ? 1 : 0,
                    }}
                  >
                    {showContent && (
                      <div className="px-5 pb-4 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          {k.desa.map(d => (
                            <div key={d} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] shrink-0" />
                              <span className="text-[11px] text-gray-700 dark:text-gray-300 font-medium truncate">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400">Tidak ditemukan</p>
                <p className="text-xs text-gray-300 mt-1">Coba kata kunci lain</p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-[#0F172A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total: 29 Kecamatan • {totalDesa} Desa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
