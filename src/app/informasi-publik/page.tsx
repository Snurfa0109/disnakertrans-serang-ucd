import Link from "next/link";
import sql from "@/lib/db";
import { ArrowRight, Briefcase, Users, FileCheck, FileText, CalendarDays, MapPin } from "lucide-react";
import { getCategoryFallbackImage } from "@/lib/utils";
import KecamatanMap from "@/components/KecamatanMap";
import PeluangSummary from "@/components/PeluangSummary";
import DokumenPublikSection from "@/components/DokumenPublikSection";

export const revalidate = 60;

export const metadata = {
    title: "Informasi Publik & Warta Terkini | Disnakertrans Serang",
    description: "Pusat informasi publik, warta terkini, data statistik ketenagakerjaan, serta transparansi kegiatan Pemerintah Kabupaten Serang.",
    openGraph: {
        title: "Informasi Publik & Warta Terkini | Disnakertrans Serang",
        description: "Pusat informasi publik, warta terkini, data statistik ketenagakerjaan, serta transparansi kegiatan Pemerintah Kabupaten Serang.",
    },
};

function GraduationCapIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
}

export default async function InformasiPublikPage() {
    let allNews: any[] = [];
    let allStats: any[] = [];
    let allJadwal: any[] = [];
    let allLowongan: any[] = [];
    let allEvents: any[] = [];
    let allDocs: any[] = [];

    try {
        allNews = await sql`SELECT * FROM news ORDER BY date DESC LIMIT 10` as any[];
        allStats = await sql`SELECT * FROM statistik ORDER BY sort_order ASC` as any[];
        allJadwal = await sql`SELECT * FROM jadwal_pelatihan WHERE is_active = TRUE ORDER BY date ASC` as any[];
        allLowongan = await sql`SELECT * FROM lowongan WHERE is_active = TRUE ORDER BY id DESC LIMIT 40` as any[];
        allEvents = await sql`SELECT * FROM events WHERE is_active = TRUE ORDER BY id DESC LIMIT 10` as any[];
        allDocs = await sql`SELECT * FROM dokumen_publik WHERE is_active = TRUE ORDER BY sort_order ASC` as any[];
    } catch (err) {
        console.error('[InformasiPublik] DB error:', err);
    }

    const utama = allNews[0] || null;
    const sekunder = allNews[1] || null;
    const tersier = allNews.slice(2, 4);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return dateStr; }
    };

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-[#0A192F] overflow-hidden text-white">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/banner-cikoneng.jpg"
                        alt="Mercusuar Cikoneng Anyer Kabupaten Serang"
                        className="w-full h-full object-cover opacity-35 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/85 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center rounded-full border border-[#FBBF24] px-4 py-1.5 text-xs font-bold text-[#FBBF24] tracking-widest uppercase mb-6">
                            Transparansi Informasi
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Gerbang Informasi <br className="hidden md:block" />
                            <span className="text-[#FBBF24]">Ketenagakerjaan</span> Serang.
                        </h1>
                        <p className="text-base md:text-xl text-white/80 max-w-2xl leading-relaxed">
                            Akses data real-time, berita terbaru, dan dokumen publik resmi dari Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang dalam satu platform terpadu.
                        </p>
                    </div>
                </div>
            </section>

            {/* Warta Ketenagakerjaan */}
            <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Warta Ketenagakerjaan</h2>
                            <p className="text-gray-600 dark:text-gray-400">Update terkini kebijakan, event, dan capaian kinerja Disnakertrans.</p>
                        </div>
                        <Link href="/berita" className="text-[#0A192F] dark:text-[#93C5FD] font-bold text-sm flex items-center gap-2 hover:underline">
                            Lihat Semua Berita <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {allNews.length === 0 ? (
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-16 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Belum ada berita</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Berita akan muncul setelah data diambil dari sumber atau ditambahkan oleh admin.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {utama && (
                                <Link href={`/berita/${utama.id}`} className="w-full lg:w-7/12 relative rounded-2xl overflow-hidden group shadow-sm bg-gray-200 dark:bg-gray-800 cursor-pointer h-[400px] lg:h-[500px]">
                                    <img
                                        src={utama.thumbnail || getCategoryFallbackImage(utama.category)}
                                        alt={utama.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/60 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10 flex flex-col items-start text-white overflow-hidden">
                                        <span className="bg-[#FBBF24] text-[#0A192F] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 shrink-0">
                                            {utama.category || 'BERITA'}
                                        </span>
                                        <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-snug group-hover:text-[#FBBF24] transition-colors line-clamp-3 w-full">{utama.title}</h3>
                                        <div className="flex items-center gap-4 text-xs font-medium text-white/70 shrink-0">
                                            <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {formatDate(utama.date)}</span>
                                            <span>{utama.source_name || 'Disnakertrans'}</span>
                                        </div>
                                    </div>
                                </Link>
                            )}
                            <div className="w-full lg:w-5/12 flex flex-col gap-6">
                                {sekunder && (
                                    <Link href={`/berita/${sekunder.id}`} className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer flex-1 group">
                                        <div className="w-full sm:w-1/3 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 h-32 sm:h-auto">
                                            <img
                                                src={sekunder.thumbnail || getCategoryFallbackImage(sekunder.category)}
                                                alt={sekunder.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-2">{sekunder.category || 'BERITA'}</span>
                                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug line-clamp-3 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors">{sekunder.title}</h4>
                                        </div>
                                    </Link>
                                )}
                                {tersier.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                                        {tersier.map((item: any) => (
                                            <Link href={`/berita/${item.id}`} key={item.id} className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer flex flex-col group overflow-hidden">
                                                <div className="w-full h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3 shrink-0">
                                                    <img
                                                        src={item.thumbnail || getCategoryFallbackImage(item.category)}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <span className="text-[10px] uppercase font-bold text-[#B45309] dark:text-[#FBBF24] tracking-wider mb-2">{item.category || 'BERITA'}</span>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-snug line-clamp-2 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors">{item.title}</h4>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Dokumen & Regulasi Publik Section */}
            {allDocs.length > 0 && <DokumenPublikSection documents={allDocs} />}

            {/* Info Cepat Ketenagakerjaan + Jadwal Pelatihan */}
            <section className="py-20 bg-[#0A192F]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Info Cepat Ketenagakerjaan</h2>
                        <p className="text-white/60 text-sm">Data dan indikator ketenagakerjaan terbaru di Kabupaten Serang.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {/* UMK Card */}
                        {(() => {
                            const umk = allStats.find((s: any) => s.key === 'umk_serang');
                            return umk ? (
                                <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{umk.label}</p>
                                    <h3 className="text-2xl lg:text-[26px] font-extrabold text-[#0A192F] dark:text-white mb-1.5">{umk.value}</h3>
                                    <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1 mb-2">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                        {umk.description}
                                    </p>
                                    <p className="text-[8px] text-gray-400 mb-3">Sumber: Kep. Gubernur Banten No. 703/Kep.871-Huk/2025</p>
                                    <a href="https://www.llg-bwi.org/file_publish/Keputusan%20Gubernur%20(Kepgub%20-%20SK%20gub)%20Banten%20Nomor%20703%20Tahun%202025%20tentang%20Penetapan%20Upah%20Minimum%20Kabupaten%20Kota%20di%20Provinsi%20Banten%20Tahun%202026.pdf" target="_blank" rel="noopener noreferrer"
                                        className="mt-auto inline-flex items-center justify-center gap-1.5 text-[#1E3A8A] dark:text-[#93C5FD] text-xs font-bold border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full">
                                        Lihat Detail
                                    </a>
                                </div>
                            ) : null;
                        })()}

                        {/* UMP Card */}
                        {(() => {
                            const ump = allStats.find((s: any) => s.key === 'ump_banten');
                            return ump ? (
                                <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{ump.label}</p>
                                    <h3 className="text-2xl lg:text-[26px] font-extrabold text-[#0A192F] dark:text-white mb-1.5">{ump.value}</h3>
                                    <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1 mb-2">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                        {ump.description}
                                    </p>
                                    <p className="text-[8px] text-gray-400 mb-3">Sumber: Kep. Gubernur Banten No. 561/Kep.871-Huk/2025</p>
                                    <a href="https://www.llg-bwi.org/file_publish/Keputusan%20Gubernur%20(Kepgub%20-%20SK%20gub)%20Banten%20Nomor%20703%20Tahun%202025%20tentang%20Penetapan%20Upah%20Minimum%20Kabupaten%20Kota%20di%20Provinsi%20Banten%20Tahun%202026.pdf" target="_blank" rel="noopener noreferrer"
                                        className="mt-auto inline-flex items-center justify-center gap-1.5 text-[#1E3A8A] dark:text-[#93C5FD] text-xs font-bold border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full">
                                        Lihat Detail
                                    </a>
                                </div>
                            ) : null;
                        })()}

                        {/* Trend Chart */}
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Tren UMK Kabupaten Serang</p>
                            <div className="flex-1 flex items-center">
                                <svg viewBox="0 0 240 120" className="w-full" preserveAspectRatio="xMidYMid meet">
                                    <line x1="30" y1="90" x2="225" y2="90" stroke="#E5E7EB" strokeWidth="0.5" />
                                    {[20, 43, 67].map(y => (
                                        <line key={y} x1="30" y1={y} x2="225" y2={y} stroke="#F3F4F6" strokeWidth="0.5" strokeDasharray="2 2" />
                                    ))}
                                    <text x="27" y="23" textAnchor="end" fill="#9CA3AF" fontSize="6.5">5.2 jt</text>
                                    <text x="27" y="46" textAnchor="end" fill="#9CA3AF" fontSize="6.5">4.9 jt</text>
                                    <text x="27" y="70" textAnchor="end" fill="#9CA3AF" fontSize="6.5">4.6 jt</text>
                                    <text x="27" y="93" textAnchor="end" fill="#9CA3AF" fontSize="6.5">4.3 jt</text>
                                    <defs>
                                        <linearGradient id="umkGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.03" />
                                        </linearGradient>
                                    </defs>
                                    <polygon points="55,72 105,66 160,38 215,12 215,90 55,90" fill="url(#umkGrad)" />
                                    <polyline points="55,72 105,66 160,38 215,12" fill="none" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    {[
                                        { x: 55, y: 72, v: "4.492 jt", yr: "2023" },
                                        { x: 105, y: 66, v: "4.560 jt", yr: "2024" },
                                        { x: 160, y: 38, v: "4.857 jt", yr: "2025" },
                                        { x: 215, y: 12, v: "5.178 jt", yr: "2026" },
                                    ].map(p => (
                                        <g key={p.yr}>
                                            <circle cx={p.x} cy={p.y} r="3" fill="#1E3A8A" stroke="white" strokeWidth="1.5" />
                                            <text x={p.x} y={p.y - 7} textAnchor="middle" fill="#1E3A8A" fontSize="6.5" fontWeight="bold">{p.v}</text>
                                            <text x={p.x} y="103" textAnchor="middle" fill="#9CA3AF" fontSize="7" fontWeight="600">{p.yr}</text>
                                        </g>
                                    ))}
                                </svg>
                            </div>
                        </div>

                        {/* Side Stats */}
                        <div className="flex flex-col gap-3">
                            {allStats.filter((s: any) => !['umk_serang', 'ump_banten'].includes(s.key)).map((s: any) => (
                                <div key={s.id} className="bg-white dark:bg-[#1E293B] rounded-xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 flex-1">
                                    <div className="w-9 h-9 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 rounded-lg flex items-center justify-center text-[#1E3A8A] dark:text-[#93C5FD] shrink-0">
                                        {s.key === 'perusahaan_terdaftar' && <Briefcase className="w-4 h-4" />}
                                        {s.key === 'pencari_kerja' && <Users className="w-4 h-4" />}
                                        {s.key === 'lowongan_tersedia' && <FileCheck className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 truncate">{s.label}</p>
                                        <div className="flex items-baseline gap-1.5 flex-wrap">
                                            <h4 className="text-lg font-extrabold text-[#0A192F] dark:text-white">{s.value}</h4>
                                            <span className="text-[9px] text-gray-400 font-medium">{s.description}</span>
                                        </div>
                                        {s.key === 'pencari_kerja' && (
                                            <div className="flex items-center gap-1.5 mt-1 text-[9px]">
                                                <span className="inline-flex items-center gap-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                                                    Laki-laki: 4.307
                                                </span>
                                                <span className="inline-flex items-center gap-0.5 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded font-bold">
                                                    Perempuan: 5.395
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <p className="text-[9px] text-white/40 mt-0.5">Sumber Data: BPS & Disnakertrans →</p>
                        </div>
                    </div>

                    {/* Agenda & Peluang Ketenagakerjaan Summary */}
                    <div className="mt-16 pt-12 border-t border-white/10">
                        <PeluangSummary pelatihanList={allJadwal} lowonganList={allLowongan} eventList={allEvents} />
                    </div>
                </div>
            </section>

            {/* Peta Kecamatan */}
            <section id="peta-kecamatan" className="py-20 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-[#FEF3C7] dark:bg-[#92400E]/20 rounded-xl flex items-center justify-center text-[#92400E] dark:text-[#FBBF24]">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="text-[#B45309] dark:text-[#FBBF24] font-bold text-xs tracking-widest uppercase">Wilayah Administrasi</span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Peta Kecamatan Kabupaten Serang</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-xl">Jelajahi 29 kecamatan dan 326 desa/kelurahan di Kabupaten Serang secara interaktif.</p>
                        </div>
                    </div>
                    <KecamatanMap />
                </div>
            </section>
        </div>
    );
}
