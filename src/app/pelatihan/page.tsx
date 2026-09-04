import Link from 'next/link';
import sql from '@/lib/db';
import { CalendarDays, MapPin, Clock, ChevronRight, Home, BookOpen, MessageSquare, ArrowRight, ExternalLink } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Program Pelatihan | Disnakertrans Serang',
  description: 'Daftar program pelatihan kerja yang diselenggarakan oleh Disnakertrans Kabupaten Serang.',
};

function getStatusMeta(j: any): { label: string; bg: string; text: string; statusKey: string } {
  const now = new Date();
  const jadwalDate = new Date(j.date);
  if (!j.is_active) return { label: 'Ditutup', bg: 'bg-gray-100', text: 'text-gray-500', statusKey: 'tutup' };
  if (jadwalDate > now) return { label: 'Akan Datang', bg: 'bg-blue-100', text: 'text-blue-700', statusKey: 'datang' };
  return { label: 'Pendaftaran Dibuka', bg: 'bg-green-100', text: 'text-green-700', statusKey: 'buka' };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

export default async function PelatihanPage() {
  const allJadwal = await sql`
    SELECT * FROM jadwal_pelatihan ORDER BY is_active DESC, date ASC
  ` as any[];

  const activeCount = allJadwal.filter(j => j.is_active).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <section className="bg-[#0A192F] pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-80 h-80 bg-[#FBBF24] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 xl:px-12 relative z-10">
          <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6">
            <Link href="/" className="hover:text-white/80 flex items-center gap-1 transition-colors">
              <Home className="w-3 h-3" />Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/informasi-publik" className="hover:text-white/80 transition-colors">Informasi Publik</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">Program Pelatihan</span>
          </nav>
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Program <span className="text-[#FBBF24]">Pelatihan Kerja</span>
            </h1>
            <p className="text-white/70 text-base mt-4 leading-relaxed">
              Tingkatkan kompetensi dan keahlian Anda melalui program pelatihan kerja resmi, bersertifikasi, dan didukung oleh Balai Latihan Kerja (BLK) Disnakertrans Kabupaten Serang.
            </p>
            {activeCount > 0 && (
              <div className="mt-5 inline-flex items-center gap-2 bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
                <span className="text-[#FBBF24] text-xs font-bold">{activeCount} Jadwal Aktif Saat Ini</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 xl:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Pelatihan</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Menampilkan {allJadwal.length} program pelatihan
            </p>
          </div>
        </div>

        {allJadwal.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-16 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Belum ada jadwal pelatihan</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
              Jadwal pelatihan akan ditampilkan di sini setelah ditambahkan oleh admin Disnakertrans.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allJadwal.map((j: any) => {
              const sm = getStatusMeta(j);
              const d = new Date(j.date);
              const isValidDate = !isNaN(d.getTime());
              const dayNum = isValidDate ? d.getDate() : '2026';
              const monthStr = isValidDate ? d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : 'VOKASI';
              const yearStr = isValidDate ? d.getFullYear() : 'BANTEN';

              return (
                <div key={j.id} className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    {/* Cover image or Rich Vocational Thematic Banner */}
                    {j.cover_image ? (
                      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={j.cover_image}
                          alt={j.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${sm.bg} ${sm.text}`}>
                            {sm.label}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Vocational Gradient Banner if no cover */
                      <div className={`relative h-44 w-full p-5 flex flex-col justify-between overflow-hidden text-white shadow-inner ${
                        (j.title || '').toLowerCase().includes('las') || (j.title || '').toLowerCase().includes('welding')
                          ? 'bg-gradient-to-br from-amber-700 via-orange-800 to-slate-900'
                          : (j.title || '').toLowerCase().includes('listrik') || (j.title || '').toLowerCase().includes('elektro') || (j.title || '').toLowerCase().includes('tenaga')
                          ? 'bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900'
                          : (j.title || '').toLowerCase().includes('otomotif') || (j.title || '').toLowerCase().includes('motor') || (j.title || '').toLowerCase().includes('mesin')
                          ? 'bg-gradient-to-br from-rose-700 via-red-900 to-slate-900'
                          : (j.title || '').toLowerCase().includes('komputer') || (j.title || '').toLowerCase().includes('it') || (j.title || '').toLowerCase().includes('digital')
                          ? 'bg-gradient-to-br from-cyan-700 via-sky-800 to-slate-900'
                          : (j.title || '').toLowerCase().includes('jahit') || (j.title || '').toLowerCase().includes('garmen') || (j.title || '').toLowerCase().includes('busana')
                          ? 'bg-gradient-to-br from-purple-700 via-fuchsia-900 to-slate-900'
                          : 'bg-gradient-to-br from-[#0A192F] via-[#1E3A8A] to-slate-900'
                      }`}>
                        <div className="flex items-center justify-between z-10">
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-white/15 px-2.5 py-1 rounded backdrop-blur-sm border border-white/10 text-white">
                            {((j.title || '').toLowerCase().includes('las') || (j.title || '').toLowerCase().includes('welding')) ? 'Teknik Pengelasan (Las)'
                              : ((j.title || '').toLowerCase().includes('listrik') || (j.title || '').toLowerCase().includes('elektro') || (j.title || '').toLowerCase().includes('tenaga')) ? 'Teknik Listrik'
                              : ((j.title || '').toLowerCase().includes('otomotif') || (j.title || '').toLowerCase().includes('motor') || (j.title || '').toLowerCase().includes('mesin')) ? 'Teknik Otomotif'
                              : ((j.title || '').toLowerCase().includes('komputer') || (j.title || '').toLowerCase().includes('it') || (j.title || '').toLowerCase().includes('digital')) ? 'IT & Digital'
                              : 'Pelatihan Vokasi'}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${sm.bg} ${sm.text}`}>
                            {sm.label}
                          </span>
                        </div>
                        <div className="flex items-end justify-between z-10">
                          <span className="text-xl font-black text-white/90">
                            {dayNum} {monthStr} {yearStr}
                          </span>
                          <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded">
                            BBPVP Serang
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Body */}
                    <div className="p-5">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 inline-block mb-2.5">
                        Kemnaker Skillhub Banten
                      </span>
                      <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-snug mb-3 line-clamp-2">
                        {j.title}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{j.location}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {formatDate(j.date)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {j.time_start} – {j.time_end} WIB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 mt-auto">
                    {j.is_active ? (
                      <a
                        href={j.source_url || "https://skillhub.kemnaker.go.id/pelatihan?filters=locations:3165c146-2174-4ab7-91e9-948fc4ef97ea%23BANTEN%2Bprovince%7C"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Daftar di Skillhub Kemnaker <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="w-full inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-not-allowed">
                        Tidak Aktif
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom CTAs ── */}
      <section className="bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800 py-14">
        <div className="container mx-auto px-4 xl:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CTA 1: LPK */}
            <div className="bg-[#0A192F] rounded-2xl p-8 text-white">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6 text-[#FBBF24]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ingin Menyelenggarakan Pelatihan?</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Bagi Lembaga Pelatihan Kerja (LPK) yang ingin bermitra dengan Disnakertrans Serang, silakan ajukan proposal kerja sama Anda.
              </p>
              <Link href="/pengaduan" className="inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#78350F] font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                Hubungi Bidang Pelatihan
              </Link>
            </div>
            {/* CTA 2: Bantuan */}
            <div className="bg-[#F8FAFC] dark:bg-[#1E293B] rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 rounded-xl flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6 text-[#1E3A8A] dark:text-[#93C5FD]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Butuh Bantuan Pendaftaran?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Kami menyediakan panduan lengkap cara mendaftar pelatihan secara daring maupun luring di kantor Disnakertrans.
              </p>
              <div className="flex gap-3">
                <Link href="/pengaduan" className="inline-flex items-center gap-2 bg-[#0A192F] hover:bg-black dark:hover:bg-white/10 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  Tanya Admin
                </Link>
                <Link href="/informasi-publik" className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  Info Publik
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
